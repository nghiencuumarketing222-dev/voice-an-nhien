import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    const visitKey = "annhien-visit-counted";
    if (!sessionStorage.getItem(visitKey)) {
      sessionStorage.setItem(visitKey, "1");
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "visit", path: location.pathname }),
      }).catch(() => undefined);
    }

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview", path: location.pathname }),
    }).catch(() => undefined);
  }, [location.pathname]);

  return null;
}
