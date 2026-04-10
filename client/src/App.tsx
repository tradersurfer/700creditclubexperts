import { Switch, Route } from "wouter";

import Home from "./pages/Home";
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
import NotFound from "./pages/NotFound";
import FreeCreditAudit from "./pages/FreeCreditAudit"; 

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
      <Route path="/freecreditaudit" component={FreeCreditAudit} />
      
      <Route path="/start-audit" component={StartAudit} />
      <Route path="/success" component={Success} />

      {/* Default route (404) */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default Router;