import React, { useState, useEffect } from 'react';
import AppLogo from './AppLogo';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start fade-in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Complete splash screen after duration
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-teal-500 to-orange-500 flex items-center justify-center z-50">
      <div 
        className={`transition-opacity duration-1000 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <AppLogo size={120} />
      </div>
    </div>
  );
} 