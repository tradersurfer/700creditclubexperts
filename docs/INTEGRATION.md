# Credit Audit Integration — 700 Credit Club Experts
## Deployment Guide · June 2026

---

## What's in this package

| File | Purpose |
|---|---|
| `FreeCreditAudit.tsx` | Drop-in replacement for the existing `/free-credit-audit` page on 700creditclubexperts.com |
| `CreditAuditWidget.tsx` | Standalone self-contained embed component for jecicredit.com (and any future site) |

---

## FreeCreditAudit.tsx — Integration Steps

### 1. Replace the existing file
```
src/pages/FreeCreditAudit.tsx  ← replace with this file
```
All existing marketing sections are preserved exactly. The only behavioral change
is `handleFileProcess` now calls JECI AI instead of the fake `setTimeout`.

### 2. Set Railway environment variable
In your Railway service dashboard → Variables tab, add:

```
VITE_ANTHROPIC_API_KEY = sk-ant-...your-key...
```

This is the same Anthropic API key already used by the JECI Dispute Agent.

### 3. What changed vs original
- `handleFileProcess` → real `runJeciAnalysis()` call to `claude-sonnet-4-20250514`
- Added `pasteText` / `showPaste` state — user can paste report text if PDF extraction fails
- Added `statusMsg` for granular loading feedback
- `AuditReportView` component renders the full 8-section report inline after analysis
- `reportRef` scrolls the user smoothly down to the results
- Marketing sections (What We Cover, How It Works, FICO Factors, FAQ, CTA) only render
  when `!report` — they disappear while the report is on screen, then return on reset
- "Download PDF" calls `window.print()` — user saves as PDF from browser dialog

---

## CreditAuditWidget.tsx — jecicredit.com Embed

### Usage
```tsx
// Basic drop-in
import { CreditAuditWidget } from "@/components/CreditAuditWidget";

export default function SomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <CreditAuditWidget />
    </div>
  );
}
```

### With props (JECI brand variant)
```tsx
<CreditAuditWidget
  brand="jeci"
  ctaUrl="https://www.700creditclubexperts.com/start"
  ctaLabel="Get My Free Credit Repair Consultation →"
/>
```

### Props
| Prop | Default | Options |
|---|---|---|
| `brand` | `"700cc"` | `"700cc"` \| `"jeci"` |
| `ctaUrl` | `"https://www.700creditclubexperts.com"` | any URL |
| `ctaLabel` | `"Start My Credit Repair With 700 Credit Club →"` | any string |

### ENV required (same as above)
```
VITE_ANTHROPIC_API_KEY = sk-ant-...
```

---

## PDF Upload Notes
- **TXT files**: extracted directly via FileReader — best results
- **PDFs**: browser can't extract text client-side without a library
  - Current behavior: passes a fallback prompt, JECI generates a representative audit
  - **For production PDF text extraction**, wire `pdf.js` or route through your Railway
    API endpoint to use `pdfplumber` on the server side

### Recommended server-side PDF route (future)
```
POST /api/extract-pdf
  Body: multipart/form-data with file
  Returns: { text: string }

Then pass text to runJeciAnalysis()
```

---

## Architecture Notes

```
User uploads report
       ↓
FreeCreditAudit.tsx / CreditAuditWidget.tsx
       ↓
runJeciAnalysis(text) → Anthropic API (claude-sonnet-4-20250514)
       ↓
Returns structured JSON (AuditReport)
       ↓
AuditReportView renders 8 sections inline
       ↓
User downloads PDF via window.print()
       ↓
Section 8 CTA → 700creditclubexperts.com conversion
```

---

## Notes for JECI Dispute Agent integration (future)
When the JECI Dispute Agent modules are separated, you can wire the negative items
from this audit directly into the dispute pipeline:

```typescript
// Future: send negativeItems to JECI Dispute Agent
const disputePayload = report.negativeItems
  .filter(item => item.disputability === "Potentially Disputable")
  .map(item => ({
    type:     mapStatusToDisputeType(item.status),   // "collection" | "charge_off" etc.
    creditor: item.accountName,
    bureaus:  item.bureaus,
    amount:   item.balance,
  }));

await fetch("/api/jeci/dispute", {
  method: "POST",
  body: JSON.stringify({ clientId, items: disputePayload })
});
```

This creates a direct pipeline: Free Audit → identify disputables → JECI auto-generates letters.