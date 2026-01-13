"""
Configuration settings for the application
"""
import os

# FHIR Server Configuration
FHIR_BASE_URL = os.getenv("FHIR_BASE_URL", "https://hapi.fhir.org/baseR4")
# Use real FHIR data by default - set to False to use in-memory mock data
FHIR_USE_REAL_DATA = os.getenv("FHIR_USE_REAL_DATA", "true").lower() == "true"

# Application Settings
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

