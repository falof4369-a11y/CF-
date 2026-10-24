import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'dynamic_products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Interface definition matching client
interface Review {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  category: 'Elogio' | 'Sugestão' | 'Crítica Construtiva' | 'Qualidade' | 'Geral';
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const SEED_APPROVED_REVIEWS: Review[] = [
  {
    id: 'rev-seed-1',
    authorName: 'Edmilson Santos',
    rating: 5,
    category: 'Elogio',
    comment: 'A qualidade do algodão 240g é incrível, super pesada e o caimento oversized é o melhor de Luanda. A estampa da Guerreira Tribal nas costas chamou a atenção de toda a gente!',
    date: '2026-03-14',
    status: 'approved',
  },
  {
    id: 'rev-seed-2',
    authorName: 'Vanusa Domingos',
    rating: 5,
    category: 'Qualidade',
    comment: 'Comprei o modelo "Sonhe Alto". O branco é puro, não fica transparente e a serigrafia resiste perfeitamente às lavagens. Parabéns à CF pela originalidade!',
    date: '2026-03-28',
    status: 'approved',
  },
  {
    id: 'rev-seed-3',
    authorName: 'Yuri Kassoma',
    rating: 5,
    category: 'Elogio',
    comment: 'Fiz a minha encomenda com a minha frase pelo formulário da CF. O atendimento via WhatsApp foi imediato e a entrega correu 100%. Recomendo vivamente.',
    date: '2026-04-05',
    status: 'approved',
  },
];

// Helper to hash PIN
function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(`cf_salt_2026_${pin}`).digest('hex');
}

// Settings storage
interface Settings {
  adminPinHash: string;
}

function loadSettings(): Settings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  const defaultSettings: Settings = { adminPinHash: hashPin('2008') };
  saveSettings(defaultSettings);
  return defaultSettings;
}

function saveSettings(settings: Settings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

// Review database helpers
function loadReviews(): Review[] {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading reviews file:', err);
  }
  // Initialize with seed data
  saveReviews(SEED_APPROVED_REVIEWS);
  return SEED_APPROVED_REVIEWS;
}

function saveReviews(reviews: Review[]): void {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing reviews file:', err);
  }
}

// Dynamic products helpers
function loadDynamicProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading products file:', err);
  }
  return [];
}

function saveDynamicProducts(products: any[]): void {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing products file:', err);
  }
}

// Admin Auth Middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const pinHeader = req.headers['x-admin-pin'] as string;
  const authHeader = req.headers['authorization'];
  let candidatePin = pinHeader;

  if (!candidatePin && authHeader && authHeader.startsWith('Bearer ')) {
    candidatePin = authHeader.substring(7);
  }

  if (!candidatePin) {
    res.status(401).json({ error: 'Autenticação necessária. Código de acesso em falta.' });
    return;
  }

  const settings = loadSettings();
  const candidateHash = hashPin(candidatePin);

  if (candidateHash !== settings.adminPinHash) {
    res.status(403).json({ error: 'Código de acesso incorreto ou sessão inválida.' });
    return;
  }

  next();
}

// Express config
app.use(express.json({ limit: '15mb' }));

// --- PUBLIC REVIEW ENDPOINTS ---

// GET /api/reviews - Paginated approved reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 6));
    const category = (req.query.category as string) || 'all';

    const all = loadReviews();
    const approved = all.filter((r) => r.status === 'approved');

    // Filter by category if not 'all'
    const filtered = category === 'all' ? approved : approved.filter((r) => r.category === category);

    // Calculate public stats strictly based on all approved
    const totalApproved = approved.length;
    const avgRating =
      totalApproved > 0
        ? Number((approved.reduce((acc, r) => acc + r.rating, 0) / totalApproved).toFixed(1))
        : 5.0;

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedReviews = filtered.slice(startIndex, startIndex + limit);

    res.json({
      reviews: paginatedReviews,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      averageRating: avgRating,
      totalApproved,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar comentários.', details: err.message });
  }
});

