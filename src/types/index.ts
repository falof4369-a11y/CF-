export interface Product {
  id: string;
  name: string;
  category: 'logo' | 'african-art' | 'tribal' | 'typography' | 'gothic';
  categoryLabel: string;
  priceKz: number;
  description: string;
  story: string;
  details: string[];
  availableSizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  stockStatus: Record<'S' | 'M' | 'L' | 'XL' | 'XXL', number>;
  frontDesign: 'chest-logo' | 'center-logo' | 'blank' | 'phrase' | 'tribal';
  backDesign: 'african-warrior' | 'tribal-lion' | 'angola-phrase' | 'snake' | 'minimal-crest' | 'dark-angel';
  badge?: string;
  isHero?: boolean;
  realPhotoUrl?: string;
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
