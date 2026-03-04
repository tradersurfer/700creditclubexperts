import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, leads, refreshTokens, affiliateReferrals, commissions, auditLog } from "@shared/schema";
import { insertLeadSchema, loginSchema, registerSchema, changePasswordSchema } from "@shared/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { randomBytes } from "crypto";
import {
  hashPassword, verifyPassword, signJWT, verifyJWT,
  createRefreshToken, rotateRefreshToken, revokeAllUserTokens, generateAffiliateCode
} from "./auth";
import {
  requireAuth, requireRole, requireAdminKey,
  authRateLimit, apiRateLimit, intakeRateLimit, securityHeaders, corsMiddleware, sanitizeBody
} from "./middleware";
import { sendAdminNotification, sendClientConfirmation, sendWelcomeEmail, sendPasswordResetEmail } from "./email";
import {
  getCRCClientDashboard, getCRCAffiliateStats, getCRCAffiliateReferrals,
  getMockClientDashboard, getMockAffiliateData
} from "./crc";

function generateTempPassword(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

async function logAudit(userId: string | null, action: string, resource?: string, resourceId?: string, req?: Request) {
  try {
    await db.insert(auditLog).values({
      userId: userId ?? undefined,
      action,
      resource,
      resourceId,
      ipAddress: req ? (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket?.remoteAddress : undefined,
      userAgent: req?.headers["user-agent"],
    });
  } catch { /* non-blocking */ }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Apply global middleware
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(sanitizeBody);

  // ─── Health Check ─────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Auth: Register ───────────────────────────────────────────────────────
  app.post("/api/auth/register", authRateLimit, async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }

    const { email, password, firstName, lastName, phone, affiliateCode: inputAffCode, role } = parsed.data;

    try {
      // Check if email exists
      const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      // Find referring affiliate
      let referredById: string | undefined;
      if (inputAffCode) {
        const [aff] = await db.select().from(users).where(eq(users.affiliateCode, inputAffCode.toUpperCase()));
        if (aff) referredById = aff.id;
      }

      const passwordHash = await hashPassword(password);
      const newAffCode = role === "affiliate" ? generateAffiliateCode(firstName, lastName) : undefined;

      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        passwordHash,
        role,
        firstName,
        lastName,
        phone,
        affiliateCode: newAffCode,
        referredBy: referredById,
      }).returning();

      // Create referral record if referred
      if (referredById) {
        await db.insert(affiliateReferrals).values({
          affiliateId: referredById,
          clientId: newUser.id,
          status: "enrolled",
          enrolledAt: new Date(),
        });
      }

      const accessToken = signJWT({ sub: newUser.id, email: newUser.email, role: newUser.role }, 900);
      const refreshToken = await createRefreshToken(newUser.id, req.headers["x-forwarded-for"] as string, req.headers["user-agent"]);

      await logAudit(newUser.id, "user.register", "users", newUser.id, req);

      sendWelcomeEmail({ name: `${firstName} ${lastName}`, email: newUser.email, role }).catch(() => {});

      return res.status(201).json({
        success: true,
        user: { id: newUser.id, email: newUser.email, role: newUser.role, firstName, lastName },
        accessToken,
        refreshToken,
        affiliateCode: newAffCode,
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ error: "Registration failed. Please try again." });
    }
  });

  // ─── Auth: Login ──────────────────────────────────────────────────────────
  app.post("/api/auth/login", authRateLimit, async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { email, password } = parsed.data;

    try {
      // Also support legacy temp-password login from leads table
      const [lead] = await db.select().from(leads).where(eq(leads.email, email.toLowerCase()));
      if (lead && lead.tempPassword === password) {
        // Upgrade to full user account if not already
        let [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
        if (!existingUser) {
          const passwordHash = await hashPassword(password);
          [existingUser] = await db.insert(users).values({
            email: email.toLowerCase(),
            passwordHash,
            role: "client",
            firstName: lead.name.split(" ")[0],
            lastName: lead.name.split(" ").slice(1).join(" "),
            phone: lead.phone,
          }).returning();
        }

        const accessToken = signJWT({ sub: existingUser.id, email: existingUser.email, role: existingUser.role }, 900);
        const refreshToken = await createRefreshToken(existingUser.id, req.headers["x-forwarded-for"] as string, req.headers["user-agent"]);

        return res.json({
          success: true,
          user: { id: existingUser.id, email: existingUser.email, role: existingUser.role, firstName: existingUser.firstName, lastName: existingUser.lastName },
          accessToken,
          refreshToken,
          isFirstLogin: true,
        });
      }

      // Normal user login
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (!user || !user.isActive) {
        // Consistent timing to prevent enumeration
        await hashPassword("dummy-prevent-timing-attack");
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        await logAudit(user.id, "auth.failed_login", "users", user.id, req);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Update last login
      await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

      const accessToken = signJWT({ sub: user.id, email: user.email, role: user.role }, 900);
      const refreshToken = await createRefreshToken(user.id, req.headers["x-forwarded-for"] as string, req.headers["user-agent"]);

      await logAudit(user.id, "auth.login", "users", user.id, req);

      return res.json({
        success: true,
        user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed. Please try again." });
    }
  });

  // ─── Auth: Refresh Token ──────────────────────────────────────────────────
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    try {
      const result = await rotateRefreshToken(refreshToken, req.headers["x-forwarded-for"] as string, req.headers["user-agent"]);
      if (!result) return res.status(401).json({ error: "Invalid or expired refresh token" });

      const [user] = await db.select().from(users).where(eq(users.id, result.userId));
      if (!user || !user.isActive) return res.status(401).json({ error: "Account not found or disabled" });

      const accessToken = signJWT({ sub: user.id, email: user.email, role: user.role }, 900);

      return res.json({ success: true, accessToken, refreshToken: result.newToken });
    } catch (err) {
      console.error("Refresh error:", err);
      return res.status(500).json({ error: "Token refresh failed" });
    }
  });

  // ─── Auth: Logout ─────────────────────────────────────────────────────────
  app.post("/api/auth/logout", requireAuth, async (req: Request, res: Response) => {
    try {
      await revokeAllUserTokens(req.user!.sub);
      await logAudit(req.user!.sub, "auth.logout", "users", req.user!.sub, req);
      return res.json({ success: true });
    } catch {
      return res.json({ success: true });
    }
  });

  // ─── Auth: Me ─────────────────────────────────────────────────────────────
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        affiliateCode: users.affiliateCode,
        crcClientId: users.crcClientId,
        crcAffiliateId: users.crcAffiliateId,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      }).from(users).where(eq(users.id, req.user!.sub));

      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json({ user });
    } catch {
      return res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ─── Auth: Change Password ────────────────────────────────────────────────
  app.post("/api/auth/change-password", requireAuth, authRateLimit, async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub));
      if (!user) return res.status(404).json({ error: "User not found" });

      const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

      const newHash = await hashPassword(parsed.data.newPassword);
      await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user.id));
      await revokeAllUserTokens(user.id);

      await logAudit(user.id, "auth.password_changed", "users", user.id, req);
      return res.json({ success: true, message: "Password updated successfully. Please log in again." });
    } catch {
      return res.status(500).json({ error: "Failed to change password" });
    }
  });

  // ─── Legacy Login (backward compat) ──────────────────────────────────────
  app.post("/api/login", authRateLimit, async (req: Request, res: Response) => {
    return app._router.handle({ ...req, url: "/api/auth/login" }, res, () => {});
  });

  // ─── Intake (Audit Form) ──────────────────────────────────────────────────
  app.post("/api/intake", intakeRateLimit, async (req: Request, res: Response) => {
    const parsed = insertLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    try {
      const tempPassword = generateTempPassword();
      const [lead] = await db.insert(leads).values({ ...parsed.data, tempPassword }).returning();

      // Track affiliate referral if code provided
      if (parsed.data.affiliateCode) {
        const [aff] = await db.select().from(users).where(eq(users.affiliateCode, parsed.data.affiliateCode.toUpperCase()));
        if (aff) {
          await db.insert(affiliateReferrals).values({
            affiliateId: aff.id,
            leadId: lead.id,
            status: "pending",
          });
        }
      }

      // Fire emails non-blocking
      sendAdminNotification({ name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, goals: parsed.data.goals ?? undefined, contactTime: parsed.data.contactTime ?? undefined, source: parsed.data.source ?? undefined, budget: parsed.data.budget ?? undefined }).catch(() => {});
      sendClientConfirmation({ name: parsed.data.name, email: lead.email, tempPassword }).catch(() => {});

      await logAudit(null, "lead.created", "leads", lead.id, req);

      return res.json({
        success: true,
        message: "Audit request received",
        portal_credentials: { email: lead.email, temp_password: tempPassword },
      });
    } catch (err) {
      console.error("Intake error:", err);
      return res.status(500).json({ success: false, message: "Failed to submit. Please try again." });
    }
  });

  // ─── Client Dashboard (CRC Data) ─────────────────────────────────────────
  app.get("/api/client/dashboard", requireAuth, requireRole("client", "admin"), apiRateLimit, async (req: Request, res: Response) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub));
      const clientName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

      if (user?.crcClientId) {
        const data = await getCRCClientDashboard(user.crcClientId);
        return res.json({ success: true, data, source: "crc" });
      }

      // Return mock data if CRC not connected
      const data = getMockClientDashboard(clientName || user?.email);
      return res.json({ success: true, data, source: "mock", notice: "Connect your Credit Repair Cloud account for live data" });
    } catch (err) {
      console.error("Dashboard error:", err);
      return res.status(500).json({ error: "Failed to load dashboard" });
    }
  });

  // ─── Affiliate Dashboard ──────────────────────────────────────────────────
  app.get("/api/affiliate/dashboard", requireAuth, requireRole("affiliate", "admin"), apiRateLimit, async (req: Request, res: Response) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub));
      const affiliateName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

      if (user?.crcAffiliateId) {
        const [stats, referrals] = await Promise.all([
          getCRCAffiliateStats(user.crcAffiliateId),
          getCRCAffiliateReferrals(user.crcAffiliateId),
        ]);
        return res.json({ success: true, data: { stats, referrals }, source: "crc" });
      }

      const data = getMockAffiliateData(affiliateName);
      return res.json({ success: true, data, source: "mock" });
    } catch (err) {
      console.error("Affiliate dashboard error:", err);
      return res.status(500).json({ error: "Failed to load affiliate dashboard" });
    }
  });

  // ─── Affiliate: Get Referral Link ─────────────────────────────────────────
  app.get("/api/affiliate/referral-link", requireAuth, requireRole("affiliate", "admin"), async (req: Request, res: Response) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub));
    if (!user?.affiliateCode) return res.status(400).json({ error: "No affiliate code assigned" });

    const baseUrl = process.env.FRONTEND_URL || "https://700creditclubexperts.com";
    return res.json({
      code: user.affiliateCode,
      link: `${baseUrl}?ref=${user.affiliateCode}`,
      auditLink: `${baseUrl}/audit?ref=${user.affiliateCode}`,
      enrollLink: `${baseUrl}/enroll?ref=${user.affiliateCode}`,
    });
  });

  // ─── Admin: Get All Leads ─────────────────────────────────────────────────
  app.get("/api/admin/leads", requireAdminKey, async (_req, res) => {
    try {
      const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
      return res.json({ success: true, leads: allLeads });
    } catch {
      return res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // ─── Admin: Get All Users ─────────────────────────────────────────────────
  app.get("/api/admin/users", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        affiliateCode: users.affiliateCode,
      }).from(users).orderBy(desc(users.createdAt));
      return res.json({ success: true, users: allUsers });
    } catch {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ─── Admin: Link CRC Client ID ────────────────────────────────────────────
  app.patch("/api/admin/users/:userId/crc", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { crcClientId, crcAffiliateId } = req.body;

    try {
      await db.update(users)
        .set({ crcClientId, crcAffiliateId, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: "Failed to update CRC ID" });
    }
  });

  // ─── Legacy: Get Leads (old API key method) ───────────────────────────────
  app.get("/api/leads", requireAdminKey, async (_req, res) => {
    try {
      const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
      return res.json(allLeads);
    } catch {
      return res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  return httpServer;
}
