import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './HowItWorksPage.css';

function HowItWorksPage() {
  const visibleSections = useScrollAnimation();

  const steps = [
    {
      id: 'step1',
      icon: '👤',
      title: 'Create Your Profile',
      description: 'Sign up for free and create your profile. Add your skills you can teach and skills you want to learn.',
      details: [
        'Quick and easy registration',
        'Add multiple skills with proficiency levels',
        'Set your location for nearby connections',
        'Upload a profile picture'
      ]
    },
    {
      id: 'step2',
      icon: '🔍',
      title: 'Search & Connect',
      description: 'Find people nearby who have the skills you want to learn or who want to learn what you can teach.',
      details: [
        'Search by skill name',
        'Filter by distance radius',
        'View detailed profiles',
        'See ratings and reviews'
      ]
    },
    {
      id: 'step3',
      icon: '📅',
      title: 'Book Sessions',
      description: 'Schedule learning sessions with others. Choose a convenient date and time for both parties.',
      details: [
        'Easy booking with calendar',
        'Select preferred time slots',
        'Add session notes',
        'Confirm or manage bookings'
      ]
    },
    {
      id: 'step4',
      icon: '💬',
      title: 'Exchange Knowledge',
      description: 'Meet up (virtually or in-person) and exchange skills. Learn something new while teaching others.',
      details: [
        'One-on-one sessions',
        'Flexible duration options',
        'Real-time availability',
        'Safe and secure platform'
      ]
    },
    {
      id: 'step5',
      icon: '⭐',
      title: 'Build Reputation',
      description: 'Leave reviews and earn credits. Build your reputation as a trusted skill exchanger in the community.',
      details: [
        'Rate your experiences',
        'Earn credits for each session',
        'Level up your reputation',
        'Get recognized as an expert'
      ]
    },
    {
      id: 'step6',
      icon: '🚀',
      title: 'Join Projects',
      description: 'Collaborate on exciting projects with like-minded people. Apply your skills in real-world scenarios.',
      details: [
        'Browse active projects',
        'Create your own projects',
        'Find team members',
        'Build your portfolio'
      ]
    }
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hero-section" data-section="hero">
        <div className={`hero-content ${visibleSections.has('hero') ? 'fade-in-down' : ''}`}>
          <h1>How SkilLink Works</h1>
          <p className="hero-subtitle">
            Connect, Learn, and Grow Together
          </p>
          <div className="hero-description">
            SkilLink is a platform where you can exchange skills with others in your community. 
            Learn what you want while teaching what you know - all for free!
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step-card ${index % 2 === 0 ? 'left' : 'right'}`}
            data-section={step.id}
          >
            <div className={`step-number ${visibleSections.has(step.id) ? 'scale-in' : ''}`}>
              <span className="number">{index + 1}</span>
            </div>

            <div className={`step-content ${visibleSections.has(step.id) ? 'fade-in-up' : ''}`}>
              <div className="step-icon-wrapper">
                <span className="step-icon">{step.icon}</span>
              </div>

              <h2 className="step-title">{step.title}</h2>
              <p className="step-description">{step.description}</p>

              <ul className="step-details">
                {step.details.map((detail, idx) => (
                  <li key={idx} className={visibleSections.has(step.id) ? 'slide-in-left' : ''} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <span className="check-icon">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="features-section" data-section="features">
        <h2 className={visibleSections.has('features') ? 'fade-in-down' : ''}>
          Why Choose SkilLink?
        </h2>
        
        <div className="features-grid">
          <div className={`feature-card ${visibleSections.has('features') ? 'fade-in-up' : ''}`} style={{ animationDelay: '0s' }}>
            <div className="feature-icon">🆓</div>
            <h3>Completely Free</h3>
            <p>No subscription fees or hidden charges. Exchange skills freely!</p>
          </div>

          <div className={`feature-card ${visibleSections.has('features') ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon">📍</div>
            <h3>Local Community</h3>
            <p>Find and connect with skilled people in your area.</p>
          </div>

          <div className={`feature-card ${visibleSections.has('features') ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon">🔒</div>
            <h3>Safe & Secure</h3>
            <p>Verified profiles and ratings system for trusted connections.</p>
          </div>

          <div className={`feature-card ${visibleSections.has('features') ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon">🎯</div>
            <h3>Flexible Learning</h3>
            <p>Learn at your own pace with personalized one-on-one sessions.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-section="cta">
        <div className={`cta-content ${visibleSections.has('cta') ? 'scale-in' : ''}`}>
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>Join thousands of learners exchanging skills every day!</p>
          
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg hover-scale">
              <span className="btn-icon">🚀</span>
              Sign Up Now
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg hover-scale">
              <span className="btn-icon">🔑</span>
              Login
            </Link>
          </div>

          <p className="cta-note">
            Already have an account? <Link to="/login" className="cta-link">Sign in here</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default HowItWorksPage;
