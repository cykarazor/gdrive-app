// frontend/src/components/Header.jsx
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

// Google Drive SVG
const GoogleDriveLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48">
    <path fill="#0F9D58" d="M6,32l7,12h29l-7-12H6z"/>
    <path fill="#FFCD40" d="M13,20L6,32l7,12l7-12L13,20z"/>
    <path fill="#4285F4" d="M42,32l-7,12L13,20l7-12L42,32z"/>
    <path fill="#DB4437" d="M20,8l-7,12l22,24l7-12L20,8z"/>
  </svg>
);

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: '#202124', boxShadow: '0px 1px 5px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        {/* Logo */}
        <Box sx={{ mr: 1 }}>
          <GoogleDriveLogo />
        </Box>

        {/* Title */}
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            Google Drive File Manager
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Upload & Manage Files Seamlessly
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
