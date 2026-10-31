import { supabase, isRealCourseAdmission, getAllAdmissions } from "./supabase-admin";
import { recalculateBatchSeatsFromAdmissions } from "@/data/languageCoursesData";

export const SYSTEM_BATCH_OVERRIDES_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Synchronizes batch seat occupancy, student admissions, and admin capacity overrides
 * across all devices and browsers with MongoDB Atlas and cloud backup.
 */
export const syncBatchSeatsFromCloud = async (): Promise<void> => {
  try {
    const realAdmissions = await getAllAdmissions();
    if (Array.isArray(realAdmissions) && realAdmissions.length > 0) {
      recalculateBatchSeatsFromAdmissions(realAdmissions);
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
  } catch (e) {
    console.warn("Could not save batch overrides to cloud:", e);
  }
};

/**
 * Initializes real-time listener for admissions changes on Supabase.
 * Automatically synchronizes batch seats whenever any student takes admission anywhere.
 */
export const initBatchSeatsRealtimeSync = (): (() => void) => {
  // 1. Initial immediate sync
  syncBatchSeatsFromCloud();

  // 2. Supabase Realtime channel subscription
  let channel: any = null;
  try {
    channel = supabase
      .channel("realtime-batch-seats-intake")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admissions" },
        () => {
          syncBatchSeatsFromCloud();
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

  // 3. Periodic fallback poll every 45s in case websocket drops
  const intervalId = setInterval(() => {
    syncBatchSeatsFromCloud();
  }, 45000);

  // Return teardown function
  return () => {
    clearInterval(intervalId);
    if (channel) {
      try {
        channel.unsubscribe();
      } catch {}
    }
  };
};
