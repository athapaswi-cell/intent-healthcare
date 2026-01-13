import React from 'react';
import './VoiceButton.css';

interface VoiceButtonProps {
  onClick: () => void;
  onVoiceClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  voiceCommand?: string;
  ariaLabel?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onClick,
  onVoiceClick,
  children,
  disabled = false,
  className = '',
  voiceCommand,
  ariaLabel
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

  const handleClick = () => {
    onClick();
    if (voiceCommand) {
      speak(voiceCommand);
    }
  };

  const handleVoiceClick = () => {
    if (onVoiceClick) {
      onVoiceClick();
    } else {
      onClick();
    }
    if (voiceCommand) {
      speak(voiceCommand);
    }
  };

  return (
    <div className="voice-button-container">
      <button
        className={`voice-enabled-button ${className}`}
        onClick={handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {children}
      </button>
      {onVoiceClick && (
        <button
          className="voice-trigger-button"
          onClick={handleVoiceClick}
          disabled={disabled}
          title="Voice activate this action"
          aria-label={`Voice activate: ${ariaLabel || 'button'}`}
        >
          🎤
        </button>
      )}
    </div>
  );
};

export default VoiceButton;