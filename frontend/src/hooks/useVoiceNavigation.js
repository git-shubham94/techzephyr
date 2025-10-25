import { useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const useVoiceNavigation = (pageName) => {
  const { speak, voiceEnabled } = useAccessibility();

  // Auto-announce page on load
  useEffect(() => {
    if (voiceEnabled && pageName) {
      speak(`${pageName} page loaded`);
    }
  }, [voiceEnabled, pageName]);

  // Helper function for hover events
  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  return { speak, voiceEnabled, handleVoiceHover };
};
