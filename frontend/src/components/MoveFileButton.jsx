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
  Box,
  Typography,
} from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import { TreeView, TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function MoveFileButton({ fileId, fileName, currentFolderId, onMoved }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("root");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/drive/folders/all`);
        const folderList = res.data.folders || [];

        const rootFolder = { id: "root", name: "Root", path: "Root" };
        setFolders([rootFolder, ...folderList]);

        setSelectedFolder(currentFolderId || "root");
      } catch (err) {
        console.error("Error fetching folders:", err);
        alert("Failed to fetch folders. Check console for details.");
      }
    };

    if (open) fetchFolders();
  }, [open, currentFolderId]);

  const buildTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((folder) => {
      folder.children = [];
      map[folder.id] = folder;
    });

    list.forEach((folder) => {
      if (folder.id === "root") return;
      const parts = folder.path.split("/");
      if (parts.length === 1) {
        roots.push(folder);
      } else {
        const parentPath = parts.slice(0, -1).join("/");
        const parent = list.find((f) => f.path === parentPath);
        if (parent) parent.children.push(folder);
      }
    });

    return roots;
  };

  const treeData = buildTree(folders);

  const renderTree = (nodes) =>
    nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {node.id === selectedFolder ? <FolderOpenIcon sx={{ mr: 1 }} /> : <FolderIcon sx={{ mr: 1 }} />}
            <Typography
              sx={{
                fontWeight: node.id === currentFolderId ? "bold" : "normal",
                color: node.id === currentFolderId ? "primary.main" : "inherit",
              }}
            >
              {node.name}
            </Typography>
          </Box>
        }
        disabled={node.id === currentFolderId}
      >
        {node.children && node.children.length > 0 && renderTree(node.children)}
      </TreeItem>
    ));

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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Move File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a folder to move <strong>{fileName}</strong> into.
          </DialogContentText>

          <Box sx={{ mt: 2, maxHeight: 400, overflowY: "auto" }}>
            {folders.length === 0 ? (
              <CircularProgress />
            ) : (
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                selected={selectedFolder}
                onNodeSelect={(event, nodeId) => setSelectedFolder(nodeId)}
              >
                {renderTree(treeData)}
              </TreeView>
            )}
          </Box>
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
