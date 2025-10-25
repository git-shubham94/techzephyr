import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './HomePage.css';

function HomePage() {
  const authenticated = isAuthenticated();
  const { speak, voiceEnabled } = useAccessibility();
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Auto-read page title when voice is enabled
  useEffect(() => {
    if (voiceEnabled) {
      speak('Welcome to SkilLink. Exchange Skills, Grow Together.');
    }
  }, [voiceEnabled]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-section]').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: '🎓', title: 'Skill Exchange', description: 'Learn from experts and teach what you know.' },
    { icon: '📍', title: 'Find Nearby', description: 'Connect with people in your locality.' },
    { icon: '📅', title: 'Easy Booking', description: 'Schedule sessions with a simple booking system.' },
    { icon: '💰', title: 'Earn Credits', description: 'Get rewarded for sharing knowledge.' },
    { icon: '⭐', title: 'Build Reputation', description: 'Receive ratings and reviews.' },
    { icon: '🚀', title: 'Collaborate', description: 'Join or create projects.' }
  ];

  const stats = [
    { number: '1000+', label: 'Active Users', icon: '👥' },
    { number: '50+', label: 'Skills Available', icon: '🎯' },
    { number: '500+', label: 'Sessions Completed', icon: '✅' },
    { number: '4.8/5', label: 'Average Rating', icon: '⭐' }
  ];

  const howItWorks = [
    { step: '01', title: 'Create Your Profile', description: 'Sign up and tell us about your skills.', icon: '📝' },
    { step: '02', title: 'Search & Connect', description: 'Find people nearby who can teach you.', icon: '🔍' },
    { step: '03', title: 'Book a Session', description: 'Schedule a time that works for both.', icon: '📅' },
    { step: '04', title: 'Exchange Knowledge', description: 'Meet, learn, teach, and earn credits.', icon: '🤝' }
  ];

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" data-section="hero">
        <div className={`hero-content ${visibleSections.has('hero') ? 'fade-in-up' : ''}`}>
          <h1 
            className="hero-title"
            onMouseEnter={() => handleVoiceHover('Exchange Skills. Grow Together.')}
          >
            Exchange Skills.<br />
            <span className="gradient-text">Grow Together.</span>
          </h1>
          <p 
            className="hero-subtitle"
            onMouseEnter={() => handleVoiceHover('Connect with people in your locality to exchange skills, collaborate on projects, and build a community of continuous learning.')}
          >
            Connect with people in your locality to exchange skills, collaborate on projects,
            and build a community of continuous learning.
          </p>
          <div className="hero-buttons">
            {authenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="btn btn-primary btn-lg"
                  onMouseEnter={() => handleVoiceHover('Go to Dashboard button')}
                  onClick={() => speak('Navigating to dashboard')}
                >
                  Go to Dashboard
                </Link>
                <Link 
                  to="/search" 
                  className="btn btn-secondary btn-lg"
                  onMouseEnter={() => handleVoiceHover('Find Skills button')}
                  onClick={() => speak('Navigating to search page')}
                >
                  Find Skills
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-lg"
                  onMouseEnter={() => handleVoiceHover('Get Started Free button')}
                  onClick={() => speak('Navigating to registration')}
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-lg"
                  onMouseEnter={() => handleVoiceHover('Sign In button')}
                  onClick={() => speak('Navigating to login page')}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className={`hero-image ${visibleSections.has('hero') ? 'fade-in-right' : ''}`}>
          <div className="floating-card card-1">
            <span className="card-icon">🎓</span>
            <span className="card-text">Learn React</span>
          </div>
          <div className="floating-card card-2">
            <span className="card-icon">🎸</span>
            <span className="card-text">Teach Guitar</span>
          </div>
          <div className="floating-card card-3">
            <span className="card-icon">💻</span>
            <span className="card-text">Python Expert</span>
          </div>
          <div className="hero-circle"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-section="stats">
        <div className={`stats-grid ${visibleSections.has('stats') ? 'fade-in-up' : ''}`}>
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => handleVoiceHover(`${stat.number} ${stat.label}`)}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" data-section="features">
        <div className={`section-header ${visibleSections.has('features') ? 'fade-in-up' : ''}`}>
          <h2 onMouseEnter={() => handleVoiceHover('Why Choose SkilLink?')}>
            Why Choose SkilLink?
          </h2>
          <p onMouseEnter={() => handleVoiceHover('Everything you need to exchange skills and grow your network')}>
            Everything you need to exchange skills and grow your network
          </p>
        </div>
        
        <div className={`features-grid ${visibleSections.has('features') ? 'stagger-in' : ''}`}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => handleVoiceHover(`${feature.title}. ${feature.description}`)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" data-section="how-it-works">
        <div className={`section-header ${visibleSections.has('how-it-works') ? 'fade-in-up' : ''}`}>
          <h2 onMouseEnter={() => handleVoiceHover('How It Works')}>How It Works</h2>
          <p onMouseEnter={() => handleVoiceHover('Get started in 4 simple steps')}>Get started in 4 simple steps</p>
        </div>

        <div className={`steps-container ${visibleSections.has('how-it-works') ? 'stagger-in' : ''}`}>
          {howItWorks.map((item, index) => (
            <div 
              key={index} 
              className="step-card"
              style={{ animationDelay: `${index * 0.15}s` }}
              onMouseEnter={() => handleVoiceHover(`Step ${item.step}. ${item.title}. ${item.description}`)}
            >
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-section="cta">
        <div className={`cta-content ${visibleSections.has('cta') ? 'fade-in-up' : ''}`}>
          <h2 onMouseEnter={() => handleVoiceHover('Ready to Start Your Journey?')}>
            Ready to Start Your Journey?
          </h2>
          <p onMouseEnter={() => handleVoiceHover('Join thousands of learners and teachers in our community')}>
            Join thousands of learners and teachers in our community
          </p>
          {!authenticated && (
            <Link 
              to="/register" 
              className="btn btn-primary btn-lg"
              onMouseEnter={() => handleVoiceHover('Sign Up Now - It is Free button')}
              onClick={() => speak('Navigating to registration')}
            >
              Sign Up Now - It's Free!
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>🤝 SkilLink</h3>
            <p>Connecting people through skill exchange</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <Link to="/search" onMouseEnter={() => handleVoiceHover('Find Skills link')}>Find Skills</Link>
              <Link to="/projects" onMouseEnter={() => handleVoiceHover('Projects link')}>Projects</Link>
              {!authenticated && <Link to="/register" onMouseEnter={() => handleVoiceHover('Sign Up link')}>Sign Up</Link>}
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="#features" onMouseEnter={() => handleVoiceHover('Features link')}>Features</a>
              <a href="#how-it-works" onMouseEnter={() => handleVoiceHover('How It Works link')}>How It Works</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 SkilLink. Built with ❤️ for the community.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
