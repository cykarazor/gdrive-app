import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";
import UploadModal from "../modals/UploadModal";

const drawerWidth = 240;
const headerHeight = 64;

export default function MainLayout({ children, onCreateFolderClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleUploadClick = () => setUploadModalOpen(true);
  const handleUploadClose = () => setUploadModalOpen(false);

  // Pass this callback down to UploadModal to refresh file list
  const handleUploadSuccess = () => {
    if (typeof onCreateFolderClick === "function") {
      // Optionally you can call a reload here or pass a reload prop from App.jsx
      console.log("Upload succeeded - implement reload here");
    }
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, pt: `${headerHeight}px` }}>
      <List>
        <ListItem button onClick={handleUploadClick}>
          <ListItemText primary="Upload File" />
        </ListItem>
        <ListItem button={onCreateFolderClick}>
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
    </Box>
  );
}
