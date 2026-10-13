import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "../utils/analytics";

/* Fire a TikTok page() call safely — the ttq script may not have
   loaded yet on very first render, so we guard against that. */
const fireTiktokPage = () => {
  try {
    if (typeof window !== "undefined" && window.ttq && window.ttq.page) {
      window.ttq.page();
    }
  } catch (error) {
    // Never crash the app if TikTok's pixel misbehaves.
    console.warn("TikTok pixel page() failed:", error);
  }
};

export default function AnalyticsTracker() {
  const location = useLocation();

  /* Initialize GA4 once on mount */
  useEffect(() => {
    initGA();
  }, []);

  /* Fire GA4 + TikTok pageviews on every route change */
  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
    fireTiktokPage();
  }, [location]);

  return null;
}