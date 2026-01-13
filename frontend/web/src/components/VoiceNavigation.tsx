import React from 'react';
import './VoiceNavigation.css';

interface VoiceNavigationProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  onNavigate,
  currentSection
}) => {
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', voiceCommand: 'Navigating to dashboard' },
    { id: 'patients', label: 'Patients', icon: '👤', voiceCommand: 'Opening patient management' },
    { id: 'doctors', label: 'Doctors', icon: '🩺', voiceCommand: 'Viewing doctor directory' },
    { id: 'hospitals', label: 'Hospitals', icon: '🏥', voiceCommand: 'Showing hospital facilities' },
    { id: 'appointments', label: 'Appointments', icon: '📅', voiceCommand: 'Opening appointment scheduler' },
    { id: 'emergency', label: 'Emergency', icon: '🚨', voiceCommand: 'Activating emergency services' }
  ];

  const handleNavigation = (item: any) => {
    onNavigate(item.id);
    speak(item.voiceCommand);
  };

  return (
    <div className="voice-navigation">
      <div className="voice-nav-header">
        <h3>🎤 Voice Navigation</h3>
        <p>Click or say commands to navigate</p>
      </div>
      
      <div className="voice-nav-grid">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`voice-nav-item ${currentSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
            aria-label={`Navigate to ${item.label}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="voice-indicator">🎤</span>
          </button>
        ))}
      </div>
      
      <div className="voice-nav-help">
        <details>
          <summary>💡 Voice Commands</summary>
          <div className="voice-commands">
            <p><strong>Say:</strong></p>
            <ul>
              <li>"Go to dashboard" or "Show dashboard"</li>
              <li>"Open patients" or "View patients"</li>
              <li>"Show doctors" or "Doctor directory"</li>
              <li>"View hospitals" or "Hospital facilities"</li>
              <li>"Schedule appointment" or "Book appointment"</li>
              <li>"Emergency help" or "Call emergency"</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default VoiceNavigation;