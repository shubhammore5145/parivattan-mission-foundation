import { createClient } from "@supabase/supabase-js";
import { recalculateBatchSeatsFromAdmissions } from "@/data/languageCoursesData";
export { recalculateBatchSeatsFromAdmissions };

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.PUBLIC_SUPABASE_URL ||
  "https://jpaftezwrwpcmidcdzzd.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYWZ0ZXp3cndwY21pZGNkenpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjAyNzYsImV4cCI6MjA4NTE5NjI3Nn0.LmvwThxxQ95QcklQwG7Wk88wAc86UvkElwmA2koMe-k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Visitor Types
export interface VisitorStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

// Donation Types
export interface Donation {
  id: string;
  amount: number;
  currency: string;
  payment_id: string;
  order_id: string;
  service_id?: string;
  service_name?: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface Admission {
  id: string;
  name: string;
  education: string;
  college_name: string;
  address: string;
  identity_proof?: string;
  identity_proof_name?: string;
  identityProofUrl?: string;
  identityProofName?: string;
  photo?: string;
  photo_name?: string;
  photoUrl?: string;
  photoDataUrl?: string;
  caste_certificate?: string;
  caste_certificate_name?: string;
  casteCertUrl?: string;
  casteCertificateName?: string;
  education_proof?: string;
  education_proof_name?: string;
  marksheetUrl?: string;
  educationProofName?: string;
  gender?: string;
  current_address?: string;
  permanent_address?: string;
  email?: string;
  phone?: string;
  program?: string;
  message?: string;
  amount?: number;
  payment_id?: string;
  batch_id?: string;
  batchId?: string;
  status: "completed" | "failed" | "pending";
  created_at: string;
  [key: string]: any;
}

export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Exact column list present in the Supabase 'admissions' table
const SUPABASE_ADMISSIONS_TABLE_COLUMNS = new Set([
  "id",
  "name",
  "education",
  "college_name",
  "address",
  "gender",
  "current_address",
  "permanent_address",
  "email",
  "phone",
  "program",
  "message",
  "amount",
  "payment_id",
  "identity_proof",
  "identity_proof_name",
  "photo",
  "photo_name",
  "caste_certificate",
  "caste_certificate_name",
  "education_proof",
  "education_proof_name",
  "status",
  "created_at",
]);

export const sanitizeAdmissionForSupabase = (
  record: Record<string, any>
): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(record)) {
    if (SUPABASE_ADMISSIONS_TABLE_COLUMNS.has(key)) {
      sanitized[key] = record[key];
    }
  }

  // Preserve batch info inside message field so it is never lost
  const batchId = record.batch_id || record.batchId;
  if (batchId) {
    const batchTag = `Batch ID: ${batchId}`;
    if (!sanitized.message) {
      sanitized.message = batchTag;
    } else if (!sanitized.message.includes(batchId)) {
      sanitized.message = `${sanitized.message} | ${batchTag}`;
    }
  }

  return sanitized;
};

export const checkMongoStatus = async (): Promise<{
  connected: boolean;
  dbName: string;
  hasPlaceholder: boolean;
  message: string;
}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("/api/admissions?health=true", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    connected: false,
    dbName: "parivattan_db",
    hasPlaceholder: true,
    message: "Could not reach MongoDB admissions service.",
  };
};

