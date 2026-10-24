import React, { useState, useMemo } from 'react';
import { CustomOrder, FulfillmentStatus, FinancialStatus } from '../types';
import { formatPrice } from '../data/products';
import { updateOrderFulfillment, updateOrderFinancialRecord } from '../services/db';
import { generateFinancialPdfReport } from '../services/financialPdf';
import { useTheme } from '../context/ThemeContext';
import {
  DollarSign,
  Calendar,
  Search,
  Filter,
  FileDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  CreditCard,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface FinancialManagerProps {
  orders: CustomOrder[];
  onOrdersUpdated: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  orders,
  onOrdersUpdated,
  showToast,
}) => {
  const { isWhite } = useTheme();

  // Search & Period Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | FulfillmentStatus>('all');
  const [financialFilter, setFinancialFilter] = useState<'all' | FinancialStatus>('all');

  // Modal State: Fulfillment Confirmation ("Este pedido já foi vendido/atendido?")
  const [fulfillmentModalOrder, setFulfillmentModalOrder] = useState<CustomOrder | null>(null);

  // Modal State: Financial Value Confirmation
  const [financialModalOrder, setFinancialModalOrder] = useState<CustomOrder | null>(null);
  const [inputAmountReceived, setInputAmountReceived] = useState<string>('');
  const [inputReason, setInputReason] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesClient = (order.clientName || '').toLowerCase().includes(query);
        const matchesPhone = (order.phone || '').toLowerCase().includes(query);
        const matchesModel = (order.model || '').toLowerCase().includes(query);
        if (!matchesId && !matchesClient && !matchesPhone && !matchesModel) {
          return false;
        }
      }

      // 2. Date range match
      if (startDate && order.date && order.date < startDate) {
        return false;
      }
      if (endDate && order.date && order.date > endDate) {
        return false;
      }

      // 3. Fulfillment status filter
      if (fulfillmentFilter !== 'all') {
        const currentFulfillment = order.fulfillmentStatus || 'pendente';
        if (currentFulfillment !== fulfillmentFilter) {
          return false;
        }
      }

      // 4. Financial status filter
      if (financialFilter !== 'all') {
        const currentFinancial = order.financialStatus || 'por_pagar';
        if (currentFinancial !== financialFilter) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchTerm, startDate, endDate, fulfillmentFilter, financialFilter]);

  // Financial Dashboard KPIs (calculated strictly from filtered set or total)
  const dashboardStats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const attendedOrders = filteredOrders.filter(
      (o) => o.fulfillmentStatus === 'atendido' || o.deliveryStatus === 'entregue_e_confirmada'
    );
    const pendingOrders = filteredOrders.filter(
      (o) => o.fulfillmentStatus !== 'atendido' && o.deliveryStatus !== 'entregue_e_confirmada'
    );
    const confirmedDeliveriesCount = filteredOrders.filter(
      (o) => o.deliveryStatus === 'entregue_e_confirmada'
    ).length;

    // Expected total of attended orders
    const expectedTotalAttended = attendedOrders.reduce(
      (sum, o) => sum + (o.totalPriceKz || 0),
      0
    );

    // Value actually received
    const actuallyReceivedTotal = filteredOrders.reduce(
      (sum, o) => sum + (o.amountReceived || 0),
      0
    );

    // Total differences recorded on attended orders (received - expected)
    const totalDifferences = attendedOrders.reduce((sum, o) => {
      const expected = o.totalPriceKz || 0;
      const received = o.amountReceived !== undefined ? o.amountReceived : 0;
      return sum + (received - expected);
    }, 0);

    // Total partial payments (0 < received < expected)
    const partialOrders = filteredOrders.filter(
      (o) => (o.amountReceived || 0) > 0 && (o.amountReceived || 0) < (o.totalPriceKz || 0)
    );
    const totalPartialPayments = partialOrders.reduce(
      (sum, o) => sum + (o.amountReceived || 0),
      0
    );

    // Remaining balance pending receipt on attended orders
    const pendingBalance = attendedOrders.reduce((sum, o) => {
      const diff = (o.totalPriceKz || 0) - (o.amountReceived || 0);
      return diff > 0 ? sum + diff : sum;
    }, 0);

    return {
      totalOrders,
      attendedOrdersCount: attendedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      confirmedDeliveriesCount,
      expectedTotalAttended,
      actuallyReceivedTotal,
      totalDifferences,
      totalPartialPayments,
      pendingBalance,
    };
  }, [filteredOrders]);

  // Open fulfillment modal
  const handleOpenFulfillmentModal = (order: CustomOrder) => {
    setFulfillmentModalOrder(order);
  };

  // Confirm fulfillment
  const handleConfirmFulfillment = async (isAttended: boolean) => {
    if (!fulfillmentModalOrder) return;

    try {
      const targetId = fulfillmentModalOrder.id;
      const updated = await updateOrderFulfillment(
        targetId,
        isAttended ? 'atendido' : 'pendente'
      );

      setFulfillmentModalOrder(null);
      onOrdersUpdated();

      if (isAttended) {
        showToast('Pedido marcado como atendido com sucesso!');
        // Seamlessly offer to register received amount right away
        if (updated) {
          handleOpenFinancialModal(updated);
        }
      } else {
        showToast('Pedido mantido no estado pendente de atendimento.');
      }
    } catch (err: any) {
      showToast('Erro ao atualizar estado de atendimento.', 'error');
    }
  };

  // Open financial confirmation modal
  const handleOpenFinancialModal = (order: CustomOrder) => {
    setFinancialModalOrder(order);
    setInputAmountReceived(
      order.amountReceived !== undefined && order.amountReceived > 0
        ? String(order.amountReceived)
        : String(order.totalPriceKz || 0)
    );
    setInputReason(order.differenceReason || '');
  };

  // Save financial record
  const handleSaveFinancialRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!financialModalOrder) return;

    const numReceived = parseFloat(inputAmountReceived) || 0;
    const expected = financialModalOrder.totalPriceKz || 0;
    const diff = numReceived - expected;

    // Validation: If there is a difference, justification description is mandatory
    if (diff !== 0 && (!inputReason || inputReason.trim().length < 3)) {
      showToast(
        'Por favor indica uma descrição justificando a diferença entre o valor esperado e o recebido.',
        'error'
      );
      return;
    }

    try {
      await updateOrderFinancialRecord(
        financialModalOrder.id,
        numReceived,
        diff !== 0 ? inputReason.trim() : 'Valores correspondentes'
      );

      setFinancialModalOrder(null);
      onOrdersUpdated();
      showToast('Registo financeiro confirmado com sucesso!');
    } catch (err) {
      showToast('Erro ao gravar confirmação financeira.', 'error');
    }
  };

  // Export PDF Report
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generateFinancialPdfReport({
        orders: filteredOrders,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      showToast('Relatório Financeiro PDF exportado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      showToast('Erro ao gerar relatório PDF. Tenta novamente.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Quick reasons buttons
  const quickReasons = [
    'Desconto autorizado de cliente habitual',
    'Pagamento parcial inicial (aguarda restante na entrega)',
    'Ajuste autorizado pelo administrador',
    'Oferta promocional de lançamento',
    'Arredondamento de troco acordado',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Export PDF Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
              GESTOR FINANCEIRO CF
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
              FLUXO DE CAIXA REAL
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Controlo rigoroso entre valores esperados e montantes efetivamente recebidos por encomenda.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExportingPdf || filteredOrders.length === 0}
          className={`px-4 py-2.5 rounded font-street text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            isWhite
              ? 'bg-black text-white hover:bg-zinc-800 disabled:opacity-40'
              : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-40'
          }`}
          title="Exportar documento PDF com cabeçalho oficial e tabela financeira"
        >
          <FileDown className="w-4 h-4" />
          <span>{isExportingPdf ? 'A Gerar PDF...' : 'Exportar Relatório PDF'}</span>
        </button>
      </div>

      {/* Discreet Notice for Empty Initial State (Preparation for Testing) */}
      {orders.length === 0 && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 animate-fade-in ${
            isWhite
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Ainda não existem registos financeiros. Os indicadores serão atualizados à medida que os pedidos reais forem registados e processados.
          </span>
        </div>
      )}

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total & Status */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isWhite ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900/60 border-zinc-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
            Total de Pedidos
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-street text-2xl sm:text-3xl font-black">
              {dashboardStats.totalOrders}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
              {dashboardStats.confirmedDeliveriesCount} entregas
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800/40 text-[10px] font-mono flex items-center justify-between text-zinc-400">
            <span>Pedidos Pendentes:</span>
            <span className="font-bold text-amber-400">{dashboardStats.pendingOrdersCount}</span>
          </div>
        </div>

        {/* Expected Attended Value */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isWhite ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900/60 border-zinc-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
            Valor Financeiro Esperado
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-zinc-300">
            {formatPrice(dashboardStats.expectedTotalAttended)}
          </span>
          <div className="mt-2 pt-2 border-t border-zinc-800/40 text-[10px] font-mono flex items-center justify-between text-zinc-400">
            <span>Entregas Confirmadas:</span>
            <span className="font-bold text-emerald-400">{dashboardStats.confirmedDeliveriesCount}</span>
          </div>
        </div>

        {/* Value Actually Received */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isWhite
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs'
              : 'bg-emerald-950/20 border-emerald-500/30 text-white'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold block mb-1">
            Pagamentos Recebidos
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-emerald-400">
            {formatPrice(dashboardStats.actuallyReceivedTotal)}
          </span>
          <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10px] font-mono flex items-center justify-between">
            <span>Diferenças Financeiras:</span>
            <span
              className={`font-bold ${
                dashboardStats.totalDifferences < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {dashboardStats.totalDifferences >= 0 ? '+' : ''}
              {formatPrice(dashboardStats.totalDifferences)}
            </span>
          </div>
        </div>

        {/* Remaining Balance Pending & Partials */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isWhite ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900/60 border-zinc-800'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
            Valores Pendentes
          </span>
          <span
            className={`font-street text-xl sm:text-2xl font-black ${
              dashboardStats.pendingBalance > 0 ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            {formatPrice(dashboardStats.pendingBalance)}
          </span>
          <div className="mt-2 pt-2 border-t border-zinc-800/40 text-[10px] font-mono flex items-center justify-between text-zinc-400">
            <span>Pagamentos Parciais:</span>
            <span className="font-bold">{formatPrice(dashboardStats.totalPartialPayments)}</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Period Controls Bar */}
      <div
        className={`p-4 rounded-xl border space-y-3 ${
          isWhite ? 'bg-zinc-100/90 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por ID, cliente, telefone ou modelo..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded border focus:outline-none ${
                isWhite
                  ? 'bg-white border-zinc-300 focus:border-black text-black'
                  : 'bg-zinc-950 border-zinc-800 focus:border-white text-white'
              }`}
            />
          </div>

          {/* Start Date */}
          <div className="sm:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">De:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border font-mono focus:outline-none ${
                  isWhite
                    ? 'bg-white border-zinc-300 text-black'
                    : 'bg-zinc-950 border-zinc-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="sm:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">Até:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border font-mono focus:outline-none ${
                  isWhite
                    ? 'bg-white border-zinc-300 text-black'
                    : 'bg-zinc-950 border-zinc-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="sm:col-span-1 text-right">
            {(searchTerm || startDate || endDate || fulfillmentFilter !== 'all' || financialFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                  setFulfillmentFilter('all');
                  setFinancialFilter('all');
                }}
                className="p-2 text-xs font-mono uppercase text-zinc-400 hover:text-white rounded border border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                title="Limpar todos os filtros"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* State Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/40 text-xs font-mono">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase text-zinc-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Atendimento:
            </span>
            {(['all', 'pendente', 'atendido'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFulfillmentFilter(st)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  fulfillmentFilter === st
                    ? isWhite
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                    : isWhite
                    ? 'bg-white border border-zinc-300 text-zinc-700'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
                }`}
              >
                {st === 'all' ? 'Todos' : st === 'atendido' ? 'Atendidos' : 'Pendentes'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase text-zinc-500 mr-1">Financeiro:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'confirmado', label: 'Confirmados' },
              { id: 'diferenca_registada', label: 'Com Diferença' },
              { id: 'parcialmente_pago', label: 'Parciais' },
              { id: 'por_pagar', label: 'Por Pagar' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFinancialFilter(st.id as any)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  financialFilter === st.id
                    ? isWhite
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                    : isWhite
                    ? 'bg-white border border-zinc-300 text-zinc-700'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Orders List Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl p-8 space-y-2">
          <p className="text-xs font-mono text-zinc-400">
            {orders.length === 0
              ? 'Ainda não existem registos financeiros. Os indicadores serão atualizados à medida que os pedidos reais forem registados e processados.'
              : 'Nenhum pedido encontrado com os critérios de filtro selecionados.'}
          </p>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className={isWhite ? 'bg-zinc-200 text-black' : 'bg-black text-zinc-300 border-b border-zinc-800'}>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px]">ID / Data</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Cliente</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px]">Produto / Qtd</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-right">V. Esperado</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-right">V. Recebido</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-right">Diferença</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-center">Atendimento</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-center">Estado Financeiro</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map((order) => {
                  const isAttended = order.fulfillmentStatus === 'atendido';
                  const expected = order.totalPriceKz || 0;
                  const received = order.amountReceived !== undefined ? order.amountReceived : 0;
                  const diff = isAttended ? received - expected : 0;

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isWhite ? 'hover:bg-zinc-100/60' : 'hover:bg-zinc-900/40'
                      }`}
                    >
                      {/* ID / Data */}
                      <td className="p-3">
                        <span className="font-bold block text-zinc-200">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">{order.date}</span>
                      </td>

                      {/* Cliente */}
                      <td className="p-3">
                        <span className="font-bold block">{order.clientName}</span>
                        <span className="text-[10px] text-zinc-400 block">{order.phone}</span>
                      </td>

                      {/* Produto & Qtd */}
                      <td className="p-3">
                        <span className="block font-medium truncate max-w-[180px]">{order.model}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          Tam: {order.size} &bull; Qtd: {order.quantity}
                        </span>
                      </td>

                      {/* Valor Esperado */}
                      <td className="p-3 text-right font-bold text-zinc-300">
                        {formatPrice(expected)}
                      </td>

                      {/* Valor Recebido */}
                      <td className="p-3 text-right">
                        {isAttended ? (
                          <span
                            className={`font-bold ${
                              received === 0
                                ? 'text-red-400'
                                : received < expected
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {formatPrice(received)}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>

                      {/* Diferença */}
                      <td className="p-3 text-right">
                        {isAttended ? (
                          diff === 0 ? (
                            <span className="text-[10px] text-emerald-400 font-bold">0 Kz (Exato)</span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span
                                className={`font-bold ${
                                  diff < 0 ? 'text-red-400' : 'text-emerald-400'
                                }`}
                              >
                                {diff > 0 ? '+' : ''}
                                {formatPrice(diff)}
                              </span>
                              {order.differenceReason && (
                                <span className="text-[9px] text-zinc-500 italic max-w-[120px] truncate" title={order.differenceReason}>
                                  {order.differenceReason}
                                </span>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>

                      {/* Atendimento */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenFulfillmentModal(order)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            isAttended
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title="Clica para alterar estado de atendimento"
                        >
                          {isAttended ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Atendido
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pendente
                            </>
                          )}
                        </button>
                      </td>

                      {/* Estado Financeiro */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            order.financialStatus === 'confirmado'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : order.financialStatus === 'diferenca_registada'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : order.financialStatus === 'parcialmente_pago'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : order.financialStatus === 'atendido_por_confirmar'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {order.financialStatus === 'confirmado'
                            ? 'Confirmado'
                            : order.financialStatus === 'diferenca_registada'
                            ? 'Justificado'
                            : order.financialStatus === 'parcialmente_pago'
                            ? 'Parcial'
                            : order.financialStatus === 'atendido_por_confirmar'
                            ? 'Por Confirmar'
                            : 'Por Pagar'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenFinancialModal(order)}
                            className="px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold border border-zinc-700 hover:border-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Registar / Confirmar valor recebido"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Finanças</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modal: Pergunta de Atendimento ("Este pedido já foi vendido/atendido?") */}
      {fulfillmentModalOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFulfillmentModalOrder(null)}
        >
          <div
            className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isWhite ? 'bg-white border-zinc-300 text-black' : 'bg-zinc-950 border-zinc-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="font-street text-lg font-bold uppercase tracking-wider">
                Confirmação de Atendimento
              </span>
              <button
                onClick={() => setFulfillmentModalOrder(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase block">
                Pedido #{fulfillmentModalOrder.id.slice(-6).toUpperCase()} &bull; {fulfillmentModalOrder.clientName}
              </span>
              <p className="font-street text-xl font-bold uppercase text-zinc-200">
                “Este pedido já foi vendido/atendido?”
              </p>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                {fulfillmentModalOrder.model} ({fulfillmentModalOrder.size}) &bull; Quantidade:{' '}
                {fulfillmentModalOrder.quantity} un. &bull; Total Esperado:{' '}
                <strong className="text-emerald-400">{formatPrice(fulfillmentModalOrder.totalPriceKz)}</strong>
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleConfirmFulfillment(false)}
                className={`flex-1 py-3 px-4 rounded text-xs font-mono uppercase font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isWhite
                    ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                    : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Não, ainda está pendente</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmFulfillment(true)}
                className="flex-1 py-3 px-4 rounded text-xs font-mono uppercase font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Sim, já foi atendido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Confirmação do Valor Recebido e Justificação */}
      {financialModalOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFinancialModalOrder(null)}
        >
          <div
            className={`max-w-lg w-full p-6 sm:p-7 rounded-2xl border shadow-2xl space-y-5 ${
              isWhite ? 'bg-white border-zinc-300 text-black' : 'bg-zinc-950 border-zinc-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="font-street text-xl font-bold uppercase tracking-wider block">
                  Confirmação Financeira
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Pedido #{financialModalOrder.id.slice(-6).toUpperCase()} &bull; {financialModalOrder.clientName}
                </span>
              </div>
              <button
                onClick={() => setFinancialModalOrder(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFinancialRecord} className="space-y-4">
              {/* Values Comparison Display */}
              <div
                className={`p-4 rounded-xl border grid grid-cols-2 gap-4 ${
                  isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Valor Esperado Original:
                  </span>
                  <span className="font-street text-2xl font-black text-zinc-300">
                    {formatPrice(financialModalOrder.totalPriceKz)}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                    ({financialModalOrder.quantity} un. &times; {formatPrice(financialModalOrder.unitPriceKz)})
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                    Valor Realmente Recebido (Kz) *
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    required
                    value={inputAmountReceived}
                    onChange={(e) => setInputAmountReceived(e.target.value)}
                    className={`w-full px-3 py-1.5 font-street text-xl font-black rounded border focus:outline-none ${
                      isWhite
                        ? 'bg-white border-zinc-300 focus:border-black text-black'
                        : 'bg-black border-zinc-700 focus:border-emerald-400 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Automatic Difference Calculation */}
              {(() => {
                const receivedNum = parseFloat(inputAmountReceived) || 0;
                const expected = financialModalOrder.totalPriceKz || 0;
                const diff = receivedNum - expected;

                if (diff === 0) {
                  return (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Valores correspondentes. O valor recebido confere integralmente com o esperado.</span>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2 ${
                        diff < 0
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">
                          Diferença Calculada: {diff > 0 ? '+' : ''}
                          {formatPrice(diff)}
                        </span>
                        <span className="text-[11px] opacity-90 block">
                          {diff < 0
                            ? `O valor recebido é menor em ${formatPrice(Math.abs(diff))}. ${
                                receivedNum > 0
                                  ? 'Pagamento parcial identificado.'
                                  : 'Nenhum valor foi pago.'
                              }`
                            : `O valor recebido é maior em ${formatPrice(diff)} do que o esperado.`}
                        </span>
                      </div>
                    </div>

                    {/* Mandatory Reason Description Field */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold text-red-400">
                        Descrição Obrigatória da Diferença *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={inputReason}
                        onChange={(e) => setInputReason(e.target.value)}
                        placeholder="Descreve o motivo: desconto acordado, sinal/pagamento parcial, taxa adicional, erro corrigido..."
                        className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-900 border-zinc-700 focus:border-white text-white'
                        }`}
                      />

                      {/* Quick reason suggestions */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {quickReasons.map((qr) => (
                          <button
                            key={qr}
                            type="button"
                            onClick={() => setInputReason(qr)}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                          >
                            + {qr}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFinancialModalOrder(null)}
                  className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded border border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded font-street text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Gravar Confirmação Financeira</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
