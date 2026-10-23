import { Product, Review, CommunityPhoto, CustomOrder } from '../types';

const DB_NAME = 'CF_BRAND_STORE_V2';
const DB_VERSION = 2;

// Seed data: initial approved reviews from genuine customers in Luanda
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

// Seed data: initial approved customer community photos
const SEED_APPROVED_COMMUNITY_PHOTOS: CommunityPhoto[] = [
  {
    id: 'comm-seed-1',
    authorName: 'Mauro Silva',
    authorHandle: '@mauro.street',
    tshirtModel: 'GUERREIRA TRIBAL (Oversized 240g)',
    caption: 'Veste a tua identidade. CF na rua em Talatona.',
    imageUrl: '/assets/aistudio/Camisolas_Negras_com_Guerreira_Tribal_9977a92d.png',
    date: '2026-03-20',
    status: 'approved',
    consentConfirmed: true,
  },
  {
    id: 'comm-seed-2',
    authorName: 'Eliana Costa',
    authorHandle: '@eliana_c',
    tshirtModel: 'SONHE ALTO: O SEU DEUS É GRANDE',
    caption: 'Estilo limpo e mensagem que inspira. Streetwear de autor!',
    imageUrl: '/assets/aistudio/T-shirts_brancas_com_mensagem_inspiradora_2de484f3.png',
    date: '2026-04-02',
    status: 'approved',
    consentConfirmed: true,
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
      if (!db.objectStoreNames.contains('communityPhotos')) {
        db.createObjectStore('communityPhotos', { keyPath: 'id' });
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
      console.warn('IndexedDB bloqueado');
      resolve(request.result);
    };
  });
}

// LocalStorage helpers with error resilience
function getFromLocalStorage<T>(storeName: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`cf_store_${storeName}`);
    if (raw) return JSON.parse(raw);
    // Legacy migration check
    const legacy = localStorage.getItem(`cf_idb_${storeName}`);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(`cf_store_${storeName}`, legacy);
      return parsed;
    }
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

// Unified Store Get
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

  // If IndexedDB returned records, ensure localStorage backup is synchronized
  if (idbItems && idbItems.length > 0) {
    saveToLocalStorage(storeName, idbItems);
    return idbItems;
  }

  // If IndexedDB was empty or failed, check if localStorage has data
  if (localItems && localItems.length > 0) {
    // Attempt to backfill IndexedDB in background
    try {
      const db = await openDatabase();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      for (const item of localItems) {
        store.put(item);
      }
    } catch {}
    return localItems;
  }

  return idbItems || [];
}

// Unified Store Put
async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const key = (item as any).id || (item as any).key;

  // 1. Synchronously update LocalStorage
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

  // 2. Persist to IndexedDB
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

// Unified Store Delete
async function deleteFromStore(storeName: string, key: string): Promise<void> {
  // 1. Synchronously remove from LocalStorage
  try {
    const current = getFromLocalStorage<any>(storeName);
    const filtered = current.filter((x) => (x.id || x.key) !== key);
    saveToLocalStorage(storeName, filtered);
  } catch (e) {
    console.warn('localStorage delete error:', e);
  }

  // 2. Remove from IndexedDB
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

// --- PRODUCTS ---
export async function getDynamicProducts(): Promise<Product[]> {
  return await getAllFromStore<Product>('products');
}

export async function saveDynamicProduct(product: Product): Promise<void> {
  await putToStore('products', product);
}

export async function deleteDynamicProduct(id: string): Promise<void> {
  await deleteFromStore('products', id);
}

// --- REVIEWS & RATINGS ---
export async function getAllReviews(): Promise<Review[]> {
  const isInitialized = typeof window !== 'undefined' && localStorage.getItem('cf_reviews_initialized_v2') === 'true';
  const reviews = await getAllFromStore<Review>('reviews');

  if (!isInitialized) {
    // Only seed the very first time on a fresh setup if empty
    if (reviews.length === 0) {
      for (const seed of SEED_APPROVED_REVIEWS) {
        await putToStore('reviews', seed);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('cf_reviews_initialized_v2', 'true');
      }
      return SEED_APPROVED_REVIEWS;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('cf_reviews_initialized_v2', 'true');
    }
  }

  return reviews;
}

export async function getApprovedReviews(): Promise<Review[]> {
  const all = await getAllReviews();
  return all.filter((r) => r.status === 'approved');
}

export async function saveReview(review: Review): Promise<void> {
  await putToStore('reviews', review);
}

export async function updateReviewStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  const all = await getAllReviews();
  const target = all.find((r) => r.id === id);
  if (target) {
    target.status = status;
    await putToStore('reviews', target);
  }
}

export async function deleteReview(id: string): Promise<void> {
  await deleteFromStore('reviews', id);
}

// --- COMMUNITY PHOTOS ---
export async function getAllCommunityPhotos(): Promise<CommunityPhoto[]> {
  const isInitialized = typeof window !== 'undefined' && localStorage.getItem('cf_community_photos_initialized_v2') === 'true';
  const photos = await getAllFromStore<CommunityPhoto>('communityPhotos');

  if (!isInitialized) {
    if (photos.length === 0) {
      for (const seed of SEED_APPROVED_COMMUNITY_PHOTOS) {
        await putToStore('communityPhotos', seed);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('cf_community_photos_initialized_v2', 'true');
      }
      return SEED_APPROVED_COMMUNITY_PHOTOS;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('cf_community_photos_initialized_v2', 'true');
    }
  }

  return photos;
}

export async function getApprovedCommunityPhotos(): Promise<CommunityPhoto[]> {
  const all = await getAllCommunityPhotos();
  return all.filter((p) => p.status === 'approved');
}

export async function saveCommunityPhoto(photo: CommunityPhoto): Promise<void> {
  await putToStore('communityPhotos', photo);
}

export async function updateCommunityPhotoStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  const all = await getAllCommunityPhotos();
  const target = all.find((p) => p.id === id);
  if (target) {
    target.status = status;
    await putToStore('communityPhotos', target);
  }
}

export async function deleteCommunityPhoto(id: string): Promise<void> {
  await deleteFromStore('communityPhotos', id);
}

// --- CUSTOM ORDERS ---
export async function getAllCustomOrders(): Promise<CustomOrder[]> {
  return await getAllFromStore<CustomOrder>('customOrders');
}

export async function saveCustomOrder(order: CustomOrder): Promise<void> {
  await putToStore('customOrders', order);
}

export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrder['status']
): Promise<void> {
  const all = await getAllCustomOrders();
  const target = all.find((o) => o.id === id);
  if (target) {
    target.status = status;
    await putToStore('customOrders', target);
  }
}

export async function deleteCustomOrder(id: string): Promise<void> {
  await deleteFromStore('customOrders', id);
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
  const communityPhotos = await getAllCommunityPhotos();
  const customOrders = await getAllCustomOrders();

  const backup = {
    app: 'CF_CLASS_FOCUS',
    version: '2.0',
    exportDate: new Date().toISOString(),
    products,
    reviews,
    communityPhotos,
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
    if (Array.isArray(data.communityPhotos)) {
      for (const c of data.communityPhotos) await saveCommunityPhoto(c);
    }
    if (Array.isArray(data.customOrders)) {
      for (const o of data.customOrders) await saveCustomOrder(o);
    }

    return { success: true, message: 'Dados importados e sincronizados com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Erro ao importar: ${err.message || 'JSON inválido'}` };
  }
}
