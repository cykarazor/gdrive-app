//frontend/src/App.jsx
import { useState } from "react";
import MainLayout from "./components/layouts/MainLayout";
import DriveFilesContainer from "./components/DriveFilesContainer";

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);

  // Toggle reloadFlag to refresh DriveFilesContainer
  const triggerReload = () => setReloadFlag((prev) => !prev);

  return (
    <MainLayout
      onReloadFiles={triggerReload}  // Pass reload callback
    >
      <DriveFilesContainer reloadFlag={reloadFlag} /> {/* Pass reload flag */}
    </MainLayout>
  );
}

export default App;
