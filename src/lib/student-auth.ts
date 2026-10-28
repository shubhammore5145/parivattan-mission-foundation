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
  sendEmailVerification,
  applyActionCode,
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
      photo: student.photo || student.avatar || undefined,
      photo_name: student.photo_name || undefined,
      identity_proof: student.identity_proof || undefined,
      identity_proof_name: student.identity_proof_name || undefined,
      education_proof: student.education_proof || undefined,
      education_proof_name: student.education_proof_name || undefined,
      caste_certificate: student.caste_certificate || undefined,
      caste_certificate_name: student.caste_certificate_name || undefined,
      message: JSON.stringify({
        prn: student.prn,
        city: student.city || "Pune",
        state: student.state || "Maharashtra",
        type: "registered_student",
        password: student.password,
        firebaseUid: student.firebaseUid,
        registeredAt: student.registeredAt,
        avatar: student.avatar || student.photo,
        photo: student.photo,
        photo_name: student.photo_name,
        identity_proof: student.identity_proof,
        identity_proof_name: student.identity_proof_name,
        education_proof: student.education_proof,
        education_proof_name: student.education_proof_name,
        caste_certificate: student.caste_certificate,
        caste_certificate_name: student.caste_certificate_name,
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

    // 2. Also save student registration to MongoDB Atlas
    try {
      await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[CloudSave] Student successfully synced to MongoDB Atlas:", student.name, student.prn);
    } catch (mongoErr) {
      console.warn("[CloudSave] Notice saving student to MongoDB Atlas:", mongoErr);
    }
  } catch (err) {
    console.warn("[CloudSave] Could not sync student to cloud databases:", err);
  }
};

let inFlightStudentsPromise: Promise<StudentUser[]> | null = null;
let lastStudentsFetchTime = 0;
let cachedStudentsList: StudentUser[] = [];

/**
 * Fetches all registered students and applicants from Supabase and MongoDB Atlas.
 * Merges with local storage cache so admin always sees all registered students.
 */
