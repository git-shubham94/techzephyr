import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus } from '../services/bookingService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './BookingPage.css';

function BookingPage() {
  const visibleSections = useScrollAnimation();
  const { speak, voiceEnabled } = useAccessibility();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('My Bookings page. Manage your scheduled learning sessions');
    }
  }, [voiceEnabled]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
      if (voiceEnabled) {
        speak(`You have ${data.length} booking${data.length !== 1 ? 's' : ''}`);
      }
    } catch (err) {
      setError(err || 'Failed to fetch bookings');
      if (voiceEnabled) {
        speak('Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (filter === 'upcoming') {
      filtered = bookings.filter(b => 
        (b.status === 'confirmed' || b.status === 'pending') &&
        new Date(`${b.date}T${b.time}`) > new Date()
      );
    } else if (filter === 'past') {
      filtered = bookings.filter(b => 
        b.status === 'completed' || 
        new Date(`${b.date}T${b.time}`) < new Date()
      );
    } else if (filter === 'pending') {
      filtered = bookings.filter(b => b.status === 'pending');
    } else if (filter === 'confirmed') {
      filtered = bookings.filter(b => b.status === 'confirmed');
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    setError('');

    try {
      await updateBookingStatus(bookingId, newStatus);
      if (voiceEnabled) {
        speak(`Booking ${newStatus}`);
      }
      await fetchBookings();
    } catch (err) {
      setError(err || 'Failed to update booking');
      if (voiceEnabled) {
        speak('Failed to update booking');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return colors[status] || 'status-pending';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      completed: '🎉',
      cancelled: '❌'
    };
    return icons[status] || '⏳';
  };

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  const filterCounts = {
    all: bookings.length,
    upcoming: bookings.filter(b => 
      (b.status === 'confirmed' || b.status === 'pending') &&
      new Date(`${b.date}T${b.time}`) > new Date()
    ).length,
    past: bookings.filter(b => 
      b.status === 'completed' || 
      new Date(`${b.date}T${b.time}`) < new Date()
    ).length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-state fade-in">
          <div className="spinner rotate"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header" data-section="header">
        <div 
          className={visibleSections.has('header') ? 'fade-in-left' : ''}
          onMouseEnter={() => handleVoiceHover('My Bookings')}
        >
          <h1>My Bookings</h1>
          <p 
            className="page-subtitle"
            onMouseEnter={() => handleVoiceHover('Manage your scheduled learning sessions')}
          >
            Manage your scheduled learning sessions
          </p>
        </div>
        <div className={`booking-stats ${visibleSections.has('header') ? 'scale-in delay-200' : ''}`}>
          <div 
            className="stat-badge"
            onMouseEnter={() => handleVoiceHover(`${filterCounts.upcoming} upcoming bookings`)}
          >
            <span className="stat-number">{filterCounts.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div 
            className="stat-badge"
            onMouseEnter={() => handleVoiceHover(`${filterCounts.pending} pending bookings`)}
          >
            <span className="stat-number">{filterCounts.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {error && (
        <div 
          className="error-message fade-in"
          onMouseEnter={() => handleVoiceHover(error)}
        >
          {error}
        </div>
      )}

      <div className={`filter-section ${visibleSections.has('header') ? 'fade-in-up delay-300' : ''}`}>
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All', icon: '📋' },
            { key: 'upcoming', label: 'Upcoming', icon: '🔜' },
            { key: 'pending', label: 'Pending', icon: '⏳' },
            { key: 'confirmed', label: 'Confirmed', icon: '✅' },
            { key: 'past', label: 'Past', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => {
                setFilter(tab.key);
                speak(`Showing ${tab.label} bookings`);
              }}
              onMouseEnter={() => handleVoiceHover(`${tab.label} bookings. ${filterCounts[tab.key]} total`)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">{filterCounts[tab.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div 
          className="empty-state fade-in" 
          data-section="empty"
          onMouseEnter={() => handleVoiceHover(
            filter === 'all' 
              ? "You don't have any bookings yet. Start by searching for skills to learn"
              : `You don't have any ${filter} bookings`
          )}
        >
          <div className="empty-icon">📅</div>
          <h3>No bookings found</h3>
          <p>
            {filter === 'all' 
              ? "You don't have any bookings yet. Start by searching for skills to learn!"
              : `You don't have any ${filter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="bookings-grid" data-section="bookings">
          {filteredBookings.map((booking, index) => (
            <div
              key={booking.id}
              className={`booking-card hover-lift ${visibleSections.has('bookings') ? 'fade-in-up' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => handleVoiceHover(
                `${booking.isProvider ? 'Teaching' : 'Learning'} session with ${booking.isProvider ? booking.seekerName : booking.providerName}. 
                ${formatDate(booking.date)} at ${formatTime(booking.time)}. 
                Status: ${booking.status}`
              )}
            >
              <div className="booking-card-header">
                <div 
                  className="booking-type-badge"
                  onMouseEnter={() => handleVoiceHover(booking.isProvider ? 'Teaching session' : 'Learning session')}
                >
                  {booking.isProvider ? (
                    <span className="badge-provider">
                      <span className="badge-icon">🎓</span>
                      Teaching
                    </span>
                  ) : (
                    <span className="badge-seeker">
                      <span className="badge-icon">📚</span>
                      Learning
                    </span>
                  )}
                </div>
                <div 
                  className={`status-badge ${getStatusColor(booking.status)}`}
                  onMouseEnter={() => handleVoiceHover(`Status: ${booking.status}`)}
                >
                  <span className="status-icon">{getStatusIcon(booking.status)}</span>
                  <span className="status-text">{booking.status}</span>
                </div>
              </div>

              <div className="booking-card-body">
                <h3 className="booking-title">
                  {booking.isProvider ? (
                    <>Session with <strong>{booking.seekerName}</strong></>
                  ) : (
                    <>Session with <strong>{booking.providerName}</strong></>
                  )}
                </h3>

                <div className="booking-details">
                  <div 
                    className="detail-item"
                    onMouseEnter={() => handleVoiceHover(`Date: ${formatDate(booking.date)}`)}
                  >
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDate(booking.date)}</span>
                    </div>
                  </div>

                  <div 
                    className="detail-item"
                    onMouseEnter={() => handleVoiceHover(`Time: ${formatTime(booking.time)}`)}
                  >
                    <span className="detail-icon">🕐</span>
                    <div className="detail-content">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">{formatTime(booking.time)}</span>
                    </div>
                  </div>

                  <div 
                    className="detail-item"
                    onMouseEnter={() => handleVoiceHover(`Duration: ${booking.duration} minutes`)}
                  >
                    <span className="detail-icon">⏱️</span>
                    <div className="detail-content">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{booking.duration} minutes</span>
                    </div>
                  </div>
                </div>

                {booking.message && (
                  <div 
                    className="booking-message"
                    onMouseEnter={() => handleVoiceHover(`Message: ${booking.message}`)}
                  >
                    <span className="message-icon">💬</span>
                    <p className="message-text">{booking.message}</p>
                  </div>
                )}
              </div>

              <div className="booking-card-footer">
                {booking.isProvider && booking.status === 'pending' && (
                  <div className="action-buttons provider-actions">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      disabled={actionLoading === booking.id}
                      onMouseEnter={() => handleVoiceHover('Accept booking request')}
                      className="btn btn-success hover-scale"
                    >
                      {actionLoading === booking.id ? '⏳' : '✅'} Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      disabled={actionLoading === booking.id}
                      onMouseEnter={() => handleVoiceHover('Decline booking request')}
                      className="btn btn-danger hover-scale"
                    >
                      {actionLoading === booking.id ? '⏳' : '❌'} Decline
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="action-buttons">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      disabled={actionLoading === booking.id}
                      onMouseEnter={() => handleVoiceHover('Mark booking as completed')}
                      className="btn btn-primary hover-scale"
                    >
                      {actionLoading === booking.id ? '⏳ Processing...' : '🎉 Mark as Completed'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      disabled={actionLoading === booking.id}
                      onMouseEnter={() => handleVoiceHover('Cancel booking')}
                      className="btn btn-secondary hover-scale"
                    >
                      {actionLoading === booking.id ? '⏳' : '❌'} Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div 
                    className="completion-message"
                    onMouseEnter={() => handleVoiceHover('Session completed successfully')}
                  >
                    <span className="completion-icon">🎉</span>
                    <span className="completion-text">Session completed successfully!</span>
                  </div>
                )}

                {booking.status === 'cancelled' && (
                  <div 
                    className="cancelled-message"
                    onMouseEnter={() => handleVoiceHover('This session was cancelled')}
                  >
                    <span className="cancelled-icon">❌</span>
                    <span className="cancelled-text">This session was cancelled</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingPage;
