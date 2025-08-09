// frontend/src/components/DriveFilesList.jsx
import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  TableSortLabel, TablePagination,
  Box,
} from '@mui/material';

// MUI Icons
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import FolderIcon from '@mui/icons-material/Folder';
import ArchiveIcon from '@mui/icons-material/Archive';
import TableChartIcon from '@mui/icons-material/TableChart';       // Excel
import DescriptionIcon from '@mui/icons-material/Description';    // Word
import SlideshowIcon from '@mui/icons-material/Slideshow';        // PowerPoint

// Helper: Format bytes to human-readable
function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Map mime types to MUI icons
const mimeTypeIcons = {
  'application/pdf': <PictureAsPdfIcon color="error" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <TableChartIcon color="success" />, // Excel
  'application/vnd.ms-excel': <TableChartIcon color="success" />, // Excel old format
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <DescriptionIcon color="primary" />, // Word
  'application/msword': <DescriptionIcon color="primary" />, // Word old format
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': <SlideshowIcon color="secondary" />, // PowerPoint
  'application/vnd.ms-powerpoint': <SlideshowIcon color="secondary" />, // PowerPoint old format
  'image/jpeg': <ImageIcon color="primary" />,
  'image/png': <ImageIcon color="primary" />,
  'image/gif': <ImageIcon color="primary" />,
  'application/x-zip-compressed': <ArchiveIcon color="action" />,
  'application/zip': <ArchiveIcon color="action" />,
  'application/vnd.google-apps.folder': <FolderIcon color="warning" />,
};

function DriveFilesList({ files }) {
  const [orderBy, setOrderBy] = useState('modifiedTime');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sortedFiles = [...files].sort((a, b) => {
    let aVal = a[orderBy] || '';
    let bVal = b[orderBy] || '';

    if (orderBy === 'modifiedTime') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (orderBy === 'size') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

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

                  <TableCell sx={{ minWidth: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'size'}
                      direction={orderBy === 'size' ? order : 'asc'}
                      onClick={() => handleSortRequest('size')}
                    >
                      Size
                    </TableSortLabel>
                  </TableCell>

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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {mimeTypeIcons[file.mimeType] || <InsertDriveFileIcon />}
                        {file.name}
                      </Box>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
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
