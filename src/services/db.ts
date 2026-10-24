import { Product, Review, CustomOrder } from '../types';
import { formatPrice } from '../data/products';
import {
  fetchApprovedReviews,
  fetchAdminReviews,
  submitClientReview,
  updateAdminReviewStatus,
  deleteAdminReview,
  fetchSharedProducts,
  saveSharedProductAPI,
  deleteSharedProductAPI,
  fetchAdminOrdersAPI,
  createOrderAPI,
  updateOrderStatusAPI,
  updateOrderFinancialAPI,
  deleteOrderAPI,
} from './api';

const DB_NAME = 'CF_BRAND_STORE_V2';
const DB_VERSION = 2;

// Fallback seed data if offline on initial load
const SEED_APPROVED_REVIEWS: Review[] = [
  {
    id: 'rev-seed-1',
    authorName: 'Edmilson Santos',
    rating: 5,
    category: 'Elogio',
    comment: 'A qualidade do algodão 240g é incrível, super pesada e o caimento oversized é o melhor de Luanda. A estampa da Guerreira Tribal nas costas chamou a atenção de toda a gente!',
    date: '2026-03-14',
    status: 'approved',
    verifiedPurchase: true,
  },
  {
    id: 'rev-seed-2',
    authorName: 'Vanusa Domingos',
    rating: 5,
    category: 'Qualidade',
    comment: 'Comprei o modelo "Sonhe Alto". O branco é puro, não fica transparente e a serigrafia resiste perfeitamente às lavagens. Parabéns à CF pela originalidade!',
    date: '2026-03-28',
    status: 'approved',
    verifiedPurchase: true,
  },
  {
    id: 'rev-seed-3',
    authorName: 'Yuri Kassoma',
    rating: 5,
    category: 'Elogio',
    comment: 'Fiz a minha encomenda com a minha frase pelo formulário da CF. O atendimento via WhatsApp foi imediato e a entrega correu 100%. Recomendo vivamente.',
    date: '2026-04-05',
    status: 'approved',
    verifiedPurchase: true,
  },
];

function notifyDataUpdated(storeName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cf_data_updated', {
        detail: { storeName, timestamp: Date.now() },
      })
    );
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('reviews')) {
        db.createObjectStore('reviews', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('customOrders')) {
        db.createObjectStore('customOrders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      resolve(request.result);
    };
  });
}

function getFromLocalStorage<T>(storeName: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`cf_store_${storeName}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Erro ao ler localStorage para ${storeName}:`, e);
  }
  return [];
}

