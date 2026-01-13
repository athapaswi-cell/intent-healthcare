import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MedicalHistoryItem {
  id: string;
  patientId: string;
  patientName?: string;
  condition?: string;
  conditionName?: string;
  conditionCode?: string;
  category: string;
  clinicalStatus: string;
  severity?: string;
  verificationStatus?: string;
  onsetDate?: string;
  onsetDateTime?: string;
  recordedDate?: string;
  abatementDate?: string | null;
  abatementDateTime?: string;
  bodySite?: string;
  notes?: string | string[];
  encounterId?: string;
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function PatientMedicalHistoryWithAuth() {
  // Get user from localStorage (set by App.tsx login)
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedicalHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching medical history from:', `${API_BASE_URL}/api/v1/records/medical-history`);
      const response = await axios.get(`${API_BASE_URL}/api/v1/records/medical-history`, {
        params: { limit: 50 },  // Increased limit to get more data
        timeout: 30000  // Increased timeout to 30 seconds for name fetching
      });
      
      console.log('Medical history API response:', {
        status: response.status,
        dataLength: response.data?.length || 0,
        firstRecord: response.data?.[0]
      });
      
      let history = response.data || [];
      
      // If no data returned from API, show helpful message
      if (history.length === 0) {
        console.warn('No medical history data returned from API. FHIR server may have no Condition resources.');
        setMedicalHistory([]);
        setLoading(false);
        setError(null); // Don't show error, just show "no data" message
        // Continue to show the "no data" UI message
        return;
      }
      
      console.log(`Received ${history.length} medical history records before filtering`);
      
      // Track what we are matching against for debugging/error messages
      let targetPatientId = '';
      let targetPatientName = '';
      
      // Filter based on user role
      if (user?.role === 'patient') {
        // Patients see only their own medical history
        // Get registered user info for better matching
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        
        const userFirstName = currentUser?.firstName?.toLowerCase().trim() || '';
        const userLastName = currentUser?.lastName?.toLowerCase().trim() || '';
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const username = user.username?.toLowerCase().trim() || '';
        
        // Store for use in error messages
        targetPatientId = userPatientId;
        targetPatientName = userFullName || username;
        
        // Log sample history data to help debug
        if (history.length > 0) {
          console.log('Sample medical history data structure:', {
            firstRecord: history[0],
            patientId: history[0]?.patientId,
            patientName: history[0]?.patientName
          });
        }
        
        console.log('Filtering medical history for patient:', {
          username,
          userFullName,
          userPatientId,
          totalRecords: history.length,
          availablePatientIds: [...new Set(history.map(h => h.patientId).filter(Boolean))].slice(0, 5),
          availablePatientNames: [...new Set(history.map(h => h.patientName).filter(Boolean))].slice(0, 5)
        });
        
        // Helper function to normalize names for better matching
        const normalizeName = (name: string): string => {
          return name.toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/[^a-z0-9\s]/g, ''); // Remove special characters
        };
        
        // Helper function to check name similarity
        const namesMatch = (name1: string, name2: string): boolean => {
          const n1 = normalizeName(name1);
          const n2 = normalizeName(name2);
          
          // Exact match
          if (n1 === n2) return true;
          
          // Check if one name contains the other (handles "John Doe" vs "John Doe Jr")
          if (n1.includes(n2) || n2.includes(n1)) return true;
          
          // Check if both first and last names match (order-independent)
          const parts1 = n1.split(/\s+/).filter(p => p.length > 0);
          const parts2 = n2.split(/\s+/).filter(p => p.length > 0);
          
          if (parts1.length >= 2 && parts2.length >= 2) {
            // Check if first and last names match (in any order)
            const first1 = parts1[0];
            const last1 = parts1[parts1.length - 1];
            const first2 = parts2[0];
            const last2 = parts2[parts2.length - 1];
            
            if ((first1 === first2 && last1 === last2) || 
                (first1 === last2 && last1 === first2)) {
              return true;
            }
          }
          
          // Check if any significant part matches (minimum 3 characters)
          for (const part1 of parts1) {
            if (part1.length >= 3) {
              for (const part2 of parts2) {
                if (part1 === part2 && part1.length >= 3) {
                  return true;
                }
              }
            }
          }
          
          return false;
        };
        
        history = history.filter(item => {
          let matches = false;
          
          // Match by patient ID (exact or contains) - skip generated IDs like "pat638665"
          if (userPatientId && item.patientId && !userPatientId.startsWith('pat')) {
            const itemId = item.patientId.toLowerCase().trim();
            const userId = userPatientId.toLowerCase().trim();
            if (itemId === userId || 
                itemId.includes(userId) || 
                userId.includes(itemId)) {
              matches = true;
              console.log('Matched by Patient ID:', itemId, 'with', userId);
            }
          }
          
          // Match by patient name (improved matching with variations)
          if (!matches && item.patientName && userFullName) {
            const itemName = item.patientName.trim();
            
            // Skip "Unknown Patient" or empty names
            if (itemName && itemName.toLowerCase() !== 'unknown patient' && itemName.length > 0) {
              if (namesMatch(itemName, userFullName)) {
                matches = true;
                console.log('Matched by Name (normalized):', itemName, 'with', userFullName);
              } else {
                // Additional check: match by individual name parts
                const itemParts = normalizeName(itemName).split(/\s+/);
                const userParts = normalizeName(userFullName).split(/\s+/);
                
                // Check if first name matches
                if (userFirstName && itemParts.some(part => part === userFirstName && part.length >= 3)) {
                  matches = true;
                  console.log('Matched by First Name part:', itemName, 'contains', userFirstName);
                }
                // Check if last name matches
                else if (userLastName && itemParts.some(part => part === userLastName && part.length >= 3)) {
                  matches = true;
                  console.log('Matched by Last Name part:', itemName, 'contains', userLastName);
                }
              }
            }
          }
          
          // Match by username as last resort (only if no other match)
          if (!matches && item.patientName && username) {
            const itemName = normalizeName(item.patientName);
            const user = normalizeName(username);
            if (itemName && itemName !== 'unknownpatient' && 
                (itemName.includes(user) || user.includes(itemName))) {
              matches = true;
              console.log('Matched by Username:', item.patientName, 'with', username);
            }
          }
          
          return matches;
        });
        
        console.log('Filtered medical history count:', history.length);
      } else if (user?.role === 'doctor') {
        // For doctors, show all medical history (filtering is complex and may hide data)
        // TODO: Can implement doctor-specific filtering later if needed
        console.log(`Doctor logged in. Showing all ${history.length} medical history records.`);
        // Keep all history - don't filter for now to ensure data is visible
      }
      
      setMedicalHistory(history);
      
      // Clear any previous errors when data is successfully fetched
      if (history.length === 0) {
        // This is a normal case - no records found, not an error
        setError(null);
      } else {
        // Clear error if we have data
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching medical history:', err);
      if (axios.isCancel(err)) {
        setError('Request cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching medical history. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('Medical history endpoint not found. Ensure backend is running and configured correctly.');
      } else {
        setError(err.message || 'Failed to fetch medical history');
      }
    } finally {
      setLoading(false);
    }
  };

  // User is managed by App.tsx - no login/logout needed here
  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view medical history.</div>
      </div>
    );
  }

  // Filter medical history
  const filteredHistory = medicalHistory.filter(item => {
    if (filterStatus !== 'all' && item.clinicalStatus.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (filterCategory !== 'all' && item.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  const uniqueStatuses = Array.from(new Set(medicalHistory.map(item => item.clinicalStatus)));
  const uniqueCategories = Array.from(new Set(medicalHistory.map(item => item.category)));

  if (loading) {
    return (
      <div className="data-list">
        <div className="user-header" style={{ 
          marginBottom: '20px',
          padding: '15px',
          background: '#E3F2FD',
          borderRadius: '8px'
        }}>
          <h2 style={{ margin: 0 }}>
            📋 Medical History {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
        <div className="loading">Loading medical history...</div>
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
        <h2 style={{ margin: 0 }}>
          📋 Medical History {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'} ({filteredHistory.length})
        </h2>
      </div>
      
      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          <strong>⚠️ {error.split('\n')[0]}</strong>
          {error.includes('\n') && (
            <div style={{ marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {error.split('\n').slice(1).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}
          <p style={{ marginTop: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
            {user.role === 'patient' 
              ? 'If you believe this is an error, please contact your healthcare provider.'
              : 'The FHIR server may be experiencing high load. You can try refreshing the page.'}
          </p>
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
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category.toLowerCase()}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 && !loading && !error ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3rem' }}>
            {user.role === 'patient' 
              ? 'No Medical History Found'
              : 'No Medical History Found'}
          </h3>
          <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            {user.role === 'patient' 
              ? 'This is a general case - you currently have no medical history records in the system. This is normal if you are a new patient or haven\'t had any medical conditions documented yet.'
              : 'No medical history records found. The FHIR server currently has no Condition resources available. This could mean: (1) The FHIR server has no data, (2) The backend cannot connect to the FHIR server, or (3) No medical conditions have been documented yet.'}
          </p>
          {user.role === 'patient' && (
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '15px', fontStyle: 'italic' }}>
              Your medical history will appear here once you have visits or medical conditions documented.
            </p>
          )}
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="cards-grid">
          {filteredHistory.map((item) => (
            <div 
              key={item.id} 
              className={`data-card history-card ${expandedItem === item.id ? 'expanded' : ''}`}
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            >
              <div className="history-header">
                <div>
                  <h3>{item.conditionName || item.condition || 'Unknown Condition'}</h3>
                  {item.patientName && user.role === 'doctor' && (
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
                {item.verificationStatus && <p><strong>Verification:</strong> {item.verificationStatus}</p>}
                {item.onsetDate && <p><strong>Onset:</strong> {item.onsetDate !== "Unknown" ? new Date(item.onsetDate).toLocaleDateString() : "Unknown"}</p>}
                {item.onsetDateTime && <p><strong>Onset:</strong> {new Date(item.onsetDateTime).toLocaleDateString()}</p>}
                {item.abatementDate && <p><strong>Resolved:</strong> {new Date(item.abatementDate).toLocaleDateString()}</p>}
                {item.abatementDateTime && <p><strong>Resolved:</strong> {new Date(item.abatementDateTime).toLocaleDateString()}</p>}
                {item.recordedDate && <p><strong>Recorded:</strong> {new Date(item.recordedDate).toLocaleDateString()}</p>}
                {item.bodySite && <p><strong>Body Site:</strong> {item.bodySite}</p>}
                {item.conditionCode && <p><strong>Code:</strong> {item.conditionCode}</p>}
                {(item.notes || item.encounterId) && (
                  <div className="history-details-section">
                    <button
                      className="details-toggle-button"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    >
                      {expandedItem === item.id ? '▼ Hide Details' : '▶ Show Details'}
                    </button>
                    {expandedItem === item.id && (
                      <div className="history-details">
                        {item.encounterId && <p><strong>Encounter ID:</strong> {item.encounterId}</p>}
                        {item.notes && (
                          <div>
                            <h4>Notes:</h4>
                            {Array.isArray(item.notes) ? (
                              <ul>
                                {item.notes.map((note, idx) => (
                                  <li key={idx}>{note}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="notes-text">{item.notes}</p>
                            )}
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

