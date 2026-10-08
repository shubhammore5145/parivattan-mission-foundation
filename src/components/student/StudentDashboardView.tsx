import React, { useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import { COURSES_DATA } from "@/data/coursesData";
import { logoutStudent } from "@/lib/student-auth";

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
  const [activeSubTab, setActiveSubTab] = useState<"courses" | "idcard" | "receipts" | "schedule">("courses");
  const [copiedPrn, setCopiedPrn] = useState(false);
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

  const handleCopyPrn = () => {
    navigator.clipboard.writeText(student.prn);
    setCopiedPrn(true);
    toast.success(`PRN ${student.prn} copied to clipboard!`);
    setTimeout(() => setCopiedPrn(false), 2500);
  };

  const handlePrintIdCard = () => {
    window.print();
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Student Profile & PRN Master Card */}
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#b5623b]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#eef0e8] relative">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#b5623b] to-[#954b2c] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-md">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                student.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#24312d]">
                  {student.name}
                </h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-0.5 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active & Verified Student
                </span>
              </div>

              {/* High-visibility PRN Number Block */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#65706a]">
                  Permanent Registration Number (PRN):
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#b5623b]/10 px-3 py-1 font-mono text-base font-extrabold text-[#b5623b] border border-[#b5623b]/30">
                  {student.prn}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrn}
                  className="rounded-lg border border-[#e2e5dc] bg-white px-2.5 py-1 text-xs font-semibold text-[#525f59] hover:bg-[#fbfaf7] hover:text-[#b5623b] transition flex items-center gap-1 shadow-2xs"
                  title="Copy PRN"
                >
                  {copiedPrn ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy PRN</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-[#65706a] mt-1">
                Academic Session 2026-27 · Certification & Examination Eligible
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/admissions?prn=${student.prn}`}
              className="rounded-2xl bg-[#b5623b] hover:bg-[#974a27] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              Enroll in Course (Admissions)
            </Link>
            <button
              type="button"
              onClick={() => {
                logoutStudent();
                onLogout();
              }}
              className="rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2.5 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Student Metadata Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#525f59]">
          <div className="flex items-center gap-2.5 bg-[#fbfaf7] p-3 rounded-2xl border border-[#eceee7]">
            <Mail size={16} className="text-[#b5623b] shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-[#65706a] block">Email Address</span>
              <span className="font-semibold text-[#24312d] truncate block">{student.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-[#fbfaf7] p-3 rounded-2xl border border-[#eceee7]">
            <Phone size={16} className="text-[#b5623b] shrink-0" />
            <div>
              <span className="text-[10px] text-[#65706a] block">Registered Mobile</span>
              <span className="font-semibold text-[#24312d]">{student.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-[#fbfaf7] p-3 rounded-2xl border border-[#eceee7]">
            <Calendar size={16} className="text-[#b5623b] shrink-0" />
            <div>
              <span className="text-[10px] text-[#65706a] block">Registration Date</span>
              <span className="font-semibold text-[#24312d]">
                {new Date(student.registeredAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e5dc] pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("courses")}
          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === "courses"
              ? "bg-[#24312d] text-white shadow"
              : "bg-white text-[#65706a] hover:bg-[#fbfaf7] border border-[#e2e5dc]"
          }`}
        >
          <BookOpen size={16} />
          <span>My Enrolled Courses</span>
          <span className="rounded-full bg-[#b5623b] text-white text-[11px] px-2 py-0.2">
            {applications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("idcard")}
          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === "idcard"
              ? "bg-[#24312d] text-white shadow"
              : "bg-white text-[#65706a] hover:bg-[#fbfaf7] border border-[#e2e5dc]"
          }`}
        >
          <QrCode size={16} />
          <span>Digital Student ID Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("receipts")}
          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === "receipts"
              ? "bg-[#24312d] text-white shadow"
              : "bg-white text-[#65706a] hover:bg-[#fbfaf7] border border-[#e2e5dc]"
          }`}
        >
          <Printer size={16} />
          <span>Fee Receipts & Slips</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("schedule")}
          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === "schedule"
              ? "bg-[#24312d] text-white shadow"
              : "bg-white text-[#65706a] hover:bg-[#fbfaf7] border border-[#e2e5dc]"
          }`}
        >
          <Clock size={16} />
          <span>Class Schedule & Timings</span>
        </button>
      </div>

      {/* ================= TAB 1: ENROLLED COURSES ================= */}
      {activeSubTab === "courses" && (
        <div className="space-y-6">
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#24312d]">
                Official Digital Student Identity Card
              </h3>
              <p className="text-xs text-[#65706a]">
                This digital ID is valid for classroom verification, lab attendance, and official examinations.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrintIdCard}
              className="rounded-xl bg-[#24312d] hover:bg-[#b5623b] text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer size={14} />
              Print / Save ID Card (PDF)
            </button>
          </div>

          {/* Printable Identity Card Design */}
          <div className="max-w-md mx-auto rounded-3xl border-2 border-[#24312d] bg-white p-6 shadow-xl relative overflow-hidden text-[#24312d]">
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
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#f1f3ed] pb-4">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#24312d]">
                Tuition Fees & Official Receipts
              </h3>
              <p className="text-xs text-[#65706a]">
                All official digital receipts and payment confirmations are available below.
              </p>
            </div>
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
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-[#f1f3ed] pb-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#24312d]">
              Class Schedule & Batch Guidelines
            </h3>
            <p className="text-xs text-[#65706a]">
              Parivattan Mission Foundation Academic Session 2026-27 Class Timetable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc] space-y-3">
              <h4 className="font-bold text-sm text-[#b5623b] flex items-center gap-1.5">
                <Clock size={16} /> Morning Batches
              </h4>
              <p className="text-[#525f59]">
                <strong>Hours:</strong> 08:00 AM to 10:00 AM (Monday to Friday)
              </p>
              <p className="text-[#525f59]">
                <strong>Venue:</strong> Campus Computer Lab 2 & Live Interactive Online Room
              </p>
              <p className="text-[#65706a] text-[11px]">
                Students must log in or arrive at least 10 minutes before the scheduled lecture.
              </p>
            </div>

            <div className="rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc] space-y-3">
              <h4 className="font-bold text-sm text-[#b5623b] flex items-center gap-1.5">
                <Clock size={16} /> Evening Batches
              </h4>
              <p className="text-[#525f59]">
                <strong>Hours:</strong> 06:00 PM to 08:00 PM (Monday to Friday)
              </p>
              <p className="text-[#525f59]">
                <strong>Venue:</strong> Foreign Language School Wing & Virtual Classrooms
              </p>
              <p className="text-[#65706a] text-[11px]">
                Lecture recordings and course handouts are updated regularly on this portal.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-1">
            <h5 className="font-bold">✓ Mandatory Attendance Policy:</h5>
            <p className="text-[11px]">
              A minimum of 75% attendance is required to qualify for university and foundation accredited course completion certificates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
