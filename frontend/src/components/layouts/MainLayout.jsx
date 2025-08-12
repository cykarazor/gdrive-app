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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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

      {/* Main content shifted right on desktop to avoid being behind the fixed drawer */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: `${drawerWidth}px` },
          mt: 8, // space below fixed header (adjust if needed)
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
}
