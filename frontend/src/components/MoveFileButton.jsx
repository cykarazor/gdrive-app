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
  ListItemText,
} from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function MoveFileButton({ fileId, fileName, currentFolderId, onMoved }) {
  const [open, setOpen] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");

  const handleOpen = () => {
    setSelectedFolder("");
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Fetch folders when dialog opens
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoadingFolders(true);
        const res = await axios.get(`${API_BASE_URL}/api/drive/folders/all`);

        const folderList = res.data.folders.filter(f => f.id !== currentFolderId);

        const formattedFolders = folderList.map(f => {
          const path = f.path.startsWith("/") ? f.path.slice(1) : f.path;
          const depth = path.split("/").length - 1; // indentation by depth
          return {
            id: f.id,
            label: `root/${path}`,
            depth,
          };
        });

        setFolders([{ id: "root", label: "root", depth: 0 }, ...formattedFolders]);
      } catch (err) {
        console.error("Error fetching folders:", err);
        alert("Failed to fetch folders. Check console for details.");
      } finally {
        setLoadingFolders(false);
      }
    };

    if (open) fetchFolders();
  }, [open, currentFolderId]);

  const handleMove = async () => {
    if (!selectedFolder) return alert("Please select a destination folder.");

    try {
      await axios.patch(`${API_BASE_URL}/api/drive/file/${fileId}/move`, {
        newParentId: selectedFolder,
      });

      if (onMoved) onMoved(fileId, selectedFolder);
      alert(`✅ "${fileName}" moved successfully.`);
      handleClose();
    } catch (err) {
      console.error("Move failed:", err);
      alert("Failed to move file. Check console for details.");
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={handleOpen} disabled={loadingFolders}>
        {loadingFolders ? <CircularProgress size={20} /> : <DriveFileMoveIcon />}
      </IconButton>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
              MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              renderValue={(selected) => {
                const folder = folders.find(f => f.id === selected);
                return folder ? folder.label : "";
              }}
            >
              {loadingFolders ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                </MenuItem>
              ) : (
                folders.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    <ListItemText
                      primary={f.label}
                      sx={{ pl: `${f.depth * 1.5}rem` }} // indent by depth
                    />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loadingFolders}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            color="primary"
            variant="contained"
            disabled={loadingFolders || !selectedFolder}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
