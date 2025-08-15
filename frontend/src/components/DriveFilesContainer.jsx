// frontend/src/components/layouts/MainLayout.jsx
import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";
import CreateFolderModal from '../modals/CreateFolderModal';
import { useCurrentFolder } from "../context/CurrentFolderContext";

const drawerWidth = 240;
const headerHeight = 64;

export default function MainLayout({ children, onReloadFiles }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  const { currentFolder } = useCurrentFolder();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleUploadClick = () => setUploadModalOpen(true);
  const handleUploadClose = () => setUploadModalOpen(false);

  const handleCreateFolderClick = () => setCreateFolderModalOpen(true);
  const handleCreateFolderClose = () => setCreateFolderModalOpen(false);

  const handleUploadSuccess = () => {
    if (typeof onReloadFiles === "function") onReloadFiles();
  };

  const handleCreateFolderSuccess = () => {
    if (typeof onReloadFiles === "function") onReloadFiles();
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, pt: `${headerHeight}px` }}>
      <List>
        <ListItem button onClick={handleUploadClick}>
          <ListItemText primary="Upload File" />
        </ListItem>
        <ListItem button onClick={handleCreateFolderClick}>
          <ListItemText primary="Create Folder" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header onMenuClick={handleDrawerToggle} />

      {/* Permanent drawer on desktop */}
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

      {/* Temporary drawer on mobile */}
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

      {/* Main content */}
      <Box
        component="main"
        sx={{
          ml: { sm: `${drawerWidth}px` },
          mt: `${headerHeight}px`,
          flexGrow: 1,
          pb: "80px", // space for footer
          boxSizing: "border-box",
          p: 2,
          minHeight: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        {children}
      </Box>

      {/* Footer spans full width */}
      <Box sx={{ width: "100%", position: "relative", left: 0, mt: "auto" }}>
        <Footer />
      </Box>

      {/* Modals */}
      <UploadModal
        open={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
        folderId={currentFolder.id}
      />

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
