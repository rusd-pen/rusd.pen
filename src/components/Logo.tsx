import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const LOGO_CANDIDATES = [
  '/logo.png',
];

export default function Logo({ className = '', size = 32 }: LogoProps) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  const handleImageError = () => {
    // If the current image fails to load, try the next candidate
    setCandidateIndex((prevIndex) => prevIndex + 1);
  };

  // If we have exhausted all logo candidates, render the fallback SVG
  if (candidateIndex >= LOGO_CANDIDATES.length) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block select-none ${className}`}
        id="rusd-pen-logo-svg"
      >
        {/* Dark Teal Upper Leaf with circular cutout */}
        <path
          d="M27 85
             C 27 75, 29 65, 29 58
             A 11 11 0 0 0 29 36
             C 29 30, 36 18, 65 14
             C 65 25, 61 45, 45 58
             C 35 66, 30 75, 27 85 Z"
          fill="#1e4646"
          id="upper-leaf-path"
        />
        
        {/* Grey/Silver Lower Leaf */}
        <path
          d="M50 86
             C 51 72, 60 55, 66 50
             C 65 58, 61 70, 73 86
             C 66 86, 58 86, 50 86 Z"
          fill="#93a39e"
          opacity="0.95"
          id="lower-leaf-path"
        />
      </svg>
    );
  }

  const currentLogoUrl = LOGO_CANDIDATES[candidateIndex];

  return (
    <img
      src={currentLogoUrl}
      alt="Logo"
      width={size}
      height={size}
      onError={handleImageError}
      className={`inline-block object-contain select-none ${className}`}
      id="rusd-pen-logo-img"
      style={{ maxWidth: '100%', height: 'auto', maxHeight: `${size}px` }}
    />
  );
}

