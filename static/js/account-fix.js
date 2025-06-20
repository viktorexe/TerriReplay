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
                
                // Show custom loading prompt
                const loadingModal = document.createElement('div');
                loadingModal.className = 'modal custom-loading-modal';
                loadingModal.style.display = 'flex';
                loadingModal.style.position = 'fixed';
                loadingModal.style.top = '0';
                loadingModal.style.left = '0';
                loadingModal.style.width = '100%';
                loadingModal.style.height = '100%';
                loadingModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                loadingModal.style.zIndex = '9999';
                loadingModal.style.justifyContent = 'center';
                loadingModal.style.alignItems = 'center';
                
                loadingModal.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
                        <div style="width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                        <h3 style="margin: 0 0 10px 0;">Logging In</h3>
                        <p style="margin: 0;">Please wait while we verify your credentials...</p>
                    </div>
                `;
                
                // Add animation style if not already added
                if (!document.querySelector('style[data-spin-animation]')) {
                    const style = document.createElement('style');
                    style.setAttribute('data-spin-animation', 'true');
                    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(loadingModal);
                
                fetch('/api/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                })
                .then(response => response.json())
                .then(result => {
                    // Remove loading modal
                    document.body.removeChild(loadingModal);
                    
                    if (result.success) {
                        localStorage.setItem('currentUser', username);
                        localStorage.setItem('rememberLogin', 'true');
                        
                        // Store data
                        localStorage.setItem('folders', JSON.stringify(result.user.folders || []));
                        localStorage.setItem('replayHistory', JSON.stringify(result.user.replays || []));
                        localStorage.setItem('dataVersion', (result.user.version || 1).toString());
                        
                        document.getElementById('loginModal').style.display = 'none';
                        
                        // Show success message
                        const successModal = document.createElement('div');
                        successModal.className = 'modal';
                        successModal.style.display = 'flex';
                        successModal.style.position = 'fixed';
                        successModal.style.top = '0';
                        successModal.style.left = '0';
                        successModal.style.width = '100%';
                        successModal.style.height = '100%';
                        successModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        successModal.style.zIndex = '9999';
                        successModal.style.justifyContent = 'center';
                        successModal.style.alignItems = 'center';
                        
                        successModal.innerHTML = `
                            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
                                <div style="font-size: 50px; color: #4CAF50; margin-bottom: 20px;">✓</div>
                                <h3 style="margin: 0 0 10px 0;">Login Successful!</h3>
                                <p style="margin: 0 0 20px 0;">Welcome back, ${username}!</p>
                                <button style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Continue</button>
                            </div>
                        `;
                        
                        document.body.appendChild(successModal);
                        
                        // Handle continue button
                        const continueBtn = successModal.querySelector('button');
                        continueBtn.onclick = function() {
                            document.body.removeChild(successModal);
                            location.reload();
                        };
                    } else {
                        alert(result.message || 'Login failed');
                    }
                })
                .catch(error => {
                    // Remove loading modal
                    document.body.removeChild(loadingModal);
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
                
                // Show custom loading prompt
                const loadingModal = document.createElement('div');
                loadingModal.className = 'modal custom-loading-modal';
                loadingModal.style.display = 'flex';
                loadingModal.style.position = 'fixed';
                loadingModal.style.top = '0';
                loadingModal.style.left = '0';
                loadingModal.style.width = '100%';
                loadingModal.style.height = '100%';
                loadingModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                loadingModal.style.zIndex = '9999';
                loadingModal.style.justifyContent = 'center';
                loadingModal.style.alignItems = 'center';
                
                loadingModal.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
                        <div style="width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                        <h3 style="margin: 0 0 10px 0;">Creating Account</h3>
                        <p style="margin: 0;">Please wait while we set up your account...</p>
                    </div>
                `;
                
                // Add animation style
                const style = document.createElement('style');
                style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
                
                document.body.appendChild(loadingModal);
                
                fetch('/api/create_account', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                })
                .then(response => response.json())
                .then(result => {
                    // Remove loading modal
                    document.body.removeChild(loadingModal);
                    
                    if (result.success) {
                        document.getElementById('createAccountModal').style.display = 'none';
                        
                        // Show success message
                        const successModal = document.createElement('div');
                        successModal.className = 'modal';
                        successModal.style.display = 'flex';
                        successModal.style.position = 'fixed';
                        successModal.style.top = '0';
                        successModal.style.left = '0';
                        successModal.style.width = '100%';
                        successModal.style.height = '100%';
                        successModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        successModal.style.zIndex = '9999';
                        successModal.style.justifyContent = 'center';
                        successModal.style.alignItems = 'center';
                        
                        successModal.innerHTML = `
                            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
                                <div style="font-size: 50px; color: #4CAF50; margin-bottom: 20px;">✓</div>
                                <h3 style="margin: 0 0 10px 0;">Account Created!</h3>
                                <p style="margin: 0 0 20px 0;">Welcome to TerriReplay, ${username}!<br>Your account has been created successfully.</p>
                                <button style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Continue to Login</button>
                            </div>
                        `;
                        
                        document.body.appendChild(successModal);
                        
                        // Handle continue button
                        const continueBtn = successModal.querySelector('button');
                        continueBtn.onclick = function() {
                            document.body.removeChild(successModal);
                            
                            // Pre-fill login form
                            document.getElementById('loginUsername').value = username;
                            document.getElementById('loginModal').style.display = 'flex';
                        };
                    } else {
                        alert(result.message || 'Account creation failed');
                    }
                })
                .catch(error => {
                    // Remove loading modal
                    document.body.removeChild(loadingModal);
                    alert('Account creation failed. Please check your connection and try again.');
                });
                
                return false;
            };
        }
    }
});