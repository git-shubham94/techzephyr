import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './AuthPages.css';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { speak, voiceEnabled } = useAccessibility();

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('Login page. Welcome back. Enter your credentials to continue');
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
    setLoading(true);

    if (voiceEnabled) {
      speak('Logging in');
    }

    try {
      await login(formData);
      if (voiceEnabled) {
        speak('Login successful. Redirecting to dashboard');
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err || 'Login failed. Please try again.';
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
        <h1 onMouseEnter={() => handleVoiceHover('Welcome Back')}>
          Welcome Back
        </h1>
        <p 
          className="subtitle"
          onMouseEnter={() => handleVoiceHover('Login to continue your skill journey')}
        >
          Login to continue your skill journey
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
              onMouseEnter={() => handleVoiceHover('Enter your password')}
              required
              placeholder="••••••••"
              minLength="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            onMouseEnter={() => handleVoiceHover('Login button')}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p 
          className="auth-footer"
          onMouseEnter={() => handleVoiceHover("Don't have an account? Register here")}
        >
          Don't have an account?{' '}
          <Link 
            to="/register"
            onMouseEnter={() => handleVoiceHover('Register here link')}
            onClick={() => speak('Navigating to registration page')}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
