import FileUpload from './components/FileUpload';
import DriveFilesList from './components/DriveFilesList';

function App() {
  return (
    <div className="App" style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h1>Google Drive Manager</h1>
      <FileUpload />
      <hr style={{ margin: '40px 0' }} />
      <DriveFilesList />
    </div>
  );
}

export default App;
