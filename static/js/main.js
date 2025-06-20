document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const views = document.querySelectorAll('.view');
    
    // DOM Elements - Library
    const replaysGrid = document.getElementById('replaysGrid');
    const foldersGrid = document.getElementById('foldersGrid');
    const searchInput = document.getElementById('searchInput');
    const sortItemsBtn = document.getElementById('sortItemsBtn');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const createFolderCard = document.getElementById('createFolderCard');
    const quickReplayLink = document.getElementById('quickReplayLink');
    const quickLoadReplay = document.getElementById('quickLoadReplay');
    
    // DOM Elements - Modals
    const newReplayModal = document.getElementById('newReplayModal');
    const replayNameInput = document.getElementById('replayName');
    const replayLinkInput = document.getElementById('replayLink');
    const replayFolderSelect = document.getElementById('replayFolder');
    const saveReplayBtn = document.getElementById('saveReplayBtn');
    const editReplayModal = document.getElementById('editReplayModal');
    const editReplayNameInput = document.getElementById('editReplayName');
    const editReplayFolderSelect = document.getElementById('editReplayFolder');
    const updateReplayBtn = document.getElementById('updateReplayBtn');
    const deleteReplayBtn = document.getElementById('deleteReplayBtn');
    const gameModal = document.getElementById('gameModal');
    const gameFrame = document.getElementById('gameFrame');
    const gameTitle = document.getElementById('gameTitle');
    const minimizeGameBtn = document.getElementById('minimizeGameBtn');
    const maximizeGameBtn = document.getElementById('maximizeGameBtn');
    
    // State variables
    let replayHistory = [];
    let folders = [];
    let currentReplayId = null;
    let currentFolderId = null;
    let currentReplayLink = '';
    let currentSort = 'date-desc';
    let searchQuery = '';
    let selectedColor = '#4a6bff';
    
    // Make functions globally accessible FIRST
    window.openFolderView = openFolderView;
    window.playReplay = playReplay;
    
    // Initialize
    loadReplayHistory();
    loadFolders();
    setupEventListeners();
    
    // Functions
    function loadReplayHistory() {
        const savedHistory = localStorage.getItem('replayHistory');
        if (savedHistory) {
            try {
                replayHistory = JSON.parse(savedHistory);
                
                // Migrate old format to new format if needed
                replayHistory = replayHistory.map(item => {
                    if (!item.id) {
                        return {
                            ...item,
                            id: generateId(),
                            name: item.name || extractNameFromLink(item.link),
                            folderId: null
                        };
                    }
                    return item;
                });
                
                saveReplayHistory();
                renderReplays();
            } catch (e) {
                console.error('Failed to parse history:', e);
                replayHistory = [];
            }
        }
    }
    
    function saveReplayHistory() {
        localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
        if (window.syncUserData) window.syncUserData();
    }
    
    function renderReplays() {
        if (!replaysGrid) return;
        
        replaysGrid.innerHTML = '';
        
        let filteredReplays = [...replayHistory];
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredReplays = filteredReplays.filter(replay => 
                (replay.name && replay.name.toLowerCase().includes(query)) || 
                replay.link.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        filteredReplays = sortReplays(filteredReplays, currentSort);
        
        if (filteredReplays.length === 0) {
            replaysGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <p>${searchQuery ? 'No replays match your search' : 'No replays yet'}</p>
                    ${!searchQuery ? '<button id="addFirstReplayBtn" class="btn primary-btn">Add Your First Replay</button>' : ''}
                </div>
            `;
            
            const addBtn = document.getElementById('addFirstReplayBtn');
            if (addBtn) {
                addBtn.addEventListener('click', openNewReplayModal);
            }
            
            return;
        }
        
        filteredReplays.forEach(replay => {
            const replayCard = document.createElement('div');
            replayCard.className = 'replay-card';
            
            // Get folder info if replay is in a folder
            let folderInfo = '';
            if (replay.folderId) {
                const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                const folder = folders.find(f => f.id === replay.folderId);
                if (folder) {
                    folderInfo = `<div class="replay-folder" style="color: ${folder.color}">
                        <i class="fas fa-folder"></i> ${folder.name}
                    </div>`;
                }
            }
            
            replayCard.innerHTML = `
                <div class="replay-thumbnail">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="replay-info">
                    <div class="replay-title">${replay.name || 'Unnamed Replay'}</div>
                    <div class="replay-date">${replay.date}</div>
                    ${folderInfo}
                    <div class="replay-actions">
                        <button class="play-replay">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="edit-replay">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-replay">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            replayCard.querySelector('.play-replay').addEventListener('click', (e) => {
                e.stopPropagation();
                playReplay(replay.link, replay.name);
            });
            
            replayCard.querySelector('.edit-replay').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditReplayModal(replay);
            });
            
            replayCard.querySelector('.delete-replay').addEventListener('click', (e) => {
                e.stopPropagation();
                const replayName = replay.name || 'Unnamed Replay';
                
                // Detailed custom delete prompt
                const confirmDelete = confirm(`Delete Replay: "${replayName}"\n\nThis replay will be permanently removed from your library.\nThis action cannot be undone.\n\nAre you sure you want to continue?`);
                
                if (confirmDelete) {
                    replayHistory = replayHistory.filter(r => r.id !== replay.id);
                    saveReplayHistory();
                    renderReplays();
                }
            });
            
            replayCard.addEventListener('click', () => {
                playReplay(replay.link, replay.name);
            });
            
            replaysGrid.appendChild(replayCard);
        });
    }
    
    function sortReplays(replays, sortType) {
        switch (sortType) {
            case 'date-desc':
                return replays.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            case 'date-asc':
                return replays.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            case 'name-asc':
                return replays.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'name-desc':
                return replays.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            default:
                return replays;
        }
    }
    
    function openNewReplayModal() {
        replayNameInput.value = '';
        replayLinkInput.value = '';
        replayFolderSelect.value = '';
        showModal('newReplayModal');
    }
    
    function openEditReplayModal(replay) {
        currentReplayId = replay.id;
        // Store the ID in localStorage for the fix-update.js script
        localStorage.setItem('currentEditingReplayId', replay.id);
        editReplayNameInput.value = replay.name || '';
        editReplayFolderSelect.value = replay.folderId || '';
        showModal('editReplayModal');
    }
    
    function addReplay() {
        const name = replayNameInput.value.trim();
        const link = replayLinkInput.value.trim();
        const folderId = replayFolderSelect.value || null;
        
        if (!link) {
            alert('Please enter a replay link');
            return;
        }
        
        const now = new Date();
        const formattedDate = now.toLocaleString();
        
        const newReplay = {
            id: generateId(),
            name: name || extractNameFromLink(link),
            link: link,
            date: formattedDate,
            timestamp: now.getTime(),
            folderId: folderId
        };
        
        replayHistory.unshift(newReplay);
        saveReplayHistory();
        renderReplays();
        hideModal('newReplayModal');
    }
    
    function updateReplay() {
        try {
            const name = editReplayNameInput.value.trim();
            const folderId = editReplayFolderSelect.value || null;
            
            const replayIndex = replayHistory.findIndex(r => r.id === currentReplayId);
            
            if (replayIndex !== -1) {
                replayHistory[replayIndex].name = name;
                replayHistory[replayIndex].folderId = folderId;
                
                saveReplayHistory();
                renderReplays();
                renderFolders(); // Update folder counts
                
                // Close the modal
                hideModal('editReplayModal');
                
                console.log('Replay updated successfully:', replayHistory[replayIndex]);
            } else {
                console.error('Failed to update replay. ID not found:', currentReplayId);
                alert('Error updating replay. Please try again.');
            }
        } catch (error) {
            console.error('Error in updateReplay:', error);
            alert('An error occurred while updating the replay.');
        }
    }
    
    function deleteReplay() {
        // Get the replay name
        const replayIndex = replayHistory.findIndex(r => r.id === currentReplayId);
        if (replayIndex !== -1) {
            const replayName = replayHistory[replayIndex].name || 'Unnamed Replay';
            
            // Show detailed custom delete prompt
            const confirmDelete = confirm(`Delete Replay: "${replayName}"\n\nThis replay will be permanently removed from your library.\nThis action cannot be undone.\n\nAre you sure you want to continue?`);
            
            if (confirmDelete) {
                replayHistory = replayHistory.filter(r => r.id !== currentReplayId);
                saveReplayHistory();
                renderReplays();
                hideModal('editReplayModal');
            }
        }
    }
    
    function playReplay(replayLink, replayName = 'Replay') {
        if (!replayLink) return;
        
        currentReplayLink = replayLink;
        gameTitle.textContent = replayName;
        
        // Show loading spinner
        document.getElementById('loadingSpinner').style.display = 'block';
        gameFrame.style.opacity = '0';
        
        // Show the game modal
        showModal('gameModal');
        
        // Get the appropriate game version
        fetch('/get_version', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ replay_link: replayLink }),
        })
        .then(response => response.json())
        .then(data => {
            // Extract the replay data
            let replayData = extractReplayData(replayLink);
            
            // Load the game version in the iframe
            loadGameVersion(data.version, replayData);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load replay. Please try again.');
            hideModal('gameModal');
        });
    }
    
    function extractReplayData(replayLink) {
        if (!replayLink || !replayLink.includes('?')) {
            return '';
        }
        
        try {
            // Get everything after the question mark
            const parts = replayLink.split('?');
            if (parts.length > 1) {
                let replayData = parts[1];
                
                // Remove parameter names if present
                if (replayData.startsWith('replay=')) {
                    replayData = replayData.replace('replay=', '');
                } else if (replayData.startsWith('data=')) {
                    replayData = replayData.replace('data=', '');
                }
                
                return replayData;
            }
        } catch (e) {
            console.error('Error extracting replay data:', e);
        }
        
        return '';
    }
    
    function loadGameVersion(version, replayData) {
        // Load the game version in the iframe
        const versionPath = `/emulated_versions/${version}`;
        gameFrame.src = versionPath;
        
        // Set up event listener for when the iframe loads
        gameFrame.onload = () => {
            // Start the automation process
            automateReplayPlayback(replayData);
        };
        
        gameFrame.onerror = () => {
            alert('Failed to load game version');
            hideModal('gameModal');
        };
    }
    
    function automateReplayPlayback(replayData) {
        try {
            // Get the iframe document
            const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
            
            // Add styles to hide UI elements and loading screens but ensure game is visible
            const style = iframeDoc.createElement('style');
            style.textContent = `
                .loading, button, textarea, input, select, .menu, .menuContainer, #menuContainer, 
                div[id*="menu"], div[class*="menu"], .ui-container, .ui, .interface, 
                div:not(.game-container):not(.canvas-container):not(#gameCanvas):not(canvas) {
                    opacity: 0 !important;
                    visibility: hidden !important;
                }
                body, html {
                    background-color: black !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                canvas, #gameCanvas, .game-container, .canvas-container {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    width: 100% !important;
                    height: 100% !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                }
            `;
            iframeDoc.head.appendChild(style);
            
            // Execute all steps at once with minimal delays
            (async () => {
                // Step 1: Click the Game Menu button (hidden from user)
                const gameMenuButton = findButtonByText(iframeDoc, 'Game Menu');
                if (gameMenuButton) clickElement(gameMenuButton);
                
                await sleep(50); // Slightly longer delay
                
                // Step 2: Click the Replay button (hidden from user)
                const replayButton = findButtonByText(iframeDoc, 'Replay');
                if (replayButton) clickElement(replayButton);
                
                await sleep(50); // Slightly longer delay
                
                // Step 3: Paste the replay data into the textarea
                const textarea = iframeDoc.getElementById('textArea1') || 
                                iframeDoc.querySelector('textarea[placeholder*="replay"]');
                
                if (textarea) {
                    console.log('Found textarea, setting value:', replayData ? replayData.substring(0, 20) + '...' : 'empty');
                    
                    // Set the value directly
                    textarea.value = replayData || '';
                    
                    // Trigger input event
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    await sleep(50); // Slightly longer delay
                    
                    // Step 4: Click the Launch button
                    const launchButton = findButtonByText(iframeDoc, 'Launch');
                    if (launchButton) {
                        console.log('Found launch button, clicking');
                        clickElement(launchButton);
                    } else {
                        console.error('Launch button not found');
                    }
                    
                    // Wait for the game to actually start
                    await waitForGameToStart(iframeDoc);
                    
                    // Show the iframe once the game has started
                    gameFrame.style.opacity = '1';
                    gameFrame.style.display = 'block';
                    
                    // Hide loading spinner
                    const spinner = document.getElementById('loadingSpinner');
                    if (spinner) spinner.style.display = 'none';
                } else {
                    console.error('Textarea not found');
                    gameFrame.style.opacity = '1';
                    document.getElementById('loadingSpinner').style.display = 'none';
                }
            })();
            
        } catch (error) {
            console.error('Automation error:', error);
            // Don't show errors to user, just continue silently
            gameFrame.style.opacity = '1';
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }
    
    // Function to wait for the game to actually start
    async function waitForGameToStart(iframeDoc) {
        const maxAttempts = 100; // Maximum number of attempts
        let attempts = 0;
        
        return new Promise(resolve => {
            const checkForGameElements = async () => {
                attempts++;
                
                // Look for game elements that indicate the game has started
                const canvas = iframeDoc.querySelector('canvas');
                const gameCanvas = iframeDoc.getElementById('gameCanvas');
                const gameContainer = iframeDoc.querySelector('.game-container');
                
                // Check if any menu elements are still visible
                const menuElements = iframeDoc.querySelectorAll('button, .menu, #menuContainer');
                const menuVisible = Array.from(menuElements).some(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                
                if ((canvas || gameCanvas || gameContainer) && !menuVisible || attempts >= maxAttempts) {
                    // Game has started, wait a bit more to ensure it's fully loaded
                    await sleep(300);
                    resolve();
                } else {
                    setTimeout(checkForGameElements, 50);
                }
            };
            
            checkForGameElements();
        });
    }
    
    function findButtonByText(doc, text) {
        // Try to find by exact text content first
        const elements = Array.from(doc.querySelectorAll('button'));
        
        // First try exact match
        let button = elements.find(el => el.textContent.trim() === text);
        
        // If not found, try contains match
        if (!button) {
            button = elements.find(el => el.textContent.includes(text));
        }
        
        // If still not found, try case-insensitive match
        if (!button) {
            const lowerText = text.toLowerCase();
            button = elements.find(el => el.textContent.toLowerCase().includes(lowerText));
        }
        
        return button;
    }
    
    function clickElement(element) {
        // Try multiple approaches to click the element
        try {
            // Try the click() method
            element.click();
        } catch (e) {
            try {
                // Try dispatching a mouse event
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: element.ownerDocument.defaultView
                });
                element.dispatchEvent(event);
            } catch (e2) {
                console.error('Failed to click element:', e2);
            }
        }
    }
    
    function extractNameFromLink(link) {
        // Try to extract a meaningful name from the link
        try {
            const url = new URL(link);
            const domain = url.hostname;
            
            if (domain.includes('territorial.io')) {
                return 'Territorial.io Replay';
            }
            
            return domain;
        } catch (e) {
            return 'Unnamed Replay';
        }
    }
    
    function showModal(modalId) {
        if (typeof modalId === 'string') {
            document.getElementById(modalId).style.display = 'flex';
        } else if (modalId && modalId.id) {
            document.getElementById(modalId.id).style.display = 'flex';
        }
    }
    
    function hideModal(modalId) {
        if (typeof modalId === 'string') {
            document.getElementById(modalId).style.display = 'none';
        } else if (modalId && modalId.id) {
            document.getElementById(modalId.id).style.display = 'none';
            
            // If it's the game modal, clear the iframe
            if (modalId.id === 'gameModal') {
                gameFrame.src = 'about:blank';
                currentReplayLink = '';
            }
        }
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Folder functions
    function loadFolders() {
        const savedFolders = localStorage.getItem('folders');
        folders = savedFolders ? JSON.parse(savedFolders) : [];
        renderFolders();
    }
    
    function saveFolders() {
        localStorage.setItem('folders', JSON.stringify(folders));
        if (window.syncUserData) window.syncUserData();
    }
    
    function renderFolders() {
        if (!foldersGrid) return;
        
        // Clear existing folders but keep the create folder card
        const createCard = document.getElementById('createFolderCard');
        foldersGrid.innerHTML = '';
        foldersGrid.appendChild(createCard);
        
        folders.forEach(folder => {
            const folderCard = document.createElement('div');
            // Add shared folder class if it's a shared folder
            folderCard.className = folder.isShared ? 'folder-card shared-folder' : 'folder-card';
            
            // Get accurate replay count
            const replayCount = getReplayCountInFolder(folder.id);
            const replayText = replayCount === 1 ? '1 replay' : `${replayCount} replays`;
            
            // Shared folder badge
            const sharedBadge = folder.isShared ? 
                `<div class="shared-folder-badge"><i class="fas fa-users"></i> Shared</div>` : '';
            
            // Shared info text
            const sharedInfo = folder.isShared ? 
                `<div class="shared-info"><i class="fas fa-users"></i> Shared folder</div>` : '';
            
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
            
            // Open folder view on click
            folderCard.querySelector('.folder-icon').addEventListener('click', () => {
                openFolderView(folder);
            });
            
            folderCard.querySelector('.folder-title').addEventListener('click', () => {
                openFolderView(folder);
            });
            
            // Share folder button removed
            
            // Edit folder button
            folderCard.querySelector('.edit-folder').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditFolderModal(folder);
            });
            
            // Delete folder button
            folderCard.querySelector('.delete-folder').addEventListener('click', (e) => {
                e.stopPropagation();
                const folderName = folder.name;
                
                // Custom delete prompt
                const confirmDelete = confirm(`Delete Folder: "${folderName}"\n\nThis folder will be permanently removed.\nAll replays in this folder will be moved to "No Folder".\nThis action cannot be undone.\n\nAre you sure you want to continue?`);
                
                if (confirmDelete) {
                    deleteFolder(folder.id);
                }
            });
            
            // Insert before the create folder card
            foldersGrid.insertBefore(folderCard, createCard);
        });
        
        // Update folder dropdowns in replay modals
        updateFolderDropdowns();
    }
    
    function getReplayCountInFolder(folderId) {
        return replayHistory.filter(replay => replay.folderId === folderId).length;
    }
    
    function getReplaysByFolderId(folderId) {
        return replayHistory.filter(replay => replay.folderId === folderId);
    }
    
    function updateFolderDropdowns() {
        const dropdowns = [
            document.getElementById('replayFolder'),
            document.getElementById('editReplayFolder')
        ];
        
        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            
            // Keep the first option (No Folder)
            const firstOption = dropdown.options[0];
            dropdown.innerHTML = '';
            dropdown.appendChild(firstOption);
            
            // Add folder options
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.name;
                dropdown.appendChild(option);
            });
        });
    }
    
    function openNewFolderModal() {
        document.getElementById('folderName').value = '';
        selectedColor = '#4a6bff';
        updateColorSelection();
        showModal('newFolderModal');
    }
    
    function openEditFolderModal(folder) {
        currentFolderId = folder.id;
        document.getElementById('editFolderName').value = folder.name;
        selectedColor = folder.color;
        updateColorSelection(document.getElementById('editFolderModal'));
        showModal('editFolderModal');
    }
    
    function openFolderView(folder) {
        currentFolderId = folder.id;
        document.getElementById('folderViewTitle').textContent = folder.name;
        renderFolderReplays(folder.id);
        showModal('folderViewModal');
    }
    
    function renderFolderReplays(folderId) {
        const folderReplaysGrid = document.getElementById('folderReplaysGrid');
        if (!folderReplaysGrid) return;
        
        folderReplaysGrid.innerHTML = '';
        
        const folderReplays = replayHistory.filter(replay => replay.folderId === folderId);
        
        if (folderReplays.length === 0) {
            folderReplaysGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <p>No replays in this folder</p>
                </div>
            `;
            return;
        }
        
        folderReplays.forEach(replay => {
            const replayCard = document.createElement('div');
            replayCard.className = 'replay-card';
            replayCard.innerHTML = `
                <div class="replay-thumbnail">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="replay-info">
                    <div class="replay-title">${replay.name || 'Unnamed Replay'}</div>
                    <div class="replay-date">${replay.date}</div>
                    <div class="replay-actions">
                        <button class="play-replay" data-link="${replay.link}">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="edit-replay" data-id="${replay.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-replay" data-id="${replay.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            folderReplaysGrid.appendChild(replayCard);
        });
        
        // Add event listeners
        folderReplaysGrid.querySelectorAll('.play-replay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const link = btn.getAttribute('data-link');
                playReplay(link);
            });
        });
        
        folderReplaysGrid.querySelectorAll('.edit-replay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const replay = replayHistory.find(r => r.id === id);
                if (replay) {
                    openEditReplayModal(replay);
                }
            });
        });
        
        folderReplaysGrid.querySelectorAll('.delete-replay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const replay = replayHistory.find(r => r.id === id);
                
                if (replay) {
                    const replayName = replay.name || 'Unnamed Replay';
                    // Custom delete prompt
                    const confirmDelete = confirm(`Delete Replay: "${replayName}"\n\nThis replay will be permanently removed from your library.\nThis action cannot be undone.\n\nAre you sure you want to continue?`);
                    
                    if (confirmDelete) {
                        replayHistory = replayHistory.filter(r => r.id !== id);
                        saveReplayHistory();
                        renderFolderReplays(currentFolderId);
                    }
                }
            });
        });
    }
    
    function updateColorSelection(modal = document.getElementById('newFolderModal')) {
        const colorOptions = modal.querySelectorAll('.color-option');
        
        colorOptions.forEach(option => {
            const color = option.getAttribute('data-color');
            option.classList.toggle('selected', color === selectedColor);
        });
    }
    
    function createFolder() {
        const name = document.getElementById('folderName').value.trim();
        
        if (!name) {
            alert('Please enter a folder name');
            return;
        }
        
        if (folders.length >= 10) {
            alert('You can only create up to 10 folders');
            return;
        }
        
        const newFolder = {
            id: generateId(),
            name: name,
            color: selectedColor,
            createdAt: new Date().toISOString()
        };
        
        folders.push(newFolder);
        saveFolders();
        renderFolders();
        hideModal('newFolderModal');
    }
    
    function updateFolder() {
        try {
            const name = document.getElementById('editFolderName').value.trim();
            
            if (!name) {
                alert('Please enter a folder name');
                return;
            }
            
            const folderIndex = folders.findIndex(f => f.id === currentFolderId);
            
            if (folderIndex !== -1) {
                folders[folderIndex].name = name;
                folders[folderIndex].color = selectedColor;
                
                saveFolders();
                renderFolders();
                
                // Close the modal
                hideModal('editFolderModal');
                
                console.log('Folder updated successfully:', folders[folderIndex]);
            } else {
                console.error('Failed to update folder. ID not found:', currentFolderId);
                alert('Error updating folder. Please try again.');
            }
        } catch (error) {
            console.error('Error in updateFolder:', error);
            alert('An error occurred while updating the folder.');
        }
    }
    
    function deleteFolder(folderId = null) {
        // Use provided folderId or currentFolderId from modal
        const folderIdToDelete = folderId || currentFolderId;
        
        if (!folderIdToDelete) return;
        
        // Move replays to no folder
        replayHistory = replayHistory.map(replay => {
            if (replay.folderId === folderIdToDelete) {
                return { ...replay, folderId: null };
            }
            return replay;
        });
        
        saveReplayHistory();
        
        // Remove folder
        folders = folders.filter(f => f.id !== folderIdToDelete);
        saveFolders();
        renderFolders();
        
        // If called from modal, close it
        if (!folderId) {
            hideModal('editFolderModal');
        }
    }
    
    // Event listeners setup
    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.getAttribute('data-view');
                
                // Update active nav link
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                link.parentElement.classList.add('active');
                
                // Show the selected view
                views.forEach(view => {
                    view.classList.toggle('active', view.id === `${viewName}View`);
                });
            });
        });
        
        // Quick replay input
        if (quickLoadReplay) {
            quickLoadReplay.addEventListener('click', () => {
                const link = quickReplayLink.value.trim();
                if (link) {
                    // Save to history
                    const now = new Date();
                    const formattedDate = now.toLocaleString();
                    
                    const newReplay = {
                        id: generateId(),
                        name: extractNameFromLink(link),
                        link: link,
                        date: formattedDate,
                        timestamp: now.getTime(),
                        folderId: null
                    };
                    
                    replayHistory.unshift(newReplay);
                    saveReplayHistory();
                    renderReplays();
                    
                    // Play the replay
                    playReplay(link, newReplay.name);
                } else {
                    alert('Please enter a replay link');
                }
            });
        }
        
        // Folder management
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', openNewFolderModal);
        }
        
        if (createFolderCard) {
            createFolderCard.addEventListener('click', openNewFolderModal);
        }
        
        // Save folder button
        const saveFolderBtn = document.getElementById('saveFolderBtn');
        if (saveFolderBtn) {
            saveFolderBtn.addEventListener('click', createFolder);
        }
        
        // Update folder button
        document.getElementById('updateFolderBtn').onclick = function(e) {
            e.preventDefault();
            console.log('Update folder button clicked');
            updateFolder();
            return false;
        };
        
        // Delete folder button
        document.getElementById('deleteFolderBtn').onclick = function(e) {
            e.preventDefault();
            
            // Get folder name for confirmation
            const folderIndex = folders.findIndex(f => f.id === currentFolderId);
            if (folderIndex !== -1) {
                const folderName = folders[folderIndex].name;
                
                // Custom delete prompt
                const confirmDelete = confirm(`Delete Folder: "${folderName}"\n\nThis folder will be permanently removed.\nAll replays in this folder will be moved to "No Folder".\nThis action cannot be undone.\n\nAre you sure you want to continue?`);
                
                if (confirmDelete) {
                    deleteFolder();
                }
            }
            
            return false;
        };
        
        // Color pickers
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedColor = option.getAttribute('data-color');
                updateColorSelection(option.closest('.modal'));
            });
        });
        
        // Search
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                searchQuery = searchInput.value.trim();
                renderReplays();
            });
        }
        
        // Sort button
        if (sortReplaysBtn) {
            sortReplaysBtn.addEventListener('click', () => {
                // Toggle sort order
                switch (currentSort) {
                    case 'date-desc':
                        currentSort = 'date-asc';
                        break;
                    case 'date-asc':
                        currentSort = 'name-asc';
                        break;
                    case 'name-asc':
                        currentSort = 'name-desc';
                        break;
                    default:
                        currentSort = 'date-desc';
                }
                
                renderReplays();
            });
        }
        
        // New replay button removed
        
        // Add first replay button
        if (addFirstReplayBtn) {
            addFirstReplayBtn.addEventListener('click', openNewReplayModal);
        }
        
        // Save replay button
        if (saveReplayBtn) {
            saveReplayBtn.addEventListener('click', addReplay);
        }
        
        // Update replay button
        document.getElementById('updateReplayBtn').onclick = function(e) {
            e.preventDefault();
            console.log('Update replay button clicked');
            updateReplay();
            return false;
        };
        
        // Delete replay button
        document.getElementById('deleteReplayBtn').onclick = function(e) {
            e.preventDefault();
            deleteReplay();
            return false;
        };
        
        // Game modal controls
        if (minimizeGameBtn) {
            minimizeGameBtn.addEventListener('click', () => {
                const content = gameModal.querySelector('.modal-content');
                content.classList.toggle('minimized');
            });
        }
        
        if (maximizeGameBtn) {
            maximizeGameBtn.addEventListener('click', () => {
                const content = gameModal.querySelector('.modal-content');
                content.classList.toggle('fullscreen');
            });
        }
        
        // Specific handlers for modal close buttons
        document.getElementById('closeGameModal').onclick = function(e) {
            e.preventDefault();
            hideModal('gameModal');
            return false;
        };
        
        document.getElementById('closeEditReplayModal').onclick = function(e) {
            e.preventDefault();
            document.getElementById('editReplayModal').style.display = 'none';
            return false;
        };
        
        document.getElementById('closeEditFolderModal').onclick = function(e) {
            e.preventDefault();
            document.getElementById('editFolderModal').style.display = 'none';
            return false;
        };
        
        // Specific cancel buttons
        document.getElementById('cancelEditReplayBtn').onclick = function(e) {
            e.preventDefault();
            document.getElementById('editReplayModal').style.display = 'none';
            return false;
        };
        
        document.getElementById('cancelEditFolderBtn').onclick = function(e) {
            e.preventDefault();
            document.getElementById('editFolderModal').style.display = 'none';
            return false;
        };
        
        // General close modal buttons are handled by modals.js
    }
});