export interface Product {
  id: string;
  name: string;
  category: 'african-art' | 'tribal' | 'typography' | 'gothic' | 'custom' | 'logo';
  categoryLabel: string;
  priceKz: number; // 6000 for CF t-shirt
  clientShirtPriceKz?: number; // 4000 if client provides shirt
  description: string;
  story: string;
  details: string[];
  availableSizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  stockStatus: Record<'S' | 'M' | 'L' | 'XL' | 'XXL', number>;
  image: string; // Real photograph provided by the user
  badge?: string;
  isHero?: boolean;
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
