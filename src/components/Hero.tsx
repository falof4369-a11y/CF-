import React, { useState } from 'react';
import { ArrowDown, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
  onExploreCollection: () => void;
  onOpenCustomize: () => void;
  onSelectProduct: (product: any) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreCollection,
  onOpenCustomize,
  onSelectProduct,
}) => {
  const { isWhite } = useTheme();

  // Showcase using real models from PRODUCTS
  const heroProducts = [
    PRODUCTS[0], // Guerreira Tribal
    PRODUCTS[1], // Leão, Guerreira & Poema
    PRODUCTS[4], // Emblema Tribal Ancestral (New model!)
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const currentHeroProduct = heroProducts[currentIndex] || PRODUCTS[0];

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroProducts.length);
      setIsFading(false);
    }, 180);
  };

  const handlePrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
      setIsFading(false);
    }, 180);
  };

  // Subtle Parallax Tilt on Showcase Image (disabled if prefers-reduced-motion)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: -y * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section
      id="inicio"
      className={`relative min-h-screen pt-24 pb-16 flex flex-col justify-center overflow-hidden select-none transition-colors duration-300 ${
        isWhite ? 'bg-white text-black' : 'bg-black text-white'
      }`}
    >
      {/* Studio atmospheric lighting glow */}
      <div
        className={`absolute top-1/4 right-1/4 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none transition-opacity ${
          isWhite ? 'bg-zinc-200/50' : 'bg-white/[0.035]'
        }`}
      />
      <div
        className={`absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none transition-opacity ${
          isWhite ? 'bg-zinc-100/60' : 'bg-white/[0.02]'
        }`}
      />

      {/* Grid line pattern */}
      <div
        className={`absolute inset-0 bg-[size:4rem_4rem] pointer-events-none transition-opacity ${
          isWhite
            ? 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Statement & Typography */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8">
            {/* Breadcrumb Tagline */}
            <div
              className={`flex items-center gap-2 text-xs font-mono tracking-[0.35em] uppercase ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              <span className={`font-bold ${isWhite ? 'text-black' : 'text-white'}`}>CF</span>
              <span>/</span>
              <span>IDENTIDADE...</span>
            </div>

            {/* Main Monumental Streetwear Headline */}
            <div className="space-y-1">
              <h1
                className={`font-street text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-black italic tracking-tighter uppercase leading-[0.92] transition-colors ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                VESTE A TUA
                <br />
                <span className="relative inline-block">
                  IDENTIDADE.
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className={`text-sm sm:text-base md:text-lg font-normal tracking-wide max-w-xl leading-relaxed transition-colors ${
                isWhite ? 'text-zinc-700' : 'text-zinc-300'
              }`}
            >
              Não é apenas uma t-shirt. É uma forma de expressão. Peças de corte oversized com estampas exclusivas, arte ancestral e acabamentos premium.
            </p>

            {/* Action Buttons with Micro-animations */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreCollection}
                className={`px-8 py-4 font-street text-sm tracking-[0.22em] font-bold uppercase transition-all duration-300 active:scale-95 text-center cursor-pointer cf-btn-micro ${
                  isWhite
                    ? 'bg-black text-white hover:bg-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                }`}
              >
                EXPLORAR COLEÇÃO
              </button>

              <button
                type="button"
                onClick={onOpenCustomize}
                className={`px-8 py-4 bg-transparent font-street text-sm tracking-[0.22em] font-bold uppercase transition-all duration-300 active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2 cf-btn-micro ${
                  isWhite
                    ? 'border border-black/40 text-black hover:border-black hover:bg-black/5'
                    : 'border border-white/50 text-white hover:border-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>ENCOMENDAR PERSONALIZADA</span>
              </button>
            </div>

            {/* Secondary manifesto tagline */}
            <div
              className={`pt-6 border-t flex items-start gap-3 ${
                isWhite ? 'border-zinc-200' : 'border-zinc-900'
              }`}
            >
              <div className={`w-8 h-[2px] mt-2.5 shrink-0 ${isWhite ? 'bg-black' : 'bg-white'}`} />
              <div>
                <p
                  className={`font-street text-sm font-bold tracking-[0.2em] uppercase ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  MAIS QUE ROUPA
                </p>
                <p
                  className={`text-xs font-mono tracking-widest uppercase ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  É A TUA HISTÓRIA.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[560px] flex flex-col items-center">
              {/* Product Badge */}
              <div className="absolute top-2 left-4 z-20 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase rounded ${
                    isWhite
                      ? 'bg-black/85 text-white border border-black'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {currentHeroProduct.badge || 'DROP 01'}
                </span>
                <span
                  className={`px-2.5 py-1 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase rounded ${
                    isWhite
                      ? 'bg-zinc-200 text-zinc-800 border border-zinc-300'
                      : 'bg-black/80 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  HEAVYWEIGHT 240G
                </span>
              </div>

              {/* Slider indicator on top right */}
              <div
                className={`absolute top-2 right-4 z-20 flex items-center gap-3 backdrop-blur-sm px-3 py-1 rounded border ${
                  isWhite
                    ? 'bg-white/90 border-zinc-300 text-black shadow-sm'
                    : 'bg-black/70 border-zinc-800 text-white'
                }`}
              >
                <span className="text-xs font-mono tracking-widest font-bold">
                  0{currentIndex + 1}
                </span>
                <span className={`text-xs font-mono ${isWhite ? 'text-zinc-400' : 'text-zinc-500'}`}>/</span>
                <span className={`text-xs font-mono tracking-widest ${isWhite ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  0{heroProducts.length}
                </span>

                <div
                  className={`flex items-center gap-1 ml-2 border-l pl-2 ${
                    isWhite ? 'border-zinc-300' : 'border-zinc-800'
                  }`}
                >
                  <button
                    onClick={handlePrev}
                    aria-label="Peça anterior"
                    className={`p-1.5 rounded transition-all cf-btn-micro cursor-pointer ${
                      isWhite ? 'text-zinc-600 hover:text-black hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Próxima peça"
                    className={`p-1.5 rounded transition-all cf-btn-micro cursor-pointer ${
                      isWhite ? 'text-zinc-600 hover:text-black hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Showcase Real T-shirt Photograph with Subtle Parallax Tilt & Fluid Transition */}
              <div
                className="w-full flex items-center justify-center relative p-3 [perspective:1000px]"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  style={{
                    transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                    transition: 'transform 0.25s ease-out',
                  }}
                  className={`w-full max-w-[480px] aspect-[4/3] cursor-pointer flex items-center justify-center overflow-hidden rounded-lg transition-all duration-300 group relative cf-card-hover ${
                    isWhite
                      ? 'bg-zinc-100 border border-zinc-200 shadow-xl'
                      : 'bg-zinc-950/60 border border-zinc-800 shadow-2xl'
                  }`}
                  onClick={() => onSelectProduct(currentHeroProduct)}
                  title="Clica para ver detalhes completos da peça"
                >
                  <img
                    src={currentHeroProduct.image}
                    alt={currentHeroProduct.name}
                    className={`w-full h-full object-contain transition-all duration-300 ease-out group-hover:scale-105 ${
                      isFading ? 'opacity-20 scale-95' : 'opacity-100 scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/10 pointer-events-none" />
                </div>
              </div>

              {/* Studio Texture Base */}
              <div
                className={`w-full h-8 -mt-6 relative z-10 flex items-center justify-between px-4 border-b transition-colors ${
                  isWhite
                    ? 'bg-gradient-to-t from-white via-zinc-100 to-transparent border-zinc-200 text-zinc-700'
                    : 'bg-gradient-to-t from-black via-zinc-900/60 to-transparent border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  {currentHeroProduct.name} &bull; ESTAMPA DE AUTOR
                </span>
                <button
                  type="button"
                  onClick={() => onSelectProduct(currentHeroProduct)}
                  className={`text-[10px] font-mono tracking-widest uppercase flex items-center gap-1 hover:underline ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  VER DETALHES &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="flex justify-center mt-10">
          <a
            href="#colecao"
            className={`flex flex-col items-center gap-1.5 transition-colors group ${
              isWhite ? 'text-zinc-600 hover:text-black' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase">ROLA PARA EXPLORAR</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
