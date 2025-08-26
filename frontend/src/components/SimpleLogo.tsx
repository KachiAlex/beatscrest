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
      <picture>
        <source srcSet="/images/beatscrest-logo.svg" type="image/svg+xml" />
        <img 
          src="/images/beatscrest-logo.png" 
          alt="BeatCrest Logo" 
          className="object-contain"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`
          }}
          loading="eager"
          decoding="async"
        />
      </picture>
      
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