import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import PaymentModal from "../components/PaymentModal";
import AppLogo from "../components/AppLogo";
import SimpleLogo from "../components/SimpleLogo";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  // Banner slides data
  const bannerSlides = [
    {
      title: "Discover Amazing Beats",
      subtitle: "Find the perfect sound for your next hit",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&auto=format&fit=crop",
      cta: "Explore Beats",
      action: () => {
        // Scroll to beats section
        document.getElementById('beats-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Connect with Producers",
      subtitle: "Build your network in the music industry",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&auto=format&fit=crop",
      cta: "Join Community",
      action: () => setShowAuthModal(true)
    },
    {
      title: "Sell Your Beats",
      subtitle: "Monetize your talent and reach global audiences",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1600&auto=format&fit=crop",
      cta: "Start Selling",
      action: () => {
        if (user) {
          navigate('/dashboard');
        } else {
          setShowAuthModal(true);
        }
      }
    }
  ];

  // Mock beats data
  const mockBeats = [
    { id: 1, title: "Midnight Groove", producer: "DJ ProBeat", price: 45000, genre: "Hip Hop", bpm: 140, cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop" },
    { id: 2, title: "Afro Vibes", producer: "Afrobeats King", price: 35000, genre: "Afrobeats", bpm: 120, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop" },
    { id: 3, title: "R&B Soul", producer: "Melody Queen", price: 55000, genre: "R&B", bpm: 90, cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop" },
    { id: 4, title: "Trap Beat", producer: "Trap Master", price: 40000, genre: "Trap", bpm: 140, cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop" },
    { id: 5, title: "Reggae Flow", producer: "Reggae Vibes", price: 30000, genre: "Reggae", bpm: 80, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop" },
    { id: 6, title: "Pop Hit", producer: "Pop Producer", price: 60000, genre: "Pop", bpm: 120, cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop" },
    { id: 7, title: "Gospel Praise", producer: "Gospel Master", price: 25000, genre: "Gospel", bpm: 85, cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop" },
    { id: 8, title: "Jazz Fusion", producer: "Jazz Artist", price: 70000, genre: "Jazz", bpm: 110, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop" }
  ];

  const genres = ["All", "Hip Hop", "Afrobeats", "R&B", "Trap", "Reggae", "Pop", "Gospel", "Jazz"];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Filter beats based on search and genre
  const filteredBeats = mockBeats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.producer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || beat.genre === selectedGenre;
    return matchesSearch && matchesGenre;
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <SimpleLogo size={40} clickable={true} />
          </div>
                      <nav className="hidden gap-6 md:flex items-center">
              <button className="text-gray-700 hover:text-teal-600">Home</button>
              <button className="text-gray-700 hover:text-teal-600">About</button>
              <button className="text-gray-700 hover:text-teal-600">Beats</button>
              <Link to="/dashboard" className="text-gray-700 hover:text-teal-600">Dashboard</Link>
              <button className="text-gray-700 hover:text-teal-600" onClick={() => setShowAuthModal(true)}>Sign in</button>
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎵 Sell Beats
              </button>
            </nav>
        </div>
      </header>

      {/* Banner Slides */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">{slide.subtitle}</p>
                  <button 
                    onClick={slide.action}
                    className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 shadow-lg"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About BeatCrest Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">About BeatCrest</h2>
            <p className="text-xl text-gray-600 mb-8">
              BeatCrest is the ultimate social media and marketplace platform for beat producers and music entertainers across Africa and beyond. 
              We connect talented producers with artists, providing a seamless platform for discovery, collaboration, and commerce.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 via-teal-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🎵</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload & Sell</h3>
                <p className="text-gray-600">Upload your beats with previews and set your own prices</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Social Community</h3>
                <p className="text-gray-600">Connect with producers and artists worldwide</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Grow Your Brand</h3>
                <p className="text-gray-600">Build your audience and monetize your talent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Producer Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Turn Your Beats Into Success?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of producers who are already earning from their music. 
              Upload your beats, set your prices, and start building your brand today.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Money</h3>
                <p className="opacity-90">Set your own prices and keep 95% of your earnings</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
                <p className="opacity-90">Connect with artists from around the world</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Grow Fast</h3>
                <p className="opacity-90">Build your audience and increase your sales</p>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎵 Start Selling Your Beats Now
              </button>
              <p className="text-sm opacity-75">Join 10,000+ producers already earning on BeatCrest</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beats Commerce Section */}
      <section id="beats-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">Discover Amazing Beats</h2>
            <p className="text-xl text-gray-600 text-center mb-8">
              Browse through thousands of high-quality beats from talented producers
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search beats or producers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Beats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat) => (
              <div key={beat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={beat.cover}
                    alt={beat.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 text-white px-2 py-1 rounded text-sm font-medium">
                    ₦{beat.price.toLocaleString()}
                  </div>
                  <button className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">▶ Preview</span>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{beat.title}</h3>
                  <p className="text-gray-600 mb-2">{beat.producer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{beat.genre} • {beat.bpm} BPM</span>
                    <button 
                      onClick={() => handleBuyNow(beat)}
                      className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBeats.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No beats found matching your search criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-10 text-sm">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <SimpleLogo size={32} />
          </div>
          <div className="text-gray-500">© {new Date().getFullYear()} BeatCrest. All rights reserved.</div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Welcome to BeatCrest</h3>
              <button onClick={() => setShowAuthModal(false)} className="rounded-xl px-3 py-1 text-sm text-gray-500 hover:bg-gray-100">Close</button>
            </div>
            <form className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input type="email" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input type="password" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
              </div>
              <button className="w-full inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-white shadow-lg hover:bg-purple-700 transition">
                <span className="font-medium">Sign In</span>
              </button>
            </form>
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