import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, FileText, Brain, CheckCircle, Clock } from 'lucide-react';
import { mockDoctors } from '../../data/mockDoctors';
import { geminiService, MappingSuggestion } from '../../services/geminiService';

// Doctors panel component for uploading diagnoses and AI mapping
// Yeh doctors ka panel hai jahan diagnosis upload aur AI mapping karte hai
const DoctorsPanel: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(mockDoctors[0]);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<MappingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time AI mapping function using Gemini
  // Gemini AI se real-time mapping karne ka function
  const handleAIMapping = async () => {
    if (!diagnosisText.trim()) return;
    
    setLoading(true);
    
    try {
      const suggestions = await geminiService.mapDiagnosisToNAMASTE(diagnosisText);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      // Show error message to user
    } finally {
      setLoading(false);
    }
  };

  // Real-time mapping as user types (debounced)
  React.useEffect(() => {
    if (diagnosisText.length > 10) {
      const timeoutId = setTimeout(() => {
        handleAIMapping();
      }, 1000); // 1 second delay after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setAiSuggestions([]);
    }
  }, [diagnosisText]);

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Upload diagnoses and get AI-powered NAMASTE to ICD-11 mapping suggestions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-primary-600" />
                <span>Upload Diagnosis</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Doctor</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    {mockDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Patient ID</label>
                  <input
                    type="text"
                    placeholder="Enter patient ID..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Clinical Notes</label>
                  <textarea
                    placeholder="Enter detailed diagnosis and clinical observations..."
                    rows={6}
                    value={diagnosisText}
                    onChange={(e) => setDiagnosisText(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <button 
                  onClick={handleAIMapping}
                  disabled={!diagnosisText || loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Get AI Mapping Suggestions</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent uploads */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span>Recent Uploads</span>
              </h2>
              <div className="space-y-3">
                {selectedDoctor.recentUploads.map((upload: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 text-sm">{upload.patient}</span>
                      <span className="text-gray-600 text-xs">{upload.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{upload.diagnosis}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <span>AI Mapping Suggestions</span>
              </h2>

              {aiSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            suggestion.confidence > 90 ? 'bg-green-400' : 
                            suggestion.confidence > 80 ? 'bg-yellow-400' : 'bg-orange-400'
                          }`}></div>
                          <span className="text-gray-900 font-medium">{suggestion.confidence}% Match</span>
                        </div>
                        <button className="p-2 bg-green-100 rounded-lg text-green-600 hover:bg-green-200 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-gray-600 text-sm">NAMASTE Code</p>
                          <p className="text-primary-600 font-mono">{suggestion.namasteCode}</p>
                          <p className="text-gray-700 text-sm">{suggestion.namasteTerm}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">ICD-11 TM2</p>
                          <p className="text-green-600 font-mono">{suggestion.icd11Code}</p>
                          <p className="text-gray-700 text-sm">{suggestion.icd11Term}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-3">{suggestion.description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Upload a diagnosis to get AI mapping suggestions</p>
                </div>
              )}
            </div>

            {/* Doctor stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{selectedDoctor.stats.totalPatients}</div>
                  <div className="text-gray-600 text-sm">Total Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedDoctor.stats.mappingsCreated}</div>
                  <div className="text-gray-600 text-sm">Mappings Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedDoctor.stats.accuracyRate}%</div>
                  <div className="text-gray-600 text-sm">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedDoctor.stats.weeklyUploads}</div>
                  <div className="text-gray-600 text-sm">This Week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorsPanel;