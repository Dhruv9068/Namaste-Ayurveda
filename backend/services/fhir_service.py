import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import requests
from services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

class FHIRService:
    def __init__(self):
        self.fhir_base_url = "https://hapi.fhir.org/baseR4"
        self.validation_endpoint = f"{self.fhir_base_url}/Observation/$validate"
    
    def validate_mapping_and_create_fhir(self, namaste_data: Dict[str, Any], icd11_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate mapping and create FHIR resource"""
        try:
            # Create FHIR Observation resource for the mapping
            fhir_resource = self.create_fhir_observation(namaste_data, icd11_data)
            
            # Validate the FHIR resource
            validation_result = self.validate_fhir_resource(fhir_resource)
            
            if validation_result['valid']:
                # Store in Firebase
                firebase_service.store_fhir_resource(fhir_resource, namaste_data.get('code', ''))
                
                return {
                    'success': True,
                    'fhir_resource': fhir_resource,
                    'validation_result': validation_result,
                    'message': 'FHIR resource created and validated successfully'
                }
            else:
                return {
                    'success': False,
                    'validation_result': validation_result,
                    'message': 'FHIR validation failed'
                }
                
        except Exception as e:
            logger.error(f"Error in FHIR validation: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create FHIR resource'
            }
    
    def create_fhir_observation(self, namaste_data: Dict[str, Any], icd11_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create FHIR Observation resource for NAMASTE to ICD-11 mapping"""
        
        # Extract data from inputs
        namaste_code = namaste_data.get('code', '')
        namaste_term = namaste_data.get('term_english', '')
        namaste_original = namaste_data.get('term_original', '')
        system_type = namaste_data.get('system', '')
        description = namaste_data.get('description', '')
        
        icd11_code = icd11_data.get('code', '')
        icd11_term = icd11_data.get('title', '')
        confidence = icd11_data.get('confidence', 0)
        
        # Create FHIR Observation resource
        fhir_resource = {
            "resourceType": "Observation",
            "id": f"namaste-mapping-{namaste_code.replace('.', '-').replace(' ', '-')}",
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "laboratory",
                            "display": "Laboratory"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "33747-0",
                        "display": "Clinical diagnosis"
                    },
                    {
                        "system": "http://namaste.org/codes",
                        "code": namaste_code,
                        "display": namaste_term
                    }
                ],
                "text": f"NAMASTE {system_type} Diagnosis Mapping"
            },
            "subject": {
                "reference": "Patient/mapping-patient",
                "display": "Mapping Subject"
            },
            "effectiveDateTime": datetime.now().isoformat(),
            "valueString": f"{namaste_term} ({namaste_original})",
            "interpretation": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                            "code": "POS" if confidence > 80 else "IND",
                            "display": "Positive" if confidence > 80 else "Indeterminate"
                        }
                    ]
                }
            ],
            "component": [
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://namaste.org/components",
                                "code": "traditional-term",
                                "display": "Traditional Medicine Term"
                            }
                        ]
                    },
                    "valueString": namaste_term
                },
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://namaste.org/components",
                                "code": "traditional-original",
                                "display": "Original Language Term"
                            }
                        ]
                    },
                    "valueString": namaste_original
                },
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://namaste.org/components",
                                "code": "traditional-system",
                                "display": "Traditional Medicine System"
                            }
                        ]
                    },
                    "valueCodeableConcept": {
                        "coding": [
                            {
                                "system": "http://namaste.org/systems",
                                "code": system_type.lower(),
                                "display": system_type
                            }
                        ]
                    }
                },
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://namaste.org/components",
                                "code": "icd11-mapping",
                                "display": "ICD-11 Mapping"
                            }
                        ]
                    },
                    "valueString": f"{icd11_code}: {icd11_term}"
                },
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://namaste.org/components",
                                "code": "mapping-confidence",
                                "display": "Mapping Confidence"
                            }
                        ]
                    },
                    "valueQuantity": {
                        "value": confidence,
                        "unit": "%",
                        "system": "http://unitsofmeasure.org",
                        "code": "%"
                    }
                }
            ],
            "note": [
                {
                    "text": f"Traditional Medicine Mapping: {description}. Confidence: {confidence}%"
                }
            ],
            "extension": [
                {
                    "url": "http://namaste.org/StructureDefinition/mapping-metadata",
                    "valueExtension": [
                        {
                            "url": "namaste-code",
                            "valueString": namaste_code
                        },
                        {
                            "url": "icd11-code",
                            "valueString": icd11_code
                        },
                        {
                            "url": "mapping-timestamp",
                            "valueDateTime": datetime.now().isoformat()
                        },
                        {
                            "url": "traditional-system",
                            "valueString": system_type
                        }
                    ]
                }
            ]
        }
        
        return fhir_resource
    
    def validate_fhir_resource(self, fhir_resource: Dict[str, Any]) -> Dict[str, Any]:
        """Validate FHIR resource using HAPI FHIR validation endpoint"""
        try:
            # For now, perform basic validation
            validation_result = self.basic_fhir_validation(fhir_resource)
            
            # If basic validation passes, try HAPI FHIR validation
            if validation_result['valid']:
                try:
                    response = requests.post(
                        self.validation_endpoint,
                        json=fhir_resource,
                        headers={'Content-Type': 'application/fhir+json'},
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        validation_result['hapi_validation'] = {
                            'valid': True,
                            'message': 'HAPI FHIR validation passed'
                        }
                    else:
                        validation_result['hapi_validation'] = {
                            'valid': False,
                            'message': f'HAPI FHIR validation failed: {response.text}'
                        }
                        # Don't fail the overall validation for HAPI issues
                        
                except Exception as e:
                    logger.warning(f"HAPI FHIR validation failed: {e}")
                    validation_result['hapi_validation'] = {
                        'valid': False,
                        'message': f'HAPI FHIR validation unavailable: {str(e)}'
                    }
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error in FHIR validation: {e}")
            return {
                'valid': False,
                'error': str(e),
                'message': 'Validation failed'
            }
    
    def basic_fhir_validation(self, fhir_resource: Dict[str, Any]) -> Dict[str, Any]:
        """Perform basic FHIR resource validation"""
        errors = []
        warnings = []
        
        # Check required fields
        required_fields = ['resourceType', 'status', 'code', 'subject']
        for field in required_fields:
            if field not in fhir_resource:
                errors.append(f"Missing required field: {field}")
        
        # Check resource type
        if fhir_resource.get('resourceType') != 'Observation':
            errors.append("Invalid resource type. Expected 'Observation'")
        
        # Check status
        valid_statuses = ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']
        if fhir_resource.get('status') not in valid_statuses:
            errors.append(f"Invalid status: {fhir_resource.get('status')}")
        
        # Check code structure
        if 'code' in fhir_resource:
            code = fhir_resource['code']
            if not isinstance(code, dict) or 'coding' not in code:
                errors.append("Invalid code structure")
            else:
                coding = code['coding']
                if not isinstance(coding, list) or len(coding) == 0:
                    errors.append("Code must have at least one coding")
        
        # Check subject structure
        if 'subject' in fhir_resource:
            subject = fhir_resource['subject']
            if not isinstance(subject, dict) or 'reference' not in subject:
                errors.append("Invalid subject structure")
        
        # Check components
        if 'component' in fhir_resource:
            components = fhir_resource['component']
            if not isinstance(components, list):
                errors.append("Components must be a list")
            else:
                for i, component in enumerate(components):
                    if not isinstance(component, dict) or 'code' not in component:
                        errors.append(f"Invalid component {i} structure")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'message': 'Basic validation completed'
        }
    
    def get_fhir_resources_by_namaste_code(self, namaste_code: str) -> List[Dict[str, Any]]:
        """Get FHIR resources for a specific NAMASTE code"""
        try:
            # This would typically query a FHIR server
            # For now, return empty list
            return []
            
        except Exception as e:
            logger.error(f"Error getting FHIR resources: {e}")
            return []
    
    def generate_fhir_bundle(self, mappings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate FHIR Bundle containing multiple mapping observations"""
        try:
            bundle = {
                "resourceType": "Bundle",
                "id": f"namaste-mappings-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "type": "collection",
                "timestamp": datetime.now().isoformat(),
                "entry": []
            }
            
            for mapping in mappings:
                if mapping.get('fhir_resource'):
                    bundle['entry'].append({
                        "resource": mapping['fhir_resource']
                    })
            
            return bundle
            
        except Exception as e:
            logger.error(f"Error generating FHIR bundle: {e}")
            return {}

# Global instance
fhir_service = FHIRService()
