import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import { createAdmission } from "@/lib/supabase-admin";

const CURRENT_STUDENT_KEY = "parivattan_current_student";
const ALL_STUDENTS_KEY = "parivattan_registered_students";
const STUDENT_ADMISSIONS_KEY = "parivattan_student_admissions";

// Initial demo student profile
const DEMO_STUDENT: StudentUser = {
  id: "std_demo_101",
  prn: "PMF2026-8842",
  name: "Shubham More",
  email: "shubham.student@parivattan.org",
  phone: "+91 98765 43210",
  city: "Pune",
  state: "Maharashtra",
  registeredAt: new Date().toISOString(),
};

export const getDemoStudent = (): StudentUser => DEMO_STUDENT;

export const getAllRegisteredStudents = (): StudentUser[] => {
  try {
    const data = localStorage.getItem(ALL_STUDENTS_KEY);
    if (!data) {
      const initial = [DEMO_STUDENT];
      localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch {
    return [DEMO_STUDENT];
  }
};

export const getCurrentStudent = (): StudentUser | null => {
  try {
    const data = localStorage.getItem(CURRENT_STUDENT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCurrentStudent = (student: StudentUser): void => {
  try {
    localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(student));
  } catch (e) {
    console.warn("Could not save current student to localStorage:", e);
  }
};

export const logoutStudent = (): void => {
  try {
    localStorage.removeItem(CURRENT_STUDENT_KEY);
  } catch (e) {
    console.warn("Could not clear student session:", e);
  }
};

export const registerStudent = (data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  city?: string;
  state?: string;
}): StudentUser => {
  const allStudents = getAllRegisteredStudents();
  
  // Check if student with same email or phone exists
  const existing = allStudents.find(
    s => s.email.toLowerCase() === data.email.toLowerCase() || s.phone === data.phone
  );
  if (existing) {
    setCurrentStudent(existing);
    return existing;
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newStudent: StudentUser = {
    id: `std_${Date.now()}_${randomNum}`,
    prn: `PMF2026-${randomNum}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    password: data.password || "student123",
    city: data.city || "Pune",
    state: data.state || "Maharashtra",
    registeredAt: new Date().toISOString(),
  };

  try {
    const updated = [newStudent, ...allStudents];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error persisting student list:", e);
  }

  setCurrentStudent(newStudent);
  return newStudent;
};

export const loginStudent = (
  identifier: string,
  password?: string
): StudentUser | null => {
  const cleanId = identifier.trim().toLowerCase();
  const allStudents = getAllRegisteredStudents();

  // Find by email or phone or PRN
  const found = allStudents.find(
    s =>
      s.email.toLowerCase() === cleanId ||
      s.phone.replace(/\s+/g, "").includes(cleanId.replace(/\s+/g, "")) ||
      s.prn.toLowerCase() === cleanId
  );

  if (found) {
    // If student has a password registered, verify password strictly
    if (found.password && password) {
      if (found.password.trim() !== password.trim()) {
        return null;
      }
    } else if (found.password && !password) {
      return null;
    }

    setCurrentStudent(found);
    return found;
  }

  // Test mode off: Return null if account does not exist
  return null;
};

export const deleteRegisteredStudent = (id: string): void => {
  try {
    const list = getAllRegisteredStudents();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    const current = getCurrentStudent();
    if (current && current.id === id) {
      logoutStudent();
    }
  } catch (e) {
    console.warn("Could not delete student:", e);
  }
};

// Admissions persistence
export const getAllStudentAdmissions = (): StudentAdmissionRecord[] => {
  try {
    const data = localStorage.getItem(STUDENT_ADMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getStudentApplications = (studentId: string): StudentAdmissionRecord[] => {
  const all = getAllStudentAdmissions();
  return all.filter(a => a.studentId === studentId);
};

export const saveStudentAdmissionRecord = async (
  record: Omit<StudentAdmissionRecord, "id" | "applicationNo" | "createdAt">
): Promise<StudentAdmissionRecord> => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const applicationNo = `PMF/ADM/2026/${randomSuffix}`;
  const id = `adm_${Date.now()}_${randomSuffix}`;

  const fullRecord: StudentAdmissionRecord = {
    ...record,
    id,
    applicationNo,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to student's local admissions store
  try {
    const existing = getAllStudentAdmissions();
    localStorage.setItem(STUDENT_ADMISSIONS_KEY, JSON.stringify([fullRecord, ...existing]));
  } catch (e) {
    console.warn("Could not save to student admissions key:", e);
  }

  // 2. Also register into primary admissions store for Admin Dashboard & Supabase
  try {
    await createAdmission({
      name: fullRecord.studentName,
      education: fullRecord.qualification || "Higher Secondary / Degree",
      college_name: fullRecord.collegeName || "Parivattan Mission Institute",
      address: `${fullRecord.address}, ${fullRecord.city}, ${fullRecord.district} - ${fullRecord.pincode}`,
      identity_proof: fullRecord.identityProofUrl,
      identity_proof_name: "Identity Proof (Aadhaar/ID)",
      photo: fullRecord.photoUrl,
      photo_name: "Applicant Photo",
      caste_certificate: fullRecord.casteCertUrl,
      caste_certificate_name: fullRecord.category || "General",
      email: fullRecord.studentEmail,
      phone: fullRecord.studentPhone,
      program: `${fullRecord.courseTitle} (${fullRecord.courseCode})`,
      message: `Enrolled via Student Portal - PRN: ${fullRecord.prn}, Batch: ${fullRecord.batchPreference}`,
      amount: fullRecord.amount,
      payment_id: fullRecord.paymentId,
      status: "completed",
    });
  } catch (e) {
    console.warn("Could not sync with main admissions table:", e);
  }

  return fullRecord;
};
