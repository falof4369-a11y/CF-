/**
 * Configuração Oficial do WhatsApp da CF (Class Focus)
 * Angola (+244 958 194 301)
 *
 * Guarda o número numa única variável de configuração centralizada
 * para facilitar futuras alterações.
 */

export const WHATSAPP_CONFIG = {
  // Número oficial da marca
  number: '958194301',
  country: 'Angola',
  countryCode: '+244',
  fullInternationalNumber: '244958194301',
  displayNumber: '+244 958 194 301',
  directLink: 'https://wa.me/244958194301',
};

/**
 * Mensagem geral para pedidos de informação ou contacto direto
 */
export const getGeneralWhatsAppUrl = (customMessage?: string): string => {
  const message =
    customMessage ||
    'Olá! Entrei no site da CF e gostaria de obter informações sobre as vossas t-shirts.';
  return `${WHATSAPP_CONFIG.directLink}?text=${encodeURIComponent(message)}`;
};

/**
 * Mensagem contextualizada para encomenda ou consulta de um produto específico
 */
export const getProductOrderWhatsAppUrl = (params: {
  productName: string;
  size?: string;
  quantity?: number;
  priceFormatted?: string;
  color?: string;
}): string => {
  const { productName, size, quantity, priceFormatted, color } = params;

  let text = `Olá! Entrei no site da CF e gostaria de encomendar a t-shirt *${productName}*`;

  const details: string[] = [];
  if (size) details.push(`Tamanho: *${size}*`);
  if (color) {
    const colorLabel =
      color === 'black'
        ? 'Preto Clássico'
        : color === 'charcoal'
        ? 'Grafite'
        : color === 'white'
        ? 'Branco Puro'
        : color;
    details.push(`Cor: *${colorLabel}*`);
  }
  if (quantity) details.push(`Quantidade: *${quantity}*`);
  if (priceFormatted) details.push(`Valor: *${priceFormatted}*`);

  if (details.length > 0) {
    text += `.\n\n*Detalhes da peça selecionada:*\n- ${details.join('\n- ')}`;
  } else {
    text += '.';
  }

  text += `\n\nPoderiam confirmar a disponibilidade e prazo de entrega em Luanda/Província?`;

  return `${WHATSAPP_CONFIG.directLink}?text=${encodeURIComponent(text)}`;
};

/**
 * Mensagem contextualizada para pedido de personalização
 */
export const getCustomizationWhatsAppUrl = (data: {
  name: string;
  phone: string;
  tshirtSource?: 'cf-brand' | 'client-own';
  tshirtSourceLabel?: string;
  priceFormatted?: string;
  model: string;
  size: string;
  color: string;
  placement: string;
  fontStyle: string;
  phrase: string;
  description: string;
  hasImageAttachment?: boolean;
  imageName?: string;
}): string => {
  const sourceLabel =
    data.tshirtSourceLabel ||
    (data.tshirtSource === 'client-own'
      ? 'T-shirt própria do cliente (4.000 Kz)'
      : 'T-shirt da marca CF (6.000 Kz)');

  const text =
    `*PEDIDO DE T-SHIRT PERSONALIZADA — CF (CLASS FOCUS)*\n\n` +
    `*Cliente:* ${data.name}\n` +
    `*Telefone / WhatsApp:* ${data.phone}\n` +
    `*Tipo de T-shirt:* ${sourceLabel}\n` +
    (data.priceFormatted ? `*Preço Unitário:* ${data.priceFormatted}\n` : '') +
    `*Modelo:* ${data.model}\n` +
    `*Tamanho:* ${data.size}\n` +
    `*Cor da Peça:* ${data.color}\n` +
    `*Posição da Estampa:* ${data.placement}\n` +
    `*Estilo da Fonte:* ${data.fontStyle}\n` +
    `*Frase / Texto:* "${data.phrase}"\n` +
    `*Descrição do Design:* ${data.description}\n` +
    (data.hasImageAttachment
      ? `*Imagem de Referência:* Anexada pelo cliente (${data.imageName})\n`
      : '') +
    `\n_Enviado através do site oficial da CF — Veste a Tua Identidade._`;

  return `${WHATSAPP_CONFIG.directLink}?text=${encodeURIComponent(text)}`;
};

/**
 * Mensagem contextualizada para checkout de carrinho de compras
 */
export const getCartCheckoutWhatsAppUrl = (params: {
  items: Array<{
    name: string;
    size: string;
    color: string;
    quantity: number;
    totalFormatted: string;
  }>;
  subtotalFormatted: string;
}): string => {
  let itemsList = '';
  params.items.forEach((item, index) => {
    const colorLabel =
      item.color === 'black'
        ? 'Preto'
        : item.color === 'charcoal'
        ? 'Grafite'
        : item.color === 'white'
        ? 'Branco'
        : item.color;

    itemsList += `${index + 1}. *${item.name}*\n   - Tamanho: *${item.size}*\n   - Cor: *${colorLabel}*\n   - Quantidade: *${item.quantity}*\n   - Subtotal: *${item.totalFormatted}*\n\n`;
  });

  const text =
    `*PEDIDO OFICIAL — CF (CLASS FOCUS)*\n\n` +
    `Olá! Entrei no site da CF e gostaria de finalizar a encomenda das seguintes t-shirts:\n\n` +
    itemsList +
    `*TOTAL:* *${params.subtotalFormatted}*\n\n` +
    `*Dados para Entrega:*\n` +
    `- Meu Nome Completo:\n` +
    `- Província / Município:\n` +
    `- Bairro / Ponto de Referência:\n` +
    `- Telefone Alternativo:\n\n` +
    `_Enviado através do site oficial da CF — Veste a Tua Identidade._`;

  return `${WHATSAPP_CONFIG.directLink}?text=${encodeURIComponent(text)}`;
};
