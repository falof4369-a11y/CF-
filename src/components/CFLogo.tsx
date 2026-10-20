import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface CFLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  glow?: boolean;
  color?: 'white' | 'black' | 'auto';
}

export const CFLogo: React.FC<CFLogoProps> = ({
  className = '',
  showText = false,
  size = 'md',
  glow = false,
  color = 'auto',
}) => {
  let isWhiteMode = false;
  try {
    const themeContext = useTheme();
    isWhiteMode = themeContext.isWhite;
  } catch {
    // If used outside ThemeProvider
    isWhiteMode = false;
  }

  const effectiveColor = color === 'auto' ? (isWhiteMode ? 'black' : 'white') : color;
  const isLight = effectiveColor === 'black';

  // Dimensions helper
  const sizeMap = {
    sm: { width: 36, height: 42 },
    md: { width: 50, height: 58 },
    lg: { width: 72, height: 84 },
    xl: { width: 110, height: 128 },
    hero: { width: 160, height: 186 },
  };

  const { width, height } = sizeMap[size];

  // Palette colors based on active theme
  const primaryFill = isLight ? '#000000' : '#ffffff';
  const cutoutFill = isLight ? '#ffffff' : '#000000';
  const glowClass = glow
    ? isLight
      ? 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
      : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]'
    : '';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${glowClass}`}
        aria-label="CF Crown Crest Logo"
      >
        {/* Five-point royal streetwear crown with pearls & jewel band */}
        <g className="cf-crown">
          {/* Crown Pearls/Jewels on the 5 tips */}
          <circle cx="15" cy="18" r="3" fill={primaryFill} />
          <circle cx="31" cy="11" r="3.2" fill={primaryFill} />
          <circle cx="50" cy="5" r="4" fill={primaryFill} />
          <circle cx="69" cy="11" r="3.2" fill={primaryFill} />
          <circle cx="85" cy="18" r="3" fill={primaryFill} />

          {/* Crown peaks and body */}
          <path
            d="M 15 23
               L 25 35
               L 31 16
               L 41 33
               L 50 11
               L 59 33
               L 69 16
               L 75 35
               L 85 23
               L 80 43
               L 20 43
               Z"
            fill={primaryFill}
          />

          {/* Crown base arch band */}
          <path
            d="M 17 44.5
               Q 50 48.5 83 44.5
               L 82 48.5
               Q 50 52.5 18 48.5
               Z"
            fill={primaryFill}
          />

          {/* Crown band jewel cutouts */}
          <circle cx="34" cy="46" r="1.3" fill={cutoutFill} />
          <circle cx="50" cy="47.5" r="1.8" fill={cutoutFill} />
          <circle cx="66" cy="46" r="1.3" fill={cutoutFill} />
        </g>

        {/* Heraldic / Gothic Shield Cut "CF" Monogram */}
        <g className="cf-monogram" fill={primaryFill}>
          {/* Distinctive C letter with gothic angles & serif cuts */}
          <path
            d="M 45 57
               L 26 57
               L 21 63
               L 21 95
               L 26 101
               L 45 101
               L 45 92
               L 32 92
               L 29 89
               L 29 69
               L 32 66
               L 45 66
               Z"
          />
          {/* Inner serif accent on C */}
          <polygon points="45,57 40,61 45,65" fill={primaryFill} />
          <polygon points="45,93 40,97 45,101" fill={primaryFill} />

          {/* Distinctive F letter nested boldly alongside C */}
          <path
            d="M 47 57
               L 78 57
               L 78 66
               L 57 66
               L 57 76
               L 73 76
               L 73 84
               L 57 84
               L 57 101
               L 47 101
               Z"
          />
          {/* Sharp gothic serifs on F top & bar */}
          <polygon points="78,57 73,61 78,65" fill={primaryFill} />
          <polygon points="73,76 68,80 73,84" fill={primaryFill} />

          {/* Bottom shield crest anchor point / subtle taper */}
          <polygon points="48,103 52,103 50,111" fill={primaryFill} opacity="0.9" />
        </g>
      </svg>

      {showText && (
        <span
          className={`font-street tracking-[0.28em] text-[11px] uppercase font-bold mt-1.5 opacity-90 transition-colors ${
            isLight ? 'text-black' : 'text-white'
          }`}
        >
          CLASS FOCUS
        </span>
      )}
    </div>
  );
};
