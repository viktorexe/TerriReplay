// Fix for share functionality
document.addEventListener('DOMContentLoaded', function() {
    // Copy share link button
    const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    if (copyShareLinkBtn) {
        copyShareLinkBtn.addEventListener('click', function() {
            const folderShareLink = document.getElementById('folderShareLink');
            if (folderShareLink) {
                folderShareLink.select();
                document.execCommand('copy');
                
                // Show success message
                alert('Link copied to clipboard!');
            }
        });
    }
    
    // Close share modal button
    const closeShareBtn = document.getElementById('closeShareBtn');
    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', function() {
            document.getElementById('shareFolderModal').style.display = 'none';
        });
    }
    
    // Close share modal button (X)
    const closeShareFolderModal = document.getElementById('closeShareFolderModal');
    if (closeShareFolderModal) {
        closeShareFolderModal.addEventListener('click', function() {
            document.getElementById('shareFolderModal').style.display = 'none';
        });
    }
    
    // Social share buttons
    const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
    if (shareWhatsappBtn) {
        shareWhatsappBtn.addEventListener('click', function() {
            shareViaApp('whatsapp');
        });
    }
    
    const shareTelegramBtn = document.getElementById('shareTelegramBtn');
    if (shareTelegramBtn) {
        shareTelegramBtn.addEventListener('click', function() {
            shareViaApp('telegram');
        });
    }
    
    const shareTwitterBtn = document.getElementById('shareTwitterBtn');
    if (shareTwitterBtn) {
        shareTwitterBtn.addEventListener('click', function() {
            shareViaApp('twitter');
        });
    }
    
    // Share via app function
    function shareViaApp(app) {
        const folderShareLink = document.getElementById('folderShareLink');
        if (!folderShareLink) return;
        
        const url = folderShareLink.value;
        const text = "Check out my replay folder on TerriReplay!";
        
        let shareUrl = '';
        
        switch (app) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }
    
    // Import folder modal button
    const importFolderModalBtn = document.getElementById('importFolderModalBtn');
    if (importFolderModalBtn) {
        importFolderModalBtn.addEventListener('click', function() {
            document.getElementById('importFolderModal').style.display = 'flex';
        });
    }
    
    // Close import folder modal button
    const closeImportFolderModal = document.getElementById('closeImportFolderModal');
    if (closeImportFolderModal) {
        closeImportFolderModal.addEventListener('click', function() {
            document.getElementById('importFolderModal').style.display = 'none';
        });
    }
    
    // Cancel import folder button
    const cancelImportFolderBtn = document.getElementById('cancelImportFolderBtn');
    if (cancelImportFolderBtn) {
        cancelImportFolderBtn.addEventListener('click', function() {
            document.getElementById('importFolderModal').style.display = 'none';
        });
    }
});