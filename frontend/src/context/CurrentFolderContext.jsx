import { createContext, useContext, useState } from "react";

const CurrentFolderContext = createContext();

export const CurrentFolderProvider = ({ children }) => {
  const rootFolder = { id: "root", name: "My Drive" };
  const [folderStack, setFolderStack] = useState([]); // parents
  const [currentFolder, setCurrentFolder] = useState(rootFolder);

  const goToFolder = (folder) => {
    setFolderStack((prev) => [...prev, currentFolder]);
    setCurrentFolder(folder);
  };

  const goBack = () => {
    if (folderStack.length === 0) return;
    const prev = folderStack[folderStack.length - 1];
    setFolderStack((prevStack) => prevStack.slice(0, prevStack.length - 1));
    setCurrentFolder(prev);
  };

  const goToBreadcrumb = (index) => {
    // Build path: [root, ...folderStack, currentFolder]
    const path = [rootFolder, ...folderStack, currentFolder];
    const folder = path[index];
    setCurrentFolder(folder);
    setFolderStack(path.slice(1, index)); // folders before clicked folder
  };

  return (
    <CurrentFolderContext.Provider
      value={{
        currentFolder,
        folderStack,
        goToFolder,
        goBack,
        goToBreadcrumb,
        rootFolder,
      }}
    >
      {children}
    </CurrentFolderContext.Provider>
  );
};

export const useCurrentFolder = () => useContext(CurrentFolderContext);
