import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import { createAdmission } from "@/lib/supabase-admin";
import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
} from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const CURRENT_STUDENT_KEY = "parivattan_current_student";
const ALL_STUDENTS_KEY = "parivattan_registered_students";
const STUDENT_ADMISSIONS_KEY = "parivattan_student_admissions";

export const generateStudentPRN = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PMF2026-${random}`;
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

  // 1. Create student in Firebase Authentication if available
  let firebaseUid = "";
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password.trim());
    firebaseUid = userCredential.user.uid;
    await updateProfile(userCredential.user, { displayName: cleanName });
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      // If already registered in Firebase, continue to check local persistence
      console.warn("Email already in Firebase:", cleanEmail);
    } else if (err.code === "auth/weak-password") {
      throw new Error("Password must be at least 6 characters long.");
    } else if (err.code === "auth/invalid-email") {
      throw new Error("Please enter a valid email address.");
    } else {
      console.warn("Firebase registration notice:", err?.code, err?.message);
    }
  }

  // 2. Generate student PRN and prepare profile
  const newPrn = generateStudentPRN();
  const newStudent: StudentUser = {
    id: firebaseUid ? `std_${firebaseUid}` : `std_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
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

  // 3. Save student in Firestore if UID is present
  if (firebaseUid) {
    try {
      await setDoc(doc(db, "students", firebaseUid), {
        uid: firebaseUid,
        prn: newStudent.prn,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        city: newStudent.city,
        state: newStudent.state,
        registeredAt: newStudent.registeredAt,
      }, { merge: true });
    } catch (fsErr) {
      console.warn("Could not write student to Firestore:", fsErr);
    }
  }

  // 4. Update local cache
  const allStudents = getAllRegisteredStudents();
  try {
    const updated = [newStudent, ...allStudents.filter(s => s.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error persisting student list:", e);
  }

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
  const existingLocal = allStudents.find(
    s =>
      s.email.toLowerCase() === cleanId ||
      (cleanDigits.length >= 7 && s.phone.replace(/\D/g, "") === cleanDigits) ||
      s.prn.toLowerCase() === cleanId ||
      s.prn.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanId.replace(/[^a-z0-9]/g, "")
  );

  const targetEmail = existingLocal?.email || cleanId;

  // 1. If student exists locally, check password first
  if (existingLocal) {
    const expectedPassword = (existingLocal.password && existingLocal.password.trim()) || "student123";
    if (expectedPassword !== password.trim()) {
      throw new Error("Invalid password. Please check your password and try again.");
    }

    // Password matches! Sync/authenticate with Firebase in background
    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password.trim());
      if (userCredential?.user) {
        existingLocal.firebaseUid = userCredential.user.uid;
      }
    } catch (fbErr: any) {
      console.warn("Firebase Auth notice:", fbErr?.code);
    }

    setCurrentStudent(existingLocal);
    return existingLocal;
  }

  // 2. If not found locally, attempt Firebase Authentication directly
  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password.trim());
    const fbUser = userCredential.user;

    let studentData: Partial<StudentUser> = {};
    try {
      const snap = await getDoc(doc(db, "students", fbUser.uid));
      if (snap.exists()) {
        studentData = snap.data() as Partial<StudentUser>;
      }
    } catch (e) {
      console.warn("Firestore lookup error:", e);
    }

    const student: StudentUser = {
      id: `std_${fbUser.uid}`,
      firebaseUid: fbUser.uid,
      prn: studentData.prn || generateStudentPRN(),
      name: fbUser.displayName || studentData.name || "Student",
      email: fbUser.email || targetEmail,
      phone: studentData.phone || "",
      city: studentData.city || "Pune",
      state: studentData.state || "Maharashtra",
      avatar: fbUser.photoURL || undefined,
      registeredAt: studentData.registeredAt || new Date().toISOString(),
      password: password.trim(),
    };

    const updated = [student, ...allStudents.filter(s => s.email.toLowerCase() !== student.email.toLowerCase())];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    setCurrentStudent(student);

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

// Google 1-Click Sign-In via Firebase
export const loginWithGoogle = async (): Promise<StudentUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const allStudents = getAllRegisteredStudents();
    const existingLocal = allStudents.find(s => s.email.toLowerCase() === fbUser.email?.toLowerCase());

    let studentData: Partial<StudentUser> = {};
    try {
      const snap = await getDoc(doc(db, "students", fbUser.uid));
      if (snap.exists()) {
        studentData = snap.data() as Partial<StudentUser>;
      }
    } catch (e) {
      console.warn("Firestore lookup notice:", e);
    }

    const student: StudentUser = {
      id: `std_${fbUser.uid}`,
      firebaseUid: fbUser.uid,
      prn: studentData.prn || existingLocal?.prn || generateStudentPRN(),
      name: fbUser.displayName || existingLocal?.name || "Student",
      email: fbUser.email || "",
      phone: studentData.phone || existingLocal?.phone || "",
      city: studentData.city || existingLocal?.city || "Pune",
      state: studentData.state || existingLocal?.state || "Maharashtra",
      avatar: fbUser.photoURL || existingLocal?.avatar || undefined,
      registeredAt: studentData.registeredAt || existingLocal?.registeredAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "students", fbUser.uid), {
        uid: fbUser.uid,
        prn: student.prn,
        name: student.name,
        email: student.email,
        phone: student.phone,
        city: student.city,
        state: student.state,
        registeredAt: student.registeredAt,
      }, { merge: true });
    } catch (e) {
      console.warn("Could not save to Firestore:", e);
    }

    const updated = [student, ...allStudents.filter(s => s.email.toLowerCase() !== student.email.toLowerCase())];
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(updated));
    setCurrentStudent(student);

    return student;
  } catch (err: any) {
    console.warn("Google signIn error:", err);
    if (err?.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in popup was closed. Please try again or sign in with Email/PRN.");
    }
    if (err?.code === "auth/operation-not-allowed" || err?.code === "auth/unauthorized-domain") {
      throw new Error("Google Sign-In is not enabled yet in your Firebase Console. Please enable Google provider in Firebase Console, or sign in using Email & Password / PRN below.");
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
    student = {
      id: `std_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
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
  } else if (student.prn !== prn) {
    student.prn = prn;
    localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(allStudents));
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
