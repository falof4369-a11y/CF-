import React from 'react';
import { CFLogo } from './CFLogo';
import { ShieldCheck, Flame, Crown, Palette } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="sobre-nos" className="py-24 bg-black text-white relative overflow-hidden">
      {/* Giant subtle watermark CF crown in background on bottom-right, matching reference image! */}
      <div className="absolute -bottom-16 -right-16 opacity-[0.06] pointer-events-none select-none">
        <CFLogo size="hero" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-[1.5px] bg-white" />
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-400">
            SOBRE NÓS
          </span>
        </div>

        {/* Section Headline matching reference mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className="lg:col-span-7">
            <h2 className="font-street text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight uppercase text-white leading-[1.05]">
              CRIATIVIDADE.
              <br />
              IDENTIDADE.
              <br />
              ORIGINALIDADE.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-4 pt-2">
            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
              A <strong className="text-white font-semibold">CF (Class Focus)</strong> nasceu para quem não tem medo de mostrar quem é. Criamos peças que unem arte, atitude e identidade, transformando cada t-shirt numa forma de expressão.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-mono">
              Com raízes fortes na cultura urbana de Luanda e um olhar atento às tendências do streetwear de luxo internacional, cada peça é tratada como uma obra de arte vestível.
            </p>
          </div>
        </div>

        {/* Brand Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-zinc-900">
          {/* Pillar 1 */}
          <div className="p-6 bg-zinc-950/70 border border-zinc-900 hover:border-zinc-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-4 rounded bg-black">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-street text-lg font-bold tracking-wider uppercase text-white mb-2">
                CORTE OVERSIZED
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Caimento amplo, gola grossa canelada de 3cm e ombros descaídos que garantem uma presença estética marcante.
              </p>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-4 block">
              ESTRUTURA DE PESO
            </span>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-zinc-950/70 border border-zinc-900 hover:border-zinc-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-4 rounded bg-black">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-street text-lg font-bold tracking-wider uppercase text-white mb-2">
                HEAVYWEIGHT 240G
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                100% Algodão Premium Penteado de gramagem alta, com toque aveludado e durabilidade extrema que não encolhe.
              </p>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-4 block">
              DURABILIDADE MÁXIMA
            </span>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-zinc-950/70 border border-zinc-900 hover:border-zinc-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-4 rounded bg-black">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-street text-lg font-bold tracking-wider uppercase text-white mb-2">
                ESTAMPAS DE AUTOR
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ilustrações de alta definição desenvolvidas com exclusividade, homenageando raízes africanas, tribalismo e poesia gótica.
              </p>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-4 block">
              DESIGN EXCLUSIVO
            </span>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 bg-zinc-950/70 border border-zinc-900 hover:border-zinc-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-4 rounded bg-black">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-street text-lg font-bold tracking-wider uppercase text-white mb-2">
                EDIÇÕES LIMITADAS
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drops numerados para assegurar exclusividade absoluta. Não produzimos em massa; criamos peças para indivíduos.
              </p>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-4 block">
              VALOR COLECIONÁVEL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
