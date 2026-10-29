import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  Search,
  ArrowRight,
  UserPlus,
  LogIn,
  Home,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import {
  getCurrentStudent,
  getStudentApplications,
  fetchStudentApplicationsFromCloud,
  findStudentByPrnOrIdentifier,
  logoutStudent,
  checkGoogleRedirectResult,
  checkFirebaseEmailVerification,
  handleFirebaseEmailVerificationCode,
} from "@/lib/student-auth";
import { StudentAuthCard } from "@/components/student/StudentAuthCard";
import { AdmissionReceiptView } from "@/components/student/AdmissionReceiptView";
import { StudentDashboardView } from "@/components/student/StudentDashboardView";

export default function StudentPortalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [currentStudent, setCurrentStudentState] = useState<StudentUser | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "auth">("auth");
  const [latestAdmission, setLatestAdmission] = useState<StudentAdmissionRecord | null>(null);
  const [studentApplications, setStudentApplications] = useState<StudentAdmissionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [prefilledIdentifier, setPrefilledIdentifier] = useState("");

  // Check login or PRN query on mount (Password is strictly required!)
  useEffect(() => {
    const storedStudent = getCurrentStudent();
    const prnQuery = searchParams.get("prn");
    const modeQuery = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    const emailVerifiedQuery = searchParams.get("emailVerified");
    const emailParam = searchParams.get("email");

    // Handle Firebase email verification action code (?oobCode=...)
    if (oobCode) {
      toast.loading("Verifying your email with Firebase...", { id: "fb-email-verify" });
      handleFirebaseEmailVerificationCode(oobCode, emailParam || undefined)
        .then((student) => {
          toast.dismiss("fb-email-verify");
          setCurrentStudentState(student);
          refreshStudentApps(student);
          setActiveTab("dashboard");
          toast.success(
            `Email verified successfully! Welcome, ${student.name}. Your official PRN is ${student.prn}`
          );
        })
        .catch((err) => {
          toast.dismiss("fb-email-verify");
          toast.error(err?.message || "Email verification link invalid or expired.");
          setActiveTab("auth");
        });
      return;
    }

    // Handle redirect when user clicked email verification link (?emailVerified=true&email=...)
    if (emailVerifiedQuery === "true" && emailParam) {
      toast.loading("Confirming your email verification...", { id: "fb-email-confirm" });
      checkFirebaseEmailVerification(emailParam)
        .then((student) => {
          toast.dismiss("fb-email-confirm");
          if (student) {
            setCurrentStudentState(student);
            refreshStudentApps(student);
            setActiveTab("dashboard");
            toast.success(
              `Email verified successfully! Welcome, ${student.name}. Your official PRN is ${student.prn}`
            );
          } else {
            setActiveTab("auth");
          }
        })
        .catch(() => {
          toast.dismiss("fb-email-confirm");
          setActiveTab("auth");
        });
      return;
    }

    if (modeQuery === "register") {
      setActiveTab("auth");
      return;
    }

    if (prnQuery) {
      // If the currently authenticated student session matches this PRN, allow dashboard
      if (
        storedStudent &&
        (storedStudent.prn.toLowerCase() === prnQuery.toLowerCase() ||
          storedStudent.email.toLowerCase() === prnQuery.toLowerCase())
      ) {
        setCurrentStudentState(storedStudent);
        setStudentApplications(getStudentApplications(storedStudent.id));
        setActiveTab("dashboard");
        return;
      }

      // If NOT logged in, NEVER bypass password! Pre-fill the login form with this PRN and require password!
      setPrefilledIdentifier(prnQuery);
      setActiveTab("auth");
      toast.info(`PRN ${prnQuery} detected. Please enter your password to sign in.`);
      return;
    }

    if (storedStudent) {
      setCurrentStudentState(storedStudent);
      const apps = getStudentApplications(storedStudent.id);
      setStudentApplications(apps);
      refreshStudentApps(storedStudent);
      setActiveTab("dashboard");
    } else {
      // Check if user just redirected back from Google sign-in
      checkGoogleRedirectResult().then((redirectedStudent) => {
        if (redirectedStudent) {
          setCurrentStudentState(redirectedStudent);
          setStudentApplications(getStudentApplications(redirectedStudent.id));
          refreshStudentApps(redirectedStudent);
          setActiveTab("dashboard");
          toast.success(`Welcome, ${redirectedStudent.name}! Signed in with Google.`);
        } else {
          setCurrentStudentState(null);
          setStudentApplications([]);
          setActiveTab("auth");
        }
      });
    }
  }, [searchParams]);

  // Sync applications from both local and cloud databases
  const refreshStudentApps = async (student: StudentUser) => {
    // 1. Immediately render local and cached course registrations
    const localApps = getStudentApplications(student);
    setStudentApplications(localApps);

    // 2. Fetch and merge cloud registrations from Supabase
    try {
      const cloudApps = await fetchStudentApplicationsFromCloud(student);
      setStudentApplications(cloudApps);
    } catch (e) {
      console.warn("Could not sync cloud applications:", e);
    }
  };

  // PRN or Mobile lookup handler (DOES NOT LOG IN WITHOUT PASSWORD)
  const handleSearchByPrn = (overrideQuery?: string) => {
    const q = (overrideQuery || searchQuery).trim();
    if (!q) {
      toast.error("Please enter a valid PRN number or registered email/mobile.");
      return;
    }

    const res = findStudentByPrnOrIdentifier(q);
    if (res) {
      // Pre-fill the login form with this student's PRN so they can enter password
      setPrefilledIdentifier(res.student.prn);
      setActiveTab("auth");
      toast.info(
        `Profile found for ${res.student.name} (PRN: ${res.student.prn}). Please enter your password to sign in.`,
        { duration: 6000 }
      );
      const authCardElement = document.getElementById("student-login-card");
      if (authCardElement) {
        authCardElement.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      toast.error("No student profile found with this PRN or mobile number. Please register first.");
    }
  };

  // Auth Card Success
  const handleAuthSuccess = (student: StudentUser) => {
    setCurrentStudentState(student);
    refreshStudentApps(student);
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    await logoutStudent();
    setCurrentStudentState(null);
    setStudentApplications([]);
    setActiveTab("auth");
    navigate("/student", { replace: true });
    toast.success("Logged out successfully.");
  };

  // If student is logged in, show the comprehensive Dashboard / Receipt View
  if (currentStudent && activeTab === "dashboard") {
    if (latestAdmission) {
      return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 flex items-center justify-center selection:bg-[#0b63e5]/20">
          <div className="max-w-4xl w-full">
            <AdmissionReceiptView
              admission={latestAdmission}
              onGoToDashboard={() => setLatestAdmission(null)}
              onNewAdmission={() => {
                setLatestAdmission(null);
                navigate("/admissions");
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f0f4f9] selection:bg-[#0b63e5]/20">
        <StudentDashboardView
          student={currentStudent}
          applications={studentApplications}
          onStartNewAdmission={() => navigate(`/admissions?prn=${currentStudent.prn}`)}
          onViewReceipt={(app) => setLatestAdmission(app)}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // Not logged in: Render the Parivattan Campus Portal Login & Registration
  return (
    <div className="student-portal-app font-sans min-h-screen bg-[#f3f6fc] flex flex-col justify-between overflow-x-hidden selection:bg-[#3b5bfd]/20">
      {/* Top Floating Clean Navigation */}
      <header className="px-4 sm:px-10 py-3 sm:py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <img
            src="/img/parivattanE.png"
            alt="Parivattan Mission Foundation"
            className="h-8 sm:h-10 w-auto rounded-lg transition group-hover:scale-105"
          />
          <div className="text-left">
            <span className="block text-slate-800 font-bold text-xs sm:text-base leading-tight tracking-tight">
              Parivattan Mission Foundation
            </span>
            <span className="block text-[#3b5bfd] text-[10px] sm:text-xs font-semibold">
              Student Academic & Admissions Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-700">
          <Link
            to="/"
            className="hover:text-[#3b5bfd] transition px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Back to Website</span>
          </Link>
          <Link
            to="/courses"
            className="hidden xs:inline-block hover:text-[#3b5bfd] transition px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            Courses
          </Link>
          <Link
            to="/admissions"
            className="bg-[#3b5bfd] hover:bg-[#2b4be8] text-white px-3 sm:px-4 py-1.5 rounded-lg transition shadow-xs text-xs sm:text-sm font-bold"
          >
            Admissions
          </Link>
        </div>
      </header>

      {/* Main Centered Login / Registration Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 w-full">
        <StudentAuthCard
          onSuccess={handleAuthSuccess}
          initialMode={searchParams.get("mode") === "register" ? "register" : "login"}
          prefilledIdentifier={prefilledIdentifier}
        />
      </main>

      {/* Minimal Bottom Footer without Admin Access Link */}
      <footer className="py-3 sm:py-4 px-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/50">
        <p>© 2026 Parivattan Mission Foundation. All rights reserved.</p>
      </footer>
    </div>
  );
}

