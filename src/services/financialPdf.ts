import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CustomOrder } from '../types';
import { formatPrice } from '../data/products';

// Helper to draw the authentic CF logo onto canvas and return a crisp PNG data URL
export function getCFLogoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve('');
      return;
    }

    const svgString = `<svg width="200" height="230" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#000000">
        <circle cx="15" cy="18" r="3" />
        <circle cx="31" cy="11" r="3.2" />
        <circle cx="50" cy="5" r="4" />
        <circle cx="69" cy="11" r="3.2" />
        <circle cx="85" cy="18" r="3" />
        <path d="M 15 23 L 25 35 L 31 16 L 41 33 L 50 11 L 59 33 L 69 16 L 75 35 L 85 23 L 80 43 L 20 43 Z" />
        <path d="M 17 44.5 Q 50 48.5 83 44.5 L 82 48.5 Q 50 52.5 18 48.5 Z" />
      </g>
      <circle cx="34" cy="46" r="1.3" fill="#ffffff" />
      <circle cx="50" cy="47.5" r="1.8" fill="#ffffff" />
      <circle cx="66" cy="46" r="1.3" fill="#ffffff" />
      <g fill="#000000">
        <path d="M 45 57 L 26 57 L 21 63 L 21 95 L 26 101 L 45 101 L 45 92 L 32 92 L 29 89 L 29 69 L 32 66 L 45 66 Z" />
        <polygon points="45,57 40,61 45,65" />
        <polygon points="45,93 40,97 45,101" />
        <path d="M 47 57 L 78 57 L 78 66 L 57 66 L 57 76 L 73 76 L 73 84 L 57 84 L 57 101 L 47 101 Z" />
        <polygon points="78,57 73,61 78,65" />
        <polygon points="73,76 68,80 73,84" />
        <polygon points="48,103 52,103 50,111" />
      </g>
    </svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 230;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(url);
          resolve('');
        }
      } catch {
        URL.revokeObjectURL(url);
        resolve('');
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };

    img.src = url;
  });
}

export interface FinancialReportOptions {
  orders: CustomOrder[];
  startDate?: string;
  endDate?: string;
  statusFilterLabel?: string;
}

export async function generateFinancialPdfReport(options: FinancialReportOptions): Promise<void> {
  const { orders, startDate, endDate } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Calculate Financial Summary
  const totalOrders = orders.length;
  const attendedOrders = orders.filter((o) => o.fulfillmentStatus === 'atendido');
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus !== 'atendido');

  // Expected value of attended orders
  const expectedTotalAttended = attendedOrders.reduce((sum, o) => sum + (o.totalPriceKz || 0), 0);

  // Value actually received
  const receivedTotal = orders.reduce((sum, o) => sum + (o.amountReceived || 0), 0);

  // Total differences recorded on attended orders
  const totalDifferences = attendedOrders.reduce((sum, o) => {
    const expected = o.totalPriceKz || 0;
    const received = o.amountReceived !== undefined ? o.amountReceived : 0;
    return sum + (received - expected);
  }, 0);

  // Total partial payments (orders where 0 < amountReceived < expected)
  const partialOrders = orders.filter(
    (o) => (o.amountReceived || 0) > 0 && (o.amountReceived || 0) < (o.totalPriceKz || 0)
  );
  const totalPartialPayments = partialOrders.reduce((sum, o) => sum + (o.amountReceived || 0), 0);

  // Balance pending receipt
  const pendingBalance = attendedOrders.reduce((sum, o) => {
    const diff = (o.totalPriceKz || 0) - (o.amountReceived || 0);
    return diff > 0 ? sum + diff : sum;
  }, 0);

  // 2. Embed Authentic Logo
  const logoDataUrl = await getCFLogoDataUrl();
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 14, 10, 16, 18.4);
    } catch (err) {
      console.warn('Erro ao inserir logótipo no PDF:', err);
    }
  }

  // 3. Header Texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(10, 10, 10);
  doc.text('CLASS FOCUS (CF) — RELATÓRIO FINANCEIRO DE PEDIDOS', 34, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  const periodText =
    startDate && endDate
      ? `Período selecionado: ${startDate} até ${endDate}`
      : startDate
      ? `A partir de: ${startDate}`
      : endDate
      ? `Até: ${endDate}`
      : 'Período: Histórico Completo de Pedidos';

  const dateNow = new Date();
  const dateFormatted = `${dateNow.toLocaleDateString('pt-PT')} às ${dateNow.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  doc.text(`${periodText}  |  Emitido em: ${dateFormatted}`, 34, 22);
  doc.text('Contacto Oficial WhatsApp: +244 958 194 301  |  Luanda, Angola', 34, 27);

  // Thin separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(14, 31, pageWidth - 14, 31);

  // 4. Financial Summary KPI Grid Box
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(14, 33, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(220, 220, 225);
  doc.roundedRect(14, 33, pageWidth - 28, 22, 2, 2, 'S');

  const colWidth = (pageWidth - 28) / 6;

  const kpis = [
    { label: 'TOTAL DE PEDIDOS', value: `${totalOrders} (${attendedOrders.length} atendidos)` },
    { label: 'PEDIDOS PENDENTES', value: `${pendingOrders.length} pendentes` },
    { label: 'TOTAL ESPERADO (ATEND.)', value: formatPrice(expectedTotalAttended) },
    { label: 'TOTAL RECEBIDO EFETIVO', value: formatPrice(receivedTotal) },
    {
      label: 'TOTAL DAS DIFERENÇAS',
      value: `${totalDifferences >= 0 ? '+' : ''}${formatPrice(totalDifferences)}`,
    },
    { label: 'SALDO POR RECEBER', value: formatPrice(pendingBalance) },
  ];

  kpis.forEach((kpi, i) => {
    const x = 14 + i * colWidth + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 115);
    doc.text(kpi.label, x, 39);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    doc.text(kpi.value, x, 48);
  });

  // 5. Orders Table using jspdf-autotable
  const tableData = orders.map((order) => {
    const expected = order.totalPriceKz || 0;
    const received = order.amountReceived !== undefined ? order.amountReceived : 0;
    const diff = received - expected;

    const fulfillmentLabel =
      order.fulfillmentStatus === 'atendido' ? 'Atendido' : 'Pendente';

    let financialLabel = 'Por Pagar';
    if (order.financialStatus === 'confirmado') financialLabel = 'Confirmado';
    else if (order.financialStatus === 'parcialmente_pago') financialLabel = 'Parcialmente Pago';
    else if (order.financialStatus === 'diferenca_registada') financialLabel = 'Com Justificação';
    else if (order.financialStatus === 'atendido_por_confirmar') financialLabel = 'Por Confirmar';

    const diffText =
      order.fulfillmentStatus === 'atendido'
        ? diff === 0
          ? '0 Kz (Exato)'
          : `${diff > 0 ? '+' : ''}${formatPrice(diff)}`
        : '-';

    return [
      order.id.slice(-8).toUpperCase(),
      order.date || '-',
      `${order.clientName || 'Cliente'}\n${order.phone || ''}`,
      `${order.model}\nTam: ${order.size} | Qtd: ${order.quantity}`,
      formatPrice(expected),
      order.fulfillmentStatus === 'atendido' ? formatPrice(received) : '0 Kz',
      diffText,
      fulfillmentLabel,
      financialLabel,
      order.differenceReason || (diff === 0 && order.fulfillmentStatus === 'atendido' ? 'Valores correspondentes' : '-'),
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [
      [
        'ID Pedido',
        'Data',
        'Cliente',
        'Produto / Qtd',
        'V. Esperado',
        'V. Recebido',
        'Diferença',
        'Atendimento',
        'Estado Fin.',
        'Justificação / Motivo',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 30, 30],
      lineColor: [230, 230, 230],
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [15, 15, 15],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 18 },
      2: { cellWidth: 32 },
      3: { cellWidth: 38 },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'center' },
      8: { cellWidth: 26, halign: 'center' },
      9: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      // Footer page numbering and disclaimer
      const pageNumber = (doc.internal as any).getCurrentPageInfo().pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text(
        'Class Focus Streetwear — Sistema de Gestão Financeira. Documento gerado automaticamente.',
        14,
        pageHeight - 8
      );
      doc.text(`Página ${pageNumber}`, pageWidth - 25, pageHeight - 8);
    },
  });

  // Save / Trigger Download
  const fileName = `CF_Relatorio_Financeiro_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
