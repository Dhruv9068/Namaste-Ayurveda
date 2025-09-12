# Namaste Ayurveda - EHR System

Advanced Electronic Health Record system integrating NAMASTE codes with ICD-11 mapping for Ayurveda, Siddha, and Unani medicine.

## 🚀 Features

- **AI-Powered Mapping**: Real-time NAMASTE to ICD-11 code mapping using Gemini AI and ML
- **Multi-System Support**: Ayurveda, Siddha, and Unani medicine systems
- **Real-time Dashboard**: Complex analytics with live updates
- **Discussion Forum**: Firebase-powered community discussions
- **FHIR Compliance**: Healthcare interoperability standards
- **Keyword-based Mapping**: JSON-configured intelligent suggestions

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React hooks + Context
- **Charts**: Recharts for analytics
- **Animations**: Framer Motion + GSAP
- **Real-time**: Firebase Firestore

### Backend (Python Flask + ML)
- **Framework**: Flask with CORS support
- **ML Engine**: scikit-learn TF-IDF vectorization
- **Data Processing**: Pandas for CSV handling
- **API**: RESTful endpoints for mapping and search

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Firebase account
- Google Gemini API key

### Frontend Setup

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key

# Backend API
VITE_API_BASE_URL=http://localhost:5000/api
```

3. **Start development server**:
```bash
npm run dev
```

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Add your CSV data**:
Place your NAMASTE CSV files in `backend/resources/`:
- `namaste_ayurveda.csv`
- `namaste_siddha.csv` 
- `namaste_unani.csv`

**Required CSV columns**:
```csv
code,term_original,term_english,description,category,icd11_code,icd11_term
```

5. **Start Flask server**:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

## 🔧 Backend API Endpoints

### Health Check
```http
GET /api/health
```

### ML Prediction
```http
POST /api/ml/predict
Content-Type: application/json

{
  "clinical_text": "Patient has breathing difficulties and respiratory issues"
}
```

### Search NAMASTE Codes
```http
POST /api/namaste/search
Content-Type: application/json

{
  "query": "respiratory",
  "systems": ["ayurveda", "siddha", "unani"],
  "limit": 10
}
```

### System Statistics
```http
GET /api/stats
```

## 🤖 AI Mapping System

### 1. Keyword-based Mapping (JSON)
- Fast, rule-based matching using `src/data/keywordMapping.json`
- Supports multiple languages and medical terms
- Instant suggestions for common conditions

### 2. Gemini AI Integration
- Advanced natural language processing
- Context-aware medical term understanding
- Fallback for complex clinical descriptions

### 3. ML-based Similarity
- TF-IDF vectorization of medical terms
- Cosine similarity matching
- Trained on your CSV data for domain-specific accuracy

## 📊 Data Structure

### NAMASTE CSV Format
```csv
code,term_original,term_english,description,category,icd11_code,icd11_term
AAA-2.1,प्राणवातकोप,Disturbance of Prana Vata,Respiratory disorders due to Prana Vata,Respiratory,XM4567,Respiratory dysfunction
```

### Keyword Mapping JSON
```json
{
  "respiratory": {
    "keywords": ["breathing", "respiratory", "lung", "pranavayu"],
    "namasteCode": "AAA-2.1",
    "namasteTerm": "प्राणवातकोप",
    "system": "Ayurveda",
    "confidence": 92
  }
}
```

## 🔥 Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Firestore Database

2. **Configure Authentication**:
   - Enable Email/Password authentication
   - Add your domain to authorized domains

3. **Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /discussions/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
# Add Procfile
echo "web: python app.py" > Procfile

# Deploy with your CSV files in resources/
```

## 🧪 Testing the System

1. **Test Keyword Mapping**:
   - Enter "breathing problems" in doctor's panel
   - Should suggest respiratory-related NAMASTE codes

2. **Test ML Prediction**:
   - Use complex clinical descriptions
   - Backend will use TF-IDF similarity matching

3. **Test Real-time Features**:
   - Dashboard updates every 5 seconds
   - Discussion forum shows live updates

## 📈 Performance Optimization

- **Frontend**: Lazy loading, code splitting, memoization
- **Backend**: Caching, vectorization pre-computation
- **Database**: Indexed queries, pagination
- **API**: Rate limiting, response compression

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for Traditional Medicine Digitization**