import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardMain from '../components/Dashboard/DashboardMain';
import PatientsPanel from '../components/Dashboard/PatientsPanel';
import DoctorsPanel from '../components/Dashboard/DoctorsPanel';
import MappingPanel from '../components/Dashboard/MappingPanel';
import AnalyticsPanel from '../components/Dashboard/AnalyticsPanel';
import SettingsPanel from '../components/Dashboard/SettingsPanel';
import ReportsPanel from '../components/Dashboard/ReportsPanel';
import AuditPanel from '../components/Dashboard/AuditPanel';
import NotificationsPanel from '../components/Dashboard/NotificationsPanel';

// Placeholder components for new EHR sections
const AppointmentsPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Appointments Management</h1>
      <p className="text-gray-600">Schedule and manage patient appointments</p>
    </div>
  </div>
);

const ConsultationsPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Consultations</h1>
      <p className="text-gray-600">Manage patient consultations and treatment plans</p>
    </div>
  </div>
);

const PrescriptionsPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Prescriptions</h1>
      <p className="text-gray-600">Digital prescription management system</p>
    </div>
  </div>
);

const DiagnosesPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Diagnoses Management</h1>
      <p className="text-gray-600">Traditional medicine diagnosis tracking</p>
    </div>
  </div>
);

const LabResultsPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Laboratory Results</h1>
      <p className="text-gray-600">Lab test results and analysis</p>
    </div>
  </div>
);

const MedicalHistoryPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Medical History</h1>
      <p className="text-gray-600">Comprehensive patient medical history</p>
    </div>
  </div>
);

const StaffPanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Staff Management</h1>
      <p className="text-gray-600">Manage hospital staff and roles</p>
    </div>
  </div>
);

const DatabasePanel = () => (
  <div className="p-6 h-full overflow-y-auto bg-gray-50">
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Database Management</h1>
      <p className="text-gray-600">System database administration</p>
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
      case 'appointments':
        return <AppointmentsPanel />;
      case 'consultations':
        return <ConsultationsPanel />;
      case 'prescriptions':
        return <PrescriptionsPanel />;
      case 'diagnoses':
        return <DiagnosesPanel />;
      case 'lab-results':
        return <LabResultsPanel />;
      case 'medical-history':
        return <MedicalHistoryPanel />;
      case 'staff':
        return <StaffPanel />;
      case 'database':
        return <DatabasePanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'audit':
        return <AuditPanel />;
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