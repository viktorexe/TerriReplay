// Quick Share Link Import
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const quickShareLink = document.getElementById('quickShareLink');
    const quickImportFolder = document.getElementById('quickImportFolder');
    
    // Initialize
    if (quickImportFolder && quickShareLink) {
        quickImportFolder.addEventListener('click', function() {
            const link = quickShareLink.value.trim();
            
            if (!link) {
                alert('Please paste a shared folder link first');
                return;
            }
            
            processSharedLink(link);
        });
        
        // Also process on Enter key
        quickShareLink.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const link = quickShareLink.value.trim();
                if (link) {
                    processSharedLink(link);
                }
            }
        });
    }
    
    // Process shared link
    function processSharedLink(link) {
        try {
            const url = new URL(link);
            
            // Check if it's a short URL
            if (url.pathname.startsWith('/s/')) {
                const code = url.pathname.split('/')[2];
                
                // Show loading state
                quickShareLink.value = 'Loading shared folder...';
                quickShareLink.disabled = true;
                quickImportFolder.disabled = true;
                
                // Fetch data from API
                fetch(`/api/share/${code}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            showImportConfirmation(result.data);
                        } else {
                            alert('Invalid shared folder link or the share has expired.');
                            resetQuickShareInput();
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching shared folder:', error);
                        alert('Failed to import folder. Please check the link and try again.');
                        resetQuickShareInput();
                    });
                return;
            }
            
            // Handle legacy long URLs
            if (url.pathname === '/share' && url.searchParams.get('data')) {
                const encodedData = url.searchParams.get('data');
                const decodedData = JSON.parse(atob(encodedData));
                showImportConfirmation(decodedData);
                return;
            }
            
            alert('Invalid shared folder link format');
            
        } catch (error) {
            console.error('Error processing shared link:', error);
            alert('Invalid shared folder link. Please check the link and try again.');
        }
    }
    
    // Reset quick share input
    function resetQuickShareInput() {
        if (quickShareLink) {
            quickShareLink.value = '';
            quickShareLink.disabled = false;
        }
        
        if (quickImportFolder) {
            quickImportFolder.disabled = false;
        }
    }
    
    // Show import confirmation
    function showImportConfirmation(data) {
        const { folder, replays } = data;
        
        if (!folder || !replays) {
            alert('Invalid shared folder data');
            resetQuickShareInput();
            return;
        }
        
        const confirmImport = confirm(
            `Import Shared Folder\n\n` +
            `Name: ${folder.name}\n` +
            `Replays: ${replays.length}\n\n` +
            `Do you want to import this folder to your library?`
        );
        
        if (confirmImport) {
            importSharedFolder(data);
        } else {
            resetQuickShareInput();
        }
    }
    
    // Import shared folder
    function importSharedFolder(data) {
        try {
            const { folder, replays } = data;
            
            // Generate new IDs to avoid conflicts
            const newFolderId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            folder.id = newFolderId;
            
            // Mark as shared folder
            folder.isShared = true;
            folder.sharedAt = new Date().toISOString();
            
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
                const newReplayId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                replay.id = newReplayId;
                replay.folderId = newFolderId;
                
                // Add to history
                replayHistory.push(replay);
            });
            
            localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
            
            // Show success message
            alert(`Successfully imported folder "${folderName}" with ${replays.length} replays!`);
            
            // Reset input
            resetQuickShareInput();
            
            // Reload page to refresh UI
            window.location.reload();
            
        } catch (error) {
            console.error('Error importing folder:', error);
            alert('Failed to import folder. Please try again.');
            resetQuickShareInput();
        }
    }
});