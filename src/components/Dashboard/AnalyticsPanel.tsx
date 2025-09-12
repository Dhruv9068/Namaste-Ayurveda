import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, FileText } from 'lucide-react';

// Analytics panel with charts and reports
// Yeh analytics panel hai jahan charts aur reports dikhate hai
const AnalyticsPanel: React.FC = () => {
  // Mock data for charts
  // Charts ke liye mock data
  const usageData = [
    { month: 'Jan', namaste: 1200, icd11: 980, mappings: 850 },
    { month: 'Feb', namaste: 1400, icd11: 1100, mappings: 950 },
    { month: 'Mar', namaste: 1600, icd11: 1300, mappings: 1100 },
    { month: 'Apr', namaste: 1800, icd11: 1450, mappings: 1250 },
    { month: 'May', namaste: 2100, icd11: 1700, mappings: 1450 },
    { month: 'Jun', namaste: 2400, icd11: 1950, mappings: 1680 }
  ];

  const systemData = [
    { name: 'Ayurveda', value: 2847, color: '#3B82F6' },
    { name: 'Siddha', value: 1256, color: '#7C3AED' },
    { name: 'Unani', value: 845, color: '#14B8A6' }
  ];

  const mappingAccuracy = [
    { category: 'Respiratory', accuracy: 94 },
    { category: 'Digestive', accuracy: 91 },
    { category: 'Neurological', accuracy: 88 },
    { category: 'Cardiovascular', accuracy: 92 },
    { category: 'Dermatological', accuracy: 96 },
    { category: 'Musculoskeletal', accuracy: 89 }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics for NAMASTE-ICD-11 mapping usage and trends</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Mappings', value: '12,847', change: '+12%', icon: FileText, color: 'from-blue-500 to-cyan-500' },
            { title: 'Active Users', value: '2,156', change: '+8%', icon: Users, color: 'from-purple-500 to-pink-500' },
            { title: 'Accuracy Rate', value: '94.2%', change: '+2.1%', icon: Activity, color: 'from-green-500 to-teal-500' },
            { title: 'Monthly Growth', value: '23.5%', change: '+5.2%', icon: TrendingUp, color: 'from-orange-500 to-yellow-500' }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-medium">{metric.change}</span>
                </div>
                <h3 className="text-gray-600 text-sm mb-2">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: '#374151'
                  }} 
                />
                <Line type="monotone" dataKey="namaste" stroke="#3B82F6" strokeWidth={3} />
                <Line type="monotone" dataKey="icd11" stroke="#7C3AED" strokeWidth={3} />
                <Line type="monotone" dataKey="mappings" stroke="#14B8A6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* System distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={systemData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {systemData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: '#374151'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {systemData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mapping accuracy by category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mapping Accuracy by Category</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mappingAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#374151'
                }} 
              />
              <Bar dataKey="accuracy" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPanel;