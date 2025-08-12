import React, { useState } from 'react';
import {
  CalendarIcon,
  UserIcon,
  TagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Card = ({ card, onClick, canEdit, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent') return <ExclamationTriangleIcon className="h-3 w-3" />;
    return null;
  };

  const isOverdue = () => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return dueDate < today && card.status !== 'completed';
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editTitle.trim() && onUpdate) {
      await onUpdate({
        title: editTitle.trim(),
        description: editDescription.trim()
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="card border-2 border-blue-300 bg-blue-50">
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Card title"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Card description"
          />
          <div className="flex justify-end space-x-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
              title="Save"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded"
              title="Cancel"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer hover:shadow-md transition-all duration-200 ${
        isOverdue() ? 'border-red-300 bg-red-50' : ''
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
          {card.title}
        </h4>
        
        <div className="flex items-center space-x-1">
          {/* Priority Badge */}
          {card.priority && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(card.priority)}`}>
              {getPriorityIcon(card.priority)}
              <span className="ml-1">{card.priority}</span>
            </span>
          )}
          
          {/* Edit Button */}
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit card"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
          )}
          
          {/* Delete Button */}
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this card?')) {
                  onDelete(card._id, card.title);
                }
              }}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete card"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Card Description */}
      {card.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Card Meta Information */}
      <div className="space-y-2">
        {/* Due Date */}
        {card.dueDate && (
          <div className={`flex items-center space-x-1 text-xs ${
            isOverdue() ? 'text-red-600' : 'text-gray-500'
          }`}>
            <CalendarIcon className="h-3 w-3" />
            <span className={isOverdue() ? 'font-medium' : ''}>
              {formatDueDate(card.dueDate)}
            </span>
            {isOverdue() && (
              <span className="text-red-500 font-medium">(Overdue)</span>
            )}
          </div>
        )}

        {/* Assignees */}
        {card.assignees && card.assignees.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <UserIcon className="h-3 w-3" />
            <span>{card.assignees.length} assignee{card.assignees.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <TagIcon className="h-3 w-3" />
            <span>{card.labels.length} label{card.labels.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Comments */}
        {card.comments && card.comments.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <ClockIcon className="h-3 w-3" />
            <span>{card.comments.length} comment{card.comments.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Status */}
        {card.status && (
          <div className="flex items-center space-x-1 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${
              card.status === 'completed' ? 'bg-green-500' :
              card.status === 'in-progress' ? 'bg-blue-500' :
              card.status === 'blocked' ? 'bg-red-500' :
              'bg-gray-400'
            }`}></span>
            <span className="text-gray-500 capitalize">{card.status}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        {/* Created/Updated Info */}
        <div className="text-xs text-gray-400">
          {card.updatedAt && (
            <span>Updated {new Date(card.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* Action Indicator */}
        {canEdit && (
          <div className="text-xs text-primary-600 font-medium">
            Click to edit
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;

