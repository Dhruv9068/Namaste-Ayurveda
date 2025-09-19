# NAMASTE Ayurveda Mapping Panel - Test Examples

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
python app.py
```
Backend will run on: http://localhost:5000

### 2. Start Frontend Server
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

## 🔍 Test Examples

### NAMASTE Code Search Examples

#### Example 1: Search for Vata-related conditions
**Search Term:** `vata`
**Expected Results:**
- NAMASTE Code: `AAA-2.1`
- Term: `प्राणवातकोप` (Disturbance of Prana Vata)
- English: `Disturbance of Prana Vata`
- System: `Ayurveda`
- ICD-11 Mapping: `XM4567` - Respiratory dysfunction

#### Example 2: Search for digestive conditions
**Search Term:** `digestive`
**Expected Results:**
- NAMASTE Code: `BBB-1.2`
- Term: `अग्निमांद्य` (Digestive fire imbalance)
- English: `Digestive fire imbalance`
- System: `Ayurveda`
- ICD-11 Mapping: `XM7890` - Digestive system disorder

#### Example 3: Search for Siddha conditions
**Search Term:** `siddha`
**Expected Results:**
- NAMASTE Code: `CCC-3.1`
- Term: `वळिक्कॊरुक्कु नॊय्` (Vaḷi related disorder)
- English: `Vaḷi related disorder`
- System: `Siddha`
- ICD-11 Mapping: `XM9876` - Neurological disorder

### WHO ICD-11 Search Examples

#### Example 1: Search for respiratory conditions
**Search Term:** `respiratory`
**Expected Results:**
- Code: `XM4567`
- Title: `Respiratory dysfunction`
- Definition: `Disorders affecting the respiratory system`
- System: `TM2`

#### Example 2: Search for skin conditions
**Search Term:** `dermatitis`
**Expected Results:**
- Code: `XM2345`
- Title: `Atopic dermatitis of scalp`
- Definition: `Inflammatory skin condition affecting the scalp`
- System: `TM2`

## 🧪 API Testing

### Test Backend Health
```bash
curl -X GET http://localhost:5000/api/health
```

### Test NAMASTE Search
```bash
curl -X POST http://localhost:5000/api/namaste/search \
  -H "Content-Type: application/json" \
  -d '{"query": "vata", "systems": ["ayurveda"], "limit": 5}'
```

### Test WHO ICD-11 Search
```bash
curl -X POST http://localhost:5000/api/who/search \
  -H "Content-Type: application/json" \
  -d '{"query": "respiratory", "include_tm2": true}'
```

### Test System Statistics
```bash
curl -X GET http://localhost:5000/api/stats
```

## 🎯 Frontend Testing Steps

### 1. Open the Application
Navigate to: http://localhost:5173

### 2. Go to Dashboard
Click on "Dashboard" in the navigation

### 3. Access Mapping Panel
Click on "Mapping" in the sidebar

### 4. Test NAMASTE Search
1. Ensure "NAMASTE Codes" tab is selected
2. Enter search term: `vata`
3. Click "Search" or press Enter
4. Verify results show NAMASTE codes with ICD-11 mappings

### 5. Test WHO ICD-11 Search
1. Click "WHO ICD-11" tab
2. Enter search term: `respiratory`
3. Click "Search" or press Enter
4. Verify results show WHO ICD-11 codes

### 6. Test Real-time Search
1. Type in search box without clicking search
2. Results should appear automatically after 300ms delay
3. Test with various terms like: `fever`, `cough`, `pain`, `digestive`

## 📊 Expected Statistics

The dashboard should show real-time statistics:
- **Total NAMASTE Codes**: 4 (from mock data)
- **Ayurveda Codes**: 2
- **Siddha Codes**: 1  
- **Unani Codes**: 1

## 🔧 Troubleshooting

### Backend Not Starting
- Check if Python virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 is not in use

### Frontend Not Starting
- Install dependencies: `npm install`
- Check port 5173 is not in use

### API Connection Issues
- Verify backend is running on http://localhost:5000
- Check browser console for CORS errors
- Ensure Vite proxy is configured correctly

### No Search Results
- Check backend logs for errors
- Verify CSV files exist in `backend/resources/`
- Test API endpoints directly with curl

## 📝 Features to Test

### ✅ Core Features
- [x] NAMASTE code search with real-time results
- [x] WHO ICD-11 code search
- [x] Real-time statistics display
- [x] Search type toggle (NAMASTE vs WHO)
- [x] Debounced search (300ms delay)
- [x] Loading states and error handling
- [x] Responsive design

### ✅ Data Integration
- [x] Backend API integration
- [x] CSV data loading
- [x] Mock data fallback
- [x] WHO API integration (with fallback)
- [x] Real-time mapping display

### ✅ User Experience
- [x] Search suggestions
- [x] Empty states
- [x] Loading indicators
- [x] Error messages
- [x] Smooth animations

## 🎉 Success Criteria

The mapping panel is working correctly if:
1. Backend starts without errors
2. Frontend connects to backend successfully
3. NAMASTE search returns results with ICD-11 mappings
4. WHO search returns ICD-11 codes
5. Statistics load dynamically
6. Real-time search works with debouncing
7. UI is responsive and user-friendly
8. No console errors in browser
9. API endpoints return expected data

## 🔄 Next Steps

After successful testing:
1. Add more NAMASTE CSV data
2. Configure WHO ICD-11 API credentials
3. Implement auto-mapping functionality
4. Add validation and approval workflows
5. Enhance ML-based mapping accuracy

