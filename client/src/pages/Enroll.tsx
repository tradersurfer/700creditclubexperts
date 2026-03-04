import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Shield, Crown, ArrowRight, ExternalLink } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
  icon: React.ElementType;
  external?: boolean;
}

function PricingCard({ title, subtitle, price, priceNote, features, cta, href, highlighted = false, badge, icon: Icon, external }: PricingCardProps) {
  const LinkWrapper = external ? "a" : Link;
  const linkProps = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };

  return (
    <div
      className={`relative rounded-md p-6 sm:p-8 transition-all duration-300 ${
        highlighted
          ? "bg-gradient-to-b from-gold/10 to-dark-slate-light border-2 border-gold/40 scale-[1.02]"
          : "bg-dark-slate-light border border-gold/10"
      }`}
      data-testid={`card-pricing-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gold text-dark-slate text-xs font-bold px-4 py-1 rounded-full font-mono uppercase tracking-wider">
            {badge}
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <div className={`w-14 h-14 mx-auto rounded-md flex items-center justify-center mb-4 ${highlighted ? "bg-gold/20" : "bg-gold/10"}`}>
          <Icon className={`w-7 h-7 ${highlighted ? "text-gold" : "text-gold/80"}`} />
        </div>
        <h3 className="font-display text-2xl text-white tracking-wide">{title}</h3>
        <p className="text-slate-400 text-xs font-mono mt-1">{subtitle}</p>
      </div>
      <div className="text-center mb-6">
        <div className="font-display text-5xl text-gold tracking-wide">{price}</div>
        <p className="text-slate-500 text-xs font-mono mt-1">{priceNote}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span className="text-slate-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <LinkWrapper {...(linkProps as any)}>
        <Button
          size="lg"
          className={`w-full font-bold no-default-hover-elevate no-default-active-elevate ${
            highlighted
              ? "bg-gold text-dark-slate"
              : "bg-transparent border border-gold/30 text-gold"
          }`}
          data-testid={`button-enroll-${title.toLowerCase().replace(/\s/g, "-")}`}
        >
          {cta} {external ? <ExternalLink className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </LinkWrapper>
    </div>
  );
}

export default function EnrollPage() {
  usePageMeta({
    title: "Self-Enroll & Save | 700 Credit Club Experts",
    description: "Choose your credit restoration program. Full Sweep $499, Partial Sweep $199, or Full Sweep with Credit Builder $749.",
  });

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="font-mono text-gold text-xs tracking-widest uppercase mb-4 block">Personal Credit Programs</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4" data-testid="text-enroll-title">
            SELECT YOUR <span className="text-gold">ENTRANCE</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Choose the program that fits your credit restoration needs. All programs are powered by Consumer Law and AI-driven dispute strategies.
          </p>
        </div>

        <GoldDivider className="mb-14" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <PricingCard
            icon={Zap}
            title="1-Round Partial Sweep"
            subtitle="Fast Track Entry"
            price="$199"
            priceNote="One-Time Fee"
            features={[
              "1 Round of AI-Powered Disputes",
              "Trained by Credit Experts",
              "30 Day FAST TRACK",
              "Consumer Law Strategy (FCRA)",
              "Credit Report Analysis",
              "Email Support",
            ]}
            cta="GET STARTED"
            href="https://700creditclubexperts.getcredithelpnow.com/start#inputform"
            external
          />

          <PricingCard
            icon={Star}
            title="Full Sweep Credit Repair"
            subtitle="Complete Restoration"
            price="$499"
            priceNote="One-Time Fee"
            badge="MOST POPULAR"
            highlighted
            features={[
              "4 Rounds of AI-Powered Disputes",
              "Trained by Credit Experts",
              "Lifetime Access",
              "100+ Point Increase Guaranteed",
              "30-90 Days FAST",
              "AI-Powered Disputes",
              "Full Consumer Law Strategy",
              "Priority Support",
            ]}
            cta="ENROLL NOW"
            href="https://700creditclubexperts.getcredithelpnow.com/start#inputform"
            external
          />

          <PricingCard
            icon={Crown}
            title="Full Sweep w/ Credit Builder"
            subtitle="Maximum Results"
            price="$749"
            priceNote="One-Time Fee"
            features={[
              "Everything in Full Sweep",
              "Level 1 Credit Building",
              "Tradeline Strategy",
              "Score Optimization Coaching",
              "Lifetime Guarantee",
              "VIP Priority Queue",
              "Monthly Progress Reports",
            ]}
            cta="GO ALL IN"
            href="https://700creditclubexperts.getcredithelpnow.com/start#inputform"
            external
          />
        </div>

        <div className="mt-16 text-center">
          <GoldDivider className="mb-8" />
          <p className="text-slate-500 text-xs font-mono max-w-2xl mx-auto leading-relaxed">
            All programs governed by FCRA consumer rights (15 USC 1681). Results may vary based on individual credit profile. Our guarantee covers the program period specified.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/audit">
              <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-enroll-audit">
                <Shield className="w-4 h-4 mr-2" /> Need Help Choosing? Start With An Audit
              </Button>
            </Link>
            <a href="https://www.skool.com/700-credit-club-experts-7830" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-enroll-community">
                Join Our Community <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-4">
              ADDITIONAL <span className="text-gold">PROGRAMS</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6" data-testid="card-home-ownership">
              <h3 className="font-display text-xl text-white tracking-wide mb-2">Home Ownership Program</h3>
              <p className="text-slate-400 text-sm mb-4">Mortgage readiness, DTI optimization, and underwriting preparation.</p>
              <div className="font-display text-2xl text-gold mb-4">$599</div>
              <p className="text-slate-500 text-xs font-mono mb-4">One-time fee + monthly monitoring</p>
              <Link href="/audit">
                <Button variant="outline" className="w-full border-gold/20 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-home-ownership">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6" data-testid="card-business-credit">
              <h3 className="font-display text-xl text-white tracking-wide mb-2">Business Credit Builder</h3>
              <p className="text-slate-400 text-sm mb-4">EIN-based credit, vendor tradelines, and institutional funding strategy.</p>
              <div className="font-display text-2xl text-gold mb-4">$899</div>
              <p className="text-slate-500 text-xs font-mono mb-4">One-time setup + optional coaching</p>
              <Link href="/business-credit">
                <Button variant="outline" className="w-full border-gold/20 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-business-credit-program">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="bg-dark-slate-light border border-gold/10 rounded-md p-6" data-testid="card-vip">
              <h3 className="font-display text-xl text-white tracking-wide mb-2">VIP Membership & Coaching</h3>
              <p className="text-slate-400 text-sm mb-4">1:1 coaching, full financial profile management, and wealth engineering.</p>
              <div className="font-display text-2xl text-gold mb-4">$149<span className="text-lg">/mo</span></div>
              <p className="text-slate-500 text-xs font-mono mb-4">Monthly subscription</p>
              <Link href="/audit">
                <Button variant="outline" className="w-full border-gold/20 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-vip-apply">
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
