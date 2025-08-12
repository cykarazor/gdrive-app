// src/App.jsx
import MainLayout from './components/layouts/MainLayout';
import DriveFilesContainer from './components/DriveFilesContainer';

function App() {
  // Stub handlers for sidebar clicks
  const handleUploadClick = () => {
    alert("Upload modal would open here (not implemented yet)");
  };
  const handleCreateFolderClick = () => {
    alert("Create Folder modal would open here (not implemented yet)");
  };

  return (
    <MainLayout
      onUploadClick={handleUploadClick}
      onCreateFolderClick={handleCreateFolderClick}
    >
      <DriveFilesContainer />
    </MainLayout>
  );
}

export default App;
