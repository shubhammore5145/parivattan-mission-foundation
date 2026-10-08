import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Globe2,
  Calendar,
  CheckCircle2,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// Pixel-perfect, 100% self-contained vector SVG flags for razor-sharp rendering on all screens
function JapanFlag({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#ffffff" />
      <circle cx="450" cy="300" r="180" fill="#bc002d" />
    </svg>
  );
}

function GermanyFlag({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 5 3" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="5" height="1" y="0" fill="#111111" />
      <rect width="5" height="1" y="1" fill="#dd0000" />
      <rect width="5" height="1" y="2" fill="#ffce00" />
    </svg>
  );
}

function UKFlag({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg">
      <clipPath id="uk-flag-clip-section">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-section)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L30,15 M60,30 L30,15 M60,0 L30,15 M0,30 L30,15" stroke="#c8102e" strokeWidth="2" />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FranceFlag({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" x="0" fill="#002654" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#ce1126" />
    </svg>
  );
}

interface FlagCourse {
  id: string;
  country: string;
  language: string;
  nativeScript: string;
  flagEmoji: string;
  badge: string;
  levels: string;
  duration: string;
  route: string;
  themeColor: string;
  themeGlow: string;
  borderColor: string;
  chipBg: string;
  chipText: string;
  FlagComponent: React.ComponentType<{ className?: string }>;
}

const COUNTRY_FLAGS: FlagCourse[] = [
  {
    id: "japanese",
    country: "Japan",
    language: "Japanese Language",
    nativeScript: "日本語 • Nihongo",
    flagEmoji: "🇯🇵",
    badge: "JLPT N5, N4 & N3",
    levels: "N5, N4, N3 Levels",
    duration: "6 – 7 Months",
    route: "/courses/japanese",
    themeColor: "#bc002d",
    themeGlow: "rgba(188, 0, 45, 0.15)",
    borderColor: "rgba(188, 0, 45, 0.35)",
    chipBg: "#fdf2f2",
    chipText: "#991b1b",
    FlagComponent: JapanFlag,
  },
  {
    id: "german",
    country: "Germany",
    language: "German Language",
    nativeScript: "Deutsch • Goethe",
    flagEmoji: "🇩🇪",
    badge: "Goethe A1 & A2",
    levels: "A1 & A2 Levels",
    duration: "3 – 4.5 Months",
    route: "/courses/german",
    themeColor: "#d97706",
    themeGlow: "rgba(217, 119, 6, 0.15)",
    borderColor: "rgba(217, 119, 6, 0.35)",
    chipBg: "#fffbeb",
    chipText: "#92400e",
    FlagComponent: GermanyFlag,
  },
  {
    id: "english",
    country: "United Kingdom",
    language: "English Language",
    nativeScript: "Basic & Spoken English",
    flagEmoji: "🇬🇧",
    badge: "Spoken & Fluency",
    levels: "Foundational & Fluency",
    duration: "3 Months Intensive",
    route: "/courses/english",
    themeColor: "#0284c7",
    themeGlow: "rgba(2, 132, 199, 0.15)",
    borderColor: "rgba(2, 132, 199, 0.35)",
    chipBg: "#f0f9ff",
    chipText: "#0369a1",
    FlagComponent: UKFlag,
  },
  {
    id: "french",
    country: "France",
    language: "French Language",
    nativeScript: "Français • DELF",
    flagEmoji: "🇫🇷",
    badge: "DELF A1 Immersion",
    levels: "A1 Immersion Level",
    duration: "3 Months Daily",
    route: "/courses/french",
    themeColor: "#7c3aed",
    themeGlow: "rgba(124, 58, 237, 0.15)",
    borderColor: "rgba(124, 58, 237, 0.35)",
    chipBg: "#f5f3ff",
    chipText: "#5b21b6",
    FlagComponent: FranceFlag,
  },
];

