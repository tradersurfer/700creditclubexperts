import { Switch, Route } from "wouter";
import Navbar from "@/components/Navbar"; // Make sure this path is correct
// import Subnav from "@/components/Subnav"; // Uncomment if you have a separate Subnav component

// Page Imports
import Audit from "./pages/Audit";
import Enroll from "./pages/Enroll";
import Programs from "./pages/Programs";
import BusinessCredit from "./pages/BusinessCredit";
import About from "./pages/About";
import Portal from "./pages/Portal";
import Affiliate from "./pages/Affiliate";
import ThankYou from "./pages/ThankYou";
import HomeOwnership from "./pages/HomeOwnership";
import Features from "./pages/Features";
import StartAudit from "./pages/StartAudit";
import Success from "./pages/Success";
import FreeCreditAudit from "./pages/FreeCreditAudit";
import Home from "./pages/Home"; 

export default function App() {
  return (
    <div className="min-h-screen bg-dark-slate">
      {/* 1. Global Navigation stays outside the Switch */}
      <Navbar />
      
      {/* 2. Page Content area */}
      <main className="pt-16 sm:pt-20"> {/* Padding to prevent Nav overlap */}
        <Switch>
          <Route path="/free-credit-audit" component={FreeCreditAudit} />
          <Route path="/audit" component={Audit} />
          <Route path="/enroll" component={Enroll} />
          <Route path="/pricing" component={Enroll} />
          <Route path="/programs" component={Programs} />
          <Route path="/business-credit" component={BusinessCredit} />
          <Route path="/about" component={About} />
          <Route path="/portal" component={Portal} />
          <Route path="/affiliate" component={Affiliate} />
          <Route path="/thank-you" component={ThankYou} />
          <Route path="/home-ownership" component={HomeOwnership} />
          <Route path="/features" component={Features} />
          <Route path="/start-audit" component={StartAudit} />
          <Route path="/success" component={Success} />
          <Route path="/" component={Home} />
          
          {/* Default/404 */}
          <Route>
            <div className="flex items-center justify-center min-h-[60vh] text-white font-display text-4xl">
              404 - Page Not Found
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}