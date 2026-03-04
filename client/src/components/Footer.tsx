import { Link } from "wouter";
import { SiFacebook } from "react-icons/si";
import { Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-slate border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-gold/20 shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="700 Credit Club Experts"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.parentElement as HTMLElement).classList.add('bg-gold', 'flex', 'items-center', 'justify-center');
                    (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span class="font-display text-dark-slate text-2xl leading-none">7</span>';
                  }}
                />
              </div>
              <div>
                <span className="font-display text-gold text-xl tracking-wide leading-none block">700 CREDIT CLUB</span>
                <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">EXPERTS</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mt-3">
              Legal, Moral, Ethical & Factual Credit Services.
            </p>
            <p className="text-gold/60 text-xs font-mono mt-2">Consumer Law Restoration Specialists</p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/700creditexperts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="w-5 h-5" />
              </a>
              <a
                href="mailto:sales@700creditclubexperts.com"
                className="text-slate-400 hover:text-gold transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-gold text-lg tracking-wide mb-4">NAVIGATION</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/features", label: "Features" },
                { href: "/programs", label: "Programs" },
                { href: "/enroll", label: "Self-Enroll" },
                { href: "/home-ownership", label: "Home Ownership" },
                { href: "/business-credit", label: "Business Credit" },
                { href: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 text-sm hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-gold text-lg tracking-wide mb-4">RESOURCES</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/audit" className="text-slate-400 text-sm hover:text-gold transition-colors">
                  Start Your Audit
                </Link>
              </li>
              <li>
                <Link href="/portal" className="text-slate-400 text-sm hover:text-gold transition-colors">
                  Client Portal
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-slate-400 text-sm hover:text-gold transition-colors">
                  Affiliate Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://www.skool.com/700-credit-club-experts-7830"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-gold transition-colors inline-flex items-center gap-1"
                >
                  Skool Community <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/700creditexperts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-gold transition-colors inline-flex items-center gap-1"
                >
                  Facebook Group <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://700creditclubexperts.getcredithelpnow.com/start#inputform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-gold transition-colors inline-flex items-center gap-1"
                >
                  CRC Enrollment <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-gold text-lg tracking-wide mb-4">CONTACT</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <a href="mailto:sales@700creditclubexperts.com" className="hover:text-gold transition-colors">
                  sales@700creditclubexperts.com
                </a>
              </li>
              <li>
                <a href="https://700creditclubexperts.com" className="hover:text-gold transition-colors">
                  700creditclubexperts.com
                </a>
              </li>
              <li className="text-gold/60 font-mono text-xs pt-2">
                Licensed in the State of Florida
              </li>
              <li className="text-gold/60 font-mono text-xs">
                15 USC 1681 · FCRA Compliant
              </li>
              <li className="text-gold/60 font-mono text-xs">
                15 USC 1692 · FDCPA Compliant
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 mt-12 pt-8">
          <p className="text-slate-500 text-xs leading-relaxed text-center max-w-3xl mx-auto">
            700 Credit Club Experts is a credit services organization licensed in the State of Florida.
            We do not guarantee specific results. Individual outcomes vary based on credit profile.
            All dispute strategies are grounded in 15 USC 1681 (FCRA) and 15 USC 1692 (FDCPA).
            This is not legal advice. We are not a law firm.
          </p>
          <p className="text-slate-600 text-xs text-center mt-4">
            &copy; {new Date().getFullYear()} 700 Credit Club Experts · JECI Group Credit Division. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
