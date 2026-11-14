import { supabase } from "./supabase-admin";
import {
  AnnouncementItem,
  NewsArticleItem,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NEWS,
  getStoredAnnouncements,
  getStoredNews,
} from "@/data/newsAndAnnouncementsData";

export const SYSTEM_ANNOUNCEMENTS_NEWS_ID = "00000000-0000-0000-0000-000000000003";
const ANNOUNCEMENTS_STORAGE_KEY = "parivattan_custom_announcements";
const NEWS_STORAGE_KEY = "parivattan_custom_news";
const SYNC_CACHE_TIME_KEY = "parivattan_news_announcements_last_sync";
const SYNC_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache for public visitors

/**
 * Compresses an image file using an in-memory HTML5 Canvas to prevent MongoDB payload bloating.
 * Converts large multi-megabyte camera photos into crisp ~100-200KB base64 Data URLs.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<{ dataUrl: string; name: string }> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided"));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ dataUrl: reader.result as string, name: file.name });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({ dataUrl, name: file.name });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Persists announcements and news articles to both MongoDB Atlas and Supabase cloud databases.
 */
export const saveAnnouncementsAndNewsToCloud = async (
  announcements?: AnnouncementItem[],
  newsList?: NewsArticleItem[]
): Promise<void> => {
  const currentAnnouncements = announcements || getStoredAnnouncements();
  const currentNews = newsList || getStoredNews();

  // 1. Immediately update localStorage for instant local reactivity
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(currentAnnouncements));
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(currentNews));
    localStorage.setItem(SYNC_CACHE_TIME_KEY, String(Date.now()));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
    }
  } catch (err) {
    console.warn("[CloudSync] LocalStorage write notice:", err);
  }

  const payload = {
    id: SYSTEM_ANNOUNCEMENTS_NEWS_ID,
    name: "SYSTEM_NEWS_ANNOUNCEMENTS",
    education: "System Configuration",
    college_name: "Parivattan Cloud Sync",
    address: "System",
    program: "SYSTEM_NEWS_ANNOUNCEMENTS",
    message: JSON.stringify({
      announcements: currentAnnouncements,
      newsList: currentNews,
      updatedAt: new Date().toISOString(),
    }),
    status: "completed" as const,
  };

  // 2. Persist to MongoDB Atlas
  try {
    const res = await fetch("/api/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      console.log("[CloudSync] News & Announcements synced to MongoDB Atlas");
    }
  } catch (mErr) {
    console.warn("[CloudSync] MongoDB notice syncing news & announcements:", mErr);
  }

  // 3. Persist to Supabase as cloud backup
  try {
    const { error } = await supabase.from("admissions").upsert([payload], { onConflict: "id" });
    if (error) {
      await supabase.from("admissions").insert([payload]);
    }
    console.log("[CloudSync] News & Announcements synced to Supabase");
  } catch (sErr) {
    console.warn("[CloudSync] Supabase notice syncing news & announcements:", sErr);
  }
};

/**
 * Synchronizes announcements and news from cloud (MongoDB Atlas / Supabase) to local browser cache.
 */
export const syncAnnouncementsAndNewsFromCloud = async (
  forceFresh = false
): Promise<{
  announcements: AnnouncementItem[];
  newsList: NewsArticleItem[];
}> => {
  // Check cache TTL on public visitors
  if (!forceFresh && typeof window !== "undefined") {
    try {
      const lastSync = parseInt(localStorage.getItem(SYNC_CACHE_TIME_KEY) || "0", 10);
      if (Date.now() - lastSync < SYNC_CACHE_TTL) {
        return {
          announcements: getStoredAnnouncements(),
          newsList: getStoredNews(),
        };
      }
    } catch {}
  }

  let cloudData: { announcements?: AnnouncementItem[]; newsList?: NewsArticleItem[] } | null = null;

  // 1. Fetch directly from MongoDB Atlas
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `/api/admissions?id=${encodeURIComponent(SYSTEM_ANNOUNCEMENTS_NEWS_ID)}&full=true`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data?.message) {
        try {
          const parsed = JSON.parse(result.data.message);
          if (parsed && typeof parsed === "object") {
            cloudData = parsed;
          }
        } catch {}
      }
    }
  } catch (mErr) {
    console.warn("[CloudSync] MongoDB fetch notice for news/announcements:", mErr);
  }

  // 2. Fallback to Supabase if not yet in MongoDB
  if (!cloudData) {
    try {
      const { data } = await supabase
        .from("admissions")
        .select("*")
        .eq("id", SYSTEM_ANNOUNCEMENTS_NEWS_ID)
        .maybeSingle();

      if (data?.message) {
        const parsed = JSON.parse(data.message);
        if (parsed && typeof parsed === "object") {
          cloudData = parsed;
        }
      }
    } catch (sErr) {
      console.warn("[CloudSync] Supabase fetch notice for news/announcements:", sErr);
    }
  }

  // 3. Process and apply cloud data
  if (cloudData) {
    const mergedAnnouncements = Array.isArray(cloudData.announcements) && cloudData.announcements.length > 0
      ? cloudData.announcements
      : getStoredAnnouncements();

    const mergedNews = Array.isArray(cloudData.newsList) && cloudData.newsList.length > 0
      ? cloudData.newsList
      : getStoredNews();

    try {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(mergedAnnouncements));
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(mergedNews));
      localStorage.setItem(SYNC_CACHE_TIME_KEY, String(Date.now()));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
      }
    } catch {}

    return { announcements: mergedAnnouncements, newsList: mergedNews };
  }

  return {
    announcements: getStoredAnnouncements(),
    newsList: getStoredNews(),
  };
};
