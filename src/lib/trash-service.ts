import { Admission, createAdmission, deleteAdmission } from "./supabase-admin";
import { StudentUser } from "@/types/student";
import { saveStudentToCloud, deleteStudentFromCloud, getAllRegisteredStudents } from "./student-auth";

export const DELETED_ADMISSIONS_KEY = "parivattan_deleted_admissions";
export const DELETED_STUDENTS_KEY = "parivattan_deleted_students";

export interface DeletedAdmissionItem {
  id: string;
  admission: Admission;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export interface DeletedStudentItem {
  id: string;
  student: StudentUser;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export const notifyTrashUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("parivattan-trash-updated"));
  }
};

const sanitizeForStorage = (items: DeletedAdmissionItem[]): DeletedAdmissionItem[] => {
  return items.map((item) => {
    const adm = { ...item.admission };
    // Strip heavy base64 strings from local storage cache to avoid browser 5MB quota limit
    if (adm.photo && adm.photo.length > 500) adm.photo = "";
    if (adm.identity_proof && adm.identity_proof.length > 500) adm.identity_proof = "";
    if (adm.education_proof && adm.education_proof.length > 500) adm.education_proof = "";
    if (adm.caste_certificate && adm.caste_certificate.length > 500) adm.caste_certificate = "";
    return {
      ...item,
      admission: adm,
    };
  });
};

export const safeSetTrashLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[TrashStorage] Quota warning for ${key}, falling back to lightweight cache:`, err);
    try {
      if (Array.isArray(data)) {
        const lightweight = sanitizeForStorage(data as DeletedAdmissionItem[]);
        localStorage.setItem(key, JSON.stringify(lightweight));
      }
    } catch (fallbackErr) {
      console.warn(`[TrashStorage] Could not store to ${key}:`, fallbackErr);
    }
  }
};

/**
 * 1. Fetch all deleted admissions from local trash storage
 */
export const getDeletedAdmissions = (): DeletedAdmissionItem[] => {
  try {
    const raw = localStorage.getItem(DELETED_ADMISSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read deleted admissions from localStorage:", err);
    return [];
  }
};

/**
 * 2. Fetch all deleted students from local trash storage
 */
export const getDeletedStudents = (): DeletedStudentItem[] => {
  try {
    const raw = localStorage.getItem(DELETED_STUDENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read deleted students from localStorage:", err);
    return [];
  }
};

/**
 * 2.1 Fetch deleted admissions from MongoDB Cloud Trash and merge with local storage
 */
export const fetchCloudDeletedAdmissions = async (): Promise<DeletedAdmissionItem[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("/api/admissions?trash=true", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const local = getDeletedAdmissions();
        const map = new Map<string, DeletedAdmissionItem>();

        // 1. Seed with cloud records (which have full documents and base64)
        data.data.forEach((item: any) => {
          map.set(item.id, {
            id: item.id,
            admission: item,
            deletedAt: item.deletedAt || item._deletedAt || new Date().toISOString(),
            deletedBy: item.deletedBy || "Admin",
            reason: item.reason || "Moved to Recycle Bin",
          });
        });

        // 2. Overlay local items that are not in cloud
        local.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
        );

        // Safe storage (never throws or blocks returning data)
        safeSetTrashLocalStorage(DELETED_ADMISSIONS_KEY, merged);

        return merged;
      }
    }
  } catch (err) {
    console.warn("Notice: Could not fetch cloud deleted admissions:", err);
  }

  return getDeletedAdmissions();
};

/**
 * 3. Soft Delete Admission: Archives record in trash and removes from active database/cache
 */
export const softDeleteAdmission = async (
  admission: Admission,
  deletedBy: string = "Admin",
  reason?: string
): Promise<DeletedAdmissionItem> => {
  const deletedItem: DeletedAdmissionItem = {
    id: admission.id,
    admission: { ...admission },
    deletedAt: new Date().toISOString(),
    deletedBy,
    reason: reason || "Deleted from Admin Dashboard",
  };

  try {
    const currentList = getDeletedAdmissions().filter((item) => item.id !== admission.id);
    safeSetTrashLocalStorage(DELETED_ADMISSIONS_KEY, [deletedItem, ...currentList]);
  } catch (e) {
    console.warn("Could not store to deleted admissions trash:", e);
  }

  // Remove from active admissions (which will archive in Mongo and delete in Supabase/local)
  await deleteAdmission(admission.id);

  notifyTrashUpdated();
  return deletedItem;
};

/**
 * 4. Restore Admission (Undo Delete): Re-creates admission in MongoDB, Supabase & localStorage
 */
export const restoreAdmission = async (id: string): Promise<Admission | null> => {
  const deletedList = getDeletedAdmissions();
  let target = deletedList.find((item) => item.id === id);

  // If not found in local, check cloud
  if (!target) {
    try {
      const cloudList = await fetchCloudDeletedAdmissions();
      target = cloudList.find((item) => item.id === id);
    } catch {}
  }

  if (!target) {
    console.warn("Deleted admission not found in trash:", id);
    return null;
  }

  const { admission } = target;

  // 1. Re-insert into active store via createAdmission (saves to Mongo, Supabase & localStorage)
  const restored = await createAdmission({
    ...admission,
    id: admission.id,
    name: admission.name,
    email: admission.email,
    phone: admission.phone,
    gender: admission.gender,
    education: admission.education,
    college_name: admission.college_name,
    address: admission.address,
    current_address: admission.current_address,
    permanent_address: admission.permanent_address,
    program: admission.program,
    amount: admission.amount,
    payment_id: admission.payment_id,
    batch_id: admission.batch_id || admission.batchId,
    batchId: admission.batch_id || admission.batchId,
    identity_proof: admission.identity_proof,
    identity_proof_name: admission.identity_proof_name,
    photo: admission.photo,
    photo_name: admission.photo_name,
    education_proof: admission.education_proof,
    education_proof_name: admission.education_proof_name,
    caste_certificate: admission.caste_certificate,
    caste_certificate_name: admission.caste_certificate_name,
    status: admission.status || "completed",
    created_at: admission.created_at || new Date().toISOString(),
  });

  // 2. Notify Mongo restore endpoint if available
  try {
    await fetch(`/api/admissions?restore=true&id=${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", id }),
    });
  } catch (mErr) {
    console.warn("Notice: Mongo restore ping:", mErr);
  }

  // 3. Remove from local trash
  try {
    const updatedTrash = getDeletedAdmissions().filter((item) => item.id !== id);
    safeSetTrashLocalStorage(DELETED_ADMISSIONS_KEY, updatedTrash);
  } catch (e) {
    console.warn("Could not remove from trash:", e);
  }

  notifyTrashUpdated();
  return restored;
};

