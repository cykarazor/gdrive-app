// frontend/src/components/layouts/MainLayout.jsx
import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";
import CreateFolderModal from "../modals/CreateFolderModal";
import { useCurrentFolder } from "../../context/CurrentFolderContext";

const drawerWidth = 240;
const headerHeight = 64;

export default function MainLayout({ children, onReloadFiles }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  const { currentFolder, folderStack, goToBreadcrumb } = useCurrentFolder();

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
          ml: { sm: `${drawerWidth}px` }, // shift main content for desktop drawer
          mt: `${headerHeight}px`,
          pb: "80px",
          boxSizing: "border-box",
          p: 2,
          flexGrow: 1,
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          {/* Non-clickable root */}
          <Typography color="text.primary">My Drive</Typography>

          {/* Folder stack breadcrumbs */}
          {folderStack.map((folder, idx) => (
            <Link
              key={folder.id}
              underline="hover"
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToBreadcrumb(idx);
              }}
            >
              {folder.name}
            </Link>
          ))}

          {/* Current folder */}
          {currentFolder.name !== "My Drive" && (
            <Typography color="text.primary">{currentFolder.name}</Typography>
          )}
        </Breadcrumbs>

        {children}
      </Box>

      {/* Footer spans full width */}
      <Box component="footer" sx={{ width: "100%", mt: "auto" }}>
        <Footer />
      </Box>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
        folderId={currentFolder.id}
      />

      {/* Create Folder Modal */}
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
