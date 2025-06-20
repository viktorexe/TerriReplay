// Mobile UI functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mobileUiToggle = document.getElementById('mobileUiToggle');
    const mobileNav = document.getElementById('mobileNav');
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    // Check if mobile UI was previously enabled
    const mobileUiEnabled = localStorage.getItem('mobileUiEnabled') === 'true';
    
    // Initialize mobile UI if previously enabled
    if (mobileUiEnabled) {
        enableMobileUI();
    }
    
    // Toggle mobile UI when button is clicked
    if (mobileUiToggle) {
        mobileUiToggle.addEventListener('click', function() {
            if (body.classList.contains('mobile-ui')) {
                disableMobileUI();
            } else {
                enableMobileUI();
            }
        });
    }
    
    // Mobile navigation
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            mobileNavItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            
            // Handle navigation
            switch (view) {
                case 'replays':
                    showReplaysView();
                    break;
                case 'folders':
                    showFoldersView();
                    break;
                case 'add':
                    openAddReplayModal();
                    break;
                case 'import':
                    document.getElementById('importFolderPopup').style.display = 'flex';
                    break;
                case 'settings':
                    toggleMobileSettings();
                    break;
            }
        });
    });
    
    // Function to enable mobile UI
    function enableMobileUI() {
        body.classList.add('mobile-ui');
        mobileNav.style.display = 'flex';
        
        if (mobileUiToggle) {
            mobileUiToggle.innerHTML = '<i class="fas fa-desktop"></i> Desktop UI';
            mobileUiToggle.title = 'Switch to Desktop UI';
        }
        
        localStorage.setItem('mobileUiEnabled', 'true');
        
        // Adjust layout for mobile
        adjustForMobile();
    }
    
    // Function to disable mobile UI
    function disableMobileUI() {
        body.classList.remove('mobile-ui');
        mobileNav.style.display = 'none';
        
        if (mobileUiToggle) {
            mobileUiToggle.innerHTML = '<i class="fas fa-mobile-alt"></i> Mobile UI';
            mobileUiToggle.title = 'Switch to Mobile UI';
        }
        
        localStorage.setItem('mobileUiEnabled', 'false');
        
        // Reset any mobile-specific adjustments
        resetFromMobile();
    }
    
    // Function to adjust layout for mobile
    function adjustForMobile() {
        // Move quick replay input to be more prominent
        const quickReplayInput = document.querySelector('.quick-replay-input');
        if (quickReplayInput) {
            quickReplayInput.style.position = 'sticky';
            quickReplayInput.style.top = '0';
            quickReplayInput.style.zIndex = '10';
        }
        
        // Simplify buttons
        document.querySelectorAll('.replay-actions button, .folder-actions button').forEach(btn => {
            const icon = btn.querySelector('i');
            const text = btn.textContent.trim();
            if (icon && text) {
                btn.innerHTML = icon.outerHTML;
                btn.title = text;
            }
        });
    }
    
    // Function to reset from mobile adjustments
    function resetFromMobile() {
        // Reset quick replay input
        const quickReplayInput = document.querySelector('.quick-replay-input');
        if (quickReplayInput) {
            quickReplayInput.style.position = '';
            quickReplayInput.style.top = '';
            quickReplayInput.style.zIndex = '';
        }
        
        // Reload page to reset all changes
        window.location.reload();
    }
    
    // Function to show replays view
    function showReplaysView() {
        // Hide folders section, show replays section
        const foldersSection = document.querySelector('.folders-grid').closest('.section-header').parentNode;
        const replaysSection = document.querySelector('.replays-grid').closest('.section-header').parentNode;
        
        foldersSection.style.display = 'none';
        replaysSection.style.display = 'block';
    }
    
    // Function to show folders view
    function showFoldersView() {
        // Show folders section, hide replays section
        const foldersSection = document.querySelector('.folders-grid').closest('.section-header').parentNode;
        const replaysSection = document.querySelector('.replays-grid').closest('.section-header').parentNode;
        
        foldersSection.style.display = 'block';
        replaysSection.style.display = 'none';
    }
    
    // Function to open add replay modal
    function openAddReplayModal() {
        const newReplayModal = document.getElementById('newReplayModal');
        if (newReplayModal) {
            newReplayModal.style.display = 'flex';
        }
    }
    
    // Function to open import folder modal
    function openImportFolderModal() {
        const importFolderPopup = document.getElementById('importFolderPopup');
        if (importFolderPopup) {
            importFolderPopup.style.display = 'flex';
        }
    }
    
    // Function to toggle mobile settings
    function toggleMobileSettings() {
        // Toggle sidebar content visibility
        if (sidebar.querySelector('.sidebar-content').style.display === 'block') {
            sidebar.querySelector('.sidebar-content').style.display = 'none';
        } else {
            sidebar.querySelector('.sidebar-content').style.display = 'block';
        }
    }
});