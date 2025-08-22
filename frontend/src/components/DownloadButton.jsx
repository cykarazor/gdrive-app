// frontend/src/components/DownloadButton.jsx
import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export default function DownloadButton({ file }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Backend endpoint URL
      const url = `/api/drive/file/${file.id}/download`;

      // Fetch the file as a blob
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          // add auth headers if needed
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create a temporary <a> to trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to download file/folder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Download">
      <span>
        <IconButton onClick={handleDownload} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : <DownloadIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
