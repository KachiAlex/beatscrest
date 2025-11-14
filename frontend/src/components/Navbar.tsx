import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import NotificationDropdown from './NotificationDropdown';
import logoImage from '../assets/beat-crest-logo.png';

const Navbar: React.FC = () => {
  const { user, logout, login, register } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    username: '',
    account_type: 'buyer' as 'buyer' | 'producer'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAuthModal(false);
      }
    };

    if (showAuthModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAuthModal]);

  // Handle auth form input changes
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setAuthError('');
  };

  // Handle auth form submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signin') {
        await login(authFormData.email, authFormData.password);
      } else {
        // Validate password strength
        if (authFormData.password.length < 8) {
          setAuthError('Password must be at least 8 characters long');
          setAuthLoading(false);
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(authFormData.email)) {
          setAuthError('Please enter a valid email address');
          setAuthLoading(false);
          return;
        }

        await register({
          email: authFormData.email,
          password: authFormData.password,
          username: authFormData.username,
          account_type: authFormData.account_type === 'producer' ? 'producer' : 'artist'
        });
      }
      
      setShowAuthModal(false);
      setAuthFormData({ email: '', password: '', username: '', account_type: 'buyer' });
      setAuthMode('signin');
      
      // Navigate based on account type
      if (authMode === 'signup' && authFormData.account_type === 'producer') {
        navigate('/producer');
      } else {
        navigate('/buyer');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Switch between sign in and sign up modes
  const switchAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setAuthError('');
    setAuthFormData({ email: '', password: '', username: '', account_type: 'buyer' });
  };

  return (
    <>
      <nav className="bg-beatcrest-surface shadow-sm border-b border-beatcrest-teal/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logoImage}
                alt="BeatCrest Logo" 
                className="h-8 w-8 object-contain"
                onLoad={() => {
                  console.log('Navbar logo loaded successfully');
                }}
                onError={(e) => {
                  console.error('Navbar logo failed to load:', (e.currentTarget as HTMLImageElement).src);
                  // Fallback to gradient div if logo fails to load
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="h-8 w-8 rounded-xl bg-beatcrest-gradient hidden"></div>
              <span className="text-xl font-bold text-gradient">BeatCrest</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-beatcrest-navy hover:text-beatcrest-blue transition-colors duration-200 font-medium">
                Home
              </Link>
              <Link to="/marketplace" className="text-beatcrest-navy hover:text-beatcrest-blue transition-colors duration-200 font-medium">
                Marketplace
              </Link>
              {user && user.account_type === 'admin' && (
                <Link to="/admin" className="text-beatcrest-navy hover:text-beatcrest-blue transition-colors duration-200 font-medium">
                  Admin
                </Link>
              )}
              {user && (
                <>
                  <Link to="/upload" className="text-beatcrest-navy hover:text-beatcrest-blue transition-colors duration-200 font-medium">
                    Upload
                  </Link>
                  <Link to="/messages" className="text-beatcrest-navy hover:text-beatcrest-blue transition-colors duration-200 font-medium">
                    Messages
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationDropdown />
                  <button 
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                    <button 
                        onClick={() => setShowAuthModal(true)}
                        className="text-beatcrest-navy hover:text-beatcrest-blue transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-beatcrest-teal/10"
                      >
                        Sign In
                      </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="text-beatcrest-teal hover:text-beatcrest-navy transition-colors duration-200"
                  >
                    ✕
                  </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-beatcrest-navy mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={authFormData.username}
                    onChange={handleAuthInputChange}
                    required={authMode === 'signup'}
                    className="input-field"
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-beatcrest-navy mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  required
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-beatcrest-navy mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  required
                  minLength={8}
                  className="input-field"
                  placeholder="At least 8 characters"
                />
                {authMode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-beatcrest-navy mb-1">
                      I want to
                    </label>
                    <select
                      name="account_type"
                      value={authFormData.account_type}
                      onChange={handleAuthInputChange}
                      required
                      className="input-field"
                    >
                      <option value="buyer">Buy Beats (Artist/Buyer)</option>
                      <option value="producer">Sell Beats (Producer)</option>
                    </select>
                    <p className="text-xs text-beatcrest-teal mt-1">
                      {authFormData.account_type === 'producer' 
                        ? 'Producers can upload and sell beats' 
                        : 'Buyers can purchase and license beats'}
                    </p>
                  </div>
                  
                  {/* Dashboard Assignment Indicator */}
                  <div className={`mt-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    authFormData.account_type === 'producer'
                      ? 'bg-beatcrest-orange/10 border-beatcrest-orange/30'
                      : 'bg-beatcrest-blue/10 border-beatcrest-blue/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        authFormData.account_type === 'producer'
                          ? 'bg-beatcrest-orange/20'
                          : 'bg-beatcrest-blue/20'
                      }`}>
                        {authFormData.account_type === 'producer' ? (
                          <span className="text-xl">🎵</span>
                        ) : (
                          <span className="text-xl">🛒</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-beatcrest-navy mb-1">
                          You'll be assigned to:
                        </p>
                        <p className={`text-base font-semibold ${
                          authFormData.account_type === 'producer'
                            ? 'text-beatcrest-orange'
                            : 'text-beatcrest-blue'
                        }`}>
                          {authFormData.account_type === 'producer' 
                            ? 'Producer Dashboard' 
                            : 'Buyer Dashboard'}
                        </p>
                        <p className="text-xs text-beatcrest-teal mt-1">
                          {authFormData.account_type === 'producer'
                            ? 'Upload beats, manage sales, and track earnings'
                            : 'Browse beats, make purchases, and manage licenses'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {authError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-beatcrest-blue hover:bg-beatcrest-blue-dark text-white"
                disabled={authLoading}
              >
                {authLoading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={switchAuthMode}
                className="text-beatcrest-blue hover:text-beatcrest-blue-dark text-sm"
              >
                {authMode === 'signin' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 