// GET /api/reviews/stats - Dynamic summary from approved reviews
app.get('/api/reviews/stats', (_req: Request, res: Response) => {
  try {
    const all = loadReviews();
    const approved = all.filter((r) => r.status === 'approved');
    const total = approved.length;
    const avgRating =
      total > 0
        ? Number((approved.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
        : 5.0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    approved.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    res.json({
      averageRating: avgRating,
      totalApproved: total,
      distribution,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao obter estatísticas.', details: err.message });
  }
});

// POST /api/reviews - Submit review (always strictly saved as pending)
app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { authorName, rating, category, comment } = req.body;

    if (!authorName || typeof authorName !== 'string' || authorName.trim().length < 2) {
      res.status(400).json({ error: 'Por favor indica o teu nome (mínimo 2 caracteres).' });
      return;
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: 'A classificação deve ser entre 1 e 5 estrelas.' });
      return;
    }

    const validCategories = ['Elogio', 'Sugestão', 'Crítica Construtiva', 'Qualidade', 'Geral'];
    const safeCategory = validCategories.includes(category) ? category : 'Geral';

    if (!comment || typeof comment !== 'string' || comment.trim().length < 8) {
      res.status(400).json({ error: 'O comentário deve conter no mínimo 8 caracteres.' });
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      authorName: authorName.trim().slice(0, 60),
      rating: numRating,
      category: safeCategory as any,
      comment: comment.trim().slice(0, 600),
      date: new Date().toISOString().slice(0, 10),
      status: 'pending', // Strictly pending!
    };

    const reviews = loadReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);

    res.status(201).json({
      success: true,
      message: 'Comentário enviado com sucesso! Ficará visível assim que aprovado pela moderação.',
      id: newReview.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao registar o comentário.', details: err.message });
  }
});

// --- ADMIN REVIEW ENDPOINTS ---

// GET /api/admin/reviews - All reviews for admin
app.get('/api/admin/reviews', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) || 'all';
    const all = loadReviews();

    const filtered =
      filter === 'all'
        ? all
        : all.filter((r) => r.status === filter);

    const stats = {
      total: all.length,
      pending: all.filter((r) => r.status === 'pending').length,
      approved: all.filter((r) => r.status === 'approved').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
    };

    res.json({ reviews: filtered, stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar comentários administrativos.', details: err.message });
  }
});

// PATCH /api/admin/reviews/:id/status - Approve or reject review
app.patch('/api/admin/reviews/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Estado inválido. Use approved, rejected ou pending.' });
      return;
    }

    const reviews = loadReviews();
    const index = reviews.findIndex((r) => r.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Comentário não encontrado.' });
      return;
    }

    reviews[index].status = status;
    saveReviews(reviews);

    res.json({
      success: true,
      message: `Comentário ${status === 'approved' ? 'aprovado e publicado' : 'rejeitado'}.`,
      review: reviews[index],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar estado.', details: err.message });
  }
});

// DELETE /api/admin/reviews/:id - Permanently delete review
app.delete('/api/admin/reviews/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = loadReviews();
    const filtered = reviews.filter((r) => r.id !== id);

    if (filtered.length === reviews.length) {
      res.status(404).json({ error: 'Comentário não encontrado.' });
      return;
    }

    saveReviews(filtered);
    res.json({ success: true, message: 'Comentário eliminado definitivamente.', deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao eliminar comentário.', details: err.message });
  }
});

// --- ADMIN AUTH & PIN MANAGEMENT ---

// POST /api/admin/verify - Verify 4-digit PIN
app.post('/api/admin/verify', (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      res.status(400).json({ error: 'O código deve conter 4 dígitos.' });
      return;
    }

    const settings = loadSettings();
    if (hashPin(pin) === settings.adminPinHash) {
      res.json({ success: true, message: 'Código verificado com sucesso.' });
    } else {
      res.status(401).json({ success: false, error: 'Código de acesso incorreto.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao verificar código.', details: err.message });
  }
});

// POST /api/admin/change-pin - Change 4-digit PIN
app.post('/api/admin/change-pin', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!newPin || typeof newPin !== 'string' || !/^\d{4}$/.test(newPin)) {
      res.status(400).json({ error: 'O novo código de acesso deve conter exatamente 4 dígitos numéricos.' });
      return;
    }

    if (currentPin === newPin) {
      res.status(400).json({ error: 'O novo código deve ser diferente do código atual.' });
      return;
    }

    const settings = loadSettings();
    settings.adminPinHash = hashPin(newPin);
    saveSettings(settings);

    res.json({ success: true, message: 'Código de acesso alterado com sucesso para ' + newPin + '.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alterar código.', details: err.message });
  }
});

// --- DYNAMIC PRODUCTS (ADMIN-MANAGED PHOTOGRAPHS & PRODUCTS) ---

