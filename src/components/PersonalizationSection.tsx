import React, { useState } from 'react';
import { TShirtMockup } from './TShirtMockup';
import { SIZES, OFFICIAL_PRICES } from '../data/products';
import { getCustomizationWhatsAppUrl } from '../config/whatsapp';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, MessageCircle, Upload, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonalizationSectionProps {
  initialPhrase?: string;
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({
  initialPhrase = 'CLASS FOCUS &bull; LUANDA',
}) => {
  const { isWhite } = useTheme();

  // Studio interactive state
  const [customPhrase, setCustomPhrase] = useState<string>(initialPhrase);
  const [fontStyle, setFontStyle] = useState<'street' | 'gothic' | 'syne'>('street');
  const [placement, setPlacement] = useState<'back' | 'front' | 'chest-logo'>('back');
  const [tshirtColor, setTshirtColor] = useState<'black' | 'charcoal' | 'white'>('black');
  const [view, setView] = useState<'front' | 'back'>('back');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shirtSource, setShirtSource] = useState<'cf-shirt' | 'client-shirt'>('cf-shirt');
  const [tshirtModel, setTshirtModel] = useState('Oversized Streetwear Heavyweight 240g');
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [designDescription, setDesignDescription] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const currentPriceFormatted = shirtSource === 'cf-shirt' ? OFFICIAL_PRICES.cfBrandTeeFormatted : OFFICIAL_PRICES.clientSuppliedTeeFormatted;

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

    const sourceLabel = shirtSource === 'cf-shirt'
      ? `T-shirt da marca CF (${OFFICIAL_PRICES.cfBrandTeeFormatted})`
      : `T-shirt fornecida pelo cliente (${OFFICIAL_PRICES.clientSuppliedTeeFormatted})`;

    const data = {
      name: name.trim(),
      phone: phone.trim(),
      model: `${tshirtModel} [${sourceLabel}]`,
      size: selectedSize,
      color: tshirtColor === 'black' ? 'Preto Clássico' : tshirtColor === 'charcoal' ? 'Grafite Escuro' : 'Branco Puro',
      placement: placement === 'back' ? 'Costas (Estampa Grande)' : placement === 'front' ? 'Frente Completa' : 'Peito Esquerdo',
      phrase: customPhrase.trim() || 'Nenhuma frase específica',
      fontStyle: fontStyle === 'street' ? 'Streetwear Italic' : fontStyle === 'gothic' ? 'Gótico Imperial' : 'Modern Display',
      description: `${designDescription.trim() || customPhrase.trim()} | Preço: ${currentPriceFormatted}`,
      hasImageAttachment: !!referenceFile,
      imageName: referenceFile?.name,
    };

    // Use centralized WhatsApp helper
    const waUrl = getCustomizationWhatsAppUrl(data);

    setSubmittedData({ ...data, waUrl, priceFormatted: currentPriceFormatted });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: isWhite ? ['#000000', '#52525b', '#a1a1aa'] : ['#ffffff', '#a1a1aa', '#27272a'],
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
    <section
      id="personalizar"
      className={`py-24 relative transition-colors duration-300 ${
        isWhite ? 'bg-white text-black' : 'bg-black text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 border ${
              isWhite
                ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isWhite ? 'text-black' : 'text-white'}`} />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase">
              LABORATÓRIO DE CRIAÇÃO
            </span>
          </div>

          <h2
            className={`font-street text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase mb-4 ${
              isWhite ? 'text-black' : 'text-white'
            }`}
          >
            A TUA IDEIA. O TEU ESTILO.
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isWhite ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            Não encontras exatamente o que tens em mente? Nós transformamos as tuas frases, ilustrações, memórias ou referências numa t-shirt streetwear de qualidade superior.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Live Interactive Studio Visualizer */}
          <div
            className={`lg:col-span-5 p-6 rounded-lg flex flex-col items-center border ${
              isWhite
                ? 'bg-zinc-50 border-zinc-200 shadow-sm'
                : 'bg-zinc-950 border-zinc-900'
            }`}
          >
            <div
              className={`w-full flex items-center justify-between pb-4 border-b mb-4 ${
                isWhite ? 'border-zinc-200' : 'border-zinc-900'
              }`}
            >
              <span
                className={`text-xs font-mono tracking-widest uppercase ${
                  isWhite ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                ESTÚDIO DE PRÉ-VISUALIZAÇÃO
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView(view === 'back' ? 'front' : 'back')}
                  className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                    isWhite
                      ? 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-xs'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
                  }`}
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
            <div
              className={`w-full mt-6 space-y-4 pt-4 border-t ${
                isWhite ? 'border-zinc-200' : 'border-zinc-900'
              }`}
            >
              {/* Type Live Phrase */}
              <div>
                <label
                  className={`block text-[11px] font-mono tracking-widest uppercase mb-1.5 ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  Texto / Frase na Peça:
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={customPhrase}
                  onChange={(e) => setCustomPhrase(e.target.value)}
                  placeholder="Digita a tua frase ou nome..."
                  className={`w-full px-3.5 py-2 text-sm focus:outline-none transition-colors border ${
                    isWhite
                      ? 'bg-white border-zinc-300 focus:border-black text-black placeholder-zinc-400'
                      : 'bg-black border-zinc-800 focus:border-white text-white placeholder-zinc-600'
                  }`}
                />
              </div>

              {/* Font Style Selection */}
              <div>
                <label
                  className={`block text-[11px] font-mono tracking-widest uppercase mb-1.5 ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  Estilo da Tipografia:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFontStyle('street')}
                    className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-all cursor-pointer ${
                      fontStyle === 'street'
                        ? isWhite
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-white font-bold'
                        : isWhite
                        ? 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Street Italic
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('gothic')}
                    className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-all cursor-pointer ${
                      fontStyle === 'gothic'
                        ? isWhite
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-white font-bold'
                        : isWhite
                        ? 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Gótico
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle('syne')}
                    className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-all cursor-pointer ${
                      fontStyle === 'syne'
                        ? isWhite
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-white font-bold'
                        : isWhite
                        ? 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Modern Display
                  </button>
                </div>
              </div>

              {/* T-Shirt Color */}
              <div>
                <label
                  className={`block text-[11px] font-mono tracking-widest uppercase mb-1.5 ${
                    isWhite ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  Cor da T-shirt:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTshirtColor('black')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all cursor-pointer ${
                      tshirtColor === 'black'
                        ? isWhite
                          ? 'border-black text-black bg-zinc-200 font-bold'
                          : 'border-white text-white bg-zinc-900'
                        : isWhite
                        ? 'border-zinc-300 text-zinc-600 hover:text-black'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-black border border-zinc-500" />
                    Preto
                  </button>

                  <button
                    type="button"
                    onClick={() => setTshirtColor('charcoal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all cursor-pointer ${
                      tshirtColor === 'charcoal'
                        ? isWhite
                          ? 'border-black text-black bg-zinc-200 font-bold'
                          : 'border-white text-white bg-zinc-900'
                        : isWhite
                        ? 'border-zinc-300 text-zinc-600 hover:text-black'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#18181b] border border-zinc-400" />
                    Grafite
                  </button>

                  <button
                    type="button"
                    onClick={() => setTshirtColor('white')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all cursor-pointer ${
                      tshirtColor === 'white'
                        ? isWhite
                          ? 'border-black text-black bg-white font-bold shadow-xs'
                          : 'border-white text-white bg-zinc-900'
                        : isWhite
                        ? 'border-zinc-300 text-zinc-600 hover:text-black'
                        : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-zinc-100 border border-zinc-400" />
                    Branco
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Validated Form with WhatsApp Preparation */}
          <div
            className={`lg:col-span-7 p-6 sm:p-8 rounded-lg border ${
              isWhite
                ? 'bg-zinc-50 border-zinc-200 shadow-sm'
                : 'bg-zinc-950 border-zinc-900'
            }`}
          >
            <h3
              className={`font-street text-2xl font-bold tracking-wider uppercase mb-1 ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              FORMULÁRIO DE PEDIDO PERSONALIZADO
            </h3>
            <p
              className={`text-xs mb-6 font-mono ${
                isWhite ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Preenche os detalhes. O pedido será compilado e preparado para envio direto ao WhatsApp da equipa de produção da CF.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client Name */}
              <div>
                <label
                  className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
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
                  className={`w-full px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    errors.name
                      ? 'border-red-500'
                      : isWhite
                      ? 'bg-white border-zinc-300 focus:border-black text-black placeholder-zinc-400'
                      : 'bg-black border-zinc-800 focus:border-white text-white placeholder-zinc-600'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label
                  className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
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
                  className={`w-full px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    errors.phone
                      ? 'border-red-500'
                      : isWhite
                      ? 'bg-white border-zinc-300 focus:border-black text-black placeholder-zinc-400'
                      : 'bg-black border-zinc-800 focus:border-white text-white placeholder-zinc-600'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* T-Shirt Source & Official Pricing */}
              <div>
                <label
                  className={`block text-xs font-mono tracking-wider uppercase mb-1.5 flex items-center justify-between ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  <span>Opção de T-shirt e Preço Oficial *</span>
                  <span className={`font-bold ${isWhite ? 'text-black' : 'text-white'}`}>
                    {currentPriceFormatted}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShirtSource('cf-shirt')}
                    className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shirtSource === 'cf-shirt'
                        ? isWhite
                          ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                          : 'bg-zinc-900 border-white text-white'
                        : isWhite
                        ? 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                        : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className={`font-street text-xs font-bold uppercase tracking-wider ${isWhite ? 'text-black' : 'text-white'}`}>
                      T-shirt da Marca CF
                    </span>
                    <span className={`text-[11px] font-mono mt-1 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Inclui t-shirt preta oficial CF de algodão premium
                    </span>
                    <span className={`text-sm font-street font-bold mt-2 ${isWhite ? 'text-black' : 'text-white'}`}>
                      {OFFICIAL_PRICES.cfBrandTeeFormatted}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShirtSource('client-shirt')}
                    className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shirtSource === 'client-shirt'
                        ? isWhite
                          ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                          : 'bg-zinc-900 border-white text-white'
                        : isWhite
                        ? 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                        : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className={`font-street text-xs font-bold uppercase tracking-wider ${isWhite ? 'text-black' : 'text-white'}`}>
                      T-shirt Fornecida pelo Cliente
                    </span>
                    <span className={`text-[11px] font-mono mt-1 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      O cliente entrega a sua própria t-shirt para personalização
                    </span>
                    <span className={`text-sm font-street font-bold mt-2 ${isWhite ? 'text-black' : 'text-white'}`}>
                      {OFFICIAL_PRICES.clientSuppliedTeeFormatted}
                    </span>
                  </button>
                </div>
              </div>

              {/* Model & Size Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                      isWhite ? 'text-zinc-700' : 'text-zinc-300'
                    }`}
                  >
                    Modelo da T-shirt
                  </label>
                  <select
                    value={tshirtModel}
                    onChange={(e) => setTshirtModel(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs focus:outline-none border ${
                      isWhite
                        ? 'bg-white border-zinc-300 focus:border-black text-black'
                        : 'bg-black border-zinc-800 focus:border-white text-white'
                    }`}
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
                  <label
                    className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                      isWhite ? 'text-zinc-700' : 'text-zinc-300'
                    }`}
                  >
                    Tamanho
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                          selectedSize === size
                            ? isWhite
                              ? 'bg-black text-white shadow-xs'
                              : 'bg-white text-black'
                            : isWhite
                            ? 'bg-white text-zinc-700 border border-zinc-300 hover:border-black'
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
                <label
                  className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Posição da Estampa Pretendida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlacement('back');
                      setView('back');
                    }}
                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-all text-center cursor-pointer ${
                      placement === 'back'
                        ? isWhite
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-white font-bold'
                        : isWhite
                        ? 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
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
                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-all text-center cursor-pointer ${
                      placement === 'front'
                        ? isWhite
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-white font-bold'
                        : isWhite
                        ? 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
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
                    className={`py-2 px-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-all text-center cursor-pointer ${
                      placement === 'chest-logo'
                        ? isWhite
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-white font-bold'
                        : isWhite
                        ? 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Peito Minimal
                  </button>
                </div>
              </div>

              {/* Design Description */}
              <div>
                <label
                  className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
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
                  className={`w-full px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    errors.description
                      ? 'border-red-500'
                      : isWhite
                      ? 'bg-white border-zinc-300 focus:border-black text-black placeholder-zinc-400'
                      : 'bg-black border-zinc-800 focus:border-white text-white placeholder-zinc-600'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
                  </p>
                )}
              </div>

              {/* Reference Image Attachment (Optional) */}
              <div>
                <label
                  className={`block text-xs font-mono tracking-wider uppercase mb-1 ${
                    isWhite ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Imagem de Referência (Opcional)
                </label>
                <div
                  className={`border border-dashed p-4 rounded-lg flex flex-col items-center justify-center text-center relative transition-colors ${
                    isWhite
                      ? 'bg-white border-zinc-300 hover:border-black'
                      : 'bg-black/40 border-zinc-800 hover:border-zinc-500'
                  }`}
                >
                  {referenceFile ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {referencePreview && (
                          <img
                            src={referencePreview}
                            alt="Preview anexo"
                            className="w-12 h-12 object-cover rounded border border-zinc-400"
                          />
                        )}
                        <div className="text-left">
                          <p className={`text-xs font-mono truncate max-w-[200px] ${isWhite ? 'text-black' : 'text-white'}`}>
                            {referenceFile.name}
                          </p>
                          <p className={`text-[10px] font-mono ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {(referenceFile.size / 1024).toFixed(0)} KB &bull; Pronto para anexar
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs font-mono text-red-500 hover:text-red-700 underline"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full">
                      <Upload className={`w-6 h-6 mb-1.5 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <span className={`text-xs font-mono uppercase tracking-wider ${isWhite ? 'text-black font-semibold' : 'text-white'}`}>
                        Carregar ficheiro (PNG, JPG, WEBP)
                      </span>
                      <span className={`text-[10px] font-mono mt-0.5 ${isWhite ? 'text-zinc-500' : 'text-zinc-500'}`}>
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
                  <p className="text-red-500 text-xs mt-1 font-mono">{errors.file}</p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-4 font-street text-sm tracking-[0.22em] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-lg ${
                    isWhite
                      ? 'bg-black text-white hover:bg-zinc-800'
                      : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  }`}
                >
                  <MessageCircle className={`w-4 h-4 ${isWhite ? 'fill-white' : 'fill-black'}`} />
                  <span>ENVIAR PEDIDO VIA WHATSAPP</span>
                </button>
                <p className={`text-[11px] font-mono text-center uppercase tracking-wider mt-2 ${isWhite ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Atendimento oficial CF &bull; Resposta em até 2 horas úteis
                </p>
              </div>
            </form>

            {/* Success Notification Banner */}
            {submittedData && (
              <div
                className={`mt-6 p-4 rounded-lg space-y-3 border animate-fade-in ${
                  isWhite
                    ? 'bg-white border-zinc-300 text-black shadow-md'
                    : 'bg-zinc-900 border-white/30 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${isWhite ? 'text-black' : 'text-white'}`} />
                  <span className="font-street font-bold text-sm tracking-wider uppercase">
                    PEDIDO PREPARADO COM SUCESSO!
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isWhite ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Abrimos o WhatsApp com todos os detalhes do teu pedido. Se a janela não tiver aberto automaticamente, utiliza os botões abaixo:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={submittedData.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded ${
                      isWhite
                        ? 'bg-black text-white hover:bg-zinc-800'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    Abrir WhatsApp Novamente &rarr;
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider rounded flex items-center gap-1.5 ${
                      isWhite
                        ? 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:text-black hover:border-black'
                        : 'bg-black border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
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
