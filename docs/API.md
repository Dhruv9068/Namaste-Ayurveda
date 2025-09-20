# 🔌 NAMASTE API Documentation

## Overview

The NAMASTE API provides comprehensive endpoints for traditional medicine integration with modern healthcare systems. All endpoints are RESTful and follow FHIR R4 standards.

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses OAuth 2.0 for authentication with WHO ICD-11 services and API keys for internal services.

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 📋 API Endpoints

### 1. Health Check

#### GET /health
Check system health and status.

**Response:**
```json
{
  "status": "healthy",
  "data_loaded": true,
  "model_trained": true,
  "timestamp": "2025-09-20T01:40:19Z"
}
```

---

### 2. NAMASTE Search

#### POST /namaste/search
Search NAMASTE codes across all traditional medicine systems.

**Request Body:**
```json
{
  "query": "vata disorders",
  "systems": ["ayurveda", "siddha", "unani"],
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "namasteCode": "AAA-2.1",
      "namasteTerm": "वातप्रकोपः",
      "englishTerm": "vAtaprakopaH",
      "system": "Ayurveda",
      "description": "Vata disorder",
      "icd11Mappings": [
        {
          "code": "XM4567",
          "term": "Respiratory dysfunction",
          "confidence": 94,
          "validated": true
        }
      ]
    }
  ],
  "total": 10
}
```

**Parameters:**
- `query` (string, required): Search term
- `systems` (array, optional): Medicine systems to search
- `limit` (number, optional): Maximum results to return

---

### 3. WHO ICD-11 Search

#### POST /who/search
Search WHO ICD-11 codes including TM2 module.

**Request Body:**
```json
{
  "query": "diabetes",
  "include_tm2": true
}
```

**Response:**
```json
{
  "results": [
    {
      "code": "5A10",
      "title": "Type 1 diabetes mellitus",
      "definition": "A form of diabetes mellitus that results from the autoimmune destruction of the insulin-producing beta cells of the pancreas.",
      "system": "ICD-11 Foundation",
      "uri": "http://id.who.int/icd/entity/123456789"
    }
  ],
  "total": 100
}
```

**Parameters:**
- `query` (string, required): Search term
- `include_tm2` (boolean, optional): Include Traditional Medicine Module 2

---

### 4. ML Prediction

#### POST /ml/predict
Get ML-based predictions for clinical text.

**Request Body:**
```json
{
  "clinical_text": "Patient has vata imbalance with digestive issues"
}
```

**Response:**
```json
{
  "predictions": [
    {
      "namasteCode": "AAA-2.1",
      "confidence": 0.95,
      "reasoning": "Vata imbalance indicated by digestive symptoms"
    }
  ],
  "model_version": "1.0.0"
}
```

---

### 5. AI Explanation

#### POST /ai/explain-mapping
Get AI explanation for NAMASTE to ICD-11 mapping.

**Request Body:**
```json
{
  "namaste_data": {
    "term_english": "Vata disorders",
    "code": "VAT001"
  },
  "icd11_data": {
    "code": "BA4Z",
    "title": "Vata disorders"
  },
  "confidence": 95
}
```

**Response:**
```json
{
  "explanation": {
    "rationale": "**Medical Rationale**: Vata disorders in Ayurveda correspond to nervous system and movement disorders in modern medicine...",
    "laymanExplanation": "**Layman Explanation**: Vata disorders affect the nervous system and can cause...",
    "comparison": "**Comparison**: Traditional Ayurvedic concept of Vata aligns with...",
    "recommendations": [
      "Consider neurological examination",
      "Monitor for movement disorders",
      "Traditional treatment may complement modern medicine"
    ]
  },
  "confidence": 95
}
```

---

### 6. CSV Upload

#### POST /csv/upload
Upload NAMASTE CSV files for processing.

**Request:**
```http
POST /csv/upload
Content-Type: multipart/form-data

file: <csv_file>
system_type: ayurveda
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "new_records": 1500,
  "total_records": 4523,
  "mapping_report": {
    "mapping_percentage": 85.2,
    "validated_mappings": 1200,
    "pending_review": 300
  }
}
```

---

### 7. WHO Sync

#### POST /who/sync
Synchronize with WHO ICD-11 API.

