import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
import HospitalDetail from './HospitalDetail';
import { mockApiService } from '../services/mockDataService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  emergency_phone?: string;
  hospital_type?: string;
  total_beds?: number;
  icu_beds?: number;
  specialties: string[];
  facilities: string[];
  operating_hours?: string;
}

interface HospitalListProps {
  onSelectHospital?: (hospitalId: string) => void;
}

export default function HospitalList({ onSelectHospital }: HospitalListProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      setHospitals(response.data);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Backend server is not running. Please start the backend server on port 8000.');
      } else {
        setError(err.message || 'Failed to fetch hospitals');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = (hospitalId: string) => {
    if (onSelectHospital) {
      onSelectHospital(hospitalId);
    }
  };

  if (loading) return <div className="loading">Loading hospitals...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>🏥 Hospitals ({hospitals.length})</h2>
      <div className="cards-grid">
        {hospitals.map((hospital) => (
          <div 
            key={hospital.id} 
            className="data-card hospital-card clickable-card"
            onClick={() => handleHospitalClick(hospital.id)}
          >
            <h3>{hospital.name}</h3>
            <div className="card-details">
              <p><strong>Address:</strong> {hospital.address}, {hospital.city}, {hospital.state}</p>
              {hospital.hospital_type && <p><strong>Type:</strong> {hospital.hospital_type}</p>}
              {hospital.phone && <p><strong>Phone:</strong> {hospital.phone}</p>}
              {hospital.emergency_phone && (
                <p><strong>Emergency:</strong> <span className="emergency-phone">{hospital.emergency_phone}</span></p>
              )}
              {hospital.total_beds && <p><strong>Total Beds:</strong> {hospital.total_beds}</p>}
              {hospital.icu_beds && <p><strong>ICU Beds:</strong> {hospital.icu_beds}</p>}
              {hospital.operating_hours && <p><strong>Hours:</strong> {hospital.operating_hours}</p>}
              {hospital.specialties.length > 0 && (
                <div>
                  <strong>Specialties:</strong>
                  <div className="tags">
                    {hospital.specialties.map((spec, idx) => (
                      <span key={idx} className="tag">{spec}</span>
                    ))}
                  </div>
                </div>
              )}
              {hospital.facilities.length > 0 && (
                <div>
                  <strong>Facilities:</strong>
                  <div className="tags">
                    {hospital.facilities.map((facility, idx) => (
                      <span key={idx} className="tag facility-tag">{facility}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="card-footer">
              <span className="view-details">Click to view details →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

