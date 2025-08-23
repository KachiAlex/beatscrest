import React from 'react';
import { Link } from 'react-router-dom';
import { Music, User, LogOut, Upload, MessageSquare, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-purple-600">BeatCrest</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-gray-700 hover:text-purple-600 transition-colors">
              Marketplace
            </Link>
            {user?.account_type === 'producer' && (
              <Link to="/upload" className="text-gray-700 hover:text-purple-600 transition-colors">
                Upload Beat
              </Link>
            )}
            {user && (
              <>
                <Link to="/purchases" className="text-gray-700 hover:text-purple-600 transition-colors">
                  My Purchases
                </Link>
                {user.account_type === 'producer' && (
                  <Link to="/sales" className="text-gray-700 hover:text-purple-600 transition-colors">
                    My Sales
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>
                
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <img
                      src={user.profile_picture || 'https://via.placeholder.com/32'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden sm:block">{user.username}</span>
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link
                        to={`/profile/${user.username}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      {user.account_type === 'producer' && (
                        <Link
                          to="/upload"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Beat
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 