import React, { useState, useEffect } from 'react';
import { CFLogo } from './CFLogo';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag, Search, Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenCustomizeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenCustomizeModal,
}) => {
  const { theme, isWhite, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<'inicio' | 'colecao' | 'personalizar' | 'sobre-nos'>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      // Section spy
      const sections = ['inicio', 'colecao', 'personalizar', 'sobre-nos'] as const;
      const scrollPos = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: 'inicio' | 'colecao' | 'personalizar' | 'sobre-nos') => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? isWhite
              ? 'bg-white/90 backdrop-blur-md border-b border-zinc-200 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
              : 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : isWhite
            ? 'bg-gradient-to-b from-white via-white/80 to-transparent py-5'
            : 'bg-gradient-to-b from-black via-black/80 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand on Left */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('inicio');
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="transform transition-transform group-hover:scale-105 duration-300">
              <CFLogo size="md" glow={true} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span
                className={`font-street text-base font-bold tracking-[0.25em] leading-tight transition-colors ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                CLASS FOCUS
              </span>
              <span
                className={`text-[9px] font-mono tracking-[0.3em] transition-colors ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                STREETWEAR
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-8">
            <button
              onClick={() => scrollTo('inicio')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'inicio'
                  ? isWhite
                    ? 'text-black font-bold'
                    : 'text-white font-bold'
                  : isWhite
                  ? 'text-zinc-600 hover:text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              INÍCIO
              {activeSection === 'inicio' && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all ${
                    isWhite ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => scrollTo('colecao')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'colecao'
                  ? isWhite
                    ? 'text-black font-bold'
                    : 'text-white font-bold'
                  : isWhite
                  ? 'text-zinc-600 hover:text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              COLEÇÃO E GALERIA
              {activeSection === 'colecao' && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all ${
                    isWhite ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => scrollTo('personalizar')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'personalizar'
                  ? isWhite
                    ? 'text-black font-bold'
                    : 'text-white font-bold'
                  : isWhite
                  ? 'text-zinc-600 hover:text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              PERSONALIZAR
              {activeSection === 'personalizar' && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all ${
                    isWhite ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => scrollTo('sobre-nos')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'sobre-nos'
                  ? isWhite
                    ? 'text-black font-bold'
                    : 'text-white font-bold'
                  : isWhite
                  ? 'text-zinc-600 hover:text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              SOBRE NÓS
              {activeSection === 'sobre-nos' && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all ${
                    isWhite ? 'bg-black' : 'bg-white'
                  }`}
                />
              )}
            </button>
          </nav>

          {/* Action Icons Right */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Elegant Black & White Theme Selector */}
            <div
              className={`flex items-center rounded-full p-0.5 border transition-all ${
                isWhite
                  ? 'bg-zinc-100 border-zinc-300'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Mudar para modo ${isWhite ? 'preto' : 'branco'}`}
                title={`Tema atual: Modo ${isWhite ? 'Branco' : 'Preto'}. Clica para alternar.`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                  isWhite
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-black text-white shadow-sm ring-1 ring-zinc-700'
                }`}
              >
                {isWhite ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-zinc-900" />
                    <span className="hidden sm:inline">BRANCO</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-zinc-100" />
                    <span className="hidden sm:inline">PRETO</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              className={`p-2 rounded-full transition-colors active:scale-95 cursor-pointer ${
                isWhite
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Pesquisar produtos"
              title="Pesquisar catálogo (Ctrl+K)"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className={`relative p-2 rounded-full transition-colors active:scale-95 flex items-center justify-center cursor-pointer ${
                isWhite
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label={`Carrinho de compras com ${cartCount} itens`}
              title="Ver carrinho de compras"
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center ${
                    isWhite
                      ? 'bg-black text-white ring-2 ring-white'
                      : 'bg-white text-black ring-2 ring-black'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* CTA Shortcut Desktop */}
            <button
              type="button"
              onClick={onOpenCustomizeModal}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono tracking-widest uppercase transition-all cursor-pointer ${
                isWhite
                  ? 'border-black text-black hover:bg-black hover:text-white'
                  : 'border-white/30 hover:border-white text-white hover:bg-white hover:text-black'
              }`}
            >
              <span>CUSTOM</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg focus:outline-none transition-colors ${
                isWhite
                  ? 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  : 'text-zinc-300 hover:text-white'
              }`}
              aria-label="Abrir menu móvel"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className={`fixed inset-0 z-30 md:hidden pt-24 px-6 flex flex-col justify-between pb-10 transition-all duration-300 backdrop-blur-xl ${
            isWhite ? 'bg-white/98 text-black' : 'bg-black/95 text-white'
          }`}
        >
          <div className="flex flex-col space-y-6">
            <button
              onClick={() => scrollTo('inicio')}
              className={`text-left font-street text-2xl tracking-[0.2em] font-bold py-2 border-b transition-colors ${
                isWhite
                  ? 'text-black border-zinc-200 hover:text-zinc-600'
                  : 'text-white border-zinc-900 hover:text-zinc-300'
              }`}
            >
              INÍCIO
            </button>
            <button
              onClick={() => scrollTo('colecao')}
              className={`text-left font-street text-2xl tracking-[0.2em] font-bold py-2 border-b transition-colors ${
                isWhite
                  ? 'text-black border-zinc-200 hover:text-zinc-600'
                  : 'text-white border-zinc-900 hover:text-zinc-300'
              }`}
            >
              COLEÇÃO E GALERIA
            </button>
            <button
              onClick={() => scrollTo('personalizar')}
              className={`text-left font-street text-2xl tracking-[0.2em] font-bold py-2 border-b transition-colors ${
                isWhite
                  ? 'text-black border-zinc-200 hover:text-zinc-600'
                  : 'text-white border-zinc-900 hover:text-zinc-300'
              }`}
            >
              PERSONALIZAR
            </button>
            <button
              onClick={() => scrollTo('sobre-nos')}
              className={`text-left font-street text-2xl tracking-[0.2em] font-bold py-2 border-b transition-colors ${
                isWhite
                  ? 'text-black border-zinc-200 hover:text-zinc-600'
                  : 'text-white border-zinc-900 hover:text-zinc-300'
              }`}
            >
              SOBRE NÓS
            </button>
          </div>

          <div
            className={`pt-6 border-t flex flex-col gap-4 ${
              isWhite ? 'border-zinc-200' : 'border-zinc-800'
            }`}
          >
            {/* Mobile Theme Selector Switch */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                isWhite ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {isWhite ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-white" />}
                <span className="font-street text-xs font-bold tracking-widest uppercase">
                  TEMA DO SITE: {isWhite ? 'MODO BRANCO' : 'MODO PRETO'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${
                  isWhite
                    ? 'bg-black text-white hover:bg-zinc-800'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                Mudar para {isWhite ? 'Preto' : 'Branco'}
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCustomizeModal();
              }}
              className={`w-full py-3.5 font-street font-bold text-sm tracking-[0.2em] uppercase text-center transition-colors cursor-pointer ${
                isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              CRIAR A MINHA T-SHIRT
            </button>
            <p
              className={`text-[11px] font-mono tracking-widest text-center uppercase ${
                isWhite ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              CF &bull; CLASS FOCUS &bull; LUANDA
            </p>
          </div>
        </div>
      )}
    </>
  );
};
