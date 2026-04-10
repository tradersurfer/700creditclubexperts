import React from "react";
import { Switch, Route } from "react-router-dom";

// Standard Page Imports
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

// The specific import you requested
import FreeCreditAudit from "./pages/FreeCreditAudit"; 

function Router() {
  return (
    <Switch>
      {/* CRITICAL: The 'exact' prop prevents the "/" path from 
          matching every single URL and blocking other routes. 
      */}
      <Route exact path="/" component={HomePage} />
      
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
      
      {/* New Route for Free Credit Audit */}
      <Route path="/freecreditaudit" component={FreeCreditAudit} />
      
      <Route path="/start-audit" component={StartAuditPage} />
      <Route path="/success" component={SuccessPage} />
      
      {/* Fallback for 404 pages */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default Router;