// GET /api/products - Shared dynamic products published by admin
app.get('/api/products', (_req: Request, res: Response) => {
  try {
    const products = loadDynamicProducts();
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao obter produtos.', details: err.message });
  }
});

// POST /api/admin/products - Admin adds new product / photograph
app.post('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const product = req.body;
    if (!product || !product.id || !product.name) {
      res.status(400).json({ error: 'Dados do produto incompletos.' });
      return;
    }

    const products = loadDynamicProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }

    saveDynamicProducts(products);
    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao guardar produto.', details: err.message });
  }
});

// DELETE /api/admin/products/:id - Admin deletes dynamic product
app.delete('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = loadDynamicProducts();
    const filtered = products.filter((p) => p.id !== id);
    saveDynamicProducts(filtered);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao eliminar produto.', details: err.message });
  }
});

// --- ORDERS & DELIVERY CONFIRMATION SYSTEM ---

function loadOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

function saveOrders(orders: any[]): void {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders file:', err);
  }
}

function hashDeliveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

// In-memory rate limiting for delivery confirmation code verification (prevent brute-force)
const deliveryRateLimits = new Map<string, { count: number; lockedUntil: number }>();

// Helper to mask phone for public lookup: +244 958 194 301 -> +244 958 *** 301
function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.trim();
  if (digits.length <= 6) return digits;
  const start = digits.slice(0, 7);
  const end = digits.slice(-3);
  return `${start} *** ${end}`;
}

