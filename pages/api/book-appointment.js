// /api/book-appointment.js - Database version with Resend email integration
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('Booking request received');
    const {
      name,
      email,
      phone,
      vehicle,
      requests,
      service,
      date,
      time,
      duration,
      price,
      userTimezone,
      userTimezoneAbbr,
      bookingTimezone,
      localTime
    } = req.body;

    console.log('Booking data:', { name, email, service, date, time });

    // Validate required fields
    if (!name || !email || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, service, date, and time are required'
      });
    }

    // Generate booking reference
    const bookingReference = `PAC-${Date.now().toString().slice(-6)}`;
    console.log('Generated booking reference:', bookingReference);

    // Try to save to database - FAIL if database doesn't work
    const databaseResult = await saveBookingToDatabase({
      bookingReference,
      name,
      email,
      phone,
      vehicle,
      requests,
      service,
      date,
      time,
      duration,
      price,
      userTimezone,
      userTimezoneAbbr,
      bookingTimezone,
      localTime
    });

    // If database fails, fail the booking to prevent double bookings
    if (!databaseResult.success) {
      return res.status(500).json({
        success: false,
        message: databaseResult.conflict ? 
          'This time slot is no longer available. Please select another time.' :
          'Database connection failed. Please try again or contact support.',
        booking_reference: bookingReference,
        database_error: databaseResult.error,
        debug_info: 'Database must be working to prevent double bookings'
      });
    }

    // Step 2: Create booking in Cal.com
    let calBookingResult = null;
    if (process.env.CAL_API_KEY) {
      try {
        calBookingResult = await createCalBooking({
          name,
          email,
          phone,
          vehicle,
          requests,
          service,
          date,
          time,
          duration,
          price,
          bookingReference
        });
        
        console.log('Cal.com booking result:', calBookingResult);
      } catch (calError) {
        console.error('Cal.com booking failed:', calError);
        // Don't fail the entire booking if Cal.com fails
        // Log the error and continue
      }
    } else {
      console.log('CAL_API_KEY not configured - skipping Cal.com integration');
    }

    // Step 3: Send confirmation emails (independent)
    let emailResult = { success: false };
    if (process.env.RESEND_API_KEY) {
      try {
        emailResult = await sendBookingConfirmationEmails({
          bookingReference,
          name,
          email,
          phone,
          vehicle,
          requests,
          service,
          date,
          time,
          duration,
          price
        });
        
        console.log('Email notification result:', emailResult);
      } catch (emailError) {
        console.error('Email notifications failed:', emailError);
        // Don't fail the entire booking if email fails
        // Log the error and continue
      }
    } else {
      console.log('RESEND_API_KEY not configured - skipping email notifications');
    }

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking_reference: bookingReference,
      booking_id: databaseResult.booking_id,
      saved_to_database: true,
      cal_booking_id: calBookingResult?.id || null,
      cal_booking_status: calBookingResult?.status || 'not_created',
      email_sent: emailResult.success,
      customer_email_sent: emailResult.customerEmail?.success || false,
      owner_email_sent: emailResult.ownerEmail?.success || false
    });

  } catch (error) {
    console.error('Booking handler error:', error);
    
    return res.status(200).json({
      success: false,
      message: 'An error occurred while processing your booking. Please try again.',
      error: error.message
    });
  }
}

