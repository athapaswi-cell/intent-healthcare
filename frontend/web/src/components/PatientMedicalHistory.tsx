import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MedicalHistoryItem {
  id: string;
  patientId: string;
  patientName?: string;
  condition: string;
  conditionCode?: string;
  category: string;
  severity?: string;
  clinicalStatus: string;
  verificationStatus: string;
  onsetDate: string;
  abatementDate?: string | null;
  encounterId?: string;
  bodySite?: string;
  notes: string[];
  recordedDate?: string;
}

export default function PatientMedicalHistory() {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/v1/records/medical-history`, {
        params: { limit: 20 },  // Request only 20 records for faster loading
        timeout: 20000  // 20 second timeout
      });
      
      const history = response.data || [];
      setMedicalHistory(history);
      
      if (history.length === 0) {
        setError('No medical history found. The FHIR server may be slow or unavailable.');
      }
    } catch (err: any) {
      console.error('Error fetching medical history:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching medical history. Please try again later.');
      } else {
        setError(err.message || 'Failed to fetch medical history');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = medicalHistory.filter(item => {
    const statusMatch = filterStatus === 'all' || item.clinicalStatus.toLowerCase() === filterStatus.toLowerCase();
    const categoryMatch = filterCategory === 'all' || item.category.toLowerCase().includes(filterCategory.toLowerCase());
    return statusMatch && categoryMatch;
  });

  const uniqueStatuses = Array.from(new Set(medicalHistory.map(h => h.clinicalStatus))).sort();
  const uniqueCategories = Array.from(new Set(medicalHistory.map(h => h.category))).sort();

  if (loading) return <div className="loading">Loading medical history...</div>;

  return (
    <div className="data-list">
      <h2>📋 Medical History ({filteredHistory.length})</h2>
      
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
            onClick={fetchMedicalHistory}
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
          <label>Clinical Status:</label>
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
          <label>Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 && !loading && !error ? (
        <div className="no-data">
          <p>No medical history found matching the selected filters.</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="cards-grid">
          {filteredHistory.map((item) => (
            <div 
              key={item.id} 
              className={`data-card medical-history-card ${expandedItem === item.id ? 'expanded' : ''}`}
            >
              <div className="history-header">
                <div>
                  <h3>{item.condition}</h3>
                  {item.patientName && (
                    <p className="history-patient">Patient: {item.patientName}</p>
                  )}
                </div>
                <span className={`status-badge history-status ${item.clinicalStatus.toLowerCase().replace(' ', '-')}`}>
                  {item.clinicalStatus}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Category:</strong> {item.category}</p>
                {item.severity && <p><strong>Severity:</strong> {item.severity}</p>}
                <p><strong>Verification:</strong> {item.verificationStatus}</p>
                <p><strong>Onset Date:</strong> {item.onsetDate !== "Unknown" ? new Date(item.onsetDate).toLocaleDateString() : "Unknown"}</p>
                {item.abatementDate && (
                  <p><strong>Resolved Date:</strong> {new Date(item.abatementDate).toLocaleDateString()}</p>
                )}
                {item.bodySite && <p><strong>Body Site:</strong> {item.bodySite}</p>}
                {item.conditionCode && <p><strong>Code:</strong> {item.conditionCode}</p>}
                {item.recordedDate && <p><strong>Recorded:</strong> {new Date(item.recordedDate).toLocaleDateString()}</p>}
                
                {(item.notes.length > 0 || item.encounterId) && (
                  <div className="history-details-section">
                    <button
                      className="details-toggle-button"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    >
                      {expandedItem === item.id ? '▼ Hide Details' : '▶ Show Details'}
                    </button>
                    
                    {expandedItem === item.id && (
                      <div className="history-details">
                        {item.encounterId && (
                          <p><strong>Encounter ID:</strong> {item.encounterId}</p>
                        )}
                        {item.notes.length > 0 && (
                          <div>
                            <h4>Notes:</h4>
                            <ul>
                              {item.notes.map((note, index) => (
                                <li key={index}>{note}</li>
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

