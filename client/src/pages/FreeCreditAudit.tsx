import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Shield, Scale, Zap, Award, ArrowRight, Building2, Home as HomeIcon,
  Crown, ChevronRight, TrendingUp, CheckCircle2, Users, Lock
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

export default function FreeCreditAudit() {
  usePageMeta({
    title: "Free Credit Audit | 700 Credit Club Experts",
    description: "Get your specialized AI-powered credit audit today.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-20">
      <section className="relative flex items-center py-20">
        <HeroGrid />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionTag>Now Accepting New Members</SectionTag>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl text-white tracking-wide leading-[0.95] mb-6">
                YOUR CREDIT SCORE <br />
                <span className="text-gold">IS A 3-DIGIT</span> <br />
                LEGAL PROBLEM.
              </h1>
              <p className="text-slate-400 text-lg mb-10">
                Consumer Law Restoration powered by JECI AI — Starting at $149.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://buy.stripe.com/14AdR80Pog5o6nignxfEk00" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-gold text-dark-slate font-bold">
                    Start Your Audit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <LiveAuditCard />
            </div>
          </div>
        </div>
      </section>
      
      <GoldDivider />
      
      {/* Additional sections can be added here following the same pattern */}
      <section className="py-20 text-center">
        <h2 className="text-white font-display text-4xl mb-4 uppercase">Legal. Moral. Ethical.</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Grounding every dispute in 15 USC 1681.</p>
      </section>
    </div>
  );
}