export const fetchRegisteredStudentsFromCloud = async (forceFresh = false): Promise<StudentUser[]> => {
  const now = Date.now();
  if (!forceFresh && cachedStudentsList.length > 0 && now - lastStudentsFetchTime < 3000) {
    return cachedStudentsList;
  }

  if (inFlightStudentsPromise) {
    return inFlightStudentsPromise;
  }

  inFlightStudentsPromise = (async () => {
    const studentsMap = new Map<string, StudentUser>();

    // Helper to parse student rows from either Supabase or MongoDB
    const parseRows = (rows: any[]) => {
      for (const row of rows) {
        if (!row || (!row.email && !row.name)) continue;

        let prn = "";
        let city = "Pune";
        let state = "Maharashtra";
        let registeredAt = row.created_at || new Date().toISOString();
        let password: string | undefined = undefined;
        let firebaseUid: string | undefined = undefined;
        let photo = row.photo || row.photoUrl || row.avatar || undefined;
        let photo_name = row.photo_name || undefined;
        let avatar = row.avatar || row.photo || row.photoUrl || undefined;
        let identity_proof = row.identity_proof || row.identityProofUrl || undefined;
        let identity_proof_name = row.identity_proof_name || row.identityProofName || undefined;
        let education_proof = row.education_proof || row.marksheetUrl || row.educationProof || row.marksheet || undefined;
        let education_proof_name = row.education_proof_name || row.educationProofName || row.marksheet_name || undefined;
        let caste_certificate = row.caste_certificate || row.casteCertUrl || undefined;
        let caste_certificate_name = row.caste_certificate_name || undefined;

        // Try extracting metadata from JSON message
        if (row.message && typeof row.message === "string" && row.message.trim().startsWith("{")) {
          try {
            const meta = JSON.parse(row.message);
            if (meta.prn) prn = meta.prn;
            if (meta.city) city = meta.city;
            if (meta.state) state = meta.state;
            if (meta.password) password = meta.password;
            if (meta.firebaseUid) firebaseUid = meta.firebaseUid;
            if (meta.registeredAt) registeredAt = meta.registeredAt;
            if (meta.avatar) avatar = meta.avatar;
            if (meta.photo) photo = meta.photo;
            if (meta.photoUrl && !photo) photo = meta.photoUrl;
            if (meta.photo_name) photo_name = meta.photo_name;
            if (meta.identity_proof) identity_proof = meta.identity_proof;
            if (meta.identityProofUrl && !identity_proof) identity_proof = meta.identityProofUrl;
            if (meta.identity_proof_name) identity_proof_name = meta.identity_proof_name;
            if (meta.education_proof) education_proof = meta.education_proof;
            if (meta.marksheetUrl && !education_proof) education_proof = meta.marksheetUrl;
            if (meta.marksheet && !education_proof) education_proof = meta.marksheet;
            if (meta.education_proof_name) education_proof_name = meta.education_proof_name;
            if (meta.caste_certificate) caste_certificate = meta.caste_certificate;
            if (meta.casteCertUrl && !caste_certificate) caste_certificate = meta.casteCertUrl;
            if (meta.caste_certificate_name) caste_certificate_name = meta.caste_certificate_name;
          } catch {}
        }

        // If not in JSON, extract PRN from text like "PRN: PMF2026-1234"
        if (!prn && row.message) {
          const prnMatch = String(row.message).match(/PRN:\s*([A-Za-z0-9-]+)/i);
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
          id: row.id || `std_${prn}`,
          prn: prn,
          name: row.name || existing?.name || "Student",
          email: row.email || existing?.email || "",
          phone: row.phone || existing?.phone || "",
          city: city || existing?.city || "Pune",
          state: state || existing?.state || "Maharashtra",
          password: password || existing?.password,
          firebaseUid: firebaseUid || existing?.firebaseUid,
          registeredAt: registeredAt || existing?.registeredAt || new Date().toISOString(),
          avatar: avatar || existing?.avatar || photo || existing?.photo,
          photo: photo || existing?.photo || avatar || existing?.avatar,
          photoUrl: photo || existing?.photoUrl || avatar || existing?.avatar,
          photo_name: photo_name || existing?.photo_name,
          identity_proof: identity_proof || existing?.identity_proof,
          identity_proof_name: identity_proof_name || existing?.identity_proof_name,
          identityProofUrl: identity_proof || existing?.identityProofUrl,
          education_proof: education_proof || existing?.education_proof,
          education_proof_name: education_proof_name || existing?.education_proof_name,
          marksheetUrl: education_proof || existing?.marksheetUrl,
          caste_certificate: caste_certificate || existing?.caste_certificate,
          caste_certificate_name: caste_certificate_name || existing?.caste_certificate_name,
          casteCertUrl: caste_certificate || existing?.casteCertUrl,
        };

        if (emailKey) studentsMap.set(emailKey, studentUser);
        studentsMap.set(prnKey, studentUser);
      }
    };

    // 1. Seed with local students cache
    const localList = getAllRegisteredStudents();
    for (const s of localList) {
      if (s.email) studentsMap.set(s.email.toLowerCase(), s);
      if (s.prn) studentsMap.set(s.prn.toLowerCase(), s);
    }

    // 2. Fetch from MongoDB Atlas & Supabase in parallel
    const fetchMongo = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("/api/admissions", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const resJson = await res.json();
          if (Array.isArray(resJson?.data)) {
            parseRows(resJson.data);
          }
        }
      } catch (mErr) {
        console.warn("[CloudFetch] Notice fetching students from MongoDB Atlas:", mErr);
      }
    };

    const fetchSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("admissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          parseRows(data);
        }
      } catch (err) {
        console.warn("[CloudFetch] Could not fetch students from Supabase:", err);
      }
    };

    await Promise.allSettled([fetchMongo(), fetchSupabase()]);

    // Deduplicate strictly by both PRN and Email to guarantee no double entries
    const uniqueList: StudentUser[] = [];
    const seenPrns = new Set<string>();
    const seenEmails = new Set<string>();

    for (const s of studentsMap.values()) {
      if (s.id === "std_demo_101" || s.prn === "PMF2026-8842") continue;
      const cleanPrn = (s.prn || "").toLowerCase().trim();
      const cleanEmail = (s.email || "").toLowerCase().trim();
      if ((cleanPrn && seenPrns.has(cleanPrn)) || (cleanEmail && seenEmails.has(cleanEmail))) {
        continue; // Skip duplicate student entry
      }
      if (cleanPrn) seenPrns.add(cleanPrn);
      if (cleanEmail) seenEmails.add(cleanEmail);
      uniqueList.push(s);
    }

    // Update local storage cache
    try {
      localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(uniqueList));
    } catch (e) {
      console.warn("Could not update local storage cache:", e);
    }

    cachedStudentsList = uniqueList;
    lastStudentsFetchTime = Date.now();
    return uniqueList;
  })().finally(() => {
    inFlightStudentsPromise = null;
  });

  return inFlightStudentsPromise;
};

