import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/drive/upload', formData);
      setUploadResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
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
    </div>
  );
};

export default FileUpload;
