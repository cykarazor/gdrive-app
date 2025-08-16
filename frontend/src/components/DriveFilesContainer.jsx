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
  const { currentFolder, folderStack, goBack, goToBreadcrumb } = useCurrentFolder();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

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

  return (
    <Box>
      <DriveToolbar
        folderStack={folderStack}
        currentFolder={currentFolder}
        goBack={goBack}
        goToBreadcrumb={goToBreadcrumb}
        onUploadClick={() => setUploadOpen(true)}
        onCreateFolderClick={() => setCreateFolderOpen(true)}
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
