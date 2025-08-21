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
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [moving, setMoving] = useState(false);
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
        setLoadingFolders(true);

        const res = await axios.get(`${API_BASE_URL}/api/drive/folders/all`);

        // Filter out the current folder
        const folderList = res.data.folders
          .filter(f => f.id !== currentFolderId)
          // Map path with root prefix
          .map(f => ({
            id: f.id,
            name: `root/${f.path}`, // display as root/.../subfolder
          }));

        // Add "Root" at the top
        setFolders([{ id: "root", name: "root" }, ...folderList]);
      } catch (err) {
        console.error("Error fetching folders:", err);
      } finally {
        setLoadingFolders(false);
      }
    };

    if (open) fetchFolders();
  }, [open, currentFolderId]);

  const handleMove = async () => {
    if (!selectedFolder) return alert("Please select a destination folder.");

    try {
      setMoving(true);
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
      setMoving(false);
    }
  };

  return (
    <>
      <IconButton
        color="primary"
        onClick={handleOpen}
        disabled={loadingFolders || moving}
      >
        {(loadingFolders || moving) ? <CircularProgress size={20} /> : <DriveFileMoveIcon />}
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
              {folders.map(f => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={moving || loadingFolders}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            color="primary"
            variant="contained"
            disabled={moving || loadingFolders || !selectedFolder}
          >
            {moving ? <CircularProgress size={20} /> : "Move"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
