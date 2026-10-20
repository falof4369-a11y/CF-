import { Product } from '../types';
import { WHATSAPP_CONFIG } from '../config/whatsapp';

export { WHATSAPP_CONFIG };

/**
 * Tabela Oficial de Preços CF (Class Focus):
 * - T-shirt da marca CF: 6.000 Kz
 * - T-shirt personalizada com T-shirt fornecida pelo cliente: 4.000 Kz
 */
export const OFFICIAL_PRICES = {
  cfBrandTee: 6000,
  clientSuppliedTee: 4000,
  cfBrandTeeFormatted: '6.000 Kz',
  clientSuppliedTeeFormatted: '4.000 Kz',
};

/**
 * Modelos Oficiais da Marca CF
 * Utilizando exclusivamente as fotografias reais fornecidas pelo proprietário da marca.
 * Sem duplicações e com o preço oficial de 6.000 Kz (ou 4.000 Kz com t-shirt do cliente).
 */
export const PRODUCTS: Product[] = [
  {
    id: 'cf-guerreira-tribal',
    name: 'GUERREIRA TRIBAL',
    category: 'african-art',
    categoryLabel: 'Arte Africana',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'T-shirt oficial da marca CF com estampa da guerreira tribal africana com lança e pinturas rituais nas costas e logótipo CF com coroa no peito.',
    story: 'Homenagem à soberania, bravura e ancestralidade da mulher guerreira.',
    details: [
      'Algodão premium penteado de corte streetwear confortável',
      'Estampa serigráfica de alta definição nas costas',
      'Logótipo oficial CF com coroa no peito esquerdo',
      'Gola canelada e costura reforçada de ombro a ombro',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 5, M: 12, L: 14, XL: 8, XXL: 4 },
    image: '/assets/aistudio/Camisolas_Negras_com_Guerreira_Tribal_9977a92d.png',
    badge: 'DROP 01 &bull; DESTAQUE',
    isHero: true,
  },
  {
    id: 'cf-leao-guerreira-poema',
    name: 'LEÃO, GUERREIRA & POEMA ANGOLA',
    category: 'african-art',
    categoryLabel: 'Coleção Exclusiva',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'Composição monumental unindo o leão tribal, a guerreira com lança e os versos do poema de exaltação a Angola nas costas, com logótipo CF no peito.',
    story: 'A fusão da força, da identidade cultural e da poesia patriótica angolana.',
    details: [
      'Algodão macio de alta durabilidade',
      'Estampa artística monumental de grande escala',
      'Acabamento premium resistente a lavagens',
      'Corte solto contemporâneo',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 4, M: 10, L: 15, XL: 7, XXL: 3 },
    image: '/assets/aistudio/Mockup_de_T-shirts_com_Arte_Tribal_Africana_e4aaf6d8.png',
    badge: 'BEST-SELLER',
    isHero: true,
  },
  {
    id: 'cf-frase-angola',
    name: 'FRASE ANGOLA: TERRA DE GLÓRIAS',
    category: 'typography',
    categoryLabel: 'Frases & Letras',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'Manifesto lírico e patriótico com a frase "Vou falar desta terra de glórias, nossa Angola de muitas memórias... Feliz" nas costas e logótipo CF no peito.',
    story: 'Orgulho nas raízes, memória coletiva e esperança.',
    details: [
      'Tipografia editorial marcante de alto contraste',
      'Logótipo CF branco no peito',
      'Algodão de toque suave e corte respirável',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 6, M: 9, L: 11, XL: 6, XXL: 3 },
    image: '/assets/aistudio/Camisolas_Pretas_Angola_em_Destaque_6774872b.png',
    badge: 'MANIFESTO',
  },
  {
    id: 'cf-leao-tribal',
    name: 'LEÃO TRIBAL IMPERIAL',
    category: 'tribal',
    categoryLabel: 'Tribal & Animais',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'Ilustração geométrica e simétrica do leão tribal de grande impacto nas costas e logótipo oficial CF com coroa no peito.',
    story: 'O leão como símbolo de realeza urbana, coragem e dignidade.',
    details: [
      'Ilustração geométrica detalhada em serigrafia branca',
      'Malha de algodão reforçada',
      'Corte clássico confortável para o dia a dia',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 7, M: 14, L: 12, XL: 8, XXL: 5 },
    image: '/assets/aistudio/T-shirts_pretas_com_le_o_tribal_e_monograma_d7eb0b20.png',
    badge: 'ASSINATURA',
  },
  {
    id: 'cf-emblema-tribal',
    name: 'EMBLEMA TRIBAL ANCESTRAL',
    category: 'tribal',
    categoryLabel: 'Tribal & Animais',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'T-shirt oficial CF com estampa monumental de máscara e brasão tribal ancestral nas costas e monograma com coroa no peito.',
    story: 'Realeza e proteção ancestral traduzidas numa estampa de alta definição para o streetwear moderno.',
    details: [
      '100% Algodão penteado de alta densidade 240g',
      'Estampa serigráfica de precisão nas costas',
      'Logótipo oficial CF com coroa no peito',
      'Corte oversized com gola canelada reforçada',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 6, M: 11, L: 13, XL: 7, XXL: 4 },
    image: '/assets/aistudio/Mockup_de_T-shirts_com_Emblema_Tribal_a1ba48db.png',
    badge: 'DROP EXCLUSIVO',
  },
  {
    id: 'cf-arte-tribal-geometrica',
    name: 'ARTE TRIBAL GEOMÉTRICA',
    category: 'african-art',
    categoryLabel: 'Arte Africana',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'T-shirt preta oficial CF com arte tribal vertical de linhas rituais angolanas de grande formato nas costas e logótipo CF com coroa no peito.',
    story: 'Simetria espiritual e estética minimalista inspirada nas tradições e pinturas rituais.',
    details: [
      'Algodão premium macio e estruturado',
      'Estampa serigráfica vertical de alto impacto',
      'Acabamento durável resistente a múltiplas lavagens',
      'Corte solto e confortável para qualquer ocasião',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 5, M: 9, L: 12, XL: 6, XXL: 3 },
    image: '/assets/aistudio/Mockup_de_T-shirt_Preto_com_Arte_Tribal_8af5f9e8.png',
    badge: 'NOVA EDIÇÃO',
  },
  {
    id: 'cf-goat-montes',
    name: 'G.O.A.T. CABRA MONTÊS',
    category: 'tribal',
    categoryLabel: 'Tribal & Animais',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'Composição gráfica arrojada com a cabra montês e o conceito G.O.A.T. (Greatest Of All Time) nas costas e monograma CF no peito.',
    story: 'A atitude de quem sobe qualquer montanha com resiliência, liderança e determinação.',
    details: [
      'Tecido 100% algodão premium penteado 240g',
      'Ilustração geométrica de alto contraste nas costas',
      'Corte boxy streetwear contemporâneo',
      'Costura dupla reforçada nos ombros e gola',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 7, M: 12, L: 15, XL: 8, XXL: 4 },
    image: '/assets/aistudio/Mockup_de_T-shirts_com_cabra_mont_s_GOAT_b9c147c8.png',
    badge: 'G.O.A.T. DROP',
  },
  {
    id: 'cf-serpente-naja',
    name: 'SERPENTE COBRA NAJA',
    category: 'gothic',
    categoryLabel: 'Estilo Gótico',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'Silhueta arrojada da serpente cobra naja em posição de ataque nas costas e brasão CF com coroa no peito.',
    story: 'Estética darkwear com atitude, precisão e elegância minimalista.',
    details: [
      'Estampa serigráfica em alto contraste branco sobre preto',
      'Algodão de qualidade superior',
      'Corte moderno e caimento impecável',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 4, M: 8, L: 10, XL: 5, XXL: 2 },
    image: '/assets/aistudio/Mockup_de_T-shirts_pretos_com_serpente_e_bras_o_CF_f4c663a0.png',
    badge: 'DARKWEAR',
  },
  {
    id: 'cf-mascote-coelho',
    name: 'MASCOTE REBEL RABBIT',
    category: 'custom',
    categoryLabel: 'Street Art',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'Ilustração urbana underground da mascote rebel rabbit nas costas e logótipo oficial CF com a coroa no peito.',
    story: 'Arte urbana ousada e irreverente para quem define o seu próprio estilo.',
    details: [
      'Ilustração gráfica streetwear de autor',
      'Estampa serigráfica com detalhes nítidos',
      '100% Algodão confortável para qualquer estação',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 5, M: 7, L: 9, XL: 6, XXL: 3 },
    image: '/assets/aistudio/Mockup_de_T-shirts_com_Mascote_Coelho_5f5a7a30.png',
    badge: 'NOVO DROP',
  },
  {
    id: 'cf-sonhe-alto',
    name: 'SONHE ALTO: O SEU DEUS É GRANDE',
    category: 'typography',
    categoryLabel: 'Frases & Letras',
    color: 'Branca',
    defaultColor: 'white',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'T-shirt branca oficial da marca CF com a mensagem inspiradora "SONHE ALTO PORQUE O SEU DEUS É GRANDE." em tipografia de pincelada urbana nas costas e logótipo CF com coroa no peito.',
    story: 'Fé, ambição e resiliência diária para sonhar grande com a força da nossa identidade.',
    details: [
      '100% Algodão penteado premium branco de alta gramatura',
      'Estampa serigráfica preta "SONHE ALTO PORQUE O SEU DEUS É GRANDE." nas costas',
      'Logótipo oficial CF com coroa no peito esquerdo',
      'Corte streetwear solto e confortável com toque macio',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 5, M: 10, L: 14, XL: 7, XXL: 4 },
    image: '/assets/aistudio/T-shirts_brancas_com_mensagem_inspiradora_2de484f3.png',
    badge: 'MENSAGEM INSPIRADORA',
  },
  {
    id: 'cf-never-give-up',
    name: 'NEVER GIVE UP URBAN',
    category: 'typography',
    categoryLabel: 'Frases & Letras',
    color: 'Branca',
    defaultColor: 'white',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'T-shirt branca oficial da marca CF com a frase de motivação e persistência "NEVER GIVE UP" em caligrafia artística de pincel nas costas e logótipo CF com coroa no peito.',
    story: 'A atitude de nunca desistir, refletida na energia e caligrafia das ruas de Luanda.',
    details: [
      'Algodão macio de qualidade superior na cor branca',
      'Tipografia caligráfica urbana "NEVER GIVE UP" em preto nas costas',
      'Monograma com coroa oficial CF no peito esquerdo',
      'Gola canelada e costura dupla reforçada',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 6, M: 12, L: 15, XL: 8, XXL: 3 },
    image: '/assets/aistudio/T-shirts_brancas_com_grafismo_urbano_33e70e63.png',
    badge: 'STREET ATTITUDE',
  },
  {
    id: 'cf-guerreiro-tribal-white',
    name: 'MÁSCARA TRIBAL GUERREIRO',
    category: 'african-art',
    categoryLabel: 'Arte Africana',
    color: 'Branca',
    defaultColor: 'white',
    priceKz: 6000,
    clientShirtPriceKz: 4000,
    description: 'T-shirt branca oficial da marca CF com ilustração de máscara e guerreiro tribal ancestral com lança em alto contraste nas costas e logótipo CF com coroa no peito.',
    story: 'Raízes, ancestralidade e espírito guerreiro traduzidos em silhueta gráfica contemporânea.',
    details: [
      '100% Algodão penteado premium branco de alta densidade',
      'Ilustração tribal de máscara e guerreiro com lança em alto contraste nas costas',
      'Logótipo oficial CF com coroa no peito esquerdo',
      'Corte clássico estruturado com caimento impecável',
    ],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: { S: 4, M: 9, L: 13, XL: 6, XXL: 3 },
    image: '/assets/aistudio/Mockup_de_T-shirts_com_Arte_Tribal_6c74c695.png',
    badge: 'ARTE ANCESTRAL',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'Todos os Modelos' },
  { id: 'african-art', label: 'Arte Africana' },
  { id: 'tribal', label: 'Tribal & Animais' },
  { id: 'typography', label: 'Frases & Letras' },
  { id: 'gothic', label: 'Estilo Gótico' },
  { id: 'custom', label: 'Street Art' },
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
  return `${price.toLocaleString('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} Kz`;
};
