// FIXED IMPORT SCRIPT
console.log("Fixed import script loaded");

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Wait a bit to ensure all other scripts have run
    setTimeout(function() {
        console.log("Setting up fixed import functionality");
        
        // Get elements
        const importFolderBtn = document.getElementById('importFolderBtn');
        const importFolderPopup = document.getElementById('importFolderPopup');
        const confirmImportBtn = document.getElementById('confirmImportBtn');
        const sharedFolderLink = document.getElementById('sharedFolderLink');
        const closeImportPopup = document.getElementById('closeImportPopup');
        const cancelImportBtn = document.getElementById('cancelImportBtn');
        
        console.log("Import button:", importFolderBtn);
        console.log("Import popup:", importFolderPopup);
        console.log("Confirm button:", confirmImportBtn);
        
        // Setup import button
        if (importFolderBtn && importFolderPopup) {
            // Remove any existing event listeners
            const newImportBtn = importFolderBtn.cloneNode(true);
            importFolderBtn.parentNode.replaceChild(newImportBtn, importFolderBtn);
            
            // Add our fixed event listener
            newImportBtn.addEventListener('click', function(e) {
                console.log("Import button clicked");
                e.preventDefault();
                e.stopPropagation();
                
                // Show the popup
                importFolderPopup.style.display = 'flex';
                if (sharedFolderLink) {
                    sharedFolderLink.focus();
                }
            });
        }
        
        // Setup confirm button
        if (confirmImportBtn) {
            // Remove any existing event listeners
            const newConfirmBtn = confirmImportBtn.cloneNode(true);
            confirmImportBtn.parentNode.replaceChild(newConfirmBtn, confirmImportBtn);
            
            // Add our fixed event listener
            newConfirmBtn.addEventListener('click', function() {
                console.log("Confirm button clicked");
                
                // Get the link
                const link = sharedFolderLink ? sharedFolderLink.value.trim() : "";
                console.log("Link:", link);
                
                if (link) {
                    // Create a folder with the link as name
                    createImportedFolder(link);
                } else {
                    alert("Please enter a shared folder link");
                }
            });
        }
        
        // Setup close buttons
        if (closeImportPopup) {
            closeImportPopup.addEventListener('click', closePopup);
        }
        
        if (cancelImportBtn) {
            cancelImportBtn.addEventListener('click', closePopup);
        }
        
        // Close popup function
        function closePopup() {
            console.log("Closing popup");
            if (importFolderPopup) {
                importFolderPopup.style.display = 'none';
            }
            if (sharedFolderLink) {
                sharedFolderLink.value = '';
            }
        }
        
        // Function to create an imported folder
        function createImportedFolder(link) {
            try {
                console.log("Creating imported folder with link:", link);
                
                // Extract code from link
                let folderName = "Imported Folder";
                if (link.includes('/s/')) {
                    const code = link.split('/s/')[1].split('/')[0].split('?')[0];
                    if (code) {
                        folderName = "Shared Folder " + code;
                    }
                }
                
                // Create folder object
                const newFolder = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    name: folderName,
                    color: "#4aff6b",
                    isShared: true,
                    sharedAt: new Date().toISOString()
                };
                
                console.log("New folder:", newFolder);
                
                // Add to localStorage
                const folders = JSON.parse(localStorage.getItem('folders') || '[]');
                folders.push(newFolder);
                localStorage.setItem('folders', JSON.stringify(folders));
                
                console.log("Folder saved to localStorage");
                
                // Close popup
                closePopup();
                
                // Show success message
                alert("Folder imported successfully!");
                
                // Reload page
                window.location.reload();
                
            } catch (error) {
                console.error("Error creating folder:", error);
                alert("An error occurred. Please try again.");
            }
        }
    }, 500); // Wait 500ms to ensure everything is loaded
});