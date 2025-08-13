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

  // ✅ New: array to store tokens for each page to enable backward navigation
  const [pageTokens, setPageTokens] = useState(['']); // first page token is empty

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
    // ✅ Reset token array when rowsPerPage/order changes
    setPageTokens(['']);
    fetchFiles(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, orderBy, order, reloadFlag]);

  // Handle page change: MUI TablePagination calls onPageChange(event, newPage)
  const handlePageChange = (_event, newPage) => {
    if (newPage > page) {
      // Going forward, fetch next page using nextPageToken
      if (nextPageToken) {
        fetchFiles(nextPageToken);
        setPage(newPage);

        // ✅ Store token for this new page
        const newTokens = [...pageTokens];
        newTokens[newPage] = nextPageToken;
        setPageTokens(newTokens);
      }
    } else if (newPage < page) {
      // Going backward: fetch the token stored for that page
      const prevToken = pageTokens[newPage];
      fetchFiles(prevToken || null);
      setPage(newPage);
    }

    // ❌ Original backward logic (commented out)
    // else if (newPage < page) {
    //   // Going backward: no prev token from Google Drive API, reset to first page
    //   fetchFiles(null);
    //   setPage(0);
    // }
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
