import { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [authExpired, setAuthExpired] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadResult(null);
    setError('');
    setAuthExpired(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    try {
      const res = await axios.post(`${apiBaseUrl}/api/drive/upload`, formData);
      setUploadResult(res.data);
      setError('');
      setAuthExpired(false);
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.error) {
        // Token expired or invalid error from backend
        setAuthExpired(true);
        setError('');
      } else {
        setError('Upload failed. Please try again.');
        setAuthExpired(false);
      }
    }
  };

  return (
    <div>
      <h2>Upload to Google Drive</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {uploadResult && (
        <div>
          <p><strong>Upload Successful!</strong></p>
          <p>File ID: {uploadResult.fileId}</p>
          <p>File Name: {uploadResult.fileName}</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {authExpired && (
        <div style={{ color: 'orange' }}>
          <p>Your OAuth token has expired or is invalid.</p>
          <p>
            Please <a href={`${process.env.REACT_APP_API_BASE_URL}/auth/google`} target="_blank" rel="noopener noreferrer">re-authorize</a> the app.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