function saveToLocalStorage<T>(storeName: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`cf_store_${storeName}`, JSON.stringify(items));
  } catch (e) {
    console.warn(`Erro ao guardar no localStorage para ${storeName}:`, e);
  }
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  let idbItems: T[] | null = null;
  try {
    const db = await openDatabase();
    idbItems = await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB read failed for ${storeName}:`, err);
  }

  const localItems = getFromLocalStorage<T>(storeName);

  if (idbItems && idbItems.length > 0) {
    saveToLocalStorage(storeName, idbItems);
    return idbItems;
  }

  if (localItems && localItems.length > 0) {
    return localItems;
  }

  return idbItems || [];
}

async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const key = (item as any).id || (item as any).key;

  try {
    const current = getFromLocalStorage<any>(storeName);
    const idx = current.findIndex((x) => (x.id || x.key) === key);
    if (idx >= 0) {
      current[idx] = item;
    } else {
      current.push(item);
    }
    saveToLocalStorage(storeName, current);
  } catch (e) {
    console.warn('localStorage put error:', e);
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB put error:', err);
  }

  notifyDataUpdated(storeName);
}

async function deleteFromStore(storeName: string, key: string): Promise<void> {
  try {
    const current = getFromLocalStorage<any>(storeName);
    const filtered = current.filter((x) => (x.id || x.key) !== key);
    saveToLocalStorage(storeName, filtered);
  } catch (e) {
    console.warn('localStorage delete error:', e);
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }

  notifyDataUpdated(storeName);
}

// --- DYNAMIC PRODUCTS (ADMIN-MANAGED) ---
export async function getDynamicProducts(): Promise<Product[]> {
  try {
    const serverProds = await fetchSharedProducts();
    if (serverProds && serverProds.length > 0) {
      saveToLocalStorage('products', serverProds);
      return serverProds;
    }
  } catch (e) {
    console.warn('Failed to load server products, checking local store:', e);
  }
  return await getAllFromStore<Product>('products');
}

export async function saveDynamicProduct(product: Product): Promise<void> {
  await putToStore('products', product);
  try {
    await saveSharedProductAPI(product);
  } catch (e) {
    console.warn('Could not sync product with server:', e);
  }
}

export async function deleteDynamicProduct(id: string): Promise<void> {
  await deleteFromStore('products', id);
  try {
    await deleteSharedProductAPI(id);
  } catch (e) {
    console.warn('Could not delete product on server:', e);
  }
}

// --- REVIEWS & RATINGS (SHARED ONLINE DATABASE WITH PROGRESSIVE LOADING) ---

/**
 * Get all reviews (for Admin area).
 * Pulls directly from shared server API so changes are immediately shared across all devices.
 */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const adminRes = await fetchAdminReviews('all');
    if (adminRes && Array.isArray(adminRes.reviews)) {
      saveToLocalStorage('reviews', adminRes.reviews);
      return adminRes.reviews;
    }
  } catch (err) {
    console.warn('Admin reviews fetch error (will use local cache fallback):', err);
  }

  // Fallback to local store
  const local = await getAllFromStore<Review>('reviews');
  if (local.length > 0) return local;

  return SEED_APPROVED_REVIEWS;
}

/**
 * Get public approved reviews from the shared database.
 */
export async function getApprovedReviews(category: string = 'all'): Promise<Review[]> {
  try {
    const res = await fetchApprovedReviews(1, 100, category);
    if (res && Array.isArray(res.reviews)) {
      return res.reviews;
    }
  } catch (err) {
    console.warn('Public approved reviews fetch error (using fallback):', err);
  }

  const all = await getAllFromStore<Review>('reviews');
  const approved = all.filter((r) => r.status === 'approved');
  if (approved.length > 0) {
    return category === 'all' ? approved : approved.filter((r) => r.category === category);
  }

  return category === 'all'
    ? SEED_APPROVED_REVIEWS
    : SEED_APPROVED_REVIEWS.filter((r) => r.category === category);
}

/**
 * Save / submit review.
 * Sends directly to the server with status 'pending' (client can NEVER set status to approved).
 */
export async function saveReview(review: Review): Promise<void> {
  // Always enforce pending status for clients
  const safeReview: Review = {
    ...review,
    status: 'pending',
  };

  try {
    await submitClientReview({
      authorName: safeReview.authorName,
      rating: safeReview.rating,
      category: safeReview.category,
      comment: safeReview.comment,
    });
  } catch (err) {
    console.warn('Server review submission warning, buffering locally:', err);
    await putToStore('reviews', safeReview);
    throw err;
  }

  // Also buffer in local store for seamless UI feedback
  await putToStore('reviews', safeReview);
}

/**
 * Admin action: update status (approved or rejected).
 * Syncs directly to server so all visitors immediately see the update.
 */
export async function updateReviewStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  try {
    await updateAdminReviewStatus(id, status);
  } catch (err) {
    console.warn('Server update error, updating local store:', err);
  }

  const all = await getAllFromStore<Review>('reviews');
  const target = all.find((r) => r.id === id);
  if (target) {
    target.status = status;
    await putToStore('reviews', target);
  } else {
    notifyDataUpdated('reviews');
  }
}

/**
 * Admin action: permanently delete review.
 * Deletes from shared server database, permanently removing it for all visitors.
 */
export async function deleteReview(id: string): Promise<void> {
  try {
    await deleteAdminReview(id);
  } catch (err) {
    console.warn('Server delete review warning:', err);
  }

  await deleteFromStore('reviews', id);
}

// --- CUSTOM ORDERS (ZERO SEED - TEST ENVIRONMENT INITIAL STATE: 0) ---

// Filter out any legacy demonstration orders to guarantee clean zero state for financial tests
function filterLegacyDummies(orders: CustomOrder[]): CustomOrder[] {
  const dummyIds = new Set(['ord-cf-1001', 'ord-cf-1002', 'ord-cf-1003']);
  return orders.filter((o) => !dummyIds.has(o.id));
}

export async function getAllCustomOrders(): Promise<CustomOrder[]> {
  try {
    // 1. Primary: Server-authoritative storage in data/orders.json
    const serverOrders = await fetchAdminOrdersAPI();
    const cleanServerOrders = filterLegacyDummies(serverOrders);

    // Synchronize local cache with server
    saveToLocalStorage('customOrders', cleanServerOrders);
    return cleanServerOrders;
  } catch (err) {
    // 2. Offline fallback to local storage
    console.warn('Could not reach orders API, using local storage fallback:', err);
    const localOrders = await getAllFromStore<CustomOrder>('customOrders');
    const cleanLocal = filterLegacyDummies(localOrders);
    return cleanLocal;
  }
}

export async function saveCustomOrder(order: Partial<CustomOrder>): Promise<CustomOrder> {
  const safePayload: Partial<CustomOrder> = {
    ...order,
    fulfillmentStatus: order.fulfillmentStatus || 'pendente',
    financialStatus: order.financialStatus || 'por_pagar',
    orderStatus: order.orderStatus || 'recebido',
    paymentStatus: order.paymentStatus || 'por_confirmar',
    deliveryStatus: order.deliveryStatus || 'pendente',
    amountReceived: order.amountReceived !== undefined ? order.amountReceived : 0,
  };

  try {
    const res = await createOrderAPI(safePayload);
    await putToStore('customOrders', res.order);
    notifyDataUpdated('customOrders');
    return res.order;
  } catch (err) {
    console.warn('Server save failed, saving to local store:', err);
    const localFallbackOrder: CustomOrder = {
      ...(safePayload as CustomOrder),
      id: safePayload.id || `ord-${Date.now()}`,
      date: safePayload.date || new Date().toISOString().slice(0, 10),
      status: 'novo',
    };
    await putToStore('customOrders', localFallbackOrder);
    notifyDataUpdated('customOrders');
    return localFallbackOrder;
  }
}

export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrder['status']
): Promise<void> {
  try {
    const mappedOrderStatus =
      status === 'concluido'
        ? 'pronto_para_entrega'
        : status === 'cancelado'
        ? 'cancelado'
        : status === 'em_producao'
        ? 'em_preparacao'
        : 'recebido';

    await updateOrderStatusAPI(id, { orderStatus: mappedOrderStatus });
  } catch (e) {
    console.warn('Server status update warning:', e);
  }

  const all = await getAllCustomOrders();
  const target = all.find((o) => o.id === id);
  if (target) {
    target.status = status;
    await putToStore('customOrders', target);
    notifyDataUpdated('customOrders');
  }
}

export async function updateOrderFulfillment(
  id: string,
  fulfillmentStatus: 'atendido' | 'pendente'
): Promise<CustomOrder | null> {
  const mappedDelivery = fulfillmentStatus === 'atendido' ? 'entregue_e_confirmada' : 'pendente';

  try {
    await updateOrderStatusAPI(id, { deliveryStatus: mappedDelivery });
  } catch (e) {
    console.warn('Server delivery status update warning:', e);
  }

  const all = await getAllCustomOrders();
  const target = all.find((o) => o.id === id);
  if (target) {
    target.fulfillmentStatus = fulfillmentStatus;
    target.deliveryStatus = mappedDelivery;
    if (fulfillmentStatus === 'atendido') {
      target.status = 'concluido';
      target.fulfillmentDate = new Date().toISOString().slice(0, 10);
      if (!target.financialStatus || target.financialStatus === 'por_pagar') {
        target.financialStatus = 'atendido_por_confirmar';
      }
    } else {
      target.status = 'novo';
      target.fulfillmentDate = undefined;
    }
    await putToStore('customOrders', target);
    notifyDataUpdated('customOrders');
    return target;
  }
  return null;
}

export async function updateOrderFinancialRecord(
  id: string,
  amountReceived: number,
  differenceReason?: string
): Promise<CustomOrder | null> {
  try {
    await updateOrderFinancialAPI(id, { amountReceived, differenceReason });
  } catch (e) {
    console.warn('Server financial update warning:', e);
  }

  const all = await getAllCustomOrders();
  const target = all.find((o) => o.id === id);
  if (target) {
    const expected = target.totalPriceKz || 0;
    target.amountReceived = amountReceived;
    target.financialConfirmedDate = new Date().toISOString().slice(0, 10);

    const diff = amountReceived - expected;

    if (amountReceived === 0) {
      target.financialStatus = 'por_pagar';
      target.paymentStatus = 'nao_pago';
      target.differenceReason = differenceReason || undefined;
    } else if (amountReceived > 0 && amountReceived < expected) {
      target.financialStatus = 'parcialmente_pago';
      target.paymentStatus = 'parcialmente_pago';
      target.differenceReason =
        differenceReason || `Pagamento parcial. Saldo em falta: ${formatPrice(expected - amountReceived)}`;
    } else if (diff === 0) {
      target.financialStatus = 'confirmado';
      target.paymentStatus = 'pago';
      target.differenceReason = 'Valores correspondentes';
    } else {
      target.financialStatus = 'diferenca_registada';
      target.paymentStatus = amountReceived > expected ? 'pago' : 'parcialmente_pago';
      target.differenceReason = differenceReason || 'Diferença registada e autorizada pelo administrador';
    }

    await putToStore('customOrders', target);
    notifyDataUpdated('customOrders');
    return target;
  }
  return null;
}

export async function deleteCustomOrder(id: string): Promise<void> {
  try {
    await deleteOrderAPI(id);
  } catch (e) {
    console.warn('Server delete order warning:', e);
  }
  await deleteFromStore('customOrders', id);
  notifyDataUpdated('customOrders');
}

// --- SETTINGS (PIN & BACKUP) ---
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    const val = typeof window !== 'undefined' ? localStorage.getItem(`cf_setting_${key}`) : null;
    return val ? JSON.parse(val) : defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await putToStore('settings', { key, value });
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cf_setting_${key}`, JSON.stringify(value));
    }
  } catch {}
}

// --- BACKUP EXPORT & IMPORT ---
export async function exportAllDataAsJSON(): Promise<string> {
  const products = await getDynamicProducts();
  const reviews = await getAllReviews();
  const customOrders = await getAllCustomOrders();

  const backup = {
    app: 'CF_CLASS_FOCUS',
    version: '2.5',
    exportDate: new Date().toISOString(),
    products,
    reviews,
    customOrders,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDataFromJSON(
  jsonString: string
): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (data.app !== 'CF_CLASS_FOCUS') {
      return { success: false, message: 'Ficheiro de cópia de segurança inválido para a marca CF.' };
    }

    if (Array.isArray(data.products)) {
      for (const p of data.products) await saveDynamicProduct(p);
    }
    if (Array.isArray(data.reviews)) {
      for (const r of data.reviews) await saveReview(r);
    }
    if (Array.isArray(data.customOrders)) {
      for (const o of data.customOrders) await saveCustomOrder(o);
    }

    return { success: true, message: 'Dados importados e sincronizados com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Erro ao importar: ${err.message || 'JSON inválido'}` };
  }
}
