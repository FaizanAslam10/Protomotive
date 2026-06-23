# Protomotive — Auto Detailing & Customization Booking Platform

A full-stack booking platform built for **Protomotive**, an automotive detailing and customization business in Pakistan. Customers can browse services, check live availability, and book appointments online — while the business manages everything through a dedicated admin dashboard.

🔗 **Live demo:** [protomotive-sepia.vercel.app](https://protomotive-sepia.vercel.app)

## Overview

Protomotive offers premium car styling and protection services — ceramic coating, paint protection film (PPF), window tinting, vehicle wraps, and detailing. This platform replaces manual phone/WhatsApp booking with a self-serve online system, complete with real-time scheduling and automated email confirmations.

## Key Features

- **Multi-service booking system** — customers select a service, vehicle details, and an available date/time slot, with live availability validation against existing bookings
- **Admin dashboard** — business owner can view, manage, and track all bookings (`/admin-bookings`), and create/edit/delete service offerings (`/admin-services`)
- **Calendar sync (.ics feed)** — bookings can be subscribed to directly from Google Calendar/Outlook via a personalized live calendar feed endpoint, so the owner always has an up-to-date schedule on their phone
- **Automated email confirmations** — booking confirmations sent automatically via Resend, using a custom HTML email template
- **Wrap configurator** — interactive tool for customers to visualize vehicle wrap options before booking
- **Contact form** — direct inquiry form with email delivery, for customers who want a custom quote
- **Booking-request model** — no online payment; customers book a slot and pay in person, matching how the business actually operates

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Database:** PostgreSQL via [Neon](https://neon.tech) (serverless Postgres)
- **Email:** [Resend](https://resend.com) for transactional emails
- **Hosting:** Vercel
- **Styling:** Custom CSS

## Project Structure

```
pages/
  index.js                 → Homepage
  services.js               → Service listing
  booking.js                 → Booking flow
  wrap-configurator.js       → Wrap visualizer tool
  admin-bookings.js          → Admin: manage bookings
  admin-services.js          → Admin: manage services
  api/
    book-appointment.js       → Create booking + send confirmation email
    check-availability.js     → Real-time slot availability
    validate-timeslot.js      → Slot validation logic
    calendar-feed/[adminId].js→ Personalized .ics calendar feed
    services/                 → CRUD endpoints for service management
    send-contact-message.js   → Contact form handler
components/                  → Page-level and shared React components
email-templates/             → HTML email templates (booking confirmation)
utils/db.js                   → Database connection helper
scripts/                      → Maintenance/fix scripts for bookings & services
```

## Running Locally

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/FaizanAslam10/Protomotive.git
   cd Protomotive
   npm install
   ```
2. Create a `.env.local` file with the required environment variables:
   ```
   DATABASE_URL=your_neon_postgres_connection_string
   RESEND_API_KEY=your_resend_api_key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## My Role

Built end-to-end as a freelance project for the Protomotive client — including the booking and availability system, admin dashboard, database schema, email integration, and the wrap configurator feature.

## License

MIT
