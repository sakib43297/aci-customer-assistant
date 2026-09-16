import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "node:crypto";
import { Counter, Registry, collectDefaultMetrics } from "prom-client";
import {
  authCookies, hashPassword, hashRefreshToken, newRefreshToken, signAccessToken, verifyAccessToken, verifyPassword, jwtConfig
} from "./server/auth.js";
import { ACI_PRODUCTS } from "./src/data/products.js"; // Note: we'll use standard import, TypeScript handles it
import {
  getSetting, setSetting, findUser, toPublicUser, createUser, getUserByUid, createRefreshToken, findRefreshToken,
  rotateRefreshToken, revokeRefreshFamily, revokeToken, isTokenRevoked, updateUserPassword, revokeAllUserTokens,
  listProducts, getProduct, saveProduct, removeProduct, listCategories, saveCategory, removeCategory,
  listOrders, getOrder, saveOrder, getSalesSummary, getSalesHistory, getForecastContext, sqlite, DB_PATH
} from "./server/db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

type RequestWithAuth = express.Request & { auth?: { user: any; claims: ReturnType<typeof verifyAccessToken> } };
const readCookies = (req: express.Request) => Object.fromEntries(String(req.headers.cookie || "").split(";").filter(Boolean).map(pair => {
  const index = pair.indexOf("=");
  return [pair.slice(0, index).trim(), decodeURIComponent(pair.slice(index + 1).trim())];
}));
const secureCookies = process.env.NODE_ENV === "production";
const cookieOptions = { httpOnly: true, secure: secureCookies, sameSite: "lax" as const, path: "/" };
const csrfOptions = { httpOnly: false, secure: secureCookies, sameSite: "lax" as const, path: "/" };
const issueAuthCookies = (res: express.Response, uid: string, version: number, familyId = crypto.randomUUID()) => {
  const access = signAccessToken({ sub: uid, version });
  const refresh = newRefreshToken();
  createRefreshToken(uid, hashRefreshToken(refresh), familyId, new Date(Date.now() + authCookies.REFRESH_TTL_SECONDS * 1000).toISOString());
  res.cookie(authCookies.ACCESS_COOKIE, access.token, { ...cookieOptions, maxAge: authCookies.ACCESS_TTL_SECONDS * 1000 });
  res.cookie(authCookies.REFRESH_COOKIE, refresh, { ...cookieOptions, maxAge: authCookies.REFRESH_TTL_SECONDS * 1000 });
  return access.claims;
};
const clearAuthCookies = (res: express.Response) => {
  res.clearCookie(authCookies.ACCESS_COOKIE, cookieOptions);
  res.clearCookie(authCookies.REFRESH_COOKIE, cookieOptions);
  res.clearCookie(authCookies.CSRF_COOKIE, csrfOptions);
};

function authenticateRequest(req: RequestWithAuth, res: express.Response, next: express.NextFunction) {
  const access = readCookies(req)[authCookies.ACCESS_COOKIE];
  if (!access) return res.status(401).json({ error: "Authentication is required." });
  try {
    const claims = verifyAccessToken(access);
    const user = getUserByUid(claims.sub);
    if (!user || user.password_status !== "active" || Number(user.token_version || 0) !== Number(claims.ver || 0) || isTokenRevoked(claims.jti)) {
      return res.status(401).json({ error: "Session expired or revoked." });
    }
    req.auth = { user, claims };
    next();
  } catch {
    return res.status(401).json({ error: "Session expired." });
  }
}
function optionalAuthentication(req: RequestWithAuth, _res: express.Response, next: express.NextFunction) {
  const access = readCookies(req)[authCookies.ACCESS_COOKIE];
  if (access) {
    try {
      const claims = verifyAccessToken(access);
      const user = getUserByUid(claims.sub);
      if (user && user.password_status === "active" && Number(user.token_version || 0) === Number(claims.ver || 0) && !isTokenRevoked(claims.jti)) req.auth = { user, claims };
    } catch { /* anonymous guest */ }
  }
  next();
}
function requireAdmin(req: RequestWithAuth, res: express.Response, next?: express.NextFunction): boolean | void {
  if (!req.auth) { res.status(401).json({ error: "Authentication is required." }); return false; }
  if (req.auth.user.role !== "admin") { res.status(403).json({ error: "Administrator access is required." }); return false; }
  if (next) { next(); return; }
  return true;
}
function csrfProtection(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method) || ["/api/auth/login", "/api/auth/register"].includes(req.path)) return next();
  const cookies = readCookies(req);
  const header = String(req.headers["x-csrf-token"] || "");
  const csrfCookie = Buffer.from(cookies[authCookies.CSRF_COOKIE] || "");
  const csrfHeader = Buffer.from(header);
  if (!csrfCookie.length || !csrfHeader.length || csrfCookie.length !== csrfHeader.length || !crypto.timingSafeEqual(csrfCookie, csrfHeader)) {
    return res.status(403).json({ error: "CSRF validation failed." });
  }
  next();
}
app.use(csrfProtection);

