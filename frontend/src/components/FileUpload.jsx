import { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('File selected:', selectedFile);
    setFile(selectedFile);
    setUploadResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file:', file.name);

    try {
      console.log('Sending POST request to:', `${import.meta.env.VITE_API_BASE_URL}/api/drive/upload`);
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/drive/upload`, formData);
      console.log('Upload response:', res.data);
      setUploadResult(res.data);
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message || err);
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