**Response:**
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "last_sync": "2025-09-20T01:40:19Z",
  "records_updated": 1000
}
```

---

### 8. Auto Mapping

#### POST /mapping/auto
Start automatic mapping process.

**Request Body:**
```json
{
  "system_type": "ayurveda"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-mapping started",
  "mapped_count": 500,
  "total_records": 1000,
  "progress": 50
}
```

---

### 9. Statistics

#### GET /stats
Get system statistics and metrics.

**Response:**
```json
{
  "total_codes": 4478,
  "systems": {
    "ayurveda": 30,
    "siddha": 1926,
    "unani": 2522
  },
  "mapping_accuracy": 94.2,
  "api_calls_today": 1500,
  "last_updated": "2025-09-20T01:40:19Z"
}
```

---

### 10. Audit Logs

#### GET /audit/logs
Get system audit logs.

**Query Parameters:**
- `limit` (number, optional): Number of logs to return
- `level` (string, optional): Log level filter

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2025-09-20T01:40:19Z",
      "level": "INFO",
      "message": "NAMASTE search completed",
      "user_id": "user123",
      "action": "search"
    }
  ],
  "total": 1000
}
```

---

## 🔧 Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2025-09-20T01:40:19Z"
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Example Error Response
```json
{
  "error": "Invalid search query",
  "code": "INVALID_QUERY",
  "details": "Query must be at least 2 characters long",
  "timestamp": "2025-09-20T01:40:19Z"
}
```

---

## 📊 Rate Limiting

### Limits
- **Search API**: 100 requests per minute
- **Upload API**: 10 requests per minute
- **AI API**: 50 requests per minute
- **General API**: 1000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1632000000
```

---

## 🔐 Security

### Authentication Methods
1. **API Key**: For internal services
2. **OAuth 2.0**: For WHO ICD-11 API
3. **JWT Token**: For user authentication

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📈 Performance

### Response Times
- **Search API**: < 200ms
- **Upload API**: < 5s
- **AI API**: < 2s
- **Health Check**: < 50ms

### Caching
- **Search Results**: 5 minutes
- **WHO API Data**: 1 hour
- **Statistics**: 30 seconds

---

## 🧪 Testing

### Test Endpoints
```bash
# Health check
curl -X GET http://localhost:5000/api/health

# NAMASTE search
curl -X POST http://localhost:5000/api/namaste/search \
  -H "Content-Type: application/json" \
  -d '{"query": "vata", "systems": ["ayurveda"], "limit": 5}'

# WHO search
curl -X POST http://localhost:5000/api/who/search \
  -H "Content-Type: application/json" \
  -d '{"query": "diabetes", "include_tm2": true}'
```

### Test Data
The API includes test data for all traditional medicine systems:
- **Ayurveda**: 30 test records
- **Siddha**: 1,926 test records
- **Unani**: 2,522 test records

---

## 📚 SDK Examples

### JavaScript/TypeScript
```typescript
import { NAMASTEClient } from '@namaste/sdk';

const client = new NAMASTEClient({
  baseUrl: 'http://localhost:5000/api',
  apiKey: 'your-api-key'
});

// Search NAMASTE codes
const results = await client.search({
  query: 'vata disorders',
  systems: ['ayurveda', 'siddha'],
  limit: 10
});

// Get AI explanation
const explanation = await client.explainMapping({
  namasteCode: 'AAA-2.1',
  icd11Code: 'XM4567'
});
```

### Python
```python
from namaste import NAMASTEClient

client = NAMASTEClient(
    base_url='http://localhost:5000/api',
    api_key='your-api-key'
)

# Search NAMASTE codes
results = client.search(
    query='vata disorders',
    systems=['ayurveda', 'siddha'],
    limit=10
)

# Get AI explanation
explanation = client.explain_mapping(
    namaste_code='AAA-2.1',
    icd11_code='XM4567'
)
```

---

## 🔄 Webhooks

### Available Webhooks
- `mapping.completed` - When auto-mapping is completed
- `upload.processed` - When CSV upload is processed
- `sync.completed` - When WHO sync is completed
- `error.occurred` - When system errors occur

### Webhook Payload
```json
{
  "event": "mapping.completed",
  "timestamp": "2025-09-20T01:40:19Z",
  "data": {
    "system_type": "ayurveda",
    "mapped_count": 500,
    "total_records": 1000
  }
}
```

---

## 📖 Changelog

### Version 1.0.0
- Initial API release
- NAMASTE search functionality
- WHO ICD-11 integration
- AI explanation service
- CSV upload support
- Analytics and reporting

---

## 🤝 Support

For API support and questions:
- **Email**: api-support@namaste-ehr.com
- **Documentation**: [API Docs](https://docs.namaste-ehr.com/api)
- **Status Page**: [API Status](https://status.namaste-ehr.com)

---

This comprehensive API documentation provides all the information needed to integrate with the NAMASTE system and leverage its powerful traditional medicine capabilities.
