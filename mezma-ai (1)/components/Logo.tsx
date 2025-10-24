import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="MEZMA AI Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path 
      d="M 20,80 L 50,20 L 80,80 L 65,80 L 50,50 L 35,80 Z" 
      fill="url(#logoGradient)" 
    />
    <path
      d="M 42,65 L 50,80 L 58,65 Z"
      fill="white"
    />
  </svg>
);
