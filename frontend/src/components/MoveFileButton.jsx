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
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Fetch all folders recursively
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/drive/folders/all`);
        const folderList = res.data.folders || [];

        // Exclude the current folder itself from selectable folders
        const selectableFolders = folderList.filter(f => f.id !== currentFolderId);

        // Add Root folder at the top
        setFolders([{ id: "root", name: "Root", path: "Root" }, ...selectableFolders]);

        // Set default selection to current folder
        setSelectedFolder(currentFolderId || "root");

      } catch (err) {
        console.error("Error fetching folders:", err);
        alert("Failed to fetch folders. Check console for details.");
      }
    };

    if (open) fetchFolders();
  }, [open, currentFolderId]);

  // Generate indentation based on folder depth
  const getIndentedName = (folder) => {
    const depth = folder.path ? folder.path.split("/").length - 1 : 0;
    const indent = "\u00A0\u00A0".repeat(depth); // 2 non-breaking spaces per level
    return `${indent}${folder.name}`;
  };

  const handleMove = async () => {
    if (!selectedFolder || selectedFolder === currentFolderId) {
      return alert("Please select a destination folder different from the current folder.");
    }

    try {
      setLoading(true);
      await axios.patch(`${API_BASE_URL}/api/drive/file/${fileId}/move`, {
        newParentId: selectedFolder,
      });

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
                <MenuItem
                  key={f.id}
                  value={f.id}
                  disabled={f.id === currentFolderId} // cannot select current folder
                >
                  {getIndentedName(f)}
                  {f.id === currentFolderId ? " (Current)" : ""}
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
