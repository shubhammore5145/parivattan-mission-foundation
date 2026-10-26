import { supabase } from "./supabase-admin";
import {
  LanguageCourse,
  getStoredCourses,
  refreshLanguageCoursesInMemory,
} from "@/data/languageCoursesData";

export const SYSTEM_CUSTOM_COURSES_ID = "00000000-0000-0000-0000-000000000002";
const STORAGE_KEY = "parivattan_custom_courses";

/**
 * Saves all custom courses to both MongoDB Atlas and Supabase cloud databases
 */
export const saveCoursesToCloud = async (courses: LanguageCourse[]): Promise<void> => {
  const payload = {
    id: SYSTEM_CUSTOM_COURSES_ID,
    name: "SYSTEM_CUSTOM_COURSES",
    education: "System Configuration",
    college_name: "Parivattan Cloud Sync",
    address: "System",
    program: "SYSTEM_CUSTOM_COURSES",
    message: JSON.stringify(courses),
    status: "completed" as const,
  };

  // 1. Save to MongoDB Atlas
  try {
    await fetch("/api/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[CloudSync] Custom courses synced to MongoDB Atlas");
  } catch (mErr) {
    console.warn("[CloudSync] MongoDB notice syncing custom courses:", mErr);
  }

  // 2. Save to Supabase
  try {
    const { error } = await supabase.from("admissions").upsert([payload], { onConflict: "id" });
    if (error) {
      await supabase.from("admissions").insert([payload]);
    }
    console.log("[CloudSync] Custom courses synced to Supabase");
  } catch (sErr) {
    console.warn("[CloudSync] Supabase notice syncing custom courses:", sErr);
  }
};

/**
 * Loads custom courses from cloud (MongoDB / Supabase) and updates local cache
 */
export const syncCoursesFromCloud = async (): Promise<LanguageCourse[]> => {
  let cloudCourses: LanguageCourse[] | null = null;

  // 1. Try MongoDB Atlas
  try {
    const res = await fetch("/api/admissions");
    if (res.ok) {
      const result = await res.json();
      if (Array.isArray(result?.data)) {
        const sysRow = result.data.find(
          (r: any) =>
            r.id === SYSTEM_CUSTOM_COURSES_ID ||
            r.name === "SYSTEM_CUSTOM_COURSES" ||
            r.program === "SYSTEM_CUSTOM_COURSES"
        );
        if (sysRow?.message) {
          const parsed = JSON.parse(sysRow.message);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cloudCourses = parsed;
          }
        }
      }
    }
  } catch (mErr) {
    console.warn("[CloudSync] MongoDB course fetch notice:", mErr);
  }

  // 2. If not found in MongoDB, try Supabase
  if (!cloudCourses) {
    try {
      const { data } = await supabase
        .from("admissions")
        .select("*")
        .eq("id", SYSTEM_CUSTOM_COURSES_ID)
        .maybeSingle();

      if (data?.message) {
        const parsed = JSON.parse(data.message);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cloudCourses = parsed;
        }
      }
    } catch (sErr) {
      console.warn("[CloudSync] Supabase course fetch notice:", sErr);
    }
  }

  if (cloudCourses && Array.isArray(cloudCourses) && cloudCourses.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudCourses));
      refreshLanguageCoursesInMemory();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("courses-updated"));
      }
      return cloudCourses;
    } catch {}
  }

  return getStoredCourses();
};
