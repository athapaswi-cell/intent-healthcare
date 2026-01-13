import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import HospitalList from './components/HospitalList';
import PatientList from './components/PatientList';
import PatientListWithAuth from './components/PatientListWithAuth';
import DoctorList from './components/DoctorList';
import DoctorAvailability from './components/DoctorAvailability';
import DoctorSpecializations from './components/DoctorSpecializations';
import HospitalDepartments from './components/HospitalDepartments';
import InsurancePolicies from './components/InsurancePolicies';
import InsuranceClaims from './components/InsuranceClaims';
import InsuranceCoverageRules from './components/InsuranceCoverageRules';
import PatientMedicalHistory from './components/PatientMedicalHistory';
import PatientMedicalHistoryWithAuth from './components/PatientMedicalHistoryWithAuth';
import PatientVisits from './components/PatientVisits';
import PatientVisitsWithAuth from './components/PatientVisitsWithAuth';
import PrescriptionScanner from './components/PrescriptionScanner';
import PharmacyInventory from './components/PharmacyInventory';
import PharmacyFulfillment from './components/PharmacyFulfillment';
import HospitalDetail from './components/HospitalDetail';
import Appointments from './components/Appointments';
import MedicalRecords from './components/MedicalRecords';
import AdminConfiguration from './components/AdminConfiguration';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import InsuranceAgentDashboard from './components/InsuranceAgentDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import ResearchAcademics from './components/ResearchAcademics';
import AdminDashboard from './components/AdminDashboard';
import Messages from './components/Messages';
import BedAvailability from './components/BedAvailability';
import VoiceInterface from './components/VoiceInterface';
import VoiceButton from './components/VoiceButton';
import VoiceNavigation from './components/VoiceNavigation';
import PatientLogin from './components/PatientLogin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface IntentResponse {
  status: string;
  message?: string;
  [key: string]: any;
}

type UserRole = 'clinical' | 'ops' | 'admin';
type NavigationItem = 'dashboard' | 'patients' | 'doctors' | 'appointments' | 'messages' | 'medical-records' | 'settings' | 'insurance' | 'pharmacy' | 'hospitals' | 'admin' | 'policyholders' | 'providers' | 'orders' | 'customers' | 'admissions' | 'research-academics' | 'pharmacy-prescriptions' | 'pharmacy-inventory';
type SubNavItem = 
  | 'patients-list' | 'patients-history' | 'patients-visits'
  | 'doctors-directory' | 'doctors-specializations' | 'doctors-availability'
  | 'insurance-policies' | 'insurance-claims' | 'insurance-coverage'
  | 'pharmacy-prescriptions' | 'pharmacy-inventory' | 'pharmacy-fulfillment'
  | 'hospitals-facilities' | 'hospitals-departments' | 'hospitals-resources'
  | 'admin-users' | 'admin-master-data' | 'admin-integrations' | 'admin-audit';

interface MenuItem {
  id: NavigationItem;
  label: string;
  icon: string;
  roles: UserRole[];
  submenu?: { id: SubNavItem; label: string }[];
  badge?: number | string; // For unread message count, etc.
}

const menuItems: MenuItem[] = [
  {
    id: 'doctors',
    label: 'Doctors',
    icon: '🩺',
    roles: ['clinical', 'admin'],
    submenu: [
      { id: 'doctors-directory', label: 'Doctor Directory' },
      { id: 'doctors-specializations', label: 'Specializations' },
      { id: 'doctors-availability', label: 'Availability' }
    ]
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    roles: ['clinical', 'ops', 'admin']
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: '📅',
    roles: ['clinical', 'ops', 'admin']
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: '👤',
    roles: ['clinical', 'admin'],
    submenu: [
      { id: 'patients-list', label: 'Patient List' },
      { id: 'patients-history', label: 'Medical History' },
      { id: 'patients-visits', label: 'Visits' }
    ]
  },
  {
    id: 'policyholders',
    label: 'Policyholders',
    icon: '👥',
    roles: ['ops'] // Insurance agent specific
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    roles: ['ops', 'admin', 'clinical'],
    submenu: [
      { id: 'insurance-policies', label: 'Policies' },
      { id: 'insurance-claims', label: 'Claims' },
      { id: 'insurance-coverage', label: 'Coverage Rules' }
    ]
  },
  {
    id: 'providers',
    label: 'Providers',
    icon: '🏥',
    roles: ['ops'] // Insurance agent specific
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: '💬',
    roles: ['clinical', 'admin', 'ops']
    // Badge count will be dynamically set from Messages component
  },
  {
    id: 'medical-records',
    label: 'Medical Records',
    icon: '📋',
    roles: ['clinical', 'admin', 'ops']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    roles: ['clinical', 'ops', 'admin']
  },
  {
    id: 'pharmacy-prescriptions',
    label: 'Prescriptions',
    icon: '💊',
    roles: ['ops', 'admin', 'clinical']
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '📦',
    roles: ['ops', 'admin']
  },
  {
    id: 'pharmacy-inventory',
    label: 'Inventory',
    icon: '📋',
    roles: ['ops', 'admin', 'clinical']
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: '👥',
    roles: ['ops', 'admin']
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: '🏥',
    roles: ['clinical', 'admin'],
    submenu: [
      { id: 'hospitals-facilities', label: 'Facilities' },
      { id: 'hospitals-departments', label: 'Departments' },
      { id: 'hospitals-resources', label: 'Beds / Resources' }
    ]
  },
  {
    id: 'admissions',
    label: 'Admissions',
    icon: '🏥',
    roles: ['clinical', 'admin']
  },
  {
    id: 'admin',
    label: 'Admin / Configuration',
    icon: '⚙️',
    roles: ['admin', 'clinical'], // Allow both admin and clinical (patients/doctors) to see this
    submenu: [
      { id: 'admin-users', label: 'Users & Roles' },
      { id: 'admin-master-data', label: 'Master Data' },
      { id: 'admin-integrations', label: 'Integrations' },
      { id: 'admin-audit', label: 'Audit Logs' }
    ]
  }
];

