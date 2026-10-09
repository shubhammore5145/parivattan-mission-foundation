import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Award,
  Briefcase,
  Sprout,
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
    description: "Quality education, foundational literacy, and international language fluency.",
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
    id: "women-empowerment",
    title: "WOMEN EMPOWERMENT",
    description: "Empowering adolescent girls & women through higher education and community leadership.",
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
    description: "Skill training, practical coding bootcamps, and career placement for youth.",
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
    description: "Helping rural communities and learners build sustainable, independent futures.",
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

          <p className="mt-4 text-sm sm:text-base text-[#65706a] leading-relaxed">
            Focused on grassroots impact across quality education, foreign language mastery, women empowerment, and youth livelihoods.
          </p>
        </div>

        {/* 4 Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROGRAMMES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-3xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Organic Fluid Shape Container for Icon */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[38%_62%_58%_42%_/_48%_52%_48%_52%] ${item.blobColor} transition-transform duration-500 ease-out group-hover:scale-110 shadow-xs`}
                    >
                      <Icon size={26} style={{ color: item.iconColor }} strokeWidth={2.2} />
                    </div>

                    <div>
                      <h3
                        className="font-serif text-lg font-bold tracking-wide"
                        style={{ color: item.iconColor }}
                      >
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-[#65706a] uppercase font-bold tracking-wider">
                        Active Grassroots Mission
                      </span>
                    </div>
                  </div>

                  {/* Mission Description */}
                  <p className="text-xs sm:text-sm text-[#24312d]/80 leading-relaxed font-sans mb-5">
                    {item.description}
                  </p>

                  {/* Bulleted Initiatives List */}
                  <div className="space-y-2 pt-3 border-t border-[#e2e5dc]/60 mb-5">
                    {item.initiatives.map((init, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#65706a]">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.iconColor }}
                        />
                        <span className="font-medium truncate">{init}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-4 border-t border-[#e2e5dc]">
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24312d] group-hover:text-[#b5623b] transition"
                  >
                    <span>Explore Programme Initiatives</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
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
              We welcome educators, language trainers, technologists, mentors, and volunteers to support our community learning and development centers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="rounded-full bg-white text-[#24312d] px-6 py-3 text-xs sm:text-sm font-bold hover:bg-stone-100 transition shadow-xs"
            >
              Get in Touch
            </Link>
            <Link
              to="/donate"
              className="rounded-full bg-[#e5a37f] text-[#24312d] px-6 py-3 text-xs sm:text-sm font-bold hover:bg-[#f2c5a8] transition shadow-xs"
            >
              Support a Cause
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
