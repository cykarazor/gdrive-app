// frontend/src/components/RenameFileButton.jsx
import { useState } from 'react';
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import axios from 'axios';

export default function RenameFileButton({ fileId, currentName, onRenameSuccess }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setNewName(currentName);
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await axios.patch(`/api/drive/file/${fileId}/rename`, { newName });
      if (res.data.success) {
        onRenameSuccess(res.data); // update parent state
        handleClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to rename file/folder');
    } finally {
      setLoading(false);
    }
  };

  // Optional: allow Enter key to submit and Escape to close
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') handleClose();
  };

  return (
    <>
      <Button
        startIcon={<DriveFileRenameOutlineIcon />}
        onClick={handleOpen}
        variant="outlined"
        size="small"
      >
        Rename
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
          onKeyDown={handleKeyDown}
        >
          <Typography variant="h6">Rename File/Folder</Typography>
          <TextField
            fullWidth
            label="New Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleRename}
              disabled={loading || !newName.trim()}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              Rename
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
