import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/images/beatscrest-logo.png" 
              alt="BeatCrest Logo" 
              className="h-8 w-8 object-contain"
              onError={(e) => {
                // Fallback to gradient div if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 hidden"></div>
            <span className="text-xl font-bold text-gray-900">BeatCrest</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition">
              Home
            </Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-purple-600 transition">
              Marketplace
            </Link>
            {user && (
              <Link to="/upload" className="text-gray-700 hover:text-purple-600 transition">
                Upload
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="text-gray-700 hover:text-purple-600 transition">
                  Sign In
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 