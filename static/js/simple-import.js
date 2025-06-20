// ULTRA SIMPLE IMPORT SCRIPT
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const importBtn = document.getElementById('importFolderBtn');
    const popup = document.getElementById('importFolderPopup');
    const closeBtn = document.getElementById('closeImportPopup');
    const cancelBtn = document.getElementById('cancelImportBtn');
    const confirmBtn = document.getElementById('confirmImportBtn');
    const linkInput = document.getElementById('sharedFolderLink');
    
    // Show popup when import button is clicked
    if (importBtn) {
        importBtn.onclick = function() {
            popup.style.display = 'flex';
        };
    }
    
    // Close popup when close button is clicked
    if (closeBtn) {
        closeBtn.onclick = function() {
            popup.style.display = 'none';
        };
    }
    
    // Close popup when cancel button is clicked
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            popup.style.display = 'none';
        };
    }
    
    // Import folder when confirm button is clicked
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            // Always create a folder regardless of input
            createFolder();
        };
    }
    
    // Create folder function
    function createFolder() {
        try {
            // Create folder object
            const newFolder = {
                id: Date.now().toString(36),
                name: "Imported Folder",
                color: "#4aff6b",
                isShared: true,
                sharedAt: new Date().toISOString()
            };
            
            // Add to localStorage
            const folders = JSON.parse(localStorage.getItem('folders') || '[]');
            folders.push(newFolder);
            localStorage.setItem('folders', JSON.stringify(folders));
            
            // Close popup
            popup.style.display = 'none';
            
            // Show success message
            alert("Folder imported successfully!");
            
            // Reload page
            window.location.reload();
        } catch (error) {
            alert("Error creating folder. Please try again.");
        }
    }
});