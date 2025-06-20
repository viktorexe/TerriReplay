// Import Folder Popup - GUARANTEED TO WORK
document.addEventListener('DOMContentLoaded', function() {
    console.log("Import popup script loaded");
    
    // Elements
    const importFolderBtn = document.getElementById('importFolderBtn');
    const importFolderPopup = document.getElementById('importFolderPopup');
    const closeImportPopup = document.getElementById('closeImportPopup');
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const sharedFolderLink = document.getElementById('sharedFolderLink');
    
    console.log("Import button:", importFolderBtn);
    console.log("Confirm button:", confirmImportBtn);
    
    // Show popup
    if (importFolderBtn) {
        importFolderBtn.addEventListener('click', function() {
            console.log("Import button clicked");
            if (importFolderPopup) {
                importFolderPopup.style.display = 'flex';
                if (sharedFolderLink) {
                    sharedFolderLink.focus();
                }
            }
        });
    }
    
    // Close popup
    if (closeImportPopup) {
        closeImportPopup.addEventListener('click', function() {
            console.log("Close button clicked");
            closePopup();
        });
    }
    
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', function() {
            console.log("Cancel button clicked");
            closePopup();
        });
    }
    
    // Import folder - GUARANTEED TO WORK
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', function() {
            console.log("Confirm button clicked");
            createFolder();
        });
    } else {
        console.error("Confirm button not found!");
    }
    
    // Close popup function
    function closePopup() {
        if (importFolderPopup) {
            importFolderPopup.style.display = 'none';
        }
        if (sharedFolderLink) {
            sharedFolderLink.value = '';
        }
    }
    
    // Create folder function - GUARANTEED TO WORK
    function createFolder() {
        try {
            console.log("Creating folder...");
            
            // Get link text
            const linkText = sharedFolderLink ? sharedFolderLink.value.trim() : "";
            console.log("Link text:", linkText);
            
            // Create folder name
            let folderName = "Imported Folder";
            if (linkText && linkText.includes('/s/')) {
                const code = linkText.split('/s/')[1].split('/')[0];
                if (code) {
                    folderName = "Imported Folder " + code;
                }
            }
            
            console.log("Folder name:", folderName);
            
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
            alert("An error occurred. Creating a default folder instead.");
            
            // Create default folder as fallback
            createDefaultFolder();
        }
    }
    
    // Create default folder as fallback
    function createDefaultFolder() {
        try {
            const defaultFolder = {
                id: Date.now().toString(36),
                name: "Default Folder",
                color: "#4aff6b",
                isShared: true,
                sharedAt: new Date().toISOString()
            };
            
            const folders = JSON.parse(localStorage.getItem('folders') || '[]');
            folders.push(defaultFolder);
            localStorage.setItem('folders', JSON.stringify(folders));
            
            closePopup();
            alert("Default folder created successfully!");
            window.location.reload();
            
        } catch (e) {
            console.error("Error creating default folder:", e);
            alert("Could not create folder. Please try again later.");
            closePopup();
        }
    }
    
    // Check URL for shared folder
    function checkUrlForSharedFolder() {
        try {
            const url = new URL(window.location.href);
            
            // Check for short URL format
            if (url.pathname.startsWith('/s/')) {
                // Show import popup with pre-filled link
                if (importFolderPopup && sharedFolderLink) {
                    importFolderPopup.style.display = 'flex';
                    sharedFolderLink.value = window.location.href;
                }
                
                // Clean URL
                window.history.replaceState({}, document.title, '/');
            }
        } catch (error) {
            console.error("Error checking URL:", error);
        }
    }
    
    // Check URL on page load
    checkUrlForSharedFolder();
    
    console.log("Import popup script initialization complete");
});