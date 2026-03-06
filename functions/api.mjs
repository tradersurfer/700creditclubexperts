import express from "express";
import serverlessHttp from "serverless-http";
import { Resend } from "resend";
import { neon } from "@neondatabase/serverless";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, pbkdf2Sync } from "crypto";

const app = express();
app.use(express.json({ limit: "1mb" }));

const {
  RESEND_API_KEY,
  JWT_SECRET = "700-credit-club-change-me-in-production",
  DATABASE_URL,
  ADMIN_EMAIL = "sales@700creditclubexperts.com",
  ADMIN_PASSWORD,
  FROM_EMAIL = "noreply@700creditclubexperts.com",
  FRONTEND_URL = "https://700creditclubexperts.com",
} = process.env;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
const jwtSecret = new TextEncoder().encode(JWT_SECRET);

function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

async function makeToken(payload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(jwtSecret);
}

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, jwtSecret);
  return payload;
}

async function sendEmail(to, subject, html) {
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error("Email failed:", err.message);
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  const allowedOrigins = [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"];
  const isAllowed = !origin || allowedOrigins.some((o) => origin.startsWith(o)) || origin.includes("netlify.app");
  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin || "*" : "");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Login required" });
  try {
    req.user = await verifyToken(auth.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

async function ensureSchema() {
  if (!sql) return;
  try {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      affiliate_code TEXT,
      crc_client_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      contact_time TEXT,
      goals JSONB DEFAULT '[]',
      source TEXT,
      budget TEXT,
      affiliate_ref TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  } catch (err) {
    console.error("Schema bootstrap error:", err.message);
  }
}

app.post("/api/intake", async (req, res) => {
  const { name, email, phone, contactTime, goals, source, budget, affiliateRef } = req.body;
  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "Name, email, and phone are required." });
  }
  if (sql) {
    try {
      await ensureSchema();
      await sql`INSERT INTO leads (name, email, phone, contact_time, goals, source, budget, affiliate_ref, created_at)
        VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${phone.trim()},
                ${contactTime || null}, ${JSON.stringify(goals || [])},
                ${source || null}, ${budget || null}, ${affiliateRef || null}, NOW())`;
    } catch (dbErr) {
      console.error("Lead DB error (non-fatal):", dbErr.message);
    }
  }

  await sendEmail(
    ADMIN_EMAIL,
    `🔔 New Audit Request — ${name}`,
    `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#020617;color:#f1f5f9;padding:36px;border-radius:12px;max-width:600px;">
      <div style="border-bottom:2px solid #EAB308;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="color:#EAB308;font-size:26px;margin:0;letter-spacing:2px;">NEW AUDIT REQUEST</h1>
        <p style="color:#475569;font-size:11px;font-family:monospace;margin:4px 0 0;">700 Credit Club Experts · ${new Date().toLocaleString()}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Name</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${name}</td></tr>
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Email</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;"><a href="mailto:${email}" style="color:#EAB308;">${email}</a></td></tr>
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Phone</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;"><a href="tel:${phone}" style="color:#EAB308;">${phone}</a></td></tr>
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Best Time</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${contactTime || "Not specified"}</td></tr>
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Goals</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${Array.isArray(goals) ? goals.join(" · ") : (goals || "—")}</td></tr>
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Source</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${source || "—"}</td></tr>
        <tr style="border-bottom:1px solid rgba(234,179,8,0.08);"><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Budget</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${budget || "—"}</td></tr>
        <tr><td style="padding:10px 16px 10px 0;color:#64748b;font-size:11px;font-family:monospace;text-transform:uppercase;">Referral</td><td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${affiliateRef || "Direct"}</td></tr>
      </table>
    </div>`
  );

  await sendEmail(
    email.trim(),
    `You're In — 700 Credit Club Experts Has Your Audit Request`,
    `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#020617;color:#f1f5f9;padding:36px;border-radius:12px;max-width:600px;">
      <h1 style="color:#EAB308;font-size:30px;margin:0 0 4px;letter-spacing:2px;">AUDIT RECEIVED.</h1>
      <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 24px;font-weight:400;">We'll be in touch, ${name.split(" ")[0]}.</h2>
      <p style="color:#94a3b8;line-height:1.8;margin-bottom:20px;">Our Certified Credit Experts have received your audit request. Using JECI AI and deep Consumer Law knowledge (15 USC 1681), we'll analyze your profile for every FCRA violation and deletion opportunity.</p>
      <div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:10px;padding:20px;margin:20px 0;">
        <p style="color:#EAB308;font-size:11px;font-family:monospace;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Your Selected Goals</p>
        <p style="color:#f1f5f9;font-size:15px;font-weight:600;margin:0;">${Array.isArray(goals) ? goals.join(" · ") : (goals || "General Credit Improvement")}</p>
      </div>
      <div style="margin:24px 0;">
        <p style="color:#EAB308;font-size:11px;font-family:monospace;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">What Happens Next</p>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><div style="width:24px;height:24px;background:#EAB308;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#020617;font-size:11px;font-weight:800;">1</span></div><p style="color:#94a3b8;font-size:14px;margin:3px 0 0;">Expert reviews your full 3-bureau report</p></div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><div style="width:24px;height:24px;background:#EAB308;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#020617;font-size:11px;font-weight:800;">2</span></div><p style="color:#94a3b8;font-size:14px;margin:3px 0 0;">JECI AI identifies all FCRA violations</p></div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><div style="width:24px;height:24px;background:#EAB308;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#020617;font-size:11px;font-weight:800;">3</span></div><p style="color:#94a3b8;font-size:14px;margin:3px 0 0;">You receive a custom Consumer Law strategy</p></div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><div style="width:24px;height:24px;background:#EAB308;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#020617;font-size:11px;font-weight:800;">4</span></div><p style="color:#94a3b8;font-size:14px;margin:3px 0 0;">We begin your deletion rounds immediately upon enrollment</p></div>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(234,179,8,0.15);border-radius:10px;padding:20px;margin:24px 0;">
        <p style="color:#EAB308;font-size:13px;font-weight:700;margin:0 0 6px;">💰 Save $400 — Self-Enroll Online</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;">Skip the enrollment department and get started today for less.</p>
        <a href="${FRONTEND_URL}/enroll" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:1px;">SELF-ENROLL NOW</a>
      </div>
      <p style="color:#475569;font-size:11px;font-family:monospace;margin:24px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05);">Legal, Moral, Ethical &amp; Factual Credit Services · 15 USC 1681 (FCRA) · Licensed in Florida</p>
    </div>`
  );

  res.json({ success: true, message: "Audit request received! Check your email for confirmation." });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role = "client" } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ error: "Name, email, and password are required." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  if (!sql) return res.status(503).json({ error: "Database not configured. Contact support." });
  await ensureSchema();
  const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
  if (existing.length > 0) return res.status(409).json({ error: "An account with this email already exists." });
  const salt = randomBytes(32).toString("hex");
  const hash = hashPassword(password, salt);
  const affiliateCode = randomBytes(6).toString("hex").toUpperCase();
  const [user] = await sql`INSERT INTO users (name, email, password_hash, password_salt, role, affiliate_code, created_at)
    VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${hash}, ${salt}, ${role}, ${affiliateCode}, NOW())
    RETURNING id, name, email, role, affiliate_code`;
  const accessToken = await makeToken({ userId: user.id, email: user.email, role: user.role, affiliateCode: user.affiliate_code });
  await sendEmail(email, `Welcome to 700 Credit Club — Portal Access Ready`,
    `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#020617;color:#f1f5f9;padding:36px;border-radius:12px;max-width:600px;">
      <h1 style="color:#EAB308;font-size:28px;margin:0 0 4px;letter-spacing:2px;">WELCOME TO THE CLUB.</h1>
      <p style="color:#94a3b8;margin:0 0 24px;">Your member portal is ready, ${name.split(" ")[0]}.</p>
      <a href="${FRONTEND_URL}/portal" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:1px;">ACCESS YOUR PORTAL</a>
    </div>`
  );
  res.json({ success: true, accessToken, refreshToken: accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  if (ADMIN_PASSWORD && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    const token = await makeToken({ userId: 0, email: ADMIN_EMAIL, role: "admin", affiliateCode: "ADMIN" });
    return res.json({ success: true, accessToken: token, refreshToken: token, user: { id: 0, name: "Admin", email: ADMIN_EMAIL, role: "admin" } });
  }
  if (!sql) return res.status(503).json({ error: "Database not configured. Contact support." });
  await ensureSchema();
  const users = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`;
  const user = users[0];
  if (!user) return res.status(401).json({ error: "Invalid email or password." });
  const hash = hashPassword(password, user.password_salt);
  if (hash !== user.password_hash) return res.status(401).json({ error: "Invalid email or password." });
  const token = await makeToken({ userId: user.id, email: user.email, role: user.role, affiliateCode: user.affiliate_code });
  res.json({ success: true, accessToken: token, refreshToken: token, user: { id: user.id, name: user.name, email: user.email, role: user.role, affiliateCode: user.affiliate_code } });
});

app.post("/api/auth/logout", (req, res) => res.json({ success: true }));

app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required." });
  try {
    const payload = await verifyToken(refreshToken);
    const newToken = await makeToken({ userId: payload.userId, email: payload.email, role: payload.role, affiliateCode: payload.affiliateCode });
    res.json({ success: true, accessToken: newToken, refreshToken: newToken });
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  if (!sql || req.user.userId === 0) return res.json({ user: { id: req.user.userId, name: "Admin", email: req.user.email, role: req.user.role } });
  const users = await sql`SELECT id, name, email, role, affiliate_code FROM users WHERE id = ${req.user.userId}`;
  const user = users[0];
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user });
});

app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters." });
  if (!sql) return res.status(503).json({ error: "Database not configured." });
  const users = await sql`SELECT * FROM users WHERE id = ${req.user.userId}`;
  const user = users[0];
  if (!user) return res.status(404).json({ error: "User not found." });
  const hash = hashPassword(currentPassword, user.password_salt);
  if (hash !== user.password_hash) return res.status(401).json({ error: "Current password is incorrect." });
  const newSalt = randomBytes(32).toString("hex");
  const newHash = hashPassword(newPassword, newSalt);
  await sql`UPDATE users SET password_hash = ${newHash}, password_salt = ${newSalt}, updated_at = NOW() WHERE id = ${req.user.userId}`;
  res.json({ success: true, message: "Password updated successfully." });
});

app.get("/api/client/dashboard", requireAuth, async (req, res) => {
  const mockData = {
    client: { id: req.user.userId, first_name: "Member", last_name: "", email: req.user.email, status: "active", score_transunion: 684, score_equifax: 691, score_experian: 678 },
    currentScore: 684,
    scores: { transunion: 684, equifax: 691, experian: 678 },
    scoreChart: [
      { date: "2025-10", tu: 542, eq: 538, ex: 531 },
      { date: "2025-11", tu: 589, eq: 584, ex: 579 },
      { date: "2025-12", tu: 624, eq: 631, ex: 618 },
      { date: "2026-01", tu: 651, eq: 658, ex: 644 },
      { date: "2026-02", tu: 684, eq: 691, ex: 678 },
    ],
    disputes: [
      { id: 1, creditor_name: "MIDLAND CREDIT MGMT", account_number: "****4821", bureau: "TransUnion", dispute_reason: "Unverifiable Account — 15 USC 1681e(b)", status: "deleted", amount: 2400, round_number: 1, created_at: "2025-10-15" },
      { id: 2, creditor_name: "PORTFOLIO RECOVERY", account_number: "****7723", bureau: "Equifax", dispute_reason: "Not Mine — Identity", status: "deleted", amount: 1800, round_number: 1, created_at: "2025-10-15" },
      { id: 3, creditor_name: "COLLECTION BUREAU INC", account_number: "****3301", bureau: "Experian", dispute_reason: "Inaccurate Payment History — 15 USC 1681s-2", status: "in_progress", amount: 950, round_number: 2, created_at: "2025-11-01" },
      { id: 4, creditor_name: "ALLIED MEDICAL BILLING", account_number: "****8844", bureau: "TransUnion", dispute_reason: "HIPAA Violation — Medical Debt", status: "queued", amount: 3200, round_number: 2, created_at: "2025-11-01" },
    ],
    activeDisputes: 2, deletions: 2, totalAmountDeleted: 4200,
    rounds: [
      { id: 1, round_number: 1, status: "completed", started_at: "2025-10-15", completed_at: "2025-11-10", items_count: 6, deletions_count: 4 },
      { id: 2, round_number: 2, status: "active", started_at: "2025-11-15", completed_at: null, items_count: 4, deletions_count: 0 },
    ],
    currentRound: 2,
    stats: { totalDisputes: 10, deletionCount: 4, activeCount: 3, successRate: 73 },
    isMockData: true,
  };
  res.json({ source: "mock", data: mockData });
});

app.get("/api/affiliate/dashboard", requireAuth, async (req, res) => {
  if (!["affiliate", "admin"].includes(req.user.role)) return res.status(403).json({ error: "Affiliate access required." });
  res.json({ source: "db", data: { stats: { totalReferrals: 0, activeClients: 0, completedClients: 0, pendingReferrals: 0, totalRevenue: 0, pendingCommission: 0, paidCommission: 0, conversionRate: 0 }, recentReferrals: [], commissionHistory: [], leaderboard: [] } });
});

app.get("/api/affiliate/referral-link", requireAuth, async (req, res) => {
  if (!["affiliate", "admin"].includes(req.user.role)) return res.status(403).json({ error: "Affiliate access required." });
  const code = req.user.affiliateCode || "REF";
  res.json({ data: { links: { audit: `${FRONTEND_URL}/audit?ref=${code}`, enroll: `${FRONTEND_URL}/enroll?ref=${code}`, home: `${FRONTEND_URL}?ref=${code}` }, code } });
});

app.get("/api/admin/users", requireAuth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  if (!sql) return res.json({ users: [] });
  const users = await sql`SELECT id, name, email, role, affiliate_code, crc_client_id, created_at FROM users ORDER BY created_at DESC`;
  res.json({ users });
});

app.get("/api/admin/leads", requireAuth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  if (!sql) return res.json({ leads: [] });
  const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 100`;
  res.json({ leads });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), db: !!sql, email: !!resend, version: "2.0.0" });
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

export const handler = serverlessHttp(app);