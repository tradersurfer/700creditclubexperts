import { Router, type Request, type Response } from "express";
import { Resend } from "resend";

const router = Router();

const allowedSequences = [
  "welcome",
  "credit_hero_invite",
  "upload_reminder",
  "review_call_prompt",
  "closer_alert",
] as const;

type Sequence = (typeof allowedSequences)[number];

type SequencePayload = {
  sequence?: string;
  email?: string;
  firstName?: string;
  name?: string;
  tempPassword?: string;
  portalUrl?: string;
  creditHeroUrl?: string;
  uploadUrl?: string;
  calendlyUrl?: string;
  closerEmail?: string;
  leadEmail?: string;
  leadPhone?: string;
  leadName?: string;
  message?: string;
};

function isAllowedSequence(sequence: string): sequence is Sequence {
  return allowedSequences.includes(sequence as Sequence);
}

function getHeaderSecret(req: Request): string | undefined {
  const header = req.headers["x-comms-secret"];
  return Array.isArray(header) ? header[0] : header;
}

function getRecipient(sequence: Sequence, payload: SequencePayload): string | undefined {
  if (sequence === "closer_alert") {
    return process.env.CLOSER_ALERT_EMAIL || payload.closerEmail;
  }

  return payload.email;
}

function buildEmail(sequence: Sequence, payload: SequencePayload) {
  const firstName = payload.firstName || payload.name || "there";
  const portalUrl = payload.portalUrl || process.env.FRONTEND_URL || "https://700creditclubexperts.com";
  const creditHeroUrl = payload.creditHeroUrl || process.env.CREDIT_HERO_URL || "https://creditheroscore.com";
  const uploadUrl = payload.uploadUrl || `${portalUrl.replace(/\/$/, "")}/portal`;
  const calendlyUrl = payload.calendlyUrl || process.env.CALENDLY_URL || "https://calendly.com/700creditclubexperts";

  switch (sequence) {
    case "welcome":
      return {
        subject: "Welcome to 700 Credit Club Experts",
        html: `<p>Hi ${firstName}, welcome to 700 Credit Club Experts.</p><p>Your onboarding has started. You can access your portal here: <a href="${portalUrl}">${portalUrl}</a></p>`,
      };
    case "credit_hero_invite":
      return {
        subject: "Pull your Credit Hero score",
        html: `<p>Hi ${firstName}, please pull your Credit Hero score so we can establish your baseline.</p><p><a href="${creditHeroUrl}">Get your score</a></p>`,
      };
    case "upload_reminder":
      return {
        subject: "Reminder: upload your credit documents",
        html: `<p>Hi ${firstName}, this is a reminder to upload your credit documents so our team can keep your file moving.</p><p><a href="${uploadUrl}">Upload documents</a></p>`,
      };
    case "review_call_prompt":
      return {
        subject: "Schedule your credit review call",
        html: `<p>Hi ${firstName}, your next step is to schedule a review call with our team.</p><p><a href="${calendlyUrl}">Book your call</a></p>`,
      };
    case "closer_alert":
      return {
        subject: `Closer alert: ${payload.leadName || payload.name || "new lead"}`,
        html: `<p>A lead needs follow-up.</p><p>Name: ${payload.leadName || payload.name || "Not provided"}</p><p>Email: ${payload.leadEmail || payload.email || "Not provided"}</p><p>Phone: ${payload.leadPhone || "Not provided"}</p><p>${payload.message || ""}</p>`,
      };
  }
}

router.post("/sequence-trigger", async (req: Request, res: Response) => {
  const configuredSecret = process.env.COMMS_WEBHOOK_SECRET;
  const providedSecret = getHeaderSecret(req);

  if (!configuredSecret || !providedSecret || providedSecret !== configuredSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body as SequencePayload;
  const sequence = payload.sequence;

  if (!sequence || !isAllowedSequence(sequence)) {
    return res.status(400).json({ error: "Invalid sequence", allowedSequences });
  }

  const to = getRecipient(sequence, payload);
  if (!to) {
    return res.status(400).json({ error: "Missing recipient" });
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    return res.status(500).json({ error: "EMAIL_FROM is not configured" });
  }

  const email = buildEmail(sequence, payload);
  if (!process.env.RESEND_API_KEY) {
    return res.json({ ok: true, mocked: true, sequence, to });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to,
    subject: email.subject,
    html: email.html,
  });

  return res.json({ ok: true, mocked: false, sequence, to, id: result.data?.id });
});

export default router;
