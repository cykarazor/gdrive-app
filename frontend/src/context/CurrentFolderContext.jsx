// frontend/src/context/CurrentFolderContext.jsx
import { createContext, useContext, useState } from "react";

const CurrentFolderContext = createContext();

export const CurrentFolderProvider = ({ children }) => {
  const [folderStack, setFolderStack] = useState([]); // parent folders
  const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'My Drive' });

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
    const newStack = folderStack.slice(0, index);
    const newCurrent = folderStack[index];
    setFolderStack(newStack);
    setCurrentFolder(newCurrent);
  };

  return (
    <CurrentFolderContext.Provider
      value={{
        currentFolder,
        folderStack,
        goToFolder,
        goBack,
        goToBreadcrumb,
      }}
    >
      {children}
    </CurrentFolderContext.Provider>
  );
};

export const useCurrentFolder = () => useContext(CurrentFolderContext);
