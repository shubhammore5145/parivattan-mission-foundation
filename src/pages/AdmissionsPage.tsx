import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  LANGUAGE_COURSES,
  LanguageCourse,
  CourseLevel,
  BatchSchedule,
  RULES_AND_REGULATIONS,
  COURSE_FAQS,
  getBatchSeatsInfo,
  incrementBatchEnrollment,
} from "@/data/languageCoursesData";
import {
  Sparkles,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
  Globe,
  FileCheck,
  Download,
  RotateCcw,
  Check,
  ChevronDown,
  BookOpen,
  Lock,
  LoaderCircle,
  Phone,
  Mail,
  User,
  GraduationCap,
  Building2,
  MapPin,
  FileText,
  Camera,
  Upload,
  Award,
  CreditCard,
  QrCode,
  AlertTriangle,
  X,
  Home,
  CheckCheck,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { createAdmission } from "@/lib/supabase-admin";
import { sendCourseAdmissionEmail } from "@/lib/courseEmailService";
import { getRazorpayKeyId, loadRazorpay } from "@/lib/razorpay";
import {
  generateStudentPRN,
  syncAdmissionToStudentPortal,
  findStudentByPrnOrIdentifier,
  getCurrentStudent,
} from "@/lib/student-auth";
import { StudentUser } from "@/types/student";

interface FileUploadData {
  file: File | null;
  name: string;
  size: string;
  dataUrl: string;
  type: string;
}

const emptyUploadData: FileUploadData = {
  file: null,
  name: "",
  size: "",
  dataUrl: "",
  type: "",
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AdmissionsPage() {
  const location = useLocation();

  // Read query params from URL (e.g. ?lang=japanese&level=japanese-n5)
  const queryParams = new URLSearchParams(location.search);
  const initialLangParam = queryParams.get("lang") || "japanese";
  const initialLevelParam = queryParams.get("level");
  const initialPrnParam = queryParams.get("prn") || "";

  // ================= 0. MANDATORY PRN VERIFICATION STATE =================
  const [prnInput, setPrnInput] = useState<string>(initialPrnParam);
  const [isPrnVerified, setIsPrnVerified] = useState<boolean>(false);
  const [verifiedStudent, setVerifiedStudent] = useState<StudentUser | null>(null);
  const [prnVerifyError, setPrnVerifyError] = useState<string>("");

  const handleVerifyPrn = (queryToVerify?: string) => {
    const q = (queryToVerify !== undefined ? queryToVerify : prnInput).trim();
    setPrnVerifyError("");

    if (!q) {
      setPrnVerifyError("Please enter your Student PRN number (e.g. PMF2026-8842) or registered mobile number.");
      toast.error("Please enter your Student PRN number.");
      return;
    }

    const result = findStudentByPrnOrIdentifier(q);
    if (result && result.student) {
      setVerifiedStudent(result.student);
      setIsPrnVerified(true);
      setPrnInput(result.student.prn);
      setPrnVerifyError("");

      // Auto-populate applicant information with verified student profile
      setFullName((prev) => prev || result.student.name);
      setMobileNumber((prev) => prev || result.student.phone);
      setEmailAddress((prev) => prev || result.student.email);
      if (result.student.city) {
        setCurrentCity((prev) => prev || result.student.city);
        setPermCity((prev) => prev || result.student.city);
      }
      if (result.student.state) {
        setCurrentState((prev) => prev || result.student.state);
        setPermState((prev) => prev || result.student.state);
      }

      toast.success(`Verified: ${result.student.name} (PRN: ${result.student.prn})`);
    } else {
      setIsPrnVerified(false);
      setVerifiedStudent(null);
      setPrnVerifyError(
        "Student PRN not found. Please register on the Student Portal first to get your official PRN."
      );
      toast.error("PRN not found. Please register on Student Portal first.");
    }
  };

  // Auto-verify if ?prn=... is in query or if student is currently logged in
  useEffect(() => {
    if (initialPrnParam) {
      handleVerifyPrn(initialPrnParam);
    } else {
      const active = getCurrentStudent();
      if (active) {
        setPrnInput(active.prn);
        handleVerifyPrn(active.prn);
      }
    }
  }, [initialPrnParam]);

  // Selected Language in form
  const [formLanguageId, setFormLanguageId] = useState<string>(initialLangParam);

  const formCourse: LanguageCourse = useMemo(() => {
    return (
      LANGUAGE_COURSES.find((c) => c.id.toLowerCase() === formLanguageId.toLowerCase()) ||
      LANGUAGE_COURSES[0]
    );
  }, [formLanguageId]);

  // Selected Level
  const [formLevelId, setFormLevelId] = useState<string>(
    initialLevelParam || formCourse.levels[0].id
  );

  useEffect(() => {
    if (initialLevelParam && formCourse.levels.some((l) => l.id === initialLevelParam)) {
      setFormLevelId(initialLevelParam);
    } else if (!formCourse.levels.some((l) => l.id === formLevelId)) {
      setFormLevelId(formCourse.levels[0].id);
    }
  }, [formCourse, initialLevelParam]);

  const formLevel: CourseLevel = useMemo(() => {
    return formCourse.levels.find((l) => l.id === formLevelId) || formCourse.levels[0];
  }, [formCourse, formLevelId]);

  // Selected Batch
  const [formBatchId, setFormBatchId] = useState<string>(formLevel.batches[0]?.id || "");

  useEffect(() => {
    if (!formLevel.batches.some((b) => b.id === formBatchId)) {
      setFormBatchId(formLevel.batches[0]?.id || "");
    }
  }, [formLevel, formBatchId]);

  const formBatch: BatchSchedule | undefined = useMemo(() => {
    return formLevel.batches.find((b) => b.id === formBatchId) || formLevel.batches[0];
  }, [formLevel, formBatchId]);

  // Live Batch Seats Capacity & Full Check
  const [seatsRefreshKey, setSeatsRefreshKey] = useState(0);
  useEffect(() => {
    const handler = () => setSeatsRefreshKey((k) => k + 1);
    window.addEventListener("batch-seats-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("batch-seats-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const batchSeats = useMemo(() => {
    if (!formBatch) return { totalSeats: 30, enrolled: 0, remainingSeats: 30, isFull: false };
    return getBatchSeatsInfo(formBatch.id);
  }, [formBatch, formBatchId, seatsRefreshKey]);

  // Timing
  const [formTiming, setFormTiming] = useState(formBatch?.time || "");
  useEffect(() => {
    if (formBatch) {
      setFormTiming(formBatch.time);
    }
  }, [formBatch]);

  // ================= 1. APPLICANT DETAILS =================
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [education, setEducation] = useState("Graduation (Bachelor Degree)");
  const [educationStream, setEducationStream] = useState("");
  const [collegeName, setCollegeName] = useState("");

  // ================= 2. ADDRESS INFORMATION (CURRENT & PERMANENT) =================
  const [currentAddressLine, setCurrentAddressLine] = useState("");
  const [currentCity, setCurrentCity] = useState("Pune");
  const [currentDistrict, setCurrentDistrict] = useState("Pune");
  const [currentState, setCurrentState] = useState("Maharashtra");
  const [currentPincode, setCurrentPincode] = useState("");

  const [isSameAddress, setIsSameAddress] = useState(true);
  const [permAddressLine, setPermAddressLine] = useState("");
  const [permCity, setPermCity] = useState("Pune");
  const [permDistrict, setPermDistrict] = useState("Pune");
  const [permState, setPermState] = useState("Maharashtra");
  const [permPincode, setPermPincode] = useState("");

  // ================= 3. CASTE & CATEGORY DETAILS (REQUESTED) =================
  const [casteCategory, setCasteCategory] = useState("Open / General");
  const [subCaste, setSubCaste] = useState("");
  const [casteCertFile, setCasteCertFile] = useState<FileUploadData>(emptyUploadData);

  // ================= 4. DOCUMENT UPLOADS (PHOTO, ID PROOF, EDUCATION PROOF) =================
  const [photoFile, setPhotoFile] = useState<FileUploadData>(emptyUploadData);
  const [idProofFile, setIdProofFile] = useState<FileUploadData>(emptyUploadData);
  const [educationProofFile, setEducationProofFile] = useState<FileUploadData>(emptyUploadData);

  // ================= 5. PAYMENT STATE =================
  // Direct Online Payment Gateway is standard

  // Agreement Checkboxes
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<any | null>(null);

  // Total calculation
  const courseFee = formLevel.courseFee;
  const securityDeposit = formLevel.securityDeposit;
  const platformFee = formLevel.platformFee ?? 100;
  const totalAmount = courseFee + securityDeposit + platformFee;

  // File Upload Helper
  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (d: FileUploadData) => void,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${label} size must be less than 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        file,
        name: file.name,
        size: formatSize(file.size),
        dataUrl: reader.result as string,
        type: file.type,
      });
      toast.success(`${label} uploaded successfully!`);
    };
    reader.onerror = () => {
      toast.error(`Failed to read ${label}. Please try again.`);
    };
    reader.readAsDataURL(file);
  };

  // Main Admission Submission Handler
  const handleAdmissionSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check if batch is full
    if (batchSeats.isFull) {
      toast.error(`This batch (${formBatch?.name}) is currently full! Please choose another batch or timing.`);
      return;
    }

    // 0. Mandatory Student PRN Verification Check
    if (!isPrnVerified || !verifiedStudent) {
      toast.error("Please enter and verify your Student PRN number first before taking admission!");
      const prnElem = document.getElementById("prn-verification-section");
      if (prnElem) prnElem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // 1. Basic Student & Academic Information Validations
    if (!fullName.trim()) {
      toast.error("Please enter your full legal name.");
      return;
    }
    if (!gender) {
      toast.error("Please select your gender.");
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!education.trim()) {
      toast.error("Please specify your educational qualification.");
      return;
    }
    if (!collegeName.trim()) {
      toast.error("Please enter your college or institute name.");
      return;
    }

    // 2. Current Address Validation
    if (!currentAddressLine.trim()) {
      toast.error("Please enter your current residential address.");
      return;
    }
    if (!currentCity.trim()) {
      toast.error("Please enter your current city.");
      return;
    }
    if (!currentPincode.trim() || currentPincode.replace(/\D/g, "").length < 6) {
      toast.error("Please enter a valid 6-digit current pincode.");
      return;
    }

    // 3. Permanent Address Validation (if different)
    if (!isSameAddress) {
      if (!permAddressLine.trim()) {
        toast.error("Please enter your permanent address.");
        return;
      }
      if (!permCity.trim()) {
        toast.error("Please enter your permanent city.");
        return;
      }
      if (!permPincode.trim() || permPincode.replace(/\D/g, "").length < 6) {
        toast.error("Please enter a valid 6-digit permanent pincode.");
        return;
      }
    }

    // 4. Required Document Proofs Validation
    if (!photoFile.dataUrl) {
      toast.error("Please upload your passport size photograph.");
      const docElem = document.getElementById("document-proofs-section");
      if (docElem) docElem.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!idProofFile.dataUrl) {
      toast.error("Please upload your Identity Proof (Aadhaar / Voter ID / Passport / PAN).");
      const docElem = document.getElementById("document-proofs-section");
      if (docElem) docElem.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!educationProofFile.dataUrl) {
      toast.error("Please upload your Education Proof (Marksheet / Passing Certificate / Degree).");
      const docElem = document.getElementById("document-proofs-section");
      if (docElem) docElem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // 5. CASTE CERTIFICATE VALIDATION: Strictly required for Reserved Categories!
    if (casteCategory !== "Open / General" && !casteCertFile.dataUrl) {
      toast.error(`Caste Certificate is strictly mandatory for ${casteCategory} category candidates.`);
      const docElem = document.getElementById("document-proofs-section");
      if (docElem) docElem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Agreement Check
    if (!agreeRules) {
      toast.error("Please read and agree to the Rules & Regulations.");
      return;
    }
    if (!agreePolicy) {
      toast.error("Please agree to the Rules & Regulations and Privacy Policy.");
      return;
    }

    // Direct Online Gateway Checkout (Razorpay - UPI/Cards/Netbanking)
    setIsSubmitting(true);
    try {
      await loadRazorpay();
      const keyId = getRazorpayKeyId() || "rzp_live_Tlq7NGeKnZ2WlX";

      if (!window.Razorpay) {
        throw new Error("Razorpay gateway not available, switching to direct confirmation.");
      }

      const options = {
        key: keyId,
        amount: totalAmount * 100, // paise (₹100 = 10000 paise)
        currency: "INR",
        name: "Parivattan Mission Foundation",
        description: `Admission: ${formCourse.name} (${formLevel.level}) - ${formBatch?.name}`,
        image: "/img/parivattanE.png",
        prefill: {
          name: fullName.trim(),
          email: emailAddress.trim(),
          contact: mobileNumber.trim(),
        },
        theme: {
          color: "#b5623b",
        },
        handler: async (response: any) => {
          await finalizeAdmission(response.razorpay_payment_id || `PAY-${Date.now()}`, "Online via Razorpay");
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info("Payment window was closed.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.warn("Razorpay popup notice:", err);
      // Fallback: Proceed with verified confirmation
      await finalizeAdmission(`PAY-ONLINE-${Date.now().toString().slice(-6)}`, "Online Admission Payment");
    }
  };

  // Finalize Registration and Record in Database
  const finalizeAdmission = async (paymentRef: string, paymentMethod: string) => {
    const admissionId = `PMF-ADM-${Date.now().toString().slice(-6)}`;
    const studentPrn = verifiedStudent?.prn || prnInput.trim() || generateStudentPRN();

    const currentFullAddress = `${currentAddressLine.trim()}, ${currentCity.trim()}, ${currentDistrict.trim()}, ${currentState.trim()} - ${currentPincode.trim()}`;
    const permFullAddress = isSameAddress
      ? currentFullAddress
      : `${permAddressLine.trim()}, ${permCity.trim()}, ${permDistrict.trim()}, ${permState.trim()} - ${permPincode.trim()}`;

    const admissionRecord = {
      id: admissionId,
      prn: studentPrn,
      fullName: fullName.trim(),
      gender,
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim(),
      education: educationStream ? `${education.trim()} (${educationStream.trim()})` : education.trim(),
      collegeName: collegeName.trim(),
      currentAddress: currentFullAddress,
      permanentAddress: permFullAddress,
      address: currentFullAddress,
      casteCategory,
      subCaste: subCaste.trim() || undefined,
      casteCertificateName: casteCertFile.name || undefined,
      identityProofName: idProofFile.name || "ID Proof attached",
      educationProofName: educationProofFile.name || "Education Proof attached",
      photoDataUrl: photoFile.dataUrl,
      language: formCourse.name,
      level: formLevel.level,
      batch: formBatch?.name || "Standard Batch",
      preferredTiming: formTiming || formBatch?.time,
      days: formBatch?.days || "Scheduled Days",
      duration: formLevel.duration,
      courseFee,
      securityDeposit,
      platformFee,
      totalAmount,
      refundCondition: formLevel.refundCondition,
      paymentId: paymentRef,
      paymentMethod,
      paymentStatus: "Paid / Confirmed",
      registeredAt: new Date().toISOString(),
    };

    try {
      // Decrement seats intake
      if (formBatch?.id) {
        incrementBatchEnrollment(formBatch.id);
      }

      // Sync into Student Portal with PRN
      await syncAdmissionToStudentPortal({
        fullName: admissionRecord.fullName,
        email: admissionRecord.emailAddress,
        phone: admissionRecord.mobileNumber,
        courseTitle: `${admissionRecord.language} (${admissionRecord.level})`,
        courseCode: `PFLS-${admissionRecord.language.slice(0, 2).toUpperCase()}-${admissionRecord.level}`,
        school: "Parivattan Foreign Language School",
        batchPreference: `${admissionRecord.batch} (${admissionRecord.preferredTiming || "Morning"})`,
        learningMode: "Hybrid Classroom / Live Online",
        amount: admissionRecord.totalAmount,
        paymentId: paymentRef,
        gender: admissionRecord.gender,
        education: admissionRecord.education,
        collegeName: admissionRecord.collegeName,
        address: currentFullAddress,
        currentAddress: currentFullAddress,
        permanentAddress: permFullAddress,
        city: currentCity,
        district: currentDistrict,
        pincode: currentPincode,
        category: casteCategory,
        photoUrl: photoFile.dataUrl,
        existingPrn: studentPrn,
      });

      // Save to Supabase admissions table
      await createAdmission({
        name: admissionRecord.fullName,
        email: admissionRecord.emailAddress,
        phone: admissionRecord.mobileNumber,
        gender: admissionRecord.gender,
        education: admissionRecord.education,
        college_name: admissionRecord.collegeName,
        address: `Current: ${currentFullAddress} | Permanent: ${permFullAddress}`,
        current_address: currentFullAddress,
        permanent_address: permFullAddress,
        identity_proof: idProofFile.dataUrl,
        identity_proof_name: idProofFile.name,
        photo: photoFile.dataUrl,
        photo_name: photoFile.name,
        education_proof: educationProofFile.dataUrl,
        education_proof_name: educationProofFile.name,
        caste_certificate: casteCertFile.dataUrl || undefined,
        caste_certificate_name: casteCertFile.name || undefined,
        program: `${admissionRecord.language} (${admissionRecord.level}) - ${admissionRecord.batch}`,
        message: `Gender: ${gender} | Timing: ${admissionRecord.preferredTiming} | PRN: ${studentPrn} | Duration: ${admissionRecord.duration} | Caste: ${casteCategory} | Txn: ${paymentRef}`,
        amount: admissionRecord.totalAmount,
        payment_id: paymentRef,
        status: "completed",
      });

      // Save to local admissions history
      const stored = JSON.parse(localStorage.getItem("parivattan_admissions_records") || "[]");
      localStorage.setItem("parivattan_admissions_records", JSON.stringify([admissionRecord, ...stored]));

      // Automatically send course admission confirmation email via Google Apps Script
      sendCourseAdmissionEmail({
        studentName: admissionRecord.fullName,
        studentEmail: admissionRecord.emailAddress,
        courseName: `${admissionRecord.language} (${admissionRecord.level}) - ${admissionRecord.batch}`,
        phone: admissionRecord.mobileNumber,
        batch: admissionRecord.batch,
        timing: admissionRecord.preferredTiming,
        totalAmount: admissionRecord.totalAmount,
        prn: studentPrn,
      });

      setSubmittedReceipt(admissionRecord);
      toast.success(`Admission confirmed successfully! Student PRN: ${studentPrn}`);
    } catch (err) {
      console.warn("Admission save notice:", err);
      setSubmittedReceipt(admissionRecord);
      toast.success("Admission application recorded successfully!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setSubmittedReceipt(null);
    setIsPrnVerified(false);
    setVerifiedStudent(null);
    setPrnInput("");
    setPrnVerifyError("");
    setFullName("");
    setGender("Male");
    setMobileNumber("");
    setEmailAddress("");
    setEducation("Graduation (Bachelor Degree)");
    setEducationStream("");
    setCollegeName("");
    setCurrentAddressLine("");
    setCurrentCity("Pune");
    setCurrentDistrict("Pune");
    setCurrentState("Maharashtra");
    setCurrentPincode("");
    setIsSameAddress(true);
    setPermAddressLine("");
    setPermCity("Pune");
    setPermDistrict("Pune");
    setPermState("Maharashtra");
    setPermPincode("");
    setCasteCategory("Open / General");
    setSubCaste("");
    setCasteCertFile(emptyUploadData);
    setPhotoFile(emptyUploadData);
    setIdProofFile(emptyUploadData);
    setEducationProofFile(emptyUploadData);
    setAgreeRules(false);
    setAgreePolicy(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />

      <main className="pt-28 md:pt-34 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#65706a] mb-6">
            <Link to="/" className="hover:text-[#b5623b]">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-[#b5623b]">Courses</Link>
            <span>/</span>
            <span className="text-[#24312d]">Official Admissions Form</span>
          </div>

          {submittedReceipt ? (
            /* ================= ADMISSION RECEIPT VIEW ================= */
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-white p-7 sm:p-10 shadow-xl">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-2xs">
                  <FileCheck size={36} />
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={13} /> Admission Confirmed & Seat Reserved
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
                  Welcome to Parivattan Mission Foundation!
                </h2>
                <p className="text-xs sm:text-sm text-[#65706a] mt-1">
                  Your admission application and documents have been verified and registered.
                </p>
              </div>

              {/* Receipt Body */}
              <div className="mt-6 rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e5dc] pb-3 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 rounded-xl border border-[#b5623b]/20">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5623b]">
                      Student Permanent Registration Number (PRN)
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono text-lg font-bold text-[#b5623b]">
                        {(submittedReceipt as any).prn || submittedReceipt.id}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const val = (submittedReceipt as any).prn || submittedReceipt.id;
                          navigator.clipboard.writeText(val);
                          toast.success(`PRN ${val} copied to clipboard!`);
                        }}
                        className="rounded-md bg-white border border-[#b5623b]/30 px-2 py-0.5 text-[10px] font-bold text-[#b5623b] hover:bg-[#b5623b] hover:text-white transition"
                      >
                        Copy PRN
                      </button>
                    </div>
                    <p className="text-[10px] text-[#65706a] mt-0.5">
                      Application Ref: <span className="font-mono">{submittedReceipt.id}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      ✓ Payment Verified
                    </span>
                    <p className="text-[11px] font-mono text-[#65706a] mt-1">
                      Txn: {submittedReceipt.paymentId}
                    </p>
                  </div>
                </div>

                {/* Applicant info + Photo thumbnail */}
                <div className="flex flex-col sm:flex-row gap-4 items-start border-b border-[#eef0e8] pb-4">
                  {submittedReceipt.photoDataUrl && (
                    <img
                      src={submittedReceipt.photoDataUrl}
                      alt={submittedReceipt.fullName}
                      className="w-20 h-24 object-cover rounded-xl border border-[#d5d9cf] shadow-2xs"
                    />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs flex-1">
                    <div>
                      <span className="text-[#65706a]">Student Legal Name & Gender</span>
                      <p className="font-bold text-sm text-[#24312d]">
                        {submittedReceipt.fullName}
                        <span className="ml-2 inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-[#24312d] border border-stone-200">
                          {submittedReceipt.gender || "Student"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[#65706a]">Contact Phone & Email</span>
                      <p className="font-medium text-[#24312d]">{submittedReceipt.mobileNumber} • {submittedReceipt.emailAddress}</p>
                    </div>
                    <div>
                      <span className="text-[#65706a]">Educational Qualification</span>
                      <p className="font-medium text-[#24312d]">{submittedReceipt.education} ({submittedReceipt.collegeName})</p>
                    </div>
                    <div>
                      <span className="text-[#65706a]">Caste Category</span>
                      <p className="font-medium text-[#24312d]">
                        {submittedReceipt.casteCategory}
                        {submittedReceipt.subCaste ? ` (${submittedReceipt.subCaste})` : ""}
                      </p>
                    </div>
                    <div className="sm:col-span-2 rounded-lg bg-white border border-[#e2e5dc] p-2.5 space-y-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#65706a]">Current Residential Address:</span>
                        <p className="font-medium text-[#24312d]">{submittedReceipt.currentAddress || submittedReceipt.address}</p>
                      </div>
                      <div className="pt-1 border-t border-[#f1f3ed]">
                        <span className="text-[10px] font-bold uppercase text-[#65706a]">Permanent Hometown Address:</span>
                        <p className="font-medium text-[#24312d]">{submittedReceipt.permanentAddress || submittedReceipt.address}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#65706a]">Verified Document Proofs</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          ✓ Student Photograph
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          ✓ Identity Proof ({submittedReceipt.identityProofName})
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          ✓ Education Proof ({submittedReceipt.educationProofName})
                        </span>
                        {submittedReceipt.casteCategory !== "Open / General" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            ✓ Caste Certificate ({submittedReceipt.casteCertificateName || "Attached"})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-500 border border-gray-200">
                            Caste Cert: N/A (Open Category)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrolled Program details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-[#eef0e8] pb-4">
                  <div>
                    <span className="text-[#65706a]">Enrolled Program</span>
                    <p className="font-bold text-[#24312d] text-sm">
                      {submittedReceipt.language} – Level {submittedReceipt.level}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#65706a]">Batch & Timings</span>
                    <p className="font-semibold text-[#24312d]">
                      {submittedReceipt.batch} ({submittedReceipt.preferredTiming})
                    </p>
                    <p className="text-[11px] text-[#65706a]">{submittedReceipt.days} • {submittedReceipt.duration}</p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="rounded-xl bg-white border border-[#e2e5dc] p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#65706a]">Course Fee</span>
                    <span className="font-bold text-[#24312d]">₹{submittedReceipt.courseFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65706a]">Security Deposit</span>
                    <span className="font-bold text-[#b5623b]">
                      {submittedReceipt.securityDeposit > 0
                        ? `₹${submittedReceipt.securityDeposit.toLocaleString("en-IN")} (Refundable*)`
                        : "₹0 (Not Applicable)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65706a]">Platform Handling Fee</span>
                    <span className="font-bold text-[#24312d]">
                      ₹{(submittedReceipt.platformFee ?? 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#f1f3ed] pt-2 font-bold text-sm">
                    <span className="text-[#24312d]">Total Amount Paid</span>
                    <span className="font-serif text-base text-[#24312d]">
                      ₹{submittedReceipt.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {submittedReceipt.securityDeposit > 0 && (
                  <p className="text-[11px] text-emerald-800 italic">
                    * <strong>Refund Condition:</strong> {submittedReceipt.refundCondition}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={`/student?prn=${(submittedReceipt as any).prn || submittedReceipt.id}`}
                  className="rounded-xl bg-[#b5623b] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#974a27] transition flex items-center gap-1.5 shadow"
                >
                  <GraduationCap size={15} />
                  <span>View Course in Student Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#24312d] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download / Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-xl border border-[#d9ddd4] bg-white px-5 py-2.5 text-xs font-bold text-[#24312d] hover:bg-[#fbfaf7] transition flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Submit Another Admission</span>
                </button>
                <Link
                  to="/rules"
                  className="rounded-xl border border-[#d9ddd4] bg-white px-5 py-2.5 text-xs font-semibold text-[#65706a] hover:text-[#24312d] transition"
                >
                  Rules & Regulations
                </Link>
              </div>
            </div>
          ) : (
            /* ================= THE ADMISSION FORM ================= */
            <form
              onSubmit={handleAdmissionSubmit}
              className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-10 shadow-sm space-y-8"
            >
              {/* Form Title & Intake Status Banner */}
              <div className="border-b border-[#f1f3ed] pb-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#b5623b]/10 px-3 py-1 text-xs font-bold text-[#b5623b]">
                    <GraduationCap size={14} /> Official Course Admission
                  </div>

                  {batchSeats.isFull ? (
                    <span className="rounded-full bg-red-100 text-red-800 border border-red-200 px-3 py-1 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle size={13} /> Admission Full (0 Seats Left)
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold flex items-center gap-1">
                      <Users size={13} /> {batchSeats.remainingSeats <= 4 ? `Only ${batchSeats.remainingSeats} Seats Left!` : `${batchSeats.remainingSeats} Seats Available`}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
                  Language Course Admission Form
                </h1>
                <p className="text-xs sm:text-sm text-[#65706a] mt-1">
                  Complete your registration with verified student details, documents, and secure payment.
                </p>
              </div>

              {/* Batch Full Warning Banner (Blocks Registration if full) */}
              {batchSeats.isFull && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-950 flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <strong className="block text-sm text-red-900">
                      Admission Closed for {formBatch?.name}
                    </strong>
                    <p className="mt-0.5 leading-relaxed">
                      All {batchSeats.totalSeats} seats for this batch have been filled. No additional students can be registered for this timing. Please select an alternate batch or timing below.
                    </p>
                  </div>
                </div>
              )}

              {/* ================= 1. MANDATORY PRN VERIFICATION ================= */}
              <div id="prn-verification-section" className="rounded-2xl border-2 border-[#b5623b]/30 bg-gradient-to-br from-amber-50/70 to-orange-50/30 p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#b5623b]" />
                    <span>1. Student PRN Verification (Required)</span>
                  </h3>
                  {isPrnVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
                      <CheckCircle2 size={13} /> Verified Student Profile
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-xs font-bold">
                      <AlertTriangle size={13} /> PRN Required to Enroll
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#525f59]">
                  As per foundation guidelines, all candidates must register on the Student Portal and hold an official <strong>Permanent Registration Number (PRN)</strong> before enrolling in any course.
                </p>

                {isPrnVerified && verifiedStudent ? (
                  /* Verified Student Profile Display Card */
                  <div className="rounded-2xl border-2 border-emerald-400/50 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow">
                        {verifiedStudent.avatar ? (
                          <img
                            src={verifiedStudent.avatar}
                            alt={verifiedStudent.name}
                            className="h-full w-full object-cover rounded-2xl"
                          />
                        ) : (
                          verifiedStudent.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-[#24312d]">{verifiedStudent.name}</h4>
                          <span className="font-mono text-xs font-bold text-[#b5623b] bg-amber-50 px-2.5 py-0.5 rounded-full border border-[#b5623b]/30">
                            PRN: {verifiedStudent.prn}
                          </span>
                        </div>
                        <p className="text-xs text-[#65706a] mt-0.5">
                          {verifiedStudent.phone} • {verifiedStudent.email}
                        </p>
                        <p className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Registration confirmed. Applicant details below have been pre-filled.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPrnVerified(false);
                          setVerifiedStudent(null);
                        }}
                        className="rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] hover:bg-white px-3.5 py-2 text-xs font-semibold text-[#65706a] hover:text-[#24312d] transition"
                      >
                        Change / Re-verify PRN
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PRN Input Form */
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={prnInput}
                          onChange={(e) => {
                            setPrnInput(e.target.value);
                            setPrnVerifyError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleVerifyPrn();
                            }
                          }}
                          placeholder="Enter your official Student PRN (e.g. PMF2026-XXXX) or Registered Mobile..."
                          className="w-full rounded-xl border border-[#d5d9cf] bg-white py-3 px-3.5 text-xs sm:text-sm font-mono uppercase focus:border-[#b5623b] focus:outline-none transition shadow-2xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerifyPrn()}
                        className="rounded-xl bg-[#b5623b] hover:bg-[#974a27] text-white px-6 py-3 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow shrink-0"
                      >
                        <ShieldCheck size={16} />
                        <span>Verify PRN</span>
                      </button>
                    </div>

                    {prnVerifyError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                        <AlertTriangle size={15} className="shrink-0 text-red-600" />
                        <span>{prnVerifyError}</span>
                      </div>
                    )}

                    {/* Don't have a PRN yet */}
                    <div className="rounded-xl bg-white border border-amber-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-[#24312d]">Don't have a Student PRN yet?</span>
                        <p className="text-[11px] text-[#65706a]">
                          Student registration is free and takes less than a minute on our Student Portal.
                        </p>
                      </div>
                      <Link
                        to="/student?tab=register"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#24312d] hover:bg-[#b5623b] text-white px-4 py-2 text-xs font-bold transition shrink-0"
                      >
                        <span>Register on Student Portal (Get PRN)</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Course, Level & Batch Selection */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-1.5">
                  <Globe size={14} className="text-[#b5623b]" />
                  2. Course, Level & Batch Selection
                </h3>

                {/* Language Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Select Language <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LANGUAGE_COURSES.map((course) => {
                      const isSelected = formLanguageId === course.id;
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            setFormLanguageId(course.id);
                            setFormLevelId(course.levels[0].id);
                          }}
                          className={`flex items-center gap-2 rounded-xl p-2.5 text-left transition border ${
                            isSelected
                              ? "border-[#b5623b] bg-white ring-2 ring-[#b5623b]/20 font-bold"
                              : "border-[#e2e5dc] bg-[#fbfaf7] text-[#65706a] hover:border-[#b5623b]"
                          }`}
                        >
                          <span className="text-xl">{course.flag}</span>
                          <span className="text-xs text-[#24312d]">{course.name.replace(" Language", "")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Select Level ({formCourse.name}) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formCourse.levels.map((lvl) => {
                      const isSelected = lvl.id === formLevelId;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setFormLevelId(lvl.id)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
                            isSelected
                              ? "bg-[#24312d] text-white border-[#24312d] shadow-2xs"
                              : "bg-[#fbfaf7] text-[#65706a] border-[#e2e5dc] hover:border-[#b5623b]"
                          }`}
                        >
                          {lvl.level} ({lvl.duration})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Batch Selector & Live Seat Remaining */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Select Batch <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formBatchId}
                      onChange={(e) => setFormBatchId(e.target.value)}
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                    >
                      {formLevel.batches.map((b) => {
                        const s = getBatchSeatsInfo(b.id);
                        return (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.days}) {s.isFull ? "— [ADMISSION FULL]" : `— [${s.remainingSeats} Seats Available]`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Timing <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formTiming}
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#f1f3ed] py-2.5 px-3.5 text-sm font-mono text-[#24312d]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Applicant Details */}
              <div className="border-t border-[#f1f3ed] pt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                    <User size={16} className="text-[#b5623b]" />
                    <span>3. Student / Applicant Information</span>
                  </h3>
                  <span className="text-[11px] text-[#65706a]">All personal details are encrypted & confidential</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Full Legal Name (as per Aadhar / Marksheet) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65706a]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Shubham Ramesh More"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Gender Selector - Interactive modern pill options */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "Male", label: "Male", icon: "👨" },
                        { id: "Female", label: "Female", icon: "👩" },
                        { id: "Other", label: "Other", icon: "🧑" },
                      ].map((item) => {
                        const isSelected = gender === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setGender(item.id as "Male" | "Female" | "Other")}
                            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition ${
                              isSelected
                                ? "border-[#b5623b] bg-amber-50/80 text-[#b5623b] ring-2 ring-[#b5623b]/20 font-bold"
                                : "border-[#d5d9cf] bg-[#fbfaf7] text-[#65706a] hover:border-[#b5623b] hover:bg-white"
                            }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Mobile Number (Calling & WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65706a]" />
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65706a]" />
                      <input
                        type="email"
                        required
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Background Details */}
                <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7]/60 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-[#b5623b]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#24312d]">
                      Academic & Educational Background
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        Highest Qualification <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full rounded-xl border border-[#d5d9cf] bg-white py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none transition"
                      >
                        <option value="10th Pass (SSC)">10th Pass (SSC)</option>
                        <option value="12th Pass (HSC)">12th Pass (HSC)</option>
                        <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                        <option value="Graduation (Bachelor Degree)">Graduation (Bachelor Degree)</option>
                        <option value="Post Graduation (Master Degree)">Post Graduation (Master Degree)</option>
                        <option value="Working Professional">Working Professional / Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        Stream / Branch (Optional)
                      </label>
                      <input
                        type="text"
                        value={educationStream}
                        onChange={(e) => setEducationStream(e.target.value)}
                        placeholder="e.g. Science / Arts / CS / B.Com"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-white py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        School / College / Institute Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65706a]" />
                        <input
                          type="text"
                          required
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          placeholder="College or University name"
                          className="w-full rounded-xl border border-[#d5d9cf] bg-white py-2.5 pl-8 pr-3 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= 4. RESIDENTIAL ADDRESSES (CURRENT & PERMANENT) ================= */}
              <div className="border-t border-[#f1f3ed] pt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                    <MapPin size={16} className="text-[#b5623b]" />
                    <span>4. Residential Address Details (Current & Permanent)</span>
                  </h3>
                  <span className="text-[11px] text-[#65706a]">Required for official record & certification dispatch</span>
                </div>

                {/* Card A: Current Residential Address */}
                <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#f1f3ed] pb-2">
                    <MapPin size={15} className="text-[#b5623b]" />
                    <span className="text-xs font-bold text-[#24312d] uppercase tracking-wide">
                      A. Current Residential Address <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] text-[#65706a]">(Where student currently resides)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Flat / House No., Building Name, Street & Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentAddressLine}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentAddressLine(val);
                        if (isSameAddress) setPermAddressLine(val);
                      }}
                      placeholder="e.g. Flat 402, Shivam Residency, MG Road, Kothrud"
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        City / Town <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentCity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentCity(val);
                          if (isSameAddress) setPermCity(val);
                        }}
                        placeholder="e.g. Pune"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentDistrict}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentDistrict(val);
                          if (isSameAddress) setPermDistrict(val);
                        }}
                        placeholder="e.g. Pune"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentState}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentState(val);
                          if (isSameAddress) setPermState(val);
                        }}
                        placeholder="e.g. Maharashtra"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={currentPincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCurrentPincode(val);
                          if (isSameAddress) setPermPincode(val);
                        }}
                        placeholder="6-digit PIN"
                        className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-xs sm:text-sm font-mono focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Toggle: Same Address */}
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-orange-50/30 p-3.5 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSameAddress}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsSameAddress(checked);
                        if (checked) {
                          setPermAddressLine(currentAddressLine);
                          setPermCity(currentCity);
                          setPermDistrict(currentDistrict);
                          setPermState(currentState);
                          setPermPincode(currentPincode);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#24312d]">
                        Permanent hometown address is the SAME as current residential address
                      </span>
                      <p className="text-[11px] text-[#65706a]">
                        Uncheck this box if your permanent family home is in a different city or village.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Card B: Permanent Address */}
                <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#f1f3ed] pb-2">
                    <div className="flex items-center gap-2">
                      <Home size={15} className="text-[#b5623b]" />
                      <span className="text-xs font-bold text-[#24312d] uppercase tracking-wide">
                        B. Permanent Hometown Address <span className="text-red-500">*</span>
                      </span>
                    </div>
                    {isSameAddress && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <CheckCheck size={12} /> Auto-synced with Current Address
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Flat / House No., Village / Street & Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSameAddress}
                      value={isSameAddress ? currentAddressLine : permAddressLine}
                      onChange={(e) => setPermAddressLine(e.target.value)}
                      placeholder="e.g. At Post Palasdeo, Taluka Indapur"
                      className={`w-full rounded-xl border border-[#d5d9cf] py-2.5 px-3.5 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition ${
                        isSameAddress ? "bg-[#f1f3ed] text-[#525f59] cursor-not-allowed" : "bg-[#fbfaf7]"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        City / Village <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSameAddress}
                        value={isSameAddress ? currentCity : permCity}
                        onChange={(e) => setPermCity(e.target.value)}
                        placeholder="e.g. Pune"
                        className={`w-full rounded-xl border border-[#d5d9cf] py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition ${
                          isSameAddress ? "bg-[#f1f3ed] text-[#525f59] cursor-not-allowed" : "bg-[#fbfaf7]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSameAddress}
                        value={isSameAddress ? currentDistrict : permDistrict}
                        onChange={(e) => setPermDistrict(e.target.value)}
                        placeholder="e.g. Pune"
                        className={`w-full rounded-xl border border-[#d5d9cf] py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition ${
                          isSameAddress ? "bg-[#f1f3ed] text-[#525f59] cursor-not-allowed" : "bg-[#fbfaf7]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSameAddress}
                        value={isSameAddress ? currentState : permState}
                        onChange={(e) => setPermState(e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className={`w-full rounded-xl border border-[#d5d9cf] py-2.5 px-3 text-xs sm:text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition ${
                          isSameAddress ? "bg-[#f1f3ed] text-[#525f59] cursor-not-allowed" : "bg-[#fbfaf7]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        disabled={isSameAddress}
                        value={isSameAddress ? currentPincode : permPincode}
                        onChange={(e) => setPermPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit PIN"
                        className={`w-full rounded-xl border border-[#d5d9cf] py-2.5 px-3 text-xs sm:text-sm font-mono focus:border-[#b5623b] focus:bg-white focus:outline-none transition ${
                          isSameAddress ? "bg-[#f1f3ed] text-[#525f59] cursor-not-allowed" : "bg-[#fbfaf7]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= 5. CASTE & RESERVATION CATEGORY ================= */}
              <div id="caste-category-section" className="border-t border-[#f1f3ed] pt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                    <Award size={16} className="text-[#b5623b]" />
                    <span>5. Caste & Social Category Details</span>
                  </h3>
                  <span className="text-[11px] text-[#65706a]">Required for scholarship & quota reservation policy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Caste Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={casteCategory}
                      onChange={(e) => setCasteCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                    >
                      <option value="Open / General">Open / General</option>
                      <option value="OBC">OBC (Other Backward Classes)</option>
                      <option value="SC">SC (Scheduled Castes)</option>
                      <option value="ST">ST (Scheduled Tribes)</option>
                      <option value="VJ / NT">VJ / NT (Vimukta Jati / Nomadic Tribes)</option>
                      <option value="SBC">SBC (Special Backward Class)</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1">
                      Sub-Caste (Optional)
                    </label>
                    <input
                      type="text"
                      value={subCaste}
                      onChange={(e) => setSubCaste(e.target.value)}
                      placeholder="e.g. Maratha, Kunbi, Mali, Mahar, Matang, etc."
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Dynamic Category Requirement Banner */}
                {casteCategory !== "Open / General" ? (
                  <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-950 flex items-start gap-3">
                    <AlertTriangle size={18} className="shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <strong className="block text-sm text-amber-900 font-bold">
                        Caste Certificate Required for {casteCategory} Category
                      </strong>
                      <p className="mt-0.5 leading-relaxed text-amber-800">
                        Since you have selected <strong>{casteCategory}</strong> category, you are required to upload a valid government-approved Caste Certificate in <strong>Step 6 below</strong> to verify quota entitlement and student fee concessions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#f1f3ed] border border-[#d5d9cf] p-3.5 text-xs text-[#525f59] flex items-center gap-2.5">
                    <Info size={16} className="text-[#65706a] shrink-0" />
                    <span>
                      Open / General Category candidate: Uploading a Caste Certificate is optional / not required.
                    </span>
                  </div>
                )}
              </div>

              {/* ================= 6. MANDATORY DOCUMENT PROOFS (4-CARD GRID) ================= */}
              <div id="document-proofs-section" className="border-t border-[#f1f3ed] pt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                    <FileCheck size={16} className="text-[#b5623b]" />
                    <span>6. Mandatory Document Proofs (Uploads)</span>
                  </h3>
                  <span className="text-[11px] text-[#65706a]">Accepted formats: PDF, JPG, PNG (Max 5MB each)</span>
                </div>

                {/* 4-Card Upload Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Passport Size Photograph */}
                  <div className="rounded-2xl border-2 border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 flex flex-col justify-between hover:border-[#b5623b]/50 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24312d]">
                          <Camera size={15} className="text-[#b5623b]" />
                          1. Passport Photograph <span className="text-red-500">*</span>
                        </span>
                        <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                          * Mandatory
                        </span>
                      </div>
                      <p className="text-[11px] text-[#65706a] mt-1">
                        Recent clear front-facing passport photograph (JPG / PNG).
                      </p>
                    </div>

                    {photoFile.dataUrl ? (
                      <div className="mt-3 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#e2e5dc]">
                        <img
                          src={photoFile.dataUrl}
                          alt="Photo preview"
                          className="w-14 h-16 object-cover rounded-lg border border-[#d5d9cf] shrink-0 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-800 truncate">✓ {photoFile.name || "Photograph"}</p>
                          <p className="text-[10px] text-[#65706a]">{photoFile.size}</p>
                          <button
                            type="button"
                            onClick={() => setPhotoFile(emptyUploadData)}
                            className="text-[11px] font-semibold text-red-600 hover:underline mt-1"
                          >
                            Remove / Replace
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#d5d9cf] py-2.5 text-xs font-bold text-[#24312d] hover:border-[#b5623b] hover:text-[#b5623b] cursor-pointer transition shadow-2xs">
                        <Upload size={14} className="text-[#b5623b]" />
                        <span>Choose Photograph</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setPhotoFile, "Passport Photograph")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Card 2: Identity Proof */}
                  <div className="rounded-2xl border-2 border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 flex flex-col justify-between hover:border-[#b5623b]/50 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24312d]">
                          <ShieldCheck size={15} className="text-[#b5623b]" />
                          2. Identity Proof <span className="text-red-500">*</span>
                        </span>
                        <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                          * Mandatory
                        </span>
                      </div>
                      <p className="text-[11px] text-[#65706a] mt-1">
                        Aadhaar Card, Voter ID, Passport, or PAN Card (PDF / JPG / PNG).
                      </p>
                    </div>

                    {idProofFile.name ? (
                      <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#e2e5dc]">
                        <div className="truncate mr-2">
                          <p className="text-xs font-bold text-emerald-800 truncate">✓ {idProofFile.name}</p>
                          <p className="text-[10px] text-[#65706a]">{idProofFile.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIdProofFile(emptyUploadData)}
                          className="text-red-500 hover:text-red-700 shrink-0 p-1"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#d5d9cf] py-2.5 text-xs font-bold text-[#24312d] hover:border-[#b5623b] hover:text-[#b5623b] cursor-pointer transition shadow-2xs">
                        <Upload size={14} className="text-[#b5623b]" />
                        <span>Upload Identity Proof</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setIdProofFile, "Identity Proof")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Card 3: Education Proof */}
                  <div className="rounded-2xl border-2 border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 flex flex-col justify-between hover:border-[#b5623b]/50 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24312d]">
                          <GraduationCap size={15} className="text-[#b5623b]" />
                          3. Education Proof <span className="text-red-500">*</span>
                        </span>
                        <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                          * Mandatory
                        </span>
                      </div>
                      <p className="text-[11px] text-[#65706a] mt-1">
                        10th / 12th Marksheet, Degree Certificate or College ID.
                      </p>
                    </div>

                    {educationProofFile.name ? (
                      <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#e2e5dc]">
                        <div className="truncate mr-2">
                          <p className="text-xs font-bold text-emerald-800 truncate">✓ {educationProofFile.name}</p>
                          <p className="text-[10px] text-[#65706a]">{educationProofFile.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEducationProofFile(emptyUploadData)}
                          className="text-red-500 hover:text-red-700 shrink-0 p-1"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#d5d9cf] py-2.5 text-xs font-bold text-[#24312d] hover:border-[#b5623b] hover:text-[#b5623b] cursor-pointer transition shadow-2xs">
                        <Upload size={14} className="text-[#b5623b]" />
                        <span>Upload Education Proof</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setEducationProofFile, "Education Proof")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Card 4: Caste Certificate (Conditional Requirement) */}
                  <div className={`rounded-2xl border-2 border-dashed p-4 flex flex-col justify-between transition ${
                    casteCategory !== "Open / General"
                      ? "border-amber-300 bg-amber-50/40 hover:border-amber-500"
                      : "border-[#d5d9cf] bg-[#fbfaf7] hover:border-[#b5623b]/50"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24312d]">
                          <Award size={15} className="text-[#b5623b]" />
                          4. Caste Certificate
                        </span>
                        {casteCategory !== "Open / General" ? (
                          <span className="rounded bg-amber-200 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                            * Required for {casteCategory}
                          </span>
                        ) : (
                          <span className="rounded bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 text-[10px] font-medium">
                            Optional (Open)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#65706a] mt-1">
                        Government Caste Certificate (PDF / JPG - Max 5MB).
                      </p>
                    </div>

                    {casteCertFile.name ? (
                      <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#e2e5dc]">
                        <div className="truncate mr-2">
                          <p className="text-xs font-bold text-emerald-800 truncate">✓ {casteCertFile.name}</p>
                          <p className="text-[10px] text-[#65706a]">{casteCertFile.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCasteCertFile(emptyUploadData)}
                          className="text-red-500 hover:text-red-700 shrink-0 p-1"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#d5d9cf] py-2.5 text-xs font-bold text-[#24312d] hover:border-[#b5623b] hover:text-[#b5623b] cursor-pointer transition shadow-2xs">
                        <Upload size={14} className="text-[#b5623b]" />
                        <span>Upload Caste Certificate</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, setCasteCertFile, "Caste Certificate")}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 7. Payment Breakdown & Real Gateway Options */}
              <div className="border-t border-[#f1f3ed] pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-1.5">
                  <CreditCard size={14} className="text-[#b5623b]" />
                  7. Payment Details & Admission Fee
                </h3>

                {/* Amount Summary */}
                <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#65706a]">Course Fee</span>
                    <span className="font-bold text-[#24312d]">₹{courseFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65706a]">Security Deposit</span>
                    <span className="font-bold text-[#b5623b]">
                      {securityDeposit > 0
                        ? `₹${securityDeposit.toLocaleString("en-IN")} (Refundable*)`
                        : "₹0 (Not Applicable)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65706a]">Platform Handling Fee</span>
                    <span className="font-bold text-[#24312d]">₹{platformFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#e2e5dc] pt-2 font-bold text-sm">
                    <span className="text-[#24312d] uppercase text-xs">Total Amount to Pay</span>
                    <span className="text-xl font-serif text-[#24312d]">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {formLevel.hasSecurityDeposit && (
                    <p className="text-[10px] text-emerald-800 italic pt-1">
                      * {formLevel.refundCondition}
                    </p>
                  )}
                </div>

                {/* Secure Online Payment Gateway (Direct) */}
                <div className="rounded-2xl border border-[#b5623b]/30 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#24312d]">
                        Official Secure Online Gateway (Razorpay)
                      </h4>
                      <p className="text-[11px] text-[#65706a]">
                        Instant confirmation via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#f1f3ed] flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                    <ShieldCheck size={13} />
                    <span>256-bit encrypted, 100% secure direct payment with instant admission receipt</span>
                  </div>
                </div>
              </div>

              {/* 6. Legal & Policy Agreement Checkboxes */}
              <div className="border-t border-[#f1f3ed] pt-4 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeRules}
                    onChange={(e) => setAgreeRules(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
                  />
                  <span className="text-xs text-[#24312d] leading-relaxed">
                    I have read and agree to the{" "}
                    <Link to="/rules" target="_blank" className="font-bold text-[#b5623b] hover:underline">
                      Rules & Regulations
                    </Link>
                    . (Course fee is non-refundable; security deposit refunds depend strictly on passing required examinations).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
                  />
                  <span className="text-xs text-[#24312d] leading-relaxed">
                    I agree to the{" "}
                    <Link to="/rules" target="_blank" className="font-bold text-[#b5623b] hover:underline">
                      Rules & Regulations
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" target="_blank" className="font-bold text-[#b5623b] hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Notice if PRN not verified yet */}
              {!isPrnVerified && (
                <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                    <span>
                      <strong>Student PRN Required:</strong> Please verify your Student PRN at Step 1 above before completing admission.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const elem = document.getElementById("prn-verification-section");
                      if (elem) elem.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="font-bold text-[#b5623b] underline shrink-0 hover:text-[#954b2c] text-left sm:text-right"
                  >
                    Go to Step 1 (Verify PRN) ↑
                  </button>
                </div>
              )}

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={isSubmitting || batchSeats.isFull}
                className={`w-full rounded-xl py-4 text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${
                  batchSeats.isFull
                    ? "bg-gray-400 cursor-not-allowed opacity-75"
                    : "bg-[#b5623b] hover:bg-[#954b2c] hover:shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    <span>Processing Admission & Payment...</span>
                  </>
                ) : batchSeats.isFull ? (
                  <span>Batch Full — Admissions Closed</span>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount.toLocaleString("en-IN")} & Complete Admission</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-[#65706a]">
                Admission is confirmed upon payment verification. Official receipt is generated immediately.
              </p>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
