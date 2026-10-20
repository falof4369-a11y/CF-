/**
 * Tabela de Preços Oficiais da marca CF (Class Focus)
 * Angola — Valores em Kwanzas (Kz)
 *
 * Centralização única para garantir consistência em todo o site
 * e facilitar futuras alterações de preços.
 */

export const PRICING_CONFIG = {
  // Preço padrão para qualquer T-shirt oficial da marca CF
  cfBrandTeePriceKz: 6000,

  // Preço de personalização quando o cliente fornece a sua própria T-shirt
  clientOwnTeePriceKz: 4000,

  // Símbolo e código da moeda oficial de Angola
  currency: 'Kz',
} as const;

/**
 * Formata um valor numérico para o formato de moeda em Kwanzas (ex: 6.000 Kz)
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} Kz`;
};
