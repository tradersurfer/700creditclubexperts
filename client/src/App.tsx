import { Switch, Route } from "wouter";

import HomePage from "./pages/HomePage";
import AuditPage from "./pages/AuditPage";
import EnrollPage from "./pages/EnrollPage";
import ProgramsPage from "./pages/ProgramsPage";
import BusinessCreditPage from "./pages/BusinessCreditPage";
import AboutPage from "./pages/AboutPage";
import PortalPage from "./pages/PortalPage";
import AffiliatePage from "./pages/AffiliatePage";
import ThankYouPage from "./pages/ThankYouPage";
import HomeOwnershipPage from "./pages/HomeOwnershipPage";
import FeaturesPage from "./pages/FeaturesPage";
import StartAuditPage from "./pages/StartAuditPage";
import SuccessPage from "./pages/SuccessPage";
import NotFound from "./pages/NotFound";
import FreeCreditAudit from "./pages/FreeCreditAuditPage"; 

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
      <Route path="/freecreditaudit" component={FreeCreditAudit} />
      
      <Route path="/start-audit" component={StartAuditPage} />
      <Route path="/success" component={SuccessPage} />

      {/* Default route (404) */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default Router;