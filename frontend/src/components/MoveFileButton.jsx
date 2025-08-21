// frontend/src/components/MoveFileButton.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const MoveFileButton = ({ fileId, onFileMoved }) => {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");

  // ✅ Fetch all folders recursively
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await axios.get("/api/drive/folders/all");
        setFolders(res.data); // [{id, name, path}]
      } catch (err) {
        console.error("Error fetching folders:", err);
      }
    };

    if (open) fetchFolders();
  }, [open]);

  const handleMove = async () => {
    try {
      await axios.post("/api/drive/move", {
        fileId,
        folderId: selectedFolder,
      });
      onFileMoved(); // callback to refresh file list
      setOpen(false);
      setSelectedFolder("");
    } catch (err) {
      console.error("Error moving file:", err);
    }
  };

  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        Move
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Move File</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Destination Folder</InputLabel>
            <Select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              label="Select Destination Folder"
            >
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.path} {/* ✅ shows full path instead of just name */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMove}
            disabled={!selectedFolder}
            variant="contained"
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MoveFileButton;
