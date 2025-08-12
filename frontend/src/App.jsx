// src/App.jsx
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DriveFilesContainer from './components/DriveFilesContainer';
import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from '@mui/material';

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);

  // Toggle reloadFlag to trigger re-fetch in DriveFilesContainer
  const triggerReload = () => setReloadFlag(prev => !prev);

  return (
    <div className="App">
      <Header />
      <Container sx={{ mt: 3 }}>
        <FileUpload onUploadSuccess={triggerReload} />
        <DriveFilesContainer reloadFlag={reloadFlag} />
      </Container>
      <Footer />
    </div>
  );
}

export default App;
