// frontend/src/components/FileUpload.jsx
import { useState, useRef } from 'react'; // Added useRef
import axios from 'axios';
import { Button, Typography, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GoogleIcon from '@mui/icons-material/Google';
import UploadLoading from './UploadLoading'; // NEW: Import the loading spinner component

const FileUpload = ({ onUploadSuccess, folderId }) => { // ✅ accept folderId prop
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null); // NEW: ref for file input element
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [authExpired, setAuthExpired] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(false); // NEW: Loading state

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
    setError('');
    setAuthExpired(false);
    setAuthUrl('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true); // NEW: start loading spinner

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId || 'root'); // ✅ send folderId to backend, default to root

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    try {
      // const res = await axios.post(`${apiBaseUrl}/api/drive/upload`, formData); // <-- old code
      const res = await axios.post(`${apiBaseUrl}/api/drive/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }); // ✅ new code to include folderId in formData

      setUploadResult(res.data);
      setError('');
      setAuthExpired(false);
      setAuthUrl('');

      // Clear file input and reset file state
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      // 🆕 Call parent callback to refresh file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      const { response } = err;
      if (response?.status === 401 && response?.data?.error === 'TokenExpired') {
        setAuthExpired(true);
        setAuthUrl(`${apiBaseUrl}${response.data.authUrl || '/auth/google'}`);
        setError(response.data.message || 'Authorization error. Please reauthorize.');
      } else {
        setError('Upload failed. Please try again.');
        setAuthExpired(false);
        setAuthUrl('');
      }
    } finally {
      setLoading(false); // NEW: stop loading spinner after attempt
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f9f9f9', // NEW: subtle background
        p: 3, 
        borderRadius: 3, 
        boxShadow: 2, 
        maxWidth: 500, 
        mx: 'auto', 
        textAlign: 'center' 
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#4285F4' }}>
        <GoogleIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 
        Upload to Google Drive
      </Typography>

      {/* File input */}
      <input 
        type="file" 
        onChange={handleFileChange} 
        style={{ marginBottom: '1rem' }}
        disabled={loading} // Disable file input while loading 
        ref={fileInputRef}  // NEW: attach ref to clear input
      />

      {/* Upload button */}
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={handleUpload}
        sx={{
          backgroundColor: '#4285F4', // Google blue
          borderRadius: '20px', // NEW: rounded button
          px: 3,
          py: 1,
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#357ae8',
          },
        }}
        disabled={loading}  // NEW: disable button while uploading
      >
        Upload
      </Button>

      {/* NEW: Show spinner and message when uploading */}
      {loading && <UploadLoading loading={loading} />}

      {/* Upload result */}
      {uploadResult && (
        <Box sx={{ mt: 3, textAlign: 'left', backgroundColor: '#e6f4ea', p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#0f9d58', fontWeight: 'bold' }}>
            Upload Successful!
          </Typography>
          <Typography>File ID: {uploadResult.fileId}</Typography>
          <Typography>File Name: {uploadResult.fileName}</Typography>
        </Box>
      )}

      {/* Error message */}
      {error && !authExpired && (
        <Typography sx={{ color: 'red', mt: 2 }}>{error}</Typography>
      )}

      {/* Auth expired */}
      {authExpired && (
        <Box sx={{ color: 'orange', mt: 2 }}>
          <Typography>{error}</Typography>
          {authUrl && (
            <Typography>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#4285F4',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Reauthorize now
              </a>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
