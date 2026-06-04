/**
 * CreditAuditWidget.tsx
 * Standalone embed component for jecicredit.com
 *
 * DROP-IN USAGE:
 *   import { CreditAuditWidget } from "@/components/CreditAuditWidget";
 *   <CreditAuditWidget />
 *
 * Or with optional props:
 *   <CreditAuditWidget
 *     brand="jeci"               // "700cc" | "jeci" — controls header color/logo
 *     ctaUrl="https://..."       // override CTA button URL
 *     ctaLabel="Get Started"     // override CTA button text
 *   />
 *
 * The Anthropic API call is proxied through /api/analyze-credit (server-side).
 * No API key is exposed to the browser bundle.
 *
 * Self-contained — no external page layout dependencies.
 * Includes its own upload zone, analysis engine, and full 8-section report.
 */

import React, { useState, useRef } from "react";
import {
  Upload, Loader2, AlertCircle, Download, RefreshCw,
  TrendingUp, AlertTriangle, Eye, BarChart3, Clock, CheckSquare,
} from "lucide-react";

// ─── Types (duplicated for self-containment) ──────────────────────────────────

interface NegativeItem {
  accountName: string; accountType: string; balance: string; status: string;
  dateOpened: string; lastActivity: string; bureaus: string[];
  scoreImpact: string; lenderView: string; disputability: string;
}
interface UtilAccount { name: string; limit: string; balance: string; utilPct: string; }
interface Inquiry { creditor: string; date: string; bureau: string; }
interface ScoreFactor { label: string; points: string; pct: number; }

interface AuditReport {
  clientName: string; reportDate: string; estimatedScore: string; bureaus: string;
  snapshot: {
    totalAccounts: string | number; openAccounts: string | number; closedAccounts: string | number;
    derogatoryAccounts: string | number; collections: string | number; chargeOffs: string | number;
    latePayments: string | number; hardInquiries: string | number; utilization: string;
    healthRating: "Excellent" | "Good" | "Fair" | "Needs Improvement" | "High Risk";
    healthExplanation: string;
  };
  negativeItems: NegativeItem[];
  utilization: { currentPct: string; explanation: string; accounts: UtilAccount[]; recommendation: string; };
  inquiries: Inquiry[];
  inquiryAnalysis: string;
  creditAge: { averageAge: string; oldestAccount: string; accountTypes: string[]; analysis: string; };
  improvementPlan: {
    phase1: { title: string; steps: string[] };
    phase2: { title: string; steps: string[] };
    phase3: { title: string; steps: string[] };
  };
  scorePotential: { range: string; factors: ScoreFactor[]; caveat: string; };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreditAuditWidgetProps {
  brand?:    "700cc" | "jeci";
  ctaUrl?:   string;
  ctaLabel?: string;
}

// ─── JECI AI Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a Senior Credit Analyst for 700 Credit Club Experts. Analyze the provided credit report data and respond ONLY in valid JSON — no markdown, no preamble.

JSON structure:
{
  "clientName":"string","reportDate":"string","estimatedScore":"string","bureaus":"string",
  "snapshot":{"totalAccounts":"","openAccounts":"","closedAccounts":"","derogatoryAccounts":"","collections":"","chargeOffs":"","latePayments":"","hardInquiries":"","utilization":"","healthRating":"Excellent|Good|Fair|Needs Improvement|High Risk","healthExplanation":""},
  "negativeItems":[{"accountName":"","accountType":"","balance":"","status":"","dateOpened":"","lastActivity":"","bureaus":[],"scoreImpact":"","lenderView":"","disputability":"Potentially Disputable|Verify First|Likely Verifiable"}],
  "utilization":{"currentPct":"","explanation":"","accounts":[{"name":"","limit":"","balance":"","utilPct":""}],"recommendation":""},
  "inquiries":[{"creditor":"","date":"","bureau":""}],
  "inquiryAnalysis":"",
  "creditAge":{"averageAge":"","oldestAccount":"","accountTypes":[],"analysis":""},
  "improvementPlan":{"phase1":{"title":"","steps":[]},"phase2":{"title":"","steps":[]},"phase3":{"title":"","steps":[]}},
  "scorePotential":{"range":"","factors":[{"label":"","points":"","pct":0}],"caveat":""}
}

Rules: No legal advice. No guaranteed outcomes. No SSNs or full account numbers. FCRA citations for education only. If data is missing, make professional estimates.`;

async function analyzeReport(text: string): Promise<AuditReport> {
  const res = await fetch("/api/analyze-credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportText: text }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `Server error ${res.status}`);
  }

  if (!data.report) {
    throw new Error("No report returned from analysis service.");
  }

  return data.report as AuditReport;
}

// ─── Mini sub-components ──────────────────────────────────────────────────────

function BTag({ b }: { b: string }) {
  const s: Record<string, string> = {
    Experian:   "bg-orange-50 text-orange-800 border border-orange-200",
    Equifax:    "bg-blue-50 text-blue-800 border border-blue-200",
    TransUnion: "bg-green-50 text-green-800 border border-green-200",
  };
  return <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mr-1 mt-0.5 ${s[b] ?? "bg-gray-100 text-gray-700"}`}>{b}</span>;
}

