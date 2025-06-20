// Folder Sharing Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const importFolderModalBtn = document.getElementById('importFolderModalBtn');
    const importFolderModal = document.getElementById('importFolderModal');
    const shareFolderModal = document.getElementById('shareFolderModal');
    const sharedFolderLink = document.getElementById('sharedFolderLink');
    const folderShareLink = document.getElementById('folderShareLink');
    const importFolderBtn = document.getElementById('importFolderBtn');
    const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
    const shareTelegramBtn = document.getElementById('shareTelegramBtn');
    const shareTwitterBtn = document.getElementById('shareTwitterBtn');
    const closeShareBtn = document.getElementById('closeShareBtn');
    
    // Current folder being shared
    let currentSharedFolder = null;
    
    // Initialize event listeners
    function initShareFunctionality() {
        // Open import folder modal
        if (importFolderModalBtn) {
            importFolderModalBtn.addEventListener('click', function() {
                showModal('importFolderModal');
            });
        }
        
        // Import folder button
        if (importFolderBtn) {
            importFolderBtn.addEventListener('click', importSharedFolder);
        }
        
        // Copy share link button
        if (copyShareLinkBtn) {
            copyShareLinkBtn.addEventListener('click', copyShareLink);
        }
        
        // Social share buttons
        if (shareWhatsappBtn) {
            shareWhatsappBtn.addEventListener('click', function() {
                shareViaApp('whatsapp', folderShareLink.value);
            });
        }
        
        if (shareTelegramBtn) {
            shareTelegramBtn.addEventListener('click', function() {
                shareViaApp('telegram', folderShareLink.value);
            });
        }
        
        if (shareTwitterBtn) {
            shareTwitterBtn.addEventListener('click', function() {
                shareViaApp('twitter', folderShareLink.value);
            });
        }
        
        // Close share modal button
        if (closeShareBtn) {
            closeShareBtn.addEventListener('click', function() {
                hideModal('shareFolderModal');
            });
        }
        
        // Add share button event listeners to folder cards
        document.addEventListener('click', function(e) {
            if (e.target.closest('.share-folder')) {
                const shareBtn = e.target.closest('.share-folder');
                const folderId = shareBtn.getAttribute('data-id');
                openShareFolderModal(folderId);
            }
        });
        
        // Check URL for shared folder
        checkForSharedFolder();
    }
    
    // Open share folder modal
    function openShareFolderModal(folderId) {
        // Get folder data
        const folders = JSON.parse(localStorage.getItem('folders') || '[]');
        const folder = folders.find(f => f.id === folderId);
        
        if (folder) {
            currentSharedFolder = folder;
            
            // Generate share link
            const folderData = {
                folder: folder,
                replays: getReplaysByFolderId(folderId)
            };
            
            const encodedData = btoa(JSON.stringify(folderData));
            const shareLink = `${window.location.origin}/share?data=${encodedData}`;
            
            // Set share link in input
            folderShareLink.value = shareLink;
            
            // Show modal
            showModal('shareFolderModal');
        }
    }
    
    // Get replays by folder ID
    function getReplaysByFolderId(folderId) {
        const replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
        return replayHistory.filter(replay => replay.folderId === folderId);
    }
    
    // Copy share link to clipboard
    function copyShareLink() {
        folderShareLink.select();
        document.execCommand('copy');
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'copy-success';
        successMsg.textContent = 'Link copied to clipboard!';
        
        const container = folderShareLink.parentNode;
        container.appendChild(successMsg);
        
        // Show message
        setTimeout(() => {
            successMsg.classList.add('visible');
        }, 10);
        
        // Hide message after 2 seconds
        setTimeout(() => {
            successMsg.classList.remove('visible');
            setTimeout(() => {
                container.removeChild(successMsg);
            }, 300);
        }, 2000);
    }
    
    // Share via app (WhatsApp, Telegram, Twitter)
    function shareViaApp(app, url) {
        const folderName = currentSharedFolder ? currentSharedFolder.name : 'folder';
        const text = `Check out my "${folderName}" replay folder on TerriReplay!`;
        
        let shareUrl = '';
        
        switch (app) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }
    
    // Import shared folder
    function importSharedFolder() {
        const link = sharedFolderLink.value.trim();
        
        if (!link) {
            alert('Please enter a shared folder link');
            return;
        }
        
        try {
            // Extract data from URL
            const url = new URL(link);
            const encodedData = url.searchParams.get('data');
            
            if (!encodedData) {
                alert('Invalid shared folder link');
                return;
            }
            
            // Decode data
            const decodedData = JSON.parse(atob(encodedData));
            const { folder, replays } = decodedData;
            
            if (!folder || !replays) {
                alert('Invalid shared folder data');
                return;
            }
            
            // Generate new IDs to avoid conflicts
            const newFolderId = generateId();
            folder.id = newFolderId;
            
            // Add folder to localStorage
            const folders = JSON.parse(localStorage.getItem('folders') || '[]');
            
            // Check if folder name already exists
            let folderName = folder.name;
            let counter = 1;
            
            while (folders.some(f => f.name === folderName)) {
                folderName = `${folder.name} (${counter})`;
                counter++;
            }
            
            folder.name = folderName;
            folders.push(folder);
            localStorage.setItem('folders', JSON.stringify(folders));
            
            // Add replays to localStorage
            const replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
            
            // Process each replay
            replays.forEach(replay => {
                // Generate new ID
                const newReplayId = generateId();
                replay.id = newReplayId;
                replay.folderId = newFolderId;
                
                // Add to history
                replayHistory.push(replay);
            });
            
            localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
            
            // Close modal and refresh UI
            hideModal('importFolderModal');
            renderFolders();
            renderReplays();
            
            // Show success message
            alert(`Successfully imported folder "${folderName}" with ${replays.length} replays!`);
            
            // Clear input
            sharedFolderLink.value = '';
            
        } catch (error) {
            console.error('Error importing folder:', error);
            alert('Failed to import folder. Please check the link and try again.');
        }
    }
    
    // Check URL for shared folder
    function checkForSharedFolder() {
        const url = new URL(window.location.href);
        
        // Check for short URL format
        if (url.pathname.startsWith('/s/')) {
            // Show import modal with pre-filled link
            if (sharedFolderLink) {
                sharedFolderLink.value = window.location.href;
                showModal('importFolderModal');
            }
            
            // Clean URL
            window.history.replaceState({}, document.title, '/');
            return;
        }
        
        // Check for legacy long URL format
        const encodedData = url.searchParams.get('data');
        
        if (encodedData) {
            try {
                // Show import modal with pre-filled link
                if (sharedFolderLink) {
                    sharedFolderLink.value = window.location.href;
                    showModal('importFolderModal');
                }
                
                // Clean URL
                window.history.replaceState({}, document.title, '/');
            } catch (error) {
                console.error('Error processing shared folder link:', error);
            }
        }
    }
    
    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Initialize
    initShareFunctionality();
});