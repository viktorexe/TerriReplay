// MOBILE FIX - DIRECT APPROACH
document.addEventListener('DOMContentLoaded', function() {
    // Force fix mobile issues every time mobile UI is activated
    document.addEventListener('click', function(e) {
        if (e.target.id === 'mobileUiToggle' || e.target.closest('#mobileUiToggle')) {
            setTimeout(forceMobileFix, 200);
        }
    });
    
    // Also fix on page load
    setTimeout(forceMobileFix, 500);
    setTimeout(forceMobileFix, 1000);
    setTimeout(forceMobileFix, 2000);
});

function forceMobileFix() {
    console.log('FORCING MOBILE FIX');
    
    // 1. FIX ADD REPLAY BUTTONS
    const addReplayButtons = [
        document.getElementById('mobileAddReplay'),
        document.getElementById('mobileAddReplayBtn')
    ];
    
    addReplayButtons.forEach(btn => {
        if (btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('ADD REPLAY CLICKED');
                document.getElementById('newReplayModal').style.display = 'flex';
                return false;
            };
        }
    });
    
    // 2. FIX FOLDER CLICKS - BRUTE FORCE
    const mobileFoldersGrid = document.getElementById('mobileFoldersGrid');
    if (mobileFoldersGrid) {
        // Remove all existing click handlers
        mobileFoldersGrid.onclick = null;
        
        // Add new click handler
        mobileFoldersGrid.onclick = function(e) {
            console.log('FOLDER GRID CLICKED', e.target);
            
            const folderCard = e.target.closest('.folder-card');
            if (folderCard && !folderCard.classList.contains('create-folder-card')) {
                const folderTitle = folderCard.querySelector('.folder-title');
                if (folderTitle) {
                    const folderName = folderTitle.textContent.trim();
                    console.log('FOLDER NAME:', folderName);
                    
                    const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                    const folder = folders.find(f => f.name === folderName);
                    
                    if (folder) {
                        console.log('OPENING FOLDER:', folder);
                        
                        // Direct call to openFolderView
                        if (window.openFolderView) {
                            window.openFolderView(folder);
                        } else {
                            // Manual folder view opening
                            document.getElementById('folderViewTitle').textContent = folder.name;
                            
                            // Get replays in folder
                            const replayHistory = JSON.parse(localStorage.getItem('replayHistory') || '[]');
                            const folderReplays = replayHistory.filter(r => r.folderId === folder.id);
                            
                            const folderReplaysGrid = document.getElementById('folderReplaysGrid');
                            folderReplaysGrid.innerHTML = '';
                            
                            if (folderReplays.length === 0) {
                                folderReplaysGrid.innerHTML = '<div class="empty-state"><i class="fas fa-film"></i><p>No replays in this folder</p></div>';
                            } else {
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
                                        </div>
                                    `;
                                    replayCard.onclick = () => {
                                        if (window.playReplay) {
                                            window.playReplay(replay.link, replay.name);
                                        }
                                    };
                                    folderReplaysGrid.appendChild(replayCard);
                                });
                            }
                            
                            document.getElementById('folderViewModal').style.display = 'flex';
                        }
                    }
                }
            }
        };
    }
    
    // 3. ALSO FIX INDIVIDUAL FOLDER CARDS
    const folderCards = document.querySelectorAll('#mobileFoldersGrid .folder-card:not(.create-folder-card)');
    folderCards.forEach(card => {
        card.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const folderTitle = card.querySelector('.folder-title');
            if (folderTitle) {
                const folderName = folderTitle.textContent.trim();
                const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                const folder = folders.find(f => f.name === folderName);
                
                if (folder) {
                    console.log('DIRECT FOLDER CLICK:', folder);
                    if (window.openFolderView) {
                        window.openFolderView(folder);
                    }
                }
            }
        };
    });
    
    console.log('MOBILE FIX COMPLETE');
}

// Also run when mobile screens change
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('mobile-nav-item') && e.target.getAttribute('data-view') === 'folders') {
        setTimeout(forceMobileFix, 100);
    }
});