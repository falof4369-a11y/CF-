import { Review, Product, CustomOrder } from '../types';

export interface PaginatedReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  averageRating: number;
  totalApproved: number;
}

export interface ReviewStatsResponse {
  averageRating: number;
  totalApproved: number;
  distribution: Record<number, number>;
}

// In-memory admin PIN holder for authenticated requests in the current session
let currentAdminPin: string = '2008';

export function setActiveAdminPin(pin: string): void {
  currentAdminPin = pin;
  try {
    sessionStorage.setItem('cf_active_pin', pin);
  } catch {}
}

export function getActiveAdminPin(): string {
  try {
    const saved = sessionStorage.getItem('cf_active_pin');
    if (saved && saved.length === 4) return saved;
  } catch {}
  return currentAdminPin || '2008';
}

// --- PUBLIC REVIEW ENDPOINTS ---

/**
 * Fetch paginated approved reviews from shared online database.
 * Supports filtering by category.
 */
export async function fetchApprovedReviews(
  page: number = 1,
  limit: number = 6,
  category: string = 'all'
): Promise<PaginatedReviewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    category,
  });

  const response = await fetch(`/api/reviews?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao carregar comentários (${response.status})`);
  }

  return await response.json();
}

/**
 * Fetch site overall review statistics (approved reviews only)
 */
export async function fetchReviewStats(): Promise<ReviewStatsResponse> {
  const response = await fetch('/api/reviews/stats', {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao carregar estatísticas (${response.status})`);
  }

  return await response.json();
}

/**
 * Submit client review to shared database (strictly saved as pending)
 */
export async function submitClientReview(data: {
  authorName: string;
  rating: number;
  category: Review['category'];
  comment: string;
}): Promise<{ success: boolean; message: string; id: string }> {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || 'Erro ao submeter avaliação.');
  }

  return resData;
}

// --- ADMIN REVIEW ENDPOINTS ---

/**
 * Fetch all reviews for admin moderation (pending, approved, rejected)
 */
export async function fetchAdminReviews(filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all'): Promise<{
  reviews: Review[];
  stats: { total: number; pending: number; approved: number; rejected: number };
}> {
  const pin = getActiveAdminPin();
  const response = await fetch(`/api/admin/reviews?filter=${filter}`, {
    headers: {
      'Accept': 'application/json',
      'x-admin-pin': pin,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro de autenticação administrativa (${response.status})`);
  }

  return await response.json();
}

/**
 * Approve, reject, or set pending status for a review
 */
export async function updateAdminReviewStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<{ success: boolean; message: string; review: Review }> {
  const pin = getActiveAdminPin();
  const response = await fetch(`/api/admin/reviews/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-admin-pin': pin,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao atualizar o estado do comentário.');
  }

  return data;
}

/**
 * Permanently delete review from shared database
 */
export async function deleteAdminReview(id: string): Promise<{ success: boolean; deletedId: string }> {
  const pin = getActiveAdminPin();
  const response = await fetch(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'x-admin-pin': pin,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Falha ao eliminar comentário permanentemente.');
  }

  return data;
}

// --- ADMIN AUTH ENDPOINTS ---

export async function verifyAdminPinAPI(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setActiveAdminPin(pin);
      return true;
    }
  } catch (e) {
    console.error('API verify error, fallback to local', e);
  }
  return false;
}

export async function changeAdminPinAPI(currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/change-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': currentPin,
      },
      body: JSON.stringify({ currentPin, newPin }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setActiveAdminPin(newPin);
      return { success: true };
    }
    return { success: false, error: data.error || 'Erro ao alterar código.' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Erro de rede.' };
  }
}

// --- DYNAMIC PRODUCTS (ADMIN-MANAGED) ---

export async function fetchSharedProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products)) return data.products;
    }
  } catch (e) {
    console.warn('Could not fetch shared products, using local fallback', e);
  }
  return [];
}

export async function saveSharedProductAPI(product: Product): Promise<void> {
  const pin = getActiveAdminPin();
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin,
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao guardar produto no servidor.');
  }
}

export async function deleteSharedProductAPI(id: string): Promise<void> {
  const pin = getActiveAdminPin();
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-pin': pin,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao eliminar produto no servidor.');
  }
}

// --- ORDERS & DELIVERY CONFIRMATION SYSTEM API ---

export async function createOrderAPI(orderData: Partial<CustomOrder>): Promise<{ success: boolean; order: CustomOrder }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao registar o pedido no servidor.');
  }

  return data;
}

export async function fetchAdminOrdersAPI(): Promise<CustomOrder[]> {
  const pin = getActiveAdminPin();
  const res = await fetch('/api/orders', {
    headers: {
      'x-admin-pin': pin,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao obter encomendas (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function lookupOrdersForCourierAPI(query: string): Promise<any[]> {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`/api/orders/lookup?${params.toString()}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Falha na pesquisa de encomendas');
  }

  const data = await res.json();
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function verifyDeliveryCodeAPI(
  orderId: string,
  code: string,
  courierName?: string
): Promise<{ success: boolean; message: string; remainingAttempts?: number; order?: any }> {
  const res = await fetch('/api/delivery/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ orderId, code, courierName }),
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      message: data.error || 'Código incorreto ou inválido.',
      remainingAttempts: data.remainingAttempts,
    };
  }

  return {
    success: true,
    message: data.message || 'Entrega confirmada com sucesso!',
    order: data.order,
  };
}

export async function updateOrderStatusAPI(
  id: string,
  statuses: { orderStatus?: string; paymentStatus?: string; deliveryStatus?: string }
): Promise<void> {
  const pin = getActiveAdminPin();
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin,
    },
    body: JSON.stringify(statuses),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao atualizar estado da encomenda.');
  }
}

export async function updateOrderFinancialAPI(
  id: string,
  financialData: { amountReceived: number; differenceReason?: string }
): Promise<void> {
  const pin = getActiveAdminPin();
  const res = await fetch(`/api/orders/${id}/financial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin,
    },
    body: JSON.stringify(financialData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao atualizar dados financeiros.');
  }
}

export async function deleteOrderAPI(id: string): Promise<void> {
  const pin = getActiveAdminPin();
  const res = await fetch(`/api/orders/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-pin': pin,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao eliminar encomenda.');
  }
}

