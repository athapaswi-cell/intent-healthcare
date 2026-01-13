import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
import { mockApiService } from '../services/mockDataService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification: string;
  email?: string;
  phone?: string;
  department?: string;
  experience_years?: number;
  consultation_fee?: number;
  availability?: string;
  languages: string[];
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try backend API first, fallback to mock data
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
          timeout: 3000
        });
        setDoctors(response.data);
      } catch (apiError) {
        console.log('Backend not available, using mock data');
        const mockData = await mockApiService.getDoctors();
        setDoctors(mockData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading doctors...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>👨‍⚕️ Doctors ({doctors.length})</h2>
      <div className="cards-grid">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="data-card doctor-card">
            <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
            <div className="card-details">
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Qualification:</strong> {doctor.qualification}</p>
              {doctor.department && <p><strong>Department:</strong> {doctor.department}</p>}
              {doctor.experience_years && <p><strong>Experience:</strong> {doctor.experience_years} years</p>}
              {doctor.consultation_fee && <p><strong>Consultation Fee:</strong> ${doctor.consultation_fee}</p>}
              {doctor.availability && (
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-badge ${doctor.availability.toLowerCase()}`}>
                    {doctor.availability}
                  </span>
                </p>
              )}
              {doctor.phone && <p><strong>Phone:</strong> {doctor.phone}</p>}
              {doctor.email && <p><strong>Email:</strong> {doctor.email}</p>}
              {doctor.languages.length > 0 && (
                <p><strong>Languages:</strong> {doctor.languages.join(', ')}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


