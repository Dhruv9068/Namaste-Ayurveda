import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Research from './pages/Research';
import Discussion from './pages/Discussion';

// Yeh main App component hai jo saare routes handle karta hai
// Isme humne React Router use kiya hai different pages ke liye
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/research" element={<Research />} />
          <Route path="/discussion" element={<Discussion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;