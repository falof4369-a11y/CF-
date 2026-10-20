import React from 'react';
import { CartItem } from '../types';
import { formatPrice } from '../data/products';
import { getCartCheckoutWhatsAppUrl } from '../config/whatsapp';
import { useTheme } from '../context/ThemeContext';
import { X, Trash2, Plus, Minus, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onExploreProducts,
}) => {
  if (!isOpen) return null;

  const { isWhite } = useTheme();

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.priceKz * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;

    const checkoutItems = items.map((item) => ({
      name: item.product.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      totalFormatted: formatPrice(item.product.priceKz * item.quantity),
    }));

    const waUrl = getCartCheckoutWhatsAppUrl({
      items: checkoutItems,
      subtotalFormatted: formatPrice(subtotal),
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md h-full flex flex-col justify-between shadow-2xl p-6 overflow-hidden border-l transition-colors ${
          isWhite
            ? 'bg-white text-black border-zinc-200'
            : 'bg-zinc-950 text-white border-zinc-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isWhite ? 'border-zinc-200' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className={`w-5 h-5 ${isWhite ? 'text-black' : 'text-white'}`} />
            <h2
              className={`font-street text-xl font-bold tracking-wider uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              CARRINHO DE COMPRAS
            </h2>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                isWhite ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {totalItemsCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isWhite ? 'text-zinc-500 hover:text-black hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Cart Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div
                className={`w-16 h-16 border rounded-full flex items-center justify-center ${
                  isWhite ? 'border-zinc-300 text-zinc-400' : 'border-zinc-800 text-zinc-600'
                }`}
              >
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p
                  className={`font-street text-lg font-bold uppercase tracking-wider ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  O TEU CARRINHO ESTÁ VAZIO
                </p>
                <p className={`text-xs max-w-[240px] ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Descobre as nossas estampas exclusivas e veste a tua identidade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreProducts();
                }}
                className={`px-6 py-2.5 font-street text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                EXPLORAR PEÇAS
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg flex items-center gap-3.5 relative group transition-colors border ${
                  isWhite
                    ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                    : 'bg-black border-zinc-900 hover:border-zinc-700'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className={`w-16 h-16 rounded flex items-center justify-center shrink-0 overflow-hidden p-1 border ${
                    isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-street text-sm font-bold tracking-wider uppercase truncate ${
                      isWhite ? 'text-black' : 'text-white'
                    }`}
                  >
                    {item.product.name}
                  </h4>
                  <div
                    className={`flex items-center gap-2 text-[10px] font-mono mt-0.5 ${
                      isWhite ? 'text-zinc-600' : 'text-zinc-400'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded border ${
                        isWhite
                          ? 'bg-white border-zinc-200 text-black font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-white'
                      }`}
                    >
                      TAMANHO: {item.size}
                    </span>
                    <span>{item.color === 'black' ? 'PRETO' : item.color === 'charcoal' ? 'GRAFITE' : 'BRANCO'}</span>
                  </div>
                  <p className={`font-street text-xs font-bold mt-1 ${isWhite ? 'text-black' : 'text-white'}`}>
                    {formatPrice(item.product.priceKz * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between self-stretch">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remover peça"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div
                    className={`flex items-center rounded border ${
                      isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className={`px-2 py-0.5 text-xs cursor-pointer ${
                        isWhite ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      className={`px-1.5 text-xs font-mono font-bold ${
                        isWhite ? 'text-black' : 'text-white'
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className={`px-2 py-0.5 text-xs cursor-pointer ${
                        isWhite ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Subtotal & WhatsApp Checkout */}
        {items.length > 0 && (
          <div
            className={`pt-4 border-t space-y-3 ${
              isWhite ? 'border-zinc-200' : 'border-zinc-800'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-mono ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              <span>SUBTOTAL ({totalItemsCount} peças)</span>
              <span className={`font-bold ${isWhite ? 'text-black' : 'text-white'}`}>{formatPrice(subtotal)}</span>
            </div>

            <div
              className={`flex items-center justify-between text-sm font-street font-bold ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              <span>TOTAL ESTIMADO</span>
              <span className="text-lg">{formatPrice(subtotal)}</span>
            </div>

            <p className={`text-[10px] font-mono ${isWhite ? 'text-zinc-500' : 'text-zinc-500'}`}>
              * Entregas em Luanda e expedição para todas as províncias de Angola. Taxa de entrega calculada com base na morada indicada.
            </p>

            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              className={`w-full py-4 font-street text-xs font-bold tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                isWhite
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              <MessageCircle className={`w-4 h-4 ${isWhite ? 'fill-white' : 'fill-black'}`} />
              <span>FINALIZAR PEDIDO VIA WHATSAPP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClearCart}
              className={`w-full text-center text-[11px] font-mono underline py-1 cursor-pointer ${
                isWhite ? 'text-zinc-500 hover:text-black' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Esvaziar Carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
