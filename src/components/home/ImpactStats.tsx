import React from "react";
import { Users, Globe2, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

const STATS = [
  {
    icon: Users,
    value: "1,200+",
    label: "Students Empowered",
    subtext: "Across Maharashtra & Beyond",
    accent: "#b5623b",
    bg: "bg-[#b5623b]/10",
  },
  {
    icon: Globe2,
    value: "4 Global",
    label: "Accredited Languages",
    subtext: "Japanese, German, English, French",
    accent: "#0284c7",
    bg: "bg-sky-50 text-sky-700",
  },
  {
    icon: Award,
    value: "95%+",
    label: "Exam Pass Rate",
    subtext: "JLPT, Goethe & DELF Clearance",
    accent: "#059669",
    bg: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Deposit Refundable",
    subtext: "Upon Qualifying Exam Conditions*",
    accent: "#d97706",
    bg: "bg-amber-50 text-amber-700",
  },
];

export default function ImpactStats() {
  return (
    <section className="relative -mt-6 sm:-mt-8 z-20 px-4 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#f0f2eb]">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`flex flex-col items-center sm:items-start text-center sm:text-left ${
                  i > 0 ? "pt-5 sm:pt-0 sm:pl-6" : ""
                }`}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl mb-3 shadow-2xs"
                  style={{ backgroundColor: `${stat.accent}15`, color: stat.accent }}
                >
                  <Icon size={22} />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#24312d] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#48534e] mt-0.5">
                  {stat.label}
                </div>
                <div className="text-[11px] text-[#87938b] mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
