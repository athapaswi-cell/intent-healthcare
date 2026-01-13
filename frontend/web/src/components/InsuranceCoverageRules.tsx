import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface CoverageRule {
  id: string;
  coverageId: string;
  subscriberId?: string;
  subscriberName?: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
  insuranceProvider: string;
  coverageType: string;
  planName: string;
  planType: string;
  status: string;
  startDate: string;
  endDate: string;
  networkType: string;
  copay: string;
  relationship: string;
  dependentNumber: string;
  rules: string[];
}

export default function InsuranceCoverageRules() {
  const [coverageRules, setCoverageRules] = useState<CoverageRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverageRules();
  }, []);

  const fetchCoverageRules = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real coverage rules from FHIR with limit parameter
      const response = await axios.get(`${API_BASE_URL}/api/v1/insurance/coverage-rules`, {
        params: { limit: 10 },  // Reduced limit to 10 for faster loading
        timeout: 30000  // Increased timeout to 30 seconds
      });
      
      const rules = response.data || [];
      setCoverageRules(rules);
      
      // Don't set error for empty results - this is a normal case
      if (rules.length === 0) {
        setError(null);  // Clear error - empty is normal
      }
    } catch (err: any) {
      console.error('Error fetching coverage rules:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The FHIR server is taking too long to respond. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error while fetching coverage rules. Please try again later.');
      } else {
        setError(err.message || 'Failed to fetch coverage rules');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = coverageRules.filter(rule => {
    const providerMatch = filterProvider === 'all' || rule.insuranceProvider === filterProvider;
    const statusMatch = filterStatus === 'all' || rule.status.toLowerCase() === filterStatus.toLowerCase();
    const typeMatch = filterType === 'all' || rule.coverageType.toLowerCase().includes(filterType.toLowerCase());
    return providerMatch && statusMatch && typeMatch;
  });

  const uniqueProviders = Array.from(new Set(coverageRules.map(r => r.insuranceProvider))).sort();
  const uniqueTypes = Array.from(new Set(coverageRules.map(r => r.coverageType))).sort();
  const uniqueStatuses = Array.from(new Set(coverageRules.map(r => r.status))).sort();

  if (loading) return <div className="loading">Loading coverage rules...</div>;

  return (
    <div className="data-list">
      <h2>🛡️ Insurance Coverage Rules ({filteredRules.length})</h2>
      
      {error && (
        <div className="error-message" style={{ 
          padding: '15px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          <strong>⚠️ {error}</strong>
          <p style={{ marginTop: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
            The FHIR server may be experiencing high load. You can try:
          </p>
          <ul style={{ marginLeft: '20px', fontSize: '0.9rem' }}>
            <li>Refreshing the page</li>
            <li>Trying again in a few moments</li>
            <li>Checking your internet connection</li>
          </ul>
          <button 
            onClick={fetchCoverageRules}
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
          <label>Provider:</label>
          <select 
            value={filterProvider} 
            onChange={(e) => setFilterProvider(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Providers</option>
            {uniqueProviders.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
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
          <label>Coverage Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRules.length === 0 && !loading && !error ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛡️</div>
          <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.3rem' }}>
            No Coverage Rules Found
          </h3>
          <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            This is a general case - no coverage rules found matching your criteria. This is normal if there are no coverage rules in the system or if your filters don't match any rules.
          </p>
        </div>
      ) : filteredRules.length > 0 ? (
        <div className="cards-grid">
          {filteredRules.map((rule) => (
            <div 
              key={rule.id} 
              className={`data-card coverage-rule-card ${expandedRule === rule.id ? 'expanded' : ''}`}
            >
              <div className="coverage-header">
                <div>
                  <h3>{rule.planName}</h3>
                  <p className="coverage-subtitle">{rule.insuranceProvider}</p>
                </div>
                <span className={`status-badge coverage-status ${rule.status.toLowerCase().replace(' ', '-')}`}>
                  {rule.status}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Coverage Type:</strong> {rule.coverageType}</p>
                <p><strong>Plan Type:</strong> {rule.planType}</p>
                {rule.subscriberName && (
                  <p><strong>Subscriber:</strong> {rule.subscriberName}</p>
                )}
                {rule.beneficiaryName && rule.beneficiaryName !== rule.subscriberName && (
                  <p><strong>Beneficiary:</strong> {rule.beneficiaryName}</p>
                )}
                <p><strong>Relationship:</strong> {rule.relationship}</p>
                <p><strong>Network:</strong> {rule.networkType}</p>
                <p><strong>Co-Pay:</strong> {rule.copay}</p>
                <p><strong>Start Date:</strong> {new Date(rule.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {rule.endDate === "Active" ? "Active" : new Date(rule.endDate).toLocaleDateString()}</p>
                
                {rule.rules && rule.rules.length > 0 && (
                  <div className="coverage-rules-section">
                    <button
                      className="rules-toggle-button"
                      onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                    >
                      {expandedRule === rule.id ? '▼ Hide Rules' : '▶ Show Coverage Rules'}
                    </button>
                    
                    {expandedRule === rule.id && (
                      <div className="rules-list">
                        <h4>Coverage Rules:</h4>
                        <ul>
                          {rule.rules.map((ruleText, index) => (
                            <li key={index}>{ruleText}</li>
                          ))}
                        </ul>
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

