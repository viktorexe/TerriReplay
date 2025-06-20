// Fix account button click issues
document.addEventListener('DOMContentLoaded', function() {
    // Direct fix for account button
    setTimeout(fixAccountButton, 100);
    setTimeout(fixAccountButton, 500);
    setTimeout(fixAccountButton, 1000);
    setTimeout(fixAccountButton, 2000);
    
    // Also fix on any modal close
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(fixAccountButton, 100);
        });
    });
    
    function fixAccountButton() {
        console.log("Fixing account button...");
        const accountBtn = document.getElementById('accountBtn');
        
        if (accountBtn) {
            // Remove all existing event listeners
            const newAccountBtn = accountBtn.cloneNode(true);
            accountBtn.parentNode.replaceChild(newAccountBtn, accountBtn);
            
            // Add direct onclick handler
            newAccountBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Account button clicked!");
                
                const currentUser = localStorage.getItem('currentUser');
                
                if (currentUser) {
                    // Show logout confirmation
                    if (confirm(`Logged in as ${currentUser}\n\nDo you want to logout?`)) {
                        // Logout
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('rememberLogin');
                        localStorage.removeItem('dataVersion');
                        
                        // Update button
                        newAccountBtn.innerHTML = '<i class="fas fa-user"></i> Account';
                        
                        // Show success message
                        alert('You have been logged out successfully!');
                        location.reload();
                    }
                } else {
                    // Show account modal
                    document.getElementById('accountModal').style.display = 'flex';
                }
                
                return false;
            };
            
            // Update button text if logged in
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                newAccountBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser}`;
            }
        }
        
        // Also fix mobile account settings
        const mobileAccountSettings = document.getElementById('mobileAccountSettings');
        if (mobileAccountSettings) {
            const newMobileAccountSettings = mobileAccountSettings.cloneNode(true);
            mobileAccountSettings.parentNode.replaceChild(newMobileAccountSettings, mobileAccountSettings);
            
            newMobileAccountSettings.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById('accountModal').style.display = 'flex';
                return false;
            };
        }
        
        // Fix Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            const newLoginBtn = loginBtn.cloneNode(true);
            loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
            
            newLoginBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Login button clicked!");
                document.getElementById('accountModal').style.display = 'none';
                document.getElementById('loginModal').style.display = 'flex';
                return false;
            };
        }
        
        // Fix Create Account button
        const createAccountBtn = document.getElementById('createAccountBtn');
        if (createAccountBtn) {
            const newCreateAccountBtn = createAccountBtn.cloneNode(true);
            createAccountBtn.parentNode.replaceChild(newCreateAccountBtn, createAccountBtn);
            
            newCreateAccountBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Create Account button clicked!");
                document.getElementById('accountModal').style.display = 'none';
                document.getElementById('createAccountModal').style.display = 'flex';
                return false;
            };
        }
        
        // Fix Login Submit button
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        if (loginSubmitBtn) {
            const newLoginSubmitBtn = loginSubmitBtn.cloneNode(true);
            loginSubmitBtn.parentNode.replaceChild(newLoginSubmitBtn, loginSubmitBtn);
            
            newLoginSubmitBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Login Submit button clicked!");
                
                const username = document.getElementById('loginUsername').value.trim();
                const password = document.getElementById('loginPassword').value;
                
                if (!username || !password) {
                    alert('Please enter username and password');
                    return false;
                }
                
                // Show loading
                alert('Logging in... Please wait.');
                
                fetch('/api/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        localStorage.setItem('currentUser', username);
                        localStorage.setItem('rememberLogin', 'true');
                        
                        // Store data
                        localStorage.setItem('folders', JSON.stringify(result.user.folders || []));
                        localStorage.setItem('replayHistory', JSON.stringify(result.user.replays || []));
                        localStorage.setItem('dataVersion', (result.user.version || 1).toString());
                        
                        document.getElementById('loginModal').style.display = 'none';
                        alert(`Welcome back, ${username}!`);
                        location.reload();
                    } else {
                        alert(result.message || 'Login failed');
                    }
                })
                .catch(error => {
                    alert('Login failed. Please check your connection and try again.');
                });
                
                return false;
            };
        }
        
        // Fix Create Account Submit button
        const createAccountSubmitBtn = document.getElementById('createAccountSubmitBtn');
        if (createAccountSubmitBtn) {
            const newCreateAccountSubmitBtn = createAccountSubmitBtn.cloneNode(true);
            createAccountSubmitBtn.parentNode.replaceChild(newCreateAccountSubmitBtn, createAccountSubmitBtn);
            
            newCreateAccountSubmitBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Create Account Submit button clicked!");
                
                const username = document.getElementById('createUsername').value.trim();
                const password = document.getElementById('createPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (!username || !password || !confirmPassword) {
                    alert('Please fill all fields');
                    return false;
                }
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return false;
                }
                
                if (password.length < 6) {
                    alert('Password must be at least 6 characters');
                    return false;
                }
                
                // Show loading
                alert('Creating account... Please wait.');
                
                fetch('/api/create_account', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        document.getElementById('createAccountModal').style.display = 'none';
                        alert(`Welcome to TerriReplay, ${username}!\nYour account has been created successfully.\nPlease login to continue.`);
                        
                        // Pre-fill login form
                        document.getElementById('loginUsername').value = username;
                        document.getElementById('loginModal').style.display = 'flex';
                    } else {
                        alert(result.message || 'Account creation failed');
                    }
                })
                .catch(error => {
                    alert('Account creation failed. Please check your connection and try again.');
                });
                
                return false;
            };
        }
    }
});