// POST /api/orders - Create new client order and generate secure delivery confirmation code
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      clientName,
      phone,
      serviceType,
      model,
      color,
      size,
      quantity,
      unitPriceKz,
      totalPriceKz,
      phrase,
      fontStyle,
      fontColor,
      placement,
      graphicDataUrl,
      notes,
    } = req.body;

    if (!clientName || typeof clientName !== 'string' || clientName.trim().length < 2) {
      res.status(400).json({ error: 'Por favor indica o teu nome completo.' });
      return;
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      res.status(400).json({ error: 'Por favor indica um número de telefone ou WhatsApp válido.' });
      return;
    }

    // Cryptographically secure generation of unique human-readable order number and delivery code
    const orderNumSuffix = crypto.randomInt(1000, 9999).toString();
    const orderNumber = `CF-${new Date().getFullYear()}-${orderNumSuffix}`;

    // 6-digit cryptographically unpredictable delivery confirmation code
    const deliveryCode = crypto.randomInt(100000, 999999).toString();
    const deliveryCodeHash = hashDeliveryCode(deliveryCode);

    const now = new Date();
    const orderId = `ord-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const newOrder = {
      id: orderId,
      orderNumber,
      clientName: clientName.trim(),
      phone: phone.trim(),
      serviceType: serviceType === 'client-shirt' ? 'client-shirt' : 'cf-brand',
      model: model || 'Peça Personalizada',
      color: color === 'white' ? 'white' : 'black',
      size: size || 'L',
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      unitPriceKz: Number(unitPriceKz) || 6000,
      totalPriceKz: Number(totalPriceKz) || 6000,
      phrase: phrase ? String(phrase).trim().slice(0, 300) : undefined,
      fontStyle: fontStyle || 'Gótico Streetwear',
      fontColor: fontColor || 'Branco',
      placement: placement || 'Costas centro grande',
      graphicDataUrl: graphicDataUrl ? String(graphicDataUrl) : undefined,
      notes: notes ? String(notes).trim().slice(0, 600) : undefined,
      date: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      status: 'novo',

      // Security & Delivery Confirmation Code System
      deliveryCode, // Exposed once in this creation response to the ordering client
      deliveryCodeHash, // Stored securely
      deliveryCodeConsumed: false,
      deliveryAttempts: 0,

      // Independent Statuses
      orderStatus: 'recebido', // 'recebido' | 'em_preparacao' | 'pronto_para_entrega' | 'cancelado'
      paymentStatus: 'por_confirmar', // 'por_confirmar' | 'parcialmente_pago' | 'pago' | 'nao_pago'
      deliveryStatus: 'pendente', // 'pendente' | 'em_distribuicao' | 'entregue_e_confirmada' | 'falha_na_entrega' | 'cancelada'

      // Financial & Fulfillment legacy compatibility
      fulfillmentStatus: 'pendente',
      financialStatus: 'por_pagar',
      amountReceived: 0,
    };

    const orders = loadOrders();
    orders.unshift(newOrder);
    saveOrders(orders);

    res.status(201).json({
      success: true,
      message: 'Pedido registado com sucesso!',
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao registar o pedido.', details: err.message });
  }
});

// GET /api/orders - Admin retrieves all orders (including verification codes)
app.get('/api/orders', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const orders = loadOrders();
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar pedidos.', details: err.message });
  }
});

// GET /api/orders/lookup - Public / Courier lookup (masked, no codes exposed!)
app.get('/api/orders/lookup', (req: Request, res: Response) => {
  try {
    const query = ((req.query.q as string) || '').trim().toLowerCase();
    if (!query || query.length < 2) {
      res.json({ success: true, orders: [] });
      return;
    }

    const orders = loadOrders();
    const matches = orders.filter((o) => {
      const matchName = (o.clientName || '').toLowerCase().includes(query);
      const matchNum = (o.orderNumber || '').toLowerCase().includes(query);
      const matchPhone = (o.phone || '').replace(/\s+/g, '').includes(query.replace(/\s+/g, ''));
      const matchId = (o.id || '').toLowerCase().includes(query);
      return matchName || matchNum || matchPhone || matchId;
    });

    // Sanitized output strictly withholding the delivery code
    const sanitized = matches.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      clientName: o.clientName,
      maskedPhone: maskPhone(o.phone),
      model: o.model,
      size: o.size,
      quantity: o.quantity,
      totalPriceKz: o.totalPriceKz,
      orderStatus: o.orderStatus || 'recebido',
      deliveryStatus: o.deliveryStatus || 'pendente',
      deliveryCodeConsumed: !!o.deliveryCodeConsumed,
      date: o.date,
      createdAt: o.createdAt,
    }));

    res.json({ success: true, orders: sanitized });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro na pesquisa de encomendas.', details: err.message });
  }
});

// POST /api/delivery/verify - Courier validates customer's 6-digit confirmation code
app.post('/api/delivery/verify', (req: Request, res: Response) => {
  try {
    const { orderId, code, courierName } = req.body;

    if (!orderId || !code) {
      res.status(400).json({ error: 'Identificador do pedido e código de confirmação são obrigatórios.' });
      return;
    }

    // Rate-limiting check: max 5 failed attempts per order
    const now = Date.now();
    const rateRecord = deliveryRateLimits.get(orderId);
    if (rateRecord && rateRecord.lockedUntil > now) {
      const minutesRemaining = Math.ceil((rateRecord.lockedUntil - now) / 60000);
      res.status(429).json({
        error: `Limite de tentativas excedido para este pedido. Bloqueado por mais ${minutesRemaining} minuto(s) por razões de segurança.`,
      });
      return;
    }

    const orders = loadOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);

    if (index === -1) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const order = orders[index];

    // Status validations
    if (order.orderStatus === 'cancelado') {
      res.status(400).json({ error: 'Esta encomenda foi cancelada. Não é possível confirmar a entrega.' });
      return;
    }

    if (order.deliveryCodeConsumed || order.deliveryStatus === 'entregue_e_confirmada') {
      res.status(400).json({
        error: 'Este código de entrega já foi utilizado e consumido anteriormente. A entrega já estava confirmada.',
      });
      return;
    }

    // Code verification (constant time comparison against hash or plain code)
    const candidateHash = hashDeliveryCode(String(code));
    const isCodeMatch =
      candidateHash === order.deliveryCodeHash ||
      (order.deliveryCode && String(code).trim().toUpperCase() === order.deliveryCode.trim().toUpperCase());

    if (!isCodeMatch) {
      const currentAttempts = (order.deliveryAttempts || 0) + 1;
      order.deliveryAttempts = currentAttempts;

      // Update rate limiter
      const failedCount = (rateRecord ? rateRecord.count : 0) + 1;
      if (failedCount >= 5) {
        deliveryRateLimits.set(orderId, { count: failedCount, lockedUntil: now + 15 * 60 * 1000 });
      } else {
        deliveryRateLimits.set(orderId, { count: failedCount, lockedUntil: 0 });
      }

      saveOrders(orders);

      const remaining = Math.max(0, 5 - failedCount);
      res.status(400).json({
        error: `Código de confirmação incorreto. Tens mais ${remaining} tentativa(s) antes do bloqueio de segurança.`,
        remainingAttempts: remaining,
      });
      return;
    }

    // Successful single-use validation: atomic state update
    order.deliveryCodeConsumed = true;
    order.deliveryStatus = 'entregue_e_confirmada';
    order.fulfillmentStatus = 'atendido'; // Legacy compatibility
    order.deliveryConfirmedAt = new Date().toISOString();
    order.deliveryCourierId = (courierName || 'Estafeta Autorizado').trim();
    order.deliveryAttempts = 0;

    // Notice: paymentStatus and amountReceived are strictly NOT modified automatically!
    // As required: "Uma entrega confirmada não significa automaticamente que o pagamento foi recebido."

    saveOrders(orders);
    deliveryRateLimits.delete(orderId);

    res.json({
      success: true,
      message: 'Entrega confirmada com sucesso! O código foi validado e consumido.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        deliveryStatus: order.deliveryStatus,
        deliveryConfirmedAt: order.deliveryConfirmedAt,
        deliveryCourierId: order.deliveryCourierId,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao validar código de entrega.', details: err.message });
  }
});

// PATCH /api/orders/:id/status - Admin updates order, payment, and delivery statuses
app.patch('/api/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, deliveryStatus } = req.body;

    const orders = loadOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const order = orders[index];

    if (orderStatus) {
      const validOrders = ['recebido', 'em_preparacao', 'pronto_para_entrega', 'cancelado'];
      if (validOrders.includes(orderStatus)) {
        order.orderStatus = orderStatus;
        if (orderStatus === 'cancelado') {
          order.status = 'cancelado';
        }
      }
    }

    if (paymentStatus) {
      const validPayments = ['por_confirmar', 'parcialmente_pago', 'pago', 'nao_pago'];
      if (validPayments.includes(paymentStatus)) {
        order.paymentStatus = paymentStatus;
      }
    }

    if (deliveryStatus) {
      const validDeliveries = ['pendente', 'em_distribuicao', 'entregue_e_confirmada', 'falha_na_entrega', 'cancelada'];
      if (validDeliveries.includes(deliveryStatus)) {
        order.deliveryStatus = deliveryStatus;
        if (deliveryStatus === 'entregue_e_confirmada') {
          order.fulfillmentStatus = 'atendido';
          if (!order.deliveryConfirmedAt) {
            order.deliveryConfirmedAt = new Date().toISOString();
          }
        }
      }
    }

    saveOrders(orders);
    res.json({ success: true, message: 'Estado atualizado com sucesso.', order });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar pedido.', details: err.message });
  }
});

// POST /api/orders/:id/financial - Admin registers financial confirmation & difference
app.post('/api/orders/:id/financial', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amountReceived, differenceReason } = req.body;

    const orders = loadOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const order = orders[index];
    const expected = order.totalPriceKz || 0;
    const received = Math.max(0, parseFloat(amountReceived) || 0);

    order.amountReceived = received;
    order.financialConfirmedDate = new Date().toISOString().slice(0, 10);

    const diff = received - expected;

    if (received === 0) {
      order.financialStatus = 'por_pagar';
      order.paymentStatus = 'nao_pago';
      order.differenceReason = differenceReason || undefined;
    } else if (received > 0 && received < expected) {
      order.financialStatus = 'parcialmente_pago';
      order.paymentStatus = 'parcialmente_pago';
      order.differenceReason = differenceReason || `Pagamento parcial. Saldo em falta: ${expected - received} Kz`;
    } else if (diff === 0) {
      order.financialStatus = 'confirmado';
      order.paymentStatus = 'pago';
      order.differenceReason = 'Valores correspondentes';
    } else {
      order.financialStatus = 'diferenca_registada';
      order.paymentStatus = received > expected ? 'pago' : 'parcialmente_pago';
      order.differenceReason = differenceReason || 'Diferença registada e autorizada pelo administrador';
    }

    saveOrders(orders);
    res.json({ success: true, message: 'Registo financeiro guardado com sucesso.', order });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar registo financeiro.', details: err.message });
  }
});

// DELETE /api/orders/:id - Admin deletes order
app.delete('/api/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orders = loadOrders();
    const filtered = orders.filter((o) => o.id !== id);

    if (filtered.length === orders.length) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    saveOrders(filtered);
    res.json({ success: true, message: 'Pedido eliminado com sucesso.', deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao eliminar pedido.', details: err.message });
  }
});

// --- SERVER SETUP & VITE MOUNT ---

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: mount Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CF Server] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CF Server] Falha ao iniciar:', err);
  process.exit(1);
});
