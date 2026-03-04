import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Home, Building2, Crown, ArrowRight, Scale, FileSearch, Zap } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ProgramsPage() {
  usePageMeta({
    title: "Our Programs | 700 Credit Club Experts",
    description: "Personal Credit, Home Ownership, Business Credit, and VIP Membership programs powered by Consumer Law and AI.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="font-mono text-gold text-xs tracking-widest uppercase mb-4 block">What We Offer</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4" data-testid="text-programs-title">
            OUR <span className="text-gold">PROGRAMS</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Every program is built on Consumer Law, powered by AI, and executed by certified credit experts.
          </p>
        </div>

        <GoldDivider className="mb-14" />

        <Accordion type="single" collapsible className="space-y-4" defaultValue="personal">
          <AccordionItem value="personal" className="bg-dark-slate-light border border-gold/10 rounded-md px-6">
            <AccordionTrigger className="hover:no-underline py-6" data-testid="accordion-personal-credit">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide">PERSONAL CREDIT</h3>
                  <p className="text-gold/70 text-xs font-mono">Consumer Law Restoration</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 text-slate-400 leading-relaxed pl-0 sm:pl-16">
                <p>
                  Your credit file is governed by 15 USC 1681. Every inaccuracy, every unverifiable entry,
                  every procedural violation is a deletion opportunity. We don't write template letters —
                  we conduct surgical audits and build legal arguments.
                </p>
                <div className="bg-dark-slate rounded-md p-4 border border-gold/10">
                  <h4 className="font-display text-lg text-gold tracking-wide mb-2">AUDIT vs. DISPUTE</h4>
                  <p className="text-sm text-slate-400">
                    Understanding this distinction is everything. An audit identifies every legally actionable
                    item on your report. A dispute is the strategic action we take based on the audit findings.
                    Most companies skip the audit — we never do.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-start gap-3">
                    <FileSearch className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Deep-Dive Audit</p>
                      <p className="text-xs text-slate-500">Every line item analyzed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Legal Arguments</p>
                      <p className="text-xs text-slate-500">FCRA & FDCPA grounded</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">AI-Powered</p>
                      <p className="text-xs text-slate-500">JECI pattern recognition</p>
                    </div>
                  </div>
                </div>
                <Link href="/enroll">
                  <Button className="bg-gold text-dark-slate font-bold mt-4 no-default-hover-elevate no-default-active-elevate" data-testid="button-programs-enroll-personal">
                    View Personal Credit Packages <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="homeownership" className="bg-dark-slate-light border border-gold/10 rounded-md px-6">
            <AccordionTrigger className="hover:no-underline py-6" data-testid="accordion-home-ownership">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                  <Home className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide">HOME OWNERSHIP</h3>
                  <p className="text-gold/70 text-xs font-mono">Mortgage Readiness Program</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 text-slate-400 leading-relaxed pl-0 sm:pl-16">
                <p>
                  We specialize in mortgage readiness. From score thresholds to DTI ratio optimization,
                  we prepare your full financial profile for underwriting approval — not just "better credit."
                </p>
                <ul className="space-y-2">
                  {[
                    "Credit score threshold optimization for FHA, VA, and conventional loans",
                    "Debt-to-income ratio analysis and strategy",
                    "Tradeline optimization for mortgage qualification",
                    "Pre-approval preparation and documentation review",
                    "Lender-ready credit profile engineering",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold text-sm mt-0.5">&#9670;</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/audit">
                  <Button className="bg-gold text-dark-slate font-bold mt-4 no-default-hover-elevate no-default-active-elevate" data-testid="button-programs-audit-home">
                    Start Home Ownership Audit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="business" className="bg-dark-slate-light border border-gold/10 rounded-md px-6">
            <AccordionTrigger className="hover:no-underline py-6" data-testid="accordion-business-credit">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide">BUSINESS CREDIT</h3>
                  <p className="text-gold/70 text-xs font-mono">EIN-Based Funding Division</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 text-slate-400 leading-relaxed pl-0 sm:pl-16">
                <p>
                  Stop using your SSN as collateral. We build EIN-based credit profiles, establish vendor
                  tradelines, and position your entity for institutional funding. LLC and S-Corp formation
                  guidance included.
                </p>
                <ul className="space-y-2">
                  {[
                    "EIN-based credit profile establishment",
                    "Net-30 vendor tradeline setup",
                    "Business bureau reporting optimization",
                    "LLC and S-Corp formation strategy",
                    "Institutional funding readiness",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold text-sm mt-0.5">&#9670;</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/business-credit">
                  <Button className="bg-gold text-dark-slate font-bold mt-4 no-default-hover-elevate no-default-active-elevate" data-testid="button-programs-business">
                    Explore Business Credit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="vip" className="bg-dark-slate-light border border-gold/10 rounded-md px-6">
            <AccordionTrigger className="hover:no-underline py-6" data-testid="accordion-vip">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide">VIP MEMBERSHIP</h3>
                  <p className="text-gold/70 text-xs font-mono">Elite Coaching & Strategy</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 text-slate-400 leading-relaxed pl-0 sm:pl-16">
                <p>
                  High-level financial literacy, monthly strategy sessions, profile monitoring, and full
                  access to our proprietary Credit Tracker. Reserved for clients serious about wealth
                  engineering.
                </p>
                <ul className="space-y-2">
                  {[
                    "1:1 monthly coaching sessions with a certified expert",
                    "Full financial profile management",
                    "Business credit roadmap included",
                    "Priority dispute processing",
                    "Access to exclusive Skool community",
                    "Wealth engineering strategy sessions",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold text-sm mt-0.5">&#9670;</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/enroll">
                  <Button className="bg-gold text-dark-slate font-bold mt-4 no-default-hover-elevate no-default-active-elevate" data-testid="button-programs-vip">
                    Apply for VIP <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-16 text-center">
          <GoldDivider className="mb-8" />
          <h2 className="font-display text-3xl text-white tracking-wide mb-4">
            NOT SURE WHERE TO <span className="text-gold">START?</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Take our free credit audit to get a personalized recommendation on which program is right for you.
          </p>
          <Link href="/audit">
            <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate" data-testid="button-programs-cta">
              Start Your Free Audit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
