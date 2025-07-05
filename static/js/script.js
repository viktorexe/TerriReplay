document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Replay functionality
    const replayLinkInput = document.getElementById('replayLink');
    const playReplayBtn = document.getElementById('playReplayBtn');
    const gameModal = document.getElementById('gameModal');
    const gameFrame = document.getElementById('gameFrame');
    const gameTitle = document.getElementById('gameTitle');
    const closeGameModal = document.getElementById('closeGameModal');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // DOM Elements - New UI features
    const discordBtn = document.getElementById('discordBtn');
    const accountBtn = document.getElementById('accountBtn');
    const accountText = document.getElementById('accountText');
    const mobileUIBtn = document.getElementById('mobileUIBtn');
    const discordModal = document.getElementById('discordModal');
    const accountModal = document.getElementById('accountModal');
    const closeDiscordModal = document.getElementById('closeDiscordModal');
    const closeAccountModal = document.getElementById('closeAccountModal');
    const mobileCSS = document.getElementById('mobileCSS');
    
    // File upload elements
    const mobileFileUpload = document.getElementById('mobileFileUpload');
    const replayFileInput = document.getElementById('replayFileInput');
    
    // Loading and success modal elements
    const loadingModal = document.getElementById('loadingModal');
    const successModal = document.getElementById('successModal');
    const progressFill = document.getElementById('progressFill');
    const successOkBtn = document.getElementById('successOkBtn');
    
    // Account form elements
    const accountOptions = document.getElementById('accountOptions');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const backFromLogin = document.getElementById('backFromLogin');
    const backFromSignup = document.getElementById('backFromSignup');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');
    
    // Password toggles
    const loginPasswordToggle = document.getElementById('loginPasswordToggle');
    const signupPasswordToggle = document.getElementById('signupPasswordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    
    // State
    let isMobileUI = false;
    let currentUser = localStorage.getItem('currentUser');
    let savedReplays = JSON.parse(localStorage.getItem('savedReplays') || '[]');
    let savedFolders = JSON.parse(localStorage.getItem('savedFolders') || '[]');
    let currentFolder = '';
    let syncInterval;
    
    // Replay management elements
    const foldersContainer = document.getElementById('foldersContainer');
    const replaysContainer = document.getElementById('replaysContainer');
    const breadcrumb = document.getElementById('breadcrumb');
    const replaysTitle = document.getElementById('replaysTitle');
    const createFolderBtn = document.getElementById('createFolderBtn');
    
    // Initialize user state
    if (currentUser) {
        const icon = accountBtn.querySelector('i');
        icon.className = 'fas fa-user-check';
        accountText.textContent = currentUser;
        // Load data from database first, then start syncing
        syncFromDatabase().then(() => {
            startSyncing();
            startContinuousMonitoring();
        });
    }
    
    // Initialize replay management
    loadReplays();
    if (createFolderBtn) createFolderBtn.addEventListener('click', showCreateFolderPrompt);
    
    // Featured replay functions
    window.playFeaturedReplay = () => {
        const featuredLink = 'https://territorial.io/?replay=-8gi---7UV1-QTsD--0----V2PB6-1--5kN-1-3c-J-0g-53-TF0_-67-7--q-2Z-CK-1V-CV-kV2m-Bc-t-0--5s-RV0j----V--F------R---9B---JN--7iakV077-3-A2--V0HN-3-80--V0T7-3-Al--V077-3-9I--V0HN-3-80--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z4Y3-6s-7V-z-R3-6t--V-z1C3-6sGcV-z5A3-6t--V-r7-3-5s7kV-r133-5sqsV-r2O3-5sYVV-r4-3-5sO7V-r5p3-5sBNV-kJx3-51g7V-kIs3-519-V-kH33-51SkV-kJR3-51O7V-kK-3-51x-V-kLp3-4F8kV-e453-4FSkV-e283-4FCsV-e6c3-4FqcV-e1r3-4FV-V-e1a3-4FVcV-e3J3-4FV-V-e5c3-4FPVV-e4D3-4FNNV-e3R3-4F4kV-e-s3-4FVcV-e3E3-4F2sV-e0Y3-4Fe7V-e6h3-4FvVV-e4D3-4F-cV-e0-3-4FWsV-e2n3-4F6-V-e2a3-4FucV-e6I3-4FkVV-e4F3-4FV7V-e-s3-4F-cV-e4u3-4FS-V-e0-3-4FVsV-e0b3-4FJkV-e343-4F6-V-e0R3-4F4kV-e6O3-4F8NV-e373-4FZcV-e1h3-4F3cV-e593-4FjFV-e6L3-4FusV-e2n3-3at7V-Zos3-3aB-V-Zmr3-3alFV-Zpu3-3aukV-Znn3-3ayNV-Zpv3-3ajNV-Zl73-3a8-V-ZnE3-3ax7V-ZqB3-3alFV-Zlb3-3aX1V-Ol-08bH7-8Cpl-08gD7-8Bnl-08aT7-8C6l-08cz-cg1mFA4-dw19k7U-cw17F7M-Yw18k7O-WB11F78-VJ10F74-VJ10F74-VR1CF7h-WZ13F7I-VR10k74-VJ10F74-Wg1Dk7Q-WJ11k7K-VZ10F72-VZ13F7W-Vo13k7Q-WR10k7E-Vo1DF7G-Vw12F7K-VR13k7A-Vo11k7j-W317k7C-Vo13F78-Vw12k76-WB19k7b-VZ12k76-Vg11k7E-VR13F7K-Y312k78-VR13k7C-WR16F7A-WB16k76-VZ11k78-WZ12F7A-Vg15k76-Vo17F7K-VZ13F76-Vg11k7C-WB11k72-WZ11k7A-WJ12F76-Vg11k76-VR12k74-Vw13F7G-Vo12k7A-XB12k7E-WR12F7A-VR11k7A-VZ11F76-VR10F78-VJ12k7A-VZ11F76-W310F7I-VR11k74-VV';
        playReplay(featuredLink);
    };
    
    window.saveFeaturedReplay = () => {
        const featuredReplay = {
            id: 'featured_cent_wr',
            name: "Cent's World Record",
            link: 'https://territorial.io/?replay=-8gi---7UV1-QTsD--0----V2PB6-1--5kN-1-3c-J-0g-53-TF0_-67-7--q-2Z-CK-1V-CV-kV2m-Bc-t-0--5s-RV0j----V--F------R---9B---JN--7iakV077-3-A2--V0HN-3-80--V0T7-3-Al--V077-3-9I--V0HN-3-80--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z4Y3-6s-7V-z-R3-6t--V-z1C3-6sGcV-z5A3-6t--V-r7-3-5s7kV-r133-5sqsV-r2O3-5sYVV-r4-3-5sO7V-r5p3-5sBNV-kJx3-51g7V-kIs3-519-V-kH33-51SkV-kJR3-51O7V-kK-3-51x-V-kLp3-4F8kV-e453-4FSkV-e283-4FCsV-e6c3-4FqcV-e1r3-4FV-V-e1a3-4FVcV-e3J3-4FV-V-e5c3-4FPVV-e4D3-4FNNV-e3R3-4F4kV-e-s3-4FVcV-e3E3-4F2sV-e0Y3-4Fe7V-e6h3-4FvVV-e4D3-4F-cV-e0-3-4FWsV-e2n3-4F6-V-e2a3-4FucV-e6I3-4FkVV-e4F3-4FV7V-e-s3-4F-cV-e4u3-4FS-V-e0-3-4FVsV-e0b3-4FJkV-e343-4F6-V-e0R3-4F4kV-e6O3-4F8NV-e373-4FZcV-e1h3-4F3cV-e593-4FjFV-e6L3-4FusV-e2n3-3at7V-Zos3-3aB-V-Zmr3-3alFV-Zpu3-3aukV-Znn3-3ayNV-Zpv3-3ajNV-Zl73-3a8-V-ZnE3-3ax7V-ZqB3-3alFV-Zlb3-3aX1V-Ol-08bH7-8Cpl-08gD7-8Bnl-08aT7-8C6l-08cz-cg1mFA4-dw19k7U-cw17F7M-Yw18k7O-WB11F78-VJ10F74-VJ10F74-VR1CF7h-WZ13F7I-VR10k74-VJ10F74-Wg1Dk7Q-WJ11k7K-VZ10F72-VZ13F7W-Vo13k7Q-WR10k7E-Vo1DF7G-Vw12F7K-VR13k7A-Vo11k7j-W317k7C-Vo13F78-Vw12k76-WB19k7b-VZ12k76-Vg11k7E-VR13F7K-Y312k78-VR13k7C-WR16F7A-WB16k76-VZ11k78-WZ12F7A-Vg15k76-Vo17F7K-VZ13F76-Vg11k7C-WB11k72-WZ11k7A-WJ12F76-Vg11k76-VR12k74-Vw13F7G-Vo12k7A-XB12k7E-WR12F7A-VR11k7A-VZ11F76-VR10F78-VJ12k7A-VZ11F76-W310F7I-VR11k74-VV',
            folder: '',
            created_at: new Date().toISOString()
        };
        
        savedReplays.unshift(featuredReplay);
        localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
        
        loadReplays();
        showCenterAlert('Featured replay saved!', 'success');
        
        if (currentUser) {
            // Force immediate sync
            setTimeout(() => syncToDatabase(), 100);
        }
    };
    
    // Event Listeners - Replay functionality
    if (playReplayBtn) playReplayBtn.addEventListener('click', handlePlayReplay);
    if (replayLinkInput) replayLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePlayReplay();
        }
    });
    
    if (closeGameModal) closeGameModal.addEventListener('click', closeGameModalFn);
    
    // Event Listeners - New UI features
    if (discordBtn) discordBtn.addEventListener('click', () => showModalFn(discordModal));
    if (accountBtn) accountBtn.addEventListener('click', handleAccountClick);
    if (mobileUIBtn) mobileUIBtn.addEventListener('click', toggleMobileUI);
    if (closeDiscordModal) closeDiscordModal.addEventListener('click', () => hideModalFn(discordModal));
    if (closeAccountModal) closeAccountModal.addEventListener('click', () => hideModalFn(accountModal));
    
    // Account form event listeners
    if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginForm);
    if (showSignupBtn) showSignupBtn.addEventListener('click', showSignupForm);
    if (backFromLogin) backFromLogin.addEventListener('click', showAccountOptions);
    if (backFromSignup) backFromSignup.addEventListener('click', showAccountOptions);
    if (loginSubmitBtn) loginSubmitBtn.addEventListener('click', handleLogin);
    if (signupSubmitBtn) signupSubmitBtn.addEventListener('click', handleSignup);
    
    // Password toggle listeners
    if (loginPasswordToggle) loginPasswordToggle.addEventListener('click', () => togglePassword('loginPassword', 'loginPasswordToggle'));
    if (signupPasswordToggle) signupPasswordToggle.addEventListener('click', () => togglePassword('signupPassword', 'signupPasswordToggle'));
    if (confirmPasswordToggle) confirmPasswordToggle.addEventListener('click', () => togglePassword('confirmPassword', 'confirmPasswordToggle'));
    
    // File upload listener
    if (replayFileInput) replayFileInput.addEventListener('change', handleFileUpload);
    
    // Success modal listener
    if (successOkBtn) successOkBtn.addEventListener('click', () => hideModalFn(successModal));
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            // Don't close loading modal by clicking outside
            if (e.target === loadingModal) return;
            
            hideModalFn(e.target);
            showAccountOptions(); // Reset account modal to options view
        }
    });
    
    // Initialize mobile UI state on page load
    if (document.body.classList.contains('mobile-ui')) {
        mobileFileUpload.style.display = 'block';
    }
    
    // Functions - Replay functionality (unchanged)
    function handlePlayReplay() {
        const replayLink = replayLinkInput.value.trim();
        
        if (!replayLink) {
            alert('Please enter a replay link');
            return;
        }
        
        if (!replayLink.includes('territorial.io') || !replayLink.includes('?')) {
            alert('Please enter a valid Territorial.io replay link');
            return;
        }
        
        playReplay(replayLink);
    }
    
    function playReplay(replayLink) {
        console.log('[PLAY REPLAY] INSTANT SAVE - Starting replay:', replayLink);
        
        // INSTANT SAVE - Save replay immediately when played
        const replayName = generateReplayName(replayLink);
        console.log('[PLAY REPLAY] INSTANT SAVE - Generated name:', replayName);
        
        // Save to localStorage immediately
        saveReplayToHistory(replayLink, replayName);
        
        // Send webhooks immediately
        sendReplayViewWebhook(replayName, replayLink);
        sendReplayPlayedWebhook(replayName, replayLink);
        
        gameTitle.textContent = 'Loading Replay...';
        showGameModal();
        showLoading();
        
        // Get the appropriate game version
        fetch('/get_version', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ replay_link: replayLink }),
        })
        .then(response => response.json())
        .then(data => {
            const replayData = extractReplayData(replayLink);
            loadGameVersion(data.version, replayData, replayLink, replayName);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load replay. Please try again.');
            closeGameModalFn();
        });
    }
    
    function extractReplayData(replayLink) {
        if (!replayLink || !replayLink.includes('?')) {
            return '';
        }
        
        try {
            const parts = replayLink.split('?');
            if (parts.length > 1) {
                let replayData = parts[1];
                
                // Remove parameter names if present
                if (replayData.startsWith('replay=')) {
                    replayData = replayData.replace('replay=', '');
                } else if (replayData.startsWith('data=')) {
                    replayData = replayData.replace('data=', '');
                }
                
                return replayData;
            }
        } catch (e) {
            console.error('Error extracting replay data:', e);
        }
        
        return '';
    }
    
    function loadGameVersion(version, replayData, replayLink, replayName) {
        const versionPath = `/emulated_versions/${version}`;
        gameFrame.src = versionPath;
        
        gameFrame.onload = () => {
            automateReplayPlayback(replayData, replayLink, replayName);
        };
        
        gameFrame.onerror = () => {
            alert('Failed to load game version');
            closeGameModalFn();
        };
    }
    
    function automateReplayPlayback(replayData, replayLink, replayName) {
        try {
            const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
            
            // Add styles to hide UI elements
            const style = iframeDoc.createElement('style');
            style.textContent = `
                .loading, button, textarea, input, select, .menu, .menuContainer, #menuContainer, 
                div[id*="menu"], div[class*="menu"], .ui-container, .ui, .interface, 
                div:not(.game-container):not(.canvas-container):not(#gameCanvas):not(canvas) {
                    opacity: 0 !important;
                    visibility: hidden !important;
                }
                body, html {
                    background-color: black !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                canvas, #gameCanvas, .game-container, .canvas-container {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    width: 100% !important;
                    height: 100% !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                }
            `;
            iframeDoc.head.appendChild(style);
            
            // Execute automation steps
            (async () => {
                // Step 1: Click Game Menu
                const gameMenuButton = findButtonByText(iframeDoc, 'Game Menu');
                if (gameMenuButton) clickElement(gameMenuButton);
                
                await sleep(50);
                
                // Step 2: Click Replay
                const replayButton = findButtonByText(iframeDoc, 'Replay');
                if (replayButton) clickElement(replayButton);
                
                await sleep(50);
                
                // Step 3: Paste replay data
                const textarea = iframeDoc.getElementById('textArea1') || 
                                iframeDoc.querySelector('textarea[placeholder*="replay"]');
                
                if (textarea) {
                    textarea.value = replayData || '';
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    await sleep(50);
                    
                    // Step 4: Click Launch
                    const launchButton = findButtonByText(iframeDoc, 'Launch');
                    if (launchButton) {
                        clickElement(launchButton);
                    }
                    
                    await waitForGameToStart(iframeDoc);
                    
                    gameTitle.textContent = 'Territorial.io Replay';
                    hideLoading();
                    
                    console.log('[AUTOMATION COMPLETE] Replay loaded successfully');
                } else {
                    console.error('Textarea not found');
                    hideLoading();
                }
            })();
            
        } catch (error) {
            console.error('Automation error:', error);
            hideLoading();
        }
    }
    
    async function waitForGameToStart(iframeDoc) {
        const maxAttempts = 100;
        let attempts = 0;
        
        return new Promise(resolve => {
            const checkForGameElements = async () => {
                attempts++;
                
                const canvas = iframeDoc.querySelector('canvas');
                const gameCanvas = iframeDoc.getElementById('gameCanvas');
                const gameContainer = iframeDoc.querySelector('.game-container');
                
                const menuElements = iframeDoc.querySelectorAll('button, .menu, #menuContainer');
                const menuVisible = Array.from(menuElements).some(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                
                if ((canvas || gameCanvas || gameContainer) && !menuVisible || attempts >= maxAttempts) {
                    await sleep(300);
                    resolve();
                } else {
                    setTimeout(checkForGameElements, 50);
                }
            };
            
            checkForGameElements();
        });
    }
    
    function findButtonByText(doc, text) {
        const elements = Array.from(doc.querySelectorAll('button'));
        
        let button = elements.find(el => el.textContent.trim() === text);
        
        if (!button) {
            button = elements.find(el => el.textContent.includes(text));
        }
        
        if (!button) {
            const lowerText = text.toLowerCase();
            button = elements.find(el => el.textContent.toLowerCase().includes(lowerText));
        }
        
        return button;
    }
    
    function clickElement(element) {
        try {
            element.click();
        } catch (e) {
            try {
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: element.ownerDocument.defaultView
                });
                element.dispatchEvent(event);
            } catch (e2) {
                console.error('Failed to click element:', e2);
            }
        }
    }
    
    function showGameModal() {
        gameModal.style.display = 'flex';
    }
    
    function closeGameModalFn() {
        gameModal.style.display = 'none';
        gameFrame.src = 'about:blank';
    }
    
    function showLoading() {
        loadingSpinner.style.display = 'block';
        gameFrame.style.opacity = '0';
    }
    
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        gameFrame.style.opacity = '1';
    }
    
    function toggleMinimize() {
        const content = gameModal.querySelector('.modal-content');
        content.classList.toggle('minimized');
    }
    
    function toggleFullscreen() {
        const content = gameModal.querySelector('.modal-content');
        content.classList.toggle('fullscreen');
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // New UI Functions
    function showModalFn(modal) {
        modal.style.display = 'flex';
    }
    
    function hideModalFn(modal) {
        modal.style.display = 'none';
    }
    
    function toggleMobileUI() {
        isMobileUI = !isMobileUI;
        
        if (isMobileUI) {
            document.body.classList.add('mobile-ui');
            mobileCSS.disabled = false;
            mobileUIBtn.innerHTML = '<i class="fas fa-desktop"></i> Desktop UI';
            mobileFileUpload.style.display = 'block';
        } else {
            document.body.classList.remove('mobile-ui');
            mobileCSS.disabled = true;
            mobileUIBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Mobile UI';
            mobileFileUpload.style.display = 'none';
        }
    }
    
    // Account Functions
    function showLoginForm() {
        accountOptions.style.display = 'none';
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
    
    function showSignupForm() {
        accountOptions.style.display = 'none';
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
    
    function showAccountOptions() {
        accountOptions.style.display = 'flex';
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
    }
    
    function togglePassword(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    async function handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            showCustomAlert('Please fill in all fields', 'error');
            return;
        }
        
        showLoadingModal('Logging In...', 'Verifying your credentials...');
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            hideModalFn(loadingModal);
            
            if (result.success) {
                currentUser = username;
                localStorage.setItem('currentUser', username);
                const icon = accountBtn.querySelector('i');
                icon.className = 'fas fa-user-check';
                accountText.textContent = username;
                hideModalFn(accountModal);
                showCustomAlert(`Welcome back, ${username}!`, 'success');
                startSyncing();
                // Force immediate sync of local data to database after login
                setTimeout(() => {
                    console.log('[LOGIN] Starting aggressive sync...');
                    syncToDatabase();
                    // Debug the user after login
                    setTimeout(() => {
                        window.debugUser();
                    }, 2000);
                }, 500);
            } else {
                showCustomAlert(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            hideModalFn(loadingModal);
            showCustomAlert('Login failed. Please try again.', 'error');
        }
    }
    
    async function handleSignup() {
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!username || !password || !confirmPassword) {
            showCustomAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showCustomAlert('Passwords do not match', 'error');
            return;
        }
        
        if (username.length < 3) {
            showCustomAlert('Username must be at least 3 characters', 'error');
            return;
        }
        
        if (password.length < 6) {
            showCustomAlert('Password must be at least 6 characters', 'error');
            return;
        }
        
        showLoadingModal('Creating Account...', 'Setting up your new account...');
        
        try {
            const response = await fetch('/api/create_account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            // Hide loading modal
            hideModalFn(loadingModal);
            
            if (result.success) {
                currentUser = username;
                localStorage.setItem('currentUser', username);
                const icon = accountBtn.querySelector('i');
                icon.className = 'fas fa-user-check';
                accountText.textContent = username;
                hideModalFn(accountModal);
                
                // Show success modal instead of alert
                showSuccessModal(username);
                startSyncing();
                // Force immediate sync of local data to database after account creation
                setTimeout(() => {
                    console.log('[ACCOUNT CREATED] Starting aggressive sync...');
                    syncToDatabase();
                    // Debug the user after account creation
                    setTimeout(() => {
                        window.debugUser();
                    }, 2000);
                }, 500);
            } else {
                showCustomAlert(result.message || 'Account creation failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            hideModalFn(loadingModal);
            showCustomAlert('Account creation failed. Please try again.', 'error');
        }
    }
    
    // File Upload Function
    function handleFileUpload(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }
        
        if (!file.name.endsWith('.txt')) {
            alert('Please select a .txt file');
            replayFileInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            let content = e.target.result;
            
            if (!content) {
                alert('The file is empty. Please select a file with a replay link.');
                replayFileInput.value = '';
                return;
            }
            
            // Clean the content - remove all whitespace, newlines, etc.
            content = content.replace(/\s+/g, '').trim();
            
            console.log('File content after cleaning:', content);
            console.log('Content length:', content.length);
            
            if (!content) {
                alert('The file appears to be empty after cleaning.');
                replayFileInput.value = '';
                return;
            }
            
            // More flexible validation - just check if it contains territorial.io
            if (!content.includes('territorial.io')) {
                alert('The file does not contain a Territorial.io link.');
                replayFileInput.value = '';
                return;
            }
            
            // If it doesn't start with http, add it
            if (!content.startsWith('http')) {
                if (content.startsWith('territorial.io')) {
                    content = 'https://' + content;
                }
            }
            
            console.log('Final content to play:', content);
            
            // Set the replay link and play it
            replayLinkInput.value = content;
            playReplay(content);
            
            // Clear the file input
            replayFileInput.value = '';
        };
        
        reader.onerror = function() {
            alert('Error reading file. Please try again.');
            replayFileInput.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Loading Modal Functions
    function showLoadingModal(title = 'Loading...', message = 'Please wait...') {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMessage').textContent = message;
        showModalFn(loadingModal);
        
        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 200);
        
        // Store interval to clear it later
        loadingModal.progressInterval = interval;
    }
    
    function hideLoadingModal() {
        if (loadingModal.progressInterval) {
            clearInterval(loadingModal.progressInterval);
        }
        progressFill.style.width = '100%';
        setTimeout(() => {
            hideModalFn(loadingModal);
            progressFill.style.width = '0%';
        }, 300);
    }
    
    function showSuccessModal(username) {
        document.getElementById('successTitle').textContent = 'Welcome to TerriReplay!';
        document.getElementById('successMessage').textContent = `Hi ${username}! Your account has been created successfully. You are now logged in and ready to start watching Territorial.io replays.`;
        showModalFn(successModal);
    }
    
    function handleAccountClick() {
        if (currentUser) {
            showLogoutPrompt();
        } else {
            showModalFn(accountModal);
        }
    }
    
    function showLogoutPrompt() {
        const logoutModal = document.createElement('div');
        logoutModal.className = 'modal';
        logoutModal.style.display = 'flex';
        logoutModal.innerHTML = `
            <div class="modal-content" style="width: 350px; max-width: 90%;">
                <div class="modal-header">
                    <h3><i class="fas fa-sign-out-alt"></i> Sign Out</h3>
                </div>
                <div class="modal-body">
                    <p>You are currently logged in as <strong>${currentUser}</strong>.</p>
                    <p>Are you sure you want to sign out?</p>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="form-btn" style="flex: 1; background: var(--secondary);" onclick="confirmLogout()">
                            <i class="fas fa-sign-out-alt"></i> Sign Out
                        </button>
                        <button class="back-btn" style="flex: 1;" onclick="cancelLogout()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(logoutModal);
        
        window.confirmLogout = () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            const icon = accountBtn.querySelector('i');
            const text = accountBtn.querySelector('#accountText');
            icon.className = 'fas fa-user';
            text.textContent = 'Account';
            document.body.removeChild(logoutModal);
            showCenterAlert('Signed out successfully', 'success');
            stopSyncing();
        };
        
        window.cancelLogout = () => {
            document.body.removeChild(logoutModal);
        };
    }
    
    function showCustomAlert(message, type = 'info') {
        // Remove any existing alerts first
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => {
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        });
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card);
            color: var(--text);
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.1rem;
            font-weight: 500;
            border: 2px solid ${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--secondary)' : 'var(--primary)'};
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        alertDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}" style="color: ${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--secondary)' : 'var(--primary)'}; font-size: 1.3rem;"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
        
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                alertDiv.style.opacity = '0';
                alertDiv.style.transform = 'translate(-50%, -50%) scale(0.9)';
                setTimeout(() => {
                    if (document.body.contains(alertDiv)) {
                        document.body.removeChild(alertDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    function showCenterAlert(message, type = 'success') {
        const centerAlert = document.createElement('div');
        centerAlert.className = 'center-alert';
        centerAlert.innerHTML = `
            <div class="center-alert-content ${type}">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(centerAlert);
        
        setTimeout(() => centerAlert.classList.add('show'), 100);
        setTimeout(() => {
            if (document.body.contains(centerAlert)) {
                centerAlert.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(centerAlert)) {
                        document.body.removeChild(centerAlert);
                    }
                }, 300);
            }
        }, 2000);
    }
    
    // Advanced Replay Functions
    function generateReplayName(replayLink) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `Replay ${dateStr} ${timeStr}`;
    }
    
    function sendReplayViewWebhook(replayName, replayLink) {
        if (!replayLink) return;
        
        fetch('/api/replay_viewed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser,
                replay_name: replayName,
                replay_link: replayLink
            })
        }).catch(e => console.error('Webhook error:', e));
    }
    
    async function saveReplayToDatabase(replayName, replayLink) {
        if (!currentUser || !replayLink) return;
        
        try {
            console.log('[SAVE TO DB] Attempting to save:', replayName);
            const response = await fetch('/api/save_replay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser,
                    replay_name: replayName,
                    replay_link: replayLink
                })
            });
            
            const result = await response.json();
            if (result.success) {
                if (!result.already_exists) {
                    console.log('[SAVE TO DB] Replay saved to database successfully');
                } else {
                    console.log('[SAVE TO DB] Replay already exists in database');
                }
            } else {
                console.error('[SAVE TO DB] Failed:', result.message);
            }
        } catch (e) {
            console.error('[SAVE TO DB] Error:', e);
        }
    }
    
    function sendReplayPlayedWebhook(replayName, replayLink) {
        if (!replayLink) return;
        
        fetch('/api/action_webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'replay_played',
                username: currentUser,
                replay_name: replayName,
                replay_link: replayLink
            })
        }).catch(e => console.error('Replay played webhook error:', e));
    }
    
    function sendFolderCreatedWebhook(folderName) {
        fetch('/api/action_webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'folder_created',
                username: currentUser,
                folder_name: folderName
            })
        }).catch(e => console.error('Folder created webhook error:', e));
    }
    
    function sendFolderRenamedWebhook(oldName, newName) {
        fetch('/api/action_webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'folder_renamed',
                username: currentUser,
                old_name: oldName,
                new_name: newName
            })
        }).catch(e => console.error('Folder renamed webhook error:', e));
    }
    
    function sendReplayRenamedWebhook(oldName, newName) {
        fetch('/api/action_webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'replay_renamed',
                username: currentUser,
                old_name: oldName,
                new_name: newName
            })
        }).catch(e => console.error('Replay renamed webhook error:', e));
    }
    
    // Replay Management Functions
    function saveReplayToHistory(replayLink, replayName = 'Replay') {
        console.log('[SAVE REPLAY] Starting save process for:', replayName);
        
        const replayId = Date.now().toString();
        const replay = {
            id: replayId,
            name: replayName,
            link: replayLink,
            folder: currentFolder,
            created_at: new Date().toISOString()
        };
        
        // Check if replay already exists
        const existingIndex = savedReplays.findIndex(r => r.link === replayLink);
        if (existingIndex !== -1) {
            console.log('[SAVE REPLAY] Replay already exists, updating name');
            savedReplays[existingIndex].name = replayName;
        } else {
            console.log('[SAVE REPLAY] Adding new replay to collection');
            savedReplays.unshift(replay);
        }
        
        // Save to local storage immediately
        localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
        console.log('[SAVE REPLAY] Saved to localStorage, total replays:', savedReplays.length);
        
        // Update UI
        loadReplays();
        
        if (currentUser) {
            console.log('[SAVE REPLAY] User logged in, saving to database');
            // Save directly to database with multiple attempts
            saveReplayToDatabase(replayName, replayLink);
            // Force immediate aggressive sync
            setTimeout(() => {
                console.log('[SAVE REPLAY] Starting sync to database');
                syncToDatabase();
            }, 200);
            // Backup sync after 2 seconds
            setTimeout(() => {
                console.log('[SAVE REPLAY] Backup sync to database');
                syncToDatabase();
            }, 2000);
        } else {
            console.log('[SAVE REPLAY] No user logged in, only local save');
        }
    }
    
    function loadReplays() {
        loadFolders();
        loadReplaysList();
    }
    
    function loadFolders() {
        if (!foldersContainer) return;
        
        if (savedFolders.length === 0) {
            foldersContainer.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No folders yet</p><span>Create folders to organize your replays</span></div>';
            return;
        }
        
        let html = '';
        savedFolders.forEach(folder => {
            const replayCount = savedReplays.filter(r => r.folder === folder.id).length;
            html += `
                <div class="folder-card" onclick="navigateToFolder('${folder.id}')">
                    <div class="folder-header">
                        <i class="fas fa-folder folder-icon"></i>
                        <span class="folder-name">${folder.name}</span>
                        <div class="folder-actions" onclick="event.stopPropagation()">
                            <button class="action-btn" onclick="showRenameFolderPrompt('${folder.id}', '${folder.name}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="showDeleteFolderPrompt('${folder.id}', '${folder.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="folder-meta">${replayCount} replays • Created ${new Date(folder.created_at).toLocaleDateString()}</div>
                </div>
            `;
        });
        
        foldersContainer.innerHTML = html;
    }
    
    function loadReplaysList() {
        if (!replaysContainer) return;
        
        const currentReplays = savedReplays.filter(r => r.folder === currentFolder);
        
        // Update breadcrumb and title
        if (currentFolder) {
            const folder = savedFolders.find(f => f.id === currentFolder);
            const folderName = folder ? folder.name : 'Unknown Folder';
            replaysTitle.textContent = folderName;
            breadcrumb.innerHTML = `
                <span class="breadcrumb-item" onclick="navigateToFolder('')"><i class="fas fa-home"></i> My Replays</span>
                <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
                <span>${folderName}</span>
            `;
            breadcrumb.style.display = 'flex';
        } else {
            replaysTitle.textContent = 'My Replays';
            breadcrumb.style.display = 'none';
        }
        
        if (currentReplays.length === 0) {
            replaysContainer.innerHTML = '<div class="empty-state"><i class="fas fa-play-circle"></i><p>No replays here</p><span>Play replays to save them or move existing ones here</span></div>';
            return;
        }
        
        let html = '';
        currentReplays.forEach(replay => {
            html += `
                <div class="replay-card">
                    <div class="replay-header">
                        <i class="fas fa-play-circle replay-icon"></i>
                        <span class="replay-name">${replay.name}</span>
                    </div>
                    <div class="replay-actions">
                        <button class="action-btn" onclick="playReplay('${replay.link}')">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="action-btn" onclick="showEditReplayPrompt('${replay.id}', '${replay.name}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="showDeleteReplayPrompt('${replay.id}', '${replay.name}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <div class="replay-meta">Created: ${new Date(replay.created_at).toLocaleDateString()}</div>
                </div>
            `;
        });
        
        replaysContainer.innerHTML = html;
    }
    
    function showCreateFolderPrompt() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px; max-width: 90%;">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-plus"></i> Create New Folder</h3>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text); font-weight: 500;">Folder Name:</label>
                        <input type="text" id="folderNameInput" placeholder="Enter folder name..." style="width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 1rem; box-sizing: border-box;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="modal-btn confirm" onclick="confirmCreateFolder()">
                            <i class="fas fa-check"></i> Create
                        </button>
                        <button class="modal-btn cancel" onclick="cancelCreateFolder()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('folderNameInput');
        input.focus();
        
        window.confirmCreateFolder = () => {
            const name = input.value.trim();
            if (name) {
                createFolder(name);
                document.body.removeChild(modal);
            }
        };
        
        window.cancelCreateFolder = () => {
            document.body.removeChild(modal);
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.confirmCreateFolder();
            }
        });
    }
    
    function createFolder(name) {
        const folderId = Date.now().toString();
        const folder = {
            id: folderId,
            name: name,
            created_at: new Date().toISOString()
        };
        
        savedFolders.push(folder);
        localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
        
        loadReplays();
        showCenterAlert('Folder created successfully', 'success');
        
        if (currentUser) {
            // Send webhook
            sendFolderCreatedWebhook(name);
            // Force immediate sync
            setTimeout(() => syncToDatabase(), 100);
        }
    }
    
    function navigateToFolder(folderId) {
        currentFolder = folderId;
        loadReplaysList();
    }
    
    function showEditReplayPrompt(replayId, currentName) {
        const folderOptions = savedFolders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
        const currentReplay = savedReplays.find(r => r.id === replayId);
        
        showCustomPrompt('Edit Replay', `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; color: var(--text);">Name:</label>
                <input type="text" id="editReplayName" value="${currentName}" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text);">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; color: var(--text);">Move to folder:</label>
                <select id="editReplayFolder" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text);">
                    <option value="">No Folder</option>
                    ${folderOptions}
                </select>
            </div>
        `, '', (result) => {
            const name = document.getElementById('editReplayName').value.trim();
            const folder = document.getElementById('editReplayFolder').value;
            if (name) {
                editReplay(replayId, name, folder);
            }
        });
        
        setTimeout(() => {
            const folderSelect = document.getElementById('editReplayFolder');
            if (folderSelect && currentReplay) {
                folderSelect.value = currentReplay.folder || '';
            }
        }, 100);
    }
    
    function editReplay(replayId, newName, newFolder) {
        console.log('[EDIT REPLAY] Starting edit for ID:', replayId, 'New name:', newName, 'New folder:', newFolder);
        
        const replayIndex = savedReplays.findIndex(r => r.id === replayId);
        if (replayIndex !== -1) {
            // Get old values BEFORE updating
            const oldName = savedReplays[replayIndex].name;
            const oldFolder = savedReplays[replayIndex].folder;
            
            console.log('[EDIT REPLAY] Old name:', oldName, 'Old folder:', oldFolder);
            
            // Update the replay
            savedReplays[replayIndex].name = newName;
            savedReplays[replayIndex].folder = newFolder;
            savedReplays[replayIndex].updated_at = new Date().toISOString();
            
            // Save to localStorage immediately
            localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
            console.log('[EDIT REPLAY] Updated localStorage');
            
            // Update UI
            loadReplays();
            showCenterAlert('Replay updated successfully', 'success');
            
            if (currentUser) {
                // Send webhook if name changed
                if (oldName !== newName) {
                    console.log('[EDIT REPLAY] Name changed, sending webhook');
                    sendReplayRenamedWebhook(oldName, newName);
                }
                
                // Force immediate sync
                console.log('[EDIT REPLAY] Triggering database sync');
                setTimeout(() => syncToDatabase(), 100);
            }
        } else {
            console.error('[EDIT REPLAY] Replay not found with ID:', replayId);
        }
    }
    
    function showDeleteReplayPrompt(replayId, replayName) {
        showCustomConfirm('Delete Replay', `Are you sure you want to delete "${replayName}"?`, () => {
            deleteReplay(replayId);
        });
    }
    
    function deleteReplay(replayId) {
        savedReplays = savedReplays.filter(r => r.id !== replayId);
        localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
        
        loadReplays();
        showCenterAlert('Replay deleted successfully', 'success');
        
        if (currentUser) {
            // Force immediate sync
            setTimeout(() => syncToDatabase(), 100);
        }
    }
    
    function showRenameFolderPrompt(folderId, currentName) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px; max-width: 90%;">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Rename Folder</h3>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text); font-weight: 500;">Folder Name:</label>
                        <input type="text" id="renameFolderInput" value="${currentName}" style="width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 1rem; box-sizing: border-box;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="modal-btn confirm" onclick="confirmRenameFolder()">
                            <i class="fas fa-check"></i> Rename
                        </button>
                        <button class="modal-btn cancel" onclick="cancelRenameFolder()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('renameFolderInput');
        input.focus();
        input.select();
        
        window.confirmRenameFolder = () => {
            const name = input.value.trim();
            if (name) {
                renameFolder(folderId, name);
                document.body.removeChild(modal);
            }
        };
        
        window.cancelRenameFolder = () => {
            document.body.removeChild(modal);
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.confirmRenameFolder();
            }
        });
    }
    
    function renameFolder(folderId, newName) {
        const folderIndex = savedFolders.findIndex(f => f.id === folderId);
        if (folderIndex !== -1) {
            savedFolders[folderIndex].name = newName;
            localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
            
            loadReplays();
            showCenterAlert('Folder renamed successfully', 'success');
            
            if (currentUser) {
                // Send webhook
                const oldFolder = savedFolders.find(f => f.id === folderId);
                const oldName = oldFolder ? oldFolder.name : 'Unknown';
                sendFolderRenamedWebhook(oldName, newName);
                // Force immediate sync
                setTimeout(() => syncToDatabase(), 100);
            }
        }
    }
    
    function showDeleteFolderPrompt(folderId, folderName) {
        showCustomConfirm('Delete Folder', `Are you sure you want to delete "${folderName}"? All replays in this folder will be moved to the root.`, () => {
            deleteFolder(folderId);
        });
    }
    
    function deleteFolder(folderId) {
        savedFolders = savedFolders.filter(f => f.id !== folderId);
        savedReplays.forEach(r => {
            if (r.folder === folderId) r.folder = '';
        });
        
        localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
        localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
        
        if (currentFolder === folderId) {
            currentFolder = '';
        }
        
        loadReplays();
        showCenterAlert('Folder deleted successfully', 'success');
        
        if (currentUser) {
            // Force immediate sync
            setTimeout(() => syncToDatabase(), 100);
        }
    }
    
    // Custom Prompt Functions
    function showCustomPrompt(title, message, defaultValue = '', callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px; max-width: 90%;">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">${message}</div>
                    <div style="display: flex; gap: 10px;">
                        <button class="modal-btn confirm" onclick="confirmPrompt()">
                            <i class="fas fa-check"></i> Confirm
                        </button>
                        <button class="modal-btn cancel" onclick="cancelPrompt()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.confirmPrompt = () => {
            callback(true);
            document.body.removeChild(modal);
        };
        
        window.cancelPrompt = () => {
            document.body.removeChild(modal);
        };
    }
    
    function showCustomConfirm(title, message, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px; max-width: 90%;">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle" style="color: var(--secondary);"></i> ${title}</h3>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 20px;">${message}</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="modal-btn confirm" style="background: var(--secondary) !important; border-color: var(--secondary) !important;" onclick="confirmAction()">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="modal-btn cancel" onclick="cancelAction()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.confirmAction = () => {
            callback();
            document.body.removeChild(modal);
        };
        
        window.cancelAction = () => {
            document.body.removeChild(modal);
        };
    }
    
    // Continuous monitoring system
    let monitoringInterval;
    let lastReplayCount = 0;
    let lastFolderCount = 0;
    
    function startContinuousMonitoring() {
        if (monitoringInterval) clearInterval(monitoringInterval);
        console.log('[MONITOR] Starting continuous monitoring for user:', currentUser);
        
        lastReplayCount = savedReplays.length;
        lastFolderCount = savedFolders.length;
        
        monitoringInterval = setInterval(() => {
            if (currentUser) {
                checkForChanges();
            }
        }, 1000); // Check every second
    }
    
    function checkForChanges() {
        const currentReplayCount = savedReplays.length;
        const currentFolderCount = savedFolders.length;
        
        if (currentReplayCount !== lastReplayCount) {
            console.log('[MONITOR] Replay count changed:', lastReplayCount, '->', currentReplayCount);
            syncToDatabase();
            lastReplayCount = currentReplayCount;
        }
        
        if (currentFolderCount !== lastFolderCount) {
            console.log('[MONITOR] Folder count changed:', lastFolderCount, '->', currentFolderCount);
            syncToDatabase();
            lastFolderCount = currentFolderCount;
        }
    }
    
    // Advanced Sync Functions
    function startSyncing() {
        if (syncInterval) clearInterval(syncInterval);
        console.log('[SYNC] Starting sync system for user:', currentUser);
        // Sync every 3 seconds to ensure data is backed up
        syncInterval = setInterval(() => {
            if (currentUser) {
                syncToDatabase();
            }
        }, 3000);
    }
    
    function stopSyncing() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
    }
    
    async function syncToDatabase() {
        if (!currentUser) {
            return;
        }
        try {
            console.log(`[SYNC TO DB] User: ${currentUser} | Replays: ${savedReplays.length} | Folders: ${savedFolders.length}`);
            
            // Ensure all data has proper structure
            const cleanReplays = savedReplays.filter(r => r && r.link).map(r => ({
                id: r.id || `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: r.name || 'Unnamed Replay',
                link: r.link,
                folder: r.folder || '',
                created_at: r.created_at || new Date().toISOString()
            }));
            
            const cleanFolders = savedFolders.filter(f => f && f.name).map(f => ({
                id: f.id || `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: f.name,
                created_at: f.created_at || new Date().toISOString()
            }));
            
            console.log(`[SYNC TO DB] Clean data - Replays: ${cleanReplays.length}, Folders: ${cleanFolders.length}`);
            
            const syncData = {
                username: currentUser,
                replays: cleanReplays,
                folders: cleanFolders
            };
            
            const response = await fetch('/api/sync_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syncData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (result.success) {
                console.log(`[SYNC SUCCESS] MongoDB updated: ${result.synced_replays || 0} replays, ${result.synced_folders || 0} folders`);
                console.log(`[SYNC VERIFICATION] Database contains: ${result.verified_replays || 0} replays, ${result.verified_folders || 0} folders`);
                
                if (result.replay_errors && result.replay_errors.length > 0) {
                    console.warn('[SYNC WARNINGS] Replay errors:', result.replay_errors);
                }
                if (result.folder_errors && result.folder_errors.length > 0) {
                    console.warn('[SYNC WARNINGS] Folder errors:', result.folder_errors);
                }
            } else {
                console.error('[SYNC FAILED]:', result.message);
                showCustomAlert('Sync failed: ' + result.message, 'error');
            }
        } catch (e) {
            console.error('[SYNC ERROR]:', e);
            showCustomAlert('Sync error: ' + e.message, 'error');
        }
    }
    
    async function syncFromDatabase() {
        if (!currentUser) {
            console.log('[SYNC] No current user, skipping sync from DB');
            return;
        }
        try {
            console.log(`[SYNC FROM DB] Getting data for user: ${currentUser}`);
            const response = await fetch('/api/get_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const dbReplays = data.replays || [];
                const dbFolders = data.folders || [];
                
                console.log(`[SYNC FROM DB] Found ${dbReplays.length} replays, ${dbFolders.length} folders in database`);
                
                // Always update from database to ensure consistency
                console.log('[SYNC FROM DB] Updating local data from database');
                savedReplays = dbReplays;
                savedFolders = dbFolders;
                localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
                localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
                loadReplays();
                
                console.log(`[SYNC FROM DB] Local storage updated with ${savedReplays.length} replays, ${savedFolders.length} folders`);
            }
        } catch (e) {
            console.error('[SYNC FROM DB ERROR]:', e);
        }
    }
    
    // Debug functions for troubleshooting
    window.debugUser = async function() {
        if (!currentUser) {
            console.log('[DEBUG] No current user');
            return;
        }
        
        try {
            const response = await fetch('/api/debug_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser })
            });
            const result = await response.json();
            console.log('[DEBUG] User debug info:', result);
            return result;
        } catch (e) {
            console.error('[DEBUG] Error:', e);
        }
    };
    
    window.forceSync = async function() {
        if (!currentUser) {
            console.log('[FORCE SYNC] No current user');
            return;
        }
        
        try {
            const response = await fetch('/api/force_sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser })
            });
            const result = await response.json();
            console.log('[FORCE SYNC] Result:', result);
            if (result.success) {
                showCustomAlert('Force sync completed! Check Discord for webhook.', 'success');
                // Refresh data
                setTimeout(() => syncFromDatabase(), 1000);
            }
            return result;
        } catch (e) {
            console.error('[FORCE SYNC] Error:', e);
        }
    };
    
    // Make functions global for onclick handlers
    window.navigateToFolder = navigateToFolder;
    window.showRenameFolderPrompt = showRenameFolderPrompt;
    window.showDeleteFolderPrompt = showDeleteFolderPrompt;
    window.showEditReplayPrompt = showEditReplayPrompt;
    window.showDeleteReplayPrompt = showDeleteReplayPrompt;
    window.confirmCreateFolder = null;
    window.cancelCreateFolder = null;
    window.confirmRenameFolder = null;
    window.cancelRenameFolder = null;
});