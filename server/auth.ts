import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export type JwtClaims = {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  ver?: number;
};

const ACCESS_COOKIE = "aci_access";
const REFRESH_COOKIE = "aci_refresh";
const CSRF_COOKIE = "aci_csrf";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export function jwtConfig() {
  const secret = String(process.env.JWT_SECRET || "");
  if (secret.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  if (!process.env.JWT_ISSUER) throw new Error("JWT_ISSUER must be set.");
  if (!process.env.JWT_AUDIENCE) throw new Error("JWT_AUDIENCE must be set.");
  return {
    secret,
    issuer: String(process.env.JWT_ISSUER),
    audience: String(process.env.JWT_AUDIENCE)
  };
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const constantTimeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export function signAccessToken(input: { sub: string; version?: number }, nowSeconds = Math.floor(Date.now() / 1000)) {
  const config = jwtConfig();
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: JwtClaims = {
    sub: input.sub,
    jti: crypto.randomUUID(),
    iat: nowSeconds,
    exp: nowSeconds + ACCESS_TTL_SECONDS,
    iss: config.issuer,
    aud: config.audience,
    ...(input.version === undefined ? {} : { ver: input.version })
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  const body = `${header}.${encodedPayload}`;
  const signature = base64url(crypto.createHmac("sha256", config.secret).update(body).digest());
  return { token: `${body}.${signature}`, claims: payload };
}

export function verifyAccessToken(token: string, nowSeconds = Math.floor(Date.now() / 1000)): JwtClaims {
  const config = jwtConfig();
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed access token.");
  let header: any;
  let claims: JwtClaims;
  try {
    header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    throw new Error("Malformed access token.");
  }
  if (header.alg !== "HS256" || header.typ !== "JWT") throw new Error("Unsupported JWT algorithm.");
  const expected = base64url(crypto.createHmac("sha256", config.secret).update(`${parts[0]}.${parts[1]}`).digest());
  if (!constantTimeEqual(expected, parts[2])) throw new Error("Invalid access token signature.");
  if (!claims.sub || !claims.jti || !claims.iat || !claims.exp || !claims.iss || !claims.aud) throw new Error("Access token claims are incomplete.");
  if (claims.iss !== config.issuer || claims.aud !== config.audience) throw new Error("Invalid access token issuer or audience.");
  if (claims.exp <= nowSeconds || claims.iat > nowSeconds + 60) throw new Error("Access token is expired or not yet valid.");
  return claims;
}

export function newRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function hashPasswordSync(password: string) {
  return bcrypt.hashSync(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export const authCookies = { ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE, ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS };
