class OfflineSyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingActions = this.loadPendingActions();
    this.offlineData = this.loadOfflineData();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Store pending actions when offline
  addPendingAction(action) {
    if (!this.isOnline) {
      this.pendingActions.push({
        ...action,
        id: Date.now(),
        timestamp: new Date().toISOString()
      });
      this.savePendingActions();
    }
  }

  // Sync pending actions when back online
  async syncPendingActions() {
    if (this.pendingActions.length === 0) return;

    console.log('Syncing pending actions:', this.pendingActions.length);

    for (const action of this.pendingActions) {
      try {
        await this.executeAction(action);
        this.removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  }

  async executeAction(action) {
    // This would be implemented to execute the actual API calls
    // For now, we'll just log the action
    console.log('Executing action:', action);
  }

  removePendingAction(actionId) {
    this.pendingActions = this.pendingActions.filter(action => action.id !== actionId);
    this.savePendingActions();
  }

  // Store offline data
  storeOfflineData(key, data) {
    this.offlineData[key] = {
      data,
      timestamp: new Date().toISOString()
    };
    this.saveOfflineData();
  }

  // Get offline data
  getOfflineData(key) {
    const item = this.offlineData[key];
    if (item) {
      // Check if data is not too old (24 hours)
      const age = Date.now() - new Date(item.timestamp).getTime();
      if (age < 24 * 60 * 60 * 1000) {
        return item.data;
      }
    }
    return null;
  }

  // Save board data for offline access
  saveBoardOffline(boardId, boardData) {
    this.storeOfflineData(`board_${boardId}`, boardData);
  }

  // Get board data for offline access
  getBoardOffline(boardId) {
    return this.getOfflineData(`board_${boardId}`);
  }

  // Save user data for offline access
  saveUserOffline(userData) {
    this.storeOfflineData('user', userData);
  }

  // Get user data for offline access
  getUserOffline() {
    return this.getOfflineData('user');
  }

  // Local storage helpers
  savePendingActions() {
    try {
      localStorage.setItem('offline_pending_actions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }

  loadPendingActions() {
    try {
      const data = localStorage.getItem('offline_pending_actions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load pending actions:', error);
      return [];
    }
  }

  saveOfflineData() {
    try {
      localStorage.setItem('offline_data', JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  loadOfflineData() {
    try {
      const data = localStorage.getItem('offline_data');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return {};
    }
  }

  // Clear all offline data
  clearOfflineData() {
    this.pendingActions = [];
    this.offlineData = {};
    localStorage.removeItem('offline_pending_actions');
    localStorage.removeItem('offline_data');
  }

  // Get offline status
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      pendingActionsCount: this.pendingActions.length,
      offlineDataKeys: Object.keys(this.offlineData)
    };
  }
}

export default new OfflineSyncService();
