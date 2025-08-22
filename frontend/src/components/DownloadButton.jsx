// frontend/src/components/DownloadButton.jsx
import { useState } from 'react';
import axios from 'axios';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function DownloadButton({ file }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/drive/file/${file.id}/download`;

      const response = await axios.get(url, {
        responseType: 'blob', // important for downloading
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed', err);
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
