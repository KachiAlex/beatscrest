import React from "react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-8">
          BeatCrest
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          The ultimate social media and marketplace platform for beat producers and music entertainers across Africa and beyond.
        </p>
        <div className="space-y-4">
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700">
            Get Started
          </button>
          <br />
          <button className="border border-gray-300 text-gray-800 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50">
            Explore Beats
          </button>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-600">50K+</h3>
            <p className="text-gray-600">Active Producers</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-600">200K+</h3>
            <p className="text-gray-600">Beats Available</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-green-600">₦2M+</h3>
            <p className="text-gray-600">Earned by Producers</p>
          </div>
        </div>
      </div>
    </div>
  );
} 