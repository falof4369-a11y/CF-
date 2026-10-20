import React, { useEffect } from 'react';
import { GalleryItem } from '../types';
import { X, ChevronLeft, ChevronRight, MessageCircle, ZoomIn } from 'lucide-react';
import { getProductOrderWhatsAppUrl } from '../config/whatsapp';

interface ImageLightboxProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  item,
  items,
  onClose,
  onNavigate,
}) => {
  if (!item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < items.length - 1) onNavigate(currentIndex + 1);
  };

  const handleOrderWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getProductOrderWhatsAppUrl({
      productName: item.title,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-full pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono text-zinc-300 uppercase tracking-widest">
            {item.category} &bull; {currentIndex + 1} de {items.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full border border-zinc-700 transition-all pointer-events-auto shadow-xl"
          aria-label="Fechar visualização ampliada"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full border border-zinc-800 hover:border-white transition-all z-20 shadow-2xl"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < items.length - 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full border border-zinc-800 hover:border-white transition-all z-20 shadow-2xl"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Container */}
      <div
        className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full Image */}
        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg bg-zinc-950 border border-zinc-900 shadow-2xl max-h-[68vh]">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full max-h-[68vh] object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Captions and Direct WhatsApp order */}
        <div className="w-full mt-4 p-4 bg-zinc-950/90 border border-zinc-900 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-street text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                {item.title}
              </h3>
              {item.badge && (
                <span className="px-2 py-0.5 bg-white/10 text-[9px] font-mono tracking-widest uppercase text-white rounded border border-white/20">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1 max-w-xl">
              {item.description}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOrderWhatsApp}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-black font-street text-xs font-bold tracking-[0.2em] uppercase rounded hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>CONSULTAR NO WHATSAPP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
