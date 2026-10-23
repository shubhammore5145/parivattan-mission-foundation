import React, { useState } from "react";
import {
  Award,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Globe2,
} from "lucide-react";

export interface Achiever {
  id: number;
  name: string;
  exam: "JLPT N4" | "JLPT N5";
  language: string;
  image: string;
  quote?: string;
  badgeColor: string;
  tag: string;
}

export const ACHIEVERS_LIST: Achiever[] = [
  {
    id: 1,
    name: "Abhijit Gavai",
    exam: "JLPT N4",
    language: "Japanese Language",
    image: "/achievers/achiever-1.jpeg",
    quote: "Hard work, consistent practice, and village-level native mentorship brought me success in JLPT N4!",
    badgeColor: "bg-[#b5623b] text-white",
    tag: "Intermediate Mastery",
  },
  {
    id: 2,
    name: "Vipashyana Gawande",
    exam: "JLPT N4",
    language: "Japanese Language",
    image: "/achievers/achiever-2.jpeg",
    quote: "Passing JLPT N4 with flying colors has opened global opportunities for higher studies and career.",
    badgeColor: "bg-[#b5623b] text-white",
    tag: "Excellence Award",
  },
  {
    id: 3,
    name: "Vipul Koshe",
    exam: "JLPT N4",
    language: "Japanese Language",
    image: "/achievers/achiever-3.jpeg",
    quote: "Late-night sessions and grammar drills at Parivattan made conquering JLPT N4 possible.",
    badgeColor: "bg-[#b5623b] text-white",
    tag: "Top Performer",
  },
  {
    id: 4,
    name: "Anushka Suryapani",
    exam: "JLPT N5",
    language: "Japanese Language",
    image: "/achievers/achiever-4.jpeg",
    quote: "Building strong foundations in Kanji and vocabulary prepared me confidently for JLPT N5.",
    badgeColor: "bg-[#24312d] text-white",
    tag: "Foundation Honors",
  },
  {
    id: 5,
    name: "Kshitij Sherkhane",
    exam: "JLPT N4",
    language: "Japanese Language",
    image: "/achievers/achiever-5.jpeg",
    quote: "Young achiever proving that dedication and love for the Japanese language knows no age limit!",
    badgeColor: "bg-[#b5623b] text-white",
    tag: "Young Achiever",
  },
  {
    id: 6,
    name: "Sakshi Rathod",
    exam: "JLPT N5",
    language: "Japanese Language",
    image: "/achievers/achiever-6.jpeg",
    quote: "Proud moment representing Parivattan Foreign Language School with official JLPT N5 qualification.",
    badgeColor: "bg-[#24312d] text-white",
    tag: "Merit Scholar",
  },
  {
    id: 7,
    name: "Rahul Jadhav",
    exam: "JLPT N5",
    language: "Japanese Language",
    image: "/achievers/achiever-7.jpeg",
    quote: "Transforming small-town ambitions into international language proficiency with Parivattan.",
    badgeColor: "bg-[#24312d] text-white",
    tag: "Distinction",
  },
  {
    id: 8,
    name: "Neer Koshe",
    exam: "JLPT N4",
    language: "Japanese Language",
    image: "/achievers/achiever-8.jpeg",
    quote: "Milestone achieved! Each Kanji memorized brings me one step closer to studying in Japan.",
    badgeColor: "bg-[#b5623b] text-white",
    tag: "Special Mention",
  },
  {
    id: 9,
    name: "Prathamesh Shinde",
    exam: "JLPT N5",
    language: "Japanese Language",
    image: "/achievers/achiever-9.jpeg",
    quote: "Subsidized education and top-tier teaching helped me clear the Japanese government certification.",
    badgeColor: "bg-[#24312d] text-white",
    tag: "First-Gen Learner",
  },
  {
    id: 10,
    name: "Snehal Gaikwad",
    exam: "JLPT N5",
    language: "Japanese Language",
    image: "/achievers/achiever-10.jpeg",
    quote: "Empowering female leadership through international communication and global language exams.",
    badgeColor: "bg-[#24312d] text-white",
    tag: "Future Leader",
  },
  {
    id: 11,
    name: "Pooja Chavhan",
    exam: "JLPT N5",
    language: "Japanese Language",
    image: "/achievers/achiever-11.jpeg",
    quote: "Certified and ready for N4! Parivattan Mission Foundation proves that rural youth can shine globally.",
    badgeColor: "bg-[#24312d] text-white",
    tag: "Global Aspirant",
  },
];

