import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UserIcon, SignalIcon } from '@heroicons/react/24/outline';
import socketService from '../../services/socketService';

const OnlineUsers = ({ boardId }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!boardId || !user) return;

    // Listen for online users updates
    socketService.onOnlineUsersUpdate((data) => {
      if (data.boardId === boardId) {
        console.log('Online users update received:', data.users);
        if (Array.isArray(data.users)) {
          setOnlineUsers(data.users);
        } else {
          console.error('Invalid online users data:', data);
        }
      }
    });

    // Listen for user join/leave events
    socketService.onUserJoined((data) => {
      if (data.boardId === boardId) {
        console.log('User joined:', data.userId, data.userName);
        setOnlineUsers(prev => {
          const existing = prev.find(u => u._id === data.userId);
          if (!existing) {
            return [...prev, { _id: data.userId, name: data.userName, avatar: null, isOnline: true }];
          }
          return prev.map(u => u._id === data.userId ? {...u, isOnline: true} : u);
        });
      }
    });

    socketService.onUserLeft((data) => {
      if (data.boardId === boardId) {
        setOnlineUsers(prev => prev.map(u => 
          u._id === data.userId ? {...u, isOnline: false} : u
        ));
      }
    });

    // Listen for user disconnect events
    socketService.onUserDisconnected((data) => {
      if (data.boardId === boardId) {
        setOnlineUsers(prev => prev.map(u => 
          u._id === data.userId ? {...u, isOnline: false} : u
        ));
      }
    });

    // Request current online users
    socketService.requestOnlineUsers(boardId);

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    };
  }, [boardId, user]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <SignalIcon className="h-4 w-4 text-green-500" />
        <h3 className="text-sm font-medium text-gray-900">Online Users</h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
          {onlineUsers.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {onlineUsers.map((onlineUser) => (
          <div key={onlineUser._id} className="flex items-center space-x-3">
            <div className="relative">
              {onlineUser.avatar ? (
                <img
                  src={onlineUser.avatar}
                  alt={onlineUser.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {onlineUser.name}
                {onlineUser._id === user?._id && (
                  <span className="text-xs text-gray-500 ml-1">(You)</span>
                )}
              </p>
              {editingUsers[onlineUser._id] && (
                <p className="text-xs text-blue-600">
                  Editing {editingUsers[onlineUser._id]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {onlineUsers.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          No users online
        </p>
      )}
    </div>
  );
};

export default OnlineUsers;
