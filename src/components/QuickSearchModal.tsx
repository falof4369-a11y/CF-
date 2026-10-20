import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { formatPrice } from '../data/products';
import { useTheme } from '../context/ThemeContext';
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
  const { isWhite } = useTheme();
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden border transition-colors ${
          isWhite ? 'bg-white text-black border-zinc-200' : 'bg-zinc-950 text-white border-zinc-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          className={`p-4 border-b flex items-center gap-3 ${
            isWhite ? 'border-zinc-200' : 'border-zinc-800'
          }`}
        >
          <Search className={`w-5 h-5 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por leão, guerreira, frase, cabra, tribal, tamanho..."
            className={`w-full bg-transparent text-sm sm:text-base focus:outline-none font-sans ${
              isWhite ? 'text-black placeholder-zinc-400' : 'text-white placeholder-zinc-500'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`p-1 cursor-pointer ${isWhite ? 'text-zinc-500 hover:text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className={`text-xs font-mono px-2 py-1 rounded border cursor-pointer ${
              isWhite
                ? 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <div
            className={`flex items-center justify-between text-[11px] font-mono uppercase px-2 mb-2 ${
              isWhite ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            <span>Resultados ({results.length})</span>
            <span>Clique para ver peça</span>
          </div>

          {results.length === 0 ? (
            <div className={`py-12 text-center font-mono text-xs ${isWhite ? 'text-zinc-500' : 'text-zinc-500'}`}>
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
                className={`p-3 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-colors group border ${
                  isWhite
                    ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-zinc-400'
                    : 'bg-black hover:bg-zinc-900/80 border-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded flex items-center justify-center shrink-0 overflow-hidden p-1 border ${
                      isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4
                      className={`font-street text-sm font-bold tracking-wider uppercase transition-colors ${
                        isWhite
                          ? 'text-black group-hover:text-zinc-700'
                          : 'text-white group-hover:text-zinc-200'
                      }`}
                    >
                      {product.name}
                    </h4>
                    <p className={`text-[10px] font-mono ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {product.categoryLabel} &bull; {product.availableSizes.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-street text-sm font-bold whitespace-nowrap ${isWhite ? 'text-black' : 'text-white'}`}>
                    {formatPrice(product.priceKz)}
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                      isWhite ? 'text-zinc-400 group-hover:text-black' : 'text-zinc-500 group-hover:text-white'
                    }`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
