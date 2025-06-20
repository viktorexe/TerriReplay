// Track replay plays
document.addEventListener('DOMContentLoaded', function() {
    // Override the original playReplay function to track plays
    if (window.playReplay) {
        const originalPlayReplay = window.playReplay;
        
        window.playReplay = function(replayLink, replayName) {
            // Call the original function
            originalPlayReplay(replayLink, replayName);
            
            // Track the play if user is logged in
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                // Find the replay ID
                const replays = JSON.parse(localStorage.getItem('replayHistory') || '[]');
                const replay = replays.find(r => r.link === replayLink);
                
                if (replay && replay.id) {
                    // Send play tracking request
                    fetch('/api/track_play', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            username: currentUser,
                            replay_id: replay.id
                        })
                    }).catch(error => console.log('Error tracking play:', error));
                    
                    // Update local play count
                    replay.play_count = (replay.play_count || 0) + 1;
                    replay.last_played = new Date().toISOString();
                    localStorage.setItem('replayHistory', JSON.stringify(replays));
                }
            }
        };
    }
});