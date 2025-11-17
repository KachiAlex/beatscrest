import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import PaymentModal from "../components/PaymentModal";
import { useAuth } from "../contexts/AuthContext";
import { Search, Filter, Play, Heart, MessageCircle, ShoppingCart, Music, TrendingUp, Users, Zap, Shield, Star, ArrowRight } from 'lucide-react';
import { mockBeats } from "../data/mockBeats";
import apiService from "../services/api";
import { getProfileByUsername } from "../data/mockProfiles";

export default function Home() {
  const { login, register, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All Beats");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    account_type: 'buyer' as 'buyer' | 'producer'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const [beats, setBeats] = useState(mockBeats);
  const [loadingBeats, setLoadingBeats] = useState(false);


  // Fetch beats from backend (fallback to local mock)
  useEffect(() => {
    const fetchBeats = async () => {
      try {
        setLoadingBeats(true);
        const data: any = await apiService.getBeats({});
        if (Array.isArray(data.beats)) {
          // Normalize to UI shape if coming from API
          const normalized = data.beats.map((b: any, idx: number) => ({
            id: b.id ?? idx + 1,
            title: b.title,
            producer: b.producer?.username || b.producer || 'unknown',
            producerUsername: b.producer?.username || b.producerUsername || 'unknown',
            price: b.price,
            genre: b.genre,
            bpm: b.bpm ?? 0,
            key: b.key ?? '',
            cover: b.thumbnailUrl || b.thumbnail_url || b.previewUrl || b.preview_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop',
            plays: b.playCount || b.plays_count || 0,
            likes: b.likesCount || b.likes_count || 0,
            downloads: b.downloads || 0,
            date: b.createdAt || b.created_at || new Date().toLocaleDateString(),
            verified: true,
            description: b.description || '',
            tags: b.tags || [],
            isLiked: b.isLiked || b.is_liked || false,
          }));
          setBeats(normalized);
        }
      } catch (e) {
        // silently keep local mock
        console.warn('Using local mock beats due to API error');
      } finally {
        setLoadingBeats(false);
      }
    };
    fetchBeats();
  }, []);

  const genres = ["All", "Hip Hop", "Afrobeats", "R&B", "Trap", "Reggae", "Pop", "Gospel", "Jazz"];
  const categories = ["All Beats", "Trending", "Featured", "New Releases"];

  // Handle like button
  const handleLike = (beatId: number) => {
    setBeats(prevBeats => prevBeats.map(beat => 
      beat.id === beatId 
        ? { ...beat, isLiked: !beat.isLiked, likes: beat.isLiked ? beat.likes - 1 : beat.likes + 1 }
        : beat
    ));
  };

  // Handle comment button
  const handleComment = (beatId: number) => {
    navigate(`/beat/${beatId}`);
  };

  // Handle play button
  const handlePlay = (beat: any) => {
    // Navigate to beat detail page to play
    navigate(`/beat/${beat.id}`);
  };

  // Filter beats based on search, genre, price, and category
  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.producerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || beat.genre === selectedGenre;
    
    // Price filter
    let matchesPrice = true;
    if (selectedPrice === "Under ₦30,000") {
      matchesPrice = beat.price < 30000;
    } else if (selectedPrice === "₦30,000 - ₦50,000") {
      matchesPrice = beat.price >= 30000 && beat.price <= 50000;
    } else if (selectedPrice === "Over ₦50,000") {
      matchesPrice = beat.price > 50000;
    }
    
    // Category filter
    let matchesCategory = true;
    if (activeCategory === "Trending") {
      matchesCategory = beat.plays > 2000;
    } else if (activeCategory === "Featured") {
      matchesCategory = beat.verified && beat.likes > 200;
    } else if (activeCategory === "New Releases") {
      matchesCategory = true; // For demo, all beats are new
    }
    
    return matchesSearch && matchesGenre && matchesPrice && matchesCategory;
  });

  // Handle buy now button click
  const handleBuyNow = (beat: any) => {
    setSelectedBeat(beat);
    setShowSignupModal(true);
  };

  // Handle signup completion
  const handleSignupComplete = (userData: any) => {
    setUserData(userData);
    setShowPaymentModal(true);
  };

  // Handle payment modal close
  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setSelectedBeat(null);
    setUserData(null);
  };

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
        if (authFormData.password.length < 8) {
          setAuthError('Password must be at least 8 characters long');
          setAuthLoading(false);
          return;
        }
        
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
      setAuthFormData({ email: '', password: '', fullName: '', username: '', account_type: 'buyer' });
      setAuthMode('signin');
      
      // Navigate based on account type after signup
      if (authMode === 'signup') {
        if (authFormData.account_type === 'producer') {
          navigate('/dashboard');
        } else {
          navigate('/buyer');
        }
      }
      // For login, routing will be handled by AuthContext effect
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
    setAuthFormData({ email: '', password: '', fullName: '', username: '', account_type: 'buyer' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Width */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/20 mb-8 animate-fade-in">
              <Music className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium text-white/90">Africa's Premier Beat Marketplace</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
              Discover Your <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">Next Hit</span>
              <br />From Africa's Best Producers
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
              Buy and sell professional beats. Connect with artists worldwide. Build your music career on BeatCrest.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <button 
                onClick={() => navigate('/marketplace')}
                className="group relative bg-gradient-to-r from-blue-600 via-teal-600 to-blue-600 hover:from-blue-500 hover:via-teal-500 hover:to-blue-500 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Music className="w-5 h-5" />
                  Browse Beats
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
              <button 
                onClick={() => {
                  if (user) {
                    if (user.account_type === 'producer') {
                      navigate('/upload');
                    } else {
                      // Show signup modal with producer selected
                      setAuthMode('signup');
                      setAuthFormData(prev => ({ ...prev, account_type: 'producer' }));
                      setShowAuthModal(true);
                    }
                  } else {
                    // Show signup modal with producer selected
                    setAuthMode('signup');
                    setAuthFormData(prev => ({ ...prev, account_type: 'producer' }));
                    setShowAuthModal(true);
                  }
                }}
                className="glass-dark border-2 border-white/30 hover:border-teal-400/60 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Selling Beats
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
              {[
                { icon: Music, value: '10k+', label: 'Beats', color: 'from-blue-400 to-blue-600' },
                { icon: Users, value: '5k+', label: 'Artists', color: 'from-teal-400 to-teal-600' },
                { icon: TrendingUp, value: '₦45k', label: 'Avg. Price', color: 'from-purple-400 to-purple-600' },
                { icon: Zap, value: 'Instant', label: 'Delivery', color: 'from-orange-400 to-orange-600' }
              ].map((stat, idx) => (
                <div key={idx} className="glass-dark rounded-2xl p-6 border border-white/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 group">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`} />
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/95 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Beats Section */}
      <section className="section-container py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Trending <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Beats</span>
              </h2>
              <p className="text-xl text-white/95 max-w-2xl mx-auto">
                Discover the most popular beats from top producers
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-12">
                <div className="glass-dark rounded-2xl p-6 border border-white/20">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/90" />
                      <input
                        type="text"
                        placeholder="Search beats, producers, tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12"
                      />
                    </div>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="input-field min-w-[180px]"
                    >
                      <option value="All">All Genres</option>
                      {genres.filter(g => g !== "All").map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="input-field min-w-[180px]"
                    >
                      <option value="All">All Prices</option>
                      <option value="Under ₦30,000">Under ₦30,000</option>
                      <option value="₦30,000 - ₦50,000">₦30,000 - ₦50,000</option>
                      <option value="Over ₦50,000">Over ₦50,000</option>
                    </select>
                  </div>
                </div>
            </div>

            {/* Category Navigation */}
              <div className="flex gap-2 mb-10 pb-4 border-b-2 border-white/20 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-teal-500 via-blue-500 to-teal-600 text-white shadow-lg shadow-teal-500/40 scale-105'
                      : 'text-white/90 hover:text-teal-400 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Beat Listings Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  All Beats
                </h3>
                <p className="text-white/95">
                  {filteredBeats.length} {filteredBeats.length === 1 ? 'beat' : 'beats'} available
                </p>
              </div>
              <button 
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="glass-dark border border-white/20 hover:border-teal-400/60 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>

            {/* More Filters Panel */}
            {showMoreFilters && (
              <div className="mb-8 glass-dark rounded-2xl p-6 animate-slide-up border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-3">BPM Range</label>
                    <input type="range" min="60" max="200" className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-3">Sort By</label>
                    <select className="input-field">
                      <option>Newest First</option>
                      <option>Oldest First</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Most Popular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-3">Verified Only</label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-5 h-5 text-teal-500 border-2 border-white/30 rounded focus:ring-2 focus:ring-teal-500 bg-white/10" />
                      <span className="text-sm text-white/90">Show verified only</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loadingBeats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="beat-card animate-pulse">
                    <div className="h-64 bg-gradient-to-br from-white/10 to-white/5" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-white/10 rounded-lg w-3/4" />
                      <div className="h-4 bg-white/10 rounded w-1/2" />
                      <div className="h-4 bg-white/10 rounded w-2/3" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-white/10 rounded-full" />
                        <div className="h-6 w-16 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Beats Grid */}
            {!loadingBeats && filteredBeats.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold text-white mb-2">No beats found</h3>
                <p className="text-white/90">Try adjusting your filters or search terms</p>
              </div>
            )}

            {!loadingBeats && filteredBeats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBeats.map((beat, idx) => (
                  <div 
                    key={beat.id}
                    className="group glass-dark rounded-2xl overflow-hidden border border-white/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 animate-fade-in shadow-xl hover:shadow-2xl"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Cover Image */}
                    <div className="relative cursor-pointer overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20" onClick={() => handlePlay(beat)}>
                      <img
                        src={beat.cover}
                        alt={beat.title}
                        loading="lazy"
                        className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/95 backdrop-blur-md rounded-full p-5 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300 border-2 border-white/50">
                          <Play className="w-10 h-10 text-blue-600 fill-blue-600 ml-1" />
                        </div>
                      </div>
                      {/* Play Indicator */}
                      <div className="absolute top-4 right-4 glass-dark rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 w-0 transition-all duration-300 group-hover:w-full"></div>
                      </div>
                    </div>

                    {/* Beat Content */}
                    <div className="p-6 space-y-4">
                        {/* Producer Info */}
                        {(() => {
                          const producerProfile = getProfileByUsername(beat.producerUsername);
                          return (
                            <div className="flex items-center gap-3">
                              {producerProfile?.profile_picture ? (
                                <img 
                                  src={producerProfile.profile_picture}
                                  alt={producerProfile.full_name || beat.producerUsername}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/50"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                  {beat.producerUsername.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-white truncate">{producerProfile?.full_name || beat.producerUsername}</span>
                                  {(producerProfile?.is_verified || beat.verified) && (
                                    <span className="badge-success text-xs px-2 py-0.5">✓ Verified</span>
                                  )}
                                </div>
                                <div className="text-xs text-white/90 mt-0.5">{beat.date}</div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Beat Title */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{beat.title}</h3>
                          {beat.description && (
                            <p className="text-sm text-white/90 leading-relaxed line-clamp-2">{beat.description}</p>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <span className="badge-primary text-xs">{beat.genre}</span>
                          <span className="badge bg-white/10 text-white/90 text-xs">{beat.bpm} BPM</span>
                          {beat.key && <span className="badge bg-white/10 text-white/90 text-xs">{beat.key}</span>}
                          {beat.tags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="badge bg-white/10 text-white/90 text-xs">{tag}</span>
                          ))}
                        </div>

                        {/* Engagement Metrics */}
                        <div className="flex items-center gap-4 text-xs text-white/90 pt-2 border-t border-white/10">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {beat.plays.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className={`w-4 h-4 ${beat.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            {beat.likes.toLocaleString()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(beat.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                beat.isLiked 
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40' 
                                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${beat.isLiked ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComment(beat.id);
                              }}
                              className="p-2 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 border border-white/20 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">₦{beat.price.toLocaleString()}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyNow(beat);
                              }}
                              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Buy
                            </button>
                          </div>
                        </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}

            {/* View All CTA */}
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/marketplace')}
                className="group inline-flex items-center gap-3 glass-dark border-2 border-white/30 hover:border-teal-400/60 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                View All Beats
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Showcase Section */}
      <section className="section-container py-20 bg-gradient-to-br from-slate-900/50 to-blue-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Explore by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Genre</span>
              </h2>
              <p className="text-xl text-white/95 max-w-2xl mx-auto">
                Find your perfect sound across multiple genres
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {genres.filter(g => g !== "All").map((genre, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedGenre(genre);
                    navigate('/marketplace');
                  }}
                  className="group relative glass-dark rounded-2xl p-8 border border-white/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center">
                    <Music className="w-12 h-12 mx-auto mb-4 text-teal-400 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-2">{genre}</h3>
                    <p className="text-sm text-white/90">Explore beats</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-container py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                How It <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Works</span>
              </h2>
              <p className="text-xl text-white/95 max-w-2xl mx-auto">
                Get started in minutes, whether you're buying or selling
              </p>
            </div>

            {/* For Buyers */}
            <div className="mb-20">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">For Artists & Buyers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Search, title: 'Browse & Search', desc: 'Discover beats by genre, BPM, key, and mood. Use powerful filters to find exactly what you need.', color: 'from-blue-400 to-blue-600' },
                  { icon: Play, title: 'Preview & Select', desc: 'Listen to high-quality previews, read producer profiles, and choose your perfect beat.', color: 'from-teal-400 to-teal-600' },
                  { icon: ShoppingCart, title: 'Buy & Download', desc: 'Secure payment processing and instant delivery. Get your beat files immediately after purchase.', color: 'from-purple-400 to-purple-600' }
                ].map((step, idx) => (
                  <div key={idx} className="glass-dark rounded-2xl p-8 border border-white/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white/20 mb-2">{String(idx + 1).padStart(2, '0')}</div>
                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-white/95 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Producers */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 text-center">For Producers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Music, title: 'Upload Beats', desc: 'Upload your beats with cover art, set pricing, and add tags for better discoverability.', color: 'from-orange-400 to-orange-600' },
                  { icon: TrendingUp, title: 'Get Discovered', desc: 'Your beats appear in search results and recommendations. Reach thousands of artists.', color: 'from-pink-400 to-pink-600' },
                  { icon: Shield, title: 'Earn Securely', desc: 'Get paid instantly. Track your sales, earnings, and analytics all in one dashboard.', color: 'from-green-400 to-green-600' }
                ].map((step, idx) => (
                  <div key={idx} className="glass-dark rounded-2xl p-8 border border-white/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white/20 mb-2">{String(idx + 1).padStart(2, '0')}</div>
                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-white/95 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-teal-600 to-purple-600 p-12 md:p-16 text-center text-white shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to Get Started?</h3>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Join thousands of producers and artists building their music careers on BeatCrest today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      if (user) {
                        if (user.account_type === 'producer') {
                          navigate('/upload');
                        } else {
                          // Show signup modal with producer selected
                          setAuthMode('signup');
                          setAuthFormData(prev => ({ ...prev, account_type: 'producer' }));
                          setShowAuthModal(true);
                        }
                      } else {
                        // Show signup modal with producer selected
                        setAuthMode('signup');
                        setAuthFormData(prev => ({ ...prev, account_type: 'producer' }));
                        setShowAuthModal(true);
                      }
                    }}
                    className="group bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3"
                  >
                    <Music className="w-5 h-5" />
                    Start Selling Beats
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="glass-light border-2 border-white/30 hover:border-white/50 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Browse Marketplace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-dark py-12 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">BC</span>
              </div>
              <span className="text-lg font-bold gradient-text">BeatCrest</span>
            </div>
            <div className="text-sm text-white/95">
              © {new Date().getFullYear()} BeatCrest. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-dark p-8 shadow-2xl border border-white/10">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold gradient-text">
                {authMode === 'signin' ? 'Welcome Back' : 'Join BeatCrest'}
              </h3>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthMode('signin');
                  setAuthFormData({ email: '', password: '', fullName: '', username: '', account_type: 'buyer' });
                  setAuthError('');
                }} 
                className="rounded-xl px-3 py-1 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/90">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={authFormData.username}
                    onChange={handleAuthInputChange}
                    className="input-field" 
                    placeholder="your_username" 
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="mb-1 block text-sm font-semibold text-white/90">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  className="input-field" 
                  placeholder="you@example.com" 
                  required
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-semibold text-white/90">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  className="input-field" 
                  placeholder="At least 8 characters" 
                  required
                  minLength={8}
                />
                {authMode === 'signup' && (
                  <p className="text-xs text-white/90 mt-1">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-white/90">I want to</label>
                    <select
                      name="account_type"
                      value={authFormData.account_type}
                      onChange={handleAuthInputChange}
                      className="input-field"
                      required
                    >
                      <option value="buyer">Buy Beats (Artist/Buyer)</option>
                      <option value="producer">Sell Beats (Producer)</option>
                    </select>
                    <p className="text-xs text-white/90 mt-1">
                      {authFormData.account_type === 'producer' 
                        ? 'Producers can upload and sell beats' 
                        : 'Buyers can purchase and license beats'}
                    </p>
                  </div>
                  
                  {/* Dashboard Assignment Indicator */}
                  <div className={`mt-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    authFormData.account_type === 'producer'
                      ? 'bg-orange-500/20 border-orange-500/40'
                      : 'bg-blue-500/20 border-blue-500/40'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        authFormData.account_type === 'producer'
                          ? 'bg-orange-500/30'
                          : 'bg-blue-500/30'
                      }`}>
                        {authFormData.account_type === 'producer' ? (
                          <span className="text-xl">🎵</span>
                        ) : (
                          <span className="text-xl">🛒</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/90 mb-1">
                          You'll be assigned to:
                        </p>
                        <p className={`text-base font-semibold ${
                          authFormData.account_type === 'producer'
                            ? 'text-orange-400'
                            : 'text-blue-400'
                        }`}>
                          {authFormData.account_type === 'producer' 
                            ? 'Producer Dashboard' 
                            : 'Buyer Dashboard'}
                        </p>
                        <p className="text-xs text-white/90 mt-1">
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
                <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/50 p-3 rounded-lg">
                  {authError}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full py-3"
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
                  <span className="font-medium">
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-white/90 text-sm">
                {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={switchAuthMode}
                  className="ml-1 text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200"
                >
                  {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        beatData={selectedBeat}
        onProceedToPayment={handleSignupComplete}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentClose}
        beatData={selectedBeat}
        userData={userData}
      />
    </div>
  );
}
