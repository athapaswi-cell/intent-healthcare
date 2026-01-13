import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface AppointmentItem {
  id: string;
  patientId: string;
  patientName?: string;
  hospitalId?: string;
  hospitalName?: string;
  encounterType: string;
  encounterCode?: string;
  status: string;
  startDate: string;
  startTime?: string;
  endDate?: string | null;
  endTime?: string | null;
  duration?: string;
  durationMinutes?: number;
  location?: string;
  reason?: string;
  diagnoses?: { code: string; display: string }[] | string[];
  participants?: { type: string; name: string; reference?: string }[];
  isToday?: boolean;
}

interface User {
  username: string;
  role: 'doctor' | 'patient';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function Appointments() {
  const [user] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('patientPortalUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching appointments from:', `${API_BASE_URL}/api/v1/records/visits`);
      const response = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
        params: { limit: 50 },
        timeout: 30000
      });
      
      console.log('Appointments API response:', {
        status: response.status,
        dataLength: response.data?.length || 0
      });
      
      let appointmentsData = response.data || [];
      
      if (appointmentsData.length === 0) {
        console.warn('No appointments data returned from API.');
        setAppointments([]);
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

      // Populate patient names in appointments
      appointmentsData = appointmentsData.map((appointment: AppointmentItem) => {
        if (!appointment.patientName || appointment.patientName === 'Unknown Patient') {
          const appointmentPatientId = (appointment.patientId || '').toLowerCase().trim();
          
          // Try exact match first
          let patientName = patientsMap.get(appointmentPatientId);
          
          // Try with Patient/ prefix
          if (!patientName) {
            patientName = patientsMap.get(`patient/${appointmentPatientId}`);
          }
          
          // Try without Patient/ prefix
          if (!patientName) {
            const cleanId = appointmentPatientId.replace(/^patient\//, '').replace(/^Patient\//, '');
            patientName = patientsMap.get(cleanId);
          }
          
          // Try partial matching if exact match fails
          if (!patientName) {
            for (const [pid, pname] of patientsMap.entries()) {
              if (appointmentPatientId.includes(pid) || pid.includes(appointmentPatientId)) {
                patientName = pname;
                break;
              }
            }
          }
          
          if (patientName) {
            return { ...appointment, patientName: patientName };
          }
        }
        return appointment;
      });
      
      // Filter based on user role
      if (user?.role === 'doctor') {
        // Filter appointments for this doctor's patients
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
            
            // If doctor matched, add patient ID to set (not appointment ID)
            if (doctorMatched && visit.patientId) {
              patientIdsSet.add(visit.patientId);
              console.log(`Doctor matched visit for patient: ${visit.patientName || visit.patientId}`);
            }
          }
          
          // Filter appointments to show ALL appointments for patients this doctor has consulted
          const consultedPatientIds = Array.from(patientIdsSet);
          
          console.log(`Doctor has consulted with ${consultedPatientIds.length} patients:`, consultedPatientIds);
          console.log(`Total appointments before filtering: ${appointmentsData.length}`);
          
          if (consultedPatientIds.length > 0) {
            const originalAppointmentsCount = appointmentsData.length;
            appointmentsData = appointmentsData.filter((apt: AppointmentItem) => {
              const aptPatientId = (apt.patientId || '').toLowerCase().trim();
              
              // Try to match with any of the consulted patient IDs
              const matches = consultedPatientIds.some(pid => {
                const patientId = pid.toLowerCase().trim();
                
                // Exact match
                if (aptPatientId === patientId) {
                  return true;
                }
                
                // Remove common prefixes for matching
                const cleanAptId = aptPatientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                const cleanPid = patientId.replace(/^patient\//, '').replace(/^Patient\//, '').replace(/^urn:uuid:/, '').replace(/^urn:/, '');
                
                // Try cleaned IDs
                if (cleanAptId === cleanPid) {
                  return true;
                }
                
                // Partial matching (either contains the other)
                if (aptPatientId && patientId && (aptPatientId.includes(patientId) || patientId.includes(aptPatientId))) {
                  return true;
                }
                
                // Try cleaned partial matching
                if (cleanAptId && cleanPid && (cleanAptId.includes(cleanPid) || cleanPid.includes(cleanAptId))) {
                  return true;
                }
                
                return false;
              });
              
              return matches;
            });
            
            console.log(`Filtered to ${appointmentsData.length} appointments for doctor's ${consultedPatientIds.length} patients`);
            
            // If filtering resulted in too few records, show all as fallback
            if (appointmentsData.length === 0 && originalAppointmentsCount > 0) {
              console.warn('Doctor filtering resulted in 0 appointments but we had appointments before. Showing all appointments as fallback.');
              // Re-fetch all appointments
              const allAppointmentsResponse = await axios.get(`${API_BASE_URL}/api/v1/records/visits`, {
                params: { limit: 50 },
                timeout: 30000
              });
              appointmentsData = allAppointmentsResponse.data || [];
              
              // Re-populate patient names
              appointmentsData = appointmentsData.map((appointment: AppointmentItem) => {
                if (!appointment.patientName || appointment.patientName === 'Unknown Patient') {
                  const appointmentPatientId = (appointment.patientId || '').toLowerCase().trim();
                  let patientName = patientsMap.get(appointmentPatientId);
                  if (!patientName) {
                    patientName = patientsMap.get(`patient/${appointmentPatientId}`);
                  }
                  if (!patientName) {
                    const cleanId = appointmentPatientId.replace(/^patient\//, '').replace(/^Patient\//, '');
                    patientName = patientsMap.get(cleanId);
                  }
                  if (!patientName) {
                    for (const [pid, pname] of patientsMap.entries()) {
                      if (appointmentPatientId.includes(pid) || pid.includes(appointmentPatientId)) {
                        patientName = pname;
                        break;
                      }
                    }
                  }
                  if (patientName) {
                    return { ...appointment, patientName: patientName };
                  }
                }
                return appointment;
              });
            }
          } else {
            // Fallback: show all appointments if no matches found
            console.log('No patients found for this doctor from visits. Showing all appointments as fallback.');
          }
        } catch (visitsError) {
          console.error('Error filtering appointments for doctor:', visitsError);
          // Fallback: show all appointments if filtering fails
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
          appointmentsData = appointmentsData.filter((apt: AppointmentItem) => {
            // Match by patient ID
            if (userPatientId && apt.patientId && !userPatientId.startsWith('pat')) {
              const aptId = apt.patientId.toLowerCase().trim();
              if (aptId === userPatientId || aptId.includes(userPatientId) || userPatientId.includes(aptId)) {
                return true;
              }
            }
            
            // Match by patient name
            if (userFullName && apt.patientName) {
              const aptName = apt.patientName.toLowerCase().trim();
              if (aptName.includes(userFullName) || userFullName.includes(aptName)) {
                return true;
              }
            }
            
            return false;
          });
        }
      }
      
      // Show ALL appointments (past, today, and future) - no filtering by date
      // We'll just mark which ones are today's appointments for highlighting
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Mark today's appointments and sort (today's first, then by date)
      appointmentsData = appointmentsData.map((apt: AppointmentItem) => {
        let isToday = false;
        
        if (apt.startDate) {
          const aptDate = new Date(apt.startDate);
          aptDate.setHours(0, 0, 0, 0);
          isToday = aptDate.getTime() === today.getTime();
        } else if (apt.startTime) {
          try {
            const timestamp = new Date(apt.startTime);
            if (!isNaN(timestamp.getTime())) {
              const timestampDate = new Date(timestamp);
              timestampDate.setHours(0, 0, 0, 0);
              isToday = timestampDate.getTime() === today.getTime();
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        return { ...apt, isToday };
      });
      
      // Sort by date (today's first, then soonest first)
      appointmentsData.sort((a: any, b: any) => {
        // Today's appointments first
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        
        // Then sort by date
        const dateA = new Date(a.startDate || a.startTime || 0);
        const dateB = new Date(b.startDate || b.startTime || 0);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAppointments(appointmentsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      if (axios.isCancel(err)) {
        setError('Request cancelled.');
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching appointments. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('Appointments endpoint not found. Ensure backend is running and configured correctly.');
      } else {
        setError(err.message || 'Failed to fetch appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="data-list">
        <div className="error">Please login to view appointments.</div>
      </div>
    );
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus !== 'all' && apt.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const uniqueStatuses = Array.from(new Set(appointments.map(apt => apt.status)));

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM format
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'planned') return '#3b82f6'; // blue
    if (statusLower === 'arrived') return '#10b981'; // green
    if (statusLower === 'in-progress') return '#f59e0b'; // amber
    if (statusLower === 'finished') return '#6b7280'; // gray
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
            📅 Appointments {user.role === 'doctor' ? '(My Appointments)' : '(Your Appointments)'}
          </h2>
        </div>
        <div className="loading">Loading appointments...</div>
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
          📅 Appointments {user.role === 'doctor' ? '(My Appointments)' : '(Your Appointments)'} ({filteredAppointments.length})
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

      {!error && appointments.length === 0 && (
        <div className="empty-state" style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          background: '#f9fafb',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📅</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No Appointments Found</h3>
          <p style={{ margin: 0, color: '#666' }}>
            {user.role === 'doctor' 
              ? 'You don\'t have any upcoming appointments scheduled.'
              : 'You don\'t have any upcoming appointments scheduled.'}
          </p>
        </div>
      )}

      {!error && appointments.length > 0 && (
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
              All ({appointments.length})
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
                {status} ({appointments.filter(a => a.status === status).length})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredAppointments.map((appointment: any) => {
              const isTodayAppointment = appointment.isToday;
              return (
                <div
                  key={appointment.id}
                style={{
                  background: isTodayAppointment ? '#fff7ed' : 'white',
                  border: isTodayAppointment ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  transition: 'all 0.2s ease',
                  boxShadow: isTodayAppointment ? '0 2px 8px rgba(245, 158, 11, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {appointment.patientName ? (
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a', fontWeight: 'bold' }}>
                          {appointment.patientName}
                        </h3>
                      ) : (
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#666', fontWeight: 'normal' }}>
                          Patient ID: {appointment.patientId || 'N/A'}
                        </h3>
                      )}
                      {isTodayAppointment && (
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: '#f59e0b',
                            color: 'white'
                          }}
                        >
                          Today
                        </span>
                      )}
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: getStatusColor(appointment.status),
                          color: 'white'
                        }}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <strong>Type:</strong> {appointment.encounterType}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      <strong>Date:</strong> {formatDate(appointment.startDate)}
                      {appointment.startTime && ` at ${formatTime(appointment.startTime)}`}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {appointment.hospitalName && (
                    <div>
                      <strong>Hospital:</strong> {appointment.hospitalName}
                    </div>
                  )}
                  {appointment.location && (
                    <div>
                      <strong>Location:</strong> {appointment.location}
                    </div>
                  )}
                  {appointment.reason && (
                    <div>
                      <strong>Reason:</strong> {appointment.reason}
                    </div>
                  )}
                  {appointment.endTime && (
                    <div>
                      <strong>End Time:</strong> {formatTime(appointment.endTime)}
                    </div>
                  )}
                  {appointment.durationMinutes && (
                    <div>
                      <strong>Duration:</strong> {Math.floor(appointment.durationMinutes / 60)}h {appointment.durationMinutes % 60}m
                    </div>
                  )}
                  {appointment.participants && appointment.participants.length > 0 && (
                    <div>
                      <strong>Participants:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {appointment.participants.map((p, idx) => (
                          <li key={idx}>{p.type}: {p.reference || p.name || 'N/A'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

