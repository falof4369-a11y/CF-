import React, { useState } from 'react';
import { PRODUCTS, OFFICIAL_PRICES, formatPrice } from '../data/products';
import { useTheme } from '../context/ThemeContext';
import { getCustomizationWhatsAppUrl, WHATSAPP_CONFIG } from '../config/whatsapp';
import { saveCustomOrder } from '../services/db';
import { CustomOrder } from '../types';
import {
  Sparkles,
  Scissors,
  ShieldCheck,
  Clock,
  Send,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shirt,
  Layers,
} from 'lucide-react';

interface PersonalizationSectionProps {
  initialPhrase?: string;
  isModal?: boolean;
  onOrderCompleted?: () => void;
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({
  initialPhrase = '',
  isModal = false,
  onOrderCompleted,
}) => {
  const { isWhite } = useTheme();

  // Service Type: CF Brand Shirt (6.000 Kz) vs Client Provided Shirt (4.000 Kz)
  const [serviceType, setServiceType] = useState<'cf-brand' | 'client-own'>('cf-brand');

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('Peça Personalizada / Frase Própria');
  const [size, setSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [color, setColor] = useState<'Preto Clássico' | 'Branco Puro' | 'Grafite Escuro'>('Preto Clássico');
  const [placement, setPlacement] = useState<string>('Costas centro grande');
  const [fontStyle, setFontStyle] = useState<string>('Gótico Streetwear');
  const [phrase, setPhrase] = useState(initialPhrase);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  // Optional Reference Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');

  // Status & Validation
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Price calculations
  const unitPriceKz =
    serviceType === 'cf-brand' ? OFFICIAL_PRICES.cfBrandTee : OFFICIAL_PRICES.clientSuppliedTee;
  const totalPriceKz = unitPriceKz * quantity;

  // Image Upload Handler with Canvas Compression
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setFormError('A imagem de referência deve ter no máximo 15MB.');
        return;
      }
      setImageFile(file);
      setImageName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1000;
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientName.trim() || clientName.trim().length < 2) {
      setFormError('Por favor introduz o teu nome completo.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('Por favor indica um número de telefone ou WhatsApp válido (+244...).');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Register order in database for administrative tracking
      const newOrder: CustomOrder = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        clientName: clientName.trim(),
        phone: phone.trim(),
        serviceType: serviceType === 'cf-brand' ? 'cf-brand' : 'client-shirt',
        model: selectedModel,
        color: color === 'Branco Puro' ? 'white' : 'black',
        size,
        quantity,
        unitPriceKz,
        totalPriceKz,
        phrase: phrase.trim() || undefined,
        fontStyle,
        fontColor: color === 'Branco Puro' ? 'Preto' : 'Branco',
        placement,
        graphicDataUrl: imagePreview || undefined,
        notes: description.trim() || undefined,
        date: new Date().toISOString().slice(0, 10),
        status: 'novo',
      };

      await saveCustomOrder(newOrder);

      // 2. Build WhatsApp URL
      const whatsappUrl = getCustomizationWhatsAppUrl({
        name: clientName.trim(),
        phone: phone.trim(),
        tshirtSource: serviceType === 'client-own' ? 'client-own' : 'cf-brand',
        tshirtSourceLabel:
          serviceType === 'cf-brand'
            ? `T-shirt da marca CF (${formatPrice(OFFICIAL_PRICES.cfBrandTee)})`
            : `T-shirt fornecida pelo cliente (${formatPrice(OFFICIAL_PRICES.clientSuppliedTee)})`,
        priceFormatted: `${formatPrice(unitPriceKz)} un. (Total: ${formatPrice(totalPriceKz)})`,
        model: selectedModel,
        size,
        color,
        placement,
        fontStyle,
        phrase: phrase.trim() || 'Sem frase / apenas design personalizado',
        description: description.trim() || 'Conforme especificado no pedido',
        hasImageAttachment: !!imagePreview,
        imageName: imageName || undefined,
      });

      // 3. Open WhatsApp link
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // 4. Show success in UI
      setOrderSuccess(true);
      onOrderCompleted?.();
    } catch (err: any) {
      console.error(err);
      setFormError('Ocorreu um erro ao registar o pedido. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setOrderSuccess(false);
    setPhrase('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setImageName('');
    setQuantity(1);
  };

  return (
    <section
      id="personalizar"
      className={`relative transition-colors duration-300 ${
        isModal
          ? 'py-4'
          : isWhite
          ? 'py-20 sm:py-24 border-t bg-zinc-50 text-black border-zinc-200'
          : 'py-20 sm:py-24 border-t bg-black text-white border-zinc-900'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 border ${
              isWhite
                ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isWhite ? 'text-black' : 'text-white'}`} />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase font-bold">
              ENCOMENDA PERSONALIZADA CF
            </span>
          </div>

          <h2
            className={`font-street text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight uppercase mb-4 ${
              isWhite ? 'text-black' : 'text-white'
            }`}
          >
            Formulário de Pedido ou Encomenda Personalizada
          </h2>

          <p
            className={`text-xs sm:text-sm md:text-base leading-relaxed ${
              isWhite ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            Escolhe se desejas uma T-shirt oficial da CF com algodão premium 240g (6.000 Kz) ou personalizar a tua própria peça (4.000 Kz).
            Preenche os campos abaixo e envia o teu pedido diretamente para o WhatsApp oficial da marca.
          </p>

          {/* Value Props Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Serigrafia Duradoura
            </span>
            <span className="flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-emerald-400" /> Algodão Streetwear 240g
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> Produção & Entrega em Luanda
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div
          className={`rounded-2xl border p-5 sm:p-8 md:p-10 shadow-xl transition-all ${
            isWhite
              ? 'bg-white border-zinc-200 shadow-zinc-200/50'
              : 'bg-zinc-950 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
          }`}
        >
          {orderSuccess ? (
            <div className="text-center py-10 sm:py-14 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="font-street text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Pedido Enviado para o WhatsApp com Sucesso!
              </h3>

              <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-lg mx-auto leading-relaxed">
                O teu pedido de encomenda personalizada foi registado no nosso sistema e encaminhado para o WhatsApp oficial da CF (+244 958 194 301).
                A nossa equipa responderá rapidamente para confirmar todos os detalhes de produção e entrega em Luanda.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className={`px-6 py-3 rounded text-xs font-mono uppercase font-bold tracking-wider border transition-colors cursor-pointer ${
                    isWhite
                      ? 'bg-black text-white border-black hover:bg-zinc-800'
                      : 'bg-white text-black border-white hover:bg-zinc-200'
                  }`}
                >
                  Fazer Outro Pedido
                </button>

                <a
                  href={WHATSAPP_CONFIG.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded text-xs font-mono uppercase font-bold tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Abrir WhatsApp Novamente</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* 1. Escolha do Serviço / Fornecimento da T-shirt */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                  1. Seleciona o Tipo de Serviço e Preço Oficial *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: CF Brand Shirt */}
                  <button
                    type="button"
                    onClick={() => setServiceType('cf-brand')}
                    className={`p-4 sm:p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      serviceType === 'cf-brand'
                        ? isWhite
                          ? 'bg-zinc-100 border-black ring-2 ring-black shadow-md'
                          : 'bg-zinc-900 border-white ring-2 ring-white shadow-lg'
                        : isWhite
                        ? 'bg-zinc-50 border-zinc-300 hover:border-zinc-400 text-zinc-700'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-street font-bold text-sm sm:text-base uppercase tracking-wider">
                          T-SHIRT DA MARCA CF
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            serviceType === 'cf-brand'
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          Mais Escolhido
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-3">
                        T-shirt de algodão premium 240g fornecida pela CF com corte streetwear oversized, acabamento reforçado e estampa de alta densidade.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Preço Fixo:</span>
                      <span className="font-street text-xl sm:text-2xl font-black text-emerald-400">
                        {formatPrice(OFFICIAL_PRICES.cfBrandTee)}
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Client Supplies Shirt */}
                  <button
                    type="button"
                    onClick={() => setServiceType('client-own')}
                    className={`p-4 sm:p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      serviceType === 'client-own'
                        ? isWhite
                          ? 'bg-zinc-100 border-black ring-2 ring-black shadow-md'
                          : 'bg-zinc-900 border-white ring-2 ring-white shadow-lg'
                        : isWhite
                        ? 'bg-zinc-50 border-zinc-300 hover:border-zinc-400 text-zinc-700'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-street font-bold text-sm sm:text-base uppercase tracking-wider">
                          FORNEÇO A MINHA T-SHIRT
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            serviceType === 'client-own'
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          Personalização
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-3">
                        Entregas a tua própria T-shirt e a equipa da CF aplica a serigrafia profissional com a tua frase, grafismo ou design de autor.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Preço Fixo:</span>
                      <span className="font-street text-xl sm:text-2xl font-black text-emerald-400">
                        {formatPrice(OFFICIAL_PRICES.clientSuppliedTee)}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Dados do Cliente */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                  2. Dados de Contacto *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Mauro Silva"
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none transition-all ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Telefone / WhatsApp (Angola) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 958 194 301 ou 923 000 000"
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none transition-all ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Configurações da Peça */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                  3. Detalhes da T-shirt e Estampa *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Model Selector */}
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Modelo Base / Inspiração
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    >
                      <option value="Peça Personalizada / Frase Própria">Peça Personalizada / Frase Própria</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Tamanho Streetwear
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(s)}
                          className={`py-2 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                            size === s
                              ? isWhite
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-white'
                              : isWhite
                              ? 'border-zinc-300 text-zinc-700 hover:border-black'
                              : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Cor da T-shirt
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value as any)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    >
                      <option value="Preto Clássico">Preto Clássico (Assinatura CF)</option>
                      <option value="Branco Puro">Branco Puro</option>
                      <option value="Grafite Escuro">Grafite Escuro</option>
                    </select>
                  </div>
                </div>

                {/* Placement & Font Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Posição da Estampa
                    </label>
                    <select
                      value={placement}
                      onChange={(e) => setPlacement(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    >
                      <option value="Costas centro grande">Costas (Centro Grande — Assinatura Streetwear)</option>
                      <option value="Peito centro grande">Peito (Centro Grande)</option>
                      <option value="Peito esquerdo pequeno">Peito Esquerdo (Discreto / Emblema)</option>
                      <option value="Costas grande + Peito logo">Costas Grande + Peito Logótipo CF</option>
                      <option value="Manga ou Outro">Manga ou Posição Específica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Estilo de Tipografia / Letra
                    </label>
                    <select
                      value={fontStyle}
                      onChange={(e) => setFontStyle(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    >
                      <option value="Gótico Streetwear">Gótico Streetwear (Blackletter CF)</option>
                      <option value="Sans Minimalista">Sans Minimalista (Moderno & Limpo)</option>
                      <option value="Tribal Bold">Tribal Bold (Afro-Street)</option>
                      <option value="Cursiva Urbana">Cursiva Urbana & Elegante</option>
                      <option value="Tipografia de Autor">Tipografia de Autor Livre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Frase e Descrição do Design */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                  4. Conteúdo da Personalização (Frase ou Design)
                </label>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Frase, Palavra ou Ideia a Estampar
                    </label>
                    <input
                      type="text"
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      placeholder='Ex: "SONHE ALTO: O SEU DEUS É GRANDE" ou a tua frase pessoal...'
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none transition-all ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                      Detalhes Adicionais / Observações para a Produção
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreve como imaginas o tamanho da estampa, se queres incluir elementos gráficos, cor da tinta (branco, preto, prateado, etc.)..."
                      className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none leading-relaxed transition-all ${
                        isWhite
                          ? 'bg-zinc-50 border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Anexo Opcional de Imagem de Referência */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                  5. Imagem de Referência (Opcional)
                </label>

                {imagePreview ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                    <img
                      src={imagePreview}
                      alt="Pré-visualização do anexo"
                      className="w-16 h-16 object-cover rounded-lg border border-zinc-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs font-bold block truncate">
                        {imageName || 'Imagem de Referência'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Anexo pronto para ser enviado com a encomenda
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remover anexo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`border-2 border-dashed p-5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
                      isWhite
                        ? 'border-zinc-300 hover:border-black bg-zinc-50'
                        : 'border-zinc-800 hover:border-zinc-500 bg-zinc-900/30'
                    }`}
                  >
                    <Upload className="w-6 h-6 mb-2 text-zinc-400" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      Carregar Imagem ou Grafismo de Referência (PNG, JPG, WEBP)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 mt-1">
                      Se tiveres uma foto do teu desenho ou ideia, anexa aqui.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 6. Quantidade e Resumo Financeiro */}
              <div
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isWhite ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div>
                  <span className="text-xs font-mono uppercase font-bold tracking-wider block mb-1">
                    Quantidade de T-shirts
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`w-8 h-8 rounded border flex items-center justify-center font-mono font-bold text-base transition-colors cursor-pointer ${
                        isWhite
                          ? 'border-zinc-300 bg-white hover:bg-zinc-200'
                          : 'border-zinc-700 bg-black hover:bg-zinc-800'
                      }`}
                    >
                      -
                    </button>
                    <span className="font-street font-bold text-lg w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className={`w-8 h-8 rounded border flex items-center justify-center font-mono font-bold text-base transition-colors cursor-pointer ${
                        isWhite
                          ? 'border-zinc-300 bg-white hover:bg-zinc-200'
                          : 'border-zinc-700 bg-black hover:bg-zinc-800'
                      }`}
                    >
                      +
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500 ml-2">
                      ({formatPrice(unitPriceKz)} por unidade)
                    </span>
                  </div>
                </div>

                <div className="sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                    Total do Pedido
                  </span>
                  <span className="font-street text-2xl sm:text-3xl font-black text-emerald-400">
                    {formatPrice(totalPriceKz)}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    Pagamento confirmado via WhatsApp
                  </span>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl font-street text-sm sm:text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                    isWhite
                      ? 'bg-black text-white hover:bg-zinc-800'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'A processar pedido...'
                      : `Enviar Pedido via WhatsApp (+244 958 194 301)`}
                  </span>
                </button>
                <p className="text-[11px] font-mono text-zinc-500 text-center mt-2.5">
                  Ao clicar, o teu pedido é registado e o WhatsApp abre automaticamente com a mensagem estruturada.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
