import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon, PlusIcon, TrashIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';
import { updateCard, deleteCard } from '../../store/slices/cardSlice';
import { setNotification, clearSelectedCard, toggleCardDetailsModal } from '../../store/slices/uiSlice';
import { fetchBoardById } from '../../store/slices/boardSlice';
import socketService from '../../services/socketService';

const CardDetailsModal = () => {
  const dispatch = useDispatch();
  const { selectedCard } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'active',
    assignees: [],
    labels: []
  });
  const [newComment, setNewComment] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedCard) {
      setFormData({
        title: selectedCard.title || '',
        description: selectedCard.description || '',
        priority: selectedCard.priority || 'medium',
        dueDate: selectedCard.dueDate ? selectedCard.dueDate.split('T')[0] : '',
        status: selectedCard.status || 'active',
        assignees: selectedCard.assignees || [],
        labels: selectedCard.labels || []
      });
    }
  }, [selectedCard]);

  const handleClose = () => {
    dispatch(clearSelectedCard());
    dispatch(toggleCardDetailsModal());
  };

  const handleSave = async () => {
    if (!selectedCard || !formData.title.trim()) {
      dispatch(setNotification({
        type: 'error',
        message: 'Card title is required'
      }));
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(updateCard({
        cardId: selectedCard._id,
        updates: formData
      })).unwrap();

      // Emit socket event for real-time updates
      const boardId = selectedCard.board;
      socketService.emitCardUpdated(boardId, result._id, formData);
      console.log('Card updated and socket event emitted:', result._id);

      dispatch(setNotification({
        type: 'success',
        message: 'Card updated successfully!'
      }));
      setIsEditing(false);
      
      // Refresh the board data to ensure UI is updated
      dispatch(fetchBoardById(boardId));
    } catch (error) {
      console.error('Update card error:', error);
      dispatch(setNotification({
        type: 'error',
        message: 'Failed to update card: ' + 
          (error.response?.data?.message || 
           error.message || 
           'Unknown error occurred')
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) return;

    if (window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      setLoading(true);
      try {
        const boardId = selectedCard.board;
        await dispatch(deleteCard({
          cardId: selectedCard._id
        })).unwrap();
        
        // Emit socket event for real-time updates
        socketService.emitCardDeleted(boardId, selectedCard._id, selectedCard.title);
        console.log('Card deleted and socket event emitted:', selectedCard._id);
        
        dispatch(setNotification({
          type: 'success',
          message: 'Card deleted successfully!'
        }));
        
        // Refresh the board data to ensure UI is updated
        dispatch(fetchBoardById(boardId));
        
        handleClose();
      } catch (error) {
        console.error('Delete card error:', error);
        dispatch(setNotification({
          type: 'error',
          message: 'Failed to delete card: ' + 
            (error.response?.data?.message || 
             error.message || 
             'Unknown error occurred')
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedCard) return;

    try {
      const commentData = {
        text: newComment,
        author: user.id,
        authorName: user.name
      };

      await dispatch(updateCard({
        cardId: selectedCard._id,
        updates: {
          comments: [...(selectedCard.comments || []), commentData]
        }
      })).unwrap();

      setNewComment('');
      dispatch(setNotification({
        type: 'success',
        message: 'Comment added successfully!'
      }));
    } catch (error) {
      dispatch(setNotification({
        type: 'error',
        message: 'Failed to add comment'
      }));
    }
  };

  const handleAddAssignee = () => {
    if (!newAssignee.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      assignees: [...prev.assignees, newAssignee.trim()]
    }));
    setNewAssignee('');
  };

  const handleRemoveAssignee = (index) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter((_, i) => i !== index)
    }));
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      labels: [...prev.labels, newLabel.trim()]
    }));
    setNewLabel('');
  };

  const handleRemoveLabel = (index) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index)
    }));
  };

  if (!selectedCard) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="Enter card title"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCard.title}</h2>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input resize-none"
                    rows="4"
                    placeholder="Enter card description"
                  />
                ) : (
                  <p className="text-gray-600">{selectedCard.description || 'No description'}</p>
                )}
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
                <div className="space-y-3 mb-4">
                  {selectedCard.comments?.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input flex-1"
                    placeholder="Add a comment..."
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    formData.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    formData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {formData.priority}
                  </span>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                ) : (
                  <span className="text-sm text-gray-900 capitalize">{formData.status}</span>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <span className="text-sm text-gray-900">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                )}
              </div>

              {/* Assignees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignees
                </label>
                <div className="space-y-2">
                  {formData.assignees.map((assignee, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                      <span className="text-sm text-gray-700">{assignee}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveAssignee(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        className="input flex-1"
                        placeholder="Add assignee"
                      />
                      <button
                        onClick={handleAddAssignee}
                        disabled={!newAssignee.trim()}
                        className="btn btn-secondary"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels
                </label>
                <div className="space-y-2">
                  {formData.labels.map((label, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                      <span className="text-sm text-gray-700">{label}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveLabel(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="input flex-1"
                        placeholder="Add label"
                      />
                      <button
                        onClick={handleAddLabel}
                        disabled={!newLabel.trim()}
                        className="btn btn-secondary"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={loading || !formData.title.trim()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Delete Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="btn bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Card'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;

