import { supabase, isRealCourseAdmission, getAllAdmissions } from "./supabase-admin";
import { recalculateBatchSeatsFromAdmissions } from "@/data/languageCoursesData";

export const SYSTEM_BATCH_OVERRIDES_ID = "00000000-0000-0000-0000-000000000001";

const BATCH_SEATS_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
const BATCH_SEATS_CACHE_KEY = "parivattan_batch_seats_last_sync";

/**
 * Synchronizes batch seat occupancy from cloud (MongoDB Atlas).
 * Uses a 1-hour localStorage cache to prevent excessive API calls.
 * On public pages this only fires if cache is stale (>1hr old).
 */
export const syncBatchSeatsFromCloud = async (forceRefresh = false): Promise<void> => {
  try {
    // Check cache TTL — skip API call if synced recently
    if (!forceRefresh) {
      const lastSync = parseInt(localStorage.getItem(BATCH_SEATS_CACHE_KEY) || "0", 10);
      if (Date.now() - lastSync < BATCH_SEATS_CACHE_TTL) {
        // Cache still fresh — recalculate from local data only
        recalculateBatchSeatsFromAdmissions([]);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("batch-seats-updated"));
        }
        return;
      }
    }

    const realAdmissions = await getAllAdmissions();
    if (Array.isArray(realAdmissions) && realAdmissions.length > 0) {
      recalculateBatchSeatsFromAdmissions(realAdmissions);
      localStorage.setItem(BATCH_SEATS_CACHE_KEY, String(Date.now()));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("batch-seats-updated"));
      }
    }
  } catch (err) {
    console.warn("Error running syncBatchSeatsFromCloud:", err);
  }
};

/**
 * Saves admin batch seat capacity or full-status overrides to cloud and local storage,
 * broadcasting the update to all active devices in real-time.
 */
export const saveBatchOverridesToCloud = async (
  overrides: Record<string, any>
): Promise<void> => {
  try {
    localStorage.setItem(
      "parivattan_admin_batch_overrides",
      JSON.stringify(overrides)
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batch-seats-updated"));
    }

    // Persist to Supabase cloud
    await supabase.from("admissions").upsert(
      [
        {
          id: SYSTEM_BATCH_OVERRIDES_ID,
          name: "SYSTEM_BATCH_OVERRIDES",
          education: "System",
          college_name: "Parivattan",
          address: "System",
          program: "SYSTEM_BATCH_SETTINGS",
          message: JSON.stringify(overrides),
          status: "completed",
        },
      ],
      { onConflict: "id" }
    );

    // Also persist to MongoDB Atlas via /api/admissions
    try {
      await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: SYSTEM_BATCH_OVERRIDES_ID,
          name: "SYSTEM_BATCH_OVERRIDES",
          education: "System",
          college_name: "Parivattan",
          address: "System",
          program: "SYSTEM_BATCH_SETTINGS",
          message: JSON.stringify(overrides),
          status: "completed",
        }),
      });
    } catch {}
  } catch (e) {
    console.warn("Could not save batch overrides to cloud:", e);
  }
};

/**
 * Initializes real-time listener for admissions changes on Supabase.
 * Automatically synchronizes batch seats whenever any student takes admission anywhere.
 */
export const initBatchSeatsRealtimeSync = (): (() => void) => {
  // 1. Initial sync — force refresh so admin dashboard always gets fresh data
  syncBatchSeatsFromCloud(true);

  // 2. Supabase Realtime channel subscription
  let channel: any = null;
  try {
    channel = supabase
      .channel("realtime-batch-seats-intake")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admissions" },
        () => {
          syncBatchSeatsFromCloud(true); // Force refresh on realtime DB change
        }
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          // Prevent infinite reconnect WebSocket loops when Supabase is quota-limited (402)
          try {
            channel?.unsubscribe();
          } catch {}
        }
      });
  } catch (e) {
    console.warn("Could not attach realtime batch seats subscription:", e);
  }

  // Return teardown function
  return () => {
    if (channel) {
      try {
        channel.unsubscribe();
      } catch {}
    }
  };
};
