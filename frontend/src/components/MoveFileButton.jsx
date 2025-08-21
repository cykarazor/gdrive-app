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
  Typography,
} from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper: build a tree structure from flat folder list
const buildFolderTree = (folders) => {
  const map = {};
  folders.forEach(f => map[f.id] = { ...f, children: [] });
  const tree = [];
  folders.forEach(f => {
    if (f.parents?.length && f.parents[0] !== "root" && map[f.parents[0]]) {
      map[f.parents[0]].children.push(map[f.id]);
    } else {
      tree.push(map[f.id]);
    }
  });
  return tree;
};

// Helper: flatten tree with indentation for Select
const flattenTreeForSelect = (nodes, depth = 0) =>
  nodes.flatMap(node => [
    { id: node.id, name: node.name, depth },
    ...flattenTreeForSelect(node.children || [], depth + 1),
  ]);

export default function MoveFileButton({ fileId, fileName, currentFolderId, onMoved }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [fetchingFolders, setFetchingFolders] = useState(false);

  const handleOpen = () => {
    setSelectedFolder("");
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchFolders = async () => {
      setFetchingFolders(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/drive/folders/all`);
        let allFolders = res.data.folders || [];

        // Exclude current folder
        allFolders = allFolders.filter(f => f.id !== currentFolderId);

        // Build tree structure
        const tree = buildFolderTree(allFolders);

        // Flatten tree with depth for indentation
        const flatFolders = [{ id: "root", name: "Root", depth: 0 }, ...flattenTreeForSelect(tree)];
        setFolders(flatFolders);
      } catch (err) {
        console.error("Error fetching folders:", err);
      } finally {
        setFetchingFolders(false);
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
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
              {fetchingFolders ? (
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading folders...
                  </Typography>
                </MenuItem>
              ) : (
                folders.map(f => (
                  <MenuItem key={f.id} value={f.id}>
                    <span style={{ paddingLeft: f.depth * 16 }}>{f.name}</span>
                  </MenuItem>
                ))
              )}
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
            disabled={loading || fetchingFolders}
          >
            {loading ? <CircularProgress size={20} /> : "Move"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
