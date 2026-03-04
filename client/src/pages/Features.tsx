import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, Users, Award, CheckCircle2, Home, CreditCard, FileText, Zap, Lock, TrendingUp, BarChart3 } from "lucide-react";
import GoldDivider from "@/components/GoldDivider";
import SectionTag from "@/components/SectionTag";
import StatCounter from "@/components/StatCounter";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FeaturesPage() {
  usePageMeta({
    title: "Our Unique Features | 700 Credit Club Experts",
    description: "Discover what sets 700 Credit Club Experts apart. Lifetime guarantee, AI-powered disputes, certified experts, and more.",
  });

  const featureBlocks = [
    {
      icon: Award,
      title: "Lifetime Guarantee",
      description: "We stand behind our work. If a deleted item reappears, we re-dispute it at no extra cost. Your restoration is protected for life.",
    },
    {
      icon: Brain,
      title: "AI-Powered Dispute Engine",
      description: "Our JECI AI system analyzes your credit report for FCRA and FDCPA violations, then generates customized dispute strategies optimized for maximum deletions.",
    },
    {
      icon: Shield,
      title: "Certified Credit Experts",
      description: "Every case is handled by licensed, certified credit restoration professionals — not automated letter mills. Real experts, real strategy, real results.",
    },
    {
      icon: Users,
      title: "Affiliate Tracking Portal",
      description: "Refer clients and track every deletion, score increase, and commission in real-time through our institutional-grade affiliate dashboard.",
    },
    {
      icon: BarChart3,
      title: "Client Results Portal",
      description: "Monitor your credit restoration progress 24/7. See dispute statuses, score changes, and deletion confirmations all in one dashboard.",
    },
    {
      icon: Home,
      title: "Home Ownership Program",
      description: "Specialized mortgage readiness program. DTI optimization, underwriting preparation, and strategic score positioning for home buyers.",
    },
    {
      icon: FileText,
      title: "Unlimited Dispute Letters",
      description: "No cap on dispute rounds. We send as many legally-crafted dispute letters as needed until your credit file is clean and accurate.",
    },
    {
      icon: Zap,
      title: "Unlimited Legal Audits",
      description: "Ongoing credit report audits to identify new violations and opportunities. Your credit health is continuously monitored and optimized.",
    },
    {
      icon: Lock,
      title: "Licensed in Florida",
      description: "Fully licensed credit services organization operating under the laws of the State of Florida. Legal, moral, ethical, and factual.",
    },
    {
      icon: CreditCard,
      title: "VIP Membership Site",
      description: "Exclusive access to our Skool community, educational resources, 1:1 coaching sessions, and insider credit strategies.",
    },
    {
      icon: TrendingUp,
      title: "Credit Tracker App",
      description: "Real-time score monitoring across all three bureaus. Get alerts when changes happen and track your progress over time.",
    },
    {
      icon: CheckCircle2,
      title: "Consumer Law Strategy",
      description: "Every dispute is grounded in Consumer Law — FCRA (15 USC 1681) and FDCPA (15 USC 1692). Not template letters, but legal arguments.",
    },
  ];

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <section className="relative py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <SectionTag>What Sets Us Apart</SectionTag>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-4" data-testid="text-features-title">
              OUR UNIQUE <span className="text-gold">FEATURES</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Why 700 Credit Club Experts is the most advanced credit restoration firm in the industry.
            </p>
          </div>

          <GoldDivider className="mb-10" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <StatCounter end={84} prefix="+" suffix="" label="Avg Point Increase" />
            </div>
            <div className="text-center">
              <StatCounter end={2.4} prefix="$" suffix="M+" label="Debt Deleted" decimals={1} />
            </div>
            <div className="text-center">
              <StatCounter end={1200} suffix="+" label="Clients Served" />
            </div>
            <div className="text-center">
              <div className="font-display text-4xl text-gold tracking-wide">100%</div>
              <div className="text-slate-400 text-sm mt-2 font-medium">Guarantee</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureBlocks.map((feature, i) => (
              <div
                key={i}
                className="group bg-dark-slate-light border border-gold/10 rounded-xl p-6 transition-all duration-300 hover:border-gold/30"
                data-testid={`card-feature-${i}`}
              >
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl text-white tracking-wide mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <GoldDivider className="mb-8" />
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-8 sm:p-12 max-w-2xl mx-auto">
              <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="font-display text-3xl text-white tracking-wide mb-4">
                EXPERIENCE THE <span className="text-gold">DIFFERENCE</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Join the 700 Club today and get access to every feature listed above. Start with a free credit audit.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/audit">
                  <Button size="lg" className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate" data-testid="button-features-audit">
                    Start Your Audit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/enroll">
                  <Button variant="outline" className="border-gold/30 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate" data-testid="button-features-enroll">
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
