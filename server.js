import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import crypto from "crypto";
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "dynamic_products.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const SEED_APPROVED_REVIEWS = [
  {
    id: "rev-seed-1",
    authorName: "Edmilson Santos",
    rating: 5,
    category: "Elogio",
    comment: "A qualidade do algod\xE3o 240g \xE9 incr\xEDvel, super pesada e o caimento oversized \xE9 o melhor de Luanda. A estampa da Guerreira Tribal nas costas chamou a aten\xE7\xE3o de toda a gente!",
    date: "2026-03-14",
    status: "approved"
  },
  {
    id: "rev-seed-2",
    authorName: "Vanusa Domingos",
    rating: 5,
    category: "Qualidade",
    comment: 'Comprei o modelo "Sonhe Alto". O branco \xE9 puro, n\xE3o fica transparente e a serigrafia resiste perfeitamente \xE0s lavagens. Parab\xE9ns \xE0 CF pela originalidade!',
    date: "2026-03-28",
    status: "approved"
  },
  {
    id: "rev-seed-3",
    authorName: "Yuri Kassoma",
    rating: 5,
    category: "Elogio",
    comment: "Fiz a minha encomenda com a minha frase pelo formul\xE1rio da CF. O atendimento via WhatsApp foi imediato e a entrega correu 100%. Recomendo vivamente.",
    date: "2026-04-05",
    status: "approved"
  }
];
function hashPin(pin) {
  return crypto.createHash("sha256").update(`cf_salt_2026_${pin}`).digest("hex");
}
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error loading settings:", err);
  }
  const defaultSettings = { adminPinHash: hashPin("2008") };
  saveSettings(defaultSettings);
  return defaultSettings;
}
function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving settings:", err);
  }
}
function loadReviews() {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading reviews file:", err);
  }
  saveReviews(SEED_APPROVED_REVIEWS);
  return SEED_APPROVED_REVIEWS;
}
function saveReviews(reviews) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing reviews file:", err);
  }
}
function loadDynamicProducts() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading products file:", err);
  }
  return [];
}
function saveDynamicProducts(products) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing products file:", err);
  }
}
function requireAdminAuth(req, res, next) {
  const pinHeader = req.headers["x-admin-pin"];
  const authHeader = req.headers["authorization"];
  let candidatePin = pinHeader;
  if (!candidatePin && authHeader && authHeader.startsWith("Bearer ")) {
    candidatePin = authHeader.substring(7);
  }
  if (!candidatePin) {
    res.status(401).json({ error: "Autentica\xE7\xE3o necess\xE1ria. C\xF3digo de acesso em falta." });
    return;
  }
  const settings = loadSettings();
  const candidateHash = hashPin(candidatePin);
  if (candidateHash !== settings.adminPinHash) {
    res.status(403).json({ error: "C\xF3digo de acesso incorreto ou sess\xE3o inv\xE1lida." });
    return;
  }
  next();
}
app.use(express.json({ limit: "15mb" }));
app.get("/api/reviews", (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));
    const category = req.query.category || "all";
    const all = loadReviews();
    const approved = all.filter((r) => r.status === "approved");
    const filtered = category === "all" ? approved : approved.filter((r) => r.category === category);
    const totalApproved = approved.length;
    const avgRating = totalApproved > 0 ? Number((approved.reduce((acc, r) => acc + r.rating, 0) / totalApproved).toFixed(1)) : 5;
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
      totalApproved
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar coment\xE1rios.", details: err.message });
  }
});
app.get("/api/reviews/stats", (_req, res) => {
  try {
    const all = loadReviews();
    const approved = all.filter((r) => r.status === "approved");
    const total = approved.length;
    const avgRating = total > 0 ? Number((approved.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)) : 5;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    approved.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
    });
    res.json({
      averageRating: avgRating,
      totalApproved: total,
      distribution
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter estat\xEDsticas.", details: err.message });
  }
});
app.post("/api/reviews", (req, res) => {
  try {
    const { authorName, rating, category, comment } = req.body;
    if (!authorName || typeof authorName !== "string" || authorName.trim().length < 2) {
      res.status(400).json({ error: "Por favor indica o teu nome (m\xEDnimo 2 caracteres)." });
      return;
    }
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: "A classifica\xE7\xE3o deve ser entre 1 e 5 estrelas." });
      return;
    }
    const validCategories = ["Elogio", "Sugest\xE3o", "Cr\xEDtica Construtiva", "Qualidade", "Geral"];
    const safeCategory = validCategories.includes(category) ? category : "Geral";
    if (!comment || typeof comment !== "string" || comment.trim().length < 8) {
      res.status(400).json({ error: "O coment\xE1rio deve conter no m\xEDnimo 8 caracteres." });
      return;
    }
    const newReview = {
      id: `rev-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      authorName: authorName.trim().slice(0, 60),
      rating: numRating,
      category: safeCategory,
      comment: comment.trim().slice(0, 600),
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      status: "pending"
      // Strictly pending!
    };
    const reviews = loadReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    res.status(201).json({
      success: true,
      message: "Coment\xE1rio enviado com sucesso! Ficar\xE1 vis\xEDvel assim que aprovado pela modera\xE7\xE3o.",
      id: newReview.id
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registar o coment\xE1rio.", details: err.message });
  }
});
app.get("/api/admin/reviews", requireAdminAuth, (req, res) => {
  try {
    const filter = req.query.filter || "all";
    const all = loadReviews();
    const filtered = filter === "all" ? all : all.filter((r) => r.status === filter);
    const stats = {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length
    };
    res.json({ reviews: filtered, stats });
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar coment\xE1rios administrativos.", details: err.message });
  }
});
app.patch("/api/admin/reviews/:id/status", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({ error: "Estado inv\xE1lido. Use approved, rejected ou pending." });
      return;
    }
    const reviews = loadReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Coment\xE1rio n\xE3o encontrado." });
      return;
    }
    reviews[index].status = status;
    saveReviews(reviews);
    res.json({
      success: true,
      message: `Coment\xE1rio ${status === "approved" ? "aprovado e publicado" : "rejeitado"}.`,
      review: reviews[index]
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar estado.", details: err.message });
  }
});
app.delete("/api/admin/reviews/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const reviews = loadReviews();
    const filtered = reviews.filter((r) => r.id !== id);
    if (filtered.length === reviews.length) {
      res.status(404).json({ error: "Coment\xE1rio n\xE3o encontrado." });
      return;
    }
    saveReviews(filtered);
    res.json({ success: true, message: "Coment\xE1rio eliminado definitivamente.", deletedId: id });
  } catch (err) {
    res.status(500).json({ error: "Erro ao eliminar coment\xE1rio.", details: err.message });
  }
});
app.post("/api/admin/verify", (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== "string" || pin.length !== 4) {
      res.status(400).json({ error: "O c\xF3digo deve conter 4 d\xEDgitos." });
      return;
    }
    const settings = loadSettings();
    if (hashPin(pin) === settings.adminPinHash) {
      res.json({ success: true, message: "C\xF3digo verificado com sucesso." });
    } else {
      res.status(401).json({ success: false, error: "C\xF3digo de acesso incorreto." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao verificar c\xF3digo.", details: err.message });
  }
});
app.post("/api/admin/change-pin", requireAdminAuth, (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!newPin || typeof newPin !== "string" || !/^\d{4}$/.test(newPin)) {
      res.status(400).json({ error: "O novo c\xF3digo de acesso deve conter exatamente 4 d\xEDgitos num\xE9ricos." });
      return;
    }
    if (currentPin === newPin) {
      res.status(400).json({ error: "O novo c\xF3digo deve ser diferente do c\xF3digo atual." });
      return;
    }
    const settings = loadSettings();
    settings.adminPinHash = hashPin(newPin);
    saveSettings(settings);
    res.json({ success: true, message: "C\xF3digo de acesso alterado com sucesso para " + newPin + "." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao alterar c\xF3digo.", details: err.message });
  }
});
app.get("/api/products", (_req, res) => {
  try {
    const products = loadDynamicProducts();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter produtos.", details: err.message });
  }
});
app.post("/api/admin/products", requireAdminAuth, (req, res) => {
  try {
    const product = req.body;
    if (!product || !product.id || !product.name) {
      res.status(400).json({ error: "Dados do produto incompletos." });
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
  } catch (err) {
    res.status(500).json({ error: "Erro ao guardar produto.", details: err.message });
  }
});
app.delete("/api/admin/products/:id", requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const products = loadDynamicProducts();
    const filtered = products.filter((p) => p.id !== id);
    saveDynamicProducts(filtered);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: "Erro ao eliminar produto.", details: err.message });
  }
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CF Server] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[CF Server] Falha ao iniciar:", err);
  process.exit(1);
});