const guestCheckoutAttempts = new Map<string, number[]>();
function guestCheckoutRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || "unknown";
  const cutoff = Date.now() - 60_000;
  const attempts = (guestCheckoutAttempts.get(key) || []).filter(value => value > cutoff);
  if (attempts.length >= 5) return res.status(429).json({ error: "Guest checkout rate limit exceeded. Please try again shortly." });
  attempts.push(Date.now());
  guestCheckoutAttempts.set(key, attempts);
  next();
}

const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });
const httpRequests = new Counter({ name: "aci_http_requests_total", help: "Total HTTP requests", labelNames: ["method", "route", "status"], registers: [metricsRegistry] });
app.use((req, res, next) => { res.on("finish", () => httpRequests.inc({ method: req.method, route: req.route?.path || req.path, status: String(res.statusCode) })); next(); });

// Initialize Gemini Client
function getConfiguredGeminiKey() {
  return getSetting('gemini_api_key') || process.env.GEMINI_API_KEY || '';
}

function getGeminiClient(): GoogleGenAI | null {
  const configuredKey = getConfiguredGeminiKey();
  if (!configuredKey) return null;
  return new GoogleGenAI({
    apiKey: configuredKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to find relevant product recommendations from text keywords
function findMatchingProductRecommendations(text: string): { responseText: string; productIds: string[] } {
  const query = text.toLowerCase();
  
  if (query.includes('stomach') || query.includes('gastric') || query.includes('acidity') || query.includes('cramp') || query.includes('heartburn') || query.includes('pet betha') || query.includes('antacid') || (query.includes('pain') && query.includes('medicine'))) {
    return {
      responseText: `For stomach pain and abdominal discomfort, ACI Pharmaceuticals offers proven treatments tailored to your symptoms:\n\n1. **Spasmo-ACI (Tiemonium Methylsulphate 50mg)** — ৳150 BDT: Specialized antispasmodic for rapid relief of acute stomach pain, abdominal cramps, intestinal spasms, and visceral colic.\n2. **Panto-ACI (Pantoprazole 20mg)** — ৳140 BDT: Proton Pump Inhibitor (PPI) providing long-lasting acid suppression for burning stomach pain, gastric ulcers, GERD, and hyperacidity.\n3. **Antacid-ACI Plus Suspension (200ml)** — ৳120 BDT: Fast-acting soothing liquid antacid for immediate relief of burning stomach acid, flatulence, and bloating.\n\n*Note: If your pain is severe, accompanied by high fever, or persists for more than 48 hours, please consult a registered medical practitioner.*\n\nYou can click on the product cards below to view the dedicated product page for each medicine or add them directly to your cart.\n\nWould you like to add this to your cart or place an order?`,
      productIds: ['ph-008', 'ph-009', 'ph-010']
    };
  }

  if (query.includes('fever') || query.includes('headache') || query.includes('body ache') || query.includes('paracetamol')) {
    return {
      responseText: `For fever and pain relief, ACI offers **Fast-ACI (Paracetamol 500mg)** (৳80 BDT / Box of 100). It acts quickly to alleviate headaches, muscular aches, and reduce fever. You can view the product page or add it directly to your cart below!\n\nWould you like to add this to your cart or place an order?`,
      productIds: ['ph-005']
    };
  }

  if (query.includes('savlon') || query.includes('antiseptic') || query.includes('wound') || query.includes('germ') || query.includes('handwash')) {
    return {
      responseText: `ACI Consumer Brands offers Bangladesh's leading antiseptic protection:\n- **Savlon Antiseptic Liquid (500ml)** (৳195 BDT): Superior germ defense for first aid, wound cleaning, and personal hygiene.\n- **Savlon Antiseptic Cream (30g)** (৳65 BDT): Soothing healing cream for minor cuts, scrapes, and insect bites.\n- **Savlon Ocean Blue Handwash (250ml)** (৳110 BDT): Gentle antibacterial handwash.\n\nWould you like to add this to your cart or place an order?`,
      productIds: ['cb-001', 'cb-002', 'cb-004']
    };
  }

  if (query.includes('fertilizer') || query.includes('seed') || query.includes('maize') || query.includes('rice') || query.includes('tractor') || query.includes('harvest')) {
    return {
      responseText: `ACI Agribusiness provides high-yield agricultural inputs across Bangladesh:\n- **Alonkar Hybrid Rice Seeds (2kg)** (৳450 BDT): High-yield, disease-resistant grain.\n- **ACI Maize-Mix Micronutrient Fertilizer (5kg)** (৳380 BDT): Balanced nutrients for accelerated cob growth.\n- **Sonalika DI-42 RX 4WD Tractor** (৳1,150,000 BDT): High-torque workhorse for heavy farming.\n\nWould you like to add this to your cart or place an order?`,
      productIds: ['ag-001', 'ag-002', 'ag-005']
    };
  }

  return {
    responseText: `Welcome to ACI Customer Assistant! We offer comprehensive portfolios across Pharmaceuticals & Healthcare (medicines, antispasmodics, antibiotics, IV fluids), Consumer Brands (Savlon, ACI Pure foods, commodities), Agribusiness (hybrid seeds, fertilizers, machinery), and Shwapno Retail.\n\nTell me what you are looking for (e.g., 'medicine for stomach pain', 'Savlon antiseptic', or 'seeds for rice') and I will suggest the exact matching product with direct product page links!\n\nWould you like to add this to your cart or place an order?`,
    productIds: ['ph-008', 'cb-001', 'cb-101']
  };
}

// 1. API: Chat Assistant Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Identify matching product IDs for the user's intent
    const smartFallback = findMatchingProductRecommendations(message);

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if API key is missing
      return res.json({
        text: smartFallback.responseText,
        productIds: smartFallback.productIds
      });
    }

    // Format chat history for Gemini SDK
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Construct system instruction
    const systemInstruction = `You are the AI Customer Assistant embedded in "ACI Customer Assistant" — the unified product ordering platform for ACI PLC Bangladesh.
Your task is to guide and assist users in discovering products and placing orders across all four business divisions of ACI:

1. PHARMACEUTICALS: 
   - Gastrointestinal & Stomach Pain: Spasmo-ACI (Tiemonium Methylsulphate 50mg) for acute stomach pain, visceral cramps and colic; Panto-ACI (Pantoprazole 20mg) and Omep-ACI (Omeprazole 20mg) for gastric ulcers, acidity and burning sensation; Antacid-ACI Plus Suspension for instant relief of acid heartburn and gas.
   - OTC & Analgesics: Fast-ACI (Paracetamol 500mg) for fever, headaches and mild pain.
   - Antibiotics: Amox-ACI (Amoxicillin 500mg).
   - Cardiovascular & Anti-Diabetics: Atorva-ACI (Atorvastatin 10mg), Glis-ACI (Gliclazide 80mg).
   - Intravenous Fluids & Respiratory: Salu-ACI (Normal Saline 0.9%), Respi-ACI (Salbutamol Inhaler).
   - Biosimilars: Epo-ACI (Biosimilar Erythropoietin 4000 IU).

2. CONSUMER BRANDS & FOODS:
   - Home & Personal Care: Savlon Antiseptic Liquid, Savlon Antiseptic Cream, Savlon Active Soap, Savlon Ocean Blue Handwash, Savlon Hand Sanitizer, ACI Aerosol (mosquito killer), Angelic Air Fresheners, Colgate Strong Teeth.
   - Foods & Commodities: ACI Pure Atta, Maida, Suji, Miniket Rice, Edible Soyabean Oil, Iodized Salt, Pure Spices (Turmeric, Chili powder), ACI Fun Chanachur, Sunquick Fruit Squash.
   - Plastics & Electronics: ACI Premio plasticware, LED lamps, smart accessories.

3. AGRIBUSINESS: 
   - Crop Protection: ACI Chlorpyrifos 20 EC insecticide, ACI Carbendazim 50 WP fungicide.
   - Seeds: Alonkar Hybrid Rice Seeds, Don Hybrid Maize Seeds.
   - Fertilizers: ACI Maize-Mix Balanced Fertilizer.
   - Farm Machinery: Yanmar Combine Harvester, Sonalika DI-42 RX Tractor.
   - Livestock & Feeds: ACI Broiler Starter Feed, Aqua fish feed, animal vaccines.
   - Motors: Yamaha FZS-FI V3 motorcycle and genuine spare parts.

4. RETAIL & LOGISTICS (SHWAPNO):
   - Fresh farm produce (potatoes, onions, organic sagor bananas), daily groceries (Chinigura aromatic rice, cow ghee), lifestyle goods across 450+ retail outlets.

Here is the EXACT list of available products in our catalog:
${JSON.stringify(ACI_PRODUCTS, null, 2)}

SPECIAL DIRECTIVES FOR MEDICAL & HEALTH QUERIES (E.G. STOMACH PAIN, FEVER):
- When a user asks about STOMACH PAIN, abdominal cramps, gastric pain, heartburn, or acidity:
  1. Clearly recommend the exact ACI medicines:
     - **Spasmo-ACI (Tiemonium Methylsulphate 50mg)**: Best for acute visceral stomach pain, abdominal cramps, gastrointestinal spasms, and intestinal colic.
     - **Panto-ACI (Pantoprazole 20mg)**: Best for stomach pain caused by hyperacidity, gastric/peptic ulcers, acid reflux (GERD), and burning sensation.
     - **Antacid-ACI Plus Suspension**: Best for instant liquid soothing of acid heartburn, indigestion, and gas bloating.
  2. State that the user can click on the suggested product link or interactive product card below to view the full product page with detailed indications, dosage guidelines, price, and add it directly to their cart.
  3. Include a responsible clinical care advisory: "For severe, acute pain or pain persisting more than 48 hours, please consult a registered physician or doctor."
  4. Always end your suggestion with: "Would you like to add this to your cart or place an order?"

SPECIAL DIRECTIVES FOR PRODUCT DISCOVERY & LINKS:
- Whenever you recommend a product, format its exact title clearly (e.g., **Spasmo-ACI (Tiemonium Methylsulphate 50mg)**, **Panto-ACI (Pantoprazole 20mg)**, **Savlon Antiseptic Liquid**).
- Inform the customer they can click the product card below to view its complete product page and details.
- End every product recommendation with: "Would you like to add this to your cart or place an order?"

TONE & MANDATORY RULES:
1. Always respond in the language the user writes in (Bangla or English). If the user asks in Bangla, reply in Bangla.
2. Never recommend non-ACI products or external brands.
3. Keep responses concise, clear, and empathetic.
4. End every product suggestion with exactly this phrase (or Bangla equivalent): "Would you like to add this to your cart or place an order?"`;

    // Make the API call to Gemini 3.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    const responseText = response.text || smartFallback.responseText;
    
    // Detect which products were mentioned or relevant
    const mentionedIds: string[] = [];
    ACI_PRODUCTS.forEach(p => {
      const baseName = p.name.split('(')[0].trim().toLowerCase();
      if (
        responseText.toLowerCase().includes(baseName) ||
        responseText.toLowerCase().includes(p.name.toLowerCase()) ||
        smartFallback.productIds.includes(p.id)
      ) {
        if (!mentionedIds.includes(p.id)) {
          mentionedIds.push(p.id);
        }
      }
    });

    res.json({ 
      text: responseText,
      productIds: mentionedIds.length > 0 ? mentionedIds : smartFallback.productIds
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // On error, gracefully fall back to local smart match
    const smartFallback = findMatchingProductRecommendations(req.body?.message || "");
    res.json({ 
      text: smartFallback.responseText,
      productIds: smartFallback.productIds,
      isFallback: true
    });
  }
});

// 2. API: Voice Search Transcription & Extraction Endpoint
app.post("/api/voice-search", async (req, res) => {
  try {
    const { audio, mimeType } = req.body;
    if (!audio) {
      return res.status(400).json({ error: "Audio data (base64 string) is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Offline fallback: returns mock or placeholder
      return res.json({
        text: "Savlon",
        fallback: true,
        message: "Gemini voice search is in offline demo mode."
      });
    }

    // Prepare audio part for Gemini
    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: audio,
      }
    };

    const textPart = {
      text: `You are a voice search transcription assistant for ACI Customer Assistant (Bangladesh).
Listen to the user's audio input. It may contain speech in English, Bangla, or a mix of both (e.g., 'Savlon liquid', 'paracetamol details', 'seeds for rice', 'আলংকার ধান', 'শপ্ন').
Your task is to transcribe what ACI product, category, or division they are looking for and output ONLY the clean, search-friendly query/keywords.
Do not include any punctuation, conversational replies, introductory phrases, or filler text.
If they say 'I want to buy Savlon handwash', output 'Savlon Handwash'.
If they say 'আমাকে কিছু প্যারাসিটামল দিন', output 'Paracetamol'.
If they say 'Shwapno outlet', output 'Shwapno'.
If the audio is empty, silent, or has only noise, output 'empty_audio'.
Output ONLY the transcribed query.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: {
        parts: [audioPart, textPart]
      }
    });

    const resultText = response.text ? response.text.trim() : "";
    console.log("Voice search transcription result:", resultText);

    res.json({ text: resultText });
  } catch (error: any) {
    console.error("Gemini Voice Search API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error in voice search." });
  }
});

// Health and Diagnostic Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ACI Customer Assistant", timestamp: new Date().toISOString() });
});

app.get("/api/system/status", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req as RequestWithAuth, res)) return;
  res.json({
    status: "operational",
    backendVersion: "2.4.0",
    geminiAiReady: Boolean(getConfiguredGeminiKey()),
    cloudDatabase: false,
    serverTime: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`,
    database: `SQLite (${DB_PATH})`,
    authProvider: "HS256 JWT access cookies with rotating refresh cookies",
    activeServices: [
      "Gemini 3.5 Flash Natural Language Chat",
      "Gemini Voice Search Speech Recognition",
      "Express RESTful Product Catalog Engine",
      "Realtime Orders & Route Tracking Pipeline",
      "Role-Based Authentication Engine"
    ]
  });
});

// Products REST API
app.get("/api/products", (req, res) => {
  const { division, search, category } = req.query;
  let results = listProducts();
  if (division && division !== 'ALL') {
    results = results.filter(p => p.division === division);
  }
  if (category && category !== 'ALL') {
    results = results.filter(p => p.category?.toLowerCase() === String(category).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, count: results.length, data: results });
});

app.post("/api/products", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.price || !newProduct.division) {
    return res.status(400).json({ error: "Name, price, and division are required" });
  }
  const id = newProduct.id || `ACI-PROD-${Date.now()}`;
  const productWithId = saveProduct({ ...newProduct, id });
  res.status(201).json({ success: true, product: productWithId });
});