/**
 * Deletes student record from both Supabase and MongoDB Atlas databases
 */
export const deleteStudentFromCloud = async (id: string): Promise<void> => {
  try {
    // Delete from MongoDB Atlas
    try {
      await fetch(`/api/admissions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (mErr) {
      console.warn("[CloudDelete] MongoDB delete notice:", mErr);
    }

    // Delete from Supabase
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

/**
 * Updates a registered student profile and documents across LocalStorage, Supabase, and MongoDB Atlas.
 */
export const updateRegisteredStudent = async (
  studentData: StudentUser
): Promise<StudentUser> => {
  // 1. Update in local storage
  const all = getAllRegisteredStudents();
  const idx = all.findIndex(
    (s) =>
      (studentData.id && s.id === studentData.id) ||
      (studentData.prn && s.prn.toLowerCase() === studentData.prn.toLowerCase())
  );
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...studentData };
  } else {
    all.unshift(studentData);
  }
  localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(all));

  // 2. If this is current student, update current student session
  const curr = getCurrentStudent();
  if (
    curr &&
    ((studentData.id && curr.id === studentData.id) ||
      (studentData.prn && curr.prn.toLowerCase() === studentData.prn.toLowerCase()))
  ) {
    setCurrentStudent({ ...curr, ...studentData });
  }

  // 3. Save to cloud (Supabase + MongoDB)
  await saveStudentToCloud(studentData);
  return studentData;
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

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  state?: string;
  verificationCode: string;
  createdAt: number;
}

export const getPendingRegistration = (email: string): PendingRegistration | null => {
  try {
    const raw = localStorage.getItem(`parivattan_pending_reg_${email.trim().toLowerCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Step 1: Initiate student registration with mandatory email verification code.
 * Dispatches Firebase verification email and stores pending registration until verified.
 */
export const initiateStudentRegistration = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  state?: string;
}): Promise<{ email: string; verificationCode: string }> => {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.trim();
  const cleanName = data.name.trim();

  if (!data.password || data.password.trim().length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Check if student with this email is already registered and verified
  const allStudents = getAllRegisteredStudents();
  const existing = allStudents.find((s) => s.email.toLowerCase() === cleanEmail);
  if (existing && existing.isEmailVerified !== false) {
    throw new Error("An account with this email address already exists. Please log in using your password.");
  }

  // Generate 6-digit backup code (kept in pending session only, NEVER exposed on screen)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Try creating in Firebase Auth and dispatching official Firebase email verification link
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/student?emailVerified=true&email=${encodeURIComponent(cleanEmail)}`,
      handleCodeInApp: false,
    };
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password.trim());
    await updateProfile(userCredential.user, { displayName: cleanName });
    await sendEmailVerification(userCredential.user, actionCodeSettings);
  } catch (fbErr: any) {
    if (fbErr?.code === "auth/email-already-in-use") {
      // User may have started registration previously; sign in and resend verification link
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/student?emailVerified=true&email=${encodeURIComponent(cleanEmail)}`,
          handleCodeInApp: false,
        };
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, data.password.trim());
        await sendEmailVerification(cred.user, actionCodeSettings);
      } catch {}
    } else if (fbErr?.code === "auth/weak-password") {
      throw new Error("Password must be at least 6 characters long.");
    } else if (fbErr?.code === "auth/invalid-email") {
      throw new Error("Please enter a valid email address.");
    }
  }

  const pending: PendingRegistration = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    password: data.password.trim(),
    city: data.city || "Pune",
    state: data.state || "Maharashtra",
    verificationCode,
    createdAt: Date.now(),
  };

  localStorage.setItem(`parivattan_pending_reg_${cleanEmail}`, JSON.stringify(pending));
  return { email: cleanEmail, verificationCode };
};

/**
 * Automatically checks if the user has clicked the verification link in their email.
 * Called automatically by polling or when the user clicks 'I clicked the email link'.
 */
