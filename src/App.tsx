import React, { useState, useEffect } from 'react';
import { Product, CartItem } from './types';
import { PRODUCTS } from './data/products';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { IntroCinematic } from './components/IntroCinematic';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ColecaoGaleria } from './components/ColecaoGaleria';
import { PersonalizationSection } from './components/PersonalizationSection';
import { ReviewsSection } from './components/ReviewsSection';
import { CommunitySection } from './components/CommunitySection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { QuickSearchModal } from './components/QuickSearchModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { PersonalizationModal } from './components/PersonalizationModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { getDynamicProducts } from './services/db';
import { isAdminAuthenticated } from './services/adminAuth';
import { getGeneralWhatsAppUrl } from './config/whatsapp';
import { MessageCircle } from 'lucide-react';

function MainApp() {
  const { isWhite } = useTheme();

  // Intro animation state
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [forceReplay, setForceReplay] = useState<boolean>(false);

  // Dynamic products added through Admin panel
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);

  const loadCustomProducts = async () => {
    try {
      const custom = await getDynamicProducts();
      setDynamicProducts(custom.filter((p) => p.status !== 'draft' && p.status !== 'archived'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCustomProducts();
  }, []);

  // Combined product catalog: 12 authentic default models + any approved admin models
  const combinedProducts: Product[] = [...PRODUCTS, ...dynamicProducts];

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cf_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin access modals (triggered via 3 clicks on CF logo)
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('cf_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCartOpen(false);
        setIsSizeGuideOpen(false);
        setIsCustomizeModalOpen(false);
        setIsAdminAuthOpen(false);
        setIsAdminPanelOpen(false);
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Add to cart handler
  const handleAddToCart = (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    quantity: number = 1,
    color: string = 'black'
  ) => {
    const itemId = `${product.id}-${size}-${color}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: itemId,
            product,
            size,
            quantity,
            color,
          },
        ];
      }
    });

    showToast(`${product.name} (${size}) adicionada ao carrinho.`);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleReplayIntro = () => {
    setForceReplay(true);
    setShowIntro(true);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Trigger admin auth on 3 clicks on logo
  const handleOpenAdminAuth = () => {
    if (isAdminAuthenticated()) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col font-sans transition-colors duration-300 ${
        isWhite
          ? 'bg-white text-zinc-950 selection:bg-black selection:text-white'
          : 'bg-black text-white selection:bg-white selection:text-black'
      }`}
    >
      {/* 1. Cinematic Entrance Animation */}
      {showIntro && (
        <IntroCinematic
          forcePlay={forceReplay}
          onComplete={() => {
            setShowIntro(false);
            setForceReplay(false);
          }}
        />
      )}

      {/* 2. Sticky Header Navbar with Black & White Theme Switcher and 3-Click Admin on Logo */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
        onOpenAdminAuth={handleOpenAdminAuth}
      />

      {/* 3. Main Page Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreCollection={() => scrollTo('colecao')}
          onOpenCustomize={() => scrollTo('personalizar')}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* Unified "Coleção e Galeria" Section with All Authentic Real Models */}
        <ColecaoGaleria
          products={combinedProducts}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onAddToCart={(product, size) => handleAddToCart(product, size, 1, 'black')}
          onOpenCustomize={() => scrollTo('personalizar')}
        />

        {/* Professional T-Shirt Customizer Studio */}
        <PersonalizationSection />

        {/* Visitor Reviews and Ratings (with pre-approval moderation) */}
        <ReviewsSection />

        {/* CF Community Section (Customer Photos wearing CF t-shirts with pre-approval) */}
        <CommunitySection />

        {/* About Class Focus Philosophy */}
        <AboutSection />
      </main>

      {/* 4. Footer */}
      <Footer
        onReplayIntro={handleReplayIntro}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenCustomize={() => setIsCustomizeModalOpen(true)}
        onOpenAdminAuth={handleOpenAdminAuth}
      />

      {/* 5. Modals and Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product, size, qty, color) => handleAddToCart(product, size, qty, color)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onExploreProducts={() => {
          setIsCartOpen(false);
          scrollTo('colecao');
        }}
      />

      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={combinedProducts}
        onSelectProduct={(product) => setSelectedProduct(product)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <PersonalizationModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />

      {/* 6. Admin Authentication & Panel Modals */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onProductsUpdated={loadCustomProducts}
      />

      {/* Floating Official WhatsApp Button */}
      <aside aria-label="Contacto WhatsApp" className="fixed bottom-6 left-6 z-40 flex items-center group">
        <a
          href={getGeneralWhatsAppUrl('Olá! Entrei no site da CF e gostaria de obter informações sobre as vossas t-shirts.')}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 ${
            isWhite
              ? 'bg-white hover:bg-black text-black hover:text-white border border-zinc-300 hover:border-black'
              : 'bg-zinc-950/90 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white shadow-[0_10px_30px_rgba(0,0,0,0.9)]'
          }`}
          aria-label="Contactar a CF no WhatsApp (+244 958 194 301)"
          title="Falar no WhatsApp Oficial da CF"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-street text-xs font-bold tracking-wider uppercase pr-1">
            WhatsApp CF &bull; 958 194 301
          </span>
        </a>
      </aside>

      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded shadow-2xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce ${
            isWhite ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isWhite ? 'bg-white' : 'bg-black'}`} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