app.put("/api/products/:id", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  const existing = getProduct(id);
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json({ success: true, product: saveProduct({ ...existing, ...req.body, id }) });
});

app.delete("/api/products/:id", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  if (!removeProduct(id)) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json({ success: true, message: `Product ${id} deleted successfully` });
});

// Categories REST API
app.get("/api/categories", (req, res) => {
  res.json({ success: true, data: listCategories() });
});

app.post("/api/categories", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const newCat = req.body;
  if (!newCat.name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  const categoryWithId = {
    id: newCat.id || `cat-${Date.now()}`,
    name: newCat.name,
    division: newCat.division || 'CONSUMER BRANDS & FOODS',
    subcategories: newCat.subcategories || []
  };
  saveCategory(categoryWithId);
  res.status(201).json({ success: true, category: categoryWithId });
});

app.delete("/api/categories/:id", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  removeCategory(id);
  res.json({ success: true, message: "Category removed" });
});

// Orders REST API
app.get("/api/orders", authenticateRequest, (req: RequestWithAuth, res) => {
  const viewer = req.auth!.user;

  const requestedEmail = String(req.query.userEmail || '').trim().toLowerCase();
  if (viewer.role !== 'admin' && requestedEmail && requestedEmail !== viewer.email.toLowerCase()) {
    return res.status(403).json({ error: "You can only view your own orders." });
  }

  const results = viewer.role === 'admin'
    ? listOrders(requestedEmail || undefined)
    : listOrders(viewer.email);
  res.json({ success: true, count: results.length, data: results });
});

