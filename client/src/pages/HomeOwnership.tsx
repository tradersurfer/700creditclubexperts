import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Check, TrendingUp, FileText, DollarSign, Shield, Calculator, Building2 } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import SectionTag from "@/components/SectionTag";
import ScoreGauge from "@/components/ScoreGauge";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function HomeOwnershipPage() {
  usePageMeta({
    title: "Home Ownership Program | 700 Credit Club Experts",
    description: "Mortgage readiness program. We bridge the gap between your current score and underwriting approval. Licensed in the State of Florida.",
  });

  const steps = [
    {
      icon: FileText,
      title: "Credit Audit & Analysis",
      description: "We perform a deep-dive audit of your credit report to identify every item that could prevent mortgage approval. Every derogatory mark is evaluated against Consumer Law standards.",
    },
    {
      icon: TrendingUp,
      title: "Score Optimization",
      description: "Strategic dispute sequences designed to maximize your score before you apply. We target the accounts that have the highest impact on your mortgage eligibility.",
    },
    {
      icon: Calculator,
      title: "DTI Optimization",
      description: "Debt-to-income ratio analysis and strategic recommendations to bring your DTI below underwriting thresholds. We help you position your finances for approval.",
    },
    {
      icon: Shield,
      title: "Underwriting Preparation",
      description: "We prepare your full credit file for underwriting review. From removing erroneous items to ensuring all accounts report accurately — you go in with a clean file.",
    },
  ];

  const qualifications = [
    "Minimum 620 FICO score target (we'll get you there)",
    "DTI ratio below 43% (we optimize this)",
    "No active collections on file (we handle this)",
    "Clean inquiry history (we manage this)",
    "Stable employment verification",
    "Down payment strategy guidance",
  ];

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <section className="relative py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <SectionTag>Home Ownership Program</SectionTag>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4" data-testid="text-homeownership-title">
              YOUR PATH TO <span className="text-gold">HOME OWNERSHIP</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              We bridge the gap between your current credit profile and mortgage approval. Our program is designed to make you underwriting-ready.
            </p>
          </div>

          <GoldDivider className="mb-16" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-6">
                MORTGAGE <span className="text-gold">READINESS</span> SCORE
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Most lenders require a minimum 620 FICO score for conventional loans. FHA loans may accept 580+. Our program targets getting you above 680 for the best rates and terms.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-dark-slate-light rounded-lg border border-gold/10">
                  <span className="text-slate-400 text-sm">FHA Minimum</span>
                  <span className="text-gold font-display text-lg">580</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-slate-light rounded-lg border border-gold/10">
                  <span className="text-slate-400 text-sm">Conventional Minimum</span>
                  <span className="text-gold font-display text-lg">620</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gold/10 rounded-lg border border-gold/30">
                  <span className="text-white text-sm font-bold">Our Target</span>
                  <span className="text-gold font-display text-lg">680+</span>
                </div>
              </div>
            </div>
            <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-8 text-center" data-testid="card-score-target">
              <ScoreGauge score={680} />
              <p className="text-slate-400 text-sm mt-4">Target score for best mortgage rates</p>
            </div>
          </div>

          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-2">
                THE <span className="text-gold">PROCESS</span>
              </h2>
              <p className="text-slate-400 text-sm">Four strategic phases to mortgage readiness</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="bg-dark-slate-light border border-gold/10 rounded-xl p-6" data-testid={`step-${i}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="font-mono text-gold/50 text-xs">PHASE {i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl text-white tracking-wide mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-8 sm:p-10 mb-16" data-testid="card-qualifications">
            <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide mb-6">
              MORTGAGE <span className="text-gold">QUALIFICATION CHECKLIST</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {qualifications.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <GoldDivider className="mb-8" />
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-8 sm:p-12 max-w-2xl mx-auto">
              <Home className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="font-display text-3xl text-white tracking-wide mb-4">
                READY TO START YOUR <span className="text-gold">HOME JOURNEY?</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Begin with a credit audit and our experts will map out your personalized path to mortgage approval.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/audit">
                  <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate" data-testid="button-homeownership-audit">
                    Start Your Audit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/enroll">
                  <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-homeownership-enroll">
                    View Programs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
