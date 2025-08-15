// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls';
import { Button, Box, Typography } from '@mui/material';
import UploadModal from './modals/UploadModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DriveFilesContainer({ reloadFlag }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  // Drive API pagination token
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageTokens, setPageTokens] = useState(['']); // first page token is empty

  // Current folder state
  const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'My Drive' });
  const [folderStack, setFolderStack] = useState([]); // for back button

  // NEW: File upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  
  // Fetch files from backend
  const fetchFiles = useCallback(
    async (token = null, folderIdParam = currentFolder.id) => {
      setLoading(true);
      try {
        const params = {
          pageSize: rowsPerPage,
          orderBy: `${orderBy} ${order}`,
          folderId: folderIdParam, // ✅ send current folder ID
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

  // Load first page on mount or reload
  useEffect(() => {
    setPage(0);
    setPageTokens(['']);
    fetchFiles(null);
  }, [fetchFiles, reloadFlag]);

  // Page navigation
  const handlePageChange = (_event, newPage) => {
    if (newPage > page) {
      if (nextPageToken) {
        fetchFiles(nextPageToken);
        setPage(newPage);
        const newTokens = [...pageTokens];
        newTokens[newPage] = nextPageToken;
        setPageTokens(newTokens);
      }
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

  // NEW: folder click handler
  const handleFolderClick = (folderId, folderName) => {
    setFolderStack((prev) => [...prev, currentFolder]); // push current folder to stack
    setCurrentFolder({ id: folderId, name: folderName });
    setPage(0);
    setPageTokens(['']);
    fetchFiles(null, folderId);
  };

  // NEW: back button handler
  const handleBackClick = () => {
    if (folderStack.length === 0) return;
    const prevFolder = folderStack[folderStack.length - 1];
    setFolderStack((prev) => prev.slice(0, prev.length - 1));
    setCurrentFolder(prevFolder);
    setPage(0);
    setPageTokens(['']);
    fetchFiles(null, prevFolder.id);
  };

  return (
    <Box>
      {/* Top toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        {folderStack.length > 0 && (
          <Button variant="outlined" onClick={handleBackClick}>
            Back
          </Button>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {currentFolder.name}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setUploadOpen(true)}
        >
          Upload
        </Button>
      </Box>

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={currentFolder.id} // ✅ pass current folder ID to modal
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
