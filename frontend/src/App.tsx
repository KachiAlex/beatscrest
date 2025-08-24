import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Landing'; // This is now the Home component
import Marketplace from './pages/Marketplace';
import BeatDetail from './pages/BeatDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import ProducerDashboard from './pages/ProducerDashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Home page with banner slides, about, and beats commerce */}
        <Route path="/" element={<Home />} />
        
        {/* Producer Dashboard - self-contained */}
        <Route path="/dashboard" element={<ProducerDashboard />} />
        
        {/* Other pages use the shared Navbar */}
        <Route path="/marketplace" element={
          <>
            <Navbar />
            <main>
              <Marketplace />
            </main>
          </>
        } />
        <Route path="/beat/:id" element={
          <>
            <Navbar />
            <main>
              <BeatDetail />
            </main>
          </>
        } />
        <Route path="/profile/:username" element={
          <>
            <Navbar />
            <main>
              <Profile />
            </main>
          </>
        } />
        <Route path="/upload" element={
          <>
            <Navbar />
            <main>
              <Upload />
            </main>
          </>
        } />
      </Routes>
    </div>
  );
};

export default App; 