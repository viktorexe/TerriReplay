// Mobile UI Fixes
document.addEventListener('DOMContentLoaded', function() {
    // Fix scrolling issues when switching to mobile UI
    const mobileUiToggle = document.getElementById('mobileUiToggle');
    
    if (mobileUiToggle) {
        const originalToggleHandler = mobileUiToggle.onclick;
        
        mobileUiToggle.onclick = function(e) {
            // Call the original handler if it exists
            if (originalToggleHandler) {
                originalToggleHandler.call(this, e);
            }
            
            // Force scroll to top to avoid position issues
            window.scrollTo(0, 0);
            
            // Add a small delay to ensure CSS transitions complete
            setTimeout(function() {
                // Force layout recalculation
                document.body.style.display = 'none';
                document.body.offsetHeight; // Force reflow
                document.body.style.display = '';
                
                // Ensure buttons are clickable
                fixButtonClickability();
            }, 100);
        };
    }
    
    // Fix button clickability
    function fixButtonClickability() {
        // Add explicit click handlers to all buttons in mobile UI
        if (document.body.classList.contains('mobile-ui')) {
            const allButtons = document.querySelectorAll('button, .btn, .replay-card, .folder-card');
            
            allButtons.forEach(button => {
                // Remove any existing click handlers by cloning
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Add touchstart handler for mobile devices
                newButton.addEventListener('touchstart', function(e) {
                    // Add active state
                    this.classList.add('active-touch');
                }, { passive: true });
                
                newButton.addEventListener('touchend', function(e) {
                    // Remove active state
                    this.classList.remove('active-touch');
                    
                    // Trigger click after a small delay
                    setTimeout(() => {
                        this.click();
                    }, 10);
                }, { passive: true });
            });
        }
    }
    
    // Fix initial state if mobile UI is already enabled
    if (document.body.classList.contains('mobile-ui')) {
        fixButtonClickability();
    }
    
    // Fix viewport issues on iOS
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
});