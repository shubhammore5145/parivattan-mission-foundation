import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/courses/CourseCard";
import CourseDetailModal from "@/components/courses/CourseDetailModal";
import {
  LANGUAGE_COURSES,
  LanguageCourse,
  CourseLevel,
  getBatchSeatsInfo,
} from "@/data/languageCoursesData";
import {
  Sparkles,
  ArrowRight,
  Globe,
  Clock,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CoursesPage() {
  const navigate = useNavigate();

  // Modal state for course details
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<LanguageCourse | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);

  // When user clicks "Enroll Now" on any course card:
  // Directly navigate to the Admissions page with the selected course and level!
  const handleEnroll = (course: LanguageCourse, level: CourseLevel) => {
    navigate(`/admissions?lang=${course.id}&level=${level.id}`);
  };

  const handleOpenDetails = (course: LanguageCourse, level: CourseLevel) => {
    setSelectedCourse(course);
    setSelectedLevel(level);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />

      <main className="pt-28 md:pt-36 pb-20">
        {/* Hero Section */}
        <section className="px-4 pb-12 pt-6 sm:pb-16 sm:pt-10 text-center">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={14} /> Foreign Language School
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#24312d] leading-[1.12]">
              Explore Language Courses
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#65706a] max-w-2xl mx-auto leading-relaxed">
              Browse certified language training in <strong>Japanese</strong>, <strong>German</strong>, <strong>English</strong>, and <strong>French</strong>. Click "Enroll Now" to apply directly through our Admissions Portal.
            </p>

            {/* Quick 4 Highlights */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-3.5 shadow-2xs">
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#24312d]">4 Languages</p>
                <p className="text-xs text-[#65706a] mt-0.5">JLPT, Goethe, DELF</p>
              </div>
              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-3.5 shadow-2xs">
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#b5623b]">3 – 7 Months</p>
                <p className="text-xs text-[#65706a] mt-0.5">Flexible Durations</p>
              </div>
              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-3.5 shadow-2xs">
                <p className="text-xl sm:text-2xl font-serif font-bold text-[#24312d]">From ₹2,000</p>
                <p className="text-xs text-[#65706a] mt-0.5">Affordable Fees</p>
              </div>
              <div className="rounded-2xl border border-[#e2e5dc] bg-white p-3.5 shadow-2xs">
                <p className="text-xl sm:text-2xl font-serif font-bold text-emerald-700">₹2,000</p>
                <p className="text-xs text-[#65706a] mt-0.5">Refundable Deposit*</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to="/admissions"
                className="rounded-full bg-[#b5623b] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#954b2c] transition flex items-center gap-1.5"
              >
                <span>Go Directly to Admissions</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Main Course Cards (Browse Only) */}
        <section className="px-4 py-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
              Available Language Courses
            </h2>
            <p className="text-xs sm:text-sm text-[#65706a] mt-1">
              Check levels, batch timings, and seat intake. Click "Enroll Now" to submit your application.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {LANGUAGE_COURSES.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourse}
        level={selectedLevel}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnroll={handleEnroll}
      />

      <Footer />
    </div>
  );
}
