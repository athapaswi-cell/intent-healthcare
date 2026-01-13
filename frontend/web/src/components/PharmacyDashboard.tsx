import React, { useState } from 'react';
import './Dashboard.css';
import './PharmacyDashboard.css';

interface AppUser {
  username: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
  email?: string;
  name?: string;
}

interface PharmacyDashboardProps {
  user: AppUser | null;
  onNavigate?: (section: string) => void;
}

export default function PharmacyDashboard({ user, onNavigate }: PharmacyDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user's display name
  const displayName = user?.name || user?.username || 'Pharmacy Admin';
  const firstName = displayName.split(' ')[0];

  // Sample data - in real app, this would come from API
  const pendingPrescriptions = [
    {
      id: 1,
      patientName: 'Mark Johnson',
      medication: 'Atorvastatin 20 mg',
      image: '👨',
      status: 'fill',
      statusLabel: 'Fill Prescription'
    },
    {
      id: 2,
      patientName: 'Mark Johnson',
      medication: 'Atorvastatin 20 mg',
      image: '👨',
      status: 'review',
      statusLabel: 'Needs Review'
    },
    {
      id: 3,
      patientName: 'David Smith',
      medication: 'Ampostillin 500 mg',
      image: '👨',
      status: 'review',
      statusLabel: 'Needs Review'
    }
  ];

  const ordersToPrepare = [
    {
      id: 1,
      orderNumber: '#16529',
      patientName: 'Susan Brown',
      type: 'Pick up in-Story',
      amount: '$330',
      orderId: '#12025',
      time: 'Today 2:30 PM',
      code: 'A112012',
      image: '👩'
    },
    {
      id: 2,
      orderNumber: '#1.2024',
      patientName: 'Andrew Wright',
      type: 'Picks up Details',
      amount: '$331',
      orderId: '#12024',
      time: 'Today 2:30 PM',
      code: 'A11/012',
      image: '👨'
    }
  ];

  const inventoryData = {
    medication: 'Atorvastatin',
    quantity: 120,
    inventoryValue: '$75.450'
  };

  const dailyPrescriptions = [
    { day: 'Sun', value: 90 },
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 100 },
    { day: 'Wed', value: 120 },
    { day: 'Thu', value: 100 },
    { day: 'Fri', value: 160 },
    { day: 'Sat', value: 180 }
  ];

  const maxValue = 200;
  const filledCount = 279;

  return (
    <div className="pharmacy-dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {firstName}! 👋</h1>
        <p>Here's your pharmacy overview for today.</p>
      </div>

      <div className="dashboard-grid-pharmacy">
        {/* Left Column */}
        <div className="dashboard-left-pharmacy">
          {/* Pending Prescriptions Section */}
          <section className="dashboard-section prescriptions-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">🏥</span>
                Pending Prescriptions
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('pharmacy-prescriptions'); }}>
                View All &gt;
              </a>
            </div>

            <div className="prescriptions-list">
              {pendingPrescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-item">
                  <div className="prescription-avatar">{prescription.image}</div>
                  <div className="prescription-info">
                    <div className="prescription-name">{prescription.patientName}</div>
                    <div className="prescription-medication">{prescription.medication}</div>
                  </div>
                  <button 
                    className={`prescription-action-btn ${prescription.status === 'fill' ? 'btn-fill' : 'btn-review'}`}
                    onClick={() => onNavigate?.('pharmacy-prescriptions')}
                  >
                    {prescription.statusLabel}
                    {prescription.status === 'fill' && <span className="dropdown-arrow">▼</span>}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Orders to Prepare Section */}
          <section className="dashboard-section orders-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">✓</span>
                Orders to Prepare
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('orders'); }}>
                View All &gt;
              </a>
            </div>

            <div className="orders-header">
              <div className="order-number">Order #16529</div>
              <button className="btn-add-order" onClick={() => onNavigate?.('orders')}>
                Add New Order
              </button>
            </div>

            <div className="orders-list">
              {ordersToPrepare.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-avatar">{order.image}</div>
                  <div className="order-info">
                    <div className="order-patient-name">{order.patientName}</div>
                    <div className="order-type">{order.type}</div>
                    <div className="order-details">
                      <span className="order-amount">{order.amount}</span>
                      <span className="order-id">{order.orderId}</span>
                    </div>
                    <div className="order-code">{order.code}</div>
                  </div>
                  <div className="order-right">
                    <div className="order-time">{order.time}</div>
                    <div className="order-tag-wrapper">
                      <span className="order-tag">{order.orderNumber}</span>
                      <span className="arrow-icon">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-pharmacy">
          {/* Pharmacy Attendance Card */}
          <div className="attendance-card">
            <div className="attendance-header">
              <h3>
                <span className="attendance-icon">🏥</span>
                Pharmacy Sign-in
              </h3>
            </div>
            <div className="attendance-content">
              <div className="attendance-label">Pharmacy Attendance</div>
              <div className="attendance-status">Active</div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="inventory-card">
            <div className="inventory-header">
              <h3>
                <span className="inventory-icon">📄</span>
                {inventoryData.medication}
              </h3>
              <div className="inventory-quantity">{inventoryData.quantity} &gt;</div>
            </div>
            <div className="inventory-content">
              <div className="inventory-label">Inventory Value</div>
              <div className="inventory-value">{inventoryData.inventoryValue}</div>
              <button className="btn-sell-usage">Sell Usage</button>
            </div>
          </div>

          {/* Pharmacy Inventory Chart */}
          <section className="dashboard-section inventory-chart-section">
            <div className="section-header">
              <h2>
                <span className="section-icon">🛍️</span>
                Pharmacy Inventory
              </h2>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); onNavigate?.('pharmacy-inventory'); }}>
                View All &gt;
              </a>
            </div>

            <div className="chart-header">
              <div className="chart-title">
                <span>Daily Prescriptions</span>
                <span className="filled-count">Filled {filledCount}</span>
              </div>
              <button className="btn-view-all-dropdown">
                View All <span className="dropdown-arrow">▼</span>
              </button>
            </div>

            <div className="chart-container-pharmacy">
              <div className="chart-y-axis-pharmacy">
                <div className="y-label">200</div>
                <div className="y-label">150</div>
                <div className="y-label">90</div>
                <div className="y-label">50</div>
                <div className="y-label">0</div>
              </div>
              <div className="chart-bars-pharmacy">
                {dailyPrescriptions.map((data, index) => (
                  <div key={index} className="chart-bar-wrapper-pharmacy">
                    <div className="chart-bar-container-pharmacy">
                      <div
                        className="chart-bar-pharmacy"
                        style={{ height: `${(data.value / maxValue) * 100}%` }}
                      >
                        <span className="bar-value">{data.value}</span>
                      </div>
                    </div>
                    <div className="chart-x-label">{data.day}</div>
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

