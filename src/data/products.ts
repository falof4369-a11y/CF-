import { Product } from '../types';
import { WHATSAPP_CONFIG } from '../config/whatsapp';

export { WHATSAPP_CONFIG };

export const PRODUCTS: Product[] = [
  {
    id: 'cf-logo-classic',
    name: 'LOGOTIPO CF',
    category: 'logo',
    categoryLabel: 'Logótipo Oficial',
    priceKz: 15000,
    description: 'A t-shirt essencial da marca. Silhueta streetwear oversized com o icónico logótipo CF com a coroa bordado/estampado em serigrafia de alta definição no peito.',
    story: 'Criada para quem aprecia a pureza do minimalismo urbano. O símbolo CF com a coroa representa soberania, foco inabalável e classe.',
    details: [
      '100% Algodão Premium Penteado 240g/m² (Heavyweight)',
      'Gola redonda canelada de 3.0 cm reforçada',
      'Costura dupla de ombro a ombro com fita de reforço',
      'Corte Boxy Oversized com caimento estruturado',
      'Estampa serigráfica resistente a mais de 80 lavagens',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 5, M: 12, L: 8, XL: 6, XXL: 3 },
    frontDesign: 'chest-logo',
    backDesign: 'minimal-crest',
    badge: 'ESSENCIAL',
  },
  {
    id: 'guerreira-africana',
    name: 'GUERREIRA AFRICANA',
    category: 'african-art',
    categoryLabel: 'Arte Africana',
    priceKz: 22000,
    description: 'A nossa peça de assinatura. Apresenta uma composição monumental nas costas: a soberana guerreira africana empunhando a lança com coroa CF, pinturas rituais e adornos sagrados.',
    story: 'Uma homenagem à força ancestral das mulheres de Angola e do continente berço. A união entre a bravura do leão e a dignidade inquebrantável da rainha guerreira.',
    details: [
      'Algodão orgânico 240g/m² pesado de toque aveludado',
      'Estampa serigráfica de grande escala nas costas (A3+)',
      'Micro-logótipo CF no peito esquerdo',
      'Corte largo com ombros descaídos (drop-shoulder)',
      'Etiqueta tecida de autenticidade na barra inferior',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 4, M: 10, L: 14, XL: 5, XXL: 2 },
    frontDesign: 'chest-logo',
    backDesign: 'african-warrior',
    badge: 'DROP 01 &bull; BEST-SELLER',
    isHero: true,
    realPhotoUrl: '/assets/aistudio/Camisolas_Negras_com_Guerreira_Tribal_9977a92d.png',
  },
  {
    id: 'leao-tribal',
    name: 'LEÃO TRIBAL',
    category: 'tribal',
    categoryLabel: 'Tribal & Animais',
    priceKz: 22000,
    description: 'Arte geométrica inspirada nos padrões ancestrais e na majestade do rei da savana africana, coroado pelo escudo CF.',
    story: 'O leão representa a liderança natural e a postura destemida de quem veste Class Focus. Não pedimos licença para pertencer; conquistamos o nosso espaço.',
    details: [
      'Heavyweight 240g/m² com acabamento anti-peeling',
      'Ilustração tribal com linhas de espessura variável de alto contraste',
      'Gola grossa que não deforma com o uso contínuo',
      'Lavagem especial amaciada com perfume neutro',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 6, M: 8, L: 11, XL: 7, XXL: 4 },
    frontDesign: 'chest-logo',
    backDesign: 'tribal-lion',
    badge: 'POPULAR',
    realPhotoUrl: '/assets/aistudio/T-shirts_pretas_com_le_o_tribal_e_monograma_d7eb0b20.png',
  },
  {
    id: 'frase-angola',
    name: 'FRASE ANGOLA',
    category: 'typography',
    categoryLabel: 'Frases & Letras',
    priceKz: 18000,
    description: 'Poema e manifesto de exaltação patriótica estampado em tipografia editorial bold nas costas: "Vou falar desta terra de glórias, nossa Angola de muitas memórias...".',
    story: 'Um tributo às raízes, à memória colectiva e ao orgulho incondicional do povo angolano. As palavras transformam-se em armadura urbana.',
    details: [
      'Tipografia itálica urbana de grande impacto visual',
      'Grade gráfica em linhas de precisão minimalistas',
      'Logótipo CF bordado a branco no peito',
      '100% Algodão Premium selecionado',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 8, M: 15, L: 9, XL: 4, XXL: 3 },
    frontDesign: 'chest-logo',
    backDesign: 'angola-phrase',
    badge: 'MANIFESTO',
    realPhotoUrl: '/assets/aistudio/Camisolas_Pretas_Angola_em_Destaque_6774872b.png',
  },
  {
    id: 'serpente-gotica',
    name: 'SERPENTE',
    category: 'gothic',
    categoryLabel: 'Estilo Gótico',
    priceKz: 20000,
    description: 'A cobra naja feroz em silhueta de ataque, combinando atitude predadora, precisão e o prestígio urbano da CF.',
    story: 'Inspirada na estética darkwear de capitais internacionais aliada ao espírito underground de Luanda. O rastejar silencioso que se transforma em ascensão.',
    details: [
      'Impressão serigráfica com tinta de alta densidade',
      'Linhas arrojadas com acabamento de alto contraste',
      'Corte clássico oversized com mangas alargadas',
      'Bainhas reforçadas',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 3, M: 7, L: 6, XL: 5, XXL: 2 },
    frontDesign: 'chest-logo',
    backDesign: 'snake',
    badge: 'DARKWEAR',
    realPhotoUrl: '/assets/aistudio/Mockup_de_T-shirts_pretos_com_serpente_e_bras_o_CF_f4c663a0.png',
  },
  {
    id: 'class-focus-crest-oversized',
    name: 'CF MONOGRAM ROYAL',
    category: 'logo',
    categoryLabel: 'Logótipo Oficial',
    priceKz: 16500,
    description: 'Edição de colecionador com o monograma CF monumental na parte traseira e coroa de cinco pontas com acabamento luminoso.',
    story: 'Quando a tua própria marca é a tua assinatura no mundo. Para quem valoriza o prestígio autêntico sem concessões.',
    details: [
      'Algodão penteado fio 20.1 pesado',
      'Estampa serigráfica em relevo táctil',
      'Etiqueta externa tecida no pescoço',
      'Design exclusivo de autor',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 7, M: 11, L: 13, XL: 8, XXL: 4 },
    frontDesign: 'chest-logo',
    backDesign: 'minimal-crest',
    badge: 'EDIÇÃO LIMITADA',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'Todas as Peças' },
  { id: 'african-art', label: 'Arte Africana' },
  { id: 'tribal', label: 'Tribal & Animais' },
  { id: 'typography', label: 'Frases & Letras' },
  { id: 'gothic', label: 'Estilo Gótico' },
  { id: 'logo', label: 'Logótipo CF' },
] as const;

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const BRAND_CONFIG = {
  name: 'CF',
  fullName: 'CLASS FOCUS',
  tagline: 'VESTE A TUA IDENTIDADE.',
  subtagline: 'Não é apenas uma t-shirt. É uma forma de expressão.',
  phoneWhatsApp: WHATSAPP_CONFIG.fullInternationalNumber, // 244958194301
  phoneWhatsAppDisplay: WHATSAPP_CONFIG.displayNumber,   // +244 958 194 301
  whatsAppDirectLink: WHATSAPP_CONFIG.directLink,        // https://wa.me/244958194301
  instagram: '@classfocus.ao',
  instagramUrl: 'https://instagram.com/classfocus.ao',
  facebook: 'Class Focus Angola',
  tiktok: '@classfocus',
  email: 'contacto@classfocus.ao',
  location: 'Luanda, Angola (Entregas para todas as províncias e internacional)',
  currency: 'Kz',
};

export const formatPrice = (price: number): string => {
  return `Kz ${price.toLocaleString('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

