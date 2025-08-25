// frontend/src/hooks/useDriveFiles.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function useDriveFiles(currentFolder, reloadFlag, rowsPerPageDefault = 10) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageDefault);
  const [page, setPage] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageTokens, setPageTokens] = useState(['']);

  // NEW: track error messages (e.g. expired token)
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(
    async (token = null, folderIdParam = currentFolder.id) => {
      setLoading(true);
      setError(null); // NEW: clear any prior error before loading
      try {
        const params = { pageSize: rowsPerPage, orderBy: `${orderBy} ${order}`, folderId: folderIdParam };
        if (token) params.pageToken = token;

        const res = await axios.get(`${API_BASE_URL}/api/drive/files`, { params });

        setFiles(res.data.files || []);
        setNextPageToken(res.data.nextPageToken || null);
      } catch (err) {
        // NEW: handle Google token expired error specifically
        if (err?.response?.status === 401 && err?.response?.data?.error === 'TokenExpired') {
          console.warn('Token expired:', err.response.data);
          setFiles([]); // optional: clear stale list
          setNextPageToken(null);
          setError(err.response.data.message || 'Your Google Drive token has expired. Please reauthorize.');
        } else {
          // OLD:
          console.error('Failed to fetch files:', err);
          setFiles([]);
          setNextPageToken(null);
          setError('Failed to load files.'); // NEW: generic error for UI
        }
      } finally {
        setLoading(false);
      }
    },
    [rowsPerPage, orderBy, order, currentFolder.id]
  );

  useEffect(() => {
    setPage(0);
    setPageTokens(['']);
    fetchFiles(null);
  }, [fetchFiles, reloadFlag, currentFolder.id]);

  const handlePageChange = (_e, newPage) => {
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
    if (orderBy === property) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setOrderBy(property);
      setOrder('asc');
    }
    setPage(0);
    setPageTokens(['']);
  };

  return {
    files,
    loading,
    error, // NEW: expose error so UI can display it
    orderBy,
    order,
    page,
    rowsPerPage,
    fetchFiles,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
  };
}
