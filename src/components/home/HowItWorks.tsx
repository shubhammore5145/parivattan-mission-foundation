import React from "react";
import { Link } from "react-router-dom";
import {
  Globe2,
  FileCheck2,
  BookOpenCheck,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Select Language & Batch",
    desc: "Browse Japanese (JLPT), German (Goethe), English or French. Choose your preferred batch (Morning or Evening).",
    icon: Globe2,
    badge: "Step 1",
  },
  {
    step: "02",
    title: "Apply & Reserve Seat",
    desc: "Submit your online admission form. Batch sizes are strictly capped at 25–30 students to guarantee individual attention.",
    icon: FileCheck2,
    badge: "Step 2",
  },
  {
    step: "03",
    title: "Attend Interactive Training",
    desc: "Engage in daily/regular live lectures, script & vocabulary drills, audio listening labs, and conversational speaking sessions.",
    icon: BookOpenCheck,
    badge: "Step 3",
  },
  {
    step: "04",
    title: "Exam, Certificate & Refund",
    desc: "Take your official international certification exam. Receive verified credentials and claim your 100% security deposit refund.",
    icon: GraduationCap,
    badge: "Step 4",
  },
];

export default function HowItWorks() {
  return (
    <section className="page-section bg-[#fbfaf7] border-t border-[#e2e5dc] py-20 sm:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
            <Sparkles size={14} /> Clear Pathway
          </div>
          <h2 className="mt-4 text-3xl font-serif sm:text-4xl md:text-5xl font-bold text-[#24312d] tracking-tight">
            How It Works: 4 Simple Steps
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#65706a] leading-relaxed">
            From your first day of class to international certification and overseas opportunities — here is your structured journey with us.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative rounded-3xl border border-[#e2e5dc] bg-white p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#b5623b]/40 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Step Number and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24312d] text-white font-serif font-bold text-lg shadow-2xs group-hover:bg-[#b5623b] transition-colors">
                      {step.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6eee8] text-[#b5623b]">
                      <Icon size={20} />
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#24312d] group-hover:text-[#b5623b] transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-[#65706a] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f0f2eb]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#87938b] group-hover:text-[#b5623b]">
                    {step.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Link to Schedule */}
        <div className="mt-12 text-center">
          <Link
            to="/courses#schedules"
            className="inline-flex items-center gap-2 rounded-full border border-[#24312d] bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#24312d] hover:bg-[#24312d] hover:text-white transition shadow-2xs"
          >
            <span>View All Batch Schedules & Timings</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
