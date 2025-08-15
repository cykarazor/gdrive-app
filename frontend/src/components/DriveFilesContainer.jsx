// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls';
import { Button, Box, Breadcrumbs, Link } from '@mui/material';
import UploadModal from './modals/UploadModal';
import { useCurrentFolder } from '../context/CurrentFolderContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DriveFilesContainer({ reloadFlag }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageTokens, setPageTokens] = useState(['']);

  // Context
  const { currentFolder, folderStack, goToFolder, goBack, goToBreadcrumb } = useCurrentFolder();

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);

  // Fetch files helper
  const fetchFiles = useCallback(
    async (token = null, folderIdParam = currentFolder.id) => {
      setLoading(true);
      try {
        const params = {
          pageSize: rowsPerPage,
          orderBy: `${orderBy} ${order}`,
          folderId: folderIdParam,
        };
        if (token) params.pageToken = token;

        const res = await axios.get(`${API_BASE_URL}/api/drive/files`, { params });
        setFiles(res.data.files || []);
        setNextPageToken(res.data.nextPageToken || null);
      } catch (err) {
        console.error('Failed to fetch files:', err);
        setFiles([]);
        setNextPageToken(null);
      } finally {
        setLoading(false);
      }
    },
    [rowsPerPage, orderBy, order, currentFolder.id]
  );

  // Initial load & reload
  useEffect(() => {
    setPage(0);
    setPageTokens(['']);
    fetchFiles(null);
  }, [fetchFiles, reloadFlag, currentFolder.id]); // NEW: added currentFolder.id so files reload on folder change

  // Pagination
  const handlePageChange = (_event, newPage) => {
    if (newPage > page && nextPageToken) {
      fetchFiles(nextPageToken);
      setPage(newPage);
      const newTokens = [...pageTokens];
      newTokens[newPage] = nextPageToken;
      setPageTokens(newTokens);
    } else if (newPage < page) {
      const prevToken = pageTokens[newPage];
      fetchFiles(prevToken || null);
      setPage(newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setPageTokens(['']);
  };

  const handleSortChange = (property) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
    setPage(0);
    setPageTokens(['']);
  };

  // Folder click
  const handleFolderClick = (folderId, folderName) => {
    goToFolder({ id: folderId, name: folderName });
    // fetchFiles(null, folderId); // ❌ removed direct call — would use stale folder state
  };

  // Build breadcrumb path
  const path = [{ id: 'root', name: 'My Drive' }]; // Always start with root
  if (currentFolder.id !== 'root') {
    path.push(...folderStack, currentFolder);
  }

  return (
    <Box>
      {/* Top toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        {(folderStack.length > 0 || currentFolder.id !== 'root') && (
          <Button
            variant="outlined"
            onClick={() => {
              goBack();
              // fetchFiles(); // ❌ removed direct call — will refetch via useEffect when currentFolder changes
            }}
          >
            Back
          </Button>
        )}

        <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
          {path.map((folder, idx) => (
            <Link
              key={folder.id}
              underline={idx === path.length - 1 ? 'none' : 'hover'}
              color={idx === path.length - 1 ? 'text.primary' : 'inherit'}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (idx !== path.length - 1) {
                  goToBreadcrumb(idx);
                  // fetchFiles(path[idx].id); // ❌ removed direct call — will trigger via useEffect
                }
              }}
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        <Button variant="contained" onClick={() => setUploadOpen(true)}>
          Upload
        </Button>
      </Box>

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={currentFolder.id}
        onUploadSuccess={() => {
          fetchFiles(null, currentFolder.id);
          setUploadOpen(false);
        }}
      />

      <DriveFilesList
        files={files}
        loading={loading}
        orderBy={orderBy}
        order={order}
        onSortChange={handleSortChange}
        onFolderClick={handleFolderClick}
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

export default DriveFilesContainer;
