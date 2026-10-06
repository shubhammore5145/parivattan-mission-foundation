import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users2,
  Award,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Refundable Deposit",
    subtitle: "Zero Net Tuition for Sincere Learners",
    description:
      "For certified Japanese programs, pass your official exam criteria and claim your full ₹2,000 security deposit back. We believe financial constraints should never block academic ambition.",
    badge: "Student Guarantee",
    accent: "#b5623b",
    bg: "bg-[#b5623b]/10",
    border: "hover:border-[#b5623b]/40",
  },
  {
    icon: Users2,
    title: "Strict 25–30 Seat Batches",
    subtitle: "Individual Attention & Speaking Time",
    description:
      "Unlike crowded commercial lecture halls with 100+ students, we cap every batch strictly between 20 to 30 students so each learner receives regular pronunciation drills, homework review, and speaking feedback.",
    badge: "Personal Mentorship",
    accent: "#059669",
    bg: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
  },
  {
    icon: Award,
    title: "Internationally Certified Curriculum",
    subtitle: "JLPT, Goethe-Institut & DELF Aligned",
    description:
      "Courses are meticulously structured according to global CEFR and Japan Foundation benchmarks. Learn authentic grammar, phonetics, script mastery, and take timed mock tests.",
    badge: "Global Standard",
    accent: "#0284c7",
    bg: "bg-sky-50 text-sky-700",
    border: "hover:border-sky-300",
  },
  {
    icon: Compass,
    title: "Direct Career & Overseas Pathways",
    subtitle: "Japan SSW Visas & European Universities",
    description:
      "Language learning is your passport. We provide complete guidance for Japan Specified Skilled Worker (SSW) visas, tuition-free German universities, and technical MNC interview preparation.",
    badge: "Career Support",
    accent: "#7c3aed",
    bg: "bg-purple-50 text-purple-700",
    border: "hover:border-purple-300",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="page-section bg-white border-t border-[#e2e5dc] py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
            <Sparkles size={14} /> The Parivattan Advantage
          </div>
          <h2 className="mt-4 text-3xl font-serif sm:text-4xl md:text-5xl font-bold text-[#24312d] tracking-tight">
            Why Learn With Parivattan?
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#65706a] leading-relaxed">
            We are a mission-driven NGO foundation providing premier international language education with unmatched affordability, transparent refunds, and dedicated batch sizes.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-3xl border border-[#e2e5dc] bg-[#fbfaf7] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${pillar.border} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xs"
                      style={{ backgroundColor: `${pillar.accent}15`, color: pillar.accent }}
                    >
                      <Icon size={28} />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white border border-[#e2e5dc] text-[#48534e]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d] group-hover:text-[#b5623b] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#87938b] mt-1 mb-4">
                    {pillar.subtitle}
                  </p>
                  <p className="text-sm text-[#65706a] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#e2e5dc]/60 flex items-center gap-2 text-xs font-bold text-[#24312d] group-hover:text-[#b5623b]">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Verified NGO Accreditation & Transparent Terms</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action Banner */}
        <div className="mt-14 rounded-2xl bg-[#24312d] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center sm:text-left">
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Ready to begin your language journey?
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Limited seats are allotted on a first-come, first-served basis. Secure your spot before batch capacity fills.
            </p>
          </div>
          <Link
            to="/admissions"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#e5a37f] text-[#24312d] px-7 py-3.5 text-xs sm:text-sm font-bold hover:bg-[#f2c5a8] transition shadow-md hover:-translate-y-0.5"
          >
            <span>Apply for Admission</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
