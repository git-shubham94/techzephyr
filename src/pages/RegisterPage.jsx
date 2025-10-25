import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './AuthPages.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { speak, voiceEnabled } = useAccessibility();

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('Registration page. Join SkilLink. Create your account to start exchanging skills');
    }
  }, [voiceEnabled]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      if (voiceEnabled) {
        speak(errorMsg);
      }
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      if (voiceEnabled) {
        speak(errorMsg);
      }
      return;
    }

    setLoading(true);
    if (voiceEnabled) {
      speak('Creating your account');
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      if (voiceEnabled) {
        speak('Account created successfully. Redirecting to dashboard');
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err || 'Registration failed. Please try again.';
      setError(errorMsg);
      if (voiceEnabled) {
        speak(errorMsg);
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
    <div className="auth-page">
      <div className="auth-container">
        <h1 onMouseEnter={() => handleVoiceHover('Join SkilLink')}>
          Join SkilLink
        </h1>
        <p 
          className="subtitle"
          onMouseEnter={() => handleVoiceHover('Start exchanging skills today')}
        >
          Start exchanging skills today
        </p>

        {error && (
          <div 
            className="error-message"
            onMouseEnter={() => handleVoiceHover(error)}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => speak('Full name input field')}
              onMouseEnter={() => handleVoiceHover('Enter your full name')}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => speak('Email input field')}
              onMouseEnter={() => handleVoiceHover('Enter your email address')}
              required
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => speak('Password input field')}
              onMouseEnter={() => handleVoiceHover('Create a password. At least 6 characters')}
              required
              placeholder="••••••••"
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => speak('Confirm password input field')}
              onMouseEnter={() => handleVoiceHover('Re-enter your password to confirm')}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            onMouseEnter={() => handleVoiceHover('Create account button')}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p 
          className="auth-footer"
          onMouseEnter={() => handleVoiceHover('Already have an account? Login here')}
        >
          Already have an account?{' '}
          <Link 
            to="/login"
            onMouseEnter={() => handleVoiceHover('Login here link')}
            onClick={() => speak('Navigating to login page')}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
