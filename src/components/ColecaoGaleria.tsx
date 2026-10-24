import React, { useState } from 'react';
import { Product, GalleryItem } from '../types';
import { CATEGORIES, formatPrice, OFFICIAL_PRICES } from '../data/products';
import { getProductOrderWhatsAppUrl } from '../config/whatsapp';
import { ImageLightbox } from './ImageLightbox';
import { useTheme } from '../context/ThemeContext';
import { useInView } from '../context/useInView';
import { ShoppingBag, Eye, MessageCircle, Check, Filter, Sparkles, Tag, Maximize2 } from 'lucide-react';

interface ColecaoGaleriaProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => void;
  onOpenCustomize: () => void;
}

export const ColecaoGaleria: React.FC<ColecaoGaleriaProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onOpenCustomize,
}) => {
  const { isWhite } = useTheme();
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLDivElement>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSizesByProduct, setSelectedSizesByProduct] = useState<Record<string, 'S' | 'M' | 'L' | 'XL' | 'XXL'>>({});
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  // Convert real product list into gallery items for the lightbox viewer
  const galleryItems: GalleryItem[] = products.map((p) => ({
    id: p.id,
    title: p.name,
    category: p.categoryLabel,
    description: `${p.description} — Preço: ${formatPrice(p.priceKz)}`,
    imageUrl: p.image,
    badge: p.badge,
    relatedProductId: p.id,
  }));

  // Filter products by category
  const filteredProducts = products.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const filteredGalleryItems = galleryItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    const prod = products.find((p) => p.id === item.id);
    return prod?.category === selectedCategory;
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

  const handleQuickWhatsApp = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const size = getChosenSize(product.id);
    const url = getProductOrderWhatsAppUrl({
      productName: product.name,
      size,
      quantity: 1,
      priceFormatted: formatPrice(product.priceKz),
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenLightbox = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = galleryItems.find((g) => g.id === productId);
    if (item) {
      setActiveLightboxItem(item);
    }
  };

  const handleLightboxNavigate = (index: number) => {
    if (index >= 0 && index < filteredGalleryItems.length) {
      setActiveLightboxItem(filteredGalleryItems[index]);
    }
  };

  return (
    <section
      id="colecao"
      className={`py-20 relative select-none transition-colors duration-300 ${
        isWhite ? 'bg-zinc-50 text-black' : 'bg-black text-white'
      }`}
    >
      {/* Invisible anchor target for links pointing to #galeria */}
      <div id="galeria" className="absolute -top-24" />

      {/* Top divider */}
      <div
        className={`absolute top-0 inset-x-0 h-[1px] ${
          isWhite ? 'bg-zinc-200' : 'bg-zinc-900'
        }`}
      />

      {/* Ambient background pattern */}
      <div
        className={`absolute inset-0 [background-size:32px_32px] pointer-events-none ${
          isWhite
            ? 'bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] opacity-35'
            : 'bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-15'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: Unificada "Coleção e Galeria" with Discreet Scroll Reveal */}
        <div
          ref={headerRef}
          className={`flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b gap-4 ${
            isWhite ? 'border-zinc-200' : 'border-zinc-900'
          } ${headerInView ? 'cf-title-enter' : 'opacity-0'}`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-5 h-[1.5px] ${isWhite ? 'bg-black' : 'bg-white'}`} />
              <span
                className={`text-xs font-mono tracking-[0.3em] uppercase ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                FOTOGRAFIAS REAIS &bull; DROP OFICIAL
              </span>
            </div>
            <h2
              className={`font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              COLEÇÃO E GALERIA
            </h2>
            <p
              className={`text-xs sm:text-sm mt-2 max-w-2xl font-sans ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Todos os modelos reais da marca CF reunidos numa só área. Fotografias originais de alta definição em algodão premium com estampas de autor. Clica numa imagem para ampliar em tamanho real ou escolhe o tamanho para encomendar.
            </p>
          </div>

          {/* Pricing Highlight Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2.5 border transition-all ${
                isWhite
                  ? 'bg-white border-zinc-200 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              <Tag className={`w-4 h-4 shrink-0 ${isWhite ? 'text-black' : 'text-white'}`} />
              <div className="text-left font-mono">
                <span className={`text-[10px] uppercase block ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  T-shirt Marca CF:
                </span>
                <span className={`text-xs font-bold ${isWhite ? 'text-black' : 'text-white'}`}>
                  {OFFICIAL_PRICES.cfBrandTeeFormatted}
                </span>
              </div>
            </div>

            <div
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2.5 border transition-all ${
                isWhite
                  ? 'bg-white border-zinc-200 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${isWhite ? 'text-zinc-600' : 'text-zinc-400'}`} />
              <div className="text-left font-mono">
                <span className={`text-[10px] uppercase block ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Com T-shirt do Cliente:
                </span>
                <span className={`text-xs font-bold ${isWhite ? 'text-black' : 'text-white'}`}>
                  {OFFICIAL_PRICES.clientSuppliedTeeFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <span
            className={`text-xs font-mono mr-2 flex items-center gap-1 shrink-0 ${
              isWhite ? 'text-zinc-600' : 'text-zinc-500'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> FILTRAR:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? isWhite
                    ? 'bg-black text-white font-bold shadow-md'
                    : 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : isWhite
                  ? 'bg-white text-zinc-600 hover:text-black hover:bg-zinc-100 border border-zinc-200 shadow-xs'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Unified Grid: Real Photograph Models + Customization Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const chosenSize = getChosenSize(product.id);
            const isAdded = addedAnimation === product.id;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`group rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer relative border cf-card-hover ${
                  isWhite
                    ? 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xl shadow-sm'
                    : 'bg-zinc-950/80 border-zinc-900 hover:border-zinc-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.9)]'
                }`}
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span
                      className={`px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded border ${
                        isWhite
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-black/90 backdrop-blur-md border-white/20 text-white'
                      }`}
                    >
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Quick Zoom / Lightbox Trigger Button */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => handleOpenLightbox(product.id, e)}
                    className={`p-2 rounded-full border transition-all shadow-md cursor-pointer cf-btn-micro ${
                      isWhite
                        ? 'bg-white/90 hover:bg-black text-zinc-700 hover:text-white border-zinc-300 hover:border-black'
                        : 'bg-black/80 hover:bg-white text-zinc-300 hover:text-black border-zinc-700 hover:border-white shadow-lg'
                    }`}
                    aria-label={`Ampliar fotografia de ${product.name}`}
                    title="Ampliar fotografia em tamanho real"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Real Photograph Frame (Strictly original photo, no AI generation) */}
                <div
                  className={`relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center p-3 transition-colors ${
                    isWhite ? 'bg-zinc-100/90' : 'bg-zinc-900/30'
                  }`}
                  onClick={(e) => handleOpenLightbox(product.id, e)}
                  title="Clica para ampliar fotografia"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-108 cf-mask-reveal"
                  />
                  <div
                    className={`absolute bottom-2 left-3 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 pointer-events-none ${
                      isWhite
                        ? 'bg-white/90 text-zinc-800 border-zinc-300 shadow-sm'
                        : 'bg-black/80 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Clica para ampliar
                  </div>
                </div>

                {/* Product Details & Actions */}
                <div
                  className={`p-5 border-t flex flex-col justify-between gap-3 flex-1 ${
                    isWhite
                      ? 'bg-white border-zinc-200'
                      : 'bg-zinc-950 border-zinc-900'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-mono tracking-widest uppercase block mb-1 ${
                        isWhite ? 'text-zinc-500' : 'text-zinc-500'
                      }`}
                    >
                      {product.categoryLabel}
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`font-street text-base font-bold tracking-wider uppercase transition-colors ${
                          isWhite
                            ? 'text-black group-hover:text-zinc-700'
                            : 'text-white group-hover:text-zinc-200'
                        }`}
                      >
                        {product.name}
                      </h3>
                      <span
                        className={`font-street text-base font-bold tracking-wider whitespace-nowrap ${
                          isWhite ? 'text-black' : 'text-white'
                        }`}
                      >
                        {formatPrice(product.priceKz)}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-mono mt-1 line-clamp-2 leading-relaxed ${
                        isWhite ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {product.description}
                    </p>
                  </div>

                  {/* Size Selector and Actions */}
                  <div
                    className={`pt-3 border-t space-y-3 ${
                      isWhite ? 'border-zinc-200' : 'border-zinc-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono uppercase ${
                          isWhite ? 'text-zinc-600' : 'text-zinc-500'
                        }`}
                      >
                        Tamanho:
                      </span>
                      <div className="flex items-center gap-1">
                        {product.availableSizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={(e) => handleSelectSize(product.id, size, e)}
                            className={`w-6 h-6 text-[10px] font-mono font-semibold rounded flex items-center justify-center transition-all cursor-pointer ${
                              chosenSize === size
                                ? isWhite
                                  ? 'bg-black text-white ring-1 ring-black'
                                  : 'bg-white text-black ring-1 ring-white'
                                : isWhite
                                ? 'bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200 hover:border-zinc-400'
                                : 'bg-black text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600'
                            }`}
                            title={`Tamanho ${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`flex-1 py-2.5 px-3 rounded text-xs font-street font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer cf-btn-micro ${
                          isAdded
                            ? 'bg-green-600 text-white'
                            : isWhite
                            ? 'bg-black text-white hover:bg-zinc-800 shadow-sm'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Adicionado</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Adicionar &bull; {formatPrice(product.priceKz)}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickWhatsApp(product, e)}
                        className={`p-2.5 rounded border transition-all cursor-pointer cf-btn-micro ${
                          isWhite
                            ? 'bg-white border-zinc-300 hover:border-black text-zinc-700 hover:text-black'
                            : 'bg-black border-zinc-800 hover:border-white text-zinc-300 hover:text-white'
                        }`}
                        title="Pedir no WhatsApp Oficial (+244 958 194 301)"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Integrated Personalization Card with Correct Pricing */}
          <div
            className={`group rounded-lg p-6 flex flex-col justify-between relative overflow-hidden border transition-all duration-300 ${
              isWhite
                ? 'bg-gradient-to-br from-zinc-100 via-white to-zinc-50 border-zinc-300 hover:border-black shadow-md'
                : 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-white/20 hover:border-white'
            }`}
          >
            <div className="space-y-4 relative z-10">
              <div
                className={`w-10 h-10 border flex items-center justify-center rounded ${
                  isWhite
                    ? 'border-black/30 bg-white text-black'
                    : 'border-white/40 bg-black/60 text-white'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <span
                  className={`text-[10px] font-mono tracking-widest uppercase block ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  PERSONALIZAÇÃO SOB MEDIDA
                </span>
                <h3
                  className={`font-street text-2xl font-black italic tracking-wide uppercase leading-tight ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  A TUA IDEIA.
                  <br />
                  O TEU ESTILO.
                </h3>
                <p
                  className={`text-xs leading-relaxed font-sans ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  Personaliza a tua t-shirt com frases marcantes, ilustrações artísticas ou arte exclusiva à tua escolha.
                </p>
              </div>

              {/* Exact official pricing breakdown */}
              <div
                className={`p-3 rounded space-y-2 font-mono text-xs border ${
                  isWhite
                    ? 'bg-white border-zinc-200 shadow-xs'
                    : 'bg-black/80 border-zinc-800'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-1.5 border-b ${
                    isWhite ? 'border-zinc-200' : 'border-zinc-900'
                  }`}
                >
                  <span className={isWhite ? 'text-zinc-600' : 'text-zinc-300'}>
                    T-shirt da marca CF:
                  </span>
                  <span className={`font-bold ${isWhite ? 'text-black' : 'text-white'}`}>
                    {OFFICIAL_PRICES.cfBrandTeeFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isWhite ? 'text-zinc-600' : 'text-zinc-300'}>
                    Com T-shirt do cliente:
                  </span>
                  <span className={`font-bold ${isWhite ? 'text-black' : 'text-white'}`}>
                    {OFFICIAL_PRICES.clientSuppliedTeeFormatted}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                onClick={onOpenCustomize}
                className={`w-full py-3.5 font-street text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  isWhite
                    ? 'bg-black text-white hover:bg-zinc-800'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <span>PERSONALIZAR AGORA</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Enlarged View */}
      <ImageLightbox
        item={activeLightboxItem}
        items={filteredGalleryItems}
        onClose={() => setActiveLightboxItem(null)}
        onNavigate={handleLightboxNavigate}
      />
    </section>
  );
};
