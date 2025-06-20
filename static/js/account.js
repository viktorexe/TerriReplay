// Account Management - Simplified and Fixed
document.addEventListener('DOMContentLoaded', function() {
    let currentUser = localStorage.getItem('currentUser');
    let currentVersion = parseInt(localStorage.getItem('dataVersion') || '1');
    
    // Update account button on load
    updateAccountButton();
    
    // Auto-login if user is remembered
    if (currentUser) {
        console.log('Auto-logged in user:', currentUser);
        updateAccountButton();
    }
    
    // Update account button text
    function updateAccountButton() {
        const accountBtn = document.getElementById('accountBtn');
        if (currentUser && accountBtn) {
            accountBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser}`;
        }
    }
    
    // Silent background sync
    function syncUserData() {
        if (!currentUser) return;
        
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const replays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{"theme": "light", "sortOrder": "date-desc"}');
        
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
                    localStorage.setItem('folders', JSON.stringify(result.server_data.folders));
                    localStorage.setItem('replayHistory', JSON.stringify(result.server_data.replays));
                    if (result.server_data.settings) {
                        localStorage.setItem('userSettings', JSON.stringify(result.server_data.settings));
                    }
                    currentVersion = result.server_data.version;
                    localStorage.setItem('dataVersion', currentVersion.toString());
                    
                    // Refresh UI
                    if (window.loadFolders) window.loadFolders();
                    if (window.loadReplayHistory) window.loadReplayHistory();
                } else {
                    // Update version
                    currentVersion = result.version;
                    localStorage.setItem('dataVersion', currentVersion.toString());
                }
            }
        })
        .catch(error => console.log('Background sync error:', error));
    }
    
    // Check for updates from other devices
    function checkForUpdates() {
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
                localStorage.setItem('folders', JSON.stringify(result.data.folders));
                localStorage.setItem('replayHistory', JSON.stringify(result.data.replays));
                if (result.data.settings) {
                    localStorage.setItem('userSettings', JSON.stringify(result.data.settings));
                }
                currentVersion = result.data.version;
                localStorage.setItem('dataVersion', currentVersion.toString());
                
                // Refresh UI
                if (window.loadFolders) window.loadFolders();
                if (window.loadReplayHistory) window.loadReplayHistory();
                
                // Show notification
                showSyncNotification('Data synced from another device');
            }
        })
        .catch(error => console.log('Update check failed:', error));
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
    
    // Start real-time sync if user is logged in
    if (currentUser) {
        // Sync every 15 seconds
        setInterval(syncUserData, 15000);
        
        // Check for updates every 5 seconds
        setInterval(checkForUpdates, 5000);
        
        // Initial sync
        setTimeout(syncUserData, 1000);
    }
    
    // Sync on page unload
    window.addEventListener('beforeunload', function() {
        if (currentUser) {
            syncUserData();
        }
    });
    
    // Make functions globally available
    window.syncUserData = syncUserData;
    window.updateAccountButton = updateAccountButton;
});