// Account Management
document.addEventListener('DOMContentLoaded', function() {
    let currentUser = localStorage.getItem('currentUser');
    let rememberLogin = localStorage.getItem('rememberLogin') === 'true';
    let currentVersion = parseInt(localStorage.getItem('dataVersion') || '1');
    let syncInterval = null;
    
    // Account button handlers
    const accountBtn = document.getElementById('accountBtn');
    const mobileAccountSettings = document.getElementById('mobileAccountSettings');
    const loginBtn = document.getElementById('loginBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const createAccountSubmitBtn = document.getElementById('createAccountSubmitBtn');
    
    // Show account modal
    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            document.getElementById('accountModal').style.display = 'flex';
        });
    }
    
    if (mobileAccountSettings) {
        mobileAccountSettings.addEventListener('click', () => {
            document.getElementById('accountModal').style.display = 'flex';
        });
    }
    
    // Show login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.getElementById('accountModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'flex';
        });
    }
    
    // Show create account modal
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            document.getElementById('accountModal').style.display = 'none';
            document.getElementById('createAccountModal').style.display = 'flex';
        });
    }
    
    // Handle login
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', async () => {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!username || !password) {
                showCustomAlert('Please enter username and password', 'error');
                return;
            }
            
            // Show loading
            showLoading('Logging In', 'Verifying your credentials...');
            updateProgress(20);
            
            try {
                updateProgress(40);
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                updateProgress(60);
                const result = await response.json();
                
                if (result.success) {
                    updateProgress(80);
                    updateLoadingMessage('Loading your data...');
                    
                    currentUser = username;
                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('rememberLogin', 'true');
                    
                    // Load user data with version control
                    const serverFolders = result.user.folders || [];
                    const serverReplays = result.user.replays || [];
                    const serverVersion = result.user.version || 1;
                    const localFolders = JSON.parse(localStorage.getItem('folders') || '[]');
                    const localReplays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
                    
                    // Use server data and update version
                    const finalFolders = serverFolders.length > 0 ? serverFolders : localFolders;
                    const finalReplays = serverReplays.length > 0 ? serverReplays : localReplays;
                    
                    localStorage.setItem('folders', JSON.stringify(finalFolders));
                    localStorage.setItem('replayHistory', JSON.stringify(finalReplays));
                    currentVersion = serverVersion;
                    localStorage.setItem('dataVersion', currentVersion.toString());
                    
                    updateProgress(100);
                    
                    // Refresh UI
                    if (window.loadFolders) window.loadFolders();
                    if (window.loadReplayHistory) window.loadReplayHistory();
                    
                    setTimeout(() => {
                        hideLoading();
                        document.getElementById('loginModal').style.display = 'none';
                        updateAccountButton();
                        startRealTimeSync();
                        
                        showCustomAlert(`Welcome back, ${username}!\nLoaded ${finalReplays.length} replays and ${finalFolders.length} folders.`, 'success');
                        setTimeout(syncUserData, 1000);
                    }, 300);
                } else {
                    hideLoading();
                    showCustomAlert(result.message, 'error');
                }
            } catch (error) {
                hideLoading();
                showCustomAlert('Login failed. Please check your connection and try again.', 'error');
            }
        });
    }
    
    // Handle create account
    if (createAccountSubmitBtn) {
        createAccountSubmitBtn.addEventListener('click', async () => {
            const username = document.getElementById('createUsername').value.trim();
            const password = document.getElementById('createPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!username || !password || !confirmPassword) {
                showCustomAlert('Please fill all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showCustomAlert('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showCustomAlert('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Show loading
            showLoading('Creating Account', 'Setting up your new account...');
            updateProgress(25);
            
            try {
                updateProgress(50);
                updateLoadingMessage('Checking username availability...');
                
                const response = await fetch('/api/create_account', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                updateProgress(75);
                const result = await response.json();
                
                if (result.success) {
                    updateProgress(100);
                    updateLoadingMessage('Account created successfully!');
                    
                    setTimeout(() => {
                        hideLoading();
                        document.getElementById('createAccountModal').style.display = 'none';
                        
                        // Pre-fill login form
                        document.getElementById('loginUsername').value = username;
                        document.getElementById('loginModal').style.display = 'flex';
                        
                        showCustomAlert(`Welcome to TerriReplay, ${username}!\nYour account has been created successfully.\nPlease login to continue.`, 'success');
                    }, 500);
                } else {
                    hideLoading();
                    showCustomAlert(result.message, 'error');
                }
            } catch (error) {
                hideLoading();
                showCustomAlert('Account creation failed. Please check your connection and try again.', 'error');
            }
        });
    }
    
    // Silent background sync - no user interruption
    function syncUserData() {
        if (!currentUser) return;
        
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const replays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{
            "theme": "light",
            "sortOrder": "date-desc"
        }');
        
        // Silent sync in background
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
                    // Server has newer data, silently update local
                    updateLocalData(result.server_data);
                } else {
                    // Sync successful, update version
                    currentVersion = result.version;
                    localStorage.setItem('dataVersion', currentVersion.toString());
                }
            }
        })
        .catch(error => console.log('Background sync error:', error));
    }
    
    // Silent check for updates from other devices
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
                // Silently update from other device
                updateLocalData(result.data);
            }
        })
        .catch(error => console.log('Update check failed:', error));
    }
    
    // Silently update local data with server data
    function updateLocalData(serverData) {
        localStorage.setItem('folders', JSON.stringify(serverData.folders));
        localStorage.setItem('replayHistory', JSON.stringify(serverData.replays));
        
        // Also update settings if available
        if (serverData.settings) {
            localStorage.setItem('userSettings', JSON.stringify(serverData.settings));
        }
        
        currentVersion = serverData.version;
        localStorage.setItem('dataVersion', currentVersion.toString());
        
        // Silently refresh UI
        if (window.loadFolders) window.loadFolders();
        if (window.loadReplayHistory) window.loadReplayHistory();
        if (window.applyUserSettings && serverData.settings) window.applyUserSettings(serverData.settings);
    }
    
    // Auto-login if user is remembered - SILENT BACKGROUND SYNC
    function autoLogin() {
        if (currentUser && rememberLogin) {
            console.log('Auto-logging in user:', currentUser);
            updateAccountButton();
            startRealTimeSync();
            
            // Silent background sync - no loading screen
            fetch('/api/get_user_data', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: currentUser, version: currentVersion})
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Silently update data in background
                    const serverFolders = result.user.folders || [];
                    const serverReplays = result.user.replays || [];
                    const serverVersion = result.user.version || 1;
                    
                    if (serverVersion > currentVersion) {
                        localStorage.setItem('folders', JSON.stringify(serverFolders));
                        localStorage.setItem('replayHistory', JSON.stringify(serverReplays));
                        currentVersion = serverVersion;
                        localStorage.setItem('dataVersion', currentVersion.toString());
                        
                        // Silently refresh UI
                        if (window.loadFolders) window.loadFolders();
                        if (window.loadReplayHistory) window.loadReplayHistory();
                    }
                    
                    console.log('Background sync successful');
                } else {
                    // Clear invalid user
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('rememberLogin');
                    localStorage.removeItem('dataVersion');
                    currentUser = null;
                    updateAccountButton();
                }
            })
            .catch(error => {
                console.log('Background sync failed:', error);
            });
        }
    }
    
    // Start real-time sync
    function startRealTimeSync() {
        if (syncInterval) clearInterval(syncInterval);
        
        // Check for updates every 5 seconds
        syncInterval = setInterval(() => {
            checkForUpdates();
        }, 5000);
        
        // Sync data every 15 seconds
        setInterval(syncUserData, 15000);
    }
    
    // Stop real-time sync
    function stopRealTimeSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
    }
    
    // Update account button text
    function updateAccountButton() {
        if (currentUser && accountBtn) {
            accountBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser}`;
            accountBtn.onclick = showLogoutOption;
        }
    }
    
    // Show logout option when clicking username
    function showLogoutOption() {
        const confirmLogout = confirm(`Logged in as ${currentUser}\n\nDo you want to logout?`);
        if (confirmLogout) {
            logout();
        }
    }
    
    // Logout function
    function logout() {
        // Final sync before logout
        syncUserData();
        
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberLogin');
        localStorage.removeItem('dataVersion');
        
        stopRealTimeSync();
        
        if (accountBtn) {
            accountBtn.innerHTML = '<i class="fas fa-user"></i> Account';
            accountBtn.onclick = () => {
                document.getElementById('accountModal').style.display = 'flex';
            };
        }
        
        showCustomAlert('You have been logged out successfully!\nYour data has been synced to the cloud.', 'success');
    }
    
    // Initialize
    updateAccountButton();
    autoLogin();
    
    // Start sync if user is logged in
    if (currentUser) {
        startRealTimeSync();
    }
    
    // Sync on page unload
    window.addEventListener('beforeunload', syncUserData);
    
    // Loading functions - ONLY FOR MANUAL ACTIONS
    function showLoading(title, message) {
        // Only show loading for manual user actions, not auto-login
        if (title === 'Auto Login' || message.includes('auto') || message.includes('background')) {
            return; // Don't show loading for background operations
        }
        
        const modal = document.getElementById('loadingModal');
        const titleEl = document.getElementById('loadingTitle');
        const messageEl = document.getElementById('loadingMessage');
        const progressEl = document.getElementById('progressFill');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (progressEl) progressEl.style.width = '0%';
        if (modal) {
            modal.style.display = 'flex';
            modal.style.setProperty('display', 'flex', 'important');
        }
    }
    
    function hideLoading() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.style.display = 'none';
            modal.style.setProperty('display', 'none', 'important');
        }
    }
    
    function updateProgress(percent) {
        const progressEl = document.getElementById('progressFill');
        if (progressEl) progressEl.style.width = percent + '%';
    }
    
    function updateLoadingMessage(message) {
        const messageEl = document.getElementById('loadingMessage');
        if (messageEl) messageEl.textContent = message;
    }
    
    // Custom alert function
    function showCustomAlert(message, type = 'info') {
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        const title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information';
        
        // Create custom alert modal
        const alertModal = document.createElement('div');
        alertModal.className = 'modal';
        alertModal.style.display = 'flex';
        alertModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-body" style="padding: 30px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">${icon}</div>
                    <h3 style="margin: 0 0 15px 0; color: var(--text);">${title}</h3>
                    <p style="margin: 0 0 20px 0; color: var(--text-light); white-space: pre-line;">${message}</p>
                    <button class="btn primary-btn" onclick="this.closest('.modal').remove()">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(alertModal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertModal.parentNode) {
                alertModal.remove();
            }
        }, 5000);
    }
    
    // Make functions globally available
    window.syncUserData = syncUserData;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.showCustomAlert = showCustomAlert;
});