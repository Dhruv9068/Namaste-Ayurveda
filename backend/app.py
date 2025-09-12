from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import json
from datetime import datetime
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NAMASTEMappingService:
    def __init__(self):
        self.ayurveda_data = None
        self.siddha_data = None
        self.unani_data = None
        self.vectorizer = None
        self.icd11_mappings = {}
        self.load_data()
        self.train_model()
    
    def load_data(self):
        """Load NAMASTE CSV data"""
        try:
            # Load CSV files
            if os.path.exists('resources/namaste_ayurveda.csv'):
                self.ayurveda_data = pd.read_csv('resources/namaste_ayurveda.csv')
                logger.info(f"Loaded {len(self.ayurveda_data)} Ayurveda records")
            
            if os.path.exists('resources/namaste_siddha.csv'):
                self.siddha_data = pd.read_csv('resources/namaste_siddha.csv')
                logger.info(f"Loaded {len(self.siddha_data)} Siddha records")
            
            if os.path.exists('resources/namaste_unani.csv'):
                self.unani_data = pd.read_csv('resources/namaste_unani.csv')
                logger.info(f"Loaded {len(self.unani_data)} Unani records")
            
            # Combine all data
            all_data = []
            if self.ayurveda_data is not None:
                self.ayurveda_data['system'] = 'Ayurveda'
                all_data.append(self.ayurveda_data)
            if self.siddha_data is not None:
                self.siddha_data['system'] = 'Siddha'
                all_data.append(self.siddha_data)
            if self.unani_data is not None:
                self.unani_data['system'] = 'Unani'
                all_data.append(self.unani_data)
            
            if all_data:
                self.combined_data = pd.concat(all_data, ignore_index=True)
                logger.info(f"Combined dataset: {len(self.combined_data)} total records")
            else:
                logger.warning("No CSV data found, using mock data")
                self.create_mock_data()
                
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            self.create_mock_data()
    
    def create_mock_data(self):
        """Create mock data if CSV files are not available"""
        mock_data = [
            {
                'code': 'AAA-2.1',
                'term_original': 'प्राणवातकोप',
                'term_english': 'Disturbance of Prana Vata',
                'description': 'Respiratory disorder due to Vata imbalance',
                'system': 'Ayurveda',
                'category': 'Respiratory',
                'icd11_code': 'XM4567',
                'icd11_term': 'Respiratory dysfunction'
            },
            {
                'code': 'BBB-1.2',
                'term_original': 'अग्निमांद्य',
                'term_english': 'Digestive fire imbalance',
                'description': 'Weakened digestive fire leading to poor digestion',
                'system': 'Ayurveda',
                'category': 'Digestive',
                'icd11_code': 'XM7890',
                'icd11_term': 'Digestive system disorder'
            },
            {
                'code': 'CCC-3.1',
                'term_original': 'वळिक्कॊरुक्कु नॊय्',
                'term_english': 'Vaḷi related disorder',
                'description': 'Neurological disorder in Siddha system',
                'system': 'Siddha',
                'category': 'Neurological',
                'icd11_code': 'XM9876',
                'icd11_term': 'Neurological disorder'
            },
            {
                'code': 'L-4.1',
                'term_original': 'वज अल-मफासिल',
                'term_english': 'Joint pain',
                'description': 'Arthritis and joint disorders in Unani system',
                'system': 'Unani',
                'category': 'Musculoskeletal',
                'icd11_code': 'XM5432',
                'icd11_term': 'Joint disorders'
            }
        ]
        self.combined_data = pd.DataFrame(mock_data)
        logger.info("Created mock dataset with sample records")
    
    def train_model(self):
        """Train TF-IDF model for text similarity"""
        try:
            if self.combined_data is not None and len(self.combined_data) > 0:
                # Combine text fields for training
                text_data = []
                for _, row in self.combined_data.iterrows():
                    combined_text = f"{row.get('term_english', '')} {row.get('description', '')} {row.get('category', '')}"
                    text_data.append(combined_text.lower())
                
                # Train TF-IDF vectorizer
                self.vectorizer = TfidfVectorizer(
                    max_features=1000,
                    stop_words='english',
                    ngram_range=(1, 2)
                )
                self.tfidf_matrix = self.vectorizer.fit_transform(text_data)
                logger.info("ML model trained successfully")
            else:
                logger.warning("No data available for training")
        except Exception as e:
            logger.error(f"Error training model: {e}")
    
    def predict_mapping(self, clinical_text, top_k=3):
        """Predict NAMASTE codes for clinical text"""
        try:
            if self.vectorizer is None or self.combined_data is None:
                return []
            
            # Vectorize input text
            input_vector = self.vectorizer.transform([clinical_text.lower()])
            
            # Calculate similarity
            similarities = cosine_similarity(input_vector, self.tfidf_matrix).flatten()
            
            # Get top matches
            top_indices = similarities.argsort()[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                if similarities[idx] > 0.1:  # Minimum similarity threshold
                    row = self.combined_data.iloc[idx]
                    confidence = min(95, max(70, int(similarities[idx] * 100)))
                    
                    results.append({
                        'namasteCode': row.get('code', 'N/A'),
                        'namasteTerm': row.get('term_original', 'N/A'),
                        'englishTerm': row.get('term_english', 'N/A'),
                        'system': row.get('system', 'Unknown'),
                        'icd11Code': row.get('icd11_code', 'N/A'),
                        'icd11Term': row.get('icd11_term', 'N/A'),
                        'confidence': confidence,
                        'description': row.get('description', 'No description available')
                    })
            
            return results
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return []

# Initialize the service
mapping_service = NAMASTEMappingService()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'data_loaded': mapping_service.combined_data is not None,
        'model_trained': mapping_service.vectorizer is not None
    })

