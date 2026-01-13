import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MedicationStock {
  name: string;
  dosage: string;
  stock_quantity: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_found';
  reorder_level?: number;
  last_updated?: string;
  found: boolean;
  message?: string;
  search_term?: string;
  suggestions?: string[];
}

export default function PharmacyInventory() {
  const [medicationName, setMedicationName] = useState('');
  const [stockInfo, setStockInfo] = useState<MedicationStock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allInventory, setAllInventory] = useState<MedicationStock[]>([]);
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all inventory on component mount to get count
  useEffect(() => {
    const fetchInitialInventory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/pharmacy/inventory`, {
          timeout: 5000
        });
        setAllInventory(response.data.inventory || []);
      } catch (err) {
        // Silently fail - we'll fetch when user clicks "View All"
        console.log('Could not fetch initial inventory count');
      }
    };
    fetchInitialInventory();
  }, []);

  useEffect(() => {
    if (showAllInventory) {
      fetchAllInventory();
    }
  }, [showAllInventory, searchTerm]);

  const fetchAllInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/pharmacy/inventory`, {
        params,
        timeout: 10000
      });

      setAllInventory(response.data.inventory || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStock = async () => {
    if (!medicationName.trim()) {
      setError('Please enter a medication name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStockInfo(null);

      const response = await axios.get(`${API_BASE_URL}/api/v1/pharmacy/inventory/check`, {
        params: { medication: medicationName.trim() },
        timeout: 10000
      });

      const medicationData = response.data.medication;
      
      // Check if medication was found
      if (medicationData && !medicationData.found) {
        // Medication not found, but we got a response
        setStockInfo(medicationData);
        setError(medicationData.message || 'Medication not found in inventory');
      } else {
        // Medication found
        setStockInfo(medicationData);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error checking stock:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid medication name');
      } else if (err.response?.status === 404) {
        // 404 could mean endpoint not found (backend not restarted) or medication not found
        if (err.response?.data?.detail?.includes('inventory')) {
          // Medication not found - this shouldn't happen with our endpoint, but handle it
          setError('Medication not found in inventory. Please check the spelling or try a different medication name.');
        } else {
          // Endpoint not found - backend needs restart
          setError('Backend endpoint not found. Please restart the backend server to enable inventory checking. The endpoint /api/v1/pharmacy/inventory/check needs to be loaded.');
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000');
      } else {
        setError(err.message || 'Failed to check stock status. Please make sure the backend is running.');
      }
      setStockInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return '#28a745'; // Green
      case 'low_stock':
        return '#ffc107'; // Yellow
      case 'out_of_stock':
        return '#dc3545'; // Red
      case 'not_found':
        return '#6c757d'; // Gray
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'not_found':
        return 'Not Found';
      default:
        return status;
    }
  };

  const commonMedications = [
    'Lisinopril',
    'Metformin',
    'Amoxicillin',
    'Ibuprofen',
    'Albuterol',
    'Atorvastatin',
    'Omeprazole',
    'Cetirizine',
    'Amlodipine',
    'Acetaminophen',
    'Montelukast',
    'Simvastatin',
    'Sertraline',
    'Fluoxetine',
    'Pantoprazole',
    'Loratadine',
    'Azithromycin',
    'Glipizide'
  ];

  return (
    <div className="data-list">
      <h2>💊 Pharmacy Inventory</h2>

      {/* Check Stock Section */}
      <div className="inventory-check-section">
        <div className="input-card">
          <h3>🔍 Check Medication Stock</h3>
          <p>Enter a medication name to check if it's in stock</p>
          
          <div className="medication-check-area">
            <div className="input-group">
              <label htmlFor="medication">Medication Name:</label>
              <input
                id="medication"
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckStock()}
                placeholder="e.g., Lisinopril, Metformin, Amoxicillin..."
                className="medication-input"
                disabled={loading}
              />
            </div>

            <div className="common-medications">
              <label>Common Medications:</label>
              <div className="medication-tags">
                {commonMedications.map((med) => (
                  <button
                    key={med}
                    type="button"
                    className="medication-tag"
                    onClick={() => {
                      setMedicationName(med);
                      handleCheckStock();
                    }}
                    disabled={loading}
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckStock}
              disabled={loading || !medicationName.trim()}
              className="btn-primary check-stock-btn"
            >
              {loading ? 'Checking...' : 'Check Stock'}
            </button>
          </div>

          {error && (
            <div className="error-message" style={{ 
              marginTop: '15px',
              padding: '12px',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '6px',
              color: '#856404'
            }}>
              ⚠️ {error}
            </div>
          )}

          {stockInfo && (
            <div className="stock-result" style={{ marginTop: '20px' }}>
              <div className={`stock-card stock-${stockInfo.status}`}>
                <div className="stock-header">
                  <h4>{stockInfo.name}</h4>
                  {stockInfo.dosage && <span className="stock-dosage">{stockInfo.dosage}</span>}
                </div>
                
                {stockInfo.found ? (
                  <>
                    <div className="stock-status-badge" style={{ 
                      background: getStatusColor(stockInfo.status),
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      display: 'inline-block',
                      marginTop: '10px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusLabel(stockInfo.status)}
                    </div>
                    
                    <div className="stock-details" style={{ marginTop: '15px' }}>
                      <p><strong>Stock Quantity:</strong> {stockInfo.stock_quantity} {stockInfo.unit}</p>
                      {stockInfo.reorder_level && (
                        <p><strong>Reorder Level:</strong> {stockInfo.reorder_level} {stockInfo.unit}</p>
                      )}
                      {stockInfo.last_updated && (
                        <p><strong>Last Updated:</strong> {new Date(stockInfo.last_updated).toLocaleString()}</p>
                      )}
                      {stockInfo.status === 'low_stock' && (
                        <p style={{ color: '#ffc107', fontWeight: 'bold', marginTop: '10px' }}>
                          ⚠️ Stock is below reorder level!
                        </p>
                      )}
                      {stockInfo.status === 'out_of_stock' && (
                        <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '10px' }}>
                          ❌ This medication is currently out of stock!
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="stock-not-found">
                    <div style={{ 
                      padding: '15px', 
                      background: '#fff3cd', 
                      border: '1px solid #ffc107', 
                      borderRadius: '6px',
                      marginTop: '10px'
                    }}>
                      <p style={{ color: '#856404', marginBottom: '10px', fontWeight: 'bold' }}>
                        ⚠️ {stockInfo.message || 'Medication not found in inventory'}
                      </p>
                      <p style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '15px' }}>
                        The medication "{stockInfo.name}" is not currently in our inventory.
                      </p>
                      
                      {stockInfo.suggestions && stockInfo.suggestions.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Try these available medications:</p>
                          <div className="medication-tags">
                            {stockInfo.suggestions.map((med: string) => (
                              <button
                                key={med}
                                type="button"
                                className="medication-tag"
                                onClick={() => {
                                  setMedicationName(med);
                                  setError(null);
                                  handleCheckStock();
                                }}
                              >
                                {med}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setShowAllInventory(true);
                            fetchAllInventory();
                          }}
                          className="btn-primary"
                        >
                          View All Inventory ({allInventory.length > 0 ? allInventory.length : '18'} medications)
                        </button>
                        <button
                          onClick={() => {
                            setMedicationName('');
                            setStockInfo(null);
                            setError(null);
                          }}
                          className="btn-secondary"
                        >
                          Clear & Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Inventory Section */}
      <div className="all-inventory-section" style={{ marginTop: '30px' }}>
        <div className="inventory-header">
          <h3>📦 All Inventory</h3>
          <button
            onClick={() => {
              setShowAllInventory(!showAllInventory);
              if (!showAllInventory) {
                fetchAllInventory();
              }
            }}
            className="btn-secondary"
          >
            {showAllInventory ? 'Hide Inventory' : 'Show All Inventory'}
          </button>
        </div>

        {showAllInventory && (
          <>
            <div className="inventory-search" style={{ marginTop: '15px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medications..."
                className="medication-input"
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>

            {loading && (
              <div className="loading-indicator" style={{ 
                marginTop: '15px',
                textAlign: 'center',
                color: '#1E88E5'
              }}>
                <div className="spinner"></div>
                <p>Loading inventory...</p>
              </div>
            )}

            {!loading && allInventory.length === 0 && (
              <p className="no-data" style={{ marginTop: '15px' }}>
                No medications found matching your search.
              </p>
            )}

            {!loading && allInventory.length > 0 && (
              <div className="inventory-grid" style={{ marginTop: '20px' }}>
                {allInventory.map((med, index) => (
                  <div key={index} className={`inventory-item-card stock-${med.status}`}>
                    <div className="inventory-item-header">
                      <h4>{med.name}</h4>
                      <span className="stock-status-badge-small" style={{ 
                        background: getStatusColor(med.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {getStatusLabel(med.status)}
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
    </div>
  );
}