// Cal.com integration function
async function createCalBooking(bookingData) {
  const CAL_API_KEY = process.env.CAL_API_KEY;
  const CAL_BASE_URL = process.env.CAL_BASE_URL || 'https://api.cal.com/v1';
  
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  // Map your service names to Cal.com event type IDs
  const serviceToEventTypeMap = {
    'PRECISION PACKAGE': process.env.CAL_EVENT_TYPE_PRECISION || 1,
    'GOLD PACKAGE': process.env.CAL_EVENT_TYPE_GOLD || 2,
    'BRONZE PACKAGE': process.env.CAL_EVENT_TYPE_BRONZE || 3,
    'ODOR REMOVAL': process.env.CAL_EVENT_TYPE_ODOR || 4,
    'WASH ME': process.env.CAL_EVENT_TYPE_WASH || 5,
    'LEATHER TREATMENT': process.env.CAL_EVENT_TYPE_LEATHER || 6,
    'FULL VEHICLE WRAPS': process.env.CAL_EVENT_TYPE_FULL_WRAP || 7,
    'HOOD & ROOF WRAPS': process.env.CAL_EVENT_TYPE_HOOD_ROOF || 8,
    'PARTIAL WRAPS': process.env.CAL_EVENT_TYPE_PARTIAL_WRAP || 9,
    'WINDOW MOULDINGS (CHROME DELETES)': process.env.CAL_EVENT_TYPE_CHROME_DELETE || 10,
    'CERAMIC PRO GOLD PACKAGE': process.env.CAL_EVENT_TYPE_CERAMIC_GOLD || 11,
    'CERAMIC PRO SILVER PACKAGE': process.env.CAL_EVENT_TYPE_CERAMIC_SILVER || 12,
    'CERAMIC PRO BRONZE PACKAGE': process.env.CAL_EVENT_TYPE_CERAMIC_BRONZE || 13,
    'CERAMIC PRO SPORT PACKAGE': process.env.CAL_EVENT_TYPE_CERAMIC_SPORT || 14,
    'CERAMIC PRO INTERIOR PROTECTION': process.env.CAL_EVENT_TYPE_CERAMIC_INTERIOR || 15,
    'PAINT FILM AND VINYL PROTECTION': process.env.CAL_EVENT_TYPE_PAINT_FILM || 16,
    'FULL VEHICLE PROTECTION KIT': process.env.CAL_EVENT_TYPE_PPF_FULL || 17,
    'PARTIAL FRONT PROTECTION KIT': process.env.CAL_EVENT_TYPE_PPF_PARTIAL || 18,
    'FULL FRONT PROTECTION KIT': process.env.CAL_EVENT_TYPE_PPF_FRONT || 19,
    'FRONT 2 WINDOWS': process.env.CAL_EVENT_TYPE_TINT_FRONT || 20,
    'FULL VEHICLE': process.env.CAL_EVENT_TYPE_TINT_FULL || 21,
    'WINDSHIELD': process.env.CAL_EVENT_TYPE_TINT_WINDSHIELD || 22,
    'WINDSHIELD BROW TINT': process.env.CAL_EVENT_TYPE_TINT_BROW || 23,
    'AIRCRAFTS': process.env.CAL_EVENT_TYPE_AIRCRAFT || 24
  };

  const eventTypeId = serviceToEventTypeMap[bookingData.service];
  if (!eventTypeId) {
    throw new Error(`No Cal.com event type ID configured for service: ${bookingData.service}`);
  }

  // Create start and end datetime
  const startDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
  const endDateTime = new Date(startDateTime);
  
  // Calculate end time based on duration
  const durationMinutes = parseDurationToMinutes(bookingData.duration);
  endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);

  // Prepare Cal.com booking payload
  const calPayload = {
    eventTypeId: parseInt(eventTypeId),
    start: startDateTime.toISOString(),
    end: endDateTime.toISOString(),
    responses: {
      name: bookingData.name,
      email: bookingData.email,
      notes: `Vehicle: ${bookingData.vehicle || 'Not specified'}
Special Requests: ${bookingData.requests || 'None'}
Phone: ${bookingData.phone || 'Not provided'}
Booking Reference: ${bookingData.bookingReference}`
    },
    timeZone: process.env.CAL_TIMEZONE || 'America/New_York', // Eastern Time (EDT/EST)
    language: 'en',
    title: `${bookingData.service} - ${bookingData.name}`,
    description: `Service: ${bookingData.service}
Phone: ${bookingData.phone || 'Not provided'}
Vehicle: ${bookingData.vehicle || 'Not specified'}
Special Requests: ${bookingData.requests || 'None'}
Price: ${bookingData.price || 'TBD'}
Booking Reference: ${bookingData.bookingReference}`,
    status: 'ACCEPTED',
    metadata: {
      bookingReference: bookingData.bookingReference,
      vehicle: bookingData.vehicle,
      specialRequests: bookingData.requests,
      price: bookingData.price,
      source: 'website'
    }
  };

  console.log('Sending to Cal.com:', {
    url: `${CAL_BASE_URL}/bookings`,
    eventTypeId: calPayload.eventTypeId,
    start: calPayload.start,
    end: calPayload.end,
    customerName: bookingData.name
  });

  // Make API call to Cal.com
  const response = await fetch(`${CAL_BASE_URL}/bookings?apiKey=${CAL_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(calPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cal.com API error response:', errorText);
    throw new Error(`Cal.com API error: ${response.status} - ${errorText}`);
  }

  const calBooking = await response.json();
  console.log('Cal.com booking created successfully:', calBooking);
  
  return calBooking;
}

// Email service using Resend (independent)
async function sendBookingConfirmationEmails(bookingData) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured - skipping email notifications');
    return { success: false, reason: 'resend_not_configured' };
  }

  try {
    // Prepare email data
    const emailData = prepareEmailData(bookingData);
    
    // Send email to customer
    const customerEmailResult = await sendCustomerConfirmation(emailData);
    
    // Send email to owner/business
    const ownerEmailResult = await sendOwnerNotification(emailData);

    return {
      success: true,
      customerEmail: customerEmailResult,
      ownerEmail: ownerEmailResult
    };

  } catch (error) {
    console.error('Email notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Prepare email template data
function prepareEmailData(bookingData) {
  const appointmentDate = new Date(`${bookingData.date}T${bookingData.time}:00`);

  return {
    customerName: bookingData.name,
    customerEmail: bookingData.email,
    customerPhone: bookingData.phone || 'Not provided',
    serviceName: bookingData.service,
    servicePrice: bookingData.price || 'Contact for pricing',
    serviceDuration: bookingData.duration || '1 hour',
    appointmentDate: appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    appointmentTime: appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    // Enhanced timezone information
    appointmentTimeEDT: `${appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} EDT`,
    userTimezone: bookingData.userTimezone,
    userTimezoneAbbr: bookingData.userTimezoneAbbr,
    localTime: bookingData.localTime,
    hasTimezoneInfo: !!(bookingData.userTimezone && bookingData.userTimezone !== 'America/Toronto'),
    // Add raw date and time for calendar link generation
    rawDate: bookingData.date,
    rawTime: bookingData.time,
    vehicleInfo: bookingData.vehicle || 'Not specified',
    specialRequests: bookingData.requests || '',
    bookingReference: bookingData.bookingReference,
    currentYear: new Date().getFullYear()
  };
}

// Send confirmation email to customer
async function sendCustomerConfirmation(emailData) {
  const customerHtml = generateCustomerEmailHtml(emailData);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Precision Auto Center <onboarding@resend.dev>',
      to: [emailData.customerEmail],
      subject: `Booking Confirmed - ${emailData.serviceName} | Precision Auto Center`,
      html: customerHtml,
      reply_to: process.env.BUSINESS_EMAIL || 'pacwebsite10@gmail.com'
    });

    if (error) {
      console.error('Customer email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Customer email sent successfully:', data.id);
    return { success: true, id: data.id };

  } catch (error) {
    console.error('Failed to send customer email:', error);
    return { success: false, error: error.message };
  }
}

// Send notification email to owner
async function sendOwnerNotification(emailData) {
  const ownerHtml = generateOwnerEmailHtml(emailData);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Precision Auto Center <onboarding@resend.dev>',
      to: [process.env.BUSINESS_EMAIL || 'pacwebsite10@gmail.com'],
      subject: `New Booking: ${emailData.serviceName} - ${emailData.appointmentDate}`,
      html: ownerHtml,
      reply_to: emailData.customerEmail
    });

    if (error) {
      console.error('Owner email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Owner email sent successfully:', data.id);
    return { success: true, id: data.id };

  } catch (error) {
    console.error('Failed to send owner email:', error);
    return { success: false, error: error.message };
  }
}
// Add this function before generateCustomerEmailHtml function

// Generate Google Calendar link with booking details
function generateGoogleCalendarLink(data) {
  // Use raw date and time for accurate parsing
  const startDate = new Date(`${data.rawDate}T${data.rawTime}:00`);
  
  // Calculate end time based on duration
  const durationMinutes = parseDurationToMinutes(data.serviceDuration);
  const endDate = new Date(startDate.getTime() + (durationMinutes * 60000));
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startTime = formatDate(startDate);
  const endTime = formatDate(endDate);
  
  // Create event details
  const title = encodeURIComponent(`${data.serviceName} - Precision Auto Center`);
  const details = encodeURIComponent(`Service: ${data.serviceName}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Vehicle: ${data.vehicleInfo}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ''}
