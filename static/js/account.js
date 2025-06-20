// Account Management
document.addEventListener('DOMContentLoaded', function() {
    let currentUser = localStorage.getItem('currentUser');
    
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
                alert('Please enter username and password');
                return;
            }
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentUser = username;
                    localStorage.setItem('currentUser', username);
                    
                    // Load user data and merge with local data
                    const serverFolders = result.user.folders || [];
                    const serverReplays = result.user.replays || [];
                    const localFolders = JSON.parse(localStorage.getItem('folders') || '[]');
                    const localReplays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
                    
                    // Merge data (server takes precedence, but keep local if server is empty)
                    const finalFolders = serverFolders.length > 0 ? serverFolders : localFolders;
                    const finalReplays = serverReplays.length > 0 ? serverReplays : localReplays;
                    
                    localStorage.setItem('folders', JSON.stringify(finalFolders));
                    localStorage.setItem('replayHistory', JSON.stringify(finalReplays));
                    
                    // Refresh UI
                    if (window.loadFolders) window.loadFolders();
                    if (window.loadReplayHistory) window.loadReplayHistory();
                    
                    // Immediate sync to ensure data is backed up
                    setTimeout(syncUserData, 1000);
                    
                    document.getElementById('loginModal').style.display = 'none';
                    alert(`Login successful! Loaded ${finalReplays.length} replays and ${finalFolders.length} folders.`);
                    updateAccountButton();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Login failed. Please try again.');
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
                alert('Please fill all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            try {
                const response = await fetch('/api/create_account', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('createAccountModal').style.display = 'none';
                    alert('Account created successfully! Please login.');
                    document.getElementById('loginModal').style.display = 'flex';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Account creation failed. Please try again.');
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
        }
    }
    
    // Initialize
    updateAccountButton();
    
    // Sync data periodically
    setInterval(syncUserData, 30000); // Every 30 seconds
    
    // Sync on page unload
    window.addEventListener('beforeunload', syncUserData);
    
    // Make sync function globally available
    window.syncUserData = syncUserData;
});