import React from 'react';
import { CFLogo } from './CFLogo';
import { useTheme } from '../context/ThemeContext';
import { useInView } from '../context/useInView';
import { ShieldCheck, Flame, Crown, Palette } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { isWhite } = useTheme();
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLDivElement>();

  return (
    <section
      id="sobre-nos"
      className={`py-24 relative overflow-hidden transition-colors duration-300 ${
        isWhite ? 'bg-zinc-100 text-black' : 'bg-black text-white'
      }`}
    >
      {/* Giant subtle watermark CF crown in background */}
      <div
        className={`absolute -bottom-16 -right-16 pointer-events-none select-none transition-opacity ${
          isWhite ? 'opacity-[0.035]' : 'opacity-[0.06]'
        }`}
      >
        <CFLogo size="hero" color={isWhite ? 'black' : 'white'} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-6 h-[1.5px] ${isWhite ? 'bg-black' : 'bg-white'}`} />
          <span
            className={`text-xs font-mono tracking-[0.3em] uppercase ${
              isWhite ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            SOBRE NÓS
          </span>
        </div>

        {/* Section Headline with Scroll Reveal */}
        <div
          ref={headerRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 ${
            headerInView ? 'cf-title-enter' : 'opacity-0'
          }`}
        >
          <div className="lg:col-span-7">
            <h2
              className={`font-street text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight uppercase leading-[1.05] ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              CRIATIVIDADE.
              <br />
              IDENTIDADE.
              <br />
              ORIGINALIDADE.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-4 pt-2">
            <p
              className={`text-sm sm:text-base font-normal leading-relaxed ${
                isWhite ? 'text-zinc-700' : 'text-zinc-300'
              }`}
            >
              A <strong className={`font-semibold ${isWhite ? 'text-black' : 'text-white'}`}>CF (Class Focus)</strong> nasceu para quem não tem medo de mostrar quem é. Criamos peças que unem arte, atitude e identidade, transformando cada t-shirt numa forma de expressão.
            </p>
            <p
              className={`text-xs sm:text-sm leading-relaxed font-mono ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Com raízes fortes na cultura urbana de Luanda e um olhar atento às tendências do streetwear de luxo internacional, cada peça é tratada como uma obra de arte vestível.
            </p>
          </div>
        </div>

        {/* Brand Pillars Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t ${
            isWhite ? 'border-zinc-200' : 'border-zinc-900'
          }`}
        >
          {/* Pillar 1 */}
          <div
            className={`p-6 border rounded-lg transition-all flex flex-col justify-between ${
              isWhite
                ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
                : 'bg-zinc-950/70 border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 border flex items-center justify-center mb-4 rounded ${
                  isWhite
                    ? 'border-zinc-300 bg-zinc-100 text-black'
                    : 'border-white/20 bg-black text-white'
                }`}
              >
                <Crown className="w-5 h-5" />
              </div>
              <h3
                className={`font-street text-lg font-bold tracking-wider uppercase mb-2 ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                CORTE OVERSIZED
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                Caimento amplo, gola grossa canelada de 3cm e ombros descaídos que garantem uma presença estética marcante.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono tracking-widest uppercase mt-4 block ${
                isWhite ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              ESTRUTURA DE PESO
            </span>
          </div>

          {/* Pillar 2 */}
          <div
            className={`p-6 border rounded-lg transition-all flex flex-col justify-between ${
              isWhite
                ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
                : 'bg-zinc-950/70 border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 border flex items-center justify-center mb-4 rounded ${
                  isWhite
                    ? 'border-zinc-300 bg-zinc-100 text-black'
                    : 'border-white/20 bg-black text-white'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3
                className={`font-street text-lg font-bold tracking-wider uppercase mb-2 ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                HEAVYWEIGHT 240G
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                100% Algodão Premium Penteado de gramagem alta, com toque aveludado e durabilidade extrema que não encolhe.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono tracking-widest uppercase mt-4 block ${
                isWhite ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              DURABILIDADE MÁXIMA
            </span>
          </div>

          {/* Pillar 3 */}
          <div
            className={`p-6 border rounded-lg transition-all flex flex-col justify-between ${
              isWhite
                ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
                : 'bg-zinc-950/70 border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 border flex items-center justify-center mb-4 rounded ${
                  isWhite
                    ? 'border-zinc-300 bg-zinc-100 text-black'
                    : 'border-white/20 bg-black text-white'
                }`}
              >
                <Palette className="w-5 h-5" />
              </div>
              <h3
                className={`font-street text-lg font-bold tracking-wider uppercase mb-2 ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                ESTAMPAS DE AUTOR
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                Ilustrações de alta definição desenvolvidas com exclusividade, homenageando raízes africanas, tribalismo e poesia urbana.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono tracking-widest uppercase mt-4 block ${
                isWhite ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              DESIGN EXCLUSIVO
            </span>
          </div>

          {/* Pillar 4 */}
          <div
            className={`p-6 border rounded-lg transition-all flex flex-col justify-between ${
              isWhite
                ? 'bg-white border-zinc-200 hover:border-zinc-400 shadow-sm'
                : 'bg-zinc-950/70 border-zinc-900 hover:border-zinc-700'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 border flex items-center justify-center mb-4 rounded ${
                  isWhite
                    ? 'border-zinc-300 bg-zinc-100 text-black'
                    : 'border-white/20 bg-black text-white'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <h3
                className={`font-street text-lg font-bold tracking-wider uppercase mb-2 ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                EDIÇÕES LIMITADAS
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                Drops numerados para assegurar exclusividade absoluta. Não produzimos em massa; criamos peças para indivíduos.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono tracking-widest uppercase mt-4 block ${
                isWhite ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              VALOR COLECIONÁVEL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
