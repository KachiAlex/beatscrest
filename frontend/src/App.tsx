import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import BeatDetail from './pages/BeatDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Marketplace />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/beat/:id" element={<BeatDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 