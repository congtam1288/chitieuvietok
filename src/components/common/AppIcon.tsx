import React from 'react';

export type AppIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number;

interface AppIconProps {
  size?: AppIconSize;
  className?: string;
  variant?: 'full' | 'symbol-only' | 'flat';
  withGlow?: boolean;
  rounded?: string;
}

const SIZE_MAP: Record<string, { container: string; px: number; rounded: string }> = {
  xs: { container: 'w-5 h-5', px: 20, rounded: 'rounded-md' },
  sm: { container: 'w-7 h-7', px: 28, rounded: 'rounded-lg' },
  md: { container: 'w-10 h-10', px: 40, rounded: 'rounded-2xl' },
  lg: { container: 'w-12 h-12', px: 48, rounded: 'rounded-2xl' },
  xl: { container: 'w-16 h-16', px: 64, rounded: 'rounded-3xl' },
  '2xl': { container: 'w-20 h-20', px: 80, rounded: 'rounded-3xl' },
  '3xl': { container: 'w-24 h-24', px: 96, rounded: 'rounded-3xl' }
};

export const AppIcon: React.FC<AppIconProps> = ({
  size = 'md',
  className = '',
  variant = 'full',
  withGlow = false,
  rounded
}) => {
  // Compute dimensions
  let containerSizeClass = '';
  let pixelSize = 40;
  let defaultRounded = 'rounded-2xl';

  if (typeof size === 'number') {
    pixelSize = size;
  } else if (SIZE_MAP[size]) {
    containerSizeClass = SIZE_MAP[size].container;
    pixelSize = SIZE_MAP[size].px;
    defaultRounded = SIZE_MAP[size].rounded;
  } else {
    containerSizeClass = 'w-10 h-10';
  }

  const roundedClass = rounded || defaultRounded;

  // Custom inline style if numeric size is provided
  const style: React.CSSProperties = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  if (variant === 'symbol-only') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${containerSizeClass} ${className}`}
        style={style}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="symCoinFace" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
            <linearGradient id="symCoinRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <g transform="translate(50, 50)">
            <circle cx="0" cy="0" r="46" fill="url(#symCoinRim)" />
            <circle cx="0" cy="0" r="41" fill="url(#symCoinFace)" />
            <circle
              cx="0"
              cy="0"
              r="37"
              fill="none"
              stroke="#FFF7ED"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.75}
            />
            <polygon
              points="0,-22 4,-10 16,-10 7,-4 10,8 0,1 -10,8 -7,-4 -16,-10 -4,-10"
              fill="#FFFBEB"
            />
            <text
              x="0"
              y="18"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={28}
              fontWeight={900}
              fill="#78350F"
            >
              ₫
            </text>
            <text
              x="-0.5"
              y="17.5"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={28}
              fontWeight={900}
              fill="#FFFBEB"
            >
              ₫
            </text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none ${containerSizeClass} ${roundedClass} ${
        withGlow ? 'shadow-[0_10px_25px_-5px_rgba(5,150,105,0.45)]' : 'shadow-md'
      } ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base gradient */}
          <linearGradient id={`bgGrad-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="45%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Gloss highlight */}
          <linearGradient id={`glossGrad-${pixelSize}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.32} />
            <stop offset="45%" stopColor="#ffffff" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          {/* Coin rim */}
          <linearGradient id={`coinRim-${pixelSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Coin face */}
          <radialGradient id={`coinFace-${pixelSize}`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FBBF24" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
        </defs>

        {/* Squircle Background */}
        <rect x="0" y="0" width="100" height="100" fill={`url(#bgGrad-${pixelSize})`} />

        {/* Inner Border (Ensures crisp padding, no overflow) */}
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="22"
          fill="none"
          stroke="#6EE7B7"
          strokeWidth={1.5}
          strokeOpacity={0.3}
        />

        {/* Top subtle highlight */}
        <path
          d="M 1 25 C 1 12, 12 1, 25 1 L 75 1 C 88 1, 99 12, 99 25 C 70 32, 30 32, 1 25 Z"
          fill={`url(#glossGrad-${pixelSize})`}
        />

        {/* Safe-zone content (20% padding margin so it never touches edge) */}
        <g transform="translate(50, 50)">
          {/* Subtle shield / piggy silhouette backdrop for depth */}
          <path
            d="M -26 3 C -26 -13, -12 -25, 0 -25 C 12 -25, 26 -13, 26 3 C 26 19, 12 28, 0 30 C -12 28, -26 19, -26 3 Z"
            fill="#022c22"
            opacity={0.4}
          />

          {/* Main 3D Gold Coin (Properly proportioned: 48% of container) */}
          <circle cx="0" cy="1" r="24" fill={`url(#coinRim-${pixelSize})`} />
          <circle cx="0" cy="1" r="21.5" fill={`url(#coinFace-${pixelSize})`} />

          {/* Coin Beveled Detail */}
          <circle
            cx="0"
            cy="1"
            r="19"
            fill="none"
            stroke="#FFF7ED"
            strokeWidth={0.8}
            strokeDasharray="2 1.5"
            opacity={0.75}
          />

          {/* Vietnamese Star (top of coin) */}
          <polygon
            points="0,-9 2.5,-3 8.5,-3 3.5,0.5 5.5,6.5 0,2.5 -5.5,6.5 -3.5,0.5 -8.5,-3 -2.5,-3"
            fill="#FFFBEB"
            opacity={0.95}
          />

          {/* Dong '₫' symbol (bottom of coin) */}
          <g transform="translate(0, 7)">
            <text
              x="0"
              y="6"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={14.5}
              fontWeight={900}
              fill="#78350F"
              opacity={0.9}
            >
              ₫
            </text>
            <text
              x="-0.3"
              y="5.7"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={14.5}
              fontWeight={900}
              fill="#FFFBEB"
            >
              ₫
            </text>
          </g>

          {/* Accent Sparkles (comfortably within safe zone) */}
          <path
            d="M 23 -16 Q 23 -13 26 -13 Q 23 -13 23 -10 Q 23 -13 20 -13 Q 23 -13 23 -16 Z"
            fill="#FEF3C7"
            opacity={0.9}
          />
          <path
            d="M -22 17 Q -22 19 -20 19 Q -22 19 -22 21 Q -22 19 -24 19 Q -22 19 -22 17 Z"
            fill="#FDE68A"
            opacity={0.85}
          />
        </g>
      </svg>
    </div>
  );
};
