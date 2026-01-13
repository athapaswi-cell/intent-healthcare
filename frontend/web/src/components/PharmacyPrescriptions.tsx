import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: string;
  category?: string;
}

interface Prescription {
  id: string;
  diagnosis: string;
  patientName?: string;
  doctorName?: string;
  date: string;
  medications: Medication[];
}

export default function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [recommendedMedications, setRecommendedMedications] = useState<Medication[] | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<Set<string>>(new Set());

  const handleGetMedications = async () => {
    if (!diagnosis.trim()) {
      setError('Please enter a diagnosis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRecommendedMedications(null);
      setSelectedMedications(new Set());

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/pharmacy/recommend-medications`,
        { diagnosis: diagnosis.trim() },
        {
          timeout: 10000
        }
      );

      const { medications } = response.data;
      
      if (medications && medications.length > 0) {
        setRecommendedMedications(medications);
      } else {
        setError('No medications found for this diagnosis. Please try a different diagnosis.');
      }
    } catch (err: any) {
      console.error('Error getting medications:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid diagnosis. Please enter a valid diagnosis.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Failed to get medication recommendations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationToggle = (medicationName: string) => {
    const newSelected = new Set(selectedMedications);
    if (newSelected.has(medicationName)) {
      newSelected.delete(medicationName);
    } else {
      newSelected.add(medicationName);
    }
    setSelectedMedications(newSelected);
  };

  const handleCreatePrescription = () => {
    if (selectedMedications.size === 0) {
      setError('Please select at least one medication');
      return;
    }

    if (!recommendedMedications) {
      return;
    }

    const selected = recommendedMedications.filter(med => selectedMedications.has(med.name));
    
    const newPrescription: Prescription = {
      id: `PRES-${Date.now()}`,
      diagnosis: diagnosis,
      date: new Date().toISOString().split('T')[0],
      medications: selected
    };

    setPrescriptions(prev => [newPrescription, ...prev]);
    setDiagnosis('');
    setRecommendedMedications(null);
    setSelectedMedications(new Set());
    setError(null);

    alert(`Prescription created with ${selected.length} medication(s)!`);
  };

  const commonDiagnoses = [
    'Hypertension',
    'Diabetes',
    'Infection',
    'Pain',
    'Asthma',
    'High Cholesterol',
    'Depression',
    'Acid Reflux',
    'Anxiety',
    'Allergy'
  ];

  return (
    <div className="data-list">
      <h2>💊 Prescriptions</h2>

      {/* Diagnosis Input Section */}
      <div className="prescription-input-section">
        <div className="input-card">
          <h3>📋 Get Medications by Diagnosis</h3>
          <p>Enter a diagnosis to get recommended medications</p>
          
          <div className="diagnosis-input-area">
            <div className="input-group">
              <label htmlFor="diagnosis">Diagnosis / Condition:</label>
              <input
                id="diagnosis"
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGetMedications()}
                placeholder="e.g., Hypertension, Diabetes, Infection, Pain..."
                className="diagnosis-input"
                disabled={loading}
              />
            </div>

            <div className="common-diagnoses">
              <label>Common Diagnoses:</label>
              <div className="diagnosis-tags">
                {commonDiagnoses.map((diag) => (
                  <button
                    key={diag}
                    type="button"
                    className="diagnosis-tag"
                    onClick={() => {
                      setDiagnosis(diag);
                      handleGetMedications();
                    }}
                    disabled={loading}
                  >
                    {diag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGetMedications}
              disabled={loading || !diagnosis.trim()}
              className="btn-primary get-medications-btn"
            >
              {loading ? 'Getting Medications...' : 'Get Medications'}
            </button>
          </div>

          {error && (
            <div className="error-message" style={{ 
              marginTop: '15px',
              padding: '12px',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '6px',
              color: '#856404'
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="loading-indicator" style={{ 
              marginTop: '15px',
              textAlign: 'center',
              color: '#1E88E5'
            }}>
              <div className="spinner"></div>
              <p>Getting medication recommendations...</p>
            </div>
          )}

          {recommendedMedications && recommendedMedications.length > 0 && (
            <div className="recommended-medications" style={{ marginTop: '20px' }}>
              <h4>✅ Recommended Medications for "{diagnosis}":</h4>
              <div className="medications-selection-list">
                {recommendedMedications.map((med, index) => (
                  <div 
                    key={index} 
                    className={`medication-selection-item ${selectedMedications.has(med.name) ? 'selected' : ''}`}
                    onClick={() => handleMedicationToggle(med.name)}
                  >
                    <div className="medication-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMedications.has(med.name)}
                        onChange={() => handleMedicationToggle(med.name)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <strong>{med.name}</strong>
                      {med.category && <span className="med-category">({med.category})</span>}
                    </div>
                    <div className="medication-details">
                      <p><strong>Dosage:</strong> {med.dosage}</p>
                      <p><strong>Frequency:</strong> {med.frequency}</p>
                      <p><strong>Duration:</strong> {med.duration}</p>
                      {med.quantity && <p><strong>Quantity:</strong> {med.quantity}</p>}
                      {med.instructions && <p className="instructions"><strong>Instructions:</strong> {med.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="prescription-actions" style={{ marginTop: '20px' }}>
                <button
                  onClick={handleCreatePrescription}
                  disabled={selectedMedications.size === 0}
                  className="btn-success create-prescription-btn"
                >
                  Create Prescription ({selectedMedications.size} selected)
                </button>
                <button
                  onClick={() => {
                    setRecommendedMedications(null);
                    setSelectedMedications(new Set());
                    setError(null);
                  }}
                  className="btn-secondary"
                  style={{ marginLeft: '10px' }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length > 0 && (
        <div className="prescriptions-list" style={{ marginTop: '30px' }}>
          <h3>Prescription History ({prescriptions.length})</h3>
          <div className="cards-grid">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="data-card prescription-card">
                <div className="prescription-header">
                  <h4>Prescription #{prescription.id}</h4>
                  <span className="prescription-date">{prescription.date}</span>
                </div>
                <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                {prescription.patientName && (
                  <p><strong>Patient:</strong> {prescription.patientName}</p>
                )}
                {prescription.doctorName && (
                  <p><strong>Doctor:</strong> {prescription.doctorName}</p>
                )}
                <div className="medications-section">
                  <strong>Medications ({prescription.medications.length}):</strong>
                  <ul className="medications-list">
                    {prescription.medications.map((med, index) => (
                      <li key={index} className="medication-item">
                        <strong>{med.name}</strong>
                        {med.category && <span className="med-category"> ({med.category})</span>}
                        {med.dosage && <span> - {med.dosage}</span>}
                        {med.frequency && <span> - {med.frequency}</span>}
                        {med.duration && <span> - {med.duration}</span>}
                        {med.quantity && <div>Quantity: {med.quantity}</div>}
                        {med.instructions && <div className="instructions">{med.instructions}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prescriptions.length === 0 && !loading && !recommendedMedications && (
        <div className="no-data" style={{ marginTop: '30px' }}>
          <p>Enter a diagnosis to get medication recommendations and create prescriptions.</p>
        </div>
      )}
    </div>
  );
}
