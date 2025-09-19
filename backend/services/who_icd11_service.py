import requests
import json
import os
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class WHOIcd11Service:
    def __init__(self):
        self.client_id = os.getenv('WHO_ICD11_CLIENT_ID')
        self.client_secret = os.getenv('WHO_ICD11_CLIENT_SECRET')
        self.base_url = "https://id.who.int/icd"
        self.token_url = "https://icdaccessmanagement.who.int/connect/token"
        self.release_id = "2023-01"
        self.access_token = None
        self.token_expires = None
        
    def get_access_token(self):
        """Get OAuth2 access token from WHO ICD-11 API"""
        if self.access_token and self.token_expires and datetime.now() < self.token_expires:
            return self.access_token
            
        try:
            payload = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'scope': 'icdapi_access',
                'grant_type': 'client_credentials'
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = requests.post(self.token_url, data=payload, headers=headers)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            # Token expires in 1 hour, refresh 5 minutes early
            self.token_expires = datetime.now() + timedelta(seconds=token_data['expires_in'] - 300)
            
            logger.info("Successfully obtained WHO ICD-11 access token")
            return self.access_token
            
        except Exception as e:
            logger.error(f"Failed to get WHO ICD-11 access token: {e}")
            return None
    
    def search_icd11_codes(self, query, include_tm2=True):
        """Search ICD-11 codes including TM2"""
        # Check if credentials are available
        if not self.client_id or not self.client_secret or self.client_id == 'your_client_id_here':
            logger.info("WHO ICD-11 credentials not configured, using mock data")
            return self._get_mock_icd11_results(query)
            
        token = self.get_access_token()
        if not token:
            logger.info("Failed to get access token, using mock data")
            return self._get_mock_icd11_results(query)
            
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json',
                'API-Version': 'v2',
                'Accept-Language': 'en'
            }
            
            results = []
            
            # 1. Search Foundation API (general ICD-11 terms)
            try:
                foundation_url = f"{self.base_url}/entity/search?q={query}&useFuzzy=true&flatResults=true"
                response = requests.get(foundation_url, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                if 'destinationEntities' in data:
                    for entity in data['destinationEntities']:
                        # Handle different title formats
                        title = ''
                        if isinstance(entity.get('title'), dict):
                            title = entity.get('title', {}).get('@value', '')
                        elif isinstance(entity.get('title'), str):
                            title = entity.get('title', '')
                        
                        # Handle different definition formats
                        definition = ''
                        if isinstance(entity.get('definition'), dict):
                            definition = entity.get('definition', {}).get('@value', '')
                        elif isinstance(entity.get('definition'), str):
                            definition = entity.get('definition', '')
                        
                        results.append({
                            'code': entity.get('theCode', ''),
                            'title': title,
                            'definition': definition,
                            'system': 'ICD-11 Foundation',
                            'uri': entity.get('@id', '')
                        })
            except Exception as e:
                logger.warning(f"Foundation search failed: {e}")
            
            # 2. Search TM2 Linearization (Traditional Medicine)
            if include_tm2:
                try:
                    tm2_url = f"{self.base_url}/release/11/{self.release_id}/tm2/search?q={query}&useFuzzy=true&flatResults=true"
                    response = requests.get(tm2_url, headers=headers)
                    response.raise_for_status()
                    
                    data = response.json()
                    if 'destinationEntities' in data:
                        for entity in data['destinationEntities']:
                            # Handle different title formats
                            title = ''
                            if isinstance(entity.get('title'), dict):
                                title = entity.get('title', {}).get('@value', '')
                            elif isinstance(entity.get('title'), str):
                                title = entity.get('title', '')
                            
                            # Handle different definition formats
                            definition = ''
                            if isinstance(entity.get('definition'), dict):
                                definition = entity.get('definition', {}).get('@value', '')
                            elif isinstance(entity.get('definition'), str):
                                definition = entity.get('definition', '')
                            
                            results.append({
                                'code': entity.get('theCode', ''),
                                'title': title,
                                'definition': definition,
                                'system': 'TM2',
                                'uri': entity.get('@id', '')
                            })
                except Exception as e:
                    logger.warning(f"TM2 search failed: {e}")
            
            # 3. Search MMS Linearization (Biomedicine)
            try:
                mms_url = f"{self.base_url}/release/11/{self.release_id}/mms/search?q={query}&useFuzzy=true&flatResults=true"
                response = requests.get(mms_url, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                if 'destinationEntities' in data:
                    for entity in data['destinationEntities']:
                        # Handle different title formats
                        title = ''
                        if isinstance(entity.get('title'), dict):
                            title = entity.get('title', {}).get('@value', '')
                        elif isinstance(entity.get('title'), str):
                            title = entity.get('title', '')
                        
                        # Handle different definition formats
                        definition = ''
                        if isinstance(entity.get('definition'), dict):
                            definition = entity.get('definition', {}).get('@value', '')
                        elif isinstance(entity.get('definition'), str):
                            definition = entity.get('definition', '')
                        
                        results.append({
                            'code': entity.get('theCode', ''),
                            'title': title,
                            'definition': definition,
                            'system': 'ICD-11 MMS',
                            'uri': entity.get('@id', '')
                        })
            except Exception as e:
                logger.warning(f"MMS search failed: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search ICD-11 codes: {e}")
            # Return mock ICD-11 results for demonstration
            return self._get_mock_icd11_results(query)
    
    def get_icd11_entity(self, entity_id):
        """Get detailed information about an ICD-11 entity"""
        token = self.get_access_token()
        if not token:
            return None
            
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json',
                'API-Version': 'v2',
                'Accept-Language': 'en'
            }
            
            url = f"{self.base_url}/release/11/2023-01/mms/{entity_id}"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Failed to get ICD-11 entity {entity_id}: {e}")
            return None
    
    def sync_tm2_codes(self):
        """Sync Traditional Medicine Module 2 codes"""
        token = self.get_access_token()
        if not token:
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json',
                'API-Version': 'v2',
                'Accept-Language': 'en'
            }
            
            # Get TM2 root categories
            url = f"{self.base_url}/release/11/2023-01/tm2"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            tm2_data = response.json()
            
            # Save to local cache
            cache_file = 'cache/tm2_codes.json'
            os.makedirs(os.path.dirname(cache_file), exist_ok=True)
            
            with open(cache_file, 'w') as f:
                json.dump({
                    'last_updated': datetime.now().isoformat(),
                    'data': tm2_data
                }, f, indent=2)
            
            logger.info("Successfully synced TM2 codes from WHO ICD-11")
            return True
            
        except Exception as e:
            logger.error(f"Failed to sync TM2 codes: {e}")
            return False
    
    def get_mapping_suggestions(self, namaste_term, namaste_code):
        """Get ICD-11 mapping suggestions for NAMASTE term"""
        # Search for similar terms in ICD-11
        search_results = self.search_icd11_codes(namaste_term)
        
        suggestions = []
        for result in search_results:
            # Calculate similarity score (simplified)
            similarity = self._calculate_similarity(namaste_term, result['title'])
            
            if similarity > 0.3:  # Minimum threshold
                suggestions.append({
                    'icd11_code': result['code'],
                    'icd11_term': result['title'],
                    'definition': result['definition'],
                    'system': result['system'],
                    'confidence': min(95, int(similarity * 100)),
                    'uri': result['uri']
                })
        
        # If no suggestions found and we're using mock data, return some default suggestions
        if not suggestions and (not self.client_id or self.client_id == 'your_client_id_here'):
            suggestions = self._get_mock_mapping_suggestions(namaste_term, namaste_code)
        
        return sorted(suggestions, key=lambda x: x['confidence'], reverse=True)[:3]
    
    def _calculate_similarity(self, term1, term2):
        """Simple similarity calculation (can be enhanced with ML)"""
        term1_words = set(term1.lower().split())
        term2_words = set(term2.lower().split())
        
        if not term1_words or not term2_words:
            return 0
        
        intersection = term1_words.intersection(term2_words)
        union = term1_words.union(term2_words)
        
        return len(intersection) / len(union)
    
    def _get_mock_mapping_suggestions(self, namaste_term, namaste_code):
        """Get mock mapping suggestions for demonstration"""
        term_lower = namaste_term.lower()
        
        mock_suggestions = [
            {
                'icd11_code': 'BA4Z',
                'icd11_term': 'Vata disorders',
                'definition': 'Traditional medicine disorders related to Vata dosha',
                'system': 'TM2',
                'confidence': 85,
                'uri': 'http://id.who.int/icd/entity/tm2/vata'
            },
            {
                'icd11_code': 'BA5Z',
                'icd11_term': 'Pitta disorders',
                'definition': 'Traditional medicine disorders related to Pitta dosha',
                'system': 'TM2',
                'confidence': 80,
                'uri': 'http://id.who.int/icd/entity/tm2/pitta'
            },
            {
                'icd11_code': 'BA6Z',
                'icd11_term': 'Kapha disorders',
                'definition': 'Traditional medicine disorders related to Kapha dosha',
                'system': 'TM2',
                'confidence': 75,
                'uri': 'http://id.who.int/icd/entity/tm2/kapha'
            },
            {
                'icd11_code': 'BA00',
                'icd11_term': 'Disorders of the nervous system',
                'definition': 'Diseases affecting the central and peripheral nervous systems',
                'system': 'ICD-11',
                'confidence': 70,
                'uri': 'http://id.who.int/icd/entity/123456789'
            },
            {
                'icd11_code': 'DD90',
                'icd11_term': 'Digestive system disorders',
                'definition': 'Diseases affecting the digestive tract and related organs',
                'system': 'ICD-11',
                'confidence': 65,
                'uri': 'http://id.who.int/icd/entity/987654321'
            }
        ]
        
        # Filter suggestions based on term similarity
        filtered_suggestions = []
        for suggestion in mock_suggestions:
            similarity = self._calculate_similarity(namaste_term, suggestion['icd11_term'])
            if similarity > 0.1:  # Lower threshold for mock data
                suggestion['confidence'] = min(95, int(similarity * 100))
                filtered_suggestions.append(suggestion)
        
        # If no matches, return general suggestions
        if not filtered_suggestions:
            filtered_suggestions = mock_suggestions[:3]
        
        return filtered_suggestions
    
    def _get_mock_icd11_results(self, query):
        """Get mock ICD-11 results for demonstration"""
        query_lower = query.lower()
        
        mock_results = [
            {
                'code': 'BA00',
                'title': 'Disorders of the nervous system',
                'definition': 'Diseases affecting the central and peripheral nervous systems',
                'system': 'ICD-11',
                'uri': 'http://id.who.int/icd/entity/123456789'
            },
            {
                'code': 'DD90',
                'title': 'Digestive system disorders',
                'definition': 'Diseases affecting the digestive tract and related organs',
                'system': 'ICD-11',
                'uri': 'http://id.who.int/icd/entity/987654321'
            },
            {
                'code': 'CA40',
                'title': 'Respiratory system disorders',
                'definition': 'Diseases affecting the respiratory tract and lungs',
                'system': 'ICD-11',
                'uri': 'http://id.who.int/icd/entity/456789123'
            },
            {
                'code': 'FB00',
                'title': 'Skin and subcutaneous tissue disorders',
                'definition': 'Diseases affecting the skin and underlying tissues',
                'system': 'ICD-11',
                'uri': 'http://id.who.int/icd/entity/789123456'
            },
            {
                'code': 'FA00',
                'title': 'Musculoskeletal system disorders',
                'definition': 'Diseases affecting bones, joints, and muscles',
                'system': 'ICD-11',
                'uri': 'http://id.who.int/icd/entity/321654987'
            },
            {
                'code': 'BA4Z',
                'title': 'Vata disorders',
                'definition': 'Traditional medicine disorders related to Vata dosha',
                'system': 'TM2',
                'uri': 'http://id.who.int/icd/entity/tm2/vata'
            },
            {
                'code': 'BA5Z',
                'title': 'Pitta disorders',
                'definition': 'Traditional medicine disorders related to Pitta dosha',
                'system': 'TM2',
                'uri': 'http://id.who.int/icd/entity/tm2/pitta'
            },
            {
                'code': 'BA6Z',
                'title': 'Kapha disorders',
                'definition': 'Traditional medicine disorders related to Kapha dosha',
                'system': 'TM2',
                'uri': 'http://id.who.int/icd/entity/tm2/kapha'
            }
        ]
        
        # Filter results based on query
        filtered_results = []
        for result in mock_results:
            if (query_lower in result['title'].lower() or 
                query_lower in result['definition'].lower() or
                query_lower in result['code'].lower()):
                filtered_results.append(result)
        
        # If no specific matches, return general results
        if not filtered_results:
            filtered_results = mock_results[:3]
        
        return filtered_results

# Global instance
who_service = WHOIcd11Service()