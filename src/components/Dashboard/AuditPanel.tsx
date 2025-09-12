import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Clock, Eye, Edit, Trash2, Filter } from 'lucide-react';

const AuditPanel: React.FC = () => {
  const [filterType, setFilterType] = useState('all');

  const auditLogs = [
    {
      id: 1,
      action: 'Patient Record Created',
      user: 'Dr. Rajesh Kumar',
      userId: 'DR001',
      timestamp: '2024-12-01 14:30:25',
      details: 'Created new patient record for Priya Sharma (PT001)',
      type: 'create',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      action: 'NAMASTE Code Mapping',
      user: 'Dr. Priya Patel',
      userId: 'DR002',
      timestamp: '2024-12-01 14:25:10',
      details: 'Mapped प्राणवातकोप to ICD-11 XM4567 with 94% confidence',
      type: 'mapping',
      ipAddress: '192.168.1.101',
      status: 'success'
    },
    {
      id: 3,
      action: 'Failed Login Attempt',
      user: 'Unknown User',
      userId: 'N/A',
      timestamp: '2024-12-01 14:20:45',
      details: 'Failed login attempt for user: admin@hospital.com',
      type: 'security',
      ipAddress: '203.0.113.1',
      status: 'failed'
    },
    {
      id: 4,
      action: 'Patient Data Export',
      user: 'Dr. Ahmed Hassan',
      userId: 'DR003',
      timestamp: '2024-12-01 14:15:30',
      details: 'Exported patient data for research study (anonymized)',
      type: 'export',
      ipAddress: '192.168.1.102',
      status: 'success'
    },
    {
      id: 5,
      action: 'System Configuration Change',
      user: 'System Admin',
      userId: 'ADMIN001',
      timestamp: '2024-12-01 14:10:15',
      details: 'Updated AI mapping confidence threshold to 85%',
      type: 'config',
      ipAddress: '192.168.1.10',
      status: 'success'
    }
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return <User className="w-4 h-4 text-green-600" />;
      case 'mapping': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'security': return <Shield className="w-4 h-4 text-red-600" />;
      case 'export': return <Eye className="w-4 h-4 text-orange-600" />;
      case 'config': return <Shield className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const filteredLogs = filterType === 'all' ? auditLogs : auditLogs.filter(log => log.type === filterType);

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Audit Trail</h1>
          <p className="text-gray-600">Monitor system activities and security events</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter by:</span>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Activities</option>
                <option value="create">Create Actions</option>
                <option value="mapping">Mapping Activities</option>
                <option value="security">Security Events</option>
                <option value="export">Data Exports</option>
                <option value="config">Configuration</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                Export Logs
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="space-y-4">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getActionIcon(log.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{log.action}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{log.details}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">User:</span> {log.user}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {log.userId}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {log.timestamp}
                    </div>
                    <div>
                      <span className="font-medium">IP:</span> {log.ipAddress}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
                <p className="text-green-600 text-sm">All systems secure</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-gray-600 text-sm">Uptime this month</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                <p className="text-blue-600 text-sm">Currently logged in</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">23</div>
            <div className="text-gray-600 text-sm">Healthcare professionals</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-orange-600 text-sm">Last 24 hours</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">147</div>
            <div className="text-gray-600 text-sm">System actions logged</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuditPanel;