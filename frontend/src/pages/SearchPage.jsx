import React, { useState, useEffect } from 'react';
import { searchUsers } from '../services/profileService';
import { createBooking } from '../services/bookingService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import BookingModal from '../components/BookingModal';
import MapComponent from '../components/MapComponent';
import api from '../services/api';
import './SearchPage.css';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('offering');
  const [radius, setRadius] = useState(50);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [viewMode, setViewMode] = useState('grid');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  const { speak, voiceEnabled } = useAccessibility();

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('Search page. Find skills and users nearby');
    }
  }, [voiceEnabled]);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLocationPermission('granted');
        
        if (voiceEnabled) {
          speak('Location access granted');
        }

        try {
          await api.put('/users/location', {
            latitude: location.lat,
            longitude: location.lng
          });
        } catch (err) {
          console.error('Failed to save location:', err);
        }
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        if (voiceEnabled) {
          speak('Location access denied');
        }
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a skill to search');
      if (voiceEnabled) {
        speak('Please enter a skill to search');
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);
      
      if (voiceEnabled) {
        speak(`Searching for ${searchQuery}`);
      }
      
      let data;
      if (currentLocation) {
        const response = await api.get('/users/nearby', {
          params: {
            skill: searchQuery,
            radius: radius,
            latitude: currentLocation.lat,
            longitude: currentLocation.lng
          }
        });
        data = response.data;
      } else {
        data = await searchUsers({
          skill: searchQuery,
          type: searchType,
        });
      }
      
      setResults(data);
      
      if (voiceEnabled) {
        speak(`Found ${data.length} user${data.length !== 1 ? 's' : ''}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err || 'Search failed';
      setError(errorMsg);
      if (voiceEnabled) {
        speak(`Search failed. ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnectClick = (user) => {
    setSelectedProvider(user);
    setIsBookingModalOpen(true);
    if (voiceEnabled) {
      speak(`Opening booking form for ${user.name}`);
    }
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await createBooking({
        providerId: selectedProvider.id,
        ...bookingData
      });
      
      if (voiceEnabled) {
        speak('Booking request sent successfully');
      }
      alert('Booking request sent successfully!');
      setIsBookingModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  return (
    <div className="search-page">
      <h1 onMouseEnter={() => handleVoiceHover('Find Skills Nearby')}>
        Find Skills Nearby
      </h1>
      <p 
        className="page-subtitle"
        onMouseEnter={() => handleVoiceHover('Connect with people who can teach or learn with you')}
      >
        Connect with people who can teach or learn with you
      </p>

      {locationPermission === 'denied' && (
        <div 
          className="location-warning"
          onMouseEnter={() => handleVoiceHover('Location access denied. Enable location to see nearby users')}
        >
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>Location access denied</strong>
            <p>Enable location to see nearby users and accurate distances</p>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={requestLocation}
            onMouseEnter={() => handleVoiceHover('Enable location button')}
          >
            Enable Location
          </button>
        </div>
      )}

      {error && (
        <div 
          className="error-message"
          onMouseEnter={() => handleVoiceHover(error)}
        >
          {error}
        </div>
      )}

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a skill (e.g., React, Guitar, Spanish)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (error) setError('');
            }}
            onFocus={() => speak('Search input field')}
            onMouseEnter={() => handleVoiceHover('Enter skill name to search')}
            className="search-input"
            disabled={loading}
          />
          
          <div className="search-controls">
            <div className="search-filters">
              <label 
                className="filter-option"
                onMouseEnter={() => handleVoiceHover('Search for people who can teach')}
              >
                <input
                  type="radio"
                  value="offering"
                  checked={searchType === 'offering'}
                  onChange={(e) => setSearchType(e.target.value)}
                  disabled={loading}
                />
                <span>People who can teach</span>
              </label>
              
              <label 
                className="filter-option"
                onMouseEnter={() => handleVoiceHover('Search for people who want to learn')}
              >
                <input
                  type="radio"
                  value="seeking"
                  checked={searchType === 'seeking'}
                  onChange={(e) => setSearchType(e.target.value)}
                  disabled={loading}
                />
                <span>People who want to learn</span>
              </label>
            </div>

            {currentLocation && (
              <div 
                className="radius-filter"
                onMouseEnter={() => handleVoiceHover(`Search within ${radius} kilometers`)}
              >
                <label>Within {radius} km</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  onFocus={() => speak('Radius slider')}
                  disabled={loading}
                  className="radius-slider"
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-search"
            disabled={loading}
            onMouseEnter={() => handleVoiceHover('Search button')}
          >
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching for users nearby...</p>
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <>
          <div className="results-header">
            <h2 onMouseEnter={() => handleVoiceHover(`Found ${results.length} user${results.length !== 1 ? 's' : ''}`)}>
              Found {results.length} user{results.length !== 1 ? 's' : ''}
            </h2>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('grid');
                  speak('Grid view selected');
                }}
                onMouseEnter={() => handleVoiceHover('Grid view')}
              >
                📋 Grid
              </button>
              <button
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('map');
                  speak('Map view selected');
                }}
                onMouseEnter={() => handleVoiceHover('Map view')}
                disabled={!currentLocation}
                title={!currentLocation ? 'Enable location to use map view' : ''}
              >
                🗺️ Map
              </button>
            </div>
          </div>

          {viewMode === 'map' && currentLocation ? (
            <MapComponent
              users={results}
              currentLocation={currentLocation}
              onMarkerClick={handleConnectClick}
            />
          ) : null}

          {viewMode === 'grid' && (
            <div className="results-grid">
              {results.map((user) => (
                <div 
                  key={user.id} 
                  className="result-card"
                  onMouseEnter={() => handleVoiceHover(
                    `${user.name}. ${user.distance ? `${user.distance} kilometers away.` : ''} ${user.bio || ''}`
                  )}
                >
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <h3>{user.name}</h3>
                    {user.distance !== undefined && (
                      <p className="location">📍 {user.distance} km away</p>
                    )}
                    {user.location && !user.distance && (
                      <p className="location">📍 {user.location}</p>
                    )}
                    {user.bio && (
                      <p className="bio">{user.bio}</p>
                    )}
                  </div>

                  <div className="user-skills">
                    {user.skills && user.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="skill-badge offering"
                        onMouseEnter={() => handleVoiceHover(`${skill.name}. Level ${skill.proficiency}`)}
                      >
                        {skill.name}
                        <span className="skill-level-badge">
                          L{skill.proficiency}
                        </span>
                      </span>
                    ))}
                  </div>

                  <button 
                    className="btn btn-primary btn-connect"
                    onClick={() => handleConnectClick(user)}
                    onMouseEnter={() => handleVoiceHover(`Book session with ${user.name}`)}
                  >
                    📅 Book Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && searched && results.length === 0 && (
        <div 
          className="empty-results"
          onMouseEnter={() => handleVoiceHover('No results found. Try searching for different skills')}
        >
          <div className="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try searching for different skills or increase your search radius</p>
        </div>
      )}

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookingSubmit}
        providerName={selectedProvider?.name || ''}
      />
    </div>
  );
}

export default SearchPage;
