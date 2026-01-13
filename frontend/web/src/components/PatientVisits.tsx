import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface PatientVisit {
  id: string;
  patientId: string;
  patientName?: string;
  encounterType: string;
  encounterCode?: string;
  status: string;
  startDate: string;
  startTime?: string;
  endDate?: string | null;
  endTime?: string | null;
  durationMinutes?: number;
  hospitalId: string;
  hospitalName?: string;
  location?: string;
  reason?: string;
  diagnoses: string[];
  participants: Array<{ type: string; reference: string }>;
}

export default function PatientVisits() {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
        params: { limit: 20 },  // Request only 20 visits for faster loading
        timeout: 20000  // 20 second timeout
      });
      
      const visitsData = response.data || [];
      setVisits(visitsData);
      
      if (visitsData.length === 0) {
        setError('No visits found. The FHIR server may be slow or unavailable.');
      }
    } catch (err: any) {
      console.error('Error fetching visits:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching visits. Please try again later.');
      } else {
        setError(err.message || 'Failed to fetch visits');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = visits.filter(visit => {
    const statusMatch = filterStatus === 'all' || visit.status.toLowerCase() === filterStatus.toLowerCase();
    const typeMatch = filterType === 'all' || visit.encounterType.toLowerCase().includes(filterType.toLowerCase());
    return statusMatch && typeMatch;
  });

  const uniqueStatuses = Array.from(new Set(visits.map(v => v.status))).sort();
  const uniqueTypes = Array.from(new Set(visits.map(v => v.encounterType))).sort();

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) return <div className="loading">Loading patient visits...</div>;

  return (
    <div className="data-list">
      <h2>🏥 Patient Visits ({filteredVisits.length})</h2>
      
      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          <strong>⚠️ {error}</strong>
          <button 
            onClick={fetchVisits}
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: loading ? '#ccc' : '#1E88E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="policy-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Visit Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredVisits.length === 0 && !loading && !error ? (
        <div className="no-data">
          <p>No visits found matching the selected filters.</p>
        </div>
      ) : filteredVisits.length > 0 ? (
        <div className="cards-grid">
          {filteredVisits.map((visit) => (
            <div 
              key={visit.id} 
              className={`data-card visit-card ${expandedVisit === visit.id ? 'expanded' : ''}`}
            >
              <div className="visit-header">
                <div>
                  <h3>{visit.encounterType}</h3>
                  {visit.patientName && (
                    <p className="visit-patient">Patient: {visit.patientName}</p>
                  )}
                  {visit.hospitalName && (
                    <p className="visit-hospital">🏥 {visit.hospitalName}</p>
                  )}
                </div>
                <span className={`status-badge visit-status ${visit.status.toLowerCase().replace(' ', '-')}`}>
                  {visit.status}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Date:</strong> {new Date(visit.startDate).toLocaleDateString()}</p>
                {visit.startTime && <p><strong>Time:</strong> {visit.startTime}</p>}
                {visit.endDate && (
                  <>
                    <p><strong>End Date:</strong> {new Date(visit.endDate).toLocaleDateString()}</p>
                    {visit.endTime && <p><strong>End Time:</strong> {visit.endTime}</p>}
                  </>
                )}
                {visit.durationMinutes && (
                  <p><strong>Duration:</strong> {formatDuration(visit.durationMinutes)}</p>
                )}
                {visit.location && <p><strong>Location:</strong> {visit.location}</p>}
                {visit.reason && <p><strong>Reason:</strong> {visit.reason}</p>}
                
                {(visit.diagnoses.length > 0 || visit.participants.length > 0 || visit.encounterCode) && (
                  <div className="visit-details-section">
                    <button
                      className="details-toggle-button"
                      onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                    >
                      {expandedVisit === visit.id ? '▼ Hide Details' : '▶ Show Details'}
                    </button>
                    
                    {expandedVisit === visit.id && (
                      <div className="visit-details">
                        {visit.encounterCode && (
                          <p><strong>Encounter Code:</strong> {visit.encounterCode}</p>
                        )}
                        {visit.diagnoses.length > 0 && (
                          <div>
                            <h4>Diagnoses:</h4>
                            <ul>
                              {visit.diagnoses.map((diagnosis, index) => (
                                <li key={index}>{diagnosis}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {visit.participants.length > 0 && (
                          <div>
                            <h4>Participants:</h4>
                            <ul>
                              {visit.participants.map((participant, index) => (
                                <li key={index}>
                                  {participant.type || 'Staff'}: {participant.reference}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

