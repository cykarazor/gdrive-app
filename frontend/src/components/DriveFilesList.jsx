// frontend/src/components/DriveFilesList.jsx
import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  TableSortLabel, TablePagination,
} from '@mui/material';

// Simple MIME type to emoji/icon mapping for display
const mimeTypeIcons = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'application/x-zip-compressed': '🗜️',
  'application/vnd.google-apps.folder': '📁',
};

function DriveFilesList({ files }) {  // receive files as prop

  // Pagination & sorting state
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sort files based on orderBy and order
  const sortedFiles = [...files].sort((a, b) => {
    let aVal = a[orderBy] || '';
    let bVal = b[orderBy] || '';

    if (orderBy === 'modifiedTime') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate files for current page
  const paginatedFiles = sortedFiles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Google Drive Files
      </Typography>

      {files.length === 0 ? (
        <Typography sx={{ mb: 2 }} align="center">
          No files found
        </Typography>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="Google Drive files table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 300 }}>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSortRequest('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Type</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <TableSortLabel
                      active={orderBy === 'modifiedTime'}
                      direction={orderBy === 'modifiedTime' ? order : 'desc'}
                      onClick={() => handleSortRequest('modifiedTime')}
                    >
                      Modified
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedFiles.map((file) => (
                  <TableRow hover tabIndex={-1} key={file.id}>
                    <TableCell>
                      {mimeTypeIcons[file.mimeType] || '📁'} {file.name}
                    </TableCell>
                    <TableCell>{file.mimeType}</TableCell>
                    <TableCell>{new Date(file.modifiedTime).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={files.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
}

export default DriveFilesList;
