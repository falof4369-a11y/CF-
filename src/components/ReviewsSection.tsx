import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Star, Shield, Info, Sparkles } from 'lucide-react';
import { useInView } from '../context/useInView';

interface DemonstrativeReview {
  id: string;
  authorName: string;
  category: string;
  rating: number;
  highlight: string;
  comment: string;
}

// Curated demonstrative reviews illustrating the CF streetwear concept & aesthetic
const DEMONSTRATIVE_REVIEWS: DemonstrativeReview[] = [
  {
    id: 'demo-1',
    authorName: 'Exemplo: Mauro Silva',
    category: 'Caimento & Algodão 240g',
    rating: 5,
    highlight: 'Corte oversized estruturado',
    comment:
      'O corte oversized de 240g tem uma estrutura pesada e caimento impecável nos ombros. A estampa mantém-se nítida e resistente.',
  },
  {
    id: 'demo-2',
    authorName: 'Exemplo: Nzinga Manuel',
    category: 'Design & Tipografia',
    rating: 5,
    highlight: 'Serigrafia de alta densidade',
    comment:
      'A definição da serigrafia de alta densidade na peça "Sonhe Alto" é impressionante. Design minimalista com presença e atitude.',
  },
  {
    id: 'demo-3',
    authorName: 'Exemplo: Edson Carvalho',
    category: 'Gótico & Sagrado',
    rating: 5,
    highlight: 'Presença urbana marcante',
    comment:
      'A estética gótica com a cruz ornamental no peito e costas confere uma presença única. Confortável e de toque encorpado.',
  },
  {
    id: 'demo-4',
    authorName: 'Exemplo: Tatiana Costa',
    category: 'Personalização sob Medida',
    rating: 5,
    highlight: 'Acabamento profissional',
    comment:
      'Demonstração da personalização com frase própria numa peça fornecida. A estampagem serigráfica mantém os mais altos padrões de detalhe.',
  },
  {
    id: 'demo-5',
    authorName: 'Exemplo: Carlos Domingos',
    category: 'Durabilidade & Tecido',
    rating: 5,
    highlight: 'Gola canelada e resistência',
    comment:
      'O algodão penteado preto preserva o tom escuro profundo e a gola canelada reforçada não deforma mesmo com uso diário intenso.',
  },
  {
    id: 'demo-6',
    authorName: 'Exemplo: Yara Fernandes',
    category: 'Identidade & Arte Tribal',
    rating: 5,
    highlight: 'Estética afro-streetwear',
    comment:
      'O contraste da arte tribal nas costas com o corte streetwear traduz a verdadeira essência da marca CF em Luanda.',
  },
];

export const ReviewsSection: React.FC = () => {
  const { isWhite } = useTheme();
  const { ref: sectionRef, isInView } = useInView<HTMLDivElement>();

  return (
    <section
      id="avaliacoes"
      ref={sectionRef}
      className={`py-20 relative select-none transition-colors duration-300 border-t ${
        isWhite
          ? 'bg-zinc-50 text-black border-zinc-200'
          : 'bg-black text-white border-zinc-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Discreet Title Reveal Animation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className={`${isInView ? 'cf-title-enter' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-[1.5px] ${isWhite ? 'bg-black' : 'bg-white'}`} />
              <span
                className={`text-xs font-mono tracking-[0.28em] uppercase ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                EXEMPLOS DEMONSTRATIVOS &bull; CONCEITO CF
              </span>
            </div>
            <h2
              className={`font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              Conceito e Padrão da Marca
            </h2>
            <p
              className={`text-xs sm:text-sm font-mono mt-1 ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Demonstração visual dos parâmetros de qualidade, serigrafia e estética streetwear da CF.
            </p>
          </div>

          {/* Static Quality Standards Badge */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border shrink-0 ${
              isWhite ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400" aria-label="Classificação máxima">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                Padrão CF &bull; Algodão 240g
              </span>
            </div>
            <span className="font-street text-3xl font-black tracking-tight text-amber-400">
              5.0
            </span>
          </div>
        </div>

        {/* Discreet Informative Notice regarding demonstrative nature */}
        <div
          className={`mb-10 p-3.5 rounded-lg border text-xs font-mono flex items-start gap-3 transition-colors ${
            isWhite
              ? 'bg-zinc-100/80 border-zinc-200 text-zinc-700'
              : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
          }`}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
          <p className="leading-relaxed">
            <strong className={`font-semibold uppercase tracking-wider ${isWhite ? 'text-black' : 'text-zinc-200'}`}>
              Nota Informativa:
            </strong>{' '}
            As avaliações e comentários desta secção são exemplos demonstrativos concebidos para ilustrar as especificações dos modelos, o caimento das peças e os padrões de produção da marca CF. Não representam opiniões reais de clientes nem recolhem novas submissões públicas.
          </p>
        </div>

        {/* Static Grid of Demonstrative Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMONSTRATIVE_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 rounded-xl border flex flex-col justify-between cf-card-hover transition-all duration-300 ${
                isWhite
                  ? 'bg-white border-zinc-200 shadow-xs hover:border-zinc-400'
                  : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header of card: Stars and badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400" aria-label={`${rev.rating} estrelas`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current' : 'opacity-20'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded border uppercase font-semibold text-zinc-500 border-zinc-800">
                    EXEMPLO DEMONSTRATIVO
                  </span>
                </div>

                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider block mb-2 ${
                    isWhite ? 'text-zinc-800' : 'text-zinc-200'
                  }`}
                >
                  {rev.highlight}
                </span>

                <p
                  className={`text-sm leading-relaxed mb-6 font-sans italic ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              {/* Bottom footer of card */}
              <div
                className={`pt-4 border-t flex items-center justify-between ${
                  isWhite ? 'border-zinc-200' : 'border-zinc-900'
                }`}
              >
                <div>
                  <span
                    className={`font-street font-bold text-sm uppercase block ${
                      isWhite ? 'text-black' : 'text-white'
                    }`}
                  >
                    {rev.authorName}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {rev.category}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800/40 text-zinc-400 border border-zinc-700/50 uppercase font-bold">
                  <Shield className="w-2.5 h-2.5 text-zinc-400" /> Conceito CF
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
