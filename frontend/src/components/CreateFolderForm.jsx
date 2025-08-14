// frontend/src/components/CreateFolderForm.jsx
import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function CreateFolderForm({ onSuccess, disabled, folderId }) { // ✅ accept folderId prop
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: folderName.trim(),
        // parentId will default to root if folderId not provided
        parentId: folderId || 'root', // ✅ send folderId to backend
      };

      // const res = await axios.post(`${API_BASE_URL}/api/drive/folder`, { name: folderName.trim() }); // <-- old code
      const res = await axios.post(`${API_BASE_URL}/api/drive/folder`, payload); // ✅ new code with parentId

      if (res.status === 200) {
        setFolderName('');
        onSuccess?.();
      } else {
        setError('Failed to create folder');
      }
    } catch (err) {
      console.error('Create folder error:', err); // ✅ log error for debugging
      setError('Failed to create folder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <TextField
        label="Folder Name"
        fullWidth
        value={folderName}
        onChange={(e) => {
          setFolderName(e.target.value);
          if (error) setError('');  // <-- Clear error when user types
        }}
        disabled={loading || disabled}
        error={!!error}
        helperText={error || 'Enter a name for the new folder'}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || disabled}
      >
        Create
      </Button>
    </Box>
  );
}
