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

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableDoctors();
  }, []);

  const fetchAvailableDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try backend API first, fallback to mock data
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
          timeout: 3000
        });
        // Filter doctors by availability status - only show doctors with "Available" status
        const availableDoctors = response.data.filter((doctor: Doctor) => {
          const availability = doctor.availability?.toLowerCase().trim() || '';
          // Match "available" exactly (case-insensitive), or statuses like "available now"
          // Exclude "not available" or "unavailable"
          return availability === 'available' || 
                 (availability.startsWith('available') && !availability.includes('not') && !availability.includes('unavailable'));
        });
        setDoctors(availableDoctors);
      } catch (apiError) {
        console.log('Backend not available, using mock data');
        const mockData = await mockApiService.getDoctors();
        // Filter mock data by availability
        const availableDoctors = mockData.filter((doctor: Doctor) => {
          const availability = doctor.availability?.toLowerCase().trim() || '';
          // Match "available" exactly (case-insensitive), or statuses like "available now"
          // Exclude "not available" or "unavailable"
          return availability === 'available' || 
                 (availability.startsWith('available') && !availability.includes('not') && !availability.includes('unavailable'));
        });
        setDoctors(availableDoctors);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available doctors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading available doctors...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>🩺 Available Doctors ({doctors.length})</h2>
      {doctors.length === 0 ? (
        <div className="no-data">
          <p>No available doctors found at this time.</p>
        </div>
      ) : (
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
                    <span className={`status-badge ${doctor.availability.toLowerCase().replace(' ', '-')}`}>
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
      )}
    </div>
  );
}

