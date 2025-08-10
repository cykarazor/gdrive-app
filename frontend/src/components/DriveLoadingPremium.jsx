// DriveLoadingPremium.jsx
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, Box, Fade } from '@mui/material';

export default function DriveLoadingPremium({ loading }) {
  const messages = [
    '☁️ Connecting to Google Drive…',
    '📂 Fetching your files from the cloud…',
    '🔍 Searching your Drive for treasures…',
    '📦 Almost ready to show your files…'
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
  }, [loading]);

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
          background: 'linear-gradient(-45deg, #e0f7fa, #f1f8e9, #fff3e0, #fce4ec)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 12s ease infinite',
        }}
      >
        <CircularProgress
          size={pulseSize}
          sx={{ transition: 'all 0.3s ease-in-out' }}
        />
        <Fade in={fadeIn} timeout={300}>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{
              mt: 2,
              textAlign: 'center',
              fontWeight: 500,
              px: 2
            }}
          >
            {messages[index]}
          </Typography>
        </Fade>

        {/* Gradient animation keyframes */}
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
