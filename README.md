# 700 Credit Club Experts

**Full-stack credit restoration SaaS platform.** Consumer law-compliant, FCRA/FDCPA-grounded, Florida licensed. Built for real clients doing real dispute work — not a template, not a course wrapper.

> 79% of Americans have errors on their credit reports. This platform finds them, disputes them, and tracks the outcome.

---

## What This Is

A production web application that handles the full credit restoration client lifecycle:

```
Lead Capture → Audit Intake → Program Enrollment → Client Portal
     ↓               ↓               ↓                   ↓
 Free Audit      AI Analysis      Stripe Payment      CRC Sync
     ↓               ↓               ↓                   ↓
  Email #1      Score Report    Welcome + Login     Dispute Rounds
                                                         ↓
                                              8-Email Drip Sequence
                                                         ↓
                                              30-Day Check-In + Upsell
```

AI dispute analysis is handled by **Agent Nova** (private repo — `700creditclub-bot`), which integrates with Credit Repair Cloud and automates dispute letter generation, bureau targeting, and round tracking.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | JWT (HS256) + PBKDF2 password hashing (100k iterations, SHA-512) |
| Email | Resend API — 8-email automated sequence |
| AI Layer | Agent Nova (Credit Repair Cloud integration — private) |
| Deployment | Railway (full-stack) or Netlify + Railway (split) |
| Serverless | Netlify Functions (analyze-credit, api) |

---

## Pages (13 Routes)

| Route | Page |
|-------|------|
| `/` | Home — Hero, Stats, Bridge, Programs, Client Results |
| `/audit` | Free Credit Audit Intake |
| `/start-audit` | Full Audit Workflow |
| `/enroll` | Self-Enrollment (Save $400) |
| `/programs` | All Credit Programs |
| `/home-ownership` | Mortgage Readiness Program |
| `/business-credit` | Business Credit Division |
| `/features` | Platform Features |
| `/about` | About 700 Credit Club Experts |
| `/portal` | Client Portal (JWT protected) |
| `/affiliate` | Affiliate Portal (JWT protected) |
| `/thank-you` | Confirmation / Thank You |
| `/success` | Enrollment Success |

---

## Programs & Pricing

| Program | Price | Affiliate Commission (20%) |
|---------|-------|--------------------------|
| Partial Sweep | $199 | $39.80 |
| Full Sweep | $499 | $99.80 |
| Full Sweep + Builder | $749 | $149.80 |

---

## Email Automation Sequence (8 Emails)

Triggered automatically on enrollment via Resend API. Full HTML branded templates.

| # | Trigger | Email |
|---|---------|-------|
| 01 | Enrollment | Welcome + Portal Credentials |
| 02 | Day 2 | Credit Hero Score Breakdown |
| 03 | Day 5 | Report Review Call CTA |
| 04 | Round 1 Sent | Dispute Letters Dispatched |
| 05 | Bureau Response | Bureau Response Received |
| 06 | Round Complete | Round Summary + Next Steps |
| 07 | Program End | Program Complete + Results |
| 08 | Day 30 | 30-Day Check-In + Upsell |

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | User registration |
| POST | `/api/auth/login` | None | Login → JWT |
| POST | `/api/auth/refresh` | Refresh token | Token rotation |
| POST | `/api/auth/logout` | JWT | Revoke tokens |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/auth/change-password` | JWT | Update password |

### Client & Affiliate
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/intake` | None | Audit form submission |
| GET | `/api/client/dashboard` | JWT (client) | CRC data proxy |
| GET | `/api/affiliate/dashboard` | JWT (affiliate) | Affiliate stats |
| GET | `/api/affiliate/referral-link` | JWT (affiliate) | Generate referral URL |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/leads` | Admin key | All leads |
| GET | `/api/admin/users` | Admin key | All users |
| PATCH | `/api/admin/users/:id/crc` | Admin key | Link CRC account |

---

## Security

- PBKDF2 password hashing (100,000 iterations, SHA-512)
- JWT access tokens (15 min) + refresh tokens (30 days) with rotation
- Rate limiting: auth (10/15min), API (60/min), intake (5/hour)
- Role-based access control: `client` / `affiliate` / `admin`
- Security headers: HSTS, CSP, X-Frame-Options
- CORS whitelist
- Input sanitization (XSS prevention)
- Audit logging for all sensitive actions
- CRC API key never exposed to client (server-side proxy only)

---

## Credit Repair Cloud Integration

The client portal proxies all CRC data server-side. The API key never touches the frontend.

Without `CRC_API_KEY`, portals run in **mock data mode** — safe for demos and development.

CRC endpoints used:

```
GET /clients/:id          → Client profile and scores
GET /clients/:id/disputes → Dispute items
GET /clients/:id/rounds   → Dispute rounds
GET /affiliates/:id       → Affiliate data
```

---

## AI Layer — Agent Nova

The dispute analysis and automation engine lives in a **separate private repo** (`700creditclub-bot`). It handles:

- Credit report ingestion and error identification
- Dispute letter generation (FCRA/FDCPA compliant)
- Bureau targeting (Experian, Equifax, TransUnion)
- Round tracking and follow-up automation
- Go High Level integration for client communication

This repo (the platform) calls the agent via API. The agent's prompt engineering, workflow logic, and CRC automation are proprietary.

---

## Setup

### 1 — Clone and install

```bash
git clone https://github.com/tradersurfer/700creditclubexperts.git
cd 700creditclubexperts
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
```

Required variables:

```
DATABASE_URL=        # PostgreSQL connection string (Neon recommended)
JWT_SECRET=          # 64+ character random string
RESEND_API_KEY=      # From resend.com
ADMIN_API_KEY=       # Random string for admin endpoints
CRC_API_KEY=         # Credit Repair Cloud API key (optional — runs mock without it)
FRONTEND_URL=        # Your deployed frontend URL
```

### 3 — Set up database

```bash
npm run db:push
```

### 4 — Run locally

```bash
npm run dev
```

Runs full-stack on `http://localhost:5000`

---

## Deployment

### Railway (Recommended — Full Stack)

```bash
railway login
railway init
railway up
```

Set all `.env` values as Railway environment secrets.

### Netlify + Railway (Split)

**Frontend (Netlify):**
- Build command: `npm run build`
- Publish directory: `dist/public`
- Add `VITE_API_URL` = your Railway backend URL

**Backend (Railway):**
- Deploy `server/` separately
- Set `FRONTEND_URL` to your Netlify domain

---

## Compliance

Licensed in the State of Florida.

- 15 USC § 1681 — Fair Credit Reporting Act (FCRA)
- 15 USC § 1692 — Fair Debt Collection Practices Act (FDCPA)

---

## Contact

- Sales: sales@700creditclubexperts.com
- Admin: jecitax@gmail.com
- Community: [skool.com/700-credit-club-experts-7830](https://skool.com/700-credit-club-experts-7830)
- Facebook: [facebook.com/700creditexperts](https://facebook.com/700creditexperts)

---

## Part of the JECI Group Stack

Built and maintained by [Adrian Jordan](https://github.com/tradersurfer) · [JECI Group](https://jecigroup.com)

**Related:** [`700creditclub-bot`](https://github.com/tradersurfer/700creditclub-bot) (private) — Agent Nova, the AI dispute engine that powers this platform.

> *Financial sovereignty isn't a mindset. It's an architecture.*
