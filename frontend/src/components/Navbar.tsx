import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/images/beatscrest-logo.png" 
              alt="BeatCrest Logo" 
              className="h-8 w-8"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xl font-bold text-purple-600">BeatCrest</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-gray-700 hover:text-purple-600 transition-colors">
              Marketplace
            </Link>
            <Link to="/upload" className="text-gray-700 hover:text-purple-600 transition-colors">
              Upload Beat
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <button className="border border-purple-600 text-purple-600 px-4 py-2 rounded hover:bg-purple-50">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 