/**
 * 5. Permanently Delete Admission from Trash
 */
export const permanentDeleteAdmission = async (id: string): Promise<void> => {
  // 1. Remove from localStorage
  try {
    const deletedList = getDeletedAdmissions().filter((item) => item.id !== id);
    safeSetTrashLocalStorage(DELETED_ADMISSIONS_KEY, deletedList);
  } catch (e) {
    console.warn("Could not permanently delete admission from localStorage:", e);
  }

  // 2. Remove permanently from MongoDB trash collection
  try {
    await fetch(`/api/admissions?permanent=true&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "permanentDelete", id }),
    });
  } catch (mErr) {
    console.warn("Notice: Mongo permanent delete:", mErr);
  }

  notifyTrashUpdated();
};

/**
 * 6. Soft Delete Student: Archives student in trash and removes from active directory
 */
export const softDeleteStudent = async (
  student: StudentUser,
  deletedBy: string = "Admin",
  reason?: string
): Promise<DeletedStudentItem> => {
  const deletedItem: DeletedStudentItem = {
    id: student.id,
    student: { ...student },
    deletedAt: new Date().toISOString(),
    deletedBy,
    reason: reason || "Deleted from Student Directory",
  };

  try {
    const currentList = getDeletedStudents().filter((item) => item.id !== student.id);
    localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify([deletedItem, ...currentList]));
  } catch (e) {
    console.warn("Could not store student to trash:", e);
  }

  // Remove student locally and in cloud
  try {
    const all = getAllRegisteredStudents().filter((s) => s.id !== student.id);
    localStorage.setItem("parivattan_all_students", JSON.stringify(all));
    localStorage.setItem("parivattan_registered_students", JSON.stringify(all));
    await deleteStudentFromCloud(student.id);
  } catch (e) {
    console.warn("Error removing student from cloud:", e);
  }

  notifyTrashUpdated();
  return deletedItem;
};

/**
 * 7. Restore Student (Undo Delete): Re-saves student in active list & cloud
 */
export const restoreStudent = async (id: string): Promise<StudentUser | null> => {
  const deletedList = getDeletedStudents();
  const target = deletedList.find((item) => item.id === id);

  if (!target) {
    console.warn("Deleted student not found in trash:", id);
    return null;
  }

  const { student } = target;

  // Re-save to active local list
  try {
    const all = getAllRegisteredStudents().filter((s) => s.id !== student.id);
    localStorage.setItem("parivattan_all_students", JSON.stringify([student, ...all]));
    localStorage.setItem("parivattan_registered_students", JSON.stringify([student, ...all]));
  } catch (e) {
    console.warn("Error restoring student locally:", e);
  }

  // Re-save to Cloud (Supabase + MongoDB)
  await saveStudentToCloud(student);

  // Remove from trash
  try {
    const updatedTrash = deletedList.filter((item) => item.id !== id);
    localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(updatedTrash));
  } catch (e) {
    console.warn("Could not remove student from trash:", e);
  }

  notifyTrashUpdated();
  return student;
};

/**
 * 8. Permanently Delete Student from Trash
 */
export const permanentDeleteStudent = async (id: string): Promise<void> => {
  try {
    const deletedList = getDeletedStudents().filter((item) => item.id !== id);
    localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(deletedList));
  } catch (e) {
    console.warn("Could not permanently delete student:", e);
  }

  notifyTrashUpdated();
};

/**
 * 9. Empty Trash
 */
export const emptyTrash = async (
  category: "all" | "admissions" | "students" = "all"
): Promise<void> => {
  try {
    if (category === "all" || category === "admissions") {
      localStorage.setItem(DELETED_ADMISSIONS_KEY, JSON.stringify([]));
      // Empty MongoDB trash
      try {
        await fetch("/api/admissions?emptyTrash=true", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "emptyTrash" }),
        });
      } catch (err) {}
    }
    if (category === "all" || category === "students") {
      localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify([]));
    }
  } catch (e) {
    console.warn("Could not empty trash:", e);
  }

  notifyTrashUpdated();
};
