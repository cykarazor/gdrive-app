// frontend/src/context/CurrentFolderContext.jsx
import { createContext, useContext, useState } from 'react';

const CurrentFolderContext = createContext();

export const CurrentFolderProvider = ({ children }) => {
  const rootFolder = { id: 'root', name: 'My Drive' };
  const [currentFolder, setCurrentFolder] = useState(rootFolder);
  const [folderStack, setFolderStack] = useState([]); // ancestors

  // Navigate into a folder
  const goToFolder = (folder) => {
    if (currentFolder.id !== 'root') {
      setFolderStack([...folderStack, currentFolder]);
    }
    setCurrentFolder(folder);
  };

  // Go back one level
  const goBack = () => {
    if (folderStack.length === 0) {
      // Already at root
      setCurrentFolder(rootFolder);
      setFolderStack([]);
      return;
    }
    const prevFolder = folderStack[folderStack.length - 1];
    setFolderStack(folderStack.slice(0, -1));
    setCurrentFolder(prevFolder);
  };

  // Jump to a folder by breadcrumb index
  const goToBreadcrumb = (index) => {
    if (index < 0) {
      // Go to root
      setCurrentFolder(rootFolder);
      setFolderStack([]);
      return;
    }

    const newStack = folderStack.slice(0, index);
    const newCurrent = index < folderStack.length ? folderStack[index] : currentFolder;

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