app.post("/api/orders", optionalAuthentication, (req: RequestWithAuth, res) => {
  const viewer = req.auth?.user;
  if (!viewer) {
    guestCheckoutRateLimit(req, res, () => undefined);
    if (res.headersSent) return;
    const guestEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
    const guestName = String(req.body?.customerName || "").trim();
    if (!guestEmail || !guestName) return res.status(400).json({ error: "Guest checkout requires customer name and email." });
  }
  const order = req.body;
  if (!order.items || !order.items.length) {
    return res.status(400).json({ error: "Order must contain at least one item" });
  }
  const orderId = order.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const savedOrder = {
    ...order,
    id: orderId,
    customerEmail: viewer ? viewer.email : String(order.customerEmail).trim().toLowerCase(),
    customerName: viewer ? viewer.display_name : String(order.customerName).trim(),
    retailerName: viewer ? viewer.display_name : String(order.retailerName || order.customerName).trim(),
    businessName: viewer ? viewer.business_name : String(order.businessName || "Guest checkout").trim(),
    businessType: viewer ? viewer.business_type : String(order.businessType || "general").trim(),
    createdAt: order.createdAt || new Date().toISOString(),
    status: order.status || 'Pending'
  };
  const persistedOrder = saveOrder(savedOrder);
  res.status(201).json({ success: true, order: persistedOrder });
});

