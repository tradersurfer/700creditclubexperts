import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Scale, Zap, Award, ArrowRight, Users, BookOpen, Target } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AboutPage() {
  usePageMeta({
    title: "About Us | 700 Credit Club Experts",
    description: "Founded on Consumer Law, licensed in the State of Florida. Certified credit experts with deep FCRA/FDCPA knowledge.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="font-mono text-gold text-xs tracking-widest uppercase mb-4 block">Our Story</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4" data-testid="text-about-title">
            WHO <span className="text-gold">WE ARE</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Founded on Consumer Law, not credit repair gimmicks.
          </p>
        </div>

        <GoldDivider className="mb-14" />

        <div className="space-y-8">
          <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white tracking-wide mb-3">FOUNDED ON CONSUMER LAW</h3>
                <p className="text-slate-400 leading-relaxed">
                  700 Credit Club Experts was built on a simple principle: your credit file is governed by law,
                  and every inaccuracy is a violation of your rights. We don't use generic templates or mass
                  dispute letters. We invoke the Fair Credit Reporting Act (FCRA) and the Fair Debt Collection
                  Practices Act (FDCPA) to legally force deletions and corrections.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white tracking-wide mb-3">LICENSED IN THE STATE OF FLORIDA</h3>
                <p className="text-slate-400 leading-relaxed">
                  We are a fully licensed credit services organization operating under the laws of the State
                  of Florida. Our team consists of certified credit experts with deep knowledge of consumer
                  protection law. Every strategy we deploy is legal, moral, ethical, and factual.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white tracking-wide mb-3">POWERED BY JECI AI</h3>
                <p className="text-slate-400 leading-relaxed">
                  Our proprietary JECI AI system analyzes credit files for patterns, violations, and deletion
                  opportunities that human eyes might miss. Trained by credit experts, it identifies the most
                  strategic approach for each unique credit profile — making our disputes faster, smarter, and
                  more effective.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white tracking-wide mb-3">THE LIFETIME GUARANTEE</h3>
                <p className="text-slate-400 leading-relaxed">
                  When you enroll in our Full Sweep program, you receive a lifetime guarantee on deletions.
                  If a deleted item reappears on your report, we dispute it again at no additional cost.
                  We stand behind our work because we believe in the law, and we believe in results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gold/5 border border-gold/20 rounded-md p-8 sm:p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-3">OUR MANTRA</h2>
          <p className="font-display text-2xl sm:text-3xl text-gold tracking-wider mb-6">
            "LEGAL. MORAL. ETHICAL. FACTUAL."
          </p>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed mb-2">
            Every action we take is grounded in law, guided by ethics, and driven by facts.
            This isn't just a tagline — it's our operational standard.
          </p>
        </div>

        <div className="mt-16">
          <div className="text-center mb-10">
            <span className="font-mono text-gold text-xs tracking-widest uppercase mb-4 block">Our Values</span>
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              WHAT DRIVES <span className="text-gold">US</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Precision", desc: "Surgical audits, not mass letters" },
              { icon: BookOpen, title: "Education", desc: "We teach clients to protect their score" },
              { icon: Users, title: "Community", desc: "Join 1,200+ empowered clients" },
              { icon: Shield, title: "Protection", desc: "Your rights under FCRA are sacred" },
            ].map((value) => (
              <div key={value.title} className="text-center bg-dark-slate-light border border-gold/10 rounded-md p-6" data-testid={`card-value-${value.title.toLowerCase()}`}>
                <div className="w-12 h-12 bg-gold/10 rounded-md flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-gold" />
                </div>
                <h4 className="font-display text-lg text-white tracking-wide mb-2">{value.title}</h4>
                <p className="text-slate-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <GoldDivider className="mb-8" />
          <h2 className="font-display text-3xl text-white tracking-wide mb-4">
            READY TO <span className="text-gold">JOIN US?</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Start your credit transformation today with a team that puts the law on your side.
          </p>
          <Link href="/audit">
            <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate" data-testid="button-about-audit">
              Start Your Audit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
