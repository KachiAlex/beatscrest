import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import PaymentModal from "../components/PaymentModal";
import { useAuth } from "../contexts/AuthContext";
import { Search, Filter, Play, Heart, MessageCircle, Share2, ShoppingCart } from 'lucide-react';
import { mockBeats } from "../data/mockBeats";
import apiService from "../services/api";
import { getProfileByUsername } from "../data/mockProfiles";

export default function Home() {
  const { login, register } = useAuth();
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
  const [mounted, setMounted] = useState(false);

  // Banner slides data
  const bannerSlides = [
    {
      id: 1,
      title: 'Top Afrobeats Producers',
      subtitle: 'Discover chart-ready sounds from Africa\'s best',
      image: 'https://images.unsplash.com/photo-1495562569060-2eec283d3391?w=1600&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Sell Your Beats Effortlessly',
      subtitle: 'Upload, set your price, and get paid securely',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Find Your Perfect Sound',
      subtitle: 'Search by genre, BPM, key, and mood',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&auto=format&fit=crop'
    }
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSlideHovered, setIsSlideHovered] = useState(false);

  useEffect(() => {
    if (isSlideHovered) return;
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isSlideHovered]);

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

  // Trigger entrance animations once mounted
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(id);
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
    // Navigate to beat detail page or open comment modal
    navigate(`/beat/${beatId}`);
  };

  // Handle share button
  const handleShare = async (beat: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: beat.title,
          text: beat.description,
          url: window.location.origin + `/beat/${beat.id}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const url = window.location.origin + `/beat/${beat.id}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
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
    setAuthFormData({ email: '', password: '', fullName: '', username: '', account_type: 'buyer' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Slider */}
      <section className="pt-4 md:pt-6">
        <div className="container mx-auto px-4">
          <div 
            className="relative overflow-hidden rounded-2xl border border-beatcrest-teal/20 shadow-sm h-56 md:h-72 lg:h-80"
            onMouseEnter={() => setIsSlideHovered(true)}
            onMouseLeave={() => setIsSlideHovered(false)}
          >
            {bannerSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `linear-gradient(rgba(30,58,138,0.25), rgba(0,0,0,0.35)), url('${slide.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-6 md:px-10 text-center">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-white/90 text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
                      {slide.subtitle}
                    </p>
                    <div className="mt-4">
                      <button 
                        onClick={() => window.scrollTo({ top: document.body.clientHeight / 4, behavior: 'smooth' })}
                        className="bg-beatcrest-blue hover:bg-beatcrest-blue-dark text-white px-4 py-2 rounded-lg text-sm md:text-base"
                      >
                        Explore Beats
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Controls */}
            <button
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-beatcrest-navy rounded-full w-9 h-9 flex items-center justify-center shadow"
              onClick={() => setActiveSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            >
              ‹
            </button>
            <button
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-beatcrest-navy rounded-full w-9 h-9 flex items-center justify-center shadow"
              onClick={() => setActiveSlide((prev) => (prev + 1) % bannerSlides.length)}
            >
              ›
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${idx === activeSlide ? 'w-6 bg-white' : 'w-2.5 bg-white/60'}`}
                />
              ))}
            </div>
          </div>
          {/* Quick stats strip */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white shadow-sm border border-beatcrest-teal/20 p-4 text-center">
              <div className="text-2xl">🎵</div>
              <div className="mt-1 text-2xl font-bold text-beatcrest-navy">10k+</div>
              <div className="text-xs text-beatcrest-navy/70">Beats Uploaded</div>
            </div>
            <div className="rounded-xl bg-white shadow-sm border border-beatcrest-teal/20 p-4 text-center">
              <div className="text-2xl">🧑‍🎤</div>
              <div className="mt-1 text-2xl font-bold text-beatcrest-navy">5k+</div>
              <div className="text-xs text-beatcrest-navy/70">Artists & Buyers</div>
            </div>
            <div className="rounded-xl bg-white shadow-sm border border-beatcrest-teal/20 p-4 text-center">
              <div className="text-2xl">💳</div>
              <div className="mt-1 text-2xl font-bold text-beatcrest-navy">₦45k</div>
              <div className="text-xs text-beatcrest-navy/70">Avg. Beat Price</div>
            </div>
            <div className="rounded-xl bg-white shadow-sm border border-beatcrest-teal/20 p-4 text-center">
              <div className="text-2xl">⚡</div>
              <div className="mt-1 text-2xl font-bold text-beatcrest-navy">Instant</div>
              <div className="text-xs text-beatcrest-navy/70">Delivery</div>
            </div>
          </div>
        </div>
      </section>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Feature badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-beatcrest-teal/20 bg-beatcrest-teal/5 p-4 flex items-start gap-3">
                <div className="text-beatcrest-blue text-xl">🔍</div>
                <div>
                  <div className="font-semibold text-beatcrest-navy">Powerful Search</div>
                  <div className="text-sm text-beatcrest-navy/70">Filter by genre, BPM, key and more</div>
                </div>
              </div>
              <div className="rounded-xl border border-beatcrest-teal/20 bg-beatcrest-teal/5 p-4 flex items-start gap-3">
                <div className="text-beatcrest-orange text-xl">💼</div>
                <div>
                  <div className="font-semibold text-beatcrest-navy">Fair Pricing</div>
                  <div className="text-sm text-beatcrest-navy/70">Transparent licensing and payouts</div>
                </div>
              </div>
              <div className="rounded-xl border border-beatcrest-teal/20 bg-beatcrest-teal/5 p-4 flex items-start gap-3">
                <div className="text-beatcrest-navy text-xl">🛡️</div>
                <div>
                  <div className="font-semibold text-beatcrest-navy">Secure Platform</div>
                  <div className="text-sm text-beatcrest-navy/70">Protected payments and delivery</div>
                </div>
              </div>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-beatcrest-blue">Discover</span>{" "}
                <span className="text-beatcrest-navy">Amazing</span>{" "}
                <span className="text-beatcrest-blue">Beats</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-beatcrest-navy/70 mb-10">
                Connect with top producers and find your perfect sound
              </p>
              
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-beatcrest-teal" />
                  <input
                    type="text"
                    placeholder="Search beats, producers, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-beatcrest-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-beatcrest-blue focus:border-beatcrest-blue text-beatcrest-navy"
                  />
                </div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-3 border border-beatcrest-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-beatcrest-blue focus:border-beatcrest-blue text-beatcrest-navy bg-white"
                >
                  <option value="All">All Genres</option>
                  {genres.filter(g => g !== "All").map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="px-4 py-3 border border-beatcrest-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-beatcrest-blue focus:border-beatcrest-blue text-beatcrest-navy bg-white"
                >
                  <option value="All">All Prices</option>
                  <option value="Under ₦30,000">Under ₦30,000</option>
                  <option value="₦30,000 - ₦50,000">₦30,000 - ₦50,000</option>
                  <option value="Over ₦50,000">Over ₦50,000</option>
                </select>
              </div>
            </div>

            {/* Category Navigation */}
            <div className="flex gap-4 mb-8 border-b border-beatcrest-teal/20 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 font-medium transition-colors duration-200 ${
                    activeCategory === category
                      ? 'text-beatcrest-blue border-b-2 border-beatcrest-blue bg-beatcrest-teal/5'
                      : 'text-beatcrest-navy/70 hover:text-beatcrest-blue'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Beat Listings Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-beatcrest-navy">
                All Beats ({filteredBeats.length})
              </h2>
              <button 
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-beatcrest-teal/30 rounded-lg text-beatcrest-navy hover:bg-beatcrest-teal/10 transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>

            {/* More Filters Panel */}
            {showMoreFilters && (
              <div className="mb-6 p-4 bg-beatcrest-teal/5 rounded-lg border border-beatcrest-teal/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-beatcrest-navy mb-2">BPM Range</label>
                    <input type="range" min="60" max="200" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-beatcrest-navy mb-2">Sort By</label>
                    <select className="w-full px-3 py-2 border border-beatcrest-teal/30 rounded-lg text-beatcrest-navy bg-white">
                      <option>Newest First</option>
                      <option>Oldest First</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Most Popular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-beatcrest-navy mb-2">Verified Only</label>
                    <input type="checkbox" className="w-4 h-4 text-beatcrest-blue" />
                  </div>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loadingBeats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-beatcrest-teal/20 bg-white overflow-hidden shadow-sm animate-pulse">
                    <div className="h-1.5 bg-beatcrest-teal/10" />
                    <div className="h-72 bg-beatcrest-teal/10" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-beatcrest-teal/10 rounded" />
                      <div className="h-3 bg-beatcrest-teal/10 rounded w-2/3" />
                      <div className="h-3 bg-beatcrest-teal/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Beats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredBeats.map((beat, idx) => (
                <div 
                  key={beat.id}
                  className={`rounded-2xl p-[1px] bg-gradient-to-br from-beatcrest-teal/30 via-beatcrest-blue/20 to-transparent hover:from-beatcrest-blue/40 hover:via-beatcrest-teal/30 transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  <div className="bg-white rounded-2xl border border-beatcrest-teal/20 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                  {/* Play Progress Bar */}
                  <div className="h-1.5 bg-beatcrest-teal/20 relative">
                    <div className="h-full bg-beatcrest-blue w-0"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-beatcrest-navy/60">
                      0:00 / 0:00
                    </div>
                  </div>

                  {/* (moved) Engagement & Actions now placed below thumbnail */}

                  {/* Producer Info */}
                  {(() => {
                    const producerProfile = getProfileByUsername(beat.producerUsername);
                    return (
                      <div className="px-6 pb-4 flex items-center gap-3">
                        <img 
                          src={producerProfile?.profile_picture || `https://ui-avatars.com/api/?name=${beat.producerUsername}&background=random`}
                          alt={producerProfile?.full_name || beat.producerUsername}
                          className="w-10 h-10 rounded-full object-cover border-2 border-beatcrest-teal/20"
                          onError={(e) => {
                            // Fallback to gradient avatar if image fails
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-10 h-10 rounded-full bg-beatcrest-gradient flex items-center justify-center text-white text-sm font-bold hidden">
                          {beat.producerUsername.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-medium text-beatcrest-navy">{producerProfile?.full_name || beat.producerUsername}</span>
                            <span className="text-xs text-beatcrest-navy/60">{beat.date}</span>
                            {(producerProfile?.is_verified || beat.verified) && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verified</span>
                            )}
                          </div>
                          {producerProfile && (
                            <div className="text-xs text-beatcrest-navy/60 mt-0.5">
                              {producerProfile.followers_count.toLocaleString()} followers
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Beat Title */}
                  <div className="px-6 pb-3">
                    <h3 className="text-xl font-bold text-beatcrest-navy">{beat.title}</h3>
                  </div>

                  {/* Description */}
                  <div className="px-6 pb-4">
                    <p className="text-base text-beatcrest-navy/70 leading-relaxed">{beat.description}</p>
                  </div>

                  {/* Tags */}
                  <div className="px-6 pb-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-beatcrest-teal/10 text-beatcrest-navy rounded">{beat.genre}</span>
                    <span className="text-xs px-2 py-1 bg-beatcrest-teal/10 text-beatcrest-navy rounded">{beat.bpm} BPM</span>
                    <span className="text-xs px-2 py-1 bg-beatcrest-teal/10 text-beatcrest-navy rounded">{beat.key}</span>
                    {beat.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-beatcrest-teal/10 text-beatcrest-navy rounded">{tag}</span>
                    ))}
                  </div>

                  {/* Cover Image */}
                  <div className="relative group cursor-pointer" onClick={() => handlePlay(beat)}>
                    <img
                      src={beat.cover}
                      alt={beat.title}
                      loading="lazy"
                      className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <Play className="w-6 h-6 text-beatcrest-blue fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Engagement Metrics (below thumbnail) */}
                  <div className="px-6 pt-3 pb-2 flex items-center gap-6 text-sm text-beatcrest-navy/70">
                    <span>{beat.plays.toLocaleString()} plays</span>
                    <span>{beat.likes.toLocaleString()} likes</span>
                    <span>{beat.downloads.toLocaleString()} downloads</span>
                  </div>

                  {/* Interaction Buttons (below thumbnail) */}
                  <div className="px-6 pb-4 flex items-center gap-4 flex-wrap">
                    <button 
                      onClick={() => handleLike(beat.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        beat.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-beatcrest-navy hover:text-beatcrest-blue'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${beat.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{beat.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleComment(beat.id)}
                      className="flex items-center gap-1 text-beatcrest-navy hover:text-beatcrest-blue transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Comment</span>
                    </button>
                    <button 
                      onClick={() => handleShare(beat)}
                      className="flex items-center gap-1 text-beatcrest-navy hover:text-beatcrest-blue transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm font-semibold text-beatcrest-navy">₦{beat.price.toLocaleString()}</span>
                      <button 
                        onClick={() => handleBuyNow(beat)}
                        className="flex items-center gap-1 px-3 py-1 bg-beatcrest-blue text-white rounded-lg text-sm font-medium hover:bg-beatcrest-blue-dark transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buy</span>
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-12 rounded-2xl bg-beatcrest-gradient p-8 text-center text-white shadow">
              <h3 className="text-2xl md:text-3xl font-bold">Ready to sell your first beat?</h3>
              <p className="mt-2 text-white/90">Join thousands of producers earning on BeatCrest today.</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 bg-white text-beatcrest-navy hover:text-beatcrest-blue px-5 py-3 rounded-xl font-semibold"
              >
                Upload a Beat
              </button>
            </div>

            {filteredBeats.length === 0 && (
              <div className="text-center py-12">
                <p className="text-beatcrest-teal text-lg">No beats found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-beatcrest-teal/20 bg-beatcrest-surface py-10 text-sm">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-beatcrest-teal">© {new Date().getFullYear()} BeatCrest. All rights reserved.</div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gradient">
                {authMode === 'signin' ? 'Welcome Back' : 'Join BeatCrest'}
              </h3>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthMode('signin');
                  setAuthFormData({ email: '', password: '', fullName: '', username: '', account_type: 'buyer' });
                  setAuthError('');
                }} 
                className="rounded-xl px-3 py-1 text-sm text-beatcrest-teal hover:bg-beatcrest-teal/10 transition-colors duration-200"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-beatcrest-navy">Username</label>
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
                <label className="mb-1 block text-sm font-medium text-beatcrest-navy">Email</label>
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
                <label className="mb-1 block text-sm font-medium text-beatcrest-navy">Password</label>
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
                  <p className="text-xs text-beatcrest-teal mt-1">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-beatcrest-navy">I want to</label>
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
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {authError}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-beatcrest-blue px-5 py-3 text-white shadow-lg hover:bg-beatcrest-blue-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="font-medium">
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-beatcrest-navy/70 text-sm">
                {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={switchAuthMode}
                  className="ml-1 text-beatcrest-blue hover:text-beatcrest-blue-dark font-medium transition-colors duration-200"
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
