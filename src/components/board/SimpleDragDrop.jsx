import React, { useState } from 'react';

const SimpleDragDrop = ({ children, onDragEnd }) => {
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    if (draggedItem && onDragEnd) {
      onDragEnd({
        source: { droppableId: draggedItem.column, index: draggedItem.index },
        destination: { droppableId: targetColumn, index: 0 },
        draggableId: draggedItem.id
      });
    }
    setDraggedItem(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
};

export default SimpleDragDrop;