app.patch("/api/orders/:id/status", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;

  const { id } = req.params;
  const { status, note } = req.body;
  const order = getOrder(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  order.status = status;
  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({
    status,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    note: note || `Status updated to ${status}`
  });
  res.json({ success: true, order: saveOrder(order) });
});

// Admin sales intelligence API. product_sales is an append-style ledger of every
// order line and is rebuilt from product_orders during application startup.
app.get("/api/admin/sales", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const days = Number(req.query.days || 7);
  res.json({
    success: true,
    summary: getSalesSummary(days),
    history: getSalesHistory(1000)
  });
});

app.post("/api/admin/forecast", authenticateRequest, async (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const context = getForecastContext(7);
  const ai = getGeminiClient();
  const averageDailyUnits = context.days ? context.totals.unitsSold / context.days : 0;
  const leadingProducts = context.topProducts.slice(0, 5).map((item: any) => `${item.productName}: ${item.unitsSold} units`).join(', ');

  if (!ai) {
    return res.json({
      success: true,
      model: 'gemini-3.5-flash-lite',
      generatedAt: new Date().toISOString(),
      usedFallback: true,
      context,
      forecast: `Gemini is not configured yet. Based on the last 7 days, average demand is ${averageDailyUnits.toFixed(1)} units per day. Leading products: ${leadingProducts || 'No recorded sales yet'}. Add a Gemini API key from the API Guide to generate a richer forecast.`
    });
  }

  const prompt = `You are the sales forecasting engine for ACI Customer Assistant. Analyze the following SQLite sales context covering the last 7 days and return a concise operational forecast for an administrator. Include: demand outlook for the next 7 days, the top products to replenish, notable risks or data limitations, and three practical actions. Do not invent products or figures. Use BDT and units where relevant.\n\nSales context JSON:\n${JSON.stringify(context)}`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3.5-flash-lite', contents: prompt });
    res.json({
      success: true,
      model: 'gemini-3.5-flash-lite',
      generatedAt: new Date().toISOString(),
      usedFallback: false,
      context,
      forecast: response.text?.trim() || 'Gemini returned no forecast text.'
    });
  } catch (error: any) {
    res.status(502).json({ error: error.message || 'Gemini forecast generation failed.', context });
  }
});

