import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Database, Eye, Trash2 } from 'lucide-react';

interface UploadHistory {
  filename: string;
  upload_date: string;
  size: number;
  status: 'success' | 'error' | 'processing';
  records_count?: number;
  system_type?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  new_records?: number;
  total_records?: number;
  filename?: string;
  mapping_report?: any;
}

const CSVUploadPanel: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<'ayurveda' | 'siddha' | 'unani'>('ayurveda');
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Load upload history on component mount
  React.useEffect(() => {
    loadUploadHistory();
  }, []);

  const loadUploadHistory = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/csv/history`);
      
      if (response.ok) {
        const data = await response.json();
        setUploadHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load upload history:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [selectedSystem]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({
        success: false,
        message: 'Please select a CSV file'
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('system_type', selectedSystem);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/csv/upload`, {
        method: 'POST',
        body: formData
      });

      const result: UploadResult = await response.json();

      if (result.success) {
        setUploadResult(result);
        // Reload history
        loadUploadHistory();
      } else {
        setUploadResult({
          success: false,
          message: result.message || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'Network error during upload'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV Data Upload</h1>
          <p className="text-gray-600">Upload NAMASTE CSV files for Ayurveda, Siddha, and Unani systems</p>
        </div>

        {/* CSV Format Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>CSV Format Guide</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Ayurveda Format</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Required columns:</strong></p>
                <p>• NAMC_CODE (e.g., AAA-2.1)</p>
                <p>• NAMC_term (English term)</p>
                <p>• NAMC_term_DEVANAGARI (Sanskrit)</p>
                <p>• Short_definition</p>
                <p>• Ontology_branches</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Siddha Format</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Required columns:</strong></p>
                <p>• NAMC_CODE (e.g., SID)</p>
                <p>• NAMC_TERM (English term)</p>
                <p>• Tamil_term (Tamil term)</p>
                <p>• Short_definition</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Unani Format</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Required columns:</strong></p>
                <p>• NUMC_CODE (e.g., O-6)</p>
                <p>• NUMC_TERM (English term)</p>
                <p>• Arabic_term (Arabic term)</p>
                <p>• Short_definition</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Download sample CSV files from the examples above to ensure proper formatting.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New NAMASTE Data</h2>
          
          {/* System Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Traditional Medicine System
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'ayurveda', label: 'Ayurveda', color: 'bg-green-100 text-green-700' },
                { value: 'siddha', label: 'Siddha', color: 'bg-blue-100 text-blue-700' },
                { value: 'unani', label: 'Unani', color: 'bg-purple-100 text-purple-700' }
              ].map((system) => (
                <button
                  key={system.value}
                  onClick={() => setSelectedSystem(system.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSystem === system.value
                      ? system.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {system.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {uploading ? (
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-600" />
              )}
            </div>
            
            {uploading ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading...</h3>
                <p className="text-gray-600">Processing your CSV file</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop CSV files here</h3>
                <p className="text-gray-600 mb-4">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </>
            )}
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg border ${
                uploadResult.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{uploadResult.message}</span>
              </div>
              
              {uploadResult.success && uploadResult.mapping_report && (
                <div className="mt-3 text-sm">
                  <p>Records processed: {uploadResult.new_records}</p>
                  <p>Total records: {uploadResult.total_records}</p>
                  <p>Mapping percentage: {uploadResult.mapping_report.mapping_percentage}%</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upload History</h2>
            <button
              onClick={loadUploadHistory}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {uploadHistory.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No uploads yet. Upload your first CSV file above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadHistory.map((upload, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(upload.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{upload.filename}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(upload.upload_date)} • {formatFileSize(upload.size)}
                      </p>
                      {upload.records_count && (
                        <p className="text-sm text-gray-500">
                          {upload.records_count} records • {upload.system_type}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPreview(upload.filename)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CSVUploadPanel;