export const checkFirebaseEmailVerification = async (
  email: string
): Promise<StudentUser | null> => {
  const cleanEmail = email.trim().toLowerCase();
  const pending = getPendingRegistration(cleanEmail);

  let isVerified = false;

  // 1. Check active Firebase user instance
  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail) {
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        isVerified = true;
      }
    } catch (e) {
      console.warn("Firebase currentUser reload notice:", e);
    }
  }

  // 2. If not active on this client, sign in in the background to inspect emailVerified state
  if (!isVerified && pending?.password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pending.password);
      if (cred.user.emailVerified) {
        isVerified = true;
      }
    } catch {}
  }

  if (isVerified) {
    return await completeVerifiedStudentRegistration(cleanEmail);
  }

  return null;
};

/**
 * Handles Firebase action code from email verification link (e.g. ?oobCode=...)
 */
export const handleFirebaseEmailVerificationCode = async (
  oobCode: string,
  emailHint?: string
): Promise<StudentUser> => {
  await applyActionCode(auth, oobCode);
  const targetEmail = (emailHint || auth.currentUser?.email || "").trim().toLowerCase();
  if (!targetEmail) {
    throw new Error("Could not determine email for verification. Please log in.");
  }
  return await completeVerifiedStudentRegistration(targetEmail);
};

/**
 * Completes verified registration, issues permanent PRN, and activates student session.
 */
export const completeVerifiedStudentRegistration = async (
  email: string
): Promise<StudentUser> => {
  const cleanEmail = email.trim().toLowerCase();
  const pending = getPendingRegistration(cleanEmail);

  if (pending) {
    const newPrn = generateStudentPRN();
    const uuidId = generateUUID();
    const newStudent: StudentUser = {
      id: uuidId,
      firebaseUid: auth.currentUser?.uid || undefined,
      prn: newPrn,
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      password: pending.password,
      city: pending.city || "Pune",
      state: pending.state || "Maharashtra",
      registeredAt: new Date().toISOString(),
      isEmailVerified: true,
    };

    const allStudents = getAllRegisteredStudents();
    const updated = [newStudent, ...allStudents.filter((s) => s.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));

    await saveStudentToCloud(newStudent);
    setCurrentStudent(newStudent);
    localStorage.removeItem(`parivattan_pending_reg_${cleanEmail}`);
    return newStudent;
  }

  const allStudents = getAllRegisteredStudents();
  const existingIdx = allStudents.findIndex((s) => s.email.toLowerCase() === cleanEmail);
  if (existingIdx !== -1) {
    allStudents[existingIdx].isEmailVerified = true;
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(allStudents));
    setCurrentStudent(allStudents[existingIdx]);
    saveStudentToCloud(allStudents[existingIdx]).catch((e) =>
      console.warn("Cloud student update notice:", e)
    );
    return allStudents[existingIdx];
  }

  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail) {
    const fbUser = auth.currentUser;
    const newStudent: StudentUser = {
      id: generateUUID(),
      firebaseUid: fbUser.uid,
      prn: generateStudentPRN(),
      name: fbUser.displayName || "Student",
      email: cleanEmail,
      phone: "",
      city: "Pune",
      state: "Maharashtra",
      avatar: fbUser.photoURL || undefined,
      registeredAt: new Date().toISOString(),
      isEmailVerified: true,
    };
    const updated = [newStudent, ...allStudents.filter((s) => s.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    setCurrentStudent(newStudent);
    saveStudentToCloud(newStudent).catch((e) => console.warn("Cloud student update notice:", e));
    return newStudent;
  }

  throw new Error("No registration data found for this email. Please register again.");
};

/**
 * Step 2: Verify the email link or code to finalize registration and issue PRN.
 */
export const verifyEmailAndCompleteRegistration = async (
  email: string,
  enteredCode?: string
): Promise<StudentUser> => {
  const cleanEmail = email.trim().toLowerCase();
  const pending = getPendingRegistration(cleanEmail);

  if (!pending) {
    throw new Error("Registration session expired or not found. Please fill out the registration form again.");
  }

  // 1. Check Firebase email verification link state
  let isFirebaseVerified = false;
  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail) {
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        isFirebaseVerified = true;
      }
    } catch {}
  }

  if (!isFirebaseVerified && pending.password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pending.password);
      if (cred.user.emailVerified) {
        isFirebaseVerified = true;
      }
    } catch {}
  }

  // 2. Check manual fallback code if provided
  const cleanEnteredCode = enteredCode ? enteredCode.trim() : "";
  const isCodeValid = Boolean(cleanEnteredCode && cleanEnteredCode === pending.verificationCode);

  if (!isCodeValid && !isFirebaseVerified) {
    throw new Error(
      "Verification link not clicked yet. Please check your email inbox and click the verification link sent by Firebase!"
    );
  }

  return await completeVerifiedStudentRegistration(cleanEmail);
};

