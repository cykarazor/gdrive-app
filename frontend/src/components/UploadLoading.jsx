// frontend/src/components/UploadLoading.jsx
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, Box, Fade } from '@mui/material';

export default function UploadLoading({ loading }) {
  const messages = [
    '📤 Preparing your files for upload…',
    '🚀 Uploading files to the cloud…',
    '🔄 Finalizing the upload process…',
    '✅ Almost done uploading…',
  ];

  const [index, setIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [pulseSize, setPulseSize] = useState(50);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setFadeIn(false);
      setPulseSize(45);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFadeIn(true);
        setPulseSize(50);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading, messages.length]);

  return (
    <Fade in={loading} timeout={{ enter: 400, exit: 300 }} unmountOnExit>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(-45deg, #e1f5fe, #fff3e0, #e8f5e9, #ede7f6)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 12s ease infinite',
          p: 3,
          borderRadius: 2,
        }}
      >
        <CircularProgress
          size={pulseSize}
          sx={{ transition: 'all 0.3s ease-in-out' }}
          color="primary"
        />
        <Fade in={fadeIn} timeout={300}>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{
              mt: 2,
              textAlign: 'center',
              fontWeight: 500,
              px: 2,
            }}
          >
            {messages[index]}
          </Typography>
        </Fade>

        <style>
          {`
            @keyframes gradientMove {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>
      </Box>
    </Fade>
  );
}
