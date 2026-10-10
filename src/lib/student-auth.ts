import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import { createAdmission, supabase, generateUUID } from "@/lib/supabase-admin";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "@/lib/firebase";

const CURRENT_STUDENT_KEY = "parivattan_current_student";
const ALL_STUDENTS_KEY = "parivattan_registered_students";
const STUDENT_ADMISSIONS_KEY = "parivattan_student_admissions";

export const generateStudentPRN = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PMF2026-${random}`;
};

// Deterministic hash helper for consistent PRN recovery
const getDeterministicHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Saves a registered student directly to Supabase cloud database
 * so it is immediately visible in the Admin Dashboard and accessible across all devices.
 */
export const saveStudentToCloud = async (student: StudentUser): Promise<void> => {
  try {
    const recordId =
      student.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(student.id)
        ? student.id
        : generateUUID();

    student.id = recordId;

    const payload = {
      id: recordId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      education: "Registered Student User",
      college_name: "Parivattan Student Portal",
      address: `${student.city || "Pune"}, ${student.state || "Maharashtra"}`,
      program: "STUDENT_REGISTRATION",
      message: JSON.stringify({
        prn: student.prn,
        city: student.city || "Pune",
        state: student.state || "Maharashtra",
        type: "registered_student",
        password: student.password,
        firebaseUid: student.firebaseUid,
        registeredAt: student.registeredAt,
      }),
      status: "completed" as const,
    };

    const { error } = await supabase.from("admissions").upsert([payload], { onConflict: "id" });
    if (error) {
      console.warn("[CloudSave] Supabase upsert fallback insert:", error.message);
      await supabase.from("admissions").insert([payload]);
    } else {
      console.log("[CloudSave] Student successfully synced to Supabase:", student.name, student.prn);
    }
  } catch (err) {
    console.warn("[CloudSave] Could not sync student to Supabase cloud:", err);
  }
};

/**
 * Fetches all registered students and applicants from Supabase cloud database.
 * Merges with local storage cache so admin always sees all registered students.
 */
export const fetchRegisteredStudentsFromCloud = async (): Promise<StudentUser[]> => {
  const studentsMap = new Map<string, StudentUser>();

  // 1. Seed with local students cache
  const localList = getAllRegisteredStudents();
  for (const s of localList) {
    if (s.email) studentsMap.set(s.email.toLowerCase(), s);
    if (s.prn) studentsMap.set(s.prn.toLowerCase(), s);
  }

  // 2. Fetch all admissions from Supabase
  try {
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        if (!row.email && !row.name) continue;

        let prn = "";
        let city = "Pune";
        let state = "Maharashtra";
        let registeredAt = row.created_at || new Date().toISOString();
        let password: string | undefined = undefined;
        let firebaseUid: string | undefined = undefined;

        // Try extracting metadata from JSON message
        if (row.message && row.message.trim().startsWith("{")) {
          try {
            const meta = JSON.parse(row.message);
            if (meta.prn) prn = meta.prn;
            if (meta.city) city = meta.city;
            if (meta.state) state = meta.state;
            if (meta.password) password = meta.password;
            if (meta.firebaseUid) firebaseUid = meta.firebaseUid;
            if (meta.registeredAt) registeredAt = meta.registeredAt;
          } catch {}
        }

        // If not in JSON, extract PRN from text like "PRN: PMF2026-1234"
        if (!prn && row.message) {
          const prnMatch = row.message.match(/PRN:\s*([A-Za-z0-9-]+)/i);
          if (prnMatch) prn = prnMatch[1];
        }

        // Deterministic PRN fallback based on student details
        if (!prn) {
          const h = getDeterministicHash(row.email || row.name || row.id);
          prn = `PMF2026-${String((h % 9000) + 1000)}`;
        }

        const emailKey = (row.email || "").trim().toLowerCase();
        const prnKey = prn.toLowerCase();

        const existing = (emailKey && studentsMap.get(emailKey)) || studentsMap.get(prnKey);

        const studentUser: StudentUser = {
          id: row.id,
          prn: prn,
          name: row.name || existing?.name || "Student",
          email: row.email || existing?.email || "",
          phone: row.phone || existing?.phone || "",
          city: city || existing?.city || "Pune",
          state: state || existing?.state || "Maharashtra",
          password: password || existing?.password,
          firebaseUid: firebaseUid || existing?.firebaseUid,
          registeredAt: registeredAt || existing?.registeredAt || new Date().toISOString(),
        };

        if (emailKey) studentsMap.set(emailKey, studentUser);
        studentsMap.set(prnKey, studentUser);
      }
    }
  } catch (err) {
    console.warn("[CloudFetch] Could not fetch students from Supabase:", err);
  }

  // Deduplicate and filter out dummy records
  const uniqueList: StudentUser[] = [];
  const seenPrns = new Set<string>();

  for (const s of studentsMap.values()) {
    if (s.id === "std_demo_101" || s.prn === "PMF2026-8842") continue;
    const cleanPrn = s.prn.toLowerCase();
    if (!seenPrns.has(cleanPrn)) {
      seenPrns.add(cleanPrn);
      uniqueList.push(s);
    }
  }

  // Update local storage cache
  try {
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(uniqueList));
  } catch (e) {
    console.warn("Could not update local storage cache:", e);
  }

  return uniqueList;
};

/**
 * Deletes student record from Supabase cloud database
 */
export const deleteStudentFromCloud = async (id: string): Promise<void> => {
  try {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      await supabase.from("admissions").delete().eq("id", id);
    } else {
      const all = getAllRegisteredStudents();
      const s = all.find((item) => item.id === id);
      if (s?.email) {
        await supabase.from("admissions").delete().eq("email", s.email);
      }
    }
  } catch (err) {
    console.warn("[CloudDelete] Error deleting student from cloud:", err);
  }
};

export const getAllRegisteredStudents = (): StudentUser[] => {
  try {
    const data = localStorage.getItem(ALL_STUDENTS_KEY);
    if (!data) return [];
    const parsed: StudentUser[] = JSON.parse(data);
    return parsed.filter((s) => s.id !== "std_demo_101" && s.prn !== "PMF2026-8842");
  } catch {
    return [];
  }
};

export const getCurrentStudent = (): StudentUser | null => {
  try {
    const data = localStorage.getItem(CURRENT_STUDENT_KEY);
    if (!data) return null;
    const student: StudentUser = JSON.parse(data);
    if (student.id === "std_demo_101" || student.prn === "PMF2026-8842") {
      localStorage.removeItem(CURRENT_STUDENT_KEY);
      return null;
    }
    return student;
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

export const logoutStudent = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase signOut error:", e);
  }
  try {
    localStorage.removeItem(CURRENT_STUDENT_KEY);
  } catch (e) {
    console.warn("Could not clear student session:", e);
  }
};

export const registerStudent = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  state?: string;
}): Promise<StudentUser> => {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.trim();
  const cleanName = data.name.trim();

  if (!data.password || data.password.trim().length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // 1. Create student in Firebase Authentication
  let firebaseUid = "";
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password.trim());
    firebaseUid = userCredential.user.uid;
    await updateProfile(userCredential.user, { displayName: cleanName });
  } catch (err: any) {
    if (err?.code === "auth/email-already-in-use") {
      throw new Error("An account with this email address already exists. Please log in using your password.");
    } else if (err?.code === "auth/weak-password") {
      throw new Error("Password must be at least 6 characters long.");
    } else if (err?.code === "auth/invalid-email") {
      throw new Error("Please enter a valid email address.");
    } else {
      console.warn("Firebase Auth registration notice:", err?.code, err?.message);
    }
  }

  // 2. Generate student PRN and prepare profile
  const newPrn = generateStudentPRN();
  const uuidId = generateUUID();
  const newStudent: StudentUser = {
    id: uuidId,
    firebaseUid: firebaseUid || undefined,
    prn: newPrn,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    password: data.password.trim(),
    city: data.city || "Pune",
    state: data.state || "Maharashtra",
    registeredAt: new Date().toISOString(),
  };

  // 3. Update local cache immediately
  const allStudents = getAllRegisteredStudents();
  try {
    const updated = [newStudent, ...allStudents.filter(s => s.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error persisting student list:", e);
  }

  // 4. Save to Supabase Cloud so Admin and other devices see it immediately!
  await saveStudentToCloud(newStudent);

  setCurrentStudent(newStudent);
  return newStudent;
};

export const loginStudent = async (
  identifier: string,
  password?: string
): Promise<StudentUser | null> => {
  if (!password || !password.trim()) {
    return null;
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanDigits = cleanId.replace(/\D/g, "");
  const allStudents = getAllRegisteredStudents();

  // Find corresponding student in registered students
  let existingStudent = allStudents.find(
    s =>
      s.email.toLowerCase() === cleanId ||
      (cleanDigits.length >= 7 && s.phone.replace(/\D/g, "") === cleanDigits) ||
      s.prn.toLowerCase() === cleanId ||
      s.prn.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "")
  );

  // If not found locally, fetch latest registered students from Supabase cloud
  if (!existingStudent) {
    try {
      const cloudStudents = await fetchRegisteredStudentsFromCloud();
      existingStudent = cloudStudents.find(
        s =>
          s.email.toLowerCase() === cleanId ||
          (cleanDigits.length >= 7 && s.phone.replace(/\D/g, "") === cleanDigits) ||
          s.prn.toLowerCase() === cleanId ||
          s.prn.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "")
      );
    } catch (err) {
      console.warn("Cloud student lookup notice:", err);
    }
  }

  const targetEmail = existingStudent?.email || cleanId;

  // 1. If student exists, verify password
  if (existingStudent) {
    const expectedPassword = (existingStudent.password && existingStudent.password.trim()) || "student123";
    if (expectedPassword !== password.trim()) {
      throw new Error("Invalid password. Please check your password and try again.");
    }

    // Password matches! Sync session with Firebase Auth in background if applicable
    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password.trim());
      if (userCredential?.user) {
        existingStudent.firebaseUid = userCredential.user.uid;
      }
    } catch (fbErr: any) {
      console.warn("Firebase Auth notice:", fbErr?.code);
    }

    setCurrentStudent(existingStudent);
    return existingStudent;
  }

  // 2. If not found in database, authenticate with Firebase Auth directly
  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password.trim());
    const fbUser = userCredential.user;

    const student: StudentUser = {
      id: generateUUID(),
      firebaseUid: fbUser.uid,
      prn: generateStudentPRN(),
      name: fbUser.displayName || "Student",
      email: fbUser.email || targetEmail,
      phone: "",
      city: "Pune",
      state: "Maharashtra",
      avatar: fbUser.photoURL || undefined,
      registeredAt: new Date().toISOString(),
      password: password.trim(),
    };

    const updated = [student, ...allStudents.filter(s => s.email.toLowerCase() !== student.email.toLowerCase())];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    setCurrentStudent(student);

    // Sync to Supabase cloud
    saveStudentToCloud(student).catch(e => console.warn("Cloud sync error:", e));

    return student;
  } catch (err: any) {
    console.warn("Firebase Auth signIn notice:", err?.code, err?.message);

    if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
      throw new Error("Invalid password. Please check your password and try again.");
    } else if (err?.code === "auth/user-not-found") {
      throw new Error("No student account found with this email/PRN. Please register first.");
    } else if (err?.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again after a few minutes.");
    } else if (err?.code === "auth/operation-not-allowed") {
      throw new Error("Please register your student account first below to get your PRN.");
    }

    throw new Error(err?.message || "Invalid credentials. Please verify your PRN/Email and password.");
  }
};

// Helper to transform Firebase user to StudentUser
const processFirebaseUserToStudent = (fbUser: any): StudentUser => {
  const allStudents = getAllRegisteredStudents();
  const existingLocal = allStudents.find(
    (s) => s.email.toLowerCase() === fbUser.email?.toLowerCase()
  );

  const student: StudentUser = {
    id: existingLocal?.id || generateUUID(),
    firebaseUid: fbUser.uid,
    prn: existingLocal?.prn || generateStudentPRN(),
    name: fbUser.displayName || existingLocal?.name || "Student",
    email: fbUser.email || "",
    phone: existingLocal?.phone || "",
    city: existingLocal?.city || "Pune",
    state: existingLocal?.state || "Maharashtra",
    avatar: fbUser.photoURL || existingLocal?.avatar || undefined,
    registeredAt: existingLocal?.registeredAt || new Date().toISOString(),
  };

  const updated = [
    student,
    ...allStudents.filter((s) => s.email.toLowerCase() !== student.email.toLowerCase()),
  ];
  try {
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Storage warning:", e);
  }

  // Sync to Supabase cloud in background
  saveStudentToCloud(student).catch(e => console.warn("Google user cloud save error:", e));

  setCurrentStudent(student);
  return student;
};

// Check if student returned from Google full-page redirect
export const checkGoogleRedirectResult = async (): Promise<StudentUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    return processFirebaseUserToStudent(result.user);
  } catch (err: any) {
    console.warn("getRedirectResult check:", err?.code || err?.message);
    return null;
  }
};

// Direct full-page redirect login (immune to popup blockers)
export const loginWithGoogleRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (err: any) {
    console.warn("Google signInWithRedirect error:", err);
    if (err?.code === "auth/operation-not-allowed" || err?.code === "auth/unauthorized-domain") {
      throw new Error(
        "Google Sign-In is not enabled yet in your Firebase Console. Please enable Google provider in Firebase Console, or sign in using Email & Password / PRN below."
      );
    }
    throw new Error(err?.message || "Could not redirect to Google Sign-In.");
  }
};

// Google 1-Click Sign-In via Firebase (with automatic popup-blocked fallback)
export const loginWithGoogle = async (): Promise<StudentUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return processFirebaseUserToStudent(result.user);
  } catch (err: any) {
    console.warn("Google signIn error:", err);

    // If browser blocked popup, seamlessly attempt full-page redirect
    if (
      err?.code === "auth/popup-blocked" ||
      (err?.message && err.message.toLowerCase().includes("popup-blocked"))
    ) {
      console.info("Popup blocked by browser. Initiating full-page redirect fallback...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr: any) {
        console.warn("Redirect fallback also failed:", redirectErr);
        throw new Error(
          "Browser ने Google Sign-In पॉप-अप ब्लॉक केला आहे. कृपया ॲड्रेस बारमधील (URL bar) पॉप-अप चिन्हावर क्लिक करून 'Always allow' निवडा, किंवा खाली Email आणि Password ने थेट लॉगिन करा."
        );
      }
    }

    if (err?.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in popup was closed. Please try again or sign in with Email/PRN.");
    }
    if (err?.code === "auth/operation-not-allowed" || err?.code === "auth/unauthorized-domain") {
      throw new Error(
        "Google Sign-In is not enabled yet in your Firebase Console. Please enable Google provider in Firebase Console, or sign in using Email & Password / PRN below."
      );
    }
    throw new Error(err?.message || "Google sign-in could not be completed.");
  }
};

// Firebase Password Reset Email
export const sendStudentPasswordReset = async (email: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please enter a valid registered email address.");
  }
  await sendPasswordResetEmail(auth, cleanEmail);
};


export const deleteRegisteredStudent = async (id: string): Promise<void> => {
  try {
    const list = getAllRegisteredStudents();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    const current = getCurrentStudent();
    if (current && current.id === id) {
      logoutStudent();
    }
  } catch (e) {
    console.warn("Could not delete student locally:", e);
  }

  // Also delete from Supabase cloud database
  try {
    await deleteStudentFromCloud(id);
  } catch (e) {
    console.warn("Could not delete student from cloud:", e);
  }
};

// Admissions persistence
export const getAllStudentAdmissions = (): StudentAdmissionRecord[] => {
  try {
    const data = localStorage.getItem(STUDENT_ADMISSIONS_KEY);
    if (!data) return [];
    const parsed: StudentAdmissionRecord[] = JSON.parse(data);
    return parsed.filter((a) => a.studentId !== "std_demo_101");
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
      gender: fullRecord.gender,
      education: fullRecord.qualification || "Higher Secondary / Degree",
      college_name: fullRecord.collegeName || "Parivattan Mission Institute",
      address: fullRecord.currentAddress || `${fullRecord.address}, ${fullRecord.city}, ${fullRecord.district} - ${fullRecord.pincode}`,
      current_address: fullRecord.currentAddress || fullRecord.address,
      permanent_address: fullRecord.permanentAddress || fullRecord.address,
      identity_proof: fullRecord.identityProofUrl,
      identity_proof_name: "Identity Proof (Aadhaar/ID)",
      education_proof: fullRecord.marksheetUrl,
      education_proof_name: "Education Proof (Marksheet/Degree)",
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

// Sync admission from main admissions page or external forms into student portal
export const syncAdmissionToStudentPortal = async (record: {
  fullName: string;
  email: string;
  phone: string;
  courseTitle: string;
  courseCode: string;
  school: string;
  batchPreference: string;
  learningMode?: string;
  amount: number;
  paymentId: string;
  gender?: string;
  education?: string;
  collegeName?: string;
  address?: string;
  currentAddress?: string;
  permanentAddress?: string;
  city?: string;
  district?: string;
  pincode?: string;
  category?: string;
  photoUrl?: string;
  existingPrn?: string;
}): Promise<{ student: StudentUser; admission: StudentAdmissionRecord }> => {
  const allStudents = getAllRegisteredStudents();
  let student = allStudents.find(
    (s) =>
      s.email.toLowerCase() === record.email.toLowerCase() ||
      s.phone.replace(/\D/g, "") === record.phone.replace(/\D/g, "") ||
      (record.existingPrn && s.prn === record.existingPrn)
  );

  const prn = record.existingPrn || student?.prn || generateStudentPRN();

  if (!student) {
    const studentUuid = generateUUID();
    student = {
      id: studentUuid,
      prn,
      name: record.fullName,
      email: record.email,
      phone: record.phone,
      city: record.city || "Pune",
      state: "Maharashtra",
      avatar: record.photoUrl,
      registeredAt: new Date().toISOString(),
    };
    const updated = [student, ...allStudents];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    await saveStudentToCloud(student);
  } else if (student.prn !== prn) {
    student.prn = prn;
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(allStudents));
    await saveStudentToCloud(student);
  } else {
    await saveStudentToCloud(student);
  }

  setCurrentStudent(student);

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const applicationRecord: StudentAdmissionRecord = {
    id: `adm_${Date.now()}_${randomSuffix}`,
    applicationNo: `PMF/ADM/2026/${randomSuffix}`,
    prn: student.prn,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: student.phone,
    courseId: record.courseCode.toLowerCase(),
    courseCode: record.courseCode,
    courseTitle: record.courseTitle,
    school: record.school,
    batchPreference: record.batchPreference,
    learningMode: record.learningMode || "Hybrid Classroom / Live Online",
    dob: "2002-01-01",
    gender: record.gender || "Not Specified",
    category: record.category || "General",
    bloodGroup: "O+",
    fatherName: "",
    motherName: "",
    address: record.permanentAddress || record.address || "",
    city: record.city || "Pune",
    district: record.district || "Pune",
    pincode: record.pincode || "411001",
    qualification: record.education || "Graduate",
    collegeName: record.collegeName || "Parivattan Mission Institute",
    passingYear: "2024",
    percentage: "A Grade",
    photoUrl: record.photoUrl,
    amount: record.amount,
    paymentId: record.paymentId,
    paymentMethod: "razorpay",
    paymentDate: new Date().toISOString(),
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  const existingAdmissions = getAllStudentAdmissions();
  localStorage.setItem(
    STUDENT_ADMISSIONS_KEY,
    JSON.stringify([applicationRecord, ...existingAdmissions])
  );

  return { student, admission: applicationRecord };
};

// Search student and their enrolled courses by PRN, mobile, email, or application number
export const findStudentByPrnOrIdentifier = (
  rawQuery: string
): { student: StudentUser; applications: StudentAdmissionRecord[] } | null => {
  if (!rawQuery || !rawQuery.trim()) return null;
  const q = rawQuery.trim().toLowerCase();
  const cleanDigits = q.replace(/\D/g, "");
  const cleanAlphanum = q.replace(/[^a-z0-9]/g, "");

  const allStudents = getAllRegisteredStudents();
  const allAdmissions = getAllStudentAdmissions();

  // 1. Direct match on student
  let matchedStudent = allStudents.find((s) => {
    const sPrnClean = s.prn.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sPhoneDigits = s.phone.replace(/\D/g, "");
    return (
      sPrnClean === cleanAlphanum ||
      s.prn.toLowerCase() === q ||
      (cleanDigits.length >= 7 && sPhoneDigits.includes(cleanDigits)) ||
      s.email.toLowerCase() === q
    );
  });

  // 2. If not found in student list, check in admissions list
  if (!matchedStudent) {
    const matchedAdm = allAdmissions.find((a) => {
      const aPrnClean = (a.prn || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const aPhoneDigits = (a.studentPhone || "").replace(/\D/g, "");
      const aAppClean = (a.applicationNo || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        aPrnClean === cleanAlphanum ||
        aAppClean === cleanAlphanum ||
        (cleanDigits.length >= 7 && aPhoneDigits.includes(cleanDigits)) ||
        (a.studentEmail && a.studentEmail.toLowerCase() === q)
      );
    });

    if (matchedAdm) {
      matchedStudent = {
        id: matchedAdm.studentId || `std_${Date.now()}`,
        prn: matchedAdm.prn || generateStudentPRN(),
        name: matchedAdm.studentName,
        email: matchedAdm.studentEmail,
        phone: matchedAdm.studentPhone,
        city: matchedAdm.city || "Pune",
        state: "Maharashtra",
        avatar: matchedAdm.photoUrl,
        registeredAt: matchedAdm.createdAt || new Date().toISOString(),
      };
      try {
        const updated = [matchedStudent, ...allStudents];
        localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save recovered student:", e);
      }
    }
  }

  // 3. Also check legacy admissions from AdmissionsPage (parivattan_admissions_records)
  if (!matchedStudent) {
    try {
      const legacyRecords = JSON.parse(
        localStorage.getItem("parivattan_admissions_records") || "[]"
      );
      const legacy = legacyRecords.find((r: any) => {
        const lPrnClean = (r.prn || r.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const lPhoneDigits = (r.mobileNumber || "").replace(/\D/g, "");
        return (
          lPrnClean === cleanAlphanum ||
          (cleanDigits.length >= 7 && lPhoneDigits.includes(cleanDigits)) ||
          (r.emailAddress && r.emailAddress.toLowerCase() === q)
        );
      });

      if (legacy) {
        const prn = legacy.prn || generateStudentPRN();
        matchedStudent = {
          id: `std_legacy_${Date.now()}`,
          prn,
          name: legacy.fullName,
          email: legacy.emailAddress,
          phone: legacy.mobileNumber,
          city: legacy.address || "Pune",
          state: "Maharashtra",
          avatar: legacy.photoDataUrl,
          registeredAt: legacy.registeredAt || new Date().toISOString(),
        };

        const legacyAdm: StudentAdmissionRecord = {
          id: legacy.id || `adm_${Date.now()}`,
          applicationNo: legacy.id || `PMF/ADM/2026/${Math.floor(10000 + Math.random() * 90000)}`,
          prn,
          studentId: matchedStudent.id,
          studentName: legacy.fullName,
          studentEmail: legacy.emailAddress,
          studentPhone: legacy.mobileNumber,
          courseId: "lang-course",
          courseCode: `PFLS-${(legacy.language || "LANG").slice(0, 2).toUpperCase()}`,
          courseTitle: `${legacy.language} (${legacy.level})`,
          school: "Parivattan Foreign Language School",
          batchPreference: legacy.batch || "Standard Batch",
          learningMode: "Hybrid Classroom / Live Online",
          dob: "2002-01-01",
          gender: "Not Specified",
          category: legacy.casteCategory || "General",
          bloodGroup: "O+",
          fatherName: "",
          motherName: "",
          address: legacy.address || "",
          city: "Pune",
          district: "Pune",
          pincode: "411001",
          qualification: legacy.education || "Graduate",
          collegeName: legacy.collegeName || "Parivattan Mission Institute",
          passingYear: "2024",
          percentage: "Pass",
          photoUrl: legacy.photoDataUrl,
          amount: legacy.totalAmount || 0,
          paymentId: legacy.paymentId || "OFFLINE_RECORD",
          paymentMethod: "razorpay",
          paymentDate: legacy.registeredAt || new Date().toISOString(),
          status: "completed",
          createdAt: legacy.registeredAt || new Date().toISOString(),
        };

        const updatedAdms = [legacyAdm, ...getAllStudentAdmissions()];
        localStorage.setItem(STUDENT_ADMISSIONS_KEY, JSON.stringify(updatedAdms));

        const updatedStds = [matchedStudent, ...allStudents];
        localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updatedStds));
      }
    } catch (e) {
      console.warn("Could not check legacy records:", e);
    }
  }

  if (!matchedStudent) return null;

  const studentApps = getAllStudentAdmissions().filter(
    (a) =>
      a.studentId === matchedStudent!.id ||
      a.prn === matchedStudent!.prn ||
      (a.studentEmail && a.studentEmail.toLowerCase() === matchedStudent!.email.toLowerCase()) ||
      (a.studentPhone &&
        a.studentPhone.replace(/\D/g, "") === matchedStudent!.phone.replace(/\D/g, ""))
  );

  return { student: matchedStudent, applications: studentApps };
};

/**
 * Asynchronous student search that checks local cache first,
 * and falls back to Supabase cloud database if not found locally.
 */
export const findStudentByPrnOrIdentifierAsync = async (
  rawQuery: string
): Promise<{ student: StudentUser; applications: StudentAdmissionRecord[] } | null> => {
  const localMatch = findStudentByPrnOrIdentifier(rawQuery);
  if (localMatch) return localMatch;

  try {
    await fetchRegisteredStudentsFromCloud();
    return findStudentByPrnOrIdentifier(rawQuery);
  } catch {
    return null;
  }
};

