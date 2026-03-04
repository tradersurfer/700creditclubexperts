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
