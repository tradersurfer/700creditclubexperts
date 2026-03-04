import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Mail, TrendingUp, FileText, MessageSquare, ChevronRight, ExternalLink,
  LayoutDashboard, Brain, Scale, Briefcase, Shield, Eye, EyeOff, AlertTriangle,
  CheckCircle2, Clock, XCircle, DollarSign, RefreshCw, Award,
  ArrowUp, Loader2, AlertCircle, BookOpen, UserCircle, LogOut, Key, BarChart2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ScoreGauge from "@/components/ScoreGauge";
import { usePageMeta } from "@/hooks/usePageMeta";

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("cc_access_token") : null; }
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("cc_user") || "null"); } catch { return null; }
}
function setSession(at: string, rt: string, user: any) {
  localStorage.setItem("cc_access_token", at);
  localStorage.setItem("cc_refresh_token", rt);
  localStorage.setItem("cc_user", JSON.stringify(user));
}
function clearSession() {
  ["cc_access_token", "cc_refresh_token", "cc_user"].forEach((k) => localStorage.removeItem(k));
}

async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type Tab = "dashboard" | "disputes" | "ai" | "case" | "legal" | "settings";

function ScoreChart({ data }: { data: any[] }) {
  if (!data?.length) return <div className="flex items-center justify-center h-40 text-slate-600 text-sm font-mono">No score history available yet</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.06)" />
        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis domain={[500, 850]} tick={{ fill: "#64748b", fontSize: 10 }} />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#EAB308" }} itemStyle={{ color: "#f1f5f9" }} />
        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
        <Line type="monotone" dataKey="tu" name="TransUnion" stroke="#EAB308" strokeWidth={2} dot={{ fill: "#EAB308", r: 3 }} connectNulls />
        <Line type="monotone" dataKey="eq" name="Equifax" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} connectNulls />
        <Line type="monotone" dataKey="ex" name="Experian" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626", r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    deleted: "text-green-400 bg-green-400/10 border-green-400/20",
    in_progress: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    queued: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    sent: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    verified: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    updated: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    no_response: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] || map.queued}`}>{label}</span>;
}

function DashboardTab({ data, user, isMock }: { data: any; user: any; isMock: boolean }) {
  const pointGain = data?.scoreChart?.length >= 2
    ? Math.max((data.scoreChart.at(-1)?.tu || 0) - (data.scoreChart[0]?.tu || 0), 0) : 0;

  return (
    <div className="space-y-8">
      {isMock && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm leading-relaxed">Demo mode — your live Credit Repair Cloud data will appear here once your account is linked by your credit expert (usually within 24 hours of enrollment).</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-dark-slate-light border border-gold/10 rounded-xl p-6">
          <h3 className="font-display text-lg text-white tracking-wide mb-1">CREDIT SCORE</h3>
          <p className="text-slate-500 text-xs font-mono mb-4">3-bureau average</p>
          <ScoreGauge score={data?.currentScore || 650} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[{ l: "TransUnion", k: "transunion" }, { l: "Equifax", k: "equifax" }, { l: "Experian", k: "experian" }].map((b) => (
              <div key={b.k} className="bg-dark-slate rounded-lg p-2 text-center">
                <span className="text-gold font-display text-xl block">{data?.scores?.[b.k] ?? "—"}</span>
                <p className="text-slate-600 text-[9px] font-mono">{b.l.slice(0, 2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Points Gained", v: `+${pointGain}`, s: "Since enrollment", icon: TrendingUp, c: "text-green-400" },
              { l: "Deletions Won", v: String(data?.stats?.deletionCount || 0), s: `${data?.stats?.successRate || 0}% success rate`, icon: CheckCircle2, c: "text-gold" },
              { l: "Debt Deleted", v: `$${(data?.totalAmountDeleted || 0).toLocaleString()}`, s: "Total removed", icon: DollarSign, c: "text-emerald-400" },
              { l: "Active Disputes", v: String(data?.stats?.activeCount || 0), s: "In progress", icon: FileText, c: "text-blue-400" },
            ].map((m) => (
              <div key={m.l} className="bg-dark-slate-light border border-gold/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-slate-400 text-[10px] font-mono uppercase">{m.l}</p>
                  <m.icon className={`w-3.5 h-3.5 ${m.c}`} />
                </div>
                <p className={`font-display text-2xl tracking-wide ${m.c}`}>{m.v}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{m.s}</p>
              </div>
            ))}
          </div>

          {data?.currentRound && (
            <div className="bg-dark-slate-light border border-gold/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display text-base text-white tracking-wide">CURRENT ROUND</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${data.currentRound.status === "active" ? "bg-green-400/10 text-green-400" : "bg-slate-400/10 text-slate-400"}`}>
                  {data.currentRound.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-4xl text-gold">R{data.currentRound.round_number}</span>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Items</span><span className="text-white font-bold">{data.currentRound.items_count}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Deletions</span><span className="text-green-400 font-bold">{data.currentRound.deletions_count}</span></div>
                  <div className="w-full bg-dark-slate rounded-full h-1.5">
                    <div className="bg-gold h-1.5 rounded-full" style={{ width: data.currentRound.items_count > 0 ? `${(data.currentRound.deletions_count / data.currentRound.items_count) * 100}%` : "0%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-white tracking-wide">SCORE TRAJECTORY</h3>
          {pointGain > 0 && (
            <div className="flex items-center gap-1 text-green-400 text-xs font-mono bg-green-400/10 px-2 py-1 rounded-full">
              <ArrowUp className="w-3 h-3" /> +{pointGain} pts
            </div>
          )}
        </div>
        <ScoreChart data={data?.scoreChart || []} />
      </div>

      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h3 className="font-display text-lg text-white tracking-wide mb-4">ROADMAP TO 700+</h3>
        <div className="space-y-3">
          {[
            { done: true, text: "Credit audit submitted — case is active" },
            { done: (data?.rounds?.length || 0) >= 1, text: "Round 1 disputes filed with all three bureaus" },
            { done: (data?.stats?.deletionCount || 0) >= 1, text: "First deletion achieved" },
            { done: (data?.currentScore || 0) >= 620, text: "620+ reached — auto loan eligibility threshold" },
            { done: (data?.currentScore || 0) >= 680, text: "680+ reached — mortgage pre-qualification range" },
            { done: (data?.currentScore || 0) >= 700, text: "700 CLUB — Institutional readiness achieved 🏆" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-gold/20 border border-gold/40" : "bg-dark-slate border border-gold/10"}`}>
                {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-gold" /> : <span className="text-slate-600 text-[10px] font-mono">{i + 1}</span>}
              </div>
              <p className={`text-sm ${s.done ? "text-white" : "text-slate-500"}`}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gold/5 border border-gold/20 rounded-xl p-6 text-center">
        <p className="text-slate-300 text-sm mb-4 font-medium">Connect with 1,200+ members growing their scores</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="https://www.skool.com/700-credit-club-experts-7830" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-gold/30 text-gold bg-transparent">Skool Community <ExternalLink className="w-3.5 h-3.5 ml-2" /></Button>
          </a>
          <a href="https://www.facebook.com/700creditexperts" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-gold/30 text-gold bg-transparent">Facebook Group <ExternalLink className="w-3.5 h-3.5 ml-2" /></Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function DisputesTab({ data }: { data: any }) {
  const disputes = data?.disputes || [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-white tracking-wide">DISPUTE CENTER</h2>
        <div className="flex gap-2">
          <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{data?.stats?.deletionCount || 0} Deleted</span>
          <span className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">{data?.stats?.activeCount || 0} Active</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "Total", v: disputes.length, c: "text-white" },
          { l: "Deleted", v: data?.stats?.deletionCount || 0, c: "text-green-400" },
          { l: "Active", v: data?.stats?.activeCount || 0, c: "text-yellow-400" },
        ].map((s) => (
          <div key={s.l} className="bg-dark-slate-light border border-gold/10 rounded-xl p-4 text-center">
            <span className={`font-display text-3xl ${s.c}`}>{s.v}</span>
            <p className="text-slate-500 text-xs font-mono mt-1">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {disputes.length === 0 ? (
          <div className="text-center py-12 text-slate-600"><FileText className="w-10 h-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No disputes on file yet</p></div>
        ) : disputes.map((d: any) => (
          <div key={d.id} className="bg-dark-slate-light border border-gold/10 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-dark-slate rounded-lg flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-gold/60" /></div>
                <div>
                  <p className="text-white text-sm font-bold">{d.creditor_name || d.item}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-slate-500 text-xs font-mono">{d.account_number || d.id}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-500 text-xs font-mono capitalize">{d.bureau || "All Bureaus"}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-500 text-xs font-mono">Round {d.round_number || 1}</span>
                    {d.amount > 0 && <><span className="text-slate-600 text-xs">·</span><span className="text-gold text-xs font-mono">${d.amount?.toLocaleString()}</span></>}
                  </div>
                </div>
              </div>
              <StatusBadge status={d.status} />
            </div>
            {d.dispute_reason && <div className="mt-3 pt-3 border-t border-gold/5"><p className="text-slate-500 text-xs"><span className="text-slate-400">Basis:</span> {d.dispute_reason}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AITab({ data }: { data: any }) {
  const dr = data?.stats?.successRate || 0;
  const deletions = data?.stats?.deletionCount || 0;
  const active = data?.stats?.activeCount || 0;
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">JECI AI INTELLIGENCE</h2>
      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center"><Brain className="w-7 h-7 text-gold" /></div>
          <div><h3 className="font-display text-xl text-white tracking-wide">JECI AI ENGINE</h3><p className="text-slate-500 text-xs font-mono">Consumer Law Intelligence · 15 USC 1681</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-slate rounded-xl p-4 text-center"><span className="font-display text-3xl text-gold">{dr}%</span><p className="text-slate-500 text-xs font-mono mt-1">DELETION RATE</p></div>
          <div className="bg-dark-slate rounded-xl p-4 text-center"><span className="font-display text-3xl text-green-400">{deletions}</span><p className="text-slate-500 text-xs font-mono mt-1">ITEMS DELETED</p></div>
        </div>
        <div className="space-y-3">
          {[
            { l: "Report Analysis", p: 100, s: "Complete" },
            { l: "FCRA Violation Scan", p: 100, s: "Complete" },
            { l: "Strategy Deployment", p: active > 0 ? 80 : 100, s: active > 0 ? "Active" : "Complete" },
            { l: "Letter Optimization", p: active > 0 ? 65 : 100, s: active > 0 ? "Running" : "Complete" },
            { l: "Bureau Response Monitor", p: deletions > 0 ? 100 : 35, s: deletions > 0 ? "Watching" : "Pending" },
          ].map((item) => (
            <div key={item.l}>
              <div className="flex justify-between mb-1"><span className="text-slate-300 text-sm">{item.l}</span><span className="text-gold text-xs font-mono">{item.s}</span></div>
              <div className="w-full bg-dark-slate rounded-full h-2"><div className="bg-gradient-to-r from-gold-dark to-gold h-2 rounded-full transition-all duration-1000" style={{ width: `${item.p}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-6">
        <h4 className="font-display text-lg text-white tracking-wide mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-gold" />AI RECOMMENDATIONS</h4>
        <div className="space-y-3">
          {[
            deletions > 0 && `${deletions} items deleted — ${dr}% success rate confirmed`,
            active > 0 && `${active} active disputes — monitor for bureau responses in 30-45 days`,
            (data?.currentScore || 0) < 700 && `${700 - (data?.currentScore || 650)} more points needed to reach 700 Club status`,
            (data?.totalAmountDeleted || 0) > 0 && `$${(data?.totalAmountDeleted || 0).toLocaleString()} in debt removed from all three bureaus`,
            "Medical collections eligible for HIPAA dispute pathway — highest removal probability",
            "Inquiry removal campaign recommended after dispute rounds complete",
          ].filter(Boolean).map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Shield className="w-3 h-3 text-gold" /></div>
              <span className="text-slate-300 text-sm">{rec as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseTab({ data, user }: { data: any; user: any }) {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Member";
  const rounds = data?.rounds || [];
  const cur = data?.currentRound;
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">CASE MANAGER</h2>
      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center"><UserCircle className="w-8 h-8 text-gold" /></div>
          <div><h3 className="font-display text-xl text-white">{name}</h3><p className="text-gold text-sm font-mono">{user?.email}</p></div>
        </div>
        <div className="space-y-3">
          {[
            ["Status", cur?.status === "active" ? "Active" : "Enrolled"],
            ["Current Round", cur ? `Round ${cur.round_number} of 4` : "Starting Round 1"],
            ["Items This Round", String(cur?.items_count || 0)],
            ["Communication", "Portal + Email"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-3 border-b border-gold/5 last:border-0">
              <span className="text-slate-400 text-sm">{l}</span><span className="text-white text-sm font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h4 className="font-display text-lg text-white tracking-wide mb-4">ROUND HISTORY</h4>
        {rounds.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">Your first round is being prepared by your expert.</p> : (
          <div className="space-y-3">
            {rounds.map((r: any) => (
              <div key={r.id} className={`flex items-center justify-between p-4 rounded-xl border ${r.status === "active" ? "border-gold/30 bg-gold/5" : "border-gold/10 bg-dark-slate"}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-display text-2xl ${r.status === "completed" ? "text-green-400" : r.status === "active" ? "text-gold" : "text-slate-500"}`}>R{r.round_number}</span>
                  <div><p className="text-white text-sm font-bold">Round {r.round_number}</p><p className="text-slate-500 text-xs capitalize">{r.status}</p></div>
                </div>
                <div className="text-right"><p className="text-green-400 text-sm font-bold">{r.deletions_count} Deleted</p><p className="text-slate-500 text-xs">{r.items_count} Items</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h4 className="font-display text-lg text-white tracking-wide mb-4">MESSAGE YOUR EXPERT</h4>
        <div className="text-center py-6">
          <MessageSquare className="w-9 h-9 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">Direct messaging coming soon</p>
          <a href="mailto:sales@700creditclubexperts.com">
            <Button variant="outline" size="sm" className="border-gold/20 text-gold bg-transparent">Email Your Expert</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function LegalTab() {
  const docs = [
    { name: "FCRA Rights Summary", type: "Federal Law", desc: "15 USC 1681 — your complete rights", url: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/", icon: Scale },
    { name: "FDCPA Debt Collector Rules", type: "Federal Law", desc: "15 USC 1692 — what collectors can't do", url: "https://www.ftc.gov/legal-library/browse/rules/fair-debt-collection-practices-act", icon: Shield },
    { name: "HIPAA Medical Debt Path", type: "Strategy", desc: "Medical collections removal pathway", url: "https://www.hhs.gov/hipaa/for-individuals/index.html", icon: Award },
    { name: "Annual Credit Report", type: "Tool", desc: "Get your free annual reports", url: "https://www.annualcreditreport.com", icon: FileText },
    { name: "CFPB Complaint Portal", type: "Escalation", desc: "File escalated bureau complaints", url: "https://www.consumerfinance.gov/complaint/", icon: AlertTriangle },
    { name: "Consumer Finance Resources", type: "Education", desc: "CFPB consumer education library", url: "https://www.consumerfinance.gov", icon: BookOpen },
  ];
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">LEGAL RESOURCES</h2>
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <p className="text-slate-300 text-sm leading-relaxed">All dispute strategies used by 700 Credit Club Experts are grounded in these federal statutes. <span className="text-gold font-semibold">We are not a law firm</span> — this is educational content under 15 USC 1681.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {docs.map((d) => (
          <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" className="bg-dark-slate-light border border-gold/10 rounded-xl p-5 flex items-start gap-3 hover:border-gold/30 transition-colors group">
            <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center shrink-0"><d.icon className="w-5 h-5 text-gold" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold group-hover:text-gold transition-colors">{d.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{d.desc}</p>
              <span className="text-gold/50 text-[10px] font-mono mt-1 inline-block">{d.type}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-gold transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ user, token, onLogout }: { user: any; token: string; onLogout: () => void }) {
  const [changing, setChanging] = useState(false);
  const [cpw, setCpw] = useState(""); const [npw, setNpw] = useState(""); const [cnpw, setCnpw] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (npw !== cnpw) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await apiFetch("/api/auth/change-password", token, { method: "POST", body: JSON.stringify({ currentPassword: cpw, newPassword: npw }) });
      toast({ title: "Password updated!", description: "Please log in with your new password." });
      setTimeout(onLogout, 2000);
    } catch { toast({ title: "Incorrect current password", variant: "destructive" }); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">ACCOUNT SETTINGS</h2>
      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h4 className="font-display text-lg text-white tracking-wide mb-4">PROFILE</h4>
        {[["Name", `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "—"], ["Email", user?.email || "—"], ["Role", (user?.role || "client").toUpperCase()], ["Member Since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"]].map(([l, v]) => (
          <div key={l} className="flex justify-between py-3 border-b border-gold/5 last:border-0">
            <span className="text-slate-400 text-sm">{l}</span><span className="text-white text-sm font-bold">{v}</span>
          </div>
        ))}
      </div>
      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display text-lg text-white tracking-wide">CHANGE PASSWORD</h4>
          <Button variant="ghost" size="sm" className="text-gold text-xs" onClick={() => setChanging(!changing)}><Key className="w-3 h-3 mr-1" />{changing ? "Cancel" : "Update"}</Button>
        </div>
        {changing && (
          <form onSubmit={handleChangePw} className="space-y-4">
            {[{ l: "Current Password", v: cpw, f: setCpw }, { l: "New Password", v: npw, f: setNpw }, { l: "Confirm New Password", v: cnpw, f: setCnpw }].map((field) => (
              <div key={field.l}>
                <Label className="text-slate-400 text-xs font-mono uppercase">{field.l}</Label>
                <Input type="password" value={field.v} onChange={(e) => field.f(e.target.value)} className="bg-dark-slate border-gold/20 text-white mt-1.5 h-11" required />
              </div>
            ))}
            <Button type="submit" disabled={loading} className="bg-gold text-dark-slate font-bold w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
            </Button>
          </form>
        )}
      </div>
      <Button variant="outline" className="w-full border-brand-red/40 text-brand-red bg-transparent" onClick={onLogout}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
    </div>
  );
}

function Sidebar({ active, setActive }: { active: Tab; setActive: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "disputes", label: "Disputes", icon: FileText },
    { id: "ai", label: "JECI AI", icon: Brain },
    { id: "case", label: "Case Mgr", icon: Briefcase },
    { id: "legal", label: "Legal", icon: Scale },
    { id: "settings", label: "Settings", icon: Shield },
  ];
  return (
    <div className="w-full lg:w-52 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-1">
        <div className="w-9 h-9 bg-gold rounded-md flex items-center justify-center"><span className="font-display text-dark-slate text-xl leading-none">7</span></div>
        <div><span className="font-display text-gold text-base tracking-wide leading-none block">700 CLUB</span><span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Member Portal</span></div>
      </div>
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${active === t.id ? "bg-gold/10 text-gold border border-gold/20" : "text-slate-400 hover:text-white hover:bg-dark-slate-light"}`}
          ><t.icon className="w-4 h-4 shrink-0" />{t.label}</button>
        ))}
      </nav>
    </div>
  );
}

export default function PortalPage() {
  usePageMeta({ title: "Client Portal | 700 Credit Club Experts", description: "Access your credit restoration dashboard, track disputes, and monitor score progress." });

  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [user, setUser] = useState<any>(getStoredUser());
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dashData, setDashData] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const { toast } = useToast();

  const loadDash = useCallback(async () => {
    const tok = getToken();
    if (!tok) return;
    setDashLoading(true);
    try {
      const res = await apiFetch("/api/client/dashboard", tok);
      setDashData(res.data);
      setIsMock(res.source === "mock");
    } catch { toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" }); }
    finally { setDashLoading(false); }
  }, []);

  useEffect(() => { if (loggedIn) loadDash(); }, [loggedIn]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }) });
      const data = await res.json();
      if (data.success) {
        setSession(data.accessToken, data.refreshToken, data.user);
        setUser(data.user);
        setLoggedIn(true);
        if (data.isFirstLogin) toast({ title: "Welcome to the Club!", description: "Update your password in Settings." });
      } else toast({ title: "Login Failed", description: data.error || "Invalid credentials", variant: "destructive" });
    } catch { toast({ title: "Connection Error", description: "Please try again.", variant: "destructive" }); }
    finally { setLoginLoading(false); }
  }

  function handleLogout() {
    const tok = getToken();
    if (tok) fetch("/api/auth/logout", { method: "POST", headers: { "Authorization": `Bearer ${tok}` } }).catch(() => {});
    clearSession(); setLoggedIn(false); setUser(null); setDashData(null);
  }

  if (loggedIn) {
    return (
      <div className="bg-dark-slate min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex lg:hidden items-center justify-between mb-6">
            <h1 className="font-display text-2xl text-white">MEMBER PORTAL</h1>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-gold/20 text-gold bg-transparent text-xs">Sign Out</Button>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar active={tab} setActive={setTab} />
            <div className="flex-1 min-w-0">
              {dashLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center"><Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" /><p className="text-slate-400 font-mono text-sm">Loading your dashboard...</p></div>
                </div>
              ) : (
                <>
                  {tab === "dashboard" && <DashboardTab data={dashData} user={user} isMock={isMock} />}
                  {tab === "disputes" && <DisputesTab data={dashData} />}
                  {tab === "ai" && <AITab data={dashData} />}
                  {tab === "case" && <CaseTab data={dashData} user={user} />}
                  {tab === "legal" && <LegalTab />}
                  {tab === "settings" && <SettingsTab user={user} token={getToken()!} onLogout={handleLogout} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-slate min-h-screen pt-24 pb-20">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gold/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/30"><Lock className="w-10 h-10 text-gold" /></div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-2">MEMBER <span className="text-gold">PORTAL</span></h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Secure Client Access</p>
        </div>
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input id="email" name="email" type="email" placeholder="you@email.com" required className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12" />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input id="password" name="password" type={showPw ? "text" : "password"} placeholder="Your password" required className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 pr-10 h-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loginLoading} size="lg" className="w-full bg-gold text-dark-slate font-bold">
              {loginLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing In...</> : <>ACCESS PORTAL <ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </form>
          <p className="text-slate-500 text-xs text-center mt-6 font-mono">First time? Check your email for credentials sent after submitting your audit.</p>
          <div className="mt-4 pt-4 border-t border-gold/10 text-center">
            <p className="text-slate-500 text-xs">Affiliate partner? <a href="/affiliate" className="text-gold hover:underline">Access Affiliate Portal →</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