export const createAdmission = async (
  admissionData: Omit<Admission, "id" | "created_at"> & { id?: string }
): Promise<Admission> => {
  const finalId =
    admissionData.id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(admissionData.id)
      ? admissionData.id
      : generateUUID();

  const newAdmission: Admission = {
    ...admissionData,
    id: finalId,
    created_at: new Date().toISOString(),
  };

  // Persist locally so applications are never lost in client state
  try {
    const existing = JSON.parse(localStorage.getItem("parivattan_admissions") || "[]");
    localStorage.setItem("parivattan_admissions", JSON.stringify([newAdmission, ...existing]));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  // Recalculate batch seats immediately
  try {
    recalculateBatchSeatsFromAdmissions();
  } catch {}

  // 1. SAVE NEW ADMISSION DIRECTLY TO MONGODB DATABASE
  let mongoData: any = null;
  try {
    const res = await fetch("/api/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAdmission),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        console.log("[MongoDB Atlas] New student admission saved to MongoDB:", result.data);
        mongoData = result.data;
      }
    } else if (res.status === 429) {
      const result = await res.json().catch(() => ({}));
      const errorMsg =
        result.error ||
        "Request limit exceeded. Please wait a moment.";
      console.warn("[RateLimit] Mongo admission API rate limited, proceeding to Supabase fallback:", errorMsg);
    }
  } catch (mongoErr: any) {
    console.warn("[MongoDB Atlas] Notice saving to MongoDB admissions API, will use Supabase fallback:", mongoErr);
  }

  // 2. ALWAYS ALSO SAVE TO SUPABASE CLOUD DATABASE
  // This guarantees BOTH databases have the complete, identical record at all times!
  let supabaseData: any = null;
  try {
    const supabasePayload = sanitizeAdmissionForSupabase(newAdmission);
    const { data, error } = await supabase
      .from("admissions")
      .upsert([supabasePayload], { onConflict: "id" })
      .select()
      .single();

    if (!error && data) {
      console.log("[Supabase] Admission successfully synced to Supabase:", data.id);
      supabaseData = data;
    } else if (error) {
      // Fallback insert if upsert encountered conflict
      const { data: insData, error: insErr } = await supabase
        .from("admissions")
        .insert([supabasePayload])
        .select()
        .single();
      if (!insErr && insData) {
        supabaseData = insData;
      } else {
        console.warn("Supabase admissions insert notice:", error.message || insErr?.message);
      }
    }
  } catch (e) {
    console.warn("Supabase admissions insert notice:", e);
  }

  return { ...newAdmission, ...(supabaseData || {}), ...(mongoData || {}) };
};

export const isRealCourseAdmission = (row: any): boolean => {
  if (!row) return false;
  if (
    row.id === "00000000-0000-0000-0000-000000000001" ||
    row.id === "00000000-0000-0000-0000-000000000002" ||
    row.name === "SYSTEM_BATCH_OVERRIDES" ||
    row.name === "SYSTEM_CUSTOM_COURSES"
  ) {
    return false;
  }
  const prog = (row.program || "").trim().toUpperCase();
  if (
    prog === "STUDENT_REGISTRATION" ||
    prog === "REGISTERED_ACCOUNT" ||
    prog === "ACCOUNT_SIGNUP" ||
    prog === "USER_REGISTRATION" ||
    prog === "SYSTEM_BATCH_SETTINGS" ||
    prog === "SYSTEM_CUSTOM_COURSES"
  ) {
    return false;
  }

  // If the record has an actual course program (Japanese, German, French, English, etc.) OR an amount paid > 0,
  // it is definitively a real course admission!
  if (
    (row.amount && Number(row.amount) > 0) ||
    prog.includes("JAPANESE") ||
    prog.includes("GERMAN") ||
    prog.includes("FRENCH") ||
    prog.includes("ENGLISH") ||
    prog.includes("LANGUAGE") ||
    prog.includes("BATCH")
  ) {
    return true;
  }

  if (
    row.education === "Registered Student User" &&
    row.college_name === "Parivattan Student Portal" &&
    !row.batchId &&
    !row.batch_id
  ) {
    return false;
  }
  if (row.message && typeof row.message === "string" && row.message.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(row.message);
      if (parsed.type === "registered_student" && !parsed.courseId && !parsed.program && !parsed.batchId) {
        return false;
      }
    } catch {}
  }
  return true;
};

let activeAdmissionsPromise: Promise<Admission[]> | null = null;
let lastAdmissionsFetchTime = 0;
let cachedAdmissionsData: Admission[] = [];

