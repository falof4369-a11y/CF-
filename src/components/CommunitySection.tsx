import React, { useState, useEffect } from 'react';
import { CommunityPhoto } from '../types';
import { getApprovedCommunityPhotos, saveCommunityPhoto } from '../services/db';
import { useTheme } from '../context/ThemeContext';
import { Camera, CheckCircle2, Upload, AlertCircle, ShieldCheck, Heart, Sparkles, X } from 'lucide-react';

export const CommunitySection: React.FC = () => {
  const { isWhite } = useTheme();
  const [approvedPhotos, setApprovedPhotos] = useState<CommunityPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [tshirtModel, setTshirtModel] = useState('');
  const [caption, setCaption] = useState('');
  const [consent, setConsent] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox
  const [activePhoto, setActivePhoto] = useState<CommunityPhoto | null>(null);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const photos = await getApprovedCommunityPhotos();
      setApprovedPhotos(photos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
    const handleUpdate = (e: any) => {
      if (!e.detail?.storeName || e.detail.storeName === 'communityPhotos') {
        loadPhotos();
      }
    };
    window.addEventListener('cf_data_updated', handleUpdate as EventListener);
    window.addEventListener('storage', loadPhotos);
    return () => {
      window.removeEventListener('cf_data_updated', handleUpdate as EventListener);
      window.removeEventListener('storage', loadPhotos);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setFormError('A fotografia deve ter no máximo 15MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setImagePreview(compressed);
          } else {
            setImagePreview(rawUrl);
          }
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
      setFormError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Por favor introduz o teu nome.');
      return;
    }
    if (!imagePreview) {
      setFormError('Por favor seleciona uma fotografia real a vestir CF.');
      return;
    }
    if (!consent) {
      setFormError('Deves confirmar a autorização para partilhar a fotografia.');
      return;
    }

    setSubmitting(true);
    try {
      const photo: CommunityPhoto = {
        id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        authorName: name.trim(),
        authorHandle: handle.trim() ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) : undefined,
        tshirtModel: tshirtModel.trim() || 'T-shirt CF Streetwear',
        caption: caption.trim() || undefined,
        imageUrl: imagePreview,
        date: new Date().toISOString().slice(0, 10),
        status: 'pending', // Strictly pending! Approval required in Admin panel!
        consentConfirmed: true,
      };

      await saveCommunityPhoto(photo);
      setUploadSuccess(true);
      setName('');
      setHandle('');
      setTshirtModel('');
      setCaption('');
      setImageFile(null);
      setImagePreview(null);
      setConsent(false);
    } catch {
      setFormError('Erro ao submeter a fotografia. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="comunidade"
      className={`py-24 relative transition-colors duration-300 border-t ${
        isWhite
          ? 'bg-white text-black border-zinc-200'
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
                FAMÍLIA CF &bull; CLIENTES REAIS
              </span>
            </div>
            <h2
              className={`font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              Comunidade CF na Rua
            </h2>
            <p
              className={`text-xs sm:text-sm font-mono mt-1 ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Fotografias reais enviadas pelos nossos clientes a vestir a identidade da marca.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowUploadModal(true);
              setUploadSuccess(false);
            }}
            className={`px-5 py-3 font-street text-xs font-bold uppercase tracking-wider rounded border flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isWhite
                ? 'bg-black text-white hover:bg-zinc-800 border-black'
                : 'bg-white text-black hover:bg-zinc-200 border-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Partilhar a Minha Foto com a CF</span>
          </button>
        </div>

        {/* Gallery Grid of Approved Photos */}
        {approvedPhotos.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl p-8">
            <Camera className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
            <p className="text-xs font-mono text-zinc-400">
              Sê o primeiro a partilhar uma fotografia a vestir a tua T-shirt CF!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {approvedPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isWhite ? 'bg-zinc-100 border-zinc-200 shadow-xs' : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={photo.imageUrl}
                    alt={photo.authorName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Overlay info on hover/mobile */}
                <div className="p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-street font-bold text-sm uppercase">
                      {photo.authorName}
                    </span>
                    {photo.authorHandle && (
                      <span className="text-[11px] font-mono text-zinc-400">
                        {photo.authorHandle}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                    {photo.tshirtModel}
                  </span>

                  {photo.caption && (
                    <p className="text-xs text-zinc-400 italic line-clamp-2">
                      &quot;{photo.caption}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Lightbox Modal */}
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setActivePhoto(null)}
          >
            <div
              className={`relative max-w-2xl w-full rounded-xl overflow-hidden border ${
                isWhite ? 'bg-white text-black border-zinc-300' : 'bg-zinc-950 text-white border-zinc-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.authorName}
                  className="max-h-[70vh] w-auto object-contain mx-auto"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-street text-xl font-bold uppercase">
                    {activePhoto.authorName}
                  </h3>
                  {activePhoto.authorHandle && (
                    <span className="text-xs font-mono text-zinc-400">
                      {activePhoto.authorHandle}
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-zinc-500 uppercase mb-2">
                  Modelo: {activePhoto.tshirtModel}
                </p>
                {activePhoto.caption && (
                  <p className="text-sm italic leading-relaxed text-zinc-300">
                    &quot;{activePhoto.caption}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Customer Photo Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className={`relative max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-xl p-6 sm:p-7 border shadow-2xl ${
                isWhite
                  ? 'bg-white text-black border-zinc-300'
                  : 'bg-zinc-950 text-white border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {uploadSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 animate-bounce" />
                  <h3 className="font-street text-2xl font-bold uppercase">
                    Fotografia Submetida com Sucesso!
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    A tua fotografia foi enviada para a equipa CF com o estado{' '}
                    <span className="text-amber-400 font-bold">Pendente de aprovação</span>.
                    Será publicada na galeria da Comunidade CF assim que verificada.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadSuccess(false);
                      setShowUploadModal(false);
                    }}
                    className={`mt-4 px-6 py-2.5 rounded text-xs font-mono uppercase font-bold border transition-colors cursor-pointer ${
                      isWhite
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-white'
                    }`}
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold">
                      COMUNIDADE CF
                    </span>
                  </div>
                  <h3 className="font-street text-2xl font-bold uppercase tracking-tight">
                    Partilhar a Minha Foto com a CF
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    A fotografia será analisada e só aparecerá publicamente após aprovação.
                  </p>

                  {/* Photo picker */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Fotografia a Vestir a T-shirt CF *
                    </label>
                    <div
                      className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer transition-colors ${
                        isWhite ? 'border-zinc-300 hover:border-black' : 'border-zinc-800 hover:border-zinc-500'
                      }`}
                    >
                      {imagePreview ? (
                        <div className="relative aspect-square max-w-[200px] mx-auto rounded overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Pré-visualização da foto"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-7 h-7 mb-1.5 text-zinc-400" />
                          <span className="text-xs font-mono uppercase font-bold">
                            Selecionar Fotografia (PNG, JPG, WEBP)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            Máximo 10MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1 font-bold">
                        O teu Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Mauro Silva"
                        className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1 font-bold">
                        Instagram / Handle (Opcional)
                      </label>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="Ex: @mauro.street"
                        className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1 font-bold">
                      Modelo da T-shirt (Se conhecido)
                    </label>
                    <input
                      type="text"
                      value={tshirtModel}
                      onChange={(e) => setTshirtModel(e.target.value)}
                      placeholder="Ex: Guerreira Tribal, Leão & Poema, Personalizada..."
                      className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase mb-1 font-bold">
                      Legenda / Mensagem (Opcional)
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Uma frase sobre o teu look ou experiência..."
                      className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  {/* Consent Checkbox - CRITICAL */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 rounded accent-black"
                      />
                      <span className="text-[11px] text-zinc-400 leading-snug">
                        Confirmo expressamente que esta fotografia é da minha autoria ou tenho autorização da pessoa fotografada para a sua publicação na galeria pública da Comunidade CF.
                      </span>
                    </label>
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 text-xs font-mono uppercase rounded border border-zinc-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-6 py-2 font-street text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                        isWhite
                          ? 'bg-black text-white hover:bg-zinc-800'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      {submitting ? 'A enviar...' : 'Enviar para Moderação'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
