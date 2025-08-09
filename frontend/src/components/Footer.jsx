// frontend/src/components/Footer.jsx
import { Box, Typography } from '@mui/material';
import CopyrightIcon from '@mui/icons-material/Copyright';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa',
        padding: '0.8rem',
        textAlign: 'center',
        borderTop: '1px solid #dadce0',
        mt: 3,
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: '#5f6368', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <CopyrightIcon sx={{ fontSize: 14, mr: 0.5 }} />
        {new Date().getFullYear()} Shawn Mohammed • Google Drive File Manager
      </Typography>
    </Box>
  );
};

export default Footer;
