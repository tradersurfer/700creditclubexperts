import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Mail, Eye, EyeOff, Loader2, Users, DollarSign, TrendingUp,
  Copy, ExternalLink, Award, BarChart2, ChevronRight,
  CheckCircle2, Clock, Share2, UserCircle, LogOut
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePageMeta } from "@/hooks/usePageMeta";

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("aff_access_token") : null; }
function getStoredUser() { try { return JSON.parse(localStorage.getItem("aff_user") || "null"); } catch { return null; } }
function setSession(at: string, rt: string, user: any) {
  localStorage.setItem("aff_access_token", at);
  localStorage.setItem("aff_refresh_token", rt);
  localStorage.setItem("aff_user", JSON.stringify(user));
}
function clearSession() { ["aff_access_token", "aff_refresh_token", "aff_user"].forEach((k) => localStorage.removeItem(k)); }

async function apiFetch(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type Tab = "overview" | "referrals" | "commissions" | "tools" | "leaderboard";

const PROGRAMS = [
  { name: "1-Round Partial Sweep", price: 199, commission: 39.80 },
  { name: "Full Sweep Credit Repair", price: 499, commission: 99.80 },
  { name: "Full Sweep + Credit Builder", price: 749, commission: 149.80 },
  { name: "Home Ownership Program", price: 599, commission: 119.80 },
  { name: "Business Credit Builder", price: 899, commission: 179.80 },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    enrolled: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    active: "text-green-400 bg-green-400/10 border-green-400/20",
    completed: "text-gold bg-gold/10 border-gold/20",
    cancelled: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] || map.pending}`}>{label}</span>;
}

function OverviewTab({ data, links, onCopy }: { data: any; links: any; onCopy: (t: string) => void }) {
  const s = data?.stats || {};
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Total Referrals", v: String(s.totalReferrals || 0), icon: Users, c: "text-white", sub: "All time" },
          { l: "Active Clients", v: String(s.activeClients || 0), icon: TrendingUp, c: "text-green-400", sub: "Enrolled" },
          { l: "Commission Paid", v: `$${(s.paidCommission || 0).toLocaleString()}`, icon: DollarSign, c: "text-gold", sub: "Total earned" },
          { l: "Pending", v: `$${(s.pendingCommission || 0).toLocaleString()}`, icon: Clock, c: "text-yellow-400", sub: "Awaiting approval" },
        ].map((m) => (
          <div key={m.l} className="bg-dark-slate-light border border-gold/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-[10px] font-mono uppercase">{m.l}</p>
              <m.icon className={`w-4 h-4 ${m.c}`} />
            </div>
            <p className={`font-display text-2xl sm:text-3xl tracking-wide ${m.c}`}>{m.v}</p>
            <p className="text-slate-500 text-[10px] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "Conversion Rate", v: `${s.conversionRate || 0}%`, c: "text-emerald-400" },
          { l: "Completed", v: String(s.completedClients || 0), c: "text-gold" },
          { l: "Pending Leads", v: String(s.pendingReferrals || 0), c: "text-yellow-400" },
        ].map((st) => (
          <div key={st.l} className="bg-dark-slate-light border border-gold/10 rounded-xl p-4 text-center">
            <span className={`font-display text-2xl ${st.c}`}>{st.v}</span>
            <p className="text-slate-500 text-xs font-mono mt-1">{st.l}</p>
          </div>
        ))}
      </div>

      {/* Commission Chart */}
      {data?.commissionHistory?.length > 0 && (
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
          <h3 className="font-display text-lg text-white tracking-wide mb-4">COMMISSION HISTORY</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.commissionHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(234,179,8,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [`$${v}`, "Commission"]} />
              <Bar dataKey="amount" fill="#EAB308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Referral Link */}
      {links && (
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
          <h3 className="font-display text-lg text-white tracking-wide mb-4">YOUR TOP REFERRAL LINK</h3>
          <div className="bg-dark-slate rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-bold">Audit Page <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full ml-1">HIGHEST CONVERTING</span></span>
              <Button variant="ghost" size="sm" className="text-gold text-xs h-7 px-2" onClick={() => onCopy(links.auditLink)}>
                <Copy className="w-3 h-3 mr-1" />Copy
              </Button>
            </div>
            <p className="text-slate-400 text-xs font-mono break-all">{links.auditLink}</p>
          </div>
          <p className="text-slate-500 text-xs mt-3">Affiliate code: <span className="text-gold font-mono font-bold ml-1">{links.code}</span></p>
        </div>
      )}

      {/* Recent Referrals */}
      {data?.recentReferrals?.length > 0 && (
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
          <h3 className="font-display text-lg text-white tracking-wide mb-4">RECENT REFERRALS</h3>
          <div className="space-y-1">
            {data.recentReferrals.slice(0, 5).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-gold/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-dark-slate rounded-full flex items-center justify-center"><UserCircle className="w-4 h-4 text-slate-500" /></div>
                  <div>
                    <p className="text-white text-sm font-bold">{r.name}</p>
                    <p className="text-slate-500 text-xs">{r.program || "—"} · {r.enrolledAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.commission > 0 && <span className="text-gold text-sm font-mono font-bold">+${r.commission}</span>}
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReferralsTab({ data }: { data: any }) {
  const referrals = data?.recentReferrals || [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-white tracking-wide">ALL REFERRALS</h2>
        <span className="text-xs font-mono text-gold bg-gold/10 px-2 py-1 rounded-full">{referrals.length} Total</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          ["All", referrals.length, "text-white"],
          ["Active", referrals.filter((r: any) => r.status === "active").length, "text-green-400"],
          ["Pending", referrals.filter((r: any) => r.status === "pending").length, "text-yellow-400"],
          ["Done", referrals.filter((r: any) => r.status === "completed").length, "text-gold"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="bg-dark-slate-light border border-gold/10 rounded-xl p-3 text-center">
            <span className={`font-display text-2xl ${c}`}>{v}</span>
            <p className="text-slate-500 text-[10px] font-mono mt-1">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {referrals.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : referrals.map((r: any) => (
          <div key={r.id} className="bg-dark-slate-light border border-gold/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-dark-slate rounded-full flex items-center justify-center shrink-0"><UserCircle className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-white text-sm font-bold">{r.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-slate-500 text-xs">{r.email}</span>
                  {r.program && <><span className="text-slate-600">·</span><span className="text-gold text-xs font-mono">{r.program}</span></>}
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500 text-xs">{r.enrolledAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {r.commission > 0 && <span className="text-gold font-mono font-bold">${r.commission.toFixed(2)}</span>}
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommissionsTab({ data }: { data: any }) {
  const s = data?.stats || {};
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">COMMISSIONS</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { l: "Total Earned", v: `$${((s.paidCommission || 0) + (s.pendingCommission || 0)).toLocaleString()}`, c: "text-white" },
          { l: "Paid Out", v: `$${(s.paidCommission || 0).toLocaleString()}`, c: "text-green-400" },
          { l: "Pending Approval", v: `$${(s.pendingCommission || 0).toLocaleString()}`, c: "text-yellow-400" },
        ].map((st) => (
          <div key={st.l} className="bg-dark-slate-light border border-gold/10 rounded-xl p-5 text-center">
            <span className={`font-display text-3xl ${st.c}`}>{st.v}</span>
            <p className="text-slate-500 text-xs font-mono mt-1">{st.l}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h4 className="font-display text-lg text-white tracking-wide mb-4">COMMISSION SCHEDULE</h4>
        <div className="space-y-1">
          {PROGRAMS.map((p) => (
            <div key={p.name} className="flex items-center justify-between py-3 border-b border-gold/5 last:border-0">
              <div>
                <p className="text-white text-sm font-bold">{p.name}</p>
                <p className="text-slate-500 text-xs">Client pays: ${p.price}</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-display text-xl">${p.commission.toFixed(2)}</p>
                <p className="text-slate-500 text-[10px] font-mono">{Math.round(p.commission / p.price * 100)}% per enrollment</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-gold/5 border border-gold/10 rounded-xl p-4">
          <p className="text-slate-300 text-xs leading-relaxed">Commissions are approved within 5 business days of client enrollment confirmation and paid bi-weekly. Contact <a href="mailto:sales@700creditclubexperts.com" className="text-gold hover:underline">sales@700creditclubexperts.com</a> for payout questions.</p>
        </div>
      </div>

      {data?.commissionHistory?.length > 0 && (
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
          <h4 className="font-display text-lg text-white tracking-wide mb-4">MONTHLY BREAKDOWN</h4>
          {[...data.commissionHistory].reverse().map((m: any) => (
            <div key={m.month} className="flex items-center justify-between py-2">
              <span className="text-slate-400 text-sm">{m.month}</span>
              <div className="flex items-center gap-3">
                <div className="w-28 bg-dark-slate rounded-full h-2">
                  <div className="bg-gold h-2 rounded-full" style={{ width: `${Math.min((m.amount / 1000) * 100, 100)}%` }} />
                </div>
                <span className="text-gold font-mono text-sm font-bold w-16 text-right">${m.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolsTab({ links, onCopy }: { links: any; onCopy: (t: string) => void }) {
  const talkingPoints = [
    { title: "The Hook", text: "Did you know your credit score is worth thousands of dollars in real money? People with 700+ scores save $300–$500/month on the same mortgage compared to someone at 620." },
    { title: "The Differentiator", text: "700 Credit Club doesn't just 'send letters.' They invoke Consumer Law — FCRA violations — to force deletions. It's the difference between asking nicely and exercising your legal right to accurate reporting." },
    { title: "The Proof", text: "Clients average +84 point increases. They've deleted over $2.4M in negative debt. One client had 14 items deleted in a single round. They back it with a Lifetime Guarantee." },
    { title: "The CTA", text: "Start with a free credit audit — no cost, no pressure. They review your report and show you exactly what can be removed before you spend a dollar." },
  ];
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">PARTNER TOOLS</h2>

      {links && (
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
          <h3 className="font-display text-lg text-white tracking-wide mb-4">YOUR REFERRAL LINKS</h3>
          <div className="space-y-3">
            {[
              { l: "Audit Page", url: links.auditLink, rec: true, desc: "Best conversion — takes prospects straight to intake" },
              { l: "Enrollment Page", url: links.enrollLink, desc: "For prospects ready to buy" },
              { l: "Homepage", url: links.link, desc: "Full brand experience" },
            ].map((link) => (
              <div key={link.l} className={`bg-dark-slate rounded-xl p-4 ${link.rec ? "border border-gold/20" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-bold">{link.l}</span>
                    {link.rec && <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full">RECOMMENDED</span>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-gold text-xs h-7 px-2" onClick={() => onCopy(link.url)}>
                    <Copy className="w-3 h-3 mr-1" />Copy
                  </Button>
                </div>
                <p className="text-slate-400 text-xs font-mono break-all">{link.url}</p>
                <p className="text-slate-600 text-[10px] mt-1">{link.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gold/5 border border-gold/10 rounded-xl p-4">
            <p className="text-slate-300 text-xs">Your affiliate code: <span className="text-gold font-mono font-bold ml-1 text-sm">{links.code}</span></p>
            <p className="text-slate-500 text-[10px] mt-1">Append <span className="font-mono text-gold">?ref={links.code}</span> to any page on 700creditclubexperts.com</p>
          </div>
        </div>
      )}

      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h3 className="font-display text-lg text-white tracking-wide mb-4">PROVEN TALKING POINTS</h3>
        <div className="space-y-3">
          {talkingPoints.map((tp) => (
            <div key={tp.title} className="bg-dark-slate rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gold text-xs font-mono uppercase">{tp.title}</p>
                <Button variant="ghost" size="sm" className="text-slate-500 text-xs h-7 px-2" onClick={() => onCopy(tp.text)}>
                  <Copy className="w-3 h-3 mr-1" />Copy
                </Button>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{tp.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
        <h3 className="font-display text-lg text-white tracking-wide mb-4">COMMUNITY & SUPPORT</h3>
        <div className="space-y-3">
          {[
            { l: "Skool Community", url: "https://www.skool.com/700-credit-club-experts-7830", desc: "Join the members community" },
            { l: "Facebook Group", url: "https://www.facebook.com/700creditexperts", desc: "Social proof & client wins" },
            { l: "Email Affiliate Team", url: "mailto:sales@700creditclubexperts.com", desc: "For support and materials" },
          ].map((item) => (
            <a key={item.l} href={item.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-dark-slate rounded-xl hover:border hover:border-gold/20 transition-colors group"
            >
              <div>
                <p className="text-white text-sm font-bold group-hover:text-gold transition-colors">{item.l}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-gold transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardTab({ data, user }: { data: any; user: any }) {
  const lb = data?.leaderboard || [];
  const myName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white tracking-wide">AFFILIATE LEADERBOARD</h2>
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 flex items-center gap-3">
        <Award className="w-5 h-5 text-gold shrink-0" />
        <p className="text-slate-300 text-sm">Top affiliates receive commission priority and featured placement. Rankings reset monthly.</p>
      </div>
      <div className="space-y-3">
        {lb.length === 0 ? (
          <div className="text-center py-12 text-slate-600"><Award className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>Leaderboard loading...</p></div>
        ) : lb.map((entry: any) => {
          const isMe = myName && entry.name.includes(myName.split(" ")[0]);
          return (
            <div key={entry.rank} className={`bg-dark-slate-light border rounded-xl p-5 flex items-center gap-4 ${isMe ? "border-gold/30 bg-gold/5" : "border-gold/10"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display ${entry.rank === 1 ? "bg-gold text-dark-slate text-lg" : entry.rank <= 3 ? "bg-slate-300/10 text-white text-lg" : "bg-dark-slate text-slate-400 text-sm"}`}>
                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${isMe ? "text-gold" : "text-white"}`}>
                  {entry.name}{isMe ? " (You)" : ""}
                </p>
                <p className="text-slate-500 text-xs">{entry.referrals} referrals</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-display text-xl">${entry.earned.toLocaleString()}</p>
                <p className="text-slate-500 text-[10px] font-mono">TOTAL EARNED</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sidebar({ active, setActive, onLogout }: { active: Tab; setActive: (t: Tab) => void; onLogout: () => void }) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    { id: "tools", label: "Partner Tools", icon: Share2 },
    { id: "leaderboard", label: "Leaderboard", icon: Award },
  ];
  return (
    <div className="w-full lg:w-52 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-1">
        <div className="w-9 h-9 bg-gold rounded-md flex items-center justify-center"><span className="font-display text-dark-slate text-xl leading-none">7</span></div>
        <div><span className="font-display text-gold text-base tracking-wide leading-none block">700 CLUB</span><span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Affiliate Portal</span></div>
      </div>
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${active === t.id ? "bg-gold/10 text-gold border border-gold/20" : "text-slate-400 hover:text-white hover:bg-dark-slate-light"}`}
          ><t.icon className="w-4 h-4 shrink-0" />{t.label}</button>
        ))}
      </nav>
      <div className="hidden lg:block mt-8 pt-6 border-t border-gold/10">
        <Button variant="outline" size="sm" onClick={onLogout} className="w-full border-gold/20 text-gold bg-transparent text-xs">
          <LogOut className="w-3 h-3 mr-1" />Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AffiliatePortalPage() {
  usePageMeta({ title: "Affiliate Portal | 700 Credit Club Experts", description: "Track referrals, commissions, and manage your affiliate partnership with 700 Credit Club Experts." });

  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [user, setUser] = useState<any>(getStoredUser());
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [dashData, setDashData] = useState<any>(null);
  const [links, setLinks] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const tok = getToken();
    if (!tok) return;
    setLoading(true);
    try {
      const [dashRes, linksRes] = await Promise.allSettled([
        apiFetch("/api/affiliate/dashboard", tok),
        apiFetch("/api/affiliate/referral-link", tok),
      ]);
      if (dashRes.status === "fulfilled") setDashData(dashRes.value.data);
      if (linksRes.status === "fulfilled") setLinks(linksRes.value);
    } catch { toast({ title: "Error loading data", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (loggedIn) load(); }, [loggedIn]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: "Copied to clipboard!" }));
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }) });
      const data = await res.json();
      if (data.success) {
        if (!["affiliate", "admin"].includes(data.user.role)) {
          toast({ title: "Access Denied", description: "Client accounts use the Member Portal at /portal", variant: "destructive" });
          return;
        }
        setSession(data.accessToken, data.refreshToken, data.user);
        setUser(data.user);
        setLoggedIn(true);
      } else toast({ title: "Login Failed", description: data.error || "Invalid credentials", variant: "destructive" });
    } catch { toast({ title: "Connection Error", variant: "destructive" }); }
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
            <h1 className="font-display text-2xl text-white">AFFILIATE PORTAL</h1>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-gold/20 text-gold bg-transparent text-xs">Sign Out</Button>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar active={tab} setActive={setTab} onLogout={handleLogout} />
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center"><Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" /><p className="text-slate-400 font-mono text-sm">Loading your portal...</p></div>
                </div>
              ) : (
                <>
                  {tab === "overview" && <OverviewTab data={dashData} links={links} onCopy={copyToClipboard} />}
                  {tab === "referrals" && <ReferralsTab data={dashData} />}
                  {tab === "commissions" && <CommissionsTab data={dashData} />}
                  {tab === "tools" && <ToolsTab links={links} onCopy={copyToClipboard} />}
                  {tab === "leaderboard" && <LeaderboardTab data={dashData} user={user} />}
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
            <div className="relative w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/30"><Users className="w-10 h-10 text-gold" /></div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-2">AFFILIATE <span className="text-gold">PORTAL</span></h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Partner Access — Track Referrals & Commissions</p>
        </div>

        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input name="email" type="email" placeholder="partner@email.com" required className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input name="password" type={showPw ? "text" : "password"} placeholder="Your password" required className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 pr-10 h-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loginLoading} size="lg" className="w-full bg-gold text-dark-slate font-bold">
              {loginLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing In...</> : <>ACCESS PORTAL <ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </form>
          <p className="text-slate-500 text-xs text-center mt-6">Not an affiliate yet? <a href="mailto:sales@700creditclubexperts.com" className="text-gold hover:underline">Apply to partner with us →</a></p>
          <div className="mt-4 pt-4 border-t border-gold/10 text-center">
            <p className="text-slate-500 text-xs">Client? <a href="/portal" className="text-gold hover:underline">Access Member Portal →</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
