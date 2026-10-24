export interface Product {
  id: string;
  name: string;
  category: 'african-art' | 'tribal' | 'typography' | 'gothic' | 'custom' | 'logo';
  categoryLabel: string;
  priceKz: number; // 6000 for CF t-shirt
  clientShirtPriceKz?: number; // 4000 if client provides shirt
  color?: string;
  defaultColor?: 'black' | 'charcoal' | 'white';
  description: string;
  story: string;
  details: string[];
  availableSizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  stockStatus: Record<'S' | 'M' | 'L' | 'XL' | 'XXL', number>;
  image: string; // Real photograph provided by the user
  badge?: string;
  isHero?: boolean;
  status?: 'published' | 'draft' | 'archived';
  viewAngle?: 'front' | 'back' | 'full';
  isCustomUpload?: boolean;
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  badge?: string;
  relatedProductId?: string;
}

export interface CartItem {
  id: string; // unique item instance id: productId-size-color
  product: Product;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  color: string;
}

export interface CustomizationData {
  name: string;
  phone: string;
  model: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  position: string;
  phraseOrIdea: string;
  fontStyle: string;
  details: string;
  referenceImageName?: string;
  referenceImageData?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  category: 'Elogio' | 'Sugestão' | 'Crítica Construtiva' | 'Qualidade' | 'Geral';
  comment: string;
  date: string; // ISO or formatted date
  status: 'pending' | 'approved' | 'rejected';
  verifiedPurchase?: boolean;
}

export interface CommunityPhoto {
  id: string;
  authorName: string;
  authorHandle?: string;
  tshirtModel: string;
  caption?: string;
  imageUrl: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  consentConfirmed: boolean;
}

export type FulfillmentStatus = 'pendente' | 'atendido';

export type FinancialStatus =
  | 'por_pagar'
  | 'parcialmente_pago'
  | 'confirmado'
  | 'diferenca_registada'
  | 'atendido_por_confirmar';

// Estados rigorosamente separados conforme secção 6
export type OrderStatus = 'recebido' | 'em_preparacao' | 'pronto_para_entrega' | 'cancelado';
export type PaymentStatus = 'por_confirmar' | 'parcialmente_pago' | 'pago' | 'nao_pago';
export type DeliveryStatus = 'pendente' | 'em_distribuicao' | 'entregue_e_confirmada' | 'falha_na_entrega' | 'cancelada';

export interface CustomOrder {
  id: string;
  orderNumber?: string; // Número legível do pedido: ex. CF-2026-4819
  clientName: string;
  phone: string;
  serviceType: 'cf-brand' | 'client-shirt';
  model: string;
  color: 'black' | 'white';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  unitPriceKz: number;
  totalPriceKz: number;
  phrase?: string;
  fontStyle?: string;
  fontColor?: string;
  placement: string;
  graphicDataUrl?: string;
  notes?: string;
  date: string;
  createdAt?: string;
  status: 'novo' | 'em_producao' | 'concluido' | 'cancelado';

  // Sistema de Código de Confirmação de Entrega
  deliveryCode?: string; // Código de 6 dígitos gerado no servidor
  deliveryCodeHash?: string; // Hash SHA-256 no armazenamento
  deliveryCodeConsumed?: boolean; // Utilização única
  deliveryConfirmedAt?: string;
  deliveryCourierId?: string; // Identificador da conta do entregador
  deliveryAttempts?: number; // Controlo de tentativas / proteção contra brute force

  // Estados Independentes (Secção 6)
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;

  // Financial & Fulfillment Tracking
  fulfillmentStatus?: FulfillmentStatus;
  financialStatus?: FinancialStatus;
  amountReceived?: number;
  differenceReason?: string;
  fulfillmentDate?: string;
  financialConfirmedDate?: string;
}

