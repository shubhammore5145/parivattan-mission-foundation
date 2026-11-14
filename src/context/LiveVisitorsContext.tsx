import React, { createContext, useContext, useEffect, useState } from "react";
import { logVisitor } from "@/lib/supabase-admin";

interface LiveVisitorsContextValue {
  count: number;
}

const LiveVisitorsContext = createContext<LiveVisitorsContextValue>({ count: 1 });

export const LiveVisitorsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Real baseline: the current visitor (1 active session)
  const [count, setCount] = useState(1);

  // Global visitor session tracking (fires at most once per user per day, ignores bots)
  useEffect(() => {
    try {
      if (typeof window === "undefined" || typeof navigator === "undefined") return;

      // Guard 1: Ignore automated bots, scrapers, and headless crawlers
      const ua = navigator.userAgent || "";
      const isBot =
        /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|phantom|puppeteer|lighthouse/i.test(
          ua
        ) || (navigator as any).webdriver;
      if (isBot) return;

      // Guard 2: Once per browser per day (localStorage check)
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastLoggedDate = localStorage.getItem("parivattan_visitor_last_logged_date");
      if (lastLoggedDate === todayStr) return;

      // Guard 3: Prevent duplicate triggers within the same active tab session
      const sessionKey = "parivattan_visitor_session";
      const existingSession = sessionStorage.getItem(sessionKey);
      if (existingSession) return;

      const sessionId = `pmf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(sessionKey, sessionId);
      localStorage.setItem("parivattan_visitor_last_logged_date", todayStr);

      logVisitor({
        session_id: sessionId,
        path: window.location.pathname,
        referrer: document.referrer || null,
        user_agent: ua,
      });
    } catch {}
  }, []);

  return (
    <LiveVisitorsContext.Provider value={{ count }}>{children}</LiveVisitorsContext.Provider>
  );
};

export const useLiveVisitors = () => useContext(LiveVisitorsContext);
