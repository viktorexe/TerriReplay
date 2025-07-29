document.addEventListener('DOMContentLoaded', () => {
    const replayLinkInput = document.getElementById('replayLink');
    const playReplayBtn = document.getElementById('playReplayBtn');
    const gameModal = document.getElementById('gameModal');
    const gameFrame = document.getElementById('gameFrame');
    const gameTitle = document.getElementById('gameTitle');
    const closeGameModal = document.getElementById('closeGameModal');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const discordBtn = document.getElementById('discordBtn');
    const accountBtn = document.getElementById('accountBtn');
    const accountText = document.getElementById('accountText');
    const mobileUIBtn = document.getElementById('mobileUIBtn');
    const discordModal = document.getElementById('discordModal');
    const accountModal = document.getElementById('accountModal');
    const closeDiscordModal = document.getElementById('closeDiscordModal');
    const closeAccountModal = document.getElementById('closeAccountModal');
    const mobileCSS = document.getElementById('mobileCSS');

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const placeBalanceAboveCheckbox = document.getElementById('placeBalanceAboveCheckbox');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const hideZoomButtonsCheckbox = document.getElementById('hideZoomButtonsCheckbox');
    const fontSizeRadios = document.querySelectorAll('input[name="fontSize"]');
    const resolutionRadios = document.querySelectorAll('input[name="resolution"]');
    const mobileFileUpload = document.getElementById('mobileFileUpload');
    const replayFileInput = document.getElementById('replayFileInput');    
    const loadingModal = document.getElementById('loadingModal');
    const successModal = document.getElementById('successModal');
    const progressFill = document.getElementById('progressFill');
    const successOkBtn = document.getElementById('successOkBtn');    
    const accountOptions = document.getElementById('accountOptions');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const backFromLogin = document.getElementById('backFromLogin');
    const backFromSignup = document.getElementById('backFromSignup');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');
    const loginPasswordToggle = document.getElementById('loginPasswordToggle');
    const signupPasswordToggle = document.getElementById('signupPasswordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    let isMobileUI = false;
    let currentUser = localStorage.getItem('currentUser');
    let savedReplays = JSON.parse(localStorage.getItem('savedReplays') || '[]');
    let savedFolders = JSON.parse(localStorage.getItem('savedFolders') || '[]');
    let currentFolder = '';
    let syncInterval;

    const foldersContainer = document.getElementById('foldersContainer');
    const replaysContainer = document.getElementById('replaysContainer');
    const breadcrumb = document.getElementById('breadcrumb');
    const replaysTitle = document.getElementById('replaysTitle');
    const createFolderBtn = document.getElementById('createFolderBtn');
    if (currentUser) {
        const icon = accountBtn.querySelector('i');
        icon.className = 'fas fa-user-check';
        accountText.textContent = currentUser;
        syncFromDatabase().then(() => {
            startSyncing();
            startContinuousMonitoring();
        }).catch(e => {
            console.error('[INIT] Sync from database failed:', e);
            startSyncing();
            startContinuousMonitoring();
        });
    }
    loadReplays();
    if (createFolderBtn) createFolderBtn.addEventListener('click', showCreateFolderPrompt);    

    if (playReplayBtn) playReplayBtn.addEventListener('click', handlePlayReplay);
    if (replayLinkInput) replayLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePlayReplay();
        }
    });
    if (closeGameModal) closeGameModal.addEventListener('click', closeGameModalFn);
    if (discordBtn) discordBtn.addEventListener('click', () => showModalFn(discordModal));
    if (accountBtn) accountBtn.addEventListener('click', handleAccountClick);
    if (mobileUIBtn) mobileUIBtn.addEventListener('click', toggleMobileUI);
    if (closeDiscordModal) closeDiscordModal.addEventListener('click', () => hideModalFn(discordModal));
    if (closeAccountModal) closeAccountModal.addEventListener('click', () => hideModalFn(accountModal));
    if (settingsBtn) settingsBtn.addEventListener('click', () => showModalFn(settingsModal));
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => hideModalFn(settingsModal));
    if (placeBalanceAboveCheckbox) {
        const saved = localStorage.getItem('placeBalanceAbove');
        placeBalanceAboveCheckbox.checked = saved === 'true';
        placeBalanceAboveCheckbox.addEventListener('change', () => {
            localStorage.setItem('placeBalanceAbove', placeBalanceAboveCheckbox.checked ? 'true' : 'false');
            console.log('💾 [SETTINGS] Place balance above:', placeBalanceAboveCheckbox.checked);
        });
    }
    if (hideZoomButtonsCheckbox) {
        const saved = localStorage.getItem('hideZoomButtons');
        hideZoomButtonsCheckbox.checked = saved === 'true';
        hideZoomButtonsCheckbox.addEventListener('change', () => {
            localStorage.setItem('hideZoomButtons', hideZoomButtonsCheckbox.checked ? 'true' : 'false');
            console.log('💾 [SETTINGS] Hide zoom buttons:', hideZoomButtonsCheckbox.checked);
        });
    }
    // Load font size setting
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    fontSizeRadios.forEach(radio => {
        if (radio.value === savedFontSize) radio.checked = true;
        radio.addEventListener('change', () => {
            if (radio.checked) {
                localStorage.setItem('fontSize', radio.value);
                console.log('💾 [SETTINGS] Font size:', radio.value);
            }
        });
    });
    
    // Load resolution setting
    const savedResolution = localStorage.getItem('resolution') || 'medium';
    resolutionRadios.forEach(radio => {
        if (radio.value === savedResolution) radio.checked = true;
        radio.addEventListener('change', () => {
            if (radio.checked) {
                localStorage.setItem('resolution', radio.value);
                console.log('💾 [SETTINGS] Resolution:', radio.value);
            }
        });
    });
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                localStorage.removeItem('placeBalanceAbove');
                localStorage.removeItem('hideZoomButtons');
                localStorage.removeItem('fontSize');
                localStorage.removeItem('resolution');
                placeBalanceAboveCheckbox.checked = false;
                hideZoomButtonsCheckbox.checked = false;
                document.getElementById('fontMedium').checked = true;
                document.getElementById('resMedium').checked = true;
                console.log('🔄 [SETTINGS] All settings reset to default');
                showCenterAlert('Settings reset successfully', 'success');
            }
        });
    }

    if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginForm);
    if (showSignupBtn) showSignupBtn.addEventListener('click', showSignupForm);
    if (backFromLogin) backFromLogin.addEventListener('click', showAccountOptions);
    if (backFromSignup) backFromSignup.addEventListener('click', showAccountOptions);
    if (loginSubmitBtn) loginSubmitBtn.addEventListener('click', handleLogin);
    if (signupSubmitBtn) signupSubmitBtn.addEventListener('click', handleSignup);
    if (loginPasswordToggle) loginPasswordToggle.addEventListener('click', () => togglePassword('loginPassword', 'loginPasswordToggle'));
    if (signupPasswordToggle) signupPasswordToggle.addEventListener('click', () => togglePassword('signupPassword', 'signupPasswordToggle'));
    if (confirmPasswordToggle) confirmPasswordToggle.addEventListener('click', () => togglePassword('confirmPassword', 'confirmPasswordToggle'));
    if (replayFileInput) replayFileInput.addEventListener('change', handleFileUpload);
    if (successOkBtn) successOkBtn.addEventListener('click', () => hideModalFn(successModal));
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            if (e.target === loadingModal) return;
            hideModalFn(e.target);
            showAccountOptions(); 
        }
    });
    if (document.body.classList.contains('mobile-ui')) {
        mobileFileUpload.style.display = 'block';
    }
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
        const replayName = generateReplayName(replayLink);
        console.log('[PLAY REPLAY] INSTANT SAVE - Generated name:', replayName);
        saveReplayToHistory(replayLink, replayName);
        sendReplayViewWebhook(replayName, replayLink);
        sendReplayPlayedWebhook(replayName, replayLink);
        gameTitle.textContent = 'Loading Replay...';
        showGameModal();
        // Don't show loading spinner so we can see the automation
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
        gameFrame.style.opacity = '0';
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
            const style = iframeDoc.createElement('style');
            style.textContent = `
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
            (async () => {
                console.log('[AUTOMATION] Starting replay automation');
                let automationSuccess = false;
                
                automationSuccess = await tryModernUI(iframeDoc, replayData);
                if (!automationSuccess) {
                    console.log('[AUTOMATION] Modern UI failed, trying canvas UI');
                    automationSuccess = await tryCanvasUI(iframeDoc, replayData);
                }
                if (!automationSuccess) {
                    console.log('[AUTOMATION] Canvas UI failed, trying direct search');
                    automationSuccess = await tryDirectSearch(iframeDoc, replayData);
                }
                if (!automationSuccess) {
                    console.log('[AUTOMATION] All strategies failed, trying emergency fallback');
                    automationSuccess = await emergencyFallback(iframeDoc, replayData);
                }
                if (automationSuccess) {
                    await waitForGameToStart(iframeDoc);
                    loadingSpinner.style.display = 'none';
                    gameFrame.style.opacity = '1';
                    gameTitle.textContent = 'Territorial.io Replay';
                    console.log('[AUTOMATION COMPLETE] Replay loaded successfully');
                } else {
                    console.error('[AUTOMATION] All strategies failed, retrying fallback automation.');
                    await pasteReplayData(iframeDoc, replayData);
                    await waitForGameToStart(iframeDoc);
                    loadingSpinner.style.display = 'none';
                    gameFrame.style.opacity = '1';
                    gameTitle.textContent = 'Territorial.io Replay';
                }
            })();
        } catch (error) {
            console.error('Automation error:', error);
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
    async function tryModernUI(iframeDoc, replayData) {
        try {
            console.log('[MODERN UI] Attempting modern UI automation');
            
            console.log('🔍 [MODERN UI] Looking for Game Menu button...');
            const gameMenuButton = findButtonByText(iframeDoc, 'Game Menu');
            if (!gameMenuButton) {
                console.log('❌ [MODERN UI] Game Menu button not found');
                return false;
            }
            
            console.log('🎮 [MODERN UI] Found Game Menu button, clicking...');
            clickElement(gameMenuButton);
            await sleep(500);
            
            // Check if any settings need to be applied (always check settings to ensure correct state)
            const placeBalanceEnabled = localStorage.getItem('placeBalanceAbove') === 'true';
            const hideZoomButtonsEnabled = localStorage.getItem('hideZoomButtons') === 'true';
            const fontSize = localStorage.getItem('fontSize');
            const resolution = localStorage.getItem('resolution');
            
            // Always go to settings to verify and apply correct state
            console.log('⚙️ [SETTINGS] Checking and applying all settings...');
            try {
                console.log('⚙️ [SETTINGS] Settings need to be applied, going to settings...');
                
                // Find Settings button
                const settingsButton = Array.from(iframeDoc.querySelectorAll('button')).find(btn => 
                    btn.textContent.includes('⚙️') && btn.textContent.includes('Settings')
                );
                if (!settingsButton) {
                    console.log('❌ [SETTINGS] Settings button not found');
                    return false;
                }
                
                console.log('⚙️ [SETTINGS] Found Settings button, clicking...');
                clickElement(settingsButton);
                await sleep(500);
                
                // Check for Accept button that might appear
                const acceptButton = Array.from(iframeDoc.querySelectorAll('button')).find(btn => 
                    btn.textContent.includes('✅') && btn.textContent.includes('Accept')
                );
                if (acceptButton) {
                    console.log('✅ [SETTINGS] Found Accept button, clicking...');
                    clickElement(acceptButton);
                    await sleep(500);
                }
                
                // Apply Place Balance Above setting
                try {
                    const placeBalanceHeader = Array.from(iframeDoc.querySelectorAll('h2')).find(h2 => 
                        h2.textContent && h2.textContent.includes('Place Balance Above')
                    );
                    
                    if (placeBalanceHeader) {
                        let activatedToggle = null;
                        let nextElement = placeBalanceHeader.nextElementSibling;
                        let attempts = 0;
                        
                        while (nextElement && attempts < 10) {
                            if (nextElement.tagName === 'P' && nextElement.textContent && nextElement.textContent.includes('Activated')) {
                                activatedToggle = nextElement;
                                break;
                            }
                            nextElement = nextElement.nextElementSibling;
                            attempts++;
                        }
                        
                        if (activatedToggle) {
                            const currentState = activatedToggle.textContent.trim();
                            const isEnabled = currentState.startsWith('🟢');
                            const isDisabled = currentState.startsWith('⬜');
                            
                            // Click to match desired state
                            if (placeBalanceEnabled && isDisabled) {
                                console.log('✅ [SETTINGS] Enabling Place Balance Above (white -> green)...');
                                clickElement(activatedToggle);
                                await sleep(500);
                            } else if (!placeBalanceEnabled && isEnabled) {
                                console.log('⬜ [SETTINGS] Disabling Place Balance Above (green -> white)...');
                                clickElement(activatedToggle);
                                await sleep(500);
                            } else {
                                console.log('ℹ️ [SETTINGS] Place Balance Above already in correct state');
                            }
                        } else {
                            console.warn('⚠️ [SETTINGS] Place Balance Above toggle not found');
                        }
                    } else {
                        console.warn('⚠️ [SETTINGS] Place Balance Above header not found');
                    }
                } catch (e) {
                    console.error('❌ [SETTINGS] Error applying Place Balance Above:', e);
                }
                
                // Apply Hide Zoom Buttons setting
                try {
                    const hideZoomHeader = Array.from(iframeDoc.querySelectorAll('h2')).find(h2 => 
                        h2.textContent && h2.textContent.includes('Hide Zoom Buttons')
                    );
                    
                    if (hideZoomHeader) {
                        let zoomToggle = null;
                        let nextElement = hideZoomHeader.nextElementSibling;
                        let attempts = 0;
                        
                        while (nextElement && attempts < 10) {
                            if (nextElement.tagName === 'P' && nextElement.textContent && nextElement.textContent.includes('Activated')) {
                                zoomToggle = nextElement;
                                break;
                            }
                            nextElement = nextElement.nextElementSibling;
                            attempts++;
                        }
                        
                        if (zoomToggle) {
                            const currentState = zoomToggle.textContent.trim();
                            const isEnabled = currentState.startsWith('🟢');
                            const isDisabled = currentState.startsWith('⬜');
                            
                            if (hideZoomButtonsEnabled && isDisabled) {
                                console.log('🔍 [SETTINGS] Enabling Hide Zoom Buttons (white -> green)...');
                                clickElement(zoomToggle);
                                await sleep(500);
                            } else if (!hideZoomButtonsEnabled && isEnabled) {
                                console.log('⬜ [SETTINGS] Disabling Hide Zoom Buttons (green -> white)...');
                                clickElement(zoomToggle);
                                await sleep(500);
                            } else {
                                console.log('ℹ️ [SETTINGS] Hide Zoom Buttons already in correct state');
                            }
                        } else {
                            console.warn('⚠️ [SETTINGS] Hide Zoom Buttons toggle not found');
                        }
                    } else {
                        console.warn('⚠️ [SETTINGS] Hide Zoom Buttons header not found');
                    }
                } catch (e) {
                    console.error('❌ [SETTINGS] Error applying Hide Zoom Buttons:', e);
                }
                
                // Apply Font Size setting
                try {
                    const fontSizeHeader = Array.from(iframeDoc.querySelectorAll('h2')).find(h2 => 
                        h2.textContent && h2.textContent.includes('Minimum Font Size')
                    );
                    
                    if (fontSizeHeader) {
                        const fontMap = { medium: 'Medium', small: 'Small', verySmall: 'Very Small' };
                        const targetText = fontMap[fontSize || 'medium'];
                        let foundTarget = false;
                        let attempts = 0;
                        
                        let nextElement = fontSizeHeader.nextElementSibling;
                        while (nextElement && attempts < 20) {
                            if (nextElement.tagName === 'P' && nextElement.textContent) {
                                const text = nextElement.textContent.trim();
                                const isTarget = text.includes(targetText);
                                const isSelected = text.startsWith('🟢');
                                const isUnselected = text.startsWith('⚪');
                                
                                if (isTarget && isUnselected) {
                                    console.log(`🔤 [SETTINGS] Setting font size to ${targetText}...`);
                                    clickElement(nextElement);
                                    await sleep(500);
                                    foundTarget = true;
                                    break;
                                } else if (isTarget && isSelected) {
                                    console.log(`ℹ️ [SETTINGS] Font size ${targetText} already selected`);
                                    foundTarget = true;
                                    break;
                                }
                            }
                            nextElement = nextElement.nextElementSibling;
                            attempts++;
                        }
                        
                        if (!foundTarget) {
                            console.warn(`⚠️ [SETTINGS] Font size option ${targetText} not found`);
                        }
                    } else {
                        console.warn('⚠️ [SETTINGS] Font Size header not found');
                    }
                } catch (e) {
                    console.error('❌ [SETTINGS] Error applying Font Size:', e);
                }
                
                // Apply Resolution setting
                try {
                    const resolutionHeader = Array.from(iframeDoc.querySelectorAll('h2')).find(h2 => 
                        h2.textContent && h2.textContent.includes('Resolution')
                    );
                    
                    if (resolutionHeader) {
                        const resMap = { low: 'Low', medium: 'Medium', high: 'High', veryHigh: 'Very High' };
                        const targetText = resMap[resolution || 'medium'];
                        let foundTarget = false;
                        let attempts = 0;
                        
                        let nextElement = resolutionHeader.nextElementSibling;
                        while (nextElement && attempts < 20) {
                            if (nextElement.tagName === 'P' && nextElement.textContent) {
                                const text = nextElement.textContent.trim();
                                const isTarget = text.includes(targetText);
                                const isSelected = text.startsWith('🟢');
                                const isUnselected = text.startsWith('⚪');
                                
                                if (isTarget && isUnselected) {
                                    console.log(`📺 [SETTINGS] Setting resolution to ${targetText}...`);
                                    clickElement(nextElement);
                                    await sleep(500);
                                    foundTarget = true;
                                    break;
                                } else if (isTarget && isSelected) {
                                    console.log(`ℹ️ [SETTINGS] Resolution ${targetText} already selected`);
                                    foundTarget = true;
                                    break;
                                }
                            }
                            nextElement = nextElement.nextElementSibling;
                            attempts++;
                        }
                        
                        if (!foundTarget) {
                            console.warn(`⚠️ [SETTINGS] Resolution option ${targetText} not found`);
                        }
                    } else {
                        console.warn('⚠️ [SETTINGS] Resolution header not found');
                    }
                } catch (e) {
                    console.error('❌ [SETTINGS] Error applying Resolution:', e);
                }
                
                // Find Back button
                try {
                    const backButton = Array.from(iframeDoc.querySelectorAll('button')).find(btn => 
                        btn.textContent && (btn.textContent.includes('⬅️') || btn.textContent.includes('Back'))
                    );
                    
                    if (!backButton) {
                        console.warn('⚠️ [SETTINGS] Back button not found, trying alternative methods...');
                        // Try pressing Escape key as fallback
                        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
                        iframeDoc.dispatchEvent(escapeEvent);
                        await sleep(500);
                    } else {
                        console.log('⬅️ [SETTINGS] Found Back button, clicking...');
                        clickElement(backButton);
                        await sleep(500);
                    }
                } catch (e) {
                    console.error('❌ [SETTINGS] Error with Back button:', e);
                    // Try Escape key as last resort
                    try {
                        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
                        iframeDoc.dispatchEvent(escapeEvent);
                        await sleep(500);
                    } catch (escapeError) {
                        console.error('❌ [SETTINGS] Escape key fallback failed:', escapeError);
                    }
                }
            } catch (settingsError) {
                console.error('❌ [SETTINGS] Critical error in settings application:', settingsError);
                // Try to exit settings with Escape key
                try {
                    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
                    iframeDoc.dispatchEvent(escapeEvent);
                    await sleep(500);
                } catch (e) {
                    console.error('❌ [SETTINGS] Emergency escape failed:', e);
                }
            }
            
            console.log('🔍 [MODERN UI] Looking for Replay button...');
            const replayButton = findButtonByText(iframeDoc, 'Replay');
            if (!replayButton) {
                console.log('❌ [MODERN UI] Replay button not found');
                return false;
            }
            
            console.log('▶️ [MODERN UI] Found Replay button, clicking...');
            clickElement(replayButton);
            await sleep(500);
            
            return await pasteReplayData(iframeDoc, replayData);
        } catch (e) {
            console.error('[MODERN UI] Error:', e);
            return false;
        }
    }
    async function tryCanvasUI(iframeDoc, replayData) {
        try {
            console.log('[CANVAS UI] Attempting canvas-based UI automation');
            const canvas = iframeDoc.getElementById('canvasA') || iframeDoc.querySelector('canvas');
            if (!canvas) return false;
            console.log('[CANVAS UI] Found canvas:', canvas.id, 'Size:', canvas.width, 'x', canvas.height);
            const strategies = [
                { x: canvas.width - 20, y: 20, desc: 'top-right corner' },
                { x: canvas.width - 30, y: 30, desc: 'top-right inward' },
                { x: canvas.width - 40, y: 15, desc: 'top-right alternative' },
                { x: canvas.width - 25, y: canvas.height / 4, desc: 'right side' }
            ];
            for (const strategy of strategies) {
                console.log(`[CANVAS UI] Trying ${strategy.desc} at (${strategy.x}, ${strategy.y})`);
                const events = [
                    new MouseEvent('mousedown', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new MouseEvent('mouseup', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new MouseEvent('click', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new PointerEvent('pointerdown', { clientX: strategy.x, clientY: strategy.y, bubbles: true }),
                    new PointerEvent('pointerup', { clientX: strategy.x, clientY: strategy.y, bubbles: true })
                ];
                events.forEach(event => {
                    try {
                        canvas.dispatchEvent(event);
                    } catch (e) {
                        console.log('[CANVAS UI] Event dispatch failed:', e.message);
                    }
                });
                await sleep(300);
                if (await checkForReplayUI(iframeDoc, replayData)) {
                    console.log(`[CANVAS UI] Success with ${strategy.desc}`);
                    return true;
                }
            }
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
    async function checkForReplayUI(iframeDoc, replayData) {
        const possibleElements = [
            ...iframeDoc.querySelectorAll('div, button, input, textarea'),
            ...iframeDoc.querySelectorAll('[onclick*="replay"], [onclick*="Replay"]')
        ];
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
        const textInputs = iframeDoc.querySelectorAll('textarea, input[type="text"]');
        if (textInputs.length > 0) {
            console.log('[CANVAS UI] Found text inputs, trying to paste replay data');
            return await pasteReplayData(iframeDoc, replayData);
        }
        return false;
    }
    async function tryDirectSearch(iframeDoc, replayData) {
        try {
            console.log('[DIRECT SEARCH] Attempting aggressive replay detection');
            const existingInputs = iframeDoc.querySelectorAll('textarea, input[type="text"]');
            if (existingInputs.length > 0) {
                console.log('[DIRECT SEARCH] Found existing inputs, trying direct paste');
                if (await pasteReplayData(iframeDoc, replayData)) {
                    return true;
                }
            }
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
                if (await pasteReplayData(iframeDoc, replayData)) {
                    console.log(`[DIRECT SEARCH] Success with ${shortcut.desc}`);
                    return true;
                }
            }
            const canvas = iframeDoc.querySelector('canvas');
            if (canvas) {
                console.log('[DIRECT SEARCH] Trying systematic canvas clicks');
                const clickPositions = [
                    { x: 10, y: 10 }, { x: canvas.width - 10, y: 10 },
                    { x: 10, y: canvas.height - 10 }, { x: canvas.width - 10, y: canvas.height - 10 },
                    { x: canvas.width / 2, y: 10 }, { x: canvas.width / 2, y: canvas.height - 10 },
                    { x: 10, y: canvas.height / 2 }, { x: canvas.width - 10, y: canvas.height / 2 },
                    { x: canvas.width / 2, y: canvas.height / 2 },
                    { x: canvas.width * 0.25, y: canvas.height * 0.25 },
                    { x: canvas.width * 0.75, y: canvas.height * 0.25 },
                    { x: canvas.width * 0.25, y: canvas.height * 0.75 },
                    { x: canvas.width * 0.75, y: canvas.height * 0.75 }
                ];
                for (const pos of clickPositions) {
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
                    }
                }
            }
            
            return false;
        } catch (e) {
            console.error('[DIRECT SEARCH] Error:', e);
            return false;
        }
    }
    async function pasteReplayData(iframeDoc, replayData) {
        try {
            const textarea = iframeDoc.getElementById('textArea1') || 
                           iframeDoc.querySelector('textarea[placeholder*="replay"]') ||
                           iframeDoc.querySelector('textarea[placeholder*="Replay"]') ||
                           iframeDoc.querySelector('textarea') ||
                           iframeDoc.querySelector('input[type="text"]');
            
            if (!textarea) {
                console.log('[PASTE] No textarea found');
                return false;
            }
            const textareaId = textarea.id || 'no-id';
            const textareaTag = textarea.tagName.toLowerCase();
            console.log(`📝 [PASTE] Found ${textareaTag}#${textareaId} - Pasting ${replayData.length} characters`);
            textarea.value = replayData || '';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ [PASTE SUCCESS] Data pasted into ${textareaTag}#${textareaId}`);
            await sleep(100);
            const launchButton = findButtonByText(iframeDoc, 'Launch') ||
                               findButtonByText(iframeDoc, 'Play') ||
                               findButtonByText(iframeDoc, 'Start') ||
                               findButtonByText(iframeDoc, 'GO');
            if (launchButton) {
                console.log('🚀 [LAUNCH] Found launch button, clicking...');
                clickElement(launchButton);
            } else {
                console.log('⚠️ [LAUNCH] No launch button found');
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
        const elementText = element.textContent.trim();
        const elementTag = element.tagName.toLowerCase();
        const elementId = element.id || 'no-id';
        const elementClass = element.className || 'no-class';
        
        console.log(`🖱️ [CLICK] ${elementTag}#${elementId}.${elementClass} - Text: "${elementText}"`);
        
        try {
            element.click();
            console.log(`✅ [CLICK SUCCESS] Successfully clicked: "${elementText}"`);
        } catch (e) {
            try {
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: element.ownerDocument.defaultView
                });
                element.dispatchEvent(event);
                console.log(`✅ [CLICK SUCCESS] Event dispatched for: "${elementText}"`);
            } catch (e2) {
                console.error(`❌ [CLICK FAILED] Failed to click: "${elementText}"`, e2);
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
                setTimeout(async () => {
                    console.log('[LOGIN] Starting sync from database...');
                    try {
                        await syncFromDatabase();
                        console.log('[LOGIN] Sync from database complete');
                    } catch (e) {
                        console.error('[LOGIN] Sync from database failed:', e);
                    }
                    startSyncing();
                    startContinuousMonitoring();
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
            
            hideModalFn(loadingModal);
            
            if (result.success) {
                currentUser = username;
                localStorage.setItem('currentUser', username);
                const icon = accountBtn.querySelector('i');
                icon.className = 'fas fa-user-check';
                accountText.textContent = username;
                hideModalFn(accountModal);
                showSuccessModal(username);
                startSyncing();
                setTimeout(async () => {
                    console.log('[ACCOUNT CREATED] Starting sync systems...');
                    try {
                        await syncFromDatabase();
                        console.log('[ACCOUNT CREATED] Initial sync complete');
                    } catch (e) {
                        console.error('[ACCOUNT CREATED] Initial sync failed:', e);
                    }
                    startSyncing();
                    startContinuousMonitoring();
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

            content = content.replace(/\s+/g, '').trim();
            
            console.log('File content after cleaning:', content);
            console.log('Content length:', content.length);
            
            if (!content) {
                alert('The file appears to be empty after cleaning.');
                replayFileInput.value = '';
                return;
            }
            if (!content.includes('territorial.io')) {
                alert('The file does not contain a Territorial.io link.');
                replayFileInput.value = '';
                return;
            }

            if (!content.startsWith('http')) {
                if (content.startsWith('territorial.io')) {
                    content = 'https://' + content;
                }
            }
            
            console.log('Final content to play:', content);
            replayLinkInput.value = content;
            playReplay(content);
            replayFileInput.value = '';
        };
        
        reader.onerror = function() {
            alert('Error reading file. Please try again.');
            replayFileInput.value = '';
        };
        
        reader.readAsText(file);
    }
    function showLoadingModal(title = 'Loading...', message = 'Please wait...') {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMessage').textContent = message;
        showModalFn(loadingModal);
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 200);
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
        const existingIndex = savedReplays.findIndex(r => r.link === replayLink);
        if (existingIndex !== -1) {
            console.log('[SAVE REPLAY] Replay already exists, updating name');
            savedReplays[existingIndex].name = replayName;
        } else {
            console.log('[SAVE REPLAY] Adding new replay to collection');
            savedReplays.unshift(replay);
        }
        localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
        console.log('[SAVE REPLAY] Saved to localStorage, total replays:', savedReplays.length);
        loadReplays();
        if (currentUser) {
            console.log('[SAVE REPLAY] User logged in, saving to database');
            saveReplayToDatabase(replayName, replayLink);
            setTimeout(() => {
                console.log('[SAVE REPLAY] Starting sync to database');
                syncToDatabase();
            }, 200);
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
                        <button class="action-btn" onclick="window.playReplay('${replay.link}')">
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
            sendFolderCreatedWebhook(name);
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
            const oldName = savedReplays[replayIndex].name;
            const oldFolder = savedReplays[replayIndex].folder;
            console.log('🔧 [EDIT REPLAY] BEFORE - Name:', oldName, 'Folder:', oldFolder);
            console.log('🔧 [EDIT REPLAY] BEFORE - Full replay:', JSON.stringify(savedReplays[replayIndex]));
            savedReplays[replayIndex].name = newName;
            savedReplays[replayIndex].folder = newFolder;
            savedReplays[replayIndex].updated_at = new Date().toISOString();
            console.log('🔧 [EDIT REPLAY] AFTER - Name:', savedReplays[replayIndex].name, 'Folder:', savedReplays[replayIndex].folder);
            console.log('🔧 [EDIT REPLAY] AFTER - Full replay:', JSON.stringify(savedReplays[replayIndex]));
            localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
            console.log('🔧 [EDIT REPLAY] ✅ Saved to localStorage');
            const verifyLocal = JSON.parse(localStorage.getItem('savedReplays') || '[]');
            const verifyReplay = verifyLocal.find(r => r.id === replayId);
            console.log('🔧 [EDIT REPLAY] 🔍 VERIFY localStorage - Found replay:', verifyReplay ? JSON.stringify(verifyReplay) : 'NOT FOUND');
            if (syncInterval) {
                clearInterval(syncInterval);
                console.log('🔧 [EDIT REPLAY] ⏸️ STOPPED sync interval');
            }
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
                console.log('🔧 [EDIT REPLAY] ⏸️ STOPPED monitoring interval');
            }
            
            loadReplays();
            showCenterAlert('Replay updated successfully', 'success');
            
            setTimeout(() => {
                const currentReplays = savedReplays.filter(r => r.folder === currentFolder);
                const uiReplay = currentReplays.find(r => r.id === replayId);
                console.log('🔧 [EDIT REPLAY] 🔍 VERIFY UI - Current folder:', currentFolder);
                console.log('🔧 [EDIT REPLAY] 🔍 VERIFY UI - Found in current view:', uiReplay ? JSON.stringify(uiReplay) : 'NOT IN CURRENT VIEW');
                
                setTimeout(() => {
                    console.log('🔧 [EDIT REPLAY] ▶️ RESTARTING sync systems');
                    if (currentUser) {
                        startSyncing();
                        startContinuousMonitoring();
                        setTimeout(() => syncToDatabase(), 1000);
                    }
                }, 5000);
            }, 500);
            
            if (currentUser) {
                if (oldName !== newName) {
                    console.log('🔧 [EDIT REPLAY] 📢 Name changed, sending webhook');
                    sendReplayRenamedWebhook(oldName, newName);
                }

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
                const oldFolder = savedFolders.find(f => f.id === folderId);
                const oldName = oldFolder ? oldFolder.name : 'Unknown';
                sendFolderRenamedWebhook(oldName, newName);
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
            setTimeout(() => syncToDatabase(), 100);
        }
    }
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
    let monitoringInterval;
    let lastReplayState = '';
    let lastFolderState = '';
    function startContinuousMonitoring() {
        if (monitoringInterval) clearInterval(monitoringInterval);
        console.log('[MONITOR] Starting continuous monitoring for user:', currentUser);
        lastReplayState = JSON.stringify(savedReplays);
        lastFolderState = JSON.stringify(savedFolders);
        monitoringInterval = setInterval(() => {
            if (currentUser) {
                syncToDatabase();
            }
        }, 1000);
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
        console.log('[SYNC] All sync intervals stopped');
    }
    function startSyncing() {
        if (syncInterval) clearInterval(syncInterval);
        console.log('[SYNC] Starting sync system for user:', currentUser);
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
                // Only show critical sync errors, not routine ones
                if (result.message && !result.message.includes('connection') && !result.message.includes('timeout')) {
                    showCustomAlert('Sync failed: ' + result.message, 'error');
                }
            }
        } catch (e) {
            console.error('[SYNC ERROR]:', e);
            // Don't show error alerts for network issues to avoid spam
            if (!e.message.includes('fetch') && !e.message.includes('HTTP')) {
                showCustomAlert('Sync error: ' + e.message, 'error');
            }
        }
    }
    async function syncFromDatabase() {
        if (!currentUser) {
            console.log('[SYNC FROM DB] No current user, skipping');
            return;
        }
        try {
            console.log('[SYNC FROM DB] Starting sync for user:', currentUser);
            const response = await fetch('/api/get_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            if (data.success) {
                const dbReplays = data.replays || [];
                const dbFolders = data.folders || [];
                console.log(`[SYNC FROM DB] Got ${dbReplays.length} replays, ${dbFolders.length} folders from database`);
                
                // Only update if we got valid data
                if (Array.isArray(dbReplays) && Array.isArray(dbFolders)) {
                    savedReplays = dbReplays;
                    savedFolders = dbFolders;
                    localStorage.setItem('savedReplays', JSON.stringify(savedReplays));
                    localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
                    loadReplays();
                    console.log('[SYNC FROM DB] Successfully synced from database');
                } else {
                    console.warn('[SYNC FROM DB] Invalid data format from database');
                }
            } else {
                console.warn('[SYNC FROM DB] Database returned error:', data.message);
            }
        } catch (e) {
            console.error('[SYNC FROM DB] Error:', e);
            throw e;
        }
    }
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
                setTimeout(() => syncFromDatabase(), 1000);
            }
            return result;
        } catch (e) {
            console.error('[FORCE SYNC] Error:', e);
        }
    };
    window.navigateToFolder = navigateToFolder;
    window.showRenameFolderPrompt = showRenameFolderPrompt;
    window.showDeleteFolderPrompt = showDeleteFolderPrompt;
    window.showEditReplayPrompt = showEditReplayPrompt;
    window.showDeleteReplayPrompt = showDeleteReplayPrompt;
    window.playReplay = playReplay;
    window.confirmCreateFolder = null;
    window.cancelCreateFolder = null;
    window.confirmRenameFolder = null;
    window.cancelRenameFolder = null;
    
    async function emergencyFallback(iframeDoc, replayData) {
        try {
            console.log('[EMERGENCY] Starting emergency fallback automation');
            
            // Wait for page to fully load
            await sleep(1000);
            
            // Try to find any textarea or input
            let textarea = iframeDoc.querySelector('textarea') || iframeDoc.querySelector('input[type="text"]');
            
            if (textarea) {
                console.log('[EMERGENCY] Found input field, pasting data directly');
                textarea.value = replayData;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Try to find launch button
                const buttons = Array.from(iframeDoc.querySelectorAll('button'));
                const launchBtn = buttons.find(btn => 
                    btn.textContent.toLowerCase().includes('launch') ||
                    btn.textContent.toLowerCase().includes('play') ||
                    btn.textContent.toLowerCase().includes('start') ||
                    btn.textContent.toLowerCase().includes('go')
                );
                
                if (launchBtn) {
                    console.log('[EMERGENCY] Found launch button, clicking');
                    clickElement(launchBtn);
                }
                
                return true;
            }
            
            // Try clicking anywhere on the page to activate it
            console.log('[EMERGENCY] No input found, trying page activation');
            const body = iframeDoc.body;
            if (body) {
                body.click();
                await sleep(500);
                
                // Try keyboard shortcuts
                const shortcuts = ['r', 'R', 'Escape', 'Enter', 'm', 'M'];
                for (const key of shortcuts) {
                    const keyEvent = new KeyboardEvent('keydown', { key, bubbles: true });
                    iframeDoc.dispatchEvent(keyEvent);
                    body.dispatchEvent(keyEvent);
                    await sleep(200);
                    
                    // Check if textarea appeared
                    textarea = iframeDoc.querySelector('textarea') || iframeDoc.querySelector('input[type="text"]');
                    if (textarea) {
                        console.log(`[EMERGENCY] Textarea appeared after ${key} key`);
                        textarea.value = replayData;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        return true;
                    }
                }
            }
            
            console.log('[EMERGENCY] All emergency strategies failed');
            return false;
            
        } catch (e) {
            console.error('[EMERGENCY] Error:', e);
            return false;
        }
    }


});