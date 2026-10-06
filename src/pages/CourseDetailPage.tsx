import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  LANGUAGE_COURSES,
  LanguageCourse,
  CourseLevel,
  getCourseById,
  getCourseLevelById,
} from "@/data/languageCoursesData";
import {
  Calendar,
  Clock,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import RegistrationForm from "@/components/courses/RegistrationForm";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Find course or course level
  let matchedCourse: LanguageCourse | undefined;
  let matchedLevel: CourseLevel | undefined;

  if (courseId) {
    const levelMatch = getCourseLevelById(courseId);
    if (levelMatch) {
      matchedCourse = levelMatch.course;
      matchedLevel = levelMatch.level;
    } else {
      matchedCourse = getCourseById(courseId);
      if (matchedCourse) {
        matchedLevel = matchedCourse.levels[0];
      }
    }
  }

  // Fallback to Japanese if not found
  const course = matchedCourse || LANGUAGE_COURSES[0];
  const [selectedLevelId, setSelectedLevelId] = useState<string>(
    matchedLevel?.id || course.levels[0].id
  );

  useEffect(() => {
    if (matchedLevel) {
      setSelectedLevelId(matchedLevel.id);
    } else if (course) {
      setSelectedLevelId(course.levels[0].id);
    }
  }, [courseId, course, matchedLevel]);

  const level = course.levels.find((l) => l.id === selectedLevelId) || course.levels[0];
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [courseId]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />

      <main className="pt-28 md:pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#65706a] mb-6">
            <Link to="/courses" className="hover:text-[#b5623b] flex items-center gap-1">
              <ArrowLeft size={14} /> Back to All Courses
            </Link>
            <span>/</span>
            <span>{course.name}</span>
            <span>/</span>
            <span className="text-[#24312d]">{level.level}</span>
          </div>

          {/* Hero Header */}
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] text-4xl shadow-xs">
                    {course.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                        {course.nativeName}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                        Level {level.level}
                      </span>
                      {level.batches[0]?.isLimitedSeats && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-900">
                          Limited Seats Available
                        </span>
                      )}
                    </div>
                    <h1 className="mt-1 text-3xl sm:text-4xl font-serif font-bold text-[#24312d]">
                      {course.name} – {level.level}
                    </h1>
                  </div>
                </div>

                <p className="text-base text-[#65706a] leading-relaxed">
                  {level.description}
                </p>

                {/* Level selector if multiple levels */}
                {course.levels.length > 1 && (
                  <div className="pt-2">
                    <p className="text-xs uppercase tracking-wider font-semibold text-[#65706a] mb-2">
                      Select Level:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {course.levels.map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setSelectedLevelId(lvl.id)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition border ${
                            lvl.id === selectedLevelId
                              ? "bg-[#24312d] text-white border-[#24312d] shadow-sm"
                              : "bg-[#fbfaf7] text-[#65706a] border-[#e2e5dc] hover:border-[#b5623b]"
                          }`}
                        >
                          {lvl.level} ({lvl.duration})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Pricing Card on Right */}
              <div className="w-full lg:w-80 rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-6 shadow-2xs space-y-4">
                <div>
                  <span className="text-xs font-semibold text-[#65706a]">Course Fee</span>
                  <p className="text-3xl font-serif font-bold text-[#24312d]">
                    ₹{level.courseFee.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="border-t border-[#e2e5dc] pt-3">
                  <span className="text-xs font-semibold text-[#65706a]">Security Deposit</span>
                  {level.hasSecurityDeposit ? (
                    <div>
                      <p className="text-2xl font-serif font-bold text-[#b5623b]">
                        ₹{level.securityDeposit.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        * Refundable as per exam criteria
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-[#65706a] mt-0.5">₹0 (Not Applicable)</p>
                  )}
                </div>

                <div className="border-t border-[#e2e5dc] pt-3">
                  <span className="text-xs uppercase font-bold text-[#24312d]">Total Payable</span>
                  <p className="text-2xl font-serif font-bold text-[#24312d]">
                    ₹{(level.courseFee + level.securityDeposit).toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(true);
                    const el = document.getElementById("enroll-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full rounded-xl bg-[#b5623b] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#954b2c] transition flex items-center justify-center gap-2"
                >
                  <span>Enroll in this Course</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Left: Objectives & Curriculum (2 cols) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Objectives */}
              <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-[#24312d] flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-[#b5623b]" />
                  Course Objectives & Learning Outcomes
                </h3>
                <ul className="space-y-3 text-sm text-[#65706a]">
                  {level.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#b5623b] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Batch Days & Timings */}
              <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-[#24312d] flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-[#b5623b]" />
                  Batch Information & Schedule
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {level.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-[#24312d]">
                        <span className="text-sm">{batch.name}</span>
                        <span className="font-mono text-[#b5623b]">{batch.time}</span>
                      </div>
                      <dl className="mt-3 space-y-1.5 text-[#65706a]">
                        <div className="flex justify-between">
                          <span>Days:</span>
                          <strong className="text-[#24312d]">{batch.days}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <strong className="text-[#24312d]">{batch.duration}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Available Seats / Intake:</span>
                          <strong className="text-emerald-700">{batch.intakeLabel || "Limited"}</strong>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Policy Box */}
              <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-[#24312d] flex items-center gap-2 mb-3">
                  <Shield size={20} className="text-[#b5623b]" />
                  Refund Condition & Examination Criteria
                </h3>
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Security Deposit Refund Policy:</p>
                    <p className="mt-1 leading-relaxed">{level.refundCondition}</p>
                    <p className="mt-2 text-[11px] text-amber-800">
                      As per Rule #8: Security deposit refunds, where applicable, depend on fulfilling the stated examination criteria. Course registration fees are non-refundable.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary & Quick Facts */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm space-y-4 text-xs">
                <h4 className="font-serif font-bold text-base text-[#24312d]">
                  Quick Course Facts
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-[#b5623b]" />
                    <div>
                      <span className="block text-[#65706a]">Duration</span>
                      <strong className="text-[#24312d] text-sm">{level.duration}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#b5623b]" />
                    <div>
                      <span className="block text-[#65706a]">Batch Slots</span>
                      <strong className="text-[#24312d] text-sm">{level.batches.length} Batch Options</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-[#b5623b]" />
                    <div>
                      <span className="block text-[#65706a]">Intake Limit</span>
                      <strong className="text-[#24312d] text-sm">{level.intakeSummary || "Limited Seats"}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap size={16} className="text-[#b5623b]" />
                    <div>
                      <span className="block text-[#65706a]">Certificate</span>
                      <strong className="text-[#24312d] text-sm">Institute Certificate + Exam Prep</strong>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f1f3ed] pt-4">
                  <Link
                    to="/rules"
                    className="text-[#b5623b] font-semibold hover:underline block text-center"
                  >
                    Read Rules & Regulations →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Section */}
          <div id="enroll-section" className="mt-12">
            <RegistrationForm
              initialLanguage={course.name}
              initialLevel={level.id}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
