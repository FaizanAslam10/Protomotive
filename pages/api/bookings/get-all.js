import { query } from '../../../utils/db';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Fetch all bookings from PostgreSQL, sorted by date and time
    const result = await query(`
      SELECT
        id,
        booking_reference,
        customer_name,
        customer_email,
        customer_phone,
        vehicle_info,
        special_requests,
        service_name,
        service_price,
        service_duration,
        booking_date,
        booking_time,
        booking_datetime,
        status,
        created_at
      FROM bookings
      ORDER BY booking_date ASC, booking_time ASC
    `);

    // Transform the data to ensure consistent format
    const transformedBookings = result.rows.map(booking => ({
      id: booking.id,
      booking_reference: booking.booking_reference,
      service: booking.service_name || 'Unknown Service',
      service_name: booking.service_name,
      service_price: booking.service_price,
      service_duration: booking.service_duration,
      date: booking.booking_date,
      time: booking.booking_time,
      booking_datetime: booking.booking_datetime,
      customer_name: booking.customer_name || 'Unknown Customer',
      customer_email: booking.customer_email || '',
      customer_phone: booking.customer_phone || '',
      vehicle_info: booking.vehicle_info || '',
      special_requests: booking.special_requests || '',
      created_at: booking.created_at || new Date().toISOString(),
      status: booking.status || 'confirmed'
    }));

    console.log('API Debug - Transformed bookings:', transformedBookings.slice(0, 2));

    // Return success response with bookings
    res.status(200).json({
      success: true,
      bookings: transformedBookings,
      total: transformedBookings.length
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}