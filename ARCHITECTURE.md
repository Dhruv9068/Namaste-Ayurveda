# System Architecture - Namaste Ayurveda EHR

## 🏗️ Complete System Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI1[Dashboard]
        UI2[Discussion Forum]
        UI3[Research Portal]
        UI4[Mapping Interface]
        UI5[Analytics]
    end
    
    subgraph "Frontend Framework"
        FE1[React 18 + TypeScript]
        FE2[Tailwind CSS]
        FE3[Framer Motion]
        FE4[Recharts]
        FE5[React Router]
    end
    
    subgraph "API Integration Layer"
        API1[Gemini AI API]
        API2[Firebase Firestore]
        API3[Flask Backend API]
        API4[WHO ICD-11 API]
    end
    
    subgraph "Backend Services"
        BE1[Flask Application]
        BE2[ML Pipeline]
        BE3[Data Processing]
        BE4[API Endpoints]
    end
    
    subgraph "AI/ML Layer"
        ML1[Keyword Matching]
        ML2[TF-IDF Vectorization]
        ML3[Cosine Similarity]
        ML4[Gemini AI Processing]
        ML5[Confidence Scoring]
    end
    
    subgraph "Data Storage"
        DS1[NAMASTE CSV Files]
        DS2[Firebase Firestore]
        DS3[Keyword Mapping JSON]
        DS4[Research Papers]
        DS5[User Data]
    end
    
    subgraph "External Services"
        EXT1[Google Gemini AI]
        EXT2[WHO ICD-11 Database]
        EXT3[Firebase Services]
    end
    
    UI1 --> FE1
    UI2 --> FE1
    UI3 --> FE1
    UI4 --> FE1
    UI5 --> FE1
    
    FE1 --> API1
    FE1 --> API2
    FE1 --> API3
    
    API3 --> BE1
    BE1 --> BE2
    BE1 --> BE3
    BE1 --> BE4
    
    BE2 --> ML1
    BE2 --> ML2
    BE2 --> ML3
    BE2 --> ML4
    BE2 --> ML5
    
    ML1 --> DS3
    ML2 --> DS1
    ML4 --> EXT1
    
    API2 --> DS2
    API2 --> EXT3
    API4 --> EXT2
    
    BE3 --> DS1
    BE3 --> DS4
```

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant KeywordEngine
    participant GeminiAI
    participant MLEngine
    participant Backend
    participant Database
    
    User->>Frontend: Enter clinical text
    Frontend->>KeywordEngine: Check keyword matches
    
    alt Keywords found
        KeywordEngine->>Frontend: Return instant suggestions
    else No keywords match
        Frontend->>GeminiAI: Send to AI analysis
        GeminiAI->>Frontend: Return AI suggestions
    end
    
    Frontend->>MLEngine: Send to ML pipeline
    MLEngine->>Backend: Process with TF-IDF
    Backend->>Database: Query NAMASTE data
    Database->>Backend: Return matching records
    Backend->>MLEngine: Calculate similarities
    MLEngine->>Frontend: Return ML suggestions
    
    Frontend->>User: Display combined results
```

## 🧠 AI/ML Pipeline Architecture

```mermaid
graph LR
    subgraph "Input Processing"
        A[Clinical Text Input]
        B[Text Preprocessing]
        C[Language Detection]
    end
    
    subgraph "Tier 1: Keyword Matching"
        D[JSON Keyword Database]
        E[Pattern Matching]
        F[Instant Results]
    end
    
    subgraph "Tier 2: Gemini AI"
        G[Gemini API Call]
        H[Context Analysis]
        I[Medical NLP]
    end
    
    subgraph "Tier 3: ML Pipeline"
        J[TF-IDF Vectorizer]
        K[Cosine Similarity]
        L[Confidence Scoring]
    end
    
    subgraph "Output Processing"
        M[Result Aggregation]
        N[Confidence Ranking]
        O[Final Suggestions]
    end
    
    A --> B
    B --> C
    C --> D
    C --> G
    C --> J
    
    D --> E --> F
    G --> H --> I
    J --> K --> L
    
    F --> M
    I --> M
    L --> M
    
    M --> N --> O
```

## 📊 Database Schema

### Firebase Firestore Collections

```mermaid
erDiagram
    DISCUSSIONS {
        string id PK
        string title
        string content
        string author
        string authorId
        string category
        array tags
        timestamp createdAt
        array replies
        number likes
        number views
    }
    
    USERS {
        string id PK
        string name
        string email
        string role
        string specialization
        timestamp createdAt
        object preferences
    }
    
    MAPPINGS {
        string id PK
        string namasteCode
        string icd11Code
        string clinicalText
        number confidence
        string validatedBy
        timestamp createdAt
        boolean isValidated
    }
    
    RESEARCH_PAPERS {
        string id PK
        string title
        array authors
        string journal
        number year
        string abstract
        array keywords
        string downloadUrl
        string category
    }
    
    DISCUSSIONS ||--o{ USERS : "created_by"
    MAPPINGS ||--o{ USERS : "validated_by"
    RESEARCH_PAPERS ||--o{ USERS : "authored_by"
```

### CSV Data Structure

```mermaid
erDiagram
    NAMASTE_AYURVEDA {
        string code PK
        string term_original
        string term_english
        string description
        string category
        string icd11_code
        string icd11_term
    }
    
    NAMASTE_SIDDHA {
        string code PK
        string term_original
        string term_english
        string description
        string category
        string icd11_code
        string icd11_term
    }
    
    NAMASTE_UNANI {
        string code PK
        string term_original
        string term_english
        string description
        string category
        string icd11_code
        string icd11_term
    }
```

## 🔧 Component Architecture

