import React from 'react';

interface BeatCrestLogoProps {
  size?: number;
  className?: string;
}

export default function BeatCrestLogo({ size = 32, className = '' }: BeatCrestLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
      </defs>
      
      {/* Background circle with brand gradient */}
      <circle cx="16" cy="16" r="15" fill="url(#logoGradient)" stroke="white" strokeWidth="1.5"/>
      
      {/* Main 'G' shape with shopping cart */}
      <path d="M8 12 C8 8 12 4 16 4 C20 4 24 8 24 12 C24 16 20 20 16 20 C12 20 8 16 8 12 Z" fill="url(#shapeGradient)" opacity="0.9"/>
      
      {/* Shopping cart handle */}
      <path d="M10 10 L14 10 L14 8 L16 8 L16 10 L20 10 L20 12 L18 12 L18 16 L14 16 L14 12 L10 12 Z" fill="white"/>
      
      {/* Beat lines/equalizer */}
      <rect x="22" y="8" width="1.5" height="6" fill="white" rx="0.5"/>
      <rect x="24" y="6" width="1.5" height="10" fill="white" rx="0.5"/>
      <rect x="26" y="10" width="1.5" height="8" fill="white" rx="0.5"/>
      
      {/* Music note accent */}
      <path d="M6 18 L6 22 C6 23 7 24 8 24 C9 24 10 23 10 22 C10 21 9 20 8 20 C7.5 20 7 20.2 6.5 20.5 L6.5 18 L6 18 Z" fill="white" opacity="0.8"/>
    </svg>
  );
} 