import React from "react";

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  className = "size-5",
  size,
}) => {
  const customStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`shrink-0 inline-block align-middle select-none ${className}`}
      style={customStyle}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Circle Gradient: Blue -> Green -> Yellow */}
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0070c0" />   {/* Diplomatic Blue */}
          <stop offset="50%" stopColor="#16a34a" />  {/* Strategic Green */}
          <stop offset="100%" stopColor="#eab308" /> {/* Laurel Gold/Yellow */}
        </linearGradient>
        {/* Subtle premium shadow */}
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="2" floodColor="#0d2c6c" floodOpacity="0.2" />
        </filter>
      </defs>

      <g filter="url(#badgeShadow)">
        {/* Circle with Gradient and clean white outline */}
        <circle cx="50" cy="50" r="42" fill="url(#badgeGrad)" stroke="#ffffff" strokeWidth="4.5" />
        
        {/* Professional Checkmark */}
        <path
          d="M 34 52 L 46 64 L 66 38"
          stroke="#ffffff"
          strokeWidth="9.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0px 1.5px 1.5px rgba(5, 21, 48, 0.35))"
        />
      </g>
    </svg>
  );
};
