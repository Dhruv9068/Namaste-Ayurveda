# 🏗️ NAMASTE System Architecture

## System Overview

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[Web Dashboard] --> B[Code Mapping Interface]
        A --> C[Analytics Dashboard]
        A --> D[CSV Upload Panel]
        A --> E[WHO Sync Panel]
        A --> F[AI Chatbot]
    end
    
    subgraph "API Gateway Layer"
        G[Flask API Gateway] --> H[Authentication]
        G --> I[Rate Limiting]
        G --> J[Request Routing]
    end
    
    subgraph "Service Layer"
        K[NAMASTE Service] --> L[Search Engine]
        M[WHO ICD-11 Service] --> N[API Client]
        O[ML Prediction Service] --> P[Model Inference]
        Q[Gemini AI Service] --> R[AI Processing]
    end
    
    subgraph "Data Layer"
        S[CSV Files] --> T[Pandas Processing]
        U[WHO ICD-11 API] --> V[Real-time Data]
        W[Gemini AI API] --> X[AI Responses]
        Y[Firebase] --> Z[Data Storage]
    end
    
    A --> G
    G --> K
    G --> M
    G --> O
    G --> Q
    K --> S
    M --> U
    Q --> W
    O --> Y
```

## Data Processing Flow

```mermaid
flowchart TD
    A[CSV Upload] --> B{Format Validation}
    B -->|Valid| C[System Detection]
    B -->|Invalid| D[Error Response]
    C --> E[Column Mapping]
    E --> F[Data Cleaning]
    F --> G[Pandas Processing]
    G --> H[Database Storage]
    H --> I[Search Indexing]
    I --> J[API Ready]
    
    K[Search Query] --> L[Fuzzy Matching]
    L --> M[System Filtering]
    M --> N[Result Ranking]
    N --> O[AI Enhancement]
    O --> P[Response Generation]
```

## AI Integration Architecture

```mermaid
graph LR
    subgraph "Input Processing"
        A[User Query] --> B[Text Preprocessing]
        B --> C[Context Extraction]
    end
    
    subgraph "AI Processing"
        D[Gemini AI] --> E[Medical Analysis]
        E --> F[Similarity Scoring]
        F --> G[Mapping Generation]
        G --> H[Explanation Creation]
    end
    
    subgraph "Output Processing"
        I[Response Formatting] --> J[Markdown Conversion]
        J --> K[UI Rendering]
    end
    
    C --> D
    H --> I
    K --> L[User Interface]
```

## WHO ICD-11 Integration

```mermaid
sequenceDiagram
    participant C as Client
    participant B as Backend
    participant W as WHO API
    participant A as Auth Service
    
    C->>B: Search Request
    B->>A: Check Token
    A-->>B: Token Valid
    B->>W: Foundation API Call
    W-->>B: Foundation Results
    B->>W: TM2 API Call
    W-->>B: TM2 Results
    B->>W: MMS API Call
    W-->>B: MMS Results
    B->>B: Combine Results
    B-->>C: Formatted Response
