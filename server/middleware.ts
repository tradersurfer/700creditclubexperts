import type { Request, Response, NextFunction } from "express";
import { verifyJWT, type JWTPayload } from "./auth";

// Extend Express Request with auth user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// ─── In-memory rate limiter (replace with Redis in production) ────────────────
interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function rateLimit(options: {
  windowMs: number;
  max: number;
  blockDurationMs?: number;
  keyFn?: (req: Request) => string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyFn ? options.keyFn(req) : getClientIp(req);
    const now = Date.now();
    const entry = rateLimitStore.get(key) || { count: 0, windowStart: now };

    // Check if blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("X-RateLimit-Blocked", "true");
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
        retryAfter,
      });
    }

    // Reset window if expired
    if (now - entry.windowStart > options.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
      entry.blockedUntil = undefined;
    }

    entry.count += 1;
    rateLimitStore.set(key, entry);

    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, options.max - entry.count)));

    if (entry.count > options.max) {
      if (options.blockDurationMs) {
        entry.blockedUntil = now + options.blockDurationMs;
        rateLimitStore.set(key, entry);
      }
      return res.status(429).json({ error: "Rate limit exceeded. Please slow down." });
    }

    next();
  };
}

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// ─── Rate Limit Presets ───────────────────────────────────────────────────────
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  blockDurationMs: 30 * 60 * 1000, // 30 min block after exceeding
  keyFn: (req) => `auth:${getClientIp(req)}`,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyFn: (req) => `api:${req.user?.sub || getClientIp(req)}`,
});

export const intakeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyFn: (req) => `intake:${getClientIp(req)}`,
});

// ─── JWT Auth Middleware ───────────────────────────────────────────────────────
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.slice(7);
  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// ─── Security Headers ─────────────────────────────────────────────────────────
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

// ─── CORS ─────────────────────────────────────────────────────────────────────
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    "https://700creditclubexperts.com",
    "https://www.700creditclubexperts.com",
    process.env.FRONTEND_URL,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173", "http://localhost:3000"] : []),
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
}

// ─── Input Sanitizer ──────────────────────────────────────────────────────────
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .trim()
        .substring(0, 2000);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) =>
        typeof v === "string" ? v.replace(/<[^>]*>/g, "").trim().substring(0, 500) : v
      );
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ─── Admin API Key check ──────────────────────────────────────────────────────
export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
