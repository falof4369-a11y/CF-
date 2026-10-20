import React, { useState } from 'react';
import { Product } from '../types';
import { CATEGORIES, SIZES, formatPrice } from '../data/products';
import { TShirtMockup } from './TShirtMockup';
import { ShoppingBag, Eye, Sparkles, Filter, Check } from 'lucide-react';

interface FeaturedCollectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => void;
  onOpenCustomize: () => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onOpenCustomize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [selectedSizesByProduct, setSelectedSizesByProduct] = useState<Record<string, 'S' | 'M' | 'L' | 'XL' | 'XXL'>>({});
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSize =
      selectedSizeFilter === 'all' ||
      item.availableSizes.includes(selectedSizeFilter as any);
    return matchesCategory && matchesSize;
  });

  const getChosenSize = (productId: string): 'S' | 'M' | 'L' | 'XL' | 'XXL' => {
    return selectedSizesByProduct[productId] || 'L';
  };

  const handleSelectSize = (productId: string, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSizesByProduct((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const size = getChosenSize(product.id);
    onAddToCart(product, size);
    setAddedAnimation(product.id);
    setTimeout(() => setAddedAnimation(null), 1200);
  };

  return (
    <section id="colecao" className="py-20 bg-black text-white relative">
      {/* Subtle border top */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-900" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching reference image */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-900 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-white" />
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-400">
                DROP OFICIAL 2026
              </span>
            </div>
            <h2 className="font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase text-white">
              COLEÇÃO EM DESTAQUE
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSizeFilter('all');
              }}
              className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white uppercase transition-colors flex items-center gap-1.5"
            >
              <span>VER TODA A COLEÇÃO</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-zinc-900/60">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 mr-1 hidden sm:inline flex items-center gap-1">
              <Filter className="w-3 h-3" /> CATEGORIA:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Size Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-500 mr-1">TAMANHO:</span>
            <button
              onClick={() => setSelectedSizeFilter('all')}
              className={`w-7 h-7 flex items-center justify-center text-xs font-mono rounded transition-colors ${
                selectedSizeFilter === 'all'
                  ? 'bg-white text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              ALL
            </button>
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSizeFilter(size)}
                className={`w-7 h-7 flex items-center justify-center text-xs font-mono rounded transition-colors ${
                  selectedSizeFilter === size
                    ? 'bg-white text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-lg">
            <p className="font-street text-xl text-zinc-400 uppercase tracking-widest">
              Nenhuma peça encontrada para os filtros selecionados
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSizeFilter('all');
              }}
              className="mt-4 px-5 py-2 bg-white text-black text-xs font-mono tracking-widest uppercase hover:bg-zinc-200"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const chosenSize = getChosenSize(product.id);
              const isAdded = addedAnimation === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-zinc-950/70 border border-zinc-900 hover:border-zinc-500 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2 py-0.5 bg-black/90 border border-white/20 text-[9px] font-mono tracking-widest uppercase text-white rounded">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Quick view indicator top right */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-1.5 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Product T-Shirt Presentation */}
                  <div className="p-4 pt-8 flex items-center justify-center bg-radial from-zinc-900/40 via-black to-black relative">
                    <TShirtMockup
                      frontDesign={product.frontDesign}
                      backDesign={product.backDesign}
                      color="black"
                      view={product.isHero || product.backDesign !== 'minimal-crest' ? 'back' : 'front'}
                      interactive={true}
                      sizeTag={chosenSize}
                      className="w-full max-w-[280px]"
                    />
                  </div>

                  {/* Product Details & Actions Footer */}
                  <div className="p-5 border-t border-zinc-900 bg-zinc-950 flex flex-col justify-between gap-3">
                    {/* Title and Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-street text-base font-bold tracking-[0.12em] uppercase text-white group-hover:text-zinc-200">
                          {product.name}
                        </h3>
                        <p className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase mt-0.5">
                          {product.categoryLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-street text-base font-bold tracking-wider text-white whitespace-nowrap">
                          {formatPrice(product.priceKz)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Size Select Bar & Cart Button matching reference design */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-900/80">
                      {/* Size buttons: S, M, L, XL, XXL */}
                      <div className="flex items-center gap-1">
                        {product.availableSizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={(e) => handleSelectSize(product.id, size, e)}
                            className={`w-6 h-6 text-[10px] font-mono tracking-wider font-semibold rounded flex items-center justify-center transition-all ${
                              chosenSize === size
                                ? 'bg-white text-black ring-1 ring-white'
                                : 'bg-black text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600'
                            }`}
                            title={`Tamanho ${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      {/* Quick Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`p-2 rounded border transition-all ${
                          isAdded
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-zinc-300 hover:text-white border-zinc-800 hover:border-white'
                        }`}
                        aria-label={`Adicionar ${product.name} ao carrinho`}
                        title="Adicionar ao carrinho"
                      >
                        {isAdded ? (
                          <Check className="w-4 h-4 text-black animate-scale" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Customization Promo Card integrated inside the grid matching the reference layout! */}
            <div className="group bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/20 hover:border-white transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <TShirtMockup
                  frontDesign="chest-logo"
                  backDesign="tribal-lion"
                  view="back"
                  interactive={false}
                  className="w-64 h-64"
                />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="w-10 h-10 border border-white/40 flex items-center justify-center bg-black/60 rounded">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-street text-2xl font-black italic tracking-wide text-white uppercase leading-tight">
                    A TUA IDEIA.
                    <br />
                    O TEU ESTILO.
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Personaliza a tua t-shirt com frases marcantes, símbolos ancestrais, ilustrações de autor ou fotografias à tua escolha.
                  </p>
                </div>

                <ul className="text-[11px] font-mono text-zinc-400 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    Corte Streetwear Boxy Heavyweight
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    Estampa personalizada de alta definição
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    Atendimento e aprovação prévia no WhatsApp
                  </li>
                </ul>
              </div>

              <div className="pt-6 relative z-10">
                <button
                  type="button"
                  onClick={onOpenCustomize}
                  className="w-full py-3.5 bg-white text-black font-street text-xs font-bold tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>PERSONALIZAR AGORA</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
