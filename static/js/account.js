// Account Management
document.addEventListener('DOMContentLoaded', function() {
    let currentUser = localStorage.getItem('currentUser');
    let rememberLogin = localStorage.getItem('rememberLogin') === 'true';
    
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
                    
                    // Load user data and merge with local data
                    const serverFolders = result.user.folders || [];
                    const serverReplays = result.user.replays || [];
                    const localFolders = JSON.parse(localStorage.getItem('folders') || '[]');
                    const localReplays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
                    
                    // Merge data
                    const finalFolders = serverFolders.length > 0 ? serverFolders : localFolders;
                    const finalReplays = serverReplays.length > 0 ? serverReplays : localReplays;
                    
                    localStorage.setItem('folders', JSON.stringify(finalFolders));
                    localStorage.setItem('replayHistory', JSON.stringify(finalReplays));
                    
                    updateProgress(100);
                    
                    // Refresh UI
                    if (window.loadFolders) window.loadFolders();
                    if (window.loadReplayHistory) window.loadReplayHistory();
                    
                    setTimeout(() => {
                        hideLoading();
                        document.getElementById('loginModal').style.display = 'none';
                        showCustomAlert(`Welcome back, ${username}!\nLoaded ${finalReplays.length} replays and ${finalFolders.length} folders.`, 'success');
                        updateAccountButton();
                        setTimeout(syncUserData, 1000);
                    }, 500);
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
                        showCustomAlert(`Welcome to TerriReplay, ${username}!\nYour account has been created successfully.\nPlease login to continue.`, 'success');
                        
                        // Pre-fill login form
                        document.getElementById('loginUsername').value = username;
                        document.getElementById('loginModal').style.display = 'flex';
                    }, 800);
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
    
    // Auto-sync data when user makes changes
    function syncUserData() {
        if (!currentUser) return;
        
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const replays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        
        console.log(`Syncing ${replays.length} replays and ${folders.length} folders for ${currentUser}`);
        
        fetch('/api/sync_data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: currentUser,
                folders: folders,
                replays: replays
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                console.log('Sync successful:', result.message);
            } else {
                console.error('Sync failed:', result.message);
            }
        })
        .catch(error => console.error('Sync error:', error));
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
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberLogin');
        
        if (accountBtn) {
            accountBtn.innerHTML = '<i class="fas fa-user"></i> Account';
            accountBtn.onclick = () => {
                document.getElementById('accountModal').style.display = 'flex';
            };
        }
        
        showCustomAlert('You have been logged out successfully!\nYour data has been synced to the cloud.', 'success');
    }
    
    // Auto-login if user is remembered
    function autoLogin() {
        if (currentUser && rememberLogin) {
            console.log('Auto-logging in user:', currentUser);
            // Load user data from server
            fetch('/api/get_user_data', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: currentUser})
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Load user data
                    const serverFolders = result.user.folders || [];
                    const serverReplays = result.user.replays || [];
                    
                    if (serverFolders.length > 0 || serverReplays.length > 0) {
                        localStorage.setItem('folders', JSON.stringify(serverFolders));
                        localStorage.setItem('replayHistory', JSON.stringify(serverReplays));
                        
                        // Refresh UI
                        if (window.loadFolders) window.loadFolders();
                        if (window.loadReplayHistory) window.loadReplayHistory();
                    }
                    
                    updateAccountButton();
                    console.log('Auto-login successful');
                } else {
                    // Clear invalid user
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('rememberLogin');
                    currentUser = null;
                }
            })
            .catch(error => {
                console.log('Auto-login failed:', error);
            });
        }
    }
    
    // Initialize
    updateAccountButton();
    autoLogin();
    
    // Sync data periodically
    setInterval(syncUserData, 30000); // Every 30 seconds
    
    // Sync on page unload
    window.addEventListener('beforeunload', syncUserData);
    
    // Loading functions
    function showLoading(title, message) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMessage').textContent = message;
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('loadingModal').style.display = 'flex';
    }
    
    function hideLoading() {
        document.getElementById('loadingModal').style.display = 'none';
    }
    
    function updateProgress(percent) {
        document.getElementById('progressFill').style.width = percent + '%';
    }
    
    function updateLoadingMessage(message) {
        document.getElementById('loadingMessage').textContent = message;
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