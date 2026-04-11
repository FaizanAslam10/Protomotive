// /api/validate-timeslot.js - Check if a specific timeslot + service duration is available
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
    const { date, time, duration } = req.query;

    if (!date || !time || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Date, time, and duration parameters are required'
      });
    }

    console.log('Validating timeslot:', { date, time, duration });

    // Validate the specific timeslot selection
    const validation = await validateSpecificTimeslot(date, time, duration);

    res.status(200).json({
      success: validation.isAvailable,
      message: validation.message,
      conflictDetails: validation.conflictDetails || null
    });

  } catch (error) {
    console.error('Timeslot validation error:', error);

    return res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
}

async function validateSpecificTimeslot(date, requestedTime, requestedDuration) {
  try {
    console.log('Importing @neondatabase/serverless...');
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    // Get all active time slots
    const timeSlots = await sql`
      SELECT slot_time
      FROM time_slots
      WHERE is_active = true
      ORDER BY slot_time
    `;

    const allTimeSlots = (timeSlots || []).map(slot => slot.slot_time.substring(0, 5));

    // Get existing bookings for this date
    const existingBookings = await sql`
      SELECT booking_time, service_duration, service_name, customer_name
      FROM bookings
      WHERE booking_date = ${date}
      AND (status = 'confirmed' OR status = 'pending')
    `;

    console.log('Found existing bookings:', existingBookings);

    // Check if the requested time slot is valid
    if (!allTimeSlots.includes(requestedTime)) {
      return {
        isAvailable: false,
        message: 'Invalid time slot selected',
        conflictDetails: null
      };
    }

    // Calculate the duration and slots needed for the requested booking
    const requestedDurationMinutes = parseDurationToMinutes(requestedDuration);
    const requestedSlotsNeeded = Math.ceil(requestedDurationMinutes / 30);
    const requestedStartIndex = allTimeSlots.indexOf(requestedTime);

    console.log('Requested booking details:', {
      time: requestedTime,
      duration: requestedDuration,
      durationMinutes: requestedDurationMinutes,
      slotsNeeded: requestedSlotsNeeded,
      startIndex: requestedStartIndex
    });

    // Check for conflicts with existing bookings
    for (const existingBooking of existingBookings) {
      let existingStartTime = existingBooking.booking_time;

      // Normalize existing booking time format
      if (typeof existingStartTime === 'string' && existingStartTime.includes(' ')) {
        const timePart = existingStartTime.split(' ')[1];
        existingStartTime = timePart ? timePart.substring(0, 5) : existingStartTime;
      } else if (typeof existingStartTime === 'string' && existingStartTime.includes(':')) {
        existingStartTime = existingStartTime.substring(0, 5);
      }

      const existingStartIndex = allTimeSlots.indexOf(existingStartTime);
      if (existingStartIndex === -1) continue;

      const existingDurationMinutes = parseDurationToMinutes(existingBooking.service_duration || '30 Minutes');
      const existingSlotsNeeded = Math.ceil(existingDurationMinutes / 30);

      // Calculate end times (exclusive)
      const requestedEndIndex = requestedStartIndex + requestedSlotsNeeded;
      const existingEndIndex = existingStartIndex + existingSlotsNeeded;

      // Check for overlap: (start1 < end2) && (start2 < end1)
      const hasOverlap = (requestedStartIndex < existingEndIndex) && (existingStartIndex < requestedEndIndex);

      if (hasOverlap) {
        console.log('Conflict detected:', {
          requested: { start: requestedStartIndex, end: requestedEndIndex, time: requestedTime },
          existing: { start: existingStartIndex, end: existingEndIndex, time: existingStartTime },
          existingBooking: existingBooking
        });

        // Determine if the conflict is because the requested service would start before and overlap
        let conflictReason = 'This time slot conflicts with an existing booking';
        if (requestedStartIndex < existingStartIndex && requestedEndIndex > existingStartIndex) {
          conflictReason = `Your ${requestedDuration} service would overlap with an existing booking at ${existingStartTime}`;
        } else if (existingStartIndex < requestedStartIndex && existingEndIndex > requestedStartIndex) {
          conflictReason = `This time slot is already occupied by an existing ${existingBooking.service_duration || '30 minute'} service`;
        }

        return {
          isAvailable: false,
          message: conflictReason,
          conflictDetails: {
            conflictingBooking: {
              time: existingStartTime,
              duration: existingBooking.service_duration,
              service: existingBooking.service_name,
              customer: existingBooking.customer_name
            }
          }
        };
      }
    }

    // Check if the requested duration extends beyond available time slots
    if (requestedStartIndex + requestedSlotsNeeded > allTimeSlots.length) {
      return {
        isAvailable: false,
        message: 'Service duration extends beyond available business hours',
        conflictDetails: null
      };
    }

    return {
      isAvailable: true,
      message: 'Time slot is available for the selected service duration'
    };

  } catch (error) {
    console.error('Database validation failed:', error);
    throw error;
  }
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