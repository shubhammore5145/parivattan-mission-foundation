import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { logVisitor, sendVisitorHeartbeat, sendVisitorLeave } from "@/lib/supabase-admin";

interface LiveVisitorsContextValue {
  count: number;
  refreshCount: () => Promise<void>;
}

const LiveVisitorsContext = createContext<LiveVisitorsContextValue>({
  count: 1,
  refreshCount: async () => {},
});

const BROADCAST_CHANNEL_NAME = "pmf_live_presence";
const HEARTBEAT_INTERVAL_MS = 45000; // 45 seconds (super lightweight, 0 battery/server drain)

export const LiveVisitorsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Baseline starts at 1 (the current visitor)
  const [count, setCount] = useState<number>(1);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const sessionIdRef = useRef<string>("");

  const updateCountAndBroadcast = (newCount: number) => {
    const validCount = Math.max(Number(newCount) || 1, 1);
    setCount(validCount);
    try {
      broadcastRef.current?.postMessage({
        type: "LIVE_COUNT_UPDATE",
        count: validCount,
        senderId: sessionIdRef.current,
      });
    } catch {}
  };

  const refreshCount = async () => {
    if (!sessionIdRef.current || typeof window === "undefined") return;
    try {
      const live = await sendVisitorHeartbeat(sessionIdRef.current, window.location.pathname);
      if (typeof live === "number" && live > 0) {
        updateCountAndBroadcast(live);
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    // Guard 1: Ignore automated bots, scrapers, and headless crawlers
    const ua = navigator.userAgent || "";
    const isBot =
      /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|phantom|puppeteer|lighthouse/i.test(
        ua
      ) || (navigator as any).webdriver;
    if (isBot) return;

    // 1. Establish persistent session ID for this browser tab
    const sessionKey = "parivattan_tab_session_id";
    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem(sessionKey) || "";
    } catch {}

    if (!sessionId) {
      sessionId = `pmf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      try {
        sessionStorage.setItem(sessionKey, sessionId);
      } catch {}
    }
    sessionIdRef.current = sessionId;

    // 2. Cross-tab synchronization via BroadcastChannel (zero-overhead tab sync)
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastRef.current = bc;
        bc.onmessage = (event) => {
          if (
            event.data &&
            event.data.type === "LIVE_COUNT_UPDATE" &&
            typeof event.data.count === "number"
          ) {
            setCount(Math.max(event.data.count, 1));
          }
        };
      } catch {}
    }

    // 3. Register initial session presence with MongoDB Atlas
    logVisitor({
      session_id: sessionId,
      path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: ua,
    }).then((res) => {
      if (res && res.liveVisitors && res.liveVisitors > 0) {
        updateCountAndBroadcast(res.liveVisitors);
      }
    });

    // 4. Lightweight heartbeat with tab-visibility pause
    let heartbeatTimer: any = null;

    const scheduleHeartbeat = () => {
      // Add slight random jitter (0-4s) so concurrent visitors don't hit at the exact same millisecond
      const jitter = Math.floor(Math.random() * 4000);
      heartbeatTimer = setTimeout(async () => {
        // Paused when tab is minimized or in background to prevent quota & battery drain
        if (typeof document !== "undefined" && !document.hidden) {
          try {
            const live = await sendVisitorHeartbeat(sessionId, window.location.pathname);
            if (typeof live === "number" && live > 0) {
              updateCountAndBroadcast(live);
            }
          } catch {}
        }
        scheduleHeartbeat();
      }, HEARTBEAT_INTERVAL_MS + jitter);
    };

    scheduleHeartbeat();

    // 5. Visibility Change: Immediately refresh presence when user returns to tab
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        refreshCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 6. Clean Disconnect: Remove session presence immediately when tab closes
    const handleUnload = () => {
      sendVisitorLeave(sessionId);
    };
    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (heartbeatTimer) clearTimeout(heartbeatTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
      try {
        broadcastRef.current?.close();
        broadcastRef.current = null;
      } catch {}
    };
  }, []);

  return (
    <LiveVisitorsContext.Provider value={{ count, refreshCount }}>
      {children}
    </LiveVisitorsContext.Provider>
  );
};

export const useLiveVisitors = () => useContext(LiveVisitorsContext);
