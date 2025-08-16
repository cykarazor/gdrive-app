// frontend/src/components/DriveToolbar.jsx
import { Box, Breadcrumbs, Link, Button, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

export default function DriveToolbar({
  folderStack,
  currentFolder,
  goBack,
  goToBreadcrumb,
  onUploadClick,
  onCreateFolderClick,
}) {
  const path = [{ id: 'root', name: 'My Drive' }];
  if (currentFolder.id !== 'root') path.push(...folderStack, currentFolder);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Breadcrumbs + Back */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {(folderStack.length > 0 || currentFolder.id !== 'root') && (
            <Button variant="outlined" size="small" onClick={goBack}>
              Back
            </Button>
          )}
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1, minWidth: 0 }}>
            {path.map((folder, idx) => (
              <Link
                key={folder.id}
                underline={idx === path.length - 1 ? 'none' : 'hover'}
                color={idx === path.length - 1 ? 'text.primary' : 'inherit'}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (idx !== path.length - 1) goToBreadcrumb(idx);
                }}
                sx={{
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {folder.name}
              </Link>
            ))}
          </Breadcrumbs>
        </Stack>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<CloudUploadIcon />}
            onClick={onUploadClick}
          >
            Upload
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<CreateNewFolderIcon />}
            onClick={onCreateFolderClick}
          >
            Create Folder
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