Booking Reference: ${data.bookingReference}

Precision Auto Center
Phone: (905) 670-3484
Address: 123 Auto Center Dr, Precision City, ON`);
  
  const location = encodeURIComponent('Precision Auto Center, 123 Auto Center Dr, Precision City, ON');
  
  // Generate Google Calendar URL
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}&ctz=America/New_York`;
}


function generateCustomerEmailHtml(data) {
  // Create Google Calendar link
  const calendarLink = generateGoogleCalendarLink(data);
  
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Receipt - Precision Auto Center</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: 'Courier New', monospace;
              background-color: #f5f5f5;
              color: #000;
          }
          
          .receipt-container {
              max-width: 500px;
              margin: 20px auto;
              background: #ffffff;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border: 2px solid #000;
          }
          
          .receipt-header {
              background: #000;
              color: #fff;
              padding: 20px;
              text-align: center;
              border-bottom: 2px dashed #dc2626;
          }
          
          .logo {
              font-family: 'Oxanium', Helvetica, Arial, sans-serif;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 5px;
          }
          
          .tagline {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #dc2626;
          }
          
          .receipt-number {
              background: #dc2626;
              color: #fff;
              padding: 10px;
              text-align: center;
              font-size: 12px;
              letter-spacing: 1px;
          }
          
          .receipt-body {
              padding: 20px;
          }
          
          .section-divider {
              text-align: center;
              margin: 15px 0;
              font-size: 12px;
              color: #666;
          }
          
          .section-divider::before,
          .section-divider::after {
              content: '================';
              display: block;
              color: #dc2626;
              letter-spacing: -2px;
          }
          
          .receipt-section {
              margin: 20px 0;
          }
          
          .receipt-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin: 15px 0;
              padding: 8px;
              background: #000;
              color: #fff;
          }
          
          .detail-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 5px 0;
              font-size: 12px;
              border-bottom: 1px dotted #ccc;
          }
          
          .detail-line:last-child {
              border-bottom: none;
          }
          
          .label {
              text-transform: uppercase;
              font-weight: bold;
              color: #333;
              font-size: 11px;
              text-align: left;
          }
          
          .value {
              text-align: right;
              font-weight: normal;
              max-width: 60%;
              word-wrap: break-word;
          }
          
          .highlight {
              background: #dc2626;
              color: #fff;
              padding: 2px 6px;
              font-weight: bold;
          }
          
          
          .confirmation-stamp {
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              border: 3px solid #22c55e;
              transform: rotate(-2deg);
              font-weight: bold;
              text-transform: uppercase;
              color: #22c55e;
              font-size: 18px;
              letter-spacing: 3px;
          }
          
          .important-notice {
              background: #000;
              color: #fff;
              padding: 15px;
              margin: 20px 0;
              font-size: 11px;
          }
          
          .important-notice h4 {
              color: #dc2626;
              margin-bottom: 10px;
              text-transform: uppercase;
              font-size: 12px;
          }
          
          .important-notice ul {
              list-style: none;
              margin-left: 0;
          }
          
          .important-notice li {
              margin: 5px 0;
              padding-left: 15px;
              position: relative;
          }
          
          .important-notice li:before {
              content: '▸';
              position: absolute;
              left: 0;
              color: #dc2626;
          }
          
          .contact-strip {
              background: #dc2626;
              color: #fff;
              padding: 15px;
              text-align: center;
              font-size: 12px;
          }
          
          .contact-strip div {
              margin: 5px 0;
          }
          
          .contact-strip strong {
              color: #fff;
              font-size: 14px;
          }
          
          .footer {
              background: #000;
              color: #666;
              padding: 15px;
              text-align: center;
              font-size: 10px;
              line-height: 1.4;
          }
          
          .footer-divider {
              color: #dc2626;
              margin: 10px 0;
          }
          
          @media print {
              body {
                  background: #fff;
              }
              .receipt-container {
                  box-shadow: none;
                  border: 1px solid #000;
              }
          }
          
          @media (max-width: 500px) {
              .receipt-container {
                  margin: 0;
                  border-radius: 0;
                  border-left: none;
                  border-right: none;
              }
          }
      </style>
  </head>
  <body>
      <div class="receipt-container">
          <!-- Header -->
          <div class="receipt-header">
              <div class="logo">PRECISION AUTO CENTER</div>
          </div>
          
          <div class="receipt-number">
              BOOKING #${data.bookingReference}
          </div>
          
          <!-- Receipt Body -->
          <div class="receipt-body">
              <div class="receipt-title">Service Receipt</div>
              
              <!-- Customer Information -->
              <div class="receipt-section">
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Customer
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.customerName}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Phone
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.customerPhone}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Email
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.customerEmail}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Vehicle
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.vehicleInfo}
                    </td>
                  </tr>
                </table>
              </div>

              <div class="section-divider"></div>

              <!-- Service Details -->
              <div class="receipt-section">
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Service
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      <span style="background:#dc2626; color:#fff; padding:2px 6px; font-weight:bold;">${data.serviceName}</span>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Date
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.appointmentDate}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Time
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.appointmentTimeEDT}${data.hasTimezoneInfo ? `<br><small style="color:#666; font-size:10px;">Your Local Time: ${data.localTime} ${data.userTimezoneAbbr}</small>` : ''}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Duration
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.serviceDuration}
                    </td>
                  </tr>
                </table>

                ${data.specialRequests ? `
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Notes
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.specialRequests}
                    </td>
                  </tr>
                </table>
                ` : ''}
              </div>
              
              <!-- Estimated Total Section -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:15px; border-top: 2px solid #dc2626; padding-top: 10px;">
                <tr>
                  <td align="left" style="font-size:13px; font-weight:bold; text-transform:uppercase; color:#dc2626; padding:8px 0; letter-spacing: 1px;">
                    Estimated Total
                  </td>
                  <td align="right" style="font-size:16px; font-weight:bold; color:#dc2626; padding:8px 0;">
                    ${data.servicePrice}
                  </td>
                </tr>
              </table>
              
              <!-- Confirmation Stamp -->
              <div class="confirmation-stamp">
                  ✓ CONFIRMED
              </div>
              
              <!-- Important Notice -->
              <div class="important-notice">
                  <h4>Important Reminders</h4>
                  <ul>
                      <li>Arrive 10-15 minutes early</li>
                      <li>Payment due upon completion</li>
                      ${data.hasTimezoneInfo ? `<li><strong>All appointments are scheduled in Eastern Time (EDT/EST).</strong> Please ensure you arrive at the correct time.</li>` : ''}
                  </ul>
              </div>
          </div>
          
          <!-- Contact Strip -->
          <div class="contact-strip">
              <div><strong><a href="tel:+19056703484" style="color: inherit; text-decoration: underline;">(905) 670-3484</a></strong></div>
              <div><a href="https://maps.google.com/?q=1175+Meyerside+Dr+%239,+Mississauga,+ON+L5T+1H3" target="_blank" style="color: inherit; text-decoration: underline;">1175 Meyerside Dr #9, Mississauga, ON L5T 1H3</a></div>
              <div>Mon-Fri: 10AM-6PM</div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
              <div class="footer-divider">════════════════════</div>
              <div>Thank you for choosing Precision Auto Center</div>
              <div>This is your official booking confirmation</div>
              <div class="footer-divider">════════════════════</div>
              <div>© ${data.currentYear || new Date().getFullYear()} Precision Auto Center</div>
          </div>
      </div>
  </body>
  </html>`;
}

// Generate owner notification email HTML with Google Calendar link
function generateOwnerEmailHtml(data) {
  // Create Google Calendar link for the owner as well
  const calendarLink = generateGoogleCalendarLink(data);
  
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Notification - Precision Auto Center</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
  
          body {
              font-family: 'Courier New', monospace;
              background-color: #f5f5f5;
              color: #000;
          }
  
          .receipt-container {
              max-width: 500px;
              margin: 20px auto;
              background: #ffffff;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border: 2px solid #000;
          }
  
          .receipt-header {
              background: #000;
              color: #fff;
              padding: 20px;
              text-align: center;
              border-bottom: 2px dashed #dc2626;
          }
  
          .logo {
              font-family: 'Oxanium', Helvetica, Arial, sans-serif;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 5px;
          }
  
          .tagline {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #dc2626;
          }
  
          .receipt-number {
              background: #dc2626;
              color: #fff;
              padding: 10px;
              text-align: center;
              font-size: 12px;
              letter-spacing: 1px;
          }
  
          .receipt-body {
              padding: 20px;
          }
  
          .section-divider {
              text-align: center;
              margin: 15px 0;
              font-size: 12px;
              color: #666;
          }
  
          .section-divider::before,
          .section-divider::after {
              content: '================';
              display: block;
              color: #dc2626;
              letter-spacing: -2px;
          }
  
          .receipt-section {
              margin: 20px 0;
          }
  
          .receipt-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin: 15px 0;
              padding: 8px;
              background: #000;
              color: #fff;
          }
  
          .detail-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 5px 0;
              font-size: 12px;
              border-bottom: 1px dotted #ccc;
          }
  
          .detail-line:last-child {
              border-bottom: none;
          }
  
          .label {
              text-transform: uppercase;
              font-weight: bold;
              color: #333;
              font-size: 11px;
              text-align: left;
          }
  
          .value {
              text-align: right;
              font-weight: normal;
              max-width: 60%;
              word-wrap: break-word;
          }
  
          .highlight {
              background: #dc2626;
              color: #fff;
              padding: 2px 6px;
              font-weight: bold;
          }
  
  
          .alert-stamp {
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              border: 3px solid #22c55e;
              transform: rotate(-2deg);
              font-weight: bold;
              text-transform: uppercase;
              color: #15803d;
              font-size: 18px;
              letter-spacing: 3px;
              background: #f0fdf4;
          }
  
          .important-notice {
              background: #000;
              color: #fff;
              padding: 15px;
              margin: 20px 0;
              font-size: 11px;
          }
  
          .important-notice h4 {
              color: #dc2626;
              margin-bottom: 10px;
              text-transform: uppercase;
              font-size: 12px;
          }
  
          .important-notice ul {
              list-style: none;
              margin-left: 0;
          }
  
          .important-notice li {
              margin: 5px 0;
              padding-left: 15px;
              position: relative;
          }
  
          .important-notice li:before {
              content: '▸';
              position: absolute;
              left: 0;
              color: #dc2626;
          }
  
          .contact-strip {
              background: #dc2626;
              color: #fff;
              padding: 15px;
              text-align: center;
              font-size: 12px;
          }
  
          .contact-strip div {
              margin: 5px 0;
          }
  
          .contact-strip strong {
              color: #fff;
              font-size: 14px;
          }
  
          .footer {
              background: #000;
              color: #666;
              padding: 15px;
              text-align: center;
              font-size: 10px;
              line-height: 1.4;
          }
  
          .footer-divider {
              color: #dc2626;
              margin: 10px 0;
          }
  
          @media print {
              body {
                  background: #fff;
              }
              .receipt-container {
                  box-shadow: none;
                  border: 1px solid #000;
              }
          }
  
          @media (max-width: 500px) {
              .receipt-container {
                  margin: 0;
                  border-radius: 0;
                  border-left: none;
                  border-right: none;
              }
          }
      </style>
  </head>
  <body>
      <div class="receipt-container">
          <!-- Header -->
          <div class="receipt-header">
              <div class="logo">PRECISION AUTO CENTER</div>
              <div class="tagline">NEW BOOKING NOTIFICATION</div>
          </div>
  
          <div class="receipt-number">
              BOOKING #${data.bookingReference}
          </div>
  
          <!-- Receipt Body -->
          <div class="receipt-body">
              <div class="receipt-title">Booking Alert</div>
  
              <!-- Alert Stamp -->
              <div class="alert-stamp">
                  NEW BOOKING
              </div>
  
              <!-- Quick Summary -->
              <div class="receipt-section">
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Service
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      <span style="background:#dc2626; color:#fff; padding:2px 6px; font-weight:bold;">${data.serviceName}</span>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Date & Time
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.appointmentDate} at ${data.appointmentTimeEDT}${data.hasTimezoneInfo ? `<br><small style="color:#666; font-size:10px;">Customer's Local Time: ${data.localTime} ${data.userTimezoneAbbr}</small>` : ''}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Customer
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.customerName}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Phone
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      <a href="tel:${data.customerPhone}" style="color: inherit; text-decoration: underline;">${data.customerPhone}</a>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Email
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      <a href="mailto:${data.customerEmail}" style="color: inherit; text-decoration: underline;">${data.customerEmail}</a>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="section-divider"></div>

              <!-- Service Details -->
              <div class="receipt-section">
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Vehicle
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.vehicleInfo}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Duration
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.serviceDuration}
                    </td>
                  </tr>
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Estimated Price
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.servicePrice}
                    </td>
                  </tr>
                </table>

                ${data.specialRequests ? `
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                  <tr>
                    <td align="left" style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#333; padding:3px 0;">
                      Special Notes
                    </td>
                    <td align="right" style="font-size:12px; color:#000; padding:3px 0;">
                      ${data.specialRequests}
                    </td>
                  </tr>
                </table>
                ` : ''}
              </div>
  
              <!-- Important Notice -->
              <div class="important-notice">
                  <h4>Quick Actions</h4>
                  <ul>
                      <li><a href="tel:${data.customerPhone}" style="color: white; text-decoration: none;">Call customer: ${data.customerPhone}</a></li>
                      <li><a href="mailto:${data.customerEmail}" style="color: white; text-decoration: none;">Email customer: ${data.customerEmail}</a></li>
                      <li><a href="${calendarLink}" target="_blank" style="color: white; text-decoration: none;">Add to calendar: ${data.appointmentDate} ${data.appointmentTime}</a></li>
                      <li style="color: white;">Prepare materials for ${data.serviceName}</li>
                  </ul>
              </div>
          </div>
  
          <!-- Contact Strip -->
          <div class="contact-strip">
              <div><strong><a href="tel:+19056703484" style="color: inherit; text-decoration: underline;">(905) 670-3484</a></strong></div>
              <div><a href="https://maps.google.com/?q=1175+Meyerside+Dr+%239,+Mississauga,+ON+L5T+1H3" target="_blank" style="color: inherit; text-decoration: underline;">1175 Meyerside Dr #9, Mississauga, ON L5T 1H3</a></div>
              <div>Mon-Fri: 10AM-6PM</div>
          </div>
  
          <!-- Footer -->
          <div class="footer">
              <div class="footer-divider">════════════════════</div>
              <div>Precision Auto Center - Owner Notification</div>
              <div>Booking made through website system</div>
              <div class="footer-divider">════════════════════</div>
              <div>© ${data.currentYear || new Date().getFullYear()} Precision Auto Center</div>
          </div>
      </div>
  </body>
  </html>`;
}

async function saveBookingToDatabase(bookingData) {
  try {
    console.log('Attempting to save booking to database...');
    const { neon } = await import('@neondatabase/serverless');
    console.log('Successfully imported @neondatabase/serverless');
    
    console.log('Creating Neon SQL connection...');
    const sql = neon(process.env.DATABASE_URL);
    console.log('Neon SQL connection created');

    const appointmentDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
    
    // Check if time slot is still available (considering service durations)
    console.log('Checking for booking conflicts...');
    const conflictCheck = await checkBookingConflicts(sql, bookingData.date, bookingData.time, bookingData.duration);
    
    if (conflictCheck.hasConflict) {
      console.log('Time slot conflict detected:', conflictCheck.reason);
      return {
        success: false,
        error: conflictCheck.reason || 'Time slot no longer available',
        conflict: true
      };
    }

    console.log('Inserting booking into database...');
    // Insert booking into database
    const result = await sql`
      INSERT INTO bookings (
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
      ) VALUES (
        ${bookingData.bookingReference},
        ${bookingData.name},
        ${bookingData.email},
        ${bookingData.phone || ''},
        ${bookingData.vehicle || ''},
        ${bookingData.requests || ''},
        ${bookingData.service},
        ${bookingData.price},
        ${bookingData.duration},
        ${bookingData.date},
        ${bookingData.time},
        ${appointmentDateTime.toISOString()},
        'confirmed',
        NOW()
      )
      RETURNING id
    `;

    console.log('Booking saved successfully, ID:', result[0] ? result[0].id : 'unknown');

    return {
      success: true,
      booking_id: result[0] ? result[0].id : null
    };

  } catch (error) {
    console.error('Database save failed:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkBookingConflicts(sql, date, requestedTime, requestedDuration) {
  try {
    // Get all existing bookings for this date
    const existingBookings = await sql`
      SELECT booking_time, service_duration, service_name
      FROM bookings 
      WHERE booking_date = ${date} 
      AND status != 'cancelled'
    `;

    console.log('Existing bookings for conflict check:', existingBookings);

    if (!existingBookings || existingBookings.length === 0) {
      return { hasConflict: false };
    }

    // Define all possible time slots (same as in check-availability)
    const allTimeSlots = [
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    // Calculate which slots would be blocked by the new booking
    const newBookingSlots = calculateRequiredSlots(requestedTime, requestedDuration, allTimeSlots);
    console.log('New booking would require slots:', newBookingSlots);

    // Calculate which slots are blocked by existing bookings
    const blockedSlots = calculateBlockedTimeSlots(existingBookings, allTimeSlots);
    console.log('Currently blocked slots:', blockedSlots);

    // Check for overlap
    const hasOverlap = newBookingSlots.some(slot => blockedSlots.includes(slot));
    
    if (hasOverlap) {
      return {
        hasConflict: true,
        reason: 'This time slot conflicts with an existing booking'
      };
    }

    return { hasConflict: false };

  } catch (error) {
    console.error('Error checking booking conflicts:', error);
    return {
      hasConflict: true,
      reason: 'Unable to verify availability'
    };
  }
}

function calculateRequiredSlots(startTime, duration, allTimeSlots) {
  const requiredSlots = [];
  const startIndex = allTimeSlots.indexOf(startTime);
  
  if (startIndex === -1) {
    console.log(`Start time ${startTime} not found in time slots`);
    return [];
  }

  const durationMinutes = parseDurationToMinutes(duration);
  const slotsNeeded = Math.ceil(durationMinutes / 30);
  
  for (let i = 0; i < slotsNeeded && (startIndex + i) < allTimeSlots.length; i++) {
    requiredSlots.push(allTimeSlots[startIndex + i]);
  }
  
  return requiredSlots;
}

function calculateBlockedTimeSlots(existingBookings, allTimeSlots) {
  const blockedTimes = new Set();
  
  existingBookings.forEach(booking => {
    const startTime = booking.booking_time;
    const duration = booking.service_duration || '30 Minutes';
    
    const durationMinutes = parseDurationToMinutes(duration);
    const startIndex = allTimeSlots.indexOf(startTime);
    
    if (startIndex === -1) return;
    
    const slotsNeeded = Math.ceil(durationMinutes / 30);
    
    for (let i = 0; i < slotsNeeded && (startIndex + i) < allTimeSlots.length; i++) {
      blockedTimes.add(allTimeSlots[startIndex + i]);
    }
  });
  
  return Array.from(blockedTimes);
}

function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== 'string') {
    return 30;
  }
  
  const durationLower = duration.toLowerCase();
  const matches = durationLower.match(/(\d+(?:\.\d+)?)\s*(hour|hr|minute|min|h|m)/);
  
  if (!matches) {
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