import React, { createContext, useContext, useEffect, useState } from "react";
import { logVisitor } from "@/lib/supabase-admin";
import { initBatchSeatsRealtimeSync } from "@/lib/batch-seats-sync";

interface LiveVisitorsContextValue {
  count: number;
}

const LiveVisitorsContext = createContext<LiveVisitorsContextValue>({ count: 5 });

export const LiveVisitorsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Start with a natural concurrent presence baseline (e.g. 5-7 active visitors)
  const [count, setCount] = useState(() => Math.floor(Math.random() * 3) + 5);

  // Initialize global real-time batch seats synchronization
  useEffect(() => {
    const cleanupSeatsSync = initBatchSeatsRealtimeSync();
    return () => {
      cleanupSeatsSync();
    };
  }, []);

  // Global visitor session tracking (fires once per browser session across any route to MongoDB Atlas)
  useEffect(() => {
    try {
      const sessionKey = "parivattan_visitor_session";
      const existingSession = sessionStorage.getItem(sessionKey);
      const sessionId =
        existingSession || `pmf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (!existingSession) {
        sessionStorage.setItem(sessionKey, sessionId);
      }

      logVisitor({
        session_id: sessionId,
        path: window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
    } catch {}
  }, []);

  // Live active visitors tracker via MongoDB Atlas
  useEffect(() => {
    let isMounted = true;

    const fetchLivePresence = async () => {
      try {
        const res = await fetch("/api/visitors");
        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (isMounted && json && json.data && typeof json.data.liveVisitors === "number") {
            setCount(json.data.liveVisitors);
          }
        }
      } catch {}
    };

    fetchLivePresence();

    // Natural subtle fluctuation interval (keeps 4 - 9 active)
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        if (next < 4) return 4;
        if (next > 9) return 9;
        return next;
      });
    }, 20000);

    // Periodic refresh from MongoDB Atlas every 45s
    const syncInterval = setInterval(fetchLivePresence, 45000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <LiveVisitorsContext.Provider value={{ count }}>{children}</LiveVisitorsContext.Provider>
  );
};

export const useLiveVisitors = () => useContext(LiveVisitorsContext);
