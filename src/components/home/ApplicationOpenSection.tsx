import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Phone,
  MessageCircle,
  Megaphone,
  Plane,
  Eye,
  X,
  Download,
  GraduationCap,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { CountryFlagIcon } from "@/components/common/CountryFlagIcon";

interface LanguageItem {
  id: string;
  name: string;
  nativeName: string;
  cardImage: string;
  levels: string;
  highlight: string;
  flagCode: "jp" | "de" | "fr" | "gb";
  batchInfo: string;
}

const languages: LanguageItem[] = [
  {
    id: "japanese",
    name: "JAPANESE",
    nativeName: "日本語",
    cardImage: "/img/poster-card-japanese.jpg",
    levels: "Basic (N5), Medium (N4), Advanced (N3)",
    highlight: "JLPT Prep • Japan SSW Career Visa",
    flagCode: "jp",
    batchInfo: "Morning & Evening Batches",
  },
  {
    id: "german",
    name: "GERMAN",
    nativeName: "Deutsch",
    cardImage: "/img/poster-card-german.jpg",
    levels: "A1, A2, B1 Levels",
    highlight: "Goethe Prep • Ausbildung & University Access",
    flagCode: "de",
    batchInfo: "Weekend & Evening Batches",
  },
  {
    id: "french",
    name: "FRENCH",
    nativeName: "Français",
    cardImage: "/img/poster-card-french.jpg",
    levels: "A1, A2, B1 Levels",
    highlight: "DELF Certification • International Business",
    flagCode: "fr",
    batchInfo: "Daily Batches Available",
  },
  {
    id: "english",
    name: "ENGLISH",
    nativeName: "English",
    cardImage: "/img/poster-card-english.jpg",
    levels: "Basic to Advanced Fluency",
    highlight: "Spoken English • Interview & Corporate Skills",
    flagCode: "gb",
    batchInfo: "Special Evening Batches",
  },
];

