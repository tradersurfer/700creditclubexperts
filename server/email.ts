import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  return new Resend(apiKey);
}

const FROM = process.env.FROM_EMAIL
  ? `700 Credit Club Experts <${process.env.FROM_EMAIL}>`
  : "700 Credit Club Experts <noreply@jecigroup.com>";

const ADMIN = process.env.ADMIN_EMAIL || "jecitax@gmail.com";

function wrapEmail(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#020617;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#020617;padding:24px;">
    <div style="text-align:center;padding:24px 0 16px;border-bottom:1px solid rgba(234,179,8,0.2);">
      <div style="display:inline-block;background:#EAB308;padding:10px 16px;border-radius:8px;margin-bottom:12px;">
        <span style="font-size:24px;font-weight:900;color:#020617;letter-spacing:2px;">700</span>
      </div>
      <h1 style="color:#EAB308;font-size:20px;margin:8px 0 4px;letter-spacing:3px;">700 CREDIT CLUB EXPERTS</h1>
      <p style="color:#94a3b8;font-size:11px;margin:0;letter-spacing:2px;text-transform:uppercase;">Legal · Moral · Ethical · Factual</p>
    </div>
    <div style="padding:32px 0;">${content}</div>
    <div style="border-top:1px solid rgba(234,179,8,0.1);padding:20px 0 0;text-align:center;">
      <p style="color:#475569;font-size:11px;margin:0 0 4px;">© ${new Date().getFullYear()} 700 Credit Club Experts. All rights reserved.</p>
      <p style="color:#475569;font-size:10px;margin:0;">Licensed in the State of Florida · 15 USC 1681 (FCRA) Compliant</p>
      <p style="color:#475569;font-size:10px;margin:8px 0 0;"><a href="mailto:sales@700creditclubexperts.com" style="color:#EAB308;text-decoration:none;">sales@700creditclubexperts.com</a></p>
    </div>
  </div>
</body></html>`;
}

export async function sendAdminNotification(lead: {
  name: string; email: string; phone: string;
  goals?: string[]; contactTime?: string; source?: string; budget?: string;
}) {
  try {
    const client = getResendClient();
    const goalsText = lead.goals?.length ? lead.goals.join(", ") : "Not specified";
    const rows = [["Name", lead.name], ["Email", lead.email], ["Phone", lead.phone], ["Goals", goalsText], ["Best Time", lead.contactTime || "—"], ["Source", lead.source || "—"], ["Budget", lead.budget || "—"]];
    const content = `
      <h2 style="color:#EAB308;font-size:20px;margin:0 0 20px;">🔔 NEW AUDIT REQUEST</h2>
      <div style="background:#0f172a;border:1px solid rgba(234,179,8,0.2);border-left:4px solid #EAB308;border-radius:8px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">${rows.map(([k, v]) => `<tr><td style="color:#94a3b8;padding:8px 0;width:100px;font-size:13px;">${k}</td><td style="color:#f1f5f9;padding:8px 0;font-size:13px;font-weight:600;">${v}</td></tr>`).join("")}</table>
      </div>`;
    await client.emails.send({ from: FROM, to: ADMIN, subject: `🚨 New Audit Request — ${lead.name}`, html: wrapEmail(content) });
  } catch (err) { console.error("Admin email failed:", err); }
}

export async function sendClientConfirmation(data: { name: string; email: string; tempPassword: string }) {
  try {
    const client = getResendClient();
    const portalUrl = `${process.env.FRONTEND_URL || "https://700creditclubexperts.com"}/portal`;
    const content = `
      <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 8px;">Welcome to the Club, ${data.name.split(" ")[0]}.</h2>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">Your audit request has been received. Here are your portal credentials:</p>
      <div style="background:#0f172a;border:2px solid rgba(234,179,8,0.4);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <p style="color:#94a3b8;font-size:11px;margin:0 0 16px;letter-spacing:2px;text-transform:uppercase;">Portal Credentials</p>
        <div style="margin-bottom:12px;"><p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">EMAIL</p><p style="color:#EAB308;font-size:16px;font-weight:700;margin:0;font-family:monospace;">${data.email}</p></div>
        <div><p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">TEMP PASSWORD</p><p style="color:#EAB308;font-size:24px;font-weight:900;margin:0;font-family:monospace;letter-spacing:4px;">${data.tempPassword}</p></div>
        <p style="color:#dc2626;font-size:11px;margin:16px 0 0;">⚠️ Change this password after first login</p>
      </div>
      <div style="text-align:center;margin-bottom:24px;"><a href="${portalUrl}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;letter-spacing:2px;">ACCESS YOUR PORTAL →</a></div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "✅ Your 700 Credit Club Portal Credentials", html: wrapEmail(content) });
  } catch (err) { console.error("Client confirmation email failed:", err); }
}

