//frontend/src/components/DriveFilesContainer.jsx
import { useState } from 'react';
import { Box } from '@mui/material';
import { useCurrentFolder } from '../context/CurrentFolderContext';
import DriveToolbar from './DriveToolbar';
import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls';
import UploadModal from './modals/UploadModal';
import CreateFolderModal from './modals/CreateFolderModal';
import useDriveFiles from '../hooks/useDriveFiles';

export default function DriveFilesContainer({ reloadFlag }) {
  const { currentFolder, folderStack, goBack, goToBreadcrumb, goToFolder } = useCurrentFolder();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  // 🔹 Clipboard state
  const [clipboard, setClipboard] = useState(null);

  const {
    files,
    loading,
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

      <DriveFilesList
        files={files}
        loading={loading}
        orderBy={orderBy}
        order={order}
        onSortChange={handleSortChange}
        onFolderClick={handleFolderClick} // ✅ restored
        onDeleteFile={() => fetchFiles(null, currentFolder.id)} // NEW: refresh files after delete
        currentFolder={currentFolder}
        setClipboard={setClipboard}   // pass clipboard setter
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
