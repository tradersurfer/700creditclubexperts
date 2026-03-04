import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight, ExternalLink } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ThankYouPage() {
  usePageMeta({
    title: "Audit Request Received | 700 Credit Club Experts",
    description: "Your credit audit request has been received. Check your email for credentials and next steps.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-gold" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-4" data-testid="text-thankyou-title">
          YOU'RE IN <span className="text-gold">THE SYSTEM.</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
          Your audit request has been received. Check your email for your portal credentials
          and next steps. A certified expert will contact you within 1 business day.
        </p>

        <GoldDivider className="mb-8" />

        <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-gold" />
            <span className="font-mono text-gold text-xs tracking-widest uppercase">Expected Response</span>
          </div>
          <div className="font-display text-5xl sm:text-6xl text-gold tracking-wide mb-2">
            24 HOURS
          </div>
          <p className="text-slate-500 text-xs font-mono">Or sooner — we move fast</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/portal">
            <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate" data-testid="button-thankyou-portal">
              Login to Your Portal <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href="https://www.skool.com/700-credit-club-experts-7830" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-thankyou-community">
              Join the Community <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
