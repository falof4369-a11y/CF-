import { GalleryItem } from '../types';

/**
 * Galeria Oficial CF (Class Focus)
 *
 * Estrutura modular para permitir adicionar, remover ou substituir
 * imagens facilmente no futuro conforme fornecido pelo proprietário da marca.
 */
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-guerreira-tribal',
    title: 'GUERREIRA TRIBAL ANCESTRAL',
    category: 'Arte Africana',
    description: 'T-shirt preta oversized com estampa monumental da rainha guerreira africana empunhando a lança sagrada, com pinturas rituais e coroa CF.',
    imageUrl: '/assets/aistudio/Camisolas_Negras_com_Guerreira_Tribal_9977a92d.png',
    badge: 'DROP 01 &bull; HERO',
    relatedProductId: 'guerreira-africana',
  },
  {
    id: 'gal-leao-guerreira-poema',
    title: 'COMPOSIÇÃO HERO: LEÃO & GUERREIRA',
    category: 'Coleção Exclusiva',
    description: 'A fusão entre o poder do leão tribal, a majestade da guerreira e a poesia de exaltação a Angola. Peça de colecionador.',
    imageUrl: '/assets/aistudio/Mockup_de_T-shirts_com_Arte_Tribal_Africana_e4aaf6d8.png',
    badge: 'BEST-SELLER',
    relatedProductId: 'guerreira-africana',
  },
  {
    id: 'gal-poema-angola',
    title: 'MANIFESTO: TERRA DE GLÓRIAS',
    category: 'Frases & Letras',
    description: 'Tipografia urbana marcante nas costas com o poema patriótico de orgulho e esperança no futuro de Angola.',
    imageUrl: '/assets/aistudio/Camisolas_Pretas_Angola_em_Destaque_6774872b.png',
    badge: 'MANIFESTO',
    relatedProductId: 'frase-angola',
  },
  {
    id: 'gal-leao-tribal',
    title: 'LEÃO TRIBAL IMPERIAL',
    category: 'Tribal & Animais',
    description: 'Ilustração geométrica de grande escala com a juba tribal e simetria perfeita em tinta serigráfica branca sobre algodão heavyweight.',
    imageUrl: '/assets/aistudio/T-shirts_pretas_com_le_o_tribal_e_monograma_d7eb0b20.png',
    badge: 'ASSINATURA',
    relatedProductId: 'leao-tribal',
  },
  {
    id: 'gal-cobra-naja',
    title: 'SERPENTE COBRA NAJA',
    category: 'Estilo Gótico',
    description: 'Silhueta em forma de S com a naja feroz pronta para o bote. Estética darkwear com acabamento minimalista.',
    imageUrl: '/assets/aistudio/Mockup_de_T-shirts_pretos_com_serpente_e_bras_o_CF_f4c663a0.png',
    badge: 'DARKWEAR',
    relatedProductId: 'serpente-gotica',
  },
  {
    id: 'gal-mascote-coelho',
    title: 'MASCOTE REBEL RABBIT',
    category: 'Street Art & Custom',
    description: 'Ilustração underground de atitude desafiadora com a mascote de orelhas pontiagudas e olhos rubros de destaque.',
    imageUrl: '/assets/aistudio/Mockup_de_T-shirts_com_Mascote_Coelho_5f5a7a30.png',
    badge: 'NOVO DROP',
  },
];

export const GALLERY_CATEGORIES = [
  'Todas',
  'Arte Africana',
  'Coleção Exclusiva',
  'Tribal & Animais',
  'Frases & Letras',
  'Estilo Gótico',
] as const;
