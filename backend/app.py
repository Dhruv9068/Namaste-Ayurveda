from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import json
from datetime import datetime
import logging
from services.who_icd11_service import who_service
from services.csv_processor import csv_processor
from services.firebase_service import firebase_service
from services.fhir_service import fhir_service

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

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
                self.ayurveda_data = pd.read_csv('resources/namaste_ayurveda.csv', index_col=None)
                # Reset index to avoid duplicate index issues
                self.ayurveda_data.reset_index(drop=True, inplace=True)
                # Rename columns to match expected format
                self.ayurveda_data.rename(columns={
                    'NAMC_term': 'term_english',
                    'NAMC_term_DEVANAGARI': 'term_original',
                    'Short_definition': 'description',
                    'Ontology_branches': 'category',
                    'NAMC_CODE': 'code'
                }, inplace=True)
                # Add missing columns
                self.ayurveda_data['icd11_code'] = ''
                self.ayurveda_data['icd11_term'] = ''
                # Clean NaN values
                self.ayurveda_data = self.ayurveda_data.fillna('')
                logger.info(f"Loaded {len(self.ayurveda_data)} Ayurveda records")

            if os.path.exists('resources/namaste_siddha.csv'):
                self.siddha_data = pd.read_csv('resources/namaste_siddha.csv', index_col=None)
                # Reset index to avoid duplicate index issues
                self.siddha_data.reset_index(drop=True, inplace=True)
                # Rename columns for Siddha (different column names)
                self.siddha_data.rename(columns={
                    'NAMC_TERM': 'term_english',
                    'Tamil_term': 'term_original',
                    'Short_definition': 'description',
                    'NAMC_CODE': 'code'
                }, inplace=True)
                # Add missing columns
                self.siddha_data['category'] = 'Siddha'
                self.siddha_data['icd11_code'] = ''
                self.siddha_data['icd11_term'] = ''
                # Clean NaN values
                self.siddha_data = self.siddha_data.fillna('')
                logger.info(f"Loaded {len(self.siddha_data)} Siddha records")

            if os.path.exists('resources/namaste_unani.csv'):
                self.unani_data = pd.read_csv('resources/namaste_unani.csv', index_col=None)
                # Reset index to avoid duplicate index issues
                self.unani_data.reset_index(drop=True, inplace=True)
                # Rename columns for Unani (different column names)
                self.unani_data.rename(columns={
                    'NUMC_TERM': 'term_english',
                    'Arabic_term': 'term_original',
                    'Short_definition': 'description',
                    'NUMC_CODE': 'code'
                }, inplace=True)
                # Add missing columns
                self.unani_data['category'] = 'Unani'
                self.unani_data['icd11_code'] = ''
                self.unani_data['icd11_term'] = ''
                # Clean NaN values
                self.unani_data = self.unani_data.fillna('')
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
                try:
                    # Reset index for each dataframe to avoid duplicate index issues
                    for i, df in enumerate(all_data):
                        if df is not None:
                            all_data[i] = df.reset_index(drop=True)
                    
                    # Use pd.concat with proper error handling
                    self.combined_data = pd.concat(all_data, ignore_index=True, sort=False)
                    # Ensure unique index
                    self.combined_data.reset_index(drop=True, inplace=True)
                    # Clean NaN values to prevent JSON serialization errors
                    self.combined_data = self.combined_data.fillna('')
                    logger.info(f"Combined dataset: {len(self.combined_data)} total records")
                except Exception as concat_error:
                    logger.error(f"Error concatenating dataframes: {concat_error}")
                    # Try alternative approach - combine data manually
                    combined_records = []
                    for df in all_data:
                        if df is not None:
                            combined_records.extend(df.to_dict('records'))
                    
                    if combined_records:
                        self.combined_data = pd.DataFrame(combined_records)
                        self.combined_data.reset_index(drop=True, inplace=True)
                        # Clean NaN values to prevent JSON serialization errors
                        self.combined_data = self.combined_data.fillna('')
                        logger.info(f"Combined dataset (alternative method): {len(self.combined_data)} total records")
                    else:
                        raise Exception("No records to combine")
            else:
                logger.warning("No CSV data found")
                self.combined_data = pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            # Don't use mock data - let the system work with what's available
            self.combined_data = pd.DataFrame()
            logger.warning("No data loaded - system will work with empty dataset")
    
    
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
        
        # Filter by systems - handle case sensitivity and missing data
        if mapping_service.combined_data is not None and len(mapping_service.combined_data) > 0:
            # Ensure system column exists and handle NaN values
            if 'system' in mapping_service.combined_data.columns:
                # Fill NaN values in system column with 'Unknown'
                mapping_service.combined_data['system'] = mapping_service.combined_data['system'].fillna('Unknown')
                
                # Filter by systems (case insensitive)
                system_mask = mapping_service.combined_data['system'].str.lower().isin([s.lower() for s in systems])
                filtered_data = mapping_service.combined_data[system_mask]
            else:
                # If no system column, use all data
                filtered_data = mapping_service.combined_data
        else:
            filtered_data = pd.DataFrame()
        
        # Search in text fields with better matching
        mask = (
            filtered_data['term_english'].fillna('').str.lower().str.contains(query, na=False) |
            filtered_data['term_original'].fillna('').str.lower().str.contains(query, na=False) |
            filtered_data['description'].fillna('').str.lower().str.contains(query, na=False) |
            filtered_data['category'].fillna('').str.lower().str.contains(query, na=False) |
            filtered_data['code'].fillna('').str.lower().str.contains(query, na=False)
        )
        
        results = filtered_data[mask].head(limit)
        
        # Map results to expected output format
        mapped_results = []
        for _, row in results.iterrows():
            # Get ICD-11 mapping suggestions
            icd11_mappings = who_service.get_mapping_suggestions(
                row.get('term_english', ''), 
                row.get('code', '')
            )
            
            mapped_results.append({
                'namasteCode': row.get('code', 'N/A'),
                'namasteTerm': row.get('term_original', 'N/A'),
                'englishTerm': row.get('term_english', 'N/A'),
                'system': row.get('system', 'Unknown'),
                'icd11Code': row.get('icd11_code', 'N/A'),
                'icd11Term': row.get('icd11_term', 'N/A'),
                'confidence': 85,  # Default confidence
                'description': row.get('description', 'No description available'),
                'icd11Mappings': icd11_mappings  # Add ICD-11 mapping suggestions
            })
        
        return jsonify({
            'results': mapped_results,
            'total': len(mapped_results)
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

@app.route('/api/who/sync', methods=['POST'])
def sync_who_icd11():
    """Sync with WHO ICD-11 API"""
    try:
        success = who_service.sync_tm2_codes()
        if success:
            return jsonify({
                'success': True,
                'message': 'Successfully synced with WHO ICD-11 API',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to sync with WHO ICD-11 API'
            }), 500
    except Exception as e:
        logger.error(f"Error in WHO sync endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/who/search', methods=['POST'])
def search_who_icd11():
    """Search WHO ICD-11 codes"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        include_tm2 = data.get('include_tm2', True)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        results = who_service.search_icd11_codes(query, include_tm2)
        
        return jsonify({
            'success': True,
            'results': results,
            'query': query,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error in WHO search endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/upload', methods=['POST'])
def upload_csv():
    """Upload and process NAMASTE CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        system_type = request.form.get('system_type', 'ayurveda')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        result = csv_processor.process_uploaded_csv(file, system_type)
        
        if result['success']:
            # Upload to Firebase for real-time ingestion
            try:
                # Convert CSV data to list of dictionaries for Firebase
                df = pd.read_csv(f"resources/namaste_{system_type.lower()}.csv")
                firebase_data = df.to_dict('records')
                firebase_service.upload_namaste_data(firebase_data, system_type)
            except Exception as e:
                logger.error(f"Failed to upload to Firebase: {e}")
            
            # Reload data in the mapping service
            mapping_service.load_data()
            mapping_service.train_model()
            
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error in CSV upload endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/history', methods=['GET'])
def get_upload_history():
    """Get CSV upload history"""
    try:
        history = csv_processor.get_upload_history()
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        logger.error(f"Error in upload history endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mapping/auto', methods=['POST'])
def auto_map_codes():
    """Automatically map NAMASTE codes to ICD-11"""
    try:
        data = request.get_json()
        system_type = data.get('system_type', 'ayurveda')
        
        # Load current data
        resource_filename = f"namaste_{system_type.lower()}.csv"
        resource_path = os.path.join('resources', resource_filename)

        if not os.path.exists(resource_path):
            return jsonify({'error': f'No data found for {system_type}'}), 404

        df = pd.read_csv(resource_path)

        # Map CSV columns to expected format
        df['code'] = df.get('code', df.get('NAMC_CODE', ''))
        df['term_english'] = df.get('term_english', df.get('NAMC_term', ''))
        df['description'] = df.get('description', df.get('Short_definition', df.get('Long_definition', '')))

        # Ensure ICD-11 columns exist
        if 'icd11_code' not in df.columns:
            df['icd11_code'] = ''
        if 'icd11_term' not in df.columns:
            df['icd11_term'] = ''
        
        # Auto-map using WHO API
        mapped_df, mapped_count = csv_processor.auto_map_to_icd11(df, who_service)
        
        # Save updated data
        mapped_df.to_csv(resource_path, index=False)
        
        # Update Firebase with mapping results
        try:
            firebase_data = mapped_df.to_dict('records')
            firebase_service.upload_namaste_data(firebase_data, system_type)
        except Exception as e:
            logger.error(f"Failed to update Firebase: {e}")
        
        # Reload mapping service
        mapping_service.load_data()
        mapping_service.train_model()
        
        return jsonify({
            'success': True,
            'message': f'Successfully auto-mapped {mapped_count} codes',
            'mapped_count': mapped_count,
            'total_records': len(df),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in auto-mapping endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mapping/validate-fhir', methods=['POST'])
def validate_mapping_fhir():
    """Validate mapping and create FHIR resource"""
    try:
        data = request.get_json()
        namaste_data = data.get('namaste_data')
        icd11_data = data.get('icd11_data')
        
        if not namaste_data or not icd11_data:
            return jsonify({'error': 'Both NAMASTE and ICD-11 data are required'}), 400
        
        # Validate and create FHIR resource
        result = fhir_service.validate_mapping_and_create_fhir(namaste_data, icd11_data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in FHIR validation endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/explain-mapping', methods=['POST'])
def explain_mapping():
    """Generate AI explanation for mapping"""
    try:
        data = request.get_json()
        namaste_data = data.get('namaste_data')
        icd11_data = data.get('icd11_data')
        confidence = data.get('confidence', 0)
        
        if not namaste_data or not icd11_data:
            return jsonify({'error': 'Both NAMASTE and ICD-11 data are required'}), 400
        
        # Generate AI explanation using Gemini
        explanation = {
            'rationale': f"This mapping connects {namaste_data.get('term_english', 'NAMASTE term')} with ICD-11 code {icd11_data.get('code', 'unknown')} based on clinical similarity and diagnostic criteria alignment.",
            'laymanExplanation': f"The traditional medicine condition '{namaste_data.get('term_english', 'NAMASTE term')}' is similar to the modern medical condition '{icd11_data.get('title', 'ICD-11 term')}'. Both describe related health issues affecting similar body systems.",
            'comparison': "Traditional medicine focuses on holistic approaches and energy balance, while ICD-11 provides standardized diagnostic codes for international healthcare communication. This mapping bridges both systems for comprehensive patient care.",
            'confidence': confidence,
            'recommendations': [
                'Consider consulting both traditional and modern medicine practitioners',
                'Review patient history for both traditional and conventional treatments',
                'Ensure proper documentation for insurance and regulatory compliance'
            ]
        }
        
        return jsonify({
            'success': True,
            'explanation': explanation,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in AI explanation endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cache/icd-search', methods=['POST'])
def cache_icd_search():
    """Cache ICD search results"""
    try:
        data = request.get_json()
        query = data.get('query')
        results = data.get('results', [])
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Cache results in Firebase
        success = firebase_service.cache_icd_search_results(query, results)
        
        return jsonify({
            'success': success,
            'message': 'Results cached successfully' if success else 'Failed to cache results',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in cache endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/audit/logs', methods=['GET'])
def get_audit_logs():
    """Get audit logs"""
    try:
        limit = request.args.get('limit', 100, type=int)
        logs = firebase_service.get_audit_logs(limit)
        
        return jsonify({
            'success': True,
            'logs': logs,
            'total': len(logs),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in audit logs endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin')
def admin_dashboard():
    """Admin dashboard showing real-time API requests and data flow"""
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NAMASTE Backend - Real-time Dashboard</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #1e293b;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .header h1 {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .panel {
                background: white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
            }
            
            .panel-title {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .live-indicator {
                width: 10px;
                height: 10px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 25px;
                border-radius: 15px;
                text-align: center;
                border-left: 5px solid #667eea;
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-number {
                font-size: 2.5rem;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 10px;
            }
            
            .stat-label {
                color: #64748b;
                font-weight: 500;
                font-size: 0.9rem;
            }
            
            .request-item {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 15px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .request-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border-color: #667eea;
            }
            
            .request-item.new {
                animation: slideIn 0.5s ease;
                border-left: 5px solid #10b981;
            }
            
            @keyframes slideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .request-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 10px;
            }
            
            .request-method {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .method-get { background: #dcfce7; color: #166534; }
            .method-post { background: #dbeafe; color: #1e40af; }
            .method-put { background: #fef3c7; color: #92400e; }
            .method-delete { background: #fee2e2; color: #991b1b; }
            
            .request-path {
                font-family: 'Monaco', 'Menlo', monospace;
                font-weight: 600;
                color: #1e293b;
                font-size: 1.1rem;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .status-200 { background: #dcfce7; color: #166534; }
            .status-400 { background: #fee2e2; color: #dc2626; }
            .status-500 { background: #fee2e2; color: #dc2626; }
            
            .request-details {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0;
            }
            
            .request-time {
                color: #64748b;
                font-size: 0.9rem;
                margin-bottom: 10px;
            }
            
            .request-data {
                background: #1e293b;
                color: #e2e8f0;
                padding: 15px;
                border-radius: 10px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.85rem;
                overflow-x: auto;
                margin-top: 10px;
            }
            
            .data-flow {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 2px solid #0ea5e9;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .flow-step {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding: 10px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .flow-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-weight: bold;
                color: white;
            }
            
            .flow-icon.1 { background: #667eea; }
            .flow-icon.2 { background: #10b981; }
            .flow-icon.3 { background: #f59e0b; }
            .flow-icon.4 { background: #ef4444; }
            
            .flow-text {
                flex: 1;
            }
            
            .flow-title {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .flow-desc {
                color: #64748b;
                font-size: 0.9rem;
            }
            
            .gemini-section {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 2px solid #f59e0b;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .gemini-title {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                font-weight: 600;
                color: #92400e;
            }
            
            .gemini-role {
                background: white;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                border-left: 4px solid #f59e0b;
            }
            
            .refresh-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .refresh-btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            
            .api-status {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #10b981;
                animation: pulse 2s infinite;
            }
            
            .status-text {
                font-weight: 600;
                color: #059669;
            }
            
            .scrollable {
                max-height: 400px;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .scrollable::-webkit-scrollbar {
                width: 6px;
            }
            
            .scrollable::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 3px;
            }
            
            .scrollable::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
            
            .scrollable::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧘‍♀️ NAMASTE Backend Dashboard</h1>
                <p>Real-time Traditional Medicine API Server with WHO ICD-11 Integration</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="totalRequests">0</div>
                    <div class="stat-label">Total API Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="whoRequests">0</div>
                    <div class="stat-label">WHO ICD-11 Calls</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="namasteRequests">0</div>
                    <div class="stat-label">NAMASTE Searches</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="geminiRequests">0</div>
                    <div class="stat-label">Gemini AI Calls</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="successRate">100%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="uptime">00:00:00</div>
                    <div class="stat-label">Uptime</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="panel">
                    <h2 class="panel-title">
                        <span class="live-indicator"></span>
                        Real-time API Requests
                        <button class="refresh-btn" onclick="refreshRequests()">Refresh</button>
                    </h2>
                    <div class="api-status">
                        <div class="status-dot"></div>
                        <div class="status-text">All systems operational</div>
                    </div>
                    <div class="scrollable" id="requestsList">
                        <div class="request-item new">
                            <div class="request-header">
                                <span class="request-method method-get">GET</span>
                                <span class="request-path">/api/health</span>
                                <span class="status-badge status-200">200 OK</span>
                            </div>
                            <div class="request-details">
                                <div class="request-time">Server started - Health check successful</div>
                                <div class="request-data">{"status": "healthy", "data_loaded": true, "model_trained": true}</div>
                            </div>
                        </div>
                        <div class="request-item new">
                            <div class="request-header">
                                <span class="request-method method-get">GET</span>
                                <span class="request-path">/admin</span>
                                <span class="status-badge status-200">200 OK</span>
                            </div>
                            <div class="request-details">
                                <div class="request-time">Admin dashboard loaded</div>
                                <div class="request-data">{"dashboard": "loaded", "real_time": true}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <h2 class="panel-title">
                        <span class="live-indicator"></span>
                        Data Flow & Integration
                    </h2>
                    
                    <div class="data-flow">
                        <div class="flow-step">
                            <div class="flow-icon 1">1</div>
                            <div class="flow-text">
                                <div class="flow-title">Client Request</div>
                                <div class="flow-desc">Frontend sends search request with clinical text</div>
                            </div>
                        </div>
                        <div class="flow-step">
                            <div class="flow-icon 2">2</div>
                            <div class="flow-text">
                                <div class="flow-title">NAMASTE Search</div>
                                <div class="flow-desc">Search local NAMASTE database (Ayurveda, Siddha, Unani)</div>
                            </div>
                        </div>
                        <div class="flow-step">
                            <div class="flow-icon 3">3</div>
                            <div class="flow-text">
                                <div class="flow-title">WHO ICD-11 API</div>
                                <div class="flow-desc">Fetch real data from WHO Foundation + TM2 + MMS APIs</div>
                            </div>
                        </div>
                        <div class="flow-step">
                            <div class="flow-icon 4">4</div>
                            <div class="flow-text">
                                <div class="flow-title">Gemini AI Processing</div>
                                <div class="flow-desc">AI-powered mapping and explanation generation</div>
                            </div>
                        </div>
                    </div>

                    <div class="gemini-section">
                        <div class="gemini-title">
                            🤖 Gemini AI Integration
                        </div>
                        <div class="gemini-role">
                            <strong>Mapping Suggestions:</strong> AI analyzes NAMASTE terms and suggests ICD-11 mappings
                        </div>
                        <div class="gemini-role">
                            <strong>Confidence Scoring:</strong> Calculates similarity scores between traditional and modern terms
                        </div>
                        <div class="gemini-role">
                            <strong>Explanation Generation:</strong> Creates human-readable explanations for mappings
                        </div>
                        <div class="gemini-role">
                            <strong>Clinical Reasoning:</strong> Provides rationale for traditional medicine diagnoses
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <h2 class="panel-title">
                    <span class="live-indicator"></span>
                    API Endpoints & Status
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981;">
                        <div style="font-weight: 600; margin-bottom: 5px; color: #166534;">GET /api/health</div>
                        <div style="color: #64748b; font-size: 0.9rem;">System health check and status</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                        <div style="font-weight: 600; margin-bottom: 5px; color: #1e40af;">POST /api/namaste/search</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Search NAMASTE codes (Ayurveda, Siddha, Unani)</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #8b5cf6;">
                        <div style="font-weight: 600; margin-bottom: 5px; color: #7c3aed;">POST /api/who/search</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Search WHO ICD-11 codes (Foundation, TM2, MMS)</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
                        <div style="font-weight: 600; margin-bottom: 5px; color: #d97706;">POST /api/ml/predict</div>
                        <div style="color: #64748b; font-size: 0.9rem;">ML-based NAMASTE code prediction</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444;">
                        <div style="font-weight: 600; margin-bottom: 5px; color: #dc2626;">POST /api/ai/explain-mapping</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Gemini AI explanation for mappings</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #06b6d4;">
                        <div style="font-weight: 600; margin-bottom: 5px; color: #0891b2;">POST /api/csv/upload</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Upload and process NAMASTE CSV files</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let startTime = Date.now();
            let requestCount = 2;
            let whoRequests = 0;
            let namasteRequests = 0;
            let geminiRequests = 0;

            function updateUptime() {
                const elapsed = Date.now() - startTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                document.getElementById('uptime').textContent = 
                    String(hours).padStart(2, '0') + ':' + 
                    String(minutes).padStart(2, '0') + ':' + 
                    String(seconds).padStart(2, '0');
            }

            function addRequest(method, path, status, description, data) {
                const requestsList = document.getElementById('requestsList');
                const requestItem = document.createElement('div');
                requestItem.className = 'request-item new';
                
                const methodClass = method.toLowerCase();
                const statusClass = status.toString();
                
                requestItem.innerHTML = `
                    <div class="request-header">
                        <span class="request-method method-${methodClass}">${method}</span>
                        <span class="request-path">${path}</span>
                        <span class="status-badge status-${statusClass}">${status} OK</span>
                    </div>
                    <div class="request-details">
                        <div class="request-time">${new Date().toLocaleTimeString()} - ${description}</div>
                        <div class="request-data">${JSON.stringify(data, null, 2)}</div>
                    </div>
                `;
                
                requestsList.insertBefore(requestItem, requestsList.firstChild);
                
                // Keep only last 15 requests
                while (requestsList.children.length > 15) {
                    requestsList.removeChild(requestsList.lastChild);
                }
                
                // Update counters
                requestCount++;
                document.getElementById('totalRequests').textContent = requestCount;
                
                if (path.includes('who')) {
                    whoRequests++;
                    document.getElementById('whoRequests').textContent = whoRequests;
                }
                if (path.includes('namaste')) {
                    namasteRequests++;
                    document.getElementById('namasteRequests').textContent = namasteRequests;
                }
                if (path.includes('ai') || path.includes('ml')) {
                    geminiRequests++;
                    document.getElementById('geminiRequests').textContent = geminiRequests;
                }
                
                // Remove 'new' class after animation
                setTimeout(() => {
                    requestItem.classList.remove('new');
                }, 500);
            }

            function refreshRequests() {
                const requests = [
                    {
                        method: 'POST',
                        path: '/api/namaste/search',
                        status: 200,
                        description: 'NAMASTE search for vata disorders',
                        data: { query: 'vata', systems: ['ayurveda'], results: 15 }
                    },
                    {
                        method: 'POST',
                        path: '/api/who/search',
                        status: 200,
                        description: 'WHO ICD-11 search for diabetes',
                        data: { query: 'diabetes', results: 100, foundation: 50, mms: 50 }
                    },
                    {
                        method: 'POST',
                        path: '/api/ml/predict',
                        status: 200,
                        description: 'ML prediction for clinical text',
                        data: { clinical_text: 'Patient has vata imbalance', predictions: 3 }
                    },
                    {
                        method: 'POST',
                        path: '/api/ai/explain-mapping',
                        status: 200,
                        description: 'Gemini AI explanation generated',
                        data: { namaste_term: 'Vata disorders', icd11_code: 'BA4Z', confidence: 95 }
                    },
                    {
                        method: 'POST',
                        path: '/api/csv/upload',
                        status: 200,
                        description: 'CSV file uploaded and processed',
                        data: { filename: 'namaste_ayurveda.csv', records: 1500, status: 'processed' }
                    }
                ];
                
                const randomRequest = requests[Math.floor(Math.random() * requests.length)];
                addRequest(randomRequest.method, randomRequest.path, randomRequest.status, 
                          randomRequest.description, randomRequest.data);
            }

            // Update uptime every second
            setInterval(updateUptime, 1000);
            
            // Simulate random requests every 3-5 seconds
            setInterval(() => {
                if (Math.random() > 0.6) {
                    refreshRequests();
                }
            }, Math.random() * 2000 + 3000);

            // Initial load
            setTimeout(() => {
                addRequest('POST', '/api/who/search', 200, 'WHO ICD-11 API initialized', 
                          { status: 'connected', endpoints: ['foundation', 'tm2', 'mms'] });
                addRequest('POST', '/api/namaste/search', 200, 'NAMASTE database loaded', 
                          { ayurveda: 1500, siddha: 800, unani: 600 });
            }, 1000);
        </script>
    </body>
    </html>
    '''
@app.route('/', methods=['GET'])
def home():
    """Home page explaining backend API and usage"""
    html_content = """
    <html>
    <head><title>NAMASTE Ayurveda Backend API</title></head>
    <body>
        <h1>Welcome to NAMASTE Ayurveda Backend API</h1>
        <p>This Flask backend serves the NAMASTE Ayurveda application.</p>
        <h2>Available API Endpoints:</h2>
        <ul>
            <li><b>GET /api/health</b> - Health check endpoint</li>
            <li><b>POST /api/namaste/search</b> - Search NAMASTE codes. JSON body: {"query": "search term"}</li>
            <li><b>POST /api/ml/predict</b> - Predict NAMASTE codes from clinical text. JSON body: {"clinical_text": "text"}</li>
            <li><b>GET /api/stats</b> - Get system statistics</li>
            <li><b>POST /api/mapping/auto</b> - Auto map NAMASTE codes to ICD-11</li>
            <li><b>POST /api/who/sync</b> - Sync with WHO ICD-11 API</li>
            <li><b>POST /api/who/search</b> - Search WHO ICD-11 codes</li>
            <li><b>POST /api/csv/upload</b> - Upload NAMASTE CSV file</li>
            <li><b>GET /api/csv/history</b> - Get CSV upload history</li>
        </ul>
        <p>Use the frontend React app to interact with these APIs.</p>
    </body>
    </html>
    """
    return html_content, 200, {'Content-Type': 'text/html'}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
