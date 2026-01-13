import React, { useState, useEffect, useRef } from 'react';
import './VoiceInterface.css';

interface VoiceInterfaceProps {
  onVoiceCommand: (command: string, transcript: string) => void;
  onVoiceInput: (input: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceCommand,
  onVoiceInput,
  isListening,
  setIsListening
}) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setError(null);
        setTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.trim());
          onVoiceInput(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Voice commands mapping
    const commands = [
      { keywords: ['emergency', 'help', 'urgent', 'critical'], action: 'emergency' },
      { keywords: ['schedule', 'appointment', 'book', 'visit'], action: 'schedule_appointment' },
      { keywords: ['symptoms', 'feeling', 'pain', 'sick'], action: 'report_symptoms' },
      { keywords: ['prescription', 'refill', 'medication', 'medicine'], action: 'prescription_refill' },
      { keywords: ['telehealth', 'virtual', 'video call', 'consultation'], action: 'telehealth' },
      { keywords: ['records', 'history', 'medical records'], action: 'view_records' },
      { keywords: ['lab results', 'test results', 'blood work'], action: 'lab_results' },
      { keywords: ['doctors', 'physician', 'specialist'], action: 'view_doctors' },
      { keywords: ['hospitals', 'facilities', 'clinics'], action: 'view_hospitals' },
      { keywords: ['beds', 'bed availability', 'capacity', 'occupancy'], action: 'view_beds' },
      { keywords: ['patients', 'patient list'], action: 'view_patients' },
      { keywords: ['dashboard', 'home', 'main'], action: 'dashboard' },
      { keywords: ['stop listening', 'stop', 'cancel'], action: 'stop_listening' }
    ];

    for (const command of commands) {
      if (command.keywords.some(keyword => lowerTranscript.includes(keyword))) {
        onVoiceCommand(command.action, transcript);
        speak(`Processing ${command.action.replace('_', ' ')} request`);
        return;
      }
    }

    // If no specific command found, treat as general input
    onVoiceCommand('general_query', transcript);
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setError(null);
      recognitionRef.current.start();
      speak("I'm listening. How can I help you?");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      speak("Voice recognition stopped");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-interface unsupported">
        <p>⚠️ Voice recognition is not supported in this browser</p>
        <p>Please use Chrome, Edge, or Safari for voice features</p>
      </div>
    );
  }

  return (
    <div className="voice-interface">
      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Stop listening' : 'Start voice recognition'}
        >
          {isListening ? '🔴' : '🎤'}
          <span className="voice-status">
            {isListening ? 'Listening...' : 'Click to speak'}
          </span>
        </button>
        
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse"></div>
            <span>Listening for voice commands...</span>
          </div>
        )}
      </div>

      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> "{transcript}"
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="voice-commands-help">
        <details>
          <summary>📋 Voice Commands</summary>
          <div className="commands-grid">
            <div className="command-group">
              <h4>🚨 Emergency</h4>
              <ul>
                <li>"Emergency help"</li>
                <li>"I need urgent care"</li>
              </ul>
            </div>
            <div className="command-group">
              <h4>📅 Appointments</h4>
              <ul>
                <li>"Schedule appointment"</li>
                <li>"Book a visit"</li>
                <li>"Request telehealth"</li>
              </ul>
            </div>
            <div className="command-group">
              <h4>🏥 Navigation</h4>
              <ul>
                <li>"Show doctors"</li>
                <li>"View hospitals"</li>
                <li>"Hospital beds" / "Bed availability"</li>
                <li>"Go to dashboard"</li>
              </ul>
            </div>
            <div className="command-group">
              <h4>💊 Medical</h4>
              <ul>
                <li>"Report symptoms"</li>
                <li>"Refill prescription"</li>
                <li>"View medical records"</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default VoiceInterface;