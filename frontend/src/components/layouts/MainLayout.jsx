// frontend/src/components/layouts/MainLayout.jsx
import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";
import CreateFolderModal from "../modals/CreateFolderModal";
import { useCurrentFolder } from "../../context/CurrentFolderContext"; // ✅ to get currentFolder

const drawerWidth = 240;
const headerHeight = 64;

export default function MainLayout({ children, onReloadFiles }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  // Current folder from context
  const { currentFolder } = useCurrentFolder();

  // Drawer toggle
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Upload modal handlers
  const handleUploadClick = () => setUploadModalOpen(true);
  const handleUploadClose = () => setUploadModalOpen(false);
  const handleUploadSuccess = () => {
    if (typeof onReloadFiles === "function") onReloadFiles();
  };

  // Create folder modal handlers
  const handleCreateFolderClick = () => setCreateFolderModalOpen(true);
  const handleCreateFolderClose = () => setCreateFolderModalOpen(false);
  const handleCreateFolderSuccess = () => {
    if (typeof onReloadFiles === "function") onReloadFiles();
  };

  // Drawer content
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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
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
          flexGrow: 1,
          ml: { sm: `${drawerWidth}px` }, // shift content for permanent drawer
          mt: `${headerHeight}px`,
          p: 2,
        }}
      >
        
        {children}
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ mt: "auto", width: "100%" }}>
        <Footer />
      </Box>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
        folderId={currentFolder.id} // ✅ ensure file uploads in current folder
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        open={createFolderModalOpen}
        onClose={handleCreateFolderClose}
        onCreateSuccess={() => {
          handleCreateFolderClose();
          handleCreateFolderSuccess(); // reload files after folder creation
        }}
        folderId={currentFolder.id} // ✅ ensure folder created in current folder
      />
    </Box>
  );
}
