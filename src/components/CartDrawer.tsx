import React from 'react';
import { CartItem } from '../types';
import { formatPrice, BRAND_CONFIG } from '../data/products';
import { TShirtMockup } from './TShirtMockup';
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

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.priceKz * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;

    let itemsList = '';
    items.forEach((item, index) => {
      itemsList += `${index + 1}. *${item.product.name}*\n   - Tamanho: *${item.size}*\n   - Cor: *${item.color === 'black' ? 'Preto' : item.color === 'charcoal' ? 'Grafite' : 'Branco'}*\n   - Quantidade: *${item.quantity}*\n   - Valor: *${formatPrice(item.product.priceKz * item.quantity)}*\n\n`;
    });

    const message = encodeURIComponent(
      `*PEDIDO OFICIAL — CF (CLASS FOCUS)*\n\n` +
      `Olá, equipa CF! Gostaria de finalizar a encomenda das seguintes peças:\n\n` +
      itemsList +
      `*TOTAL:* *${formatPrice(subtotal)}*\n\n` +
      `*Por favor, confirmem os dados de entrega:*\n` +
      `- Meu Nome Completo:\n` +
      `- Província / Município:\n` +
      `- Bairro / Ponto de Referência:\n` +
      `- Telefone Alternativo:\n\n` +
      `_Enviado através do site oficial da CF — Veste a Tua Identidade._`
    );

    const waUrl = `https://wa.me/${BRAND_CONFIG.phoneWhatsApp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl p-6 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2 className="font-street text-xl font-bold tracking-wider uppercase text-white">
              CARRINHO DE COMPRAS
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full">
              {totalItemsCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Cart Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-16 h-16 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-street text-lg font-bold uppercase tracking-wider text-white">
                  O TEU CARRINHO ESTÁ VAZIO
                </p>
                <p className="text-xs text-zinc-400 max-w-[240px]">
                  Descobre as nossas estampas exclusivas e veste a tua identidade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreProducts();
                }}
                className="px-6 py-2.5 bg-white text-black font-street text-xs font-bold tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors"
              >
                EXPLORAR PEÇAS
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center gap-3.5 relative group hover:border-zinc-700 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center shrink-0 overflow-hidden">
                  <TShirtMockup
                    frontDesign={item.product.frontDesign}
                    backDesign={item.product.backDesign}
                    view={item.product.isHero ? 'back' : 'front'}
                    interactive={false}
                    sizeTag={item.size}
                    color={item.color}
                    className="w-14 h-14"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-street text-sm font-bold tracking-wider uppercase text-white truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-white">
                      TAMANHO: {item.size}
                    </span>
                    <span>{item.color === 'black' ? 'PRETO' : item.color === 'charcoal' ? 'GRAFITE' : 'BRANCO'}</span>
                  </div>
                  <p className="font-street text-xs font-bold text-white mt-1">
                    {formatPrice(item.product.priceKz * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between self-stretch">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    title="Remover peça"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center border border-zinc-800 bg-zinc-950 rounded">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-1.5 text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white"
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
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>SUBTOTAL ({totalItemsCount} peças)</span>
              <span className="text-white font-bold">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-street font-bold text-white">
              <span>TOTAL ESTIMADO</span>
              <span className="text-lg">{formatPrice(subtotal)}</span>
            </div>

            <p className="text-[10px] font-mono text-zinc-500">
              * Entregas em Luanda e expedição para todas as províncias de Angola. Taxa de entrega calculada com base na morada indicada.
            </p>

            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              className="w-full py-4 bg-white text-black hover:bg-zinc-200 font-street text-xs font-bold tracking-[0.2em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>FINALIZAR PEDIDO VIA WHATSAPP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClearCart}
              className="w-full text-center text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline py-1"
            >
              Esvaziar Carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
