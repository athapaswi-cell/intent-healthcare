import React, { useState } from 'react';
import './Dashboard.css';
import './HospitalDashboard.css';

interface AppUser {
  username: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
  email?: string;
  name?: string;
}

interface HospitalDashboardProps {
  user: AppUser | null;
  onNavigate?: (section: string) => void;
}

export default function HospitalDashboard({ user, onNavigate }: HospitalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user's display name
  const displayName = user?.name || user?.username || 'Hospital Admin';
  const firstName = displayName.split(' ')[0];

  // Sample data - in real app, this would come from API
  const summaryStats = {
    admittedPatients: 326,
    beds: 62,
    stretchers: 33
  };

  const policyholdersData = {
    activeClaims: '+33'
  };

  const erCases = {
    current: 12,
    critical: 2,
    warning: 3,
    serious: 6
  };

  const recentAdmissions = [
    {
      id: 1,
      name: 'Anna Wright',
      condition: 'Pneumonia',
      date: '4/9/2024',
      time: 'Today 10:00 AM',
      image: '👩'
    },
    {
      id: 2,
      name: 'David King',
      condition: 'Fracture',
      date: '3/26/2024',
      time: 'Today 9:30 AM',
      image: '👨'
    }
  ];

  const bedOccupancyData = [
    { month: 'Nov', value: 70, color: '#ec4899' }, // Pink
    { month: 'Dec', value: 75, color: '#ef4444' }, // Red
    { month: 'Jan', value: 78, color: '#60a5fa' }, // Light blue
    { month: 'Feb', value: 90, color: '#ec4899' }, // Pink
    { month: 'Mar', value: 85, color: '#14b8a6' }, // Teal
    { month: 'Mar', value: 88, color: '#14b8a6' }, // Teal
    { month: 'Apr', value: 98, color: '#ef4444' }, // Red
    { month: 'Apr', value: 100, color: '#ec4899' } // Pink
  ];

  const maxValue = 100;

  return (
    <div className="hospital-dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {firstName}! 👋</h1>
        <p>Here's your hospital overview for today.</p>
      </div>

      <div className="dashboard-grid-hospital">
        {/* Left Column */}
        <div className="dashboard-left-hospital">
          {/* Summary & Stats Section */}
          <section className="dashboard-section summary-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">📅</span>
                Summary & Stats
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); }}>
                View All &gt;
              </a>
            </div>

            {/* Statistics Bar */}
            <div className="stats-bar">
              <div className="stat-main">
                <strong>{summaryStats.admittedPatients} Admitted Patients</strong>
              </div>
              <div className="stat-icon">🛏️ <span>{summaryStats.beds}</span></div>
              <div className="stat-icon">🦽 <span>{summaryStats.stretchers}</span></div>
            </div>

            {/* Policyholders and Messages Cards */}
            <div className="quick-cards">
              <div className="quick-card">
                <div className="quick-card-icon">👤</div>
                <div className="quick-card-content">
                  <div className="quick-card-title">Policyholders</div>
                  <div className="quick-card-label">Active Claims</div>
                  <div className="quick-card-value">{policyholdersData.activeClaims}</div>
                </div>
              </div>

              <div className="quick-card">
                <div className="quick-card-icon-envelope">
                  ✉
                  <span className="badge-count">2</span>
                </div>
                <div className="quick-card-content">
                  <div className="quick-card-title">Providing Messages</div>
                  <div className="quick-card-status">Pending</div>
                </div>
              </div>
            </div>

            {/* ER Cases Section */}
            <div className="er-cases-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon-red">🚨</span>
                  ER Cases
                </h2>
                <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); }}>
                  View All &gt;
                </a>
              </div>

              <div className="er-cases-card">
                <div className="er-cases-main">
                  <div className="er-cases-count">
                    <strong>{erCases.current} Current Cases</strong>
                    <div className="er-cases-sub">2 Critical</div>
                  </div>
                  <div className="er-cases-stats">
                    <div className="er-stat-item">
                      <span className="er-icon-red">⚠️</span>
                      <strong>{erCases.critical} Critical</strong>
                    </div>
                    <div className="er-stat-item">
                      <span className="er-icon-yellow">⚠️</span>
                      <strong>{erCases.warning}</strong>
                    </div>
                    <div className="er-cases-sub">6 Serious</div>
                  </div>
                  <div className="arrow-icon">→</div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Admissions Section */}
          <section className="dashboard-section admissions-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">📅</span>
                Recent Admissions
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('admissions'); }}>
                View All &gt;
              </a>
            </div>

            <div className="admissions-list">
              {recentAdmissions.map((admission) => (
                <div key={admission.id} className="admission-item">
                  <div className="admission-avatar">{admission.image}</div>
                  <div className="admission-info">
                    <div className="admission-name">{admission.name}</div>
                    <div className="admission-condition">{admission.condition}</div>
                    <div className="admission-date">{admission.date}</div>
                    <div className="admission-time">{admission.time}</div>
                    <div className="admission-condition-repeat">{admission.condition}</div>
                  </div>
                  <div className="arrow-icon">→</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-hospital">
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar-hospital">
              <span className="search-calendar-icon">📅</span>
              <input
                type="text"
                placeholder="Enghin"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-hospital"
              />
              <span className="search-magnify-icon">🔍</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn" onClick={() => onNavigate?.('patients')}>
              <span className="action-icon">📄</span>
              <span className="action-text">View Census</span>
              <span className="arrow-icon">→</span>
            </button>

            <button className="action-btn" onClick={() => onNavigate?.('appointments')}>
              <span className="action-icon">📅</span>
              <span className="action-text">Schedule Appointment</span>
              <span className="arrow-icon">→</span>
            </button>

            <button className="action-btn" onClick={() => onNavigate?.('doctors')}>
              <span className="action-icon">👨‍⚕️</span>
              <span className="action-text">Assign a Doctor</span>
              <span className="arrow-icon">→</span>
            </button>
          </div>

          {/* Bed Occupancy Chart */}
          <section className="dashboard-section chart-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">📊</span>
                Bed Occupancy
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); }}>
                View All &gt;
              </a>
            </div>

            <div className="chart-container-hospital">
              <div className="chart-y-axis-hospital">
                <div className="y-label">100</div>
                <div className="y-label">80</div>
                <div className="y-label">60</div>
                <div className="y-label">30</div>
              </div>
              <div className="chart-bars-hospital">
                {bedOccupancyData.map((data, index) => (
                  <div key={index} className="chart-bar-wrapper-hospital">
                    <div className="chart-bar-container-hospital">
                      <div
                        className="chart-bar-hospital"
                        style={{ 
                          height: `${(data.value / maxValue) * 100}%`,
                          background: data.color
                        }}
                      >
                        <span className="bar-value">{data.value}</span>
                      </div>
                    </div>
                    <div className="chart-x-label">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

