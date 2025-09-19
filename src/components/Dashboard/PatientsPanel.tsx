import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Eye, Edit, FileText, Calendar, Phone, MapPin } from 'lucide-react';
import { mockPatients } from '../../data/mockPatients';

// Patients panel component for managing patient records
// Yeh patients ka panel hai jahan saare patient records manage karte hai
const PatientsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Search functionality for patients
  // Patient search karne ka function
  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Management</h1>
            <p className="text-gray-600">Manage patient records with dual NAMASTE-ICD-11 coding</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl text-white font-semibold hover:scale-105 transition-transform flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Patient</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Patient list */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter button */}
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Patient cards */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedPatient?.id === patient.id
                      ? 'bg-primary-100 border border-primary-300'
                      : 'bg-white border border-gray-200 hover:border-primary-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-900 font-medium">{patient.name}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">ID: {patient.id}</p>
                  <p className="text-gray-600 text-sm">{patient.age} years, {patient.gender}</p>
                  <p className="text-gray-600 text-sm">{patient.lastVisit}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Patient details */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                      <p className="text-gray-600">Patient ID: {selectedPatient.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="p-3 bg-blue-100 rounded-xl text-blue-600 hover:bg-blue-200 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-green-100 rounded-xl text-green-600 hover:bg-green-200 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-primary-100 rounded-xl text-primary-600 hover:bg-primary-200 transition-colors">
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Patient info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-gray-600 text-sm">Age & DOB</p>
                        <p className="text-gray-900">{selectedPatient.age} years • {selectedPatient.dob}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-gray-600 text-sm">Contact</p>
                        <p className="text-gray-900">{selectedPatient.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-gray-600 text-sm">Address</p>
                        <p className="text-gray-900">{selectedPatient.address}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Last Visit</p>
                      <p className="text-gray-900">{selectedPatient.lastVisit}</p>
                    </div>
                  </div>
                </div>

                {/* Diagnoses with dual coding */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Diagnoses</h3>
                  <div className="space-y-3">
                    {selectedPatient.diagnoses.map((diagnosis: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-900 font-medium">{diagnosis.condition}</h4>
                          <span className="text-xs text-gray-500">{diagnosis.date}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-600 text-sm">NAMASTE Code</p>
                            <p className="text-primary-600 font-mono">{diagnosis.namasteCode}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">ICD-11 TM2</p>
                            <p className="text-green-600 font-mono">{diagnosis.icd11Code}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mt-2">{diagnosis.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent prescriptions */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
                  <div className="space-y-3">
                    {selectedPatient.prescriptions.map((prescription: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-900 font-medium">{prescription.medicine}</h4>
                          <span className="text-xs text-gray-500">{prescription.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          <span className="text-orange-600">{prescription.dosage}</span> • 
                          <span className="ml-2">{prescription.duration}</span>
                        </p>
                        <p className="text-gray-700 text-sm mt-1">{prescription.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Patient</h3>
                  <p className="text-gray-500">Choose a patient from the list to view their details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientsPanel;