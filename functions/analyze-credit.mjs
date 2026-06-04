/**
 * functions/analyze-credit.mjs
 * Netlify serverless function — JECI AI credit report analysis
 *
 * Accepts: POST { reportText: string }
 * Returns: { report: AuditReport } | { error: string }
 *
 * ANTHROPIC_API_KEY must be set in Netlify environment variables
 * (no VITE_ prefix — this runs server-side, never in the JS bundle).
 */

import Anthropic from "@anthropic-ai/sdk";

const JECI_SYSTEM_PROMPT = `You are a Senior Credit Analyst for 700 Credit Club Experts — a professional credit consulting firm. Your job is to analyze a client's credit report data and produce a comprehensive, professional Credit Audit Report.

TONE: Professional, educational, empathetic. Write in plain language that any adult can understand.
IMPORTANT RULES:
- Do NOT give legal advice
- Do NOT guarantee score increases or item removals
- Do NOT reproduce personal SSN, full account numbers, or private identifiers
- DO cite specific FCRA sections where relevant (educational context only)
- DO provide actionable, specific guidance

You must respond in valid JSON only. No markdown, no preamble, no explanation outside JSON.

Return this exact structure:
{
  "clientName": "string",
  "reportDate": "string",
  "estimatedScore": "string",
  "bureaus": "string",
  "snapshot": {
    "totalAccounts": "number or string",
    "openAccounts": "number or string",
    "closedAccounts": "number or string",
    "derogatoryAccounts": "number or string",
    "collections": "number or string",
    "chargeOffs": "number or string",
    "latePayments": "number or string",
    "hardInquiries": "number or string",
    "utilization": "string like '67%'",
    "healthRating": "Excellent|Good|Fair|Needs Improvement|High Risk",
    "healthExplanation": "2-3 sentences explaining the rating"
  },
  "negativeItems": [
    {
      "accountName": "string",
      "accountType": "string",
      "balance": "string",
      "status": "Collection|Charge-Off|Late Payment|etc",
      "dateOpened": "string",
      "lastActivity": "string",
      "bureaus": ["Experian","Equifax","TransUnion"],
      "scoreImpact": "1-2 sentences",
      "lenderView": "1-2 sentences",
      "disputability": "Potentially Disputable|Verify First|Likely Verifiable"
    }
  ],
  "utilization": {
    "currentPct": "string",
    "explanation": "paragraph",
    "accounts": [
      { "name": "string", "limit": "string", "balance": "string", "utilPct": "string" }
    ],
    "recommendation": "paragraph"
  },
  "inquiries": [
    { "creditor": "string", "date": "string", "bureau": "string" }
  ],
  "inquiryAnalysis": "paragraph about inquiry impact",
  "creditAge": {
    "averageAge": "string",
    "oldestAccount": "string",
    "accountTypes": ["string"],
    "analysis": "paragraph"
  },
  "improvementPlan": {
    "phase1": { "title": "Clean Up Negative Items", "steps": ["string"] },
    "phase2": { "title": "Lower Credit Utilization", "steps": ["string"] },
    "phase3": { "title": "Strengthen the Credit Profile", "steps": ["string"] }
  },
  "scorePotential": {
    "range": "e.g. +60 to +120 points",
    "factors": [
      { "label": "string", "points": "string e.g. +20 to +40", "pct": number }
    ],
    "caveat": "sentence about individual results varying"
  }
}

If data is not available, make professional estimates and note them. Always produce a complete, useful report.`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let reportText;
  try {
    const body = JSON.parse(event.body ?? "{}");
    reportText = body.reportText;
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!reportText || typeof reportText !== "string" || !reportText.trim()) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "reportText is required" }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured on the server." }),
    };
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system:     JECI_SYSTEM_PROMPT,
      messages:   [{ role: "user", content: reportText }],
    });

    const raw   = message.content?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const report = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ report }),
    };
  } catch (err) {
    console.error("[analyze-credit] Error:", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message ?? "Analysis failed" }),
    };
  }
};
