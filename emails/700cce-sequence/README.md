# 700 Credit Club Experts — 8-Email Automated Sequence

## Overview

This folder contains all 8 production-ready HTML email templates for the
700 Credit Club Experts automated client journey, plus the TypeScript trigger
functions in `server/email.ts`.

The site uses **Resend** (`resend` npm package) — not SendGrid. All templates
are standard HTML and work with any transactional email provider.

---

## Email Sequence Summary

| # | File | Subject | Trigger |
|---|------|---------|---------|
| 1 | `01-welcome-credentials.html` | Welcome to 700 Credit Club Experts — Your Portal is Ready | New client in CRC / `/api/intake` form submission |
| 2 | `02-credit-hero-score.html` | Quick Action: Pull Your Free Credit Hero Score | Day 1 (+24h scheduled after enrollment) |
| 3 | `03-report-review-call.html` | Schedule Your Free Report Review Call | Day 2 (+48h scheduled after enrollment) |
| 4 | `04-round1-dispatched.html` | Round 1 Disputes Have Been Sent to All 3 Bureaus | CRC webhook: `round.dispatched` |
| 5 | `05-bureau-response.html` | Update: We've Received Responses from the Bureaus | CRC webhook: `dispute.response_received` |
| 6 | `06-round-complete.html` | Round X Complete — Here's What We Achieved | CRC webhook: `round.completed` |
| 7 | `07-program-complete.html` | Your Credit Restoration Program is Complete — Lifetime Guarantee Activated | CRC webhook: `client.program_completed` |
| 8 | `08-30-day-checkin.html` | 30-Day Check-In: How's Your Credit Looking? | Scheduled: +30 days after `client.program_completed` |

---

## Dynamic Variables

All templates use `{{variable_name}}` placeholders. Replace server-side before sending.

| Variable | Description |
|----------|-------------|
| `{{first_name}}` | Client's first name |
| `{{client_email}}` | Client's email address |
| `{{temp_password}}` | Temporary portal password |
| `{{client_portal_link}}` | Full URL to `/portal` |
| `{{credit_hero_url}}` | Credit Hero Score signup URL |
| `{{calendly_link}}` | Calendly booking URL |
| `{{items_count}}` | Number of items disputed in round |
| `{{deleted_count}}` | Number of items deleted |
| `{{verified_count}}` | Number of items verified/escalated |
| `{{round_number}}` | Round number (1, 2, 3…) |
| `{{score_before}}` | Score before the round |
| `{{score_after}}` | Score after the round |
| `{{score_gain}}` | Point difference |
| `{{total_deleted}}` | Total items deleted across all rounds |
| `{{score_start}}` | Score at program start |
| `{{score_end}}` | Score at program end |
| `{{score_current}}` | Current estimated score |
| `{{maintenance_stripe}}` | Stripe link for $49/mo maintenance plan |
| `{{community_link}}` | Skool community URL |
| `{{referral_link}}` | Client's unique referral URL |
| `{{upsell_link}}` | Stripe link for Full Sweep upgrade |
| `{{unsubscribe_link}}` | Unsubscribe URL (CAN-SPAM required) |
| `{{next_steps}}` | Text description of next steps |

---

## Using with Resend (Current Setup)

The trigger functions are in `server/email.ts`. Call them directly:

```typescript
import { sendEmail01Welcome, sendEmail04Round1Dispatched } from "./email";

// After new enrollment:
await sendEmail01Welcome({ firstName: "John", email: "john@example.com", tempPassword: "ABCD1234" });

// After CRC round dispatched webhook:
await sendEmail04Round1Dispatched({ firstName: "John", email: "john@example.com", itemsCount: 7 });
```

### Environment Variables Required

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=sales@700creditclubexperts.com
ADMIN_EMAIL=jecitax@gmail.com
FRONTEND_URL=https://700creditclubexperts.com
CREDIT_HERO_URL=https://creditheroscore.com
CALENDLY_URL=https://calendly.com/700creditclubexperts
MAINTENANCE_STRIPE_URL=https://buy.stripe.com/xxxxx   # $49/mo plan link
```

---

## Using with SendGrid (Alternative)

1. Log in to SendGrid → Email API → Dynamic Templates → Create Template
2. Paste the HTML from each template file as the template body
3. Note the `d-XXXXXXXXXXXXXXXXXX` template ID for each email
4. Update the `// SendGrid Template ID:` comment in each HTML file
5. Replace Resend calls in `email.ts` with the `@sendgrid/mail` SDK:

