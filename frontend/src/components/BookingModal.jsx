import React, { useState, useEffect } from 'react';
import './BookingModal.css';

function BookingModal({ isOpen, onClose, onSubmit, providerName }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate time slots in 24-hour format
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        slots.push(`${hourStr}:${minuteStr}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    return date1 && date2 &&
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date && date < today;
  };

  const handleDateSelect = (date) => {
    if (date && !isPastDate(date)) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, date: formattedDate });
      setShowCalendar(false);
    }
  };

  const handleTimeSelect = (time) => {
    setFormData({ ...formData, time });
    setShowTimeDropdown(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      setFormData({ date: '', time: '', duration: 60, message: '' });
      setSelectedDate(new Date());
    } catch (err) {
      setError(err || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.calendar-container') && !e.target.closest('.date-input-wrapper')) {
        setShowCalendar(false);
      }
      if (!e.target.closest('.time-dropdown-container') && !e.target.closest('.time-input-wrapper')) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Book Session with {providerName}</h2>
        <p className="modal-subtitle">Schedule your learning session</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Date Picker with Calendar */}
          <div className="form-group">
            <label htmlFor="date">📅 Select Date *</label>
            <div className="date-input-wrapper">
              <input
                type="text"
                id="date"
                value={formData.date || 'Click to select date'}
                onClick={() => setShowCalendar(!showCalendar)}
                readOnly
                required
                placeholder="Select a date"
                className="date-input"
              />
              {showCalendar && (
                <div className="calendar-container">
                  <div className="calendar-header">
                    <button type="button" onClick={prevMonth} className="calendar-nav">
                      ‹
                    </button>
                    <div className="calendar-month">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </div>
                    <button type="button" onClick={nextMonth} className="calendar-nav">
                      ›
                    </button>
                  </div>
                  
                  <div className="calendar-weekdays">
                    {dayNames.map(day => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  
                  <div className="calendar-days">
                    {getDaysInMonth(currentMonth).map((date, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`calendar-day ${
                          date ? '' : 'empty'
                        } ${
                          date && isToday(date) ? 'today' : ''
                        } ${
                          date && isSameDay(date, selectedDate) ? 'selected' : ''
                        } ${
                          date && isPastDate(date) ? 'disabled' : ''
                        }`}
                        onClick={() => handleDateSelect(date)}
                        disabled={!date || isPastDate(date)}
                      >
                        {date ? date.getDate() : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Picker with Dropdown */}
          <div className="form-group">
            <label htmlFor="time">🕐 Select Time *</label>
            <div className="time-input-wrapper">
              <input
                type="text"
                id="time"
                value={formData.time || 'Click to select time'}
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                readOnly
                required
                placeholder="Select a time"
                className="time-input"
              />
              {showTimeDropdown && (
                <div className="time-dropdown-container">
                  <div className="time-dropdown-header">
                    Select Time (24-hour format)
                  </div>
                  <div className="time-dropdown-list">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(time)}
                      >
                        <span className="time-slot-time">{time}</span>
                        <span className="time-slot-period">
                          {parseInt(time.split(':')[0]) < 12 ? 'AM' : 'PM'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="duration">⏱️ Duration</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              disabled={loading}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>

          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">💬 Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Add a message about what you'd like to learn..."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Booking...' : '📅 Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
