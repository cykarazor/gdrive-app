import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Box, Breadcrumbs, Link, Typography } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";
import CreateFolderModal from '../modals/CreateFolderModal';
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

  const handleUploadSuccess = () => onReloadFiles?.();
  const handleCreateFolderSuccess = () => onReloadFiles?.();

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

  // Build breadcrumb path: root + folderStack + currentFolder
  const path = [{ id: "root", name: "My Drive" }, ...folderStack, currentFolder];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header onMenuClick={handleDrawerToggle} />

      {/* Drawers */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", position: "fixed", height: "100vh", pt: `${headerHeight}px` }
        }}
        open
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", pt: `${headerHeight}px` } }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{ flex: 1, ml: { sm: `${drawerWidth}px` }, mt: `${headerHeight}px`, p: 2, boxSizing: "border-box" }}
      >
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={() => goToBreadcrumb(-1)} // root
          >
            My Drive
          </Link>

          {folderStack.map((folder, idx) => (
            <Link
              key={folder.id}
              underline="hover"
              color="inherit"
              href="#"
              onClick={() => goToBreadcrumb(idx)}
            >
              {folder.name}
            </Link>
          ))}

          <Typography color="text.primary">{currentFolder.name}</Typography>
        </Breadcrumbs>

        {children}
      </Box>

      <Footer />

      {/* Modals */}
      <UploadModal open={uploadModalOpen} onClose={handleUploadClose} onUploadSuccess={handleUploadSuccess} folderId={currentFolder.id} />
      <CreateFolderModal open={createFolderModalOpen} onClose={handleCreateFolderClose} onCreateSuccess={() => { handleCreateFolderClose(); handleCreateFolderSuccess(); }} />
    </Box>
  );
}
