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

interface Specialization {
  name: string;
  doctorCount: number;
  doctors: Doctor[];
}

export default function DoctorSpecializations() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allDoctors: Doctor[] = [];
      
      // Try backend API first, fallback to mock data
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
          timeout: 3000
        });
        allDoctors = response.data;
      } catch (apiError) {
        console.log('Backend not available, using mock data');
        allDoctors = await mockApiService.getDoctors();
      }

      // Group doctors by specialization
      const specializationMap = new Map<string, Doctor[]>();
      
      allDoctors.forEach((doctor) => {
        const spec = doctor.specialization || 'General Practice';
        if (!specializationMap.has(spec)) {
          specializationMap.set(spec, []);
        }
        specializationMap.get(spec)!.push(doctor);
      });

      // Convert map to array and sort by doctor count (descending)
      const specs: Specialization[] = Array.from(specializationMap.entries())
        .map(([name, doctors]) => ({
          name,
          doctorCount: doctors.length,
          doctors
        }))
        .sort((a, b) => b.doctorCount - a.doctorCount);

      setSpecializations(specs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch specializations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading specializations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const selectedSpec = selectedSpecialization 
    ? specializations.find(s => s.name === selectedSpecialization)
    : null;

  return (
    <div className="data-list">
      <h2>🩺 Doctor Specializations ({specializations.length})</h2>
      
      {specializations.length === 0 ? (
        <div className="no-data">
          <p>No specializations found.</p>
        </div>
      ) : (
        <>
          <div className="specializations-grid">
            {specializations.map((spec) => (
              <div 
                key={spec.name} 
                className={`data-card specialization-card ${selectedSpecialization === spec.name ? 'active' : ''}`}
                onClick={() => setSelectedSpecialization(selectedSpecialization === spec.name ? null : spec.name)}
              >
                <h3>{spec.name}</h3>
                <div className="card-details">
                  <p><strong>{spec.doctorCount}</strong> {spec.doctorCount === 1 ? 'Doctor' : 'Doctors'}</p>
                  {selectedSpecialization === spec.name && (
                    <div className="specialization-doctors">
                      <h4>Doctors in this specialization:</h4>
                      <ul>
                        {spec.doctors.map((doctor) => (
                          <li key={doctor.id}>
                            <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>
                            {doctor.qualification && <span> - {doctor.qualification}</span>}
                            {doctor.department && <span> ({doctor.department})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


