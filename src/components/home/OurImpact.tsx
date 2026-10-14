import React from "react";
import { Sparkles, GraduationCap, BookOpen, Globe, Laptop, CheckCircle2 } from "lucide-react";

interface ImpactStat {
  value: string;
  unit: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  accentColor: string;
  glowColor: string;
  pillBg: string;
}

const IMPACT_METRICS: ImpactStat[] = [
  {
    value: "25,000+",
    unit: "STUDENTS",
    title: "STUDENTS EMPOWERED",
    desc: "Rural learners, youth, and first-generation aspirants supported annually with quality education, scholarships, and career prep.",
    icon: GraduationCap,
    accentColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.15)",
    pillBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    value: "100+",
    unit: "LIBRARIES",
    title: "SAU STUDY LIBRARIES",
    desc: "Digital libraries and rural study hubs established to provide free academic books, high-speed internet, and quiet study spaces.",
    icon: BookOpen,
    accentColor: "#0284c7",
    glowColor: "rgba(2, 132, 199, 0.15)",
    pillBg: "bg-sky-50 text-sky-800 border-sky-200",
  },
  {
    value: "1,500+",
    unit: "SCHOLARS",
    title: "FOREIGN LANGUAGE SCHOLARS",
    desc: "Students trained in JLPT-certified Japanese, Goethe-certified German, and international professional communication.",
    icon: Globe,
    accentColor: "#b5623b",
    glowColor: "rgba(181, 98, 59, 0.15)",
    pillBg: "bg-orange-50 text-orange-800 border-orange-200",
  },
  {
    value: "25+",
    unit: "CENTERS",
    title: "DISTRICT LEARNING CENTERS",
    desc: "Hybrid learning centers across Maharashtra empowering youth with modern computer labs, coding bootcamps, and global pathways.",
    icon: Laptop,
    accentColor: "#7c3aed",
    glowColor: "rgba(124, 58, 237, 0.15)",
    pillBg: "bg-purple-50 text-purple-800 border-purple-200",
  },
];

export default function OurImpact() {
  return (
    <section id="impact" className="relative bg-white border-t border-[#e2e5dc] py-20 sm:py-28 overflow-hidden">
      {/* Ambient background blur lighting */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25) 0%, rgba(181, 98, 59, 0.15) 50%, transparent 80%)",
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#059669]">
            <Sparkles size={14} /> Educational Excellence & Transformation
          </div>

          <h2 className="mt-4 text-3xl font-serif sm:text-5xl md:text-6xl font-bold text-[#24312d] tracking-tight">
            OUR EDUCATIONAL IMPACT
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-[#65706a] max-w-2xl mx-auto leading-relaxed">
            Real student transformation. Real global opportunities. See how our accredited language schools, coding bootcamps, and rural study libraries are creating lasting academic empowerment every day.
          </p>
        </div>

        {/* 4 Impact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {IMPACT_METRICS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl bg-white p-7 sm:p-8 transition-all duration-300 hover:-translate-y-3 flex flex-col justify-between border border-[#e2e5dc]"
                style={{
                  boxShadow: "0 10px 30px -10px rgba(36, 49, 45, 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px -12px ${item.glowColor}, 0 0 0 2px ${item.accentColor}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(36, 49, 45, 0.06)";
                }}
              >
                <div>
                  {/* Icon & Mini Pill */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className="flex h-13 w-13 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${item.accentColor}15`,
                        color: item.accentColor,
                      }}
                    >
                      <Icon size={26} />
                    </div>

                    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${item.pillBg}`}>
                      {item.unit}
                    </span>
                  </div>

                  {/* Primary Big Metric Number */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-serif text-5xl sm:text-6xl font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-105"
                      style={{ color: item.accentColor }}
                    >
                      {item.value}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 text-sm font-bold uppercase tracking-widest text-[#24312d]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 text-xs sm:text-sm text-[#65706a] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Subtle Bottom Accent Indicator */}
                <div className="mt-6 pt-4 border-t border-[#f0f2eb] flex items-center gap-1.5 text-[11px] font-semibold text-[#87938b]">
                  <CheckCircle2 size={13} style={{ color: item.accentColor }} />
                  <span>Verified Educational Track Record</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accountability & Transparency Bar */}
        <div className="mt-14 rounded-2xl border border-[#e2e5dc] bg-white p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#24312d]">
                100% Transparent Educational Non-Profit
              </p>
              <p className="text-xs text-[#65706a]">
                All student scholarship funds and classroom learning allocations are tracked through strict governance and social audits.
              </p>
            </div>
          </div>
          <a
            href="/donate"
            className="shrink-0 rounded-full bg-[#24312d] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#b5623b] transition shadow-xs"
          >
            Support Student Education →
          </a>
        </div>
      </div>
    </section>
  );
}
