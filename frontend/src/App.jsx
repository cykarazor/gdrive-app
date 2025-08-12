// src/App.jsx
import FileUpload from './components/FileUpload';
import DriveFilesContainer from './components/DriveFilesContainer';
import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from '@mui/material';

function App() {
  return (
    <div className="App">
      <Header />
      <Container sx={{ mt: 3 }}>
        <FileUpload onUploadSuccess={() => {/* optional: can trigger refresh if needed */}} />
        <DriveFilesContainer />
      </Container>
      <Footer />
    </div>
  );
}

export default App;
