// Mobile Replay Buttons Fix
document.addEventListener('DOMContentLoaded', function() {
    
    // Function to add event listeners to mobile replay buttons
    function addMobileReplayListeners() {
        const mobileReplaysGrid = document.getElementById('mobileReplaysGrid');
        if (mobileReplaysGrid) {
            // Use event delegation for dynamically added content
            mobileReplaysGrid.addEventListener('click', function(e) {
                const target = e.target;
                const button = target.closest('button');
                if (!button) return;
                
                e.stopPropagation();
                e.preventDefault();
                
                if (button.classList.contains('play-replay')) {
                    handlePlayReplay(button);
                } else if (button.classList.contains('edit-replay')) {
                    handleEditReplay(button);
                } else if (button.classList.contains('delete-replay')) {
                    handleDeleteReplay(button);
                }
            });
        }
    }
    
    // Function to add event listeners to mobile folder buttons
    function addMobileFolderListeners() {
        const mobileFoldersGrid = document.getElementById('mobileFoldersGrid');
        if (mobileFoldersGrid) {
            // Use event delegation for dynamically added content
            mobileFoldersGrid.addEventListener('click', function(e) {
                const target = e.target;
                const button = target.closest('button');
                
                if (!button) {
                    // Check if clicked on create folder card
                    const createCard = target.closest('.create-folder-card');
                    if (createCard) {
                        e.stopPropagation();
                        e.preventDefault();
                        openNewFolderModal();
                        return;
                    }
                    return;
                }
                
                e.stopPropagation();
                e.preventDefault();
                
                if (button.classList.contains('edit-folder')) {
                    handleEditFolder(button);
                } else if (button.classList.contains('delete-folder')) {
                    handleDeleteFolder(button);
                }
            });
        }
    }
    
    // Handle create folder
    function openNewFolderModal() {
        const newFolderModal = document.getElementById('newFolderModal');
        const folderNameInput = document.getElementById('folderName');
        
        if (newFolderModal) {
            if (folderNameInput) folderNameInput.value = '';
            newFolderModal.style.display = 'flex';
        }
    }
    
    // Handle edit folder
    function handleEditFolder(button) {
        const folderId = button.getAttribute('data-id');
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const folder = folders.find(f => f.id === folderId);
        
        if (folder) {
            const editFolderModal = document.getElementById('editFolderModal');
            const editFolderNameInput = document.getElementById('editFolderName');
            
            if (editFolderModal && editFolderNameInput) {
                localStorage.setItem('currentEditingFolderId', folder.id);
                editFolderNameInput.value = folder.name;
                editFolderModal.style.display = 'flex';
            }
        }
    }
    
    // Handle delete folder
    function handleDeleteFolder(button) {
        const folderId = button.getAttribute('data-id');
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const folder = folders.find(f => f.id === folderId);
        
        if (folder) {
            const confirmDelete = confirm(`Delete "${folder.name}"?\n\nAll replays will be moved to "No Folder".\nThis action cannot be undone.`);
            
            if (confirmDelete) {
                // Move replays to no folder
                let replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
                replayHistory = replayHistory.map(replay => {
                    if (replay.folderId === folderId) {
                        return { ...replay, folderId: null };
                    }
                    return replay;
                });
                localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
                
                // Remove folder
                const updatedFolders = folders.filter(f => f.id !== folderId);
                localStorage.setItem('folders', JSON.stringify(updatedFolders));
                
                // Refresh mobile folders
                setTimeout(() => {
                    populateMobileFolders();
                }, 100);
            }
        }
    }
    
    // Create folder functionality
    function setupCreateFolderButton() {
        const saveFolderBtn = document.getElementById('saveFolderBtn');
        if (saveFolderBtn) {
            // Remove existing listeners and add new one
            const newSaveBtn = saveFolderBtn.cloneNode(true);
            saveFolderBtn.parentNode.replaceChild(newSaveBtn, saveFolderBtn);
            
            newSaveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const folderNameInput = document.getElementById('folderName');
                const name = folderNameInput ? folderNameInput.value.trim() : '';
                
                if (!name) {
                    alert('Please enter a folder name');
                    return;
                }
                
                const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                
                if (folders.length >= 10) {
                    alert('You can only create up to 10 folders');
                    return;
                }
                
                const newFolder = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    name: name,
                    color: '#4a6bff',
                    createdAt: new Date().toISOString()
                };
                
                folders.push(newFolder);
                localStorage.setItem('folders', JSON.stringify(folders));
                
                // Close modal
                const newFolderModal = document.getElementById('newFolderModal');
                if (newFolderModal) newFolderModal.style.display = 'none';
                
                // Clear form
                if (folderNameInput) folderNameInput.value = '';
                
                // Refresh page
                window.location.reload();
            });
        }
    }
    
    // Handle play replay
    function handlePlayReplay(button) {
        const replayCard = button.closest('.replay-card');
        const replayTitle = replayCard.querySelector('.replay-title').textContent;
        
        // Get replay data from localStorage
        const replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        const replay = replayHistory.find(r => r.name === replayTitle);
        
        if (replay) {
            console.log('Playing replay:', replay.name);
            playReplay(replay.link, replay.name);
        }
    }
    
    // Handle edit replay
    function handleEditReplay(button) {
        const replayCard = button.closest('.replay-card');
        const replayTitle = replayCard.querySelector('.replay-title').textContent;
        
        // Get replay data from localStorage
        const replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        const replay = replayHistory.find(r => r.name === replayTitle);
        
        if (replay) {
            console.log('Editing replay:', replay.name);
            openEditReplayModal(replay);
        }
    }
    
    // Handle delete replay
    function handleDeleteReplay(button) {
        const replayCard = button.closest('.replay-card');
        const replayTitle = replayCard.querySelector('.replay-title').textContent;
        
        // Get replay data from localStorage
        let replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        const replayIndex = replayHistory.findIndex(r => r.name === replayTitle);
        
        if (replayIndex !== -1) {
            const confirmDelete = confirm(`Delete "${replayTitle}"?\n\nThis action cannot be undone.`);
            
            if (confirmDelete) {
                console.log('Deleting replay:', replayTitle);
                replayHistory.splice(replayIndex, 1);
                localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
                
                // Refresh mobile replays
                setTimeout(() => {
                    populateMobileReplays();
                }, 100);
            }
        }
    }
    
    // Play replay function - trigger desktop play button directly
    function playReplay(replayLink, replayName) {
        // Find the corresponding desktop replay card and trigger its play button
        const desktopReplaysGrid = document.getElementById('replaysGrid');
        if (desktopReplaysGrid) {
            const desktopReplayCards = desktopReplaysGrid.querySelectorAll('.replay-card');
            for (const card of desktopReplayCards) {
                const titleElement = card.querySelector('.replay-title');
                if (titleElement && titleElement.textContent.trim() === replayName.trim()) {
                    const playButton = card.querySelector('.play-replay');
                    if (playButton) {
                        console.log('Triggering desktop play button for:', replayName);
                        playButton.click();
                        return;
                    }
                }
            }
        }
        
        // Fallback: direct game modal approach without saving to history
        console.log('Using direct game modal approach');
        const gameModal = document.getElementById('gameModal');
        const gameFrame = document.getElementById('gameFrame');
        const gameTitle = document.getElementById('gameTitle');
        
        if (gameTitle) gameTitle.textContent = replayName || 'Replay';
        if (gameModal) gameModal.style.display = 'flex';
        
        // Use the main.js playReplay function if available
        if (window.playReplay && typeof window.playReplay === 'function') {
            window.playReplay(replayLink, replayName);
        } else {
            alert('Unable to play replay. Please try from desktop view.');
        }
    }
    
    // Open edit replay modal
    function openEditReplayModal(replay) {
        const editReplayModal = document.getElementById('editReplayModal');
        const editReplayNameInput = document.getElementById('editReplayName');
        const editReplayFolderSelect = document.getElementById('editReplayFolder');
        
        if (editReplayModal && editReplayNameInput) {
            localStorage.setItem('currentEditingReplayId', replay.id);
            editReplayNameInput.value = replay.name || '';
            if (editReplayFolderSelect) {
                editReplayFolderSelect.value = replay.folderId || '';
            }
            editReplayModal.style.display = 'flex';
        }
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
        }
    }
    
    // Initialize
    addMobileReplayListeners();
    addMobileFolderListeners();
    setupCreateFolderButton();
    
    // Re-add listeners when content is updated
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                if (mutation.target.id === 'mobileReplaysGrid' || mutation.target.id === 'mobileFoldersGrid') {
                    // Content updated, listeners are handled by event delegation
                }
            }
        });
    });
    
    const mobileReplaysGrid = document.getElementById('mobileReplaysGrid');
    const mobileFoldersGrid = document.getElementById('mobileFoldersGrid');
    
    if (mobileReplaysGrid) {
        observer.observe(mobileReplaysGrid, { childList: true, subtree: true });
    }
    
    if (mobileFoldersGrid) {
        observer.observe(mobileFoldersGrid, { childList: true, subtree: true });
    }
});