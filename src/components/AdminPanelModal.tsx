import React, { useState, useEffect } from 'react';
import { Product, Review, CommunityPhoto, CustomOrder } from '../types';
import { PRODUCTS, OFFICIAL_PRICES, formatPrice } from '../data/products';
import {
  getDynamicProducts,
  saveDynamicProduct,
  deleteDynamicProduct,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getAllCommunityPhotos,
  updateCommunityPhotoStatus,
  deleteCommunityPhoto,
  getAllCustomOrders,
  updateCustomOrderStatus,
  deleteCustomOrder,
  exportAllDataAsJSON,
  importDataFromJSON,
} from '../services/db';
import { changeAdminPin, logoutAdmin } from '../services/adminAuth';
import { useTheme } from '../context/ThemeContext';
import { CFLogo } from './CFLogo';
import {
  X,
  Package,
  PlusCircle,
  Tag,
  MessageSquare,
  Star,
  KeyRound,
  ShoppingBag,
  Upload,
  CheckCircle2,
  Trash2,
  Edit3,
  LogOut,
  Download,
  AlertCircle,
  Camera,
  ExternalLink,
  Ban,
  Filter,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

type TabType =
  | 'products'
  | 'add-product'
  | 'prices-legends'
  | 'pending-reviews'
  | 'ratings'
  | 'security'
  | 'orders'
  | 'community';

interface DeleteConfirmation {
  type: 'review' | 'photo' | 'product' | 'order';
  id: string;
  title: string;
  subtitle?: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onProductsUpdated,
}) => {
  const { isWhite } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('products');

  // Data states
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhoto[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Explicit in-app confirmation state (never relies on blocked window.confirm)
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  // Form: Add New Product / Photos
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdColor, setNewProdColor] = useState<'black' | 'white' | 'charcoal'>('black');
  const [newProdViewAngle, setNewProdViewAngle] = useState<'front' | 'back' | 'full'>('front');
  const [newProdServiceType, setNewProdServiceType] = useState<'cf-brand' | 'client-shirt'>('cf-brand');
  const [newProdPrice, setNewProdPrice] = useState<number>(OFFICIAL_PRICES.cfBrandTee);
  const [newProdClientPrice, setNewProdClientPrice] = useState<number>(OFFICIAL_PRICES.clientSuppliedTee);
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('typography');
  const [newProdBadge, setNewProdBadge] = useState('NOVO MODELO');
  const [newProdImageFiles, setNewProdImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const [newProdPublishStatus, setNewProdPublishStatus] = useState<'published' | 'draft'>('published');
  const [selectedSizes, setSelectedSizes] = useState<('S' | 'M' | 'L' | 'XL' | 'XXL')[]>([
    'S',
    'M',
    'L',
    'XL',
    'XXL',
  ]);

  // Security: PIN change form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');

  // Editing existing product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const reloadData = async () => {
    setLoading(true);
    try {
      const [prods, revs, comms, ords] = await Promise.all([
        getDynamicProducts(),
        getAllReviews(),
        getAllCommunityPhotos(),
        getAllCustomOrders(),
      ]);
      setDynamicProducts(prods);
      setReviews(revs);
      setCommunityPhotos(comms);
      setCustomOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Counts for tabs
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const pendingPhotosCount = communityPhotos.filter((p) => p.status === 'pending').length;
  const pendingOrdersCount = customOrders.filter((o) => o.status === 'novo').length;

  // Combined product list (built-in 12 products + user added dynamic products)
  const allProductsCombined: Product[] = [...PRODUCTS, ...dynamicProducts];

  // Service type price auto-fill
  const handleServiceTypeChange = (type: 'cf-brand' | 'client-shirt') => {
    setNewProdServiceType(type);
    if (type === 'cf-brand') {
      setNewProdPrice(OFFICIAL_PRICES.cfBrandTee);
      setNewProdClientPrice(OFFICIAL_PRICES.clientSuppliedTee);
    } else {
      setNewProdPrice(OFFICIAL_PRICES.clientSuppliedTee);
      setNewProdClientPrice(OFFICIAL_PRICES.clientSuppliedTee);
    }
  };

  // Image Upload handler for new product with client-side image compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
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
            setNewProdImageFiles((prev) => [...prev, { file, preview: compressed }]);
          } else {
            setNewProdImageFiles((prev) => [
              ...prev,
              { file, preview: event.target?.result as string },
            ]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveUploadedImage = (index: number) => {
    setNewProdImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProdName.trim()) {
      showToast('Por favor introduz o nome do modelo.', 'error');
      return;
    }
    if (!newProdDesc.trim()) {
      showToast('Por favor introduz a descrição do produto.', 'error');
      return;
    }
    if (newProdImageFiles.length === 0) {
      showToast('Por favor carrega pelo menos uma fotografia real do modelo.', 'error');
      return;
    }

    const newProdId = `cf-prod-${Date.now()}`;
    const product: Product = {
      id: newProdId,
      name: newProdName.trim().toUpperCase(),
      category: newProdCategory,
      categoryLabel:
        newProdCategory === 'african-art'
          ? 'Arte Africana'
          : newProdCategory === 'tribal'
          ? 'Emblema Tribal'
          : newProdCategory === 'typography'
          ? 'Frases & Letras'
          : newProdCategory === 'gothic'
          ? 'Gótico & Sagrado'
          : 'Streetwear de Autor',
      priceKz: Number(newProdPrice) || OFFICIAL_PRICES.cfBrandTee,
      clientShirtPriceKz: Number(newProdClientPrice) || OFFICIAL_PRICES.clientSuppliedTee,
      defaultColor: newProdColor,
      color: newProdColor === 'black' ? 'Preto' : newProdColor === 'white' ? 'Branco' : 'Grafite',
      description: newProdDesc.trim(),
      story: `Modelo exclusivo da coleção CF lançado sob rigorosos padrões de serigrafia e estética streetwear.`,
      details: [
        'Algodão premium penteado de corte streetwear confortável',
        'Estampa serigráfica de alta definição',
        'Logótipo oficial CF com coroa no peito esquerdo',
        'Gola canelada e costura reforçada de ombro a ombro',
      ],
      availableSizes: selectedSizes,
      stockStatus: { S: 10, M: 15, L: 20, XL: 15, XXL: 8 },
      image: newProdImageFiles[0].preview,
      badge: newProdBadge || 'NOVO MODELO',
      status: newProdPublishStatus,
      viewAngle: newProdViewAngle,
      isCustomUpload: true,
      createdAt: new Date().toISOString(),
    };

    await saveDynamicProduct(product);
    showToast(`Modelo "${product.name}" guardado com sucesso!`);

    // Reset form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdImageFiles([]);
    setNewProdBadge('NOVO MODELO');
    await reloadData();
    onProductsUpdated?.();
    setActiveTab('products');
  };

  // Execution of confirmed deletion
  const executeConfirmedDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, id, title } = deleteConfirmation;

    try {
      if (type === 'review') {
        await deleteReview(id);
        showToast(`Comentário de "${title}" eliminado definitivamente.`);
      } else if (type === 'photo') {
        await deleteCommunityPhoto(id);
        showToast(`Fotografia de "${title}" eliminada definitivamente.`);
      } else if (type === 'product') {
        await deleteDynamicProduct(id);
        showToast(`Produto "${title}" eliminado.`);
        onProductsUpdated?.();
      } else if (type === 'order') {
        await deleteCustomOrder(id);
        showToast(`Pedido de "${title}" eliminado.`);
      }
      setDeleteConfirmation(null);
      await reloadData();
    } catch (err: any) {
      showToast(`Erro ao eliminar: ${err?.message || 'Falha de comunicação'}`, 'error');
    }
  };

  // Save quick price / legend edit
  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    await saveDynamicProduct(editingProduct);
    showToast(`Produto "${editingProduct.name}" atualizado.`);
    setEditingProduct(null);
    await reloadData();
    onProductsUpdated?.();
  };

  // Review moderation
  const handleApproveReview = async (id: string) => {
    await updateReviewStatus(id, 'approved');
    showToast('Comentário aprovado e publicado publicamente!');
    await reloadData();
  };

  const handleRejectReview = async (id: string) => {
    await updateReviewStatus(id, 'rejected');
    showToast('Comentário rejeitado (não será exibido no site).');
    await reloadData();
  };

  // Community photo moderation
  const handleApprovePhoto = async (id: string) => {
    await updateCommunityPhotoStatus(id, 'approved');
    showToast('Fotografia do cliente aprovada e publicada na Comunidade CF!');
    await reloadData();
  };

  const handleRejectPhoto = async (id: string) => {
    await updateCommunityPhotoStatus(id, 'rejected');
    showToast('Fotografia rejeitada (não será exibida no site).');
    await reloadData();
  };

  // Orders status update
  const handleOrderStatusChange = async (id: string, status: CustomOrder['status']) => {
    await updateCustomOrderStatus(id, status);
    showToast(`Estado do pedido atualizado para "${status}".`);
    await reloadData();
  };

  // Security: PIN change submit
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');

    if (newPin.length !== 4) {
      setPinChangeError('O novo código deve ter exatamente 4 dígitos.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeError('A confirmação do novo código não coincide.');
      return;
    }

    const res = await changeAdminPin(currentPin, newPin);
    if (res.success) {
      setPinChangeSuccess('Código de acesso atualizado com sucesso para ' + newPin + '!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      showToast('Novo código de acesso ativado com sucesso!');
    } else {
      setPinChangeError(res.error || 'Erro ao alterar código.');
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    const jsonStr = await exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CF_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cópia de segurança JSON descarregada com sucesso!');
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const res = await importDataFromJSON(reader.result as string);
      if (res.success) {
        showToast(res.message);
        await reloadData();
        onProductsUpdated?.();
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'all') return true;
    return r.status === reviewFilter;
  });

  // Filtered community photos
  const filteredPhotos = communityPhotos.filter((p) => {
    if (photoFilter === 'all') return true;
    return p.status === photoFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-6xl h-[94vh] sm:h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl border transition-colors ${
          isWhite ? 'bg-zinc-50 border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          className={`px-4 sm:px-6 py-3.5 flex items-center justify-between border-b shrink-0 ${
            isWhite ? 'bg-white border-zinc-200' : 'bg-black border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <CFLogo size="sm" glow />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-street text-base sm:text-lg font-bold tracking-wider uppercase">
                  PAINEL ADMINISTRATIVO CF
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase">
                  AUTENTICADO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-zinc-500 hidden sm:block">
                Moderação em tempo real &bull; Exclusão segura permanente &bull; Gestão de catálogo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isWhite
                  ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                  : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
              }`}
              title="Sair da Administração"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminar Sessão</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-full border transition-colors cursor-pointer ${
                isWhite
                  ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                  : 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
              }`}
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-mono flex items-center justify-between shrink-0 animate-fade-in ${
              toastMsg.type === 'error'
                ? 'bg-red-500 text-white'
                : isWhite
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-xs uppercase font-bold underline cursor-pointer">
              Fechar
            </button>
          </div>
        )}

        {/* Dedicated Confirmation Modal for Deletions */}
        {deleteConfirmation && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div
              className={`max-w-md w-full p-6 rounded-xl border shadow-2xl space-y-4 ${
                isWhite ? 'bg-white border-zinc-300 text-black' : 'bg-zinc-900 border-zinc-700 text-white'
              }`}
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-street text-lg font-bold uppercase tracking-wider">
                  Confirmar Eliminação Definitiva
                </h4>
              </div>

              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Tens a certeza de que desejas eliminar permanentemente{' '}
                <strong className={isWhite ? 'text-black' : 'text-white'}>
                  &quot;{deleteConfirmation.title}&quot;
                </strong>
                ?
              </p>

              {deleteConfirmation.subtitle && (
                <p className="text-[11px] font-mono text-zinc-500 bg-zinc-800/40 p-2.5 rounded border border-zinc-800">
                  {deleteConfirmation.subtitle}
                </p>
              )}

              <p className="text-[11px] font-mono text-amber-400">
                &bull; Esta ação apagará o registo do armazenamento e, caso esteja público no site, deixará de ser exibido imediatamente.
              </p>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border border-zinc-600 hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedDelete}
                  className="px-5 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout: Sidebar Tabs + Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <aside
            className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-2 sm:p-3 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1.5 ${
              isWhite ? 'bg-white/80 border-zinc-200' : 'bg-black/60 border-zinc-800'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'products'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 shrink-0" />
                <span>1. Gerir Produtos</span>
              </div>
              <span className="text-[10px] font-bold opacity-70 ml-2">
                ({allProductsCombined.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('add-product')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'add-product'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>2. Nova T-shirt / Foto</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prices-legends')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'prices-legends'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 shrink-0" />
                <span>3. Legendas & Preços</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending-reviews')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'pending-reviews'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>4. Comentários</span>
              </div>
              {pendingReviewsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-bold ml-2">
                  {pendingReviewsCount}
                </span>
              ) : (
                <span className="text-[10px] opacity-70 ml-2">({reviews.length})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ratings')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'ratings'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 shrink-0" />
                <span>5. Avaliações Site</span>
              </div>
              <span className="text-[10px] font-bold opacity-70 ml-2">
                ({reviews.filter((r) => r.status === 'approved').length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'community'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 shrink-0" />
                <span>Fotos Comunidade</span>
              </div>
              {pendingPhotosCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-bold ml-2">
                  {pendingPhotosCount}
                </span>
              ) : (
                <span className="text-[10px] opacity-70 ml-2">({communityPhotos.length})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>7. Pedidos Custom</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-black font-bold ml-2">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`whitespace-nowrap px-3 py-2 rounded text-left text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'security'
                  ? isWhite
                    ? 'bg-black text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : isWhite
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>6. Código Acesso</span>
              </div>
            </button>

            {/* Backup & System Status Info in Sidebar */}
            <div className="hidden md:block mt-auto pt-4 border-t border-zinc-800/60 space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className={`w-full py-2 px-3 text-[11px] font-mono uppercase tracking-wider rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup</span>
              </button>

              <label
                className={`w-full py-2 px-3 text-[11px] font-mono uppercase tracking-wider rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center ${
                  isWhite
                    ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </aside>

          {/* Tab Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* TAB 1: GERIR PRODUTOS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/50 gap-3">
                  <div>
                    <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
                      Gerir Produtos e Coleção CF
                    </h3>
                    <p className="text-xs font-mono text-zinc-500">
                      Total: {allProductsCombined.length} modelos configurados ({PRODUCTS.length} oficiais + {dynamicProducts.length} adicionados pelo painel)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add-product')}
                    className={`px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto ${
                      isWhite
                        ? 'bg-black text-white hover:bg-zinc-800'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Adicionar T-shirt</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allProductsCombined.map((product) => {
                    const isDynamic = dynamicProducts.some((p) => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                          isWhite ? 'bg-white border-zinc-200 shadow-xs' : 'bg-zinc-900/60 border-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded overflow-hidden bg-black mb-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            {product.badge && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-black/80 text-white border border-white/20 uppercase font-bold">
                                {product.badge}
                              </span>
                            )}
                            <span
                              className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase font-bold ${
                                isDynamic
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {isDynamic ? 'Painel Admin' : 'Original CF'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                            <span>{product.categoryLabel}</span>
                            <span>{product.color || 'Preto'}</span>
                          </div>

                          <h4 className="font-street text-base font-bold uppercase tracking-tight line-clamp-1">
                            {product.name}
                          </h4>

                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                            {product.description}
                          </p>

                          <div className="mt-3 pt-2 border-t border-zinc-800/40 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-mono uppercase block text-zinc-500">
                                Preço CF
                              </span>
                              <span className="font-street font-bold text-sm">
                                {formatPrice(product.priceKz)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono uppercase block text-zinc-500">
                                C/ T-shirt Cliente
                              </span>
                              <span className="font-street font-bold text-sm text-zinc-400">
                                {formatPrice(product.clientShirtPriceKz || 4000)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setActiveTab('prices-legends');
                            }}
                            className={`flex-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                              isWhite
                                ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                                : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          {isDynamic && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'product',
                                  id: product.id,
                                  title: product.name,
                                  subtitle: `Categoria: ${product.categoryLabel} • Preço: ${formatPrice(product.priceKz)}`,
                                })
                              }
                              className="py-1.5 px-3 rounded text-[11px] font-mono text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
                              title="Eliminar produto do painel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ADICIONAR NOVAS FOTOGRAFIAS E T-SHIRTS */}
            {activeTab === 'add-product' && (
              <div className="max-w-3xl space-y-6">
                <div className="pb-4 border-b border-zinc-800/50">
                  <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
                    Adicionar Nova T-shirt ao Site
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    Carrega fotografias reais, preenche os detalhes e publica diretamente na galeria e na coleção sem tocar no código.
                  </p>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-5">
                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                      Fotografias Reais do Modelo *
                    </label>
                    <div
                      className={`border-2 border-dashed p-6 rounded-lg text-center transition-colors ${
                        isWhite
                          ? 'border-zinc-300 hover:border-black bg-white'
                          : 'border-zinc-800 hover:border-zinc-500 bg-zinc-900/40'
                      }`}
                    >
                      {newProdImageFiles.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {newProdImageFiles.map((item, idx) => (
                              <div key={idx} className="relative aspect-square rounded overflow-hidden border border-zinc-700 group">
                                <img
                                  src={item.preview}
                                  alt={`Upload preview ${idx}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUploadedImage(idx)}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
                                  title="Remover fotografia"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                                  Foto #{idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-700 text-xs font-mono cursor-pointer hover:bg-zinc-800">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Adicionar mais fotos</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-8 h-8 mb-2 text-zinc-400" />
                          <span className="text-xs font-mono uppercase font-bold tracking-wider">
                            Clica para carregar fotografias (PNG, JPG, WEBP)
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 mt-1">
                            Utiliza exclusivamente as fotografias reais das T-shirts. Suporta múltiplos ficheiros.
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Model Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Nome do Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="Ex: GUERREIRO DE LUANDA • EDIÇÃO ESPECIAL"
                      className={`w-full px-4 py-2.5 text-sm rounded border focus:outline-none font-street tracking-wide ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  {/* Description / Legend */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Legenda / Descrição do Produto *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      placeholder="Descreve os detalhes da estampa, inspiração, acabamento e posicionamento do logótipo CF..."
                      className={`w-full px-4 py-2.5 text-sm rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  {/* Product Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Color */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                        Cor da T-shirt
                      </label>
                      <select
                        value={newProdColor}
                        onChange={(e) => setNewProdColor(e.target.value as any)}
                        className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                        }`}
                      >
                        <option value="black">Preto Clássico</option>
                        <option value="white">Branco Puro</option>
                        <option value="charcoal">Grafite Escuro</option>
                      </select>
                    </div>

                    {/* View Angle */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                        Ângulo da Fotografia
                      </label>
                      <select
                        value={newProdViewAngle}
                        onChange={(e) => setNewProdViewAngle(e.target.value as any)}
                        className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                        }`}
                      >
                        <option value="front">Vista Frontal (Frente)</option>
                        <option value="back">Vista Traseira (Costas)</option>
                        <option value="full">Vista Completa (Frente & Costas)</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                        Categoria da Coleção
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as any)}
                        className={`w-full px-3 py-2 text-xs rounded border focus:outline-none ${
                          isWhite
                            ? 'bg-white border-zinc-300 focus:border-black text-black'
                            : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                        }`}
                      >
                        <option value="african-art">Arte Africana</option>
                        <option value="tribal">Emblemas Tribais</option>
                        <option value="typography">Frases & Tipografia</option>
                        <option value="gothic">Gótico & Sagrado</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                  </div>

                  {/* Service & Official Price Rules */}
                  <div className="p-4 rounded-lg border border-zinc-800/60 bg-zinc-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase font-bold tracking-wider">
                        Regra de Preços Oficiais da Marca CF
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleServiceTypeChange('cf-brand')}
                        className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          newProdServiceType === 'cf-brand'
                            ? isWhite
                              ? 'bg-white border-black text-black shadow-xs ring-1 ring-black'
                              : 'bg-zinc-900 border-white text-white'
                            : isWhite
                            ? 'bg-zinc-100 border-zinc-300 text-zinc-600'
                            : 'bg-black border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <div>
                          <span className="font-street font-bold text-xs uppercase block">
                            T-SHIRT MARCA CF
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            Algodão 240g fornecido pela marca
                          </span>
                        </div>
                        <span className="font-street text-base font-bold mt-2">
                          6.000 Kz
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleServiceTypeChange('client-shirt')}
                        className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          newProdServiceType === 'client-shirt'
                            ? isWhite
                              ? 'bg-white border-black text-black shadow-xs ring-1 ring-black'
                              : 'bg-zinc-900 border-white text-white'
                            : isWhite
                            ? 'bg-zinc-100 border-zinc-300 text-zinc-600'
                            : 'bg-black border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <div>
                          <span className="font-street font-bold text-xs uppercase block">
                            T-SHIRT FORNECIDA PELO CLIENTE
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            Apenas personalização / estampa
                          </span>
                        </div>
                        <span className="font-street text-base font-bold mt-2">
                          4.000 Kz
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-4 border-t border-zinc-800/40 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded border transition-colors cursor-pointer ${
                        isWhite
                          ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                          : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2.5 font-street text-sm font-bold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                        isWhite
                          ? 'bg-black text-white hover:bg-zinc-800'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{newProdPublishStatus === 'published' ? 'Publicar no Site' : 'Guardar Rascunho'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: GERIR LEGENDAS E PREÇOS */}
            {activeTab === 'prices-legends' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
                      Gerir Legendas e Preços dos Modelos
                    </h3>
                    <p className="text-xs font-mono text-zinc-500">
                      Atualiza com rapidez preços e descrições mantendo os valores oficiais da CF (6.000 Kz / 4.000 Kz).
                    </p>
                  </div>
                </div>

                {editingProduct ? (
                  <div className={`p-6 rounded-lg border max-w-2xl space-y-4 ${
                    isWhite ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-700'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <span className="font-street text-lg font-bold uppercase">
                        A Editar: {editingProduct.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase mb-1">Nome</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded border ${
                          isWhite ? 'bg-zinc-100 border-zinc-300 text-black' : 'bg-black border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase mb-1">Legenda / Descrição</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded border ${
                          isWhite ? 'bg-zinc-100 border-zinc-300 text-black' : 'bg-black border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase mb-1">Preço T-shirt CF (Kz)</label>
                        <input
                          type="number"
                          value={editingProduct.priceKz}
                          onChange={(e) => setEditingProduct({ ...editingProduct, priceKz: Number(e.target.value) })}
                          className={`w-full px-3 py-2 text-xs rounded border ${
                            isWhite ? 'bg-zinc-100 border-zinc-300 text-black' : 'bg-black border-zinc-800 text-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase mb-1">Preço T-shirt Cliente (Kz)</label>
                        <input
                          type="number"
                          value={editingProduct.clientShirtPriceKz || 4000}
                          onChange={(e) => setEditingProduct({ ...editingProduct, clientShirtPriceKz: Number(e.target.value) })}
                          className={`w-full px-3 py-2 text-xs rounded border ${
                            isWhite ? 'bg-zinc-100 border-zinc-300 text-black' : 'bg-black border-zinc-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 text-xs font-mono uppercase rounded border border-zinc-700 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProductEdit}
                        className="px-5 py-2 text-xs font-mono uppercase font-bold bg-white text-black rounded cursor-pointer"
                      >
                        Guardar Alterações
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allProductsCombined.map((product) => (
                      <div
                        key={product.id}
                        className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded bg-black shrink-0"
                          />
                          <div>
                            <span className="font-street font-bold text-sm uppercase block">
                              {product.name}
                            </span>
                            <span className="text-xs font-mono text-zinc-500 line-clamp-1 max-w-md">
                              {product.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              Preço T-shirt CF
                            </span>
                            <span className="font-street font-bold text-sm">
                              {formatPrice(product.priceKz)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                              C/ T-shirt Cliente
                            </span>
                            <span className="font-street font-bold text-sm text-zinc-400">
                              {formatPrice(product.clientShirtPriceKz || 4000)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingProduct(product)}
                            className="px-3 py-1.5 rounded border text-xs font-mono uppercase hover:bg-zinc-800 cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMENTÁRIOS E CRÍTICAS PENDENTES */}
            {activeTab === 'pending-reviews' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
                      <span>Moderação de Comentários</span>
                      {pendingReviewsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-black font-bold">
                          {pendingReviewsCount} Pendente{pendingReviewsCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-mono text-zinc-500">
                      Consulta, aprova, rejeita ou elimina comentários definitivamente do sistema.
                    </p>
                  </div>

                  {/* Status Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-800 bg-zinc-900/60 self-start sm:self-auto text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        reviewFilter === 'all' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Todos ({reviews.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('pending')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        reviewFilter === 'pending' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Pendentes ({pendingReviewsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('approved')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        reviewFilter === 'approved' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Aprovados ({reviews.filter((r) => r.status === 'approved').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('rejected')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        reviewFilter === 'rejected' ? 'bg-red-500 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Rejeitados ({reviews.filter((r) => r.status === 'rejected').length})
                    </button>
                  </div>
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-zinc-500 border border-dashed rounded-lg">
                    Nenhum comentário encontrado para o filtro selecionado.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`p-4 sm:p-5 rounded-lg border transition-all ${
                          rev.status === 'pending'
                            ? isWhite
                              ? 'bg-amber-50 border-amber-300'
                              : 'bg-amber-950/20 border-amber-500/40'
                            : rev.status === 'approved'
                            ? isWhite
                              ? 'bg-white border-zinc-200'
                              : 'bg-zinc-900/60 border-zinc-800'
                            : 'bg-red-950/10 border-red-800/30 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="font-street font-bold text-base uppercase">
                              {rev.authorName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                              {rev.category}
                            </span>
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
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500">{rev.date}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                  : rev.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                  : 'bg-red-500/10 text-red-500 border border-red-500/30'
                              }`}
                            >
                              {rev.status === 'approved'
                                ? 'Público no Site'
                                : rev.status === 'pending'
                                ? 'Pendente'
                                : 'Rejeitado'}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed mb-4 text-zinc-300 font-sans">
                          &quot;{rev.comment}&quot;
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/40">
                          {rev.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleApproveReview(rev.id)}
                              className="px-3.5 py-1.5 rounded text-xs font-mono uppercase font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprovar e Publicar</span>
                            </button>
                          )}

                          {rev.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleRejectReview(rev.id)}
                              className="px-3 py-1.5 rounded text-xs font-mono uppercase border border-amber-700/60 text-amber-400 hover:bg-amber-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{rev.status === 'approved' ? 'Despublicar / Rejeitar' : 'Rejeitar'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'review',
                                id: rev.id,
                                title: rev.authorName,
                                subtitle: `"${rev.comment.slice(0, 100)}..." (${rev.rating} estrelas)`,
                              })
                            }
                            className="px-3 py-1.5 rounded text-xs font-mono uppercase text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-auto flex items-center gap-1 border border-red-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: AVALIAÇÕES DO SITE */}
            {activeTab === 'ratings' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800/50">
                  <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
                    Estatísticas e Avaliações Gerais do Site
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    Apenas avaliações aprovadas entram no cálculo da média e na apresentação pública.
                  </p>
                </div>

                {/* Score Summary Metrics */}
                {(() => {
                  const approved = reviews.filter((r) => r.status === 'approved');
                  const avg = approved.length > 0
                    ? (approved.reduce((acc, r) => acc + r.rating, 0) / approved.length).toFixed(1)
                    : '5.0';

                  const countByStars = [5, 4, 3, 2, 1].map((s) => ({
                    stars: s,
                    count: approved.filter((r) => r.rating === s).length,
                    pct: approved.length > 0 ? (approved.filter((r) => r.rating === s).length / approved.length) * 100 : 0,
                  }));

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className={`p-5 rounded-lg border text-center ${
                          isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                        }`}>
                          <span className="font-street text-4xl sm:text-5xl font-black block">
                            {avg}
                          </span>
                          <div className="flex justify-center text-amber-400 my-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 uppercase">
                            Média Geral Aprovada
                          </span>
                        </div>

                        <div className={`p-5 rounded-lg border text-center ${
                          isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                        }`}>
                          <span className="font-street text-4xl sm:text-5xl font-black block">
                            {approved.length}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 uppercase mt-2 block">
                            Avaliações Públicas
                          </span>
                        </div>

                        <div className={`p-5 rounded-lg border text-center ${
                          isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                        }`}>
                          <span className="font-street text-4xl sm:text-5xl font-black text-amber-500 block">
                            {pendingReviewsCount}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 uppercase mt-2 block">
                            Aguardando Moderação
                          </span>
                        </div>
                      </div>

                      {/* Distribution breakdown */}
                      <div className={`p-5 rounded-lg border ${
                        isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                      }`}>
                        <h4 className="font-street text-sm font-bold uppercase mb-4 tracking-wider">
                          Distribuição das Classificações Aprovadas
                        </h4>
                        <div className="space-y-2.5">
                          {countByStars.map((row) => (
                            <div key={row.stars} className="flex items-center gap-3 text-xs font-mono">
                              <span className="w-8 flex items-center gap-1 font-bold">
                                {row.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              </span>
                              <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full bg-white transition-all duration-500"
                                  style={{ width: `${row.pct}%` }}
                                />
                              </div>
                              <span className="w-16 text-right text-zinc-400">
                                {row.count} ({row.pct.toFixed(0)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Moderation Access from Ratings Tab */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-mono text-zinc-500">
                          Pretendes aprovar comentários pendentes ou despublicar avaliações?
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('pending-reviews')}
                          className="px-4 py-2 rounded text-xs font-mono uppercase font-bold border border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                        >
                          Ir para Moderação de Comentários &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB: FOTOS DA COMUNIDADE CF */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
                      <span>Fotografias da Comunidade CF</span>
                      {pendingPhotosCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-black font-bold">
                          {pendingPhotosCount} Pendente{pendingPhotosCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-mono text-zinc-500">
                      Visualiza, aprova para publicação, rejeita ou elimina fotografias definitivamente.
                    </p>
                  </div>

                  {/* Photo Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-800 bg-zinc-900/60 self-start sm:self-auto text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setPhotoFilter('all')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        photoFilter === 'all' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Todas ({communityPhotos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoFilter('pending')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        photoFilter === 'pending' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Pendentes ({pendingPhotosCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoFilter('approved')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        photoFilter === 'approved' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Aprovadas ({communityPhotos.filter((p) => p.status === 'approved').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoFilter('rejected')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${
                        photoFilter === 'rejected' ? 'bg-red-500 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Rejeitadas ({communityPhotos.filter((p) => p.status === 'rejected').length})
                    </button>
                  </div>
                </div>

                {filteredPhotos.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-zinc-500 border border-dashed rounded-lg">
                    Nenhuma fotografia encontrada para o filtro selecionado.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`p-3 rounded-lg border flex flex-col justify-between ${
                          photo.status === 'pending'
                            ? 'border-amber-500/50 bg-amber-950/10'
                            : photo.status === 'approved'
                            ? isWhite
                              ? 'bg-white border-zinc-200'
                              : 'bg-zinc-900/60 border-zinc-800'
                            : 'border-red-800/40 bg-red-950/10 opacity-70'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-square rounded overflow-hidden bg-black mb-2">
                            <img
                              src={photo.imageUrl}
                              alt={photo.authorName}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                photo.status === 'approved'
                                  ? 'bg-emerald-500 text-black'
                                  : photo.status === 'pending'
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {photo.status === 'approved'
                                ? 'Público no Site'
                                : photo.status === 'pending'
                                ? 'Pendente'
                                : 'Rejeitada'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="font-street font-bold uppercase">{photo.authorName}</span>
                            <span className="text-[10px] font-mono text-zinc-400">{photo.authorHandle}</span>
                          </div>

                          <p className="text-[11px] font-mono text-zinc-400 mt-1 line-clamp-1">
                            {photo.tshirtModel}
                          </p>

                          {photo.caption && (
                            <p className="text-xs text-zinc-300 italic mt-1">&quot;{photo.caption}&quot;</p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-zinc-800/40 flex flex-wrap items-center gap-1.5">
                          {photo.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleApprovePhoto(photo.id)}
                              className="flex-1 py-1 px-2 text-xs font-mono uppercase font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer text-center"
                            >
                              Aprovar
                            </button>
                          )}

                          {photo.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleRejectPhoto(photo.id)}
                              className="py-1 px-2 text-xs font-mono uppercase border border-amber-600/50 text-amber-400 hover:bg-amber-950/40 rounded cursor-pointer"
                            >
                              Rejeitar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'photo',
                                id: photo.id,
                                title: `Fotografia de ${photo.authorName}`,
                                subtitle: `Modelo: ${photo.tshirtModel} • Data: ${photo.date}`,
                              })
                            }
                            className="py-1 px-2.5 text-xs font-mono text-red-400 hover:bg-red-500/10 rounded border border-red-500/20 cursor-pointer ml-auto flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: GERIR PEDIDOS DE PERSONALIZAÇÃO */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800/50">
                  <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
                    <span>Pedidos de Encomenda Personalizada</span>
                    <span className="text-xs font-mono text-zinc-500">({customOrders.length} total)</span>
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    Histórico de encomendas submetidas através do formulário de pedidos personalizados.
                  </p>
                </div>

                {customOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-zinc-500 border border-dashed rounded-lg">
                    Ainda não existem pedidos de personalização registados.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 sm:p-5 rounded-lg border ${
                          isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="font-street text-lg font-bold uppercase">
                              {order.clientName}
                            </span>
                            <span className="text-xs font-mono text-zinc-400 ml-3">
                              Tel/WA: {order.phone}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500">{order.date}</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value as any)}
                              className={`px-2 py-1 text-xs font-mono uppercase rounded border focus:outline-none ${
                                order.status === 'novo'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                  : order.status === 'em_producao'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              <option value="novo">Novo</option>
                              <option value="em_producao">Em Produção</option>
                              <option value="concluido">Concluído</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono my-3 p-3 rounded bg-zinc-950/50 border border-zinc-800">
                          <div>
                            <span className="text-zinc-500 text-[10px] block uppercase">Serviço</span>
                            <span className="font-bold">
                              {order.serviceType === 'cf-brand' ? 'T-shirt CF (6.000 Kz)' : 'T-shirt Cliente (4.000 Kz)'}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[10px] block uppercase">Modelo & Tamanho</span>
                            <span className="font-bold">{order.model} ({order.size})</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[10px] block uppercase">Cor</span>
                            <span className="font-bold">{order.color === 'white' ? 'Branca' : 'Preta'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[10px] block uppercase">Total Calculado</span>
                            <span className="font-bold text-emerald-400 font-street text-sm">
                              {formatPrice(order.totalPriceKz)}
                            </span>
                          </div>
                        </div>

                        {order.phrase && (
                          <p className="text-xs font-mono text-zinc-300">
                            <span className="text-zinc-500">Frase Personalizada:</span> &quot;{order.phrase}&quot; ({order.fontStyle})
                          </p>
                        )}

                        {order.graphicDataUrl && (
                          <div className="mt-2 flex items-center gap-2">
                            <img
                              src={order.graphicDataUrl}
                              alt="Anexo"
                              className="w-12 h-12 object-cover rounded border border-zinc-700"
                            />
                            <span className="text-[11px] font-mono text-zinc-400">
                              Imagem carregada pelo cliente
                            </span>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between">
                          <a
                            href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Olá ${order.clientName}, recebemos o teu pedido de T-shirt personalizada CF! Estamos prontos para avançar.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded text-xs font-mono uppercase bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>WhatsApp do Cliente</span>
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'order',
                                id: order.id,
                                title: `Pedido de ${order.clientName}`,
                                subtitle: `Modelo: ${order.model} • Total: ${formatPrice(order.totalPriceKz)}`,
                              })
                            }
                            className="text-xs font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            Eliminar Pedido
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: ALTERAR CÓDIGO DE ACESSO */}
            {activeTab === 'security' && (
              <div className="max-w-md space-y-6">
                <div className="pb-4 border-b border-zinc-800/50">
                  <h3 className="font-street text-xl sm:text-2xl font-bold uppercase tracking-wider">
                    Alterar Código de Acesso
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    O novo código deve conter exatamente 4 dígitos numéricos. Será exigido o código atual antes de validar a alteração.
                  </p>
                </div>

                <form onSubmit={handleChangePinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Código Atual (4 dígitos) *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 2008"
                      className={`w-full px-4 py-2.5 text-center font-street text-xl font-bold tracking-widest rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Novo Código (4 dígitos) *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Novo PIN"
                      className={`w-full px-4 py-2.5 text-center font-street text-xl font-bold tracking-widest rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-bold">
                      Confirmar Novo Código *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Confirmar PIN"
                      className={`w-full px-4 py-2.5 text-center font-street text-xl font-bold tracking-widest rounded border focus:outline-none ${
                        isWhite
                          ? 'bg-white border-zinc-300 focus:border-black text-black'
                          : 'bg-zinc-900 border-zinc-800 focus:border-white text-white'
                      }`}
                    />
                  </div>

                  {pinChangeError && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pinChangeError}</span>
                    </div>
                  )}

                  {pinChangeSuccess && (
                    <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{pinChangeSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 font-street text-sm uppercase tracking-wider font-bold rounded transition-all cursor-pointer ${
                      isWhite
                        ? 'bg-black text-white hover:bg-zinc-800'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    Guardar Novo Código
                  </button>
                </form>

                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs font-mono text-zinc-400 leading-relaxed">
                  <p className="font-bold text-white mb-1">Nota de Segurança e Arquitetura:</p>
                  <p>
                    O código é protegido com cifragem criptográfica SHA-256 no armazenamento do teu navegador.
                    A senha nunca é exibida publicamente nem transferida em texto simples.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
