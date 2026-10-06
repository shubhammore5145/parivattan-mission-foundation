import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Info,
  Calendar,
  X,
  Laptop,
  Globe,
  Plane,
  Database,
} from "lucide-react";
import { Course, CourseCategory } from "@/types/student";
import { COURSES_DATA, COURSE_CATEGORIES } from "@/data/coursesData";

interface CourseCatalogProps {
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  selectedCourse,
  onSelectCourse,
}) => {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [syllabusModalCourse, setSyllabusModalCourse] = useState<Course | null>(null);

  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesCat =
      activeCategory === "all" || course.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.marathiTitle.toLowerCase().includes(q) ||
      course.school.toLowerCase().includes(q) ||
      course.code.toLowerCase().includes(q) ||
      course.highlights.some((h) => h.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const getCourseIcon = (iconName: string) => {
    switch (iconName) {
      case "Laptop":
        return <Laptop className="w-5 h-5" />;
      case "Database":
        return <Database className="w-5 h-5" />;
      case "Globe":
        return <Globe className="w-5 h-5" />;
      case "Plane":
        return <Plane className="w-5 h-5" />;
      default:
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full">
      {/* Top Banner & Filters */}
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#b5623b]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={13} />
              स्टेप २ : अभ्यासक्रम निवड (Step 2: Course Selection)
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
              आपल्या आवडीचा अभ्यासक्रम निवडा
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#65706a]">
              तंत्रज्ञान, विदेशी भाषा, स्पर्धा परीक्षा व कौशल्य विकासामधील मान्यताप्राप्त अभ्यासक्रम.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="कोर्स, भाषा किंवा विषय शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] placeholder:text-gray-400 focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#eef0e8]">
          {COURSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as CourseCategory)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-[#24312d] text-white shadow-sm"
                  : "bg-[#f1f3ed] text-[#4d5752] hover:bg-[#e4e7de] hover:text-[#24312d]"
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1 text-[11px] opacity-75 font-normal">({cat.marathi})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isSelected = selectedCourse?.id === course.id;

          return (
            <div
              key={course.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white ${
                isSelected
                  ? "border-[#b5623b] ring-2 ring-[#b5623b] shadow-xl translate-y-[-2px]"
                  : "border-[#e2e5dc] hover:border-[#b5623b]/60 hover:shadow-lg"
              }`}
            >
              <div>
                {/* Card Top Header */}
                <div className="p-5 pb-3 bg-gradient-to-br from-[#fbfaf7] to-white border-b border-[#f1f3ed]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef0e8] px-2.5 py-0.5 text-[11px] font-bold text-[#4a5651]">
                      {getCourseIcon(course.icon)}
                      {course.code}
                    </span>
                    <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold">
                      {course.badge}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-[#b5623b] uppercase tracking-wider">
                    {course.school}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#24312d] leading-snug">
                    {course.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#65706a] font-medium">
                    {course.marathiTitle}
                  </p>
                </div>

                {/* Course Metadata pills */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4d5752]">
                    <div className="flex items-center gap-1.5 bg-[#fbfaf7] p-2 rounded-xl border border-[#eceee7]">
                      <Clock size={13} className="text-[#b5623b] shrink-0" />
                      <span><strong>कालावधी:</strong> {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#fbfaf7] p-2 rounded-xl border border-[#eceee7]">
                      <MapPin size={13} className="text-[#b5623b] shrink-0" />
                      <span className="truncate"><strong>मोड:</strong> {course.mode}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#fbfaf7] p-2 rounded-xl border border-[#eceee7] col-span-2">
                      <Calendar size={13} className="text-[#b5623b] shrink-0" />
                      <span><strong>बॅच प्रारंभ:</strong> {course.batchStart}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#24312d] mb-2">
                      वैशिष्ट्ये व फायदे:
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#525f59]">
                      {course.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#b5623b] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Syllabus button */}
                  <button
                    type="button"
                    onClick={() => setSyllabusModalCourse(course)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#b5623b] hover:underline"
                  >
                    <BookOpen size={13} />
                    संपूर्ण सिलॅबस पहा (View Syllabus)
                  </button>
                </div>
              </div>

              {/* Fee & Action Bottom Bar */}
              <div className="p-5 pt-3 bg-[#fbfaf7] border-t border-[#eceee7]">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-[11px] text-[#65706a]">
                      प्रवेश नोंदणी शुल्क (Admission Fee)
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-[#24312d]">
                        ₹{course.finalPayable.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{course.totalFee.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      स्कॉलरशिप मंजूर
                    </span>
                    <p className="text-[10px] text-[#65706a] mt-0.5">
                      उर्वरित जागा: {course.seatsAvailable}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCourse(course)}
                  className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                      : "bg-[#b5623b] text-white shadow-md hover:bg-[#974a27]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={16} />
                      हा कोर्स निवडला आहे (पुढे जा)
                    </>
                  ) : (
                    <>
                      हा अभ्यासक्रम निवडा (Select Course)
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#d5d9cf] bg-white p-12 text-center">
          <Info size={36} className="mx-auto text-[#65706a] mb-2" />
          <h4 className="font-serif text-lg font-bold text-[#24312d]">कोणताही अभ्यासक्रम सापडला नाही</h4>
          <p className="text-sm text-[#65706a] mt-1">कृपया फिल्टर बदला किंवा दुसरा शब्द शोधून पहा.</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-xl bg-[#24312d] px-4 py-2 text-xs font-bold text-white hover:bg-[#b5623b]"
          >
            सर्व अभ्यासक्रम दाखवा
          </button>
        </div>
      )}

      {/* Syllabus Modal */}
      {syllabusModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#eef0e8] pb-4">
              <div>
                <span className="rounded-md bg-[#eef0e8] px-2 py-0.5 text-xs font-bold text-[#4d5752]">
                  {syllabusModalCourse.code} · {syllabusModalCourse.duration}
                </span>
                <h3 className="mt-2 text-xl sm:text-2xl font-serif font-bold text-[#24312d]">
                  {syllabusModalCourse.title}
                </h3>
                <p className="text-xs text-[#65706a]">{syllabusModalCourse.school}</p>
              </div>
              <button
                type="button"
                onClick={() => setSyllabusModalCourse(null)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                  अभ्यासक्रम रचना (Course Syllabus Modules)
                </h4>
                <div className="mt-3 space-y-2.5">
                  {syllabusModalCourse.syllabus.map((mod, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#eef0e8] bg-[#fbfaf7] p-3 text-xs sm:text-sm text-[#38433e] flex items-start gap-2.5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#b5623b]/15 text-[#b5623b] font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                  करिअर व रोजगाराच्या संधी (Career Prospects)
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {syllabusModalCourse.careerProspects.map((cp, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-semibold"
                    >
                      ✓ {cp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#eef0e8] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSyllabusModalCourse(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                बंद करा
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectCourse(syllabusModalCourse);
                  setSyllabusModalCourse(null);
                }}
                className="rounded-xl bg-[#b5623b] px-5 py-2 text-xs font-bold text-white hover:bg-[#974a27] shadow"
              >
                हा कोर्स निवडा व नोंदणी करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
