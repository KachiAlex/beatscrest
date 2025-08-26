import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleLogoProps {
  size?: number;
  className?: string;
  clickable?: boolean;
  showText?: boolean;
}

export default function SimpleLogo({ 
  size = 40, 
  className = '', 
  clickable = false,
  showText = false 
}: SimpleLogoProps) {
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
      {/* BeatCrest Logo */}
      <img 
        src="/images/beatscrest-logo.png" 
        alt="BeatCrest Logo" 
        className="object-contain"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`
        }}
        onError={(e) => {
          // Fallback to CSS logo if image fails to load
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback CSS logo */}
      <div 
        className="relative rounded-xl overflow-hidden shadow-lg hidden"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          background: 'linear-gradient(135deg, #7C3AED 0%, #0D9488 25%, #38BDF8 50%, #D946EF 75%, #F97316 100%)'
        }}
      >
        {/* BC text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-white font-bold"
            style={{ fontSize: `${Math.max(12, size * 0.4)}px` }}
          >
            BC
          </span>
        </div>
        
        {/* Music note icon */}
        <div 
          className="absolute bottom-1 right-1"
          style={{ fontSize: `${Math.max(8, size * 0.2)}px` }}
        >
          🎵
        </div>
      </div>
      
      {/* Text "beatcrest" */}
      {showText && (
        <div 
          className="text-gray-900 font-medium tracking-wide mt-1"
          style={{ 
            fontSize: `${Math.max(10, size * 0.15)}px`
          }}
        >
          beatcrest
        </div>
      )}
    </div>
  );
} 