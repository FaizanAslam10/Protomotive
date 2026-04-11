import Head from 'next/head';
import HeaderSimple from './HeaderSimple';
import Footer from './Footer';
import { useEffect, useState } from 'react';

export default function Layout({ children, title = "Precision Auto Center", showPreloader = false }) {

  // Handle preloader visibility when showPreloader changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.jQuery && !showPreloader) {
      const loader = document.getElementById('de-loader');
      if (loader) {
        window.jQuery(loader).fadeOut(500);
      }
    }
  }, [showPreloader]);

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;

    let cleanupMobile = null;

    // Initialize mobile menu functionality
    const initMobileMenu = () => {
      const menuBtn = document.getElementById('menu-btn');
      const header = document.querySelector('header');
      let mobile_menu_show = 0;

      if (menuBtn && header) {
        // Remove any existing event listeners
        menuBtn.onclick = null;
        
        // Add click event for mobile menu toggle
        const handleMenuClick = function() {
          if (mobile_menu_show === 0) {
            header.classList.add('menu-open');
            header.style.height = window.innerHeight + 'px';
            mobile_menu_show = 1;
            this.classList.add('menu-open');
          } else {
            header.classList.remove('menu-open');
            header.style.height = 'auto';
            mobile_menu_show = 0;
            this.classList.remove('menu-open');
          }
        };
        
        menuBtn.addEventListener('click', handleMenuClick);
        
        // Return cleanup function
        const cleanup = () => {
          menuBtn.removeEventListener('click', handleMenuClick);
        };

        // Add mobile menu arrows
        const mainMenu = document.getElementById('mainmenu');
        if (mainMenu) {
          // Clear existing spans first
          const existingSpans = mainMenu.querySelectorAll('li > span');
          existingSpans.forEach(span => span.remove());
          
          // Add arrows to menu items with children
          const menuLinks = mainMenu.querySelectorAll('li a');
          menuLinks.forEach(link => {
            if (link.nextElementSibling && link.nextElementSibling.tagName === 'UL') {
              const span = document.createElement('span');
              span.setAttribute('data-iteration', '1');
              link.parentNode.insertBefore(span, link.nextElementSibling);
              
              const handleSpanClick = function() {
                const iteration = parseInt(this.getAttribute('data-iteration') || '1');
                const submenu = this.nextElementSibling;
                
                if (iteration === 1) {
                  this.classList.add('active');
                  if (submenu) {
                    submenu.style.height = 'auto';
                    submenu.style.opacity = '1';
                    submenu.style.display = 'block';
                  }
                  this.setAttribute('data-iteration', '2');
                } else {
                  this.classList.remove('active');
                  if (submenu) {
                    submenu.style.height = '0';
                    submenu.style.opacity = '0';
                    submenu.style.display = 'none';
                  }
                  this.setAttribute('data-iteration', '1');
                }
              };
              
              span.addEventListener('click', handleSpanClick);
            }
          });
        }

        // Initialize responsive behavior
        const checkScreenSize = () => {
          if (window.innerWidth <= 992) {
            if (header && !header.classList.contains('header-mobile')) {
              header.classList.add('header-mobile');
            }
            if (menuBtn) {
              menuBtn.style.display = 'block';
            }
          } else {
            if (header && header.classList.contains('header-mobile')) {
              header.classList.remove('header-mobile');
              header.classList.remove('menu-open');
              header.style.height = 'auto';
              mobile_menu_show = 0;
            }
            if (menuBtn) {
              menuBtn.classList.remove('menu-open');
              menuBtn.style.display = '';
            }
          }
        };

        // Check on load
        checkScreenSize();
        
        // Check on resize
        window.addEventListener('resize', checkScreenSize);
        
        return () => {
          cleanup();
          window.removeEventListener('resize', checkScreenSize);
        };
      }
      
      return null;
    };

    // Initialize sidebar functionality
    const initSidebar = () => {
      const extraWrap = document.getElementById('extra-wrap');
      const btnExtra = document.getElementById('btn-extra');
      const btnClose = document.getElementById('btn-close');

      if (btnExtra && extraWrap) {
        btnExtra.onclick = function() {
          extraWrap.style.right = '0px';
          extraWrap.classList.add('open');
        };
      }

      if (btnClose && extraWrap) {
        btnClose.onclick = function() {
          extraWrap.style.right = '-500px';
          extraWrap.classList.remove('open');
        };
      }
    };

    // Initialize preloader hide
    const initPreloader = () => {
      if (window.jQuery) {
        const loader = document.getElementById('de-loader');
        if (loader) {
          // If showPreloader is true, don't hide it yet (controlled by parent)
          // Otherwise, hide it after default delay
          if (!showPreloader) {
            window.jQuery(loader).fadeOut(500);
          }
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      cleanupMobile = initMobileMenu();
      initSidebar();
      initPreloader();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (cleanupMobile) {
        cleanupMobile();
      }
    };
  }, [showPreloader]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx>{`
          html {
            scroll-behavior: smooth;
          }

          * {
            box-sizing: border-box;
          }

          #wrapper {
            overflow-x: hidden;
            width: 100%;
            max-width: 100vw;
          }

          .container {
            max-width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
          }

          @media (max-width: 768px) {
            .container {
              padding-left: 10px !important;
              padding-right: 10px !important;
            }
          }
        `}</style>
      </Head>
      
      <div id="wrapper" style={{margin: 0, padding: 0}}>
        <a href="#" id="back-to-top"></a>

        {/* Preloader */}
        <div id="de-loader">
          <div className="loader-content">
            <img src="/images/loadinglogo.png" alt="Logo" width="321" height="275" />
            <div className="lds-roller">
              <div></div><div></div><div></div><div></div>
              <div></div><div></div><div></div><div></div>
            </div>
          </div>
        </div>

        {/* Header - Using HeaderSimple throughout the website */}
        <HeaderSimple />
        
        {/* Main Content */}
        {children}
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}