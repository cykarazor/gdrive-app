import MainLayout from "./components/layouts/MainLayout";
import DriveFilesContainer from "./components/DriveFilesContainer";

function App() {
  const handleCreateFolderClick = () => {
    alert("Create Folder modal would open here (not implemented yet)");
  };

  return (
    <MainLayout onCreateFolderClick={handleCreateFolderClick}>
      <DriveFilesContainer />
    </MainLayout>
  );
}

export default App;