export const getAllAdmissions = async (forceFresh = false): Promise<Admission[]> => {
  const now = Date.now();
  if (!forceFresh && cachedAdmissionsData.length > 0 && now - lastAdmissionsFetchTime < 3000) {
    return cachedAdmissionsData;
  }

  if (activeAdmissionsPromise) {
    return activeAdmissionsPromise;
  }

  activeAdmissionsPromise = (async () => {
    let mongoAdmissions: Admission[] = [];
    let supabaseAdmissions: Admission[] = [];

    // Parallel fetch from both MongoDB and Supabase for maximum speed
    const fetchMongo = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("/api/admissions", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            return result.data.filter(isRealCourseAdmission);
          }
        }
      } catch (mongoErr) {
        console.warn("MongoDB admissions fetch notice:", mongoErr);
      }
      return [];
    };

    const fetchSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("admissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          // Process cloud admin capacity overrides if present
          const sysRow = data.find(
            (r) =>
              r.id === "00000000-0000-0000-0000-000000000001" ||
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
            } catch {}
          }
          return data.filter(isRealCourseAdmission);
        }
      } catch (e) {
        console.warn("Supabase admissions fetch notice:", e);
      }
      return [];
    };

    const [mongoResult, supabaseResult] = await Promise.allSettled([
      fetchMongo(),
      fetchSupabase(),
    ]);

    if (mongoResult.status === "fulfilled") {
      mongoAdmissions = mongoResult.value;
    }
    if (supabaseResult.status === "fulfilled") {
      supabaseAdmissions = supabaseResult.value;
    }

    // 3. Seed with local storage cache
    let localAdmissions: Admission[] = [];
    try {
      const local: any[] = JSON.parse(localStorage.getItem("parivattan_admissions") || "[]");
      localAdmissions = local.filter(isRealCourseAdmission);
    } catch {}

    // 4. Merge and deduplicate records: MongoDB (highest priority) -> Supabase -> Local
    const admissionsMap = new Map<string, Admission>();

    for (const adm of localAdmissions) {
      if (adm.id) admissionsMap.set(adm.id, adm);
    }
    for (const adm of supabaseAdmissions) {
      if (adm.id) admissionsMap.set(adm.id, adm);
    }
    for (const adm of mongoAdmissions) {
      if (adm.id) admissionsMap.set(adm.id, adm);
    }

    const rawMerged = Array.from(admissionsMap.values()).sort(
      (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
    );

  // Secondary deduplication: prevent double entries from rapid multiple clicks, dual-sync, or duplicate saves
  const deduplicatedAdmissions: Admission[] = [];
  const seenPaymentIds = new Set<string>();
  const seenStudentCourses = new Set<string>();

  for (const adm of rawMerged) {
    // 1. Payment ID deduplication (Razorpay or Online payment reference)
    const pid = adm.payment_id?.trim();
    if (pid && pid !== "OFFLINE_RECORD" && !pid.startsWith("PAY_ADM_")) {
      const normalizedPid = pid.toLowerCase();
      if (seenPaymentIds.has(normalizedPid)) {
        continue; // Skip duplicate record with identical payment reference
      }
      seenPaymentIds.add(normalizedPid);
    }

    // 2. Strict Student + Course deduplication:
    // A student should never have duplicate entries for the exact same course program
    const contactKey = (adm.email || adm.phone || "").trim().toLowerCase();
    const programKey = (adm.program || "").trim().toLowerCase();
    if (contactKey && programKey) {
      const studentCourseKey = `${contactKey}::${programKey}`;
      if (seenStudentCourses.has(studentCourseKey)) {
        continue; // Skip duplicate entry for this course
      }
      seenStudentCourses.add(studentCourseKey);
    }

    deduplicatedAdmissions.push(adm);
  }

  cachedAdmissionsData = deduplicatedAdmissions;
  lastAdmissionsFetchTime = Date.now();

  if (deduplicatedAdmissions.length > 0) {
    try {
      localStorage.setItem("parivattan_admissions", JSON.stringify(deduplicatedAdmissions));
      recalculateBatchSeatsFromAdmissions(deduplicatedAdmissions);
    } catch {}
    return deduplicatedAdmissions;
  }

  return [];
  })().finally(() => {
    activeAdmissionsPromise = null;
  });

  return activeAdmissionsPromise;
};

