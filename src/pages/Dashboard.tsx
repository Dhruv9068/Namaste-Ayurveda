import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardMain from '../components/Dashboard/DashboardMain';
import PatientsPanel from '../components/Dashboard/PatientsPanel';
import DoctorsPanel from '../components/Dashboard/DoctorsPanel';
import MappingPanel from '../components/Dashboard/MappingPanel';
import CSVUploadPanel from '../components/Dashboard/CSVUploadPanel';
import AnalyticsPanel from '../components/Dashboard/AnalyticsPanel';
import SettingsPanel from '../components/Dashboard/SettingsPanel';
import NotificationsPanel from '../components/Dashboard/NotificationsPanel';

// Medical EHR specific components
const EmergencyPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-bold">!</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-red-900 mb-2">Emergency Response Center</h1>
          <p className="text-red-700">24/7 Emergency medical support and protocols</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Contacts</h3>
          <p className="text-red-700 text-sm mb-4">Quick access to emergency services</p>
          <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Call Emergency
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Critical Protocols</h3>
          <p className="text-red-700 text-sm mb-4">Emergency treatment guidelines</p>
          <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            View Protocols
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Alert System</h3>
          <p className="text-red-700 text-sm mb-4">Hospital-wide emergency alerts</p>
          <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Send Alert
          </button>
        </div>
      </div>
    </div>
  </div>
);


