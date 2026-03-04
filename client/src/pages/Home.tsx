import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Shield, Scale, Zap, Award, ArrowRight, Building2, Home as HomeIcon,
  Crown, ChevronRight, TrendingUp, CheckCircle2, Users, Star, Trophy,
  DollarSign, FileText, Brain, Lock
} from "lucide-react";
import StatCounter from "@/components/StatCounter";
import GoldDivider from "@/components/GoldDivider";
import SectionTag from "@/components/SectionTag";
import { usePageMeta } from "@/hooks/usePageMeta";

function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(234,179,8,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-[100px]" />
    </div>
  );
}

function LiveAuditCard() {
  return (
    <div className="bg-dark-slate-light/50 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-gold/10 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="font-display text-2xl text-white tracking-wide">LIVE AUDIT VIEW</h4>
          <p className="text-slate-500 text-xs font-mono mt-1">Real deletions. Real clients.</p>
        </div>
        <TrendingUp className="text-gold w-8 h-8" />
      </div>
      <div className="space-y-4">
        {[
          { label: "Medical Collection", value: "-$4,200", status: "DELETED", color: "text-green-400" },
          { label: "14 Negative Items", value: "Swept", status: "ROUND 1 COMPLETE", color: "text-gold" },
          { label: "Navy Federal Card", value: "$20,000", status: "APPROVED", color: "text-green-400" },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-dark-slate rounded-xl border border-gold/10 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-white uppercase">{item.label}</p>
              <p className={`text-[10px] font-mono uppercase ${item.color}`}>{item.status}</p>
            </div>
            <span className="text-gold font-display text-lg">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gold/10">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>15 USC 1681 · FCRA Compliant</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> LIVE</span>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <HeroGrid />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionTag>Now Accepting New Members</SectionTag>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-wide leading-[0.95] mb-6">
              YOUR CREDIT SCORE
              <br />
              <span className="text-gold">IS A WEAPON.</span>
              <br />
              LET US LOAD IT.
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
              Stop paying for generic "disputes." Join an institutional-grade club that uses{" "}
              <span className="text-white font-bold">Consumer Law Restoration</span> and AI-driven
              systems to permanently erase inaccurate debt and engineer Institutional Readiness.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/audit">
                <Button size="lg" className="bg-gold text-dark-slate font-bold shadow-[0_20px_40px_rgba(234,179,8,0.15)]">
                  Start Your Free Audit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/enroll">
                <Button size="lg" variant="outline" className="border-brand-red text-white font-semibold bg-transparent">
                  Self-Enroll · Save $400
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <LiveAuditCard />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-12">
          {[
            { icon: Shield, text: "Licensed · State of Florida" },
            { icon: Scale, text: "FCRA Certified Experts" },
            { icon: Award, text: "Lifetime Guarantee" },
            { icon: Zap, text: "JECI AI Powered" },
            { icon: Lock, text: "100% Legal Methods" },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-mono">
              <badge.icon className="w-3.5 h-3.5 text-gold" />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="relative py-16 sm:py-20 bg-dark-slate-light/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <StatCounter end={84} prefix="+" suffix="" label="Avg Point Increase Per Client" />
          <StatCounter end={2.4} prefix="$" suffix="M+" label="In Negative Debt Deleted" decimals={1} />
          <StatCounter end={1200} suffix="+" label="Members Served" />
          <div className="text-center">
            <div className="font-display text-4xl sm:text-5xl lg:text-6xl text-gold tracking-wide">15 USC</div>
            <div className="text-slate-400 text-sm sm:text-base mt-2 font-medium">1681 Compliant</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BridgeSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionTag>The Mission</SectionTag>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-6">
              WE ARE <span className="text-gold">THE BRIDGE.</span>
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                Between a restricted score and financial freedom. Between declined and approved.
                Between surviving and building generational wealth.
              </p>
              <p>
                Most credit companies send mass letters and hope something sticks.
                We invoke Consumer Law. We audit, not dispute. We build <span className="text-white font-semibold">Credit Weapons</span>.
              </p>
              <p>
                With JECI AI scanning every line of your report for FCRA violations — and Certified
                Credit Experts executing surgical deletion strategies — your profile becomes
                Institutional-grade.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: "Audit vs. Dispute", desc: "We conduct legal audits — not generic letters" },
                { label: "3-Bureau Coverage", desc: "Equifax, TransUnion & Experian simultaneously" },
                { label: "Pay-for-Delete", desc: "Strategic negotiations, not mass submissions" },
                { label: "Lifetime Guarantee", desc: "Deleted items stay deleted — permanently" },
              ].map((item) => (
                <div key={item.label} className="bg-dark-slate-light border border-gold/10 rounded-xl p-4">
                  <p className="text-gold text-xs font-mono uppercase mb-1">{item.label}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            {/* Vault graphic */}
            <div className="relative rounded-2xl overflow-hidden border border-gold/10 shadow-2xl">
              <img
                src="/images/credit-vault-hero.jpg"
                alt="Unlock Your Financial Potential — 700 Credit Club Experts"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gold text-dark-slate rounded-xl px-4 py-3 shadow-xl">
              <p className="font-display text-2xl leading-none">+84</p>
              <p className="text-xs font-bold uppercase">Avg Point Gain</p>
            </div>
            <div className="absolute -top-4 -right-4 bg-dark-slate-light border border-gold/30 rounded-xl px-4 py-3 shadow-xl">
              <p className="font-mono text-gold text-xs uppercase">Round 1</p>
              <p className="text-white text-sm font-bold">14 Items Deleted</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UniqueFeaturesSection() {
  const features = [
    "Lifetime Guarantee",
    "Proprietary Credit Tracker App",
    "JECI AI-Powered Analysis",
    "Certified Credit Experts",
    "Affiliate Tracking Portal",
    "Client Results Dashboard",
    "Home Ownership Program",
    "Unlimited Dispute Rounds",
    "Unlimited Legal Audits",
    "Licensed in Florida",
    "VIP Coaching & Membership",
    "Business Credit Division",
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-dark-slate-light/20 border-y border-gold/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="space-y-10">
            <header>
              <SectionTag>What Sets Us Apart</SectionTag>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-none mb-4">
                OUR UNIQUE <span className="text-gold">FEATURES</span>
              </h2>
              <p className="text-slate-400 text-lg">12 reasons 700 Credit Club Experts stands above the field.</p>
            </header>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold transition-colors shrink-0">
                    <CheckCircle2 className="text-gold w-4 h-4 group-hover:text-dark-slate" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight text-slate-300 group-hover:text-white transition-colors">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/features" className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
              Explore All Features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-gold p-10 sm:p-12 rounded-2xl text-center shadow-[0_30px_60px_rgba(234,179,8,0.15)]">
            <Users className="w-14 h-14 text-dark-slate mx-auto mb-6" />
            <h3 className="font-display text-3xl sm:text-4xl text-dark-slate tracking-wide mb-4">AFFILIATE PORTAL</h3>
            <p className="text-dark-slate/80 font-medium mb-4 leading-relaxed">
              Refer clients to a firm that delivers. Track every deletion and score increase in real-time.
              Earn 20% commission on every enrollment.
            </p>
            <div className="bg-dark-slate/10 rounded-xl p-3 mb-6 text-center">
              <p className="text-dark-slate font-bold text-2xl font-display">$99.80 – $149.80</p>
              <p className="text-dark-slate/70 text-xs font-mono">Per enrollment commission</p>
            </div>
            <Link href="/affiliate">
              <Button size="lg" className="w-full bg-dark-slate text-white font-bold">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramsPreview() {
  const programs = [
    {
      icon: Shield,
      title: "Personal Credit",
      subtitle: "Consumer Law Restoration",
      description: "Audit vs. Dispute — know the difference. We conduct surgical audits and build legal arguments under FCRA to force deletions.",
      cta: "Learn More",
      href: "/programs",
    },
    {
      icon: HomeIcon,
      title: "Home Ownership",
      subtitle: "Mortgage Readiness Program",
      description: "We bridge the gap between your current score and underwriting approval with DTI optimization and bureau-specific strategies.",
      cta: "Get Mortgage Ready",
      href: "/home-ownership",
    },
    {
      icon: Building2,
      title: "Business Credit",
      subtitle: "EIN-Based Funding",
      description: "Bypass the personal guarantee. Build Institutional borrowing power with EIN-based profiles, vendor tradelines, and entity strategy.",
      cta: "Build Business Credit",
      href: "/business-credit",
    },
    {
      icon: Crown,
      title: "VIP Membership",
      subtitle: "Elite Coaching & Strategy",
      description: "1:1 coaching, full financial profile management, authorized user strategy, and a business credit roadmap from our senior experts.",
      cta: "Apply for VIP",
      href: "/enroll",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-dark-slate-light/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionTag>Our Programs</SectionTag>
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
            BUILT FOR <span className="text-gold">EVERY BATTLE</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => (
            <div
              key={program.title}
              className="group bg-dark-slate border border-gold/10 rounded-xl p-6 transition-all duration-300 hover:border-gold/30 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                <program.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-xl text-white tracking-wide mb-1">{program.title}</h3>
              <p className="text-gold/70 text-xs font-mono mb-3">{program.subtitle}</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{program.description}</p>
              <Link href={program.href} className="inline-flex items-center gap-1 text-gold text-sm font-semibold group-hover:gap-2 transition-all">
                {program.cta} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultsSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionTag>Social Proof</SectionTag>
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
            REAL RESULTS. <span className="text-gold">REAL DELETIONS.</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm">
            These are actual screenshots from our client portal. Names and details blurred for privacy.
          </p>
        </div>

        {/* Real Client Proof Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative group rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/30 transition-colors">
            <img
              src="/images/results-score-report.jpg"
              alt="Client credit score results — 763/761/768 across all three bureaus, 14 items deleted"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-slate/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-gold font-display text-lg">763 / 761 / 768</p>
              <p className="text-white text-xs font-mono">14 Items Deleted · Round 1</p>
            </div>
          </div>

          <div className="relative group rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/30 transition-colors">
            <img
              src="/images/results-score-increase.jpg"
              alt="Client credit score increases — 735 Equifax, 727 TransUnion, 727 Experian"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-slate/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-gold font-display text-lg">735 / 727 / 727</p>
              <p className="text-white text-xs font-mono">+31 / +22 / +31 Points · From 400s</p>
            </div>
          </div>

          <div className="relative group rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/30 transition-colors">
            <img
              src="/images/results-card-approval.jpg"
              alt="Client approved for Navy Federal GO Rewards credit card with $20,000 limit"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-slate/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-gold font-display text-lg">$20,000 Approved</p>
              <p className="text-white text-xs font-mono">Navy Federal · GO Rewards Visa</p>
            </div>
          </div>
        </div>

        {/* 700 Club Wins Graphic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="relative rounded-2xl overflow-hidden border border-gold/10">
            <img
              src="/images/700-club-wins.jpg"
              alt="700 Club Wins — 83 clients per month, 100+ point average boost"
              className="w-full object-cover"
              onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { type: "Medical Collection", amount: "$4,800", result: "DELETED", points: "+62 pts", time: "Round 1" },
              { type: "Charge-Off", amount: "$12,000", result: "DELETED", points: "+84 pts", time: "Round 2" },
              { type: "Navy Federal Card", amount: "$20,000", result: "APPROVED", points: "700+ Score", time: "Post-Sweep" },
            ].map((c, i) => (
              <div key={i} className="bg-dark-slate-light border border-gold/10 rounded-xl p-5 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold rounded-l-xl" />
                <div className="pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 text-xs font-mono uppercase">{c.type}</span>
                    <span className="text-xs font-mono text-slate-600">{c.time}</span>
                  </div>
                  <div className="font-mono text-xl text-white">{c.amount}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-display text-brand-red text-lg tracking-wider">{c.result}</span>
                    <span className="text-gold font-mono text-sm font-bold">{c.points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community links */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4 font-mono">See more wins from our community</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://www.skool.com/700-credit-club-experts-7830/credit-repair-win-scores-as-of-101325?p=548e2d8b" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-gold/30 text-gold bg-transparent">
                Score Win — 14 Deletions <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </a>
            <a href="https://www.skool.com/700-credit-club-experts-7830/another-approval?p=b1c906f8" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-gold/30 text-gold bg-transparent">
                Card Approval Win <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </a>
            <a href="https://www.skool.com/700-credit-club-experts-7830/from-400s-to-the-700-club?p=a7d17b50" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-gold/30 text-gold bg-transparent">
                400s → 700 Club Story <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { num: "01", title: "Free Credit Audit", desc: "We pull all 3 bureau reports and identify every FCRA violation, inaccuracy, and deletion opportunity using JECI AI." },
    { num: "02", title: "Strategy Deployment", desc: "Your certified expert builds a custom legal argument for each item — no mass letters. Consumer Law, applied surgically." },
    { num: "03", title: "Dispute & Delete", desc: "We execute 3–4 rounds of disputes targeting bureaus, creditors, and original furnishers. Deletions are tracked in real-time." },
    { num: "04", title: "Build & Protect", desc: "Once clean, we build positive tradelines, optimize utilization, and establish Institutional Readiness for your financial goals." },
  ];

  return (
    <section className="py-20 sm:py-28 bg-dark-slate-light/20 border-t border-gold/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionTag>The Process</SectionTag>
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
            HOW WE <span className="text-gold">ENGINEER RESULTS</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gold/30 to-transparent z-0" />
              )}
              <div className="relative bg-dark-slate border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-colors">
                <div className="font-display text-5xl text-gold/20 tracking-wide mb-4">{step.num}</div>
                <h3 className="font-display text-xl text-white tracking-wide mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LegalBanner() {
  return (
    <section className="bg-gold py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-dark-slate tracking-wide mb-4">
          LEGAL. MORAL. ETHICAL. FACTUAL.
        </h2>
        <p className="text-dark-slate/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Licensed by the State of Florida. Certified Credit Experts. Every dispute strategy is
          grounded in 15 USC 1681 (FCRA) and 15 USC 1692 (FDCPA). We never use illegal tactics.
          We use the law — as written — to protect your consumer rights.
        </p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionTag>Get Started Today</SectionTag>
        <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-6">
          READY TO <span className="text-gold">TAKE CONTROL?</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
          Start with a free credit audit. No pressure — we analyze your report and tell you
          exactly what can be removed before you spend a single dollar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/audit">
            <Button size="lg" className="bg-gold text-dark-slate font-bold shadow-[0_20px_40px_rgba(234,179,8,0.15)]">
              Start Your Free Audit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/enroll">
            <Button size="lg" variant="outline" className="border-gold/40 text-gold font-semibold bg-transparent">
              Self-Enroll · Save $400
            </Button>
          </Link>
        </div>
        <p className="text-slate-500 text-xs font-mono mt-6">
          🔒 100% Legal · Licensed in Florida · FCRA/FDCPA Compliant
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta({
    title: "700 Credit Club Experts | Consumer Law Credit Restoration",
    description: "700 Credit Club Experts uses Consumer Law Restoration (FCRA/FDCPA) and JECI AI to permanently delete inaccurate debt and engineer Institutional Readiness. Licensed in Florida. Average +84 point increase.",
  });

  return (
    <div className="bg-dark-slate min-h-screen">
      <HeroSection />
      <GoldDivider />
      <StatsBar />
      <GoldDivider />
      <BridgeSection />
      <GoldDivider />
      <UniqueFeaturesSection />
      <ProgramsPreview />
      <ProcessSection />
      <ResultsSection />
      <LegalBanner />
      <CTASection />
    </div>
  );
}
