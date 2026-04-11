// /api/send-contact-message.js - Handle contact form submissions
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
    console.log('Contact form submission received');
    const { name, email, phone, message } = req.body;

    console.log('Contact data:', { name, email, phone });

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Send email notification to business
    const emailResult = await sendContactNotification({
      name,
      email,
      phone,
      message
    });

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
    } else {
      throw new Error(emailResult.error || 'Failed to send email');
    }

  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again or contact us directly.',
      error: error.message
    });
  }
}

async function sendContactNotification(contactData) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured - cannot send contact notification');
    return { success: false, reason: 'resend_not_configured' };
  }

  try {
    const html = generateContactEmailHtml(contactData);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Protomotive <onboarding@resend.dev>',
      to: ['pacwebsite10@gmail.com'],
      subject: `New Contact Message from ${contactData.name} | Protomotive`,
      html: html,
      reply_to: contactData.email
    });

    if (error) {
      console.error('Contact email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Contact notification sent successfully:', data.id);
    return { success: true, emailId: data.id };

  } catch (error) {
    console.error('Contact notification error:', error);
    return { success: false, error: error.message };
  }
}

function generateContactEmailHtml(data) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message - Protomotive</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      border: 2px solid #2698cd;
    }

    .header {
      background: #000;
      color: #fff;
      padding: 25px;
      text-align: center;
      border-bottom: 2px dashed #2698cd;
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
      color: #2698cd;
    }

    .notification-banner {
      background: #2698cd;
      color: #fff;
      padding: 15px;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 1px;
    }

        .email-body {
            padding: 30px;
        }

        .contact-details {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
            min-width: 80px;
        }

        .detail-value {
            color: #000;
            font-size: 14px;
            text-align: right;
            flex: 1;
            margin-left: 15px;
        }

        .message-section {
            margin: 25px 0;
        }

        .message-label {
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

    .message-content {
      background: #fff;
      border: 2px solid #2698cd;
      border-radius: 8px;
      padding: 20px;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
    }

        .quick-actions {
            background: #000;
            color: #fff;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }

    .quick-actions h4 {
      color: #2698cd;
      margin-bottom: 15px;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
    }

        .quick-actions ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .quick-actions li {
            margin: 8px 0;
            padding-left: 15px;
            position: relative;
        }

    .quick-actions li:before {
      content: '▸';
      position: absolute;
      left: 0;
      color: #2698cd;
    }

        .quick-actions a {
            color: white;
            text-decoration: none;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }

        .timestamp {
            font-size: 11px;
            color: #888;
            text-align: center;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">PROTOMOTIVE</div>
            <div class="tagline">AUTOMOTIVE EXCELLENCE</div>
        </div>

        <!-- Notification Banner -->
        <div class="notification-banner">
            NEW CONTACT MESSAGE RECEIVED
        </div>

        <!-- Email Body -->
        <div class="email-body">
            <h2 style="color: #dc2626; margin-bottom: 25px;">Contact Form Submission</h2>

            <!-- Contact Details -->
            <div class="contact-details">
                <div class="detail-row">
                    <div class="detail-label">Name</div>
                    <div class="detail-value">${data.name}</div>
                </div>

                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">
                        <a href="mailto:${data.email}" style="color: #dc2626; text-decoration: none;">${data.email}</a>
                    </div>
                </div>

                ${data.phone ? `
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">
                        <a href="tel:${data.phone}" style="color: #dc2626; text-decoration: none;">${data.phone}</a>
                    </div>
                </div>
                ` : ''}

                <div class="detail-row">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${currentDate}</div>
                </div>

                <div class="detail-row">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${currentTime} EDT</div>
                </div>
            </div>

            <!-- Message Section -->
            <div class="message-section">
                <div class="message-label">Message</div>
                <div class="message-content">${data.message}</div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <h4>Quick Actions</h4>
                <ul>
                    <li><a href="mailto:${data.email}">Reply to ${data.name}</a></li>
                    ${data.phone ? `<li><a href="tel:${data.phone}">Call ${data.phone}</a></li>` : ''}
                    <li><a href="mailto:${data.email}?subject=Re: Your message to Protomotive&body=Hi ${data.name},%0A%0AThank you for contacting Protomotive.%0A%0A">Send quick reply</a></li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This message was sent through the contact form on your website.</p>
            <p><strong>Protomotive</strong> | Professional Automotive Services</p>
            <div class="timestamp">
                Message received on ${currentDate} at ${currentTime} EDT
            </div>
        </div>
    </div>
</body>
</html>`;
}