import React, { useState } from "react";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600"></div>
            <span className="text-xl font-bold text-gray-900">BeatCrest</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <button className="text-gray-700 hover:text-purple-600">Home</button>
            <button className="text-gray-700 hover:text-purple-600">Explore</button>
            <button className="text-gray-700 hover:text-purple-600" onClick={() => setShowAuthModal(true)}>Sign in</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white py-24 text-center">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold md:text-7xl">
              <span className="text-purple-600">BeatCrest</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 md:text-2xl">
              The ultimate social media and marketplace platform for beat producers and music entertainers across Africa and beyond.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-white shadow-lg hover:bg-purple-700 transition"
              >
                <span className="font-medium">Get Started</span>
              </button>
              <button className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-5 py-3 text-gray-800 hover:bg-gray-50 transition">
                <span className="font-medium">Explore Beats</span>
              </button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-purple-200 to-blue-200"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-5xl">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">
              Powerful tools for producers and artists to create, share, and monetize their music
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Upload & Sell Beats",
                description: "Upload your beats with previews and set your own prices. Automated delivery system ensures instant downloads after purchase.",
              },
              {
                title: "Social Community",
                description: "Connect with producers and artists. Follow, comment, like, and build your network in the music industry.",
              },
              {
                title: "Trending Beats",
                description: "Discover what's hot in the music scene. Our algorithm highlights the most popular and trending beats.",
              },
              {
                title: "Producer Dashboard",
                description: "Track your sales, manage your beats, and analyze your performance with comprehensive analytics.",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border bg-white p-6 text-center shadow-sm hover:shadow-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                  <div className="h-8 w-8 text-purple-600">🎵</div>
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <h3 className="text-4xl font-bold text-purple-600">50K+</h3>
              <p className="text-xl text-gray-600">Active Producers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600">200K+</h3>
              <p className="text-xl text-gray-600">Beats Available</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-600">₦2M+</h3>
              <p className="text-xl text-gray-600">Earned by Producers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-5xl">What Our Community Says</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied producers and artists</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: "DJ ProBeat",
                role: "Music Producer",
                content: "BeatCrest has revolutionized how I sell my beats. The platform is intuitive and the community is amazing!",
                verified: true,
              },
              {
                name: "Melody Queen",
                role: "R&B Artist",
                content: "I found my signature sound on BeatCrest. The quality of beats here is unmatched!",
                verified: false,
              },
              {
                name: "Afrobeats King",
                role: "Producer",
                content: "The social features help me connect with artists and grow my fan base. Love the platform!",
                verified: true,
              },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="italic text-gray-600">"{testimonial.content}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{testimonial.name}</p>
                      {testimonial.verified && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">Ready to Start Your Music Journey?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Join BeatCrest today and connect with a community of talented producers and artists
          </p>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-purple-600 shadow-lg hover:bg-gray-100 transition"
          >
            <span className="font-medium">Join BeatCrest Now</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-10 text-sm">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600"></div>
            <span className="font-semibold">BeatCrest</span>
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
    </div>
  );
} 