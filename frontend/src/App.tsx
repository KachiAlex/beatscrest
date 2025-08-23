import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import BeatDetail from './pages/BeatDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import ApiTest from './components/ApiTest';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* API Test Component for debugging */}
        <div className="container mx-auto px-4 py-4">
          <ApiTest />
        </div>
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/beat/:id" element={<BeatDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route 
            path="/upload" 
            element={user?.account_type === 'producer' ? <Upload /> : <Navigate to="/" />} 
          />
          {/* Add more routes here as we build them */}
        </Routes>
      </main>
    </div>
  );
};

export default App; 