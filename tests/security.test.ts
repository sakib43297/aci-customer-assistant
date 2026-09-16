import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import request from "supertest";
import { signAccessToken, verifyAccessToken } from "../server/auth.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
process.env.JWT_ISSUER = "aci-test";
process.env.JWT_AUDIENCE = "aci-test-web";
process.env.ADMIN_ID = "admin@aci.com";
process.env.ADMIN_PASSWORD = "TestAdminPassword123!";
process.env.DATABASE_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "aci-security-")), "test.sqlite");

const { app } = await import("../server.ts");

test("HS256 JWT includes and validates required claims", () => {
  const issued = signAccessToken({ sub: "user-1", version: 2 }, 1_700_000_000);
  const claims = verifyAccessToken(issued.token, 1_700_000_001);
  assert.equal(claims.sub, "user-1");
  assert.equal(claims.iss, "aci-test");
  assert.equal(claims.aud, "aci-test-web");
  assert.equal(claims.ver, 2);
  assert.ok(claims.jti && claims.iat && claims.exp);
  assert.throws(() => verifyAccessToken(issued.token.replace(/.$/, "x"), 1_700_000_001));
  assert.throws(() => verifyAccessToken(issued.token, 1_700_000_001 + 901));
});

test("public health is minimal and sensitive routes require authentication", async () => {
  const health = await request(app).get("/api/health");
  assert.equal(health.status, 200);
  assert.deepEqual(Object.keys(health.body).sort(), ["service", "status", "timestamp"]);
  assert.equal((await request(app).get("/api/orders")).status, 401);
  assert.equal((await request(app).get("/api/admin/sales")).status, 401);
  assert.equal((await request(app).post("/api/products").send({ name: "x" })).status, 403);
});

test("login issues cookies, CSRF protects mutations, and admin routes reject normal users", async () => {
  const agent = request.agent(app);
  const csrf = await agent.get("/api/auth/csrf");
  assert.equal(csrf.status, 200);
  const login = await agent.post("/api/auth/login").send({ email: "admin@aci.com", password: "TestAdminPassword123!" });
  assert.equal(login.status, 200);
  const cookies = login.headers["set-cookie"];
  assert.match(Array.isArray(cookies) ? cookies.join(";") : String(cookies || ""), /aci_access=/);
  const originalRefresh = (Array.isArray(cookies) ? cookies : []).find(cookie => cookie.startsWith("aci_refresh="))?.split(";")[0];
  assert.ok(originalRefresh);
  assert.equal((await agent.post("/api/auth/refresh").set("X-CSRF-Token", login.body.csrfToken)).status, 200);
  const missingCsrf = await agent.post("/api/orders").send({ items: [] });
  assert.equal(missingCsrf.status, 403);
  const me = await agent.get("/api/auth/me");
  assert.equal(me.status, 200);
  assert.equal(me.body.user.password, undefined);
  assert.equal((await request(app).post("/api/auth/refresh").set("Cookie", [originalRefresh, `aci_csrf=${login.body.csrfToken}`]).set("X-CSRF-Token", login.body.csrfToken)).status, 401);
  assert.equal((await agent.post("/api/auth/logout").set("X-CSRF-Token", login.body.csrfToken)).status, 200);
  assert.equal((await agent.get("/api/auth/me")).status, 401);

  const userAgent = request.agent(app);
  await userAgent.get("/api/auth/csrf");
  const register = await userAgent.post("/api/auth/register").send({ email: "owner@example.com", password: "OwnerPassword123!", name: "Owner" });
  assert.equal(register.status, 201);
  const forbidden = await userAgent.get("/api/admin/sales");
  assert.equal(forbidden.status, 403);
  const ownOrder = await userAgent.post("/api/orders").set("X-CSRF-Token", register.body.csrfToken).send({ items: [{ productId: "ph-005", quantity: 1 }], customerEmail: "attacker@example.com", customerName: "Attacker" });
  assert.equal(ownOrder.status, 201);
  assert.equal(ownOrder.body.order.customerEmail, "owner@example.com");
  const orders = await userAgent.get("/api/orders");
  assert.equal(orders.status, 200);
  assert.ok(orders.body.data.every((order: any) => order.customerEmail === "owner@example.com"));
});

test("metrics endpoint is available without a metrics token and Prometheus targets only the app", async () => {
  const metrics = await request(app).get("/metrics");
  assert.equal(metrics.status, 200);
  assert.match(metrics.text, /aci_http_requests_total/);
  const prometheus = fs.readFileSync(path.join(process.cwd(), "monitoring/prometheus.yml"), "utf8");
  assert.match(prometheus, /targets: \[app:8080\]/);
  assert.doesNotMatch(prometheus, /prometheus:9090/);
});
