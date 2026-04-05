import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Zap, Shield, Mail, Users } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import SectionTag from "@/components/SectionTag";

export default function SuccessPage() {
  usePageMeta({
    title: "Audit Started! | 700 Credit Club Experts",
    description: "Your credit audit is underway. Expect your violation report in 24–48 hours.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">

        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>

        <SectionTag>Payment Confirmed</SectionTag>
        <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-4">
          YOUR AUDIT IS <span className="text-gold">STARTING</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8">
          Thank you for enrolling with 700 Credit Club Experts. Your JECI AI audit is now
          running across all three bureaus.
        </p>

        {/* Timeline card */}
        <div className="bg-dark-slate-light border border-gold/20 rounded-2xl p-8 mb-8 text-left">
          <p className="text-xs font-mono uppercase tracking-widest text-gold/60 mb-5">What Happens Next</p>
          <div className="space-y-5">
            {[
              { icon: Zap, time: "Right Now", title: "JECI AI Audit Running", desc: "Our AI is scanning all 3 bureaus for FCRA violations, inaccuracies, and deletion opportunities." },
              { icon: Mail, time: "Within 24–48 Hours", title: "Your Violation Report", desc: "Expect your full tri-bureau violation report in your inbox with every item flagged for deletion." },
              { icon: Shield, time: "Round 1 (Week 1–2)", title: "Dispute Letters Dispatched", desc: "Your certified expert reviews and sends FCRA-grounded dispute letters to all 3 bureaus." },
              { icon: CheckCircle2, time: "30–45 Days", title: "Bureau Responses", desc: "We track and respond to every bureau response and report deletions to your client portal." },
            ].map(({ icon: Icon, time, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-gold/70 text-[10px] font-mono uppercase tracking-widest">{time}</p>
                  <p className="text-white font-bold text-sm mb-0.5">{title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Welcome email note */}
        <div className="flex items-start gap-3 bg-gold/5 border border-gold/20 rounded-xl p-4 mb-8 text-left">
          <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm leading-relaxed">
            <strong className="text-white">Check your inbox</strong> — we're sending a welcome email with your client portal login
            credentials and next steps. Check spam if you don't see it within a few minutes.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/portal">
            <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate">
              Access Your Client Portal <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href="https://www.skool.com/700-credit-club-experts-7830" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate">
              <Users className="w-4 h-4 mr-2" /> Join the Community
            </Button>
          </a>
        </div>

        <p className="text-slate-500 text-xs font-mono leading-relaxed">
          Questions? Email us at{" "}
          <a href="mailto:sales@700creditclubexperts.com" className="text-gold hover:underline">
            sales@700creditclubexperts.com
          </a>
          {" "}· Florida Licensed · Powered by JECI AI · 15 USC 1681 Compliant
        </p>

      </div>
    </div>
  );
}