interface StudentAchieversSectionProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showFilters?: boolean;
  className?: string;
  compact?: boolean;
}

export default function StudentAchieversSection({
  title = "Our Certified Exam Achievers",
  subtitle = "Real students, real international success. Celebrating our learners who conquered the prestigious Japanese-Language Proficiency Test (JLPT N4 & N5) through Parivattan Foreign Language School.",
  eyebrow = "Hall of Fame · Proof of Transformation",
  showFilters = true,
  className = "",
  compact = false,
}: StudentAchieversSectionProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "N4" | "N5">("ALL");
  const [selectedAchiever, setSelectedAchiever] = useState<Achiever | null>(null);

  const filteredAchievers = ACHIEVERS_LIST.filter((achiever) => {
    if (activeTab === "N4") return achiever.exam === "JLPT N4";
    if (activeTab === "N5") return achiever.exam === "JLPT N5";
    return true;
  });

  return (
    <section className={`py-16 md:py-24 bg-[#faf9f5] border-y border-[#e7e5de] relative overflow-hidden ${className}`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#f4ebe1]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#e8eee9]/60 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e5dc] shadow-xs text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-4">
            <Trophy className="w-3.5 h-3.5 text-[#b5623b]" />
            <span>{eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d] tracking-tight">
            {title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#65706a] leading-relaxed">
            {subtitle}
          </p>

          {/* Quick Highlight Metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-3.5 border border-[#e2e5dc] shadow-xs text-center">
              <div className="text-2xl font-serif font-bold text-[#b5623b]">100%</div>
              <div className="text-[11px] font-semibold text-[#65706a] uppercase tracking-wider mt-0.5">Exam Pass Rate</div>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-[#e2e5dc] shadow-xs text-center">
              <div className="text-2xl font-serif font-bold text-[#24312d]">JLPT N4 & N5</div>
              <div className="text-[11px] font-semibold text-[#65706a] uppercase tracking-wider mt-0.5">Govt. Accredited</div>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-[#e2e5dc] shadow-xs text-center">
              <div className="text-2xl font-serif font-bold text-[#b5623b]">11+</div>
              <div className="text-[11px] font-semibold text-[#65706a] uppercase tracking-wider mt-0.5">Stars Felicitated</div>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-[#e2e5dc] shadow-xs text-center">
              <div className="text-2xl font-serif font-bold text-[#24312d]">Global</div>
              <div className="text-[11px] font-semibold text-[#65706a] uppercase tracking-wider mt-0.5">Study & Job Ready</div>
            </div>
          </div>

          {/* Filter Tabs */}
          {showFilters && (
            <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-white border border-[#e2e5dc] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "ALL"
                    ? "bg-[#24312d] text-white shadow-xs"
                    : "text-[#65706a] hover:text-[#24312d] hover:bg-[#f5f6f1]"
                }`}
              >
                All Achievers ({ACHIEVERS_LIST.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("N4")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "N4"
                    ? "bg-[#b5623b] text-white shadow-xs"
                    : "text-[#65706a] hover:text-[#b5623b] hover:bg-[#f5f6f1]"
                }`}
              >
                JLPT N4 Achievers ({ACHIEVERS_LIST.filter((a) => a.exam === "JLPT N4").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("N5")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "N5"
                    ? "bg-[#24312d] text-white shadow-xs"
                    : "text-[#65706a] hover:text-[#24312d] hover:bg-[#f5f6f1]"
                }`}
              >
                JLPT N5 Achievers ({ACHIEVERS_LIST.filter((a) => a.exam === "JLPT N5").length})
              </button>
            </div>
          )}
        </div>

        {/* Achievers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievers.map((achiever) => (
            <div
              key={achiever.id}
              onClick={() => setSelectedAchiever(achiever)}
              className="group cursor-pointer relative bg-white rounded-3xl overflow-hidden border border-[#e2e5dc] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f1f3ed]">
                <img
                  src={achiever.image}
                  alt={`${achiever.name} - ${achiever.exam} Achiever`}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle corner badge visible by default */}
                <div className="absolute top-3 left-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${achiever.badgeColor}`}>
                    {achiever.exam}
                  </span>
                </div>

                {/* Hover-only Dark Gradient Overlay (Appears ONLY on mouse hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-between p-5" />

                {/* Hover-only Information Card (Name, Exam Passed, and Action prompt) */}
                <div className="absolute inset-0 z-30 flex flex-col justify-between p-5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                  {/* Top Exam Badge on Hover */}
                  <div className="flex items-center justify-between transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5 text-[#e5a37f]" />
                      {achiever.exam} Certified
                    </span>
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white shadow-sm">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </span>
                  </div>

                  {/* Bottom Details on Hover */}
                  <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 text-white">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#e5a37f] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{achiever.tag}</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-white drop-shadow-md leading-tight">
                      {achiever.name}
                    </h3>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b5623b] text-white text-xs font-bold shadow-md">
                      <Award className="w-3.5 h-3.5 text-white" />
                      Passed {achiever.exam} Exam
                    </div>

                    <p className="mt-2 text-xs text-white/80 line-clamp-2 italic">
                      "{achiever.quote}"
                    </p>

                    <div className="mt-3.5 flex items-center justify-between text-xs font-semibold text-white bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/25 hover:bg-white/30 transition shadow-sm">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-[#e5a37f]" />
                        Click to View Full Poster
                      </span>
                      <span className="text-[#e5a37f] text-sm">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Bottom Bar */}
              <div className="p-3.5 bg-white border-t border-[#f0f2eb] flex items-center justify-between text-xs transition-colors group-hover:bg-[#faf9f5]">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-[#24312d] truncate">
                    {achiever.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#f1f3ed] text-[#b5623b] font-bold text-[11px] whitespace-nowrap group-hover:bg-[#b5623b] group-hover:text-white transition-colors">
                  {achiever.exam}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Banner Below Grid */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-[#24312d] to-[#1a2320] text-white p-8 sm:p-10 border border-[#374944] shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#b5623b]/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e5a37f] mb-2">
                <GraduationCap className="w-4 h-4" />
                Next JLPT Exam Batch Enrolling Now
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                You could be our next certified language star!
              </h3>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Join our supportive community classes with live Japanese practice, exam mock papers, and 1-on-1 mentorship. Zero previous knowledge required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <a
                href="/admissions?lang=japanese"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#b5623b] hover:bg-[#c97047] text-white font-semibold text-sm transition-all shadow-md text-center"
              >
                Enroll in Japanese Batch
              </a>
              <a
                href="/courses"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all text-center"
              >
                Explore All Courses
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Poster Zoom Modal */}
      {selectedAchiever && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedAchiever(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#e2e5dc] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#e2e5dc] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedAchiever.badgeColor}`}>
                  {selectedAchiever.exam} Achiever
                </span>
                <h3 className="font-serif font-bold text-[#24312d] text-lg sm:text-xl">
                  {selectedAchiever.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAchiever(null)}
                className="p-2 rounded-full text-[#65706a] hover:bg-[#f1f3ed] hover:text-[#24312d] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Image (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f5f6f1] flex justify-center items-center">
              <img
                src={selectedAchiever.image}
                alt={`${selectedAchiever.name} congratulatory certificate`}
                className="max-h-[70vh] w-auto rounded-2xl shadow-xl border border-[#e2e5dc] object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#e2e5dc] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#65706a]">
              <p className="italic text-center sm:text-left">
                "{selectedAchiever.quote}"
              </p>
              <a
                href={selectedAchiever.image}
                download={`${selectedAchiever.name}_JLPT_Poster.jpeg`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#24312d] hover:bg-[#1a2320] text-white font-semibold text-xs transition whitespace-nowrap shadow-xs"
              >
                Download Poster
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
