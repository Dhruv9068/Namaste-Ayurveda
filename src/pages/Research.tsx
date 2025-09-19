import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, BookOpen, ExternalLink } from 'lucide-react';

// Research page with PDF viewer and download options
// Yeh research page hai jahan PDF viewer aur download options hai
const Research: React.FC = () => {
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  const researchPapers = [
    {
      id: 1,
      title: 'NAMASTE to ICD-11 TM2 Mapping: A Comprehensive Study',
      authors: 'Dr. Rajesh Kumar, Dr. Priya Sharma, Dr. Amit Singh',
      journal: 'International Journal of Traditional Medicine Informatics',
      year: '2024',
      pages: '45',
      abstract: 'This comprehensive study presents the methodology and findings of mapping 4,500+ NAMASTE codes to WHO ICD-11 Traditional Medicine Module 2. Our AI-powered approach achieved 94.2% accuracy in automated mapping.',
      keywords: ['NAMASTE', 'ICD-11', 'Traditional Medicine', 'EHR', 'Ayurveda', 'Digital Health'],
      downloadUrl: '/research/namaste-icd11-mapping-study.pdf'
    },
    {
      id: 2,
      title: 'AI-Powered Traditional Medicine Code Classification',
      authors: 'Dr. Anita Patel, Dr. Suresh Menon',
      journal: 'Digital Health & Traditional Medicine',
      year: '2024',
      pages: '32',
      abstract: 'Exploring the use of machine learning algorithms for automated classification and mapping of traditional medicine terminologies to international standards.',
      keywords: ['Machine Learning', 'Traditional Medicine', 'Classification', 'AYUSH'],
      downloadUrl: '/research/ai-traditional-medicine-classification.pdf'
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
              Research Publications
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our latest research papers on NAMASTE-ICD-11 mapping and traditional medicine informatics
            </p>
          </div>

          {/* Research papers grid */}
          <div className="space-y-8">
            {researchPapers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Paper details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h2>
                        <p className="text-gray-600 mb-2">{paper.authors}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{paper.journal}</span>
                          <span>•</span>
                          <span>{paper.year}</span>
                          <span>•</span>
                          <span>{paper.pages} pages</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h3>
                      <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {paper.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <button 
                      onClick={() => setPdfViewerOpen(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>View Online</span>
                    </button>

                    <button className="w-full px-6 py-3 border-2 border-primary-300 rounded-xl text-primary-600 font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </button>

                    <button className="w-full px-6 py-3 bg-gray-100 rounded-xl text-gray-600 font-semibold hover:text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                      <ExternalLink className="w-5 h-5" />
                      <span>View in Journal</span>
                    </button>

                    {/* Citation */}
                    <div className="p-4 bg-gray-100 rounded-xl">
                      <h4 className="text-gray-900 font-medium mb-2">Citation</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {paper.authors} ({paper.year}). {paper.title}. <em>{paper.journal}</em>.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PDF viewer modal */}
          {pdfViewerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setPdfViewerOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-4xl w-full h-5/6 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Research Paper Viewer</h3>
                  <button
                    onClick={() => setPdfViewerOpen(false)}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
                
                <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">PDF Viewer would be embedded here</p>
                    <p className="text-gray-500 text-sm">
                      In production, this would use react-pdf or PDF.js for inline viewing
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Research collaboration */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Research Collaboration</h2>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              We collaborate with leading institutions worldwide to advance traditional medicine informatics and standardization
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['WHO', 'AYUSH Ministry', 'AIIMS', 'IIT Delhi'].map((org, index) => (
                <motion.div
                  key={org}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="text-gray-700 font-semibold">{org}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Research;