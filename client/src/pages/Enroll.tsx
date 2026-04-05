import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Shield, Crown, ArrowRight, ExternalLink, Building2, Users } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import SectionTag from "@/components/SectionTag";
import { usePageMeta } from "@/hooks/usePageMeta";

interface PricingCardProps {
  title: string;
  price: string;
  priceNote: string;
  badge?: string;
  highlighted?: boolean;
  icon: React.ElementType;
  whoItsFor: string[];
  included: string[];
  cta: string;
  href: string;
  deliveryLabel: string;
}

function PricingCard({
  title, price, priceNote, badge, highlighted = false,
  icon: Icon, whoItsFor, included, cta, href, deliveryLabel,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-xl flex flex-col transition-all duration-300 ${
        highlighted
          ? "bg-gradient-to-b from-gold/10 to-dark-slate-light border-2 border-gold/50 shadow-[0_0_40px_rgba(234,179,8,0.12)]"
          : "bg-dark-slate-light border border-gold/10 hover:border-gold/25"
      }`}
    >
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-gold text-dark-slate text-xs font-bold px-4 py-1.5 rounded-full font-mono uppercase tracking-wider shadow-lg">
            {badge}
          </span>
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 ${highlighted ? "bg-gold/20" : "bg-gold/10"}`}>
            <Icon className={`w-7 h-7 ${highlighted ? "text-gold" : "text-gold/80"}`} />
          </div>
          <h3 className="font-display text-2xl text-white tracking-wide leading-tight">{title}</h3>
          <span className="inline-block mt-1.5 text-[10px] font-mono uppercase tracking-widest text-gold/60 bg-gold/5 border border-gold/10 px-2 py-0.5 rounded">
            {deliveryLabel}
          </span>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="font-display text-5xl text-gold tracking-wide">{price}</div>
          <p className="text-slate-500 text-xs font-mono mt-1">{priceNote}</p>
        </div>

        {/* Who It's For */}
        <div className="mb-5">
          <p className="text-xs font-mono uppercase tracking-widest text-gold/70 mb-2">Who It's For</p>
          <ul className="space-y-1.5">
            {whoItsFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <span className="text-gold mt-0.5 shrink-0">›</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What's Included */}
        <div className="mb-8 flex-1">
          <p className="text-xs font-mono uppercase tracking-widest text-gold/70 mb-2">What's Included</p>
          <ul className="space-y-2">
            {included.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          <Button
            size="lg"
            className={`w-full font-bold no-default-hover-elevate no-default-active-elevate ${
              highlighted
                ? "bg-gold text-dark-slate hover:bg-gold-dark"
                : "bg-transparent border border-gold/30 text-gold hover:bg-gold/5"
            }`}
          >
            {cta} <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function EnrollPage() {
  usePageMeta({
    title: "Pricing & Programs | 700 Credit Club Experts",
    description: "Credit Audit + Round 1 starting at $149. Full Sweep + Weekly 1-on-1 at $249. Institutional Readiness at $449. Business Credit at $697. Powered by JECI AI.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-6">
          <SectionTag>Personal Credit Programs</SectionTag>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4">
            SELECT YOUR <span className="text-gold">ENTRANCE</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Every tier is powered by Consumer Law and JECI AI. Choose the level that fits your goals.
          </p>
        </div>

        <GoldDivider className="mb-14" />

        {/* 3-Tier Personal Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <PricingCard
            icon={Zap}
            title="Credit Audit + Round 1"
            price="$149"
            priceNote="One-Time · No Subscription"
            deliveryLabel="AI-Automated"
            whoItsFor={[
              "First-time clients who want proof before committing",
              "Scores under 600 with clear inaccuracies",
              "Anyone who wants a risk-free entry point",
            ]}
            included={[
              "Tri-bureau AI credit audit (JECI AI)",
              "Round 1 dispute letters (FCRA-grounded)",
              "Consumer Law strategy review",
              "Client portal access",
              "Email support",
            ]}
            cta="Start Your Audit"
            href="https://buy.stripe.com/14AdR80Pog5o6nignxfEk00"
          />

          <PricingCard
            icon={Star}
            title="Full Sweep + Weekly 1-on-1"
            price="$249"
            priceNote="One-Time · No Subscription"
            badge="Most Popular"
            highlighted
            deliveryLabel="AI-Automated"
            whoItsFor={[
              "Clients ready to commit to full restoration",
              "Those who want personal guidance weekly",
              "Buying a home, car, or building business credit",
            ]}
            included={[
              "Full multi-round AI dispute sweep",
              "Weekly 1-on-1 strategy sessions",
              "Tri-bureau coverage (Equifax, TransUnion, Experian)",
              "Consumer Law + FCRA enforcement",
              "Priority support & client portal",
              "Lifetime guarantee on deleted items",
            ]}
            cta="Self-Enroll Now"
            href="https://buy.stripe.com/9B6aEW1Ts1au12Y5ITfEk01"
          />

          <PricingCard
            icon={Crown}
            title="Institutional Readiness"
            price="$449"
            priceNote="One-Time · No Subscription"
            deliveryLabel="AI + Consulting"
            whoItsFor={[
              "High-stakes goals (mortgage, business funding)",
              "Clients needing premium expert consulting",
              "Professionals building institutional credit profiles",
            ]}
            included={[
              "Everything in Full Sweep",
              "Dedicated credit expert consultant",
              "Tradeline strategy & authorized user planning",
              "DTI optimization & underwriting prep",
              "Score modeling & goal-based roadmap",
              "VIP priority queue",
              "Monthly progress reports",
            ]}
            cta="Get Started"
            href="https://buy.stripe.com/14AdR80Pog5o6nignxfEk00"
          />
        </div>

        {/* Real Results block */}
        <div className="mt-16 bg-dark-slate-light border border-gold/20 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gold rounded-l-2xl" />
          <div className="pl-4">
            <p className="text-xs font-mono uppercase tracking-widest text-gold/70 mb-3">Real Results</p>
            <p className="text-white font-bold text-lg sm:text-xl leading-snug mb-3">
              "Client went from 524 to 608 in 67 days. 4 collections deleted. $18,400 in negative debt removed."
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-green-400/10 border border-green-400/30 text-green-400 text-xs font-mono px-3 py-1 rounded-full">+84 Points</span>
              <span className="bg-gold/10 border border-gold/30 text-gold text-xs font-mono px-3 py-1 rounded-full">4 Collections Deleted</span>
              <span className="bg-gold/10 border border-gold/30 text-gold text-xs font-mono px-3 py-1 rounded-full">$18,400 Removed</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <GoldDivider className="mb-8" />
          <p className="text-slate-500 text-xs font-mono max-w-2xl mx-auto leading-relaxed">
            All programs governed by FCRA consumer rights (15 USC 1681). Results may vary based on individual credit profile. Florida licensed credit services organization.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/audit">
              <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate">
                <Shield className="w-4 h-4 mr-2" /> Need Help Choosing? Start With a Free Audit
              </Button>
            </Link>
            <a href="https://www.skool.com/700-credit-club-experts-7830" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate">
                Join the Community <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>

        {/* Business Credit Program — Full Width */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              BUSINESS <span className="text-gold">CREDIT PROGRAM</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
              Build an EIN-based credit profile that stands independent of your personal score.
            </p>
          </div>

          <div className="bg-dark-slate-light border border-gold/20 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gold/15 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-white tracking-wide">Business Credit Program</h3>
                    <p className="text-gold/70 text-xs font-mono">AI + Consulting</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="font-display text-5xl text-gold">$697</span>
                  <span className="text-slate-500 text-sm font-mono ml-2">One-Time · No Subscription</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-gold/70 mb-2">Who It's For</p>
                    <ul className="space-y-1.5">
                      {[
                        "Business owners with LLC or Corp",
                        "Entrepreneurs needing EIN-based credit",
                        "Those bypassing personal guarantees",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                          <span className="text-gold mt-0.5 shrink-0">›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-gold/70 mb-2">What's Included</p>
                    <ul className="space-y-1.5">
                      {[
                        "EIN-based credit profile setup",
                        "Vendor tradeline strategy",
                        "Net-30 account onboarding",
                        "DUNS, SIC, NAICS optimization",
                        "Business funding roadmap",
                        "Dedicated consultant",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/business-credit">
                  <Button size="lg" className="w-full bg-gold text-dark-slate font-bold no-default-hover-elevate">
                    Learn More About Business Credit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/audit">
                  <Button size="lg" variant="outline" className="w-full border-gold/30 text-gold bg-transparent no-default-hover-elevate">
                    Get a Free Consultation First
                  </Button>
                </Link>
                <p className="text-slate-500 text-xs font-mono text-center">
                  Florida Licensed · FCRA/FDCPA Compliant · Powered by JECI AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Personal Programs */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide">
              ADDITIONAL <span className="text-gold">PROGRAMS</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
              <h3 className="font-display text-xl text-white tracking-wide mb-2">Home Ownership Program</h3>
              <p className="text-slate-400 text-sm mb-4">Mortgage readiness, DTI optimization, and underwriting preparation.</p>
              <div className="font-display text-2xl text-gold mb-4">$599</div>
              <p className="text-slate-500 text-xs font-mono mb-4">One-time fee + monthly monitoring</p>
              <Link href="/home-ownership">
                <Button variant="outline" className="w-full border-gold/20 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6">
              <h3 className="font-display text-xl text-white tracking-wide mb-2">VIP Membership & Coaching</h3>
              <p className="text-slate-400 text-sm mb-4">1:1 coaching, full financial profile management, and wealth engineering.</p>
              <div className="font-display text-2xl text-gold mb-4">$149<span className="text-lg">/mo</span></div>
              <p className="text-slate-500 text-xs font-mono mb-4">Monthly subscription</p>
              <Link href="/audit">
                <Button variant="outline" className="w-full border-gold/20 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate">
                  Apply for VIP
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
