"""
Data Service Router - Routes to real data service with comprehensive healthcare data
"""
from backend.app.config import FHIR_USE_REAL_DATA
from typing import List, Dict, Optional

# Always use real data service for comprehensive healthcare data
from backend.app.services.real_data_service import (
    get_all_patients, get_patient, create_patient, update_patient, delete_patient,
    get_all_doctors, get_doctor, get_doctors_by_hospital, get_doctors_by_specialization,
    create_doctor, update_doctor, delete_doctor,
    get_all_hospitals, get_hospital, search_hospitals,
    create_hospital, update_hospital, delete_hospital,
    get_bed_availability, get_all_bed_availability, update_bed_availability
)

# Export all functions
__all__ = [
    "get_all_patients", "get_patient", "create_patient", "update_patient", "delete_patient",
    "get_all_doctors", "get_doctor", "get_doctors_by_hospital", "get_doctors_by_specialization",
    "create_doctor", "update_doctor", "delete_doctor",
    "get_all_hospitals", "get_hospital", "search_hospitals",
    "create_hospital", "update_hospital", "delete_hospital",
    "get_bed_availability", "get_all_bed_availability", "update_bed_availability"
]


