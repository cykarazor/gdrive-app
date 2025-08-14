// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Box, Breadcrumbs, Link } from '@mui/material';
import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DriveFilesContainer({ reloadFlag }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageTokens, setPageTokens] = useState(['']);

  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folderStack, setFolderStack] = useState([{ id: 'root', name: 'Root' }]); // Root as first breadcrumb

  const fetchFiles = useCallback(
    async (folderId = 'root', token = null) => {
      setLoading(true);
      try {
        const params = {
          pageSize: rowsPerPage,
          orderBy: `${orderBy} ${order}`,
          folderId,
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
    [rowsPerPage, orderBy, order]
  );

  useEffect(() => {
    setPage(0);
    setPageTokens(['']);
    fetchFiles('root', null);
    setCurrentFolderId('root');
    setFolderStack([{ id: 'root', name: 'Root' }]);
  }, [fetchFiles, reloadFlag]);

  const handleFolderClick = (folderId, folderName) => {
    setFolderStack((prev) => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
    setPage(0);
    setPageTokens(['']);
    fetchFiles(folderId, null);
  };

  const handleBack = () => {
    if (folderStack.length <= 1) return; // Already at root
    const prevFolder = folderStack[folderStack.length - 2];
    setFolderStack((prev) => prev.slice(0, prev.length - 1));
    setCurrentFolderId(prevFolder.id);
    setPage(0);
    setPageTokens(['']);
    fetchFiles(prevFolder.id, null);
  };

  // Click on breadcrumb folder
  const handleBreadcrumbClick = (index) => {
    if (index === folderStack.length - 1) return; // Current folder, do nothing
    const newStack = folderStack.slice(0, index + 1);
    const targetFolder = newStack[newStack.length - 1];
    setFolderStack(newStack);
    setCurrentFolderId(targetFolder.id);
    setPage(0);
    setPageTokens(['']);
    fetchFiles(targetFolder.id, null);
  };

  const handlePageChange = (_event, newPage) => {
    if (newPage > page) {
      if (nextPageToken) {
        fetchFiles(currentFolderId, nextPageToken);
        setPage(newPage);
        const newTokens = [...pageTokens];
        newTokens[newPage] = nextPageToken;
        setPageTokens(newTokens);
      }
    } else if (newPage < page) {
      const prevToken = pageTokens[newPage];
      fetchFiles(currentFolderId, prevToken || null);
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

  return (
    <>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          disabled={folderStack.length <= 1}
          onClick={handleBack}
        >
          ← Back
        </Button>

        {/* Breadcrumb navigation */}
        <Breadcrumbs aria-label="breadcrumb">
          {folderStack.map((folder, index) => (
            <Link
              key={folder.id}
              underline="hover"
              color={index === folderStack.length - 1 ? 'text.primary' : 'inherit'}
              sx={{ cursor: index === folderStack.length - 1 ? 'default' : 'pointer' }}
              onClick={() => handleBreadcrumbClick(index)}
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <DriveFilesList
        files={files}
        loading={loading}
        orderBy={orderBy}
        order={order}
        onSortChange={handleSortChange}
        onFolderClick={handleFolderClick}
      />

      <PaginationControl
        count={-1} // unknown total count
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        showLastButton={false}
        showFirstButton={false}
      />
    </>
  );
}

export default DriveFilesContainer;
