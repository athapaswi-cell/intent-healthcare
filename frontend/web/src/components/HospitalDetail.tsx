import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
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

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification: string;
  phone?: string;
  email?: string;
  department?: string;
  availability?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
}

interface BedData {
  id: string;
  hospital_id: string;
  hospital_name: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  icu_beds: number;
  occupied_icu: number;
  available_icu: number;
  emergency_beds: number;
  available_emergency: number;
  surgery_rooms: number;
  available_surgery: number;
  occupancy_rate: number;
  icu_occupancy_rate: number;
  last_updated: string;
  status: 'Normal' | 'High' | 'Critical';
}

interface HospitalDetailProps {
  hospitalId: string;
  onBack: () => void;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name?: string;
  encounter_type?: string;
  timestamp?: string;
  status?: string;
}

export default function HospitalDetail({ hospitalId, onBack }: HospitalDetailProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [bedData, setBedData] = useState<BedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'records'>('overview');

  useEffect(() => {
    fetchHospitalData();
  }, [hospitalId]);

  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      
      // Try backend API first, fallback to mock data
      try {
        // Fetch hospital details
        const hospitalRes = await axios.get(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}`, {
          timeout: 3000
        });
        setHospital(hospitalRes.data);

        // Fetch doctors for this hospital
        const doctorsRes = await axios.get(`${API_BASE_URL}/api/v1/doctors/?hospital_id=${hospitalId}`, {
          timeout: 3000
        });
        setDoctors(doctorsRes.data);

        // Fetch all patients
        const patientsRes = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
          timeout: 3000
        });
        setPatients(patientsRes.data);

        // Fetch bed availability data for this hospital
        try {
          const bedRes = await axios.get(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/beds`, {
            timeout: 3000
          });
          setBedData(bedRes.data);
        } catch {
          setBedData(null);
        }

        // Fetch medical records
        try {
          const recordsRes = await axios.get(`${API_BASE_URL}/api/v1/records/?hospital_id=${hospitalId}`, {
            timeout: 3000
          });
          setRecords(recordsRes.data || []);
        } catch {
          setRecords([]);
        }

      } catch (apiError) {
        console.log('Backend not available, using mock data');
        
        // Use mock data
        const mockHospital = await mockApiService.getHospital(hospitalId);
        setHospital(mockHospital);
        
        const mockDoctors = await mockApiService.getDoctors(hospitalId);
        setDoctors(mockDoctors);
        
        const mockPatients = await mockApiService.getPatients();
        setPatients(mockPatients);
        
        const mockBedData = await mockApiService.getHospitalBeds(hospitalId);
        setBedData(mockBedData);
        
        setRecords([]);
      }

    } catch (err: any) {
      console.error('Error fetching hospital data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return '#28a745';
      case 'High': return '#ffc107';
      case 'Critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate < 70) return '#28a745';
    if (rate < 85) return '#17a2b8';
    if (rate < 95) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return <div className="loading">Loading hospital details...</div>;
  }

  if (!hospital) {
    return <div className="error">Hospital not found</div>;
  }

  return (
    <div className="hospital-detail">
      <button onClick={onBack} className="back-button">← Back to Hospitals</button>
      
      <div className="hospital-header">
        <h1>🏥 {hospital.name}</h1>
        <div className="hospital-info">
          <p><strong>Address:</strong> {hospital.address}, {hospital.city}, {hospital.state}</p>
          {hospital.phone && <p><strong>Phone:</strong> {hospital.phone}</p>}
          {hospital.emergency_phone && (
            <p><strong>Emergency:</strong> <span className="emergency-phone">{hospital.emergency_phone}</span></p>
          )}
          {hospital.hospital_type && <p><strong>Type:</strong> {hospital.hospital_type}</p>}
          {hospital.total_beds && <p><strong>Total Beds:</strong> {hospital.total_beds}</p>}
          {hospital.icu_beds && <p><strong>ICU Beds:</strong> {hospital.icu_beds}</p>}
          {hospital.operating_hours && <p><strong>Operating Hours:</strong> {hospital.operating_hours}</p>}
        </div>
        
        {hospital.specialties.length > 0 && (
          <div className="specialties-section">
            <strong>Specialties:</strong>
            <div className="tags">
              {hospital.specialties.map((spec, idx) => (
                <span key={idx} className="tag">{spec}</span>
              ))}
            </div>
          </div>
        )}

        {hospital.facilities.length > 0 && (
          <div className="facilities-section">
            <strong>Facilities:</strong>
            <div className="tags">
              {hospital.facilities.map((facility, idx) => (
                <span key={idx} className="tag facility-tag">{facility}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🏥 Overview & Beds
        </button>
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          👨‍⚕️ Doctors ({doctors.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👥 Patients ({patients.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Medical Records ({records.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="hospital-overview">
            <div className="overview-grid">
              {/* Hospital Information */}
              <div className="overview-section">
                <h3>🏥 Hospital Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Type:</strong> {hospital.hospital_type || 'General Hospital'}
                  </div>
                  <div className="info-item">
                    <strong>Total Beds:</strong> {hospital.total_beds || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>ICU Beds:</strong> {hospital.icu_beds || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Operating Hours:</strong> {hospital.operating_hours || '24/7'}
                  </div>
                </div>
              </div>

              {/* Bed Availability */}
              {bedData && (
                <div className="overview-section bed-overview">
                  <h3>🛏️ Real-Time Bed Availability</h3>
                  <div className="bed-status-header">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(bedData.status) }}
                    >
                      {bedData.status} Capacity
                    </span>
                    <span className="last-updated">
                      Updated: {new Date(bedData.last_updated).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="bed-stats-grid">
                    <div className="bed-stat-card">
                      <h4>General Beds</h4>
                      <div className="stat-value">
                        {bedData.available_beds}/{bedData.total_beds}
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${bedData.occupancy_rate}%`,
                            backgroundColor: getOccupancyColor(bedData.occupancy_rate)
                          }}
                        ></div>
                      </div>
                      <div className="occupancy-text" style={{ color: getOccupancyColor(bedData.occupancy_rate) }}>
                        {bedData.occupancy_rate}% Occupied
                      </div>
                    </div>

                    <div className="bed-stat-card">
                      <h4>ICU Beds</h4>
                      <div className="stat-value">
                        {bedData.available_icu}/{bedData.icu_beds}
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${bedData.icu_occupancy_rate}%`,
                            backgroundColor: getOccupancyColor(bedData.icu_occupancy_rate)
                          }}
                        ></div>
                      </div>
                      <div className="occupancy-text" style={{ color: getOccupancyColor(bedData.icu_occupancy_rate) }}>
                        {bedData.icu_occupancy_rate}% Occupied
                      </div>
                    </div>

                    <div className="bed-stat-card">
                      <h4>Emergency Beds</h4>
                      <div className="stat-value">
                        {bedData.available_emergency}/{bedData.emergency_beds}
                      </div>
                      <div className="stat-detail">Available</div>
                    </div>

                    <div className="bed-stat-card">
                      <h4>Surgery Rooms</h4>
                      <div className="stat-value">
                        {bedData.available_surgery}/{bedData.surgery_rooms}
                      </div>
                      <div className="stat-detail">Available</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specialties and Facilities */}
              <div className="overview-section">
                <h3>🏥 Specialties & Facilities</h3>
                {hospital.specialties.length > 0 && (
                  <div className="specialty-list">
                    <h4>Medical Specialties:</h4>
                    <div className="tags">
                      {hospital.specialties.map((spec, idx) => (
                        <span key={idx} className="tag specialty-tag">{spec}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {hospital.facilities.length > 0 && (
                  <div className="facility-list">
                    <h4>Available Facilities:</h4>
                    <div className="tags">
                      {hospital.facilities.map((facility, idx) => (
                        <span key={idx} className="tag facility-tag">{facility}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="data-list">
            <h2>Doctors at {hospital.name}</h2>
            {doctors.length === 0 ? (
              <p className="no-data">No doctors found for this hospital</p>
            ) : (
              <div className="cards-grid">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="data-card doctor-card">
                    <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
                    <div className="card-details">
                      <p><strong>Specialization:</strong> {doctor.specialization}</p>
                      <p><strong>Qualification:</strong> {doctor.qualification}</p>
                      {doctor.department && <p><strong>Department:</strong> {doctor.department}</p>}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="data-list">
            <h2>Patients at {hospital.name}</h2>
            {patients.length === 0 ? (
              <p className="no-data">No patients found</p>
            ) : (
              <div className="cards-grid">
                {patients.map((patient) => (
                  <div key={patient.id} className="data-card">
                    <h3>{patient.first_name} {patient.last_name}</h3>
                    <div className="card-details">
                      <p><strong>DOB:</strong> {patient.date_of_birth}</p>
                      <p><strong>Gender:</strong> {patient.gender}</p>
                      {patient.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
                      {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="data-list">
            <h2>Medical Records at {hospital.name}</h2>
            {records.length === 0 ? (
              <div className="no-data">
                <p>No medical records found for this hospital</p>
                <p className="info-text">Records will appear here when patients have encounters at this hospital</p>
              </div>
            ) : (
              <div className="cards-grid">
                {records.map((record) => (
                  <div key={record.id} className="data-card">
                    <h3>Record #{record.id.substring(0, 8)}</h3>
                    <div className="card-details">
                      {record.patient_name && <p><strong>Patient:</strong> {record.patient_name}</p>}
                      {record.encounter_type && <p><strong>Type:</strong> {record.encounter_type}</p>}
                      {record.status && <p><strong>Status:</strong> {record.status}</p>}
                      {record.timestamp && <p><strong>Date:</strong> {new Date(record.timestamp).toLocaleString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

