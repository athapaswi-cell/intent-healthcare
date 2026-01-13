import React from 'react';
import './AdminDashboard.css';

interface AppUser {
  username: string;
  role: string;
  name?: string;
}

interface AdminDashboardProps {
  user: AppUser | null;
  onNavigate?: (section: string) => void;
}

export default function AdminDashboard({ user, onNavigate }: AdminDashboardProps) {
  const displayName = user?.name || user?.username || 'Admin';

  // Sample data
  const recentPublications = [
    {
      id: 1,
      title: 'Advancements in Oncology Treatments',
      author: 'Dr. Emily Finch',
      date: 'April 5, 2024',
      journal: ''
    },
    {
      id: 2,
      title: 'Breakthroughs in Genomics and Gene Therapy',
      author: 'Dr. James Carter',
      date: 'March 28, 2024',
      journal: ''
    },
    {
      id: 3,
      title: 'Recent Developments in Infectious Disease Research',
      author: 'Dr. Lisa Nguyen',
      date: 'The Lancet Infectious Diseases',
      journal: 'The Lancet Infectious Diseases'
    }
  ];

  const ongoingStudies = [
    {
      id: 1,
      title: 'Phase 3 Clinical Trial on Type 2 Diabetes Treatment',
      author: 'Dr. Alan Woods',
      date: 'March 2025'
    },
    {
      id: 2,
      title: 'Neurological Research on Alzheimer\'s Disease',
      author: 'Dr. Sarah Reed',
      date: 'June 76, 2024'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Healthcare Innovations Conference',
      date: 'May 8, 2024',
      location: 'City Convention Center'
    },
    {
      id: 2,
      title: 'Genomics in Medicine Seminar',
      date: 'May 30, 2024',
      location: 'Webinar'
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="admin-header">
        <div className="header-search">
          <input type="text" placeholder="Q Search..." className="search-input" />
        </div>
        <div className="header-user">
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role">Admin</div>
          </div>
          <div className="user-avatar">👤</div>
        </div>
      </div>

      {/* Main Title */}
      <div className="admin-title-section">
        <h1 className="main-title">Research & Academics</h1>
        <button className="breadcrumb-btn">
          <span className="breadcrumb-icon">📄</span>
          Research & Academics
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card research-articles">
          <div className="card-icon pink">📄</div>
          <div className="card-content">
            <div className="card-number">42</div>
            <div className="card-label">Research Articles</div>
          </div>
          <div className="card-arrow">→</div>
        </div>
        <div className="summary-card ongoing-studies">
          <div className="card-icon green">🧬</div>
          <div className="card-content">
            <div className="card-number">15</div>
            <div className="card-label">Ongoing Studies</div>
          </div>
          <div className="card-arrow">→</div>
        </div>
        <div className="summary-card upcoming-events">
          <div className="card-icon orange">📅</div>
          <div className="card-content">
            <div className="card-number">8</div>
            <div className="card-label">Upcoming Events</div>
          </div>
          <div className="card-arrow">→</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content-grid">
        {/* Left Column */}
        <div className="admin-left-column">
          {/* Recent Publications */}
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📄</span>
                Recent Publications
              </h2>
              <a href="#" className="view-all-link">View All &gt;</a>
            </div>
            <div className="publications-list">
              {recentPublications.map((pub) => (
                <div key={pub.id} className="publication-item">
                  <div className="publication-content">
                    <div className="publication-title">{pub.title}</div>
                    <div className="publication-author">
                      {pub.author} {pub.date && `| ${pub.date}`}
                    </div>
                  </div>
                  <button className="view-btn">View</button>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing Studies */}
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🧬</span>
                Ongoing Studies
              </h2>
              <a href="#" className="view-all-link">View All Studies</a>
            </div>
            <div className="studies-list">
              {ongoingStudies.map((study) => (
                <div key={study.id} className="study-item">
                  <div className="study-title">{study.title}</div>
                  <div className="study-author">
                    {study.author} | {study.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="admin-right-column">
          {/* Quick Actions */}
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon pink-lightning">⚡</span>
                Quick Actions
              </h2>
            </div>
            <div className="quick-actions-list">
              <button className="quick-action-btn pink">
                <span className="action-icon">📄+</span>
                <span className="action-text">New Research Article...</span>
                <span className="action-arrow">→</span>
              </button>
              <button className="quick-action-btn green">
                <span className="action-icon">🧬+</span>
                <span className="action-text">Log New Study</span>
                <span className="action-arrow">→</span>
              </button>
              <button className="quick-action-btn orange">
                <span className="action-icon">📅+</span>
                <span className="action-text">Add Event</span>
                <span className="action-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="admin-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📅</span>
                Upcoming Events
              </h2>
              <a href="#" className="view-all-link">View All &gt;</a>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-title">{event.title}</div>
                  <div className="event-details">
                    {event.date} | {event.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