// Local SQLite auth and runtime settings
app.get("/api/auth/csrf", (req, res) => {
  const token = crypto.randomBytes(32).toString("base64url");
  res.cookie(authCookies.CSRF_COOKIE, token, csrfOptions);
  res.json({ csrfToken: token });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = findUser(email);
  if (!user || user.password_status === "reset_required" || !(await verifyPassword(password, user.password))) {
    return res.status(user?.password_status === "reset_required" ? 403 : 401).json({ error: user?.password_status === "reset_required" ? "Administrator-controlled password reset is required for this account." : "Invalid email or password." });
  }
  const claims = issueAuthCookies(res, user.uid, Number(user.token_version || 0));
  const csrfToken = crypto.randomBytes(32).toString("base64url");
  res.cookie(authCookies.CSRF_COOKIE, csrfToken, csrfOptions);
  res.json({ success: true, expiresAt: new Date(claims.exp * 1000).toISOString(), user: toPublicUser(user), csrfToken });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role, businessName, businessType } = req.body || {};
  if (!email || !password || !name || password.length < 6) return res.status(400).json({ error: 'Name, email and a password of at least 6 characters are required.' });
  if (findUser(email)) return res.status(409).json({ error: 'This email address is already registered.' });
  const user = createUser({ email, passwordHash: await hashPassword(password), displayName: name, role: role === 'admin' ? 'user' : 'user', businessName, businessType });
  const claims = issueAuthCookies(res, user.uid, Number(user.token_version || 0));
  const csrfToken = crypto.randomBytes(32).toString("base64url");
  res.cookie(authCookies.CSRF_COOKIE, csrfToken, csrfOptions);
  res.status(201).json({ success: true, expiresAt: new Date(claims.exp * 1000).toISOString(), user: toPublicUser(user), csrfToken });
});

