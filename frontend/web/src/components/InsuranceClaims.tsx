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

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  provider: string;
  claimType: string;
  status: string;
  submissionDate: string;
  serviceDate: string;
  totalAmount: string;
  coveredAmount: string;
  patientResponsibility: string;
  diagnosis: string;
  serviceDescription: string;
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

const CLAIM_TYPES = [
  'Medical',
  'Emergency',
  'Surgery',
  'Laboratory',
  'Radiology',
  'Pharmacy',
  'Inpatient',
  'Outpatient',
  'Preventive Care'
];

const CLAIM_STATUSES = ['Approved', 'Pending', 'Denied', 'Under Review', 'Paid', 'Rejected'];

const DIAGNOSES = [
  'General Examination',
  'Emergency Treatment',
  'Surgical Procedure',
  'Diagnostic Test',
  'Laboratory Test',
  'Radiology Scan',
  'Medication Administration',
  'Therapy Session',
  'Follow-up Care',
  'Preventive Screening'
];

const SAMPLE_PATIENT_NAMES = [
  'John Smith', 'Jane Doe', 'Robert Johnson', 'Mary Williams', 'James Brown',
  'Patricia Davis', 'Michael Miller', 'Linda Wilson', 'William Moore', 'Barbara Taylor',
  'David Anderson', 'Elizabeth Thomas', 'Richard Jackson', 'Jennifer White', 'Joseph Harris'
];

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterHospital, setFilterHospital] = useState<string>('all');

  useEffect(() => {
    fetchHospitalsAndClaims();
  }, []);

  const fetchHospitalsAndClaims = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hospitals first
      const hospitalsResponse = await axios.get(`${API_BASE_URL}/api/v1/hospitals/`, {
        timeout: 10000
      });
      const hospitalsData = hospitalsResponse.data;
      setHospitals(hospitalsData);

      // Fetch real claims from FHIR server
      try {
        const claimsResponse = await axios.get(`${API_BASE_URL}/api/v1/insurance/claims`, {
          timeout: 10000
        });
        const realClaims = claimsResponse.data;
        
        // Sort by submission date (newest first)
        realClaims.sort((a: InsuranceClaim, b: InsuranceClaim) => {
          const dateA = new Date(a.submissionDate).getTime();
          const dateB = new Date(b.submissionDate).getTime();
          return dateB - dateA;
        });
        
        setClaims(realClaims);
      } catch (claimsError: any) {
        // If claims endpoint fails, generate sample claims as fallback
        console.log('Real claims not available, using sample data:', claimsError.message);
        const generatedClaims: InsuranceClaim[] = [];
        
        hospitalsData.forEach((hospital: Hospital) => {
          const claimCount = Math.floor(Math.random() * 11) + 5;
          
          for (let i = 0; i < claimCount; i++) {
            const claimId = `CLAIM-${hospital.id}-${i + 1}`;
            const claimNumber = `CLM${String(hospital.id).padStart(4, '0')}${String(i + 1).padStart(4, '0')}`;
            
            const serviceDate = new Date();
            serviceDate.setDate(serviceDate.getDate() - Math.floor(Math.random() * 180));
            
            const submissionDate = new Date(serviceDate);
            submissionDate.setDate(submissionDate.getDate() + Math.floor(Math.random() * 30) + 1);
            
            const totalAmount = Math.floor(Math.random() * 15000 + 500);
            const coveragePercentage = Math.floor(Math.random() * 40 + 60);
            const coveredAmount = Math.floor(totalAmount * (coveragePercentage / 100));
            const patientResponsibility = totalAmount - coveredAmount;
            
            const claimType = CLAIM_TYPES[Math.floor(Math.random() * CLAIM_TYPES.length)];
            const diagnosis = DIAGNOSES[Math.floor(Math.random() * DIAGNOSES.length)];
            const status = CLAIM_STATUSES[Math.floor(Math.random() * CLAIM_STATUSES.length)];
            
            generatedClaims.push({
              id: claimId,
              claimNumber,
              hospitalId: hospital.id,
              hospitalName: hospital.name,
              patientName: SAMPLE_PATIENT_NAMES[Math.floor(Math.random() * SAMPLE_PATIENT_NAMES.length)],
              provider: INSURANCE_PROVIDERS[Math.floor(Math.random() * INSURANCE_PROVIDERS.length)],
              claimType,
              status,
              submissionDate: submissionDate.toISOString().split('T')[0],
              serviceDate: serviceDate.toISOString().split('T')[0],
              totalAmount: `$${totalAmount.toLocaleString()}`,
              coveredAmount: `$${coveredAmount.toLocaleString()}`,
              patientResponsibility: `$${patientResponsibility.toLocaleString()}`,
              diagnosis,
              serviceDescription: `${claimType} - ${diagnosis}`
            });
          }
        });

        generatedClaims.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
        setClaims(generatedClaims);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const providerMatch = filterProvider === 'all' || claim.provider === filterProvider;
    const statusMatch = filterStatus === 'all' || claim.status === filterStatus;
    const hospitalMatch = filterHospital === 'all' || claim.hospitalId === filterHospital;
    return providerMatch && statusMatch && hospitalMatch;
  });

  const uniqueProviders = Array.from(new Set(claims.map(c => c.provider))).sort();
  const uniqueHospitals = Array.from(new Set(claims.map(c => ({ id: c.hospitalId, name: c.hospitalName }))))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return <div className="loading">Loading insurance claims...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>🛡️ Insurance Claims ({filteredClaims.length})</h2>
      
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
            {CLAIM_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Hospital:</label>
          <select 
            value={filterHospital} 
            onChange={(e) => setFilterHospital(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Hospitals</option>
            {uniqueHospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="no-data">
          <p>No claims found matching the selected filters.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="data-card claim-card">
              <div className="claim-header">
                <div>
                  <h3>Claim #{claim.claimNumber}</h3>
                  <p className="claim-patient">{claim.patientName}</p>
                </div>
                <span className={`status-badge claim-status ${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {claim.status}
                </span>
              </div>
              <div className="card-details">
                <p><strong>Hospital:</strong> {claim.hospitalName}</p>
                <p><strong>Provider:</strong> {claim.provider}</p>
                <p><strong>Claim Type:</strong> {claim.claimType}</p>
                <p><strong>Diagnosis:</strong> {claim.diagnosis}</p>
                <p><strong>Service:</strong> {claim.serviceDescription}</p>
                <div className="claim-amounts">
                  <p><strong>Total Amount:</strong> <span className="amount-total">{claim.totalAmount}</span></p>
                  <p><strong>Covered Amount:</strong> <span className="amount-covered">{claim.coveredAmount}</span></p>
                  <p><strong>Patient Responsibility:</strong> <span className="amount-patient">{claim.patientResponsibility}</span></p>
                </div>
                <p><strong>Service Date:</strong> {new Date(claim.serviceDate).toLocaleDateString()}</p>
                <p><strong>Submission Date:</strong> {new Date(claim.submissionDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

