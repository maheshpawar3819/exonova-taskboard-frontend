import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const ColumnHeader = ({ column, cardCount, onCreateCard, canEdit }) => {
  return (
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-gray-900 text-lg">{column.title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {cardCount}
          </span>
        </div>
        
        <button
          onClick={() => onCreateCard(column.title)}
          className={`px-3 py-1 rounded-lg transition-colors duration-200 border text-sm font-medium ${
            canEdit 
              ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300' 
              : 'text-gray-400 hover:text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
          title={canEdit ? "Add new card" : "You don't have permission to create cards"}
          disabled={!canEdit}
        >
          <PlusIcon className="h-4 w-4 inline mr-1" />
          Add Card
        </button>
      </div>
      
      {column.description && (
        <p className="text-sm text-gray-600 mt-1">{column.description}</p>
      )}
    </div>
  );
};

export default ColumnHeader;
