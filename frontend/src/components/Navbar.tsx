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
      <nav className="sticky top-0 z-50 glass-dark border-b border-white/20 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src={logoImage}
                  alt="BeatCrest Logo" 
                  className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-orange-500 hidden items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">BC</span>
                </div>
              </div>
              <span className="text-2xl font-bold gradient-text hidden sm:block">BeatCrest</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-lg text-white/95 hover:text-teal-400 hover:bg-white/10 font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link 
                to="/marketplace" 
                className="px-4 py-2 rounded-lg text-white/95 hover:text-teal-400 hover:bg-white/10 font-medium transition-all duration-200"
              >
                Marketplace
              </Link>
              {user && user.account_type === 'admin' && (
                <Link 
                  to="/admin" 
                  className="px-4 py-2 rounded-lg text-white/95 hover:text-teal-400 hover:bg-white/10 font-medium transition-all duration-200"
                >
                  Admin
                </Link>
              )}
              {user && (
                <>
                  <Link 
                    to="/upload" 
                    className="px-4 py-2 rounded-lg text-white/95 hover:text-teal-400 hover:bg-white/10 font-medium transition-all duration-200"
                  >
                    Upload
                  </Link>
                  <Link 
                    to="/messages" 
                    className="px-4 py-2 rounded-lg text-white/95 hover:text-teal-400 hover:bg-white/10 font-medium transition-all duration-200"
                  >
                    Messages
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <NotificationDropdown />
                  {user.profile_picture ? (
                    <Link to={`/profile/${user.username}`} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                      <img 
                        src={user.profile_picture} 
                        alt={user.username}
                        className="h-8 w-8 rounded-full object-cover border-2 border-teal-500"
                      />
                      <span className="hidden md:block text-sm font-medium text-white">{user.username}</span>
                    </Link>
                  ) : (
                    <Link to={`/profile/${user.username}`} className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg transition-shadow">
                      {user.username?.charAt(0).toUpperCase()}
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white/95 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-white/20 hover:border-red-500/50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div 
            ref={modalRef}
            className="glass-dark rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-slide-up border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold gradient-text">
                {authMode === 'signin' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-white/90 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={authFormData.username}
                    onChange={handleAuthInputChange}
                    required={authMode === 'signup'}
                    className="input-field"
                    placeholder="Choose a username"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  required
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
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
                  placeholder="••••••••"
                />
                {authMode === 'signup' && (
                  <p className="text-xs text-white/80 mt-2">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
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
                  </div>
                  
                  {/* Dashboard Assignment Indicator */}
                  <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                    authFormData.account_type === 'producer'
                      ? 'bg-orange-500/20 border-orange-500/40'
                      : 'bg-blue-500/20 border-blue-500/40'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        authFormData.account_type === 'producer'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {authFormData.account_type === 'producer' ? (
                          <span className="text-2xl">🎵</span>
                        ) : (
                          <span className="text-2xl">🛒</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/90 mb-1">
                          You'll access:
                        </p>
                        <p className={`text-lg font-bold ${
                          authFormData.account_type === 'producer'
                            ? 'text-orange-400'
                            : 'text-blue-400'
                        }`}>
                          {authFormData.account_type === 'producer' 
                            ? 'Producer Dashboard' 
                            : 'Buyer Dashboard'}
                        </p>
                        <p className="text-xs text-white/80 mt-2">
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
                <div className="p-4 rounded-xl bg-red-500/20 border-2 border-red-500/50 text-sm text-red-300 font-medium">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full text-base font-semibold py-3"
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  authMode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={switchAuthMode}
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                {authMode === 'signin' 
                  ? "Don't have an account? " : "Already have an account? "
                }
                <span className="font-semibold underline">{authMode === 'signin' ? 'Sign up' : 'Sign in'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 