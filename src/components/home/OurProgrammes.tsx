import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  HeartPulse,
  Award,
  Briefcase,
  Sprout,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

interface Programme {
  id: string;
  title: string;
  description: string;
  initiatives: string[];
  icon: React.ElementType;
  blobColor: string;
  iconColor: string;
  textColor: string;
  tagColor: string;
  link: string;
}

const PROGRAMMES: Programme[] = [
  {
    id: "education",
    title: "EDUCATION",
    description: "Education, nutrition and holistic development of children.",
    initiatives: [
      "Parivattan Foreign Language School",
      "Sau Library Campaign",
      "Foundational Learning Hubs",
    ],
    icon: BookOpen,
    blobColor: "bg-[#fef3c7]",
    iconColor: "#d97706",
    textColor: "text-[#b45309]",
    tagColor: "bg-amber-50 text-amber-800 border-amber-200",
    link: "/initiatives#languages",
  },
  {
    id: "healthcare",
    title: "HEALTHCARE",
    description: "Taking healthcare services to doorsteps of hard to reach communities.",
    initiatives: [
      "Health For All Outreach",
      "Free Preventive Health Camps",
      "Maternal & Child Nutrition",
    ],
    icon: HeartPulse,
    blobColor: "bg-[#ede9fe]",
    iconColor: "#7c3aed",
    textColor: "text-[#6d28d9]",
    tagColor: "bg-purple-50 text-purple-800 border-purple-200",
    link: "/initiatives",
  },
  {
    id: "women-empowerment",
    title: "WOMEN EMPOWERMENT",
    description: "Empowering adolescent girls & women through community engagement.",
    initiatives: [
      "Savitribai Phule Higher Ed Fund",
      "Girls Hostel & Tuition Grants",
      "Financial Literacy Circles",
    ],
    icon: Award,
    blobColor: "bg-[#ccfbf1]",
    iconColor: "#0f766e",
    textColor: "text-[#0f766e]",
    tagColor: "bg-teal-50 text-teal-800 border-teal-200",
    link: "/initiatives",
  },
  {
    id: "livelihood",
    title: "LIVELIHOOD",
    description: "Skill training and placement support for underprivileged youth.",
    initiatives: [
      "Parivattan Coding & Tech School",
      "Bilingual Overseas IT Pathways",
      "Practical Employment Coaching",
    ],
    icon: Briefcase,
    blobColor: "bg-[#ffedd5]",
    iconColor: "#c2410c",
    textColor: "text-[#c2410c]",
    tagColor: "bg-orange-50 text-orange-800 border-orange-200",
    link: "/admissions",
  },
  {
    id: "grassroots",
    title: "EMPOWERING GRASSROOTS",
    description: "Helping community-based organizations become locally sustainable.",
    initiatives: [
      "Village Study Centers",
      "Youth Leadership Mentorship",
      "Community Resource Centers",
    ],
    icon: Sprout,
    blobColor: "bg-[#dcfce7]",
    iconColor: "#15803d",
    textColor: "text-[#15803d]",
    tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    link: "/about",
  },
  {
    id: "disaster-response",
    title: "DISASTER RESPONSE",
    description: "Reach out and respond to the needs of the disaster-affected people.",
    initiatives: [
      "Disaster Aid Rapid Response",
      "Emergency Ration & Medical Kits",
      "Post-Crisis Rehabilitation",
    ],
    icon: HeartHandshake,
    blobColor: "bg-[#ffe4e6]",
    iconColor: "#e11d48",
    textColor: "text-[#be123c]",
    tagColor: "bg-rose-50 text-rose-800 border-rose-200",
    link: "/donate",
  },
];

export default function OurProgrammes() {
  return (
    <section id="programmes" className="page-section bg-white border-t border-[#e2e5dc] py-20 sm:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#b5623b]">
            <Sparkles size={14} /> Core Pillars of Transformation
          </div>

          <h2 className="mt-4 text-3xl font-serif sm:text-5xl md:text-6xl font-bold text-[#24312d] tracking-tight">
            OUR PROGRAMMES
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-[#65706a] max-w-2xl mx-auto leading-relaxed">
            From grassroots education and health access to livelihood generation and disaster relief, our dedicated programs touch every dimension of human dignity.
          </p>
        </div>

        {/* 6 Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PROGRAMMES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-3xl border border-[#e2e5dc] bg-[#fbfaf7] p-7 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Organic Fluid Shape Container for Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[38%_62%_58%_42%_/_48%_52%_48%_52%] ${item.blobColor} transition-transform duration-500 ease-out group-hover:scale-110 shadow-xs`}
                    >
                      <Icon size={28} style={{ color: item.iconColor }} strokeWidth={2.2} />
                    </div>

                    <div>
                      <h3
                        className={`text-lg sm:text-xl font-bold tracking-wider uppercase ${item.textColor}`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#87938b]">
                        Active Grassroots Mission
                      </span>
                    </div>
                  </div>

                  {/* Primary Description from user's screenshot */}
                  <p className="text-sm sm:text-base text-[#48534e] font-medium leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Specific Key Initiatives Badges */}
                  <div className="space-y-1.5 pt-2">
                    {item.initiatives.map((init, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-semibold text-[#65706a]"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.iconColor }}
                        />
                        <span>{init}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="mt-6 pt-4 border-t border-[#e2e5dc]/70">
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24312d] transition-all duration-200 group-hover:text-[#b5623b]"
                  >
                    <span>Explore Programme Initiatives</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-[#24312d] to-[#34463e] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center md:text-left">
            <h4 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Want to partner or volunteer in our programmes?
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              We welcome doctors, educators, language trainers, and volunteers to support our community learning and healthcare centers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="rounded-full bg-white text-[#24312d] px-6 py-3 text-xs sm:text-sm font-bold hover:bg-stone-100 transition shadow-xs"
            >
              Get in Touch
            </Link>
            <a
              href="#donate"
              className="rounded-full bg-[#e5a37f] text-[#24312d] px-6 py-3 text-xs sm:text-sm font-bold hover:bg-[#f2c5a8] transition shadow-xs"
            >
              Support a Cause
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
