/**
 * FreeCreditAudit.tsx
 * 700 Credit Club Experts — /free-credit-audit
 *
 * CHANGES FROM ORIGINAL:
 *  - handleFileProcess now calls JECI AI for real analysis via /api/analyze-credit
 *  - Full 8-section audit report renders inline after upload
 *  - reportRef scrolls the user down to results automatically
 *  - CreditAuditWidget extracted as reusable embed (see CreditAuditWidget.tsx)
 *  - All marketing sections preserved exactly as original
 *
 * The Anthropic API call is server-side only (functions/analyze-credit.mjs).
 * No API key is exposed to the browser bundle.
 */

import React, { useState, useRef } from "react";
import { Link } from "wouter";
import {
  Shield, CheckCircle2, Upload, FileText, Loader2,
  AlertCircle, ArrowRight, Info, ChevronDown, ChevronUp,
  Search, Calendar, Map, ExternalLink, Download,
  TrendingUp, AlertTriangle, Eye, BarChart3, Clock,
  RefreshCw, CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NegativeItem {
  accountName: string;
  accountType: string;
  balance: string;
  status: string;
  dateOpened: string;
  lastActivity: string;
  bureaus: string[];
  scoreImpact: string;
  lenderView: string;
  disputability: string;
}

interface UtilAccount {
  name: string;
  limit: string;
  balance: string;
  utilPct: string;
}

interface Inquiry {
  creditor: string;
  date: string;
  bureau: string;
}

interface ScoreFactor {
  label: string;
  points: string;
  pct: number;
}

interface AuditReport {
  clientName: string;
  reportDate: string;
  estimatedScore: string;
  bureaus: string;
  snapshot: {
    totalAccounts: string | number;
    openAccounts: string | number;
    closedAccounts: string | number;
    derogatoryAccounts: string | number;
    collections: string | number;
    chargeOffs: string | number;
    latePayments: string | number;
    hardInquiries: string | number;
    utilization: string;
    healthRating: "Excellent" | "Good" | "Fair" | "Needs Improvement" | "High Risk";
    healthExplanation: string;
  };
  negativeItems: NegativeItem[];
  utilization: {
    currentPct: string;
    explanation: string;
    accounts: UtilAccount[];
    recommendation: string;
  };
  inquiries: Inquiry[];
  inquiryAnalysis: string;
  creditAge: {
    averageAge: string;
    oldestAccount: string;
    accountTypes: string[];
    analysis: string;
  };
  improvementPlan: {
    phase1: { title: string; steps: string[] };
    phase2: { title: string; steps: string[] };
    phase3: { title: string; steps: string[] };
  };
  scorePotential: {
    range: string;
    factors: ScoreFactor[];
    caveat: string;
  };
}

// ─── JECI AI Analysis Call ────────────────────────────────────────────────────

async function runJeciAnalysis(file: File, firstName: string, lastName: string): Promise<AuditReport> {
  const formData = new FormData()
  formData.append('pdf', file)
  formData.append('clientName', `${firstName} ${lastName}`)

  const response = await fetch(
    'https://jecicredit.com/api/free-audit',
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as any)?.error || `Server error ${response.status}`)
  }

  const data = await response.json()
  if (!data.report) throw new Error('No report returned.')
  return data.report as AuditReport
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BureauTag({ bureau }: { bureau: string }) {
  const styles: Record<string, string> = {
    Experian:   "bg-orange-50 text-orange-800 border border-orange-200",
    Equifax:    "bg-blue-50 text-blue-800 border border-blue-200",
    TransUnion: "bg-green-50 text-green-800 border border-green-200",
  };
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mr-1 mt-1 ${styles[bureau] ?? "bg-gray-100 text-gray-700"}`}>
      {bureau}
    </span>
  );
}

function HealthBadge({ rating }: { rating: string }) {
  const map: Record<string, string> = {
    "Excellent":          "bg-emerald-50 text-emerald-800 border border-emerald-200",
    "Good":               "bg-green-50 text-green-800 border border-green-200",
    "Fair":               "bg-blue-50 text-blue-800 border border-blue-200",
    "Needs Improvement":  "bg-amber-50 text-amber-800 border border-amber-200",
    "High Risk":          "bg-red-50 text-red-800 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold ${map[rating] ?? map["Fair"]}`}>
      {rating}
    </span>
  );
}