export default function HomeCoursesSection() {
  const navigate = useNavigate();

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-gradient-to-b from-[#fbfaf7] via-white to-[#fbfaf7] border-t border-[#e2e5dc] py-20 sm:py-28"
    >
      {/* Decorative ambient background blur orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(181, 98, 59, 0.25) 0%, rgba(229, 163, 127, 0.1) 50%, transparent 80%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(181, 98, 59, 0.2) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/25 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b] shadow-2xs">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span>Admissions 2026-27 Open</span>
          </div>

          <h2 className="mt-4 text-3xl font-serif sm:text-5xl md:text-6xl font-bold text-[#24312d] tracking-tight leading-[1.12]">
            Certified Foreign Language Admissions
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#65706a] max-w-2xl mx-auto leading-relaxed">
            Click on any country flag below to instantly view complete curriculum, batch schedules, fees, and admission registration.
          </p>

          {/* Quick trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-[#48534e]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e2e5dc] px-3.5 py-1.5 shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-600" /> JLPT, Goethe & DELF
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e2e5dc] px-3.5 py-1.5 shadow-2xs">
              <Clock size={13} className="text-amber-600" /> Morning & Evening Batches
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e2e5dc] px-3.5 py-1.5 shadow-2xs">
              <ShieldCheck size={13} className="text-blue-600" /> Refundable Security Deposit*
            </span>
          </div>
        </div>

        {/* 4 Interactive Country Flag Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {COUNTRY_FLAGS.map((item) => {
            const Flag = item.FlagComponent;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(item.route);
                  }
                }}
                className="group relative cursor-pointer rounded-3xl bg-white p-6 transition-all duration-300 hover:-translate-y-3 flex flex-col justify-between focus:outline-hidden"
                style={{
                  boxShadow: "0 10px 30px -10px rgba(36, 49, 45, 0.08), 0 0 0 1px #e2e5dc",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 24px 45px -12px ${item.themeGlow}, 0 0 0 2px ${item.borderColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px -10px rgba(36, 49, 45, 0.08), 0 0 0 1px #e2e5dc";
                }}
              >
                <div>
                  {/* Flag Container with Realistic Sheen & Ratio */}
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-[#d9ddd4] bg-stone-100 shadow-sm transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                    <Flag className="w-full h-full object-cover" />

                    {/* Subtle glass reflection overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/25 opacity-80" />

                    {/* Floating Level Pill on Flag */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border"
                        style={{
                          backgroundColor: item.chipBg,
                          color: item.chipText,
                          borderColor: item.borderColor,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Hover Click Hint Overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#24312d]/60 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#24312d] shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <span>Open Course</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>

                  {/* Country Name & Language Details */}
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#87938b]">
                      <span className="text-sm">{item.flagEmoji}</span>
                      <span>{item.country}</span>
                    </div>

                    <h3 className="mt-1 text-2xl font-serif font-bold text-[#24312d] transition-colors group-hover:text-[#b5623b]">
                      {item.language}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-[#65706a]">
                      {item.nativeScript}
                    </p>

                    <div className="mt-3.5 inline-flex items-center gap-1 rounded-full bg-[#f6f7f3] border border-[#e8ece3] px-3 py-1 text-[11px] font-bold text-[#48534e]">
                      <Clock size={11} className="text-[#b5623b]" />
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link / Button */}
                <div className="mt-6 pt-4 border-t border-[#f0f2eb]">
                  <Link
                    to={item.route}
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#24312d] py-3 px-4 text-xs font-bold text-white transition-all duration-300 group-hover:bg-[#b5623b] shadow-xs group-hover:shadow-md"
                  >
                    <span>View Course Details</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Programs Quick Preview */}
        <div className="mt-8 rounded-2xl border border-dashed border-[#d5d9cf] bg-white/70 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-600" />
                Coming Soon
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#24312d]">
                New Languages Launching in 2026: <strong className="text-[#24312d]">Russian 🇷🇺</strong>, <strong className="text-[#24312d]">Chinese (Mandarin) 🇨🇳</strong>, and <strong className="text-[#24312d]">Spanish 🇪🇸</strong>
              </span>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#b5623b] hover:text-[#954b2c] transition shrink-0"
            >
              <span>Explore Upcoming Cohorts</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Bottom Feature Callout & Navigation Strip */}
        <div className="mt-8 sm:mt-10 rounded-3xl border border-[#e2e5dc] bg-gradient-to-r from-white via-[#fbfaf7] to-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center lg:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#b5623b]/10 text-[#b5623b]">
                <Globe2 size={26} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#24312d]">
                  Parivattan Foreign Language School
                </h4>
                <p className="text-xs sm:text-sm text-[#65706a] max-w-xl">
                  Accredited curriculum with certified instructors, limited batch sizes (20–30 students), structured schedules, and direct overseas career support.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full border border-[#24312d] px-6 py-3 text-xs sm:text-sm font-bold text-[#24312d] hover:bg-[#24312d] hover:text-white transition shadow-2xs"
              >
                <span>View All Courses</span>
                <ChevronRight size={15} />
              </Link>
              <Link
                to="/admissions"
                className="inline-flex items-center gap-2 rounded-full bg-[#b5623b] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#954b2c] transition shadow-xs"
              >
                <span>Apply for Admission</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
