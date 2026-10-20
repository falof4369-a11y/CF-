import React from 'react';

interface CFLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  glow?: boolean;
}

export const CFLogo: React.FC<CFLogoProps> = ({
  className = '',
  showText = false,
  size = 'md',
  glow = false,
}) => {
  // Dimensions helper
  const sizeMap = {
    sm: { width: 36, height: 42 },
    md: { width: 50, height: 58 },
    lg: { width: 72, height: 84 },
    xl: { width: 110, height: 128 },
    hero: { width: 160, height: 186 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 ${glow ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]' : ''}`}
        aria-label="CF Crown Crest Logo"
      >
        {/* Five-point royal streetwear crown with pearls & jewel band */}
        <g className="cf-crown" fill="currentColor">
          {/* Crown Pearls/Jewels on the 5 tips */}
          <circle cx="15" cy="18" r="3" fill="#ffffff" />
          <circle cx="31" cy="11" r="3.2" fill="#ffffff" />
          <circle cx="50" cy="5" r="4" fill="#ffffff" />
          <circle cx="69" cy="11" r="3.2" fill="#ffffff" />
          <circle cx="85" cy="18" r="3" fill="#ffffff" />

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
            fill="#ffffff"
          />

          {/* Crown base arch band */}
          <path
            d="M 17 44.5
               Q 50 48.5 83 44.5
               L 82 48.5
               Q 50 52.5 18 48.5
               Z"
            fill="#ffffff"
          />

          {/* Crown band jewel cutouts */}
          <circle cx="34" cy="46" r="1.3" fill="#000000" />
          <circle cx="50" cy="47.5" r="1.8" fill="#000000" />
          <circle cx="66" cy="46" r="1.3" fill="#000000" />
        </g>

        {/* Heraldic / Gothic Shield Cut "CF" Monogram */}
        <g className="cf-monogram" fill="#ffffff">
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
          <polygon points="45,57 40,61 45,65" fill="#ffffff" />
          <polygon points="45,93 40,97 45,101" fill="#ffffff" />

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
          <polygon points="78,57 73,61 78,65" fill="#ffffff" />
          <polygon points="73,76 68,80 73,84" fill="#ffffff" />

          {/* Bottom shield crest anchor point / subtle taper */}
          <polygon points="48,103 52,103 50,111" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>

      {showText && (
        <span className="font-street tracking-[0.28em] text-[11px] uppercase font-bold text-white mt-1.5 opacity-90">
          CLASS FOCUS
        </span>
      )}
    </div>
  );
};
