import React, { useState, useEffect, useMemo } from 'react';
import { CustomOrder, OrderStatus, PaymentStatus, DeliveryStatus } from '../types';
import { formatPrice } from '../data/products';
import {
  getAllCustomOrders,
  deleteCustomOrder,
  updateOrderFulfillment,
  updateOrderFinancialRecord,
  exportAllDataAsJSON,
  importDataFromJSON,
} from '../services/db';
import { updateOrderStatusAPI } from '../services/api';
import { changeAdminPin, logoutAdmin } from '../services/adminAuth';
import { useTheme } from '../context/ThemeContext';
import { CFLogo } from './CFLogo';
import { FinancialManager } from './FinancialManager';
import { CourierDeliveryModal } from './CourierDeliveryModal';
import { getGeneralWhatsAppUrl } from '../config/whatsapp';
import {
  X,
  ShoppingBag,
  DollarSign,
  Truck,
  KeyRound,
  Download,
  Upload,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Clock,
  ShieldCheck,
  Calendar,
  Users,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

type TabType = 'orders' | 'finance' | 'courier' | 'security';

interface DeleteConfirmation {
  id: string;
  title: string;
  subtitle?: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isWhite } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  // Orders data
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters for "Pedidos e Entregas"
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Deletion modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  // Courier test modal shortcut
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);

  // Security: PIN change form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');

  // Copy code feedback map
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const reloadData = async () => {
    setLoading(true);
    try {
      const ords = await getAllCustomOrders();
      setCustomOrders(ords);
    } catch (e) {
      console.error('Error reloading admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  // Filtered orders logic
  const filteredOrders = customOrders.filter((order) => {
    // 1. Search Query (name, phone, orderNumber, deliveryCode)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = (order.clientName || '').toLowerCase().includes(q);
      const matchPhone = (order.phone || '').replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const matchOrderNum = (order.orderNumber || '').toLowerCase().includes(q);
      const matchCode = (order.deliveryCode || '').toLowerCase().includes(q);
      const matchId = (order.id || '').toLowerCase().includes(q);

      if (!matchName && !matchPhone && !matchOrderNum && !matchCode && !matchId) {
        return false;
      }
    }

    // 2. Order Status Filter
    if (orderStatusFilter !== 'all') {
      const currentStatus = order.orderStatus || 'recebido';
      if (currentStatus !== orderStatusFilter) return false;
    }

    // 3. Payment Status Filter
    if (paymentStatusFilter !== 'all') {
      const currentPay = order.paymentStatus || 'por_confirmar';
      if (currentPay !== paymentStatusFilter) return false;
    }

    // 4. Delivery Status Filter
    if (deliveryStatusFilter !== 'all') {
      const currentDeliv = order.deliveryStatus || 'pendente';
      if (currentDeliv !== deliveryStatusFilter) return false;
    }

    // 5. Date Filter
    if (dateFilter !== 'all' && order.date) {
      const today = new Date().toISOString().slice(0, 10);
      if (dateFilter === 'today') {
        if (order.date !== today) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        if (order.date < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        if (order.date < monthAgo) return false;
      }
    }

    return true;
  });

  // Similar names detection helper
  const nameOccurrences = useMemo(() => {
    const map = new Map<string, number>();
    customOrders.forEach((o) => {
      const clean = (o.clientName || '').toLowerCase().trim();
      if (clean) {
        map.set(clean, (map.get(clean) || 0) + 1);
      }
    });
    return map;
  }, [customOrders]);

  // Update order status on server & locally
  const handleUpdateStatus = async (
    id: string,
    field: 'orderStatus' | 'paymentStatus' | 'deliveryStatus',
    value: string
  ) => {
    try {
      await updateOrderStatusAPI(id, { [field]: value });
      showToast(`Estado atualizado com sucesso.`);
      await reloadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar estado no servidor.', 'error');
    }
  };

  // Execution of confirmed deletion
  const executeConfirmedDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteCustomOrder(deleteConfirmation.id);
      showToast(`Pedido "${deleteConfirmation.title}" eliminado.`);
      setDeleteConfirmation(null);
      await reloadData();
    } catch (err: any) {
      showToast(`Erro ao eliminar: ${err?.message || 'Falha de comunicação'}`, 'error');
    }
  };

  // Copy code handler
  const handleCopyCode = (id: string, code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {}
  };

  // Security: PIN change submit
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');

    if (newPin.length !== 4) {
      setPinChangeError('O novo código deve ter exatamente 4 dígitos.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeError('A confirmação do novo código não coincide.');
      return;
    }

    const res = await changeAdminPin(currentPin, newPin);
    if (res.success) {
      setPinChangeSuccess('Código de acesso atualizado com sucesso!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      showToast('Código de acesso alterado com sucesso!');
    } else {
      setPinChangeError(res.error || 'Código atual incorreto.');
    }
  };

  // Backup handlers
  const handleExportBackup = async () => {
    try {
      const json = await exportAllDataAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cf-brand-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exportado com sucesso!');
    } catch (e) {
      showToast('Erro ao exportar backup', 'error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await importDataFromJSON(reader.result as string);
      if (res.success) {
        showToast(res.message);
        await reloadData();
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-6xl h-[94vh] sm:h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl border transition-colors ${
          isWhite ? 'bg-zinc-50 border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          className={`px-4 sm:px-6 py-3.5 flex items-center justify-between border-b shrink-0 ${
            isWhite ? 'bg-white border-zinc-200' : 'bg-black border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <CFLogo size="sm" glow />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-street text-base sm:text-lg font-bold tracking-wider uppercase">
                  PAINEL ADMINISTRATIVO CF
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase">
                  SESSÃO SEGURA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-500 hidden sm:block">
                Pedidos &bull; Confirmação de Entregas &bull; Gestão Financeira &bull; Segurança
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isWhite
                  ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                  : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
              }`}
              title="Sair da Administração"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminar Sessão</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-full border transition-colors cursor-pointer ${
                isWhite
                  ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                  : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
              }`}
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-mono flex items-center justify-between shrink-0 animate-fade-in ${
              toastMsg.type === 'error'
                ? 'bg-red-500 text-white'
                : isWhite
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-xs uppercase font-bold underline cursor-pointer">
              Fechar
            </button>
          </div>
        )}

        {/* Confirmation Modal for Order Deletion */}
        {deleteConfirmation && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div
              className={`max-w-md w-full p-6 rounded-xl border shadow-2xl space-y-4 ${
                isWhite ? 'bg-white border-zinc-300 text-black' : 'bg-zinc-900 border-zinc-700 text-white'
              }`}
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-street text-lg font-bold uppercase tracking-wider">
                  Confirmar Eliminação do Pedido
                </h4>
              </div>

              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Tens a certeza de que desejas eliminar permanentemente o pedido de{' '}
                <strong className={isWhite ? 'text-black' : 'text-white'}>
                  &quot;{deleteConfirmation.title}&quot;
                </strong>
                ?
              </p>

              {deleteConfirmation.subtitle && (
                <p className="text-[11px] font-mono text-zinc-500 bg-zinc-800/40 p-2.5 rounded border border-zinc-800">
                  {deleteConfirmation.subtitle}
                </p>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border border-zinc-600 hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedDelete}
                  className="px-5 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout: Sidebar Navigation + Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <aside
            className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-2 sm:p-3 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1.5 ${
              isWhite ? 'bg-white/80 border-zinc-200' : 'bg-black/60 border-zinc-800'
            }`}
          >
            {/* 1. Pedidos e Entregas */}
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`whitespace-nowrap px-3 py-2.5 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? isWhite
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'bg-white text-black font-bold shadow-sm'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>1. Pedidos e Entregas</span>
              </div>
              <span className="text-[10px] font-bold opacity-75 ml-2 font-mono">
                ({customOrders.length})
              </span>
            </button>

            {/* 2. Gestor Financeiro */}
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={`whitespace-nowrap px-3 py-2.5 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'finance'
                  ? isWhite
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'bg-white text-black font-bold shadow-sm'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>2. Gestor Financeiro</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold font-mono ml-2">
                TESTE
              </span>
            </button>

            {/* 3. Confirmar Entrega (Interface do Entregador) */}
            <button
              type="button"
              onClick={() => setActiveTab('courier')}
              className={`whitespace-nowrap px-3 py-2.5 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'courier'
                  ? isWhite
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'bg-white text-black font-bold shadow-sm'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>3. Confirmar Entrega</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                CÓDIGO
              </span>
            </button>

            {/* 4. Código de Acesso */}
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`whitespace-nowrap px-3 py-2.5 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'security'
                  ? isWhite
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'bg-white text-black font-bold shadow-sm'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>4. Código de Acesso</span>
              </div>
            </button>

            {/* Backup & System Status Info in Sidebar */}
            <div className="hidden md:block mt-auto pt-4 border-t border-zinc-800/60 space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className={`w-full py-2 px-3 text-[11px] font-mono uppercase tracking-wider rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup</span>
              </button>

              <label
                className={`w-full py-2 px-3 text-[11px] font-mono uppercase tracking-wider rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Backup</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800/60 text-[10px] font-mono text-zinc-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Backend Servidor:</span>
                  <strong className="text-emerald-400">Ativo</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Base de Dados:</span>
                  <span className="text-zinc-400">data/orders.json</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {/* TAB 1: PEDIDOS E ENTREGAS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/50">
                  <div>
                    <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
                      <span>Pedidos e Entregas</span>
                      <span className="text-xs font-mono text-zinc-500">
                        ({filteredOrders.length} de {customOrders.length})
                      </span>
                    </h3>
                    <p className="text-xs font-mono text-zinc-500">
                      Consulta detalhada, códigos de confirmação exclusivos e controlo independente de estados.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCourierModalOpen(true)}
                    className="px-3.5 py-2 rounded text-xs font-mono uppercase font-bold tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Abrir Simulador do Entregador</span>
                  </button>
                </div>

                {/* Search & Filter Controls */}
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isWhite ? 'bg-zinc-100/90 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Search Field */}
                    <div className="sm:col-span-6 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por cliente, telefone, nº do pedido ou código..."
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-950 border-zinc-800 focus:border-white text-white'
                        }`}
                      />
                    </div>

                    {/* Period Filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className={`w-full px-2.5 py-2 text-xs rounded border font-mono focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 text-black'
                            : 'bg-zinc-950 border-zinc-800 text-white'
                        }`}
                      >
                        <option value="all">Todas as Datas</option>
                        <option value="today">Hoje</option>
                        <option value="week">Últimos 7 Dias</option>
                        <option value="month">Últimos 30 Dias</option>
                      </select>
                    </div>

                    {/* Clear Button */}
                    <div className="sm:col-span-3 text-right">
                      {(searchTerm ||
                        orderStatusFilter !== 'all' ||
                        paymentStatusFilter !== 'all' ||
                        deliveryStatusFilter !== 'all' ||
                        dateFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setOrderStatusFilter('all');
                            setPaymentStatusFilter('all');
                            setDeliveryStatusFilter('all');
                            setDateFilter('all');
                          }}
                          className="px-3 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-white rounded border border-zinc-800 hover:bg-zinc-800 cursor-pointer w-full sm:w-auto"
                        >
                          Limpar Filtros
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/40 text-xs font-mono">
                    {/* Order Status */}
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Estado do Pedido:</span>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                        className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 text-black'
                            : 'bg-zinc-950 border-zinc-800 text-white'
                        }`}
                      >
                        <option value="all">Todos os Pedidos</option>
                        <option value="recebido">Recebido</option>
                        <option value="em_preparacao">Em Preparação</option>
                        <option value="pronto_para_entrega">Pronto para Entrega</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Estado do Pagamento:</span>
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                        className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 text-black'
                            : 'bg-zinc-950 border-zinc-800 text-white'
                        }`}
                      >
                        <option value="all">Todos os Pagamentos</option>
                        <option value="por_confirmar">Por Confirmar</option>
                        <option value="parcialmente_pago">Parcialmente Pago</option>
                        <option value="pago">Pago</option>
                        <option value="nao_pago">Não Pago</option>
                      </select>
                    </div>

                    {/* Delivery Status */}
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Estado da Entrega:</span>
                      <select
                        value={deliveryStatusFilter}
                        onChange={(e) => setDeliveryStatusFilter(e.target.value as any)}
                        className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 text-black'
                            : 'bg-zinc-950 border-zinc-800 text-white'
                        }`}
                      >
                        <option value="all">Todas as Entregas</option>
                        <option value="pendente">Pendente</option>
                        <option value="em_distribuicao">Em Distribuição</option>
                        <option value="entregue_e_confirmada">Entregue e Confirmada</option>
                        <option value="falha_na_entrega">Falha na Entrega</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-xs font-mono text-zinc-500 border border-dashed rounded-xl space-y-2">
                    <p className="font-bold text-zinc-400">
                      {customOrders.length === 0
                        ? 'Ainda não existem encomendas registadas no sistema.'
                        : 'Nenhuma encomenda encontrada com os critérios de filtro selecionados.'}
                    </p>
                    <p className="text-[11px] text-zinc-600 max-w-md mx-auto">
                      Os novos pedidos submetidos pelos clientes através do formulário de personalização aparecerão aqui em tempo real.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const cleanName = (order.clientName || '').toLowerCase().trim();
                      const hasSimilarNames = (nameOccurrences.get(cleanName) || 0) > 1;

                      const currentOrderStatus = order.orderStatus || 'recebido';
                      const currentPaymentStatus = order.paymentStatus || 'por_confirmar';
                      const currentDeliveryStatus = order.deliveryStatus || 'pendente';

                      return (
                        <div
                          key={order.id}
                          className={`p-4 sm:p-5 rounded-xl border space-y-4 transition-all ${
                            isWhite
                              ? 'bg-white border-zinc-200 shadow-sm'
                              : 'bg-zinc-900/60 border-zinc-800'
                          }`}
                        >
                          {/* Order Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-street text-lg font-bold uppercase text-white">
                                  {order.orderNumber || order.id}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  Data: {order.date} {order.createdAt ? `• ${new Date(order.createdAt).toLocaleTimeString('pt-PT')}` : ''}
                                </span>
                                {hasSimilarNames && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>Clientes com nomes semelhantes</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                                <span className="font-bold text-white">{order.clientName}</span>
                                <span>&bull;</span>
                                <span>{order.phone}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Direct WhatsApp link */}
                              <a
                                href={getGeneralWhatsAppUrl(`Olá ${order.clientName}! Contactamos da CF relativamente à sua encomenda ${order.orderNumber || order.id}.`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded text-xs font-mono uppercase bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Falar com o cliente no WhatsApp"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>WhatsApp Cliente</span>
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmation({
                                    id: order.id,
                                    title: `Pedido de ${order.clientName}`,
                                    subtitle: `Nº ${order.orderNumber || order.id} • Modelo: ${order.model} • Total: ${formatPrice(order.totalPriceKz)}`,
                                  })
                                }
                                className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                                title="Eliminar este pedido"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Order Details & Delivery Code Section */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                            {/* Col 1: Product Specifications */}
                            <div className="space-y-1 text-zinc-400">
                              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Artigo Encomendado:</span>
                              <div className="text-white font-medium">
                                {order.quantity}x {order.model} ({order.size})
                              </div>
                              <div>Cor: {order.color === 'white' ? 'Branco' : 'Preto'} • Local: {order.placement}</div>
                              {order.phrase && (
                                <div className="text-zinc-300 italic">
                                  Frase: &quot;{order.phrase}&quot;
                                </div>
                              )}
                              {order.notes && (
                                <div className="text-zinc-500 text-[11px]">
                                  Obs: {order.notes}
                                </div>
                              )}
                              <div className="pt-1 text-emerald-400 font-bold">
                                Valor Total: {formatPrice(order.totalPriceKz)}
                              </div>
                            </div>

                            {/* Col 2: Confirmation Delivery Code (Authorized view) */}
                            <div
                              className={`p-3 rounded-xl border flex flex-col justify-between ${
                                isWhite
                                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                                  : 'bg-black/50 border-zinc-800 text-white'
                              }`}
                            >
                              <div>
                                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-bold">
                                  Código de Confirmação de Entrega:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-2xl font-black tracking-widest text-emerald-400">
                                    {order.deliveryCode || 'N/D'}
                                  </span>
                                  {order.deliveryCode && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(order.id, order.deliveryCode!)}
                                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                      title="Copiar código"
                                    >
                                      {copiedCodeId === order.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-0.5">
                                <div>
                                  Estado do Código:{' '}
                                  <strong
                                    className={
                                      order.deliveryCodeConsumed ? 'text-emerald-400' : 'text-amber-400'
                                    }
                                  >
                                    {order.deliveryCodeConsumed ? 'CONSUMIDO' : 'ATIVO (PENDENTE)'}
                                  </strong>
                                </div>
                                {order.deliveryConfirmedAt && (
                                  <div className="text-[10px] text-zinc-500">
                                    Validado em: {new Date(order.deliveryConfirmedAt).toLocaleString('pt-PT')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Col 3: Independent Status Selectors (Section 6) */}
                            <div className="space-y-2">
                              {/* Order Status */}
                              <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">
                                  Estado do Pedido:
                                </label>
                                <select
                                  value={currentOrderStatus}
                                  onChange={(e) => handleUpdateStatus(order.id, 'orderStatus', e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded border focus:outline-none ${
                                    isWhite
                                      ? 'bg-white border-zinc-300 text-black'
                                      : 'bg-zinc-950 border-zinc-800 text-white'
                                  }`}
                                >
                                  <option value="recebido">Recebido</option>
                                  <option value="em_preparacao">Em Preparação</option>
                                  <option value="pronto_para_entrega">Pronto para Entrega</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>
                              </div>

                              {/* Payment Status */}
                              <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">
                                  Estado do Pagamento:
                                </label>
                                <select
                                  value={currentPaymentStatus}
                                  onChange={(e) => handleUpdateStatus(order.id, 'paymentStatus', e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded border focus:outline-none ${
                                    isWhite
                                      ? 'bg-white border-zinc-300 text-black'
                                      : 'bg-zinc-950 border-zinc-800 text-white'
                                  }`}
                                >
                                  <option value="por_confirmar">Por Confirmar</option>
                                  <option value="parcialmente_pago">Parcialmente Pago</option>
                                  <option value="pago">Pago</option>
                                  <option value="nao_pago">Não Pago</option>
                                </select>
                              </div>

                              {/* Delivery Status */}
                              <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">
                                  Estado da Entrega:
                                </label>
                                <select
                                  value={currentDeliveryStatus}
                                  onChange={(e) => handleUpdateStatus(order.id, 'deliveryStatus', e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded border focus:outline-none ${
                                    isWhite
                                      ? 'bg-white border-zinc-300 text-black'
                                      : 'bg-zinc-950 border-zinc-800 text-white'
                                  }`}
                                >
                                  <option value="pendente">Pendente</option>
                                  <option value="em_distribuicao">Em Distribuição</option>
                                  <option value="entregue_e_confirmada">Entregue e Confirmada</option>
                                  <option value="falha_na_entrega">Falha na Entrega</option>
                                  <option value="cancelada">Cancelada</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GESTOR FINANCEIRO */}
            {activeTab === 'finance' && (
              <FinancialManager
                orders={customOrders}
                onOrdersUpdated={reloadData}
                showToast={showToast}
              />
            )}

            {/* TAB 3: CONFIRMAR ENTREGA (SIMULADOR DO ENTREGADOR) */}
            {activeTab === 'courier' && (
              <div className="space-y-6 max-w-2xl">
                <div className="pb-4 border-b border-zinc-800/50">
                  <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-6 h-6 text-emerald-400" />
                    <span>Interface de Confirmação do Entregador</span>
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    O entregador autorizado utiliza esta interface no telemóvel para pesquisar a encomenda e introduzir o código de 6 dígitos facultado pelo cliente na entrega.
                  </p>
                </div>

                <div
                  className={`p-6 rounded-xl border space-y-4 ${
                    isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <h4 className="font-street text-base font-bold uppercase tracking-wider">
                    Como Funciona o Fluxo de Entrega por Código:
                  </h4>
                  <ul className="text-xs font-mono text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li>
                      <strong>1. Código Único e Imprevisível:</strong> Quando o cliente faz o pedido no site, o servidor gera um código de 6 dígitos e apresenta-o na página de confirmação.
                    </li>
                    <li>
                      <strong>2. Chegada ao Local:</strong> O entregador acede à interface &quot;Confirmar Entrega&quot; e localiza o pedido pelo nome ou número da encomenda.
                    </li>
                    <li>
                      <strong>3. Validação do Código:</strong> O cliente fornece o código verbalmente ou por mensagem. O estafeta introduz o código e o servidor valida-o atomicamente.
                    </li>
                    <li>
                      <strong>4. Consumo de Utilização Única:</strong> Após a validação com sucesso, o código fica permanentemente consumido, impedindo reutilização.
                    </li>
                    <li>
                      <strong>5. Separação Financeira:</strong> A confirmação da entrega não altera automaticamente valores recebidos nem assume pagamento.
                    </li>
                  </ul>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCourierModalOpen(true)}
                      className="px-6 py-3 rounded font-street text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Abrir Interface do Entregador Agora</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CÓDIGO DE ACESSO & SEGURANÇA */}
            {activeTab === 'security' && (
              <div className="max-w-md space-y-6">
                <div className="pb-4 border-b border-zinc-800/50">
                  <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
                    Alterar Código de Acesso
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    O novo código deve conter exatamente 4 dígitos numéricos. Será exigido o código atual antes de validar a alteração.
                  </p>
                </div>

                <form onSubmit={handleChangePinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Código Atual (4 dígitos) *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 2008"
                      className={`w-full px-4 py-2.5 text-center font-street text-xl font-bold tracking-widest rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Novo Código (4 dígitos) *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Novo PIN"
                      className={`w-full px-4 py-2.5 text-center font-street text-xl font-bold tracking-widest rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Confirmar Novo Código *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Confirmar PIN"
                      className={`w-full px-4 py-2.5 text-center font-street text-xl font-bold tracking-widest rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  {pinChangeError && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pinChangeError}</span>
                    </div>
                  )}

                  {pinChangeSuccess && (
                    <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{pinChangeSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 font-street text-sm uppercase tracking-wider font-bold rounded transition-all cursor-pointer ${
                      isWhite
                        ? 'bg-black text-white hover:bg-zinc-800'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    Guardar Novo Código
                  </button>
                </form>

                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs font-mono text-zinc-400 leading-relaxed">
                  <p className="font-bold text-white mb-1">Nota de Segurança e Arquitetura:</p>
                  <p>
                    O código é protegido com cifragem criptográfica SHA-256 no armazenamento do servidor e do navegador.
                    A senha nunca é exibida publicamente nem transferida em texto simples.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Courier Modal instance accessible from Admin */}
      <CourierDeliveryModal
        isOpen={isCourierModalOpen}
        onClose={() => setIsCourierModalOpen(false)}
        onDeliveryConfirmed={() => {
          reloadData();
          showToast('Entrega confirmada pelo estafeta!');
        }}
      />
    </div>
  );
};
