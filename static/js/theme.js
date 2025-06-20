document.addEventListener('DOMContentLoaded', () => {
    const themeOptionsBtn = document.getElementById('themeOptionsBtn');
    const themeOptionsModal = document.getElementById('themeOptionsModal');
    const closeThemeModal = document.getElementById('closeThemeModal');
    const closeThemeBtn = document.getElementById('closeThemeBtn');
    const themeOptions = document.querySelectorAll('.theme-option');
    const html = document.documentElement;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        updateActiveTheme(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        html.setAttribute('data-theme', defaultTheme);
        updateActiveTheme(defaultTheme);
    }
    
    // Themes button functionality
    if (themeOptionsBtn) {
        themeOptionsBtn.addEventListener('click', () => {
            themeOptionsModal.style.display = 'flex';
        });
    }
    
    // Close modal buttons
    if (closeThemeModal) {
        closeThemeModal.addEventListener('click', () => {
            themeOptionsModal.style.display = 'none';
        });
    }
    
    if (closeThemeBtn) {
        closeThemeBtn.addEventListener('click', () => {
            themeOptionsModal.style.display = 'none';
        });
    }
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateActiveTheme(theme);
        });
    });
    
    // Update active theme
    function updateActiveTheme(theme) {
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
});