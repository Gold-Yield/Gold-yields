import React from 'react';
import waveLogoImg from '../assets/images/wave_logo_penguin_1785265308834.jpg';

interface WaveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function WaveLogo({ className = '', size = 'md' }: WaveLogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 rounded-md',
    md: 'w-7 h-7 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-12 h-12 rounded-2xl',
  };

  return (
    <div className={`relative overflow-hidden bg-[#1dc3f5] flex items-center justify-center shrink-0 border border-sky-400/40 shadow-sm ${sizeClasses[size]} ${className}`}>
      <img
        src={waveLogoImg}
        alt="Wave Côte d'Ivoire"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback SVG penguin if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
