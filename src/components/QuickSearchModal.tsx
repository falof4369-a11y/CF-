import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { formatPrice } from '../data/products';
import { TShirtMockup } from './TShirtMockup';
import { Search, X, ArrowRight } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = products.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true; // show all when empty
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.story.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por leão, guerreira, frase, gótico, tamanho..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase px-2 mb-2">
            <span>Resultados ({results.length})</span>
            <span>Clique para ver peça</span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              Nenhuma peça encontrada para "{searchTerm}".
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="p-3 bg-black hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-700 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-950 rounded border border-zinc-800 flex items-center justify-center shrink-0">
                    <TShirtMockup
                      frontDesign={product.frontDesign}
                      backDesign={product.backDesign}
                      view={product.isHero ? 'back' : 'front'}
                      interactive={false}
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h4 className="font-street text-sm font-bold tracking-wider uppercase text-white group-hover:text-zinc-200">
                      {product.name}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {product.categoryLabel} &bull; {product.availableSizes.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-street text-sm font-bold text-white whitespace-nowrap">
                    {formatPrice(product.priceKz)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
