import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AppLogoProps {
  size?: number;
  className?: string;
  clickable?: boolean;
  showText?: boolean;
}

export default function AppLogo({ 
  size = 40, 
  className = '', 
  clickable = false,
  showText = false 
}: AppLogoProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  return (
    <div 
      className={`flex flex-col items-center ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <img
        src="/assets/Beatscrest.png"
        alt="BeatCrest Logo"
        width={size}
        height={size}
        className="object-contain mx-auto transition-transform hover:scale-105"
        style={{ maxHeight: `${size}px` }}
      />
      {showText && (
        <div 
          className="text-white font-medium tracking-wide mt-2"
          style={{ 
            fontSize: `${Math.max(14, size * 0.18)}px`,
            textShadow: '0 2px 4px rgba(0,0,0,0.4)'
          }}
        >
          beatcrest
        </div>
      )}
    </div>
  );
} 