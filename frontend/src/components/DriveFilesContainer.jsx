// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls'; // your reusable pagination

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

  // Fetch files from backend with pagination & sorting
  const fetchFiles = async (token = null) => {
    setLoading(true);
    try {
      const params = {
        pageSize: rowsPerPage,
        pageToken: token,
        orderBy: `${orderBy} ${order}`, // Your backend may ignore this, included for clarity
      };

      // Remove null pageToken param
      if (!token) delete params.pageToken;

      const res = await axios.get(`${API_BASE_URL}/api/drive/list`, { params });
      setFiles(res.data.files);
      setNextPageToken(res.data.nextPageToken || null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setFiles([]);
      setNextPageToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Load first page on mount or when rowsPerPage/order changes
  useEffect(() => {
    setPage(0);
    fetchFiles(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, orderBy, order, reloadFlag]);

  // Handle page change: MUI TablePagination calls onPageChange(event, newPage)
  const handlePageChange = (_event, newPage) => {
    if (newPage > page && nextPageToken) {
      // Going forward, fetch next page using nextPageToken
      fetchFiles(nextPageToken);
      setPage(newPage);
    } else if (newPage < page) {
      // Going backward: no prev token from Google Drive API, reset to first page
      fetchFiles(null);
      setPage(0);
    }
  };

  // Handle rows per page change: MUI calls onRowsPerPageChange(event)
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Handle sort change from DriveFilesList
  const handleSortChange = (property) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  return (
    <>
      <DriveFilesList
        files={files}
        loading={loading}
        orderBy={orderBy}
        order={order}
        onSortChange={handleSortChange}
      />
      <PaginationControl
        count={-1} // Unknown total count (Google Drive API limitation)
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
