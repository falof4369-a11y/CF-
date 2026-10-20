import React, { useState } from 'react';
import { ArrowDown, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { TShirtMockup } from './TShirtMockup';
import { PRODUCTS } from '../data/products';

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
  // Showcase index (0: Guerreira Africana, 1: Leão Tribal, 2: Logótipo CF)
  const heroProducts = [
    PRODUCTS[1], // Guerreira Africana
    PRODUCTS[2], // Leão Tribal
    PRODUCTS[0], // Logotipo CF
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentHeroProduct = heroProducts[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroProducts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen pt-24 pb-16 flex flex-col justify-center bg-black overflow-hidden select-none"
    >
      {/* Background Studio & Rock lighting atmospheric glow */}
      <div className="absolute top-1/4 right-1/4 w-[650px] h-[650px] bg-white/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Grid line pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Statement & Typography */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8">
            {/* Breadcrumb Tagline */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.35em] text-zinc-400 uppercase">
              <span className="text-white font-bold">CF</span>
              <span>/</span>
              <span>IDENTIDADE...</span>
            </div>

            {/* Main Monumental Streetwear Headline */}
            <div className="space-y-1">
              <h1 className="font-street text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-black italic tracking-tighter text-white uppercase leading-[0.92]">
                VESTE A TUA
                <br />
                <span className="relative inline-block text-white">
                  IDENTIDADE.
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-normal tracking-wide max-w-xl leading-relaxed">
              Não é apenas uma t-shirt. É uma forma de expressão. Peças de corte oversized com estampas exclusivas, arte ancestral e acabamentos premium.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreCollection}
                className="px-8 py-4 bg-white text-black font-street text-sm tracking-[0.22em] font-bold uppercase transition-all duration-300 hover:bg-zinc-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 text-center cursor-pointer"
              >
                EXPLORAR COLEÇÃO
              </button>

              <button
                type="button"
                onClick={onOpenCustomize}
                className="px-8 py-4 bg-transparent border border-white/50 text-white font-street text-sm tracking-[0.22em] font-bold uppercase transition-all duration-300 hover:border-white hover:bg-white/10 active:scale-95 text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>CRIAR A MINHA T-SHIRT</span>
              </button>
            </div>

            {/* Secondary manifesto tagline */}
            <div className="pt-6 border-t border-zinc-900 flex items-start gap-3">
              <div className="w-8 h-[2px] bg-white mt-2.5 shrink-0" />
              <div>
                <p className="font-street text-sm font-bold tracking-[0.2em] uppercase text-white">
                  MAIS QUE ROUPA
                </p>
                <p className="text-xs font-mono tracking-widest uppercase text-zinc-400">
                  É A TUA HISTÓRIA.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* Rock Studio Pedestal graphic representation */}
            <div className="relative w-full max-w-[560px] flex flex-col items-center">
              {/* Product Badge */}
              <div className="absolute top-2 left-4 z-20 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest uppercase text-white rounded">
                  {currentHeroProduct.badge || 'DROP 01'}
                </span>
                <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono tracking-widest uppercase text-zinc-300 rounded">
                  HEAVYWEIGHT 240G
                </span>
              </div>

              {/* Slider indicator on top right */}
              <div className="absolute top-2 right-4 z-20 flex items-center gap-3 bg-black/70 backdrop-blur-sm border border-zinc-800 px-3 py-1 rounded">
                <span className="text-xs font-mono tracking-widest text-white font-bold">
                  0{currentIndex + 1}
                </span>
                <span className="text-xs font-mono text-zinc-500">/</span>
                <span className="text-xs font-mono tracking-widest text-zinc-400">
                  0{heroProducts.length}
                </span>

                <div className="flex items-center gap-1 ml-2 border-l border-zinc-800 pl-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Peça anterior"
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Próxima peça"
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Showcase Dual Presentation (Front & Back side by side or large interactive flip) */}
              <div className="w-full flex items-center justify-center relative">
                {/* Embedded Hero Mockup with back artwork */}
                <div
                  className="w-full cursor-pointer"
                  onClick={() => onSelectProduct(currentHeroProduct)}
                  title="Clica para ver detalhes completos da peça"
                >
                  <TShirtMockup
                    frontDesign={currentHeroProduct.frontDesign}
                    backDesign={currentHeroProduct.backDesign}
                    color="black"
                    view="back"
                    interactive={true}
                    sizeTag="L"
                  />
                </div>
              </div>

              {/* Rock Texture Base Simulation */}
              <div className="w-full h-8 bg-gradient-to-t from-black via-zinc-900/60 to-transparent -mt-6 border-b border-zinc-800 relative z-10 flex items-center justify-between px-4">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  {currentHeroProduct.name} &bull; ESTAMPA DE AUTOR
                </span>
                <button
                  type="button"
                  onClick={() => onSelectProduct(currentHeroProduct)}
                  className="text-[10px] font-mono tracking-widest text-white hover:underline uppercase flex items-center gap-1"
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
            className="flex flex-col items-center gap-1.5 text-zinc-300 hover:text-white transition-colors group"
          >
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase">ROLA PARA EXPLORAR</span>
            <ArrowDown className="w-4 h-4 animate-bounce group-hover:text-white" />
          </a>
        </div>
      </div>
    </section>
  );
};
