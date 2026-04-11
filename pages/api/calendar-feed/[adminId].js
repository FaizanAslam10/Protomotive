import { query } from '../../../utils/db';

export default async function handler(req, res) {
  const { adminId } = req.query;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all active bookings from database
    const result = await query(`
      SELECT
        id, booking_reference, customer_name, customer_email,
        service_name, service_price, vehicle_info, booking_date, booking_time, booking_datetime,
        special_requests, status, created_at
      FROM bookings
      WHERE status != 'cancelled'
      ORDER BY booking_date ASC, booking_time ASC
    `);

    const bookings = result.rows;

    // Generate ICS calendar content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Precision Auto Center//Live Booking Feed//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PAC Bookings (${adminId})
X-WR-CALDESC:Live feed of all customer bookings - updates automatically
X-WR-TIMEZONE:America/New_York
REFRESH-INTERVAL;VALUE=DURATION:PT15M
X-PUBLISHED-TTL:PT15M
`;

    // Add each booking as a calendar event
    bookings.forEach(booking => {
      const eventId = `pac-booking-${booking.id}`;
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      // Parse booking date and time
      let startDateTime, endDateTime;

      if (booking.booking_datetime) {
        startDateTime = new Date(booking.booking_datetime);
      } else {
        // Combine date and time
        const dateStr = booking.booking_date;
        const timeStr = booking.booking_time || '09:00';
        startDateTime = new Date(`${dateStr}T${timeStr}:00`);
      }

      // Default to 2-hour duration
      endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

      // Format dates for ICS (YYYYMMDDTHHMMSSZ)
      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const startICS = formatICSDate(startDateTime);
      const endICS = formatICSDate(endDateTime);

      // Create event summary and description
      const summary = `${booking.service_name} - ${booking.customer_name}`;
      const description = [
        `Service: ${booking.service_name}`,
        `Customer: ${booking.customer_name}`,
        booking.customer_email ? `Email: ${booking.customer_email}` : '',
        booking.vehicle_info ? `Vehicle: ${booking.vehicle_info}` : '',
        booking.service_price ? `Price: ${booking.service_price}` : '',
        booking.booking_reference ? `Ref: #${booking.booking_reference}` : '',
        booking.special_requests ? `Special Requests: ${booking.special_requests}` : '',
        `Status: ${booking.status || 'confirmed'}`,
        '',
        'This booking will automatically update if changed or cancelled.'
      ].filter(line => line).join('\\n');

      // Add event to calendar
      icsContent += `BEGIN:VEVENT
UID:${eventId}@precisionautocenter.ca
DTSTART:${startICS}
DTEND:${endICS}
DTSTAMP:${timestamp}
CREATED:${timestamp}
LAST-MODIFIED:${timestamp}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
TRANSP:OPAQUE
CATEGORIES:Booking
CLASS:PUBLIC
END:VEVENT
`;
    });

    // Close calendar
    icsContent += 'END:VCALENDAR';

    // Set appropriate headers for ICS file
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pac-bookings-${adminId}.ics"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send ICS content
    res.status(200).send(icsContent);

  } catch (error) {
    console.error('Error generating calendar feed:', error);

    // Return error as ICS with error message
    const errorICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Precision Auto Center//Error//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PAC Bookings - Error
BEGIN:VEVENT
UID:error@precisionautocenter.ca
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
DTEND:${new Date(Date.now() + 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
SUMMARY:Calendar Feed Error
DESCRIPTION:Unable to load bookings. Please check the feed URL or contact support.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.status(500).send(errorICS);
  }
}