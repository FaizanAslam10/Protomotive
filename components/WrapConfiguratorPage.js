import Layout from './Layout';
import { useEffect } from 'react';

export default function WrapConfiguratorPage() {
  // Dynamic layout calculation based on content
  const calculatePageHeight = () => {
    if (typeof window !== 'undefined') {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const content = document.querySelector('.wrap-configurator-page');
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
        }, 10);
      }

      // Trigger scroll event for navbar effects
      window.dispatchEvent(new Event('scroll'));
    }
  };

  // Initial layout calculation and recalculation triggers
  useEffect(() => {
    const ensureLayout = () => {
      calculatePageHeight();
      window.dispatchEvent(new Event('resize'));
    };

    // Multiple triggers to ensure height calculation when page loads
    const timers = [
      setTimeout(ensureLayout, 50),   // Quick initial calculation
      setTimeout(ensureLayout, 200),  // After DOM fully ready
      setTimeout(ensureLayout, 500),  // Final calculation after all rendering
    ];

    // Also listen for window resize
    window.addEventListener('resize', calculatePageHeight);

    // Listen for navigation events (when button is pressed to navigate here)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(calculatePageHeight, 100);
      }
    };

    const handleFocus = () => {
      setTimeout(calculatePageHeight, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', calculatePageHeight);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  return (
    <div className="wrap-configurator-container">
      <Layout title="Wrap Configurator - Protomotive">
      <>
        <style jsx global>{`
          body {
            height: auto !important;
          }
          .wrap-configurator-container body,
          .wrap-configurator-container html {
            margin: 0 !important;
            padding: 0 !important;
          }
          .wrap-configurator-container #wrapper {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .wrap-configurator-page {
            flex: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .wrap-configurator-container footer {
            position: relative !important;
            z-index: 1 !important;
            flex-shrink: 0 !important;
            margin-top: auto !important;
          }

          /* Dynamic height calculation based on content */
          .wrap-configurator-container {
            min-height: 100vh !important;
          }

          /* Hide scrollbar for wrap configurator only */
          .wrap-configurator-container {
            scrollbar-width: none !important; /* Firefox */
            -ms-overflow-style: none !important; /* Internet Explorer 10+ */
          }

          .wrap-configurator-container::-webkit-scrollbar {
            display: none !important; /* WebKit */
          }

          .wrap-configurator-container #wrapper {
            scrollbar-width: none !important; /* Firefox */
            -ms-overflow-style: none !important; /* Internet Explorer 10+ */
          }

          .wrap-configurator-container #wrapper::-webkit-scrollbar {
            display: none !important; /* WebKit */
          }

          /* Override section padding for iframe section */
          .wrap-configurator-iframe-section {
            padding: 10px !important;
          }

          /* Remove bottom padding from header section */
          .wrap-configurator-page section.jarallax {
            padding-bottom: 0 !important;
          }

          @media (max-width: 768px) {
            .wrap-configurator-page .spacer-double {
              padding: 40px 0 !important;
            }

            /* Prevent snapback on mobile scroll */
            .wrap-configurator-container #wrapper {
              height: auto !important;
              min-height: 100vh !important;
            }

            .wrap-configurator-page {
              min-height: auto !important;
              height: auto !important;
            }

            body {
              overflow-x: hidden !important;
              overflow-y: auto !important;
            }
          }
        `}</style>
        <div className="no-bottom no-top wrap-configurator-page" id="content">
          <div id="top"></div>

          {/* Page Header Section - Exactly like original */}
          <section className="jarallax">
            <div className="container relative z-3" style={{ paddingTop: '15px' }}>
              <div className="spacer-single"></div>
              <div className="row g-4 justify-content-center">
                <div className="col-lg-12 text-center">
                  <div className="subtitle">Design Your Vehicle</div>
                  <h1 className="text-white mb-4">Wrap Configurator</h1>
                </div>
              </div>
            </div>
          </section>

          {/* Wrap Configurator Section */}
          <section className="bg-dark wrap-configurator-iframe-section">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-12">
                  <iframe
                    src="https://autostyle.web.app/precisionauto"
                    style={{ width: '100%', height: '800px', border: 'none' }}
                    title="Wrap Configurator"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
      </Layout>
    </div>
  );
}