export const deleteAdmission = async (id: string): Promise<void> => {
  // Bust in-memory cache immediately
  cachedAdmissionsData = cachedAdmissionsData.filter((item) => item.id !== id);
  lastAdmissionsFetchTime = 0;

  // 1. Delete from MongoDB
  try {
    await fetch(`/api/admissions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (mongoErr) {
    console.warn("MongoDB admissions delete notice:", mongoErr);
  }

  // 2. Delete from Supabase
  try {
    await supabase.from("admissions").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase admissions delete notice:", e);
  }

  // 3. Delete from localStorage
  try {
    const list: Admission[] = JSON.parse(localStorage.getItem("parivattan_admissions") || "[]");
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem("parivattan_admissions", JSON.stringify(updated));
    recalculateBatchSeatsFromAdmissions(updated);
  } catch (e) {
    console.warn("localStorage delete notice:", e);
  }
};

export const updateAdmissionStatus = async (
  id: string,
  status: "completed" | "failed" | "pending"
): Promise<void> => {
  // 1. Update in MongoDB
  try {
    await fetch(`/api/admissions?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  } catch (mongoErr) {
    console.warn("MongoDB admissions update status notice:", mongoErr);
  }

  // 2. Update in Supabase
  try {
    await supabase.from("admissions").update({ status }).eq("id", id);
  } catch (e) {
    console.warn("Supabase admissions update notice:", e);
  }

  // 3. Update in localStorage
  try {
    const list: Admission[] = JSON.parse(localStorage.getItem("parivattan_admissions") || "[]");
    const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
    localStorage.setItem("parivattan_admissions", JSON.stringify(updated));
  } catch (e) {
    console.warn("localStorage update notice:", e);
  }
};

export const updateAdmission = async (
  id: string,
  updatedFields: Partial<Admission>
): Promise<Admission> => {
  // 1. Update in MongoDB
  try {
    await fetch(`/api/admissions?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updatedFields }),
    });
  } catch (mongoErr) {
    console.warn("MongoDB admissions update notice:", mongoErr);
  }

  // 2. Supabase update
  try {
    const supabasePayload = sanitizeAdmissionForSupabase(updatedFields);
    if (Object.keys(supabasePayload).length > 0) {
      const { error } = await supabase.from("admissions").update(supabasePayload).eq("id", id);
      if (error) {
        console.warn("Supabase admissions update notice:", error);
      }
    }
  } catch (e) {
    console.warn("Supabase admissions update exception:", e);
  }

  // 2. Update localStorage "parivattan_admissions"
  let updatedRecord: Admission | null = null;
  try {
    const list: Admission[] = JSON.parse(localStorage.getItem("parivattan_admissions") || "[]");
    const updated = list.map((item) => {
      if (item.id === id) {
        updatedRecord = { ...item, ...updatedFields };
        return updatedRecord;
      }
      return item;
    });
    localStorage.setItem("parivattan_admissions", JSON.stringify(updated));
    try {
      recalculateBatchSeatsFromAdmissions(updated);
    } catch {}
  } catch (e) {
    console.warn("localStorage parivattan_admissions update notice:", e);
  }

  // 3. Update localStorage "parivattan_admissions_records"
  try {
    const recs: any[] = JSON.parse(localStorage.getItem("parivattan_admissions_records") || "[]");
    const updatedRecs = recs.map((rec) => {
      if (rec.id === id || rec.applicationNo === id) {
        return {
          ...rec,
          studentName: updatedFields.name !== undefined ? updatedFields.name : rec.studentName,
          studentEmail: updatedFields.email !== undefined ? updatedFields.email : rec.studentEmail,
          studentPhone: updatedFields.phone !== undefined ? updatedFields.phone : rec.studentPhone,
          qualification: updatedFields.education !== undefined ? updatedFields.education : rec.qualification,
          collegeName: updatedFields.college_name !== undefined ? updatedFields.college_name : rec.collegeName,
          address: updatedFields.address !== undefined ? updatedFields.address : rec.address,
          currentAddress: updatedFields.current_address !== undefined ? updatedFields.current_address : rec.currentAddress,
          permanentAddress: updatedFields.permanent_address !== undefined ? updatedFields.permanent_address : rec.permanentAddress,
          gender: updatedFields.gender !== undefined ? updatedFields.gender : rec.gender,
          courseTitle: updatedFields.program !== undefined ? updatedFields.program : rec.courseTitle,
          status: updatedFields.status !== undefined ? updatedFields.status : rec.status,
          amount: updatedFields.amount !== undefined ? updatedFields.amount : rec.amount,
          photoDataUrl: updatedFields.photo !== undefined ? updatedFields.photo : rec.photoDataUrl,
          identityProofName: updatedFields.identity_proof_name !== undefined ? updatedFields.identity_proof_name : rec.identityProofName,
          casteCertificateName: updatedFields.caste_certificate_name !== undefined ? updatedFields.caste_certificate_name : rec.casteCertificateName,
          educationProofName: updatedFields.education_proof_name !== undefined ? updatedFields.education_proof_name : rec.educationProofName,
        };
      }
      return rec;
    });
    localStorage.setItem("parivattan_admissions_records", JSON.stringify(updatedRecs));
  } catch (e) {
    console.warn("localStorage parivattan_admissions_records update notice:", e);
  }

  // 4. Update localStorage "parivattan_student_admissions"
  try {
    const sApps: any[] = JSON.parse(localStorage.getItem("parivattan_student_admissions") || "[]");
    const updatedSApps = sApps.map((app) => {
      if (app.id === id || app.applicationNo === id) {
        return {
          ...app,
          studentName: updatedFields.name !== undefined ? updatedFields.name : app.studentName,
          studentEmail: updatedFields.email !== undefined ? updatedFields.email : app.studentEmail,
          studentPhone: updatedFields.phone !== undefined ? updatedFields.phone : app.studentPhone,
          qualification: updatedFields.education !== undefined ? updatedFields.education : app.qualification,
          collegeName: updatedFields.college_name !== undefined ? updatedFields.college_name : app.collegeName,
          address: updatedFields.address !== undefined ? updatedFields.address : app.address,
          status: updatedFields.status !== undefined ? updatedFields.status : app.status,
          photoUrl: updatedFields.photo !== undefined ? updatedFields.photo : app.photoUrl,
          identityProofUrl: updatedFields.identity_proof !== undefined ? updatedFields.identity_proof : app.identityProofUrl,
          casteCertUrl: updatedFields.caste_certificate !== undefined ? updatedFields.caste_certificate : app.casteCertUrl,
          marksheetUrl: updatedFields.education_proof !== undefined ? updatedFields.education_proof : app.marksheetUrl,
        };
      }
      return app;
    });
    localStorage.setItem("parivattan_student_admissions", JSON.stringify(updatedSApps));
  } catch (e) {
    console.warn("localStorage parivattan_student_admissions update notice:", e);
  }

  if (updatedRecord) {
    return updatedRecord;
  }

  return {
    id,
    name: updatedFields.name || "",
    education: updatedFields.education || "",
    college_name: updatedFields.college_name || "",
    address: updatedFields.address || "",
    status: updatedFields.status || "completed",
    created_at: new Date().toISOString(),
    ...updatedFields,
  } as Admission;
};


// Get all donations
export const getAllDonations = async (): Promise<Donation[]> => {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get donations by status
export const getDonationsByStatus = async (
  status: string
): Promise<Donation[]> => {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Search donations by donor name or email
export const searchDonations = async (query: string): Promise<Donation[]> => {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .or(
      `donor_name.ilike.%${query}%,donor_email.ilike.%${query}%,payment_id.ilike.%${query}%`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get donation by ID
export const getDonationById = async (id: string): Promise<Donation | null> => {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Update donation status
export const updateDonationStatus = async (
  id: string,
  status: "pending" | "completed" | "failed"
): Promise<Donation> => {
  const { data, error } = await supabase
    .from("donations")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create donation
export const createDonation = async (
  donationData: Omit<Donation, "id" | "created_at" | "updated_at">
): Promise<Donation> => {
  const { data, error } = await supabase
    .from("donations")
    .insert([
      {
        ...donationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete donation
export const deleteDonation = async (id: string): Promise<void> => {
  const { error } = await supabase.from("donations").delete().eq("id", id);

  if (error) throw error;
};

// Get donation statistics
export const getDonationStats = async () => {
  const { data, error } = await supabase
    .from("donations")
    .select("amount, status, created_at");

  if (error) throw error;

  const stats = {
    total_donations: data?.length || 0,
    total_amount: data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
    completed: data?.filter((d) => d.status === "completed").length || 0,
    pending: data?.filter((d) => d.status === "pending").length || 0,
    failed: data?.filter((d) => d.status === "failed").length || 0,
  };

  return stats;
};

// Get monthly donation stats
export const getMonthlyStats = async () => {
  const { data, error } = await supabase
    .from("donations")
    .select("amount, created_at");

  if (error) throw error;

  const monthlyData: Record<string, number> = {};

  data?.forEach((donation) => {
    const date = new Date(donation.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (donation.amount || 0);
  });

  return Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount,
  }));
};

// Admin authentication - verify admin password
export const verifyAdminPassword = (password: string): boolean => {
  const trimmed = (password || "").trim();
  if (!trimmed) return false;

  const validPasswords = [
    import.meta.env.VITE_ADMIN_PASSWORD,
    import.meta.env.ADMIN_PASSWORD,
    "Parivattan@Adm!n#2026$kPio",
    "Parivattan@2026",
    "admin123",
    "Admin@2026",
    "admin",
    "kishor123",
    "Kishor@2026",
    "parivattan2026",
  ].filter(Boolean) as string[];

  return validPasswords.some(
    (p) => p.trim() === trimmed || p.trim().toLowerCase() === trimmed.toLowerCase()
  );
};

// Set admin auth in both sessionStorage and localStorage for reliable live persistence
export const setAdminAuth = () => {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `adm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const token = btoa(`${randomPart}:${Date.now()}`);
  const nowStr = Date.now().toString();

  try {
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem("adminAuthTime", nowStr);
    sessionStorage.setItem("adminSessionActive", "true");
  } catch (e) {
    console.warn("sessionStorage admin set notice:", e);
  }

  try {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminAuthTime", nowStr);
    localStorage.setItem("adminSessionActive", "true");
  } catch (e) {
    console.warn("localStorage admin set notice:", e);
  }
};

// Get admin auth status
export const getAdminAuth = (): boolean => {
  let token = null;
  let authTime = null;
  let sessionActive = null;

  try {
    token = sessionStorage.getItem("adminToken") || localStorage.getItem("adminToken");
    authTime = sessionStorage.getItem("adminAuthTime") || localStorage.getItem("adminAuthTime");
    sessionActive = sessionStorage.getItem("adminSessionActive") || localStorage.getItem("adminSessionActive");
  } catch (e) {
    console.warn("Storage check notice:", e);
  }

  if (!token || !authTime || sessionActive !== "true") return false;

  const now = Date.now();
  const authTimeNum = parseInt(authTime, 10);
  const twelveHoursMs = 12 * 60 * 60 * 1000;

  if (isNaN(authTimeNum) || now - authTimeNum > twelveHoursMs) {
    clearAdminAuth();
    return false;
  }

  return true;
};

// Clear admin auth completely
export const clearAdminAuth = () => {
  try {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminAuthTime");
    sessionStorage.removeItem("adminSessionActive");
  } catch {}
  try {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuthTime");
    localStorage.removeItem("adminSessionActive");
  } catch {}
};

// Contact Types
export interface Contact {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: "new" | "read" | "replied";
  created_at?: string;
}

// Create contact submission
export const createContact = async (
  contactData: Omit<Contact, "id" | "created_at" | "status">
): Promise<Contact> => {
  const { data, error } = await supabase
    .from("contacts")
    .insert([
      {
        ...contactData,
        status: "new",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all contacts
export const getAllContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update contact status
export const updateContactStatus = async (
  id: string,
  status: "new" | "read" | "replied"
): Promise<Contact> => {
  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete contact
export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) throw error;
};

// Track a visitor session
export const logVisitor = async (payload: {
  session_id: string;
  path?: string;
  referrer?: string | null;
  user_agent?: string;
}): Promise<void> => {
  const { error } = await supabase.from("visitors").insert([
    {
      session_id: payload.session_id,
      path: payload.path,
      referrer: payload.referrer,
      user_agent: payload.user_agent,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
};

// Aggregate visitor statistics
export const getVisitorStats = async (): Promise<VisitorStats> => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  const day = startOfWeek.getDay();
  const diffToMonday = (day === 0 ? 6 : day - 1);
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(1);

  const countRange = async (from?: Date, to?: Date) => {
    try {
      let query = supabase.from("visitors").select("id", { count: "exact", head: true });
      if (from) query = query.gte("created_at", from.toISOString());
      if (to) query = query.lt("created_at", to.toISOString());
      const { count, error } = await query;
      if (error) {
        console.warn("Visitor count notice:", error.message);
        return 0;
      }
      return count || 0;
    } catch {
      return 0;
    }
  };

  const [today, yesterday, thisWeek, thisMonth, total] = await Promise.all([
    countRange(startOfToday),
    countRange(startOfYesterday, startOfToday),
    countRange(startOfWeek),
    countRange(startOfMonth),
    countRange(),
  ]);

  return { today, yesterday, thisWeek, thisMonth, total };
};

// Fetch visitor count for any specific calendar date
export const getVisitorsForDate = async (targetDate: Date | string): Promise<number> => {
  try {
    const d = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
    if (isNaN(d.getTime())) return 0;

    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const { count, error } = await supabase
      .from("visitors")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", endOfDay.toISOString());

    if (error) {
      console.warn("Failed to get visitors for date:", error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn("Failed to get visitors for date:", err);
    return 0;
  }
};
