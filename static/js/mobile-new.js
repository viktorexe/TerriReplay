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
                document.getElementById('newReplayModal').style.display = 'flex';
            });
        }
        
        if (mobileAddFolder) {
            mobileAddFolder.addEventListener('click', function() {
                document.getElementById('newFolderModal').style.display = 'flex';
            });
        }
        
        if (mobileThemeSettings) {
            mobileThemeSettings.addEventListener('click', function() {
                document.getElementById('themeOptionsModal').style.display = 'flex';
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
    
    // Populate mobile folders - FIXED VERSION
    function populateMobileFolders() {
        const mobileFoldersGrid = document.getElementById('mobileFoldersGrid');
        if (!mobileFoldersGrid) return;
        
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        mobileFoldersGrid.innerHTML = '';
        
        // Add create folder card
        const createCard = document.createElement('div');
        createCard.className = 'create-folder-card';
        createCard.innerHTML = `
            <div class="folder-icon">
                <i class="fas fa-plus"></i>
            </div>
            <div class="folder-info">
                <div class="folder-title">Create Folder</div>
            </div>
        `;
        createCard.addEventListener('click', () => {
            document.getElementById('newFolderModal').style.display = 'flex';
        });
        mobileFoldersGrid.appendChild(createCard);
        
        // Add folder cards
        folders.forEach(folder => {
            const replayCount = replayHistory.filter(r => r.folderId === folder.id).length;
            const replayText = replayCount === 1 ? '1 replay' : `${replayCount} replays`;
            
            const folderCard = document.createElement('div');
            folderCard.className = 'folder-card';
            folderCard.innerHTML = `
                <div class="folder-icon" style="color: ${folder.color}">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="folder-info">
                    <div class="folder-title">${folder.name}</div>
                    <div class="folder-count">${replayText}</div>
                    <div class="folder-actions">
                        <button class="edit-folder" data-id="${folder.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-folder" data-id="${folder.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            // Add click handlers for opening folder
            const folderIcon = folderCard.querySelector('.folder-icon');
            const folderTitle = folderCard.querySelector('.folder-title');
            
            folderIcon.addEventListener('click', () => {
                if (window.openFolderView) {
                    window.openFolderView(folder);
                }
            });
            
            folderTitle.addEventListener('click', () => {
                if (window.openFolderView) {
                    window.openFolderView(folder);
                }
            });
            
            mobileFoldersGrid.appendChild(folderCard);
        });
    }
    
    // Handle modal close in mobile mode
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || e.target.classList.contains('cancel-modal')) {
            if (isMobileMode) {
                const mobileNav = document.getElementById('mobileNav');
                if (mobileNav) {
                    mobileNav.style.display = 'flex';
                }
                
                // If closing folder view modal, go back to folders screen
                if (e.target.closest('#folderViewModal')) {
                    mobileNavItems.forEach(nav => nav.classList.remove('active'));
                    const foldersNav = document.querySelector('.mobile-nav-item[data-view="folders"]');
                    if (foldersNav) {
                        foldersNav.classList.add('active');
                    }
                    showMobileScreen('folders');
                } else {
                    // For other modals, go to replays screen
                    mobileNavItems.forEach(nav => nav.classList.remove('active'));
                    const replaysNav = document.querySelector('.mobile-nav-item[data-view="replays"]');
                    if (replaysNav) {
                        replaysNav.classList.add('active');
                    }
                    showMobileScreen('replays');
                }
            }
        }
    });
    
    // Handle modal opening (game and folder view)
    const gameModal = document.getElementById('gameModal');
    const folderViewModal = document.getElementById('folderViewModal');
    
    function handleModalVisibility(modal) {
        if (modal) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const isOpen = modal.style.display === 'flex';
                        const mobileNav = document.getElementById('mobileNav');
                        
                        if (isMobileMode && mobileNav) {
                            if (isOpen) {
                                mobileNav.style.display = 'none';
                                document.body.style.overflow = 'hidden';
                            } else {
                                mobileNav.style.display = 'flex';
                                document.body.style.overflow = '';
                            }
                        }
                    }
                });
            });
            
            observer.observe(modal, { attributes: true });
        }
    }
    
    handleModalVisibility(gameModal);
    handleModalVisibility(folderViewModal);
    
    // Sync mobile and desktop content
    function syncContent() {
        if (isMobileMode) {
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