// frontend/src/components/DriveFilesList.jsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  TableSortLabel,
  Box,
} from '@mui/material';

import DriveLoadingPremium from './DriveLoadingPremium';

// MUI Icons
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import FolderIcon from '@mui/icons-material/Folder';
import ArchiveIcon from '@mui/icons-material/Archive';
import TableChartIcon from '@mui/icons-material/TableChart';       // Excel
import DescriptionIcon from '@mui/icons-material/Description';    // Word
import SlideshowIcon from '@mui/icons-material/Slideshow';        // PowerPoint

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const mimeTypeIcons = {
  'application/pdf': <PictureAsPdfIcon color="error" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <TableChartIcon color="success" />,
  'application/vnd.ms-excel': <TableChartIcon color="success" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <DescriptionIcon color="primary" />,
  'application/msword': <DescriptionIcon color="primary" />,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': <SlideshowIcon color="secondary" />,
  'application/vnd.ms-powerpoint': <SlideshowIcon color="secondary" />,
  'image/jpeg': <ImageIcon color="primary" />,
  'image/png': <ImageIcon color="primary" />,
  'image/gif': <ImageIcon color="primary" />,
  'application/x-zip-compressed': <ArchiveIcon color="action" />,
  'application/zip': <ArchiveIcon color="action" />,
  'application/vnd.google-apps.folder': <FolderIcon color="warning" />,
};

function DriveFilesList({
  files,
  loading,
  orderBy,
  order,
  onSortChange,
  onFolderClick, // NEW
}) {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Google Drive Files
      </Typography>

      {loading ? (
        <DriveLoadingPremium loading={loading} />
      ) : files.length === 0 ? (
        <Typography sx={{ mb: 2 }} align="center">
          No files found
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="Google Drive files table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 300 }}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => onSortChange('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ minWidth: 120 }}>
                  <TableSortLabel
                    active={orderBy === 'size'}
                    direction={orderBy === 'size' ? order : 'asc'}
                    onClick={() => onSortChange('size')}
                  >
                    Size
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ minWidth: 200 }}>
                  <TableSortLabel
                    active={orderBy === 'modifiedTime'}
                    direction={orderBy === 'modifiedTime' ? order : 'desc'}
                    onClick={() => onSortChange('modifiedTime')}
                  >
                    Modified
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {files.map((file) => (
                <TableRow hover tabIndex={-1} key={file.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {mimeTypeIcons[file.mimeType] || <InsertDriveFileIcon />}
                      {file.mimeType === 'application/vnd.google-apps.folder' ? (
                        <Typography
                          sx={{ cursor: 'pointer', color: 'primary.main' }}
                          onClick={() => onFolderClick?.(file.id)}
                        >
                          {file.name}
                        </Typography>
                      ) : (
                        file.name
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{new Date(file.modifiedTime).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default DriveFilesList;