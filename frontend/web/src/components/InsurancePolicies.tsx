import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  hospital_type?: string;
}

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  hospitalId: string;
  hospitalName: string;
  provider: string;
  policyType: string;
  coverageType: string;
  status: string;
  effectiveDate: string;
  expiryDate: string;
  coverageLimit: string;
  deductible: string;
  coPay: string;
}

const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'UnitedHealthcare',
  'Kaiser Permanente',
  'Humana',
  'Anthem',
  'Medicare',
  'Medicaid'
];

const POLICY_TYPES = [
  'Health Insurance',
  'Hospital Insurance',
  'Critical Care Insurance',
  'Emergency Coverage',
  'Comprehensive Health Plan'
];

const COVERAGE_TYPES = [
  'In-Network',
  'Out-of-Network',
  'Both',
  'Emergency Only'
];

const STATUSES = ['Active', 'Pending', 'Expired', 'Suspended'];

export default function InsurancePolicies() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchHospitalsAndPolicies();
  }, []);

  const fetchHospitalsAndPolicies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospitals
      const response = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      const hospitalsData = response.data;
      setHospitals(hospitalsData);

      // Generate policies for each hospital
      const generatedPolicies: InsurancePolicy[] = [];
      
      hospitalsData.forEach((hospital: Hospital, index: number) => {
        // Generate 2-4 policies per hospital
        const policyCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < policyCount; i++) {
          const policyId = `POL-${hospital.id}-${i + 1}`;
          const policyNumber = `POL${String(hospital.id).padStart(4, '0')}${String(i + 1).padStart(3, '0')}`;
          
          const effectiveDate = new Date();
          effectiveDate.setMonth(effectiveDate.getMonth() - Math.floor(Math.random() * 12));
          
          const expiryDate = new Date(effectiveDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          
          const coverageLimit = `$${Math.floor(Math.random() * 500000 + 100000).toLocaleString()}`;
          const deductible = `$${Math.floor(Math.random() * 5000 + 500).toLocaleString()}`;
          const coPay = `$${Math.floor(Math.random() * 100 + 20)}`;
          
          generatedPolicies.push({
            id: policyId,
            policyNumber,
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            provider: INSURANCE_PROVIDERS[Math.floor(Math.random() * INSURANCE_PROVIDERS.length)],
            policyType: POLICY_TYPES[Math.floor(Math.random() * POLICY_TYPES.length)],
            coverageType: COVERAGE_TYPES[Math.floor(Math.random() * COVERAGE_TYPES.length)],
            status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
            effectiveDate: effectiveDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            coverageLimit,
            deductible,
            coPay
          });
        }
      });

      setPolicies(generatedPolicies);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const providerMatch = filterProvider === 'all' || policy.provider === filterProvider;
    const statusMatch = filterStatus === 'all' || policy.status === filterStatus;
    return providerMatch && statusMatch;
  });

  const uniqueProviders = Array.from(new Set(policies.map(p => p.provider))).sort();

  if (loading) return <div className="loading">Loading insurance policies...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>🛡️ Insurance Policies ({filteredPolicies.length})</h2>
      
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
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPolicies.length === 0 ? (
        <div className="no-data">
          <p>No policies found matching the selected filters.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredPolicies.map((policy) => (
            <div key={policy.id} className="data-card policy-card">
              <div className="policy-header">
                <h3>{policy.provider}</h3>
                <span className={`status-badge policy-status ${policy.status.toLowerCase().replace(' ', '-')}`}>
                  {policy.status}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Policy Number:</strong> {policy.policyNumber}</p>
                <p><strong>Hospital:</strong> {policy.hospitalName}</p>
                <p><strong>Policy Type:</strong> {policy.policyType}</p>
                <p><strong>Coverage Type:</strong> {policy.coverageType}</p>
                <p><strong>Coverage Limit:</strong> {policy.coverageLimit}</p>
                <p><strong>Deductible:</strong> {policy.deductible}</p>
                <p><strong>Co-Pay:</strong> {policy.coPay}</p>
                <p><strong>Effective Date:</strong> {new Date(policy.effectiveDate).toLocaleDateString()}</p>
                <p><strong>Expiry Date:</strong> {new Date(policy.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


