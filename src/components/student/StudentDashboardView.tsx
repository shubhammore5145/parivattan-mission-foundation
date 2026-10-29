import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Printer,
  FileCheck,
  Plus,
  LogOut,
  CheckCircle2,
  Building2,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  QrCode,
  Download,
  Share2,
  ShieldCheck,
  Layers,
  Award,
  Video,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bell,
  FileText,
  Eye,
  AlertCircle,
  X,
  Home,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  Globe,
  Laptop,
  BrainCircuit,
  Trophy,
  Globe2,
  Code2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import { COURSES_DATA } from "@/data/coursesData";
import { logoutStudent } from "@/lib/student-auth";
import { printElement } from "@/lib/printUtils";
import { UnderConstructionView } from "@/components/common/UnderConstructionView";
import {
  getStoredClassSchedule,
  ClassScheduleConfig,
} from "@/data/classScheduleData";

interface StudentDashboardViewProps {
  student: StudentUser;
  applications: StudentAdmissionRecord[];
  onStartNewAdmission: () => void;
  onViewReceipt: (admission: StudentAdmissionRecord) => void;
  onLogout: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  applications,
  onStartNewAdmission,
  onViewReceipt,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "home" | "courses" | "idcard" | "receipts" | "schedule" | "notifications" | "materials" | "quizzes"
  >("home");
  const [copiedPrn, setCopiedPrn] = useState(false);
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string; subtitle?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Class Schedule (Updated by Admin)
  const [scheduleConfig, setScheduleConfig] = useState<ClassScheduleConfig>(() =>
    getStoredClassSchedule()
  );

  useEffect(() => {
    const handleScheduleUpdate = (e: any) => {
      if (e.detail) {
        setScheduleConfig(e.detail);
      } else {
        setScheduleConfig(getStoredClassSchedule());
      }
    };
    window.addEventListener("pmf_schedule_updated", handleScheduleUpdate);
    return () => window.removeEventListener("pmf_schedule_updated", handleScheduleUpdate);
  }, []);

  // Interactive Mini Calendar state (Oct 2026 default)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 9, 25));
  const [selectedDay, setSelectedDay] = useState<number>(25);

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const startDay = (new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() + 6) % 7; // Monday = 0

