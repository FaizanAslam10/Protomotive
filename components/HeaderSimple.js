import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function HeaderSimple() {
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;
    
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Reset scroll position when sidebar becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const extraContent = document.getElementById('extra-content');
          const extraWrap = document.getElementById('extra-wrap');
          
          if (extraWrap && extraContent) {
            const isVisible = extraWrap.style.right === '0px' || extraWrap.classList.contains('open');
            if (isVisible) {
              // Reset scroll position to top when sidebar opens
              extraContent.scrollTop = 0;
            }
          }
        }
      });
    });

    // Observe style changes on the sidebar wrapper
    const extraWrap = document.getElementById('extra-wrap');
    if (extraWrap) {
      observer.observe(extraWrap, { 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
    }

    // Prevent scrolling the background when sidebar is open
    const handleWheel = (e) => {
      const target = e.target.closest('#extra-content');
      if (target) {
        // Allow scrolling within sidebar content
        const { scrollTop, scrollHeight, clientHeight } = target;
        const atTop = scrollTop === 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight;
        
        // Prevent background scroll only if we're at boundaries and trying to scroll further
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      } else {
        // Prevent all background scrolling when not scrolling sidebar content
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      // Prevent background scroll on touch devices
      const target = e.target.closest('#extra-content');
      if (!target) {
        e.preventDefault();
      }
    };

    sidebar.addEventListener('wheel', handleWheel, { passive: false });
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      sidebar.removeEventListener('wheel', handleWheel);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      observer.disconnect();
    };
  }, []);

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

    // Add event listener
    document.addEventListener('click', handleNavigationClick);

    return () => {
      document.removeEventListener('click', handleNavigationClick);
    };
  }, []);

  return (
    <>
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
                  {/* Main Menu - Simple version without services dropdown */}
                  <ul id="mainmenu">
                    <li><Link href="/" className="menu-item">HOME</Link></li>
                    <li><a href="/#services" className="menu-item">SERVICES</a></li>
                    <li><Link href="/wrap-configurator" className="menu-item">WRAP CONFIGURATOR</Link></li>
                    <li><a href="/#about" className="menu-item">ABOUT</a></li>
                    <li><a href="/#contact" className="menu-item">CONTACT</a></li>
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
      
      {/* Side Menu */}
      <style jsx>{`
        #extra-content::-webkit-scrollbar {
          width: 12px;
        }
        #extra-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
        }
        #extra-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        #extra-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.8);
          background-clip: content-box;
        }
        #extra-content {
          scrollbar-width: auto;
          scrollbar-color: rgba(255, 255, 255, 0.6) rgba(0, 0, 0, 0.3);
        }
      `}</style>
      
      <div 
        id="extra-wrap" 
        className="text-light" 
        ref={sidebarRef}
        style={{ 
          position: 'fixed',
          top: 0,
          right: '-500px',
          width: '500px',
          height: '100vh',
          zIndex: 1002,
          transition: 'right 0.3s ease-in-out',
          overflow: 'hidden',
          color: '#ffffff !important' 
        }}>
        
        <div id="btn-close" style={{
          position: 'absolute',
          top: '50px',
          right: '50px',
          zIndex: 1003,
          width: '26px',
          height: '26px',
          cursor: 'pointer'
        }}>
          <span></span>
          <span></span>
        </div>

        <div id="extra-content" style={{
          color: '#ffffff',
          zIndex: 1001,
          padding: '50px',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: '-17px',
          overflowY: 'auto',
          visibility: 'visible !important',
          opacity: '1 !important',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#ffffff33 transparent'
        }}>
          <img src="/images/protologo.png" className="w-150px" alt="Protomotive Logo" width="189" height="64" />
          <div className="spacer-30-line"></div>

          <h5 style={{ color: '#ffffff', marginBottom: '15px', visibility: 'visible', opacity: 1 }}>Our Services</h5>
          <ul className="ul-check" style={{ color: '#ffffff', visibility: 'visible', opacity: 1 }}>
            <li style={{ visibility: 'visible', opacity: 1 }}><a href="/services?service=detailing" style={{ color: '#ffffff', textDecoration: 'none', visibility: 'visible', opacity: 1 }}>Detailing</a></li>
            <li style={{ visibility: 'visible', opacity: 1 }}><a href="/services?service=vehicle-wrap" style={{ color: '#ffffff', textDecoration: 'none', visibility: 'visible', opacity: 1 }}>Vehicle Wraps</a></li>
            <li style={{ visibility: 'visible', opacity: 1 }}><a href="/services?service=ceramic-coating" style={{ color: '#ffffff', textDecoration: 'none', visibility: 'visible', opacity: 1 }}>Ceramic Coating</a></li>
            <li style={{ visibility: 'visible', opacity: 1 }}><a href="/services?service=paint-protection-film" style={{ color: '#ffffff', textDecoration: 'none', visibility: 'visible', opacity: 1 }}>Paint Protection Film (PPF)</a></li>
            <li style={{ visibility: 'visible', opacity: 1 }}><a href="/services?service=maintenance" style={{ color: '#ffffff', textDecoration: 'none', visibility: 'visible', opacity: 1 }}>Maintenance</a></li>
            <li style={{ visibility: 'visible', opacity: 1 }}><a href="/services?service=window-tinting" style={{ color: '#ffffff', textDecoration: 'none', visibility: 'visible', opacity: 1 }}>Window Tinting</a></li>
          </ul>

          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>

          <h5 style={{ color: '#ffffff', marginBottom: '15px', visibility: 'visible', opacity: 1 }}>Contact Us</h5>
          <div style={{ color: '#ffffff', marginBottom: '10px', visibility: 'visible', opacity: 1 }}><i className="icofont-clock-time me-2 op-5"></i>Monday - Saturday 9.00 am - 10.00 pm</div>
          <div style={{ color: '#ffffff', marginBottom: '10px', visibility: 'visible', opacity: 1 }}><i className="icofont-phone me-2 op-5"></i><a href="tel:03005005666" style={{ color: '#ffffff', textDecoration: 'none' }}>0300 5005666</a></div>
          <div style={{ color: '#ffffff', marginBottom: '10px', visibility: 'visible', opacity: 1 }}><i className="icofont-location-pin me-2 op-5"></i><a href="https://maps.app.goo.gl/7cBt29ZrMHADxvjQ9" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline' }}>Plot 413, DHA Phase 8 - Ex Park View, Lahore</a></div>
          <div style={{ color: '#ffffff', marginBottom: '10px', visibility: 'visible', opacity: 1 }}><i className="icofont-envelope me-2 op-5"></i><a href="mailto:habibianofficial@gmail.com" style={{ color: '#ffffff', textDecoration: 'underline' }}>habibianofficial@gmail.com</a></div>
          
          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>          <h5 style={{ color: '#ffffff', marginBottom: '15px', visibility: 'visible', opacity: 1 }}>About Us</h5>
          <p style={{ color: '#ffffff', lineHeight: '1.6', visibility: 'visible', opacity: 1 }}>Protomotive is a unique state of the art auto care facility that provides outstanding customer service. We pride ourselves on the fact that we only trust a combination of the very best materials and the most competent professionals to carry out your chosen service.</p>

          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>

          <h5 style={{ color: '#ffffff', marginBottom: '15px', visibility: 'visible', opacity: 1 }}>Our Location</h5>
          <p style={{ color: '#ffffff', lineHeight: '1.6', visibility: 'visible', opacity: 1 }}>Visit us at our state-of-the-art facility at Plot 413, DHA Phase 8 - Ex Park View Block D, Lahore. We're conveniently located and easily accessible with ample parking for our customers.</p>

          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>

          <h5 style={{ color: '#ffffff', marginBottom: '15px', visibility: 'visible', opacity: 1 }}>Why Choose Us?</h5>
          <ul className="ul-check" style={{ color: '#ffffff', visibility: 'visible', opacity: 1 }}>
            <li style={{ visibility: 'visible', opacity: 1, marginBottom: '10px' }}>Professional certified technicians</li>
            <li style={{ visibility: 'visible', opacity: 1, marginBottom: '10px' }}>Premium quality materials</li>
            <li style={{ visibility: 'visible', opacity: 1, marginBottom: '10px' }}>State-of-the-art equipment</li>
            <li style={{ visibility: 'visible', opacity: 1, marginBottom: '10px' }}>Competitive pricing</li>
            <li style={{ visibility: 'visible', opacity: 1, marginBottom: '10px' }}>Satisfaction guarantee</li>
            <li style={{ visibility: 'visible', opacity: 1, marginBottom: '10px' }}>Quick turnaround times</li>
          </ul>

          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>

          <h5 style={{ color: '#ffffff', marginBottom: '15px', visibility: 'visible', opacity: 1 }}>Follow Us</h5>
          <div className="social-icons">
            <a href="https://www.facebook.com/people/Protomotive/61588229888849/" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/protomotive.pk/" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>

          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>
          <div className="spacer-30-line" style={{ visibility: 'visible', opacity: 1 }}></div>
        </div>
      </div>
    </>
  );
}