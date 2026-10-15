import { supabase, isRealCourseAdmission } from "./supabase-admin";
import { recalculateBatchSeatsFromAdmissions } from "@/data/languageCoursesData";

export const SYSTEM_BATCH_OVERRIDES_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Synchronizes batch seat occupancy, student admissions, and admin capacity overrides
 * directly from Supabase cloud database across all devices and browsers.
 */
export const syncBatchSeatsFromCloud = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Notice syncing admissions from cloud:", error.message);
      return;
    }

    if (Array.isArray(data)) {
      // 1. Process cloud admin capacity overrides if present
      const sysRow = data.find(
        (r) =>
          r.id === SYSTEM_BATCH_OVERRIDES_ID ||
          r.program === "SYSTEM_BATCH_SETTINGS" ||
          r.name === "SYSTEM_BATCH_OVERRIDES"
      );

      if (sysRow && sysRow.message) {
        try {
          const cloudOverrides = JSON.parse(sysRow.message);
          if (cloudOverrides && typeof cloudOverrides === "object") {
            const localOverrides = JSON.parse(
              localStorage.getItem("parivattan_admin_batch_overrides") || "{}"
            );
            const merged = { ...cloudOverrides, ...localOverrides };
            localStorage.setItem(
              "parivattan_admin_batch_overrides",
              JSON.stringify(merged)
            );
          }
        } catch (e) {
          console.warn("Could not parse cloud batch overrides:", e);
        }
      }

      // 2. Filter out non-course admissions (e.g. system configs, portal account signups)
      const realAdmissions = data.filter(isRealCourseAdmission);

      // 3. Cache real admissions in localStorage for instant offline access
      try {
        localStorage.setItem(
          "parivattan_admissions",
          JSON.stringify(realAdmissions)
        );
      } catch {}

      // 4. Recalculate batch intake map across all batches
      recalculateBatchSeatsFromAdmissions(realAdmissions);

      // 5. Notify all components
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
      .subscribe();
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
