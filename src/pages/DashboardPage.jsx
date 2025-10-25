import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { getBookings } from '../services/bookingService';
import { getCredits } from '../services/creditService';
import { getUserReputation } from '../services/reviewService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './DashboardPage.css';

function DashboardPage() {
  const currentUser = getCurrentUser();
  const visibleSections = useScrollAnimation();
  const { speak, voiceEnabled } = useAccessibility();
  const [stats, setStats] = useState({
    bookings: [],
    credits: 0,
    reputation: null,
    loading: true
  });

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak(`Welcome to your dashboard, ${currentUser?.name || 'User'}`);
    }
  }, [voiceEnabled]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsData, creditsData, reputationData] = await Promise.all([
        getBookings().catch(() => []),
        getCredits().catch(() => ({ balance: 0 })),
        getUserReputation(currentUser.id).catch(() => null)
      ]);

      const completedSessions = bookingsData.filter(b => b.status === 'completed').length;
      const upcomingSessions = bookingsData.filter(
        b => b.status === 'confirmed' && new Date(`${b.date}T${b.time}`) > new Date()
      );

      setStats({
        bookings: upcomingSessions,
        completedSessions,
        credits: creditsData.balance,
        reputation: reputationData,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
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

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  if (stats.loading) {
    return (
      <div className="dashboard-page">
        <div className="loading fade-in">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header" data-section="header">
        <div 
          className={visibleSections.has('header') ? 'fade-in-left' : ''}
          onMouseEnter={() => handleVoiceHover(`Welcome back, ${currentUser?.name}`)}
        >
          <h1>Welcome back, {currentUser?.name}! 👋</h1>
          <p onMouseEnter={() => handleVoiceHover('Here is your skill exchange overview')}>
            Here's your skill exchange overview
          </p>
        </div>
        {stats.reputation && (
          <div 
            className={`reputation-badge-large ${visibleSections.has('header') ? 'scale-in delay-200' : ''}`}
            onMouseEnter={() => handleVoiceHover(`Your reputation level is ${stats.reputation.level}. Score: ${stats.reputation.reputationScore} out of 100`)}
          >
            <span className="rep-level">{stats.reputation.level}</span>
            <span className="rep-score">{stats.reputation.reputationScore}/100</span>
          </div>
        )}
      </header>

      <div className="dashboard-grid" data-section="cards">
        {/* Stats Card */}
        <div 
          className={`dashboard-card stats-card hover-lift ${visibleSections.has('cards') ? 'fade-in-up' : ''}`}
          onMouseEnter={() => handleVoiceHover(`My stats. ${stats.completedSessions || 0} sessions completed. Average rating: ${stats.reputation?.stats.avgRating || 0} stars. ${stats.credits || 0} credits`)}
        >
          <h3>📊 My Stats</h3>
          <div className="stats">
            <div 
              className="stat-item"
              onMouseEnter={() => handleVoiceHover(`${stats.completedSessions || 0} sessions completed`)}
            >
              <span className="stat-value">{stats.completedSessions || 0}</span>
              <span className="stat-label">Sessions Completed</span>
            </div>
            <div 
              className="stat-item"
              onMouseEnter={() => handleVoiceHover(`Average rating: ${stats.reputation?.stats.avgRating || 0} stars`)}
            >
              <span className="stat-value">
                {stats.reputation?.stats.avgRating || 0}⭐
              </span>
              <span className="stat-label">Avg Rating</span>
            </div>
            <div 
              className="stat-item"
              onMouseEnter={() => handleVoiceHover(`${stats.credits || 0} credits available`)}
            >
              <span className="stat-value credits-value">
                {stats.credits || 0}
              </span>
              <span className="stat-label">Credits</span>
            </div>
          </div>
          <Link 
            to="/profile" 
            className="btn btn-secondary btn-sm"
            onMouseEnter={() => handleVoiceHover('View full profile button')}
            onClick={() => speak('Navigating to profile page')}
          >
            View Full Profile
          </Link>
        </div>

        {/* Credits Card */}
        <div 
          className={`dashboard-card credits-card hover-lift ${visibleSections.has('cards') ? 'fade-in-up delay-100' : ''}`}
          onMouseEnter={() => handleVoiceHover(`Credits balance: ${stats.credits} credits`)}
        >
          <h3>💰 Credits Balance</h3>
          <div className="credits-display">
            <div className="credits-amount">{stats.credits}</div>
            <p 
              className="credits-description"
              onMouseEnter={() => handleVoiceHover('Use credits to book premium sessions or redeem for rewards')}
            >
              Use credits to book premium sessions or redeem for rewards
            </p>
          </div>
          <div className="credits-actions">
            <Link 
              to="/search" 
              className="btn btn-primary btn-sm"
              onMouseEnter={() => handleVoiceHover('Book session button')}
              onClick={() => speak('Navigating to search page')}
            >
              Book Session
            </Link>
            <button 
              className="btn btn-secondary btn-sm" 
              disabled
              onMouseEnter={() => handleVoiceHover('Redeem credits. Coming soon')}
            >
              Redeem (Soon)
            </button>
          </div>
        </div>

        {/* Upcoming Sessions Card */}
        <div 
          className={`dashboard-card hover-lift ${visibleSections.has('cards') ? 'fade-in-up delay-200' : ''}`}
          onMouseEnter={() => handleVoiceHover(`Upcoming sessions. ${stats.bookings.length} sessions scheduled`)}
        >
          <h3>📅 Upcoming Sessions</h3>
          <div className="session-list">
            {stats.bookings.length === 0 ? (
              <>
                <p 
                  className="placeholder"
                  onMouseEnter={() => handleVoiceHover('No upcoming sessions scheduled')}
                >
                  No upcoming sessions
                </p>
                <Link 
                  to="/search" 
                  className="btn btn-secondary"
                  onMouseEnter={() => handleVoiceHover('Find sessions button')}
                  onClick={() => speak('Navigating to search page')}
                >
                  Find Sessions
                </Link>
              </>
            ) : (
              <>
                {stats.bookings.slice(0, 3).map((booking) => (
                  <div 
                    key={booking.id} 
                    className="session-item"
                    onMouseEnter={() => handleVoiceHover(
                      `Session with ${booking.isProvider ? booking.seekerName : booking.providerName}. 
                      ${formatDate(booking.date)} at ${formatTime(booking.time)}. 
                      You are ${booking.isProvider ? 'teaching' : 'learning'}`
                    )}
                  >
                    <div className="session-info">
                      <strong>
                        {booking.isProvider ? booking.seekerName : booking.providerName}
                      </strong>
                      <span className="session-time">
                        {formatDate(booking.date)} at {formatTime(booking.time)}
                      </span>
                    </div>
                    <span className={`session-badge ${booking.isProvider ? 'provider' : 'seeker'}`}>
                      {booking.isProvider ? 'Teaching' : 'Learning'}
                    </span>
                  </div>
                ))}
                <Link 
                  to="/booking" 
                  className="btn btn-secondary btn-sm"
                  onMouseEnter={() => handleVoiceHover('View all bookings button')}
                  onClick={() => speak('Navigating to bookings page')}
                >
                  View All Bookings
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div 
          className={`dashboard-card hover-lift ${visibleSections.has('cards') ? 'fade-in-up delay-300' : ''}`}
          onMouseEnter={() => handleVoiceHover('Quick actions menu')}
        >
          <h3>🎯 Quick Actions</h3>
          <div className="quick-actions">
            <Link 
              to="/profile" 
              className="action-btn hover-scale"
              onMouseEnter={() => handleVoiceHover('Edit profile')}
              onClick={() => speak('Navigating to profile page')}
            >
              <span className="action-icon">✏️</span>
              <span>Edit Profile</span>
            </Link>
            <Link 
              to="/skills" 
              className="action-btn hover-scale"
              onMouseEnter={() => handleVoiceHover('Manage skills')}
              onClick={() => speak('Navigating to skills page')}
            >
              <span className="action-icon">🎓</span>
              <span>Manage Skills</span>
            </Link>
            <Link 
              to="/search" 
              className="action-btn hover-scale"
              onMouseEnter={() => handleVoiceHover('Find skills')}
              onClick={() => speak('Navigating to search page')}
            >
              <span className="action-icon">🔍</span>
              <span>Find Skills</span>
            </Link>
            <Link 
              to="/projects" 
              className="action-btn hover-scale"
              onMouseEnter={() => handleVoiceHover('Browse projects')}
              onClick={() => speak('Navigating to projects page')}
            >
              <span className="action-icon">🚀</span>
              <span>Browse Projects</span>
            </Link>
          </div>
        </div>

        {/* Reputation Card */}
        {stats.reputation && (
          <div 
            className={`dashboard-card reputation-card hover-lift ${visibleSections.has('cards') ? 'fade-in-up delay-400' : ''}`}
            onMouseEnter={() => handleVoiceHover(
              `Reputation details. Score: ${stats.reputation.reputationScore}. 
              Level: ${stats.reputation.level}. 
              Total reviews: ${stats.reputation.stats.totalReviews}. 
              Total skills: ${stats.reputation.stats.totalSkills}`
            )}
          >
            <h3>⭐ Reputation</h3>
            <div className="reputation-details">
              <div className="reputation-score-circle pulse">
                <div className="score-number">{stats.reputation.reputationScore}</div>
                <div className="score-label">Score</div>
              </div>
              <div className="reputation-breakdown">
                <div 
                  className="rep-item"
                  onMouseEnter={() => handleVoiceHover(`Level: ${stats.reputation.level}`)}
                >
                  <span className="rep-label">Level:</span>
                  <span className="rep-value">{stats.reputation.level}</span>
                </div>
                <div 
                  className="rep-item"
                  onMouseEnter={() => handleVoiceHover(`Total reviews: ${stats.reputation.stats.totalReviews}`)}
                >
                  <span className="rep-label">Reviews:</span>
                  <span className="rep-value">{stats.reputation.stats.totalReviews}</span>
                </div>
                <div 
                  className="rep-item"
                  onMouseEnter={() => handleVoiceHover(`Total skills: ${stats.reputation.stats.totalSkills}`)}
                >
                  <span className="rep-label">Skills:</span>
                  <span className="rep-value">{stats.reputation.stats.totalSkills}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
