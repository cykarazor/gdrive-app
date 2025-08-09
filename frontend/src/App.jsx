// App.jsx

import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import DriveFiles from './components/DriveFilesList';
import { fetchDriveFiles } from './utils/driveHelpers'; // NEW: helper to fetch files

function App() {
  const [files, setFiles] = useState([]); // NEW: files state

  // NEW: function to load files from backend
  const loadFiles = async () => {
    const fetchedFiles = await fetchDriveFiles();
    setFiles(fetchedFiles);
  };

  useEffect(() => {
    loadFiles(); // NEW: fetch files on first load
  }, []);

  return (
    <div className="App">
      <FileUpload onUploadSuccess={loadFiles} /> {/* NEW: pass refresh callback */}
      <DriveFiles files={files} /> {/* NEW: pass file list to display */}
    </div>
  );
}

export default App;