export async function sendWelcomeEmail(data: { name: string; email: string; role: string }) {
  try {
    const client = getResendClient();
    const isAffiliate = data.role === "affiliate";
    const content = `
      <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 8px;">Welcome, ${data.name.split(" ")[0]}!</h2>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">${isAffiliate ? "Your affiliate account is live. Access your partner dashboard to track referrals and commissions." : "Your member account is ready. Track disputes and score progress in your portal."}</p>
      <div style="text-align:center;"><a href="${process.env.FRONTEND_URL || "https://700creditclubexperts.com"}/${isAffiliate ? "affiliate" : "portal"}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;letter-spacing:2px;">${isAffiliate ? "ACCESS AFFILIATE PORTAL →" : "ACCESS MEMBER PORTAL →"}</a></div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: `Welcome to 700 Credit Club Experts${isAffiliate ? " — Affiliate Partner" : ""}`, html: wrapEmail(content) });
  } catch (err) { console.error("Welcome email failed:", err); }
}

export async function sendPasswordResetEmail(data: { name: string; email: string; resetToken: string }) {
  try {
    const client = getResendClient();
    const resetUrl = `${process.env.FRONTEND_URL || "https://700creditclubexperts.com"}/reset-password?token=${data.resetToken}`;
    const content = `
      <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 8px;">Password Reset Request</h2>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">Click below to reset your password. This link expires in 1 hour.</p>
      <div style="text-align:center;margin-bottom:24px;"><a href="${resetUrl}" style="display:inline-block;background:#dc2626;color:#fff;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">RESET MY PASSWORD</a></div>
      <p style="color:#64748b;font-size:12px;text-align:center;">Didn't request this? Safely ignore this email.</p>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Reset Your 700 Credit Club Password", html: wrapEmail(content) });
  } catch (err) { console.error("Password reset email failed:", err); }
}

// ─── 8-Email Automated Sequence ──────────────────────────────────────────────
// See: emails/700cce-sequence/ for full HTML templates

const BASE = process.env.FRONTEND_URL || "https://700creditclubexperts.com";
const SKOOL = "https://www.skool.com/700-credit-club-experts-7830";
const CREDIT_HERO_URL = process.env.CREDIT_HERO_URL || "https://creditheroscore.com";
const CALENDLY_URL = process.env.CALENDLY_URL || "https://calendly.com/700creditclubexperts";
const MAINTENANCE_STRIPE = process.env.MAINTENANCE_STRIPE_URL || "https://buy.stripe.com/14AdR80Pog5o6nignxfEk00";

