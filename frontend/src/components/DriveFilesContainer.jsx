// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Box } from '@mui/material';

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
  const [parentFolderId, setParentFolderId] = useState(null); // ✅ track parent

  const fetchFiles = async (token = null, folderId = currentFolderId) => {
    setLoading(true);
    try {
      const params = {
        pageSize: rowsPerPage,
        pageToken: token,
        folderId,
        orderBy: `${orderBy} ${order}`,
      };
      if (!token) delete params.pageToken;

      const res = await axios.get(`${API_BASE_URL}/api/drive/list`, { params });
      setFiles(res.data.files);
      setNextPageToken(res.data.nextPageToken || null);

      // ✅ Set parent folder ID
      if (folderId !== 'root') {
        const folderMeta = await axios.get(`${API_BASE_URL}/api/drive/file/${folderId}`);
        setParentFolderId(folderMeta.data.parents?.[0] || 'root');
      } else {
        setParentFolderId(null);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setFiles([]);
      setNextPageToken(null);
      setParentFolderId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setPageTokens(['']);
    fetchFiles(null, currentFolderId);
  }, [rowsPerPage, orderBy, order, reloadFlag, currentFolderId]);

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
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSortChange = (property) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  const handleFolderClick = (folderId) => {
    setCurrentFolderId(folderId);
    setPage(0);
    setPageTokens(['']);
  };

  // ✅ NEW: handle back navigation
  const handleBackClick = () => {
    if (parentFolderId) {
      setCurrentFolderId(parentFolderId);
      setPage(0);
      setPageTokens(['']);
    }
  };

  return (
    <>
      <Box sx={{ mb: 1 }}>
        {parentFolderId && (
          <Button variant="outlined" onClick={handleBackClick}>
            Back
          </Button>
        )}
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
        count={-1}
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