interface AppUser {
  username: string;
  role: 'doctor' | 'patient' | 'insurance-agent' | 'pharmacy' | 'hospital' | 'admin';
  patientId?: string;
  email?: string;
  name?: string;
}

export default function App() {
  // Global login state - don't auto-login from localStorage (always show login page on refresh)
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Default to admin for now
  const [activeNav, setActiveNav] = useState<NavigationItem>('dashboard');
  const [activeSubNav, setActiveSubNav] = useState<SubNavItem | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<NavigationItem>>(new Set(['dashboard']));
  const [loading, setLoading] = useState<string | null>(null);
  const [response, setResponse] = useState<IntentResponse | null>(null);
  const [messagesUnreadCount, setMessagesUnreadCount] = useState<number>(() => {
    // Initialize from localStorage
    const count = localStorage.getItem('messagesUnreadCount');
    return count ? parseInt(count, 10) : 0;
  });
  const [symptoms, setSymptoms] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [healthQuery, setHealthQuery] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Update userRole based on appUser
  useEffect(() => {
    if (appUser?.role === 'doctor') {
      setUserRole('admin'); // Doctors get admin access
    } else if (appUser?.role === 'patient') {
      setUserRole('clinical'); // Patients get clinical access
    } else if (appUser?.role === 'insurance-agent') {
      setUserRole('ops'); // Insurance agents get ops access
    } else if (appUser?.role === 'pharmacy') {
      setUserRole('ops'); // Pharmacy gets ops access
    } else if (appUser?.role === 'hospital') {
      setUserRole('clinical'); // Hospitals get clinical access
    } else if (appUser?.role === 'admin') {
      setUserRole('admin'); // Admins get admin access
    }
  }, [appUser]);

  // Handle global login
  const handleGlobalLogin = (user: AppUser) => {
    setAppUser(user);
    localStorage.setItem('patientPortalUser', JSON.stringify(user));
  };

  // Handle global logout
  const handleGlobalLogout = () => {
    setAppUser(null);
    localStorage.removeItem('patientPortalUser');
    setActiveNav('dashboard');
    setActiveSubNav(null);
  };

  const toggleMenu = (menuId: NavigationItem) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const handleNavClick = (item: NavigationItem) => {
    setActiveNav(item);
    setSelectedHospitalId(null);
    
    const menuItem = menuItems.find(m => m.id === item);
    if (menuItem?.submenu && menuItem.submenu.length > 0) {
      // Auto-expand if has submenu
      if (!expandedMenus.has(item)) {
        setExpandedMenus(new Set([...expandedMenus, item]));
      }
      // Auto-select first submenu item if no subnav is active
      if (!activeSubNav || activeSubNav.split('-')[0] !== item) {
        setActiveSubNav(menuItem.submenu[0].id as SubNavItem);
      }
    } else {
      // If no submenu, clear subnav
      setActiveSubNav(null);
    }
  };

  const handleMenuToggle = (item: NavigationItem) => {
    const menuItem = menuItems.find(m => m.id === item);
    if (menuItem?.submenu) {
      toggleMenu(item);
      setActiveNav(item);
      setSelectedHospitalId(null);
      // Auto-select first submenu item if no subnav is active or if switching to different parent
      if (!activeSubNav || !activeSubNav.startsWith(item)) {
        setActiveSubNav(menuItem.submenu[0].id as SubNavItem);
      }
    }
  };

  const handleSubNavClick = (subItem: SubNavItem, parentItem: NavigationItem) => {
    setActiveSubNav(subItem);
    setActiveNav(parentItem);
    setSelectedHospitalId(null);
  };

  const executeIntent = async (intentName: string, payload: any) => {
    setLoading(intentName);
    setResponse(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/intent/execute`, {
        intent: { name: intentName },
        actor: { type: 'PATIENT' },
        payload
      }, {
        timeout: 10000
      });
      setResponse(response.data);
    } catch (error: any) {
      let errorMessage = 'Failed to execute intent';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        errorMessage = 'Backend server is not running. Please start the backend server on port 8000.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setResponse({
        status: 'ERROR',
        message: errorMessage,
        error_code: error.code,
        backend_url: API_BASE_URL
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEmergency = () => {
    if (confirm('Are you experiencing a medical emergency? This will alert emergency services.')) {
      executeIntent('PATIENT_EMERGENCY_HELP', {
        symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
        location: 'Patient Location',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleSymptomReport = () => {
    if (!symptoms.trim()) {
      alert('Please enter your symptoms');
      return;
    }
    executeIntent('PATIENT_SYMPTOM_REPORT', {
      symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
      severity: 'moderate',
      duration: 'recent'
    });
  };

  const handleScheduleAppointment = () => {
    const date = appointmentDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    executeIntent('SCHEDULE_APPOINTMENT', {
      preferred_date: date,
      reason: 'General consultation',
      doctor_preference: 'Any available'
    });
  };

  const handlePrescriptionRefill = () => {
    executeIntent('REQUEST_PRESCRIPTION_REFILL', {
      medication_name: 'Requested medication',
      pharmacy: 'Preferred pharmacy'
    });
  };

  const handleTelehealth = () => {
    executeIntent('REQUEST_TELEHEALTH_CONSULTATION', {
      preferred_time: 'Anytime',
      reason: 'Consultation needed'
    });
  };

  const handleHealthQuery = () => {
    if (!healthQuery.trim()) {
      alert('Please enter your health question');
      return;
    }
    executeIntent('HEALTH_QUERY', {
      query: healthQuery
    });
  };

  const handleViewRecords = () => {
    executeIntent('VIEW_MEDICAL_RECORDS', {});
  };

  const handleViewLabResults = () => {
    executeIntent('VIEW_LAB_RESULTS', {});
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string, transcript: string) => {
    speak(`Processing ${command.replace('_', ' ')} command`);
    
    switch (command) {
      case 'emergency':
        handleEmergency();
        break;
      case 'schedule_appointment':
        handleScheduleAppointment();
        break;
      case 'report_symptoms':
        if (transcript.includes('pain') || transcript.includes('hurt') || transcript.includes('sick')) {
          setSymptoms(transcript);
          handleSymptomReport();
        } else {
          speak('Please describe your symptoms');
        }
        break;
      case 'prescription_refill':
        handlePrescriptionRefill();
        break;
      case 'telehealth':
        handleTelehealth();
        break;
      case 'view_records':
        handleViewRecords();
        break;
      case 'lab_results':
        handleViewLabResults();
        break;
      case 'view_doctors':
        handleNavClick('doctors');
        break;
      case 'view_hospitals':
        handleNavClick('hospitals');
        break;
      case 'view_beds':
      case 'bed_availability':
        handleNavClick('hospitals');
        handleSubNavClick('hospitals-resources', 'hospitals');
        break;
      case 'view_patients':
        handleNavClick('patients');
        break;
      case 'dashboard':
        handleNavClick('dashboard');
        break;
      case 'stop_listening':
        setIsListening(false);
        speak('Voice recognition stopped');
        break;
      case 'general_query':
        setHealthQuery(transcript);
        handleHealthQuery();
        break;
      default:
        speak('Command not recognized. Please try again.');
    }
  };

  const handleVoiceInput = (input: string) => {
    // Handle general voice input for forms
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('symptom') || lowerInput.includes('pain') || lowerInput.includes('hurt')) {
      setSymptoms(input);
    } else if (lowerInput.includes('question') || lowerInput.includes('ask')) {
      setHealthQuery(input);
    }
  };

  const handleVoiceNavigation = (section: string) => {
    handleNavClick(section as NavigationItem);
  };

  const renderContent = () => {
    if (selectedHospitalId) {
      return (
        <HospitalDetail 
          hospitalId={selectedHospitalId} 
          onBack={() => {
            setSelectedHospitalId(null);
            setActiveNav('hospitals');
          }} 
        />
      );
    }

    // Handle submenu navigation
    if (activeSubNav) {
      if (activeSubNav === 'patients-list') {
        return <PatientListWithAuth />;
      }
      if (activeSubNav === 'patients-history') {
        return <PatientMedicalHistoryWithAuth />;
      }
      if (activeSubNav === 'patients-visits') {
        return <PatientVisitsWithAuth />;
      }
      if (activeSubNav.startsWith('doctors-directory')) {
        return <DoctorList />;
      }
      if (activeSubNav.startsWith('hospitals-facilities')) {
        return <HospitalList onSelectHospital={setSelectedHospitalId} />;
      }
      // Other submenu items would render here
    }
    
    // If activeNav is 'patients' but no subnav selected, default to patients-list
    if (activeNav === 'patients' && !activeSubNav) {
      return <PatientListWithAuth />;
    }

    switch (activeNav) {
      case 'dashboard':
        // Show different dashboard based on user role
        if (appUser?.role === 'doctor') {
          return <DoctorDashboard user={appUser} onNavigate={handleNavClick} />;
        } else if (appUser?.role === 'insurance-agent') {
          return <InsuranceAgentDashboard user={appUser} onNavigate={handleNavClick} />;
        } else if (appUser?.role === 'hospital') {
          return <HospitalDashboard user={appUser} onNavigate={handleNavClick} />;
        } else if (appUser?.role === 'pharmacy') {
          return <PharmacyDashboard user={appUser} onNavigate={handleNavClick} />;
        } else if (appUser?.role === 'admin') {
          return <AdminDashboard user={appUser} onNavigate={handleNavClick} />;
        } else {
          return <PatientDashboard user={appUser} onNavigate={handleNavClick} />;
        }
        
        // Fallback - old dashboard (if needed)
        return (
          <>
            <VoiceNavigation 
              onNavigate={handleVoiceNavigation}
              currentSection={activeNav}
            />
            
            <section className="intent-section">
              <h2>📅 Appointments</h2>
              <div className="intent-grid">
                <div className="intent-card">
                  <h3>Schedule Appointment</h3>
                  <p>Book a visit with your doctor</p>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="date-input"
                  />
                  <VoiceButton
                    onClick={handleScheduleAppointment}
                    disabled={loading === 'SCHEDULE_APPOINTMENT'}
                    className="btn-primary"
                    voiceCommand="Scheduling your appointment"
                    ariaLabel="Schedule appointment"
                  >
                    {loading === 'SCHEDULE_APPOINTMENT' ? 'Scheduling...' : '📅 Schedule'}
                  </VoiceButton>
                </div>
                <div className="intent-card">
                  <h3>Telehealth Consultation</h3>
                  <p>Request a virtual visit</p>
                  <VoiceButton
                    onClick={handleTelehealth}
                    disabled={loading === 'REQUEST_TELEHEALTH_CONSULTATION'}
                    className="btn-primary"
                    voiceCommand="Requesting telehealth consultation"
                    ariaLabel="Request telehealth consultation"
                  >
                    {loading === 'REQUEST_TELEHEALTH_CONSULTATION' ? 'Processing...' : '💻 Request Consultation'}
                  </VoiceButton>
                </div>
              </div>
            </section>

            <section className="intent-section">
              <h2>🚨 Emergency & Health</h2>
              <div className="intent-grid">
                <div className="intent-card emergency-card">
                  <h3>Emergency Help</h3>
                  <p>Get immediate medical assistance</p>
                  <textarea
                    placeholder="Describe your symptoms (optional)..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="symptoms-input"
                    rows={2}
                  />
                  <VoiceButton
                    onClick={handleEmergency}
                    disabled={loading === 'PATIENT_EMERGENCY_HELP'}
                    className="btn-danger"
                    voiceCommand="Activating emergency services"
                    ariaLabel="Emergency help"
                  >
                    {loading === 'PATIENT_EMERGENCY_HELP' ? 'Alerting...' : '🚨 Emergency Help'}
                  </VoiceButton>
                </div>
                <div className="intent-card">
                  <h3>Report Symptoms</h3>
                  <p>Tell us how you're feeling</p>
                  <textarea
                    placeholder="Enter your symptoms..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="symptoms-input"
                    rows={3}
                  />
                  <VoiceButton
                    onClick={handleSymptomReport}
                    disabled={loading === 'PATIENT_SYMPTOM_REPORT'}
                    className="btn-warning"
                    voiceCommand="Recording your symptoms"
                    ariaLabel="Report symptoms"
                  >
                    {loading === 'PATIENT_SYMPTOM_REPORT' ? 'Processing...' : '🩺 Report Symptoms'}
                  </VoiceButton>
                </div>
              </div>
            </section>

            <section className="intent-section">
              <h2>❓ Health Questions</h2>
              <div className="intent-card">
                <h3>Ask a Health Question</h3>
                <p>Get information about your health concerns</p>
                <textarea
                  placeholder="Enter your health question..."
                  value={healthQuery}
                  onChange={(e) => setHealthQuery(e.target.value)}
                  className="query-input"
                  rows={3}
                />
                <VoiceButton
                  onClick={handleHealthQuery}
                  disabled={loading === 'HEALTH_QUERY'}
                  className="btn-info"
                  voiceCommand="Processing your health question"
                  ariaLabel="Ask health question"
                >
                  {loading === 'HEALTH_QUERY' ? 'Processing...' : '❓ Ask Question'}
                </VoiceButton>
              </div>
            </section>

            <section className="intent-section">
              <h2>📋 Medical Records</h2>
              <div className="intent-grid">
                <div className="intent-card">
                  <h3>View Medical Records</h3>
                  <p>Access your medical history</p>
                  <VoiceButton
                    onClick={handleViewRecords}
                    disabled={loading === 'VIEW_MEDICAL_RECORDS'}
                    className="btn-secondary"
                    voiceCommand="Opening your medical records"
                    ariaLabel="View medical records"
                  >
                    {loading === 'VIEW_MEDICAL_RECORDS' ? 'Loading...' : '📋 View Records'}
                  </VoiceButton>
                </div>
                <div className="intent-card">
                  <h3>Lab Results</h3>
                  <p>Check your latest test results</p>
                  <VoiceButton
                    onClick={handleViewLabResults}
                    disabled={loading === 'VIEW_LAB_RESULTS'}
                    className="btn-secondary"
                    voiceCommand="Retrieving your lab results"
                    ariaLabel="View lab results"
                  >
                    {loading === 'VIEW_LAB_RESULTS' ? 'Loading...' : '🧪 Lab Results'}
                  </VoiceButton>
                </div>
                <div className="intent-card">
                  <h3>Prescription Refill</h3>
                  <p>Request medication refills</p>
                  <VoiceButton
                    onClick={handlePrescriptionRefill}
                    disabled={loading === 'REQUEST_PRESCRIPTION_REFILL'}
                    className="btn-success"
                    voiceCommand="Requesting prescription refill"
                    ariaLabel="Request prescription refill"
                  >
                    {loading === 'REQUEST_PRESCRIPTION_REFILL' ? 'Processing...' : '💊 Refill Prescription'}
                  </VoiceButton>
                </div>
              </div>
            </section>

            {response && (
              <section className="response-section">
                <h2>Response</h2>
                <div className={`response-card ${response.status === 'ERROR' ? 'error' : 'success'}`}>
                  <h3>Status: {response.status}</h3>
                  {response.message && <p>{response.message}</p>}
                  {response.risk && (
                    <div className="risk-info">
                      <p><strong>Risk Score:</strong> {response.risk.risk_score}/100</p>
                      <p><strong>Severity:</strong> {response.risk.severity}</p>
                      <p><strong>Recommendation:</strong> {response.risk.recommended_action}</p>
                    </div>
                  )}
                  {response.appointment_id && <p><strong>Appointment ID:</strong> {response.appointment_id}</p>}
                  {response.appointment_date && <p><strong>Appointment Date:</strong> {response.appointment_date}</p>}
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              </section>
            )}
          </>
        );

      case 'patients':
        // Default to patients-list if no subnav is selected
        if (!activeSubNav || activeSubNav === 'patients-list') {
          return <PatientListWithAuth />;
        } else if (activeSubNav === 'patients-history') {
          return <PatientMedicalHistoryWithAuth />;
        } else if (activeSubNav === 'patients-visits') {
          return <PatientVisitsWithAuth />;
        } else {
          return (
            <section className="intent-section">
              <h2>👤 Patients - {menuItems.find(m => m.id === 'patients')?.submenu?.find(s => s.id === activeSubNav)?.label}</h2>
              <div className="intent-card">
                <p className="info-text">Feature coming soon...</p>
              </div>
            </section>
          );
        }

      case 'doctors':
        if (activeSubNav === 'doctors-availability') {
          return <DoctorAvailability />;
        } else if (activeSubNav === 'doctors-specializations') {
          return <DoctorSpecializations />;
        } else if (activeSubNav === 'doctors-directory' || !activeSubNav) {
          return <DoctorList />;
        } else {
          return (
            <section className="intent-section">
              <h2>🩺 Doctors - {menuItems.find(m => m.id === 'doctors')?.submenu?.find(s => s.id === activeSubNav)?.label}</h2>
              <div className="intent-card">
                <p className="info-text">Feature coming soon...</p>
              </div>
            </section>
          );
        }

      case 'policyholders':
        return (
          <section className="intent-section">
            <h2>👥 Policyholders</h2>
            <div className="intent-card">
              <p className="info-text">Policyholder management features coming soon...</p>
            </div>
          </section>
        );

      case 'insurance':
        if (activeSubNav === 'insurance-policies') {
          return <InsurancePolicies />;
        } else if (activeSubNav === 'insurance-claims') {
          return <InsuranceClaims />;
        } else if (activeSubNav === 'insurance-coverage') {
          return <InsuranceCoverageRules />;
        } else {
          return (
            <section className="intent-section">
              <h2>📋 Claims - {activeSubNav ? menuItems.find(m => m.id === 'insurance')?.submenu?.find(s => s.id === activeSubNav)?.label : 'Overview'}</h2>
              <div className="intent-card">
                <p className="info-text">Claims management features coming soon...</p>
              </div>
            </section>
          );
        }

      case 'providers':
        return (
          <section className="intent-section">
            <h2>🏥 Providers</h2>
            <div className="intent-card">
              <p className="info-text">Provider management features coming soon...</p>
            </div>
          </section>
        );

      case 'pharmacy-prescriptions':
        return <PrescriptionScanner />;

      case 'orders':
        return (
          <section className="intent-section">
            <h2>📦 Orders</h2>
            <div className="intent-card">
              <p className="info-text">Order management features coming soon...</p>
            </div>
          </section>
        );

      case 'pharmacy-inventory':
        return <PharmacyInventory />;

      case 'customers':
        return (
          <section className="intent-section">
            <h2>👥 Customers</h2>
            <div className="intent-card">
              <p className="info-text">Customer management features coming soon...</p>
            </div>
          </section>
        );

      case 'hospitals':
        if (activeSubNav === 'hospitals-facilities' || !activeSubNav) {
          return <HospitalList onSelectHospital={setSelectedHospitalId} />;
        } else if (activeSubNav === 'hospitals-departments') {
          return <HospitalDepartments />;
        } else if (activeSubNav === 'hospitals-resources') {
          return <BedAvailability />;
        } else {
          return (
            <section className="intent-section">
              <h2>🏥 Hospitals - {menuItems.find(m => m.id === 'hospitals')?.submenu?.find(s => s.id === activeSubNav)?.label}</h2>
              <div className="intent-card">
                <p className="info-text">Feature coming soon...</p>
              </div>
            </section>
          );
        }

      case 'admissions':
        return (
          <section className="intent-section">
            <h2>🏥 Admissions</h2>
            <div className="intent-card">
              <p className="info-text">Patient admissions management features coming soon...</p>
            </div>
          </section>
        );

      case 'appointments':
        return <Appointments />;

      case 'messages':
        return <Messages />;

      case 'medical-records':
        return <MedicalRecords />;

      case 'settings':
        return (
          <section className="intent-section">
            <h2>⚙️ Settings</h2>
            <div className="intent-card">
              <p className="info-text">Settings feature coming soon...</p>
            </div>
          </section>
        );

      case 'admin':
        // Show Admin Configuration cards grid
        return <AdminConfiguration />;

      case 'research-academics':
        return <ResearchAcademics user={appUser} onNavigate={handleNavClick} />;

      default:
        return null;
    }
  };

  // Login Details Card Component (reusable)
  const LoginDetailsCard = ({ appUser }: { appUser: AppUser | null }) => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentUserDetails = registeredUsers.find((u: any) => u.username === appUser?.username) || appUser;
    
    // Get name from various sources
    const displayName = appUser?.name || 
      (currentUserDetails?.firstName || currentUserDetails?.lastName 
        ? `${currentUserDetails?.firstName || ''} ${currentUserDetails?.lastName || ''}`.trim()
        : appUser?.username || 'N/A');
    
    return (
      <div className="data-card" style={{ 
        padding: '25px', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1976D2', borderBottom: '2px solid #E3F2FD', paddingBottom: '10px' }}>
          👤 Current Login Details
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
              <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Name:</strong>
              <span style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{displayName}</span>
            </p>
            
            <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
              <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Role:</strong>
              <span style={{ 
                fontSize: '1.1rem', 
                color: appUser?.role === 'doctor' ? '#1976D2' : '#4CAF50',
                fontWeight: 'bold'
              }}>
                {appUser?.role === 'doctor' ? '👨‍⚕️ Doctor' : '👤 Patient'}
              </span>
            </p>
          </div>
          
          <div>
            <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
              <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Username:</strong>
              <span style={{ fontSize: '1.1rem', color: '#333' }}>{appUser?.username || 'N/A'}</span>
            </p>
            
            <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
              <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Email:</strong>
              <span style={{ fontSize: '1.1rem', color: '#333' }}>
                {appUser?.email || currentUserDetails?.email || 'N/A'}
              </span>
            </p>
          </div>
          
          {appUser?.patientId && (
            <div>
              <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Patient ID:</strong>
                <span style={{ fontSize: '1.1rem', color: '#333' }}>{appUser.patientId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Master Data Component to fetch and display login details
  const MasterDataSection = ({ appUser }: { appUser: AppUser | null }) => {
    const [doctorDetails, setDoctorDetails] = useState<any>(null);
    const [loadingDoctor, setLoadingDoctor] = useState(false);
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentUserDetails = registeredUsers.find((u: any) => u.username === appUser?.username) || appUser;
    
    useEffect(() => {
      // Fetch doctor details if logged in as doctor
      if (appUser?.role === 'doctor') {
        setLoadingDoctor(true);
        axios.get(`${API_BASE_URL}/api/v1/doctors/`, { timeout: 5000 })
          .then(response => {
            const doctors = response.data || [];
            const doctorUsername = appUser?.username?.toLowerCase() || '';
            const doctorName = appUser?.name?.toLowerCase() || '';
            
            // Find matching doctor
            const matchedDoctor = doctors.find((d: any) => {
              const docFirst = (d.first_name || '').toLowerCase();
              const docLast = (d.last_name || '').toLowerCase();
              const docFullName = `${docFirst} ${docLast}`.trim();
              const docEmail = (d.email || '').toLowerCase();
              
              return doctorUsername && (
                docEmail.includes(doctorUsername) ||
                doctorUsername.includes(docEmail) ||
                docFullName.includes(doctorName) ||
                doctorName.includes(docFullName) ||
                docFullName.includes(doctorUsername)
              );
            });
            
            if (matchedDoctor) {
              setDoctorDetails(matchedDoctor);
            }
            setLoadingDoctor(false);
          })
          .catch(err => {
            console.error('Error fetching doctor details:', err);
            setLoadingDoctor(false);
          });
      }
    }, [appUser]);
    
    // Get name from various sources
    const displayName = appUser?.role === 'doctor' && doctorDetails
      ? `${doctorDetails.first_name || ''} ${doctorDetails.last_name || ''}`.trim()
      : (appUser?.name || 
         (currentUserDetails?.firstName || currentUserDetails?.lastName 
           ? `${currentUserDetails?.firstName || ''} ${currentUserDetails?.lastName || ''}`.trim()
           : appUser?.username || 'N/A'));
    
    return (
      <section className="intent-section">
        <h2>⚙️ Admin / Configuration - Master Data</h2>
        
        {/* Show login details card */}
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <LoginDetailsCard appUser={appUser} />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <div className="data-card" style={{ 
            padding: '25px', 
            background: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1976D2', borderBottom: '2px solid #E3F2FD', paddingBottom: '10px' }}>
              👨‍⚕️ Professional Details {appUser?.role === 'doctor' ? '(Doctor Only)' : '(Not Available)'}
            </h3>
            
            {appUser?.role === 'doctor' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div>
                  <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                    <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Designation:</strong>
                    <span style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                      {loadingDoctor ? 'Loading...' : (doctorDetails?.qualification || doctorDetails?.license_number || 'N/A')}
                    </span>
                  </p>
                  
                  <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                    <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Specialization:</strong>
                    <span style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                      {loadingDoctor ? 'Loading...' : (doctorDetails?.specialization || 'N/A')}
                    </span>
                  </p>
                  
                  <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                    <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Years of Experience:</strong>
                    <span style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                      {loadingDoctor ? 'Loading...' : (doctorDetails?.experience_years !== null && doctorDetails?.experience_years !== undefined 
                        ? `${doctorDetails.experience_years} years`
                        : 'N/A')}
                    </span>
                  </p>
                </div>
                
                <div>
                  {doctorDetails?.email && (
                    <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Professional Email:</strong>
                      <span style={{ fontSize: '1.1rem', color: '#333' }}>{doctorDetails.email}</span>
                    </p>
                  )}
                  
                  {doctorDetails?.phone && (
                    <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>Phone:</strong>
                      <span style={{ fontSize: '1.1rem', color: '#333' }}>{doctorDetails.phone}</span>
                    </p>
                  )}
                  
                  {doctorDetails?.license_number && (
                    <p style={{ margin: '10px 0', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#666', display: 'block', marginBottom: '5px' }}>License Number:</strong>
                      <span style={{ fontSize: '1.1rem', color: '#333' }}>{doctorDetails.license_number}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Professional details are only available for doctors.</p>
            )}
          </div>
        </div>
      </section>
    );
  };

  // Show login page if user is not logged in
  if (!appUser) {
    return (
      <div className="medical-app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <PatientLogin onLogin={handleGlobalLogin} />
      </div>
    );
  }

  // Filter menu items based on role
  let visibleMenuItems = menuItems.filter(item => {
    // Hide Doctors module if logged in as a doctor
    if (item.id === 'doctors' && appUser?.role === 'doctor') {
      return false;
    }
    // Hide Appointments and Pharmacy modules if logged in as insurance agent
    if ((item.id === 'appointments' || item.id === 'pharmacy' || item.id === 'pharmacy-prescriptions' || item.id === 'pharmacy-inventory') && appUser?.role === 'insurance-agent') {
      return false;
    }
    
    // For patients, only show specific modules
    if (appUser?.role === 'patient') {
      const allowedPatientModules = ['dashboard', 'appointments', 'doctors', 'hospitals', 'pharmacy', 'insurance', 'settings'];
      return allowedPatientModules.includes(item.id);
    }
    
    // For pharmacy, only show specific modules
    if (appUser?.role === 'pharmacy') {
      const allowedPharmacyModules = ['dashboard', 'pharmacy-prescriptions', 'orders', 'pharmacy-inventory', 'customers', 'doctors', 'settings'];
      return allowedPharmacyModules.includes(item.id);
    }
    
    // For hospital, only show specific modules
    if (appUser?.role === 'hospital') {
      const allowedHospitalModules = ['dashboard', 'patients', 'admissions', 'appointments', 'doctors', 'settings'];
      return allowedHospitalModules.includes(item.id);
    }
    
    // For admin, only show specific modules
    if (appUser?.role === 'admin') {
      const allowedAdminModules = ['dashboard', 'patients', 'doctors', 'insurance', 'hospitals', 'pharmacy', 'admin', 'research-academics'];
      return allowedAdminModules.includes(item.id);
    }
    
    return item.roles.includes(userRole);
  });

  // Sort menu items for patients in the specified order
  if (appUser?.role === 'patient') {
    const patientModuleOrder = ['dashboard', 'appointments', 'doctors', 'hospitals', 'pharmacy', 'insurance', 'settings'];
    visibleMenuItems = visibleMenuItems.sort((a, b) => {
      const indexA = patientModuleOrder.indexOf(a.id);
      const indexB = patientModuleOrder.indexOf(b.id);
      // If module not found in order array, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  // Sort menu items for pharmacy in the specified order
  if (appUser?.role === 'pharmacy') {
    const pharmacyModuleOrder = ['dashboard', 'pharmacy-prescriptions', 'orders', 'pharmacy-inventory', 'customers', 'doctors', 'settings'];
    visibleMenuItems = visibleMenuItems.sort((a, b) => {
      const indexA = pharmacyModuleOrder.indexOf(a.id);
      const indexB = pharmacyModuleOrder.indexOf(b.id);
      // If module not found in order array, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  // Sort menu items for hospital in the specified order
  if (appUser?.role === 'hospital') {
    const hospitalModuleOrder = ['dashboard', 'patients', 'admissions', 'appointments', 'doctors', 'settings'];
    visibleMenuItems = visibleMenuItems.sort((a, b) => {
      const indexA = hospitalModuleOrder.indexOf(a.id);
      const indexB = hospitalModuleOrder.indexOf(b.id);
      // If module not found in order array, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  // Sort menu items for admin in the specified order
  if (appUser?.role === 'admin') {
    const adminModuleOrder = ['dashboard', 'patients', 'doctors', 'insurance', 'hospitals', 'pharmacy', 'admin', 'research-academics'];
    visibleMenuItems = visibleMenuItems.sort((a, b) => {
      const indexA = adminModuleOrder.indexOf(a.id);
      const indexB = adminModuleOrder.indexOf(b.id);
      // If module not found in order array, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  return (
    <div className="medical-app">
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>{appUser?.role === 'doctor' ? '🩺 Doctors' : '🏥 Healthcare'}</h1>
            {appUser && (
              <div className="user-info-sidebar">
                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                  <strong>{appUser.name || appUser.username}</strong>
                </p>
                <p style={{ margin: '5px 0', fontSize: '0.85rem', opacity: 0.9 }}>
                  {appUser.role === 'doctor' ? 'Doctor' : 'Patient'}
                </p>
                <button 
                  onClick={handleGlobalLogout}
                  className="logout-btn-sidebar"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <nav className="sidebar-nav">
            {visibleMenuItems.map((item) => (
              <div key={item.id} className="nav-menu-item">
                <button
                  className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => item.submenu ? handleMenuToggle(item.id) : handleNavClick(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
                
                {item.submenu && expandedMenus.has(item.id) && (
                  <div className="submenu">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        className={`submenu-item ${activeSubNav === subItem.id ? 'active' : ''}`}
                        onClick={() => handleSubNavClick(subItem.id, item.id)}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <div className="content-wrapper">
            {/* Header with Logout Button */}
            <div className="main-content-header">
              <div className="header-left">
                <h2 className="page-title">
                  {menuItems.find(m => m.id === activeNav)?.label || 'Dashboard'}
                  {activeSubNav && (
                    <span className="subtitle">
                      {' - '}
                      {menuItems.find(m => m.id === activeNav)?.submenu?.find(s => s.id === activeSubNav)?.label}
                    </span>
                  )}
                </h2>
              </div>
              <div className="header-right">
                {appUser && (
                  <div className="user-info-header">
                    <span className="user-name-header">{appUser.name || appUser.username}</span>
                    <span className="user-role-header">
                      {appUser.role === 'doctor' ? '👨‍⚕️ Doctor' : 
                       appUser.role === 'patient' ? '👤 Patient' :
                       appUser.role === 'insurance-agent' ? '🛡️ Insurance Agent' :
                       appUser.role === 'pharmacy' ? '💊 Pharmacy' :
                       appUser.role === 'hospital' ? '🏥 Hospital' :
                       appUser.role === 'admin' ? '👑 Admin' : appUser.role}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleGlobalLogout}
                  className="logout-btn-header"
                  title="Logout"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
      
      {voiceEnabled && (
        <VoiceInterface
          onVoiceCommand={handleVoiceCommand}
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          setIsListening={setIsListening}
        />
      )}
    </div>
  );
}
