import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, Activity } from 'lucide-react';

const ReportsPanel: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('monthly');
  const [dateRange, setDateRange] = useState('last-30-days');

  const reportTypes = [
    { id: 'monthly', label: 'Monthly Summary', icon: Calendar },
    { id: 'mapping', label: 'Mapping Analytics', icon: Activity },
    { id: 'usage', label: 'Usage Statistics', icon: TrendingUp },
    { id: 'compliance', label: 'Compliance Report', icon: FileText }
  ];

  const reports = [
    {
      id: 1,
      title: 'December 2024 - Monthly Summary',
      type: 'Monthly Report',
      generatedDate: '2024-12-01',
      size: '2.4 MB',
      status: 'Ready',
      description: 'Complete monthly analytics including patient records, mapping accuracy, and system usage'
    },
    {
      id: 2,
      title: 'NAMASTE Mapping Accuracy Report',
      type: 'Analytics Report',
      generatedDate: '2024-11-28',
      size: '1.8 MB',
      status: 'Ready',
      description: 'Detailed analysis of AI mapping accuracy across different medical systems'
    },
    {
      id: 3,
      title: 'Q4 2024 Compliance Audit',
      type: 'Compliance Report',
      generatedDate: '2024-11-25',
      size: '3.2 MB',
      status: 'Ready',
      description: 'FHIR R4 compliance status and data privacy audit results'
    }
  ];

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and download comprehensive system reports</p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  selectedReport === type.id
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Generate New Report */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">Format</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="pdf">PDF Report</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV Data</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold hover:scale-105 transition-transform">
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                      {report.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Type: {report.type}</span>
                    <span>Generated: {report.generatedDate}</span>
                    <span>Size: {report.size}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsPanel;