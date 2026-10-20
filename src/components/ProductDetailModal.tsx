import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../data/products';
import { getProductOrderWhatsAppUrl } from '../config/whatsapp';
import { TShirtMockup } from './TShirtMockup';
import { X, ShoppingBag, MessageCircle, Ruler, Check, Shield, RotateCcw, Truck, Camera } from 'lucide-react';

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

  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [selectedColor, setSelectedColor] = useState<'black' | 'charcoal' | 'white'>('black');
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<'front' | 'back' | 'real'>(
    product.realPhotoUrl ? 'real' : (product.isHero || product.backDesign !== 'minimal-crest' ? 'back' : 'front')
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

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
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 sm:p-8 text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-black/60 border border-zinc-800 hover:border-zinc-500 transition-colors z-20"
          aria-label="Fechar detalhes do produto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Mockup Showcase with Interactive Toggle */}
          <div className="md:col-span-6 bg-black border border-zinc-900 rounded-lg p-4 flex flex-col items-center justify-center relative min-h-[380px]">
            {/* View Selector Controls */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2 self-end z-10">
              {product.realPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setView('real')}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded border transition-all flex items-center gap-1 ${
                    view === 'real'
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Foto Real</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setView('back')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded border transition-all ${
                  view === 'back'
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Costas
              </button>
              <button
                type="button"
                onClick={() => setView('front')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded border transition-all ${
                  view === 'front'
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Frente
              </button>
            </div>

            <div className="w-full max-w-[360px] py-2 flex items-center justify-center">
              {view === 'real' && product.realPhotoUrl ? (
                <div className="w-full aspect-square flex items-center justify-center rounded overflow-hidden p-1">
                  <img
                    src={product.realPhotoUrl}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <TShirtMockup
                  frontDesign={product.frontDesign}
                  backDesign={product.backDesign}
                  color={selectedColor}
                  view={view === 'front' ? 'front' : 'back'}
                  interactive={false}
                  sizeTag={selectedSize}
                />
              )}
            </div>

            {/* Micro badge */}
            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                {view === 'real'
                  ? 'FOTOGRAFIA OFICIAL DO LOOKBOOK'
                  : view === 'back'
                  ? 'ESTAMPA PRINCIPAL DE AUTOR'
                  : 'LOGÓTIPO NO PEITO'} &bull; 100% ALGODÃO HEAVYWEIGHT
              </span>
            </div>
          </div>

          {/* Right Column: Product Information, Size, Quantity, Actions */}
          <div className="md:col-span-6 space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono tracking-widest uppercase text-zinc-400">
                  {product.categoryLabel}
                </span>
                {product.badge && (
                  <span className="px-2 py-0.5 bg-white/10 text-[9px] font-mono tracking-widest uppercase text-white rounded border border-white/20">
                    {product.badge}
                  </span>
                )}
              </div>
              <h2 className="font-street text-3xl font-black italic tracking-wide uppercase text-white">
                {product.name}
              </h2>
              <p className="font-street text-2xl font-bold tracking-wider text-white mt-1">
                {formatPrice(product.priceKz)}
              </p>
            </div>

            {/* Description & Editorial story */}
            <p className="text-xs text-zinc-300 leading-relaxed">
              {product.description}
            </p>
            <p className="text-xs text-zinc-400 italic font-mono border-l-2 border-white/40 pl-3 py-1">
              "{product.story}"
            </p>

            {/* Color Switcher */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5">
                Cor da Peça:
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedColor('black')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all ${
                    selectedColor === 'black'
                      ? 'border-white text-white bg-zinc-900 font-bold'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-black border border-zinc-600" />
                  Preto Clássico
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColor('charcoal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all ${
                    selectedColor === 'charcoal'
                      ? 'border-white text-white bg-zinc-900 font-bold'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#18181b] border border-zinc-500" />
                  Grafite
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColor('white')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all ${
                    selectedColor === 'white'
                      ? 'border-white text-white bg-zinc-900 font-bold'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-zinc-200 border border-white" />
                  Branco Puro
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
                  Selecionar Tamanho:
                </label>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white underline flex items-center gap-1"
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
                      className={`py-2.5 text-xs font-mono font-bold rounded flex flex-col items-center justify-center transition-all ${
                        selectedSize === size
                          ? 'bg-white text-black ring-2 ring-white'
                          : isAvailable
                          ? 'bg-black text-zinc-300 border border-zinc-800 hover:border-zinc-500'
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
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mt-1.5">
                  &bull; Apenas {availableStock} unidades disponíveis em tamanho {selectedSize}!
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
                Quantidade:
              </span>
              <div className="flex items-center border border-zinc-800 bg-black rounded">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-zinc-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 py-1 font-mono text-xs font-bold text-white min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="px-3 py-1 text-zinc-400 hover:text-white"
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
                className={`w-full py-4 text-xs font-street font-bold tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  addedSuccess
                    ? 'bg-green-500 text-black'
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
                className="w-full py-3 bg-black border border-white/40 hover:border-white text-white text-xs font-street font-bold tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ENCOMENDAR DIRETO NO WHATSAPP</span>
              </button>
            </div>

            {/* Fabric & Trust Badges */}
            <div className="pt-4 border-t border-zinc-900 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-black rounded border border-zinc-900">
                <Truck className="w-3.5 h-3.5 mx-auto text-zinc-400 mb-1" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">
                  Luanda 24h &bull; Províncias
                </span>
              </div>
              <div className="p-2 bg-black rounded border border-zinc-900">
                <Shield className="w-3.5 h-3.5 mx-auto text-zinc-400 mb-1" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">
                  100% Algodão 240g
                </span>
              </div>
              <div className="p-2 bg-black rounded border border-zinc-900">
                <RotateCcw className="w-3.5 h-3.5 mx-auto text-zinc-400 mb-1" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">
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
