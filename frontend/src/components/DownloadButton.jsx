// frontend/src/components/DownloadButton.jsx
import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export default function DownloadButton({ file }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Use the backend API URL
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/drive/file/${file.id}/download`;

      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();

      // Determine proper filename
      let fileName = file.name;
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        // Ensure folder downloads as .zip
        if (!fileName.endsWith('.zip')) fileName += '.zip';
      }

      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
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
