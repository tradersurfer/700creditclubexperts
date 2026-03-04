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
import NotFound from "@/pages/not-found";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

function MobileCTA() {
  const [location] = useLocation();
  if (["/enroll", "/audit", "/thank-you", "/portal", "/affiliate"].includes(location)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-dark-slate/95 backdrop-blur-md border-t border-gold/20 p-3">
      <Link
        href="/enroll"
        className="flex items-center justify-center gap-2 bg-brand-red text-white font-bold text-sm py-3 rounded-lg w-full animate-pulse-glow"
      >
        Self-Enroll · Save $400 <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/audit" component={AuditPage} />
      <Route path="/enroll" component={EnrollPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/business-credit" component={BusinessCreditPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/portal" component={PortalPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/home-ownership" component={HomeOwnershipPage} />
      <Route path="/features" component={FeaturesPage} />
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
