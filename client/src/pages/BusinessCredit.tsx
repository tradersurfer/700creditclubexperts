import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, FileText, CreditCard, Landmark, ArrowRight, Check, DollarSign, TrendingUp, Users } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import SectionTag from "@/components/SectionTag";
import { usePageMeta } from "@/hooks/usePageMeta";

function FundingTierCard({ title, amount, features, highlighted = false }: { title: string; amount: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`rounded-xl p-6 transition-all ${
      highlighted
        ? "bg-gold/10 border-2 border-gold/40"
        : "bg-dark-slate-light border border-gold/10"
    }`} data-testid={`card-funding-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <h4 className="font-display text-xl text-white tracking-wide mb-1">{title}</h4>
      <p className="font-display text-3xl text-gold tracking-wide mb-4">{amount}</p>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="w-3.5 h-3.5 text-gold shrink-0" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BusinessCreditPage() {
  usePageMeta({
    title: "Business Credit Division | 700 Credit Club Experts",
    description: "Build EIN-based borrowing power. Entity formation, vendor tradelines, and institutional funding strategies.",
  });

  const blocks = [
    {
      icon: FileText,
      title: "Entity Formation",
      subtitle: "LLC / S-Corp Setup Strategy",
      description:
        "We guide you through the proper formation of your business entity to maximize credit-building potential. From EIN acquisition to state registration, every step is strategically sequenced for credit bureau recognition.",
      features: [
        "LLC or S-Corp formation guidance",
        "EIN application and configuration",
        "Registered agent setup",
        "Business address and phone verification",
        "DUNS number acquisition",
      ],
    },
    {
      icon: CreditCard,
      title: "Vendor Tradelines",
      subtitle: "Net-30 Accounts That Report",
      description:
        "We identify and onboard you with vendors that report to business credit bureaus. These Net-30 accounts build your payment history and establish your business credit profile — all without using your SSN.",
      features: [
        "Curated vendor list (Net-30, Net-60)",
        "Bureau-reporting verification",
        "Strategic account sequencing",
        "Payment history optimization",
        "Credit utilization management",
      ],
    },
    {
      icon: Landmark,
      title: "Institutional Funding",
      subtitle: "Access Capital Without Personal Exposure",
      description:
        "Once your business credit profile is established, we position your entity for institutional funding — business credit cards, lines of credit, and term loans that don't require a personal guarantee.",
      features: [
        "Business credit card applications",
        "Line of credit positioning",
        "SBA loan readiness preparation",
        "Bank relationship building",
        "Funding strategy roadmap",
      ],
    },
  ];

  const fundingTiers = [
    {
      title: "Starter",
      amount: "$5K–$25K",
      features: ["Net-30 Vendor Accounts", "DUNS Registration", "Basic Bureau Setup"],
    },
    {
      title: "Growth",
      amount: "$25K–$100K",
      highlighted: true,
      features: ["All Starter Features", "Business Credit Cards", "LOC Applications", "D&B Score Building"],
    },
    {
      title: "Institutional",
      amount: "$100K+",
      features: ["All Growth Features", "SBA Loan Positioning", "Bank Term Loans", "Full Capital Strategy"],
    },
  ];

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <section className="relative py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <SectionTag>Business Division</SectionTag>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4" data-testid="text-business-title">
              BUILD <span className="text-gold">BORROWING POWER.</span>
              <br />
              BYPASS THE <span className="text-gold">PERSONAL GUARANTEE.</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Stop using your SSN as collateral. We build EIN-based credit profiles and position your entity for institutional funding.
            </p>
          </div>

          <GoldDivider className="mb-16" />

          <div className="space-y-8">
            {blocks.map((block, index) => (
              <div
                key={block.title}
                className="bg-dark-slate-light border border-gold/10 rounded-xl p-6 sm:p-8"
                data-testid={`card-business-${block.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <block.icon className="w-7 h-7 text-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-gold/50 text-xs">STEP {index + 1}</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl text-white tracking-wide mb-1">{block.title}</h3>
                    <p className="text-gold/70 text-xs font-mono mb-4">{block.subtitle}</p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{block.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {block.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <div className="text-center mb-10">
              <SectionTag>Funding Tiers</SectionTag>
              <h2 className="font-display text-3xl sm:text-4xl text-white tracking-wide mb-2">
                CAPITAL <span className="text-gold">ACCESS LEVELS</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Your funding potential grows as your business credit profile strengthens.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fundingTiers.map((tier) => (
                <FundingTierCard key={tier.title} {...tier} />
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <GoldDivider className="mb-8" />
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-8 sm:p-12 max-w-2xl mx-auto">
              <Building2 className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="font-display text-3xl text-white tracking-wide mb-4">
                READY TO BUILD YOUR <span className="text-gold">BUSINESS CREDIT?</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Schedule a business credit strategy call and let our experts map out your path to EIN-based funding.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/audit">
                  <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate" data-testid="button-business-audit">
                    Schedule Strategy Call <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/enroll">
                  <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-business-enroll">
                    View Pricing
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
