document.addEventListener('DOMContentLoaded', () => {
    // Advertisement carousel functionality
    const carousel = document.querySelector('.ad-carousel');
    const carouselTrack = document.querySelector('.ad-carousel-track');
    const ads = document.querySelectorAll('.ad-card');
    const indicators = document.querySelector('.carousel-indicators');
    
    let currentIndex = 0;
    let autoplayInterval;
    const autoplayDelay = 3500; // 3.5 seconds
    
    // Initialize carousel
    function initCarousel() {
        // Create indicators
        ads.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        // Set initial positions
        updateCarousel();
        
        // Start autoplay
        startAutoplay();
        
        // Add touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left
                nextSlide();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right
                prevSlide();
            }
        }
    }
    
    function updateCarousel() {
        // Update slide positions
        ads.forEach((ad, index) => {
            ad.classList.remove('prev', 'active', 'next', 'hidden');
            
            if (index === currentIndex) {
                ad.classList.add('active');
                ad.setAttribute('aria-hidden', 'false');
            } else if (index === getPrevIndex()) {
                ad.classList.add('prev');
                ad.setAttribute('aria-hidden', 'true');
            } else if (index === getNextIndex()) {
                ad.classList.add('next');
                ad.setAttribute('aria-hidden', 'true');
            } else {
                ad.classList.add('hidden');
                ad.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update indicators
        const indicatorButtons = document.querySelectorAll('.carousel-indicator');
        indicatorButtons.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
            indicator.setAttribute('aria-selected', index === currentIndex);
        });
    }
    
    function getPrevIndex() {
        return (currentIndex - 1 + ads.length) % ads.length;
    }
    
    function getNextIndex() {
        return (currentIndex + 1) % ads.length;
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetAutoplay();
    }
    
    function nextSlide() {
        currentIndex = getNextIndex();
        updateCarousel();
        resetAutoplay();
    }
    
    function prevSlide() {
        currentIndex = getPrevIndex();
        updateCarousel();
        resetAutoplay();
    }
    
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }
    
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }
    
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }
    
    // Dynamically load more ads if needed
    function loadMoreAds() {
        fetch('/api/ads')
            .then(response => response.json())
            .then(data => {
                // Check if we have new ads to add
                if (data.length > ads.length) {
                    // Create new ad elements
                    for (let i = ads.length; i < data.length; i++) {
                        const ad = data[i];
                        const adCard = document.createElement('div');
                        adCard.className = 'ad-card hidden';
                        adCard.setAttribute('aria-hidden', 'true');
                        
                        adCard.innerHTML = `
                            <img src="${ad.image}" alt="${ad.name}" class="ad-image">
                            <div class="ad-content">
                                <h3 class="ad-title">${ad.name}</h3>
                                <a href="${ad.discord}" target="_blank" class="ad-button">
                                    <i class="fab fa-discord"></i> Join Discord
                                </a>
                            </div>
                        `;
                        
                        carouselTrack.appendChild(adCard);
                        
                        // Add indicator
                        const indicator = document.createElement('button');
                        indicator.classList.add('carousel-indicator');
                        indicator.addEventListener('click', () => goToSlide(i));
                        indicators.appendChild(indicator);
                    }
                    
                    // Reinitialize carousel with new ads
                    initCarousel();
                }
            })
            .catch(error => console.error('Error loading ads:', error));
    }
    
    // Initialize if carousel exists
    if (carousel && carouselTrack && ads.length > 0) {
        initCarousel();
        
        // Check for new ads periodically
        setInterval(loadMoreAds, 60000); // Check every minute
    }
    
    // Polyfills for older browsers
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
});