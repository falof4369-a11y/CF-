import React, { useState } from 'react';
import { TShirtMockup } from './TShirtMockup';
import { BRAND_CONFIG, SIZES } from '../data/products';
import { getCustomizationWhatsAppUrl, WHATSAPP_CONFIG } from '../config/whatsapp';
import { Sparkles, MessageCircle, Upload, CheckCircle2, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonalizationSectionProps {
  initialPhrase?: string;
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({
  initialPhrase = 'CLASS FOCUS &bull; LUANDA',
}) => {
  // Studio interactive state
  const [customPhrase, setCustomPhrase] = useState<string>(initialPhrase);
  const [fontStyle, setFontStyle] = useState<'street' | 'gothic' | 'syne'>('street');
  const [placement, setPlacement] = useState<'back' | 'front' | 'chest-logo'>('back');
  const [tshirtColor, setTshirtColor] = useState<'black' | 'charcoal' | 'white'>('black');
  const [view, setView] = useState<'front' | 'back'>('back');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tshirtModel, setTshirtModel] = useState('Oversized Streetwear Heavyweight 240g');
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [designDescription, setDesignDescription] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle file attachment preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: 'A imagem deve ter no máximo 8MB.' }));
        return;
      }
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReferencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.file;
        return copy;
      });
    }
  };

  const handleRemoveFile = () => {
    setReferenceFile(null);
    setReferencePreview(null);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = 'Por favor insere o teu nome completo (mínimo 3 caracteres).';
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.phone = 'Por favor insere um contacto telefónico/WhatsApp válido (ex: 958 194 301).';
    }

    if (!designDescription.trim() && !customPhrase.trim()) {
      newErrors.description = 'Descreve a ideia da estampa ou digita uma frase no estúdio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      name: name.trim(),
      phone: phone.trim(),
      model: tshirtModel,
      size: selectedSize,
      color: tshirtColor === 'black' ? 'Preto Clássico' : tshirtColor === 'charcoal' ? 'Grafite Escuro' : 'Branco Puro',
      placement: placement === 'back' ? 'Costas (Estampa Grande)' : placement === 'front' ? 'Frente Completa' : 'Peito Esquerdo',
      phrase: customPhrase.trim() || 'Nenhuma frase específica',
      fontStyle: fontStyle === 'street' ? 'Streetwear Italic' : fontStyle === 'gothic' ? 'Gótico Imperial' : 'Modern Display',
      description: designDescription.trim() || customPhrase.trim(),
      hasImageAttachment: !!referenceFile,
      imageName: referenceFile?.name,
    };

    // Use centralized WhatsApp helper
    const waUrl = getCustomizationWhatsAppUrl(data);

    setSubmittedData({ ...data, waUrl });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#a1a1aa', '#27272a'],
      });
    } catch {
      // safe fallback
    }

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    if (submittedData?.rawMessage) {
      navigator.clipboard.writeText(submittedData.rawMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="personalizar" className="py-24 bg-black text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-300">
              LABORATÓRIO DE CRIAÇÃO
            </span>
          </div>

          <h2 className="font-street text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase text-white mb-4">
            A TUA IDEIA. O TEU ESTILO.
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Não encontras exatamente o que tens em mente? Nós transformamos as tuas frases, ilustrações, memórias ou referências numa t-shirt streetwear de qualidade superior.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Live Interactive Studio Visualizer */}
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 p-6 rounded-lg flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-4 border-b border-zinc-900 mb-4">
              <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                ESTÚDIO DE PRÉ-VISUALIZAÇÃO
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView(view === 'back' ? 'front' : 'back')}
                  className="text-[11px] font-mono uppercase tracking-wider px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-800"
                >
                  {view === 'back' ? 'Ver Frente' : 'Ver Costas'}
                </button>
              </div>
            </div>

            {/* Interactive Mockup */}
            <div className="w-full max-w-[380px] my-2">
              <TShirtMockup
                frontDesign="chest-logo"
                backDesign="custom"
                customPhrase={customPhrase}
                customFontStyle={fontStyle}
                customPlacement={placement}
                color={tshirtColor}
                view={view}
                interactive={false}
                sizeTag={selectedSize}
                customGraphicUrl={referencePreview || undefined}
              />
            </div>

            {/* Studio Live Custom Controls */}
            <div className="w-full mt-6 space-y-4 pt-4 border-t border-zinc-900">
              {/* Type Live Phrase */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5">
                  Texto / Frase na Peça:
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={customPhrase}
                  onChange={(e) => setCustomPhrase(e.target.value)}
                  placeholder="Digita a tua frase ou nome..."
                  className="w-full bg-black border border-zinc-800 focus:border-white px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Font Style Selection */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5">
                  Estilo da Tipografia:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontStyle('street')}
                    className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-all ${
                      fontStyle === 'street'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Street Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('gothic')}
                    className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-all ${
                      fontStyle === 'gothic'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Gótico
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('syne')}
                    className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-all ${
                      fontStyle === 'syne'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Modern Display
                  </button>
                </div>
              </div>

              {/* T-Shirt Color */}
              <div>
                <label className="block text-[11px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5">
                  Cor da T-shirt:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTshirtColor('black')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all ${
                      tshirtColor === 'black'
                        ? 'border-white text-white bg-zinc-900'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-black border border-zinc-600" />
                    Preto
                  </button>

                  <button
                    type="button"
                    onClick={() => setTshirtColor('charcoal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all ${
                      tshirtColor === 'charcoal'
                        ? 'border-white text-white bg-zinc-900'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#18181b] border border-zinc-500" />
                    Grafite
                  </button>

                  <button
                    type="button"
                    onClick={() => setTshirtColor('white')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all ${
                      tshirtColor === 'white'
                        ? 'border-white text-white bg-zinc-900'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-zinc-200 border border-white" />
                    Branco
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Validated Form with WhatsApp Preparation */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 p-6 sm:p-8 rounded-lg">
            <h3 className="font-street text-2xl font-bold tracking-wider uppercase text-white mb-1">
              FORMULÁRIO DE PEDIDO PERSONALIZADO
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">
              Preenche os detalhes. O pedido será compilado e preparado para envio direto ao WhatsApp da equipa de produção da CF.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="Ex: Carlos Ferreira"
                  className={`w-full bg-black border px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                    errors.name ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                  Contacto Telefónico / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="Ex: +244 923 000 000"
                  className={`w-full bg-black border px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Model & Size Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                    Modelo da T-shirt
                  </label>
                  <select
                    value={tshirtModel}
                    onChange={(e) => setTshirtModel(e.target.value)}
                    className="w-full bg-black border border-zinc-800 focus:border-white px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Oversized Streetwear Heavyweight 240g">
                      Oversized Streetwear 240g (Mais Escolhido)
                    </option>
                    <option value="Boxy Cut Vintage 220g">
                      Boxy Cut Vintage 220g
                    </option>
                    <option value="Regular Fit Premium 190g">
                      Regular Fit Premium 190g
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                    Tamanho
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-mono font-bold rounded transition-all ${
                          selectedSize === size
                            ? 'bg-white text-black'
                            : 'bg-black text-zinc-400 border border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Print Placement */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                  Posição da Estampa Pretendida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlacement('back');
                      setView('back');
                    }}
                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-all text-center ${
                      placement === 'back'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Costas (A3+ Gigante)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlacement('front');
                      setView('front');
                    }}
                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-all text-center ${
                      placement === 'front'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Frente Central
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlacement('chest-logo');
                      setView('front');
                    }}
                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-all text-center ${
                      placement === 'chest-logo'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Peito Minimal
                  </button>
                </div>
              </div>

              {/* Design Description */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                  Descrição Detalhada do Design Pretendido *
                </label>
                <textarea
                  rows={3}
                  value={designDescription}
                  onChange={(e) => {
                    setDesignDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  placeholder="Explica a tua ideia: referências que gostas, frases adicionais, se queres elementos tribais, estilo gótico, retratos ou símbolos específicos..."
                  className={`w-full bg-black border px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                    errors.description ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
                  </p>
                )}
              </div>

              {/* Reference Image Attachment (Optional) */}
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300 mb-1">
                  Imagem de Referência (Opcional)
                </label>
                <div className="border border-dashed border-zinc-800 hover:border-zinc-500 p-4 rounded-lg bg-black/40 flex flex-col items-center justify-center text-center relative transition-colors">
                  {referenceFile ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {referencePreview && (
                          <img
                            src={referencePreview}
                            alt="Preview anexo"
                            className="w-12 h-12 object-cover rounded border border-zinc-700"
                          />
                        )}
                        <div className="text-left">
                          <p className="text-xs font-mono text-white truncate max-w-[200px]">
                            {referenceFile.name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            {(referenceFile.size / 1024).toFixed(0)} KB &bull; Pronto para anexar
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs font-mono text-red-400 hover:text-red-300 underline"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full">
                      <Upload className="w-6 h-6 text-zinc-400 mb-1.5" />
                      <span className="text-xs font-mono text-white uppercase tracking-wider">
                        Carregar ficheiro (PNG, JPG, WEBP)
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        Máximo 8MB. Também podes enviar diretamente pelo WhatsApp.
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
                {errors.file && (
                  <p className="text-red-400 text-xs mt-1">{errors.file}</p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-street text-sm tracking-[0.22em] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>ENVIAR PEDIDO VIA WHATSAPP</span>
                </button>
                <p className="text-[11px] font-mono text-zinc-500 text-center uppercase tracking-wider mt-2">
                  Atendimento oficial CF &bull; Resposta em até 2 horas úteis
                </p>
              </div>
            </form>

            {/* Success Notification Banner */}
            {submittedData && (
              <div className="mt-6 p-4 bg-zinc-900 border border-white/30 rounded-lg space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="font-street font-bold text-sm tracking-wider uppercase">
                    PEDIDO PREPARADO COM SUCESSO!
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Abrimos o WhatsApp com todos os detalhes do teu pedido. Se a janela não tiver aberto automaticamente, utiliza os botões abaixo:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={submittedData.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-black font-mono text-xs uppercase font-bold tracking-wider hover:bg-zinc-200 rounded"
                  >
                    Abrir WhatsApp Novamente &rarr;
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-4 py-2 bg-black border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Mensagem Copiada!' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
