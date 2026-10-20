import React, { useState } from 'react';
import { CFLogo } from './CFLogo';

interface TShirtMockupProps {
  frontDesign?: 'chest-logo' | 'center-logo' | 'blank' | 'phrase' | 'tribal';
  backDesign?: 'african-warrior' | 'tribal-lion' | 'angola-phrase' | 'snake' | 'minimal-crest' | 'dark-angel' | 'custom';
  customPhrase?: string;
  customFontStyle?: string;
  customPlacement?: string;
  color?: string; // 'black' | 'charcoal' | 'white'
  view?: 'front' | 'back';
  onToggleView?: () => void;
  interactive?: boolean;
  className?: string;
  sizeTag?: string;
  customGraphicUrl?: string;
}

export const TShirtMockup: React.FC<TShirtMockupProps> = ({
  frontDesign = 'chest-logo',
  backDesign = 'tribal-lion',
  customPhrase = '',
  customFontStyle = 'street',
  customPlacement = 'back',
  color = 'black',
  view: controlledView,
  onToggleView,
  interactive = true,
  className = '',
  sizeTag = 'L',
  customGraphicUrl,
}) => {
  const [internalView, setInternalView] = useState<'front' | 'back'>('front');
  const isBack = (controlledView !== undefined ? controlledView : internalView) === 'back';

  const handleToggle = () => {
    if (onToggleView) {
      onToggleView();
    } else {
      setInternalView((prev) => (prev === 'front' ? 'back' : 'front'));
    }
  };

  const bgTee =
    color === 'white'
      ? 'fill-[#f4f4f5]'
      : color === 'charcoal'
      ? 'fill-[#18181b]'
      : 'fill-[#09090b]';

  const strokeTee = color === 'white' ? '#d4d4d8' : '#27272a';
  const collarFill =
    color === 'white'
      ? 'fill-[#e4e4e7]'
      : color === 'charcoal'
      ? 'fill-[#121214]'
      : 'fill-[#040405]';

  return (
    <div className={`relative group select-none flex flex-col items-center justify-center ${className}`}>
      {/* T-Shirt SVG Canvas */}
      <div className="relative w-full aspect-square max-w-[520px] flex items-center justify-center p-2">
        <svg
          viewBox="0 0 500 520"
          className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] transition-all duration-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Studio Spotlight glow behind t-shirt */}
          <radialGradient id="teeLighting" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
          </radialGradient>
          <rect x="0" y="0" width="500" height="520" fill="url(#teeLighting)" opacity="0.4" />

          {/* T-Shirt Silhouette - Heavyweight Streetwear Boxy Oversized Cut */}
          <g id="tshirt-base">
            {/* Main Tee Body & Drop Shoulders */}
            <path
              d="M 175 62
                 C 205 78, 295 78, 325 62
                 L 415 105
                 L 470 178
                 L 405 220
                 L 380 180
                 L 380 475
                 C 380 488, 370 492, 355 492
                 L 145 492
                 C 130 492, 120 488, 120 475
                 L 120 180
                 L 95 220
                 L 30 178
                 L 85 105
                 Z"
              className={bgTee}
              stroke={strokeTee}
              strokeWidth="2.5"
            />

            {/* Inner Hem and Folds (Fabric texture & streetwear heavy drape) */}
            <path
              d="M 120 180 L 125 470"
              stroke="#000000"
              strokeWidth="3.5"
              strokeOpacity="0.6"
            />
            <path
              d="M 380 180 L 375 470"
              stroke="#000000"
              strokeWidth="3.5"
              strokeOpacity="0.6"
            />
            {/* Bottom Hem Bar */}
            <line
              x1="120"
              y1="475"
              x2="380"
              y2="475"
              stroke={strokeTee}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.4"
            />

            {/* Sleeve Hem Stitchings */}
            <line
              x1="35"
              y1="184"
              x2="100"
              y2="225"
              stroke={strokeTee}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.5"
            />
            <line
              x1="465"
              y1="184"
              x2="400"
              y2="225"
              stroke={strokeTee}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.5"
            />

            {/* Collar Ribbing (Thick 3cm Streetwear Rib Collar) */}
            {!isBack ? (
              // Front Collar Dip
              <g>
                <path
                  d="M 175 62
                     C 205 102, 295 102, 325 62
                     C 295 86, 205 86, 175 62
                     Z"
                  className={collarFill}
                  stroke={strokeTee}
                  strokeWidth="2"
                />
                {/* Woven inner label visible behind front neck */}
                <rect x="235" y="68" width="30" height="12" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
                <text x="250" y="77" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="Oswald">CF</text>
              </g>
            ) : (
              // Back High Collar
              <g>
                <path
                  d="M 175 62
                     C 205 74, 295 74, 325 62
                     C 295 68, 205 68, 175 62
                     Z"
                  className={collarFill}
                  stroke={strokeTee}
                  strokeWidth="2"
                />
                {/* External back neck minimal label or hanger loop */}
                <rect x="242" y="58" width="16" height="5" rx="1" fill="#27272a" />
              </g>
            )}
          </g>

          {/* FRONT DESIGNS */}
          {!isBack && (
            <g id="front-prints" className="transition-opacity duration-300">
              {frontDesign === 'chest-logo' && (
                <g transform="translate(305, 125) scale(0.48)">
                  <CFLogo size="lg" />
                </g>
              )}

              {frontDesign === 'center-logo' && (
                <g transform="translate(195, 170) scale(1.1)">
                  <CFLogo size="lg" showText glow />
                </g>
              )}

              {frontDesign === 'phrase' && (
                <g transform="translate(250, 230)" textAnchor="middle">
                  <text
                    x="0"
                    y="0"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="22"
                    letterSpacing="0.08em"
                    className="select-none"
                  >
                    VESTE A TUA
                  </text>
                  <text
                    x="0"
                    y="32"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="26"
                    letterSpacing="0.08em"
                    className="select-none"
                  >
                    IDENTIDADE.
                  </text>
                  <line x1="-50" y1="46" x2="50" y2="46" stroke="#ffffff" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="60"
                    fill="#a1a1aa"
                    fontFamily="Inter"
                    fontSize="9"
                    letterSpacing="0.25em"
                  >
                    CLASS FOCUS STREETWEAR
                  </text>
                </g>
              )}

              {frontDesign === 'tribal' && (
                <g transform="translate(250, 210)" textAnchor="middle">
                  <path
                    d="M 0 -60
                       C 25 -30, 45 -10, 40 20
                       C 35 45, 15 55, 0 75
                       C -15 55, -35 45, -40 20
                       C -45 -10, -25 -30, 0 -60
                       Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <CFLogo size="sm" />
                </g>
              )}

              {/* Custom Print if placed on FRONT */}
              {customPlacement !== 'back' && customPhrase && (
                <g transform="translate(250, 230)" textAnchor="middle">
                  <text
                    x="0"
                    y="0"
                    fill={color === 'white' ? '#000000' : '#ffffff'}
                    fontFamily={customFontStyle === 'street' ? 'Oswald' : customFontStyle === 'gothic' ? 'Cinzel' : 'Syne'}
                    fontStyle={customFontStyle === 'street' ? 'italic' : 'normal'}
                    fontWeight="700"
                    fontSize="21"
                    letterSpacing="0.05em"
                  >
                    {customPhrase.slice(0, 32)}
                  </text>
                  {customPhrase.length > 32 && (
                    <text
                      x="0"
                      y="26"
                      fill={color === 'white' ? '#000000' : '#ffffff'}
                      fontFamily={customFontStyle === 'street' ? 'Oswald' : customFontStyle === 'gothic' ? 'Cinzel' : 'Syne'}
                      fontWeight="700"
                      fontSize="19"
                    >
                      {customPhrase.slice(32, 64)}
                    </text>
                  )}
                </g>
              )}
            </g>
          )}

          {/* BACK DESIGNS */}
          {isBack && (
            <g id="back-prints" className="transition-opacity duration-300">
              {/* Back Graphic 1: GUERREIRA AFRICANA & LION COMPOSITION */}
              {backDesign === 'african-warrior' && (
                <g transform="translate(250, 275)" textAnchor="middle">
                  {/* Surrounding tribal aura frame */}
                  <path
                    d="M -110 -150 Q 0 -170 110 -150 L 120 120 Q 0 160 -120 120 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.75"
                    strokeDasharray="6 4"
                    opacity="0.3"
                  />

                  {/* Sacred Lion Artwork (Left Side) */}
                  <g transform="translate(-48, -25) scale(0.92)">
                    {/* Crown on lion */}
                    <path d="M -15 -85 L -7 -74 L 0 -88 L 7 -74 L 15 -85 L 12 -68 L -12 -68 Z" fill="#ffffff" />
                    {/* Lion Face / Tribal swirls */}
                    <path
                      d="M 0 -60
                         C 18 -60, 35 -45, 38 -20
                         C 40 5, 25 35, 0 65
                         C -25 35, -40 5, -38 -20
                         C -35 -45, -18 -60, 0 -60
                         Z"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.8"
                    />
                    {/* Lion Eyes, Nose, Mane */}
                    <path d="M -16 -18 Q -7 -22 0 -18 Q 7 -22 16 -18" stroke="#ffffff" strokeWidth="2.4" fill="none" />
                    <polygon points="-7,-4 7,-4 0,7" fill="#ffffff" />
                    <path d="M 0 7 L 0 16 M -12 18 Q 0 25 12 18" stroke="#ffffff" strokeWidth="2" fill="none" />
                    {/* Tribal Mane Flow */}
                    <path
                      d="M -35 -40 Q -65 -15 -45 15 Q -70 45 -20 65"
                      stroke="#ffffff"
                      strokeWidth="2.2"
                      fill="none"
                    />
                    <path
                      d="M 35 -40 Q 65 -15 45 15 Q 70 45 20 65"
                      stroke="#ffffff"
                      strokeWidth="2.2"
                      fill="none"
                    />
                    <path
                      d="M -25 -55 Q -50 -70 -25 -78 Q 0 -82 25 -78 Q 50 -70 25 -55"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      fill="none"
                    />
                  </g>

                  {/* African Warrior Queen (Right Side) */}
                  <g transform="translate(52, -25) scale(0.9)">
                    {/* Royal headpiece / Crown */}
                    <path d="M -12 -88 L -6 -80 L 0 -92 L 6 -80 L 12 -88 L 10 -72 L -10 -72 Z" fill="#ffffff" />
                    {/* Proud Head silhouette */}
                    <circle cx="0" cy="-60" r="14" fill="#ffffff" />
                    {/* Ceremonial tribal earrings */}
                    <circle cx="-16" cy="-56" r="4.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="16" cy="-56" r="4.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Layered Sacred Golden/White Neck Rings */}
                    <path d="M -13 -44 Q 0 -40 13 -44" stroke="#ffffff" strokeWidth="3" fill="none" />
                    <path d="M -15 -37 Q 0 -33 15 -37" stroke="#ffffff" strokeWidth="3" fill="none" />
                    <path d="M -17 -30 Q 0 -26 17 -30" stroke="#ffffff" strokeWidth="3" fill="none" />
                    {/* Warrior Torso & Spear */}
                    <path
                      d="M -19 -25
                         L -24 35
                         L -15 70
                         L 15 70
                         L 24 35
                         L 19 -25
                         Z"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {/* Ritual Body Paintings */}
                    <line x1="-12" y1="-10" x2="12" y2="-10" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="-14" y1="5" x2="14" y2="5" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="-12" y1="20" x2="12" y2="20" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="-9" y1="35" x2="9" y2="35" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                    {/* Warrior Spear */}
                    <line x1="28" y1="-85" x2="28" y2="85" stroke="#ffffff" strokeWidth="2.2" />
                    <polygon points="28,-95 24,-83 32,-83" fill="#ffffff" />
                  </g>

                  {/* Brand signature under graphic */}
                  <text
                    x="0"
                    y="135"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontSize="13"
                    letterSpacing="0.32em"
                    fontWeight="700"
                  >
                    GUERREIRA &bull; LEÃO
                  </text>
                  <text
                    x="0"
                    y="150"
                    fill="#a1a1aa"
                    fontFamily="Inter"
                    fontSize="8"
                    letterSpacing="0.25em"
                  >
                    CF EXCLUSIVE ART PIECE
                  </text>
                </g>
              )}

              {/* Back Graphic 2: LEÃO TRIBAL (Symmetric) */}
              {backDesign === 'tribal-lion' && (
                <g transform="translate(250, 270)" textAnchor="middle">
                  {/* Outer Gothic Shield Contour */}
                  <path
                    d="M 0 -150
                       C 80 -150, 110 -80, 105 10
                       C 100 85, 45 135, 0 165
                       C -45 135, -100 85, -105 10
                       C -110 -80, -80 -150, 0 -150
                       Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    opacity="0.4"
                  />

                  {/* Intricate Tribal Lion Head */}
                  <g scale="1.15">
                    {/* Crown crest */}
                    <path d="M -20 -130 L -9 -115 L 0 -135 L 9 -115 L 20 -130 L 16 -105 L -16 -105 Z" fill="#ffffff" />
                    {/* Eyes & Brow */}
                    <path d="M -30 -40 Q -15 -48 0 -40 Q 15 -48 30 -40" stroke="#ffffff" strokeWidth="3.5" fill="none" />
                    <polygon points="-22,-36 -12,-36 -17,-28" fill="#ffffff" />
                    <polygon points="22,-36 12,-36 17,-28" fill="#ffffff" />
                    {/* Nose & Whiskers */}
                    <polygon points="-10,-10 10,-10 0,6" fill="#ffffff" />
                    <path d="M 0 6 L 0 20 M -18 24 Q 0 32 18 24" stroke="#ffffff" strokeWidth="2.8" fill="none" />
                    {/* Multi-layered tribal flame mane */}
                    <path
                      d="M -45 -90 C -90 -50, -75 20, -50 60 C -70 95, -30 115, 0 145 C 30 115, 70 95, 50 60 C 75 20, 90 -50, 45 -90"
                      stroke="#ffffff"
                      strokeWidth="2.8"
                      fill="none"
                    />
                    <path
                      d="M -30 -75 Q -55 -25, -25 35 Q -40 70, 0 105 Q 40 70, 25 35 Q 55 -25, 30 -75"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M -15 -60 Q -30 -10, -10 25 M 15 -60 Q 30 -10, 10 25"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      fill="none"
                    />
                  </g>

                  <text
                    x="0"
                    y="155"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontSize="11"
                    letterSpacing="0.25em"
                    fontWeight="700"
                  >
                    TRIBAL ROYALTY
                  </text>
                </g>
              )}

              {/* Back Graphic 3: FRASE ANGOLA (The exact poem from mockup) */}
              {backDesign === 'angola-phrase' && (
                <g transform="translate(250, 255)" textAnchor="middle">
                  <rect x="-120" y="-135" width="240" height="260" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 4" />
                  
                  <text
                    x="0"
                    y="-85"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="16"
                    letterSpacing="0.08em"
                  >
                    VOU FALAR DESTA
                  </text>
                  <text
                    x="0"
                    y="-55"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="17"
                    letterSpacing="0.08em"
                  >
                    TERRA DE GLÓRIAS
                  </text>
                  <text
                    x="0"
                    y="-25"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="16"
                    letterSpacing="0.08em"
                  >
                    NOSSA ANGOLA DE
                  </text>
                  <text
                    x="0"
                    y="5"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="15"
                    letterSpacing="0.08em"
                  >
                    MUITAS MEMÓRIAS
                  </text>
                  <text
                    x="0"
                    y="35"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="16"
                    letterSpacing="0.08em"
                  >
                    VOU FALAR DE UM
                  </text>
                  <text
                    x="0"
                    y="65"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="15"
                    letterSpacing="0.08em"
                  >
                    POVO QUE QUIS
                  </text>
                  <text
                    x="0"
                    y="95"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="15"
                    letterSpacing="0.08em"
                  >
                    FINALMENTE AGORA
                  </text>
                  <text
                    x="0"
                    y="130"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="800"
                    fontSize="24"
                    letterSpacing="0.14em"
                  >
                    FELIZ
                  </text>

                  <line x1="-35" y1="145" x2="35" y2="145" stroke="#ffffff" strokeWidth="2" />
                </g>
              )}

              {/* Back Graphic 4: SERPENTE (Gothic snake artwork) */}
              {backDesign === 'snake' && (
                <g transform="translate(250, 270)" textAnchor="middle">
                  {/* Coiled Serpent Spine */}
                  <path
                    d="M 0 -130
                       C 40 -120, 45 -80, 0 -60
                       C -45 -40, -40 0, 0 20
                       C 40 40, 45 80, 0 100
                       C -30 115, -20 140, 0 150
                       C 20 160, 15 175, 0 175"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Inner spine line */}
                  <path
                    d="M 0 -130
                       C 40 -120, 45 -80, 0 -60
                       C -45 -40, -40 0, 0 20
                       C 40 40, 45 80, 0 100
                       C -30 115, -20 140, 0 150"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                  />
                  {/* Snake Head with fangs and crown */}
                  <g transform="translate(0, -145)">
                    <polygon points="0,-15 -14,10 14,10" fill="#ffffff" />
                    <circle cx="-5" cy="0" r="2" fill="#000000" />
                    <circle cx="5" cy="0" r="2" fill="#000000" />
                    <path d="M 0 10 L 0 22 M -4 26 L 0 22 L 4 26" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                  </g>
                  {/* Gothic cross accents */}
                  <g transform="translate(0, 30)" opacity="0.6">
                    <line x1="-60" y1="0" x2="60" y2="0" stroke="#ffffff" strokeWidth="1.2" />
                    <line x1="0" y1="-80" x2="0" y2="80" stroke="#ffffff" strokeWidth="1.2" />
                  </g>
                </g>
              )}

              {/* Back Graphic 5: MINIMAL CREST / GIANT CF MONOGRAM */}
              {backDesign === 'minimal-crest' && (
                <g transform="translate(250, 240)">
                  <g transform="translate(-50, -60) scale(1.6)">
                    <CFLogo size="lg" glow />
                  </g>
                  <text
                    x="0"
                    y="130"
                    fill="#ffffff"
                    fontFamily="Oswald"
                    fontStyle="italic"
                    fontWeight="700"
                    fontSize="22"
                    letterSpacing="0.2em"
                    textAnchor="middle"
                  >
                    CLASS FOCUS
                  </text>
                  <text
                    x="0"
                    y="150"
                    fill="#a1a1aa"
                    fontFamily="Inter"
                    fontSize="10"
                    letterSpacing="0.3em"
                    textAnchor="middle"
                  >
                    LUANDA &bull; STREETWEAR DE AUTOR
                  </text>
                </g>
              )}

              {/* Back Graphic 6: CUSTOM USER DESIGN */}
              {backDesign === 'custom' && (
                <g transform="translate(250, 260)" textAnchor="middle">
                  {customGraphicUrl ? (
                    <image
                      href={customGraphicUrl}
                      x="-90"
                      y="-110"
                      width="180"
                      height="180"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ) : (
                    <>
                      {/* Decorative Frame */}
                      <rect x="-110" y="-120" width="220" height="240" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5 5" opacity="0.4" />
                      <g transform="translate(0, -70)">
                        <CFLogo size="sm" />
                      </g>
                      <text
                        x="0"
                        y="-10"
                        fill={color === 'white' ? '#000000' : '#ffffff'}
                        fontFamily={customFontStyle === 'street' ? 'Oswald' : customFontStyle === 'gothic' ? 'Cinzel' : 'Syne'}
                        fontStyle={customFontStyle === 'street' ? 'italic' : 'normal'}
                        fontWeight="700"
                        fontSize="20"
                        letterSpacing="0.05em"
                      >
                        {customPhrase ? customPhrase.slice(0, 28) : 'A TUA FRASE AQUI'}
                      </text>
                      {customPhrase && customPhrase.length > 28 && (
                        <text
                          x="0"
                          y="18"
                          fill={color === 'white' ? '#000000' : '#ffffff'}
                          fontFamily={customFontStyle === 'street' ? 'Oswald' : customFontStyle === 'gothic' ? 'Cinzel' : 'Syne'}
                          fontWeight="700"
                          fontSize="18"
                        >
                          {customPhrase.slice(28, 56)}
                        </text>
                      )}
                      <line x1="-40" y1="45" x2="40" y2="45" stroke="#ffffff" strokeWidth="1.5" />
                      <text
                        x="0"
                        y="65"
                        fill="#a1a1aa"
                        fontFamily="Inter"
                        fontSize="10"
                        letterSpacing="0.25em"
                      >
                        DESIGN EXCLUSIVO PERSONALIZADO
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          )}

          {/* Size & Spec Tab Tag at the bottom left */}
          <g transform="translate(135, 455)">
            <rect x="0" y="0" width="36" height="18" fill="#18181b" rx="2" stroke="#3f3f46" strokeWidth="0.8" />
            <text x="18" y="12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="Oswald">
              {sizeTag}
            </text>
          </g>
        </svg>

        {/* View Switcher Floating Badge (Front / Back) */}
        {interactive && (
          <button
            type="button"
            onClick={handleToggle}
            className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/20 hover:border-white text-[11px] font-mono tracking-widest uppercase text-white rounded transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-lg z-10"
            title="Alternar entre Frente e Costas"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{isBack ? 'VER FRENTE' : 'VER COSTAS'}</span>
          </button>
        )}
      </div>

      {/* Under-mockup label indicator */}
      <div className="flex items-center gap-2 text-[11px] tracking-widest text-zinc-400 uppercase font-mono mt-1">
        <span>{isBack ? 'VISTA TRASEIRA (ESTAMPA PRINCIPAL)' : 'VISTA FRONTAL (DROP OVERSIZED)'}</span>
      </div>
    </div>
  );
};