export default function ApplicationOpenSection() {
  const [showPosterModal, setShowPosterModal] = useState(false);

  // Open announcement popup once per session after 5 seconds if not already viewed
  useEffect(() => {
    const hasSeen = sessionStorage.getItem("pmf_poster_viewed_once");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowPosterModal(true);
        sessionStorage.setItem("pmf_poster_viewed_once", "true");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard Escape listener and background scroll lock when modal is open
  useEffect(() => {
    if (!showPosterModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPosterModal(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showPosterModal]);

  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Mission Foundation! I would like to inquire about the Foreign Language Course Admissions (Japanese / German / French / English)."
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f2f8f4]/60 via-white to-white py-14 sm:py-20 border-b border-stone-200/70">
      {/* Background Decorative Graphic Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-emerald-100/30 to-transparent blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header matching user's official poster */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Foundation Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e6ede8] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1e3b2e] border border-[#d2ded5] shadow-xs mb-4">
            <Sparkles size={13} className="text-[#b5623b]" />
            <span>Parivattan Mission Foundation</span>
          </div>

          {/* Large Announcement Title with Megaphone & Open Badge */}
          <div className="relative inline-block my-2">
            {/* 3D Sound / Megaphone Accent on left */}
            <div className="hidden sm:flex absolute -left-16 sm:-left-20 -top-3 items-center justify-center h-14 w-14 rounded-2xl bg-[#1b2b25] text-amber-300 shadow-lg -rotate-12 transform hover:rotate-0 transition">
              <Megaphone size={26} className="text-[#fedb41]" />
            </div>

            {/* Doodle Airplane and Cursive Script on right */}
            <div className="hidden md:flex absolute -right-36 -top-6 items-center gap-1.5 select-none pointer-events-none">
              <span
                className="font-serif italic text-xl text-[#244234] -rotate-6"
                style={{ fontFamily: "'Playfair Display', Georgia, cursive, serif" }}
              >
                Explore New <br />
                Opportunities
              </span>
              <Plane size={22} className="text-[#244234] -rotate-45 mb-4" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[#1b2b25]">
                APPLICATION
              </h2>
              <span className="inline-block bg-[#fedb41] text-[#1b2b25] px-4 sm:px-5 py-1 sm:py-1.5 rounded-2xl font-serif font-black text-3xl sm:text-4xl md:text-5xl shadow-md border-2 border-[#e6c32c] transform -rotate-2">
                OPEN
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base text-[#4f5d56] font-medium">
            Parivattan Mission Foundation launches applications for
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1b2b25]">
            Foreign Language Courses
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#73827a]">
            Certified instruction in Japanese, German, French, and English • Limited intake per batch!
          </p>

          {/* Quick Action to View/Download Full Poster */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b5623b] hover:text-[#8f4523] bg-[#fbf5f1] hover:bg-[#f6eae2] px-3.5 py-1.5 rounded-full border border-[#f0ded3] transition shadow-xs"
            >
              <Eye size={13} />
              <span>View Official Poster</span>
            </button>
          </div>
        </div>

        {/* The 4 Language Cards Grid (Direct Match with Mockup) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="group relative rounded-3xl border border-[#e4e8e1] bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Visual Landmark Image Header */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-stone-100">
                  <img
                    src={lang.cardImage}
                    alt={`${lang.name} Language Course`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Flag Icon Tag */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-stone-200">
                    <CountryFlagIcon courseId={lang.id} className="w-4 h-3 rounded-xs shadow-xs" />
                    <span className="text-[11px] font-bold tracking-wider text-[#1b2b25]">
                      {lang.name}
                    </span>
                  </div>

                  {/* Native Name on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-2xl font-course font-black tracking-wide drop-shadow-md">
                      {lang.nativeName}
                    </span>
                    <span className="block text-[11px] font-course font-semibold text-white/90 drop-shadow-xs">
                      {lang.batchInfo}
                    </span>
                  </div>
                </div>

                {/* Course Details Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-course font-extrabold text-[#1b2b25]">
                      {lang.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#b5623b] bg-[#fbf5f1] px-2.5 py-0.5 rounded-full border border-[#f0ded3]">
                      Admissions Open
                    </span>
                  </div>

                  <p className="text-xs font-course font-medium text-[#526059] leading-relaxed mb-3">
                    {lang.levels}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#244234] font-semibold bg-[#eef5f1] p-2 rounded-xl">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{lang.highlight}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Link
                  to={`/admissions?lang=${lang.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1b2b25] hover:bg-[#b5623b] text-white py-2.5 px-4 text-xs font-bold shadow-sm transition-all duration-200 group-hover:shadow-md"
                >
                  <span>Apply for {lang.name}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Actions: Apply Now & Coordinators */}
        <div className="mt-10 rounded-3xl bg-[#1b2b25] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fedb41]">
              Limited Seats Available • Early Bird Intake
            </span>
            <h4 className="mt-1 text-xl sm:text-2xl font-serif font-bold text-white">
              Ready to learn a foreign language?
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-stone-300">
              Fill out your online admission form or connect with our academic coordinators for batch timings and syllabus counseling.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/admissions"
              className="inline-flex items-center gap-2 rounded-full bg-[#b5623b] hover:bg-[#9d502d] text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-md transition hover:scale-[1.02]"
            >
              <GraduationCap size={16} />
              <span>Apply for Admission</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href={`https://wa.me/919226345875?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs sm:text-sm font-bold transition"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Inquiry</span>
            </a>

            <a
              href="tel:+919226345875"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 text-xs sm:text-sm font-bold transition border border-white/20"
            >
              <Phone size={15} />
              <span>+91 92263 45875</span>
            </a>
          </div>
        </div>
      </div>

      {/* Official Poster Modal */}
      {showPosterModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowPosterModal(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-stone-200 bg-stone-50">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                  Official Announcement Poster
                </h3>
                <p className="text-xs text-[#65706a]">
                  Parivattan Mission Foundation • Foreign Language Courses
                </p>
              </div>
              <button
                onClick={() => setShowPosterModal(false)}
                className="h-8 w-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-[#1b2b25] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Poster Image */}
            <div className="p-4 overflow-y-auto max-h-[75vh] flex justify-center bg-[#f7f6f2]">
              <img
                src="/img/applications-open-languages.jpg"
                alt="Parivattan Mission Foundation - Application Open for Foreign Language Courses"
                className="w-full max-w-2xl h-auto rounded-2xl shadow-md object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <a
                href="/img/applications-open-languages.jpg"
                download="Parivattan-Language-Courses-Application-Open.jpg"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1b2b25] hover:text-[#b5623b] transition"
              >
                <Download size={15} />
                <span>Download Poster Image</span>
              </a>

              <Link
                to="/admissions"
                onClick={() => setShowPosterModal(false)}
                className="inline-flex items-center gap-2 rounded-full bg-[#b5623b] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#9d502d] transition"
              >
                <span>Proceed to Admission Form</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
