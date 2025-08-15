// frontend/src/components/layouts/MainLayout.jsx
import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  //Breadcrumbs,
  //Link,
  Button,
  //Typography,
} from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";
import CreateFolderModal from "../modals/CreateFolderModal";
//import { useCurrentFolder } from "../../context/CurrentFolderContext";

const drawerWidth = 240;
const headerHeight = 64;

export default function MainLayout({ children, onReloadFiles }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  //const { currentFolder, folderStack, goBack, goToBreadcrumb } = useCurrentFolder();

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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
          ml: { sm: `${drawerWidth}px` }, // shift content but NOT footer
          mt: `${headerHeight}px`,
          p: 2,
        }}
      >
        {/* Top toolbar with Back button */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 2 }}>
          {folderStack.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => {
                goBack();
                if (typeof onReloadFiles === "function") onReloadFiles();
              }}
            >
              Back
            </Button>
          )}
          {/*<Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Go to root
                goToBreadcrumb(-1); // -1 to reset to root
                if (typeof onReloadFiles === "function") onReloadFiles();
              }}
            >
              My Drive
            </Link>

            {folderStack.map((folder, idx) => (
              <Link
                key={folder.id}
                underline="hover"
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToBreadcrumb(idx);
                  if (typeof onReloadFiles === "function") onReloadFiles();
                }}
              >
                {folder.name}
              </Link>
            ))}

            {currentFolder.name !== "My Drive" && (
              <Typography color="text.primary">{currentFolder.name}</Typography>
            )}
          </Breadcrumbs>*/}
        </Box>

        {children}
      </Box>

      {/* Footer spans full width */}
      <Box component="footer" sx={{ width: "100%" }}>
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
