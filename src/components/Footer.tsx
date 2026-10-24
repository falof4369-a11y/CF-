import React, { useState } from 'react';
import { CFLogo } from './CFLogo';
import { BRAND_CONFIG } from '../data/products';
import { getGeneralWhatsAppUrl } from '../config/whatsapp';
import { useTheme } from '../context/ThemeContext';
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Play, Shield, Truck, RotateCcw, HelpCircle } from 'lucide-react';

interface FooterProps {
  onReplayIntro: () => void;
  onOpenSizeGuide: () => void;
  onOpenCustomize: () => void;
  onOpenAdminAuth?: () => void;
  onOpenCourierDelivery?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onReplayIntro,
  onOpenSizeGuide,
  onOpenCustomize,
  onOpenAdminAuth,
  onOpenCourierDelivery,
}) => {
  const { isWhite } = useTheme();
  const [activeInfoModal, setActiveInfoModal] = useState<'entregas' | 'trocas' | 'encomendas' | null>(null);

  // 3-Click detection on CF Logo
  const [footerLogoClicks, setFooterLogoClicks] = useState(0);
  const footerClickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleFooterLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo('inicio');

    const next = footerLogoClicks + 1;
    setFooterLogoClicks(next);

    if (footerClickTimeoutRef.current) {
      clearTimeout(footerClickTimeoutRef.current);
    }

    if (next >= 3) {
      setFooterLogoClicks(0);
      onOpenAdminAuth?.();
    } else {
      footerClickTimeoutRef.current = setTimeout(() => {
        setFooterLogoClicks(0);
      }, 1500);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      className={`border-t pt-16 pb-12 relative overflow-hidden select-none transition-colors duration-300 ${
        isWhite
          ? 'bg-zinc-100 text-zinc-900 border-zinc-200'
          : 'bg-black text-white border-zinc-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b ${
            isWhite ? 'border-zinc-200' : 'border-zinc-900'
          }`}
        >
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={handleFooterLogoClick}
              title="CF (Class Focus)"
            >
              <div className="transform transition-transform group-hover:scale-105">
                <CFLogo size="md" glow={true} />
              </div>
              <div>
                <span
                  className={`font-street text-xl font-bold tracking-[0.25em] block ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  CLASS FOCUS
                </span>
                <span
                  className={`text-[10px] font-mono tracking-[0.3em] uppercase ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  STREETWEAR DE AUTOR
                </span>
              </div>
            </div>

            <p
              className={`text-xs leading-relaxed font-sans max-w-sm ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Moda urbana premium especializada em t-shirts de alta densidade com estampas exclusivas, atitude e personalização sob medida.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:text-black hover:border-black bg-white shadow-xs'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-white'
                }`}
                title="Instagram @classfocus.ao"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONFIG.whatsAppDirectLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:text-black hover:border-black bg-white shadow-xs'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-white'
                }`}
                title="WhatsApp Oficial CF (+244 958 194 301)"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:text-black hover:border-black bg-white shadow-xs'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-white'
                }`}
                title="Facebook CF"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:text-black hover:border-black bg-white shadow-xs'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-white'
                }`}
                title="Email de Contacto"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4
              className={`font-street text-xs font-bold tracking-[0.25em] uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              NAVEGAÇÃO
            </h4>
            <ul
              className={`space-y-2 text-xs font-mono ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              <li>
                <button
                  onClick={() => scrollTo('inicio')}
                  className={`transition-colors cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('colecao')}
                  className={`transition-colors cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Coleção e Galeria
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('personalizar')}
                  className={`transition-colors cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Encomenda Personalizada
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('avaliacoes')}
                  className={`transition-colors cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Avaliações Demonstrativas
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('sobre-nos')}
                  className={`transition-colors cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Sobre a Class Focus
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className={`transition-colors cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Tabela de Tamanhos
                </button>
              </li>
              {onOpenCourierDelivery && (
                <li>
                  <button
                    onClick={onOpenCourierDelivery}
                    className={`transition-colors cursor-pointer text-emerald-500 font-bold ${
                      isWhite ? 'hover:text-emerald-700' : 'hover:text-emerald-400'
                    }`}
                  >
                    Confirmar Entrega (Estafeta)
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h4
              className={`font-street text-xs font-bold tracking-[0.25em] uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              INFORMAÇÕES & SUPORTE
            </h4>
            <ul
              className={`space-y-2 text-xs font-mono ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              <li>
                <button
                  onClick={() => setActiveInfoModal('entregas')}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  <Truck className="w-3.5 h-3.5 text-zinc-500" /> Prazos e Custos de Entrega
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('trocas')}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-500" /> Política de Trocas (7 Dias)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('encomendas')}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> Como Encomendar
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCustomize}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-500" /> Pedidos Especiais / Atacado
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Contacts */}
          <div className="lg:col-span-3 space-y-3">
            <h4
              className={`font-street text-xs font-bold tracking-[0.25em] uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              CONTACTOS OFICIAIS
            </h4>
            <div
              className={`space-y-2 text-xs font-mono ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              <p className="flex items-start gap-2">
                <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isWhite ? 'text-black' : 'text-white'}`} />
                <span>{BRAND_CONFIG.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className={`w-4 h-4 shrink-0 ${isWhite ? 'text-black' : 'text-white'}`} />
                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline ${isWhite ? 'hover:text-black' : 'hover:text-white'}`}
                  title="Contactar CF via WhatsApp Oficial (+244 958 194 301)"
                >
                  {BRAND_CONFIG.phoneWhatsAppDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className={`w-4 h-4 shrink-0 ${isWhite ? 'text-black' : 'text-white'}`} />
                <a
                  href={`mailto:${BRAND_CONFIG.email}`}
                  className={isWhite ? 'hover:text-black' : 'hover:text-white'}
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
                className={`inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase py-1.5 px-3 border rounded transition-colors cursor-pointer ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:text-black hover:border-black bg-white shadow-xs'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 bg-zinc-950'
                }`}
                title="Voltar a ver a animação inicial cinematográfica"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>REVER ANIMAÇÃO INICIAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className={`pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono ${
            isWhite ? 'text-zinc-600' : 'text-zinc-400'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <p>
              &copy; 2026 CF &bull; CLASS FOCUS. TODOS OS DIREITOS RESERVADOS.
            </p>
            <button
              onClick={() => scrollTo('avaliacoes')}
              className="hover:underline cursor-pointer"
            >
              Avaliações
            </button>
            <button
              onClick={() => scrollTo('comunidade')}
              className="hover:underline cursor-pointer"
            >
              Comunidade CF
            </button>
            {onOpenAdminAuth && (
              <button
                type="button"
                onClick={onOpenAdminAuth}
                className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer underline text-[10px]"
                title="Acesso Administrativo (código de 4 dígitos)"
              >
                Painel Admin
              </button>
            )}
          </div>
          <p className="font-street tracking-widest text-xs uppercase font-bold">
            VESTE A TUA IDENTIDADE.
          </p>
        </div>
      </div>

      {/* Info Modals */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className={`w-full max-w-lg rounded-lg p-6 space-y-4 border shadow-2xl ${
              isWhite ? 'bg-white text-black border-zinc-200' : 'bg-zinc-950 text-white border-zinc-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {activeInfoModal === 'entregas' && (
              <>
                <h3 className="font-street text-xl font-bold uppercase tracking-wider">
                  PRAZOS E ENTREGAS &bull; CF ANGOLA
                </h3>
                <div
                  className={`text-xs space-y-2 font-mono leading-relaxed ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-400'
                  }`}
                >
                  <p>
                    <strong className={isWhite ? 'text-black' : 'text-white'}>Luanda:</strong> Entrega expresso ao domicílio em 24h a 48h úteis após confirmação do pedido.
                  </p>
                  <p>
                    <strong className={isWhite ? 'text-black' : 'text-white'}>Todas as Províncias de Angola:</strong> Envio expresso via transportadoras autorizadas (Huambo, Benguela, Lubango, Cabinda, etc.) no prazo de 3 a 5 dias úteis.
                  </p>
                  <p>
                    <strong className={isWhite ? 'text-black' : 'text-white'}>Envios Internacionais:</strong> Disponíveis sob consulta via DHL / FedEx.
                  </p>
                </div>
              </>
            )}

            {activeInfoModal === 'trocas' && (
              <>
                <h3 className="font-street text-xl font-bold uppercase tracking-wider">
                  POLÍTICA DE TROCAS & DEVOLUÇÕES
                </h3>
                <div
                  className={`text-xs space-y-2 font-mono leading-relaxed ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-400'
                  }`}
                >
                  <p>
                    Garantimos a troca de qualquer peça no prazo de <strong className={isWhite ? 'text-black' : 'text-white'}>7 dias corridos</strong> após a receção, caso o tamanho não seja o pretendido ou apresente qualquer inconformidade de fabrico.
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
                <div
                  className={`text-xs space-y-2 font-mono leading-relaxed ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-400'
                  }`}
                >
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
                className={`px-4 py-2 font-street text-xs font-bold uppercase tracking-wider rounded cursor-pointer ${
                  isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                }`}
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
