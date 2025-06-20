// Direct fix for the update button in edit replay modal
document.addEventListener('DOMContentLoaded', function() {
    // Get the update button
    const updateReplayBtn = document.getElementById('updateReplayBtn');
    
    if (updateReplayBtn) {
        // Remove any existing event listeners
        updateReplayBtn.replaceWith(updateReplayBtn.cloneNode(true));
        
        // Get the fresh reference
        const newUpdateBtn = document.getElementById('updateReplayBtn');
        
        // Add direct click handler
        newUpdateBtn.addEventListener('click', function() {
            // Get the values
            const name = document.getElementById('editReplayName').value.trim();
            const folderId = document.getElementById('editReplayFolder').value;
            
            // Get the current replay ID from localStorage
            const currentReplayId = localStorage.getItem('currentEditingReplayId');
            
            if (!currentReplayId) {
                alert('Error: Could not identify which replay to update');
                return;
            }
            
            // Get all replays
            let replayHistory = [];
            try {
                const savedHistory = localStorage.getItem('replayHistory');
                if (savedHistory) {
                    replayHistory = JSON.parse(savedHistory);
                }
            } catch (e) {
                console.error('Failed to parse replay history:', e);
                alert('Error loading replay data');
                return;
            }
            
            // Find and update the replay
            const replayIndex = replayHistory.findIndex(r => r.id === currentReplayId);
            
            if (replayIndex !== -1) {
                // Update the replay
                replayHistory[replayIndex].name = name;
                replayHistory[replayIndex].folderId = folderId || null;
                
                // Save back to localStorage
                localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
                
                // Close the modal
                document.getElementById('editReplayModal').style.display = 'none';
                
                // Reload the page to refresh the UI
                window.location.reload();
            } else {
                alert('Error: Could not find the replay to update');
            }
        });
    }
});