// Email 1 — Welcome + Credentials (trigger: new client created in CRC / after intake)
export async function sendEmail01Welcome(data: { firstName: string; email: string; tempPassword: string }) {
  try {
    const client = getResendClient();
    const portalLink = `${BASE}/portal`;
    const content = `
      <p style="color:#EAB308;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">WELCOME TO THE CLUB</p>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome, ${data.firstName}. Your Portal is Ready.</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">Your Credit Audit + Round 1 is confirmed and your JECI AI system is now scanning all 3 bureaus. Use the credentials below to access your client portal.</p>
      <div style="background:#0f172a;border:2px solid rgba(234,179,8,0.3);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <p style="color:#64748b;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">EMAIL</p>
        <p style="color:#EAB308;font-size:16px;font-weight:700;font-family:monospace;margin:0 0 16px;">${data.email}</p>
        <p style="color:#64748b;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">TEMP PASSWORD</p>
        <p style="color:#EAB308;font-size:26px;font-weight:900;font-family:monospace;letter-spacing:6px;margin:0;">${data.tempPassword}</p>
        <p style="color:#dc2626;font-size:11px;margin:12px 0 0;">⚠️ Change password after first login</p>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${portalLink}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;letter-spacing:1px;">ACCESS MY PORTAL →</a>
      </div>
      <p style="color:#f1f5f9;font-weight:700;font-size:14px;margin:0 0 10px;">What Happens Next:</p>
      <div style="background:#0f172a;border-left:4px solid #EAB308;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;"><strong style="color:#f1f5f9;">01 — AI Audit (Now):</strong> JECI AI scans all 3 bureaus for violations.<br/><strong style="color:#f1f5f9;">02 — Violation Report (24–48h):</strong> Full tri-bureau report in your inbox.<br/><strong style="color:#f1f5f9;">03 — Round 1 Letters (Week 1–2):</strong> FCRA disputes dispatched to all bureaus.<br/><strong style="color:#f1f5f9;">04 — Track Results (30–45 days):</strong> Every response logged in your portal.</p>
      </div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Welcome to 700 Credit Club Experts — Your Portal is Ready", html: wrapEmail(content) });
  } catch (err) { console.error("Email 01 failed:", err); }
}

// Email 2 — Credit Hero Score (trigger: Day 1 / +24h scheduled)
export async function sendEmail02CreditHero(data: { firstName: string; email: string }) {
  try {
    const client = getResendClient();
    const content = `
      <div style="background:#EAB308;color:#020617;font-size:10px;font-weight:900;padding:4px 12px;border-radius:20px;letter-spacing:2px;text-transform:uppercase;display:inline-block;margin-bottom:12px;">⚡ ACTION REQUIRED — DAY 1</div>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${data.firstName}, pull your free score now.</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">Before we send your Round 1 dispute letters, we need a baseline score from <strong style="color:#f1f5f9;">Credit Hero Score</strong> — free, FCRA-compliant, no credit card required.</p>
      <div style="background:#0f172a;border:2px solid rgba(234,179,8,0.25);border-radius:12px;padding:28px 24px;text-align:center;margin-bottom:24px;">
        <p style="color:#f1f5f9;font-size:18px;font-weight:700;margin:0 0 8px;">Pull Your Free Credit Hero Score</p>
        <p style="color:#64748b;font-size:12px;margin:0 0 20px;">Takes 2 minutes. Free forever.</p>
        <a href="${CREDIT_HERO_URL}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;">GET MY FREE SCORE →</a>
      </div>
      <div style="background:#0f172a;border-left:4px solid #EAB308;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">✓ <strong style="color:#f1f5f9;">Baseline score</strong> — Documents your start before disputes<br/>✓ <strong style="color:#f1f5f9;">All 3 bureaus</strong> — Equifax, TransUnion, Experian at once<br/>✓ <strong style="color:#f1f5f9;">Real-time alerts</strong> — Know the moment any bureau updates your file<br/>✓ <strong style="color:#f1f5f9;">Before/after proof</strong> — We show exact score gains from deletions</p>
      </div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Quick Action: Pull Your Free Credit Hero Score", html: wrapEmail(content) });
  } catch (err) { console.error("Email 02 failed:", err); }
}

