// Mock data service for when backend is not available
export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  emergency_phone?: string;
  hospital_type?: string;
  total_beds?: number;
  icu_beds?: number;
  specialties: string[];
  facilities: string[];
  operating_hours?: string;
  rating?: number;
  trauma_level?: string;
}

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification: string;
  email?: string;
  phone?: string;
  hospital_id?: string;
  department?: string;
  experience_years?: number;
  consultation_fee?: number;
  availability?: string;
  languages: string[];
  rating?: number;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  blood_type?: string;
  allergies: string[];
  medical_history: string[];
  insurance_provider?: string;
}

export interface BedData {
  id: string;
  hospital_id: string;
  hospital_name: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  icu_beds: number;
  occupied_icu: number;
  available_icu: number;
  emergency_beds: number;
  available_emergency: number;
  surgery_rooms: number;
  available_surgery: number;
  occupancy_rate: number;
  icu_occupancy_rate: number;
  last_updated: string;
  status: 'Normal' | 'High' | 'Critical';
}

// Mock data
const mockHospitals: Hospital[] = [
  {
    id: "1",
    name: "Mayo Clinic",
    address: "200 First Street SW",
    city: "Rochester",
    state: "MN",
    phone: "+1-507-284-2511",
    emergency_phone: "+1-507-284-2511",
    hospital_type: "Academic Medical Center",
    total_beds: 1265,
    icu_beds: 150,
    specialties: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Gastroenterology", "Endocrinology"],
    facilities: ["ICU", "Emergency", "Laboratory", "Pharmacy", "Radiology", "Surgery", "Cardiac Cath Lab", "MRI", "CT Scan"],
    operating_hours: "24/7",
    rating: 4.9,
    trauma_level: "Level I"
  },
  {
    id: "2",
    name: "Johns Hopkins Hospital",
    address: "1800 Orleans Street",
    city: "Baltimore",
    state: "MD",
    phone: "+1-410-955-5000",
    emergency_phone: "+1-410-955-6070",
    hospital_type: "Academic Medical Center",
    total_beds: 1154,
    icu_beds: 180,
    specialties: ["Neurosurgery", "Cardiology", "Oncology", "Pediatrics", "Psychiatry", "Rheumatology"],
    facilities: ["ICU", "Emergency", "Laboratory", "Pharmacy", "Radiology", "Surgery", "NICU", "Burn Center"],
    operating_hours: "24/7",
    rating: 4.8,
    trauma_level: "Level I"
  },
  {
    id: "3",
    name: "Cleveland Clinic",
    address: "9500 Euclid Avenue",
    city: "Cleveland",
    state: "OH",
    phone: "+1-216-444-2200",
    emergency_phone: "+1-216-444-7000",
    hospital_type: "Academic Medical Center",
    total_beds: 1285,
    icu_beds: 160,
    specialties: ["Cardiology", "Neurology", "Urology", "Gastroenterology", "Orthopedics", "Dermatology"],
    facilities: ["ICU", "Emergency", "Laboratory", "Pharmacy", "Radiology", "Surgery", "Heart Center", "Cancer Center"],
    operating_hours: "24/7",
    rating: 4.7,
    trauma_level: "Level I"
  },
  {
    id: "4",
    name: "Massachusetts General Hospital",
    address: "55 Fruit Street",
    city: "Boston",
    state: "MA",
    phone: "+1-617-726-2000",
    emergency_phone: "+1-617-726-7000",
    hospital_type: "Academic Medical Center",
    total_beds: 999,
    icu_beds: 140,
    specialties: ["Emergency Medicine", "Surgery", "Internal Medicine", "Pediatrics", "Psychiatry", "Radiology"],
    facilities: ["ICU", "Emergency", "Laboratory", "Pharmacy", "Radiology", "Surgery", "Trauma Center", "Burn Unit"],
    operating_hours: "24/7",
    rating: 4.6,
    trauma_level: "Level I"
  },
  {
    id: "5",
    name: "Cedars-Sinai Medical Center",
    address: "8700 Beverly Boulevard",
    city: "Los Angeles",
    state: "CA",
    phone: "+1-310-423-3277",
    emergency_phone: "+1-310-423-8780",
    hospital_type: "Non-profit Academic",
    total_beds: 886,
    icu_beds: 120,
    specialties: ["Cardiology", "Oncology", "Neurology", "Gastroenterology", "Orthopedics", "Women's Health"],
    facilities: ["ICU", "Emergency", "Laboratory", "Pharmacy", "Radiology", "Surgery", "Heart Institute", "Cancer Center"],
    operating_hours: "24/7",
    rating: 4.5,
    trauma_level: "Level II"
  }
];

