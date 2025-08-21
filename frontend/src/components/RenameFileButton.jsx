// frontend/src/components/RenameFileButton.jsx
import { useState } from "react";
import axios from "axios";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function RenameFileButton({ fileId, currentName, onRenameSuccess }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setNewName(currentName);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleRename = async () => {
    if (!newName.trim()) return alert("Name cannot be empty.");

    try {
      setLoading(true);
      const res = await axios.patch(`${API_BASE_URL}/api/drive/file/${fileId}/rename`, {
        newName: newName.trim(),
      });

      if (onRenameSuccess) onRenameSuccess(res.data); // call parent refresh
      handleClose();
    } catch (err) {
      console.error("Rename failed:", err);
      alert("Failed to rename file. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton color="secondary" onClick={handleOpen} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : <EditIcon />}
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Rename File/Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for <strong>{currentName}</strong>
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={loading}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRename} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Rename"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
