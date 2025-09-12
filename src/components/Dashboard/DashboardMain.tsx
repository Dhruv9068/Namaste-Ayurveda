import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, TrendingUp, Clock, Heart, FileText, 
  Brain, Database, AlertCircle, CheckCircle, ArrowUp, ArrowDown,
  Calendar, MapPin, Stethoscope, Pill
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DashboardMain: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 156,
    onlineNow: 23,
    todayMappings: 47,
    systemLoad: 78
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        onlineNow: Math.max(15, prev.onlineNow + Math.floor(Math.random() * 5) - 2),
        todayMappings: prev.todayMappings + Math.floor(Math.random() * 2),
        systemLoad: Math.max(60, Math.min(95, prev.systemLoad + Math.floor(Math.random() * 6) - 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { 
      title: 'Total Patients', 
      value: '2,847', 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500', 
      change: '+12%',
      trend: 'up',
      subtitle: 'Active this month'
    },
    { 
      title: 'AI Mappings Today', 
      value: realTimeData.todayMappings.toString(), 
      icon: Brain, 
      color: 'from-purple-500 to-pink-500', 
      change: '+24%',
      trend: 'up',
      subtitle: 'Real-time processing'
    },
    { 
      title: 'NAMASTE Codes', 
      value: '4,523', 
      icon: Heart, 
      color: 'from-green-500 to-teal-500', 
      change: '+8%',
      trend: 'up',
      subtitle: 'Validated mappings'
    },
    { 
      title: 'System Load', 
      value: `${realTimeData.systemLoad}%`, 
      icon: Activity, 
      color: 'from-orange-500 to-yellow-500', 
      change: realTimeData.systemLoad > 85 ? 'High' : 'Normal',
      trend: realTimeData.systemLoad > 85 ? 'up' : 'stable',
      subtitle: 'Server performance'
    },
  ];

  const recentActivity = [
    { 
      type: 'mapping', 
      message: 'AI mapped "प्राणवातकोप" to ICD-11 XM4567', 
      time: '2 minutes ago',
      user: 'Dr. Rajesh Kumar',
      confidence: 94
    },
    { 
      type: 'patient', 
      message: 'New patient registered with Ayurvedic consultation', 
      time: '5 minutes ago',
      user: 'Reception Desk',
      confidence: null
    },
    { 
      type: 'research', 
      message: 'Research paper on Siddha medicine uploaded', 
      time: '12 minutes ago',
      user: 'Dr. Priya Sharma',
      confidence: null
    },
    { 
      type: 'system', 
      message: 'Database sync completed with WHO ICD-11', 
      time: '1 hour ago',
      user: 'System',
      confidence: null
    },
  ];

  const mappingData = [
    { system: 'Ayurveda', today: 23, week: 156, month: 678 },
    { system: 'Siddha', today: 12, week: 89, month: 345 },
    { system: 'Unani', today: 8, week: 67, month: 234 }
  ];

  const accuracyData = [
    { name: 'Respiratory', accuracy: 94, mappings: 234 },
    { name: 'Digestive', accuracy: 91, mappings: 189 },
    { name: 'Neurological', accuracy: 88, mappings: 156 },
    { name: 'Cardiovascular', accuracy: 92, mappings: 123 },
    { name: 'Dermatological', accuracy: 96, mappings: 98 }
  ];

  const systemDistribution = [
    { name: 'Ayurveda', value: 2847, color: '#3B82F6' },
    { name: 'Siddha', value: 1256, color: '#7C3AED' },
    { name: 'Unani', value: 845, color: '#14B8A6' }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Header with Real-time Status */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Dashboard</h1>
              <p className="text-gray-600">Real-time analytics and AI-powered traditional medicine mapping</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">{realTimeData.onlineNow} Online</span>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Last updated</p>
                <p className="text-gray-900 font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowUp : stat.trend === 'down' ? ArrowDown : Activity;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-700' : 
                    stat.trend === 'down' ? 'bg-red-100 text-red-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.subtitle}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Complex Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Real-time Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span>Live Activity</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'mapping' ? 'bg-purple-100' :
                    activity.type === 'patient' ? 'bg-blue-100' :
                    activity.type === 'research' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'mapping' ? <Brain className="w-4 h-4 text-purple-600" /> :
                     activity.type === 'patient' ? <Users className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'research' ? <FileText className="w-4 h-4 text-green-600" /> :
                     <Database className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-500 text-xs">{activity.user} • {activity.time}</p>
                      {activity.confidence && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {activity.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mapping Accuracy</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: '#374151'
                  }} 
                />
                <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* System Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={systemDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {systemDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {systemDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Advanced Mapping Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Mapping Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Mapping Activity</h2>
            <div className="space-y-4">
              {mappingData.map((system, index) => (
                <div key={system.system} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      system.system === 'Ayurveda' ? 'bg-blue-100' :
                      system.system === 'Siddha' ? 'bg-purple-100' : 'bg-teal-100'
                    }`}>
                      <Stethoscope className={`w-5 h-5 ${
                        system.system === 'Ayurveda' ? 'text-blue-600' :
                        system.system === 'Siddha' ? 'text-purple-600' : 'text-teal-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">{system.system}</h3>
                      <p className="text-gray-600 text-sm">Traditional Medicine System</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{system.today}</div>
                    <div className="text-gray-600 text-sm">Today</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl text-left hover:from-primary-100 hover:to-primary-200 transition-all duration-300 border border-primary-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-primary-600" />
                  <div>
                    <span className="font-medium text-primary-700 block">Add New Patient</span>
                    <p className="text-xs text-primary-600 mt-1">Register with traditional medicine profile</p>
                  </div>
                </div>
              </button>
              
              <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl text-left hover:from-green-100 hover:to-green-200 transition-all duration-300 border border-green-200">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-green-600" />
                  <div>
                    <span className="font-medium text-green-700 block">AI Mapping Assistant</span>
                    <p className="text-xs text-green-600 mt-1">Get intelligent code suggestions</p>
                  </div>
                </div>
              </button>
              
              <button className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl text-left hover:from-purple-100 hover:to-purple-200 transition-all duration-300 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <div>
                    <span className="font-medium text-purple-700 block">Generate Report</span>
                    <p className="text-xs text-purple-600 mt-1">Comprehensive analytics dashboard</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardMain;