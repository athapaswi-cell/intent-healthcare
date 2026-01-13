from fastapi import APIRouter, HTTPException, Query
from backend.app.services.fhir_data_service import get_medical_records, get_medical_history, get_patient_visits
from typing import List, Optional

router = APIRouter(prefix="/records", tags=["records"])

@router.get("/", response_model=List[dict])
def get_records(
    hospital_id: Optional[str] = Query(None, description="Filter by hospital ID"),
    patient_id: Optional[str] = Query(None, description="Filter by patient ID")
):
    """
    Get medical records/encounters from FHIR server
    Returns real-time data from FHIR Encounter resources
    """
    try:
        records = get_medical_records(hospital_id=hospital_id, patient_id=patient_id)
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching records: {str(e)}")

@router.get("/medical-history", response_model=List[dict])
def get_medical_history_endpoint(
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    limit: Optional[int] = Query(20, description="Maximum number of records to return", ge=1, le=50)
):
    """
    Get medical history (conditions/diagnoses) from FHIR server
    Returns real-time data from FHIR Condition resources (limited to 20 by default for performance)
    """
    try:
        return get_medical_history(patient_id=patient_id, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching medical history: {str(e)}")

@router.get("/visits", response_model=List[dict])
def get_visits_endpoint(
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    limit: Optional[int] = Query(20, description="Maximum number of visits to return", ge=1, le=50)
):
    """
    Get patient visits (encounters) from FHIR server
    Returns real-time data from FHIR Encounter resources (limited to 20 by default for performance)
    """
    try:
        return get_patient_visits(patient_id=patient_id, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching visits: {str(e)}")

