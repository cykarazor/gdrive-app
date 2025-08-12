//frontend/src/components/layouts/MainLayout.jsx
import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";
import CreateFolderModal from '../modals/CreateFolderModal'; // NEW

const drawerWidth = 240;
const headerHeight = 64;

export default function MainLayout({
  children,
  // onCreateFolderClick, // OLD - no longer used directly for drawer button
  onReloadFiles,  // new prop to notify parent to reload files
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false); // NEW

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleUploadClick = () => setUploadModalOpen(true);
  const handleUploadClose = () => setUploadModalOpen(false);

  // NEW: handlers for Create Folder modal
  const handleCreateFolderClick = () => setCreateFolderModalOpen(true);
  const handleCreateFolderClose = () => setCreateFolderModalOpen(false);

  // Call reload callback after successful upload
  const handleUploadSuccess = () => {
    if (typeof onReloadFiles === "function") {
      onReloadFiles();
    }
  };

  // NEW: Call reload callback after successful folder creation
  const handleCreateFolderSuccess = () => {
    if (typeof onReloadFiles === "function") {
      onReloadFiles();
    }
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, pt: `${headerHeight}px` }}>
      <List>
        <ListItem button onClick={handleUploadClick}>
          <ListItemText primary="Upload File" />
        </ListItem>
        {/* Updated: open CreateFolderModal instead of calling onCreateFolderClick directly */}
        <ListItem button onClick={handleCreateFolderClick}>
          <ListItemText primary="Create Folder" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <Header onMenuClick={handleDrawerToggle} />

      {/* Permanent drawer fixed on desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "fixed",
            height: "100vh",
            pt: `${headerHeight}px`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            pt: `${headerHeight}px`,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content shifted right on desktop */}
      <Box
        component="main"
        sx={{
          ml: { sm: `${drawerWidth}px` },
          mt: `${headerHeight}px`,
          pb: "80px",
          minHeight: `calc(100vh - ${headerHeight}px)`,
          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>

      <Footer />

      <UploadModal
        open={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* NEW: Create Folder Modal */}
      <CreateFolderModal
        open={createFolderModalOpen}
        onClose={handleCreateFolderClose}
        onCreateSuccess={() => {
          handleCreateFolderClose();
          handleCreateFolderSuccess();
        }}
      />
    </Box>
  );
}
