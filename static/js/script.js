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
    // Settings modal elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const placeBalanceAboveCheckbox = document.getElementById('placeBalanceAboveCheckbox');
    
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
        const featuredLink = 'https://territorial.io/?replay=-8gi---7UV1-QTsD--0----V2PB6-1--5kN-1-3c-J-0g-53-TF0_-67-7--q-2Z-CK-1V-CV-kV2m-Bc-t-0--5s-RV0j----V--F------R---9B---JN--7iakV077-3-A2--V0HN-3-80--V0T7-3-Al--V077-3-9I--V0HN-3-80--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z4Y3-6s-7V-z-R3-6t--V-z1C3-6sGcV-z5A3-6t--V-r7-3-5s7kV-r133-5sqsV-r2O3-5sYVV-r4-3-5sO7V-r5p3-5sBNV-kJx3-51g7V-kIs3-519-V-kH33-51SkV-kJR3-51O7V-kK-3-51x-V-kLp3-4F8kV-e453-4FSkV-e283-4FCsV-e6c3-4FqcV-e1r3-4FV-V-e1a3-4FVcV-e3J3-4FV-V-e5c3-4FPVV-e4D3-4FNNV-e3R3-4F4kV-e-s3-4FVcV-e3E3-4F2sV-e0Y3-4Fe7V-e6h3-4FvVV-e4D3-4F-cV-e0-3-4FWsV-e2n3-4F6-V-e2a3-4FucV-e6I3-4FkVV-e4F3-4FV7V-e-s3-4F-cV-e4u3-4FS-V-e0-3-4FVsV-e0b3-4FJkV-e343-4F6-V-e0R3-4F4kV-e6O3-4F8NV-e373-4FZcV-e1h3-4F3cV-e593-4FjFV-e6L3-4FusV-e2n3-3at7V-Zos3-3aB-V-Zmr3-3alFV-Zpu3-3aukV-Znn3-3ayNV-Zpv3-3ajNV-Zl73-3a8-V-ZnE3-3ax7V-ZqB3-3alFV-Zlb3-3aX1V-Ol-08bH7-8Cpl-08gD7-8Bnl-08aT7-8C6l-08cz-cg1mFA4-dw19k7U-cw17F7M-Yw18k7O-WB11F78-VJ10F74-VJ10F74-VR1CF7h-WZ13F7I-VR10k74-VJ10F74-Wg1Dk7Q-WJ11k7K-VZ10F72-VZ13F7W-Vo13k7Q-WR10k7E-Vo1DF7G-Vw12F7K-VR13k7A-Vo11k7j-W317k7C-Vo13F78-Vw12k76-WB19k7b-VZ12k76-Vg11k7E-VR13F7K-Y312k78-VR13k7C-WR16F7A-WB16k76-VZ11k78-WZ12F7A-Vg15k76-Vo17F7K-VZ13F76-Vg11k7C-WB11k72-WZ11k7A-WJ12F76-Vg11k76-VR12k74-Vw13F7G-Vo12k7A-XB12k7E-WR12F7A-VR11k7A-VZ11F76-VR10F78-VJ12k7A-VZ11F76-W310F7I-VR11k74-VV';
        playReplay(featuredLink);
    };
    
    window.saveFeaturedReplay = () => {
        const featuredReplay = {
            id: 'featured_cent_wr',
            name: "Cent's World Record",
            link: 'https://territorial.io/?replay=-8gi---7UV1-QTsD--0----V2PB6-1--5kN-1-3c-J-0g-53-TF0_-67-7--q-2Z-CK-1V-CV-kV2m-Bc-t-0--5s-RV0j----V--F------R---9B---JN--7iakV077-3-A2--V0HN-3-80--V0T7-3-Al--V077-3-9I--V0HN-3-80--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z7-3-6t--V-z4Y3-6s-7V-z-R3-6t--V-z1C3-6sGcV-z5A3-6t--V-r7-3-5s7kV-r133-5sqsV-r2O3-5sYVV-r4-3-5sO7V-r5p3-5sBNV-kJx3-51g7V-kIs3-519-V-kH33-51SkV-kJR3-51O7V-kK-3-51x-V-kLp3-4F8kV-e453-4FSkV-e283-4FCsV-e6c3-4FqcV-e1r3-4FV-V-e1a3-4FVcV-e3J3-4FV-V-e5c3-4FPVV-e4D3-4FNNV-e3R3-4F4kV-e-s3-4FVcV-e3E3-4F2sV-e0Y3-4Fe7V-e6h3-4FvVV-e4D3-4F-cV-e0-3-4FWsV-e2n3-4F6-V-e2a3-4FucV-e6I3-4FkVV-e4F3-4FV7V-e-s3-4F-cV-e4u3-4FS-V-e0-3-4FVsV-e0b3-4FJkV-e343-4F6-V-e0R3-4F4kV-e6O3-4F8NV-e373-4FZcV-e1h3-4F3cV-e593-4FjFV-e6L3-4FusV-e2n3-3at7V-Zos3-3aB-V-Zmr3-3alFV-Zpu3-3aukV-Znn3-3ayNV-Zpv3-3ajNV-Zl73-3a8-V-ZnE3-3ax7V-ZqB3-3alFV-Zlb3-3aX1V-Ol-08bH7-8Cpl-08gD7-8Bnl-08aT7-8C6l-08cz-cg1mFA4-dw19k7U-cw17F7M-Yw18k7O-WB11F78-VJ10F74-VJ10F74-VR1CF7h-WZ13F7I-VR10k74-VJ10F74-Wg1Dk7Q-WJ11k7K-VZ10F72-VZ13F7W-Vo13k7Q-WR10k7E-Vo1DF7G-Vw12F7K-VR13k7A-Vo11k7j-W317k7C-Vo13F78-Vw12k76-WB19k7b-VZ12k76-Vg11k7E-VR13F7K-Y312k78-VR13k7C-WR16F7A-WB16k76-VZ11k78-WZ12F7A-Vg15k76-Vo17F7K-VZ13F76-Vg11k7C-WB11k72-WZ11k7A-WJ12F76-Vg11k76-VR12k74-Vw13F7G-Vo12k7A-XB12k7E-WR12F7A-VR11k7A-VZ11F76-VR10F78-VJ12k7A-VZ11F76-W310F7I-VR11k74-VV',
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
    if (settingsBtn) settingsBtn.addEventListener('click', () => showModalFn(settingsModal));
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => hideModalFn(settingsModal));
    // Persist and load 'Place balance above' setting
    if (placeBalanceAboveCheckbox) {
        // Load from localStorage
        const saved = localStorage.getItem('placeBalanceAbove');
        placeBalanceAboveCheckbox.checked = saved === 'true';
        placeBalanceAboveCheckbox.addEventListener('change', () => {
            localStorage.setItem('placeBalanceAbove', placeBalanceAboveCheckbox.checked ? 'true' : 'false');
        });
    }
    
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
            // Execute automation steps with multiple UI layout support
            (async () => {
                console.log('[AUTOMATION] Starting multi-version replay automation');
                let automationSuccess = false;
                let placeBalanceAbove = false;
                try {
                    placeBalanceAbove = localStorage.getItem('placeBalanceAbove') === 'true';
                } catch (e) {}
                if (placeBalanceAbove) {
                    automationSuccess = await automatePlaceBalanceAbove(iframeDoc, replayData);
                    if (!automationSuccess) {
                        console.warn('[AUTOMATION] Place balance above automation failed, falling back to normal.');
                    }
                }
                if (!automationSuccess) {
                    // Strategy 1: Try modern UI (Game Menu button)
                    automationSuccess = await tryModernUI(iframeDoc, replayData);
                    if (!automationSuccess) {
                        console.log('[AUTOMATION] Modern UI failed, trying canvas-based UI');
                        // Strategy 2: Try canvas-based UI (more button on canvas)
                        automationSuccess = await tryCanvasUI(iframeDoc, replayData);
                    }
                    if (!automationSuccess) {
                        console.log('[AUTOMATION] Canvas UI failed, trying direct search');
                        // Strategy 3: Direct search for replay elements
                        automationSuccess = await tryDirectSearch(iframeDoc, replayData);
                    }
                }
                if (automationSuccess) {
                    await waitForGameToStart(iframeDoc);
                    gameTitle.textContent = 'Territorial.io Replay';
                    hideLoading();
                    console.log('[AUTOMATION COMPLETE] Replay loaded successfully');
                } else {
                    console.error('[AUTOMATION] All strategies failed, retrying fallback automation.');
                    // As a last resort, try pasting replay data directly
                    await pasteReplayData(iframeDoc, replayData);
                    await waitForGameToStart(iframeDoc);
                    gameTitle.textContent = 'Territorial.io Replay';
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
    
    // Modern UI automation (Game Menu button approach)
    async function tryModernUI(iframeDoc, replayData) {
        try {
            console.log('[MODERN UI] Attempting modern UI automation');
            
            const gameMenuButton = findButtonByText(iframeDoc, 'Game Menu');
            if (!gameMenuButton) return false;
            
            clickElement(gameMenuButton);
            await sleep(100);
            
            const replayButton = findButtonByText(iframeDoc, 'Replay');
            if (!replayButton) return false;
            
            clickElement(replayButton);
            await sleep(100);
            
            return await pasteReplayData(iframeDoc, replayData);
        } catch (e) {
            console.error('[MODERN UI] Error:', e);
            return false;
        }
    }
    
    // Canvas-based UI automation (more button on canvas)
    async function tryCanvasUI(iframeDoc, replayData) {
        try {
            console.log('[CANVAS UI] Attempting canvas-based UI automation');
            
            // Look for canvas element
            const canvas = iframeDoc.getElementById('canvasA') || iframeDoc.querySelector('canvas');
            if (!canvas) return false;
            
            console.log('[CANVAS UI] Found canvas:', canvas.id, 'Size:', canvas.width, 'x', canvas.height);
            
            // For version-V.html and similar, try multiple click strategies
            const strategies = [
                // Strategy 1: Top-right corner (typical more button location)
                { x: canvas.width - 20, y: 20, desc: 'top-right corner' },
                // Strategy 2: Slightly more inward
                { x: canvas.width - 30, y: 30, desc: 'top-right inward' },
                // Strategy 3: Different corner positions
                { x: canvas.width - 40, y: 15, desc: 'top-right alternative' },
                // Strategy 4: Try clicking on canvas center-right
                { x: canvas.width - 25, y: canvas.height / 4, desc: 'right side' }
            ];
            
            for (const strategy of strategies) {
                console.log(`[CANVAS UI] Trying ${strategy.desc} at (${strategy.x}, ${strategy.y})`);
                
                // Create multiple types of events
                const events = [
                    new MouseEvent('mousedown', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new MouseEvent('mouseup', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new MouseEvent('click', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new PointerEvent('pointerdown', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new PointerEvent('pointerup', { clientX: strategy.x, clientY: strategy.y, bubbles: true })
                ];
                
                // Dispatch all events
                events.forEach(event => {
                    try {
                        canvas.dispatchEvent(event);
                    } catch (e) {
                        console.log('[CANVAS UI] Event dispatch failed:', e.message);
                    }
                });
                
                await sleep(300);
                
                // Check if any UI elements appeared
                if (await checkForReplayUI(iframeDoc, replayData)) {
                    console.log(`[CANVAS UI] Success with ${strategy.desc}`);
                    return true;
                }
            }
            
            // Try keyboard shortcuts as fallback
            console.log('[CANVAS UI] Trying keyboard shortcuts');
            const keyEvents = [
                new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
                new KeyboardEvent('keydown', { key: 'r', bubbles: true }),
                new KeyboardEvent('keydown', { key: 'R', bubbles: true }),
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
            ];
            
            for (const keyEvent of keyEvents) {
                iframeDoc.dispatchEvent(keyEvent);
                await sleep(200);
                if (await checkForReplayUI(iframeDoc, replayData)) {
                    console.log('[CANVAS UI] Success with keyboard shortcut:', keyEvent.key);
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            console.error('[CANVAS UI] Error:', e);
            return false;
        }
    }
    
    // Check for replay UI elements and handle them
    async function checkForReplayUI(iframeDoc, replayData) {
        // Look for any new elements that might be the replay interface
        const possibleElements = [
            ...iframeDoc.querySelectorAll('div, button, input, textarea'),
            ...iframeDoc.querySelectorAll('[onclick*="replay"], [onclick*="Replay"]')
        ];
        
        // Check for text content that suggests replay functionality
        for (const element of possibleElements) {
            const text = element.textContent?.toLowerCase() || '';
            const onclick = element.getAttribute('onclick') || '';
            
            if (text.includes('replay') || onclick.includes('replay')) {
                console.log('[CANVAS UI] Found potential replay element:', element.tagName, text);
                clickElement(element);
                await sleep(200);
                
                if (await pasteReplayData(iframeDoc, replayData)) {
                    return true;
                }
            }
        }
        
        // Check for textarea or input that might accept replay data
        const textInputs = iframeDoc.querySelectorAll('textarea, input[type="text"]');
        if (textInputs.length > 0) {
            console.log('[CANVAS UI] Found text inputs, trying to paste replay data');
            return await pasteReplayData(iframeDoc, replayData);
        }
        
        return false;
    }
    
    // Direct search automation with aggressive replay detection
    async function tryDirectSearch(iframeDoc, replayData) {
        try {
            console.log('[DIRECT SEARCH] Attempting aggressive replay detection');
            
            // Strategy 1: Look for existing textarea/input (replay might already be open)
            const existingInputs = iframeDoc.querySelectorAll('textarea, input[type="text"]');
            if (existingInputs.length > 0) {
                console.log('[DIRECT SEARCH] Found existing inputs, trying direct paste');
                if (await pasteReplayData(iframeDoc, replayData)) {
                    return true;
                }
            }
            
            // Strategy 2: Try all possible keyboard shortcuts
            const shortcuts = [
                { key: 'r', desc: 'R key for replay' },
                { key: 'R', desc: 'Shift+R for replay' },
                { key: 'Escape', desc: 'Escape to open menu' },
                { key: 'Enter', desc: 'Enter to confirm' },
                { key: 'm', desc: 'M for menu' },
                { key: 'M', desc: 'Shift+M for menu' },
                { key: ' ', desc: 'Space bar' },
                { key: 'Tab', desc: 'Tab navigation' }
            ];
            
            for (const shortcut of shortcuts) {
                console.log(`[DIRECT SEARCH] Trying ${shortcut.desc}`);
                
                const keyEvent = new KeyboardEvent('keydown', {
                    key: shortcut.key,
                    bubbles: true,
                    cancelable: true
                });
                
                iframeDoc.dispatchEvent(keyEvent);
                iframeDoc.body?.dispatchEvent(keyEvent);
                
                await sleep(300);
                
                // Check if replay interface appeared
                if (await pasteReplayData(iframeDoc, replayData)) {
                    console.log(`[DIRECT SEARCH] Success with ${shortcut.desc}`);
                    return true;
                }
            }
            
            // Strategy 3: Try clicking everywhere on the screen
            const canvas = iframeDoc.querySelector('canvas');
            if (canvas) {
                console.log('[DIRECT SEARCH] Trying systematic canvas clicks');
                
                const clickPositions = [
                    // Corners
                    { x: 10, y: 10 }, { x: canvas.width - 10, y: 10 },
                    { x: 10, y: canvas.height - 10 }, { x: canvas.width - 10, y: canvas.height - 10 },
                    // Edges
                    { x: canvas.width / 2, y: 10 }, { x: canvas.width / 2, y: canvas.height - 10 },
                    { x: 10, y: canvas.height / 2 }, { x: canvas.width - 10, y: canvas.height / 2 },
                    // Center areas
                    { x: canvas.width / 2, y: canvas.height / 2 },
                    { x: canvas.width * 0.25, y: canvas.height * 0.25 },
                    { x: canvas.width * 0.75, y: canvas.height * 0.25 },
                    { x: canvas.width * 0.25, y: canvas.height * 0.75 },
                    { x: canvas.width * 0.75, y: canvas.height * 0.75 }
                ];
                
                for (const pos of clickPositions) {
                    // Try multiple event types
                    const events = [
                        new MouseEvent('click', { clientX: pos.x, clientY: pos.y, bubbles: true }),
                        new MouseEvent('dblclick', { clientX: pos.x, clientY: pos.y, bubbles: true }),
                        new MouseEvent('contextmenu', { clientX: pos.x, clientY: pos.y, bubbles: true })
                    ];
                    
                    for (const event of events) {
                        canvas.dispatchEvent(event);
                    }
                    
                    await sleep(200);
                    
                    if (await pasteReplayData(iframeDoc, replayData)) {
                        console.log(`[DIRECT SEARCH] Success with canvas click at (${pos.x}, ${pos.y})`);
                        return true;
                    }
                }
            }
            
            // Strategy 4: Try to trigger any JavaScript functions that might open replay
            console.log('[DIRECT SEARCH] Trying to trigger replay functions');
            const win = iframeDoc.defaultView || iframeDoc.parentWindow;
            
            if (win) {
                const possibleFunctions = [
                    'openReplay', 'showReplay', 'replayMode', 'loadReplay',
                    'openMenu', 'showMenu', 'gameMenu', 'mainMenu',
                    'toggleMenu', 'menu', 'replay', 'r', 'R'
                ];
                
                for (const funcName of possibleFunctions) {
                    try {
                        if (typeof win[funcName] === 'function') {
                            console.log(`[DIRECT SEARCH] Calling function: ${funcName}`);
                            win[funcName]();
                            await sleep(300);
                            
                            if (await pasteReplayData(iframeDoc, replayData)) {
                                console.log(`[DIRECT SEARCH] Success with function: ${funcName}`);
                                return true;
                            }
                        }
                    } catch (e) {
                        // Ignore function call errors
                    }
                }
            }
            
            return false;
        } catch (e) {
            console.error('[DIRECT SEARCH] Error:', e);
            return false;
        }
    }
    
    // Paste replay data into textarea
    async function pasteReplayData(iframeDoc, replayData) {
        try {
            // Look for textarea with various selectors
            const textarea = iframeDoc.getElementById('textArea1') || 
                           iframeDoc.querySelector('textarea[placeholder*="replay"]') ||
                           iframeDoc.querySelector('textarea[placeholder*="Replay"]') ||
                           iframeDoc.querySelector('textarea') ||
                           iframeDoc.querySelector('input[type="text"]');
            
            if (!textarea) {
                console.log('[PASTE] No textarea found');
                return false;
            }
            
            console.log('[PASTE] Found textarea, pasting data');
            textarea.value = replayData || '';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
            
            await sleep(100);
            
            // Look for launch/play/start button
            const launchButton = findButtonByText(iframeDoc, 'Launch') ||
                               findButtonByText(iframeDoc, 'Play') ||
                               findButtonByText(iframeDoc, 'Start') ||
                               findButtonByText(iframeDoc, 'GO');
            
            if (launchButton) {
                console.log('[PASTE] Clicking launch button');
                clickElement(launchButton);
            }
            
            return true;
        } catch (e) {
            console.error('[PASTE] Error:', e);
            return false;
        }
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
    
    function findElementByText(doc, text) {
        const elements = Array.from(doc.querySelectorAll('*'));
        const lowerText = text.toLowerCase();
        
        return elements.find(el => {
            const elementText = el.textContent.toLowerCase();
            return elementText.includes(lowerText) && el.offsetWidth > 0 && el.offsetHeight > 0;
        });
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
        const currentReplay = savedReplays.find(r => r.id === replayId);
        const currentFolder = currentReplay ? currentReplay.folder || '' : '';
        
        const folderOptions = savedFolders.map(f => 
            `<option value="${f.id}" ${f.id === currentFolder ? 'selected' : ''}>${f.name}</option>`
        ).join('');
        
        showCustomPrompt('Edit Replay', `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; color: var(--text);">Name:</label>
                <input type="text" id="editReplayName" value="${currentName}" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text);">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; color: var(--text);">Move to folder:</label>
                <select id="editReplayFolder" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text);">
                    <option value="" ${currentFolder === '' ? 'selected' : ''}>No Folder</option>
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
    }
    
    function editReplay(replayId, newName, newFolder) {
        console.log('🔧 [EDIT REPLAY] === STARTING EDIT ===');
        console.log('🔧 [EDIT REPLAY] ID:', replayId, 'New name:', newName, 'New folder:', newFolder);
        console.log('🔧 [EDIT REPLAY] Current savedReplays length:', savedReplays.length);
        
        const replayIndex = savedReplays.findIndex(r => r.id === replayId);
        console.log('🔧 [EDIT REPLAY] Found replay at index:', replayIndex);
        
        if (replayIndex !== -1) {
            // Get old values BEFORE updating
            const oldName = savedReplays[replayIndex].name;
            const oldFolder = savedReplays[replayIndex].folder;
            
            console.log('🔧 [EDIT REPLAY] BEFORE - Name:', oldName, 'Folder:', oldFolder);
            console.log('🔧 [EDIT REPLAY] BEFORE - Full replay:', JSON.stringify(savedReplays[replayIndex]));
            
            // Update the replay
            savedReplays[replayIndex].name = newName;
            savedReplays[replayIndex].folder = newFolder;
            savedReplays[replayIndex].updated_at = new Date().toISOString();
            
            console.log('🔧 [EDIT REPLAY] AFTER - Name:', savedReplays[replayIndex].name, 'Folder:', savedReplays[replayIndex].folder);
            console.log('🔧 [EDIT REPLAY] AFTER - Full replay:', JSON.stringify(savedReplays[replayIndex]));
            
            // Save to localStorage immediately
            localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
            console.log('🔧 [EDIT REPLAY] ✅ Saved to localStorage');
            
            // Verify localStorage save
            const verifyLocal = JSON.parse(localStorage.getItem('savedReplays') || '[]');
            const verifyReplay = verifyLocal.find(r => r.id === replayId);
            console.log('🔧 [EDIT REPLAY] 🔍 VERIFY localStorage - Found replay:', verifyReplay ? JSON.stringify(verifyReplay) : 'NOT FOUND');
            
            // STOP ALL SYNCING TEMPORARILY
            if (syncInterval) {
                clearInterval(syncInterval);
                console.log('🔧 [EDIT REPLAY] ⏸️ STOPPED sync interval');
            }
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
                console.log('🔧 [EDIT REPLAY] ⏸️ STOPPED monitoring interval');
            }
            
            // Update UI
            loadReplays();
            showCenterAlert('Replay updated successfully', 'success');
            
            // Verify UI update
            setTimeout(() => {
                const currentReplays = savedReplays.filter(r => r.folder === currentFolder);
                const uiReplay = currentReplays.find(r => r.id === replayId);
                console.log('🔧 [EDIT REPLAY] 🔍 VERIFY UI - Current folder:', currentFolder);
                console.log('🔧 [EDIT REPLAY] 🔍 VERIFY UI - Found in current view:', uiReplay ? JSON.stringify(uiReplay) : 'NOT IN CURRENT VIEW');
                
                // RESTART SYNCING AFTER 5 SECONDS
                setTimeout(() => {
                    console.log('🔧 [EDIT REPLAY] ▶️ RESTARTING sync systems');
                    if (currentUser) {
                        startSyncing();
                        startContinuousMonitoring();
                        // Force sync after restart
                        setTimeout(() => syncToDatabase(), 1000);
                    }
                }, 5000);
            }, 500);
            
            if (currentUser) {
                // Send webhook if name changed
                if (oldName !== newName) {
                    console.log('🔧 [EDIT REPLAY] 📢 Name changed, sending webhook');
                    sendReplayRenamedWebhook(oldName, newName);
                }
                
                // Force immediate database sync with the updated data
                console.log('🔧 [EDIT REPLAY] 🚀 Force syncing updated replay to database');
                setTimeout(() => {
                    syncToDatabase();
                }, 200);
            }
        } else {
            console.error('🔧 [EDIT REPLAY] ❌ Replay not found with ID:', replayId);
            console.error('🔧 [EDIT REPLAY] ❌ Available IDs:', savedReplays.map(r => r.id));
        }
        
        console.log('🔧 [EDIT REPLAY] === EDIT COMPLETE ===');
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
    let lastReplayState = '';
    let lastFolderState = '';
    
    function startContinuousMonitoring() {
        if (monitoringInterval) clearInterval(monitoringInterval);
        console.log('[MONITOR] Starting continuous monitoring for user:', currentUser);
        // Store initial state as JSON string
        lastReplayState = JSON.stringify(savedReplays);
        lastFolderState = JSON.stringify(savedFolders);
        monitoringInterval = setInterval(() => {
            if (currentUser) {
                // Always sync every second
                syncToDatabase();
            }
        }, 1000); // Sync every second
    }
    
    function stopSyncing() {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
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
    
    async function syncToDatabase() {
        if (!currentUser) {
            return;
        }
        try {
            console.log(`[SYNC TO DB] User: ${currentUser} | Replays: ${savedReplays.length} | Folders: ${savedFolders.length}`);
            
            // Ensure all data has proper structure with updated names
            const cleanReplays = savedReplays.filter(r => r && r.link).map(r => ({
                id: r.id || `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: r.name || 'Unnamed Replay',
                link: r.link,
                folder: r.folder || '',
                created_at: r.created_at || new Date().toISOString(),
                updated_at: r.updated_at || new Date().toISOString()
            }));
            
            const cleanFolders = savedFolders.filter(f => f && f.name).map(f => ({
                id: f.id || `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: f.name,
                created_at: f.created_at || new Date().toISOString(),
                updated_at: f.updated_at || new Date().toISOString()
            }));
            
            console.log(`[SYNC TO DB] Clean data - Replays: ${cleanReplays.length}, Folders: ${cleanFolders.length}`);
            
            // Log first few replays to verify names
            if (cleanReplays.length > 0) {
                console.log(`[SYNC TO DB] Sample replay names:`, cleanReplays.slice(0, 3).map(r => r.name));
            }
            
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
            console.log('🔄 [SYNC FROM DB] === STARTING SYNC FROM DATABASE ===');
            console.log('🔄 [SYNC FROM DB] User:', currentUser);
            console.log('🔄 [SYNC FROM DB] BEFORE - Local replays:', savedReplays.length);
            console.log('🔄 [SYNC FROM DB] BEFORE - Local folders:', savedFolders.length);
            
            const response = await fetch('/api/get_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const dbReplays = data.replays || [];
                const dbFolders = data.folders || [];
                
                console.log('🔄 [SYNC FROM DB] Database has:', dbReplays.length, 'replays,', dbFolders.length, 'folders');
                console.log('🔄 [SYNC FROM DB] Local has:', savedReplays.length, 'replays,', savedFolders.length, 'folders');
                
                // OVERWRITE LOCAL DATA with database data on login/sync
                console.log('🔄 [SYNC FROM DB] ✅ Overwriting local data with database data');
                savedReplays = dbReplays;
                savedFolders = dbFolders;
                localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
                localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
                loadReplays(); // Refresh UI
                
                // Now start aggressive sync from local to backend
                setTimeout(() => {
                    console.log('🔄 [SYNC FROM DB] 🚀 Triggering sync TO database');
                    syncToDatabase();
                }, 500);
                
                console.log('🔄 [SYNC FROM DB] AFTER - Local replays:', savedReplays.length);
                console.log('🔄 [SYNC FROM DB] AFTER - Local folders:', savedFolders.length);
            }
        } catch (e) {
            console.error('🔄 [SYNC FROM DB ERROR]:', e);
        }
        console.log('🔄 [SYNC FROM DB] === SYNC FROM DATABASE COMPLETE ===');
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
    
    // New automation for 'Place balance above' option
    async function automatePlaceBalanceAbove(iframeDoc, replayData) {
        try {
            // Helper to robustly find a button by text, with retries and alternatives
            async function robustFindButton(texts, retries = 5, delay = 200) {
                for (let i = 0; i < retries; i++) {
                    for (const text of texts) {
                        let btn = findButtonByText(iframeDoc, text);
                        if (btn) return btn;
                    }
                    await sleep(delay);
                }
                return null;
            }
            // 1. Click Game Menu button
            const gameMenuBtn = await robustFindButton(['Game Menu', '☰ Game Menu', 'Menu', 'MENU']);
            if (!gameMenuBtn) { console.warn('[AUTOMATION] Could not find Game Menu button'); return false; }
            clickElement(gameMenuBtn);
            await sleep(400);
            // 2. Click Settings button
            const settingsBtn = await robustFindButton(['Settings', '⚙️ Settings', 'SETTINGS']);
            if (!settingsBtn) { console.warn('[AUTOMATION] Could not find Settings button'); return false; }
            clickElement(settingsBtn);
            await sleep(400);
            // 3. Find the <p> with 'Activated' (try multiple times)
            let activatedP = null;
            for (let i = 0; i < 5; i++) {
                activatedP = Array.from(iframeDoc.querySelectorAll('p')).find(p => p.textContent.includes('Activated'));
                if (activatedP) break;
                await sleep(200);
            }
            if (!activatedP) { console.warn('[AUTOMATION] Could not find Activated toggle'); return false; }
            // If not green (emoji is not green), click to enable
            if (activatedP.textContent.trim().startsWith('⬜')) {
                clickElement(activatedP);
                await sleep(400);
            }
            // 4. Click Back button
            const backBtn = await robustFindButton(['Back', '⬅️', '←', 'back']);
            if (!backBtn) { console.warn('[AUTOMATION] Could not find Back button'); return false; }
            clickElement(backBtn);
            await sleep(400);
            // 5. Click Replay button
            const replayBtn = await robustFindButton(['Replay', '▶️ Replay', 'REPLAY']);
            if (!replayBtn) { console.warn('[AUTOMATION] Could not find Replay button'); return false; }
            clickElement(replayBtn);
            await sleep(400);
            // 6. Continue with normal replay paste
            const pasteSuccess = await pasteReplayData(iframeDoc, replayData);
            if (!pasteSuccess) {
                console.warn('[AUTOMATION] Could not paste replay data after activating balance above');
                return false;
            }
            return true;
        } catch (e) {
            console.error('[AUTOMATION] automatePlaceBalanceAbove error:', e);
            return false;
        }
    }
});