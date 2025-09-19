#!/usr/bin/env python3
"""
Setup script to create .env file with WHO ICD-11 credentials
"""

import os

def create_env_file():
    """Create .env file with WHO ICD-11 credentials"""
    
    print("=" * 60)
    print("WHO ICD-11 API SETUP")
    print("=" * 60)
    print()
    print("To get WHO ICD-11 API credentials:")
    print("1. Go to: https://icd.who.int/icdapi")
    print("2. Register for an account")
    print("3. Create a new application")
    print("4. Get your Client ID and Client Secret")
    print()
    
    # Get credentials from user
    client_id = input("Enter your WHO ICD-11 Client ID: ").strip()
    client_secret = input("Enter your WHO ICD-11 Client Secret: ").strip()
    
    if not client_id or not client_secret:
        print("❌ Both Client ID and Client Secret are required!")
        return False
    
    # Create .env content
    env_content = f"""# WHO ICD-11 API Credentials
WHO_ICD11_CLIENT_ID={client_id}
WHO_ICD11_CLIENT_SECRET={client_secret}

# Firebase Configuration
FIREBASE_PROJECT_ID=namaste-ayurveda
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour_private_key_here\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your_client_email_here
FIREBASE_CLIENT_ID=your_client_id_here
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url_here

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Session Configuration
SESSION_ID=system

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
"""
    
    # Write .env file
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print("✅ .env file created successfully!")
        print("✅ WHO ICD-11 credentials configured!")
        print()
        print("Next steps:")
        print("1. Run: python test_who_icd11.py")
        print("2. Run: python app.py")
        print("3. Test the API endpoints")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

if __name__ == "__main__":
    create_env_file()
