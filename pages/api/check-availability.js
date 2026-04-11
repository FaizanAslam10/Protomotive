// /api/check-availability.js - Database version with fallback
export default async function handler(req, res) {
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
    console.log('Check availability called');
    const { date } = req.query;
    console.log('Date requested:', date);
    
    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: 'Date parameter is required' 
      });
    }

    // Check if date is valid
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid date format' 
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot check availability for past dates' 
      });
    }

    console.log('Getting available time slots...');
    const timeSlotData = await getAvailableTimeSlots(date);
    console.log('Available slots:', timeSlotData.availableSlots);
    
    res.status(200).json({
      success: true,
      date,
      availableSlots: timeSlotData.availableSlots,
      bookedSlots: timeSlotData.bookedSlots,
      allTimeSlots: timeSlotData.allTimeSlots,
      totalSlots: timeSlotData.availableSlots.length,
      usingDatabase: true
    });

  } catch (error) {
    console.error('Availability check error:', error);
    
    // Check if it's a database connection error - provide fallback data
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your_neon_database')) {
      console.warn('DATABASE_URL not configured - using fallback mock data');
      
      // Return mock availability data for development
      const mockTimeSlots = [
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
      
      return res.status(200).json({
        success: true,
        date,
        availableSlots: mockTimeSlots,
        bookedSlots: [],
        allTimeSlots: mockTimeSlots,
        totalSlots: mockTimeSlots.length,
        usingDatabase: false,
        message: 'Using mock data - database not configured'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      debugInfo: 'Check database connection and table structure'
    });
  }
}

async function getAvailableTimeSlots(date) {
  // Parse date as YYYY-MM-DD in local timezone to avoid timezone shifts
  const [year, month, day] = date.split('-').map(Number);
  const requestedDate = new Date(year, month - 1, day); // month is 0-indexed
  const dayOfWeek = requestedDate.getDay();
  
  console.log('Date processing:', {
    inputDate: date,
    parsedDate: requestedDate.toDateString(),
    dayOfWeek: dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
  });

  // Check if it's a business day (Monday to Friday)
  const businessDays = [1, 2, 3, 4, 5]; // Monday to Friday (0 = Sunday)
  if (!businessDays.includes(dayOfWeek)) {
    console.log('Not a business day:', dayOfWeek);
    return {
      availableSlots: [],
      bookedSlots: [],
      allTimeSlots: []
    };
  }

  try {
    console.log('Attempting to import @neondatabase/serverless...');
    const { neon } = await import('@neondatabase/serverless');
    console.log('Successfully imported @neondatabase/serverless');
    
    console.log('Creating Neon SQL connection...');
    const sql = neon(process.env.DATABASE_URL);
    console.log('Neon SQL connection created');
    
    // Step 1: Get all active time slots from time_slots table
    console.log('Querying time_slots table for active slots...');
    const timeSlots = await sql`
      SELECT slot_time 
      FROM time_slots 
      WHERE is_active = true 
      ORDER BY slot_time
    `;
    
    console.log('Active time slots found:', timeSlots ? timeSlots.length : 0);
    
    // Convert time slots to HH:MM format (remove seconds)
    const allTimeSlots = (timeSlots || []).map(slot => {
      // slot_time comes as HH:MM:SS, we need HH:MM
      return slot.slot_time.substring(0, 5);
    });
    
    console.log('Formatted time slots:', allTimeSlots);
    
    if (allTimeSlots.length === 0) {
      console.log('No active time slots found in database');
      return {
        availableSlots: [],
        bookedSlots: [],
        allTimeSlots: []
      };
    }
    
    // Step 2: Get existing bookings for this date with service duration
    console.log('Querying bookings table for existing bookings...');
    const existingBookings = await sql`
      SELECT booking_time, service_duration, service_name, booking_date, status
      FROM bookings 
      WHERE booking_date = ${date} 
      AND (status = 'confirmed' OR status = 'pending')
    `;
    
    console.log('Existing bookings found:', existingBookings ? existingBookings.length : 0);
    console.log('Existing bookings details:', existingBookings);

    // Step 3: Calculate all blocked time slots based on service durations
    const blockedTimes = calculateBlockedTimeSlots(existingBookings || [], allTimeSlots);
    console.log('Blocked times (including duration):', blockedTimes);

    // Step 4: Filter out blocked times from available slots
    const availableSlots = allTimeSlots.filter(slot => 
      !blockedTimes.includes(slot)
    );

    console.log('Available slots after filtering:', availableSlots);
    
    return {
      availableSlots: availableSlots,
      bookedSlots: blockedTimes, // Return all blocked slots (including duration)
      allTimeSlots: allTimeSlots
    };

  } catch (error) {
    console.error('Database query failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Fallback to empty slots if database fails
    return {
      availableSlots: [],
      bookedSlots: [],
      allTimeSlots: [],
      error: 'Database connection failed'
    };
  }
}

function calculateBlockedTimeSlots(existingBookings, allTimeSlots) {
  const blockedTimes = new Set();

  existingBookings.forEach(booking => {
    let startTime = booking.booking_time;
    const duration = booking.service_duration || '30 Minutes'; // Default to 30 minutes

    console.log(`Processing booking: ${startTime}, duration: ${duration}`);

    // Handle different time formats - if it's a full datetime, extract just the time part
    if (typeof startTime === 'string' && startTime.includes(' ')) {
      // Format like "2025-09-10 09:00:00" - extract time part
      const timePart = startTime.split(' ')[1];
      startTime = timePart ? timePart.substring(0, 5) : startTime; // Get HH:MM
    } else if (typeof startTime === 'string' && startTime.includes(':')) {
      // Format like "09:00:00" - get HH:MM
      startTime = startTime.substring(0, 5);
    }

    console.log(`Processed start time: ${startTime}`);

    // Parse duration to get minutes
    const durationMinutes = parseDurationToMinutes(duration);
    console.log(`Duration in minutes: ${durationMinutes}`);

    // Find the start time index in our time slots
    const startIndex = allTimeSlots.indexOf(startTime);
    if (startIndex === -1) {
      console.log(`Start time ${startTime} not found in time slots. Available slots:`, allTimeSlots);
      return;
    }

    // Calculate how many 30-minute slots this service occupies
    const slotsNeeded = Math.ceil(durationMinutes / 30);
    console.log(`Slots needed: ${slotsNeeded}`);

    // Block all consecutive slots for this service
    for (let i = 0; i < slotsNeeded && (startIndex + i) < allTimeSlots.length; i++) {
      const slotToBlock = allTimeSlots[startIndex + i];
      blockedTimes.add(slotToBlock);
      console.log(`Blocking slot: ${slotToBlock}`);
    }
  });

  // Note: Reverse blocking is now handled by the service-specific availability endpoint
  // This endpoint now only shows basic availability (forward blocking only)
  // For service-specific availability with reverse blocking, use /api/check-availability-for-service

  return Array.from(blockedTimes);
}

function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== 'string') {
    return 30; // Default 30 minutes
  }
  
  const durationLower = duration.toLowerCase();
  
  // Extract number and unit
  const matches = durationLower.match(/(\d+(?:\.\d+)?)\s*(hour|hr|minute|min|h|m)/);
  if (!matches) {
    // Try to extract just numbers and assume minutes
    const numberMatch = durationLower.match(/(\d+)/);
    return numberMatch ? parseInt(numberMatch[1]) : 30;
  }
  
  const value = parseFloat(matches[1]);
  const unit = matches[2];
  
  if (unit.includes('hour') || unit.includes('hr') || unit === 'h') {
    return Math.round(value * 60);
  } else {
    return Math.round(value);
  }
}