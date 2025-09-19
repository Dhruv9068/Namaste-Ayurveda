# NAMASTE Ayurveda + WHO ICD-11 Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get WHO ICD-11 Credentials
1. Go to: https://icd.who.int/icdapi
2. Register for an account
3. Create a new application
4. Copy your Client ID and Client Secret

### Step 2: Configure Credentials
```bash
# Run the setup script
python setup_env.py

# Enter your credentials when prompted
```

### Step 3: Test the System
```bash
# Test WHO ICD-11 service
python test_who_icd11.py

# Start the backend server
python app.py

# In another terminal, test complete integration
python test_complete_integration.py
```

## 🔧 What's Fixed

### WHO ICD-11 API Integration
- ✅ **Foundation API**: General ICD-11 terms
- ✅ **TM2 Linearization**: Traditional Medicine Module 2
- ✅ **MMS Linearization**: Biomedical terms
- ✅ **Proper Authentication**: OAuth 2.0 client credentials
- ✅ **Error Handling**: Falls back to mock data if API fails

### Backend API Endpoints
- ✅ `/api/health` - System health check
- ✅ `/api/namaste/search` - Search NAMASTE codes
- ✅ `/api/who/search` - Search WHO ICD-11 codes
- ✅ `/api/ml/predict` - ML-based predictions
- ✅ `/api/stats` - System statistics

## 🎯 Key Features

### 1. Dual Coding System
- **NAMASTE Codes**: Ayurveda, Siddha, Unani terms
- **ICD-11 Codes**: Foundation, TM2, MMS terms
- **Automatic Mapping**: AI-powered suggestions

### 2. Search Capabilities
- **Fuzzy Search**: Find similar terms
- **Multi-System**: Search across all systems
- **Confidence Scoring**: AI confidence levels

### 3. FHIR Compliance
- **CodeSystem**: NAMASTE terminology
- **ConceptMap**: NAMASTE ↔ ICD-11 mapping
- **ValueSet**: Auto-complete suggestions

## 🧪 Testing

### Test WHO ICD-11 Service
```bash
python test_who_icd11.py
```

### Test Complete Integration
```bash
python test_complete_integration.py
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Search NAMASTE
curl -X POST http://localhost:5000/api/namaste/search \
  -H "Content-Type: application/json" \
  -d '{"query": "vata", "systems": ["ayurveda"]}'

# Search WHO ICD-11
curl -X POST http://localhost:5000/api/who/search \
  -H "Content-Type: application/json" \
  -d '{"query": "diabetes", "include_tm2": true}'
```

## 🚨 Troubleshooting

### WHO ICD-11 API Not Working
1. Check credentials in `.env` file
2. Verify API access at https://icd.who.int/icdapi
3. Check internet connection
4. System will use mock data if API fails

### Backend Server Issues
1. Check if port 5000 is available
2. Install dependencies: `pip install -r requirements.txt`
3. Check logs for errors

### No Search Results
1. Check if CSV files are loaded
2. Verify data format
3. Check system statistics: `/api/stats`

## 📊 Expected Results

### WHO ICD-11 Search
- **Foundation**: General medical terms
- **TM2**: Traditional medicine terms
- **MMS**: Biomedical terms

### NAMASTE Search
- **Ayurveda**: Vata, Pitta, Kapha disorders
- **Siddha**: Traditional Tamil medicine
- **Unani**: Traditional Arabic medicine

### ML Predictions
- **Confidence**: 70-95% for good matches
- **Multiple Suggestions**: Top 3 matches
- **Cross-System**: NAMASTE ↔ ICD-11

## 🎉 Success Indicators

✅ **WHO ICD-11 Service**: Returns real API data or mock data
✅ **Backend API**: All endpoints respond correctly
✅ **Search**: Finds relevant terms across systems
✅ **ML**: Provides confident predictions
✅ **Integration**: Complete system working together

## 🔄 Next Steps

1. **Production Setup**: Configure production credentials
2. **FHIR Implementation**: Add FHIR R4 compliance
3. **OAuth 2.0**: Implement ABHA authentication
4. **Frontend**: Connect React frontend
5. **Deployment**: Deploy to cloud platform

---

**Need Help?** Check the logs or run the test scripts for detailed error information.
