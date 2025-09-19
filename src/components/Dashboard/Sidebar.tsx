import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ArrowLeftRight, 
  BarChart3, 
  Settings,
  Heart,
  FileText,
  Shield,
  Bell,
  Calendar,
  Stethoscope,
  Pill,
  ClipboardList,
  Activity,
  AlertTriangle,
  HelpCircle,
  Upload,
  Zap,
  Phone
} from 'lucide-react';

interface SidebarProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

// Enhanced EHR Sidebar with medical-specific navigation
const Sidebar: React.FC<SidebarProps> = ({ activePanel, setActivePanel }) => {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-green-600' },
      ]
    },
    {
      title: 'Patient Care',
      items: [
        { id: 'patients', label: 'Patients', icon: Users, color: 'text-purple-600' },
        { id: 'doctors', label: 'Doctors', icon: UserCheck, color: 'text-emerald-600' },
        { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-600' },
      ]
    },
    {
      title: 'Clinical Tools',
      items: [
        { id: 'mapping', label: 'Code Mapping', icon: ArrowLeftRight, color: 'text-indigo-600' },
        { id: 'csv-upload', label: 'CSV Upload', icon: Upload, color: 'text-orange-600' },
        { id: 'who-sync', label: 'WHO Sync', icon: Zap, color: 'text-yellow-600' },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'help', label: 'Help Center', icon: HelpCircle, color: 'text-blue-500' },
        { id: 'emergency-contact', label: 'Emergency Contact', icon: Phone, color: 'text-red-500' },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-yellow-600' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-blue-500' },
      ]
    }
  ];

  return (
    <div className="w-full lg:w-72 bg-white border-r border-gray-200 lg:h-screen overflow-y-auto shadow-sm flex-shrink-0">
      <div className="p-4 lg:p-6">
        {/* Sidebar header with logo */}
        <div className="flex items-center space-x-3 mb-6 lg:mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900">Namaste EHR</h1>
            <p className="text-xs text-gray-500">Traditional Medicine System</p>
          </div>
        </div>

        {/* Navigation sections */}
        <nav className="space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <h3 className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-1 lg:gap-2 lg:space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePanel === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-2 lg:px-4 py-3 lg:py-3 rounded-xl transition-all duration-200 text-xs lg:text-sm ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color}`} />
                      <span className="font-medium hidden lg:inline truncate">{item.label}</span>
                      <span className="font-medium lg:hidden text-center leading-tight">
                        {item.label.split(' ')[0]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick stats */}
        <div className="hidden lg:block mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Today's Overview</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Active Patients</span>
              <span className="text-sm font-bold text-blue-600">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Appointments</span>
              <span className="text-sm font-bold text-green-600">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">AI Mappings</span>
              <span className="text-sm font-bold text-purple-600">47</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;