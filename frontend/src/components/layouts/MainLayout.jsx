import { useState } from "react";
import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import Header from "../Header";
import Footer from "../Footer";

const drawerWidth = 240;

export default function MainLayout({ children, onUploadClick, onCreateFolderClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <List>
        <ListItem button onClick={onUploadClick}>
          <ListItemText primary="Upload File" />
        </ListItem>
        <ListItem button onClick={onCreateFolderClick}>
          <ListItemText primary="Create Folder" />
        </ListItem>
      </List>
    </Box>
  );

  console.log('onUploadClick:', onUploadClick);
  console.log('onCreateFolderClick:', onCreateFolderClick);


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
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content shifted right on desktop */}
      <Box
        component="main"
        sx={{
          ml: { sm: `${drawerWidth}px` },
          mt: 8, // space for header
          pb: '80px', // add bottom padding so content not hidden under footer
          minHeight: 'calc(100vh - 64px)', // total height minus header height
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>

      {/* Footer fixed at bottom, full width */}
      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}
