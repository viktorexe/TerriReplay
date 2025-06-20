// Mobile UI Fix - Direct Event Handling
document.addEventListener('DOMContentLoaded', function() {
    // Wait for main.js to load and setup multiple times to ensure it works
    setTimeout(() => {
        setupMobileFixes();
    }, 100);
    
    setTimeout(() => {
        setupMobileFixes();
    }, 500);
    
    setTimeout(() => {
        setupMobileFixes();
    }, 1000);
});

function setupMobileFixes() {
    // Fix mobile add replay buttons (both in add screen and replays screen)
    const mobileAddReplay = document.getElementById('mobileAddReplay');
    const mobileAddReplayBtn = document.getElementById('mobileAddReplayBtn');
    
    [mobileAddReplay, mobileAddReplayBtn].forEach(button => {
        if (button) {
            // Remove any existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile add replay clicked');
                const modal = document.getElementById('newReplayModal');
                if (modal) {
                    modal.style.display = 'flex';
                    console.log('Modal opened');
                }
            });
        }
    });
    
    // Fix mobile folder clicks with delegation
    const mobileFoldersGrid = document.getElementById('mobileFoldersGrid');
    if (mobileFoldersGrid) {
        mobileFoldersGrid.addEventListener('click', function(e) {
            const folderCard = e.target.closest('.folder-card:not(.create-folder-card)');
            if (folderCard) {
                const folderIcon = e.target.closest('.folder-icon');
                const folderTitle = e.target.closest('.folder-title');
                
                if (folderIcon || folderTitle) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get folder data
                    const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                    const folderName = folderCard.querySelector('.folder-title').textContent;
                    const folder = folders.find(f => f.name === folderName);
                    
                    if (folder && window.openFolderView) {
                        console.log('Opening folder:', folder.name);
                        window.openFolderView(folder);
                    }
                }
            }
        });
    }
    
    // Also add a direct observer for when mobile folders are populated
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.target.id === 'mobileFoldersGrid') {
                // Re-setup folder clicks after content changes
                setTimeout(setupMobileFolderClicks, 50);
            }
        });
    });
    
    if (mobileFoldersGrid) {
        observer.observe(mobileFoldersGrid, { childList: true, subtree: true });
    }
}

function setupMobileFolderClicks() {
    const mobileFolderCards = document.querySelectorAll('#mobileFoldersGrid .folder-card:not(.create-folder-card)');
    const folders = JSON.parse(localStorage.getItem('folders') || '[]');
    
    mobileFolderCards.forEach((folderCard, index) => {
        const folderIcon = folderCard.querySelector('.folder-icon');
        const folderTitle = folderCard.querySelector('.folder-title');
        
        if (folderIcon && folderTitle && folders[index]) {
            const folder = folders[index];
            
            // Remove existing listeners and add new ones
            const newFolderIcon = folderIcon.cloneNode(true);
            const newFolderTitle = folderTitle.cloneNode(true);
            
            folderIcon.parentNode.replaceChild(newFolderIcon, folderIcon);
            folderTitle.parentNode.replaceChild(newFolderTitle, folderTitle);
            
            newFolderIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Folder icon clicked:', folder.name);
                if (window.openFolderView) {
                    window.openFolderView(folder);
                }
            });
            
            newFolderTitle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Folder title clicked:', folder.name);
                if (window.openFolderView) {
                    window.openFolderView(folder);
                }
            });
        }
    });
}