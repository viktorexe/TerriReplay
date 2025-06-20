// Mobile UI - Lightweight and Precise
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.getElementById('mobileUiToggle');
    const body = document.body;
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    // Check saved UI preference
    let isMobileMode = localStorage.getItem('uiMode') === 'mobile';
    
    // Initialize UI based on saved preference
    if (isMobileMode) {
        body.classList.add('mobile-ui-active');
        mobileToggle.innerHTML = '<i class="fas fa-desktop"></i> Desktop UI';
        setupMobileNavigation();
        showMobileScreen('replays');
    } else {
        // Ensure desktop mode is properly initialized
        body.classList.remove('mobile-ui-active', 'mobile-ui');
        mobileToggle.innerHTML = '<i class="fas fa-mobile-alt"></i> Mobile UI';
        showDesktopView();
    }
    
    // Toggle mobile UI
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            isMobileMode = !isMobileMode;
            
            if (isMobileMode) {
                body.classList.add('mobile-ui-active');
                body.classList.remove('mobile-ui'); // Remove old mobile class if present
                mobileToggle.innerHTML = '<i class="fas fa-desktop"></i> Desktop UI';
                setupMobileNavigation();
                showMobileScreen('replays');
                localStorage.setItem('uiMode', 'mobile');
            } else {
                body.classList.remove('mobile-ui-active', 'mobile-ui');
                mobileToggle.innerHTML = '<i class="fas fa-mobile-alt"></i> Mobile UI';
                showDesktopView();
                localStorage.setItem('uiMode', 'desktop');
            }
        });
    }
    
    // Setup mobile navigation
    function setupMobileNavigation() {
        if (!mobileNav) return;
        
        // Show mobile nav
        mobileNav.style.display = 'flex';
        
        // Handle navigation clicks
        mobileNavItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                mobileNavItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Handle navigation
                const view = this.getAttribute('data-view');
                handleMobileNavigation(view);
            });
        });
        
        // Setup mobile screen interactions
        setupMobileScreens();
    }
    
    // Setup mobile screens
    function setupMobileScreens() {
        // Add screen buttons
        const mobileAddReplay = document.getElementById('mobileAddReplay');
        const mobileAddFolder = document.getElementById('mobileAddFolder');
        const mobileThemeSettings = document.getElementById('mobileThemeSettings');
        const mobileDesktopMode = document.getElementById('mobileDesktopMode');
        
        if (mobileAddReplay) {
            mobileAddReplay.addEventListener('click', function() {
                const newReplayModal = document.getElementById('newReplayModal');
                if (newReplayModal) {
                    newReplayModal.style.display = 'flex';
                }
            });
        }
        
        if (mobileAddFolder) {
            mobileAddFolder.addEventListener('click', function() {
                const newFolderModal = document.getElementById('newFolderModal');
                if (newFolderModal) {
                    newFolderModal.style.display = 'flex';
                }
            });
        }
        
        if (mobileThemeSettings) {
            mobileThemeSettings.addEventListener('click', function() {
                const themeOptionsModal = document.getElementById('themeOptionsModal');
                if (themeOptionsModal) {
                    themeOptionsModal.style.display = 'flex';
                }
            });
        }
        
        if (mobileDesktopMode) {
            mobileDesktopMode.addEventListener('click', function() {
                // Switch back to desktop mode
                isMobileMode = false;
                body.classList.remove('mobile-ui-active', 'mobile-ui');
                mobileToggle.innerHTML = '<i class="fas fa-mobile-alt"></i> Mobile UI';
                showDesktopView();
                localStorage.setItem('uiMode', 'desktop');
            });
        }
    }
    
    // Handle mobile navigation
    function handleMobileNavigation(view) {
        showMobileScreen(view);
    }
    
    // Show mobile screen
    function showMobileScreen(screenName) {
        // Hide all screens
        const allScreens = document.querySelectorAll('.mobile-screen');
        allScreens.forEach(screen => screen.classList.remove('active'));
        
        // Hide desktop view
        const libraryView = document.getElementById('libraryView');
        if (libraryView) {
            libraryView.style.display = 'none';
        }
        
        // Show selected screen
        const targetScreen = document.getElementById(`mobile${screenName.charAt(0).toUpperCase() + screenName.slice(1)}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Populate screen content
        if (screenName === 'replays') {
            populateMobileReplays();
        } else if (screenName === 'folders') {
            populateMobileFolders();
        }
    }
    
    // Show desktop view
    function showDesktopView() {
        // Hide all mobile screens
        const allScreens = document.querySelectorAll('.mobile-screen');
        allScreens.forEach(screen => screen.classList.remove('active'));
        
        // Hide mobile navigation
        if (mobileNav) {
            mobileNav.style.display = 'none';
        }
        
        // Show desktop library view
        const libraryView = document.getElementById('libraryView');
        if (libraryView) {
            libraryView.style.display = 'block';
            libraryView.classList.add('active');
        }
        
        // Ensure proper body overflow for desktop
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    }
    
    // Populate mobile replays
    function populateMobileReplays() {
        const mobileReplaysGrid = document.getElementById('mobileReplaysGrid');
        const desktopReplaysGrid = document.getElementById('replaysGrid');
        
        if (mobileReplaysGrid && desktopReplaysGrid) {
            mobileReplaysGrid.innerHTML = desktopReplaysGrid.innerHTML;
        }
    }
    
    // Populate mobile folders
    function populateMobileFolders() {
        const mobileFoldersGrid = document.getElementById('mobileFoldersGrid');
        const desktopFoldersGrid = document.getElementById('foldersGrid');
        
        if (mobileFoldersGrid && desktopFoldersGrid) {
            mobileFoldersGrid.innerHTML = desktopFoldersGrid.innerHTML;
            
            // Re-attach folder click events for mobile
            const mobileFolderCards = mobileFoldersGrid.querySelectorAll('.folder-card:not(.create-folder-card)');
            mobileFolderCards.forEach(folderCard => {
                const folderIcon = folderCard.querySelector('.folder-icon');
                const folderTitle = folderCard.querySelector('.folder-title');
                
                if (folderIcon) {
                    folderIcon.addEventListener('click', () => {
                        const folderId = folderCard.querySelector('.edit-folder').getAttribute('data-id');
                        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                        const folder = folders.find(f => f.id === folderId);
                        if (folder && window.openFolderView) {
                            window.openFolderView(folder);
                        }
                    });
                }
                
                if (folderTitle) {
                    folderTitle.addEventListener('click', () => {
                        const folderId = folderCard.querySelector('.edit-folder').getAttribute('data-id');
                        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                        const folder = folders.find(f => f.id === folderId);
                        if (folder && window.openFolderView) {
                            window.openFolderView(folder);
                        }
                    });
                }
            });
        }
    }
    
    // Handle modal close in mobile mode
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || e.target.classList.contains('cancel-modal')) {
            // Reset mobile nav to replays when closing modals
            if (isMobileMode) {
                mobileNavItems.forEach(nav => nav.classList.remove('active'));
                const replaysNav = document.querySelector('.mobile-nav-item[data-view="replays"]');
                if (replaysNav) {
                    replaysNav.classList.add('active');
                }
                showMobileScreen('replays');
                
                // Show mobile nav again if game modal was closed
                if (e.target.closest('#gameModal')) {
                    const mobileNav = document.getElementById('mobileNav');
                    if (mobileNav) {
                        mobileNav.style.display = 'flex';
                    }
                }
            }
        }
    });
    
    // Handle game modal opening
    const gameModal = document.getElementById('gameModal');
    if (gameModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isOpen = gameModal.style.display === 'flex';
                    const mobileNav = document.getElementById('mobileNav');
                    
                    if (isMobileMode && mobileNav) {
                        if (isOpen) {
                            // Hide mobile nav when game opens
                            mobileNav.style.display = 'none';
                            // Prevent body scroll
                            document.body.style.overflow = 'hidden';
                        } else {
                            // Show mobile nav when game closes
                            mobileNav.style.display = 'flex';
                            // Restore body scroll
                            document.body.style.overflow = '';
                        }
                    }
                }
            });
        });
        
        observer.observe(gameModal, { attributes: true });
    }
    
    // Prevent zoom on input focus (mobile)
    if (isMobileMode) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.fontSize = '16px';
            });
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        if (isMobileMode) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
    });
    
    // Sync mobile and desktop content
    function syncContent() {
        if (isMobileMode) {
            // Get current active screen
            const activeScreen = document.querySelector('.mobile-screen.active');
            if (activeScreen) {
                if (activeScreen.id === 'mobileReplaysScreen') {
                    populateMobileReplays();
                } else if (activeScreen.id === 'mobileFoldersScreen') {
                    populateMobileFolders();
                }
            }
        }
    }
    
    // Listen for content updates
    const observer = new MutationObserver(syncContent);
    const desktopReplaysGrid = document.getElementById('replaysGrid');
    const desktopFoldersGrid = document.getElementById('foldersGrid');
    
    if (desktopReplaysGrid) {
        observer.observe(desktopReplaysGrid, { childList: true, subtree: true });
    }
    
    if (desktopFoldersGrid) {
        observer.observe(desktopFoldersGrid, { childList: true, subtree: true });
    }
});