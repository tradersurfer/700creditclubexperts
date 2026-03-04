# 700 Credit Club Experts — Web Platform

**Consumer Law Credit Restoration · FCRA/FDCPA Compliant · Florida Licensed**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | JWT (HS256) + PBKDF2 password hashing |
| Email | Resend API |
| AI | JECI AI (Credit Repair Cloud integration) |

---

## Environment Setup

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string (Neon recommended)
- `JWT_SECRET` — 64+ character random string
- `RESEND_API_KEY` — From resend.com
- `ADMIN_API_KEY` — Random string for admin endpoints
- `CRC_API_KEY` — Credit Repair Cloud API key
- `FRONTEND_URL` — Your deployed frontend URL

---

## Local Development

```bash
npm install
npm run dev
```

Runs full-stack on http://localhost:5000

---

## Deployment

### Option A: Railway (Recommended — Full Stack)

1. Connect GitHub repo to Railway
2. Railway auto-detects Node.js
3. Add environment variables in Railway dashboard
4. Deploy — Railway runs `npm run build && npm start`

### Option B: Netlify (Frontend) + Railway (Backend)

**Frontend (Netlify):**
1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/public`
4. Add `VITE_API_URL` = your Railway backend URL

**Backend (Railway/Render):**
1. Deploy server separately
2. Set `FRONTEND_URL` to your Netlify domain for CORS
3. Update `netlify.toml` API redirect to point to backend URL

### Option C: Fly.io (Full Stack)

```bash
flyctl launch
flyctl secrets set JWT_SECRET=... DATABASE_URL=... RESEND_API_KEY=...
flyctl deploy
```

---

## Database Setup

```bash
# Push schema to database
npm run db:push

# Run migrations (if using migration files)
npm run db:migrate
```

---

## Pages & Routes

| Route | Page |
|---|---|
| `/` | Home (Hero, Stats, Bridge, Programs, Results) |
| `/audit` | Free Credit Audit Intake Form |
| `/enroll` | Self-Enrollment (Save $400) |
| `/programs` | All Credit Programs |
| `/home-ownership` | Mortgage Readiness Program |
| `/business-credit` | Business Credit Division |
| `/features` | Platform Features |
| `/about` | About Us |
| `/portal` | Client Portal (JWT protected) |
| `/affiliate` | Affiliate Portal (JWT protected) |
| `/thank-you` | Thank You / Confirmation |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | User registration |
| POST | `/api/auth/login` | None | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh token | Token rotation |
| POST | `/api/auth/logout` | JWT | Revoke tokens |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/auth/change-password` | JWT | Update password |
| POST | `/api/intake` | None | Audit form submission |
| GET | `/api/client/dashboard` | JWT (client) | CRC data proxy |
| GET | `/api/affiliate/dashboard` | JWT (affiliate) | Affiliate stats |
| GET | `/api/affiliate/referral-link` | JWT (affiliate) | Generate referral URL |
| GET | `/api/admin/leads` | Admin key | All leads |
| GET | `/api/admin/users` | Admin key | All users |
| PATCH | `/api/admin/users/:id/crc` | Admin key | Link CRC account |

---

## Security Features

- PBKDF2 password hashing (100,000 iterations, SHA-512)
- JWT access tokens (15 min) + refresh tokens (30 days)
- Token rotation on refresh
- Rate limiting: auth (10/15min), API (60/min), intake (5/hour)
- Role-based access control (client / affiliate / admin)
- Security headers (HSTS, CSP, X-Frame-Options)
- CORS whitelist
- Input sanitization (XSS prevention)
- Audit logging for all sensitive actions

---

## Credit Repair Cloud Integration

The portal proxies all CRC data server-side (API key never exposed to client).

Set `CRC_API_KEY` in environment variables. Without it, portals run in mock data mode for demo/development.

CRC endpoints used:
- `GET /clients/:id` — Client profile and scores
- `GET /clients/:id/disputes` — Dispute items
- `GET /clients/:id/rounds` — Dispute rounds
- `GET /affiliates/:id` — Affiliate data

---

## Brand Assets

Images in `/client/public/images/`:
- `logo.jpg` — Company logo
- `credit-vault-hero.jpg` — Hero section vault graphic
- `700-club-wins.jpg` — Stats/wins graphic
- `results-score-report.jpg` — Client score proof #1
- `results-score-increase.jpg` — Client score proof #2
- `results-card-approval.jpg` — Client approval proof

---

## Commission Structure

| Program | Price | Commission (20%) |
|---|---|---|
| Partial Sweep | $199 | $39.80 |
| Full Sweep | $499 | $99.80 |
| Full Sweep + Builder | $749 | $149.80 |

---

## Contacts

- **Sales:** sales@700creditclubexperts.com
- **Admin:** jecitax@gmail.com (Adrian Jordan)
- **Facebook:** facebook.com/700creditexperts
- **Community:** skool.com/700-credit-club-experts-7830

---

*Licensed in the State of Florida · 15 USC 1681 (FCRA) · 15 USC 1692 (FDCPA)*
