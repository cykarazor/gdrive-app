// frontend/src/components/DriveFilesContainer.jsx
import { useState } from 'react';
import { Box, Alert, Link } from '@mui/material'; // NEW: import Link
import { useCurrentFolder } from '../context/CurrentFolderContext';
import DriveToolbar from './DriveToolbar';
import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls';
import UploadModal from './modals/UploadModal';
import CreateFolderModal from './modals/CreateFolderModal';
import useDriveFiles from '../hooks/useDriveFiles';

// NEW: batch selection hook and action bar
import useBatchAction from '../hooks/useBatchAction';
import BatchActionBar from './BatchActionBar';

export default function DriveFilesContainer({ reloadFlag }) {
  const { currentFolder, folderStack, goBack, goToBreadcrumb, goToFolder } = useCurrentFolder();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  // 🔹 Clipboard state
  const [clipboard, setClipboard] = useState(null);

  // 🔹 Batch selection
  const batch = useBatchAction(); // NEW

  const {
    files,
    loading,
    error, // NEW: receive error from hook
    orderBy,
    order,
    page,
    rowsPerPage,
    fetchFiles,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
  } = useDriveFiles(currentFolder, reloadFlag);

  // Folder click handler
  const handleFolderClick = (folderId, folderName) => {
    goToFolder({ id: folderId, name: folderName });
  };

  // -----------------------
  // Batch action handlers
  // -----------------------
  const handleBatchDownload = async () => {
    if (batch.selectedItems.length === 0) return;
    try {
      const res = await fetch('/api/drive/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: batch.selectedItems }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'download.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Batch download failed:', err);
    }
  };

  const handleBatchCopy = () => {
    if (batch.selectedItems.length === 0) return;
    // placeholder: implement batch copy logic
    console.log('Copy batch:', batch.selectedItems);
  };

  const handleBatchCut = () => {
    if (batch.selectedItems.length === 0) return;
    // placeholder: implement batch cut/move logic
    console.log('Cut/Move batch:', batch.selectedItems);
  };

  return (
    <Box>
      <DriveToolbar
        folderStack={folderStack}
        currentFolder={currentFolder}
        goBack={goBack}
        goToBreadcrumb={goToBreadcrumb}
        onUploadClick={() => setUploadOpen(true)}
        onCreateFolderClick={() => setCreateFolderOpen(true)}
        clipboard={clipboard}
        setClipboard={setClipboard}
        onPasteSuccess={() => fetchFiles(null, currentFolder.id)}
        currentFolderId={currentFolder.id}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={currentFolder.id}
        onUploadSuccess={() => {
          fetchFiles(null, currentFolder.id);
          setUploadOpen(false);
        }}
      />

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        folderId={currentFolder.id}
        onCreateSuccess={() => {
          fetchFiles(null, currentFolder.id);
          setCreateFolderOpen(false);
        }}
      />

      {/* NEW: show token expired or other errors before file list with clickable reauthorize */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}{' '}
          <Link href="/auth/google" underline="always" color="inherit">
            Reauthorize
          </Link>
        </Alert>
      )}

      {/* NEW: BatchActionBar */}
      <BatchActionBar
        selectedItems={batch.selectedItems}
        onDownload={handleBatchDownload}
        onCopy={handleBatchCopy}
        onCut={handleBatchCut}
        onClearSelection={batch.clearSelection}
      />

      <DriveFilesList
        files={files}
        loading={loading}
        orderBy={orderBy}
        order={order}
        onSortChange={handleSortChange}
        onFolderClick={handleFolderClick} // ✅ restored
        onDeleteFile={() => {
          fetchFiles(null, currentFolder.id);
          batch.clearSelection(); // NEW: clear selection after delete
        }}
        currentFolder={currentFolder}
        setClipboard={setClipboard}   // pass clipboard setter
        batch={batch}                 // NEW: pass batch selection
      />

      <PaginationControl
        count={-1}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        showLastButton={false}
        showFirstButton={false}
      />
    </Box>
  );
}
