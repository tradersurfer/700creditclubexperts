import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/programs", label: "Programs" },
  { href: "/enroll", label: "Enroll" },
  { href: "/business-credit", label: "Business Credit" },
  { href: "/about", label: "About" },
  { href: "/portal", label: "Portal" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-slate/95 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md overflow-hidden border border-gold/20">
              <img
                src="/images/logo.jpg"
                alt="700 Credit Club Experts"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.parentElement as HTMLElement).classList.add('bg-gold', 'flex', 'items-center', 'justify-center');
                  (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span class="font-display text-dark-slate text-xl leading-none">7</span>';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-gold text-lg sm:text-xl tracking-wide leading-none block">700 CREDIT CLUB</span>
              <span className="block text-[10px] sm:text-xs text-slate-400 font-mono tracking-widest uppercase">EXPERTS</span>
            </div>
            <div className="sm:hidden">
              <span className="font-display text-gold text-base leading-none">700 CREDIT</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location === link.href ? "text-gold" : "text-slate-300 hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/audit">
              <Button className="bg-gold text-dark-slate font-semibold text-xs sm:text-sm px-3 sm:px-5 py-2">
                Start Your Audit
              </Button>
            </Link>
            <button
              className="lg:hidden text-slate-300 p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-dark-slate/98 border-t border-gold/10 backdrop-blur-md">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location === link.href ? "text-gold bg-gold/10" : "text-slate-300"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/affiliate"
              className="block px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:text-gold"
              onClick={() => setMobileOpen(false)}
            >
              Affiliate Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