function SnapCard({ label, value }: { label: string; value: string | number }) {
  const v = String(value);
  const n = parseInt(v);
  const isDangerous = ["collections", "charge-offs", "derogatory", "late payments"]
    .some(k => label.toLowerCase().includes(k));
  const color = isDangerous && n > 0
    ? "text-red-500"
    : label.toLowerCase().includes("utilization") && n > 50
    ? "text-red-500"
    : label.toLowerCase().includes("utilization") && n > 30
    ? "text-amber-600"
    : "text-[#0C1F3F]";

  return (
    <div className="bg-[#F5F3EE] rounded-xl p-4 text-center">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{v}</div>
    </div>
  );
}

function UtilBar({ pct }: { pct: number }) {
  const color = pct > 50 ? "#E24B4A" : pct > 30 ? "#BA7517" : "#3B6D11";
  return (
    <div className="bg-slate-200 rounded-full h-2 overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

// ─── Full Report Renderer ─────────────────────────────────────────────────────

function AuditReportView({ report, onReset }: { report: AuditReport; onReset: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-0" id="audit-report">
      {/* Report Header */}
      <div className="bg-[#070F1E] border-b-4 border-[#C9A84C] px-8 py-10 text-center print:block">
        <div className="font-serif text-3xl font-bold text-[#E8C97A] tracking-wide mb-1">
          700 Credit Club Experts
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-6">
          Professional Credit Audit Report
        </div>
        <div className="inline-grid grid-cols-2 gap-x-12 gap-y-3 bg-[#0C1F3F] border border-[#C9A84C]/30 rounded-xl px-8 py-5 text-left">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Prepared For</div>
            <div className="font-serif text-[#E8C97A] font-semibold text-lg">{report.clientName || "Valued Client"}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Report Date</div>
            <div className="font-serif text-[#E8C97A] font-semibold text-lg">{report.reportDate || new Date().toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Est. Score</div>
            <div className="font-serif text-[#E8C97A] font-semibold text-lg">{report.estimatedScore || "See Report"}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Bureaus</div>
            <div className="font-serif text-[#E8C97A] font-semibold text-lg">{report.bureaus || "All Three"}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-center gap-3 mt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> New Report
          </button>
        </div>
      </div>

      {/* Report Body */}
      <div className="bg-white text-[#1A1A2E]">

        {/* Section 1 — Snapshot */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-3 py-1 rounded-full text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
            <BarChart3 className="w-3 h-3" /> 01 · Credit Profile Snapshot
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-6">Your Credit Health at a Glance</h2>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total Accounts",   value: report.snapshot.totalAccounts },
              { label: "Open Accounts",    value: report.snapshot.openAccounts },
              { label: "Closed Accounts",  value: report.snapshot.closedAccounts },
              { label: "Derogatory",       value: report.snapshot.derogatoryAccounts },
              { label: "Collections",      value: report.snapshot.collections },
              { label: "Charge-Offs",      value: report.snapshot.chargeOffs },
              { label: "Late Payments",    value: report.snapshot.latePayments },
              { label: "Hard Inquiries",   value: report.snapshot.hardInquiries },
              { label: "Utilization",      value: report.snapshot.utilization },
            ].map(i => <SnapCard key={i.label} {...i} />)}
          </div>

          <div className="mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-3">Credit Health Rating</span>
            <HealthBadge rating={report.snapshot.healthRating} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{report.snapshot.healthExplanation}</p>
        </section>

        {/* Section 2 — Negative Items */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold text-red-700 tracking-widest uppercase mb-3">
            <AlertTriangle className="w-3 h-3" /> 02 · Negative Item Breakdown
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-6">Items Affecting Your Score</h2>

          {report.negativeItems.length === 0 ? (
            <p className="text-slate-500 text-sm">No negative items identified in the provided report data.</p>
          ) : (
            <div className="space-y-4">
              {report.negativeItems.map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-5 border-l-4 border-l-red-400">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-bold text-[#0C1F3F]">{item.accountName}</span>
                      <span className="ml-2 text-xs text-slate-500">{item.accountType}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.bureaus.map(b => <BureauTag key={b} bureau={b} />)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 mb-3">
                    <div><span className="font-semibold">Status:</span> {item.status}</div>
                    <div><span className="font-semibold">Balance:</span> {item.balance}</div>
                    <div><span className="font-semibold">Opened:</span> {item.dateOpened}</div>
                    <div><span className="font-semibold">Last Activity:</span> {item.lastActivity}</div>
                  </div>
                  <p className="text-xs text-slate-600 mb-1"><span className="font-semibold text-[#0C1F3F]">Score Impact:</span> {item.scoreImpact}</p>
                  <p className="text-xs text-slate-600 mb-3"><span className="font-semibold text-[#0C1F3F]">Lender View:</span> {item.lenderView}</p>
                  <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full ${
                    item.disputability === "Potentially Disputable"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    ⚑ {item.disputability}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3 — Utilization */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-3 py-1 rounded-full text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
            <BarChart3 className="w-3 h-3" /> 03 · Credit Utilization Analysis
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-4">How Much of Your Credit Are You Using?</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-3xl">{report.utilization.explanation}</p>

          <div className="space-y-4 mb-6">
            {report.utilization.accounts.map((acct, i) => {
              const pct = parseInt(acct.utilPct) || 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#0C1F3F]">{acct.name}</span>
                    <span className={`font-bold ${pct > 50 ? "text-red-500" : pct > 30 ? "text-amber-600" : "text-green-700"}`}>
                      {acct.utilPct} — {acct.balance} / {acct.limit}
                    </span>
                  </div>
                  <UtilBar pct={pct} />
                </div>
              );
            })}
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{report.utilization.recommendation}</p>
        </section>

        {/* Section 4 — Inquiries */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-bold text-blue-700 tracking-widest uppercase mb-3">
            <Eye className="w-3 h-3" /> 04 · Hard Inquiry Review
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-6">Recent Credit Pulls</h2>

          {report.inquiries.length === 0 ? (
            <p className="text-slate-500 text-sm mb-4">No hard inquiries identified.</p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F3EE]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Creditor</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bureau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.inquiries.map((inq, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-[#0C1F3F]">{inq.creditor}</td>
                      <td className="px-4 py-3 text-slate-500">{inq.date}</td>
                      <td className="px-4 py-3"><BureauTag bureau={inq.bureau} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{report.inquiryAnalysis}</p>
        </section>

        {/* Section 5 — Credit Age */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700 tracking-widest uppercase mb-3">
            <Clock className="w-3 h-3" /> 05 · Credit Age &amp; Mix
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-6">The Age and Diversity of Your Credit</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#F5F3EE] rounded-xl p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Average Age</div>
              <div className="text-2xl font-bold text-[#0C1F3F]">{report.creditAge.averageAge}</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-xl p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Oldest Account</div>
              <div className="text-2xl font-bold text-[#0C1F3F]">{report.creditAge.oldestAccount}</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-xl p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Account Types</div>
              <div className="text-sm font-bold text-[#0C1F3F]">{report.creditAge.accountTypes.join(", ")}</div>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{report.creditAge.analysis}</p>
        </section>

        {/* Section 6 — Improvement Plan */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-3 py-1 rounded-full text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
            <CheckSquare className="w-3 h-3" /> 06 · Credit Improvement Plan
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-6">Your Step-by-Step Roadmap</h2>

          {[
            { data: report.improvementPlan.phase1, color: "bg-red-500",   label: "Phase 1" },
            { data: report.improvementPlan.phase2, color: "bg-amber-500", label: "Phase 2" },
            { data: report.improvementPlan.phase3, color: "bg-green-600", label: "Phase 3" },
          ].map((phase, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-5 mb-4 relative">
              <span className={`absolute -top-3 left-4 ${phase.color} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                {phase.label}
              </span>
              <h3 className="font-bold text-[#0C1F3F] mt-2 mb-3">{phase.data.title}</h3>
              <ol className="list-decimal list-inside space-y-2">
                {phase.data.steps.map((step, j) => (
                  <li key={j} className="text-sm text-slate-600 leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        {/* Section 7 — Score Potential */}
        <section className="px-8 py-10 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-3 py-1 rounded-full text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
            <TrendingUp className="w-3 h-3" /> 07 · Estimated Score Improvement Potential
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0C1F3F] mb-2">How Much Can Your Score Improve?</h2>
          <div className="font-serif text-4xl font-bold text-[#C9A84C] mb-6">{report.scorePotential.range}</div>

          <div className="space-y-4 mb-6">
            {report.scorePotential.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-sm text-slate-600 min-w-[200px]">{f.label}</div>
                <div className="text-sm font-bold text-[#C9A84C] min-w-[80px]">{f.points}</div>
                <div className="flex-1">
                  <UtilBar pct={f.pct} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs italic max-w-2xl">{report.scorePotential.caveat}</p>
        </section>

        {/* Section 8 — CTA */}
        <section className="px-8 py-10 bg-[#070F1E] text-center">
          <div className="font-serif text-2xl font-bold text-[#E8C97A] mb-3">
            Let the 700 Credit Club Experts Handle This For You
          </div>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-5 leading-relaxed">
            You now have a clear picture of where your credit stands. You can follow this plan on your own —
            or let our certified specialists manage the entire process for you, start to finish.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["Professional Credit Disputes", "Bureau Communications", "Creditor Validation", "Credit Building Strategies", "Ongoing Monitoring", "Round 1/2/3 Letters"].map(f => (
              <span key={f} className="bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
            ))}
          </div>
          <a href="https://www.700creditclubexperts.com" target="_blank" rel="noreferrer">
            <Button size="lg" className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-10 h-12">
              Start My Credit Repair With 700 Credit Club →
            </Button>
          </a>
        </section>

        {/* Disclaimer */}
        <div className="px-8 py-6 bg-[#F5F3EE] border-t border-slate-200">
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-4xl">
            <strong>Disclaimer:</strong> This report is for educational purposes only and does not constitute legal, tax,
            or financial advice. Credit results vary based on individual circumstances and reporting accuracy.
            700 Credit Club Experts does not guarantee the removal of any item from a credit report or any specific
            increase in credit score. All dispute strategies are based on consumer rights under the Fair Credit
            Reporting Act (FCRA).
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FreeCreditAudit() {
  usePageMeta({
    title: "Free Credit Audit | 700 Credit Club Experts",
    description: "Upload your credit report for a professional AI-powered analysis.",
  });

  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [statusMsg, setStatusMsg]       = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [file, setFile]                 = useState<File | null>(null);
  const [report, setReport]             = useState<AuditReport | null>(null);
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const reportRef                       = useRef<HTMLDivElement>(null);

  const handleFileProcess = async (selectedFile: File) => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name before uploading.");
      return;
    }
    setFile(selectedFile);
    setIsAnalyzing(true);
    setError(null);
    setReport(null);

    try {
      setStatusMsg("JECI AI is analyzing your credit profile...");
      const result = await runJeciAnalysis(selectedFile, firstName.trim(), lastName.trim());

      setReport(result);
      setIsAnalyzing(false);

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

    } catch (err: any) {
      setIsAnalyzing(false);
      setError(err.message ?? "Analysis failed. Please try again.");
    }
  };

  const resetAll = () => {
    setReport(null);
    setFile(null);
    setError(null);
    setFirstName('');
    setLastName('');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <div className="min-h-screen bg-[#070F1E] text-white font-sans">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A84C] blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-4 py-1.5 rounded-full text-[#E8C97A] text-xs font-bold tracking-widest uppercase mb-8">
            <Shield className="w-3 h-3" /> JECI AI · Free Credit Audit Tool
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Free <span className="text-[#C9A84C]">Credit Audit</span><br />Starts Here
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Upload your credit report and get a full, professional credit analysis in seconds.
            No cost. No obligation. No hard pull.
          </p>

          {/* Upload / Analyzing / Error states */}
          {!isAnalyzing && !report && (
            <>
              <div className="max-w-xl mx-auto space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-white/5 border border-[#C9A84C]/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A84C]"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-white/5 border border-[#C9A84C]/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="max-w-xl mx-auto bg-white/5 border-2 border-dashed border-[#C9A84C]/40 rounded-2xl p-12 cursor-pointer hover:bg-[#C9A84C]/5 transition-all group"
              >
                <div className="w-16 h-16 bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-[#C9A84C] w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Your Credit Report</h3>
                <p className="text-slate-500 text-sm mb-6">Click to browse or drag & drop your PDF here</p>
                <Button className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-8">
                  Choose File
                </Button>
                <p className="text-slate-600 text-[10px] mt-6 tracking-wide uppercase">
                  PDF Only · Max 10MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                />
              </div>

              {error && (
                <div className="max-w-xl mx-auto mt-4 bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm text-left flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}
            </>
          )}

          {isAnalyzing && (
            <div className="max-w-md mx-auto bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin mx-auto mb-6" />
              <h3 className="text-[#E8C97A] text-lg font-medium mb-2">JECI AI is analyzing your report...</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{statusMsg}</p>
              {file && <div className="mt-8 pt-4 border-t border-white/5 text-xs text-slate-600 italic">📁 {file.name}</div>}
            </div>
          )}

          {/* Trust badges */}
          {!report && (
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {["100% Free", "No Hard Pull", "Privacy Protected", "All 3 Bureaus"].map((t) => (
                <span key={t} className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── REPORT OUTPUT (appears after analysis) ──────────────────────── */}
      {report && (
        <div ref={reportRef} className="max-w-5xl mx-auto px-4 pb-16">
          <AuditReportView report={report} onReset={resetAll} />
        </div>
      )}

      {/* ── What We Cover ────────────────────────────────────────────────── */}
      {!report && (
        <>
          <section className="bg-[#F5F3EE] text-[#1A1A2E] py-24 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">What We Cover</span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4">Everything Your Credit Score<br />Depends On</h2>
                <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto font-light">
                  JECI AI doesn't just give you a number — it breaks down every factor affecting your score.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: "📊", title: "Score Analysis",    desc: "Bureau-level score breakdown across Experian, Equifax, and TransUnion." },
                  { icon: "⚠️", title: "Negative Item Audit",  desc: "Every derogatory mark identified and explained — collections, charge-offs, and more." },
                  { icon: "💳", title: "Utilization Review",   desc: "Exact paydown recommendations to maximize your score immediately." },
                  { icon: "🔍", title: "Inquiry Scan",         desc: "All hard inquiries listed with fall-off dates and dispute eligibility assessment." },
                  { icon: "📅", title: "Account Age Report",   desc: "Credit history length and mix analysis — the 15% of your score most people overlook." },
                  { icon: "🗺️", title: "Repair Roadmap",       desc: "A three-phase action plan tailored to your exact credit profile and goals." },
                ].map((feat, i) => (
                  <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-4">{feat.icon}</div>
                    <h4 className="font-bold text-lg mb-2 text-[#0C1F3F]">{feat.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#0C1F3F] py-24 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">How It Works</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-16">Three Steps to Your<br />Professional Credit Audit</h2>
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { num: "1", title: "Pull Your Report",   desc: "Grab your free credit report from AnnualCreditReport.com or Credit Hero Score." },
                  { num: "2", title: "Upload & Analyze",   desc: "JECI AI reads every account, balance, and derogatory mark across all three bureaus." },
                  { num: "3", title: "Get Your Roadmap",   desc: "Receive a branded, professional audit report with a specific three-phase improvement plan." },
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-6 text-[#C9A84C] font-serif text-2xl font-bold">
                      {step.num}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-16 flex flex-wrap justify-center gap-4">
                <a href="https://www.annualcreditreport.com" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                  AnnualCreditReport.com <ExternalLink className="w-4 h-4" />
                </a>
                <a href="https://www.credithero.com" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                  Credit Hero Score <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white text-[#1A1A2E] py-24 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">Credit Education</span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4">Know What Moves Your Score</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { pct: "35%", label: "Payment History", desc: "The biggest factor. One missed payment can drop scores by 80+ points." },
                  { pct: "30%", label: "Utilization",     desc: "Keep balances under 10% for maximum positive impact." },
                  { pct: "15%", label: "Credit Age",      desc: "Longer history = higher scores. Don't close old accounts." },
                  { pct: "10%", label: "Credit Mix",      desc: "A mix of installment and revolving credit signals responsibility." },
                  { pct: "10%", label: "New Credit",      desc: "Multiple hard inquiries signal risk. Space out applications." },
                ].map((fact, i) => (
                  <div key={i} className="bg-[#F5F3EE] p-6 rounded-xl border-t-4 border-[#C9A84C]">
                    <div className="font-serif text-4xl font-bold text-[#0C1F3F] mb-2">{fact.pct}</div>
                    <h4 className="font-bold text-sm mb-2">{fact.label}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{fact.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#F5F3EE] text-[#1A1A2E] py-24 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">Common Questions</span>
                <h2 className="font-serif text-4xl font-bold mt-4">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                {[
                  { q: "Is this credit audit really free?",           a: "Yes. Your Free Credit Audit from 700 Credit Club Experts is 100% free with no obligation and no hidden fees." },
                  { q: "What type of credit report can I upload?",    a: "You can upload any PDF or text report from AnnualCreditReport.com, Credit Hero Score, or any bureau-generated report." },
                  { q: "Is my information secure?",                   a: "Yes. All sensitive identifiers like SSNs are automatically masked. We do not store your uploaded report after analysis." },
                  { q: "Will this hurt my credit score?",             a: "No. Uploading your report is a soft look and does not trigger a hard inquiry or affect your score." },
                ].map((faq, i) => (
                  <div key={i} className="bg-white rounded-lg border border-black/5 overflow-hidden">
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-bold text-[#0C1F3F]">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="text-[#C9A84C]" /> : <ChevronDown className="text-[#C9A84C]" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#070F1E] py-24 px-6 text-center border-t border-white/5">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">Ready to Transform Your Credit?</h2>
              <p className="text-slate-400 text-lg mb-12">
                Our certified specialists manage disputes and credit building so you can focus on your financial future.
              </p>
              <a href="/start-audit">
                <Button size="lg" className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-12 h-14 text-lg">
                  Start My Credit Repair →
                </Button>
              </a>
              <p className="mt-6 text-slate-600 text-xs font-mono uppercase tracking-widest">
                Licensed · FCRA Certified · 100% Legal
              </p>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