  // Interactive Student Tasks
  const [tasks, setTasks] = useState([
    { id: "1", title: "Verify PRN & Enrollment Status", color: "bg-amber-400", done: true, subTab: "home" as const },
    { id: "2", title: "Download Digital Student ID Card", color: "bg-emerald-500", done: false, subTab: "idcard" as const },
    { id: "3", title: "Check Batch Class Timetable", color: "bg-blue-500", done: false, subTab: "schedule" as const },
    { id: "4", title: "Review Official Notice & Circulars", color: "bg-rose-500", done: false, subTab: "notifications" as const },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleCopyPrn = () => {
    navigator.clipboard.writeText(student.prn);
    setCopiedPrn(true);
    toast.success(`PRN ${student.prn} copied to clipboard!`);
    setTimeout(() => setCopiedPrn(false), 2500);
  };

  const handlePrintIdCard = () => {
    printElement(
      "printable-student-id-card",
      `Student ID Card - ${student.name} (${student.prn})`
    );
  };

  // Helper to find course syllabus/details from COURSES_DATA
  const getCourseDetails = (app: StudentAdmissionRecord) => {
    return COURSES_DATA.find(
      (c) =>
        c.id === app.courseId ||
        c.code.toLowerCase() === (app.courseCode || "").toLowerCase() ||
        c.title.toLowerCase().includes(app.courseTitle.toLowerCase()) ||
        app.courseTitle.toLowerCase().includes(c.title.toLowerCase())
    );
  };

  return (
    <div className="student-portal-app min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col lg:flex-row selection:bg-[#0b63e5]/20 font-sans w-full relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. LEFT COBALT SIDEBAR (#0b63e5) */}
      <aside
        className={`student-portal-sidebar fixed inset-y-0 left-0 z-50 w-72 bg-[#0b63e5] text-white flex flex-col justify-between p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shadow-xl lg:shadow-none shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <GraduationCap size={22} className="text-slate-950" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight font-sans">
                  PMF Campus
                </h1>
                <p className="text-[11px] text-white/75 font-medium tracking-wide font-sans mt-0.5">
                  Student Portal
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab("home");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "home"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <Home size={18} className={activeSubTab === "home" ? "text-[#0b63e5]" : "text-white/85"} />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("courses");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "courses"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BookOpen size={18} className={activeSubTab === "courses" ? "text-[#0b63e5]" : "text-white/85"} />
                <span>My Courses</span>
              </div>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                activeSubTab === "courses"
                  ? "bg-[#0b63e5] text-white"
                  : "bg-amber-400 text-slate-950"
              }`}>
                {applications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("receipts");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "receipts"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <Printer size={18} className={activeSubTab === "receipts" ? "text-[#0b63e5]" : "text-white/85"} />
              <span>Fee Receipts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("schedule");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "schedule"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <Clock size={18} className={activeSubTab === "schedule" ? "text-[#0b63e5]" : "text-white/85"} />
              <span>Class Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("materials");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "materials"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BookOpen size={18} className={activeSubTab === "materials" ? "text-[#0b63e5]" : "text-white/85"} />
                <span>Study Materials</span>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-md">
                Soon
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("quizzes");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "quizzes"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BrainCircuit size={18} className={activeSubTab === "quizzes" ? "text-[#0b63e5]" : "text-white/85"} />
                <span>Practice Quizzes</span>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-md">
                Soon
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("idcard");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "idcard"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <QrCode size={18} className={activeSubTab === "idcard" ? "text-[#0b63e5]" : "text-white/85"} />
              <span>Digital ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab("notifications");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === "notifications"
                  ? "bg-white text-[#0b63e5] font-bold shadow-md shadow-blue-950/25"
                  : "text-white/85 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Bell size={18} className={activeSubTab === "notifications" ? "text-[#0b63e5]" : "text-white/85"} />
                <span>Notice & Circulars</span>
              </div>
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                2 PDFs
              </span>
            </button>

            <div className="pt-3 pb-1">
              <div className="h-px bg-white/15" />
            </div>

            <Link
              to={`/admissions?prn=${student.prn}`}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3.5">
                <Plus size={18} className="text-amber-300" />
                <span>Enroll in Course</span>
              </div>
              <ExternalLink size={13} className="text-white/60" />
            </Link>

            <Link
              to="/"
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3.5">
                <Globe size={18} className="text-white/80" />
                <span>Public Website</span>
              </div>
              <ExternalLink size={13} className="text-white/60" />
            </Link>

            <button
              id="student-signout-btn-sidebar"
              type="button"
              onClick={() => {
                logoutStudent();
                onLogout();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-rose-200 hover:text-white hover:bg-rose-500/20 transition cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <LogOut size={18} className="text-rose-300" />
                <span>Sign Out</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Session Progress Indicator */}
        <div className="pt-5 border-t border-white/15 space-y-3.5">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="text-white/90">Academic Session 2026-27</span>
              <span className="text-amber-300 font-bold">Term 2 of 3</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full w-2/3 shadow-xs" />
            </div>
          </div>

          <div className="bg-[#084db8]/90 backdrop-blur-xs p-3 rounded-2xl border border-white/20 flex items-center justify-between gap-2 shadow-xs">
            <div className="truncate min-w-0">
              <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">
                Permanent Reg. No (PRN)
              </span>
              <span className="font-mono text-xs font-extrabold text-amber-300 truncate block mt-0.5 tracking-wider">
                {student.prn}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyPrn}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
              title="Copy PRN"
              aria-label="Copy PRN"
            >
              {copiedPrn ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. CENTER MAIN WORKSPACE (#f8fafc) */}
      <main className="flex-1 bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-6 min-w-0 overflow-y-auto">
        {/* Top Header Row with Mobile Menu & Rounded Search Pill */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Rounded Search Bar ("What do you want to learn today?") */}
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn today?"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b63e5] focus:border-transparent shadow-xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Top User Status & Prominent Log Out Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab("notifications")}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center relative shadow-xs transition cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <div className="flex items-center gap-2 pl-1 pr-2.5 py-1 bg-white border border-slate-200 rounded-full shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#0b63e5] text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden md:inline-block max-w-[110px] truncate">
                {student.name}
              </span>
            </div>

            {/* Prominent High-Visibility Log Out Button */}
            <button
              id="student-signout-btn-header"
              type="button"
              onClick={async () => {
                await logoutStudent();
                onLogout();
              }}
              className="px-3 sm:px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/90 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              title="Log Out of Student Account"
            >
              <LogOut size={14} className="text-rose-600 shrink-0" />
              <span className="hidden sm:inline-block font-bold">Log Out</span>
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION PILLS (Top Bar for Fast Switching) */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
          {[
            { id: "home", label: "Dashboard Overview", icon: Home },
            { id: "courses", label: "My Courses & Syllabus", icon: BookOpen, count: applications.length },
            { id: "materials", label: "Study Materials", icon: FileText, badge: "Coming Soon" },
            { id: "schedule", label: "Class Timetable", icon: Clock },
            { id: "quizzes", label: "Practice Quizzes", icon: BrainCircuit, badge: "Coming Soon" },
            { id: "idcard", label: "Digital Student ID Card", icon: QrCode },
            { id: "receipts", label: "Fee Receipts & Slips", icon: Printer },
            { id: "notifications", label: "Official Circulars", icon: Bell, badge: "2 New" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#0b63e5] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white text-[#0b63e5]" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-amber-300 text-slate-900" : "bg-rose-500 text-white"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 0: HOME OVERVIEW (Visible ONLY when activeSubTab === 'home') ================= */}
        {activeSubTab === "home" && (
          <div className="space-y-6">
            {/* HERO CARD: "Your Profile" */}
            <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-4 max-w-lg z-10 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                  Your Profile
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
                  <span className="font-bold text-slate-900">Hi {student.name}</span>, You have completed{" "}
                  <span className="font-bold text-[#0b63e5]">70%</span> of your academic milestones. Keep learning with Parivattan Mission Foundation!
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyPrn}
                    className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 text-xs sm:text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    {copiedPrn ? (
                      <>
                        <Check size={16} className="text-emerald-800" />
                        <span>PRN Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy PRN: {student.prn}</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/admissions?prn=${student.prn}`}
                    className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 text-xs sm:text-sm transition flex items-center gap-1.5"
                  >
                    <Plus size={16} />
                    <span>+ Enroll in Course</span>
                  </Link>
                </div>
              </div>

              {/* Student Study Vector Illustration */}
              <div className="shrink-0 flex items-center justify-center z-10">
                <svg
                  className="w-56 h-44 sm:w-64 sm:h-48 drop-shadow-xs"
                  viewBox="0 0 260 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse cx="130" cy="180" rx="95" ry="16" fill="#f1f5f9" />
                  <circle cx="175" cy="45" r="16" fill="#fef3c7" />
                  <path
                    d="M175 34 C169 34 164 38 164 44 C164 48 167 52 170 54 L170 58 L180 58 L180 54 C183 52 186 48 186 44 C186 38 181 34 175 34 Z"
                    fill="#f59e0b"
                  />
                  <line x1="175" y1="26" x2="175" y2="21" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="187" y1="31" x2="191" y2="27" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="163" y1="31" x2="159" y2="27" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="205" y="55" width="40" height="30" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="211" y1="64" x2="238" y2="64" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="211" y1="70" x2="232" y2="70" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="211" y1="76" x2="224" y2="76" stroke="#0b63e5" strokeWidth="2" strokeLinecap="round" />
                  <path d="M100 175 C100 135 120 120 145 120 C170 120 190 135 190 175 Z" fill="#0b63e5" />
                  <path d="M136 120 L145 132 L154 120 Z" fill="#ffffff" />
                  <rect x="140" y="105" width="10" height="18" fill="#fed7aa" rx="3" />
                  <circle cx="145" cy="92" r="18" fill="#fed7aa" />
                  <path
                    d="M127 88 C127 75 137 68 145 68 C155 68 165 74 164 88 C160 84 153 82 145 82 C137 82 131 85 127 88 Z"
                    fill="#1e293b"
                  />
                  <circle cx="140" cy="91" r="2.5" fill="#1e293b" />
                  <circle cx="150" cy="91" r="2.5" fill="#1e293b" />
                  <path d="M141 99 Q145 103 149 99" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M120 135 L95 105" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="95" cy="105" r="4" fill="#fed7aa" />
                  <rect x="45" y="172" width="170" height="8" rx="4" fill="#64748b" />
                  <rect x="70" y="132" width="55" height="38" rx="4" fill="#334155" />
                  <rect x="75" y="136" width="45" height="28" rx="2" fill="#38bdf8" opacity="0.95" />
                  <line x1="79" y1="142" x2="100" y2="142" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="79" y1="148" x2="114" y2="148" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="79" y1="154" x2="94" y2="154" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <path d="M65 170 L130 170 L125 173 L70 173 Z" fill="#94a3b8" />
                </svg>
              </div>
            </div>

            {/* SECTION: "Your Assignments" -> "Your Enrolled Courses" (3 Cards Row) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 font-sans">
                  Your Enrolled Courses
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("courses")}
                  className="text-xs font-bold text-[#0b63e5] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <span>View All Courses</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {applications.length > 0 ? (
                  applications.slice(0, 3).map((app, idx) => (
                    <div
                      key={app.id || idx}
                      onClick={() => {
                        setActiveSubTab("courses");
                        setExpandedSyllabusId(app.id);
                      }}
                      className="rounded-3xl bg-white border border-slate-100 p-5 shadow-xs hover:shadow-md transition cursor-pointer text-center flex flex-col justify-between group"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#0b63e5] transition truncate font-sans">
                          {app.courseTitle}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium font-sans">
                          {app.batchPreference || "Morning Batch (10:00 AM)"}
                        </p>
                      </div>

                      {/* Circular Icon in Middle */}
                      <div className="my-4 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0b63e5] flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                          {idx % 3 === 0 ? <BookOpen size={20} /> : idx % 3 === 1 ? <Laptop size={20} /> : <GraduationCap size={20} />}
                        </div>
                      </div>

                      {/* Progress / Status Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 font-sans">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Active
                          </span>
                          <span className="text-[#0b63e5]">75%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#0b63e5] h-full rounded-full w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 rounded-3xl bg-white border border-dashed border-slate-200 p-8 text-center space-y-3">
                    <BookOpen size={32} className="mx-auto text-slate-400" />
                    <h4 className="font-bold text-slate-700 font-sans">No active course enrollments yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                      Browse Parivattan Mission Foundation's accredited courses and enroll today with your PRN.
                    </p>
                    <Link
                      to={`/admissions?prn=${student.prn}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0b63e5] text-white text-xs font-bold px-5 py-2.5 shadow-sm hover:bg-blue-700 transition"
                    >
                      <Plus size={15} />
                      <span>Explore & Enroll in Courses</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: "Lessons for you" -> "Student Services" (Amber & Coral Colored Cards) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 font-sans">
                  Student Services & Slips
                </h3>
                <span className="text-xs font-semibold text-slate-400 font-sans">Instant Access</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amber / Gold Card (Digital Student ID) */}
                <div
                  onClick={() => setActiveSubTab("idcard")}
                  className="rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 p-6 text-slate-950 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group overflow-hidden relative"
                >
                  <div className="space-y-1 z-10">
                    <h4 className="text-xl font-black tracking-tight text-slate-950 group-hover:translate-x-1 transition-transform font-sans">
                      Digital Student ID
                    </h4>
                    <p className="text-xs font-semibold text-amber-950/80 font-sans">
                      Instant Verification & Printable QR Card
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-slate-950 text-white px-3.5 py-1.5 rounded-full shadow-xs">
                        <QrCode size={13} />
                        <span>View & Print Card →</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center text-slate-900 border border-white/40 shadow-xs shrink-0 group-hover:scale-105 transition-transform z-10">
                    <QrCode size={32} />
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                </div>

                {/* Coral / Rose Red Card (Fee Receipts & Slips) */}
                <div
                  onClick={() => setActiveSubTab("receipts")}
                  className="rounded-3xl bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group overflow-hidden relative"
                >
                  <div className="space-y-1 z-10">
                    <h4 className="text-xl font-black tracking-tight text-white group-hover:translate-x-1 transition-transform font-sans">
                      Fee Receipts & Slips
                    </h4>
                    <p className="text-xs font-medium text-rose-100 font-sans">
                      Official Invoices & Payment History
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-white text-rose-700 px-3.5 py-1.5 rounded-full shadow-xs">
                        <Printer size={13} />
                        <span>Download Slips →</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0 group-hover:scale-105 transition-transform z-10">
                    <Printer size={32} />
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                </div>

                {/* Indigo Card (Study Materials & Notes Hub) */}
                <div
                  onClick={() => setActiveSubTab("materials")}
                  className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group overflow-hidden relative"
                >
                  <div className="space-y-1 z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      <span>Under Curation</span>
                    </div>
                    <h4 className="text-xl font-black tracking-tight text-white group-hover:translate-x-1 transition-transform font-sans">
                      Study Materials
                    </h4>
                    <p className="text-xs font-medium text-blue-100 font-sans">
                      JLPT Notes, German Cheatsheets & Solved Papers
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-white text-indigo-800 px-3.5 py-1.5 rounded-full shadow-xs">
                        <BookOpen size={13} />
                        <span>Preview Module →</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0 group-hover:scale-105 transition-transform z-10">
                    <BookOpen size={32} />
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                </div>

                {/* Purple / Violet Card (Interactive Practice Quizzes) */}
                <div
                  onClick={() => setActiveSubTab("quizzes")}
                  className="rounded-3xl bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group overflow-hidden relative"
                >
                  <div className="space-y-1 z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      <span>Under Active Engineering</span>
                    </div>
                    <h4 className="text-xl font-black tracking-tight text-white group-hover:translate-x-1 transition-transform font-sans">
                      Practice Quizzes
                    </h4>
                    <p className="text-xs font-medium text-violet-100 font-sans">
                      Japanese Kanji, German Drills & Python Quizzes
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-white text-violet-800 px-3.5 py-1.5 rounded-full shadow-xs">
                        <BrainCircuit size={13} />
                        <span>Explore Quizzes →</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0 group-hover:scale-105 transition-transform z-10">
                    <BrainCircuit size={32} />
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ================= TAB 1: ENROLLED COURSES ================= */}
      {activeSubTab === "courses" && (
        <div className="space-y-6">
          {/* Breadcrumb Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-sans">
                <span onClick={() => setActiveSubTab("home")} className="hover:text-[#0b63e5] cursor-pointer font-semibold">🏠 Home</span>
                <span>/</span>
                <span className="text-[#0b63e5] font-bold">My Courses & Syllabus</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-800">
                My Enrolled Courses & Academic Syllabus
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Confirmed course admissions, batch schedules, tuition receipts, and comprehensive curricula.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab("home")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs shrink-0 font-sans self-start sm:self-auto"
            >
              <ChevronLeft size={14} />
              <span>Back to Overview</span>
            </button>
          </div>
          {applications.length > 0 ? (
            <div className="space-y-5">
              {applications.map((app, index) => {
                const details = getCourseDetails(app);
                const isExpanded = expandedSyllabusId === app.id;

                return (
                  <div
                    key={app.id || index}
                    className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-7 shadow-sm transition hover:border-[#b5623b]/40"
                  >
                    {/* Header info */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-[#f1f3ed] pb-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-[#24312d] text-white px-2.5 py-0.5 text-xs font-mono font-bold">
                            {app.courseCode || "PMF-CRS"}
                          </span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Enrolled & Confirmed
                          </span>
                          <span className="text-xs text-[#65706a]">
                            App No: <strong className="font-mono text-[#24312d]">{app.applicationNo}</strong>
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d]">
                          {app.courseTitle}
                        </h3>
                        <p className="text-xs font-semibold text-[#b5623b]">
                          {app.school || "Parivattan Mission Institute"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onViewReceipt(app)}
                          className="rounded-xl border border-[#24312d] bg-white hover:bg-[#24312d] hover:text-white text-[#24312d] px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <Printer size={14} />
                          View Admission Slip
                        </button>
                      </div>
                    </div>

                    {/* Course Specifications Grid */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#fbfaf7] p-3.5 rounded-2xl border border-[#eceee7]">
                        <span className="text-[10px] uppercase font-bold text-[#65706a] block">
                          Batch & Timings
                        </span>
                        <div className="mt-1 font-semibold text-[#24312d] flex items-center gap-1.5">
                          <Clock size={14} className="text-[#b5623b]" />
                          <span>{app.batchPreference || "Morning Batch (08:00 AM - 10:00 AM)"}</span>
                        </div>
                      </div>

                      <div className="bg-[#fbfaf7] p-3.5 rounded-2xl border border-[#eceee7]">
                        <span className="text-[10px] uppercase font-bold text-[#65706a] block">
                          Learning Mode
                        </span>
                        <div className="mt-1 font-semibold text-[#24312d] flex items-center gap-1.5">
                          <Building2 size={14} className="text-[#b5623b]" />
                          <span>{app.learningMode || "Hybrid Classroom"}</span>
                        </div>
                      </div>

                      <div className="bg-[#fbfaf7] p-3.5 rounded-2xl border border-[#eceee7]">
                        <span className="text-[10px] uppercase font-bold text-[#65706a] block">
                          Tuition Fee Paid
                        </span>
                        <div className="mt-1 font-bold text-emerald-800 flex items-center gap-1.5">
                          <span>₹{(app.amount || 0).toLocaleString("en-IN")} (Completed)</span>
                        </div>
                      </div>

                      <div className="bg-[#fbfaf7] p-3.5 rounded-2xl border border-[#eceee7]">
                        <span className="text-[10px] uppercase font-bold text-[#65706a] block">
                          Enrollment Date
                        </span>
                        <div className="mt-1 font-semibold text-[#24312d]">
                          {new Date(app.paymentDate || app.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Venue & Classroom Details */}
                    <div className="mt-4 rounded-2xl bg-amber-500/10 border border-[#b5623b]/20 p-4 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[#24312d]">
                          <MapPin size={16} className="text-[#b5623b] shrink-0" />
                          <div>
                            <strong>Campus & Lab Venue: </strong>
                            <span>Parivattan Learning Center, Computer Lab & Lecture Hall, Pune / Live Online Lab</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-800 font-semibold flex items-center gap-1">
                            <Video size={14} /> Interactive Live Classroom Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Syllabus Section */}
                    {details && details.syllabus && details.syllabus.length > 0 && (
                      <div className="mt-4 border-t border-[#f1f3ed] pt-3">
                        <button
                          type="button"
                          onClick={() => setExpandedSyllabusId(isExpanded ? null : app.id)}
                          className="w-full flex items-center justify-between text-xs font-bold text-[#b5623b] hover:text-[#954b2c] py-1"
                        >
                          <span className="flex items-center gap-1.5">
                            <Layers size={14} />
                            Course Curriculum & Syllabus Modules
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 rounded-2xl bg-[#fbfaf7] p-4 border border-[#eceee7] space-y-2">
                            <p className="text-[11px] font-semibold text-[#65706a] mb-2">
                              Core curriculum modules and practical learning covered in this program:
                            </p>
                            <div className="space-y-1.5">
                              {details.syllabus.map((mod, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 text-xs text-[#24312d] bg-white p-2 rounded-xl border border-[#eef0e8]"
                                >
                                  <span className="rounded-full bg-[#b5623b]/10 text-[#b5623b] font-bold text-[10px] w-5 h-5 flex items-center justify-center shrink-0">
                                    {i + 1}
                                  </span>
                                  <span>{mod}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#d5d9cf] p-10 text-center bg-white">
              <BookOpen size={40} className="mx-auto text-[#65706a] mb-3" />
              <h3 className="font-serif text-xl font-bold text-[#24312d]">
                No Courses Enrolled Yet
              </h3>
              <p className="text-xs text-[#65706a] mt-1 max-w-md mx-auto">
                You have not enrolled in any course yet. Visit the Admissions page to choose your program and register using your PRN ({student.prn}).
              </p>
              <Link
                to={`/admissions?prn=${student.prn}`}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#b5623b] text-white px-6 py-2.5 text-xs font-bold shadow hover:bg-[#954b2c] transition"
              >
                <span>+ Go to Admissions & Enroll with PRN</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: DIGITAL STUDENT ID CARD ================= */}
      {activeSubTab === "idcard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-sans">
                <span onClick={() => setActiveSubTab("home")} className="hover:text-[#0b63e5] cursor-pointer font-semibold">🏠 Home</span>
                <span>/</span>
                <span className="text-[#0b63e5] font-bold">Digital Student ID Card</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-800">
                Official Digital Student Identity Card
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                This digital ID is valid for classroom verification, lab attendance, and official examinations.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab("home")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs font-sans"
              >
                <ChevronLeft size={14} />
                <span>Back to Overview</span>
              </button>
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="rounded-xl bg-[#0b63e5] hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-xs font-sans cursor-pointer"
              >
                <Printer size={14} />
                <span>Print / Save ID Card (PDF)</span>
              </button>
            </div>
          </div>

          {/* Printable Identity Card Design */}
          <div id="printable-student-id-card" className="max-w-md mx-auto rounded-3xl border-2 border-[#24312d] bg-white p-6 shadow-xl relative overflow-hidden text-[#24312d]">
            {/* Card Header Strip */}
            <div className="bg-[#24312d] text-white -mx-6 -mt-6 p-4 text-center border-b-2 border-[#b5623b]">
              <div className="flex items-center justify-between px-2">
                <img
                  src="/img/parivattanE.png"
                  alt="Parivattan Logo"
                  className="h-9 w-auto object-contain rounded bg-white/10 p-0.5"
                />
                <div className="text-center flex-1">
                  <h4 className="font-serif text-sm font-bold tracking-wide uppercase">
                    Parivattan Mission Foundation
                  </h4>
                  <p className="text-[10px] text-[#e5a37f] font-sans">
                    Student Identity Card · Academic Session 2026-27
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Photo & Basic Details */}
            <div className="mt-5 flex gap-4 items-start">
              <div className="w-24 h-28 rounded-2xl border-2 border-[#b5623b] bg-[#fbfaf7] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#b5623b]/10 flex flex-col items-center justify-center text-[#b5623b]">
                    <User size={36} />
                    <span className="text-[9px] font-bold mt-1">PMF ID</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs flex-1">
                <span className="text-[10px] font-bold text-[#65706a] uppercase">Student Name:</span>
                <h3 className="font-bold text-base text-[#24312d] leading-tight">
                  {student.name}
                </h3>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-[#65706a] uppercase block">
                    Permanent Reg No. (PRN):
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#b5623b] bg-[#b5623b]/10 px-2 py-0.5 rounded border border-[#b5623b]/30 inline-block">
                    {student.prn}
                  </span>
                </div>

                <div className="text-[11px] text-[#525f59] pt-1">
                  <span>Mobile: <strong>{student.phone}</strong></span>
                </div>
              </div>
            </div>

            {/* Course & Session info */}
            <div className="mt-4 rounded-xl bg-[#fbfaf7] p-3 border border-[#e2e5dc] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#65706a]">Enrolled Program:</span>
                <strong className="text-[#24312d] text-right truncate max-w-[200px]">
                  {applications.length > 0 ? applications[0].courseTitle : "Enrolled via Admissions"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">Academic Session:</span>
                <strong className="text-[#24312d]">2026-2027</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">Status:</span>
                <span className="font-bold text-emerald-700">✓ Verified & Authorized</span>
              </div>
            </div>

            {/* Barcode & Seal Strip */}
            <div className="mt-4 pt-3 border-t border-[#e2e5dc] flex items-center justify-between text-[10px] text-[#65706a]">
              <div>
                <span className="font-mono font-bold tracking-widest text-[#24312d] text-xs block">
                  *{student.prn}*
                </span>
                <span>Authorized Digital Identification</span>
              </div>
              <div className="text-center">
                <ShieldCheck size={20} className="text-[#b5623b] mx-auto" />
                <span className="text-[9px] font-bold text-[#24312d]">Official Stamp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: FEES & RECEIPTS ================= */}
      {activeSubTab === "receipts" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-sans">
                <span onClick={() => setActiveSubTab("home")} className="hover:text-[#0b63e5] cursor-pointer font-semibold">🏠 Home</span>
                <span>/</span>
                <span className="text-[#0b63e5] font-bold">Fee Receipts & Slips</span>
              </div>
              <h2 className="font-bold text-xl sm:text-2xl font-sans text-slate-800">
                Tuition Fees & Official Receipts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                All official digital receipts and payment confirmations are available below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab("home")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs font-sans shrink-0 self-start sm:self-auto"
            >
              <ChevronLeft size={14} />
              <span>Back to Overview</span>
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#eef0e8] px-2 py-0.5 text-xs font-mono font-bold text-[#24312d]">
                        {app.courseCode}
                      </span>
                      <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Payment Completed
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#24312d]">{app.courseTitle}</h4>
                    <p className="text-xs text-[#65706a]">
                      Slip No: <strong className="font-mono text-[#24312d]">{app.applicationNo}</strong> · Txn:{" "}
                      <span className="font-mono">{app.paymentId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#65706a] uppercase block">Amount</span>
                      <span className="font-bold text-base text-[#24312d]">
                        ₹{(app.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewReceipt(app)}
                      className="rounded-xl bg-white border border-[#24312d] hover:bg-[#24312d] hover:text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer size={13} />
                      View Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#65706a] py-6 text-center">
              No fee receipts available yet.
            </p>
          )}
        </div>
      )}

      {/* ================= TAB 4: SCHEDULE & TIMETABLE ================= */}
      {activeSubTab === "schedule" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-sans">
                <span onClick={() => setActiveSubTab("home")} className="hover:text-[#0b63e5] cursor-pointer font-semibold">🏠 Home</span>
                <span>/</span>
                <span className="text-[#0b63e5] font-bold">Class Schedule</span>
              </div>
              <h2 className="font-bold text-xl sm:text-2xl font-sans text-slate-800">
                Class Schedule & Batch Guidelines
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Parivattan Mission Foundation Academic Session {scheduleConfig.academicSession} Class Timetable
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab("home")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs font-sans shrink-0 self-start sm:self-auto"
            >
              <ChevronLeft size={14} />
              <span>Back to Overview</span>
            </button>
          </div>

          {/* Active Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {scheduleConfig.batches
              .filter((b) => b.isActive)
              .map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#b5623b] flex items-center gap-1.5">
                        <Clock size={16} /> {batch.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {batch.batchType}
                      </span>
                    </div>

                    <p className="text-[#525f59]">
                      <strong>Hours:</strong> {batch.hours} ({batch.days})
                    </p>

                    <p className="text-[#525f59]">
                      <strong>Venue:</strong> {batch.venue}
                    </p>

                    {batch.meetingUrl && (
                      <p className="text-[#525f59] flex items-center gap-2 pt-0.5">
                        <strong>Virtual Room:</strong>
                        <a
                          href={batch.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <Video size={13} />
                          <span>Join Live Classroom</span>
                          <ExternalLink size={12} />
                        </a>
                      </p>
                    )}

                    {batch.courseTags && batch.courseTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {batch.courseTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {batch.notes && (
                    <p className="text-[#65706a] text-[11px] pt-2 border-t border-[#e8ece3]">
                      {batch.notes}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Academic Policies & Guidelines */}
          {scheduleConfig.guidelines.map((guide) => (
            <div
              key={guide.id}
              className={`rounded-2xl p-4 text-xs space-y-1 ${
                guide.isImportant
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : "bg-[#fbfaf7] border border-[#e2e5dc] text-slate-700"
              }`}
            >
              <h5 className="font-bold">✓ {guide.title}:</h5>
              <p className="text-[11px] leading-relaxed">{guide.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 5: NOTIFICATIONS & CIRCULARS (PDFS) ================= */}
      {activeSubTab === "notifications" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/20 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-sans">
                  <span onClick={() => setActiveSubTab("home")} className="hover:text-[#0b63e5] cursor-pointer font-semibold">🏠 Home</span>
                  <span>/</span>
                  <span className="text-[#0b63e5] font-bold">Notices & Circulars</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-bold font-sans">
                  <Bell size={13} className="text-amber-600" />
                  <span>Academic Session 2026-27 · Official Student Notice Board</span>
                </div>
                <h2 className="font-bold text-xl sm:text-2xl font-sans text-slate-800 pt-1">
                  Notifications, Circulars & Study Guidelines
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-sans">
                  Official notices, course prospectuses, and academic circulars. Click below to preview or download the documents.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("home")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs font-sans"
                >
                  <ChevronLeft size={14} />
                  <span>Back to Overview</span>
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 text-xs font-bold shadow-2xs font-sans">
                  <FileCheck size={15} /> 2 Verified Documents
                </span>
              </div>
            </div>
          </div>

          {/* 2 PDF Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF 1: PFLS English.pdf */}
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/25 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform">
                    <FileText size={24} />
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 border border-emerald-200">
                    English Edition · 28.9 MB
                  </span>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-serif font-bold text-[#24312d] leading-snug">
                    PFLS Academic Prospectus & Guidelines
                  </h4>
                  <p className="text-xs font-semibold text-[#b5623b] mt-0.5">
                    Parivattan Foreign Language School (English Edition)
                  </p>
                </div>

                <p className="text-xs text-[#525f59] leading-relaxed">
                  Official comprehensive handbook detailing language courses, syllabus breakdown, admission procedures, examination structure, attendance criteria, and global career pathways.
                </p>

                {/* Metadata details */}
                <div className="rounded-2xl bg-[#fbfaf7] border border-[#eceee7] p-3 text-[11px] text-[#65706a] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span>Document Authority:</span>
                    <strong className="text-[#24312d]">Academic Directorate, PMF</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Format:</span>
                    <strong className="text-emerald-700 font-mono">PDF Document (.pdf)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Size:</span>
                    <span className="text-[#24312d] font-medium font-mono">28.9 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Academic Cycle:</span>
                    <span className="text-[#24312d] font-medium">Session 2026-27</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-[#f1f3ed] flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPdf({
                      url: "/docs/PFLS-English.pdf",
                      title: "PFLS Academic Prospectus & Guidelines",
                      subtitle: "English Edition · Session 2026-27",
                    })
                  }
                  className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Quick Preview</span>
                </button>

                <a
                  href="/docs/PFLS-English.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 py-2.5 px-3 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  title="Open PDF in new browser tab"
                >
                  <ExternalLink size={14} />
                  <span>Open Tab</span>
                </a>

                <a
                  href="/docs/PFLS-English.pdf"
                  download="PFLS-English.pdf"
                  className="rounded-xl bg-[#b5623b] hover:bg-[#974a27] text-white py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* PDF 2: PFLS Marathi.pdf */}
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/25 text-amber-800 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform">
                    <FileText size={24} />
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold px-3 py-1 border border-amber-200">
                    Regional Edition · 25.1 MB
                  </span>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-serif font-bold text-[#24312d] leading-snug">
                    PFLS Course Prospectus & Information
                  </h4>
                  <p className="text-xs font-semibold text-[#b5623b] mt-0.5">
                    Parivattan Foreign Language School (Marathi Edition)
                  </p>
                </div>

                <p className="text-xs text-[#525f59] leading-relaxed">
                  Official information handbook for students covering course curricula, fee structure, scholarship details, examination regulations, and student support services.
                </p>

                {/* Metadata details */}
                <div className="rounded-2xl bg-[#fbfaf7] border border-[#eceee7] p-3 text-[11px] text-[#65706a] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span>Document Authority:</span>
                    <strong className="text-[#24312d]">Board of Studies, PMF</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Format:</span>
                    <strong className="text-amber-800 font-mono">PDF Document (.pdf)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Size:</span>
                    <span className="text-[#24312d] font-medium font-mono">25.1 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Eligibility:</span>
                    <span className="text-[#24312d] font-medium">All Registered Students</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-[#f1f3ed] flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPdf({
                      url: "/docs/PFLS-Marathi.pdf",
                      title: "PFLS Course Prospectus & Information",
                      subtitle: "Marathi Edition · Session 2026-27",
                    })
                  }
                  className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Quick Preview</span>
                </button>

                <a
                  href="/docs/PFLS-Marathi.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 py-2.5 px-3 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  title="Open PDF in new browser tab"
                >
                  <ExternalLink size={14} />
                  <span>Open Tab</span>
                </a>

                <a
                  href="/docs/PFLS-Marathi.pdf"
                  download="PFLS-Marathi.pdf"
                  className="rounded-xl bg-[#b5623b] hover:bg-[#974a27] text-white py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>

          {/* Helpdesk Note */}
          <div className="rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-xs text-[#525f59] flex items-start gap-3">
            <AlertCircle size={18} className="text-[#b5623b] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#24312d]">
                Student Inquiries & Technical Support:
              </p>
              <p className="text-[11px] text-[#65706a]">
                All circulars published on this portal are official documents of the Parivattan Mission Foundation. If you have any questions or experience difficulties downloading these files, please contact the student helpline at <strong>+91 7820831901</strong> or email <strong>contact@parivattan.org</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: STUDY MATERIALS & NOTES ================= */}
      {activeSubTab === "materials" && (
        <div className="space-y-6">
          <UnderConstructionView
            pageTitle="Study Materials & Notes Hub"
            moduleBadge="Under Active Curation • Academic Module 1"
            headline="Study Materials & Question Paper Hub"
            description="We are actively compiling official handouts, JLPT/Goethe study guides, coding lab sheets, and verified mock exam papers for all Parivattan students."
            progressPercent={78}
            expectedDate="Upcoming Term (2026)"
            features={[
              {
                title: "Japanese (JLPT N5, N4 & N3) Kanji & Grammar Notes",
                description:
                  "Comprehensive Kanji stroke orders, vocabulary lists, particle charts, and reading passages designed for JLPT success.",
                icon: Globe2,
                tag: "JLPT Prep",
              },
              {
                title: "German (Goethe-Zertifikat A1 & A2) Grammar & Audio Drills",
                description:
                  "Case tables (Nominativ, Akkusativ, Dativ), modal verbs, sentence construction formulas, and listening dialog scripts.",
                icon: BookOpen,
                tag: "German Fluency",
              },
              {
                title: "Python & Full-Stack Web Development Cheat Sheets",
                description:
                  "Clean, visual syntax guides for Python, JavaScript, HTML/CSS, React, SQL, and practical problem-solving assignments.",
                icon: Code2,
                tag: "Tech School",
              },
              {
                title: "Previous Years' Model Exam Papers & Answer Keys",
                description:
                  "Solved question banks and mock question sets for foreign languages, civil services, and technical aptitude tests.",
                icon: FileText,
                tag: "Question Banks",
              },
            ]}
            embeddedInDashboard={true}
            primaryAction={{
              label: "Back to Overview",
              to: "#",
              onClick: () => setActiveSubTab("home"),
            }}
            secondaryAction={{ label: "Open Fullscreen Page", to: "/study-materials" }}
          />
        </div>
      )}

      {/* ================= TAB 7: PRACTICE QUIZZES & MOCKS ================= */}
      {activeSubTab === "quizzes" && (
        <div className="space-y-6">
          <UnderConstructionView
            pageTitle="Interactive Practice Quizzes"
            moduleBadge="Under Active Engineering • Interactive Assessment"
            headline="Interactive Practice Quizzes & Mock Tests"
            description="Self-paced assessment drills for Japanese (JLPT), German (Goethe), and Python programming with instant scoring and detailed answers."
            progressPercent={65}
            expectedDate="Upcoming Term (2026)"
            features={[
              {
                title: "JLPT N5 & N4 Daily Kanji & Vocabulary Drills",
                description:
                  "Fast-paced 10-question flash drills testing Hiragana, Katakana, Kanji readings, and contextual vocabulary with immediate feedback.",
                icon: Globe2,
                tag: "JLPT Japanese",
              },
              {
                title: "Goethe-Zertifikat German A1 & A2 Grammar Quizzes",
                description:
                  "Interactive fill-in-the-blanks, case endings (der/die/das), verb conjugations, and prepositions practice tests.",
                icon: BrainCircuit,
                tag: "German Drills",
              },
              {
                title: "Python Programming Output & Debugging Challenges",
                description:
                  "Test your code reading and logical debugging skills with real code snippets, loop challenges, and data structure questions.",
                icon: Code2,
                tag: "Python & Coding",
              },
              {
                title: "Instant Scorecards, Explanations & Leaderboards",
                description:
                  "Detailed step-by-step solutions for every question, time spent analytics, and motivational milestone badges.",
                icon: Trophy,
                tag: "Analytics & Badges",
              },
            ]}
            embeddedInDashboard={true}
            primaryAction={{
              label: "Back to Overview",
              to: "#",
              onClick: () => setActiveSubTab("home"),
            }}
            secondaryAction={{ label: "Open Fullscreen Page", to: "/quizzes" }}
          />
        </div>
      )}
      </main>

      {/* 3. RIGHT PANEL (White #ffffff, calendar + tasks + support) */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200/80 bg-white p-5 sm:p-6 space-y-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Top User Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab("notifications")}
                className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center relative border border-slate-200/60 transition cursor-pointer"
                title="Notifications & Circulars"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-[#0b63e5] text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{student.name}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Online</p>
                </div>
              </div>
            </div>

            <button
              id="student-signout-btn-desktop"
              type="button"
              onClick={async () => {
                await logoutStudent();
                onLogout();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/90 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
              title="Log Out of Student Account"
            >
              <LogOut size={13} className="text-rose-600 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Interactive Mini Calendar Widget (High-Contrast & Beautifully Visible) */}
          <div className="student-calendar-widget bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-4.5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={prevMonth}
                className="calendar-nav-btn w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="calendar-month-label text-sm font-extrabold text-slate-900 tracking-tight">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="calendar-nav-btn w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekdays Row: M T W TH F SA SU */}
            <div className="calendar-weekday grid grid-cols-7 text-center text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>TH</span>
              <span>F</span>
              <span>SA</span>
              <span>SU</span>
            </div>

            {/* Days Grid with Crisp High-Contrast Numbers */}
            <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8 w-8 mx-auto" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = selectedDay === dayNum;
                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    style={
                      isSelected
                        ? { backgroundColor: "#0b63e5", color: "#ffffff" }
                        : { color: "#0f172a" }
                    }
                    className={`calendar-day-btn h-8 w-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? "is-active-day bg-[#0b63e5] text-white font-extrabold shadow-md shadow-[#0b63e5]/30 scale-105"
                        : "text-slate-900 hover:bg-slate-100 hover:text-[#0b63e5]"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* "Your Tasks Today" Section (Colored Dots + Checklist) */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800">
              Your Tasks Today
            </h4>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    toggleTask(task.id);
                    setActiveSubTab(task.subTab);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl transition cursor-pointer ${
                    task.done ? "bg-slate-50/80 text-slate-400" : "hover:bg-slate-50 text-slate-800 font-medium"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${task.color} shrink-0`} />
                  <span className={`text-xs flex-1 truncate ${task.done ? "line-through text-slate-400" : "text-slate-800 font-semibold"}`}>
                    {task.title}
                  </span>
                  {task.done && <Check size={13} className="text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>

            <Link
              to={`/admissions?prn=${student.prn}`}
              className="w-full py-2.5 px-4 rounded-full border border-[#0b63e5] text-[#0b63e5] hover:bg-blue-50 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Plus size={14} />
              <span>+ Enroll in New Course</span>
            </Link>
          </div>
        </div>

        {/* Student Support & Helpline Card (Mockup "Refer a friend" location) */}
        <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-3xl text-center space-y-2 mt-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Phone size={18} />
          </div>
          <div>
            <h5 className="font-bold text-xs text-slate-800">Need Help or Guidance?</h5>
            <p className="text-[11px] text-slate-500">Parivattan Student Support Desk</p>
          </div>
          <a
            href="tel:+917820831901"
            className="block text-xs font-mono font-bold text-[#0b63e5] hover:underline"
          >
            +91 7820831901
          </a>
        </div>
      </aside>

      {/* PDF Modal Viewer */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#24312d] to-[#151e1b] text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-amber-400" />
                </div>
                <div className="truncate">
                  <h4 className="font-serif font-bold text-base truncate">{previewPdf.title}</h4>
                  {previewPdf.subtitle && (
                    <p className="text-xs text-amber-300 truncate">{previewPdf.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewPdf.url}
                  download
                  className="rounded-xl bg-[#0b63e5] hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPdf(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF / iFrame */}
            <div className="flex-1 bg-gray-100 p-2 sm:p-4 overflow-hidden">
              <iframe
                src={previewPdf.url}
                title={previewPdf.title}
                className="w-full h-full rounded-2xl border border-gray-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
