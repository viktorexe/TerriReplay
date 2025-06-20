document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const folderGrid = document.getElementById('foldersGrid');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const createFirstFolderBtn = document.getElementById('createFirstFolderBtn');
    const newFolderModal = document.getElementById('newFolderModal');
    const saveFolderBtn = document.getElementById('saveFolderBtn');
    const folderNameInput = document.getElementById('folderName');
    const editFolderModal = document.getElementById('editFolderModal');
    const editFolderNameInput = document.getElementById('editFolderName');
    const updateFolderBtn = document.getElementById('updateFolderBtn');
    const deleteFolderBtn = document.getElementById('deleteFolderBtn');
    const folderViewModal = document.getElementById('folderViewModal');
    const folderViewTitle = document.getElementById('folderViewTitle');
    const folderReplaysGrid = document.getElementById('folderReplaysGrid');
    
    // State
    let folders = [];
    let currentFolderId = null;
    let selectedColor = '#4a6bff';
    
    // Initialize
    loadFolders();
    setupEventListeners();
    
    // Functions
    function loadFolders() {
        const savedFolders = localStorage.getItem('folders');
        folders = savedFolders ? JSON.parse(savedFolders) : [];
        renderFolders();
    }
    
    function saveFolders() {
        localStorage.setItem('folders', JSON.stringify(folders));
    }
    
    function renderFolders() {
        if (!folderGrid) return;
        
        folderGrid.innerHTML = '';
        
        if (folders.length === 0) {
            folderGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No folders yet</p>
                    <button id="createFirstFolderBtn" class="btn primary-btn">Create Your First Folder</button>
                </div>
            `;
            
            document.getElementById('createFirstFolderBtn').addEventListener('click', () => {
                openNewFolderModal();
            });
            
            return;
        }
        
        folders.forEach(folder => {
            const folderCard = document.createElement('div');
            folderCard.className = 'folder-card';
            folderCard.innerHTML = `
                <div class="folder-icon" style="color: ${folder.color}">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="folder-info">
                    <div class="folder-title">${folder.name}</div>
                    <div class="folder-count">${getReplayCountInFolder(folder.id)} replays</div>
                </div>
            `;
            
            folderCard.addEventListener('click', () => {
                openFolderView(folder);
            });
            
            folderCard.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                openEditFolderModal(folder);
            });
            
            folderGrid.appendChild(folderCard);
        });
        
        // Update folder dropdowns in replay modals
        updateFolderDropdowns();
    }
    
    function getReplayCountInFolder(folderId) {
        const replays = getReplays();
        return replays.filter(replay => replay.folderId === folderId).length;
    }
    
    function getReplays() {
        const savedReplays = localStorage.getItem('replayHistory');
        return savedReplays ? JSON.parse(savedReplays) : [];
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
        folderNameInput.value = '';
        selectedColor = '#4a6bff';
        updateColorSelection();
        showModal(newFolderModal);
    }
    
    function openEditFolderModal(folder) {
        currentFolderId = folder.id;
        editFolderNameInput.value = folder.name;
        selectedColor = folder.color;
        updateColorSelection(editFolderModal);
        showModal(editFolderModal);
    }
    
    function openFolderView(folder) {
        currentFolderId = folder.id;
        folderViewTitle.textContent = folder.name;
        renderFolderReplays(folder.id);
        showModal(folderViewModal);
    }
    
    function renderFolderReplays(folderId) {
        folderReplaysGrid.innerHTML = '';
        
        const replays = getReplays().filter(replay => replay.folderId === folderId);
        
        if (replays.length === 0) {
            folderReplaysGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <p>No replays in this folder</p>
                </div>
            `;
            return;
        }
        
        replays.forEach(replay => {
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
        
        // Add event listeners to the buttons
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
                const replay = getReplays().find(r => r.id === id);
                if (replay) {
                    openEditReplayModal(replay);
                }
            });
        });
        
        folderReplaysGrid.querySelectorAll('.delete-replay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this replay?')) {
                    const replays = getReplays();
                    const updatedReplays = replays.filter(r => r.id !== id);
                    localStorage.setItem('replayHistory', JSON.stringify(updatedReplays));
                    renderFolderReplays(currentFolderId);
                }
            });
        });
    }
    
    function createFolder() {
        const name = folderNameInput.value.trim();
        
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
        hideModal(newFolderModal);
    }
    
    function updateFolder() {
        const name = editFolderNameInput.value.trim();
        
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
            hideModal(editFolderModal);
        }
    }
    
    function deleteFolder() {
        if (confirm('Are you sure you want to delete this folder? Replays in this folder will be moved to "No Folder".')) {
            // Move replays to no folder
            const replays = getReplays();
            const updatedReplays = replays.map(replay => {
                if (replay.folderId === currentFolderId) {
                    return { ...replay, folderId: null };
                }
                return replay;
            });
            
            localStorage.setItem('replayHistory', JSON.stringify(updatedReplays));
            
            // Remove folder
            folders = folders.filter(f => f.id !== currentFolderId);
            saveFolders();
            renderFolders();
            hideModal(editFolderModal);
        }
    }
    
    function updateColorSelection(modal = newFolderModal) {
        const colorOptions = modal.querySelectorAll('.color-option');
        
        colorOptions.forEach(option => {
            const color = option.getAttribute('data-color');
            option.classList.toggle('selected', color === selectedColor);
        });
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function showModal(modal) {
        modal.classList.add('active');
    }
    
    function hideModal(modal) {
        modal.classList.remove('active');
    }
    
    function setupEventListeners() {
        // New folder button
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', openNewFolderModal);
        }
        
        // Save folder button
        if (saveFolderBtn) {
            saveFolderBtn.addEventListener('click', createFolder);
        }
        
        // Update folder button
        if (updateFolderBtn) {
            updateFolderBtn.addEventListener('click', updateFolder);
        }
        
        // Delete folder button
        if (deleteFolderBtn) {
            deleteFolderBtn.addEventListener('click', deleteFolder);
        }
        
        // Color pickers
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedColor = option.getAttribute('data-color');
                updateColorSelection(option.closest('.modal'));
            });
        });
        
        // Close modal buttons
        document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                hideModal(modal);
            });
        });
    }
});