import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Book, ArrowRight, Copy, CheckCircle, Database, Zap } from 'lucide-react';

// Documentation page explaining API workflow and code snippets
// Yeh documentation page hai jahan API workflow aur code snippets explain karte hai
const Documentation: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeSnippets = [
    {
      id: 'fhir-bundle',
      title: 'FHIR Bundle with Dual Coding',
      language: 'json',
      code: `{
  "resourceType": "Bundle",
  "id": "namaste-encounter-bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Condition",
        "id": "vata-disorder-001",
        "subject": { "reference": "Patient/patient-123" },
        "code": {
          "coding": [
            {
              "system": "https://namaste.ayush.gov.in/codes",
              "code": "AAA-2.1",
              "display": "प्राणवातकोप"
            },
            {
              "system": "http://id.who.int/icd/release/11/tm2",
              "code": "XM1234",
              "display": "Respiratory dysfunction"
            }
          ]
        },
        "clinicalStatus": {
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
            "code": "active"
          }]
        }
      }
    }
  ]
}`
    },
    {
      id: 'search-api',
      title: 'NAMASTE Code Search API',
      language: 'javascript',
      code: `// Search NAMASTE codes with auto-complete
const searchNamasteCodes = async (query) => {
  const response = await fetch('/api/namaste/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      query: query,
      systems: ['ayurveda', 'siddha', 'unani'],
      limit: 10
    })
  });
  
  return await response.json();
};

// Get ICD-11 mapping suggestions
const getICD11Mapping = async (namasteCode) => {
  const response = await fetch('/api/mapping/namaste-to-icd11', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      namasteCode: namasteCode,
      targetSystem: 'tm2'
    })
  });
  
  return await response.json();
};`
    },
    {
      id: 'gemini-integration',
      title: 'Gemini AI Integration for Mapping',
      language: 'python',
      code: `import google.generativeai as genai
from typing import List, Dict

class NAMASTEMappingService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def map_diagnosis_to_codes(self, 
                                   clinical_text: str) -> Dict:
        """
        Map clinical diagnosis to NAMASTE and ICD-11 codes
        using Gemini AI with LangChain integration
        """
        prompt = f"""
        Analyze this Ayurvedic/Traditional diagnosis:
        "{clinical_text}"
        
        Provide:
        1. Most appropriate NAMASTE code
        2. Corresponding ICD-11 TM2 code
        3. Confidence score (0-100)
        4. Explanation of mapping logic
        
        Format as JSON with proper medical terminology.
        """
        
        response = await self.model.generate_content(prompt)
        return self._parse_ai_response(response.text)
    
    def _parse_ai_response(self, response: str) -> Dict:
        # Parse and validate AI response
        # Return structured mapping data
        pass`
    },
    {
      id: 'valueset-lookup',
      title: 'FHIR ValueSet Lookup',
      language: 'javascript',
      code: `// FHIR-compliant ValueSet expansion
const expandValueSet = async (systemFilter = null) => {
  const params = new URLSearchParams({
    url: 'https://namaste.ayush.gov.in/ValueSet/traditional-medicine-codes',
    ...(systemFilter && { filter: systemFilter })
  });
  
  const response = await fetch(\`/fhir/ValueSet/$expand?\${params}\`, {
    headers: {
      'Accept': 'application/fhir+json',
      'Authorization': \`Bearer \${fhirToken}\`
    }
  });
  
  const valueSet = await response.json();
  return valueSet.expansion.contains;
};

// ConceptMap translation operation
const translateCode = async (sourceCode, targetSystem) => {
  const response = await fetch('/fhir/ConceptMap/$translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
      'Authorization': \`Bearer \${fhirToken}\`
    },
    body: JSON.stringify({
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'url',
          valueUri: 'https://namaste.ayush.gov.in/ConceptMap/namaste-to-icd11'
        },
        {
          name: 'code',
          valueCode: sourceCode
        },
        {
          name: 'targetsystem',
          valueUri: targetSystem
        }
      ]
    })
  });
  
  return await response.json();
};`
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              API Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete guide to integrating NAMASTE codes with ICD-11 mapping using our EHR API
            </p>
          </div>

          {/* Quick start */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Database,
                title: 'FHIR Compliance',
                description: 'Full FHIR R4 compatibility with India EHR Standards 2016',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: 'AI-Powered Mapping',
                description: 'Gemini AI integration for intelligent code translation',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Book,
                title: 'Comprehensive Coverage',
                description: '4,500+ NAMASTE codes mapped to ICD-11 TM2',
                color: 'from-green-500 to-teal-500'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* API endpoints */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">API Endpoints</h2>
            <div className="space-y-6">
              {[
                { method: 'GET', endpoint: '/api/namaste/search', description: 'Search NAMASTE codes with auto-complete' },
                { method: 'POST', endpoint: '/api/mapping/translate', description: 'Translate NAMASTE codes to ICD-11' },
                { method: 'POST', endpoint: '/fhir/Bundle', description: 'Upload FHIR Bundle with dual coding' },
                { method: 'GET', endpoint: '/fhir/ValueSet/$expand', description: 'Expand NAMASTE ValueSet' },
                { method: 'POST', endpoint: '/fhir/ConceptMap/$translate', description: 'FHIR ConceptMap translation' }
              ].map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-600'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-primary-600 font-mono">{endpoint.endpoint}</code>
                  </div>
                  <p className="text-gray-600 text-sm">{endpoint.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Code examples */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Code Examples</h2>
            {codeSnippets.map((snippet, index) => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-primary-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{snippet.title}</h3>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">
                      {snippet.language}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(snippet.code, snippet.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    {copiedCode === snippet.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <code className="text-gray-100 text-sm">{snippet.code}</code>
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Integration workflow */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Integration Workflow</h2>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: 'Ingest NAMASTE CSV',
                    description: 'Load NAMASTE codes and generate FHIR CodeSystem'
                  },
                  {
                    step: 2,
                    title: 'Fetch ICD-11 Updates',
                    description: 'Sync with WHO ICD-11 API for TM2 and Biomedicine codes'
                  },
                  {
                    step: 3,
                    title: 'AI-Powered Mapping',
                    description: 'Use Gemini AI with LangChain for intelligent code mapping'
                  },
                  {
                    step: 4,
                    title: 'FHIR Bundle Upload',
                    description: 'Submit dual-coded diagnoses via secure FHIR endpoints'
                  },
                  {
                    step: 5,
                    title: 'Audit & Compliance',
                    description: 'Track changes with ISO 22600 and ABHA authentication'
                  }
                ].map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    {index < 4 && <ArrowRight className="w-6 h-6 text-gray-400" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Documentation;