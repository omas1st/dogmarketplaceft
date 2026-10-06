import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "../utils/analytics";

/* Invisible component — place inside <BrowserRouter> so it can read
   the current route via useLocation. Fires a GA pageview on every
   route change. */
export default function AnalyticsTracker() {
  const location = useLocation();
  const [ready, setReady] = useState(false);

  /* Initialize GA4 once on mount */
  useEffect(() => {
    initGA();
    setReady(true);
  }, []);

  /* Fire a pageview each time the route changes.
     location.search is included so query strings count as distinct views. */
  useEffect(() => {
    if (!ready) return;
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [ready, location]);

  return null;
}