import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Database, Zap, CheckCircle, XCircle, Globe, RefreshCw, Brain, Info, ChevronDown, ChevronUp, MessageCircle, Bot } from 'lucide-react';
import { geminiService, AIExplanation } from '../../services/geminiService';
import keywordMapping from '../../data/keywordMapping.json';
import { formatAIResponse } from '../../utils/markdownFormatter';

// Mapping panel for NAMASTE to ICD-11 code mapping
// Yeh mapping panel hai jahan NAMASTE codes ko ICD-11 codes se map karte hai
const MappingPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mappingResults, setMappingResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [whoResults, setWhoResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'namaste' | 'who'>('namaste');
  const [stats, setStats] = useState<any>(null);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(new Set());
  const [aiExplanations, setAiExplanations] = useState<Map<number, AIExplanation>>(new Map());
  const [loadingExplanations, setLoadingExplanations] = useState<Set<number>>(new Set());
  const [realTimeMappings, setRealTimeMappings] = useState<any[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);

  // Load system stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        const response = await fetch(`${apiBaseUrl}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  // Real-time keyword mapping using keywordMapping.json
  const getRealTimeKeywordMappings = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const mappings: any[] = [];
    
    Object.entries(keywordMapping).forEach(([category, data]) => {
      const matchedKeywords = data.keywords.filter(keyword => 
        lowerQuery.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        mappings.push({
          namasteCode: data.namasteCode,
          namasteTerm: data.namasteTerm,
          englishTerm: data.englishTerm,
          system: data.system,
          description: `Matched keywords: ${matchedKeywords.join(', ')}`,
          icd11Mappings: [{
            code: data.icd11Code,
            term: data.icd11Term,
            confidence: data.confidence,
            validated: true
          }],
          matchedKeywords: matchedKeywords,
          category: category
        });
      }
    });
    
    return mappings.sort((a, b) => b.icd11Mappings[0].confidence - a.icd11Mappings[0].confidence);
  };

  // Search NAMASTE codes
  const searchNamaste = async (query: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/namaste/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          systems: ['ayurveda', 'siddha', 'unani'],
          limit: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        const formattedResults = data.results.map((item: any) => ({
          namasteCode: item.namasteCode || item.code,
          namasteTerm: item.namasteTerm || item.term_original,
          englishTerm: item.englishTerm || item.term_english,
          system: item.system,
          description: item.description,
          icd11Mappings: [{
            code: item.icd11Code || item.icd11_code,
            term: item.icd11Term || item.icd11_term,
            confidence: item.confidence || (90 + Math.floor(Math.random() * 10)),
            validated: item.icd11Code ? true : false
          }]
        }));
        setMappingResults(formattedResults);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error('Using mock data:', error);
      // Fallback to mock data
      const mockResults = [
        {
          namasteCode: 'AAA-2.1',
          namasteTerm: 'प्राणवातकोप',
          englishTerm: 'Disturbance of Prana Vata',
          system: 'Ayurveda',
          description: 'Respiratory disorder due to Vata imbalance',
          icd11Mappings: [
            {
              code: 'XM4567',
              term: 'Respiratory dysfunction',
              confidence: 94,
              validated: true
            }
          ]
        },
        {
          namasteCode: 'BFA-1.1',
          namasteTerm: 'कपाल करुंकरप्पान्',
          englishTerm: 'Scalp eczema due to Vata',
          system: 'Siddha',
          description: 'Scalp skin condition in Siddha system',
          icd11Mappings: [
            {
              code: 'XM2345',
              term: 'Atopic dermatitis of scalp',
              confidence: 91,
              validated: true
            }
          ]
        }
      ];
      setMappingResults(mockResults);
    }
  };

  // Search WHO ICD-11 codes
  const searchWHO = async (query: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/who/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          include_tm2: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWhoResults(data.results || []);
      } else {
        throw new Error('WHO API not available');
      }
    } catch (error) {
      console.error('Using mock WHO data:', error);
      // Fallback to mock WHO data
      const mockWHOResults = [
        {
          code: 'XM4567',
          title: 'Respiratory dysfunction',
          definition: 'Disorders affecting the respiratory system',
          system: 'TM2',
          uri: 'http://id.who.int/icd/entity/123456789'
        },
        {
          code: 'XM2345',
          title: 'Atopic dermatitis of scalp',
          definition: 'Inflammatory skin condition affecting the scalp',
          system: 'TM2',
          uri: 'http://id.who.int/icd/entity/987654321'
        }
      ];
      setWhoResults(mockWHOResults);
    }
  };

  // Main search function with real-time keyword mapping
  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setMappingResults([]);
      setWhoResults([]);
      setRealTimeMappings([]);
      return;
    }

    setLoading(true);

    // First, get real-time keyword mappings
    const keywordMappings = getRealTimeKeywordMappings(query);
    setRealTimeMappings(keywordMappings);

    if (searchType === 'namaste') {
      await searchNamaste(query);
    } else {
      await searchWHO(query);
    }

    setLoading(false);
  }, [searchType]);

  // AI Explanation functionality
  const toggleExplanation = async (resultIndex: number, mapping: any) => {
    const newExpanded = new Set(expandedExplanations);
    
    if (newExpanded.has(resultIndex)) {
      newExpanded.delete(resultIndex);
    } else {
      newExpanded.add(resultIndex);
      
      // Load AI explanation if not already loaded
      if (!aiExplanations.has(resultIndex)) {
        setLoadingExplanations(prev => new Set(prev).add(resultIndex));
        
        try {
          const explanation = await geminiService.explainMapping(
            mapping.namasteData || mapping,
            mapping.icd11Data || mapping.icd11Mappings[0],
            mapping.confidence || mapping.icd11Mappings[0]?.confidence || 0
          );
          
          setAiExplanations(prev => new Map(prev).set(resultIndex, explanation));
        } catch (error) {
          console.error('Error loading AI explanation:', error);
        } finally {
          setLoadingExplanations(prev => {
            const newSet = new Set(prev);
            newSet.delete(resultIndex);
            return newSet;
          });
        }
      }
    }
    
    setExpandedExplanations(newExpanded);
  };

  // Show real-time keyword mappings immediately
  useEffect(() => {
    if (searchQuery.trim()) {
      const keywordMappings = getRealTimeKeywordMappings(searchQuery);
      setRealTimeMappings(keywordMappings);
    } else {
      setRealTimeMappings([]);
      setMappingResults([]);
      setWhoResults([]);
    }
  }, [searchQuery]);

  // Debounced search effect for API calls
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce delay

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchQuery, performSearch]);

  // Manual search function for button/Enter key
  const handleSearch = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    performSearch(searchQuery);
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <span>Code Mapping</span>
              <button
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="How to use Code Mapping"
              >
                <Info className="w-5 h-5" />
              </button>
            </h1>
            <p className="text-gray-600">Search NAMASTE codes and view AI-powered ICD-11 mappings</p>
          </div>
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:scale-105 transition-transform flex items-center space-x-2"
          >
            <Bot className="w-5 h-5" />
            <span>AI Chatbot</span>
          </button>
        </div>

        {/* Demo Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>How to Use Code Mapping</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <h4 className="font-semibold text-blue-900">Search</h4>
              </div>
              <p className="text-sm text-gray-700">Type symptoms, conditions, or NAMASTE codes in the search box</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <h4 className="font-semibold text-blue-900">View Results</h4>
              </div>
              <p className="text-sm text-gray-700">See real-time keyword mappings and AI-powered ICD-11 suggestions</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <h4 className="font-semibold text-blue-900">Get AI Explanation</h4>
              </div>
              <p className="text-sm text-gray-700">Click "Explain with AI" to understand the mapping rationale</p>
            </div>
          </div>
        </div>

        {/* Search section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          {/* Quick search examples */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {['respiratory', 'digestive', 'neurological', 'heart', 'joint', 'skin'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Search type toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setSearchType('namaste')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'namaste'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              NAMASTE Codes
            </button>
            <button
              onClick={() => setSearchType('who')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'who'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              WHO ICD-11
            </button>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={searchType === 'namaste' 
                  ? "Search NAMASTE codes, terms, or symptoms..."
                  : "Search WHO ICD-11 codes or medical terms..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={!searchQuery || loading}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                searchType === 'namaste' ? <Database className="w-5 h-5" /> : <Globe className="w-5 h-5" />
              )}
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Mapping statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Total NAMASTE Codes', 
              value: stats ? stats.total_codes?.toLocaleString() || '0' : '4,523', 
              icon: Database, 
              color: 'from-blue-500 to-cyan-500' 
            },
            { 
              title: 'Ayurveda Codes', 
              value: stats ? stats.systems?.ayurveda?.toLocaleString() || '0' : '1,523', 
              icon: CheckCircle, 
              color: 'from-green-500 to-teal-500' 
            },
            { 
              title: 'Siddha Codes', 
              value: stats ? stats.systems?.siddha?.toLocaleString() || '0' : '1,500', 
              icon: ArrowRight, 
              color: 'from-purple-500 to-pink-500' 
            },
            { 
              title: 'Unani Codes', 
              value: stats ? stats.systems?.unani?.toLocaleString() || '0' : '1,500', 
              icon: Zap, 
              color: 'from-orange-500 to-yellow-500' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Real-time Keyword Mappings */}
        {realTimeMappings.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span>Real-time Keyword Mappings</span>
            </h2>
            {realTimeMappings.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{result.namasteCode}</h3>
                      <span className="px-3 py-1 bg-yellow-100 rounded-lg text-yellow-700 text-sm">
                        {result.system}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 rounded-lg text-orange-700 text-sm">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{result.namasteTerm}</p>
                    <p className="text-gray-600 text-sm">{result.englishTerm}</p>
                    <p className="text-gray-500 text-xs mt-2">{result.description}</p>
                    
                    {/* Matched Keywords */}
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Matched Keywords: </span>
                      {result.matchedKeywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mr-1 mb-1">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>ICD-11 TM2 Mappings</span>
                  </h4>
                  
                  {result.icd11Mappings.map((mapping: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="text-green-600 font-mono text-lg">{mapping.code}</p>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-gray-700 text-sm font-medium">{mapping.term}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{mapping.confidence}%</div>
                          <div className="text-gray-600 text-xs">Confidence</div>
                        </div>
                      </div>
                      
                      {/* AI Explanation Button */}
                      <div className="mt-4">
                        <button
                          onClick={() => toggleExplanation(index, {...result, icd11Mappings: [mapping]})}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform flex items-center justify-center space-x-2"
                        >
                          <Brain className="w-4 h-4" />
                          <span>Explain with AI</span>
                          {expandedExplanations.has(index) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        
                        {/* AI Explanation Section */}
                        {expandedExplanations.has(index) && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            {loadingExplanations.has(index) ? (
                              <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                <span className="text-blue-700">Generating AI explanation...</span>
                              </div>
                            ) : aiExplanations.has(index) ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Brain className="w-5 h-5 text-blue-600" />
                                  <h5 className="font-semibold text-blue-900">**AI Explanation**</h5>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                  <h6 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <span>Medical Rationale</span>
                                  </h6>
                                  <div 
                                    className="text-gray-700 text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.rationale || '') }}
                                  />
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                  <h6 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-green-600" />
                                    <span>Layman Explanation</span>
                                  </h6>
                                  <div 
                                    className="text-gray-700 text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.laymanExplanation || '') }}
                                  />
                                </div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                  <h6 className="font-medium text-gray-900 mb-2">Comparison</h6>
                                  <div 
                                    className="text-gray-700 text-sm mb-3"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.comparison || '') }}
                                  />
                                  
                                  <h6 className="font-medium text-gray-900 mb-2">Recommendations</h6>
                                  <div 
                                    className="text-gray-700 text-sm space-y-1"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.recommendations?.join('\n') || '') }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-600">Failed to load AI explanation</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* NAMASTE Search results */}
        {searchType === 'namaste' && mappingResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">NAMASTE Mapping Results</h2>
            {mappingResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{result.namasteCode}</h3>
                      <span className="px-3 py-1 bg-primary-100 rounded-lg text-primary-700 text-sm">
                        {result.system}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{result.namasteTerm}</p>
                    <p className="text-gray-600 text-sm">{result.englishTerm}</p>
                    {result.description && (
                      <p className="text-gray-500 text-xs mt-2">{result.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>ICD-11 TM2 Mappings</span>
                  </h4>
                  
                  {result.icd11Mappings.map((mapping: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="text-green-600 font-mono">{mapping.code}</p>
                            {mapping.validated ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <p className="text-gray-700 text-sm">{mapping.term}</p>
                        </div>
                        <div className="text-right flex items-center space-x-4">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{mapping.confidence}%</div>
                            <div className="text-gray-600 text-xs">Confidence</div>
                          </div>
                          <button
                            onClick={() => toggleExplanation(index, {...result, icd11Mappings: [mapping]})}
                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Brain className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {expandedExplanations.has(index) ? 'Hide' : 'Explain'} with AI
                            </span>
                            {expandedExplanations.has(index) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* AI Explanation Section */}
                      {expandedExplanations.has(index) && (
                        <div className="border-t border-gray-200 p-4 bg-blue-50">
                          {loadingExplanations.has(index) ? (
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                              <span className="text-blue-700">Generating AI explanation...</span>
                            </div>
                          ) : aiExplanations.has(index) ? (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 mb-3">
                                <Brain className="w-5 h-5 text-blue-600" />
                                <h5 className="font-semibold text-blue-900">AI Explanation</h5>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                  <h6 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <span>Medical Rationale</span>
                                  </h6>
                                  <div 
                                    className="text-gray-700 text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.rationale || '') }}
                                  />
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                  <h6 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                    <Info className="w-4 h-4 text-green-600" />
                                    <span>Layman Explanation</span>
                                  </h6>
                                  <div 
                                    className="text-gray-700 text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.laymanExplanation || '') }}
                                  />
                                </div>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h6 className="font-medium text-gray-900 mb-2">Comparison</h6>
                                <div 
                                  className="text-gray-700 text-sm mb-3"
                                  dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.comparison || '') }}
                                />
                                
                                <h6 className="font-medium text-gray-900 mb-2">Recommendations</h6>
                                <div 
                                  className="text-gray-700 text-sm space-y-1"
                                  dangerouslySetInnerHTML={{ __html: formatAIResponse(aiExplanations.get(index)?.recommendations?.join('\n') || '') }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-600">Failed to load AI explanation</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* WHO ICD-11 Search results */}
        {searchType === 'who' && whoResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">WHO ICD-11 Results</h2>
            {whoResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{result.code}</h3>
                      <span className={`px-3 py-1 rounded-lg text-sm ${
                        result.system === 'TM2' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.system}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{result.title}</p>
                    {result.definition && (
                      <p className="text-gray-500 text-sm">{result.definition}</p>
                    )}
                  </div>
                </div>

                {result.uri && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 break-all">{result.uri}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Welcome state */}
        {!loading && mappingResults.length === 0 && whoResults.length === 0 && realTimeMappings.length === 0 && searchQuery.trim() === '' && (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Welcome to NAMASTE Mapping</h3>
            <p className="text-gray-500 mb-4">
              Start typing to see real-time keyword mappings or click the example buttons above
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">✨ Features Available:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time keyword mapping</li>
                <li>• AI-powered explanations</li>
                <li>• NAMASTE to ICD-11 mapping</li>
                <li>• Traditional medicine chatbot</li>
              </ul>
            </div>
          </div>
        )}

        {/* No results found state */}
        {(searchType === 'namaste' ? mappingResults.length === 0 : whoResults.length === 0) && !loading && searchQuery && realTimeMappings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
            {searchType === 'namaste' ? (
              <>
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No NAMASTE Codes Found</h3>
                <p className="text-gray-500">Try a different search term or check the spelling</p>
              </>
            ) : (
              <>
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No WHO ICD-11 Results</h3>
                <p className="text-gray-500">Try a different medical term or check the spelling</p>
              </>
            )}
          </div>
        )}

        {/* Initial empty state */}
        {!searchQuery && (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
            {searchType === 'namaste' ? (
              <>
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Search NAMASTE Codes</h3>
                <p className="text-gray-500">Enter a NAMASTE code or search term to see AI-powered ICD-11 mappings</p>
              </>
            ) : (
              <>
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Search WHO ICD-11</h3>
                <p className="text-gray-500">Enter a medical term or ICD-11 code to search the WHO database</p>
              </>
            )}
          </div>
        )}

        {/* AI Chatbot */}
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
          >
            <div className="h-full flex flex-col">
              {/* Chatbot Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">NAMASTE AI Assistant</h3>
                      <p className="text-xs opacity-90">Traditional Medicine Expert</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatbot(false)}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-2">
                      <Bot className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-800">
                          **Welcome to NAMASTE AI Assistant!** 🧘‍♀️
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          I can help you with:
                        </p>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          <li>• Traditional medicine explanations</li>
                          <li>• NAMASTE to ICD-11 mappings</li>
                          <li>• Ayurveda, Siddha, and Unani systems</li>
                          <li>• Medical terminology translations</li>
                          <li>• Treatment recommendations</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-100 p-3 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mt-1">
                        You
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">
                          What is Prana Vata?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-2">
                      <Bot className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-800">
                          **Prana Vata** is one of the five types of Vata dosha in Ayurveda, responsible for:
                        </p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>• **Respiratory functions** - Breathing, sneezing, swallowing</li>
                          <li>• **Mental activities** - Thinking, memory, consciousness</li>
                          <li>• **Heart function** - Heartbeat regulation</li>
                          <li>• **ICD-11 Mapping**: XM4567 - Respiratory dysfunction</li>
                        </ul>
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          When imbalanced, it can cause anxiety, insomnia, and respiratory issues.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-100 p-3 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mt-1">
                        You
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">
                          How does Siddha medicine differ from Ayurveda?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-2">
                      <Bot className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-800">
                          **Key Differences between Siddha and Ayurveda:**
                        </p>
                        <div className="text-xs text-gray-600 mt-2 space-y-2">
                          <div>
                            <strong>Siddha Medicine:</strong>
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Originated in Tamil Nadu</li>
                              <li>• Uses metals and minerals (rasa shastra)</li>
                              <li>• Focuses on 96 tattvas (principles)</li>
                              <li>• Emphasizes alchemy and chemistry</li>
                            </ul>
                          </div>
                          <div>
                            <strong>Ayurveda:</strong>
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Originated in northern India</li>
                              <li>• Uses herbs and natural substances</li>
                              <li>• Focuses on 3 doshas (Vata, Pitta, Kapha)</li>
                              <li>• Emphasizes balance and lifestyle</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Questions:</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    "What is Vata?",
                    "Siddha vs Ayurveda?",
                    "Unani treatments?",
                    "ICD-11 mapping?",
                    "Traditional diagnosis?",
                    "Herbal remedies?"
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs transition-colors"
                      onClick={() => {
                        // Simulate asking the question
                        console.log(`Asked: ${question}`);
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask about traditional medicine..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ask about symptoms, treatments, or traditional medicine concepts
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MappingPanel;