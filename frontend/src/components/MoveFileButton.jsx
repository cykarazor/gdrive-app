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
  Stack,
} from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function MoveFileButton({ fileId, fileName, currentFolderId, onMoved }) {
  const [open, setOpen] = useState(false);
  const [loadingMove, setLoadingMove] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
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
    if (!open) return;

    const fetchFolders = async () => {
      try {
        setLoadingFolders(true);
        const res = await axios.get(`${API_BASE_URL}/api/drive/folders/all`);

        // Flatten folders to show full paths and exclude current folder
        const folderList = res.data.folders
          .filter(f => f.id !== currentFolderId)
          .map(f => ({
            id: f.id,
            name: `root | ${f.path.replace(/\//g, " | ")}`, // replace "/" with " | "
          }));

        setFolders([{ id: "root", name: "root" }, ...folderList]);
      } catch (err) {
        console.error("Error fetching folders:", err);
        setFolders([{ id: "root", name: "root" }]);
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchFolders();
  }, [open, currentFolderId]);

  const handleMove = async () => {
    if (!selectedFolder) return alert("Please select a destination folder.");

    try {
      setLoadingMove(true);
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
      setLoadingMove(false);
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={handleOpen} disabled={loadingMove}>
        {loadingMove ? <CircularProgress size={20} /> : <DriveFileMoveIcon />}
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
              disabled={loadingFolders || loadingMove}
            >
              {!loadingFolders &&
                folders.map(f => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
            </Select>
            {loadingFolders && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, ml: 1 }}>
                <CircularProgress size={20} />
                <span>Loading folders...</span>
              </Stack>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loadingMove}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            color="primary"
            variant="contained"
            disabled={loadingMove || !selectedFolder}
          >
            {loadingMove ? <CircularProgress size={20} /> : "Move"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
