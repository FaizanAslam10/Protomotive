import Layout from './Layout';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HomePage() {
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle contact form input changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/send-contact-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        setSubmitMessage(result.message);
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setSubmitSuccess(false);
        setSubmitMessage(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitSuccess(false);
      setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;
    
    let initialized = false;
    
    const initJarallax = () => {
      if (window.jarallax && !initialized) {
        try {
          const jarallaxElements = document.querySelectorAll('.jarallax');
          
          if (jarallaxElements.length > 0) {
            // Safely destroy any existing instances
            jarallaxElements.forEach(element => {
              try {
                if (element.jarallax) {
                  window.jarallax(element, 'destroy');
                }
              } catch (e) {
                // Ignore destroy errors
              }
            });
            
            // Initialize jarallax
            window.jarallax(jarallaxElements, {
              speed: 0.6,
              type: 'scroll'
            });
          }
          
          // Initialize owl carousel
          if (window.jQuery && window.jQuery.fn.owlCarousel) {
            const owlElements = window.jQuery(".owl-2-dots");
            if (owlElements.length > 0) {
              owlElements.owlCarousel({
                loop: true,
                margin: 25,
                nav: false,
                dots: true,
                responsive: {
                  0: { items: 1 },
                  600: { items: 1 },
                  1000: { items: 2 }
                }
              });
            }
          }
          
          initialized = true;
        } catch (error) {
          console.warn('Library initialization warning:', error);
        }
      }
    };
    
    // Short delay to ensure DOM is ready
    const timer = setTimeout(initJarallax, 100);
    
    return () => {
      clearTimeout(timer);
      if (window.jarallax) {
        window.jarallax(document.querySelectorAll('.jarallax'), 'destroy');
      }
    };
  }, []);

  // Initialize counter animations
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;
    
    const animateCounters = () => {
      const counters = document.querySelectorAll('.timer');
      
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-to'));
        const speed = parseInt(counter.getAttribute('data-speed')) || 2000;
        const increment = target / (speed / 50);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current);
            setTimeout(updateCounter, 50);
          } else {
            counter.textContent = target;
          }
        };
        
        // Start animation when element comes into view
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              updateCounter();
              observer.disconnect();
            }
          });
        });
        
        observer.observe(counter);
      });
    };
    
    // Short delay to ensure DOM is ready
    const timer = setTimeout(animateCounters, 100);
    return () => clearTimeout(timer);
  }, []);

  // Feature box glow effect and FAQ accordion
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;

    const featureBoxes = document.querySelectorAll('.feature-box-glow');
    const eventListeners = new Map(); // Store event listeners for proper cleanup

    // Feature box glow effect
    featureBoxes.forEach(box => {
      const mouseMoveHandler = (e) => {
        const rect = box.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));
        
        box.style.setProperty('--mouse-x', clampedX + '%');
        box.style.setProperty('--mouse-y', clampedY + '%');
      };

      const mouseEnterHandler = () => {
        box.style.transition = 'transform 0.3s ease-in-out';
      };

      const mouseLeaveHandler = () => {
        box.style.setProperty('--mouse-x', '50%');
        box.style.setProperty('--mouse-y', '50%');
      };

      // Store handlers for cleanup
      eventListeners.set(box, {
        mousemove: mouseMoveHandler,
        mouseenter: mouseEnterHandler,
        mouseleave: mouseLeaveHandler
      });

      box.addEventListener('mousemove', mouseMoveHandler);
      box.addEventListener('mouseenter', mouseEnterHandler);
      box.addEventListener('mouseleave', mouseLeaveHandler);
    });

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

          // Reset both wrapper and body heights to prevent fixed height issues
          wrapper.style.height = 'auto';
          wrapper.style.minHeight = '100vh';
          document.body.style.height = 'auto';
          document.body.style.minHeight = '100vh';

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
              // Content exceeds viewport - let it grow naturally without fixed heights
              wrapper.style.height = 'auto';
              wrapper.style.minHeight = 'auto';
              wrapper.style.maxHeight = 'none';
              document.body.style.height = 'auto';
              document.body.style.minHeight = 'auto';
              content.style.minHeight = totalContentHeight + 'px';
            } else {
              // Content fits in viewport - use viewport height exactly
              wrapper.style.height = '100vh';
              wrapper.style.minHeight = '100vh';
              wrapper.style.maxHeight = '100vh';
              document.body.style.height = '100vh';
              document.body.style.minHeight = '100vh';
              document.body.style.maxHeight = '100vh';
              const availableContentHeight = windowHeight - headerHeight - footerHeight - 40;
              content.style.minHeight = Math.max(availableContentHeight, totalContentHeight) + 'px';
            }
          }, 50);
        }

        // Trigger scroll event for navbar effects
        window.dispatchEvent(new Event('scroll'));
      }
    };

    // FAQ Accordion
    const handleFAQClick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const titleElement = e.currentTarget;
      const currentAttrvalue = titleElement.getAttribute('data-tab');
      const content = document.querySelector(currentAttrvalue);

      if (content) {
        if (titleElement.classList.contains('active')) {
          titleElement.classList.remove('active');
          content.style.display = 'none';
        } else {
          titleElement.classList.add('active');
          content.style.display = 'block';
        }

        // Recalculate page height after FAQ expand/collapse
        setTimeout(() => {
          calculatePageHeight();
        }, 100);
      }
    };

    const faqTitles = document.querySelectorAll('.accordion-section-title');
    faqTitles.forEach(title => {
      title.addEventListener('click', handleFAQClick);
    });

    // Cleanup
    return () => {
      featureBoxes.forEach(box => {
        const handlers = eventListeners.get(box);
        if (handlers) {
          box.removeEventListener('mousemove', handlers.mousemove);
          box.removeEventListener('mouseenter', handlers.mouseenter);
          box.removeEventListener('mouseleave', handlers.mouseleave);
        }
      });

      faqTitles.forEach(title => {
        title.removeEventListener('click', handleFAQClick);
      });
    };
  }, []);

  // Initial page height calculation
  useEffect(() => {
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

          // Reset both wrapper and body heights to prevent fixed height issues
          wrapper.style.height = 'auto';
          wrapper.style.minHeight = '100vh';
          document.body.style.height = 'auto';
          document.body.style.minHeight = '100vh';

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
              // Content exceeds viewport - let it grow naturally without fixed heights
              wrapper.style.height = 'auto';
              wrapper.style.minHeight = 'auto';
              wrapper.style.maxHeight = 'none';
              document.body.style.height = 'auto';
              document.body.style.minHeight = 'auto';
              content.style.minHeight = totalContentHeight + 'px';
            } else {
              // Content fits in viewport - use viewport height exactly
              wrapper.style.height = '100vh';
              wrapper.style.minHeight = '100vh';
              wrapper.style.maxHeight = '100vh';
              document.body.style.height = '100vh';
              document.body.style.minHeight = '100vh';
              document.body.style.maxHeight = '100vh';
              const availableContentHeight = windowHeight - headerHeight - footerHeight - 40;
              content.style.minHeight = Math.max(availableContentHeight, totalContentHeight) + 'px';
            }
          }, 200);
        }

        // Trigger scroll event for navbar effects
        window.dispatchEvent(new Event('scroll'));
      }
    };

    // Initial calculation
    const timer = setTimeout(calculatePageHeight, 300);

    // Also listen for window resize
    window.addEventListener('resize', calculatePageHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePageHeight);
    };
  }, []);

  useEffect(() => {
    // Google Maps initialization
    if (typeof window === 'undefined') return;
  
    let mapInstance = null;
    
    const initializeMap = () => {
      if (!window.google || !window.google.maps) {
        setTimeout(initializeMap, 100);
        return;
      }
  
      const mapElement = document.getElementById('map_canvas');
      if (!mapElement || mapInstance) return;
  
      // Dark mode styling
      const darkModeStyles = [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#b1b1b3" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#3c3d41" }] },
        {
          featureType: "administrative",
          elementType: "geometry",
          stylers: [{ color: "#525459" }, { visibility: "on" }]
        },
        {
          featureType: "administrative.land_parcel",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#f14e4e" }, { visibility: "off" }]
        },
        {
          featureType: "poi",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#1c262d" }, { visibility: "off" }]
        },
        {
          featureType: "poi",
          elementType: "labels.icon",
          stylers: [{ color: "#f14e4e" }, { visibility: "off" }]
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#3c3d41" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#3c3d41" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#eeeeee" }, { visibility: "on" }]
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [{ color: "#3c3d41" }, { visibility: "simplified" }]
        },
        {
          featureType: "road.arterial",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f14e4e" }, { visibility: "off" }]
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#3c3d41" }]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#3c3d41" }]
        }
      ];
  
      // Map configuration
      const mapOptions = {
        center: { lat: 31.5258197, lng: 74.4467111 },
        zoom: 15,
        styles: darkModeStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_LEFT,
        }
      };
  
      // Create map
      const map = new window.google.maps.Map(mapElement, mapOptions);
      mapInstance = map;
  
      // Custom marker icon
      const markerIcon = {
        url: '/images/avatarlogo.png',
        scaledSize: new window.google.maps.Size(40, 46),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(20, 46)
      };
  
      // Add marker
      const marker = new window.google.maps.Marker({
        position: { lat: 31.5258197, lng: 74.4467111 },
        map: map,
        title: 'PROTOMOTIVE',
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP
      });
  
      // Info window content
      const infoWindowContent = `
        <div style="padding: 10px; max-width: 250px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #f14e4e; font-size: 16px;">PROTOMOTIVE</h3>
          <p style="margin: 5px 0; color: #333; font-size: 14px;">
            <strong>Address:</strong><br/>
            Plot 413,<br/>
            DHA Phase 8 Ex Park View Block D
          </p>
          <p style="margin: 5px 0; color: #333; font-size: 14px;">
            <strong>Phone:</strong><br/>
            <a href="tel:+923005005666" style="color: #f14e4e; text-decoration: none;">0300 5005666</a>
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://maps.app.goo.gl/8XptJuQif8sRPz6Z7"
               target="_blank"
               style="display: inline-block; background: #f14e4e; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 13px;">
              Get Directions
            </a>
          </p>
        </div>
      `;
  
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent
      });
  
      // Show info window on marker click
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    };
  
    initializeMap();
  
    return () => {
      mapInstance = null;
    };
  }, []);

  return (
    <Layout title="Precision Auto Center - Car Detailing & Services">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        {/* Hero Section */}
        <section 
          className="jarallax" 
          data-jarallax 
          data-speed="0.6"
          style={{
            backgroundImage: 'url(/images/background/4.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <img src="/images/background/4.webp" className="jarallax-img" alt="" />
          <div className="sw-overlay"></div>
          <div className="gradient-edge-bottom"></div>
          <div className="container relative z-3">
            <div className="spacer-double"></div>
            <div className="row g-4 justify-content-center">
              <div className="col-lg-8 text-center"> 
                <h1 className="fs-72 fs-xs-10vw text-uppercase">
                  PROTOMOTIVE
                </h1>
                <p className="mb-0 col-lg-6 offset-lg-3">
                  REMEMBER PROTOMOTIVE HAS YOUR VEHICLE PROTECTED INSIDE AND OUT
                </p>
                <div className="spacer-single"></div>
                <div className="d-flex justify-content-center gap-3">
                  <Link href="/services" className="btn-main fx-slide" data-hover="BOOK NOW">
                    <span>BOOK NOW</span>
                  </Link>
                </div>
              </div>

              <div className="spacer-single"></div>

              <div className="col-lg-12">
                <div className="hero-image-container">
                  <Image 
                    src="/images/misc/Crownlogo.png" 
                    alt="Precision Auto Center Vehicle Display" 
                    fill
                    sizes="100vw"
                    style={{ objectFit: 'contain' }}
                    quality={100}
                    unoptimized
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="pt-0">
          <div className="container">
            <div className="row g-4 justify-content-center mb-2">
              <div className="col-lg-6">
                <div className="text-center">
                <div className="spacer-double"></div>
                <div className="spacer-single"></div>
                <div className="spacer-single"  style={{ paddingbottom: '40px' }}></div>
                  <div className="subtitle">Welcome to Protomotive</div>
                  <h2>SERVICES PACKAGES</h2>
                  <p>We pride ourselves on our spotless facility and, together with our skilfully trained and knowledgeable technicians, we provide our customers with competitive pricing, exceptional quality and guaranteed workmanship which is supported by our outstanding service warranty.</p>
                </div>
              </div>                                       
            </div>

            <div className="row g-4">
              {/* Service Cards */}
              <ServiceCard 
                id="01"
                title="DETAILING"
                image="/images/detailing.png"
                description="Over time, dirt and contaminants build up on your vehicle's paintwork, glass, and chrome surfaces."
                delay=".0s"
              />
              
              <ServiceCard 
                id="02"
                title="VEHICLE WRAP"
                image="/images/wrap.png"
                description="We wrap it all…. cars, trucks, aircrafts, boats and trailers We perfect every job we do with the highest quality films and highest quality of installation."
                delay=".2s"
              />
              
              <ServiceCard 
                id="03"
                title="CERAMIC COATING"
                image="/images/ceramiccoating.png"
                description="Backed by a lifetime warranty, you will never have to worry about whether or not your vehicle is protected from harsh chemicals or road grime."
                delay=".4s"
              />
              
              <ServiceCard 
                id="04"
                title="PAINT PROTECTION FILM (PPF)"
                image="/images/ppf.png"
                description="PPF, is the 'king' of the automotive paint protection industry and possesses the best protection technology available."
                delay=".6s"
              />
              
              <ServiceCard 
                id="05"
                title="OIL CHANGE MAINTENANCE"
                image="/images/services-2/5.webp"
                description="Regular oil changes maintain your engine's health, ensuring longevity and smooth performance."
                delay=".8s"
              />
              
              <ServiceCard 
                id="06"
                title="WINDOW TINTING"
                image="/images/windowstint.png"
                description="Precision Auto Center provides lifetime warranty against Adhesive failure, Peeling, Delamination, and more."
                delay="1.0s"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="pt-0" aria-label="section">
          <div className="container">
            <div className="row g-4">
              <div className="col-md-12 wow fadeInUp d-flex justify-content-center gap-3">
                <Link href="/services" className="btn-main fx-slide btn-uniform" data-hover="ALL SERVICES">
                  <span>ALL SERVICES</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-dark text-light">
        <div className="spacer-single"></div>
          <div className="container relative z-1" style={{ paddingTop: '15px' }}>
            <div className="row g-4 gx-5 align-items-center">
              <div className="col-lg-6">
                <div className="row g-4">
                  <div className="col-sm-6">
                    <div className="row g-4">
                      <div className="col-lg-12">
                        <div className="rounded-1 overflow-hidden wow zoomIn">
                          <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                            <video 
                              src="/images/misc/p1.mp4" 
                              autoPlay
                              loop
                              muted
                              playsInline
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              className="wow scaleIn"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="row g-4">
                      <div className="spacer-single sm-hide"></div>
                      <div className="col-lg-12">
                        <div className="rounded-1 overflow-hidden wow zoomIn" data-wow-delay=".3s">
                          <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                            <video 
                              src="/images/misc/p2.mp4" 
                              autoPlay
                              loop
                              muted
                              playsInline
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              className="wow scaleIn"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="subtitle wow fadeInUp" data-wow-delay=".2s">About Us</div>
                <h2 className="wow fadeInUp" data-wow-delay=".4s">PROTOMOTIVE</h2>
                <p className="wow fadeInUp" data-wow-delay=".6s">
                  Protomotive.pk is a premium automotive service and detailing studio located in Lahore, Pakistan. They specialise in high-end vehicle protection and maintenance, offering services ranging from aesthetic enhancements to routine mechanical care.
                </p>
                <div className="wow fadeInUp" data-wow-delay=".6s">
                  <h4 className="mt-4 mb-3">Services Offered</h4>
                  <p>The studio provides a variety of car care solutions, including:</p>
                  <ul className="list-s1 style-2 mb-4">
                    <li className="mb-2"><strong>Paint Protection Film (PPF):</strong> High-quality shielding for vehicle paint to prevent stone chips and scratches.</li>
                    <li className="mb-2"><strong>Ceramic Coating:</strong> Advanced surface protection to maintain a showroom gloss.</li>
                    <li className="mb-2"><strong>Auto Detailing:</strong> Deep cleaning and restoration for both interior and exterior.</li>
                    <li className="mb-2"><strong>Vinyl Wraps:</strong> Custom aesthetic changes for vehicle exteriors.</li>
                    <li className="mb-2"><strong>Maintenance:</strong> General services such as oil changes to keep vehicles in peak condition.</li>
                  </ul>
                </div>
                <Link href="/services" className="btn-main fx-slide wow fadeInUp mt-2" data-wow-delay=".6s" data-hover="Read More">
                  <span>Read More</span>
                </Link>
              </div>
            </div>

            <div className="spacer-double"></div>

            {/* Statistics Counters */}
            <div className="row g-4">
              <div className="col-md-3 col-6">
                <div className="de_count text-center wow fadeInRight" data-wow-delay=".0s">
                  <i className="id-color fs-40 d-inline-block mb-3 icofont-briefcase-2"></i>
                  <h3 className="fs-40 mb-0 lh-1-1">
                    <span className="timer" data-to="10000" data-speed="3000">0</span>+
                  </h3>
                  Hours of Works
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="de_count text-center wow fadeInRight" data-wow-delay=".2s">
                  <i className="id-color fs-40 d-inline-block mb-3 icofont-thumbs-up"></i>
                  <h3 className="fs-40 mb-0 lh-1-1">
                    <span className="timer" data-to="5000" data-speed="3000">0</span>+
                  </h3>
                  Happy Customers
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="de_count text-center wow fadeInRight" data-wow-delay=".4s">
                  <i className="id-color fs-40 d-inline-block mb-3 icofont-users-alt-3"></i>
                  <h3 className="fs-40 mb-0 lh-1-1">
                    <span className="timer" data-to="10" data-speed="3000">0</span>+
                  </h3>
                  Experienced Workers
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="de_count text-center wow fadeInRight" data-wow-delay=".6s">
                  <i className="id-color fs-40 d-inline-block mb-3 icofont-badge"></i>
                  <h3 className="fs-40 mb-0 lh-1-1">
                    <span className="timer" data-to="10" data-speed="3000">0</span>+
                  </h3>
                  Years of Experience
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Jarallax Section */}
        <section 
          className="relative jarallax mh-500" 
          aria-label="section"
          data-jarallax 
          data-speed="0.6"
          style={{
            backgroundImage: 'url(/images/car.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="gradient-edge-top"></div>
          <div className="gradient-edge-bottom"></div>
          <img src="/images/car.png" className="jarallax-img" alt="" />
        </section>

        {/* Testimonials Section */}
        {/* <section className="bg-dark text-light">
          <div className="container">
            <div className="row g-4 align-items-center">
              <div className="col-lg-4">
                <div className="subtitle">SUCCESS STORIES</div>
                <h2>What They Says</h2>
              </div>
              <div className="col-lg-8">
                <div className="row">
                  <div className="owl-carousel owl-theme owl-2-dots wow fadeInUp">
                    <div className="item">
                      <TestimonialCard 
                        name="Abhi Vaghela"
                        date="7 December 2024"
                        rating={5}
                        text="One the best detailing place i have ever come across...! They are THE BEST in when they do. Moe is amazing, he handles all the clients personally and always make sure client is satisfied with the service. He is a true gentleman... They made my car look like brand new. I would highly recommend you go there and experience yourself."
                      />
                    </div>
                    <div className="item">
                      <TestimonialCard 
                        name="Samia Abdulhamid"
                        date="2 February 2025"
                        rating={5}
                        text="I travel from out of town to have my detailing/tinting/ colour changing completed on my vehicles by the guys at Precision Auto! the staff and owner provide exceptional customer service with fast and efficient quality of any job done to my vehicles. The prices are very reasonable too!! I highly recommend Precision Auto centre particularly if you are looking for outstanding results and tremendous service!!!"
                      />
                    </div>
                    <div className="item">
                      <TestimonialCard 
                        name="Joe Soares"
                        date="12 January 2025"
                        rating={5}
                        text="Probably one of the best detail shops I've ever been to. Moe and the boys here treat your car like its their own baby. All with treating you with respect. Great experience."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Why Choose Us Section */}
        <section className="bg-dark text-light">
          <div className="container relative z-1">
            <div className="row g-4 justify-content-center">
              <div className="col-lg-6 text-center">
                <div className="subtitle id-color">Trusted & Affordable</div>
                <h2>Why Choose Our Car Detailing?</h2>
                <p>From deep interior cleaning to long-lasting ceramic coating, we restore and protect your vehicle with precision, care, and a commitment to perfection.</p>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-3 col-md-6">
                <div className="bg-dark-2 p-40 h-100 rounded-1 feature-box-glow">
                  <div className="relative wow fadeInUp">
                    <h4>Expert Technicians</h4>
                    <p className="mb-0">Our detailers are skilled professionals with years of experience in car care.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="bg-dark-2 p-40 h-100 rounded-1 feature-box-glow">
                  <div className="relative wow fadeInUp">
                    <h4>Tailored Packages</h4>
                    <p className="mb-0">Detailing options customized to your car's condition and your preferences.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="bg-dark-2 p-40 h-100 rounded-1 feature-box-glow">
                  <div className="relative wow fadeInUp">
                    <h4>Affordable Pricing</h4>
                    <p className="mb-0">Competitive rates with no hidden fees — quality service that fits your budget.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="bg-dark-2 p-40 h-100 rounded-1 feature-box-glow">
                  <div className="relative wow fadeInUp">
                    <h4>Aftercare Support</h4>
                    <p className="mb-0">We provide post-service tips and care advice to keep your car looking sharp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Jarallax Section 2 */}
        <section 
          className="relative jarallax mh-500" 
          aria-label="section"
          data-jarallax 
          data-speed="0.4"
          style={{
            backgroundImage: 'url(/images/protoshow.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="gradient-edge-top"></div>
          <div className="gradient-edge-bottom"></div>
          <img src="/images/protoshow.png" className="jarallax-img" alt="" />
        </section>

        {/* FAQ Section */}
        <section>
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="subtitle id-color wow fadeInUp" data-wow-delay=".0s">Everything You Need to Know</div>
                <h2 className="wow fadeInUp" data-wow-delay=".2s">Frequently Asked Questions</h2>
              </div>

              <div className="col-lg-7">
                <div className="accordion s2 wow fadeInUp">
                  <div className="accordion-section">
                    <div className="accordion-section-title" data-tab="#accordion-a1">
                      What is car detailing?
                    </div>
                    <div className="accordion-section-content" id="accordion-a1">
                      Car detailing is a thorough cleaning, restoration, and finishing of a vehicle to produce a show-quality cleanliness and polish, both inside and out.
                    </div>

                    <div className="accordion-section-title" data-tab="#accordion-a2">
                      How often should I get my car detailed?
                    </div>
                    <div className="accordion-section-content" id="accordion-a2">
                      It depends on your usage, but most experts recommend detailing every 3–6 months to maintain your car's appearance and protect its value.
                    </div>

                    <div className="accordion-section-title" data-tab="#accordion-a3">
                      What's included in a full detailing service?
                    </div>
                    <div className="accordion-section-content" id="accordion-a3">
                      A full detail typically includes exterior wash and polish, interior vacuuming and shampooing, leather conditioning, window cleaning, and engine bay cleaning.
                    </div>

                    <div className="accordion-section-title" data-tab="#accordion-a4">
                      Will detailing remove scratches and stains?
                    </div>
                    <div className="accordion-section-content" id="accordion-a4">
                      Light scratches and stains can often be removed through polishing and deep cleaning. Heavier damage may require paint correction or special treatment.
                    </div>

                    <div className="accordion-section-title" data-tab="#accordion-a5">
                      How long does a detailing session take?
                    </div>
                    <div className="accordion-section-content" id="accordion-a5">
                      Depending on the vehicle size and service level, a full detailing can take between 2 to 6 hours. We'll let you know the estimated time during booking.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-color text-light pt-60 pb-50">
          <div className="container">
            <div className="row g-4 align-items-center">
              <div className="col-md-9">
                <h3 className="mb-0 fs-32">REMEMBER PROTOMOTIVE HAS YOUR VEHICLE PROTECTED INSIDE AND OUT</h3>
              </div>
              <div className="col-lg-3 text-lg-end">
                <Link href="/booking" className="btn-main fx-slide btn-line btn-gray" data-hover="BOOK NOW">
                  <span>BOOK NOW</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-dark-2 pt-50 relative no-bottom">
          <div className="container relative z-2" style={{ paddingTop: '35px' }}>
            <div className="row g-4">
              <div className="col-lg-8 offset-lg-2 mb-4 text-center">
              <div className="spacer-single"></div>
                <div className="spacer-single"></div>
                <div className="subtitle id-color wow fadeInUp mb-3">Contact Us</div>
                <h2 className="wow fadeInUp">PROTOMOTIVE</h2>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section>
          <div className="container">
            <div className="row g-4 justify-content-between">
              <div className="col-lg-6">
                <div className="p-40 h-100 jarallax rounded-1 overflow-hidden">
                  <img src="/images/red-car-wheel.jpg" className="jarallax-img" alt="" />
                  <div className="sw-overlay"></div>
                  <div className="gradient-edge-bottom h-80"></div>
                  <div className="relative z-2">
                    <div className="subtitle">Get In Touch</div>
                    <h2 className="wow fadeInUp">We are always ready to help you</h2>
                    <p>Whether you have a question, a suggestion, or just want to say hello, this is the place to do it. Please fill out the form below with your details and message, and we'll get back to you as soon as possible.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="p-40 bg-dark-2 text-light rounded-1">
                  <h3>Get In Touch</h3>
                  <form onSubmit={handleContactSubmit} className="relative z1000">
                    <div className="field-set">
                      <input
                        type="text"
                        name="name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        className="form-control"
                        placeholder="Your Name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="field-set">
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        className="form-control"
                        placeholder="Your Email"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="field-set">
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        className="form-control"
                        placeholder="Your Phone (Optional)"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="field-set mb20">
                      <textarea
                        name="message"
                        value={contactForm.message}
                        onChange={handleContactChange}
                        className="form-control"
                        placeholder="Your Message"
                        rows="7"
                        style={{height: '175px', maxHeight: '175px', minHeight: '175px', overflowY: 'auto', resize: 'none', lineHeight: '1.5'}}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="mt20">
                      <button
                        type="submit"
                        className="btn-main"
                        disabled={isSubmitting}
                        style={{
                          opacity: isSubmitting ? 0.7 : 1,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>

                    {submitMessage && (
                      <div className={`mt-3 p-3 rounded ${submitSuccess ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                        {submitMessage}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="spacer-double"></div>

            <div className="row g-4">
              <div className="col-lg-4">
                <h4 className="subtitle-line">Protomotive</h4>
                <i className="icofont-location-pin id-color"></i><span>Plot 413,
                  DHA Phase 8 Ex Park View Block D</span><br />
                <i className="icofont-phone id-color"></i><span><a href="tel:+923005005666" style={{ color: 'inherit', textDecoration: 'underline' }}>0300 5005666</a></span><br />
                <i className="icofont-clock-time id-color"></i><span>10.00 am - 9.00 pm</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Map Section */}
<div className="cs_navigation_map wow fadeInUp">
  <div 
    id="map_canvas" 
    style={{
      width: '100%',
      height: '400px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }}
  />
</div>
      </div>
    </Layout>
  );
}

// Testimonial Card Component
/* function TestimonialCard({ name, date, rating, text }) {
  const stars = Array(rating).fill(0).map((_, i) => (
    <i key={i} className="fa fa-star"></i>
  ));
  
  return (
    <div className="bg-dark-2 rounded-1 p-30 testimonial-container">
      <div className="testimonial-header">
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <img className="w-40px circle me-3" alt="" src="/images/avatarlogo.png" />
            <div className="mt-2">
              <div className="text-white fw-bold lh-1">{name}</div>
              <small>{date}</small>
            </div>
          </div>
        </div>
        <div className="de-rating-ext mb-2">
          <span className="d-stars">
            {stars}
          </span>
          <span className="ms-2 text-white">{rating}.0</span>
        </div>
      </div>
      <div className="testimonial-content">
        <p>"{text}"</p>
      </div>
    </div>
  );
} */

// Service Card Component
function ServiceCard({ id, title, image, description, delay }) {
  // Map service titles to URL parameters for services page
  const getServiceUrl = (serviceTitle) => {
    const serviceMap = {
      'DETAILING': 'detailing',
      'VEHICLE WRAP': 'vehicle-wrap', 
      'CERAMIC COATING': 'ceramic-coating',
      'PAINT PROTECTION FILM (PPF)': 'paint-protection-film',
      'OIL CHANGE MAINTENANCE': 'oil-change-maintenance',
      'WINDOW TINTING': 'window-tinting'
    };
    const serviceKey = serviceMap[serviceTitle] || 'detailing';
    return `/services?service=${serviceKey}`;
  };

  return (
    <div className="col-12 col-sm-6 col-md-4">
      <Link href={getServiceUrl(title)} className="text-decoration-none">
        <div className="hover rounded-1 overflow-hidden relative text-light text-center wow fadeInRight" data-wow-delay={delay} style={{ cursor: 'pointer' }}>
          <div style={{ position: 'relative', width: '100%', height: '150px' }}>
            <Image 
              src={image} 
              alt={title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="hover-scale-1-1"
            />
          </div>
          <div className="abs w-100 px-4 hover-op-1 z-4 hover-mt-40 abs-centered">
            <span className="text-center text-light">{description}</span>
          </div>
          <h3 className="abs fs-32 lh-1 p-4 top-0 start-0 z-2">{id}</h3>
          <div className="abs bg-blur z-2 top-0 w-100 h-100 hover-op-1"></div>
          <div className="sw-overlay op-8"></div>
          <div className="abs z-2 abs-middle mt-2 w-100 text-center hover-op-0">
            <h4 className="mb-3">{title}</h4>
          </div>
        </div>
      </Link>
    </div>
  );
}