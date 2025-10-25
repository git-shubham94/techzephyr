import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './AccessibilityPanel.css';

function AccessibilityPanel() {
  const {
    voiceEnabled,
    highContrast,
    fontSize,
    language,
    toggleVoice,
    toggleHighContrast,
    changeFontSize,
    changeLanguage,
    speak
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
    speak(isOpen ? 'Closing accessibility menu' : 'Opening accessibility menu');
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        className="accessibility-toggle"
        onClick={handleToggle}
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
        onMouseEnter={() => speak('Accessibility settings button')}
      >
        ♿
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="accessibility-panel" role="dialog" aria-label="Accessibility Settings">
          <div className="panel-header">
            <h2>♿ Accessibility Settings</h2>
            <button
              className="close-btn"
              onClick={handleToggle}
              aria-label="Close"
              onMouseEnter={() => speak('Close button')}
            >
              ✕
            </button>
          </div>

          <div className="panel-content">
            {/* Voice Navigation */}
            <div className="setting-item">
              <label onMouseEnter={() => speak('Voice Navigation toggle')}>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={toggleVoice}
                  aria-label="Toggle voice navigation"
                />
                <span className="setting-icon">🔊</span>
                <span className="setting-label">Voice Navigation</span>
              </label>
              <p className="setting-description">
                Enable text-to-speech for screen reading
              </p>
            </div>

            {/* High Contrast Mode */}
            <div className="setting-item">
              <label onMouseEnter={() => speak('High contrast mode toggle')}>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={toggleHighContrast}
                  aria-label="Toggle high contrast mode"
                />
                <span className="setting-icon">🎨</span>
                <span className="setting-label">High Contrast Mode</span>
              </label>
              <p className="setting-description">
                Increase color contrast for better visibility
              </p>
            </div>

            {/* Font Size Control */}
            <div className="setting-item">
              <label className="setting-label" onMouseEnter={() => speak('Font size control')}>
                <span className="setting-icon">🔤</span>
                Font Size
              </label>
              <div className="font-size-buttons">
                <button
                  className={fontSize === 'small' ? 'active' : ''}
                  onClick={() => changeFontSize('small')}
                  onMouseEnter={() => speak('Small font size')}
                  aria-label="Small font size"
                >
                  A
                </button>
                <button
                  className={fontSize === 'medium' ? 'active' : ''}
                  onClick={() => changeFontSize('medium')}
                  onMouseEnter={() => speak('Medium font size')}
                  aria-label="Medium font size"
                >
                  A
                </button>
                <button
                  className={fontSize === 'large' ? 'active' : ''}
                  onClick={() => changeFontSize('large')}
                  onMouseEnter={() => speak('Large font size')}
                  aria-label="Large font size"
                >
                  A
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="setting-item">
              <label className="setting-label" onMouseEnter={() => speak('Language selection')}>
                <span className="setting-icon">🌐</span>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                onMouseEnter={() => speak('Language dropdown')}
                aria-label="Select language"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="setting-item">
              <details>
                <summary className="setting-label" onMouseEnter={() => speak('Keyboard shortcuts information')}>
                  <span className="setting-icon">⌨️</span>
                  Keyboard Shortcuts
                </summary>
                <ul className="shortcuts-list">
                  <li>Alt + A - Open Accessibility</li>
                  <li>Alt + H - Go to Home</li>
                  <li>Alt + D - Go to Dashboard</li>
                  <li>Tab - Navigate forward</li>
                  <li>Shift + Tab - Navigate backward</li>
                  <li>Enter - Activate button or link</li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AccessibilityPanel;
