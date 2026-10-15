import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-admin";
import { initBatchSeatsRealtimeSync } from "@/lib/batch-seats-sync";

interface LiveVisitorsContextValue {
  count: number;
}

const LiveVisitorsContext = createContext<LiveVisitorsContextValue>({ count: 0 });

export const LiveVisitorsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [count, setCount] = useState(0);

  // Initialize global real-time batch seats synchronization
  useEffect(() => {
    const cleanupSeatsSync = initBatchSeatsRealtimeSync();
    return () => {
      cleanupSeatsSync();
    };
  }, []);

  useEffect(() => {
    const presenceKey = crypto.randomUUID();
    const channel = supabase.channel("live-visitors", {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    const updateCount = () => {
      const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>;
      const nextCount = Object.values(state).reduce(
        (total, clients) => total + (Array.isArray(clients) ? clients.length : 0),
        0
      );
      setCount(nextCount);
    };

    channel.on("presence", { event: "sync" }, updateCount);
    channel.on("presence", { event: "join" }, updateCount);
    channel.on("presence", { event: "leave" }, updateCount);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({
          last_seen: Date.now(),
          path: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <LiveVisitorsContext.Provider value={{ count }}>{children}</LiveVisitorsContext.Provider>
  );
};

export const useLiveVisitors = () => useContext(LiveVisitorsContext);
