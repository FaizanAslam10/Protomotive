// Service toggle functionality with database integration
// VERSION: 4.0 - FORCE REBUILD AFTER BUNDLE CACHE ISSUE
// BUILD_ID: 27092025_2007
// console.log('🔄 SERVICES.JS LOADED - VERSION 4.0 - FORCED REBUILD');
// console.log('📅 TIMESTAMP:', new Date().toISOString());
// console.log('🔧 BUILD_ID: 27092025_2007');
// console.log('🎯 THIS VERSION CALLS /api/check-availability-for-service');
// console.log('❌ If you see /api/check-availability being called, you have BUNDLE CACHE!');

// Early error detection
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    console.error('Error message:', e.message);
    console.error('Error source:', e.filename, 'Line:', e.lineno);
});

document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.service-toggle-btn');
    const serviceContainers = document.querySelector('.service-containers');
    

    // Service content data
    const serviceContent = {
        'detailing': {
            count: 6,
            services: [
                { title: 'PRECISION PACKAGE', description: 'A clay bar treatment removes embedded dirt that washing can not, leaving your vehicles paint smooth, glossy, and ready for wax. ', price: '$399.99', duration: '2-4 Hours' },
                { title: 'GOLD PACKAGE', description: 'Comprehensive cleaning with wax protection, clay bar treatment, and deep interior cleaning for enhanced protection.', price: 'From $149.99', duration: '2-4 Hours' },
                { title: 'BRONZE PACKAGE', description: 'Our most comprehensive package with paint correction, sealant application, and engine bay cleaning for showroom quality.', price: 'From $109.99', duration: '1.5-3 Hours' },
                { title: 'ODOR REMOVAL', description: 'Complete interior and exterior restoration with leather conditioning, fabric protection, and premium finishing touches.', price: 'From $279.99', duration: '30 min-1 Hours' },
                { title: 'WASH ME', description: 'Complete interior and exterior restoration with leather conditioning, fabric protection, and premium finishing touches.', price: '$30-$50', duration: '30 Minutes' },
                { title: 'LEATHER TREATMENT', description: 'Complete interior and exterior restoration with leather conditioning, fabric protection, and premium finishing touches.', price: '$60', duration: '1.5 Hours' }
            ],
            gridClass: 'col-12 col-sm-6 col-md-4'
        },
        'vehicle-wrap': {
            count: 4,
            services: [
                { title: 'FULL VEHICLE WRAPS', description: 'Complete vehicle transformation with premium vinyl wraps for maximum protection and stunning visual appeal.', price: 'From $2,799', duration: '3 Hours' },
                { title: 'HOOD & ROOF WRAPS', description: 'Accent wrapping for hoods and roofs to create distinctive styling while protecting vulnerable areas.', price: 'Contact For Prices', duration: '3 Hours' },
                { title: 'PARTIAL WRAPS', description: 'Custom partial wrapping solutions for specific vehicle sections to achieve unique design elements.', price: 'From $149.99', duration: '3 Hours' },
                { title: 'WINDOW MOULDINGS (CHROME DELETES)', description: 'Chrome delete services to modernize your vehicle appearance with sleek black accents.', price: 'From $349.99', duration: '3 Hours' }
               
            ],
            gridClass: 'col-12 col-sm-6 col-md-4'
        },
        'ceramic-coating': {
            count: 6,
            services: [
                { title: 'CERAMIC PRO GOLD PACKAGE', description: 'Premium ceramic coating with enhanced durability, superior chemical resistance, and 5-year warranty protection.', price: 'From $1,499', duration: '2 Hours' },
                { title: 'CERAMIC PRO SILVER PACKAGE', description: 'Entry-level ceramic protection with essential coverage, UV protection, and hydrophobic properties with 2-year warranty.', price: 'From $899', duration: '2 Hours' },
                { title: 'CERAMIC PRO BRONZE PACKAGE', description: 'Basic ceramic coating protection with essential gloss enhancement and fundamental paint protection features.', price: 'From $599', duration: '2 Hours' },
                { title: 'CERAMIC PRO SPORT PACKAGE', description: 'High-performance ceramic coating designed for sports vehicles with enhanced durability and track-ready protection.', price: 'From $349', duration: '2 Hours' },
                { title: 'CERAMIC PRO INTERIOR PROTECTION', description: 'Specialized ceramic coating for vehicle interiors including leather, fabric, and plastic surfaces protection.', price: 'From $599', duration: '2 hours' },
                { title: 'PAINT FILM AND VINYL PROTECTION', description: 'Marine-grade ceramic protection designed for boats and watercraft with saltwater resistance.', price: 'From $699', duration: '2 Hours' }
            ],
            gridClass: 'col-12 col-sm-6 col-md-4'
        },
        'paint-protection-film': {
            count: 3,
            services: [
                { title: 'FULL VEHICLE PROTECTION KIT', description: 'Complete vehicle protection with premium paint protection film covering the entire vehicle surface for maximum protection.', price: 'From $1,299', duration: '2 Hours' },
                { title: 'PARTIAL FRONT PROTECTION KIT', description: 'Strategic protection for high-impact areas including front bumper, hood, fenders, and side mirrors for essential coverage.', price: 'From $1,899', duration: '3 Hours' },
                { title: 'FULL FRONT PROTECTION KIT', description: 'Comprehensive front-end protection including bumper, hood, headlights, and mirror coverage for maximum impact protection.', price: 'From $4,799', duration: '3 Hours' }
            ],
            gridClass: 'col-12 col-sm-6 col-md-4'
        },
        'powder-coating': {
            count: 0,
            services: [
                { title: 'COMING SOON', description: 'Professional refinishing with durable powder coating in various colors and finishes for enhanced appearance.', price: 'TBD', duration: 'TBD' },
                
            ],
            gridClass: 'col-12 col-sm-6 col-md-4'
        },
        'window-tinting': {
            count: 5,
            services: [
                { title: 'FRONT 2 WINDOWS', description: 'Driver and Passenger side windows', price: '$119.99', duration: '1-2 hours' },
                { title: 'FULL VEHICLE', description: 'Windshield not included', price: '$219.99', duration: '2-3 hours' },
                { title: 'WINDSHEILD', description: 'Windsheild tinting', price: '$149.99', duration: '1-2 hours' },
                { title: 'WINDSHEILD BROW TINT', description: 'Windshield not included', price: '$79.99', duration: '30-60 mins' },
                { title: 'AIRCRAFTS', description: 'Please call for price inquiry', price: 'Contact Us', duration: 'N/A' }
            ],
            gridClass: 'col-12 col-sm-6 col-md-4'
        }
    };

    // API Configuration - Updated for database
    const API_CONFIG = {
        booking_endpoint: '/api/book-appointment',
        availability_endpoint: '/api/check-availability',
        timeout: 30000
    };

    // Timezone Configuration
    const TIMEZONE_CONFIG = {
        business: {
            timezone: 'America/Toronto', // Handles EDT/EST automatically
            label: 'Eastern Time',
            openingTime: '10:30',
            closingTime: '15:30'
        }
    };

    // Booking modal state
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedService = null;
    let originalServicesContent = null;
    let currentActiveService = 'detailing';
    let selectedTimezone = 'EDT'; // Default to EDT (business timezone)

    // Enhanced timezone handling functions
    function getUserTimezoneInfo() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short'
        });
        const parts = formatter.formatToParts(now);
        const tzAbbr = parts.find(p => p.type === 'timeZoneName')?.value || 'Local';

        // Get UTC offset
        const offset = -now.getTimezoneOffset() / 60;
        const offsetStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;

        return {
            timezone,
            abbreviation: tzAbbr,
            offset: offsetStr,
            offsetMinutes: -now.getTimezoneOffset()
        };
    }

    // Check if a date is in daylight saving time
    function isDaylightSavingTime(date) {
        const year = date.getFullYear();

        // Get second Sunday in March
        const marchFirst = new Date(year, 2, 1);
        const daysUntilSunday = (7 - marchFirst.getDay()) % 7;
        const secondSunday = new Date(year, 2, 1 + daysUntilSunday + 7);

        // Get first Sunday in November
        const novemberFirst = new Date(year, 10, 1);
        const daysUntilSundayNov = (7 - novemberFirst.getDay()) % 7;
        const firstSunday = new Date(year, 10, 1 + daysUntilSundayNov);

        return date >= secondSunday && date < firstSunday;
    }

    // Proper EDT to user timezone conversion
    function convertEDTToUserTimezone(edtTimeStr, dateStr) {
        try {
            // Determine if the date falls in EDT or EST
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            // EDT runs from second Sunday in March to first Sunday in November
            const isEDT = isDaylightSavingTime(date);
            const offset = isEDT ? '-04:00' : '-05:00';

            // Create a proper ISO string with timezone
            const isoString = `${dateStr}T${edtTimeStr}:00${offset}`;
            const edtDate = new Date(isoString);

            // Get user's timezone
            const userTz = getUserTimezoneInfo();

            // Format in user's timezone
            return {
                time: edtDate.toLocaleTimeString('en-US', {
                    timeZone: userTz.timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                displayTime: edtDate.toLocaleTimeString('en-US', {
                    timeZone: userTz.timezone,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                timezone: userTz.abbreviation,
                edtTime: edtTimeStr,
                date: edtDate
            };
        } catch (error) {
            console.error('Timezone conversion error:', error);
            return {
                time: edtTimeStr,
                displayTime: formatTime(edtTimeStr),
                timezone: 'EDT',
                edtTime: edtTimeStr,
                error: true
            };
        }
    }

    // Function to create service containers with new design
    function createServiceContainers(serviceKey) {
        const service = serviceContent[serviceKey];
        let html = '<div class="row g-4 mt-4">';
        
        service.services.forEach((item, index) => {
            const delay = index * 0.2;
            const imageNum = (index % 6) + 1;
            
            // Use specific images for different services
            let imageSrc = `images/service-${imageNum}.jpg`;
            if (serviceKey === 'ceramic-coating') {
                imageSrc = 'images/ceramicpro.png';
            } else if (serviceKey === 'vehicle-wrap') {
                imageSrc = 'images/3m.jpg';
            } else if (serviceKey === 'paint-protection-film') {
                imageSrc = 'images/ultimate.png';
            } else if (serviceKey === 'window-tinting') {
                imageSrc = 'images/xpel-01.jpg';
            } else if (serviceKey === 'detailing') {
                // Use specific images for detailing packages
                switch(item.title) {
                    case 'PRECISION PACKAGE':
                        imageSrc = 'images/precisionblack.png';
                        break;
                    case 'GOLD PACKAGE':
                        imageSrc = 'images/precisiongold.png';
                        break;
                    case 'BRONZE PACKAGE':
                        imageSrc = 'images/precisionbronze.png';
                        break;
                    case 'ODOR REMOVAL':
                        imageSrc = 'images/precisionsilver.png';
                        break;
                    case 'WASH ME':
                        imageSrc = 'images/washme.avif';
                        break;
                    case 'LEATHER TREATMENT':
                        imageSrc = 'images/leather.avif';
                        break;
                    default:
                        imageSrc = `images/service-${imageNum}.jpg`;
                }
            }
            
            html += `
    <!-- service item begin -->
    <div class="${service.gridClass}">
        <div class="service-container" style="position: relative;">
            <!-- Badge Container -->
            <div class="service-badge wow fadeInUp" data-wow-delay="${delay}s">
                <img src="${imageSrc}" alt="${item.title}" />
            </div>
            
            <!-- Gray Card Container -->
            <div class="service-card-new bg-gray rounded-1 h-100 wow fadeInUp" data-wow-delay="${delay}s">
                <h4 class="service-title mb-2 text-white">${item.title}</h4>
                <div class="subtitle-line mb-2"></div>
                <div class="service-duration text-white small mb-3 text-start">${item.duration || ''}</div>
                <p class="service-description text-light mb-3">${item.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="service-price text-white fw-bold fs-6">${item.price || 'Contact for Price'}</div>
                    <button class="book-now-btn btn-main fx-slide btn-sm" data-service="${item.title}" data-price="${item.price}" data-duration="${item.duration}" style="padding: 8px 12px; font-size: 12px;${serviceKey === 'powder-coating' ? ' opacity: 0.5; cursor: not-allowed; pointer-events: none;' : ''}" ${serviceKey === 'powder-coating' ? 'disabled title="Coming Soon"' : ''}>
                        <span>BOOK NOW</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- service item end -->
`;
        });
        
        html += '</div>';
        return html;
    }

    // Booking modal functionality
    function createBookingModal() {
        const modalHTML = `
        <!-- Booking Modal -->
        <div class="booking-modal" id="bookingModal">
            <div class="booking-container">
                <div class="booking-header">
                    <h2 class="booking-title" id="modalServiceTitle">Schedule Your Service</h2>
                    <button class="close-btn" id="closeModal">&times;</button>
                </div>
                
                <div class="booking-content">
                    <!-- Calendar Section -->
                    <div class="calendar-section">
                        <h3 class="section-title">Select a Date</h3>
                        <div class="calendar-header">
                            <button class="calendar-nav" id="prevMonth">&lt;</button>
                            <span class="month-year" id="monthYear"></span>
                            <button class="calendar-nav" id="nextMonth">&gt;</button>
                        </div>
                        <div class="calendar-grid" id="calendarGrid">
                            <!-- Calendar will be generated here -->
                        </div>
                    </div>

                    <!-- Time Slots Section -->
                    <div class="time-section">
                        <h3 class="section-title">Available Times for <span id="selectedDateDisplay">Select a date</span></h3>
                        <div class="timezone-selector" style="margin: 10px 0;">
                            <label for="timezoneSelect" style="font-size: 14px; margin-right: 10px;">Show times in:</label>
                            <select id="timezoneSelect" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                                <option value="EDT">Eastern Daylight Time (EDT)</option>
                                <option value="USER">Your Local Time</option>
                            </select>
                        </div>
                        <div class="time-slots" id="timeSlots">
                            <!-- Time slots will be generated here -->
                        </div>
                    </div>

                    <!-- Service Details Section -->
                    <div class="details-section">
                        <div class="service-info" id="serviceInfo">
                            <h3 id="serviceTitle">Service Details</h3>
                            <p id="serviceDescription">Please select a service to view details.</p>
                            <p><strong>Duration:</strong> <span id="serviceDuration">-</span></p>
                            <p><strong>Price:</strong> <span id="servicePrice">-</span></p>
                        </div>

                        <div class="booking-summary" id="bookingSummary" style="display: none;">
                            <div class="summary-item">
                                <span>Service:</span>
                                <span class="summary-value" id="summaryService">-</span>
                            </div>
                            <div class="summary-item">
                                <span>Date:</span>
                                <span class="summary-value" id="summaryDate">-</span>
                            </div>
                            <div class="summary-item">
                                <span>Time:</span>
                                <span class="summary-value" id="summaryTime">-</span>
                            </div>
                            <div class="summary-item">
                                <span>Total:</span>
                                <span class="summary-value" id="summaryPrice">-</span>
                            </div>
                        </div>

                        <div class="success-message" id="successMessage">
                            Booking confirmed! You will receive a confirmation email shortly.
                        </div>

                        <div class="error-message" id="errorMessage">
                            Sorry, there was an error processing your booking. Please try again.
                        </div>

                        <div class="next-button-container">
                            <button type="button" class="next-btn btn-main fx-slide" id="nextButton">
                                <span>NEXT</span>
                            </button>
                        </div>

                        <div class="loading" id="loadingIndicator">
                            <img src="/images/loadinglogo.png" alt="Loading..." style="width: 50px; height: auto;" class="fa-spin" />
                            <p>Processing your booking...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        return modalHTML;
    }

    function setupBookingEventListeners() {
        const bookingModal = document.getElementById('bookingModal');
        const closeModal = document.getElementById('closeModal');
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('monthYear');
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        const timeSlots = document.getElementById('timeSlots');
        const selectedDateDisplay = document.getElementById('selectedDateDisplay');
        const nextButton = document.getElementById('nextButton');

        // Modal close
        closeModal.addEventListener('click', closeBookingModal);

        // Calendar navigation
        prevMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        });

        nextMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        });

        // Next button functionality
        nextButton.addEventListener('click', handleNextButtonClick);
    }

    function openBookingModal(serviceTitle, servicePrice, serviceDuration, serviceDescription = '') {
        console.log('=== SERVICE SELECTED ===');
        console.log('Service:', serviceTitle);
        console.log('Duration:', serviceDuration);

        selectedService = {
            title: serviceTitle,
            price: servicePrice,
            duration: serviceDuration,
            description: serviceDescription
        };

        console.log('selectedService set to:', selectedService);
        
        // Hide toggle buttons and replace with booking modal
        const serviceContainers = document.querySelector('.service-containers');
        if (serviceContainers) {
            // Hide toggle buttons
            const toggleButtons = document.querySelector('.service-buttons');
            if (toggleButtons) {
                toggleButtons.style.display = 'none';
            }
            
            // Replace services content with booking modal
            const modalHTML = createBookingModal();
            serviceContainers.innerHTML = modalHTML;
            
            // Setup event listeners after inserting modal
            setupBookingEventListeners();
            
            // Update modal title and service info
            document.getElementById('modalServiceTitle').textContent = `Book ${serviceTitle}`;
            document.getElementById('serviceTitle').textContent = serviceTitle;
            document.getElementById('serviceDescription').textContent = serviceDescription || 'Professional auto service at Precision Auto Center.';
            document.getElementById('serviceDuration').textContent = serviceDuration;
            document.getElementById('servicePrice').textContent = servicePrice;

            // Reset selections
            selectedDate = null;
            selectedTime = null;
            
            // Show modal with animation
            const modal = document.getElementById('bookingModal');
            modal.classList.add('active');
            
            // Generate calendar
            generateCalendar();
            updateTimeSlots();
            updateBookingSummary();
            updateNextButton();
        }
    }

    function closeBookingModal() {
        // Restore services content based on current active service
        const serviceContainers = document.querySelector('.service-containers');
        if (serviceContainers) {
            serviceContainers.innerHTML = createServiceContainers(currentActiveService);
            
            // Show toggle buttons again
            const toggleButtons = document.querySelector('.service-buttons');
            if (toggleButtons) {
                toggleButtons.style.display = '';
                
                // Ensure the correct toggle button is active
                const allToggleButtons = document.querySelectorAll('.service-toggle-btn');
                allToggleButtons.forEach(btn => btn.classList.remove('active'));
                const activeButton = document.querySelector(`[data-target="${currentActiveService}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }
            
            // Re-setup book now listeners for the restored services
            setupBookNowListeners();
            
            // Re-trigger WOW animations if available
            if (typeof WOW !== 'undefined') {
                new WOW().init();
            }
        }
        
        // Reset booking state
        selectedDate = null;
        selectedTime = null;
        selectedService = null;
        originalServicesContent = null;
    }

    // Updated calendar generation with database availability
    async function generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('monthYear');
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthYear.textContent = `${getMonthName(month)} ${year}`;
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayDate = new Date(year, month, day);
            
            if (dayDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            if (dayDate < today) {
                dayElement.classList.add('disabled');
            } else {
                // Check if it's a business day (Mon-Sat)
                const dayOfWeek = dayDate.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 6) { // Monday to Saturday
                    dayElement.classList.add('available');
                    dayElement.addEventListener('click', () => selectDate(dateStr, dayElement));
                }
            }
            
            if (selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }

    function selectDate(dateStr, dayElement) {
        console.log('=== DATE SELECTED ===');
        console.log('Date:', dateStr);
        console.log('Current selectedService:', selectedService);

        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });

        // Add selection to clicked day
        dayElement.classList.add('selected');
        selectedDate = dateStr;
        selectedTime = null;

        console.log('selectedDate set to:', selectedDate);
        
        // Update display
        const date = new Date(dateStr);
        document.getElementById('selectedDateDisplay').textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        updateTimeSlots();
        updateBookingSummary();
        updateNextButton();
    }

    // Initialize timezone selector
    function initializeTimezoneSelector() {
        const timezoneSelect = document.getElementById('timezoneSelect');
        if (timezoneSelect) {
            // Set user timezone label dynamically
            const userTzAbbr = getUserTimezoneAbbr();
            const userOption = timezoneSelect.querySelector('option[value="USER"]');
            if (userOption) {
                userOption.textContent = `Your Local Time (${userTzAbbr})`;
            }

            // Add event listener for timezone changes
            timezoneSelect.addEventListener('change', function() {
                selectedTimezone = this.value === 'EDT' ? 'EDT' : userTzAbbr;
                console.log('Timezone changed to:', selectedTimezone);

                // Refresh time slots display with new timezone
                if (selectedDate) {
                    updateTimeSlots();
                }
            });
        }
    }

    // Add validation CSS for time slots
    function addValidationStyles() {
        if (!document.getElementById('validation-styles')) {
            const styles = document.createElement('style');
            styles.id = 'validation-styles';
            styles.textContent = `
                .time-slot.validating {
                    position: relative;
                    overflow: hidden;
                }
                .time-slot.validating::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: validation-loading 1s infinite;
                }
                @keyframes validation-loading {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Enhanced time slots function with improved timezone handling
    async function updateTimeSlots() {
        console.log('=== updateTimeSlots() CALLED ===');
        console.log('selectedDate:', selectedDate);
        console.log('selectedService:', selectedService);
        console.log('selectedService?.duration:', selectedService?.duration);

        addValidationStyles(); // Ensure styles are loaded
        const timeSlots = document.getElementById('timeSlots');
        const userTz = getUserTimezoneInfo();

        timeSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Loading available times...</div>';

        if (!selectedDate || !selectedService?.duration) {
            console.log('=== EARLY RETURN FROM updateTimeSlots ===');
            console.log('Reason: Missing selectedDate or selectedService.duration');
            timeSlots.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">Please select a date first</div>';
            return;
        }

        try {
            console.log('=== FRONTEND DEBUGGING ===');
            console.log('Selected service:', selectedService);
            console.log('Selected service duration:', selectedService.duration);
            console.log('Encoded duration:', encodeURIComponent(selectedService.duration));

            // Send user timezone to backend
            const apiUrl = `/api/check-availability-for-service?date=${selectedDate}&duration=${encodeURIComponent(selectedService.duration)}&timezone=${encodeURIComponent(userTz.timezone)}`;
            console.log('🚀 MAKING API CALL TO SERVICE-SPECIFIC ENDPOINT:');
            console.log('📡 URL:', apiUrl);

            const response = await fetch(apiUrl);

            const data = await response.json();

            if (!data.success) {
                timeSlots.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #2698cd; padding: 20px;">${data.message}</div>`;
                return;
            }

            // Display timezone information
            const tzInfo = document.createElement('div');
            tzInfo.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 10px; background: #f0f0f0; border-radius: 5px; margin-bottom: 10px;';

            if (userTz.timezone === 'Asia/Karachi') {
                tzInfo.innerHTML = `
                    <strong>Business Hours: 10:00 AM - 6:00 PM EDT</strong><br>
                    <small>In your timezone (PKT): 7:00 PM - 3:00 AM (next day)</small>
                `;
            } else {
                const openConverted = convertEDTToUserTimezone('10:00', selectedDate);
                const closeConverted = convertEDTToUserTimezone('18:00', selectedDate);
                tzInfo.innerHTML = `
                    <strong>Business Hours: 10:00 AM - 6:00 PM ${data.businessHours?.timezone || 'ET'}</strong><br>
                    <small>In your timezone (${userTz.abbreviation}): ${openConverted.displayTime} - ${closeConverted.displayTime}</small>
                `;
            }

            timeSlots.innerHTML = '';
            timeSlots.appendChild(tzInfo);

            // Show available slots
            const availableSlots = data.availableSlots || [];

            if (availableSlots.length === 0) {
                const noSlotsDiv = document.createElement('div');
                noSlotsDiv.style.cssText = 'grid-column: 1/-1; text-align: center; color: #888; padding: 20px;';
                noSlotsDiv.textContent = 'No times available for this date';
                timeSlots.appendChild(noSlotsDiv);
                return;
            }

            // Display slots with both EDT and local time
            availableSlots.forEach(edtTime => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot available';

                const converted = convertEDTToUserTimezone(edtTime, selectedDate);

                // Show both times if user is not in EDT
                if (selectedTimezone === 'USER' && userTz.timezone !== 'America/Toronto') {
                    timeSlot.innerHTML = `
                        <div style="font-size: 14px; font-weight: bold;">${converted.displayTime}</div>
                        <div style="font-size: 11px; color: #666;">${formatTime(edtTime)} EDT</div>
                    `;
                } else {
                    timeSlot.innerHTML = `
                        <div style="font-size: 14px; font-weight: bold;">${formatTime(edtTime)} EDT</div>
                        ${userTz.timezone !== 'America/Toronto' ? `<div style="font-size: 11px; color: #666;">${converted.displayTime} ${userTz.abbreviation}</div>` : ''}
                    `;
                }

                timeSlot.addEventListener('click', () => selectTime(edtTime, timeSlot));
                timeSlot.style.cursor = 'pointer';
                timeSlot.setAttribute('data-edt-time', edtTime);
                timeSlot.setAttribute('data-local-time', converted.time);

                timeSlots.appendChild(timeSlot);
            });

            // Initialize timezone selector after time slots are loaded
            setTimeout(initializeTimezoneSelector, 100);

        } catch (error) {
            console.error('Error loading time slots:', error);
            timeSlots.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #2698cd; padding: 20px;">Error: ${error.message}</div>`;
        }
    }

    async function selectTime(time, timeElement) {
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Show loading state
        timeElement.classList.add('validating');
        timeElement.style.opacity = '0.6';
        timeElement.style.pointerEvents = 'none';

        try {
            // Validate the timeslot with the selected service duration
            const validationResponse = await fetch(
                `/api/validate-timeslot?date=${selectedDate}&time=${time}&duration=${encodeURIComponent(selectedService.duration)}`
            );

            const validation = await validationResponse.json();

            if (validation.success) {
                // Add selection to clicked time
                timeElement.classList.add('selected');
                selectedTime = time;

                updateBookingSummary();
                updateNextButton();
            } else {
                // Show validation error
                alert(`Time slot unavailable: ${validation.message}\n\nPlease select a different time slot.`);

                // Refresh time slots to show updated availability
                setTimeout(() => {
                    updateTimeSlots();
                }, 1000);
            }

        } catch (error) {
            console.error('Timeslot validation error:', error);
            // Fall back to allowing the selection if validation fails
            timeElement.classList.add('selected');
            selectedTime = time;
            updateBookingSummary();
            updateNextButton();
        }

        // Remove loading state
        timeElement.classList.remove('validating');
        timeElement.style.opacity = '1';
        timeElement.style.pointerEvents = 'auto';
    }

    function updateBookingSummary() {
        const summaryDiv = document.getElementById('bookingSummary');
        
        if (selectedService && selectedDate && selectedTime) {
            const date = new Date(selectedDate);
            
            document.getElementById('summaryService').textContent = selectedService.title;
            document.getElementById('summaryDate').textContent = date.toLocaleDateString();
            document.getElementById('summaryTime').textContent = formatTime(selectedTime);
            document.getElementById('summaryPrice').textContent = selectedService.price;
            
            summaryDiv.style.display = 'block';
        } else {
            summaryDiv.style.display = 'none';
        }
    }

    function updateNextButton() {
        const nextButton = document.getElementById('nextButton');
        const isValid = selectedDate && selectedTime;
        nextButton.disabled = !isValid;
        
        if (isValid) {
            nextButton.classList.remove('disabled');
        } else {
            nextButton.classList.add('disabled');
        }
    }

    function createBookingForm() {
        const formHTML = `
        <!-- Booking Form Content -->
        <div class="booking-form-content">
            <!-- Left Column: Customer Information Form -->
            <div class="customer-form-section">
                <h3>Your Information</h3>
                <form class="customer-info-form" id="customerInfoForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerName">Full Name *</label>
                            <input type="text" id="customerName" name="customerName" required>
                        </div>
                        <div class="form-group">
                            <label for="customerEmail">Email Address *</label>
                            <input type="email" id="customerEmail" name="customerEmail" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerPhone">Phone Number *</label>
                            <input type="tel" id="customerPhone" name="customerPhone" required>
                        </div>
                        <div class="form-group">
                            <label for="vehicleInfo">Vehicle Make/Model/Year</label>
                            <input type="text" id="vehicleInfo" name="vehicleInfo" placeholder="e.g., 2020 Honda Civic">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="specialRequests">Special Requests (Optional)</label>
                        <textarea id="specialRequests" name="specialRequests" rows="4" placeholder="Any specific requirements or notes..."></textarea>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="form-actions">
                        <button type="button" class="back-btn" id="backToCalendar">
                            <span>BACK</span>
                        </button>
                        <button type="submit" class="confirm-booking-btn" id="confirmBooking">
                            <span>CONFIRM BOOKING</span>
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Right Column: Booking Summary -->
            <div class="booking-summary-column">
                <div class="booking-summary-header">
                    <h3>Booking Summary</h3>
                    <div class="summary-details">
                        <div class="summary-item">
                            <span>Service:</span>
                            <span class="summary-value">${selectedService.title}</span>
                        </div>
                        <div class="summary-item">
                            <span>Date:</span>
                            <span class="summary-value">${new Date(selectedDate).toLocaleDateString()}</span>
                        </div>
                        <div class="summary-item">
                            <span>Time:</span>
                            <span class="summary-value">${formatTime(selectedTime)}</span>
                        </div>
                        <div class="summary-item">
                            <span>Duration:</span>
                            <span class="summary-value">${selectedService.duration}</span>
                        </div>
                        <div class="summary-item">
                            <span>Price:</span>
                            <span class="summary-value">${selectedService.price}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Success/Error Messages -->
                <div class="booking-messages">
                    <div class="success-message" id="successMessage" style="display: none;">
                        <i class="fas fa-check-circle"></i>
                        <p>Booking confirmed! You will receive a confirmation email shortly.</p>
                    </div>
                    <div class="error-message" id="errorMessage" style="display: none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Sorry, there was an error processing your booking. Please try again.</p>
                    </div>
                    <div class="loading" id="loadingIndicator" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Processing your booking...</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        return formHTML;
    }

    // User details persistence functions
    function saveUserDetails(formData) {
        const userDetails = {
            name: formData.get('customerName'),
            email: formData.get('customerEmail'),
            phone: formData.get('customerPhone'),
            vehicle: formData.get('vehicleInfo'),
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('pac_user_details', JSON.stringify(userDetails));
        console.log('User details saved to localStorage');
    }

    function loadUserDetails() {
        try {
            const saved = localStorage.getItem('pac_user_details');
            if (saved) {
                const userDetails = JSON.parse(saved);
                console.log('Loading user details from localStorage:', userDetails);
                return userDetails;
            }
        } catch (error) {
            console.error('Error loading user details:', error);
        }
        return null;
    }

    function populateFormWithSavedDetails() {
        const savedDetails = loadUserDetails();
        if (savedDetails) {
            const nameField = document.getElementById('customerName');
            const emailField = document.getElementById('customerEmail');
            const phoneField = document.getElementById('customerPhone');
            const vehicleField = document.getElementById('vehicleInfo');

            if (nameField && savedDetails.name) nameField.value = savedDetails.name;
            if (emailField && savedDetails.email) emailField.value = savedDetails.email;
            if (phoneField && savedDetails.phone) phoneField.value = savedDetails.phone;
            if (vehicleField && savedDetails.vehicle) vehicleField.value = savedDetails.vehicle;

            console.log('Form populated with saved user details');
        }
    }

    function setupFormEventListeners() {
        const backButton = document.getElementById('backToCalendar');
        const form = document.getElementById('customerInfoForm');
        
        // Populate form with saved details when form loads
        setTimeout(populateFormWithSavedDetails, 100);
        
        // Back button functionality
        if (backButton) {
            backButton.addEventListener('click', function() {
                // Recreate the original booking modal content
                const bookingContent = document.querySelector('.booking-content');
                if (bookingContent) {
                    // Recreate the original modal structure
                    bookingContent.innerHTML = `
                        <!-- Calendar Section -->
                        <div class="calendar-section">
                            <h3 class="section-title">Select a Date</h3>
                            <div class="calendar-header">
                                <button class="calendar-nav" id="prevMonth">&lt;</button>
                                <span class="month-year" id="monthYear"></span>
                                <button class="calendar-nav" id="nextMonth">&gt;</button>
                            </div>
                            <div class="calendar-grid" id="calendarGrid">
                                <!-- Calendar will be generated here -->
                            </div>
                        </div>

                        <!-- Time Slots Section -->
                        <div class="time-section">
                            <h3 class="section-title">Available Times for <span id="selectedDateDisplay">${selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}</span></h3>
                            <div class="timezone-selector" style="margin: 10px 0;">
                                <label for="timezoneSelect" style="font-size: 14px; margin-right: 10px;">Show times in:</label>
                                <select id="timezoneSelect" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                                    <option value="EDT">Eastern Daylight Time (EDT)</option>
                                    <option value="USER">Your Local Time</option>
                                </select>
                            </div>
                            <div class="time-slots" id="timeSlots">
                                <!-- Time slots will be generated here -->
                            </div>
                        </div>

                        <!-- Service Details Section -->
                        <div class="details-section">
                            <div class="service-info" id="serviceInfo">
                                <h3 id="serviceTitle">${selectedService.title}</h3>
                                <p id="serviceDescription">${selectedService.description}</p>
                                <p><strong>Duration:</strong> <span id="serviceDuration">${selectedService.duration}</span></p>
                                <p><strong>Price:</strong> <span id="servicePrice">${selectedService.price}</span></p>
                            </div>

                            <div class="booking-summary" id="bookingSummary">
                                <div class="summary-item">
                                    <span>Service:</span>
                                    <span class="summary-value" id="summaryService">${selectedService.title}</span>
                                </div>
                                <div class="summary-item">
                                    <span>Date:</span>
                                    <span class="summary-value" id="summaryDate">${new Date(selectedDate).toLocaleDateString()}</span>
                                </div>
                                <div class="summary-item">
                                    <span>Time:</span>
                                    <span class="summary-value" id="summaryTime">${formatTime(selectedTime)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>Total:</span>
                                    <span class="summary-value" id="summaryPrice">${selectedService.price}</span>
                                </div>
                            </div>

                            <div class="next-button-container">
                                <button type="button" class="next-btn btn-main fx-slide" id="nextButton">
                                    <span>NEXT</span>
                                </button>
                            </div>
                        </div>`;
                    
                    setupBookingEventListeners();
                    generateCalendar();
                    updateTimeSlots();
                    updateNextButton();
                }
            });
        }
        
        // Form submission with database integration
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const loadingIndicator = document.getElementById('loadingIndicator');
                const successMessage = document.getElementById('successMessage');
                const errorMessage = document.getElementById('errorMessage');
                
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
                loadingIndicator.style.display = 'block';
                
                try {
                    const formData = new FormData(form);
                    
                    // Save user details to localStorage before submitting
                    saveUserDetails(formData);
                    
                    const bookingData = {
                        name: formData.get('customerName'),
                        email: formData.get('customerEmail'),
                        phone: formData.get('customerPhone'),
                        vehicle: formData.get('vehicleInfo'),
                        requests: formData.get('specialRequests'),
                        service: selectedService.title,
                        date: selectedDate,
                        time: selectedTime,
                        duration: selectedService.duration,
                        price: selectedService.price
                    };
                    
                    const response = await submitBooking(bookingData);
                    
                    if (response.success) {
                        loadingIndicator.style.display = 'none';
                        successMessage.innerHTML = `
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <p><strong>Booking Confirmed!</strong></p>
                                <p>Your appointment has been scheduled successfully.</p>
                                ${response.booking_reference ? `<p><strong>Booking Reference:</strong> ${response.booking_reference}</p>` : ''}
                                <p><strong>Important:</strong> Please save this confirmation and arrive 10-15 minutes early.</p>
                                <p><strong>Contact:</strong> <a href="tel:+19056703484" style="color: inherit; text-decoration: underline;">(905) 670-3484</a> | pacwebsite10@gmail.com</p>
                            </div>
                        `;
                        successMessage.style.display = 'block';
                        
                        form.style.opacity = '0.6';
                        form.style.pointerEvents = 'none';

                        // Dispatch booking success event for auto-refresh
                        document.dispatchEvent(new CustomEvent('bookingSuccess', {
                            detail: {
                                bookingReference: response.booking_reference,
                                bookingId: response.booking_id,
                                date: selectedDate,
                                time: selectedTime,
                                formattedTime: formatTime(selectedTime),
                                service: selectedService ? selectedService.title : 'Unknown Service',
                                duration: selectedService ? selectedService.duration : '1 Hour'
                            }
                        }));
                        
                        console.log('Booking success event dispatched for auto-refresh');
                        
                    } else {
                        throw new Error(response.message || 'Booking failed');
                    }
                    
                } catch (error) {
                    console.error('Booking Error:', error);
                    loadingIndicator.style.display = 'none';
                    errorMessage.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <p><strong>Booking Failed</strong></p>
                            <p>${error.message || 'Sorry, there was an error processing your booking.'}</p>
                            <p>Please try again or call us directly at <a href="tel:+19056703484" style="color: inherit; text-decoration: underline;">(905) 670-3484</a></p>
                        </div>
                    `;
                    errorMessage.style.display = 'block';

                    // If it's a time slot conflict, refresh time slots
                    const errorMsg = error.message || '';
                    if (errorMsg.toLowerCase().includes('time slot') || 
                        errorMsg.toLowerCase().includes('no longer available') ||
                        errorMsg.toLowerCase().includes('conflict')) {
                        
                        console.log('Time slot conflict detected, refreshing time slots...');
                        
                        // Refresh time slots after a brief delay
                        setTimeout(() => {
                            updateTimeSlots();
                        }, 2000);
                    }
                }
            });
        }
    }

    // Updated submit booking function for database integration
    // Enhanced booking submission with timezone context
    async function submitBooking(bookingData) {
        const userTz = getUserTimezoneInfo();

        // Add timezone information to booking
        const enhancedBookingData = {
            ...bookingData,
            userTimezone: userTz.timezone,
            userTimezoneAbbr: userTz.abbreviation,
            bookingTimezone: 'EDT', // Always store in EDT
            localTime: convertEDTToUserTimezone(bookingData.time, bookingData.date).displayTime
        };

        try {
            const response = await fetch(API_CONFIG.booking_endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enhancedBookingData)
            });

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    message: result.message,
                    booking_reference: result.booking_reference,
                    email_sent: result.email_sent || false
                };
            } else {
                throw new Error(result.message || 'Booking failed');
            }

        } catch (error) {
            throw error;
        }
    }

    function handleNextButtonClick() {
        if (selectedDate && selectedTime && selectedService) {
            const bookingContent = document.querySelector('.booking-content');
            if (bookingContent) {
                bookingContent.innerHTML = createBookingForm();
                setupFormEventListeners();
            }
        }
    }

    // Helper functions
    function getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Initial load - show detailing by default
    if (serviceContainers) {
        serviceContainers.innerHTML = createServiceContainers('detailing');
        setupBookNowListeners();
    }

    // Function to setup book now button listeners
    function setupBookNowListeners() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('book-now-btn') || e.target.closest('.book-now-btn')) {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target.classList.contains('book-now-btn') ? e.target : e.target.closest('.book-now-btn');
                
                if (btn.disabled) return;
                
                const serviceTitle = btn.dataset.service;
                const servicePrice = btn.dataset.price;
                const serviceDuration = btn.dataset.duration;
                
                const serviceCard = btn.closest('.service-card-new');
                const serviceDescription = serviceCard ? serviceCard.querySelector('.service-description').textContent : '';
                
                openBookingModal(serviceTitle, servicePrice, serviceDuration, serviceDescription);
            }
        });
    }

    // Button click handlers for service toggles
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            currentActiveService = targetId;
            
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (serviceContainers && serviceContent[targetId]) {
                serviceContainers.innerHTML = createServiceContainers(targetId);
                setupBookNowListeners();
                
                if (typeof WOW !== 'undefined') {
                    new WOW().init();
                }
            }
        });
    });

    // Handle URL parameters for direct service access
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
        const targetButton = document.querySelector(`[data-target="${serviceParam}"]`);
        if (targetButton) {
            targetButton.click();
        }
    }
});