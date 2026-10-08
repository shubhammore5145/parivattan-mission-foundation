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
import Footer from "@/components/Footer";
import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import {
  getCurrentStudent,
  getStudentApplications,
  findStudentByPrnOrIdentifier,
  logoutStudent,
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
      setActiveTab("dashboard");
    } else {
      setCurrentStudentState(null);
      setStudentApplications([]);
      setActiveTab("auth");
    }
  }, [searchParams]);

  // Sync applications
  const refreshStudentApps = (student: StudentUser) => {
    const apps = getStudentApplications(student.id);
    setStudentApplications(apps);
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

  const handleLogout = () => {
    logoutStudent();
    setCurrentStudentState(null);
    setStudentApplications([]);
    setActiveTab("auth");
    toast.success("Logged out successfully.");
  };

  // If student is logged in, show the comprehensive Dashboard / Receipt View
  if (currentStudent && activeTab === "dashboard") {
    return (
      <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
        <Header />

        <main className="page-section pt-32 md:pt-36 pb-20">
          <div className="container mx-auto max-w-6xl px-4">
            {/* Top Bar for Logged In Student */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-[#e2e5dc] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#b5623b]/15 text-[#b5623b] flex items-center justify-center font-bold text-lg">
                  <GraduationCap size={26} />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-lg text-[#24312d]">
                    {currentStudent.name}
                  </h1>
                  <p className="text-xs text-[#65706a]">
                    Official PRN: <span className="font-mono font-bold text-[#b5623b]">{currentStudent.prn}</span> · Academic Portal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/admissions"
                  className="rounded-xl bg-[#b5623b] hover:bg-[#954b2c] text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <BookOpen size={14} />
                  <span>Course Admissions</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-700 px-3.5 py-2 text-xs font-semibold transition"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Conditional View: Receipt vs Dashboard */}
            {latestAdmission ? (
              <AdmissionReceiptView
                admission={latestAdmission}
                onGoToDashboard={() => setLatestAdmission(null)}
                onNewAdmission={() => {
                  setLatestAdmission(null);
                  navigate("/admissions");
                }}
              />
            ) : (
              <StudentDashboardView
                student={currentStudent}
                applications={studentApplications}
                onStartNewAdmission={() => navigate(`/admissions?prn=${currentStudent.prn}`)}
                onViewReceipt={(app) => setLatestAdmission(app)}
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Not logged in: Render the Parivattan Campus Portal Login & Registration
  return (
    <div className="min-h-screen relative w-full flex flex-col justify-between overflow-x-hidden bg-[#111a17]">
      {/* Full-bleed Educational Students & Library Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/img/students-education-bg.jpg')`,
        }}
      >
        {/* Deep dual gradient overlay ensuring crisp contrast and atmospheric educational visuals */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1411]/92 via-[#14201b]/82 to-[#0b120f]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1411]/90 via-transparent to-[#0d1411]/70" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Top Floating Transparent Navigation */}
      <header className="relative z-20 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-white/15 bg-black/30 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/img/parivattanE.png"
            alt="Parivattan Mission Foundation"
            className="h-9 sm:h-10 w-auto bg-white/95 rounded-lg p-1 shadow-md transition group-hover:scale-105"
          />
          <div className="hidden sm:block text-left">
            <span className="block text-white font-serif font-bold text-sm sm:text-base leading-tight tracking-wide drop-shadow-xs">
              Parivattan Mission Foundation
            </span>
            <span className="block text-amber-300 text-xs font-medium">
              Center for Education & Empowerment
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-white">
          <Link
            to="/"
            className="hover:text-amber-300 transition px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1.5"
          >
            <Home size={14} />
            <span className="hidden md:inline">Back to Website</span>
          </Link>
          <Link
            to="/courses"
            className="hover:text-amber-300 transition px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            Courses
          </Link>
          <Link
            to="/admissions"
            className="bg-[#b5623b] hover:bg-[#954b2c] text-white px-4 py-1.5 rounded-lg transition shadow-md"
          >
            Admissions
          </Link>
        </div>
      </header>

      {/* Main Fullscreen Split Hero Section */}
      <main className="relative z-20 container mx-auto px-6 sm:px-10 py-10 lg:py-16 flex-1 flex items-center">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 w-full items-center">
          {/* Left Column: High-Contrast Frosted Card with Educational Mission */}
          <div className="lg:col-span-7 text-white space-y-6 pt-2 lg:pt-0">
            <div className="rounded-3xl bg-[#0d1613]/85 border border-white/20 p-6 sm:p-9 backdrop-blur-md shadow-2xl space-y-5 max-w-2xl">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-300/35 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-300 mb-3.5 backdrop-blur-xs">
                  <BookOpen size={13} className="text-amber-300" />
                  <span>Student Academic & Admissions Portal 2026-27</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-[1.14] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                  Parivattan Mission Foundation
                </h1>
                <p className="text-xl sm:text-2xl font-serif text-[#ffd166] mt-2 font-semibold tracking-wide drop-shadow-sm">
                  Center for Education, Language & Global Careers
                </p>
              </div>

              {/* Inspiring Social Reformer Quote with high-contrast card */}
              <div className="border-l-4 border-[#b5623b] bg-black/60 p-4 sm:p-5 rounded-r-2xl border-y border-r border-white/15 space-y-2 shadow-inner">
                <p className="italic text-white text-sm sm:text-base md:text-lg leading-relaxed font-sans font-medium drop-shadow-xs">
                  "Cultivate your mind, that is the primary aim of human existence. Educate, Agitate, Organize."
                </p>
                <p className="text-xs sm:text-sm text-amber-300 font-bold tracking-wide">
                  — Dr. B. R. Ambedkar
                </p>
              </div>

              {/* Welcoming subtext with crystal-clear readability */}
              <p className="text-sm sm:text-base text-[#e2eae5] leading-relaxed drop-shadow-xs font-normal">
                Welcome to the official student portal of Parivattan Mission Foundation. Empowering ambitious youth with world-class foreign language education, overseas academic pathways, and practical industry skilling.
              </p>

              {/* Fast PRN Status Lookup Row */}
              <div className="pt-2 max-w-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchByPrn();
                  }}
                  className="flex items-center rounded-2xl bg-black/70 border border-white/30 p-2 backdrop-blur-md shadow-xl focus-within:border-amber-400/60 transition"
                >
                  <div className="flex-1 flex items-center pl-3 gap-2.5">
                    <Search size={16} className="text-amber-400/80" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter PRN (e.g. PMF2026-XXXX) or mobile..."
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#b5623b] hover:bg-[#954b2c] text-white px-4 py-2 text-xs font-bold transition shrink-0 cursor-pointer shadow-md"
                  >
                    Check PRN
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Login / Registration Card */}
          <div id="student-login-card" className="lg:col-span-5 flex justify-center lg:justify-end">
            <StudentAuthCard
              onSuccess={handleAuthSuccess}
              initialMode="login"
              prefilledIdentifier={prefilledIdentifier}
            />
          </div>
        </div>
      </main>

      {/* Bottom Footer Ribbon */}
      <footer className="relative z-20 px-6 py-4 text-center text-xs text-white/60 border-t border-white/10 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between container mx-auto">
        <p>© 2026-27 Parivattan Mission Foundation. All rights reserved.</p>
        <p className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>Student Support: +91 7820831901</span>
          <span>·</span>
          <span>contact@parivattan.org</span>
        </p>
      </footer>
    </div>
  );
}
