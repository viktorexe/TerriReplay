// File Upload Handler for Replay Links
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('replayFileInput');
    const replayLinkInput = document.getElementById('replayLink');
    const fileUploadLabel = document.querySelector('.file-upload-label');
    const fileUploadText = document.querySelector('.file-upload-text');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (!file) {
                resetFileUpload();
                return;
            }
            
            // Check file type
            if (!file.name.toLowerCase().endsWith('.txt')) {
                alert('Please select a .txt file');
                resetFileUpload();
                return;
            }
            
            // Check file size (max 1MB)
            if (file.size > 1024 * 1024) {
                alert('File is too large. Maximum size is 1MB');
                resetFileUpload();
                return;
            }
            
            // Read file content
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const content = event.target.result.trim();
                    
                    // Extract replay link from content
                    const replayLink = extractReplayLink(content);
                    
                    if (replayLink) {
                        // Set the replay link in the input
                        if (replayLinkInput) {
                            replayLinkInput.value = replayLink;
                            
                            // Trigger input event to notify other scripts
                            replayLinkInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        
                        // Update UI to show success
                        if (fileUploadLabel) {
                            fileUploadLabel.innerHTML = '<i class="fas fa-check"></i> File Loaded';
                            fileUploadLabel.style.backgroundColor = '#4aff6b';
                        }
                        if (fileUploadText) {
                            fileUploadText.textContent = `Loaded: ${file.name}`;
                            fileUploadText.style.color = '#4aff6b';
                        }
                        
                        // Auto-generate replay name if empty
                        const replayNameInput = document.getElementById('replayName');
                        if (replayNameInput && !replayNameInput.value.trim()) {
                            const fileName = file.name.replace('.txt', '').replace(/[^a-zA-Z0-9\s]/g, '');
                            replayNameInput.value = fileName || 'Uploaded Replay';
                        }
                        
                        console.log('File upload successful, replay link set:', replayLink.substring(0, 50) + '...');
                    } else {
                        alert('Could not process the file content');
                        resetFileUpload();
                    }
                } catch (error) {
                    console.error('Error reading file:', error);
                    alert('Error reading file. Please try again.');
                    resetFileUpload();
                }
            };
            
            reader.onerror = function() {
                alert('Error reading file. Please try again.');
                resetFileUpload();
            };
            
            reader.readAsText(file);
        });
    }
    
    // Reset file upload UI
    function resetFileUpload() {
        if (fileInput) fileInput.value = '';
        if (fileUploadLabel) {
            fileUploadLabel.innerHTML = '<i class="fas fa-upload"></i> Upload Replay File';
            fileUploadLabel.style.backgroundColor = '';
        }
        if (fileUploadText) {
            fileUploadText.textContent = 'Upload a .txt file containing the replay link';
            fileUploadText.style.color = '';
        }
    }
    
    // Extract replay link from file content
    function extractReplayLink(content) {
        console.log('File content:', content);
        
        // Clean the content
        const trimmedContent = content.trim();
        
        // If content is empty, return null
        if (!trimmedContent) {
            console.log('Empty content');
            return null;
        }
        
        // If content already looks like a complete URL, use it
        if (trimmedContent.startsWith('http')) {
            console.log('Found complete URL:', trimmedContent);
            return trimmedContent;
        }
        
        // If content contains territorial.io, add https://
        if (trimmedContent.includes('territorial.io')) {
            const link = 'https://' + trimmedContent;
            console.log('Added https to URL:', link);
            return link;
        }
        
        // If content starts with replay?, add domain
        if (trimmedContent.startsWith('replay?')) {
            const link = 'https://territorial.io/' + trimmedContent;
            console.log('Added domain to URL:', link);
            return link;
        }
        
        // If content contains ? and looks like query parameters, assume it's replay data
        if (trimmedContent.includes('?')) {
            const link = 'https://territorial.io/replay?' + trimmedContent.split('?').pop();
            console.log('Constructed URL from query:', link);
            return link;
        }
        
        // If content looks like base64 or encoded data, assume it's replay data
        if (trimmedContent.length > 50 && !trimmedContent.includes(' ')) {
            const link = 'https://territorial.io/replay?data=' + trimmedContent;
            console.log('Constructed URL from data:', link);
            return link;
        }
        
        // As last resort, try to use the content as-is with territorial.io domain
        const link = 'https://territorial.io/replay?data=' + encodeURIComponent(trimmedContent);
        console.log('Final attempt URL:', link);
        return link;
    }
    
    // Clear file upload when replay link is manually entered
    if (replayLinkInput) {
        replayLinkInput.addEventListener('input', function() {
            if (this.value.trim()) {
                resetFileUpload();
            }
        });
    }
    
    // Reset file upload when modal is closed
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || e.target.classList.contains('cancel-modal')) {
            resetFileUpload();
        }
    });
});