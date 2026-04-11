// /api/check-availability-for-service.js - Get availability for a specific service duration with proper EDT timezone handling
export default async function handler(req, res) {
  console.log('🚀 SERVICE-SPECIFIC AVAILABILITY ENDPOINT HIT! 🚀');
  console.log('This is the /api/check-availability-for-service endpoint');
  console.log('Time:', new Date().toISOString());

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { date, duration, userTimezone } = req.query;

    console.log('=== Service-specific availability endpoint called ===');
    console.log('Raw query params:', req.query);
    console.log('Parsed params:', { date, duration, userTimezone });
    console.log('=== DEBUGGING REVERSE BLOCKING ===');
    console.log('Selected service duration for blocking:', duration);

    if (!date || !duration) {
      console.log('Missing required parameters');
      return res.status(400).json({
        success: false,
        message: 'Date and duration parameters are required',
        received: { date, duration }
      });
    }

    console.log('Check availability for service:', { date, duration, userTimezone });

    // Check if date is valid
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Check if date is in the past (in EDT timezone)
    const today = new Date();
    const edtToday = getDateInEDT(today);
    edtToday.setHours(0, 0, 0, 0);
    
    const edtRequestedDate = getDateInEDT(requestedDate);
    edtRequestedDate.setHours(0, 0, 0, 0);
    
    if (edtRequestedDate < edtToday) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check availability for past dates'
      });
    }

    const timeSlotData = await getAvailableTimeSlotsForService(date, duration, userTimezone);

    res.status(200).json({
      success: true,
      date,
      serviceDuration: duration,
      availableSlots: timeSlotData.availableSlots,
      blockedSlots: timeSlotData.blockedSlots,
      allTimeSlots: timeSlotData.allTimeSlots,
      totalSlots: timeSlotData.availableSlots.length,
      businessHours: timeSlotData.businessHours,
      timezoneInfo: timeSlotData.timezoneInfo,
      usingDatabase: true
    });

  } catch (error) {
    console.error('Service availability check error:', error);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack
    });
  }
}

// Business configuration
const BUSINESS_CONFIG = {
  timezone: 'America/Toronto', // Automatically handles EDT/EST
  openingTime: '10:00',
  closingTime: '18:00', // 6:00 PM - All services must complete before this time
  slotDuration: 30 // minutes
};

// Helper function to check if a date is in EDT or EST
function isEDT(date) {
  const year = date.getFullYear();
  
  // EDT starts on second Sunday of March at 2 AM
  const marchSecondSunday = getNthSundayOfMonth(year, 2, 2); // March = 2, 2nd Sunday
  
  // EDT ends on first Sunday of November at 2 AM
  const novemberFirstSunday = getNthSundayOfMonth(year, 10, 1); // November = 10, 1st Sunday
  
  return date >= marchSecondSunday && date < novemberFirstSunday;
}

// Helper function to get Nth Sunday of a month
function getNthSundayOfMonth(year, month, n) {
  const firstDay = new Date(year, month, 1);
  const firstSunday = new Date(year, month, 1 + (7 - firstDay.getDay()) % 7);
  if (n === 1) return firstSunday;
  return new Date(year, month, firstSunday.getDate() + (n - 1) * 7);
}

// Convert a date to EDT/EST
function getDateInEDT(date) {
  // This is a simplified conversion - in production, use a proper library
  const utcDate = new Date(date.toISOString());
  const offset = isEDT(date) ? -4 : -5; // EDT is UTC-4, EST is UTC-5
  return new Date(utcDate.getTime() + offset * 60 * 60 * 1000);
}

// Generate time slots only within business hours
function generateBusinessHourSlots(openingTime, closingTime, interval) {
  const slots = [];
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  
  const startMinutes = openHour * 60 + openMin;
  const endMinutes = closeHour * 60 + closeMin;
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    slots.push(timeStr);
  }
  
  return slots;
}

