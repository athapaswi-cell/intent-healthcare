"""
FHIR Client Service for retrieving real-time data from FHIR servers
Supports HAPI FHIR, Azure FHIR, and other FHIR R4 servers
"""
import requests
from typing import List, Dict, Optional, Any
import json
from backend.app.config import FHIR_BASE_URL

class FHIRClient:
    def __init__(self, base_url: str = None):
        """
        Initialize FHIR client
        
        Args:
            base_url: FHIR server base URL (defaults to config setting)
        """
        self.base_url = base_url or FHIR_BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/fhir+json",
            "Content-Type": "application/fhir+json"
        })
    
    def search(self, resource_type: str, params: Dict[str, Any] = None) -> List[Dict]:
        """
        Search for FHIR resources
        
        Args:
            resource_type: FHIR resource type (Patient, Practitioner, Organization, etc.)
            params: Search parameters (e.g., {"name": "john", "_count": 10})
        
        Returns:
            List of FHIR resources
        """
        url = f"{self.base_url}/{resource_type}"
        
        try:
            response = self.session.get(url, params=params or {}, timeout=20)  # Increased timeout for slow FHIR servers
            response.raise_for_status()
            
            bundle = response.json()
            resources = []
            
            if bundle.get("resourceType") == "Bundle" and bundle.get("entry"):
                for entry in bundle.get("entry", []):
                    if "resource" in entry:
                        resources.append(entry["resource"])
            
            return resources
        except requests.exceptions.RequestException as e:
            print(f"FHIR search error: {e}")
            return []
    
    def read(self, resource_type: str, resource_id: str) -> Optional[Dict]:
        """
        Read a specific FHIR resource by ID
        
        Args:
            resource_type: FHIR resource type
            resource_id: Resource ID
        
        Returns:
            FHIR resource or None
        """
        url = f"{self.base_url}/{resource_type}/{resource_id}"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"FHIR read error: {e}")
            return None
    
    def create(self, resource_type: str, resource: Dict) -> Optional[Dict]:
        """
        Create a new FHIR resource
        
        Args:
            resource_type: FHIR resource type
            resource: FHIR resource data
        
        Returns:
            Created FHIR resource with server-assigned ID
        """
        url = f"{self.base_url}/{resource_type}"
        
        try:
            response = self.session.post(url, json=resource, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"FHIR create error: {e}")
            return None
    
    def update(self, resource_type: str, resource_id: str, resource: Dict) -> Optional[Dict]:
        """
        Update a FHIR resource
        
        Args:
            resource_type: FHIR resource type
            resource_id: Resource ID
            resource: Updated FHIR resource data
        
        Returns:
            Updated FHIR resource
        """
        url = f"{self.base_url}/{resource_type}/{resource_id}"
        resource["id"] = resource_id
        
        try:
            response = self.session.put(url, json=resource, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"FHIR update error: {e}")
            return None
    
    def delete(self, resource_type: str, resource_id: str) -> bool:
        """
        Delete a FHIR resource
        
        Args:
            resource_type: FHIR resource type
            resource_id: Resource ID
        
        Returns:
            True if successful, False otherwise
        """
        url = f"{self.base_url}/{resource_type}/{resource_id}"
        
        try:
            response = self.session.delete(url, timeout=10)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"FHIR delete error: {e}")
            return False


# Global FHIR client instance
_fhir_client: Optional[FHIRClient] = None

def get_fhir_client(base_url: str = None) -> FHIRClient:
    """Get or create FHIR client instance"""
    global _fhir_client
    if _fhir_client is None:
        _fhir_client = FHIRClient(base_url)
    return _fhir_client

