import Link from 'next/link';
import { useEffect } from 'react';

export default function Header() {
  // Add navigation click handling for height recalculation
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;

    // Function to recalculate page height
    const calculatePageHeight = () => {
      if (typeof window !== 'undefined') {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        const content = document.querySelector('#content');
        const wrapper = document.getElementById('wrapper');

        if (header && footer && content && wrapper) {
          const headerHeight = header.offsetHeight;
          const footerHeight = footer.offsetHeight;
          const windowHeight = window.innerHeight;

          // Reset wrapper height first to get accurate content measurement
          wrapper.style.height = 'auto';
          wrapper.style.minHeight = '100vh';

          // Wait for DOM to update, then measure actual content
          setTimeout(() => {
            const contentChildren = content.children;
            let totalContentHeight = 0;

            for (let i = 0; i < contentChildren.length; i++) {
              totalContentHeight += contentChildren[i].offsetHeight;
            }

            // Add padding
            totalContentHeight += 80;

            // Calculate required total height
            const minRequiredHeight = headerHeight + totalContentHeight + footerHeight;

            if (minRequiredHeight > windowHeight) {
              // Content exceeds viewport - use content height
              wrapper.style.height = minRequiredHeight + 'px';
              wrapper.style.minHeight = minRequiredHeight + 'px';
              content.style.minHeight = totalContentHeight + 'px';
            } else {
              // Content fits in viewport - use viewport height
              wrapper.style.height = '100vh';
              wrapper.style.minHeight = '100vh';
              const availableContentHeight = windowHeight - headerHeight - footerHeight - 40;
              content.style.minHeight = Math.max(availableContentHeight, totalContentHeight) + 'px';
            }
          }, 100);
        }

        // Trigger scroll event for navbar effects
        window.dispatchEvent(new Event('scroll'));
      }
    };

    // Make calculatePageHeight globally available
    window.calculatePageHeight = calculatePageHeight;

    // Handle navigation button clicks
    const handleNavigationClick = (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        // Check if it's a home or services link
        if (href === '/' || href === '/#services' || href.includes('/services')) {
          // Recalculate height after navigation
          setTimeout(() => {
            calculatePageHeight();
          }, 200);
        }
      }
    };

    // Handle window resize
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(() => {
        calculatePageHeight();
      }, 150);
    };

    // Handle orientation change (mobile rotation)
    const handleOrientationChange = () => {
      // Longer delay for orientation change to ensure viewport is updated
      setTimeout(() => {
        calculatePageHeight();
      }, 300);
    };

    // Add event listeners
    document.addEventListener('click', handleNavigationClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial height calculation
    setTimeout(() => {
      calculatePageHeight();
    }, 200);

    return () => {
      document.removeEventListener('click', handleNavigationClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(window.resizeTimeout);
    };
  }, []);
  return (
    <header className="transparent">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="de-flex sm-pt10">
              <div className="de-flex-col">
                {/* Logo */}
                <div id="logo">
                  <Link href="/">
                    <img className="logo-main" src="/images/protologo.png" alt="Logo" width="189" height="64" />
                    <img className="logo-mobile" src="/images/protologo.png" alt="Logo" width="189" height="64" />
                  </Link>
                </div>
              </div>
              
              <div className="de-flex-col header-col-mid">
                {/* Main Menu */}
                <ul id="mainmenu">
                  <li><Link href="/" className="menu-item">HOME</Link></li>
                  <li className="menu-item-has-children">
                    <a className="menu-item" href="#services">SERVICES</a>
                    <ul>
                      <li><Link href="/services?service=detailing">DETAILING PACKAGES</Link></li>
                      <li><Link href="/services?service=vehicle-wrap">VEHICLE WRAP</Link></li>
                      <li><Link href="/services?service=ceramic-coating">CERAMIC COATING</Link></li>
                      <li><Link href="/services?service=paint-protection-film">PAINT PROTECTION FILM (PPF)</Link></li>
                      <li><Link href="/services?service=maintenance">MAINTENANCE</Link></li>
                      <li><Link href="/services?service=window-tinting">WINDOW TINTING</Link></li>
                    </ul>
                  </li>
                  <li><Link href="/wrap-configurator" className="menu-item">WRAP CONFIGURATOR</Link></li>
                  <li><Link href="/#about" className="menu-item">ABOUT</Link></li>
                  <li><Link href="/#contact" className="menu-item">CONTACT</Link></li>
                </ul>
              </div>
              
              <div className="de-flex-col">
                <div className="menu_side_area">
                  <span id="menu-btn"></span>
                </div>
                <div id="btn-extra">
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}