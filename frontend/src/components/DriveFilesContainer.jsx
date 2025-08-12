// frontend/src/components/DriveFilesContainer.jsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import DriveFilesList from './DriveFilesList';
import PaginationControl from './PaginationControls';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DriveFilesContainer() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const [nextPageToken, setNextPageToken] = useState(null);

  // Wrap fetchFiles with useCallback so it is stable and can be a dependency
  const fetchFiles = useCallback(async (token = null) => {
    setLoading(true);
    try {
      const params = {
        pageSize: rowsPerPage,
        pageToken: token,
        orderBy: `${orderBy} ${order}`,
      };
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
  }, [rowsPerPage, orderBy, order]); // <- dependencies

  // Now include fetchFiles in the dependency array
  useEffect(() => {
    setPage(0);
    fetchFiles(null);
  }, [fetchFiles]);

  const handlePageChange = (newPage) => {
    if (newPage > page && nextPageToken) {
      fetchFiles(nextPageToken);
      setPage(newPage);
    } else if (newPage < page) {
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
