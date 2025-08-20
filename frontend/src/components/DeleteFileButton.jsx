// frontend/src/components/DeleteFileButton.jsx
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function DeleteFileButton({ fileId, fileName, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/drive/file/${fileId}`);
      if (onDeleted) onDeleted(fileId); // notify parent to update list
      handleClose();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton color="error" onClick={handleOpen} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : <DeleteIcon />}
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{fileName}</strong>? This will move it to your Google Drive trash.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
