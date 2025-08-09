import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import DriveFiles from './components/DriveFilesList';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchDriveFiles } from './utils/driveHelpers';
import { Container } from '@mui/material'; // NEW

function App() {
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const fetchedFiles = await fetchDriveFiles();
    setFiles(fetchedFiles);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="App">
      <Header />
      <Container sx={{ mt: 3 }}>
        <FileUpload onUploadSuccess={loadFiles} />
        <DriveFiles files={files} />
      </Container>
      <Footer />
    </div>
  );
}

export default App;
