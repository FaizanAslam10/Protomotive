import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calendar feed states
  const [feedUrl, setFeedUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    fetchBookings();
    generateFeedUrl();
    checkSubscriptionStatus();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/get-all');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate the calendar feed URL
  const generateFeedUrl = () => {
    const baseUrl = window.location.origin;
    const adminId = localStorage.getItem('adminId') || 'owner';
    const feedUrl = `${baseUrl}/api/calendar-feed/${adminId}.ics`;
    setFeedUrl(feedUrl);
  };

  // Check if owner has already subscribed
  const checkSubscriptionStatus = () => {
    const subscribed = localStorage.getItem('calendarSubscribed');
    setIsSubscribed(subscribed === 'true');
  };

  // Copy feed URL to clipboard
  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopyStatus('Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  // Mark as subscribed
  const markAsSubscribed = () => {
    localStorage.setItem('calendarSubscribed', 'true');
    setIsSubscribed(true);
  };

  // Reset subscription status
  const resetSubscription = () => {
    localStorage.setItem('calendarSubscribed', 'false');
    setIsSubscribed(false);
  };

  // Format booking date for display
  const formatBookingDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format booking time for display  
  const formatBookingTime = (timeStr) => {
    if (!timeStr) return 'No time specified';
    return timeStr;
  };

  // Calendar feed subscription component
  const renderCalendarFeed = () => {
    return (
      <div className="calendar-feed-section">
        <div className="feed-header">
          <h3>📡 Calendar Feed</h3>
        </div>

        <div className="feed-url-container">
          <label className="feed-label">Copy Calendar Feed URL:</label>
          <div className="url-input-group">
            <input
              type="text"
              value={feedUrl}
              readOnly
              className="feed-url-input"
              onClick={(e) => e.target.select()}
            />
            <button onClick={copyFeedUrl} className="copy-btn">
              {copyStatus || '📋 Copy'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render list view (keeping original booking display)
  const renderListView = () => {
    if (loading) {
      return (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <h3>Error Loading Bookings</h3>
          <p>{error}</p>
          <button onClick={fetchBookings} className="retry-btn-small">
            Try Again
          </button>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div className="no-bookings">
          <h3>No bookings found</h3>
          <p>There are currently no bookings in the system.</p>
        </div>
      );
    }

    return (
      <div className="bookings-list">
        {bookings.map((booking, index) => (
          <div key={booking.id || index} className="booking-list-item">
            <div className="booking-header">
              <div className="booking-date-time">
                <span className="booking-date">{formatBookingDate(booking.date)}</span>
                <span className="booking-time">{formatBookingTime(booking.time)}</span>
              </div>
              <div className="booking-header-right">
                {booking.booking_reference && (
                  <div className="booking-ref">#{booking.booking_reference}</div>
                )}
                {isSubscribed && (
                  <div className="feed-indicator" title="Available in your calendar feed">📡</div>
                )}
              </div>
            </div>

            <div className="booking-details">
              <div className="booking-customer-info">
                <h4>{booking.customer_name || 'Unknown Customer'}</h4>
                <div className="contact-info">
                  {booking.customer_email && <span className="email">{booking.customer_email}</span>}
                  {booking.customer_phone && <span className="phone">{booking.customer_phone}</span>}
                </div>
              </div>

              <div className="booking-service-info">
                <div className="service-name">{booking.service || booking.service_name || 'Unknown Service'}</div>
                {booking.service_price && <div className="service-price">{booking.service_price}</div>}
                {booking.service_duration && <div className="service-duration">Duration: {booking.service_duration}</div>}
              </div>
            </div>

            {(booking.vehicle_info || booking.special_requests) && (
              <div className="booking-additional">
                {booking.vehicle_info && <div className="vehicle-info"><strong>Vehicle:</strong> {booking.vehicle_info}</div>}
                {booking.special_requests && <div className="special-requests"><strong>Special Requests:</strong> {booking.special_requests}</div>}
              </div>
            )}

            <div className="booking-status">
              <span className={`status-badge ${booking.status || 'confirmed'}`}>
                {(booking.status || 'confirmed').toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Admin Bookings">
      <style jsx>{`
        .admin-bookings-page {
          padding: 80px 0 40px;
          min-height: 100vh;
          background: #111;
          color: white;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .admin-title {
          font-size: 32px;
          font-weight: bold;
          color: #2698cd;
          margin-bottom: 10px;
        }

        .admin-subtitle {
          font-size: 16px;
          color: #888;
        }

        .bookings-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          gap: 20px;
        }

        .bookings-summary {
          background: #333;
          padding: 15px 20px;
          border-radius: 8px;
          text-align: center;
          min-width: 120px;
        }

        .summary-text {
          font-size: 14px;
          color: #ccc;
          margin-bottom: 5px;
        }

        .summary-number {
          font-size: 24px;
          font-weight: bold;
          color: #2698cd;
        }

        /* Calendar Feed Styles */
        .calendar-feed-section {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 25px;
          border: 1px solid #333;
          flex: 1;
        }

        .feed-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .feed-header h3 {
          color: #2698cd;
          font-size: 20px;
          margin: 0 0 8px 0;
        }

        .subtitle {
          color: #4ade80;
          font-size: 14px;
          font-weight: 500;
        }

        .feed-url-container {
          margin-top: 15px;
        }

        .feed-label {
          display: block;
          color: #ccc;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .url-input-group {
          display: flex;
          gap: 10px;
        }

        .feed-url-input {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid #555;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-family: monospace;
        }

        .feed-url-input:focus {
          outline: none;
          border-color: #2698cd;
        }

        .copy-btn {
          background: #4285f4;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .copy-btn:hover {
          background: #3367d6;
          transform: translateY(-1px);
        }

        .feed-indicator {
          background: #4285f4;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        /* Keep all your original booking styles */
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #2698cd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 60px 20px;
        }

        .error-message h2 {
          color: #2698cd;
          margin-bottom: 20px;
        }

        .retry-btn {
          background: #2698cd;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: #1f7fb0;
          transform: translateY(-1px);
        }

        /* List View Styles - with scrollable container */
        .list-container {
          background: #1a1a1a;
          border-radius: 15px;
          padding: 20px;
          border: 1px solid #333;
          height: 600px;
          overflow-y: auto;
        }

        .list-container::-webkit-scrollbar {
          width: 8px;
        }

        .list-container::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 4px;
        }

        .list-container::-webkit-scrollbar-thumb {
          background: #2698cd;
          border-radius: 4px;
        }

        .list-container::-webkit-scrollbar-thumb:hover {
          background: #1f7fb0;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .booking-list-item {
          background: #2a2a2a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .booking-list-item:hover {
          background: #333;
          border-color: #2698cd;
          transform: translateY(-2px);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #444;
        }

        .booking-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .booking-date-time {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .booking-date {
          font-size: 16px;
          font-weight: bold;
          color: #2698cd;
        }

        .booking-time {
          font-size: 14px;
          color: #ccc;
        }

        .booking-ref {
          background: #2698cd;
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
        }

        .booking-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }

        .booking-customer-info h4 {
          color: white;
          font-size: 18px;
          margin-bottom: 8px;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .email, .phone {
          color: #aaa;
          font-size: 14px;
        }

        .booking-service-info {
          text-align: right;
        }

        .service-name {
          color: #2698cd;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .service-price {
          color: #4ade80;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 3px;
        }

        .service-duration {
          color: #ccc;
          font-size: 14px;
        }

        .booking-additional {
          background: #1a1a1a;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .vehicle-info, .special-requests {
          color: #ddd;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .vehicle-info:last-child, .special-requests:last-child {
          margin-bottom: 0;
        }

        .booking-status {
          display: flex;
          justify-content: flex-end;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.confirmed {
          background: #16a34a;
          color: white;
        }

        .status-badge.pending {
          background: #eab308;
          color: white;
        }

        .status-badge.cancelled {
          background: #2698cd;
          color: white;
        }

        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #888;
        }

        .loading-spinner-container .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #333;
          border-top: 3px solid #2698cd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .error-container {
          text-align: center;
          padding: 60px 20px;
          color: #888;
        }

        .error-container h3 {
          color: #2698cd;
          margin-bottom: 10px;
        }

        .retry-btn-small {
          background: #2698cd;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 15px;
          transition: all 0.3s ease;
        }

        .retry-btn-small:hover {
          background: #1f7fb0;
          transform: translateY(-1px);
        }

        .no-bookings {
          text-align: center;
          padding: 60px 20px;
          color: #888;
        }

        .no-bookings h3 {
          color: #2698cd;
          margin-bottom: 10px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .admin-bookings-page {
            padding: 60px 0 20px;
          }

          .admin-title {
            font-size: 24px;
          }

          .bookings-summary-header {
            flex-direction: column;
          }

          .url-input-group {
            flex-direction: column;
          }

          .list-container {
            height: 500px;
          }

          .booking-details {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .booking-service-info {
            text-align: left;
          }

          .booking-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .booking-header-right {
            align-self: flex-end;
          }
        }
      `}</style>

      <div className="admin-bookings-page">
        <div className="container">
          <div className="admin-header">
            <h1 className="admin-title">Admin Bookings</h1>
            <p className="admin-subtitle">View and manage all bookings</p>
          </div>

          <div className="bookings-summary-header">
            {renderCalendarFeed()}
            
            <div className="bookings-summary">
              <div className="summary-text">Total Bookings</div>
              <div className="summary-number">{bookings.length}</div>
            </div>
          </div>

          <div className="list-container">
            {renderListView()}
          </div>
        </div>
      </div>
    </Layout>
  );
}