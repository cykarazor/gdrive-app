// frontend/src/hooks/useBatchAction.js
import { useState } from 'react';

export default function useBatchAction() {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleItem = (id, checked) => {
    if (checked) setSelectedItems([...selectedItems, id]);
    else setSelectedItems(selectedItems.filter((i) => i !== id));
  };

  const clearSelection = () => setSelectedItems([]);

  const isSelected = (id) => selectedItems.includes(id);

  return {
    selectedItems,
    toggleItem,
    clearSelection,
    isSelected,
    setSelectedItems, // optional direct setter
  };
}
