// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControl'; // your reusable pagination

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DriveFilesContainer() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  // Drive API pagination token
  //const [pageToken, setPageToken] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);

  // Fetch files from backend with pagination & sorting
  const fetchFiles = async (token = null) => {
    setLoading(true);
    try {
      const params = {
        pageSize: rowsPerPage,
        pageToken: token,
        orderBy: `${orderBy} ${order}`, // NOTE: Your backend may ignore this, but included for clarity
      };

      // Remove null pageToken param
      if (!token) delete params.pageToken;

      const res = await axios.get(`${API_BASE_URL}/api/drive/list`, { params });
      setFiles(res.data.files);
      setNextPageToken(res.data.nextPageToken || null);
      //setPageToken(token);
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
  }, [rowsPerPage, orderBy, order]);

  // Handle page change: we only support next and previous page via tokens
  const handlePageChange = (newPage) => {
    if (newPage > page && nextPageToken) {
      // Going forward, fetch next page using nextPageToken
      fetchFiles(nextPageToken);
      setPage(newPage);
    } else if (newPage < page) {
      // Going backward: Google Drive API does not provide prev page tokens,
      // So you need to implement your own cache or reset to page 0
      // For simplicity, reset to first page on backward navigation
      fetchFiles(null);
      setPage(0);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
  };

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
        count={-1} // Google Drive API doesn't provide total count, so show unknown total
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
