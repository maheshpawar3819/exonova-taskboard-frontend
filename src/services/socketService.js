import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinBoard(boardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_board', { boardId });
    }
  }

  leaveBoard(boardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_board', { boardId });
    }
  }

  onCardCreated(callback) {
    if (this.socket) {
      this.socket.on('card_created', callback);
    }
  }

  onCardUpdated(callback) {
    if (this.socket) {
      this.socket.on('card_updated', callback);
    }
  }

  onCardDeleted(callback) {
    if (this.socket) {
      this.socket.on('card_deleted', callback);
    }
  }

  onCardReordered(callback) {
    if (this.socket) {
      this.socket.on('card_reordered', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined_board', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left_board', callback);
    }
  }

  onUserDisconnected(callback) {
    if (this.socket) {
      this.socket.on('user_disconnected', callback);
    }
  }

  onMemberAdded(callback) {
    if (this.socket) {
      this.socket.on('member_added', callback);
    }
  }

  onUserStartedEditing(callback) {
    if (this.socket) {
      this.socket.on('user_started_editing', callback);
    }
  }

  onUserStoppedEditing(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_editing', callback);
    }
  }

  onOnlineUsersUpdate(callback) {
    if (this.socket) {
      this.socket.on('online_users_update', callback);
    }
  }

  requestOnlineUsers(boardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request_online_users', { boardId });
    }
  }

  emitCardCreated(boardId, card) {
    if (this.socket && this.isConnected) {
      this.socket.emit('card_created', { boardId, card });
    }
  }

  emitCardUpdated(boardId, card, updates) {
    if (this.socket && this.isConnected) {
      this.socket.emit('card_updated', { boardId, card, updates });
    }
  }

  emitCardDeleted(boardId, cardId, cardTitle) {
    if (this.socket && this.isConnected) {
      this.socket.emit('card_deleted', { boardId, cardId, cardTitle });
    }
  }

  emitCardReordered(boardId, cardId, sourceColumn, destinationColumn, sourceIndex, destinationIndex) {
    if (this.socket && this.isConnected) {
      this.socket.emit('card_reordered', { 
        boardId, 
        cardId, 
        sourceColumn, 
        destinationColumn, 
        sourceIndex, 
        destinationIndex 
      });
    }
  }

  emitStartEditing(boardId, cardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('start_editing', { boardId, cardId });
    }
  }

  emitStopEditing(boardId, cardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_editing', { boardId, cardId });
    }
  }
}

export default new SocketService();