@app.route('/api/ml/predict', methods=['POST'])
def predict_mapping():
    """ML-based mapping prediction"""
    try:
        data = request.get_json()
        clinical_text = data.get('clinical_text', '')
        
        if not clinical_text:
            return jsonify({'error': 'Clinical text is required'}), 400
        
        predictions = mapping_service.predict_mapping(clinical_text)
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in prediction endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/namaste/search', methods=['POST'])
def search_namaste():
    """Search NAMASTE codes"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        systems = data.get('systems', ['ayurveda', 'siddha', 'unani'])
        limit = data.get('limit', 10)
        
        if mapping_service.combined_data is None:
            return jsonify({'results': []})
        
        # Filter by systems
        filtered_data = mapping_service.combined_data[
            mapping_service.combined_data['system'].str.lower().isin([s.lower() for s in systems])
        ]
        
        # Search in text fields
        mask = (
            filtered_data['term_english'].str.lower().str.contains(query, na=False) |
            filtered_data['description'].str.lower().str.contains(query, na=False) |
            filtered_data['category'].str.lower().str.contains(query, na=False)
        )
        
        results = filtered_data[mask].head(limit)
        
        return jsonify({
            'results': results.to_dict('records'),
            'total': len(results)
        })
    
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    try:
        if mapping_service.combined_data is None:
            return jsonify({'error': 'No data available'}), 404
        
        stats = {
            'total_codes': len(mapping_service.combined_data),
            'systems': {
                'ayurveda': len(mapping_service.combined_data[mapping_service.combined_data['system'] == 'Ayurveda']),
                'siddha': len(mapping_service.combined_data[mapping_service.combined_data['system'] == 'Siddha']),
                'unani': len(mapping_service.combined_data[mapping_service.combined_data['system'] == 'Unani'])
            },
            'categories': mapping_service.combined_data['category'].value_counts().to_dict() if 'category' in mapping_service.combined_data.columns else {}
        }
        
        return jsonify(stats)
    
    except Exception as e:
        logger.error(f"Error in stats endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)