// Email 3 — Report Review Call (trigger: Day 2 / +48h scheduled)
export async function sendEmail03ReviewCall(data: { firstName: string; email: string }) {
  try {
    const client = getResendClient();
    const content = `
      <p style="color:#EAB308;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">DAY 2 — REPORT READY</p>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${data.firstName}, let's review your audit results together.</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">Your JECI AI audit is complete. Walk through the findings with a certified credit expert — completely free, no pressure.</p>
      <div style="background:#0f172a;border:2px solid rgba(234,179,8,0.25);border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:24px;">
        <p style="color:#f1f5f9;font-size:18px;font-weight:700;margin:0 0 4px;">30-Minute Report Review</p>
        <p style="color:#64748b;font-size:12px;margin:0 0 20px;">With a Certified Credit Expert · Free · No pressure</p>
        <a href="${CALENDLY_URL}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;">BOOK MY CALL →</a>
      </div>
      <div style="background:#0f172a;border-left:4px solid #EAB308;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">✓ <strong style="color:#f1f5f9;">Your violations list</strong> — Every FCRA violation we found<br/>✓ <strong style="color:#f1f5f9;">Deletion strategy</strong> — Exactly what we're targeting in Round 1<br/>✓ <strong style="color:#f1f5f9;">Timeline & expectations</strong> — Realistic projections for your profile<br/>✓ <strong style="color:#f1f5f9;">Score goals</strong> — Map your current score to your financial target</p>
      </div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Schedule Your Free Report Review Call", html: wrapEmail(content) });
  } catch (err) { console.error("Email 03 failed:", err); }
}

// Email 4 — Round 1 Dispatched (trigger: CRC round.dispatched webhook)
export async function sendEmail04Round1Dispatched(data: { firstName: string; email: string; itemsCount: number }) {
  try {
    const client = getResendClient();
    const portalLink = `${BASE}/portal`;
    const content = `
      <div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:32px;margin-bottom:8px;">✅</div>
        <p style="color:#4ade80;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">ROUND 1 DISPATCHED</p>
        <p style="color:#f1f5f9;font-size:18px;font-weight:700;margin:0;">Disputes Sent to All 3 Bureaus</p>
      </div>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${data.firstName}, Round 1 is in motion.</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">FCRA-grounded dispute letters dispatched to Equifax, TransUnion, and Experian simultaneously.</p>
      <div style="display:table;width:100%;margin-bottom:20px;text-align:center;">
        <div style="display:table-cell;background:#0f172a;border:1px solid rgba(234,179,8,0.1);padding:16px;border-radius:8px 0 0 8px;"><span style="color:#EAB308;font-size:28px;font-weight:900;display:block;">${data.itemsCount}</span><span style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Items Disputed</span></div>
        <div style="display:table-cell;background:#0f172a;border:1px solid rgba(234,179,8,0.1);border-left:none;padding:16px;"><span style="color:#EAB308;font-size:28px;font-weight:900;display:block;">3</span><span style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Bureaus Targeted</span></div>
        <div style="display:table-cell;background:#0f172a;border:1px solid rgba(234,179,8,0.1);border-left:none;padding:16px;border-radius:0 8px 8px 0;"><span style="color:#EAB308;font-size:28px;font-weight:900;display:block;">30–45</span><span style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Days to Respond</span></div>
      </div>
      <div style="background:rgba(234,179,8,0.05);border:1px solid rgba(234,179,8,0.15);border-radius:8px;padding:16px 20px;margin-bottom:20px;">
        <p style="color:#EAB308;font-size:12px;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">What to Expect</p>
        <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">Bureaus have up to 30 days to respond. Score changes may begin within 2–3 weeks. Do not apply for new credit during this period.</p>
      </div>
      <div style="text-align:center;"><a href="${portalLink}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;">TRACK MY PROGRESS →</a></div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Round 1 Disputes Have Been Sent to All 3 Bureaus", html: wrapEmail(content) });
  } catch (err) { console.error("Email 04 failed:", err); }
}

