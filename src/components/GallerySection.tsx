import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../data/gallery';
import { ImageLightbox } from './ImageLightbox';
import { Maximize2, MessageCircle, Sparkles, Filter } from 'lucide-react';
import { getProductOrderWhatsAppUrl } from '../config/whatsapp';

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (selectedCategory === 'Todas') return true;
    return item.category === selectedCategory;
  });

  const handleLightboxNavigate = (index: number) => {
    if (index >= 0 && index < filteredItems.length) {
      setActiveLightboxItem(filteredItems[index]);
    }
  };

  const handleQuickWhatsApp = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getProductOrderWhatsAppUrl({
      productName: item.title,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="galeria" className="py-24 bg-black text-white relative overflow-hidden select-none">
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-900" />

      {/* Background ambient dark grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-zinc-900 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-white" />
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-400">
                LOOKBOOK &bull; MOCKUPS OFICIAIS
              </span>
            </div>
            <h2 className="font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase text-white">
              GALERIA DE PEÇAS
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl font-sans">
              Explora as estampas em alta resolução, detalhes da arte tribal africana, frases marcantes e o corte clássico oversized da Class Focus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded border border-zinc-900">
              {filteredItems.length} {filteredItems.length === 1 ? 'imagem' : 'imagens'}
            </span>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <span className="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> FILTRAR:
          </span>
          {GALLERY_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className="group bg-zinc-950/80 border border-zinc-900 hover:border-zinc-500 rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.9)] cursor-pointer relative"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Badge */}
              {item.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 bg-black/90 backdrop-blur-md border border-white/20 text-[9px] font-mono tracking-widest uppercase text-white rounded">
                    {item.badge}
                  </span>
                </div>
              )}

              {/* Expand indicator icon */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-2 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Image Container with high contrast showcase */}
              <div className="relative w-full aspect-[4/3] bg-zinc-900/30 overflow-hidden flex items-center justify-center p-3">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              {/* Bottom Caption & WhatsApp Trigger */}
              <div className="p-5 border-t border-zinc-900 bg-zinc-950 flex flex-col justify-between gap-3 flex-1">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-street text-base font-bold tracking-wider uppercase text-white group-hover:text-zinc-200 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-zinc-400 group-hover:text-white uppercase flex items-center gap-1 transition-colors">
                    <Maximize2 className="w-3 h-3" /> Clique para ampliar
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleQuickWhatsApp(item, e)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 transition-colors"
                    title="Pedir informações desta peça no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Helper Note for the Brand Owner */}
        <div className="mt-12 p-4 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>Estrutura Pronta para Novos Ficheiros:</strong> Novas fotografias podem ser facilmente adicionadas ou substituídas na galeria sem alterar a estrutura do site.
            </span>
          </div>

          <a
            href={getProductOrderWhatsAppUrl({ productName: 'Peças da Galeria CF' })}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline whitespace-nowrap uppercase tracking-wider flex items-center gap-1"
          >
            Falar com a CF no WhatsApp &rarr;
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        item={activeLightboxItem}
        items={filteredItems}
        onClose={() => setActiveLightboxItem(null)}
        onNavigate={handleLightboxNavigate}
      />
    </section>
  );
};
