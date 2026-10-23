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

export interface CustomOrder {
  id: string;
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
  status: 'novo' | 'em_producao' | 'concluido' | 'cancelado';
}