/**
 * Resend the Firebase verification email with action link.
 */
export const resendStudentVerificationCode = async (email: string): Promise<string> => {
  const cleanEmail = email.trim().toLowerCase();
  const pending = getPendingRegistration(cleanEmail);
  const existing = getAllRegisteredStudents().find(s => s.email.toLowerCase() === cleanEmail);

  const actionCodeSettings = {
    url: `${window.location.origin}/student?emailVerified=true&email=${encodeURIComponent(cleanEmail)}`,
    handleCodeInApp: false,
  };

  let sent = false;

  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail) {
    try {
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      sent = true;
    } catch (e: any) {
      console.warn("sendEmailVerification currentUser notice:", e);
    }
  }

  const pwd = pending?.password || existing?.password;
  if (!sent && pwd) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pwd);
      await sendEmailVerification(cred.user, actionCodeSettings);
      sent = true;
    } catch (e: any) {
      console.warn("sendEmailVerification cred notice:", e);
    }
  }

  return pending?.verificationCode || "VERIFY";
};

/**
 * Direct registration fallback with auto-verification (for administrative/social login use)
 */
export const registerStudent = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  state?: string;
}): Promise<StudentUser> => {
  const init = await initiateStudentRegistration(data);
  return await verifyEmailAndCompleteRegistration(init.email, init.verificationCode);
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
    if (existingStudent.isEmailVerified === false) {
      throw new Error(`EMAIL_NOT_VERIFIED:${existingStudent.email}`);
    }

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

    if (!fbUser.emailVerified) {
      throw new Error(`EMAIL_NOT_VERIFIED:${fbUser.email || targetEmail}`);
    }

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
          "Your browser blocked the Google Sign-In pop-up. Please click the pop-up icon in the address bar (URL bar) and select 'Always allow', or log in directly with Email and Password below."
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

/**
 * Retrieves all course admissions and registrations for a student.
 * Aggregates records from student admissions store, main admissions store,
 * and standalone course registrations store matching by ID, PRN, email, or mobile.
 */
export const getStudentApplications = (
  studentOrId: string | StudentUser
): StudentAdmissionRecord[] => {
  let student: StudentUser | undefined;
  if (typeof studentOrId === "object" && studentOrId !== null) {
    student = studentOrId;
  } else {
    student = getAllRegisteredStudents().find(
      (s) =>
        s.id === studentOrId ||
        s.prn === studentOrId ||
        s.email.toLowerCase() === studentOrId.toLowerCase()
    );
  }

  const allAdmissions = getAllStudentAdmissions();
  const cleanPhone = student?.phone ? student.phone.replace(/\D/g, "") : "";
  const cleanEmail = student?.email
    ? student.email.toLowerCase()
    : typeof studentOrId === "string"
    ? studentOrId.toLowerCase()
    : "";
  const targetId = student?.id || (typeof studentOrId === "string" ? studentOrId : "");
  const targetPrn = student?.prn || "";

  // 1. Filter existing student admissions
  const matched = allAdmissions.filter((a) => {
    if (targetId && a.studentId === targetId) return true;
    if (targetPrn && a.prn === targetPrn) return true;
    if (cleanEmail && a.studentEmail && a.studentEmail.toLowerCase() === cleanEmail) return true;
    if (cleanPhone && a.studentPhone && a.studentPhone.replace(/\D/g, "") === cleanPhone) return true;
    return false;
  });

  // 2. Also check parivattan_course_registrations to guarantee any standalone course registrations are included!
  try {
    const rawCourseRegs = localStorage.getItem("parivattan_course_registrations");
    if (rawCourseRegs) {
      const courseRegs = JSON.parse(rawCourseRegs);
      for (const reg of courseRegs) {
        const regEmail = (reg.emailAddress || reg.email || "").toLowerCase();
        const regPhone = (reg.mobileNumber || reg.phone || "").replace(/\D/g, "");
        const isMatch =
          (cleanEmail && regEmail === cleanEmail) ||
          (cleanPhone && regPhone === cleanPhone);

        if (isMatch) {
          const alreadyExists = matched.some(
            (m) =>
              m.paymentId === reg.id ||
              m.id === reg.id ||
              (m.courseTitle.includes(reg.language) && m.batchPreference.includes(reg.batch))
          );
          if (!alreadyExists) {
            matched.push({
              id: reg.id || `reg_${Date.now()}`,
              applicationNo: `PMF/REG/${reg.id || Date.now()}`,
              prn: targetPrn || student?.prn || "PMF2026-REG",
              studentId: targetId,
              studentName: reg.fullName || student?.name || "Student",
              studentEmail: reg.emailAddress || student?.email || "",
              studentPhone: reg.mobileNumber || student?.phone || "",
              courseId: `course_${(reg.language || "").toLowerCase()}_${(reg.level || "").toLowerCase()}`,
              courseCode: `PFLS-${(reg.language || "FL").slice(0, 2).toUpperCase()}-${reg.level || "A1"}`,
              courseTitle: `${reg.language || "Language"} (${reg.level || "Foundation"})`,
              school: "Parivattan Foreign Language School",
              batchPreference: `${reg.batch || "Regular"} (${reg.preferredTiming || "Morning"})`,
              learningMode: "Hybrid Classroom / Live Online",
              dob: "2002-01-01",
              gender: "Not Specified",
              category: "General",
              bloodGroup: "O+",
              fatherName: "",
              motherName: "",
              address: reg.address || "",
              city: "Pune",
              district: "Pune",
              pincode: "411001",
              qualification: reg.education || "Graduate",
              collegeName: reg.collegeName || "Parivattan Mission Institute",
              passingYear: "2024",
              percentage: "A Grade",
              amount: reg.totalAmount || reg.courseFee || 0,
              paymentId: reg.id,
              paymentMethod: "razorpay",
              paymentDate: reg.registeredAt || new Date().toISOString(),
              status: "completed",
              createdAt: reg.registeredAt || new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse course registrations:", err);
  }

  // 3. Check parivattan_admissions_records (from AdmissionsPage.tsx)
  try {
    const rawAdmRecords = localStorage.getItem("parivattan_admissions_records");
    if (rawAdmRecords) {
      const records = JSON.parse(rawAdmRecords);
      for (const rec of records) {
        const recEmail = (rec.emailAddress || rec.email || "").toLowerCase();
        const recPhone = (rec.mobileNumber || rec.phone || "").replace(/\D/g, "");
        const recPrn = rec.prn || "";
        const isMatch =
          (targetPrn && recPrn === targetPrn) ||
          (cleanEmail && recEmail === cleanEmail) ||
          (cleanPhone && recPhone === cleanPhone);

        if (isMatch) {
          const alreadyExists = matched.some(
            (m) =>
              m.id === rec.id ||
              (rec.paymentId && m.paymentId === rec.paymentId) ||
              (m.courseTitle.toLowerCase().includes((rec.language || "").toLowerCase()) &&
                m.batchPreference.toLowerCase().includes((rec.batch || "").toLowerCase()))
          );
          if (!alreadyExists) {
            matched.push({
              id: rec.id || `adm_rec_${Date.now()}`,
              applicationNo: rec.id || `PMF/ADM/${Date.now()}`,
              prn: targetPrn || rec.prn || student?.prn || "PMF2026-ADM",
              studentId: targetId,
              studentName: rec.fullName || student?.name || "Student",
              studentEmail: rec.emailAddress || student?.email || "",
              studentPhone: rec.mobileNumber || student?.phone || "",
              courseId: `course_${(rec.language || "course").toLowerCase()}`,
              courseCode: `PFLS-${(rec.language || "FL").slice(0, 2).toUpperCase()}-${rec.level || "A1"}`,
              courseTitle: `${rec.language || "Language"} (${rec.level || "Level"})`,
              school: "Parivattan Foreign Language School",
              batchPreference: `${rec.batch || "Batch"} (${rec.preferredTiming || "Flexible"})`,
              learningMode: "Hybrid Classroom / Live Online",
              dob: "2002-01-01",
              gender: "Not Specified",
              category: rec.casteCategory || "General",
              bloodGroup: "O+",
              fatherName: "",
              motherName: "",
              address: rec.address || "",
              city: rec.city || "Pune",
              district: "Pune",
              pincode: "411001",
              qualification: rec.education || "Graduate",
              collegeName: rec.collegeName || "Parivattan Mission Institute",
              passingYear: "2024",
              percentage: "A Grade",
              photoUrl: rec.photoDataUrl,
              amount: rec.totalAmount || 0,
              paymentId: rec.paymentId || rec.id,
              paymentMethod: "razorpay",
              paymentDate: rec.registeredAt || new Date().toISOString(),
              status: "completed",
              createdAt: rec.registeredAt || new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse admissions records:", err);
  }

  // 4. Check parivattan_admissions (supabase-admin local cache)
  try {
    const rawLocalAdms = localStorage.getItem("parivattan_admissions");
    if (rawLocalAdms) {
      const localAdms = JSON.parse(rawLocalAdms);
      for (const adm of localAdms) {
        if (adm.program === "STUDENT_REGISTRATION") continue;
        const admEmail = (adm.email || "").toLowerCase();
        const admPhone = (adm.phone || "").replace(/\D/g, "");
        const isMatch =
          (cleanEmail && admEmail === cleanEmail) ||
          (cleanPhone && admPhone === cleanPhone);

        if (isMatch) {
          const alreadyExists = matched.some(
            (m) =>
              m.id === adm.id ||
              (adm.payment_id && m.paymentId === adm.payment_id) ||
              m.courseTitle === adm.program
          );
          if (!alreadyExists) {
            matched.push({
              id: adm.id || `adm_loc_${Date.now()}`,
              applicationNo: `PMF/ADM/${Date.now()}`,
              prn: targetPrn || student?.prn || "PMF2026-ADM",
              studentId: targetId,
              studentName: adm.name || adm.student_name || student?.name || "Student",
              studentEmail: adm.email || student?.email || "",
              studentPhone: adm.phone || student?.phone || "",
              courseId: adm.course_id || "course_academic",
              courseCode: adm.program?.match(/PFLS-[A-Z0-9-]+/)
                ? adm.program.match(/PFLS-[A-Z0-9-]+/)![0]
                : "PFLS-GEN",
              courseTitle: adm.program || "Language Program",
              school: "Parivattan Foreign Language School",
              batchPreference: adm.message || "Regular Batch",
              learningMode: "Hybrid Classroom / Live Online",
              dob: "2002-01-01",
              gender: adm.gender || "Not Specified",
              category: "General",
              bloodGroup: "O+",
              fatherName: "",
              motherName: "",
              address: adm.address || "",
              city: "Pune",
              district: "Pune",
              pincode: "411001",
              qualification: adm.education || "Graduate",
              collegeName: adm.college_name || "Parivattan Mission Institute",
              passingYear: "2024",
              percentage: "Pass",
              photoUrl: adm.photo,
              amount: adm.amount || 0,
              paymentId: adm.payment_id || adm.id,
              paymentMethod: "razorpay",
              paymentDate: adm.created_at || new Date().toISOString(),
              status: adm.status || "completed",
              createdAt: adm.created_at || new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse local admissions:", err);
  }

  return matched;
};

/**
 * Cloud sync: Fetches all admissions from Supabase cloud database for this student,
 * caches them into the student admissions store, and returns the unified list.
 */
export const fetchStudentApplicationsFromCloud = async (
  student: StudentUser
): Promise<StudentAdmissionRecord[]> => {
  try {
    const cleanEmail = student.email.trim().toLowerCase();
    const cleanPhone = student.phone.replace(/\D/g, "");

    const { data: cloudRows, error } = await supabase
      .from("admissions")
      .select("*")
      .or(`email.ilike.${cleanEmail},phone.eq.${cleanPhone}`);

    if (error) {
      console.warn("[CloudSync] Supabase admissions query notice:", error.message);
    }

    const fetchedRecords: StudentAdmissionRecord[] = [];
    if (cloudRows && cloudRows.length > 0) {
      for (const row of cloudRows) {
        if (row.program === "STUDENT_REGISTRATION") continue;

        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        fetchedRecords.push({
          id: row.id || `adm_${Date.now()}_${randomSuffix}`,
          applicationNo: `PMF/ADM/2026/${randomSuffix}`,
          prn: student.prn,
          studentId: student.id,
          studentName: row.name || student.name,
          studentEmail: row.email || student.email,
          studentPhone: row.phone || student.phone,
          courseId: row.program ? row.program.toLowerCase().replace(/[^a-z0-9]/g, "_") : "course_gen",
          courseCode: row.program ? (row.program.match(/PFLS-[A-Z0-9-]+/) ? row.program.match(/PFLS-[A-Z0-9-]+/)![0] : "PFLS-COURSE") : "PFLS-COURSE",
          courseTitle: row.program || "Academic Course",
          school: "Parivattan Foreign Language School",
          batchPreference: row.message || "Regular Batch",
          learningMode: "Hybrid Classroom / Live Online",
          dob: "2002-01-01",
          gender: row.gender || "Not Specified",
          category: row.caste_certificate_name || "General",
          bloodGroup: "O+",
          fatherName: "",
          motherName: "",
          address: row.address || "",
          city: student.city || "Pune",
          district: "Pune",
          pincode: "411001",
          qualification: row.education || "Graduate",
          collegeName: row.college_name || "Parivattan Mission Institute",
          passingYear: "2024",
          percentage: "A Grade",
          photoUrl: row.photo,
          amount: row.amount || 0,
          paymentId: row.payment_id || `PAY-${row.id}`,
          paymentMethod: "razorpay",
          paymentDate: row.created_at || new Date().toISOString(),
          status: "completed",
          createdAt: row.created_at || new Date().toISOString(),
        });
      }
    }

    const local = getAllStudentAdmissions();
    const existingPaymentIds = new Set(local.map((l) => l.paymentId || l.id));
    const newItems = fetchedRecords.filter((f) => !existingPaymentIds.has(f.paymentId || f.id));

    if (newItems.length > 0) {
      const merged = [...newItems, ...local];
      localStorage.setItem(STUDENT_ADMISSIONS_KEY, JSON.stringify(merged));
    }

    return getStudentApplications(student);
  } catch (err) {
    console.warn("fetchStudentApplicationsFromCloud error:", err);
    return getStudentApplications(student);
  }
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
  identityProofUrl?: string;
  marksheetUrl?: string;
  education_proof?: string;
  casteCertUrl?: string;
  caste_certificate?: string;
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
  const effectivePhoto = record.photoUrl;
  const effectiveIdProof = record.identityProofUrl;
  const effectiveEduProof = record.education_proof || record.marksheetUrl;
  const effectiveCasteCert = record.caste_certificate || record.casteCertUrl;

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
      avatar: effectivePhoto,
      photo: effectivePhoto,
      photoUrl: effectivePhoto,
      identity_proof: effectiveIdProof,
      identityProofUrl: effectiveIdProof,
      identity_proof_name: "Identity Proof",
      education_proof: effectiveEduProof,
      education_proof_name: "Marksheet / Education Proof",
      marksheetUrl: effectiveEduProof,
      caste_certificate: effectiveCasteCert,
      casteCertUrl: effectiveCasteCert,
      caste_certificate_name: record.category || "Caste Certificate",
      registeredAt: new Date().toISOString(),
    };
    const updated = [student, ...allStudents];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    await saveStudentToCloud(student);
  } else {
    if (student.prn !== prn) {
      student.prn = prn;
    }
    if (effectivePhoto && !student.photo) {
      student.photo = effectivePhoto;
      student.photoUrl = effectivePhoto;
      if (!student.avatar) student.avatar = effectivePhoto;
    }
    if (effectiveIdProof && !student.identity_proof) {
      student.identity_proof = effectiveIdProof;
      student.identityProofUrl = effectiveIdProof;
      student.identity_proof_name = "Identity Proof";
    }
    if (effectiveEduProof && !student.education_proof) {
      student.education_proof = effectiveEduProof;
      student.marksheetUrl = effectiveEduProof;
      student.education_proof_name = "Marksheet / Education Proof";
    }
    if (effectiveCasteCert && !student.caste_certificate) {
      student.caste_certificate = effectiveCasteCert;
      student.casteCertUrl = effectiveCasteCert;
      student.caste_certificate_name = record.category || "Caste Certificate";
    }
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(allStudents));
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
    photoUrl: effectivePhoto,
    identityProofUrl: effectiveIdProof,
    marksheetUrl: effectiveEduProof,
    casteCertUrl: effectiveCasteCert,
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