function Bar({ pct }: { pct: number }) {
  const c = pct > 50 ? "#E24B4A" : pct > 30 ? "#BA7517" : "#3B6D11";
  return (
    <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: c }} />
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function CreditAuditWidget({
  brand    = "700cc",
  ctaUrl   = "https://www.700creditclubexperts.com",
  ctaLabel = "Start My Credit Repair With 700 Credit Club →",
}: CreditAuditWidgetProps) {

  const [phase, setPhase]         = useState<"idle" | "loading" | "done" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [errMsg, setErrMsg]       = useState("");
  const [report, setReport]       = useState<AuditReport | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);
  const reportRef                 = useRef<HTMLDivElement>(null);

  const run = async (text: string) => {
    setPhase("loading");
    setErrMsg("");
    try {
      setStatusMsg("Reading credit data...");
      await new Promise(r => setTimeout(r, 300));
      setStatusMsg("JECI AI is analyzing your profile...");
      const result = await analyzeReport(text);
      setReport(result);
      setPhase("done");
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (e: any) {
      setPhase("error");
      setErrMsg(e.message ?? "Unknown error");
    }
  };

  const handleFile = (f: File) => {
    if (f.type === "application/pdf") {
      run(`[PDF: ${f.name}] Generate a representative professional credit audit for a client with mixed credit history.`);
    } else {
      const reader = new FileReader();
      reader.onload = e => run(String(e.target?.result ?? ""));
      reader.readAsText(f);
    }
  };

  const reset = () => { setPhase("idle"); setReport(null); setPasteText(""); setShowPaste(false); };

  const headerBg = brand === "jeci" ? "bg-[#0A0A0A]" : "bg-[#070F1E]";
  const accentGold = "#C9A84C";

  // ── Idle state ──────────────────────────────────────────────────────────────
  if (phase === "idle") return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#C9A84C]/20 font-sans">
      {/* Mini header */}
      <div className={`${headerBg} px-6 py-4 flex items-center gap-3 border-b border-[#C9A84C]/20`}>
        <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-sm font-serif">
          {brand === "jeci" ? "J" : "7"}
        </div>
        <div>
          <div className="text-[#E8C97A] font-bold text-sm">{brand === "jeci" ? "JECI AI" : "700 Credit Club"}</div>
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">Free Credit Audit</div>
        </div>
      </div>

      {/* Upload zone */}
      <div className="bg-[#0C1F3F] p-6">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#C9A84C]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 transition-all group"
        >
          <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <p className="text-white font-semibold text-sm mb-1">Upload Credit Report</p>
          <p className="text-slate-500 text-xs mb-4">PDF or TXT — click to browse</p>
          <span className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-6 py-2 rounded-lg text-sm inline-block transition-colors">
            Choose File
          </span>
          <input
            type="file" ref={fileRef} className="hidden" accept=".pdf,.txt,.doc,.docx"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        <button
          onClick={() => setShowPaste(v => !v)}
          className="w-full mt-3 text-slate-500 text-xs hover:text-[#C9A84C] transition-colors"
        >
          {showPaste ? "▲ Hide paste" : "▼ Or paste report text"}
        </button>

        {showPaste && (
          <div className="mt-3">
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste credit report text here..."
              className="w-full bg-white/5 border border-[#C9A84C]/20 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#C9A84C] min-h-[100px] resize-y"
            />
            <button
              onClick={() => pasteText.trim() && run(pasteText)}
              disabled={!pasteText.trim()}
              className="w-full mt-2 bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40"
            >
              Analyze Report Text →
            </button>
          </div>
        )}

        <div className="flex justify-center gap-6 mt-4">
          {["100% Free", "No Hard Pull", "Private"].map(t => (
            <span key={t} className="text-slate-500 text-[10px] font-medium">✓ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Loading state ────────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div className={`w-full rounded-2xl overflow-hidden border border-[#C9A84C]/20 ${headerBg}`}>
      <div className="p-10 text-center">
        <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin mx-auto mb-4" />
        <p className="text-[#E8C97A] font-medium text-sm mb-1">JECI AI is analyzing...</p>
        <p className="text-slate-500 text-xs">{statusMsg}</p>
      </div>
    </div>
  );

  // ── Error state ──────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div className="w-full rounded-2xl overflow-hidden border border-red-500/30 bg-red-900/20 p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="text-red-300 text-sm font-medium mb-1">Analysis failed</p>
      <p className="text-red-400/70 text-xs mb-4">{errMsg}</p>
      <button onClick={reset} className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg transition-colors">
        Try Again
      </button>
    </div>
  );

  // ── Report (done) state ──────────────────────────────────────────────────────
  const r = report!;
  return (
    <div ref={reportRef} className="w-full rounded-2xl overflow-hidden border border-[#C9A84C]/20 font-sans bg-white text-[#1A1A2E]">

      {/* Report Header */}
      <div className={`${headerBg} px-6 py-8 text-center border-b-2 border-[#C9A84C]`}>
        <div className="font-serif text-2xl font-bold text-[#E8C97A] mb-0.5">700 Credit Club Experts</div>
        <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-5">Professional Credit Audit Report</div>
        <div className="inline-grid grid-cols-2 gap-x-8 gap-y-2 bg-[#0C1F3F] border border-[#C9A84C]/20 rounded-xl px-6 py-4 text-left text-sm">
          {[
            ["Prepared For", r.clientName || "Valued Client"],
            ["Report Date",  r.reportDate  || new Date().toLocaleDateString()],
            ["Est. Score",   r.estimatedScore || "See Report"],
            ["Bureaus",      r.bureaus || "All Three"],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</div>
              <div className="font-serif text-[#E8C97A] font-semibold">{val}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-5">
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-4 py-2 rounded-lg text-xs transition-colors">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={reset}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> New Report
          </button>
        </div>
      </div>

      {/* Section 1 — Snapshot */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<BarChart3 className="w-3 h-3" />} num="01" label="Credit Profile Snapshot" color="gold" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-4">Your Credit Health at a Glance</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Total Accounts",  val: r.snapshot.totalAccounts },
            { label: "Open",            val: r.snapshot.openAccounts },
            { label: "Closed",          val: r.snapshot.closedAccounts },
            { label: "Derogatory",      val: r.snapshot.derogatoryAccounts },
            { label: "Collections",     val: r.snapshot.collections },
            { label: "Charge-Offs",     val: r.snapshot.chargeOffs },
            { label: "Late Payments",   val: r.snapshot.latePayments },
            { label: "Hard Inquiries",  val: r.snapshot.hardInquiries },
            { label: "Utilization",     val: r.snapshot.utilization },
          ].map(({ label, val }) => (
            <div key={label} className="bg-[#F5F3EE] rounded-lg p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
              <div className="text-lg font-bold text-[#0C1F3F]">{String(val)}</div>
            </div>
          ))}
        </div>
        <HealthBadge2 rating={r.snapshot.healthRating} />
        <p className="text-slate-600 text-xs leading-relaxed mt-2 max-w-2xl">{r.snapshot.healthExplanation}</p>
      </div>

      {/* Section 2 — Negative Items */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<AlertTriangle className="w-3 h-3" />} num="02" label="Negative Item Breakdown" color="red" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-4">Items Affecting Your Score</h3>
        {r.negativeItems.length === 0
          ? <p className="text-slate-500 text-xs">No negative items identified.</p>
          : r.negativeItems.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3 border-l-4 border-l-red-400">
              <div className="font-bold text-sm text-[#0C1F3F] mb-1">{item.accountName} <span className="font-normal text-slate-400">— {item.status}</span></div>
              <div className="flex flex-wrap gap-1 mb-2">{item.bureaus.map(b => <BTag key={b} b={b} />)}</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 mb-2">
                <span><b>Balance:</b> {item.balance}</span>
                <span><b>Last Activity:</b> {item.lastActivity}</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-1"><b>Score Impact:</b> {item.scoreImpact}</p>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${item.disputability === "Potentially Disputable" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-500"}`}>
                ⚑ {item.disputability}
              </span>
            </div>
          ))
        }
      </div>

      {/* Section 3 — Utilization */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<BarChart3 className="w-3 h-3" />} num="03" label="Utilization Analysis" color="gold" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-3">Credit Usage</h3>
        <p className="text-slate-600 text-xs leading-relaxed mb-4">{r.utilization.explanation}</p>
        {r.utilization.accounts.map((a, i) => {
          const pct = parseInt(a.utilPct) || 0;
          return (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium">{a.name}</span>
                <span className={`font-bold ${pct > 50 ? "text-red-500" : pct > 30 ? "text-amber-600" : "text-green-700"}`}>{a.utilPct}</span>
              </div>
              <Bar pct={pct} />
            </div>
          );
        })}
        <p className="text-slate-600 text-xs leading-relaxed mt-3">{r.utilization.recommendation}</p>
      </div>

      {/* Section 4 — Inquiries */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<Eye className="w-3 h-3" />} num="04" label="Hard Inquiry Review" color="blue" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-4">Recent Credit Pulls</h3>
        {r.inquiries.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-xs">
              <thead className="bg-[#F5F3EE]">
                <tr>
                  {["Creditor","Date","Bureau"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {r.inquiries.map((inq, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium">{inq.creditor}</td>
                    <td className="px-3 py-2 text-slate-500">{inq.date}</td>
                    <td className="px-3 py-2"><BTag b={inq.bureau} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-slate-600 text-xs leading-relaxed">{r.inquiryAnalysis}</p>
      </div>

      {/* Section 5 — Credit Age */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<Clock className="w-3 h-3" />} num="05" label="Credit Age & Mix" color="green" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-4">History & Diversity</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Avg Age",    val: r.creditAge.averageAge },
            { label: "Oldest",     val: r.creditAge.oldestAccount },
            { label: "Mix",        val: r.creditAge.accountTypes.join(", ") },
          ].map(({ label, val }) => (
            <div key={label} className="bg-[#F5F3EE] rounded-lg p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
              <div className="text-sm font-bold text-[#0C1F3F]">{val}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">{r.creditAge.analysis}</p>
      </div>

      {/* Section 6 — Improvement Plan */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<CheckSquare className="w-3 h-3" />} num="06" label="Improvement Plan" color="gold" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-4">Your 3-Phase Roadmap</h3>
        {[
          { d: r.improvementPlan.phase1, c: "bg-red-500",   l: "Phase 1" },
          { d: r.improvementPlan.phase2, c: "bg-amber-500", l: "Phase 2" },
          { d: r.improvementPlan.phase3, c: "bg-green-600", l: "Phase 3" },
        ].map(({ d, c, l }, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3 relative">
            <span className={`absolute -top-2.5 left-3 ${c} text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider`}>{l}</span>
            <p className="font-bold text-sm text-[#0C1F3F] mt-1 mb-2">{d.title}</p>
            <ol className="list-decimal list-inside space-y-1">
              {d.steps.map((s, j) => <li key={j} className="text-xs text-slate-600 leading-relaxed">{s}</li>)}
            </ol>
          </div>
        ))}
      </div>

      {/* Section 7 — Score Potential */}
      <div className="px-6 py-8 border-b border-slate-100">
        <SectionBadge icon={<TrendingUp className="w-3 h-3" />} num="07" label="Score Improvement Potential" color="gold" />
        <h3 className="font-serif text-xl font-bold text-[#0C1F3F] mb-2">How Much Can You Improve?</h3>
        <div className="font-serif text-3xl font-bold text-[#C9A84C] mb-4">{r.scorePotential.range}</div>
        {r.scorePotential.factors.map((f, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <span className="text-xs text-slate-600 min-w-[160px]">{f.label}</span>
            <span className="text-xs font-bold text-[#C9A84C] min-w-[70px]">{f.points}</span>
            <div className="flex-1"><Bar pct={f.pct} /></div>
          </div>
        ))}
        <p className="text-slate-400 text-[11px] italic mt-3">{r.scorePotential.caveat}</p>
      </div>

      {/* CTA */}
      <div className={`${headerBg} px-6 py-8 text-center`}>
        <div className="font-serif text-lg font-bold text-[#E8C97A] mb-2">Let the Experts Handle It For You</div>
        <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4 leading-relaxed">
          Professional disputes, bureau communications, and credit building — managed start to finish.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
          {["Pro Disputes","Bureau Comms","Validation Letters","Credit Building","Monitoring"].map(f => (
            <span key={f} className="bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-medium px-2.5 py-1 rounded-full">{f}</span>
          ))}
        </div>
        <a href={ctaUrl} target="_blank" rel="noreferrer">
          <button className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-8 py-3 rounded-xl text-sm transition-colors">
            {ctaLabel}
          </button>
        </a>
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-4 bg-[#F5F3EE] border-t border-slate-200">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <b>Disclaimer:</b> Educational purposes only. Not legal, tax, or financial advice. Credit results vary.
          700 Credit Club Experts does not guarantee removal of any item or any specific score increase.
          All strategies are based on FCRA consumer rights.
        </p>
      </div>

    </div>
  );
}

// ─── Shared mini-components (widget-internal) ─────────────────────────────────

function SectionBadge({ icon, num, label, color }: {
  icon: React.ReactNode; num: string; label: string;
  color: "gold" | "red" | "blue" | "green";
}) {
  const styles = {
    gold:  "bg-amber-50  text-amber-800  border-amber-200",
    red:   "bg-red-50    text-red-700    border-red-200",
    blue:  "bg-blue-50   text-blue-700   border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest mb-2 ${styles[color]}`}>
      {icon} {num} · {label}
    </div>
  );
}

function HealthBadge2({ rating }: { rating: string }) {
  const map: Record<string, string> = {
    "Excellent":          "bg-emerald-50 text-emerald-800 border-emerald-200",
    "Good":               "bg-green-50   text-green-800   border-green-200",
    "Fair":               "bg-blue-50    text-blue-800    border-blue-200",
    "Needs Improvement":  "bg-amber-50   text-amber-800   border-amber-200",
    "High Risk":          "bg-red-50     text-red-800     border-red-200",
  };
  return (
    <span className={`inline-block border px-3 py-1 rounded-lg text-xs font-semibold ${map[rating] ?? map["Fair"]}`}>
      {rating}
    </span>
  );
}

export default CreditAuditWidget;
