import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Database, Shield, Bell, Globe, Save } from 'lucide-react';

// Settings panel for system configuration
// Yeh settings panel hai jahan system configuration karte hai
const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoMapping: true,
    language: 'english',
    theme: 'dark',
    dataSync: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your EHR system preferences and integrations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User preferences */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <User className="w-5 h-5 text-primary-600" />
                <span>User Preferences</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-3">Language</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="english">English</option>
                    <option value="hindi">हिंदी</option>
                    <option value="tamil">தமிழ்</option>
                    <option value="urdu">اردو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-3">Theme</label>
                  <select 
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900 font-medium">Notifications</h3>
                    <p className="text-gray-600 text-sm">Get notified about new mappings</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Integration settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-600" />
                <span>Integration Settings</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900 font-medium">Auto Mapping</h3>
                    <p className="text-gray-600 text-sm">Automatically suggest ICD-11 codes</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoMapping', !settings.autoMapping)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoMapping ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoMapping ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900 font-medium">Data Synchronization</h3>
                    <p className="text-gray-600 text-sm">Sync with WHO ICD-11 API</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('dataSync', !settings.dataSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.dataSync ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.dataSync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-3">API Endpoint</label>
                  <input
                    type="text"
                    value="https://id.who.int/icd/release/11/2023-01"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Security and compliance */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Security & Compliance</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-gray-900 font-medium">FHIR R4 Compliance</h3>
                    <p className="text-gray-600 text-sm">Electronic Health Record Standards</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-gray-900 font-medium">ISO 22600 Access Control</h3>
                    <p className="text-gray-600 text-sm">Healthcare access management</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-gray-900 font-medium">OAuth 2.0 Authentication</h3>
                    <p className="text-gray-600 text-sm">ABHA-linked secure access</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-gray-900 font-medium">Audit Trail</h3>
                    <p className="text-gray-600 text-sm">Consent and versioning logs</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            {/* API Configuration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-orange-600" />
                <span>API Configuration</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">WHO ICD-11 Token</label>
                  <input
                    type="password"
                    placeholder="Enter WHO ICD-11 access token..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">Mapping Confidence Threshold</label>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    defaultValue="85"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-gray-600 text-sm mt-1">
                    <span>70%</span>
                    <span>85%</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-end"
        >
          <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center space-x-2">
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SettingsPanel;