// frontend/src/components/MoveFileButton.jsx
import { useState, useEffect } from "react";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function MoveFileButton({ fileId, fileName, currentFolderId, onMoved }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");

  // Open/close handlers
  const handleOpen = () => {
    setSelectedFolder("");
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Fetch all folders for selection
  useEffect(() => {
  const fetchFolders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/drive/files?folderId=root&pageSize=100&orderBy=folder,name`);

      // Only folders, and exclude the current folder
      const folderList = res.data.files
        .filter(f => f.mimeType === "application/vnd.google-apps.folder" && f.id !== currentFolderId);

      // Add "Root" folder at the top
      setFolders([{ id: "root", name: "Root" }, ...folderList]);

    } catch (err) {
      console.error("Failed to fetch folders:", err);
    }
  };

  if (open) fetchFolders();
}, [open, currentFolderId]);


  const handleMove = async () => {
    if (!selectedFolder) return alert("Please select a destination folder.");

    try {
      setLoading(true);
      await axios.patch(`${API_BASE_URL}/api/drive/file/${fileId}/move`, {
        newParentId: selectedFolder,
      });

      // Notify parent
      if (onMoved) onMoved(fileId, selectedFolder);

      alert(`✅ "${fileName}" moved successfully.`);
      handleClose();
    } catch (err) {
      console.error("Move failed:", err);
      alert("Failed to move file. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={handleOpen} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : <DriveFileMoveIcon />}
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Move File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a folder to move <strong>{fileName}</strong> into.
          </DialogContentText>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Destination Folder</InputLabel>
            <Select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              label="Destination Folder"
            >
              {folders.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Move"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
