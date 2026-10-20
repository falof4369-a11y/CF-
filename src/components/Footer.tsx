import React, { useState } from 'react';
import { CFLogo } from './CFLogo';
import { BRAND_CONFIG } from '../data/products';
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Play, Shield, Truck, RotateCcw, HelpCircle } from 'lucide-react';

interface FooterProps {
  onReplayIntro: () => void;
  onOpenSizeGuide: () => void;
  onOpenCustomize: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onReplayIntro,
  onOpenSizeGuide,
  onOpenCustomize,
}) => {
  const [activeInfoModal, setActiveInfoModal] = useState<'entregas' | 'trocas' | 'encomendas' | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t border-zinc-900 pt-16 pb-12 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-zinc-900">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <CFLogo size="md" glow={true} />
              <div>
                <span className="font-street text-xl font-bold tracking-[0.25em] text-white block">
                  CLASS FOCUS
                </span>
                <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-400 uppercase">
                  STREETWEAR DE AUTOR
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-sm">
              Moda urbana premium especializada em t-shirts de alta densidade com estampas exclusivas, atitude e personalização sob medida.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-white flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Instagram @classfocus.ao"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${BRAND_CONFIG.phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-white flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="WhatsApp Oficial CF"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-white flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Facebook CF"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-white flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Email de Contacto"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-street text-xs font-bold tracking-[0.25em] uppercase text-white">
              NAVEGAÇÃO
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-400">
              <li>
                <button
                  onClick={() => scrollTo('inicio')}
                  className="hover:text-white transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('colecao')}
                  className="hover:text-white transition-colors"
                >
                  Coleção em Destaque
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('personalizar')}
                  className="hover:text-white transition-colors"
                >
                  Personalizar T-shirt
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('sobre-nos')}
                  className="hover:text-white transition-colors"
                >
                  Sobre a Class Focus
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors"
                >
                  Tabela de Tamanhos
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-street text-xs font-bold tracking-[0.25em] uppercase text-white">
              INFORMAÇÕES & SUPORTE
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-400">
              <li>
                <button
                  onClick={() => setActiveInfoModal('entregas')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-zinc-500" /> Prazos e Custos de Entrega
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('trocas')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-500" /> Política de Trocas (7 Dias)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('encomendas')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> Como Encomendar
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCustomize}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-500" /> Pedidos Especiais / Atacado
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Contacts */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-street text-xs font-bold tracking-[0.25em] uppercase text-white">
              CONTACTOS OFICIAIS
            </h4>
            <div className="space-y-2 text-xs font-mono text-zinc-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>{BRAND_CONFIG.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white shrink-0" />
                <a
                  href={`https://wa.me/${BRAND_CONFIG.phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline"
                >
                  {BRAND_CONFIG.phoneWhatsAppDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a
                  href={`mailto:${BRAND_CONFIG.email}`}
                  className="hover:text-white"
                >
                  {BRAND_CONFIG.email}
                </a>
              </p>
            </div>

            {/* Replay intro cinematic button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onReplayIntro}
                className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-zinc-400 hover:text-white py-1.5 px-3 border border-zinc-800 hover:border-zinc-500 rounded bg-zinc-950 transition-colors"
                title="Voltar a ver a animação inicial cinematográfica"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>REVER ANIMAÇÃO INICIAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-400">
          <p>
            &copy; 2026 CF &bull; CLASS FOCUS. TODOS OS DIREITOS RESERVADOS.
          </p>
          <p className="text-zinc-400 font-street tracking-widest text-xs uppercase">
            VESTE A TUA IDENTIDADE.
          </p>
        </div>
      </div>

      {/* Info Modals (Prazos, Trocas, Encomendas) */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg p-6 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {activeInfoModal === 'entregas' && (
              <>
                <h3 className="font-street text-xl font-bold uppercase tracking-wider">
                  PRAZOS E ENTREGAS &bull; CF ANGOLA
                </h3>
                <div className="text-xs text-zinc-400 space-y-2 font-mono leading-relaxed">
                  <p>
                    <strong className="text-white">Luanda:</strong> Entrega expresso ao domicílio em 24h a 48h úteis após confirmação do pedido.
                  </p>
                  <p>
                    <strong className="text-white">Todas as Províncias de Angola:</strong> Envio expresso via transportadoras autorizadas (Huambo, Benguela, Lubango, Cabinda, etc.) no prazo de 3 a 5 dias úteis.
                  </p>
                  <p>
                    <strong className="text-white">Envios Internacionais:</strong> Disponíveis sob consulta via DHL / FedEx.
                  </p>
                </div>
              </>
            )}

            {activeInfoModal === 'trocas' && (
              <>
                <h3 className="font-street text-xl font-bold uppercase tracking-wider">
                  POLÍTICA DE TROCAS & DEVOLUÇÕES
                </h3>
                <div className="text-xs text-zinc-400 space-y-2 font-mono leading-relaxed">
                  <p>
                    Garantimos a troca de qualquer peça no prazo de <strong className="text-white">7 dias corridos</strong> após a receção, caso o tamanho não seja o pretendido ou apresente qualquer inconformidade de fabrico.
                  </p>
                  <p>
                    A peça deve estar sem uso, com etiquetas originais e na embalagem original da CF.
                  </p>
                </div>
              </>
            )}

            {activeInfoModal === 'encomendas' && (
              <>
                <h3 className="font-street text-xl font-bold uppercase tracking-wider">
                  COMO ENCOMENDAR NA CF
                </h3>
                <div className="text-xs text-zinc-400 space-y-2 font-mono leading-relaxed">
                  <p>
                    1. Escolhe as peças e tamanhos desejados na nossa coleção ou cria uma personalizada.
                  </p>
                  <p>
                    2. Clica em "Finalizar Pedido via WhatsApp" ou "Encomendar Direto".
                  </p>
                  <p>
                    3. A nossa equipa valida o stock, indica os dados bancários oficiais para transferência (Multicaixa Express / IBAN) e agenda a entrega no teu endereço.
                  </p>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-2 bg-white text-black font-street text-xs font-bold uppercase tracking-wider rounded hover:bg-zinc-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