const WHOSyncPanel = () => {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    isSyncing: false,
    syncResult: null
  });
  const [autoMappingStatus, setAutoMappingStatus] = useState({
    isMapping: false,
    mappingResult: null,
    selectedSystem: 'ayurveda'
  });

  const handleSync = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncResult: null }));
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/who/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      setSyncStatus({
        lastSync: new Date().toISOString(),
        isSyncing: false,
        syncResult: result
      });
    } catch (error) {
      setSyncStatus({
        lastSync: null,
        isSyncing: false,
        syncResult: { success: false, error: 'Sync failed' }
      });
    }
  };

  const handleAutoMapping = async () => {
    setAutoMappingStatus(prev => ({ ...prev, isMapping: true, mappingResult: null }));
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/mapping/auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_type: autoMappingStatus.selectedSystem })
      });
      
      const result = await response.json();
      
      setAutoMappingStatus(prev => ({
        ...prev,
        isMapping: false,
        mappingResult: result
      }));
    } catch (error) {
      setAutoMappingStatus(prev => ({
        ...prev,
        isMapping: false,
        mappingResult: { success: false, error: 'Auto-mapping failed' }
      }));
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WHO ICD-11 Synchronization</h1>
        <p className="text-gray-600">Real-time sync with WHO ICD-11 API including TM2</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sync Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <h3 className="font-medium text-green-900">ICD-11 Foundation</h3>
                <p className="text-green-700 text-sm">
                  {syncStatus.lastSync 
                    ? `Last synced: ${new Date(syncStatus.lastSync).toLocaleString()}`
                    : 'Not synced yet'
                  }
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <h3 className="font-medium text-green-900">TM2 Module</h3>
                <p className="text-green-700 text-sm">
                  {syncStatus.lastSync 
                    ? `Last synced: ${new Date(syncStatus.lastSync).toLocaleString()}`
                    : 'Not synced yet'
                  }
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <button 
            onClick={handleSync}
            disabled={syncStatus.isSyncing}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {syncStatus.isSyncing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Syncing...</span>
              </>
            ) : (
              <span>Sync Now</span>
            )}
          </button>
          
          {syncStatus.syncResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              syncStatus.syncResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">
                {syncStatus.syncResult.success ? 'Sync successful!' : 'Sync failed'}
              </p>
              {syncStatus.syncResult.message && (
                <p className="text-sm mt-1">{syncStatus.syncResult.message}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto-Mapping</h2>
          <p className="text-gray-600 mb-6">Automatically map NAMASTE codes to ICD-11 using WHO API</p>
          <div className="space-y-4">
            <select 
              value={autoMappingStatus.selectedSystem}
              onChange={(e) => setAutoMappingStatus(prev => ({ ...prev, selectedSystem: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <option value="ayurveda">Ayurveda System</option>
              <option value="siddha">Siddha System</option>
              <option value="unani">Unani System</option>
            </select>
            <button 
              onClick={handleAutoMapping}
              disabled={autoMappingStatus.isMapping}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {autoMappingStatus.isMapping ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Mapping...</span>
                </>
              ) : (
                <span>Start Auto-Mapping</span>
              )}
            </button>
          </div>
          
          {autoMappingStatus.mappingResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              autoMappingStatus.mappingResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">
                {autoMappingStatus.mappingResult.success ? 'Auto-mapping completed!' : 'Auto-mapping failed'}
              </p>
              {autoMappingStatus.mappingResult.message && (
                <p className="text-sm mt-1">{autoMappingStatus.mappingResult.message}</p>
              )}
              {autoMappingStatus.mappingResult.mapped_count && (
                <p className="text-sm mt-1">
                  Mapped {autoMappingStatus.mappingResult.mapped_count} out of {autoMappingStatus.mappingResult.total_records} records
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HelpPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
      <p className="text-gray-600">Get help with NAMASTE EHR system</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Help</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
            <p className="text-blue-700 text-sm">Learn how to use the NAMASTE EHR system</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <h3 className="font-medium text-green-900 mb-2">Code Mapping</h3>
            <p className="text-green-700 text-sm">How to map NAMASTE codes to ICD-11</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="font-medium text-purple-900 mb-2">CSV Upload</h3>
            <p className="text-purple-700 text-sm">Upload and manage your NAMASTE data</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-2">Technical Support</h3>
            <p className="text-gray-600 text-sm mb-2">support@namaste-ehr.com</p>
            <p className="text-gray-600 text-sm">+91-1234-567-890</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-2">Medical Support</h3>
            <p className="text-gray-600 text-sm mb-2">medical@namaste-ehr.com</p>
            <p className="text-gray-600 text-sm">+91-1234-567-891</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EmergencyContactPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
      <h1 className="text-3xl font-bold text-red-900 mb-6">Emergency Contacts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-red-200">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Medical Emergency</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-700">Ambulance</span>
              <a href="tel:108" className="text-red-600 font-bold text-lg">108</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">Hospital Emergency</span>
              <a href="tel:+911234567890" className="text-red-600 font-bold">+91-1234-567-890</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">Poison Control</span>
              <a href="tel:1066" className="text-red-600 font-bold text-lg">1066</a>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-red-200">
          <h2 className="text-xl font-semibold text-red-900 mb-4">System Emergency</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-700">IT Support</span>
              <a href="tel:+911234567891" className="text-red-600 font-bold">+91-1234-567-891</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">System Admin</span>
              <a href="tel:+911234567892" className="text-red-600 font-bold">+91-1234-567-892</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">Data Recovery</span>
              <a href="tel:+911234567893" className="text-red-600 font-bold">+91-1234-567-893</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Dashboard component with sidebar navigation aur different panels
// Yeh EHR dashboard ka main component hai jo different sections handle karta hai
const Dashboard: React.FC = () => {
  const [activePanel, setActivePanel] = useState('dashboard');

  // Panel render karne ka function based on active selection
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DashboardMain />;
      case 'patients':
        return <PatientsPanel />;
      case 'doctors':
        return <DoctorsPanel />;
      case 'mapping':
        return <MappingPanel />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'emergency':
        return <EmergencyPanel />;
      case 'csv-upload':
        return <CSVUploadPanel />;
      case 'who-sync':
        return <WHOSyncPanel />;
      case 'help':
        return <HelpPanel />;
      case 'emergency-contact':
        return <EmergencyContactPanel />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardMain />;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderActivePanel()}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;