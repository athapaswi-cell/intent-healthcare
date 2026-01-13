import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MedicalRecordItem {
  id: string;
  patient_id: string;
  patient_name?: string;
  encounter_type: string;
  status: string;
  timestamp: string;
  hospital_id?: string;
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function MedicalRecords() {
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedicalRecords();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching medical records from:', `${API_BASE_URL}/api/v1/records/`);
      const response = await axios.get(`${API_BASE_URL}/api/v1/records/`, {
        timeout: 30000
      });
      
      console.log('Medical Records API response:', {
        status: response.status,
        dataLength: response.data?.length || 0
      });
      
      let recordsData = response.data || [];
      
      if (recordsData.length === 0) {
        console.warn('No medical records data returned from API.');
        setMedicalRecords([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Fetch all patients to populate patient names
      let patientsMap = new Map<string, string>(); // patient_id -> full name
      try {
        const patientsResponse = await axios.get(`${API_BASE_URL}/api/v1/patients/`, {
          timeout: 10000
        });
        const patients = patientsResponse.data || [];
        
        // Create a map of patient_id to patient name
        patients.forEach((patient: any) => {
          const patientId = patient.id;
          const firstName = patient.first_name || '';
          const lastName = patient.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          if (patientId && fullName) {
            // Store with lowercase for matching
            patientsMap.set(patientId.toLowerCase(), fullName);
            // Also store variations (if patient_id contains slashes or prefixes)
            const cleanId = patientId.replace(/^Patient\//, '').replace(/^patient\//, '').toLowerCase();
            if (cleanId !== patientId.toLowerCase()) {
              patientsMap.set(cleanId, fullName);
            }
          }
        });
        
        console.log(`Fetched ${patients.length} patients for name mapping`);
      } catch (patientsError) {
        console.warn('Could not fetch patients for name mapping:', patientsError);
      }

      // Populate patient names in medical records
      recordsData = recordsData.map((record: MedicalRecordItem) => {
        if (!record.patient_name || record.patient_name === 'Unknown Patient') {
          const recordPatientId = (record.patient_id || '').toLowerCase().trim();
          
          // Try exact match first
          let patientName = patientsMap.get(recordPatientId);
          
          // Try with Patient/ prefix
          if (!patientName) {
            patientName = patientsMap.get(`patient/${recordPatientId}`);
          }
          
          // Try without Patient/ prefix
          if (!patientName) {
            const cleanId = recordPatientId.replace(/^patient\//, '').replace(/^Patient\//, '');
            patientName = patientsMap.get(cleanId);
          }
          
          // Try partial matching if exact match fails
          if (!patientName) {
            for (const [pid, pname] of patientsMap.entries()) {
              if (recordPatientId.includes(pid) || pid.includes(recordPatientId)) {
                patientName = pname;
                break;
              }
            }
          }
          
          if (patientName) {
            return { ...record, patient_name: patientName };
          }
        }
        return record;
      });
      
      // Filter based on user role
      if (user?.role === 'doctor') {
        // Filter medical records for this doctor's patients
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
            const participants = visit.participants || [];
            let doctorMatched = false;
            
            // Try to match doctor by checking participant references
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
                      (participantRef.includes('practitioner') && participantRef.includes(doctorId.toLowerCase()))) {
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
              // Also try to get patient name for better matching
              if (visit.patientName) {
                // Store by name too for matching
                console.log(`Doctor matched visit for patient: ${visit.patientName} (ID: ${visit.patientId})`);
              }
            }
            
            // Also check if patient name matches (in case ID matching fails)
            // This is a more lenient approach - if doctor is logged in, try to match by any means
            if (!doctorMatched && allVisits.length > 0) {
              // If we're not finding matches, but visits exist, use a broader approach
              // This will be handled by the fallback logic below
            }
          }
          
          // Filter medical records to only those for patients in the set
          const consultedPatientIds = Array.from(patientIdsSet);
          
          console.log('Doctor filtering - found patient IDs from visits:', consultedPatientIds);
          console.log('Total medical records before filtering:', recordsData.length);
          
          // Store original count before filtering
          const originalRecordsCount = recordsData.length;
          
          if (consultedPatientIds.length > 0) {
            // Filter medical records to only those for patients in the set
            recordsData = recordsData.filter((record: MedicalRecordItem) => {
              const recordPatientId = (record.patient_id || '').toLowerCase().trim();
              
              // Try to match with any of the consulted patient IDs
              const matches = consultedPatientIds.some(pid => {
                const patientId = pid.toLowerCase().trim();
                
                // Exact match
                if (recordPatientId === patientId) {
                  return true;
                }
                
                // Remove common prefixes for matching
                const cleanRecordId = recordPatientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                const cleanPid = patientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                
                // Try cleaned IDs
                if (cleanRecordId === cleanPid) {
                  return true;
                }
                
                // Partial matching (either contains the other)
                if (recordPatientId && patientId && (recordPatientId.includes(patientId) || patientId.includes(recordPatientId))) {
                  return true;
                }
                
                // Try cleaned partial matching
                if (cleanRecordId && cleanPid && (cleanRecordId.includes(cleanPid) || cleanPid.includes(cleanRecordId))) {
                  return true;
                }
                
                return false;
              });
              
              return matches;
            });
            
            console.log(`Filtered to ${recordsData.length} medical records for doctor's ${consultedPatientIds.length} patients`);
            
            // If filtering resulted in too few records (less than 10% of original), show all as fallback
            // This handles cases where ID matching is failing but doctor should see more records
            if (recordsData.length > 0 && originalRecordsCount > 0 && (recordsData.length < originalRecordsCount * 0.1)) {
              console.warn(`Doctor filtering resulted in only ${recordsData.length} records out of ${originalRecordsCount}. This seems too few. Checking if all records should be shown...`);
              // Don't change - just log a warning. The filtering might be correct if doctor really only has few patients
            }
            
            // If filtering resulted in 0 records but we had records before, show all as fallback
            if (recordsData.length === 0 && originalRecordsCount > 0) {
              console.warn('Doctor filtering resulted in 0 records but we had records before. Showing all records as fallback.');
              // Re-fetch to get all records (will be used below)
              const allRecordsResponse = await axios.get(`${API_BASE_URL}/api/v1/records/`, {
                timeout: 30000
              });
              recordsData = allRecordsResponse.data || [];
            }
          } else {
            // Fallback: show all medical records if no matches found
            console.log('No patients found for this doctor from visits. Showing all medical records as fallback.');
            // recordsData is already set to all records, just need to ensure patient names are populated
          }
          
          // Ensure patient names are populated for all records
          recordsData = recordsData.map((record: MedicalRecordItem) => {
            if (!record.patient_name || record.patient_name === 'Unknown Patient') {
              const recordPatientId = (record.patient_id || '').toLowerCase().trim();
              let patientName = patientsMap.get(recordPatientId);
              if (!patientName) {
                patientName = patientsMap.get(`patient/${recordPatientId}`);
              }
              if (!patientName) {
                const cleanId = recordPatientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                patientName = patientsMap.get(cleanId);
              }
              if (!patientName) {
                // Try partial matching
                for (const [pid, pname] of patientsMap.entries()) {
                  const cleanRecordId = recordPatientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                  const cleanPid = pid.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                  if (cleanRecordId.includes(cleanPid) || cleanPid.includes(cleanRecordId)) {
                    patientName = pname;
                    break;
                  }
                }
              }
              if (patientName) {
                return { ...record, patient_name: patientName };
              }
            }
            return record;
          });
        } catch (visitsError) {
          console.error('Error filtering medical records for doctor:', visitsError);
          // Fallback: show all medical records if filtering fails
        }
      } else if (user?.role === 'patient') {
        // For patients, filter by their own patient ID
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find((u: any) => u.username === user.username);
        
        const userPatientId = (currentUser?.patientId || user.patientId || '').toLowerCase().trim();
        const userFirstName = (currentUser?.firstName || '').toLowerCase().trim();
        const userLastName = (currentUser?.lastName || '').toLowerCase().trim();
        const userFullName = `${userFirstName} ${userLastName}`.trim();
        
        if (userPatientId || userFullName) {
          recordsData = recordsData.filter((record: MedicalRecordItem) => {
            // Match by patient ID
            if (userPatientId && record.patient_id && !userPatientId.startsWith('pat')) {
              const recordId = record.patient_id.toLowerCase().trim();
              if (recordId === userPatientId || recordId.includes(userPatientId) || userPatientId.includes(recordId)) {
                return true;
              }
            }
            
            // Match by patient name
            if (userFullName && record.patient_name) {
              const recordName = record.patient_name.toLowerCase().trim();
              if (recordName.includes(userFullName) || userFullName.includes(recordName)) {
                return true;
              }
            }
            
            return false;
          });
        }
      }
      
      // Sort by timestamp (most recent first)
      recordsData.sort((a: MedicalRecordItem, b: MedicalRecordItem) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA; // Descending order (newest first)
      });
      
      setMedicalRecords(recordsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching medical records:', err);
      if (axios.isCancel(err)) {
        setError('Request cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching medical records. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('Medical records endpoint not found. Ensure backend is running and configured correctly.');
      } else {
        setError(err.message || 'Failed to fetch medical records');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view medical records.</div>
      </div>
    );
  }

  // Filter medical records
  const filteredRecords = medicalRecords.filter(record => {
    if (filterStatus !== 'all' && record.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const uniqueStatuses = Array.from(new Set(medicalRecords.map(record => record.status)));

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'planned' || statusLower === 'arrived') return '#3b82f6'; // blue
    if (statusLower === 'in-progress') return '#f59e0b'; // amber
    if (statusLower === 'finished' || statusLower === 'completed') return '#10b981'; // green
    if (statusLower === 'cancelled') return '#ef4444'; // red
    return '#6b7280'; // default gray
  };

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
            📋 Medical Records {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'}
          </h2>
        </div>
        <div className="loading">Loading medical records...</div>
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
          📋 Medical Records {user.role === 'doctor' ? '(My Patients)' : '(Your Records)'} ({filteredRecords.length})
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
          ⚠️ {error}
        </div>
      )}

      {!error && medicalRecords.length === 0 && (
        <div className="empty-state" style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          background: '#f9fafb',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No Medical Records Found</h3>
          <p style={{ margin: 0, color: '#666' }}>
            {user.role === 'doctor' 
              ? 'You don\'t have any medical records for your patients.'
              : 'You don\'t have any medical records available.'}
          </p>
        </div>
      )}

      {!error && medicalRecords.length > 0 && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: filterStatus === 'all' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                background: filterStatus === 'all' ? '#6366f1' : 'white',
                color: filterStatus === 'all' ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: filterStatus === 'all' ? '600' : '400'
              }}
            >
              All Status ({medicalRecords.length})
            </button>
            {uniqueStatuses.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: filterStatus === status ? `2px solid ${getStatusColor(status)}` : '1px solid #e5e7eb',
                  background: filterStatus === status ? getStatusColor(status) : 'white',
                  color: filterStatus === status ? 'white' : '#666',
                  cursor: 'pointer',
                  fontWeight: filterStatus === status ? '600' : '400'
                }}
              >
                {status} ({medicalRecords.filter(r => r.status === status).length})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: expandedRecord === record.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {record.patient_name ? (
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a', fontWeight: 'bold' }}>
                          {record.patient_name}
                        </h3>
                      ) : (
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#666', fontWeight: 'normal' }}>
                          Patient ID: {record.patient_id || 'N/A'}
                        </h3>
                      )}
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: getStatusColor(record.status),
                          color: 'white'
                        }}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <strong>Type:</strong> {record.encounter_type || 'N/A'}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      <strong>Date:</strong> {formatDate(record.timestamp)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem' }}>{expandedRecord === record.id ? '▼' : '▶'}</div>
                  </div>
                </div>

                {expandedRecord === record.id && (
                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div>
                      <strong>Patient ID:</strong> {record.patient_id || 'N/A'}
                    </div>
                    {record.hospital_id && (
                      <div>
                        <strong>Hospital ID:</strong> {record.hospital_id}
                      </div>
                    )}
                    <div>
                      <strong>Record ID:</strong> {record.id}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

