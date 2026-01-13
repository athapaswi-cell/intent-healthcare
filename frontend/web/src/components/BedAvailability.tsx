import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BedAvailability.css';
import { mockApiService } from '../services/mockDataService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

interface BedSummary {
  summary: {
    total_hospitals: number;
    total_beds: number;
    total_available: number;
    total_occupied: number;
    overall_occupancy_rate: number;
    total_icu_beds: number;
    total_available_icu: number;
    icu_occupancy_rate: number;
  };
  alerts: {
    critical_hospitals: number;
    high_occupancy_hospitals: number;
    critical_hospital_names: string[];
    high_occupancy_hospital_names: string[];
  };
  detailed_data: BedData[];
}

export default function BedAvailability() {
  const [bedData, setBedData] = useState<BedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

  useEffect(() => {
    fetchBedData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchBedData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/hospitals/beds/summary`, {
        timeout: 10000
      });
      setBedData(response.data);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Backend server is not running. Please start the backend server on port 8000.');
      } else {
        setError(err.message || 'Failed to fetch bed availability data');
      }
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

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) return <div className="loading">Loading bed availability data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!bedData) return <div className="error">No bed data available</div>;

  const selectedHospitalData = selectedHospital 
    ? bedData.detailed_data.find(h => h.hospital_id === selectedHospital)
    : null;

  return (
    <div className="bed-availability">
      <div className="bed-header">
        <h2>🏥 Hospital Beds & Resources</h2>
        <button onClick={fetchBedData} className="refresh-btn" title="Refresh data">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Dashboard */}
      <div className="bed-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Hospitals</h3>
            <div className="summary-value">{bedData.summary.total_hospitals}</div>
          </div>
          <div className="summary-card">
            <h3>Total Beds</h3>
            <div className="summary-value">{bedData.summary.total_beds.toLocaleString()}</div>
            <div className="summary-detail">
              Available: {bedData.summary.total_available.toLocaleString()}
            </div>
          </div>
          <div className="summary-card">
            <h3>Overall Occupancy</h3>
            <div className="summary-value" style={{ color: getOccupancyColor(bedData.summary.overall_occupancy_rate) }}>
              {bedData.summary.overall_occupancy_rate}%
            </div>
          </div>
          <div className="summary-card">
            <h3>ICU Beds</h3>
            <div className="summary-value">{bedData.summary.total_icu_beds.toLocaleString()}</div>
            <div className="summary-detail">
              Available: {bedData.summary.total_available_icu.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(bedData.alerts.critical_hospitals > 0 || bedData.alerts.high_occupancy_hospitals > 0) && (
          <div className="alerts-section">
            <h3>🚨 Capacity Alerts</h3>
            {bedData.alerts.critical_hospitals > 0 && (
              <div className="alert critical-alert">
                <strong>Critical Capacity ({bedData.alerts.critical_hospitals} hospitals):</strong>
                <div className="hospital-list">
                  {bedData.alerts.critical_hospital_names.map((name, idx) => (
                    <span key={idx} className="hospital-tag critical">{name}</span>
                  ))}
                </div>
              </div>
            )}
            {bedData.alerts.high_occupancy_hospitals > 0 && (
              <div className="alert high-alert">
                <strong>High Occupancy ({bedData.alerts.high_occupancy_hospitals} hospitals):</strong>
                <div className="hospital-list">
                  {bedData.alerts.high_occupancy_hospital_names.map((name, idx) => (
                    <span key={idx} className="hospital-tag high">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hospital Details */}
      <div className="hospital-bed-data">
        <h3>Hospital Bed Details</h3>
        <div className="hospital-grid">
          {bedData.detailed_data.map((hospital) => (
            <div 
              key={hospital.hospital_id} 
              className={`hospital-bed-card ${selectedHospital === hospital.hospital_id ? 'selected' : ''}`}
              onClick={() => setSelectedHospital(
                selectedHospital === hospital.hospital_id ? null : hospital.hospital_id
              )}
            >
              <div className="hospital-header">
                <h4>{hospital.hospital_name}</h4>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(hospital.status) }}
                >
                  {hospital.status}
                </span>
              </div>
              
              <div className="bed-stats">
                <div className="stat-row">
                  <span className="stat-label">General Beds:</span>
                  <span className="stat-value">
                    {hospital.available_beds}/{hospital.total_beds}
                    <span className="occupancy-rate" style={{ color: getOccupancyColor(hospital.occupancy_rate) }}>
                      ({hospital.occupancy_rate}%)
                    </span>
                  </span>
                </div>
                
                <div className="stat-row">
                  <span className="stat-label">ICU Beds:</span>
                  <span className="stat-value">
                    {hospital.available_icu}/{hospital.icu_beds}
                    <span className="occupancy-rate" style={{ color: getOccupancyColor(hospital.icu_occupancy_rate) }}>
                      ({hospital.icu_occupancy_rate}%)
                    </span>
                  </span>
                </div>
                
                <div className="stat-row">
                  <span className="stat-label">Emergency:</span>
                  <span className="stat-value">{hospital.available_emergency}/{hospital.emergency_beds}</span>
                </div>
                
                <div className="stat-row">
                  <span className="stat-label">Surgery Rooms:</span>
                  <span className="stat-value">{hospital.available_surgery}/{hospital.surgery_rooms}</span>
                </div>
              </div>
              
              <div className="last-updated">
                Last updated: {formatLastUpdated(hospital.last_updated)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Hospital Detail */}
      {selectedHospitalData && (
        <div className="hospital-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedHospitalData.hospital_name} - Detailed View</h3>
              <button onClick={() => setSelectedHospital(null)} className="close-btn">×</button>
            </div>
            
            <div className="detail-grid">
              <div className="detail-section">
                <h4>General Beds</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${selectedHospitalData.occupancy_rate}%`,
                      backgroundColor: getOccupancyColor(selectedHospitalData.occupancy_rate)
                    }}
                  ></div>
                </div>
                <p>
                  {selectedHospitalData.occupied_beds} occupied / {selectedHospitalData.total_beds} total
                  ({selectedHospitalData.available_beds} available)
                </p>
              </div>
              
              <div className="detail-section">
                <h4>ICU Beds</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${selectedHospitalData.icu_occupancy_rate}%`,
                      backgroundColor: getOccupancyColor(selectedHospitalData.icu_occupancy_rate)
                    }}
                  ></div>
                </div>
                <p>
                  {selectedHospitalData.occupied_icu} occupied / {selectedHospitalData.icu_beds} total
                  ({selectedHospitalData.available_icu} available)
                </p>
              </div>
              
              <div className="detail-section">
                <h4>Emergency Department</h4>
                <p>{selectedHospitalData.available_emergency} of {selectedHospitalData.emergency_beds} beds available</p>
              </div>
              
              <div className="detail-section">
                <h4>Surgery Rooms</h4>
                <p>{selectedHospitalData.available_surgery} of {selectedHospitalData.surgery_rooms} rooms available</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}