const mockDoctors: Doctor[] = [
  {
    id: "1",
    first_name: "Sarah",
    last_name: "Johnson",
    specialization: "Cardiology",
    qualification: "MD, FACC",
    email: "sarah.johnson@mayoclinic.org",
    phone: "+1-507-284-1001",
    hospital_id: "1",
    department: "Cardiology",
    experience_years: 15,
    languages: ["English", "Spanish"],
    consultation_fee: 350,
    availability: "Available",
    rating: 4.8
  },
  {
    id: "2",
    first_name: "Michael",
    last_name: "Chen",
    specialization: "Emergency Medicine",
    qualification: "MD, FACEP",
    email: "michael.chen@hopkinsmedicine.org",
    phone: "+1-410-955-1002",
    hospital_id: "2",
    department: "Emergency Medicine",
    experience_years: 12,
    languages: ["English", "Mandarin"],
    consultation_fee: 250,
    availability: "Available",
    rating: 4.7
  },
  {
    id: "3",
    first_name: "Emily",
    last_name: "Rodriguez",
    specialization: "Pediatrics",
    qualification: "MD, FAAP",
    email: "emily.rodriguez@clevelandclinic.org",
    phone: "+1-216-444-1003",
    hospital_id: "3",
    department: "Pediatrics",
    experience_years: 8,
    languages: ["English", "Spanish"],
    consultation_fee: 200,
    availability: "Available",
    rating: 4.9
  }
];

const mockPatients: Patient[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    date_of_birth: "1985-05-15",
    gender: "M",
    email: "john.doe@email.com",
    phone: "+1-555-3001",
    blood_type: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medical_history: ["Hypertension", "Type 2 Diabetes"],
    insurance_provider: "Blue Cross Blue Shield"
  },
  {
    id: "2",
    first_name: "Maria",
    last_name: "Garcia",
    date_of_birth: "1990-08-22",
    gender: "F",
    email: "maria.garcia@email.com",
    phone: "+1-555-3003",
    blood_type: "A+",
    allergies: ["Latex"],
    medical_history: ["Asthma"],
    insurance_provider: "Aetna"
  }
];

// Generate realistic bed data
const generateBedData = (): BedData[] => {
  return mockHospitals.map(hospital => {
    const occupancyRate = Math.random() * 0.25 + 0.70; // 70-95%
    const icuOccupancyRate = Math.random() * 0.23 + 0.75; // 75-98%
    
    const occupiedBeds = Math.floor(hospital.total_beds! * occupancyRate);
    const occupiedIcu = Math.floor(hospital.icu_beds! * icuOccupancyRate);
    
    return {
      id: `bed-${hospital.id}`,
      hospital_id: hospital.id,
      hospital_name: hospital.name,
      total_beds: hospital.total_beds!,
      occupied_beds: occupiedBeds,
      available_beds: hospital.total_beds! - occupiedBeds,
      icu_beds: hospital.icu_beds!,
      occupied_icu: occupiedIcu,
      available_icu: hospital.icu_beds! - occupiedIcu,
      emergency_beds: Math.floor(Math.random() * 15) + 5,
      available_emergency: Math.floor(Math.random() * 8) + 1,
      surgery_rooms: Math.floor(Math.random() * 17) + 8,
      available_surgery: Math.floor(Math.random() * 5) + 1,
      occupancy_rate: Math.round(occupancyRate * 100 * 10) / 10,
      icu_occupancy_rate: Math.round(icuOccupancyRate * 100 * 10) / 10,
      last_updated: new Date().toISOString(),
      status: occupancyRate < 0.85 ? 'Normal' : occupancyRate < 0.95 ? 'High' : 'Critical'
    };
  });
};

// Mock API functions
export const mockApiService = {
  // Hospital endpoints
  getHospitals: async (): Promise<Hospital[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockHospitals;
  },

  getHospital: async (id: string): Promise<Hospital | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockHospitals.find(h => h.id === id) || null;
  },

  // Doctor endpoints
  getDoctors: async (hospitalId?: string): Promise<Doctor[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (hospitalId) {
      return mockDoctors.filter(d => d.hospital_id === hospitalId);
    }
    return mockDoctors;
  },

  // Patient endpoints
  getPatients: async (): Promise<Patient[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPatients;
  },

  // Bed availability endpoints
  getBedSummary: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const bedData = generateBedData();
    
    const totalHospitals = bedData.length;
    const totalBeds = bedData.reduce((sum, bed) => sum + bed.total_beds, 0);
    const totalAvailable = bedData.reduce((sum, bed) => sum + bed.available_beds, 0);
    const totalIcuBeds = bedData.reduce((sum, bed) => sum + bed.icu_beds, 0);
    const totalAvailableIcu = bedData.reduce((sum, bed) => sum + bed.available_icu, 0);
    
    const criticalHospitals = bedData.filter(bed => bed.status === 'Critical');
    const highOccupancyHospitals = bedData.filter(bed => bed.status === 'High');
    
    return {
      summary: {
        total_hospitals: totalHospitals,
        total_beds: totalBeds,
        total_available: totalAvailable,
        total_occupied: totalBeds - totalAvailable,
        overall_occupancy_rate: Math.round(((totalBeds - totalAvailable) / totalBeds) * 100 * 10) / 10,
        total_icu_beds: totalIcuBeds,
        total_available_icu: totalAvailableIcu,
        icu_occupancy_rate: Math.round(((totalIcuBeds - totalAvailableIcu) / totalIcuBeds) * 100 * 10) / 10
      },
      alerts: {
        critical_hospitals: criticalHospitals.length,
        high_occupancy_hospitals: highOccupancyHospitals.length,
        critical_hospital_names: criticalHospitals.map(h => h.hospital_name),
        high_occupancy_hospital_names: highOccupancyHospitals.map(h => h.hospital_name)
      },
      detailed_data: bedData
    };
  },

  getHospitalBeds: async (hospitalId: string): Promise<BedData | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const bedData = generateBedData();
    return bedData.find(bed => bed.hospital_id === hospitalId) || null;
  }
};