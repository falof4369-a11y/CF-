import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { getApprovedReviews, saveReview } from '../services/db';
import { useTheme } from '../context/ThemeContext';
import { Star, MessageSquarePlus, CheckCircle2, ShieldCheck, Sparkles, Filter } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { isWhite } = useTheme();
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<Review['category']>('Elogio');
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active filter category
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const loadApproved = async () => {
    setLoading(true);
    try {
      const list = await getApprovedReviews();
      setApprovedReviews(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproved();
    const handleUpdate = (e: any) => {
      if (!e.detail?.storeName || e.detail.storeName === 'reviews') {
        loadApproved();
      }
    };
    window.addEventListener('cf_data_updated', handleUpdate as EventListener);
    window.addEventListener('storage', loadApproved);
    return () => {
      window.removeEventListener('cf_data_updated', handleUpdate as EventListener);
      window.removeEventListener('storage', loadApproved);
    };
  }, []);

  // Compute public average ONLY from approved reviews
  const totalApproved = approvedReviews.length;
  const averageRating =
    totalApproved > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalApproved).toFixed(1)
      : '5.0';

  const filteredReviews = approvedReviews.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Por favor indica o teu nome ou pseudónimo.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      setErrorMsg('Por favor escreve um comentário detalhado (mínimo 8 caracteres).');
      return;
    }

    setSubmitting(true);
    try {
      const newReview: Review = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        authorName: name.trim(),
        rating,
        category,
        comment: comment.trim(),
        date: new Date().toISOString().slice(0, 10),
        status: 'pending', // Strictly pending! Will NEVER show until admin approves
      };

      await saveReview(newReview);
      setSubmittedSuccess(true);
      setName('');
      setComment('');
      setRating(5);
    } catch {
      setErrorMsg('Ocorreu um erro ao enviar o comentário. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="avaliacoes"
      className={`py-20 relative transition-colors duration-300 border-t ${
        isWhite
          ? 'bg-zinc-50 text-black border-zinc-200'
          : 'bg-black text-white border-zinc-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-[1.5px] ${isWhite ? 'bg-black' : 'bg-white'}`} />
              <span
                className={`text-xs font-mono tracking-[0.28em] uppercase ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                OPINIÃO DOS CLIENTES
              </span>
            </div>
            <h2
              className={`font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              Comentários e Avaliações
            </h2>
            <p
              className={`text-xs sm:text-sm font-mono mt-1 ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Feedback autêntico verificado e aprovado pela equipa CF.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Rating Average Badge */}
            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${
                isWhite ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
              }`}
            >
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                  {totalApproved} {totalApproved === 1 ? 'Avaliação Aprovada' : 'Avaliações Aprovadas'}
                </span>
              </div>
              <span className="font-street text-3xl font-black tracking-tight">{averageRating}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm);
                setSubmittedSuccess(false);
              }}
              className={`px-4 py-2.5 font-street text-xs font-bold uppercase tracking-wider rounded border flex items-center gap-2 transition-all cursor-pointer ${
                showForm
                  ? isWhite
                    ? 'bg-zinc-200 border-black text-black'
                    : 'bg-zinc-800 border-white text-white'
                  : isWhite
                  ? 'bg-black text-white hover:bg-zinc-800 border-black'
                  : 'bg-white text-black hover:bg-zinc-200 border-white'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showForm ? 'Fechar Formulário' : 'Avaliar o Site'}</span>
            </button>
          </div>
        </div>

        {/* Submission Form (Collapsible) */}
        {showForm && (
          <div
            className={`mb-12 p-6 sm:p-8 rounded-xl border animate-fade-in ${
              isWhite
                ? 'bg-white border-zinc-300 shadow-md text-black'
                : 'bg-zinc-950 border-zinc-800 text-white shadow-[0_0_30px_rgba(0,0,0,0.8)]'
            }`}
          >
            {submittedSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 animate-bounce" />
                <h3 className="font-street text-2xl font-bold uppercase">
                  Obrigado pelo teu comentário!
                </h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-md mx-auto leading-relaxed">
                  A tua avaliação foi submetida com sucesso e ficará com o estado{' '}
                  <span className="text-amber-400 font-bold">Pendente de aprovação</span>.
                  Aparecerá publicamente assim que aprovada pela moderação da CF.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setShowForm(false);
                  }}
                  className={`mt-4 px-5 py-2 rounded text-xs font-mono uppercase font-bold border transition-colors cursor-pointer ${
                    isWhite
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-white'
                  }`}
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                  <span className="font-street text-xl font-bold uppercase tracking-wider">
                    Deixar Comentário ou Crítica Construtiva
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Moderação prévia ativa
                  </span>
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 font-bold">
                    A tua classificação (1 a 5 estrelas) *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer"
                        title={`${star} estrela${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-zinc-400 ml-2">
                      {rating === 5
                        ? 'Excelente (5/5)'
                        : rating === 4
                        ? 'Muito Bom (4/5)'
                        : rating === 3
                        ? 'Bom (3/5)'
                        : rating === 2
                        ? 'Regular (2/5)'
                        : 'Insuficiente (1/5)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      O teu Nome ou Pseudónimo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Mauro Silva"
                      className={`w-full px-3.5 py-2 text-xs rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Tipo de Feedback
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className={`w-full px-3.5 py-2 text-xs rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    >
                      <option value="Elogio">Elogio</option>
                      <option value="Qualidade">Qualidade da T-shirt</option>
                      <option value="Sugestão">Sugestão de Modelo</option>
                      <option value="Crítica Construtiva">Crítica Construtiva</option>
                      <option value="Geral">Experiência Geral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                    O teu Comentário ou Crítica *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partilha a tua experiência com as T-shirts CF, o atendimento, caimento, serigrafia ou sugestões para próximos drops..."
                    className={`w-full px-3.5 py-2 text-xs rounded border focus:outline-none leading-relaxed ${
                      isWhite
                        ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                        : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                    }`}
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-500 text-xs font-mono">{errorMsg}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Protegido contra spam &bull; Aprovação humana prévia
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2.5 font-street text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                      isWhite
                        ? 'bg-black text-white hover:bg-zinc-800'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {submitting ? 'A submeter...' : 'Enviar para Moderação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Categories Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs font-mono">
          <span className="text-zinc-500 flex items-center gap-1 uppercase mr-2 text-[10px]">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>
          {['all', 'Elogio', 'Qualidade', 'Sugestão', 'Crítica Construtiva'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer text-[11px] ${
                activeFilter === cat
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'bg-white border border-zinc-300 text-zinc-700 hover:border-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todos os Aprovados' : cat}
            </button>
          ))}
        </div>

        {/* Public Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800/80 rounded-xl p-8">
            <p className="text-xs font-mono text-zinc-400">
              Não existem avaliações aprovadas nesta categoria no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                  isWhite
                    ? 'bg-white border-zinc-200 shadow-xs hover:shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'opacity-20'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {rev.date}
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-relaxed mb-6 font-sans italic ${
                      isWhite ? 'text-zinc-800' : 'text-zinc-300'
                    }`}
                  >
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/40 flex items-center justify-between">
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

                  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
