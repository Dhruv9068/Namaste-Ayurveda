import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self.app = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
            else:
                # Use environment variables for Firebase credentials
                firebase_config = {
                    "type": "service_account",
                    "project_id": os.getenv('FIREBASE_PROJECT_ID', 'namaste-ayurveda'),
                    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_X509_CERT_URL')
                }
                
                # Create credentials object
                cred = credentials.Certificate(firebase_config)
                
                # Initialize Firebase app
                self.app = firebase_admin.initialize_app(cred)
            
            # Initialize Firestore
            self.db = firestore.client()
            logger.info("Firebase initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self.db = None
    
    def upload_namaste_data(self, data: List[Dict[str, Any]], system_type: str) -> bool:
        """Upload NAMASTE data to Firebase with real-time ingestion"""
        if not self.db:
            logger.error("Firebase not initialized")
            return False
        
        try:
            batch = self.db.batch()
            collection_name = f"namaste_{system_type.lower()}_data"
            
            for item in data:
                # Create document reference
                doc_ref = self.db.collection(collection_name).document()
                
                # Add metadata
                item_with_metadata = {
                    **item,
                    'uploaded_at': datetime.now(),
                    'system_type': system_type,
                    'status': 'pending_mapping',
                    'version': 1
                }
                
                # Add to batch
                batch.set(doc_ref, item_with_metadata)
            
            # Commit batch
            batch.commit()
            
            # Log upload activity
            self.log_activity({
                'action': 'bulk_upload',
                'system_type': system_type,
                'record_count': len(data),
                'timestamp': datetime.now()
            })
            
            logger.info(f"Successfully uploaded {len(data)} {system_type} records to Firebase")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upload NAMASTE data to Firebase: {e}")
            return False
    
    def update_mapping_result(self, doc_id: str, mapping_data: Dict[str, Any], system_type: str) -> bool:
        """Update mapping results in Firebase"""
        if not self.db:
            return False
        
        try:
            collection_name = f"namaste_{system_type.lower()}_data"
            doc_ref = self.db.collection(collection_name).document(doc_id)
            
            update_data = {
                'mapping_results': mapping_data,
                'mapped_at': datetime.now(),
                'status': 'mapped'
            }
            
            doc_ref.update(update_data)
            
            # Log mapping activity
            self.log_activity({
                'action': 'mapping_update',
                'doc_id': doc_id,
                'system_type': system_type,
                'mapping_confidence': mapping_data.get('confidence', 0),
                'timestamp': datetime.now()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update mapping in Firebase: {e}")
            return False
    
    def get_pending_mappings(self, system_type: str) -> List[Dict[str, Any]]:
        """Get records pending mapping from Firebase"""
        if not self.db:
            return []
        
        try:
            collection_name = f"namaste_{system_type.lower()}_data"
            query = self.db.collection(collection_name).where('status', '==', 'pending_mapping')
            
            docs = query.stream()
            pending_records = []
            
            for doc in docs:
                data = doc.to_dict()
                data['doc_id'] = doc.id
                pending_records.append(data)
            
            return pending_records
            
        except Exception as e:
            logger.error(f"Failed to get pending mappings from Firebase: {e}")
            return []
    
    def cache_icd_search_results(self, query: str, results: List[Dict[str, Any]], cache_duration_hours: int = 24) -> bool:
        """Cache ICD search results in Firebase"""
        if not self.db:
            return False
        
        try:
            cache_doc = {
                'query': query,
                'results': results,
                'cached_at': datetime.now(),
                'expires_at': datetime.now().timestamp() + (cache_duration_hours * 3600)
            }
            
            # Use query hash as document ID for efficient lookup
            query_hash = hash(query.lower().strip())
            doc_ref = self.db.collection('icd_search_cache').document(str(query_hash))
            doc_ref.set(cache_doc)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to cache ICD search results: {e}")
            return False
    
    def get_cached_icd_results(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached ICD search results from Firebase"""
        if not self.db:
            return None
        
        try:
            query_hash = hash(query.lower().strip())
            doc_ref = self.db.collection('icd_search_cache').document(str(query_hash))
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                # Check if cache is still valid
                if datetime.now().timestamp() < data['expires_at']:
                    return data['results']
                else:
                    # Remove expired cache
                    doc_ref.delete()
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get cached ICD results: {e}")
            return None
    
    def log_activity(self, activity_data: Dict[str, Any]) -> bool:
        """Log user/system activities for audit trail"""
        if not self.db:
            return False
        
        try:
            activity_data['timestamp'] = datetime.now()
            activity_data['session_id'] = os.getenv('SESSION_ID', 'system')
            
            doc_ref = self.db.collection('audit_logs').document()
            doc_ref.set(activity_data)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")
            return False
    
    def get_audit_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit logs from Firebase"""
        if not self.db:
            return []
        
        try:
            query = self.db.collection('audit_logs').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit)
            docs = query.stream()
            
            logs = []
            for doc in docs:
                data = doc.to_dict()
                data['log_id'] = doc.id
                logs.append(data)
            
            return logs
            
        except Exception as e:
            logger.error(f"Failed to get audit logs: {e}")
            return []
    
    def store_fhir_resource(self, fhir_data: Dict[str, Any], namaste_code: str) -> bool:
        """Store FHIR resource in Firebase"""
        if not self.db:
            return False
        
        try:
            fhir_doc = {
                'fhir_resource': fhir_data,
                'namaste_code': namaste_code,
                'created_at': datetime.now(),
                'status': 'validated',
                'resource_type': fhir_data.get('resourceType', 'Unknown')
            }
            
            doc_ref = self.db.collection('fhir_resources').document()
            doc_ref.set(fhir_doc)
            
            # Log FHIR creation
            self.log_activity({
                'action': 'fhir_resource_created',
                'namaste_code': namaste_code,
                'resource_type': fhir_data.get('resourceType', 'Unknown'),
                'timestamp': datetime.now()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store FHIR resource: {e}")
            return False

# Global instance
firebase_service = FirebaseService()
