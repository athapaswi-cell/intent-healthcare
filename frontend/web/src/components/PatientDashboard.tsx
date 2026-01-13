import React, { useState } from 'react';
import './Dashboard.css';

interface AppUser {
  username: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
  patientId?: string;
  email?: string;
  name?: string;
}

interface PatientDashboardProps {
  user: AppUser | null;
  onNavigate?: (section: string) => void;
}

export default function PatientDashboard({ user, onNavigate }: PatientDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user's display name
  const displayName = user?.name || user?.username || 'Patient';
  const firstName = displayName.split(' ')[0];

  // Sample data - in real app, this would come from API
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Bennett',
      specialty: 'General Practitioner',
      date: 'April 28, 2024',
      time: '10:00 AM',
      type: 'General Check-up',
      doctorImage: '👩‍⚕️'
    },
    {
      id: 2,
      doctorName: 'Emily Wilson',
      specialty: 'General Practitioner',
      date: 'April 28, 2024',
      time: '10:00 AM',
      type: 'General Check-up',
      doctorImage: '👩‍⚕️'
    }
  ];

  const pastVisits = [
    {
      id: 1,
      date: 'May 15, 2024',
      doctorName: 'Dr. Emily Roberts',
      specialty: 'Dermatologist',
      doctorImage: '👩‍⚕️'
    },
    {
      id: 2,
      date: 'May 3, 2024',
      doctorName: 'Dr. Mark Johnson',
      specialty: 'Cardiologist',
      doctorImage: '👨‍⚕️'
    }
  ];

  const handleSearch = () => {
    // Navigate to doctors page with search query
    console.log('Searching for:', searchQuery);
    // In real app, this would navigate to doctors page
  };

  const handleJoinTelehealth = (appointmentId: number) => {
    console.log('Joining telehealth for appointment:', appointmentId);
    // In real app, this would open telehealth session
    alert('Telehealth session would start here');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome back, {firstName}!</p>
      </div>

      {/* Appointments Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">📅</span>
            Appointments
            <span className="section-badge">17</span>
          </h2>
        </div>
        
        <div className="appointments-list">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className={`appointment-card ${appointment.id === 1 ? 'primary' : ''}`}>
              <div className="appointment-info">
                <div className="doctor-avatar">{appointment.doctorImage}</div>
                <div className="appointment-details">
                  <h3>{appointment.doctorName}</h3>
                  {appointment.id === 1 && (
                    <p className="appointment-date">{appointment.date}, {appointment.time}</p>
                  )}
                  {appointment.id !== 1 && (
                    <>
                      <p className="appointment-specialty">{appointment.specialty}</p>
                      <p className="appointment-type">{appointment.type}</p>
                      <p className="appointment-time">{appointment.time}</p>
                    </>
                  )}
                </div>
              </div>
              <button 
                className="btn-telehealth"
                onClick={() => handleJoinTelehealth(appointment.id)}
              >
                Join Telehealth
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Find a Doctor Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">🔍</span>
            Find a Doctor
          </h2>
          <a href="#" className="section-link">Search</a>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>
      </section>

      {/* Insurance Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">🛡️</span>
            Insurance
          </h2>
          <a href="#" className="section-link"></a>
        </div>
        
        <div className="insurance-cards">
          <div className="insurance-card">
            <div className="insurance-logo">💼</div>
            <div className="insurance-info">
              <h3>MetLife PPO</h3>
              <p>Program Details</p>
              <div className="insurance-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '41.67%' }}></div>
                </div>
                <p className="progress-text">$1,250 of $3,000</p>
              </div>
            </div>
          </div>
          
          <div className="insurance-card">
            <div className="doctor-avatar-small">👨‍⚕️</div>
            <div className="insurance-info">
              <h3>Primary Care Doctor</h3>
              <p className="copay-amount">$25.00</p>
              <h3 className="copay-label">Specialist Co-pay</h3>
              <p className="copay-amount">$50.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Past Visits Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">🕐</span>
            Past Visits
          </h2>
          <a href="#" className="section-link"></a>
        </div>
        
        <div className="visits-list">
          {pastVisits.map((visit) => (
            <div key={visit.id} className="visit-card">
              <div className="visit-date">{visit.date}</div>
              <div className="visit-info">
                <div className="doctor-avatar">{visit.doctorImage}</div>
                <div>
                  <h3>{visit.doctorName} - {visit.specialty}</h3>
                  {visit.id === 1 && <p className="visit-notes">Som, al reoss</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

