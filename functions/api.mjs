import sgMail from "@sendgrid/mail";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, pbkdf2Sync } from "crypto";

const {
  SENDGRID_API_KEY,
  JWT_SECRET = "700-credit-club-default-secret",
  ADMIN_EMAIL = "sales@700creditclubexperts.com",
  ADMIN_PASSWORD,
  FROM_EMAIL = "noreply@700creditclubexperts.com",
  FRONTEND_URL = "https://700creditclubexperts.com",
} = process.env;

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

const jwtSecret = new TextEncoder().encode(JWT_SECRET);

function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

async function makeToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);
}

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, jwtSecret);
  return payload;
}

async function sendEmail(to, subject, html) {
  if (!SENDGRID_API_KEY) { console.log("No SendGrid key — skipping email"); return; }
  try {
    await sgMail.send({ to, from: FROM_EMAIL, subject, html });
  } catch (err) {
    console.error("Email error:", err.message, err.response?.body);
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  const path = event.path
    .replace("/.netlify/functions/api", "")
    .replace("/api", "") || "/";
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};
  const authHeader = event.headers?.authorization || event.headers?.Authorization || "";

  console.log(`${method} ${path}`);

  // ── Health ──────────────────────────────────────────────────────────────
  if (path === "/health" && method === "GET") {
    return json(200, {
      status: "ok",
      timestamp: new Date().toISOString(),
      email: !!SENDGRID_API_KEY,
      version: "2.0.0",
    });
  }

  // ── Intake Form ─────────────────────────────────────────────────────────
  if (path === "/intake" && method === "POST") {
    const { name, email, phone, contactTime, goals, source, budget, affiliateRef } = body;
    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return json(400, { error: "Name, email, and phone are required." });
    }

// Generate portal credentials automatically
  const tempPassword = randomBytes(4).toString("hex").toUpperCase() + "!7cc";

  await sendEmail(
    email.trim(),
    `Audit Received + Your Portal Access — 700 Credit Club Experts`,
    `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#020617;color:#f1f5f9;padding:36px;border-radius:12px;max-width:600px;">
      <h1 style="color:#EAB308;font-size:30px;margin:0 0 4px;letter-spacing:2px;">AUDIT RECEIVED.</h1>
      <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 24px;font-weight:400;">We'll be in touch, ${name.split(" ")[0]}.</h2>
      <p style="color:#94a3b8;line-height:1.8;margin-bottom:20px;">Our Certified Credit Experts have your request. JECI AI will scan your full 3-bureau report for every FCRA violation and deletion opportunity under 15 USC 1681.</p>

      <div style="background:rgba(234,179,8,0.15);border:2px solid #EAB308;border-radius:10px;padding:24px;margin:24px 0;">
        <p style="color:#EAB308;font-size:13px;font-weight:800;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">🔐 Your Member Portal Access</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;">Your account has been created. Log in to track your case progress in real time.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;">Portal URL</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;font-weight:600;"><a href="${FRONTEND_URL}/portal" style="color:#EAB308;">${FRONTEND_URL}/portal</a></td></tr>
          <tr><td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;">Email</td><td style="padding:8px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${email.trim()}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;color:#64748b;font-size:12px;text-transform:uppercase;">Temp Password</td><td style="padding:8px 0;color:#EAB308;font-size:16px;font-weight:800;letter-spacing:2px;">${tempPassword}</td></tr>
        </table>
        <p style="color:#475569;font-size:11px;margin:16px 0 0;">Change your password after first login in the Settings tab.</p>
      </div>

      <div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:10px;padding:20px;margin:20px 0;">
        <p style="color:#EAB308;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Selected Goals</p>
        <p style="color:#f1f5f9;font-size:15px;font-weight:600;margin:0;">${Array.isArray(goals) ? goals.join(" · ") : (goals || "General Credit Improvement")}</p>
      </div>

      <div style="margin:20px 0;padding:20px;background:#0f172a;border:1px solid rgba(234,179,8,0.15);border-radius:10px;">
        <p style="color:#EAB308;font-size:13px;font-weight:700;margin:0 0 8px;">💰 Save $400 — Self-Enroll Online</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;">Skip the enrollment department and get started today.</p>
        <a href="${FRONTEND_URL}/enroll" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:1px;">SELF-ENROLL NOW</a>
      </div>

      <p style="color:#475569;font-size:11px;margin-top:20px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.05);">Legal, Moral, Ethical &amp; Factual · 15 USC 1681 · Licensed in Florida</p>
    </div>`
  );

  return json(200, { success: true, message: "Audit request received! Check your email for confirmation and portal access." });

  // ── Auth: Login ─────────────────────────────────────────────────────────
  if (path === "/auth/login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password) return json(400, { error: "Email and password required." });
    if (ADMIN_PASSWORD && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = await makeToken({ userId: 0, email: ADMIN_EMAIL, role: "admin", affiliateCode: "ADMIN" });
      return json(200, { success: true, accessToken: token, refreshToken: token, user: { id: 0, name: "Admin", email: ADMIN_EMAIL, role: "admin" } });
    }
    return json(401, { error: "Invalid credentials." });
  }

  // ── Auth: Register ───────────────────────────────────────────────────────
  if (path === "/auth/register" && method === "POST") {
    const { name, email, password } = body;
    if (!name?.trim() || !email?.trim() || !password) return json(400, { error: "Name, email, and password are required." });
    if (password.length < 8) return json(400, { error: "Password must be at least 8 characters." });
    const affiliateCode = randomBytes(6).toString("hex").toUpperCase();
    const token = await makeToken({ userId: Date.now(), email: email.toLowerCase(), role: "client", affiliateCode });
    await sendEmail(
      email,
      `Welcome to 700 Credit Club`,
      `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#020617;color:#f1f5f9;padding:32px;border-radius:12px;max-width:580px;">
        <h1 style="color:#EAB308;font-size:28px;margin:0 0 8px;">WELCOME TO THE CLUB.</h1>
        <p style="color:#94a3b8;">Your portal is ready, ${name.split(" ")[0]}.</p>
        <a href="${FRONTEND_URL}/portal" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px;">ACCESS YOUR PORTAL</a>
      </div>`
    );
    return json(200, { success: true, accessToken: token, refreshToken: token, user: { id: Date.now(), name: name.trim(), email: email.toLowerCase(), role: "client" } });
  }

  // ── Auth: Logout ─────────────────────────────────────────────────────────
  if (path === "/auth/logout" && method === "POST") {
    return json(200, { success: true });
  }

  // ── Auth: Refresh ────────────────────────────────────────────────────────
  if (path === "/auth/refresh" && method === "POST") {
    try {
      const payload = await verifyToken(body.refreshToken);
      const newToken = await makeToken({ userId: payload.userId, email: payload.email, role: payload.role, affiliateCode: payload.affiliateCode });
      return json(200, { success: true, accessToken: newToken, refreshToken: newToken });
    } catch {
      return json(401, { error: "Invalid or expired token." });
    }
  }

  // ── Client Dashboard ──────────────────────────────────────────────────────
  if (path === "/client/dashboard" && method === "GET") {
    if (!authHeader.startsWith("Bearer ")) return json(401, { error: "Login required." });
    try { await verifyToken(authHeader.slice(7)); } catch { return json(401, { error: "Session expired." }); }
    return json(200, {
      source: "mock",
      data: {
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
          { id: 1, creditor_name: "MIDLAND CREDIT MGMT", account_number: "****4821", bureau: "TransUnion", dispute_reason: "Unverifiable Account — 15 USC 1681e(b)", status: "deleted", amount: 2400, round_number: 1 },
          { id: 2, creditor_name: "PORTFOLIO RECOVERY", account_number: "****7723", bureau: "Equifax", dispute_reason: "Not Mine — Identity", status: "deleted", amount: 1800, round_number: 1 },
          { id: 3, creditor_name: "COLLECTION BUREAU INC", account_number: "****3301", bureau: "Experian", dispute_reason: "Inaccurate Payment History — 15 USC 1681s-2", status: "in_progress", amount: 950, round_number: 2 },
          { id: 4, creditor_name: "ALLIED MEDICAL BILLING", account_number: "****8844", bureau: "TransUnion", dispute_reason: "HIPAA Violation — Medical Debt", status: "queued", amount: 3200, round_number: 2 },
        ],
        activeDisputes: 2, deletions: 2, totalAmountDeleted: 4200,
        rounds: [
          { id: 1, round_number: 1, status: "completed", items_count: 6, deletions_count: 4 },
          { id: 2, round_number: 2, status: "active", items_count: 4, deletions_count: 0 },
        ],
        currentRound: 2,
        stats: { totalDisputes: 10, deletionCount: 4, activeCount: 3, successRate: 73 },
        isMockData: true,
      },
    });
  }

  // ── Affiliate Dashboard ───────────────────────────────────────────────────
  if (path === "/affiliate/dashboard" && method === "GET") {
    if (!authHeader.startsWith("Bearer ")) return json(401, { error: "Login required." });
    return json(200, { source: "db", data: { stats: { totalReferrals: 0, activeClients: 0, pendingCommission: 0, paidCommission: 0, conversionRate: 0 }, recentReferrals: [], commissionHistory: [] } });
  }

  // ── Affiliate Referral Link ───────────────────────────────────────────────
  if (path === "/affiliate/referral-link" && method === "GET") {
    if (!authHeader.startsWith("Bearer ")) return json(401, { error: "Login required." });
    return json(200, { data: { links: { audit: `${FRONTEND_URL}/audit?ref=REF`, enroll: `${FRONTEND_URL}/enroll?ref=REF`, home: `${FRONTEND_URL}?ref=REF` }, code: "REF" } });
  }

  return json(404, { error: `Route ${method} ${path} not found.` });