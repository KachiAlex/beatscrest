import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/images/beatscrest-logo.png" 
                alt="BeatCrest Logo" 
                className="h-24 md:h-32 w-auto"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold">
              <span className="text-purple-600">
                BeatCrest
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              The ultimate social media and marketplace platform for beat producers and music entertainers across Africa and beyond
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Get Started
              </button>
              <Link 
                to="/home"
                className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50"
              >
                Explore Beats
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools for producers and artists to create, share, and monetize their music
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Upload & Sell Beats</h3>
              <p className="text-gray-600">Upload your beats with previews and set your own prices.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Social Community</h3>
              <p className="text-gray-600">Connect with producers and artists.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Trending Beats</h3>
              <p className="text-gray-600">Discover what's hot in the music scene.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Producer Dashboard</h3>
              <p className="text-gray-600">Track your sales and manage your beats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your Music Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join BeatCrest today and connect with a community of talented producers and artists
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Join BeatCrest Now
          </button>
        </div>
      </section>

      {/* Simple Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Sign In / Sign Up</h3>
            <p className="text-gray-600 mb-4">Authentication modal will be implemented here.</p>
            <button
              onClick={() => setShowAuthModal(false)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 