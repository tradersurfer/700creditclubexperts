import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { db } from "./db";
import { users, refreshTokens } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

// ─── bcrypt-compatible password hashing using Node crypto (no external dep) ──
// Uses PBKDF2 with SHA-512, 100k iterations — NIST approved
const ITERATIONS = 100_000;
const KEY_LEN = 64;
const DIGEST = "sha512";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    const crypto = require("crypto");
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err: Error | null, key: Buffer) => {
      if (err) reject(err);
      else resolve(`pbkdf2:${ITERATIONS}:${salt}:${key.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const [, iterations, salt, storedKey] = parts;
  return new Promise((resolve, reject) => {
    const crypto = require("crypto");
    crypto.pbkdf2(password, salt, parseInt(iterations), KEY_LEN, DIGEST, (err: Error | null, key: Buffer) => {
      if (err) reject(err);
      else {
        try {
          const a = Buffer.from(storedKey, "hex");
          const b = key;
          resolve(a.length === b.length && timingSafeEqual(a, b));
        } catch {
          resolve(false);
        }
      }
    });
  });
}

// ─── JWT (HS256 implementation without external library) ─────────────────────
function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
}

export interface JWTPayload {
  sub: string;        // user id
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;        // unique token id
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp" | "jti">, expiresInSeconds = 900): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    jti: randomBytes(16).toString("hex"),
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expectedSig = createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(body));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// ─── Refresh Tokens ───────────────────────────────────────────────────────────
export async function createRefreshToken(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return token;
}

export async function rotateRefreshToken(
  oldToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ userId: string; newToken: string } | null> {
  const [existing] = await db
    .select()
    .from(refreshTokens)
    .where(and(
      eq(refreshTokens.token, oldToken),
      gt(refreshTokens.expiresAt, new Date())
    ));

  if (!existing || existing.revokedAt) return null;

  // Revoke old token
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, oldToken));

  // Issue new token
  const newToken = await createRefreshToken(existing.userId, ipAddress, userAgent);
  return { userId: existing.userId, newToken };
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(
      eq(refreshTokens.userId, userId),
    ));
}

// ─── Affiliate Code Generator ─────────────────────────────────────────────────
export function generateAffiliateCode(firstName: string, lastName: string): string {
  const base = `${firstName.substring(0, 3)}${lastName.substring(0, 3)}`.toUpperCase();
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `${base}${suffix}`;
}
