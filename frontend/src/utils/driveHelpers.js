// frontend/src/utils/driveHelpers.js

import axios from 'axios';

// NEW: helper function to fetch Drive files from backend
export const fetchDriveFiles = async () => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  try {
    const res = await axios.get(`${apiBaseUrl}/api/drive/list`);
    return res.data.files || []; // return file array or empty list
  } catch (err) {
    console.error('❌ Failed to fetch Drive files:', err.message);
    return [];
  }
};
