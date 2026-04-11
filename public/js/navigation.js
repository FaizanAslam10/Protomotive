// Shared navigation functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Handle smooth scrolling on page load if there's a hash
    function handleHashScroll() {
        const hash = window.location.hash;
        if (hash) {
            // Prevent immediate jump by temporarily removing hash
            if (history.replaceState) {
                history.replaceState(null, null, window.location.pathname);
            }
            
            // Longer delay to ensure page is fully loaded and prevent immediate jump
            setTimeout(() => {
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    // Smooth scroll from current position to target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                    // Restore hash in URL after scroll starts
                    setTimeout(() => {
                        if (history.replaceState) {
                            history.replaceState(null, null, hash);
                        }
                    }, 100);
                }
            }, 300);
        }
    }

    // Handle hash on initial page load
    handleHashScroll();

    // Handle hash changes (back/forward navigation)
    window.addEventListener('hashchange', handleHashScroll);

    // Handle page visibility change (when returning from background)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Page is now visible, recalculate height
            setTimeout(() => {
                if (window.calculatePageHeight) {
                    window.calculatePageHeight();
                }
            }, 150);
        }
    });

    // Handle route changes for Next.js navigation
    window.addEventListener('popstate', function() {
        setTimeout(() => {
            if (window.calculatePageHeight) {
                window.calculatePageHeight();
            }
        }, 200);
    });

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement && targetId !== '#') {
                e.preventDefault();
                e.stopPropagation();
                
                // Smooth scroll to target element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Update URL hash after scrolling starts
                setTimeout(() => {
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    } else {
                        window.location.hash = targetId;
                    }
                }, 100);
            }
        });
    });

    // Close mobile menu when clicking on any menu link
    function closeMobileMenu() {
        // Multiple ways to check if mobile menu is open
        const header = document.querySelector('header');
        const menuBtn = document.querySelector('#menu-btn');
        const mainMenu = document.querySelector('#mainmenu');

        // Check various indicators that the mobile menu is open
        const isMenuOpen = window.mobile_menu_show === 1 ||
                          (header && header.classList.contains('menu-open')) ||
                          (menuBtn && menuBtn.classList.contains('menu-open')) ||
                          (mainMenu && mainMenu.style.display === 'block');

        if (isMenuOpen) {
            // Close the menu using multiple methods to ensure it works
            if (header) {
                header.classList.remove('menu-open');
                header.style.height = 'auto';
            }

            if (menuBtn) {
                menuBtn.classList.remove('menu-open');
            }

            if (mainMenu) {
                mainMenu.style.display = '';
                mainMenu.style.height = '';
            }

            // Update the global variable if it exists
            if (typeof window.mobile_menu_show !== 'undefined') {
                window.mobile_menu_show = 0;
            }

            // Remove any mobile-specific classes from body
            document.body.classList.remove('mobile-menu-open');

            // Force trigger the menu close event if it exists
            if (typeof window.closeMobileNavigation === 'function') {
                window.closeMobileNavigation();
            }

            // Recalculate page height after closing mobile menu
            setTimeout(() => {
                if (window.calculatePageHeight) {
                    window.calculatePageHeight();
                }
            }, 100);
        }
    }

    // Add click handler for all menu links
    document.addEventListener('click', function(e) {
        // Check if clicked element is a menu link (including Next.js Link components)
        const menuLink = e.target.closest('#mainmenu a, .menu-item, #mainmenu li a, header a[href]');
        if (menuLink) {
            // Close mobile menu when any menu link is clicked
            closeMobileMenu();

            // Add small delay to ensure menu closes before navigation
            if (menuLink.href && !menuLink.href.includes('#')) {
                setTimeout(() => {
                    // Let Next.js handle the navigation
                }, 100);
            }
        }

        // Handle service-specific links
        const serviceLink = e.target.closest('[data-service]');
        if (serviceLink) {
            const serviceType = serviceLink.getAttribute('data-service');

            // Close mobile menu for service links too
            closeMobileMenu();

            // If on services page, try to activate the corresponding toggle
            if (window.location.pathname.includes('/services')) {
                // Check if services.js functionality is available
                const targetButton = document.querySelector(`[data-target="${serviceType}"]`);
                if (targetButton) {
                    e.preventDefault();
                    targetButton.click();

                    // Scroll to services section
                    const servicesSection = document.querySelector('.service-containers');
                    if (servicesSection) {
                        servicesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                // If services.js isn't loaded or toggle doesn't exist, let the link navigate naturally
            } else {
                // If not on services page, navigate with service parameter
                e.preventDefault();
                window.location.href = `/services?service=${serviceType}`;
            }
        }
    });

    // Additional handler specifically for Next.js navigation
    document.addEventListener('click', function(e) {
        // Handle any anchor tag click in header/navigation area
        const navAnchor = e.target.closest('header a, #mainmenu a');
        if (navAnchor) {
            // Always close mobile menu for any navigation link
            setTimeout(() => {
                closeMobileMenu();
            }, 50);
        }
    });

    // Listen for Next.js route changes to close mobile menu
    if (typeof window !== 'undefined') {
        // Close mobile menu on route change (for Next.js navigation)
        const handleRouteChange = () => {
            closeMobileMenu();
        };

        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', handleRouteChange);

        // Listen for pushstate/replacestate (programmatic navigation)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(history, arguments);
            handleRouteChange();
        };

        history.replaceState = function() {
            originalReplaceState.apply(history, arguments);
            handleRouteChange();
        };
    }
});