```

## Database Schema

```mermaid
erDiagram
    NAMASTE_CODES {
        string code PK
        string term_english
        string term_original
        string system
        string description
        string category
    }
    
    ICD11_MAPPINGS {
        string namaste_code FK
        string icd11_code
        string icd11_term
        float confidence
        boolean validated
    }
    
    AI_EXPLANATIONS {
        string mapping_id FK
        string rationale
        string layman_explanation
        string comparison
        json recommendations
    }
    
    UPLOAD_HISTORY {
        string filename
        datetime upload_date
        string system_type
        int records_count
        string status
    }
    
    NAMASTE_CODES ||--o{ ICD11_MAPPINGS : has
    ICD11_MAPPINGS ||--o{ AI_EXPLANATIONS : generates
```

## Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        A[OAuth 2.0] --> B[Token Validation]
        C[API Keys] --> D[Service Authentication]
    end
    
    subgraph "Authorization Layer"
        E[Role-based Access] --> F[Permission Matrix]
        G[Resource Protection] --> H[Access Control]
    end
    
    subgraph "Data Protection"
        I[Encryption at Rest] --> J[Data Security]
        K[Encryption in Transit] --> L[Network Security]
        M[Audit Logging] --> N[Compliance]
    end
    
    subgraph "API Security"
        O[Rate Limiting] --> P[DoS Protection]
        Q[Input Validation] --> R[Injection Prevention]
        S[CORS Policy] --> T[Cross-origin Security]
    end
```

## Performance Optimization

```mermaid
graph LR
    subgraph "Caching Strategy"
        A[Redis Cache] --> B[API Response Cache]
        C[Memory Cache] --> D[Frequent Queries]
        E[CDN] --> F[Static Assets]
    end
    
    subgraph "Database Optimization"
        G[Indexing] --> H[Query Performance]
        I[Connection Pooling] --> J[Resource Management]
        K[Query Optimization] --> L[Response Time]
    end
    
    subgraph "API Optimization"
        M[Pagination] --> N[Data Transfer]
        O[Compression] --> P[Bandwidth]
        Q[Async Processing] --> R[Response Time]
    end
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Frontend Deployment"
        A[Vite Build] --> B[Static Files]
        B --> C[CDN Distribution]
        C --> D[Global Access]
    end
    
    subgraph "Backend Deployment"
        E[Flask App] --> F[WSGI Server]
        F --> G[Load Balancer]
        G --> H[Multiple Instances]
    end
    
    subgraph "Database Deployment"
        I[PostgreSQL] --> J[Primary Database]
        K[Redis] --> L[Cache Layer]
        M[Firebase] --> N[Cloud Storage]
    end
    
    subgraph "External Services"
        O[WHO ICD-11 API] --> P[External Integration]
        Q[Gemini AI API] --> R[AI Services]
    end
```

## Monitoring & Analytics

```mermaid
graph TB
    subgraph "Application Monitoring"
        A[Health Checks] --> B[System Status]
        C[Performance Metrics] --> D[Response Times]
        E[Error Tracking] --> F[Issue Detection]
    end
    
    subgraph "Business Analytics"
        G[Usage Statistics] --> H[User Behavior]
        I[Search Analytics] --> J[Popular Terms]
        K[Mapping Analytics] --> L[Success Rates]
    end
    
    subgraph "Infrastructure Monitoring"
        M[Server Metrics] --> N[Resource Usage]
        O[Database Metrics] --> P[Query Performance]
        Q[API Metrics] --> R[External Dependencies]
    end
```

## Error Handling Strategy

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type}
    B -->|API Error| C[Retry Logic]
    B -->|Data Error| D[Validation Response]
    B -->|System Error| E[Fallback Mode]
    
    C --> F{Retry Successful?}
    F -->|Yes| G[Continue Processing]
    F -->|No| H[Fallback Response]
    
    D --> I[User Notification]
    E --> J[Mock Data Response]
    
    G --> K[Success Response]
    H --> L[Error Response]
    I --> L
    J --> M[Partial Response]
```

## Scalability Plan

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        A[Load Balancer] --> B[App Instance 1]
        A --> C[App Instance 2]
        A --> D[App Instance N]
    end
    
    subgraph "Database Scaling"
        E[Read Replicas] --> F[Query Distribution]
        G[Sharding] --> H[Data Partitioning]
        I[Connection Pooling] --> J[Resource Optimization]
    end
    
    subgraph "Caching Strategy"
        K[Redis Cluster] --> L[Distributed Cache]
        M[CDN] --> N[Global Distribution]
        O[Memory Cache] --> P[Local Caching]
    end
```

This architecture ensures NAMASTE is scalable, secure, and maintainable while providing excellent performance for traditional medicine integration with modern healthcare systems.
