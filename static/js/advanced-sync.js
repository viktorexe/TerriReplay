// ADVANCED REAL-TIME SYNC SYSTEM
document.addEventListener('DOMContentLoaded', function() {
    let syncInterval = null;
    let currentUser = localStorage.getItem('currentUser');
    let currentVersion = parseInt(localStorage.getItem('dataVersion') || '1');
    
    // Override all data modification functions to trigger sync
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.call(this, key, value);
        
        // Trigger sync for important data changes
        if (['folders', 'replayHistory', 'userSettings'].includes(key) && currentUser) {
            setTimeout(instantSync, 100); // Sync immediately after data change
        }
    };
    
    // Instant sync function
    function instantSync() {
        if (!currentUser) return;
        
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const replays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        
        fetch('/api/sync_data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: currentUser,
                folders: folders,
                replays: replays,
                settings: settings,
                version: currentVersion
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                if (result.outdated) {
                    // Server has newer data, update local
                    updateLocalData(result.server_data);
                } else {
                    // Update version
                    currentVersion = result.version;
                    localStorage.setItem('dataVersion', currentVersion.toString());
                }
            }
        })
        .catch(error => console.log('Instant sync error:', error));
    }
    
    // Check for updates from other devices every 2 seconds
    function startRealTimeSync() {
        if (syncInterval) clearInterval(syncInterval);
        
        syncInterval = setInterval(() => {
            if (!currentUser) return;
            
            fetch('/api/check_updates', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: currentUser,
                    version: currentVersion
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success && result.has_updates) {
                    // Update from other device
                    updateLocalData(result.data);
                    showSyncNotification('Data synced from another device');
                }
            })
            .catch(error => console.log('Update check failed:', error));
        }, 2000); // Check every 2 seconds
    }
    
    // Update local data with server data
    function updateLocalData(serverData) {
        // Temporarily disable sync to prevent loops
        const tempUser = currentUser;
        currentUser = null;
        
        localStorage.setItem('folders', JSON.stringify(serverData.folders));
        localStorage.setItem('replayHistory', JSON.stringify(serverData.replays));
        
        if (serverData.settings) {
            localStorage.setItem('userSettings', JSON.stringify(serverData.settings));
        }
        
        currentVersion = serverData.version;
        localStorage.setItem('dataVersion', currentVersion.toString());
        
        // Re-enable sync
        currentUser = tempUser;
        
        // Refresh UI
        if (window.loadFolders) window.loadFolders();
        if (window.loadReplayHistory) window.loadReplayHistory();
        if (window.applyUserSettings && serverData.settings) window.applyUserSettings(serverData.settings);
    }
    
    // Show sync notification
    function showSyncNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Override main.js functions to trigger sync
    if (window.saveReplayHistory) {
        const originalSaveReplayHistory = window.saveReplayHistory;
        window.saveReplayHistory = function() {
            originalSaveReplayHistory.call(this);
            if (currentUser) instantSync();
        };
    }
    
    if (window.saveFolders) {
        const originalSaveFolders = window.saveFolders;
        window.saveFolders = function() {
            originalSaveFolders.call(this);
            if (currentUser) instantSync();
        };
    }
    
    // Start sync when user logs in
    function initializeSync() {
        currentUser = localStorage.getItem('currentUser');
        currentVersion = parseInt(localStorage.getItem('dataVersion') || '1');
        
        if (currentUser) {
            startRealTimeSync();
            showSyncNotification('Real-time sync enabled');
        }
    }
    
    // Initialize on page load
    initializeSync();
    
    // Re-initialize when user logs in
    document.addEventListener('userLoggedIn', initializeSync);
    
    // Stop sync when user logs out
    document.addEventListener('userLoggedOut', function() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
        currentUser = null;
    });
    
    // Sync on page unload
    window.addEventListener('beforeunload', function() {
        if (currentUser) {
            // Use sendBeacon for reliable sync on page unload
            const data = JSON.stringify({
                username: currentUser,
                folders: JSON.parse(localStorage.getItem('folders') || '[]'),
                replays: JSON.parse(localStorage.getItem('replayHistory') || '[]'),
                settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
                version: currentVersion
            });
            
            navigator.sendBeacon('/api/sync_data', data);
        }
    });
    
    // Make functions globally available
    window.instantSync = instantSync;
    window.startRealTimeSync = startRealTimeSync;
    window.updateLocalData = updateLocalData;
});