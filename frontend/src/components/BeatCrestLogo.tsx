import React from 'react';

interface BeatCrestLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BeatCrestLogo({ size = 32, className = '', showText = false }: BeatCrestLogoProps) {
  const scale = size / 64; // Base size is 64px
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="backgroundGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: '#0D9488', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#38BDF8', stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: '#D946EF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
          </linearGradient>
          
          <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#14B8A6', stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: '#38BDF8', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#D946EF', stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        
        {/* Background gradient */}
        <rect width="64" height="64" fill="url(#backgroundGradient)" rx="12"/>
        
        {/* Main 'G' shape with shadow */}
        <path 
          d="M16 20 C16 12 24 8 32 8 C40 8 48 12 48 20 C48 28 40 32 32 32 C24 32 16 28 16 20 Z M32 12 C26 12 20 16 20 20 C20 24 26 28 32 28 C38 28 44 24 44 20 C44 16 38 12 32 12 Z" 
          fill="url(#shapeGradient)" 
          filter="url(#shadow)"
        />
        
        {/* Shopping cart icon in center */}
        <g transform="translate(24, 16)">
          {/* Cart handle */}
          <path d="M2 4 L6 4 L6 2 L8 2 L8 4 L12 4 L12 6 L10 6 L10 12 L6 12 L6 6 L2 6 Z" fill="white"/>
          {/* Cart basket */}
          <rect x="2" y="6" width="8" height="6" fill="white" rx="1"/>
          {/* Cart wheels */}
          <circle cx="4" cy="14" r="1" fill="white"/>
          <circle cx="8" cy="14" r="1" fill="white"/>
        </g>
        
        {/* Beat lines/equalizer on the right */}
        <rect x="48" y="12" width="2" height="8" fill="white" rx="1" opacity="0.8"/>
        <rect x="52" y="8" width="2" height="16" fill="white" rx="1" opacity="0.8"/>
        <rect x="56" y="16" width="2" height="12" fill="white" rx="1" opacity="0.8"/>
      </svg>
      
      {/* Text "beatcrest" */}
      {showText && (
        <div 
          className="text-white font-medium tracking-wide mt-1"
          style={{ 
            fontSize: `${Math.max(12, size * 0.2)}px`,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          beatcrest
        </div>
      )}
    </div>
  );
} 