app.post("/api/auth/refresh", (req, res) => {
  const refresh = readCookies(req)[authCookies.REFRESH_COOKIE];
  const row = refresh ? findRefreshToken(hashRefreshToken(refresh)) : null;
  if (!row) { clearAuthCookies(res); return res.status(401).json({ error: "Refresh session expired." }); }
  if (row.revoked_at || row.used_at || new Date(row.expires_at).getTime() <= Date.now()) {
    revokeRefreshFamily(row.family_id);
    clearAuthCookies(res);
    return res.status(401).json({ error: "Refresh token reuse or expiry detected. Sign in again." });
  }
  const user = getUserByUid(row.uid);
  if (!user || user.password_status !== "active") { revokeRefreshFamily(row.family_id); clearAuthCookies(res); return res.status(401).json({ error: "Account is revoked." }); }
  const newRefresh = newRefreshToken();
  rotateRefreshToken(row.id, row.uid, row.family_id, row.token_hash, hashRefreshToken(newRefresh), new Date(Date.now() + authCookies.REFRESH_TTL_SECONDS * 1000).toISOString());
  const access = signAccessToken({ sub: user.uid, version: Number(user.token_version || 0) });
  res.cookie(authCookies.ACCESS_COOKIE, access.token, { ...cookieOptions, maxAge: authCookies.ACCESS_TTL_SECONDS * 1000 });
  res.cookie(authCookies.REFRESH_COOKIE, newRefresh, { ...cookieOptions, maxAge: authCookies.REFRESH_TTL_SECONDS * 1000 });
  res.json({ success: true, expiresAt: new Date(access.claims.exp * 1000).toISOString(), user: toPublicUser(user) });
});

app.get("/api/auth/me", authenticateRequest, (req: RequestWithAuth, res) => {
  res.json({ success: true, user: toPublicUser(req.auth!.user) });
});

