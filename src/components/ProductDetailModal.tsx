import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatPrice } from '../data/products';
import { getProductOrderWhatsAppUrl } from '../config/whatsapp';
import { useTheme } from '../context/ThemeContext';
import { X, ShoppingBag, MessageCircle, Ruler, Check, Shield, RotateCcw, Truck } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', quantity: number, color: string) => void;
  onOpenSizeGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  if (!product) return null;

  const { isWhite } = useTheme();
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [selectedColor, setSelectedColor] = useState<'black' | 'charcoal' | 'white'>(
    product.defaultColor || 'black'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.defaultColor || 'black');
      setSelectedSize('L');
      setQuantity(1);
    }
  }, [product]);

  const availableStock = product.stockStatus[selectedSize] ?? 5;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, quantity, selectedColor);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  const handleDirectWhatsApp = () => {
    const url = getProductOrderWhatsAppUrl({
      productName: product.name,
      size: selectedSize,
      quantity,
      priceFormatted: formatPrice(product.priceKz * quantity),
      color: selectedColor,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 sm:p-8 my-auto border transition-colors ${
          isWhite ? 'bg-white border-zinc-200 text-black' : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors z-20 cursor-pointer ${
            isWhite
              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black border-zinc-300'
              : 'bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
          }`}
          aria-label="Fechar detalhes do produto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Real Photograph Showcase */}
          <div
            className={`md:col-span-6 rounded-lg p-4 flex flex-col items-center justify-center relative min-h-[380px] border ${
              isWhite ? 'bg-zinc-100 border-zinc-200' : 'bg-black border-zinc-900'
            }`}
          >
            <div
              className={`w-full aspect-[4/3] flex items-center justify-center rounded overflow-hidden p-2 ${
                isWhite ? 'bg-white/80 shadow-xs' : 'bg-zinc-950/50'
              }`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Micro badge */}
            <div className="mt-3 text-center">
              <span
                className={`text-[10px] font-mono tracking-widest uppercase ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                FOTOGRAFIA OFICIAL DA MARCA CF &bull; 100% ALGODÃO
              </span>
            </div>
          </div>

          {/* Right Column: Product Information, Size, Quantity, Actions */}
          <div className="md:col-span-6 space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono tracking-widest uppercase ${
                    isWhite ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  {product.categoryLabel}
                </span>
                {product.badge && (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded border ${
                      isWhite
                        ? 'bg-black text-white border-black'
                        : 'bg-white/10 text-white border-white/20'
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
              <h2
                className={`font-street text-3xl font-black italic tracking-wide uppercase ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                {product.name}
              </h2>
              <p
                className={`font-street text-2xl font-bold tracking-wider mt-1 ${
                  isWhite ? 'text-black' : 'text-white'
                }`}
              >
                {formatPrice(product.priceKz)}
              </p>
            </div>

            {/* Description & Editorial story */}
            <p
              className={`text-xs leading-relaxed ${
                isWhite ? 'text-zinc-700' : 'text-zinc-300'
              }`}
            >
              {product.description}
            </p>
            <p
              className={`text-xs italic font-mono pl-3 py-1 border-l-2 ${
                isWhite
                  ? 'border-black text-zinc-600'
                  : 'border-white/40 text-zinc-400'
              }`}
            >
              "{product.story}"
            </p>

            {/* Color Switcher */}
            <div>
              <label
                className={`block text-[11px] font-mono tracking-widest uppercase mb-1.5 ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                Cor da Peça:
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedColor('black')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all cursor-pointer ${
                    selectedColor === 'black'
                      ? isWhite
                        ? 'border-black text-black bg-zinc-200 font-bold'
                        : 'border-white text-white bg-zinc-900 font-bold'
                      : isWhite
                      ? 'border-zinc-300 text-zinc-600 hover:text-black'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-black border border-zinc-500" />
                  Preto Clássico
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColor('charcoal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all cursor-pointer ${
                    selectedColor === 'charcoal'
                      ? isWhite
                        ? 'border-black text-black bg-zinc-200 font-bold'
                        : 'border-white text-white bg-zinc-900 font-bold'
                      : isWhite
                      ? 'border-zinc-300 text-zinc-600 hover:text-black'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#18181b] border border-zinc-400" />
                  Grafite
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColor('white')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all cursor-pointer ${
                    selectedColor === 'white'
                      ? isWhite
                        ? 'border-black text-black bg-zinc-100 font-bold'
                        : 'border-white text-white bg-zinc-900 font-bold'
                      : isWhite
                      ? 'border-zinc-300 text-zinc-600 hover:text-black'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-zinc-100 border border-zinc-400" />
                  Branco Puro
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`text-[11px] font-mono tracking-widest uppercase ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  Selecionar Tamanho:
                </label>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className={`text-[11px] font-mono underline flex items-center gap-1 cursor-pointer ${
                    isWhite ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Ruler className="w-3 h-3" /> Guia de Medidas
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.availableSizes.map((size) => {
                  const stock = product.stockStatus[size] ?? 0;
                  const isAvailable = stock > 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 text-xs font-mono font-bold rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedSize === size
                          ? isWhite
                            ? 'bg-black text-white ring-2 ring-black'
                            : 'bg-white text-black ring-2 ring-white'
                          : isAvailable
                          ? isWhite
                            ? 'bg-zinc-100 text-zinc-800 border border-zinc-300 hover:border-black'
                            : 'bg-black text-zinc-300 border border-zinc-800 hover:border-zinc-500'
                          : isWhite
                          ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed line-through'
                          : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed line-through'
                      }`}
                    >
                      <span>{size}</span>
                      <span className="text-[8px] opacity-70 mt-0.5 font-normal">
                        {stock} un
                      </span>
                    </button>
                  );
                })}
              </div>

              {availableStock <= 3 && availableStock > 0 && (
                <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-1.5 font-bold">
                  &bull; Apenas {availableStock} unidades disponíveis em tamanho {selectedSize}!
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span
                className={`text-[11px] font-mono tracking-widest uppercase ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                Quantidade:
              </span>
              <div
                className={`flex items-center rounded border ${
                  isWhite ? 'bg-zinc-100 border-zinc-300' : 'border-zinc-800 bg-black'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={`px-3 py-1 cursor-pointer ${
                    isWhite ? 'text-zinc-700 hover:text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  -
                </button>
                <span
                  className={`px-3 py-1 font-mono text-xs font-bold min-w-[2rem] text-center ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className={`px-3 py-1 cursor-pointer ${
                    isWhite ? 'text-zinc-700 hover:text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-4 text-xs font-street font-bold tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  addedSuccess
                    ? 'bg-green-600 text-white'
                    : isWhite
                    ? 'bg-black text-white hover:bg-zinc-800'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADICIONADO AO CARRINHO</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADICIONAR AO CARRINHO &bull; {formatPrice(product.priceKz * quantity)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className={`w-full py-3 text-xs font-street font-bold tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isWhite
                    ? 'bg-white border-zinc-300 hover:border-black text-black hover:bg-zinc-50'
                    : 'bg-black border-white/40 hover:border-white text-white hover:bg-white/10'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>ENCOMENDAR DIRETO NO WHATSAPP</span>
              </button>
            </div>

            {/* Fabric & Trust Badges */}
            <div
              className={`pt-4 border-t grid grid-cols-3 gap-2 text-center ${
                isWhite ? 'border-zinc-200' : 'border-zinc-900'
              }`}
            >
              <div className={`p-2 rounded border ${isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-black border-zinc-900'}`}>
                <Truck className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-500" />
                <span className={`text-[9px] font-mono uppercase block ${isWhite ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Luanda 24h &bull; Províncias
                </span>
              </div>
              <div className={`p-2 rounded border ${isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-black border-zinc-900'}`}>
                <Shield className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-500" />
                <span className={`text-[9px] font-mono uppercase block ${isWhite ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  100% Algodão 240g
                </span>
              </div>
              <div className={`p-2 rounded border ${isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-black border-zinc-900'}`}>
                <RotateCcw className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-500" />
                <span className={`text-[9px] font-mono uppercase block ${isWhite ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Troca em 7 dias
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
