import React, { useState, useEffect } from 'react';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import socketService from '../../services/socketService';

const ActivityLog = ({ boardId }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!boardId) return;

    // Listen for real-time activity events
    socketService.onCardCreated((data) => {
      if (data.boardId === boardId) {
        const newActivity = {
          id: Date.now(),
          user: { name: data.createdBy?.userName || 'Unknown User', avatar: null },
          action: 'created a card',
          details: data.card.title,
          timestamp: new Date(data.timestamp || Date.now())
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
      }
    });

    socketService.onCardUpdated((data) => {
      if (data.boardId === boardId) {
        const newActivity = {
          id: Date.now(),
          user: { name: data.updatedBy?.userName || 'Unknown User', avatar: null },
          action: 'updated a card',
          details: data.card.title,
          timestamp: new Date(data.timestamp || Date.now())
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    });

    socketService.onCardReordered((data) => {
      if (data.boardId === boardId) {
        const newActivity = {
          id: Date.now(),
          user: { name: data.reorderedBy?.userName || 'Unknown User', avatar: null },
          action: 'moved a card',
          details: `from ${data.sourceColumn} to ${data.destinationColumn}`,
          timestamp: new Date(data.timestamp || Date.now())
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    });

    socketService.onCardDeleted((data) => {
      if (data.boardId === boardId) {
        const newActivity = {
          id: Date.now(),
          user: { name: data.deletedBy?.userName || 'Unknown User', avatar: null },
          action: 'deleted a card',
          details: data.cardTitle,
          timestamp: new Date(data.timestamp || Date.now())
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    });

    // Listen for member activity
    socketService.onMemberAdded((data) => {
      if (data.boardId === boardId) {
        const newActivity = {
          id: Date.now(),
          user: { name: data.addedBy?.userName || 'Unknown User', avatar: null },
          action: 'added a member',
          details: data.memberName,
          timestamp: new Date(data.timestamp || Date.now())
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    });

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    };
  }, [boardId]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ClockIcon className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900">Activity Log</h3>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="h-3 w-3 text-gray-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user.name}</span>
                {' '}{activity.action}
                {activity.details && (
                  <span className="text-gray-600">: {activity.details}</span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No activity yet. Start creating cards to see activity here!
        </p>
      )}
    </div>
  );
};

export default ActivityLog;
