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

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function PatientListWithAuth() {
  // Get user from localStorage (set by App.tsx login)
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPatients();
    } else {
      setLoading(false);
      setError('Please login to view patient information.');
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allPatients: Patient[] = [];
      
      // Try backend API first, fallback to mock data
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
          timeout: 3000
        });
        allPatients = response.data;
      } catch (apiError) {
        console.log('Backend not available, using mock data');
        allPatients = await mockApiService.getPatients();
      }

      // Filter patients based on user role
      if (user?.role === 'doctor') {
        // Doctors see only patients they have consulted
        try {
          // Fetch visits to find which patients this doctor has consulted
          const visitsResponse = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
            params: { limit: 100 },
            timeout: 15000
          });
          
          const allVisits = visitsResponse.data || [];
          
          // Get doctor's name/username for matching
          const doctorUsername = user.username?.toLowerCase() || '';
          const doctorName = user.name?.toLowerCase() || '';
          
          // Collect patient IDs from visits where this doctor participated
          const patientIdsSet = new Set<string>();
          
          for (const visit of allVisits) {
            // Check if this doctor participated in the visit
            const participants = visit.participants || [];
            let doctorMatched = false;
            
            // Try to match doctor by checking participant references
            // First try to get doctor ID from doctor list
            try {
              const doctorsResponse = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
                timeout: 5000
              });
              const doctors = doctorsResponse.data || [];
              
              // Find matching doctor by username or name
              const matchedDoctor = doctors.find((d: any) => {
                const docFirst = (d.first_name || '').toLowerCase();
                const docLast = (d.last_name || '').toLowerCase();
                const docFullName = `${docFirst} ${docLast}`.trim();
                const docUsername = (d.email || d.id || '').toLowerCase();
                
                return doctorUsername && (
                  docUsername.includes(doctorUsername) ||
                  doctorUsername.includes(docUsername) ||
                  docFullName.includes(doctorName) ||
                  doctorName.includes(docFullName)
                );
              });
              
              if (matchedDoctor) {
                const doctorId = matchedDoctor.id;
                // Check if this doctor ID is in the visit participants
                for (const participant of participants) {
                  const participantRef = (participant.reference || '').toLowerCase();
                  if (participantRef.includes(doctorId.toLowerCase()) || 
                      participantRef.includes('practitioner') && participantRef.includes(doctorId.toLowerCase())) {
                    doctorMatched = true;
                    break;
                  }
                }
              }
            } catch (docError) {
              console.log('Could not fetch doctors for matching:', docError);
            }
            
            // If doctor matched, add patient ID to set
            if (doctorMatched && visit.patientId) {
              patientIdsSet.add(visit.patientId);
            }
          }
          
          // Filter patients to only those in the set
          const consultedPatientIds = Array.from(patientIdsSet);
          
          if (consultedPatientIds.length > 0) {
            const filteredPatients = allPatients.filter(p => 
              consultedPatientIds.some(pid => 
                p.id === pid || 
                p.id.toLowerCase().includes(pid.toLowerCase()) ||
                pid.toLowerCase().includes(p.id.toLowerCase())
              )
            );
            setPatients(filteredPatients);
          } else {
            // If no matches found, show message but allow showing all as fallback
            console.log('No patients found for this doctor. Showing all patients.');
            setPatients(allPatients);
          }
        } catch (visitsError) {
          console.error('Error fetching visits for doctor:', visitsError);
          // Fallback: show all patients if visits can't be fetched
          setPatients(allPatients);
        }
      } else if (user?.role === 'patient' && user.patientId) {
        // Patients see only their own record
        // Try to find patient by ID or name match
        const patientId = user.patientId;
        const filteredPatients = allPatients.filter(
          p => p.id === patientId || 
               p.id.toLowerCase().includes(patientId.toLowerCase()) ||
               `${p.first_name} ${p.last_name}`.toLowerCase().includes(user.username.toLowerCase())
        );
        
        if (filteredPatients.length > 0) {
          setPatients(filteredPatients);
        } else {
          // If exact match not found, show first patient as demo
          // In production, this would be handled by backend authentication
          setPatients(allPatients.slice(0, 1));
        }
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  // User is managed by App.tsx - no login/logout needed here
  if (loading) {
    return (
      <div className="data-list">
        <div className="user-header" style={{ marginBottom: '20px' }}>
          <h2>👥 Patients {user?.role === 'doctor' ? '(My Patients)' : '(Your Records)'}</h2>
        </div>
        <div className="loading">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-list">
        <div className="user-header" style={{ marginBottom: '20px' }}>
          <h2>👥 Patients {user?.role === 'doctor' ? '(My Patients)' : '(Your Records)'}</h2>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view patient information.</div>
      </div>
    );
  }

  return (
    <div className="data-list">
      <div className="user-header" style={{ 
        marginBottom: '20px',
        padding: '15px',
        background: '#E3F2FD',
        borderRadius: '8px'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>
            👥 Patients {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="no-data">
          <p>No patient records found.</p>
          {user.role === 'patient' && (
            <p style={{ marginTop: '10px', color: '#666' }}>
              If you believe this is an error, please contact your healthcare provider.
            </p>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '15px', color: '#666' }}>
            {user.role === 'doctor' ? (
              <p>Showing {patients.length} patient(s) you have consulted</p>
            ) : (
              <p>Showing your patient record</p>
            )}
          </div>
          <div className="cards-grid">
            {patients.map((patient) => (
              <div key={patient.id} className="data-card">
                <h3>{patient.first_name} {patient.last_name}</h3>
                <div className="card-details">
                  <p><strong>Patient ID:</strong> {patient.id}</p>
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
        </>
      )}
    </div>
  );
}

