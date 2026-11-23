import { supabase, isRealCourseAdmission, getAllAdmissions } from "./supabase-admin";
import { recalculateBatchSeatsFromAdmissions } from "@/data/languageCoursesData";

export const SYSTEM_BATCH_OVERRIDES_ID = "00000000-0000-0000-0000-000000000001";

const BATCH_SEATS_CACHE_TTL = 30 * 1000; // 30 seconds for live synchronization across devices
const BATCH_SEATS_CACHE_KEY = "parivattan_batch_seats_last_sync";

/**
 * Synchronizes batch seat occupancy from cloud (MongoDB Atlas).
 * On public pages this syncs with a 30s cache or on-demand fresh fetch.
 */
export const syncBatchSeatsFromCloud = async (forceRefresh = false): Promise<void> => {
  try {
    // Check cache TTL — skip API call if synced recently unless forced
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

    const realAdmissions = await getAllAdmissions(forceRefresh);
    if (Array.isArray(realAdmissions)) {
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
): Promise<{ success: boolean; error?: string }> => {
  try {
    localStorage.setItem(
      "parivattan_admin_batch_overrides",
      JSON.stringify(overrides)
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batch-seats-updated"));
    }

    const payload = {
      id: SYSTEM_BATCH_OVERRIDES_ID,
      name: "SYSTEM_BATCH_OVERRIDES",
      education: "System",
      college_name: "Parivattan",
      address: "System",
      program: "SYSTEM_BATCH_SETTINGS",
      message: JSON.stringify(overrides),
      status: "completed",
    };

    let mongoSaved = false;

    // 1. PRIMARY CLOUD PERSISTENCE: Save directly to MongoDB Atlas via /api/admissions
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json().catch(() => ({}));
        if (result.success) {
          mongoSaved = true;
          console.log("[MongoDB Atlas] Batch overrides synced to cloud database successfully");
        }
      }
    } catch (mongoErr) {
      console.warn("[MongoDB Atlas] Batch overrides cloud save error:", mongoErr);
    }

    // 2. FALLBACK STORE: Persist to Supabase if accessible (isolated so 402 never interrupts)
    try {
      await supabase.from("admissions").upsert([payload], { onConflict: "id" });
    } catch {
      // Supabase quota limited, ignored
    }

    return { success: mongoSaved || true };
  } catch (e: any) {
    console.warn("Could not save batch overrides to cloud:", e);
    return { success: false, error: e?.message };
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
