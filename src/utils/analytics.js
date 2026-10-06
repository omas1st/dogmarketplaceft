import ReactGA from "react-ga4";

const MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

/* Initialize GA4 exactly once.
   Safe to call multiple times — react-ga4 is idempotent. */
export const initGA = () => {
  if (!MEASUREMENT_ID) {
    console.warn("GA4: REACT_APP_GA_MEASUREMENT_ID is not set.");
    return;
  }
  ReactGA.initialize(MEASUREMENT_ID);
};

/* Send a pageview for the given path.
   Called on every route change inside the SPA. */
export const trackPageView = (path) => {
  if (!MEASUREMENT_ID) return;

  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: document.title || "Dog Marketplace",
  });
};

/* Fire a custom event anywhere in the app (cart add, checkout, etc.). */
export const trackEvent = (name, params = {}) => {
  if (!MEASUREMENT_ID) return;
  ReactGA.event(name, params);
};