```mermaid
graph TB
    subgraph "App Component"
        APP[App.tsx]
        ROUTER[React Router]
        NAVBAR[Navbar Component]
    end
    
    subgraph "Page Components"
        HOME[HomePage]
        DASH[Dashboard]
        DOCS[Documentation]
        RESEARCH[Research]
        DISCUSSION[Discussion]
    end
    
    subgraph "Dashboard Components"
        SIDEBAR[Sidebar]
        MAIN[DashboardMain]
        PATIENTS[PatientsPanel]
        DOCTORS[DoctorsPanel]
        MAPPING[MappingPanel]
        ANALYTICS[AnalyticsPanel]
        SETTINGS[SettingsPanel]
    end
    
    subgraph "Services"
        GEMINI[GeminiService]
        FIREBASE[DiscussionService]
        API[Backend API]
    end
    
    subgraph "Data Layer"
        KEYWORDS[keywordMapping.json]
        MOCK[Mock Data]
        CSV[CSV Files]
    end
    
    APP --> ROUTER
    ROUTER --> HOME
    ROUTER --> DASH
    ROUTER --> DOCS
    ROUTER --> RESEARCH
    ROUTER --> DISCUSSION
    
    DASH --> SIDEBAR
    DASH --> MAIN
    DASH --> PATIENTS
    DASH --> DOCTORS
    DASH --> MAPPING
    DASH --> ANALYTICS
    DASH --> SETTINGS
    
    DOCTORS --> GEMINI
    DISCUSSION --> FIREBASE
    MAPPING --> API
    
    GEMINI --> KEYWORDS
    API --> CSV
    FIREBASE --> MOCK
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV1[Local React Dev Server]
        DEV2[Local Flask Server]
        DEV3[Local Firebase Emulator]
    end
    
    subgraph "Production Frontend"
        PROD1[Netlify/Vercel]
        PROD2[CDN Distribution]
        PROD3[Static Assets]
    end
    
    subgraph "Production Backend"
        PROD4[Railway/Heroku]
        PROD5[Flask Application]
        PROD6[ML Models]
        PROD7[CSV Data]
    end
    
    subgraph "External Services"
        EXT1[Firebase Firestore]
        EXT2[Google Gemini AI]
        EXT3[WHO ICD-11 API]
    end
    
    subgraph "Monitoring & Analytics"
        MON1[Application Logs]
        MON2[Performance Metrics]
        MON3[Error Tracking]
    end
    
    DEV1 --> PROD1
    DEV2 --> PROD4
    
    PROD1 --> PROD2
    PROD2 --> PROD3
    
    PROD4 --> PROD5
    PROD5 --> PROD6
    PROD5 --> PROD7
    
    PROD1 --> EXT1
    PROD1 --> EXT2
    PROD5 --> EXT3
    
    PROD1 --> MON1
    PROD4 --> MON2
    PROD5 --> MON3
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        AUTH1[Firebase Auth]
        AUTH2[JWT Tokens]
        AUTH3[Role-based Access]
    end
    
    subgraph "API Security"
        SEC1[CORS Configuration]
        SEC2[Rate Limiting]
        SEC3[Input Validation]
        SEC4[API Key Management]
    end
    
    subgraph "Data Security"
        DATA1[Firestore Rules]
        DATA2[Environment Variables]
        DATA3[Encrypted Storage]
    end
    
    subgraph "Network Security"
        NET1[HTTPS Encryption]
        NET2[Secure Headers]
        NET3[Content Security Policy]
    end
    
    AUTH1 --> AUTH2
    AUTH2 --> AUTH3
    
    SEC1 --> SEC2
    SEC2 --> SEC3
    SEC3 --> SEC4
    
    DATA1 --> DATA2
    DATA2 --> DATA3
    
    NET1 --> NET2
    NET2 --> NET3
```

## 📈 Performance Architecture

```mermaid
graph LR
    subgraph "Frontend Optimization"
        FE1[Code Splitting]
        FE2[Lazy Loading]
        FE3[Memoization]
        FE4[Bundle Optimization]
    end
    
    subgraph "Backend Optimization"
        BE1[Response Caching]
        BE2[Database Indexing]
        BE3[Query Optimization]
        BE4[Connection Pooling]
    end
    
    subgraph "ML Optimization"
        ML1[Model Caching]
        ML2[Vectorization Cache]
        ML3[Batch Processing]
        ML4[Parallel Computing]
    end
    
    subgraph "Network Optimization"
        NET1[CDN Distribution]
        NET2[Compression]
        NET3[HTTP/2]
        NET4[Resource Prefetching]
    end
    
    FE1 --> FE2
    FE2 --> FE3
    FE3 --> FE4
    
    BE1 --> BE2
    BE2 --> BE3
    BE3 --> BE4
    
    ML1 --> ML2
    ML2 --> ML3
    ML3 --> ML4
    
    NET1 --> NET2
    NET2 --> NET3
    NET3 --> NET4
```

## 🔄 Real-time Data Flow

```mermaid
graph TB
    subgraph "Real-time Features"
        RT1[Dashboard Updates]
        RT2[Discussion Forum]
        RT3[AI Mapping Results]
        RT4[System Notifications]
    end
    
    subgraph "WebSocket Connections"
        WS1[Firebase Realtime]
        WS2[Server-Sent Events]
        WS3[Polling Mechanisms]
    end
    
    subgraph "State Management"
        STATE1[React State]
        STATE2[Context API]
        STATE3[Local Storage]
    end
    
    RT1 --> WS3
    RT2 --> WS1
    RT3 --> WS2
    RT4 --> WS1
    
    WS1 --> STATE1
    WS2 --> STATE2
    WS3 --> STATE3
```

This architecture provides a comprehensive view of how all components interact in the Namaste Ayurveda EHR system, from user interface to data storage, ensuring scalability, security, and performance.