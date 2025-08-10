import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import DriveFiles from './components/DriveFilesList';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchDriveFiles } from './utils/driveHelpers';
import { Container } from '@mui/material';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true); // NEW

  const loadFiles = async () => {
    setLoading(true); // NEW: start loading
    const fetchedFiles = await fetchDriveFiles();
    setFiles(fetchedFiles);
    setLoading(false); // NEW: loading done
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="App">
      <Header />
      <Container sx={{ mt: 3 }}>
        <FileUpload onUploadSuccess={loadFiles} />
        <DriveFiles files={files} loading={loading} /> {/* NEW: pass loading */}
        <DriveFiles files={files} />
      </Container>
      <Footer />
    </div>
  );
}

export default App;
