import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/Home";
import AuditPage from "@/pages/Audit";
import EnrollPage from "@/pages/Enroll";
import ProgramsPage from "@/pages/Programs";
import BusinessCreditPage from "@/pages/BusinessCredit";
import AboutPage from "@/pages/About";
import PortalPage from "@/pages/Portal";
import AffiliatePage from "@/pages/Affiliate";
import ThankYouPage from "@/pages/ThankYou";
import HomeOwnershipPage from "@/pages/HomeOwnership";
import FeaturesPage from "@/pages/Features";
import StartAuditPage from "@/pages/StartAudit";
import SuccessPage from "@/pages/Success";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function MobileCTA() {
  const [location] = useLocation();
  if (["/enroll", "/pricing", "/audit", "/start-audit", "/thank-you", "/success", "/portal", "/affiliate"].includes(location)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-slate/97 backdrop-blur-md border-t border-gold/20 p-3 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex gap-3">
        <a
          href="https://buy.stripe.com/14AdR80Pog5o6nignxfEk00"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-gold text-dark-slate font-bold text-sm py-3 rounded-lg"
        >
          Start Your Audit — $149
        </a>
        <a
          href="mailto:sales@700creditclubexperts.com"
          className="flex items-center justify-center px-4 border border-gold/40 text-white font-semibold text-sm py-3 rounded-lg bg-transparent"
        >
          Email Us
        </a>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/audit" component={AuditPage} />
      <Route path="/enroll" component={EnrollPage} />
      <Route path="/pricing" component={EnrollPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/business-credit" component={BusinessCreditPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/portal" component={PortalPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/home-ownership" component={HomeOwnershipPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/start-audit" component={StartAuditPage} />
      <Route path="/success" component={SuccessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-slate">
          <Navbar />
          <ScrollToTop />
          <main>
            <Router />
          </main>
          <Footer />
          <MobileCTA />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
