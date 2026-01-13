import React, { useState, useRef } from 'react';
import './PrescriptionScanner.css';
import VoiceButton from './VoiceButton';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionResult {
  doctor_name: string;
  patient_name: string;
  date: string;
  medications: Medication[];
  pharmacy_instructions?: string;
}

export default function PrescriptionScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PrescriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setError(null);
        setScanResult(null);
      } else {
        setError('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
      setScanResult(null);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const simulatePrescriptionScan = async (): Promise<PrescriptionResult> => {
    // Simulate AI/OCR processing with realistic prescription data
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResults: PrescriptionResult[] = [
      {
        doctor_name: "Dr. Sarah Johnson, MD",
        patient_name: "John Doe",
        date: "2024-01-15",
        medications: [
          {
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "30 days",
            instructions: "Take with or without food. Monitor blood pressure."
          },
          {
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "90 days",
            instructions: "Take with meals to reduce stomach upset."
          }
        ],
        pharmacy_instructions: "Generic substitution permitted. Patient counseling required for new medications."
      },
      {
        doctor_name: "Dr. Michael Chen, MD",
        patient_name: "Maria Garcia",
        date: "2024-01-14",
        medications: [
          {
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "Three times daily",
            duration: "10 days",
            instructions: "Take with food. Complete full course even if feeling better."
          },
          {
            name: "Ibuprofen",
            dosage: "400mg",
            frequency: "As needed",
            duration: "7 days",
            instructions: "Take with food. Do not exceed 3 doses per day."
          }
        ],
        pharmacy_instructions: "Verify patient allergies before dispensing. Counsel on antibiotic completion."
      },
      {
        doctor_name: "Dr. Emily Rodriguez, MD",
        patient_name: "William Smith",
        date: "2024-01-13",
        medications: [
          {
            name: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily at bedtime",
            duration: "90 days",
            instructions: "Take at the same time each evening. Monitor liver function."
          }
        ],
        pharmacy_instructions: "Patient education on statin therapy required."
      }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const handleScanPrescription = async () => {
    if (!selectedFile) {
      setError('Please select a prescription image first');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // In a real implementation, you would send the image to an AI/OCR service
      // For now, we'll simulate the process
      const result = await simulatePrescriptionScan();
      setScanResult(result);
    } catch (err: any) {
      setError('Failed to scan prescription. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVoiceUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="prescription-scanner">
      <div className="scanner-header">
        <h2>📷 Prescription Photo Scanner</h2>
        <p>Upload a photo of your prescription to extract medication information</p>
      </div>

      {/* Upload Area */}
      <div className="upload-section">
        <div
          className={`upload-area ${selectedFile ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <div className="image-preview">
              <img src={previewUrl} alt="Prescription preview" />
              <div className="image-overlay">
                <span>Click to change image</span>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📷</div>
              <h3>Upload Prescription Photo</h3>
              <p>Drag and drop an image here, or click to select</p>
              <p className="file-types">Supports: JPG, PNG, HEIC, PDF</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="file-input"
        />

        <div className="upload-actions">
          <VoiceButton
            onClick={handleVoiceUpload}
            className="btn-secondary"
            voiceCommand="Opening file selector for prescription upload"
            ariaLabel="Upload prescription photo"
          >
            📁 Select File
          </VoiceButton>

          {selectedFile && (
            <>
              <VoiceButton
                onClick={handleScanPrescription}
                disabled={isScanning}
                className="btn-primary"
                voiceCommand={isScanning ? "Scanning prescription in progress" : "Starting prescription scan"}
                ariaLabel="Scan prescription"
              >
                {isScanning ? '🔄 Scanning...' : '🔍 Scan Prescription'}
              </VoiceButton>

              <VoiceButton
                onClick={handleClear}
                className="btn-secondary"
                voiceCommand="Clearing prescription scanner"
                ariaLabel="Clear scanner"
              >
                🗑️ Clear
              </VoiceButton>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <div className="scanning-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>🤖 AI is analyzing your prescription...</p>
          <div className="scanning-steps">
            <div className="step active">📷 Image Processing</div>
            <div className="step active">🔍 Text Recognition</div>
            <div className="step active">💊 Medication Extraction</div>
            <div className="step">✅ Results Ready</div>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="scan-results">
          <div className="results-header">
            <h3>✅ Prescription Scan Results</h3>
            <button 
              onClick={() => speak(`Prescription from ${scanResult.doctor_name} for ${scanResult.patient_name} scanned successfully`)}
              className="speak-results-btn"
              title="Read results aloud"
            >
              🔊
            </button>
          </div>

          <div className="prescription-info">
            <div className="info-grid">
              <div className="info-item">
                <strong>Doctor:</strong> {scanResult.doctor_name}
              </div>
              <div className="info-item">
                <strong>Patient:</strong> {scanResult.patient_name}
              </div>
              <div className="info-item">
                <strong>Date:</strong> {new Date(scanResult.date).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="medications-section">
            <h4>💊 Prescribed Medications</h4>
            <div className="medications-list">
              {scanResult.medications.map((medication, index) => (
                <div key={index} className="medication-card">
                  <div className="medication-header">
                    <h5>{medication.name}</h5>
                    <span className="dosage-badge">{medication.dosage}</span>
                  </div>
                  <div className="medication-details">
                    <div className="detail-row">
                      <strong>Frequency:</strong> {medication.frequency}
                    </div>
                    <div className="detail-row">
                      <strong>Duration:</strong> {medication.duration}
                    </div>
                    <div className="detail-row">
                      <strong>Instructions:</strong> {medication.instructions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {scanResult.pharmacy_instructions && (
            <div className="pharmacy-instructions">
              <h4>🏪 Pharmacy Instructions</h4>
              <p>{scanResult.pharmacy_instructions}</p>
            </div>
          )}

          <div className="results-actions">
            <VoiceButton
              onClick={() => console.log('Processing prescription...')}
              className="btn-success"
              voiceCommand="Processing prescription for fulfillment"
              ariaLabel="Process prescription"
            >
              ✅ Process Prescription
            </VoiceButton>

            <VoiceButton
              onClick={() => console.log('Saving to records...')}
              className="btn-primary"
              voiceCommand="Saving prescription to patient records"
              ariaLabel="Save to records"
            >
              💾 Save to Records
            </VoiceButton>

            <VoiceButton
              onClick={() => window.print()}
              className="btn-secondary"
              voiceCommand="Printing prescription details"
              ariaLabel="Print prescription"
            >
              🖨️ Print
            </VoiceButton>
          </div>
        </div>
      )}
    </div>
  );
}