// Email 5 — Bureau Response (trigger: CRC dispute.response_received webhook)
export async function sendEmail05BureauResponse(data: { firstName: string; email: string; deletedCount: number; verifiedCount: number }) {
  try {
    const client = getResendClient();
    const portalLink = `${BASE}/portal`;
    const content = `
      <p style="color:#EAB308;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">UPDATE — BUREAU RESPONSE</p>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${data.firstName}, the bureaus have responded.</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 16px;">Here's a summary of your Round 1 dispute results:</p>
      <div style="display:table;width:100%;margin-bottom:24px;border-spacing:8px;">
        <div style="display:table-cell;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:20px;text-align:center;width:50%;"><span style="color:#4ade80;font-size:36px;font-weight:900;display:block;">${data.deletedCount}</span><span style="color:#4ade80;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Items Deleted</span></div>
        <div style="display:table-cell;background:rgba(234,179,8,0.06);border:1px solid rgba(234,179,8,0.2);border-radius:8px;padding:20px;text-align:center;width:50%;"><span style="color:#EAB308;font-size:36px;font-weight:900;display:block;">${data.verifiedCount}</span><span style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Verified / Escalated</span></div>
      </div>
      <div style="background:#0f172a;border-left:4px solid #EAB308;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">✅ <strong style="color:#f1f5f9;">Deleted items</strong> — Permanently removed. Score updates in 30–60 days.<br/>🔴 <strong style="color:#f1f5f9;">"Verified" items</strong> — Doesn't mean they're correct. We have legal escalation tools for this.<br/>🔴 <strong style="color:#f1f5f9;">Next round prep</strong> — Escalation arguments already being prepared using FCRA § 1681i.</p>
      </div>
      <div style="text-align:center;"><a href="${portalLink}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;">VIEW FULL RESULTS →</a></div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Update: We've Received Responses from the Bureaus", html: wrapEmail(content) });
  } catch (err) { console.error("Email 05 failed:", err); }
}

// Email 6 — Round Complete (trigger: CRC round.completed webhook)
export async function sendEmail06RoundComplete(data: { firstName: string; email: string; roundNumber: number; itemsDeleted: number; scoreBefore: number; scoreAfter: number }) {
  try {
    const client = getResendClient();
    const portalLink = `${BASE}/portal`;
    const upsellLink = "https://buy.stripe.com/9B6aEW1Ts1au12Y5ITfEk01";
    const scoreGain = data.scoreAfter - data.scoreBefore;
    const content = `
      <p style="color:#4ade80;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">✓ ROUND ${data.roundNumber} COMPLETE</p>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${data.firstName}, here's what Round ${data.roundNumber} achieved.</h2>
      <div style="background:#0f172a;border:2px solid rgba(234,179,8,0.25);border-radius:14px;padding:28px 24px;margin-bottom:24px;text-align:center;">
        <p style="color:#64748b;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">SCORE PROGRESS</p>
        <div style="display:table;width:100%;text-align:center;">
          <div style="display:table-cell;vertical-align:middle;"><span style="color:#dc2626;font-size:48px;font-weight:900;">${data.scoreBefore}</span><br/><span style="color:#64748b;font-size:10px;text-transform:uppercase;">Before</span></div>
          <div style="display:table-cell;vertical-align:middle;color:#EAB308;font-size:32px;">→</div>
          <div style="display:table-cell;vertical-align:middle;"><span style="color:#4ade80;font-size:48px;font-weight:900;">${data.scoreAfter}</span><br/><span style="color:#64748b;font-size:10px;text-transform:uppercase;">After</span></div>
        </div>
        <div style="margin-top:16px;"><span style="background:#EAB308;color:#020617;font-weight:900;font-size:18px;padding:8px 20px;border-radius:20px;">+${scoreGain} Points · ${data.itemsDeleted} Items Deleted</span></div>
      </div>
      <div style="background:rgba(234,179,8,0.07);border:2px solid rgba(234,179,8,0.25);border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
        <p style="color:#f1f5f9;font-size:16px;font-weight:700;margin:0 0 8px;">Ready for the Full Sweep?</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;line-height:1.6;">Upgrade to <strong style="color:#f1f5f9;">Full Sweep + Weekly 1-on-1</strong> for multi-round coverage, weekly sessions & lifetime guarantee.</p>
        <a href="${upsellLink}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;margin-bottom:10px;">UPGRADE TO FULL SWEEP →</a><br/>
        <a href="${portalLink}" style="color:#EAB308;font-size:13px;text-decoration:none;">View my full results in portal →</a>
      </div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: `Round ${data.roundNumber} Complete — Here's What We Achieved`, html: wrapEmail(content) });
  } catch (err) { console.error("Email 06 failed:", err); }
}

