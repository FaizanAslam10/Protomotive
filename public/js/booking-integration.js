/**
 * Booking Integration Helper
 * Integrates the date availability system with your existing booking modal
 */

class BookingIntegration {
    constructor(options = {}) {
        this.bookingEndpoint = options.bookingEndpoint || '/api/book-appointment';
        this.dateManager = options.dateManager || window.dateAvailabilityManager;
        
        this.init();
    }

    init() {
        console.log('BookingIntegration initialized');
        
        // Listen for form submissions
        this.setupBookingFormHandler();
        
        // Listen for time slot refreshes
        this.setupRefreshHandlers();
    }

    setupBookingFormHandler() {
        // Override existing booking form submission if it exists
        const existingForms = document.querySelectorAll('form[id*="booking"], form[id*="customerInfo"]');
        
        existingForms.forEach(form => {
            // Remove existing event listeners by cloning the form
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // Add new event listener with auto-refresh
            newForm.addEventListener('submit', (e) => {
                this.handleBookingSubmission(e, newForm);
            });
            
            console.log('Replaced booking form handler with auto-refresh version');
        });
    }

    async handleBookingSubmission(event, form) {
        event.preventDefault();
        
        console.log('Booking form submitted with auto-refresh integration');
        
        // Get booking data from the date manager
        const bookingData = this.dateManager ? this.dateManager.getBookingData() : null;
        
        if (!bookingData) {
            console.error('No booking data available from date manager');
            this.showError('Please select a date and time');
            return;
        }

        // Show loading state
        this.showLoading();

        try {
            // Prepare form data with date/time from manager
            const formData = new FormData(form);
            
            // Add date/time data from the manager
            const submissionData = {
                name: formData.get('customerName'),
                email: formData.get('customerEmail'),
                phone: formData.get('customerPhone'),
                vehicle: formData.get('vehicleInfo'),
                requests: formData.get('specialRequests'),
                service: this.getSelectedService(),
                date: bookingData.date,
                time: bookingData.time,
                duration: this.getSelectedServiceDuration(),
                price: this.getSelectedServicePrice()
            };

            console.log('Submitting booking data:', submissionData);

            // Submit booking
            const response = await fetch(this.bookingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();

            if (result.success) {
                // Booking successful
                this.handleBookingSuccess(result, bookingData);
            } else {
                // Booking failed
                this.handleBookingError(result.message || 'Booking failed');
            }

        } catch (error) {
            console.error('Booking submission error:', error);
            this.handleBookingError('Network error occurred. Please try again.');
        }
    }

    handleBookingSuccess(result, bookingData) {
        console.log('Booking successful:', result);
        
        this.hideLoading();
        this.showSuccess(result.message || 'Booking confirmed successfully!');

        // Dispatch booking success event to trigger time slot refresh
        document.dispatchEvent(new CustomEvent('bookingSuccess', {
            detail: {
                bookingReference: result.booking_reference,
                bookingId: result.booking_id,
                date: bookingData.date,
                time: bookingData.time,
                formattedTime: bookingData.formattedTime
            }
        }));

        // Update UI elements
        this.updateBookingConfirmation(result, bookingData);
    }

    handleBookingError(message) {
        console.error('Booking error:', message);
        
        this.hideLoading();
        this.showError(message);

        // If it's a time slot conflict, refresh the slots
        if (message.toLowerCase().includes('time slot') || 
            message.toLowerCase().includes('no longer available') ||
            message.toLowerCase().includes('conflict')) {
            
            console.log('Time slot conflict detected, refreshing slots...');
            
            if (this.dateManager) {
                this.dateManager.refreshCurrentDate();
            }
        }
    }

    updateBookingConfirmation(result, bookingData) {
        // Update success message elements
        const confirmationElements = {
            bookingReference: document.querySelector('#bookingReference, .booking-reference'),
            confirmedDate: document.querySelector('#confirmedDate, .confirmed-date'),
            confirmedTime: document.querySelector('#confirmedTime, .confirmed-time')
        };

        if (confirmationElements.bookingReference) {
            confirmationElements.bookingReference.textContent = result.booking_reference;
        }

        if (confirmationElements.confirmedDate) {
            confirmationElements.confirmedDate.textContent = bookingData.formattedDate;
        }

        if (confirmationElements.confirmedTime) {
            confirmationElements.confirmedTime.textContent = bookingData.formattedTime;
        }
    }

    setupRefreshHandlers() {
        // Handle successful refresh
        document.addEventListener('timeSlotsRefreshed', (event) => {
            console.log('Time slots refreshed:', event.detail);
            
            // Show notification that slots have been updated
            this.showInfo('Available times updated');
        });
    }

    // Utility methods to get service data from your existing system
    getSelectedService() {
        // Try multiple common selectors for service selection
        const serviceElement = document.querySelector(
            'input[name="service"]:checked, ' +
            'select[name="service"] option:checked, ' +
            '.selected-service .service-name, ' +
            '#selectedService, ' +
            '#summaryService'
        );

        return serviceElement ? serviceElement.textContent || serviceElement.value : 'Unknown Service';
    }

    getSelectedServiceDuration() {
        // Try to get duration from selected service
        const durationElement = document.querySelector(
            '.selected-service .service-duration, ' +
            '#selectedServiceDuration, ' +
            '.service-duration'
        );

        return durationElement ? durationElement.textContent : '1 Hour';
    }

    getSelectedServicePrice() {
        // Try to get price from selected service
        const priceElement = document.querySelector(
            '.selected-service .service-price, ' +
            '#selectedServicePrice, ' +
            '#summaryPrice'
        );

        return priceElement ? priceElement.textContent : 'Contact for pricing';
    }

    // UI feedback methods
    showLoading() {
        const loadingElement = document.getElementById('loadingIndicator');
        const submitButton = document.querySelector('button[type="submit"]');

        if (loadingElement) {
            loadingElement.style.display = 'block';
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('loadingIndicator');
        const submitButton = document.querySelector('button[type="submit"]');

        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirm Booking';
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'info') {
        // Try to find existing message containers
        let messageContainer = document.querySelector(`#${type}Message, .${type}-message, .message-container`);
        
        if (!messageContainer) {
            // Create a temporary message container
            messageContainer = document.createElement('div');
            messageContainer.className = `message-container ${type}-message`;
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                max-width: 400px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#2698cd' : '#3b82f6'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(messageContainer);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageContainer.parentNode) {
                    messageContainer.parentNode.removeChild(messageContainer);
                }
            }, 5000);
        }

        messageContainer.textContent = message;
        messageContainer.style.display = 'block';

        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Auto-initialize the booking integration
document.addEventListener('DOMContentLoaded', function() {
    // Wait for date availability manager to be ready
    setTimeout(() => {
        if (window.dateAvailabilityManager) {
            window.bookingIntegration = new BookingIntegration({
                dateManager: window.dateAvailabilityManager
            });
            console.log('Booking integration ready');
        }
    }, 100);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookingIntegration;
}