import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
import { mockApiService } from '../services/mockDataService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  blood_type?: string;
  allergies: string[];
  medical_history: string[];
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try backend API first, fallback to mock data
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
          timeout: 3000
        });
        setPatients(response.data);
      } catch (apiError) {
        console.log('Backend not available, using mock data');
        const mockData = await mockApiService.getPatients();
        setPatients(mockData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading patients...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>👥 Patients ({patients.length})</h2>
      <div className="cards-grid">
        {patients.map((patient) => (
          <div key={patient.id} className="data-card">
            <h3>{patient.first_name} {patient.last_name}</h3>
            <div className="card-details">
              <p><strong>DOB:</strong> {patient.date_of_birth}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              {patient.blood_type && <p><strong>Blood Type:</strong> {patient.blood_type}</p>}
              {patient.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
              {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
              {patient.allergies.length > 0 && (
                <p><strong>Allergies:</strong> {patient.allergies.join(', ')}</p>
              )}
              {patient.medical_history.length > 0 && (
                <p><strong>Medical History:</strong> {patient.medical_history.join(', ')}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


