import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CFLogo } from './CFLogo';
import { lookupOrdersForCourierAPI, verifyDeliveryCodeAPI } from '../services/api';
import {
  X,
  Truck,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  User,
  Clock,
  RotateCcw,
  ArrowRight,
  PackageCheck,
  Phone,
} from 'lucide-react';

interface CourierDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeliveryConfirmed?: () => void;
}

interface SanitizedOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  maskedPhone: string;
  model: string;
  size: string;
  quantity: number;
  totalPriceKz: number;
  orderStatus: string;
  deliveryStatus: string;
  deliveryCodeConsumed: boolean;
  date: string;
  createdAt?: string;
}

export const CourierDeliveryModal: React.FC<CourierDeliveryModalProps> = ({
  isOpen,
  onClose,
  onDeliveryConfirmed,
}) => {
  const { isWhite } = useTheme();

  // Courier Session State
  const [courierName, setCourierName] = useState<string>(() => {
    try {
      return sessionStorage.getItem('cf_courier_name') || '';
    } catch {
      return '';
    }
  });
  const [courierPin, setCourierPin] = useState('');
  const [isCourierAuthenticated, setIsCourierAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('cf_courier_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SanitizedOrder[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected Order for Verification
  const [selectedOrder, setSelectedOrder] = useState<SanitizedOrder | null>(null);
  const [inputDeliveryCode, setInputDeliveryCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [successData, setSuccessData] = useState<{
    orderNumber: string;
    clientName: string;
    confirmedAt: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset temporary verification views on modal close
      setSelectedOrder(null);
      setInputDeliveryCode('');
      setVerificationError(null);
      setSuccessData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Courier Login
  const handleCourierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!courierName.trim() || courierName.trim().length < 2) {
      setAuthError('Por favor indica o teu nome ou identificador de estafeta.');
      return;
    }

    // Courier PIN check (supports 2026 or 2008)
    if (courierPin !== '2026' && courierPin !== '2008') {
      setAuthError('Código de acesso do estafeta incorreto. (Predefinição de teste: 2026)');
      return;
    }

    try {
      sessionStorage.setItem('cf_courier_auth', 'true');
      sessionStorage.setItem('cf_courier_name', courierName.trim());
    } catch {}

    setIsCourierAuthenticated(true);
  };

  const handleCourierLogout = () => {
    try {
      sessionStorage.removeItem('cf_courier_auth');
      sessionStorage.removeItem('cf_courier_name');
    } catch {}
    setIsCourierAuthenticated(false);
    setSelectedOrder(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Perform search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }

    setIsSearching(true);
    setVerificationError(null);
    try {
      const orders = await lookupOrdersForCourierAPI(query);
      setSearchResults(orders);
      setHasSearched(true);
    } catch (err: any) {
      setVerificationError('Erro na pesquisa de encomendas.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select an order
  const handleSelectOrder = (order: SanitizedOrder) => {
    setSelectedOrder(order);
    setInputDeliveryCode('');
    setVerificationError(null);
    setSuccessData(null);
  };

  // Verify delivery confirmation code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const code = inputDeliveryCode.trim();
    if (!code || code.length < 4) {
      setVerificationError('Por favor introduz o código de confirmação completo fornecido pelo cliente.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await verifyDeliveryCodeAPI(
        selectedOrder.id,
        code,
        courierName || 'Estafeta CF'
      );

      if (res.success) {
        setSuccessData({
          orderNumber: selectedOrder.orderNumber,
          clientName: selectedOrder.clientName,
          confirmedAt: res.order?.deliveryConfirmedAt || new Date().toISOString(),
        });
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                deliveryStatus: 'entregue_e_confirmada',
                deliveryCodeConsumed: true,
              }
            : null
        );
        onDeliveryConfirmed?.();
      } else {
        setVerificationError(res.message);
        if (res.remainingAttempts !== undefined) {
          setRemainingAttempts(res.remainingAttempts);
        }
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Falha na validação do código com o servidor.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border transition-colors ${
          isWhite ? 'bg-zinc-50 border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
            isWhite ? 'bg-white border-zinc-200' : 'bg-black border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-street text-base sm:text-lg font-bold uppercase tracking-wider">
                  Confirmar Entrega
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Estafeta CF
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">
                Validação única de códigos de entrega no ato da receção física
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isWhite
                ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
            }`}
            aria-label="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: COURIER LOGIN */}
          {!isCourierAuthenticated ? (
            <form onSubmit={handleCourierLogin} className="space-y-4 max-w-sm mx-auto py-4">
              <div className="text-center space-y-1 mb-4">
                <CFLogo size="sm" />
                <h4 className="font-street text-lg font-bold uppercase tracking-wider mt-2">
                  Identificação do Entregador
                </h4>
                <p className="text-xs font-mono text-zinc-500">
                  Inicia sessão com a tua conta de estafeta para consultar pedidos e validar entregas por código.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                  Nome do Entregador *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Ex: Carlos Domingos (Estafeta 1)"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded border focus:outline-none ${
                      isWhite
                        ? 'bg-white border-zinc-300 focus:border-black text-black'
                        : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                  Código de Acesso do Estafeta *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={courierPin}
                    onChange={(e) => setCourierPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN (4 dígitos - ex: 2026)"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest rounded border focus:outline-none ${
                      isWhite
                        ? 'bg-white border-zinc-300 focus:border-black text-black'
                        : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                  Código de teste predefinido: <strong>2026</strong> ou <strong>2008</strong>
                </span>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 font-street text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                Aceder ao Painel de Entregas
              </button>
            </form>
          ) : successData ? (
            /* STEP 3B: SUCCESS CONFIRMATION */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400">
                  ENTREGA CONFIRMADA COM SUCESSO
                </span>
                <h4 className="font-street text-xl sm:text-2xl font-bold uppercase">
                  {successData.orderNumber}
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Cliente: <strong>{successData.clientName}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-mono space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Data/Hora da Validação:</span>
                  <span className="text-white font-bold">{new Date(successData.confirmedAt).toLocaleString('pt-PT')}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Entregador Registado:</span>
                  <span className="text-white font-bold">{courierName}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Estado do Código:</span>
                  <span className="text-emerald-400 font-bold uppercase">Consumido (Uso Único)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>Estado Financeiro:</span>
                  <span className="text-amber-400 font-bold">Independente (Gestor Financeiro)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setSelectedOrder(null);
                    handleSearch();
                  }}
                  className={`px-5 py-2.5 rounded font-street text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  Confirmar Outra Entrega
                </button>
              </div>
            </div>
          ) : selectedOrder ? (
            /* STEP 3A: INPUT CONFIRMATION CODE FOR SELECTED ORDER */
            <div className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                &larr; Voltar à pesquisa de encomendas
              </button>

              {/* Order Card Preview */}
              <div
                className={`p-4 rounded-xl border ${
                  isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-street text-base font-bold uppercase text-white">
                    {selectedOrder.orderNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      selectedOrder.deliveryCodeConsumed || selectedOrder.deliveryStatus === 'entregue_e_confirmada'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {selectedOrder.deliveryStatus === 'entregue_e_confirmada'
                      ? 'Já Entregue'
                      : 'Pendente de Entrega'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Cliente:</span>
                    <strong className="text-white">{selectedOrder.clientName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Telefone:</span>
                    <span className="text-zinc-300">{selectedOrder.maskedPhone}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-zinc-800">
                    <span className="text-zinc-500 block text-[10px] uppercase">Artigo:</span>
                    <span className="text-zinc-300">
                      {selectedOrder.quantity}x {selectedOrder.model} ({selectedOrder.size})
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.deliveryCodeConsumed || selectedOrder.deliveryStatus === 'entregue_e_confirmada' ? (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Esta encomenda já foi entregue e o código validado.</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">
                    O código era de utilização única e não pode ser reutilizado.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border ${
                      isWhite ? 'bg-zinc-100 border-zinc-200' : 'bg-black/60 border-zinc-800'
                    }`}
                  >
                    <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                      <span>Código de Confirmação do Cliente *</span>
                      <span className="text-[10px] text-zinc-500 lowercase font-normal">
                        6 dígitos (solicita ao cliente)
                      </span>
                    </label>

                    <input
                      type="text"
                      maxLength={8}
                      autoFocus
                      required
                      value={inputDeliveryCode}
                      onChange={(e) => setInputDeliveryCode(e.target.value.toUpperCase())}
                      placeholder="Ex: 582914"
                      className={`w-full px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-700 focus:border-emerald-400 text-emerald-400'
                      }`}
                    />

                    <p className="text-[10px] font-mono text-zinc-500 mt-2 text-center">
                      O cliente tem este código na tela de confirmação do pedido ou no WhatsApp.
                    </p>
                  </div>

                  {verificationError && (
                    <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{verificationError}</span>
                      </div>
                      {remainingAttempts !== null && (
                        <p className="text-[10px] text-red-300">
                          Tentativas restantes antes de bloqueio temporário: {remainingAttempts}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || !inputDeliveryCode.trim()}
                    className={`w-full py-3 font-street text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isWhite
                        ? 'bg-black text-white hover:bg-zinc-800 disabled:opacity-50'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>{isVerifying ? 'A Validar no Servidor...' : 'Validar e Confirmar Entrega'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STEP 2: SEARCH & LIST ORDERS */
            <div className="space-y-4">
              {/* Courier Header with Session Info */}
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800/60">
                <span className="text-zinc-400">
                  Sessão ativa: <strong className="text-white">{courierName}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCourierLogout}
                  className="text-zinc-500 hover:text-white underline cursor-pointer"
                >
                  Terminar Sessão
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider font-bold">
                  Localizar Encomenda do Cliente:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nome do cliente ou número (ex: Mauro ou CF-2026)..."
                      className={`w-full pl-9 pr-3 py-2.5 text-xs rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className={`px-4 py-2.5 font-street text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                      isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {isSearching ? '...' : 'Buscar'}
                  </button>
                </div>
              </form>

              {/* Results List */}
              <div className="space-y-2 pt-2">
                {isSearching ? (
                  <div className="text-center py-8 text-xs font-mono text-zinc-500">
                    A pesquisar encomendas...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                      Encomendas Encontradas ({searchResults.length}):
                    </span>
                    {searchResults.map((order) => {
                      const isDelivered =
                        order.deliveryCodeConsumed || order.deliveryStatus === 'entregue_e_confirmada';
                      return (
                        <div
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isWhite
                              ? 'bg-white border-zinc-200 hover:border-black'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-street text-sm font-bold uppercase truncate">
                                {order.clientName}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {order.orderNumber}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 truncate">
                              {order.quantity}x {order.model} ({order.size}) &bull; {order.maskedPhone}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold block mb-1 ${
                                isDelivered
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {isDelivered ? 'Entregue' : 'Confirmar'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 flex items-center justify-end gap-1">
                              <span>Validar</span> &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : hasSearched ? (
                  <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-500">
                    Nenhum pedido encontrado com o termo &quot;{searchQuery}&quot;. Verifica o nome ou número do pedido.
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 text-xs font-mono text-zinc-500 text-center space-y-1">
                    <p>Digita o nome do cliente ou o número da encomenda para iniciar a confirmação de entrega.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
