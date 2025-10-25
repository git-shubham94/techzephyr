import React, { createContext, useState, useContext, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('accessibility');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setVoiceEnabled(prefs.voiceEnabled || false);
      setHighContrast(prefs.highContrast || false);
      setFontSize(prefs.fontSize || 'medium');
      setLanguage(prefs.language || 'en');
      
      // Apply saved settings
      if (prefs.highContrast) {
        document.body.classList.add('high-contrast');
      }
      if (prefs.fontSize) {
        document.body.setAttribute('data-font-size', prefs.fontSize);
      }
    }
  }, []);

  // Save preferences
  const savePreferences = (prefs) => {
    localStorage.setItem('accessibility', JSON.stringify(prefs));
  };

  const toggleVoice = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    savePreferences({ voiceEnabled: newValue, highContrast, fontSize, language });
    speak(newValue ? 'Voice navigation enabled' : 'Voice navigation disabled');
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    document.body.classList.toggle('high-contrast', newValue);
    savePreferences({ voiceEnabled, highContrast: newValue, fontSize, language });
    speak(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    document.body.setAttribute('data-font-size', size);
    savePreferences({ voiceEnabled, highContrast, fontSize: size, language });
    speak(`Font size changed to ${size}`);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    savePreferences({ voiceEnabled, highContrast, fontSize, language: lang });
    speak(`Language changed to ${getLanguageName(lang)}`);
  };

  const getLanguageName = (code) => {
    const names = {
      en: 'English',
      hi: 'Hindi',
      es: 'Spanish',
      fr: 'French',
      de: 'German'
    };
    return names[code] || code;
  };

  // Text-to-Speech function
  const speak = (text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        voiceEnabled,
        highContrast,
        fontSize,
        language,
        toggleVoice,
        toggleHighContrast,
        changeFontSize,
        changeLanguage,
        speak
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
