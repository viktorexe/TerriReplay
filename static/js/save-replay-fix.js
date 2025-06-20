// Save Replay Fix - Ensures save button works after file upload
document.addEventListener('DOMContentLoaded', function() {
    const saveReplayBtn = document.getElementById('saveReplayBtn');
    
    if (saveReplayBtn) {
        // Remove any existing event listeners and add a new one
        const newSaveBtn = saveReplayBtn.cloneNode(true);
        saveReplayBtn.parentNode.replaceChild(newSaveBtn, saveReplayBtn);
        
        newSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save replay button clicked');
            
            const name = document.getElementById('replayName').value.trim();
            const link = document.getElementById('replayLink').value.trim();
            const folderId = document.getElementById('replayFolder').value || null;
            
            console.log('Replay data:', { name, link, folderId });
            
            if (!link) {
                alert('Please enter a replay link or upload a file');
                return;
            }
            
            const now = new Date();
            const formattedDate = now.toLocaleString();
            
            const newReplay = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                name: name || 'Uploaded Replay',
                link: link,
                date: formattedDate,
                timestamp: now.getTime(),
                folderId: folderId
            };
            
            console.log('Creating replay:', newReplay);
            
            // Get existing replays
            let replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
            
            // Add new replay
            replayHistory.unshift(newReplay);
            
            // Save to localStorage
            localStorage.setItem('replayHistory', JSON.stringify(replayHistory));
            
            console.log('Replay saved successfully');
            
            // Close modal
            document.getElementById('newReplayModal').style.display = 'none';
            
            // Clear form
            document.getElementById('replayName').value = '';
            document.getElementById('replayLink').value = '';
            document.getElementById('replayFolder').value = '';
            
            // Reset file upload
            const fileInput = document.getElementById('replayFileInput');
            if (fileInput) fileInput.value = '';
            
            // Refresh the page to show new replay
            window.location.reload();
        });
    }
});