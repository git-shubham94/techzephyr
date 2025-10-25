import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';
import { updateProfile } from '../services/profileService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccessibility } from '../contexts/AccessibilityContext';
import api from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
  const currentUser = getCurrentUser();
  const visibleSections = useScrollAnimation();
  const { speak, voiceEnabled } = useAccessibility();
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: '',
    location: '',
    phone: '',
    avatar: currentUser?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('My Profile page. Edit your profile information');
    }
  }, [voiceEnabled]);

  useEffect(() => {
    setAvatarPreview(profile.avatar);
  }, [profile.avatar]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      if (voiceEnabled) {
        speak('File size too large. Maximum 5 megabytes');
      }
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      if (voiceEnabled) {
        speak('Invalid file type. Only images allowed');
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    setError('');
    if (voiceEnabled) {
      speak('Uploading avatar');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile({
        ...profile,
        avatar: response.data.avatarUrl
      });

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.avatar = response.data.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Avatar updated successfully! ✅');
      if (voiceEnabled) {
        speak('Avatar updated successfully');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload avatar');
      if (voiceEnabled) {
        speak('Failed to upload avatar');
      }
      setAvatarPreview(profile.avatar);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      if (voiceEnabled) {
        speak('Geolocation not supported by your browser');
      }
      return;
    }

    setGettingLocation(true);
    if (voiceEnabled) {
      speak('Getting your location');
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const address = data.address;
          const locationString = `${address.city || address.town || address.village || ''}, ${address.country || ''}`.trim();

          setProfile({
            ...profile,
            location: locationString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });

          await api.put('/users/location', {
            latitude,
            longitude,
            address: locationString
          });

          setSuccess('Location updated successfully!');
          if (voiceEnabled) {
            speak(`Location updated to ${locationString}`);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setProfile({
            ...profile,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
          setError('Location coordinates saved, but address lookup failed');
          if (voiceEnabled) {
            speak('Location saved');
          }
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Location error:', error);
        alert('Failed to get location. Please enable location permission and try again.');
        if (voiceEnabled) {
          speak('Failed to get location');
        }
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (voiceEnabled) {
      speak('Saving profile');
    }

    try {
      await updateProfile(profile);
      setSuccess('Profile updated successfully!');
      if (voiceEnabled) {
        speak('Profile updated successfully');
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err || 'Failed to update profile');
      if (voiceEnabled) {
        speak('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  return (
    <div className="profile-page">
      <h1 
        className="fade-in-down"
        onMouseEnter={() => handleVoiceHover('My Profile')}
      >
        My Profile
      </h1>
      
      {success && (
        <div 
          className="success-message fade-in"
          onMouseEnter={() => handleVoiceHover(success)}
        >
          {success}
        </div>
      )}
      {error && (
        <div 
          className="error-message fade-in"
          onMouseEnter={() => handleVoiceHover(error)}
        >
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section avatar-section" data-section="avatar">
          <h2 
            className={visibleSections.has('avatar') ? 'fade-in-left' : ''}
            onMouseEnter={() => handleVoiceHover('Profile Picture section')}
          >
            Profile Picture
          </h2>
          <div className={`avatar-upload-container ${visibleSections.has('avatar') ? 'fade-in-up delay-200' : ''}`}>
            <div 
              className="avatar-preview"
              onMouseEnter={() => handleVoiceHover('Current profile picture')}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder-large">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div className="avatar-loading">
                  <div className="spinner-small rotate"></div>
                </div>
              )}
            </div>
            <div className="avatar-upload-controls">
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                disabled={uploadingAvatar}
              />
              <label 
                htmlFor="avatar-upload" 
                className={`btn btn-secondary hover-scale ${uploadingAvatar ? 'disabled' : ''}`}
                onMouseEnter={() => handleVoiceHover('Change photo button. Maximum size 5 megabytes')}
              >
                {uploadingAvatar ? '⏳ Uploading...' : '📷 Change Photo'}
              </label>
              <small>Max size: 5MB • Formats: JPG, PNG, GIF, WebP</small>
            </div>
          </div>
        </div>

        <div className="profile-section" data-section="basic-info">
          <h2 
            className={visibleSections.has('basic-info') ? 'fade-in-left' : ''}
            onMouseEnter={() => handleVoiceHover('Basic Information section')}
          >
            Basic Information
          </h2>
          <div className={visibleSections.has('basic-info') ? 'stagger-in' : ''}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                onFocus={() => speak('Full name input field')}
                onMouseEnter={() => handleVoiceHover('Enter your full name')}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onMouseEnter={() => handleVoiceHover('Email address. Cannot be changed')}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                onFocus={() => speak('Phone number input field')}
                onMouseEnter={() => handleVoiceHover('Enter your phone number')}
                placeholder="+1 234 567 8900"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="location-input-group">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  onFocus={() => speak('Location input field')}
                  onMouseEnter={() => handleVoiceHover('Enter your city and country')}
                  placeholder="City, Country"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-location hover-scale"
                  onClick={handleGetLocation}
                  onMouseEnter={() => handleVoiceHover('Use my current location button')}
                  disabled={loading || gettingLocation}
                >
                  {gettingLocation ? '📍 Getting...' : '📍 Use My Location'}
                </button>
              </div>
              <small>Help others find you nearby. We'll use this for distance calculations.</small>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                onFocus={() => speak('Bio text area')}
                onMouseEnter={() => handleVoiceHover('Tell others about yourself and your interests')}
                rows="4"
                placeholder="Tell others about yourself, your interests, and what you're looking for..."
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary hover-scale"
              onMouseEnter={() => handleVoiceHover('Save changes button')}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
