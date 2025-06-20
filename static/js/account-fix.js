// Fix account button click issues
document.addEventListener('DOMContentLoaded', function() {
    // Direct fix for account button
    setTimeout(fixAccountButton, 500);
    setTimeout(fixAccountButton, 1000);
    setTimeout(fixAccountButton, 2000);
    
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
    }
});