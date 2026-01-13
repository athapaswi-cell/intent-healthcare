import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataDisplay.css';
import { mockApiService } from '../services/mockDataService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  qualification: string;
  email?: string;
  phone?: string;
  department?: string;
  experience_years?: number;
  consultation_fee?: number;
  availability?: string;
  languages: string[];
}

interface Department {
  name: string;
  doctorCount: number;
  doctors: Doctor[];
}

export default function HospitalDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allDoctors: Doctor[] = [];
      
      // Try backend API first, fallback to mock data
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/doctors/`, {
          timeout: 3000
        });
        allDoctors = response.data;
      } catch (apiError) {
        console.log('Backend not available, using mock data');
        allDoctors = await mockApiService.getDoctors();
      }

      // Group doctors by specialization (which represents departments)
      const departmentMap = new Map<string, Doctor[]>();
      
      allDoctors.forEach((doctor) => {
        // Use specialization as department name
        const dept = doctor.specialization || 'General Practice';
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, []);
        }
        departmentMap.get(dept)!.push(doctor);
      });

      // Convert map to array and sort by doctor count (descending)
      const depts: Department[] = Array.from(departmentMap.entries())
        .map(([name, doctors]) => ({
          name,
          doctorCount: doctors.length,
          doctors
        }))
        .sort((a, b) => b.doctorCount - a.doctorCount);

      setDepartments(depts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading departments...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const selectedDept = selectedDepartment 
    ? departments.find(d => d.name === selectedDepartment)
    : null;

  return (
    <div className="data-list">
      <h2>🏥 Hospital Departments ({departments.length})</h2>
      
      {departments.length === 0 ? (
        <div className="no-data">
          <p>No departments found.</p>
        </div>
      ) : (
        <>
          <div className="specializations-grid">
            {departments.map((dept) => (
              <div 
                key={dept.name} 
                className={`data-card specialization-card ${selectedDepartment === dept.name ? 'active' : ''}`}
                onClick={() => setSelectedDepartment(selectedDepartment === dept.name ? null : dept.name)}
              >
                <h3>{dept.name}</h3>
                <div className="card-details">
                  <p><strong>{dept.doctorCount}</strong> {dept.doctorCount === 1 ? 'Doctor' : 'Doctors'}</p>
                  {selectedDepartment === dept.name && (
                    <div className="specialization-doctors">
                      <h4>Doctors in this department:</h4>
                      <ul>
                        {dept.doctors.map((doctor) => (
                          <li key={doctor.id}>
                            <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>
                            {doctor.qualification && <span> - {doctor.qualification}</span>}
                            {doctor.department && <span> ({doctor.department})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


