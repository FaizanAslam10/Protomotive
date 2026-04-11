/**
 * Date Picker Availability System
 * Handles date selection and displays available time slots
 */

class DateAvailabilityManager {
    constructor(options = {}) {
        this.dateInput = options.dateInput || document.getElementById('bookingDate');
        this.timeSlotsContainer = options.timeSlotsContainer || document.getElementById('timeSlots');
        this.loadingIndicator = options.loadingIndicator || document.getElementById('loadingSlots');
        this.selectedTimeSlot = null;
        this.selectedDate = null;
        
        // API configuration
        this.apiEndpoint = '/api/check-availability';
        
        this.init();
    }

    init() {
        if (!this.dateInput || !this.timeSlotsContainer) {
            console.error('Required elements not found: dateInput or timeSlotsContainer');
            return;
        }

        // Listen for date input changes
        this.dateInput.addEventListener('change', (e) => {
            this.handleDateChange(e.target.value);
        });

        // Set minimum date to today
        this.setMinDate();
        
        console.log('DateAvailabilityManager initialized');
    }

    setMinDate() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        this.dateInput.min = todayString;
    }

    async handleDateChange(dateValue) {
        console.log('Date changed to:', dateValue);
        
        if (!dateValue) {
            this.clearTimeSlots();
            return;
        }

        this.selectedDate = dateValue;
        this.selectedTimeSlot = null;
        
        // Show loading state
        this.showLoading();
        
        try {
            // Fetch availability for the selected date
            const availability = await this.fetchAvailability(dateValue);
            
            // Render available time slots
            this.renderTimeSlots(availability);
            
        } catch (error) {
            console.error('Error loading availability:', error);
            this.showError('Failed to load available times. Please try again.');
        }
    }

    async fetchAvailability(date) {
        console.log(`Fetching availability for ${date}...`);
        
        const response = await fetch(`${this.apiEndpoint}?date=${date}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Availability data:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to check availability');
        }
        
        return data;
    }

    renderTimeSlots(availability) {
        console.log('Rendering time slots...');
        
        // Clear loading state
        this.hideLoading();
        
        // Clear existing slots
        this.timeSlotsContainer.innerHTML = '';
        
        const { availableSlots, bookedSlots, allTimeSlots } = availability;
        
        // Show only available slots (no booked slots as requested)
        if (!availableSlots || availableSlots.length === 0) {
            this.showNoSlotsMessage();
            return;
        }
        
        // Create time slot buttons
        availableSlots.forEach(time => {
            const button = this.createTimeSlotButton(time);
            this.timeSlotsContainer.appendChild(button);
        });
        
        console.log(`Rendered ${availableSlots.length} available time slots`);
    }

    createTimeSlotButton(time) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'time-slot-btn available';
        button.textContent = this.formatTime(time);
        button.dataset.time = time;
        
        // Add click event listener
        button.addEventListener('click', () => {
            this.selectTimeSlot(time, button);
        });
        
        return button;
    }

    selectTimeSlot(time, buttonElement) {
        console.log('Time slot selected:', time);
        
        // Remove selection from previous button
        const previousSelected = this.timeSlotsContainer.querySelector('.time-slot-btn.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add selection to current button
        buttonElement.classList.add('selected');
        
        // Store selected time
        this.selectedTimeSlot = time;
        
        // Trigger custom event for other components to listen to
        this.dispatchTimeSlotSelected(time);
    }

    dispatchTimeSlotSelected(time) {
        const event = new CustomEvent('timeSlotSelected', {
            detail: {
                time: time,
                formattedTime: this.formatTime(time),
                date: this.selectedDate
            }
        });
        
        document.dispatchEvent(event);
        console.log('TimeSlot selected event dispatched:', event.detail);
    }

    formatTime(time) {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
        
        this.timeSlotsContainer.innerHTML = '<div class="loading-message">Loading available times...</div>';
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    showError(message) {
        this.hideLoading();
        this.timeSlotsContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }

    showNoSlotsMessage() {
        this.timeSlotsContainer.innerHTML = '<div class="no-slots-message">No available times for this date</div>';
    }

    clearTimeSlots() {
        this.timeSlotsContainer.innerHTML = '<div class="placeholder-message">Please select a date to see available times</div>';
        this.selectedTimeSlot = null;
    }

    // Public methods for external access
    getSelectedTime() {
        return this.selectedTimeSlot;
    }

    getSelectedDate() {
        return this.selectedDate;
    }

    /**
     * Refresh available time slots for the currently selected date
     * Useful after a successful booking to update availability
     */
    async refreshCurrentDate() {
        if (!this.selectedDate) {
            console.log('No date selected, cannot refresh');
            return false;
        }

        console.log('Refreshing time slots for current date:', this.selectedDate);
        
        try {
            // Re-fetch availability for the current date
            await this.handleDateChange(this.selectedDate);
            return true;
        } catch (error) {
            console.error('Error refreshing time slots:', error);
            return false;
        }
    }

    /**
     * Clear the selected time slot (but keep the date)
     * Useful after a booking is made
     */
    clearSelectedTime() {
        this.selectedTimeSlot = null;
        
        // Remove selection from any selected button
        const selectedButton = this.timeSlotsContainer.querySelector('.time-slot-btn.selected');
        if (selectedButton) {
            selectedButton.classList.remove('selected');
        }
        
        console.log('Cleared selected time slot');
    }

    /**
     * Get booking data for the current selection
     */
    getBookingData() {
        if (!this.selectedDate || !this.selectedTimeSlot) {
            return null;
        }

        return {
            date: this.selectedDate,
            time: this.selectedTimeSlot,
            formattedTime: this.formatTime(this.selectedTimeSlot),
            formattedDate: new Date(this.selectedDate).toLocaleDateString()
        };
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the date availability manager
    window.dateAvailabilityManager = new DateAvailabilityManager();
    
    // Example of listening to time slot selection
    document.addEventListener('timeSlotSelected', function(event) {
        console.log('Time slot selected globally:', event.detail);
        
        // You can update other parts of your UI here
        // For example, update a booking summary section
        const summaryTime = document.getElementById('summaryTime');
        if (summaryTime) {
            summaryTime.textContent = event.detail.formattedTime;
        }
        
        const summaryDate = document.getElementById('summaryDate');
        if (summaryDate) {
            summaryDate.textContent = new Date(event.detail.date).toLocaleDateString();
        }
    });

    // Listen for booking success events to auto-refresh time slots
    document.addEventListener('bookingSuccess', function(event) {
        console.log('Booking successful, refreshing time slots...', event.detail);
        
        const manager = window.dateAvailabilityManager;
        if (manager) {
            // Clear the selected time slot
            manager.clearSelectedTime();
            
            // Refresh the available time slots for the current date
            manager.refreshCurrentDate().then(success => {
                if (success) {
                    console.log('Time slots refreshed successfully after booking');
                    
                    // Dispatch event for other components
                    document.dispatchEvent(new CustomEvent('timeSlotsRefreshed', {
                        detail: {
                            date: manager.getSelectedDate(),
                            reason: 'booking_success'
                        }
                    }));
                } else {
                    console.error('Failed to refresh time slots after booking');
                }
            });
        }
    });

    // Listen for booking cancellation/modification events
    document.addEventListener('bookingCancelled', function(event) {
        console.log('Booking cancelled, refreshing time slots...', event.detail);
        
        const manager = window.dateAvailabilityManager;
        if (manager) {
            manager.refreshCurrentDate();
        }
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateAvailabilityManager;
}