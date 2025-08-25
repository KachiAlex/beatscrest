import React from 'react';

interface BeatCrestLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BeatCrestLogo({ size = 64, className = '', showText = false }: BeatCrestLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
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
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.4)"/>
          </filter>
        </defs>
        
        {/* Background gradient */}
        <rect width="120" height="120" fill="url(#backgroundGradient)" rx="20"/>
        
        {/* Main 'G' shape - organic, fluid shape with circular cutout */}
        <path 
          d="M30 40 C30 25 45 15 60 15 C75 15 90 25 90 40 C90 55 75 65 60 65 C45 65 30 55 30 40 Z M60 25 C50 25 40 32 40 40 C40 48 50 55 60 55 C70 55 80 48 80 40 C80 32 70 25 60 25 Z" 
          fill="url(#shapeGradient)" 
          filter="url(#shadow)"
        />
        
        {/* Top-right protrusion/ear */}
        <path 
          d="M85 25 C90 20 95 25 95 30 C95 35 90 40 85 35 C80 30 80 25 85 25 Z" 
          fill="url(#shapeGradient)" 
          filter="url(#shadow)"
        />
        
        {/* Shopping cart icon in the circular center */}
        <g transform="translate(45, 35)">
          {/* Cart handle */}
          <path d="M3 6 L9 6 L9 3 L12 3 L12 6 L18 6 L18 9 L15 9 L15 18 L9 18 L9 9 L3 9 Z" fill="white"/>
          {/* Cart basket */}
          <rect x="3" y="9" width="12" height="9" fill="white" rx="1"/>
          {/* Cart wheels */}
          <circle cx="6" cy="21" r="1.5" fill="white"/>
          <circle cx="12" cy="21" r="1.5" fill="white"/>
        </g>
      </svg>
      
      {/* Text "beatcrest" */}
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