// Email 7 — Program Complete (trigger: CRC client.program_completed webhook)
export async function sendEmail07ProgramComplete(data: { firstName: string; email: string; totalDeleted: number; scoreStart: number; scoreEnd: number }) {
  try {
    const client = getResendClient();
    const portalLink = `${BASE}/portal`;
    const content = `
      <div style="background:linear-gradient(135deg,rgba(234,179,8,0.12),rgba(234,179,8,0.04));border:2px solid rgba(234,179,8,0.3);border-radius:14px;padding:32px 24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:8px;">🏆</div>
        <p style="color:#EAB308;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">PROGRAM COMPLETE</p>
        <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 6px;">${data.firstName}, you made it to the 700 Club.</h2>
        <p style="color:#94a3b8;font-size:13px;margin:0;">Your lifetime guarantee is now active. Deleted items stay deleted — permanently.</p>
      </div>
      <div style="display:table;width:100%;margin-bottom:24px;text-align:center;">
        <div style="display:table-cell;background:#0f172a;border:1px solid rgba(234,179,8,0.1);padding:20px;border-radius:8px 0 0 8px;"><span style="color:#EAB308;font-size:20px;font-weight:900;display:block;">${data.scoreStart} → ${data.scoreEnd}</span><span style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Score Journey</span></div>
        <div style="display:table-cell;background:#0f172a;border:1px solid rgba(234,179,8,0.1);border-left:none;padding:20px;border-radius:0 8px 8px 0;"><span style="color:#EAB308;font-size:28px;font-weight:900;display:block;">${data.totalDeleted}</span><span style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Total Items Deleted</span></div>
      </div>
      <div style="background:rgba(234,179,8,0.07);border:2px solid rgba(234,179,8,0.25);border-radius:12px;padding:28px 24px;text-align:center;margin-bottom:20px;">
        <p style="color:#f1f5f9;font-size:16px;font-weight:700;margin:0 0 8px;">Protect What You've Built</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;line-height:1.6;">Monthly monitoring, new inquiry alerts, and priority expert access.<br/><strong style="color:#EAB308;font-size:24px;">$49/mo</strong></p>
        <a href="${MAINTENANCE_STRIPE}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;margin-bottom:12px;">START CREDIT MAINTENANCE →</a><br/>
        <a href="${SKOOL}" style="color:#EAB308;font-size:13px;text-decoration:none;">Join our community and share your win →</a>
      </div>
      <div style="text-align:center;"><a href="${portalLink}" style="color:#EAB308;font-size:13px;text-decoration:none;">View your complete results in your portal →</a></div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "Your Credit Restoration Program is Complete — Lifetime Guarantee Activated", html: wrapEmail(content) });
  } catch (err) { console.error("Email 07 failed:", err); }
}

// Email 8 — 30-Day Check-In (trigger: scheduled +30 days after program complete)
export async function sendEmail08Checkin(data: { firstName: string; email: string; currentScore?: number; referralLink?: string }) {
  try {
    const client = getResendClient();
    const portalLink = `${BASE}/portal`;
    const referralLink = data.referralLink || `${BASE}?ref=client`;
    const scoreDisplay = data.currentScore ? String(data.currentScore) : "Check Now";
    const content = `
      <p style="color:#EAB308;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">30-DAY CHECK-IN</p>
      <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${data.firstName}, how's your credit looking?</h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">It's been 30 days since we completed your program. Your score should now fully reflect the deletions we achieved.</p>
      <div style="background:#0f172a;border:1px solid rgba(234,179,8,0.2);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="color:#64748b;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Current Estimated Score</p>
        <p style="color:#4ade80;font-size:52px;font-weight:900;margin:0 0 4px;">${scoreDisplay}</p>
        <a href="${portalLink}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:12px;">VIEW MY PORTAL →</a>
      </div>
      <div style="background:rgba(234,179,8,0.07);border:1px solid rgba(234,179,8,0.2);border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
        <p style="color:#f1f5f9;font-size:16px;font-weight:700;margin:0 0 8px;">Know Someone Who Needs This?</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;line-height:1.6;">Refer a friend and earn a referral reward when they enroll.</p>
        <a href="${referralLink}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">SHARE MY REFERRAL LINK →</a>
      </div>
      <div style="background:#0f172a;border:1px solid rgba(234,179,8,0.15);border-radius:10px;padding:20px 24px;margin-bottom:20px;display:table;width:100%;">
        <div style="display:table-cell;vertical-align:middle;">
          <p style="color:#f1f5f9;font-size:14px;font-weight:700;margin:0 0 4px;">Credit Maintenance Plan</p>
          <p style="color:#EAB308;font-size:22px;font-weight:900;margin:0;">$49<span style="color:#64748b;font-size:12px;">/mo</span></p>
        </div>
        <div style="display:table-cell;vertical-align:middle;text-align:right;width:120px;">
          <a href="${MAINTENANCE_STRIPE}" style="display:inline-block;background:#EAB308;color:#020617;font-weight:800;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;">START NOW</a>
        </div>
      </div>`;
    await client.emails.send({ from: FROM, to: data.email, subject: "30-Day Check-In: How's Your Credit Looking?", html: wrapEmail(content) });
  } catch (err) { console.error("Email 08 failed:", err); }
}
