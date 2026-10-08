import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/courses/CourseCard";
import CourseDetailModal from "@/components/courses/CourseDetailModal";
import {
  LANGUAGE_COURSES,
  LanguageCourse,
  CourseLevel,
  UPCOMING_COURSES,
} from "@/data/languageCoursesData";
import {
  Sparkles,
  ArrowRight,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Users,
  GraduationCap,
  Bell,
  BookOpen,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Award,
} from "lucide-react";

export default function CoursesPage() {
  const navigate = useNavigate();

  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "languages" | "upcoming"
  >("all");

  // Modal state for language course details
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<LanguageCourse | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Filtered Language Courses
  const filteredLanguages = useMemo(() => {
    if (selectedCategory === "upcoming") return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return LANGUAGE_COURSES;
    return LANGUAGE_COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nativeName.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.levelsSummary.toLowerCase().includes(q) ||
        c.levels.some((lvl) => lvl.level.toLowerCase().includes(q))
    );
  }, [searchQuery, selectedCategory]);

  // Filtered Upcoming Courses
  const filteredUpcoming = useMemo(() => {
    if (selectedCategory === "languages") return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return UPCOMING_COURSES;
    return UPCOMING_COURSES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.nativeName.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.targetExam.toLowerCase().includes(q)
    );
  }, [searchQuery, selectedCategory]);

  const totalResultsCount = filteredLanguages.length + filteredUpcoming.length;

  // Handlers
  const handleEnrollLanguage = (course: LanguageCourse, level: CourseLevel) => {
    navigate(`/admissions?lang=${course.id}&level=${level.id}`);
  };

  const handleOpenLanguageDetails = (course: LanguageCourse, level: CourseLevel) => {
    setSelectedCourse(course);
    setSelectedLevel(level);
    setModalOpen(true);
  };

  // FAQ Data
  const faqs = [
    {
      q: "Do I need any previous background in foreign languages to enroll?",
      a: "No prior experience is needed! All our foundation levels (Japanese N5, German A1, Basic English, and French A1) start from the absolute basics, including alphabet phonetics, greetings, basic vocabulary, and gradual sentence building.",
    },
    {
      q: "How does the 100% Refundable Security Deposit work?",
      a: "At Parivattan Mission Foundation, we believe in motivating serious learners. For applicable language levels, you pay a subsidized course fee plus a security deposit (e.g., ₹2,000). Upon maintaining required class attendance (75%+) and appearing for the official certification examination, your deposit is 100% refunded back to your account.",
    },
    {
      q: "Are classes conducted online, offline, or hybrid?",
      a: "We offer flexible hybrid options! You can join live online batches from anywhere, or attend in-person interactive labs at our Pune center. Recorded sessions and downloadable study materials are provided for all enrolled students.",
    },
    {
      q: "What certifications will I receive upon completing the course?",
      a: "You will receive an official Course Completion Certificate from Parivattan Mission Foundation, plus complete mock test drill and mentoring for international exams: JLPT (Japanese), Goethe-Zertifikat (German), DELF (French), and IELTS/Cambridge (English).",
    },
    {
      q: "What is the Student PRN and why do I need it before enrollment?",
      a: "A Permanent Registration Number (PRN) is your unique lifelong academic identification number (e.g. PMF2026-XXXX). It ensures your admission record, fee receipts, and digital certificates are tracked under your profile. You can register for a free PRN in 1 minute on the Student Portal.",
    },
    {
      q: "Can I prepare for overseas employment or study abroad through these courses?",
      a: "Yes! Our language programs are directly mapped to international examinations (JLPT for Japan, Goethe for Germany, DELF for France) and include resume preparation, interview etiquette, and overseas pathway counseling.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
      <Header />

      <main className="pt-28 md:pt-36 pb-24">
        {/* ========================================================= */}
        {/* HERO SECTION                                             */}
        {/* ========================================================= */}
        <section className="px-4 pb-10 pt-6 sm:pb-14 sm:pt-8 text-center">
          <div className="container mx-auto max-w-5xl">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/25 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b] shadow-2xs">
              <Sparkles size={14} />
              <span>Global Language Academy · 2026-27</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#24312d] leading-[1.12] tracking-tight">
              Master Global Languages. <br className="hidden sm:inline" />
              <span className="text-[#b5623b]">Unlock High-Demand Careers.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-4 text-base sm:text-lg text-[#65706a] max-w-3xl mx-auto leading-relaxed">
              Certified training in <strong>Japanese</strong>, <strong>German</strong>, <strong>English</strong>, and <strong>French</strong>, plus upcoming global programs in <strong>Russian</strong>, <strong>Chinese</strong>, and <strong>Spanish</strong>. Subsidized fees, live native coaching, and 100% refundable security deposits.
            </p>

            {/* 4 Stat Highlights */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4 shadow-2xs text-left transition hover:border-[#b5623b]/40">
                <div className="w-8 h-8 rounded-xl bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold mb-2">
                  <Globe size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-[#24312d]">4 Active</p>
                <p className="text-xs text-[#65706a] mt-0.5">JLPT, Goethe, DELF</p>
              </div>

              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4 shadow-2xs text-left transition hover:border-[#b5623b]/40">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold mb-2">
                  <Sparkles size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-[#24312d]">3 Upcoming</p>
                <p className="text-xs text-[#65706a] mt-0.5">Russian, Chinese, Spanish</p>
              </div>

              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4 shadow-2xs text-left transition hover:border-[#b5623b]/40">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold mb-2">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-emerald-700">100%</p>
                <p className="text-xs text-[#65706a] mt-0.5">Refundable Deposit*</p>
              </div>

              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-4 shadow-2xs text-left transition hover:border-[#b5623b]/40">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center font-bold mb-2">
                  <Users size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-[#24312d]">850+</p>
                <p className="text-xs text-[#65706a] mt-0.5">Enrolled Aspirants</p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/admissions"
                className="rounded-full bg-[#b5623b] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#954b2c] transition flex items-center gap-2 cursor-pointer"
              >
                <span>Direct Course Admissions</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/student"
                className="rounded-full border border-[#d5d9cf] bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#24312d] hover:bg-[#fbfaf7] hover:border-[#b5623b] transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <GraduationCap size={16} className="text-[#b5623b]" />
                <span>Student Portal (Register PRN)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW ADMISSIONS & LEARNING WORK (4-STEP PATHWAY)           */}
        {/* ========================================================= */}
        <section className="px-4 py-8 max-w-6xl mx-auto">
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-xs">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b5623b]">
                Clear, Transparent Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#24312d] mt-1">
                How Enrollment & Training Works
              </h2>
              <p className="text-xs sm:text-sm text-[#65706a] mt-1">
                From zero experience to international certification in 4 simple steps.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-left">
                <div className="w-8 h-8 rounded-full bg-[#24312d] text-white flex items-center justify-center font-bold text-xs mb-3">
                  1
                </div>
                <h3 className="font-serif font-bold text-base text-[#24312d]">
                  Pick Program & Level
                </h3>
                <p className="text-xs text-[#65706a] mt-1 leading-relaxed">
                  Choose your language (Japanese, German, etc.) and level (N5, A1, Beginner). Review schedule and seat intake.
                </p>
              </div>

              <div className="relative rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-left">
                <div className="w-8 h-8 rounded-full bg-[#b5623b] text-white flex items-center justify-center font-bold text-xs mb-3">
                  2
                </div>
                <h3 className="font-serif font-bold text-base text-[#24312d]">
                  Get Free Student PRN
                </h3>
                <p className="text-xs text-[#65706a] mt-1 leading-relaxed">
                  Register in 1 minute on our Student Portal to receive your Permanent Registration Number (PRN).
                </p>
              </div>

              <div className="relative rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-left">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-3">
                  3
                </div>
                <h3 className="font-serif font-bold text-base text-[#24312d]">
                  Secure Subsidized Seat
                </h3>
                <p className="text-xs text-[#65706a] mt-1 leading-relaxed">
                  Complete admission online with Razorpay. Security deposit is 100% refundable upon completing course requirements.
                </p>
              </div>

              <div className="relative rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-left">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                  4
                </div>
                <h3 className="font-serif font-bold text-base text-[#24312d]">
                  Native Coaching & Exam
                </h3>
                <p className="text-xs text-[#65706a] mt-1 leading-relaxed">
                  Attend interactive live sessions, receive full study kits, pass international exams, and access career mentoring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE SEARCH & CATEGORY FILTER BAR                  */}
        {/* ========================================================= */}
        <section className="px-4 pt-6 pb-4 max-w-6xl mx-auto sticky top-20 z-30">
          <div className="rounded-2xl border border-[#e2e5dc] bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative w-full md:w-80 flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 text-[#65706a] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, exams (JLPT, Python, Goethe)..."
                className="w-full rounded-xl bg-[#fbfaf7] border border-[#e2e5dc] pl-9 pr-8 py-2 text-xs sm:text-sm text-[#24312d] placeholder:text-[#88938d] focus:outline-none focus:ring-2 focus:ring-[#b5623b]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#24312d] text-white shadow-xs"
                    : "bg-[#fbfaf7] text-[#65706a] border border-[#e2e5dc] hover:text-[#24312d]"
                }`}
              >
                All Programs (7)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("languages")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === "languages"
                    ? "bg-[#b5623b] text-white shadow-xs"
                    : "bg-[#fbfaf7] text-[#65706a] border border-[#e2e5dc] hover:text-[#24312d]"
                }`}
              >
                Languages (4)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("upcoming")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === "upcoming"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-[#fbfaf7] text-[#65706a] border border-[#e2e5dc] hover:text-[#24312d]"
                }`}
              >
                Upcoming 2026 (3)
              </button>
            </div>
          </div>

          {/* Results summary indicator */}
          <div className="px-2 pt-2 flex items-center justify-between text-xs text-[#65706a]">
            <span>
              Showing <strong>{totalResultsCount}</strong> course programs
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#b5623b] hover:underline font-semibold"
              >
                Reset search
              </button>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 1: ACTIVE LANGUAGE COURSES                        */}
        {/* ========================================================= */}
        {filteredLanguages.length > 0 && (
          <section className="px-4 py-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2 border-b border-[#e2e5dc] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                  Certified International Curriculum
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#24312d] mt-0.5">
                  Foreign Language Programs
                </h2>
              </div>
              <p className="text-xs text-[#65706a] max-w-md">
                Select your preferred level to check duration, batch timing, and intake. Click "Enroll in Course" to begin admission.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {filteredLanguages.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnrollLanguage}
                  onOpenDetails={handleOpenLanguageDetails}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: UPCOMING 2026 GLOBAL PROGRAMS                  */}
        {/* ========================================================= */}
        {filteredUpcoming.length > 0 && (
          <section className="px-4 py-12 max-w-6xl mx-auto border-t border-[#e2e5dc] mt-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Sparkles size={14} className="text-amber-600" /> Expanding Our Global Curriculum
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-[#24312d]">
                Upcoming Global Programs (2026-27)
              </h2>
              <p className="text-xs sm:text-sm text-[#65706a] mt-2 max-w-2xl mx-auto leading-relaxed">
                Opening soon for international trade, aviation, engineering, and diplomatic career tracks in <strong>Russian</strong>, <strong>Chinese (Mandarin)</strong>, and <strong>Spanish</strong>.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {filteredUpcoming.map((upcoming) => (
                <div
                  key={upcoming.id}
                  className="relative flex flex-col justify-between rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    boxShadow: `0 10px 25px -5px ${upcoming.themeGlow}`,
                  }}
                >
                  <div>
                    {/* Top Bar with Flag and Coming Soon Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] text-3xl shadow-xs">
                        {upcoming.flag}
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-2xs"
                        style={{
                          backgroundColor: upcoming.badgeBg,
                          color: upcoming.badgeText,
                        }}
                      >
                        {upcoming.statusBadge}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                        {upcoming.nativeName}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-[#24312d] mt-0.5">
                        {upcoming.name}
                      </h3>
                      <p className="text-xs font-medium text-[#65706a]">
                        {upcoming.country}
                      </p>
                    </div>

                    <p className="text-xs text-[#48534e] leading-relaxed mb-4">
                      {upcoming.description}
                    </p>

                    {/* Program Badges */}
                    <div className="space-y-2 mb-4 rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#65706a]">Target Exam:</span>
                        <strong className="text-[#24312d] font-semibold text-right">{upcoming.targetExam}</strong>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#eef0e8] pt-1.5">
                        <span className="text-[#65706a]">Expected Duration:</span>
                        <strong className="text-[#24312d] font-semibold">{upcoming.expectedDuration}</strong>
                      </div>
                    </div>

                    {/* Highlights Bullet List */}
                    <div className="space-y-1.5 mb-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#65706a]">Curriculum Highlights:</p>
                      {upcoming.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#48534e]">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-[#f1f3ed]">
                    <Link
                      to="/contact"
                      className="w-full rounded-xl border border-[#d5d9cf] bg-white hover:bg-[#fbfaf7] hover:border-[#b5623b] text-[#24312d] hover:text-[#b5623b] py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                    >
                      <Bell size={13} className="text-[#b5623b]" />
                      <span>Pre-Register / Get Notified</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* CAREER & LANGUAGE COMPARISON MATRIX TABLE                 */}
        {/* ========================================================= */}
        <section className="px-4 py-12 max-w-6xl mx-auto border-t border-[#e2e5dc] mt-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              Strategic Career Planning
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#24312d] mt-1">
              Which Language Should You Choose?
            </h2>
            <p className="text-xs sm:text-sm text-[#65706a] mt-2">
              Compare target destinations, key job markets, and international certification benefits.
            </p>
          </div>

          <div className="rounded-3xl border border-[#e2e5dc] bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#fbfaf7] border-b border-[#e2e5dc] text-[11px] font-bold uppercase tracking-wider text-[#65706a]">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">Language</th>
                    <th className="py-4 px-4">Destination</th>
                    <th className="py-4 px-4">Global Job Sectors</th>
                    <th className="py-4 px-4">Target Exam</th>
                    <th className="py-4 px-4">Typical Starting Pay</th>
                    <th className="py-4 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0e8]">
                  <tr className="hover:bg-[#fbfaf7]/60 transition">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#24312d] flex items-center gap-2">
                      <span className="text-xl">🇯🇵</span>
                      <div>
                        <span>Japanese</span>
                        <span className="block text-[10px] font-normal text-[#65706a]">日本語 (JLPT)</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#48534e]">Japan, Tokyo, Osaka</td>
                    <td className="py-4 px-4 text-[#48534e]">
                      Software IT, Mechanical, Caregiving (SSW), Automotive
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#b5623b]">JLPT N5 / N4</td>
                    <td className="py-4 px-4 text-emerald-700 font-bold">₹18L – ₹35L / yr</td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/admissions?lang=japanese&level=japanese-n5"
                        className="rounded-lg bg-[#b5623b] text-white px-3 py-1 text-xs font-bold hover:bg-[#954b2c] transition"
                      >
                        Enroll N5
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#fbfaf7]/60 transition">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#24312d] flex items-center gap-2">
                      <span className="text-xl">🇩🇪</span>
                      <div>
                        <span>German</span>
                        <span className="block text-[10px] font-normal text-[#65706a]">Deutsch (Goethe)</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#48534e]">Germany, Austria, Switzerland</td>
                    <td className="py-4 px-4 text-[#48534e]">
                      Tuition-Free Masters, Nursing, Engineering, Mechatronics
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#b5623b]">Goethe A1 / A2</td>
                    <td className="py-4 px-4 text-emerald-700 font-bold">₹24L – ₹45L / yr</td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/admissions?lang=german&level=german-a1"
                        className="rounded-lg bg-[#b5623b] text-white px-3 py-1 text-xs font-bold hover:bg-[#954b2c] transition"
                      >
                        Enroll A1
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#fbfaf7]/60 transition">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#24312d] flex items-center gap-2">
                      <span className="text-xl">🇬🇧</span>
                      <div>
                        <span>English</span>
                        <span className="block text-[10px] font-normal text-[#65706a]">Corporate & IELTS</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#48534e]">Global MNCs, UK, USA, Aus</td>
                    <td className="py-4 px-4 text-[#48534e]">
                      Business Communication, Corporate Interviews, Study Abroad
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#b5623b]">IELTS / Cambridge</td>
                    <td className="py-4 px-4 text-emerald-700 font-bold">Domestic & Global</td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/admissions?lang=english&level=english-basic"
                        className="rounded-lg bg-[#b5623b] text-white px-3 py-1 text-xs font-bold hover:bg-[#954b2c] transition"
                      >
                        Enroll English
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#fbfaf7]/60 transition">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#24312d] flex items-center gap-2">
                      <span className="text-xl">🇫🇷</span>
                      <div>
                        <span>French</span>
                        <span className="block text-[10px] font-normal text-[#65706a]">Français (DELF)</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#48534e]">France, Canada (PR Bonus), EU</td>
                    <td className="py-4 px-4 text-[#48534e]">
                      Canada Express Entry (extra +50 PR pts), Luxury, Hospitality
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#b5623b]">DELF A1 / A2</td>
                    <td className="py-4 px-4 text-emerald-700 font-bold">₹20L – ₹40L / yr</td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/admissions?lang=french&level=french-a1"
                        className="rounded-lg bg-[#b5623b] text-white px-3 py-1 text-xs font-bold hover:bg-[#954b2c] transition"
                      >
                        Enroll A1
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TRANSPARENT ZERO-RISK REFUND POLICY BANNER                */}
        {/* ========================================================= */}
        <section className="px-4 py-8 max-w-6xl mx-auto">
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/40 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                <ShieldCheck size={26} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Zero-Risk Education Guarantee
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d] mt-0.5">
                  Why do we have a 100% Refundable Security Deposit?
                </h3>
                <p className="text-xs sm:text-sm text-[#48534e] mt-1.5 max-w-2xl leading-relaxed">
                  As an educational foundation committed to social empowerment, we want zero financial barriers for passionate learners. The deposit keeps students accountable to attend classes and take their official exams. When you fulfill 75% attendance and take your test, your security deposit is 100% refunded back!
                </p>
              </div>
            </div>

            <Link
              to="/student"
              className="rounded-full bg-[#24312d] hover:bg-[#b5623b] text-white px-6 py-3 text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span>Get Free Student PRN</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)                */}
        {/* ========================================================= */}
        <section className="px-4 py-12 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#24312d] mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#65706a] mt-1">
              Everything you need to know about our batches, fees, and certifications.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#e2e5dc] bg-white transition shadow-2xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-4 px-5 text-left font-serif font-bold text-[#24312d] text-sm sm:text-base flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#b5623b] shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#65706a] leading-relaxed border-t border-[#f1f3ed]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINAL COUNSELOR CTA BANNER                                */}
        {/* ========================================================= */}
        <section className="px-4 pt-8 pb-4 max-w-6xl mx-auto">
          <div className="rounded-3xl bg-[#24312d] text-white p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block rounded-full bg-white/10 text-amber-300 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 border border-white/20">
                Admissions Open 2026-27
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold">
                Still Wondering Which Course is Best for You?
              </h2>
              <p className="text-xs sm:text-sm text-[#d5ded9] leading-relaxed">
                Connect directly with our Academic Counselors for free 1-on-1 guidance on visas, scholarships, batch timings, and international job market demands.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="tel:+917820831901"
                  className="rounded-full bg-[#b5623b] hover:bg-[#954b2c] text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <PhoneCall size={16} />
                  <span>Call Admissions: +91 7820831901</span>
                </a>
                <Link
                  to="/admissions"
                  className="rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Apply Online Now</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Language Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourse}
        level={selectedLevel}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnroll={handleEnrollLanguage}
      />

      <Footer />
    </div>
  );
}
