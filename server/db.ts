import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { ACI_PRODUCTS } from "../src/data/products.js";
import { INITIAL_CATEGORIES } from "../src/data/initialCategories.js";
import { DEMO_ACCOUNTS } from "../src/services/demoAccounts.js";
import crypto from "node:crypto";
import { hashPasswordSync } from "./auth.js";

function loadLocalEnv() {
  const envFile = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadLocalEnv();

function resolveDatabasePath() {
  if (process.env.DATABASE_PATH) return path.resolve(process.env.DATABASE_PATH);
  return path.resolve(process.cwd(), "aci-platform.sqlite");
}

export const DB_PATH = resolveDatabasePath();
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
export const sqlite = new DatabaseSync(DB_PATH);
const SETTINGS_APP = "customer-assistant";
sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS product_users (
    uid TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
    role TEXT NOT NULL, business_name TEXT, business_type TEXT, location TEXT,
    phone TEXT, password TEXT NOT NULL, password_status TEXT NOT NULL DEFAULT 'active',
    token_version INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS product_products (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS product_categories (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS product_orders (id TEXT PRIMARY KEY, customer_email TEXT, payload TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS product_sales (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    division TEXT,
    category TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_amount REAL NOT NULL,
    customer_email TEXT,
    customer_name TEXT,
    order_status TEXT NOT NULL,
    sold_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(order_id, product_id)
  );
  CREATE TABLE IF NOT EXISTS product_refresh_tokens (
    id TEXT PRIMARY KEY, family_id TEXT NOT NULL, uid TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL, created_at TEXT NOT NULL, used_at TEXT, revoked_at TEXT
  );
  CREATE TABLE IF NOT EXISTS product_revoked_tokens (jti TEXT PRIMARY KEY, uid TEXT NOT NULL, expires_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS app_settings (app TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (app, key));
  CREATE INDEX IF NOT EXISTS idx_product_sales_sold_at ON product_sales(sold_at);
  CREATE INDEX IF NOT EXISTS idx_product_sales_product_id ON product_sales(product_id);
`);

// Invalidate and remove opaque sessions from pre-JWT releases. Only the
// signed access cookie and hashed refresh-token records are valid now.
sqlite.exec("DROP TABLE IF EXISTS product_sessions;");

function addColumnIfMissing(table: string, column: string, definition: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as any[];
  if (!columns.some(item => item.name === column)) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
addColumnIfMissing("product_users", "password_status", "TEXT NOT NULL DEFAULT 'active'");
addColumnIfMissing("product_users", "token_version", "INTEGER NOT NULL DEFAULT 0");

// Keep settings isolated under this application's identity when upgrading a copied database.
sqlite.exec(`
  INSERT OR REPLACE INTO app_settings (app, key, value, updated_at)
  SELECT '${SETTINGS_APP}', key, value, updated_at
  FROM app_settings
  WHERE app <> '${SETTINGS_APP}' AND key = 'gemini_api_key';
  DELETE FROM app_settings WHERE app <> '${SETTINGS_APP}' AND key = 'gemini_api_key';
`);

const now = () => new Date().toISOString();
const parsePayload = (row: any) => row ? JSON.parse(row.payload) : null;

export function getSetting(key: string) {
  const row = sqlite.prepare("SELECT value FROM app_settings WHERE app = ? AND key = ?").get(SETTINGS_APP, key) as any;
  return row?.value || "";
}

export function setSetting(key: string, value: string) {
  sqlite.prepare(`INSERT INTO app_settings (app, key, value, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(app, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(SETTINGS_APP, key, value, now());
}

export function seedProductDatabase() {
  const timestamp = now();
  const productCount = (sqlite.prepare("SELECT COUNT(*) AS count FROM product_products").get() as any).count;
  if (!productCount) {
    const insert = sqlite.prepare("INSERT INTO product_products (id, payload, updated_at) VALUES (?, ?, ?)");
    for (const product of ACI_PRODUCTS) insert.run(product.id, JSON.stringify(product), timestamp);
  }
  const categoryCount = (sqlite.prepare("SELECT COUNT(*) AS count FROM product_categories").get() as any).count;
  if (!categoryCount) {
    const insert = sqlite.prepare("INSERT INTO product_categories (id, payload, updated_at) VALUES (?, ?, ?)");
    for (const category of INITIAL_CATEGORIES) insert.run(category.id, JSON.stringify(category), timestamp);
  }
  const userCount = (sqlite.prepare("SELECT COUNT(*) AS count FROM product_users").get() as any).count;
  if (!userCount) {
    sqlite.exec("BEGIN IMMEDIATE");
    const insert = sqlite.prepare(`INSERT INTO product_users
      (uid, email, display_name, role, business_name, business_type, location, phone, password, password_status, token_version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`);
    for (const account of DEMO_ACCOUNTS) {
      const isConfiguredAdmin = account.role === "admin" && account.email.toLowerCase() === (process.env.ADMIN_ID || "").toLowerCase();
      const hasPassword = isConfiguredAdmin && Boolean(process.env.ADMIN_PASSWORD);
      const password = hasPassword ? hashPasswordSync(String(process.env.ADMIN_PASSWORD)) : `!reset-required:${crypto.randomUUID()}`;
      insert.run(account.uid, account.email.toLowerCase(), account.displayName, account.role, account.businessName || null,
        account.businessType || null, account.location || null, account.phone || null, password, hasPassword ? "active" : "reset_required", account.createdAt || timestamp, timestamp);
    }
    sqlite.exec("COMMIT");
  }
  const configuredAdminId = (process.env.ADMIN_ID || "").trim().toLowerCase();
  if (configuredAdminId) {
    const configuredAdmin = sqlite.prepare("SELECT uid FROM product_users WHERE role = 'admin' AND LOWER(email) = ? LIMIT 1").get(configuredAdminId) as any;
    const adminToConfigure = configuredAdmin || sqlite.prepare("SELECT uid FROM product_users WHERE role = 'admin' ORDER BY uid LIMIT 1").get() as any;
    if (adminToConfigure?.uid) {
      if (!process.env.ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD must be set to configure the administrator account.");
      sqlite.prepare("UPDATE product_users SET email = ?, password = ?, password_status = 'active', token_version = token_version + 1, updated_at = ? WHERE uid = ?")
        .run(configuredAdminId, hashPasswordSync(String(process.env.ADMIN_PASSWORD)), timestamp, adminToConfigure.uid);
    }
  }
  migratePlaintextPasswords();
  console.log(`[Product DB] SQLite ready at ${DB_PATH}`);
}

function migratePlaintextPasswords() {
  const rows = sqlite.prepare("SELECT uid, password FROM product_users WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%' AND password NOT LIKE '$2y$%'").all() as any[];
  if (!rows.length) return;
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    const update = sqlite.prepare("UPDATE product_users SET password = ?, password_status = ?, updated_at = ? WHERE uid = ?");
    for (const row of rows) {
      const isResetSentinel = String(row.password).startsWith("!reset-required:");
      update.run(isResetSentinel ? row.password : hashPasswordSync(String(row.password)), isResetSentinel ? "reset_required" : "active", now(), row.uid);
    }
    sqlite.exec("COMMIT");
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}

export function toPublicUser(row: any) {
  if (!row) return null;
  return {
    uid: row.uid, email: row.email, displayName: row.display_name, role: row.role,
    businessName: row.business_name || undefined, businessType: row.business_type || undefined,
    location: row.location || undefined, phone: row.phone || undefined, createdAt: row.created_at
  };
}

export function findUser(identifier: string) {
  const value = identifier.trim().toLowerCase();
  const row = sqlite.prepare("SELECT * FROM product_users WHERE LOWER(email) = ? OR LOWER(uid) = ? LIMIT 1").get(value, value) as any;
  return row || null;
}

export function createUser(input: { email: string; passwordHash: string; displayName: string; role?: string; businessName?: string; businessType?: string }) {
  const timestamp = now();
  const uid = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sqlite.prepare(`INSERT INTO product_users
    (uid, email, display_name, role, business_name, business_type, location, phone, password, password_status, token_version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?)
    `).run(uid, input.email.trim().toLowerCase(), input.displayName.trim(), input.role || "user",
      input.businessName || null, input.businessType || "general", "Dhaka, Bangladesh", "", input.passwordHash, timestamp, timestamp);
  return sqlite.prepare("SELECT * FROM product_users WHERE uid = ?").get(uid) as any;
}

export function getUserByUid(uid: string) { return sqlite.prepare("SELECT * FROM product_users WHERE uid = ?").get(uid) as any || null; }
export function revokeToken(jti: string, uid: string, expiresAt: number) {
  sqlite.prepare("INSERT OR REPLACE INTO product_revoked_tokens (jti, uid, expires_at) VALUES (?, ?, ?)").run(jti, uid, new Date(expiresAt * 1000).toISOString());
}
export function isTokenRevoked(jti: string) { return Boolean(sqlite.prepare("SELECT 1 FROM product_revoked_tokens WHERE jti = ? AND expires_at > ?").get(jti, now())); }
export function createRefreshToken(uid: string, tokenHash: string, familyId: string, expiresAt: string) {
  sqlite.prepare("INSERT INTO product_refresh_tokens (id, family_id, uid, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), familyId, uid, tokenHash, expiresAt, now());
}
export function findRefreshToken(tokenHash: string) { return sqlite.prepare("SELECT * FROM product_refresh_tokens WHERE token_hash = ?").get(tokenHash) as any || null; }
export function rotateRefreshToken(id: string, uid: string, oldFamilyId: string, oldTokenHash: string, newTokenHash: string, expiresAt: string) {
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    sqlite.prepare("UPDATE product_refresh_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL").run(now(), id);
    sqlite.prepare("INSERT INTO product_refresh_tokens (id, family_id, uid, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), oldFamilyId, uid, newTokenHash, expiresAt, now());
    sqlite.exec("COMMIT");
  } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
}
export function revokeRefreshFamily(familyId: string) { sqlite.prepare("UPDATE product_refresh_tokens SET revoked_at = COALESCE(revoked_at, ?) WHERE family_id = ?").run(now(), familyId); }
export function revokeAllUserTokens(uid: string) {
  sqlite.prepare("UPDATE product_users SET token_version = token_version + 1, updated_at = ? WHERE uid = ?").run(now(), uid);
  sqlite.prepare("UPDATE product_refresh_tokens SET revoked_at = COALESCE(revoked_at, ?) WHERE uid = ?").run(now(), uid);
}
export function updateUserPassword(uid: string, passwordHash: string) {
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    sqlite.prepare("UPDATE product_users SET password = ?, password_status = 'active', token_version = token_version + 1, updated_at = ? WHERE uid = ?").run(passwordHash, now(), uid);
    sqlite.prepare("UPDATE product_refresh_tokens SET revoked_at = COALESCE(revoked_at, ?) WHERE uid = ?").run(now(), uid);
    sqlite.exec("COMMIT");
  } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
}

export function listProducts() { return (sqlite.prepare("SELECT payload FROM product_products ORDER BY id").all() as any[]).map(parsePayload); }
export function getProduct(id: string) { return parsePayload(sqlite.prepare("SELECT payload FROM product_products WHERE id = ?").get(id)); }
export function saveProduct(product: any) {
  sqlite.prepare(`INSERT INTO product_products (id, payload, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).run(product.id, JSON.stringify(product), now());
  return getProduct(product.id);
}
export function removeProduct(id: string) { const result = sqlite.prepare("DELETE FROM product_products WHERE id = ?").run(id); return Number(result.changes) > 0; }
export function listCategories() { return (sqlite.prepare("SELECT payload FROM product_categories ORDER BY id").all() as any[]).map(parsePayload); }
export function saveCategory(category: any) {
  sqlite.prepare(`INSERT INTO product_categories (id, payload, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).run(category.id, JSON.stringify(category), now());
  return JSON.parse((sqlite.prepare("SELECT payload FROM product_categories WHERE id = ?").get(category.id) as any).payload);
}
export function removeCategory(id: string) { const result = sqlite.prepare("DELETE FROM product_categories WHERE id = ?").run(id); return Number(result.changes) > 0; }
export function listOrders(email?: string) {
  const rows = email ? sqlite.prepare("SELECT payload FROM product_orders WHERE customer_email = ? ORDER BY created_at DESC").all(email) : sqlite.prepare("SELECT payload FROM product_orders ORDER BY created_at DESC").all();
  return (rows as any[]).map(parsePayload);
}

function getOrderItems(order: any) {
  return Array.isArray(order?.items) ? order.items.map((item: any) => {
    const product = item?.product || item || {};
    const quantity = Math.max(1, Number(item?.quantity || product.quantity || 1));
    const unitPrice = Number(item?.unitPrice ?? product.discountPrice ?? product.price ?? 0);
    return {
      productId: String(product.id || item?.productId || 'unknown-product'),
      productName: String(product.name || item?.productName || 'Unknown product'),
      division: product.division || null,
      category: product.category || null,
      quantity,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0
    };
  }) : [];
}

export function recordSalesForOrder(order: any) {
  const items = getOrderItems(order);
  if (!order?.id || items.length === 0) return;
  const timestamp = now();
  const soldAt = order.createdAt || timestamp;
  const upsert = sqlite.prepare(`INSERT INTO product_sales
    (id, order_id, product_id, product_name, division, category, quantity, unit_price, total_amount,
     customer_email, customer_name, order_status, sold_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(order_id, product_id) DO UPDATE SET
      product_name = excluded.product_name,
      division = excluded.division,
      category = excluded.category,
      quantity = excluded.quantity,
      unit_price = excluded.unit_price,
      total_amount = excluded.total_amount,
      customer_email = excluded.customer_email,
      customer_name = excluded.customer_name,
      order_status = excluded.order_status,
      sold_at = excluded.sold_at,
      updated_at = excluded.updated_at`);

  for (const item of items) {
    upsert.run(
      `${order.id}:${item.productId}`,
      order.id,
      item.productId,
      item.productName,
      item.division,
      item.category,
      item.quantity,
      item.unitPrice,
      item.quantity * item.unitPrice,
      order.customerEmail || order.customer_email || null,
      order.customerName || order.retailerName || null,
      order.status || 'Pending',
      soldAt,
      timestamp,
      timestamp
    );
  }
}

export function getSalesSummary(days = 7) {
  const safeDays = Math.min(3650, Math.max(1, Number(days) || 7));
  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const products = sqlite.prepare(`SELECT
      product_id AS productId,
      product_name AS productName,
      division,
      category,
      SUM(quantity) AS unitsSold,
      ROUND(SUM(total_amount), 2) AS revenue,
      COUNT(DISTINCT order_id) AS orderCount,
      MAX(sold_at) AS lastSoldAt
    FROM product_sales
    WHERE sold_at >= ? AND LOWER(order_status) <> 'cancelled'
    GROUP BY product_id, product_name, division, category
    ORDER BY unitsSold DESC, revenue DESC`).all(since) as any[];
  const daily = sqlite.prepare(`SELECT
      substr(sold_at, 1, 10) AS date,
      SUM(quantity) AS unitsSold,
      ROUND(SUM(total_amount), 2) AS revenue,
      COUNT(DISTINCT order_id) AS orderCount
    FROM product_sales
    WHERE sold_at >= ? AND LOWER(order_status) <> 'cancelled'
    GROUP BY substr(sold_at, 1, 10)
    ORDER BY date ASC`).all(since) as any[];
  const totals = products.reduce((result, item) => ({
    unitsSold: result.unitsSold + Number(item.unitsSold || 0),
    revenue: result.revenue + Number(item.revenue || 0)
  }), { unitsSold: 0, revenue: 0 });
  const orderCount = Number((sqlite.prepare(`SELECT COUNT(DISTINCT order_id) AS count FROM product_sales
    WHERE sold_at >= ? AND LOWER(order_status) <> 'cancelled'`).get(since) as any).count || 0);
  return { days: safeDays, since, totals: { ...totals, revenue: Number(totals.revenue.toFixed(2)), orderCount }, products, daily };
}

export function getSalesHistory(limit = 1000) {
  const safeLimit = Math.min(10000, Math.max(1, Number(limit) || 1000));
  return sqlite.prepare(`SELECT
      id, order_id AS orderId, product_id AS productId, product_name AS productName,
      division, category, quantity, unit_price AS unitPrice, total_amount AS totalAmount,
      customer_email AS customerEmail, customer_name AS customerName,
      order_status AS orderStatus, sold_at AS soldAt, created_at AS createdAt, updated_at AS updatedAt
    FROM product_sales ORDER BY sold_at DESC LIMIT ?`).all(safeLimit) as any[];
}

export function getForecastContext(days = 7) {
  const summary = getSalesSummary(days);
  return {
    days: summary.days,
    daily: summary.daily,
    topProducts: summary.products.slice(0, 12),
    totals: summary.totals,
    historyCount: Number((sqlite.prepare('SELECT COUNT(*) AS count FROM product_sales').get() as any).count || 0)
  };
}

export function saveOrder(order: any) {
  const timestamp = now();
  sqlite.prepare(`INSERT INTO product_orders (id, customer_email, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET customer_email = excluded.customer_email, payload = excluded.payload, updated_at = excluded.updated_at`).run(order.id, order.customerEmail || null, JSON.stringify(order), order.createdAt || timestamp, timestamp);
  const persisted = JSON.parse((sqlite.prepare("SELECT payload FROM product_orders WHERE id = ?").get(order.id) as any).payload);
  recordSalesForOrder(persisted);
  return persisted;
}
export function getOrder(id: string) { return parsePayload(sqlite.prepare("SELECT payload FROM product_orders WHERE id = ?").get(id)); }

seedProductDatabase();
for (const existingOrder of listOrders()) recordSalesForOrder(existingOrder);