async function getAvailableTimeSlotsForService(date, serviceDuration, userTimezone = null) {
  // Parse date as YYYY-MM-DD in EDT/EST timezone
  const [year, month, day] = date.split('-').map(Number);
  const requestedDate = new Date(year, month - 1, day);
  const dayOfWeek = requestedDate.getDay();

  const isCurrentlyEDT = isEDT(requestedDate);
  const timezoneOffset = isCurrentlyEDT ? '-04:00' : '-05:00';
  const timezoneAbbr = isCurrentlyEDT ? 'EDT' : 'EST';

  console.log('Date processing:', {
    inputDate: date,
    serviceDuration: serviceDuration,
    parsedDate: requestedDate.toDateString(),
    dayOfWeek: dayOfWeek,
    isCurrentlyEDT: isCurrentlyEDT,
    timezoneOffset: timezoneOffset,
    businessTimezone: BUSINESS_CONFIG.timezone,
    userTimezone: userTimezone
  });

  // Check if it's a business day (Monday to Saturday - adjusted for your business)
  const businessDays = [1, 2, 3, 4, 5]; // Monday = 1, 
  if (!businessDays.includes(dayOfWeek)) {
    console.log('Not a business day (Weekend). Day of week:', dayOfWeek);
    return {
      availableSlots: [],
      blockedSlots: [],
      allTimeSlots: [],
      businessHours: {
        opening: BUSINESS_CONFIG.openingTime,
        closing: BUSINESS_CONFIG.closingTime,
        timezone: timezoneAbbr,
        timezoneOffset: timezoneOffset
      },
      timezoneInfo: {
        business: {
          timezone: BUSINESS_CONFIG.timezone,
          abbreviation: timezoneAbbr,
          offset: timezoneOffset,
          isCurrentlyEDT: isCurrentlyEDT
        },
        user: {
          timezone: userTimezone || 'Not specified'
        }
      }
    };
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    // Generate all possible time slots based on business hours
    const allTimeSlots = generateBusinessHourSlots(
      BUSINESS_CONFIG.openingTime,
      BUSINESS_CONFIG.closingTime,
      BUSINESS_CONFIG.slotDuration
    );

    console.log(`Generated ${allTimeSlots.length} time slots for business hours ${BUSINESS_CONFIG.openingTime} - ${BUSINESS_CONFIG.closingTime}`);
    console.log('Time slots:', allTimeSlots);

    if (allTimeSlots.length === 0) {
      console.log('No time slots generated - check business hours configuration');
      return {
        availableSlots: [],
        blockedSlots: [],
        allTimeSlots: [],
        businessHours: {
          opening: BUSINESS_CONFIG.openingTime,
          closing: BUSINESS_CONFIG.closingTime,
          timezone: timezoneAbbr,
          timezoneOffset: timezoneOffset
        },
        timezoneInfo: {
          business: {
            timezone: BUSINESS_CONFIG.timezone,
            abbreviation: timezoneAbbr,
            offset: timezoneOffset,
            isCurrentlyEDT: isCurrentlyEDT
          },
          user: {
            timezone: userTimezone || 'Not specified'
          }
        }
      };
    }

    // Get existing bookings for this date (all times stored in EDT/EST)
    const existingBookings = await sql`
      SELECT booking_time, service_duration, service_name, customer_name
      FROM bookings
      WHERE booking_date = ${date}
      AND (status = 'confirmed' OR status = 'pending')
      ORDER BY booking_time
    `;

    console.log(`Found ${existingBookings.length} existing bookings for ${date}:`, existingBookings);

    // Parse and display existing bookings for debugging
    if (existingBookings.length > 0) {
      console.log('=== Existing Bookings Details ===');
      existingBookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`, {
          time: booking.booking_time,
          duration: booking.service_duration,
          service: booking.service_name,
          customer: booking.customer_name
        });
      });
    }

    console.log('Calculating blocked slots for service duration:', serviceDuration);

    // Calculate blocked slots with service-specific logic
    const blockedTimes = calculateBlockedTimeSlotsForService(
      existingBookings || [], 
      allTimeSlots, 
      serviceDuration
    );

    console.log(`Total blocked slots: ${blockedTimes.length}`);
    console.log('Blocked times:', blockedTimes);

    const availableSlots = allTimeSlots.filter(slot => !blockedTimes.includes(slot));
    console.log(`Available slots: ${availableSlots.length}`, availableSlots);

    // Check if it's today and filter out past time slots
    const now = new Date();
    const isToday = requestedDate.toDateString() === now.toDateString();

    let filteredAvailableSlots = availableSlots;
    if (isToday) {
      const currentTimeInEDT = getDateInEDT(now);
      const currentHour = currentTimeInEDT.getHours();
      const currentMinute = currentTimeInEDT.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinute;

      // Parse closing time to check if business hours are over
      const [closeHour, closeMin] = BUSINESS_CONFIG.closingTime.split(':').map(Number);
      const closingTimeMinutes = closeHour * 60 + closeMin;

      console.log(`Filtering past slots. Current time in ${timezoneAbbr}: ${currentHour}:${String(currentMinute).padStart(2, '0')}`);
      console.log(`Closing time: ${BUSINESS_CONFIG.closingTime} (${closingTimeMinutes} minutes)`);

      // If current time is past closing time, return no available slots for today
      if (currentTimeMinutes >= closingTimeMinutes) {
        console.log('Business hours are over for today. Returning no available slots.');
        filteredAvailableSlots = [];
      } else {
        // Add 30 minute buffer for booking preparation
        const bufferMinutes = 30;

        filteredAvailableSlots = availableSlots.filter(slot => {
          const [slotHour, slotMin] = slot.split(':').map(Number);
          const slotMinutes = slotHour * 60 + slotMin;
          const isAvailable = slotMinutes >= (currentTimeMinutes + bufferMinutes);

          if (!isAvailable) {
            console.log(`Filtered out past/too-soon slot: ${slot}`);
          }

          return isAvailable;
        });

        console.log(`Filtered to ${filteredAvailableSlots.length} future slots (with 30min buffer)`);
      }
    }

    return {
      availableSlots: filteredAvailableSlots,
      blockedSlots: blockedTimes,
      allTimeSlots: allTimeSlots,
      businessHours: {
        opening: BUSINESS_CONFIG.openingTime,
        closing: BUSINESS_CONFIG.closingTime,
        timezone: timezoneAbbr,
        timezoneOffset: timezoneOffset
      },
      timezoneInfo: {
        business: {
          timezone: BUSINESS_CONFIG.timezone,
          abbreviation: timezoneAbbr,
          offset: timezoneOffset,
          isCurrentlyEDT: isCurrentlyEDT
        },
        user: {
          timezone: userTimezone || 'Not specified'
        }
      }
    };

  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

function calculateBlockedTimeSlotsForService(existingBookings, allTimeSlots, selectedServiceDuration) {
  const blockedTimes = new Set();

  // Parse the selected service duration
  const selectedDurationMinutes = parseDurationToMinutes(selectedServiceDuration);
  const selectedSlotsNeeded = Math.ceil(selectedDurationMinutes / 30);

  console.log('=== Blocking Calculation ===');
  console.log('Selected service:', {
    duration: selectedServiceDuration,
    minutes: selectedDurationMinutes,
    slotsNeeded: selectedSlotsNeeded
  });
  console.log('All time slots:', allTimeSlots);
  console.log('Number of existing bookings:', existingBookings.length);

  // STEP 1: Block slots occupied by existing bookings (forward blocking)
  console.log('\n--- STEP 1: Forward Blocking (slots occupied by existing bookings) ---');
  existingBookings.forEach((booking, bookingIndex) => {
    let startTime = booking.booking_time;
    const duration = booking.service_duration || '30 Minutes';

    // Normalize time format (handle various database time formats)
    if (typeof startTime === 'string') {
      if (startTime.includes(' ')) {
        // Format: "2024-01-15 14:00:00" -> extract time part
        const timePart = startTime.split(' ')[1];
        startTime = timePart ? timePart.substring(0, 5) : startTime;
      } else if (startTime.length > 5 && startTime.includes(':')) {
        // Format: "14:00:00" -> "14:00"
        startTime = startTime.substring(0, 5);
      }
    }

    const durationMinutes = parseDurationToMinutes(duration);
    const startIndex = allTimeSlots.indexOf(startTime);
    
    if (startIndex === -1) {
      console.log(`Warning: Booking ${bookingIndex + 1} has invalid start time: ${startTime}`);
      return;
    }

    const slotsNeeded = Math.ceil(durationMinutes / 30);
    
    console.log(`\nBooking ${bookingIndex + 1}: ${booking.service_name || 'Service'}`);
    console.log(`  Start: ${startTime} (index ${startIndex})`);
    console.log(`  Duration: ${duration} (${durationMinutes} minutes, ${slotsNeeded} slots)`);
    console.log(`  Blocking slots:`);

    // Block all slots this booking occupies
    for (let i = 0; i < slotsNeeded && (startIndex + i) < allTimeSlots.length; i++) {
      const slotToBlock = allTimeSlots[startIndex + i];
      blockedTimes.add(slotToBlock);
      console.log(`    - ${slotToBlock} (slot ${startIndex + i})`);
    }
  });

  // STEP 2: Reverse blocking - block slots where the selected service would overlap with existing bookings
  console.log('\n--- STEP 2: Reverse Blocking (prevent new service from overlapping) ---');
  console.log(`New service duration: ${selectedServiceDuration} (${selectedDurationMinutes} min, ${selectedSlotsNeeded} slots)`);
  
  existingBookings.forEach((existingBooking, bookingIndex) => {
    let existingStartTime = existingBooking.booking_time;

    // Normalize time format
    if (typeof existingStartTime === 'string') {
      if (existingStartTime.includes(' ')) {
        const timePart = existingStartTime.split(' ')[1];
        existingStartTime = timePart ? timePart.substring(0, 5) : existingStartTime;
      } else if (existingStartTime.length > 5 && existingStartTime.includes(':')) {
        existingStartTime = existingStartTime.substring(0, 5);
      }
    }

    const existingStartIndex = allTimeSlots.indexOf(existingStartTime);
    if (existingStartIndex === -1) return;

    const existingDurationMinutes = parseDurationToMinutes(existingBooking.service_duration || '30 Minutes');
    const existingSlotsNeeded = Math.ceil(existingDurationMinutes / 30);
    const existingEndIndex = existingStartIndex + existingSlotsNeeded;

    console.log(`\nChecking against Booking ${bookingIndex + 1}:`);
    console.log(`  Existing: ${existingStartTime} - ${allTimeSlots[Math.min(existingEndIndex, allTimeSlots.length - 1)] || 'end'}`);
    console.log(`  Occupies slots ${existingStartIndex} to ${existingEndIndex - 1}`);

    // Check each potential starting slot
    let blockedByThisBooking = [];
    allTimeSlots.forEach((potentialSlot, potentialStartIndex) => {
      // Skip if this slot is already blocked
      if (blockedTimes.has(potentialSlot)) {
        return;
      }

      // Calculate where the selected service would end if started at this slot
      const potentialEndIndex = potentialStartIndex + selectedSlotsNeeded;

      // Check for overlap: (start1 < end2) && (start2 < end1)
      const wouldOverlap = (potentialStartIndex < existingEndIndex) && (existingStartIndex < potentialEndIndex);

      if (wouldOverlap) {
        blockedTimes.add(potentialSlot);
        blockedByThisBooking.push(potentialSlot);
        console.log(`    *** OVERLAP DETECTED: ${potentialSlot} would conflict (${potentialStartIndex}-${potentialEndIndex} overlaps ${existingStartIndex}-${existingEndIndex})`);
      }
    });

    if (blockedByThisBooking.length > 0) {
      console.log(`  Blocks these additional start times: ${blockedByThisBooking.join(', ')}`);
    }
  });

  // STEP 3: Block slots that would extend beyond business hours
  console.log('\n--- STEP 3: Business Hours Boundary Check ---');
  const lastValidStartIndex = allTimeSlots.length - selectedSlotsNeeded;
  if (lastValidStartIndex < allTimeSlots.length - 1) {
    console.log(`Service needs ${selectedSlotsNeeded} slots, blocking late starts:`);
    for (let i = lastValidStartIndex + 1; i < allTimeSlots.length; i++) {
      const slotToBlock = allTimeSlots[i];
      if (!blockedTimes.has(slotToBlock)) {
        blockedTimes.add(slotToBlock);
        console.log(`  - ${slotToBlock} (would extend past closing time)`);
      }
    }
  }

  const finalBlockedArray = Array.from(blockedTimes).sort();
  console.log('\n=== Final Summary ===');
  console.log(`Total slots blocked: ${finalBlockedArray.length} out of ${allTimeSlots.length}`);
  console.log('Final blocked times:', finalBlockedArray);

  const availableSlots = allTimeSlots.filter(slot => !finalBlockedArray.includes(slot));
  console.log(`Available slots: ${availableSlots.length}`);
  console.log('Available times:', availableSlots);

  console.log('=== REVERSE BLOCKING VERIFICATION ===');
  console.log(`For ${selectedServiceDuration} service, reverse blocking should prevent overlaps`);

  return finalBlockedArray;
}

function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== 'string') {
    console.log('Invalid duration, defaulting to 30 minutes');
    return 30;
  }

  const durationLower = duration.toLowerCase();
  
  // Handle range formats (e.g., "2-4 Hours") - use the maximum for safety
  if (durationLower.includes('-')) {
    const parts = durationLower.split('-');
    if (parts.length === 2) {
      // Try to parse the second part (maximum duration)
      const maxPart = parts[1].trim();
      const maxMatch = maxPart.match(/(\d+(?:\.\d+)?)/);
      if (maxMatch) {
        const maxValue = parseFloat(maxMatch[1]);
        // Check if it's hours or minutes
        if (maxPart.includes('hour') || maxPart.includes('hr') || maxPart.includes('h')) {
          console.log(`Parsed range duration "${duration}" as ${maxValue} hours (${maxValue * 60} minutes) - using maximum`);
          return Math.round(maxValue * 60);
        } else {
          console.log(`Parsed range duration "${duration}" as ${maxValue} minutes - using maximum`);
          return Math.round(maxValue);
        }
      }
    }
  }

  // Handle single duration formats
  const matches = durationLower.match(/(\d+(?:\.\d+)?)\s*(hour|hr|minute|min|h|m)/);
  if (!matches) {
    // Try to extract just numbers and assume minutes if less than 10, hours otherwise
    const numberMatch = durationLower.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      const value = parseFloat(numberMatch[1]);
      if (value <= 10) {
        console.log(`Parsed duration "${duration}" as ${value} hours (${value * 60} minutes)`);
        return Math.round(value * 60);
      } else {
        console.log(`Parsed duration "${duration}" as ${value} minutes`);
        return Math.round(value);
      }
    }
    console.log(`Could not parse duration "${duration}", defaulting to 30 minutes`);
    return 30;
  }

  const value = parseFloat(matches[1]);
  const unit = matches[2];

  if (unit.includes('hour') || unit.includes('hr') || unit === 'h') {
    console.log(`Parsed duration "${duration}" as ${value} hours (${value * 60} minutes)`);
    return Math.round(value * 60);
  } else {
    console.log(`Parsed duration "${duration}" as ${value} minutes`);
    return Math.round(value);
  }
}