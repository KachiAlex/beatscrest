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
      <Routes>
        {/* Landing page is self-contained with its own navigation */}
        <Route path="/" element={<Landing />} />
        
        {/* Other pages use the shared Navbar */}
        <Route path="/home" element={
          <>
            <Navbar />
            <main>
              <Marketplace />
            </main>
          </>
        } />
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