```typescript
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: clientEmail,
  from: "sales@700creditclubexperts.com",
  templateId: "d-XXXXXXXXXXXXXXXXXX",  // Email 1 template ID
  dynamicTemplateData: {
    first_name: "John",
    client_portal_link: "https://700creditclubexperts.com/portal",
    temp_password: "ABCD1234",
    unsubscribe_link: "https://700creditclubexperts.com/unsubscribe?token=xyz",
  },
});
```

---

## Connecting to CRC Webhooks

Credit Repair Cloud fires webhooks when client status changes. Add handlers
in `server/routes.ts`:

```typescript
// CRC Webhook handler
app.post("/api/webhooks/crc", async (req, res) => {
  const { event, client } = req.body;

  switch (event) {
    case "client.created":
      await sendEmail01Welcome({ firstName: client.first_name, email: client.email, tempPassword: client.temp_password });
      break;

    case "round.dispatched":
      await sendEmail04Round1Dispatched({ firstName: client.first_name, email: client.email, itemsCount: client.items_count });
      break;

    case "dispute.response_received":
      await sendEmail05BureauResponse({ firstName: client.first_name, email: client.email, deletedCount: client.deleted, verifiedCount: client.verified });
      break;

    case "round.completed":
      await sendEmail06RoundComplete({ firstName: client.first_name, email: client.email, roundNumber: client.round_number, itemsDeleted: client.items_deleted, scoreBefore: client.score_before, scoreAfter: client.score_after });
      break;

    case "client.program_completed":
      await sendEmail07ProgramComplete({ firstName: client.first_name, email: client.email, totalDeleted: client.total_deleted, scoreStart: client.score_start, scoreEnd: client.score_end });
      // Schedule Email 8 for +30 days (use a job queue like BullMQ or Inngest)
      break;
  }

  res.json({ received: true });
});
```

### Day-1 and Day-2 Scheduled Emails

Use a job queue (BullMQ, Inngest, or a simple DB-backed scheduler) to fire
Emails 2 and 3 on a delay:

```typescript
// After client.created webhook:
await scheduleJob("email-02-credit-hero", { email: client.email, firstName: client.first_name }, delay: "24h");
await scheduleJob("email-03-review-call", { email: client.email, firstName: client.first_name }, delay: "48h");
// Email 8: +30 days after program_completed
await scheduleJob("email-08-checkin", { email: client.email, firstName: client.first_name }, delay: "720h");
```

---

## CAN-SPAM / Florida CROA Compliance Notes

- Every template includes an unsubscribe link (`{{unsubscribe_link}}`). **This is legally required.** Implement an unsubscribe endpoint at `/api/unsubscribe?token=xxx` that marks the contact as opted out in your DB.
- Physical address must be included. Add your registered Florida business address to the footer of each template before going live.
- Email 2 (Day 1) and Email 3 (Day 2) are transactional relationship emails triggered by enrollment — they do not require opt-in under CAN-SPAM as long as the primary purpose is transactional.
- Upsell emails (6, 7, 8) contain commercial content — ensure opt-out is honored.

---

## File Structure

```
emails/
└── 700cce-sequence/
    ├── README.md                    ← This file
    ├── shared-styles.html           ← Reusable CSS fragment
    ├── 01-welcome-credentials.html
    ├── 02-credit-hero-score.html
    ├── 03-report-review-call.html
    ├── 04-round1-dispatched.html
    ├── 05-bureau-response.html
    ├── 06-round-complete.html
    ├── 07-program-complete.html
    └── 08-30-day-checkin.html
```

Trigger functions live in: `server/email.ts` (exported as `sendEmail01Welcome`, `sendEmail02CreditHero`, etc.)
