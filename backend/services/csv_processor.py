import pandas as pd
import os
import json
from datetime import datetime
import logging
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

class CSVProcessor:
    def __init__(self):
        self.upload_folder = 'uploads'
        self.resources_folder = 'resources'
        self.allowed_extensions = {'csv'}
        
        # Create directories if they don't exist
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(self.resources_folder, exist_ok=True)
    
    def allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def process_uploaded_csv(self, file, system_type):
        """Process uploaded CSV file and integrate with existing data"""
        if not file or not self.allowed_file(file.filename):
            return {'success': False, 'error': 'Invalid file type'}
        
        try:
            # Secure filename
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            # Save uploaded file
            upload_path = os.path.join(self.upload_folder, filename)
            file.save(upload_path)
            
            # Read and validate CSV
            df = pd.read_csv(upload_path)
            validation_result = self.validate_csv_structure(df, system_type)
            
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['error']}
            
            # Process and merge with existing data
            processed_data = self.merge_with_existing_data(df, system_type)
            
            # Save to resources folder
            resource_filename = f"namaste_{system_type.lower()}.csv"
            resource_path = os.path.join(self.resources_folder, resource_filename)
            processed_data.to_csv(resource_path, index=False)
            
            # Generate mapping report
            mapping_report = self.generate_mapping_report(processed_data, system_type)
            
            return {
                'success': True,
                'message': f'Successfully processed {len(df)} records',
                'new_records': len(df),
                'total_records': len(processed_data),
                'mapping_report': mapping_report,
                'filename': filename
            }
            
        except Exception as e:
            logger.error(f"Error processing CSV: {e}")
            return {'success': False, 'error': str(e)}
    
    def validate_csv_structure(self, df, system_type):
        """Validate CSV structure matches expected format"""
        required_columns = [
            'code', 'term_original', 'term_english', 
            'description', 'category', 'icd11_code', 'icd11_term'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {
                'valid': False,
                'error': f'Missing required columns: {", ".join(missing_columns)}'
            }
        
        # Check for empty required fields
        for col in ['code', 'term_english']:
            if df[col].isnull().any():
                return {
                    'valid': False,
                    'error': f'Column {col} contains empty values'
                }
        
        return {'valid': True}
    
    def merge_with_existing_data(self, new_df, system_type):
        """Merge new data with existing data, avoiding duplicates"""
        resource_filename = f"namaste_{system_type.lower()}.csv"
        resource_path = os.path.join(self.resources_folder, resource_filename)
        
        if os.path.exists(resource_path):
            existing_df = pd.read_csv(resource_path)
            
            # Remove duplicates based on code
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            combined_df = combined_df.drop_duplicates(subset=['code'], keep='last')
        else:
            combined_df = new_df
        
        return combined_df
    
    def generate_mapping_report(self, df, system_type):
        """Generate mapping statistics and insights"""
        total_records = len(df)
        mapped_records = len(df[df['icd11_code'].notna() & (df['icd11_code'] != '')])
        
        category_stats = df['category'].value_counts().to_dict()
        
        return {
            'total_records': total_records,
            'mapped_records': mapped_records,
            'mapping_percentage': round((mapped_records / total_records) * 100, 2),
            'categories': category_stats,
            'system_type': system_type,
            'last_updated': datetime.now().isoformat()
        }
    
    def get_upload_history(self):
        """Get history of uploaded files"""
        if not os.path.exists(self.upload_folder):
            return []
        
        files = []
        for filename in os.listdir(self.upload_folder):
            if filename.endswith('.csv'):
                filepath = os.path.join(self.upload_folder, filename)
                stat = os.stat(filepath)
                files.append({
                    'filename': filename,
                    'upload_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'size': stat.st_size
                })
        
        return sorted(files, key=lambda x: x['upload_date'], reverse=True)
    
    def auto_map_to_icd11(self, df, who_service):
        """Automatically map NAMASTE codes to ICD-11 using WHO API"""
        mapped_count = 0

        for index, row in df.iterrows():
            if pd.isna(row['icd11_code']) or row['icd11_code'] == '':
                # Get mapping suggestions from WHO API
                suggestions = who_service.get_mapping_suggestions(
                    row['term_english'],
                    row['code']
                )

                # If no suggestions from WHO API, use mock mappings for demo
                if not suggestions:
                    suggestions = self._get_mock_mapping_suggestions(row['term_english'], row['code'])

                if suggestions and suggestions[0]['confidence'] > 80:
                    df.at[index, 'icd11_code'] = suggestions[0]['icd11_code']
                    df.at[index, 'icd11_term'] = suggestions[0]['icd11_term']
                    mapped_count += 1

        return df, mapped_count

    def _get_mock_mapping_suggestions(self, term, code):
        """Provide mock ICD-11 mapping suggestions for demo purposes"""
        # Simple keyword-based mock mappings
        mock_mappings = {
            'vata': [{'icd11_code': 'BA00', 'icd11_term': 'Disorders of the nervous system', 'confidence': 85}],
            'pitta': [{'icd11_code': 'DA00', 'icd11_term': 'Disorders of the digestive system', 'confidence': 82}],
            'kapha': [{'icd11_code': 'CA00', 'icd11_term': 'Disorders of the circulatory system', 'confidence': 80}],
            'fever': [{'icd11_code': 'MG40', 'icd11_term': 'Fever of unknown origin', 'confidence': 90}],
            'cough': [{'icd11_code': 'CA42', 'icd11_term': 'Cough', 'confidence': 88}],
            'pain': [{'icd11_code': 'MG30', 'icd11_term': 'Pain', 'confidence': 85}],
        }

        term_lower = term.lower()
        for keyword, mappings in mock_mappings.items():
            if keyword in term_lower:
                return mappings

        # Default mock mapping
        return [{'icd11_code': 'XX00', 'icd11_term': 'General medical condition', 'confidence': 75}]

# Global instance
csv_processor = CSVProcessor()