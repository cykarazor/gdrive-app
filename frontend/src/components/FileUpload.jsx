import { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [authExpired, setAuthExpired] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
    setError('');
    setAuthExpired(false);
    setAuthUrl('');
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
      setAuthUrl('');
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

      {error && !authExpired && <p style={{ color: 'red' }}>{error}</p>}

      {authExpired && (
        <div style={{ color: 'orange' }}>
          <p>{error}</p>
          {authUrl && (
            <p>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reauthorize now
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
