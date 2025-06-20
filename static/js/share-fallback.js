// Fallback mechanism for shared folders
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a shared folder code in the URL
    const checkForSharedCode = function() {
        try {
            const url = new URL(window.location.href);
            
            // Check if it's a short URL
            if (url.pathname.startsWith('/s/')) {
                const code = url.pathname.split('/')[2];
                
                // Store the code in localStorage for later retrieval
                localStorage.setItem('pendingSharedFolderCode', code);
                
                // Clean URL
                window.history.replaceState({}, document.title, '/');
            }
        } catch (error) {
            console.error('Error checking for shared code:', error);
        }
    };
    
    // Try to process any pending shared folder code
    const processPendingSharedCode = function() {
        const pendingCode = localStorage.getItem('pendingSharedFolderCode');
        if (!pendingCode) return;
        
        console.log('Found pending shared folder code:', pendingCode);
        
        // Clear the pending code
        localStorage.removeItem('pendingSharedFolderCode');
        
        // Try to fetch the shared folder data
        const apiUrl = `${window.location.origin}/api/share/${pendingCode}`;
        console.log('Fetching from fallback mechanism:', apiUrl);
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    importSharedFolderData(result.data);
                } else {
                    console.error('Failed to get shared folder data:', result);
                }
            })
            .catch(error => {
                console.error('Error in fallback mechanism:', error);
            });
    };
    
    // Import shared folder data
    function importSharedFolderData(data) {
        try {
            const { folder, replays } = data;
            
            if (!folder || !replays) {
                console.error('Invalid shared folder data');
                return;
            }
            
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
            
            // Reload page to refresh UI
            window.location.reload();
            
        } catch (error) {
            console.error('Error importing folder in fallback:', error);
        }
    }
    
    // Run the checks
    checkForSharedCode();
    setTimeout(processPendingSharedCode, 1000); // Give the main script time to run first
});