app.post("/api/auth/logout", optionalAuthentication, (req: RequestWithAuth, res) => {
  const cookies = readCookies(req);
  if (req.auth) revokeToken(req.auth.claims.jti, req.auth.user.uid, req.auth.claims.exp);
  const refreshRow = cookies[authCookies.REFRESH_COOKIE] ? findRefreshToken(hashRefreshToken(cookies[authCookies.REFRESH_COOKIE])) : null;
  if (refreshRow) revokeRefreshFamily(refreshRow.family_id);
  clearAuthCookies(res);
  res.json({ success: true });
});

app.post("/api/auth/password", authenticateRequest, async (req: RequestWithAuth, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (newPassword.length < 12) return res.status(400).json({ error: "New password must be at least 12 characters." });
  if (!(await verifyPassword(currentPassword, req.auth!.user.password))) return res.status(401).json({ error: "Current password is incorrect." });
  updateUserPassword(req.auth!.user.uid, await hashPassword(newPassword));
  clearAuthCookies(res);
  res.json({ success: true, message: "Password changed. Please sign in again." });
});

app.post("/api/admin/users/:uid/password", authenticateRequest, async (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const password = String(req.body?.password || "");
  const target = getUserByUid(req.params.uid);
  if (!target) return res.status(404).json({ error: "User not found." });
  if (password.length < 12) return res.status(400).json({ error: "Password must be at least 12 characters." });
  updateUserPassword(target.uid, await hashPassword(password));
  res.json({ success: true, user: toPublicUser(getUserByUid(target.uid)) });
});

app.patch("/api/admin/users/:uid/role", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const role = String(req.body?.role || "user");
  if (!["admin", "user"].includes(role)) return res.status(400).json({ error: "Invalid role." });
  const target = getUserByUid(req.params.uid);
  if (!target) return res.status(404).json({ error: "User not found." });
  sqlite.prepare("UPDATE product_users SET role = ?, token_version = token_version + 1, updated_at = ? WHERE uid = ?").run(role, new Date().toISOString(), target.uid);
  revokeAllUserTokens(target.uid);
  res.json({ success: true, user: toPublicUser(getUserByUid(target.uid)) });
});

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

app.post("/api/seed-demo-accounts", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ success: true, count: 6, database: DB_PATH });
});

app.get("/api/settings/gemini", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ configured: Boolean(getConfiguredGeminiKey()), source: getSetting('gemini_api_key') ? 'sqlite' : (process.env.GEMINI_API_KEY ? 'env' : 'none') });
});
app.put("/api/settings/gemini", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  const key = String(req.body?.apiKey || '').trim();
  if (key && key.length < 20) return res.status(400).json({ error: 'Please enter a valid Google AI Studio API key.' });
  setSetting('gemini_api_key', key);
  res.json({ success: true, configured: Boolean(key || process.env.GEMINI_API_KEY) });
});

// API Key Guide documentation endpoint
app.get("/api/guide/api-keys", authenticateRequest, (req: RequestWithAuth, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({
    title: "ACI Customer Assistant - Gemini API Key Guide",
    lastUpdated: "2026-09-14",
    summary: "This guide explains how to configure Gemini AI features securely.",
    keys: [
      {
        name: "GEMINI_API_KEY",
        type: "Secret (Server-Side Only)",
        configured: Boolean(getConfiguredGeminiKey()),
        purpose: "Powers Gemini 3.5 Flash for the natural language order assistant, voice transcription, and order quantity recommendation.",
        obtainedFrom: "Google AI Studio (https://aistudio.google.com/app/apikey)",
        securityRule: "Keep your API key private and do not share it publicly."
      }
    ]
  });
});

// Setup Vite middleware for development or serve build output for production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}; expose it through the private Docker network.`);
  });
};

if (process.env.NODE_ENV !== "test") {
  try {
    jwtConfig();
    startServer().catch((err) => console.error("Failed to start server:", err));
  } catch (err) {
    console.error("Refusing to start without secure JWT configuration:", err);
    process.exitCode = 1;
  }
}

export { app, startServer };
