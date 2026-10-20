import React, { useState, useEffect } from 'react';
import { CFLogo } from './CFLogo';
import { ShoppingBag, Search, Menu, X, ArrowUpRight } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState<'inicio' | 'colecao' | 'galeria' | 'personalizar' | 'sobre-nos'>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      // Simple spy
      const sections = ['inicio', 'colecao', 'galeria', 'personalizar', 'sobre-nos'] as const;
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

  const scrollTo = (id: 'inicio' | 'colecao' | 'galeria' | 'personalizar' | 'sobre-nos') => {
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
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
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
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <div className="transform transition-transform group-hover:scale-105 duration-300">
              <CFLogo size="md" glow={true} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-street text-base font-bold tracking-[0.25em] text-white leading-tight">
                CLASS FOCUS
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-400">
                STREETWEAR
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-8">
            <button
              onClick={() => scrollTo('inicio')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'inicio' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              INÍCIO
              {activeSection === 'inicio' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </button>

            <button
              onClick={() => scrollTo('colecao')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'colecao' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              COLEÇÃO
              {activeSection === 'colecao' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </button>

            <button
              onClick={() => scrollTo('galeria')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'galeria' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              GALERIA
              {activeSection === 'galeria' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </button>

            <button
              onClick={() => scrollTo('personalizar')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'personalizar' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              PERSONALIZAR
              {activeSection === 'personalizar' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </button>

            <button
              onClick={() => scrollTo('sobre-nos')}
              className={`text-xs uppercase tracking-[0.22em] font-medium transition-all relative py-1 focus:outline-none cursor-pointer ${
                activeSection === 'sobre-nos' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SOBRE NÓS
              {activeSection === 'sobre-nos' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </button>
          </nav>

          {/* Action Icons Right */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-zinc-300 hover:text-white rounded-full transition-colors hover:bg-white/10 active:scale-95"
              aria-label="Pesquisar produtos"
              title="Pesquisar catálogo (Ctrl+K)"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 text-zinc-300 hover:text-white rounded-full transition-colors hover:bg-white/10 active:scale-95 flex items-center justify-center"
              aria-label={`Carrinho de compras com ${cartCount} itens`}
              title="Ver carrinho de compras"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* CTA Shortcut Desktop */}
            <button
              type="button"
              onClick={onOpenCustomizeModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-white/30 hover:border-white text-xs font-mono tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all"
            >
              <span>CUSTOM</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Abrir menu móvel"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/95 backdrop-blur-xl md:hidden pt-24 px-6 flex flex-col justify-between pb-10 transition-all duration-300">
          <div className="flex flex-col space-y-6">
            <button
              onClick={() => scrollTo('inicio')}
              className="text-left font-street text-2xl tracking-[0.2em] font-bold text-white hover:text-zinc-300 py-2 border-b border-zinc-900"
            >
              INÍCIO
            </button>
            <button
              onClick={() => scrollTo('colecao')}
              className="text-left font-street text-2xl tracking-[0.2em] font-bold text-white hover:text-zinc-300 py-2 border-b border-zinc-900"
            >
              COLEÇÃO
            </button>
            <button
              onClick={() => scrollTo('galeria')}
              className="text-left font-street text-2xl tracking-[0.2em] font-bold text-white hover:text-zinc-300 py-2 border-b border-zinc-900"
            >
              GALERIA
            </button>
            <button
              onClick={() => scrollTo('personalizar')}
              className="text-left font-street text-2xl tracking-[0.2em] font-bold text-white hover:text-zinc-300 py-2 border-b border-zinc-900"
            >
              PERSONALIZAR
            </button>
            <button
              onClick={() => scrollTo('sobre-nos')}
              className="text-left font-street text-2xl tracking-[0.2em] font-bold text-white hover:text-zinc-300 py-2 border-b border-zinc-900"
            >
              SOBRE NÓS
            </button>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCustomizeModal();
              }}
              className="w-full py-3.5 bg-white text-black font-street font-bold text-sm tracking-[0.2em] uppercase text-center"
            >
              CRIAR A MINHA T-SHIRT
            </button>
            <p className="text-[11px] font-mono tracking-widest text-zinc-500 text-center uppercase">
              CF &bull; CLASS FOCUS &bull; LUANDA
            </p>
          </div>
        </div>
      )}
    </>
  );
};
