import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface FulfillmentItem {
  name: string;
  dosage: string;
  stock_quantity: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  reorder_level?: number;
  medication_name: string;
  current_status: string;
  fulfillment_status: 'not_ordered' | 'pending' | 'ordered' | 'in_transit' | 'delivered';
  order_date?: string;
  expected_delivery?: string;
  delivery_date?: string;
  quantity_ordered?: number;
  quantity_received?: number;
  supplier?: string;
  order_number?: string;
  notes?: string;
  needs_fulfillment: boolean;
}

interface InStockMedication {
  name: string;
  dosage: string;
  stock_quantity: number;
  unit: string;
  status: 'in_stock';
  reorder_level?: number;
}

export default function PharmacyFulfillment() {
  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItem[]>([]);
  const [inStockMedications, setInStockMedications] = useState<InStockMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'fulfillment' | 'in-stock'>('fulfillment');

  useEffect(() => {
    if (activeTab === 'fulfillment') {
      fetchFulfillmentStatus();
    } else {
      fetchInStockMedications();
    }
  }, [activeTab, filterStatus]);

  const fetchFulfillmentStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/pharmacy/fulfillment`, {
        params,
        timeout: 10000
      });

      setFulfillmentItems(response.data.fulfillment || []);
    } catch (err: any) {
      console.error('Error fetching fulfillment status:', err);
      setError('Failed to fetch fulfillment status. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInStockMedications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/v1/pharmacy/fulfillment/in-stock`, {
        timeout: 10000
      });

      setInStockMedications(response.data.medications || []);
    } catch (err: any) {
      console.error('Error fetching in-stock medications:', err);
      setError('Failed to fetch in-stock medications. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#28a745'; // Green
      case 'in_transit':
        return '#17a2b8'; // Blue
      case 'ordered':
        return '#ffc107'; // Yellow
      case 'pending':
        return '#fd7e14'; // Orange
      case 'not_ordered':
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_transit':
        return 'In Transit';
      case 'ordered':
        return 'Ordered';
      case 'pending':
        return 'Pending';
      case 'not_ordered':
        return 'Not Ordered';
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return '#28a745';
      case 'low_stock':
        return '#ffc107';
      case 'out_of_stock':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  return (
    <div className="data-list">
      <h2>💊 Pharmacy Fulfillment Status</h2>

      {/* Tabs */}
      <div className="fulfillment-tabs" style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #e9ecef' }}>
        <button
          onClick={() => setActiveTab('fulfillment')}
          className={`tab-button ${activeTab === 'fulfillment' ? 'active' : ''}`}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'fulfillment' ? '#1E88E5' : 'transparent',
            color: activeTab === 'fulfillment' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            fontWeight: activeTab === 'fulfillment' ? 'bold' : 'normal'
          }}
        >
          Fulfillment Status ({fulfillmentItems.length})
        </button>
        <button
          onClick={() => setActiveTab('in-stock')}
          className={`tab-button ${activeTab === 'in-stock' ? 'active' : ''}`}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'in-stock' ? '#1E88E5' : 'transparent',
            color: activeTab === 'in-stock' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            fontWeight: activeTab === 'in-stock' ? 'bold' : 'normal'
          }}
        >
          In Stock Medications ({inStockMedications.length})
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          <strong>⚠️ {error}</strong>
        </div>
      )}

      {activeTab === 'fulfillment' && (
        <>
          {/* Filter */}
          <div className="fulfillment-filters" style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: '600' }}>Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #1E88E5',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Status</option>
              <option value="not_ordered">Not Ordered</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-indicator" style={{ textAlign: 'center', color: '#1E88E5' }}>
              <div className="spinner"></div>
              <p>Loading fulfillment status...</p>
            </div>
          ) : fulfillmentItems.length === 0 ? (
            <p className="no-data">No medications require fulfillment at this time.</p>
          ) : (
            <div className="fulfillment-grid">
              {fulfillmentItems.map((item, index) => (
                <div key={index} className="fulfillment-card">
                  <div className="fulfillment-header">
                    <div>
                      <h3>{item.name}</h3>
                      <p className="fulfillment-dosage">{item.dosage}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      <span 
                        className="status-badge"
                        style={{
                          background: getStockStatusColor(item.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getStockStatusLabel(item.status)}
                      </span>
                      <span 
                        className="status-badge"
                        style={{
                          background: getStatusColor(item.fulfillment_status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getStatusLabel(item.fulfillment_status)}
                      </span>
                    </div>
                  </div>

                  <div className="fulfillment-details">
                    <p><strong>Current Stock:</strong> {item.stock_quantity} {item.unit}</p>
                    {item.reorder_level && (
                      <p><strong>Reorder Level:</strong> {item.reorder_level} {item.unit}</p>
                    )}

                    {item.fulfillment_status !== 'not_ordered' && (
                      <>
                        {item.order_date && (
                          <p><strong>Order Date:</strong> {new Date(item.order_date).toLocaleDateString()}</p>
                        )}
                        {item.expected_delivery && (
                          <p><strong>Expected Delivery:</strong> {new Date(item.expected_delivery).toLocaleDateString()}</p>
                        )}
                        {item.delivery_date && (
                          <p><strong>Delivery Date:</strong> {new Date(item.delivery_date).toLocaleDateString()}</p>
                        )}
                        {item.quantity_ordered && (
                          <p><strong>Quantity Ordered:</strong> {item.quantity_ordered} {item.unit}</p>
                        )}
                        {item.quantity_received && (
                          <p><strong>Quantity Received:</strong> {item.quantity_received} {item.unit}</p>
                        )}
                        {item.supplier && (
                          <p><strong>Supplier:</strong> {item.supplier}</p>
                        )}
                        {item.order_number && (
                          <p><strong>Order Number:</strong> {item.order_number}</p>
                        )}
                      </>
                    )}

                    {item.notes && (
                      <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'in-stock' && (
        <>
          {loading ? (
            <div className="loading-indicator" style={{ textAlign: 'center', color: '#1E88E5' }}>
              <div className="spinner"></div>
              <p>Loading in-stock medications...</p>
            </div>
          ) : inStockMedications.length === 0 ? (
            <p className="no-data">No medications are currently in stock.</p>
          ) : (
            <div className="inventory-grid">
              {inStockMedications.map((med, index) => (
                <div key={index} className="inventory-item-card stock-in_stock">
                  <div className="inventory-item-header">
                    <h4>{med.name}</h4>
                    <span 
                      className="status-badge"
                      style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      In Stock
                    </span>
                  </div>
                  <p className="inventory-dosage">{med.dosage}</p>
                  <p className="inventory-quantity">
                    <strong>Stock:</strong> {med.stock_quantity} {med.unit}
                  </p>
                  {med.reorder_level && (
                    <p className="inventory-reorder">
                      <strong>Reorder Level:</strong> {med.reorder_level} {med.unit}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


