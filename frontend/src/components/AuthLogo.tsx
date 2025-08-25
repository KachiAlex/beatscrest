import React from 'react';
import AppLogo from './AppLogo';

export default function AuthLogo() {
  return (
    <div className="text-center mb-8">
      <AppLogo size={120} />
      <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome to BeatCrest</h1>
      <p className="text-gray-600 mt-2">Connect with producers and artists worldwide</p>
    </div>
  );
} 