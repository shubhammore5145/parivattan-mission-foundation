import React, { useState } from "react";
import { TEAM_MEMBERS, TeamMember } from "@/data/teamData";
import { 
  Users, 
  Sparkles, 
  Code, 
  Globe2, 
  Share2, 
  ShieldCheck, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  HeartHandshake, 
  Quote, 
  X,
  Award,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

type DepartmentFilter = "All" | "Leadership & Ops" | "Language Faculty" | "Tech & Creative" | "Media & Outreach";

export default function OurTeamSection() {
  const [selectedDept, setSelectedDept] = useState<DepartmentFilter>("All");
  const [activeModalMember, setActiveModalMember] = useState<TeamMember | null>(null);

  const filterMap: Record<DepartmentFilter, (member: TeamMember) => boolean> = {
    "All": () => true,
    "Leadership & Ops": (m) => m.department === "Leadership" || m.department === "Administration",
    "Language Faculty": (m) => m.department === "Language Faculty",
    "Tech & Creative": (m) => m.department === "Tech & Creative",
    "Media & Outreach": (m) => m.department === "Media & Outreach",
  };

  const filteredMembers = TEAM_MEMBERS.filter(filterMap[selectedDept]);
  const founder = TEAM_MEMBERS.find((m) => m.id === "kishor-bhagat");

  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case "Leadership":
        return <Briefcase className="w-3.5 h-3.5" />;
      case "Tech & Creative":
        return <Code className="w-3.5 h-3.5" />;
      case "Language Faculty":
        return <Globe2 className="w-3.5 h-3.5" />;
      case "Media & Outreach":
        return <Share2 className="w-3.5 h-3.5" />;
      case "Administration":
        return <ShieldCheck className="w-3.5 h-3.5" />;
      default:
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section id="team" className="relative py-16 md:py-24 bg-[#fbfaf7] text-[#24312d] overflow-hidden">
      {/* Background Decorative Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#24312d 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b5623b]/10 text-[#b5623b] text-xs md:text-sm font-semibold tracking-wide uppercase mb-4 border border-[#b5623b]/20 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#b5623b]" />
            <span>The Changemakers · 100% Dedicated</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d] tracking-tight">
            Meet The People Driving Parivattan
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#65706a] leading-relaxed">
            A united collective of grassroots educators, technologists, creative designers, and operational leaders 
            working tirelessly to provide international languages, technical skills, and bright career futures to every aspiring student.
          </p>
        </div>

        {/* Featured Founder Spotlight Card */}
        {founder && (
          <div className="mb-16 max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#24312d] via-[#1d2b27] to-[#141d1a] text-white p-8 sm:p-10 md:p-12 shadow-2xl ring-1 ring-white/10">
              {/* Glowing decorative circles */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#b5623b]/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid gap-8 md:grid-cols-[auto_1fr] items-center">
                {/* Founder Photo Frame */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-1 bg-gradient-to-tr from-[#b5623b] via-amber-300 to-[#e5a37f] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                      <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#24312d] relative">
                        <img 
                          src={founder.image} 
                          alt={founder.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (founder.fallbackImage && target.src !== founder.fallbackImage) {
                              target.src = founder.fallbackImage;
                            } else {
                              target.style.display = "none";
                            }
                          }}
                        />
                      </div>
                    </div>
                    <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#b5623b] to-amber-600 text-white p-2.5 rounded-2xl shadow-xl ring-4 ring-[#24312d]">
                      <Award className="w-5 h-5" />
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#b5623b]/30 text-amber-200 border border-[#b5623b]/50">
                    <Briefcase className="w-3.5 h-3.5" />
                    Foundation Leadership
                  </span>
                </div>

                {/* Founder Content */}
                <div className="space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                      {founder.name}
                    </h3>
                    <p className="text-base sm:text-lg font-medium text-amber-300 mt-1">
                      {founder.role} · Parivattan Mission Foundation
                    </p>
                  </div>

                  <p className="text-slate-200 text-base sm:text-lg leading-relaxed italic border-l-2 border-amber-400/40 pl-4 py-1">
                    "{founder.quote || founder.bio}"
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {founder.bio}
                  </p>

                  {/* Highlights pills */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                    {founder.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 backdrop-blur-xs border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {(["All", "Leadership & Ops", "Language Faculty", "Tech & Creative", "Media & Outreach"] as DepartmentFilter[]).map((tab) => {
            const count = tab === "All" 
              ? TEAM_MEMBERS.length 
              : TEAM_MEMBERS.filter(filterMap[tab]).length;
            
            const isActive = selectedDept === tab;

            return (
              <button
                key={tab}
                onClick={() => setSelectedDept(tab)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#b5623b] text-white shadow-lg shadow-[#b5623b]/25 ring-2 ring-[#b5623b]/30 -translate-y-0.5"
                    : "bg-white text-[#65706a] hover:bg-[#eef0e8] hover:text-[#24312d] border border-[#e1e3d9] hover:shadow-xs"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-[#eef0e8] text-[#65706a]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Team Members Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              onClick={() => setActiveModalMember(member)}
              className="group relative flex flex-col rounded-3xl bg-white overflow-hidden border border-[#e5e2d9] shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ring-1 ring-black/[0.03] hover:ring-[#b5623b]/40"
            >
              {/* Photo Area with Aspect Ratio */}
              <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-gradient-to-b from-[#24312d]/5 to-[#24312d]/15">
                {/* Fallback avatar backdrop with initials */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr ${member.colorScheme.avatarBg}`}>
                  <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-serif text-3xl font-bold text-white shadow-xl">
                    {member.initials}
                  </div>
                  <span className="mt-2 text-xs font-semibold text-white/80 tracking-wide">
                    {member.role}
                  </span>
                </div>

                <img
                  src={member.image}
                  alt={member.name}
                  className="relative z-1 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (member.fallbackImage && target.src !== member.fallbackImage) {
                      target.src = member.fallbackImage;
                    } else {
                      target.style.display = "none";
                    }
                  }}
                />

                {/* Subtle gradient overlay at bottom of photo */}
                <div className="absolute inset-0 z-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

                {/* Department Badge on Photo */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border shadow-xs ${member.colorScheme.badgeBg} ${member.colorScheme.badgeText}`}
                  >
                    {getDeptIcon(member.department)}
                    <span>{member.departmentLabel}</span>
                  </span>
                </div>

                {/* Quick overlay name on top of photo */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white">
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide group-hover:text-amber-200 transition-colors drop-shadow-md">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-white/90 drop-shadow-xs">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow justify-between bg-white">
                <p className="text-xs sm:text-sm text-[#65706a] leading-relaxed line-clamp-3 mb-4">
                  {member.bio}
                </p>

                {/* Tags & Action Link */}
                <div className="pt-3 border-t border-[#f0eee6] space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {member.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-[#f5f4ef] text-[#65706a] border border-[#e7e5dc]"
                      >
                        {tag}
                      </span>
                    ))}
                    {member.tags.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-semibold text-[#b5623b] bg-[#b5623b]/10">
                        +{member.tags.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-[#b5623b] group-hover:text-[#954b2c]">
                    <span className="flex items-center gap-1">
                      View Profile & Story
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="w-6 h-6 rounded-full bg-[#b5623b]/10 flex items-center justify-center text-[#b5623b] group-hover:bg-[#b5623b] group-hover:text-white transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Join / Volunteer Callout Banner */}
        <div className="mt-16 sm:mt-20 rounded-3xl bg-gradient-to-r from-[#24312d] via-[#2f423d] to-[#1c2724] text-white p-8 sm:p-10 md:p-12 shadow-xl ring-1 ring-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b5623b]/30 text-amber-200 border border-[#b5623b]/40 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Grow With Parivattan Movement</span>
            </div>
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">
              Want to join our mission or mentor learners?
            </h4>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We welcome native language trainers, passionate web developers, community leaders, and student interns who want to create lasting, tangible educational impact.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#24312d] px-6 py-3.5 text-sm font-bold shadow-md hover:bg-amber-100 transition-all hover:scale-105"
            >
              <span>Connect With Us</span>
              <ArrowRight className="w-4 h-4 text-[#b5623b]" />
            </Link>
            <Link
              to="/admissions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#b5623b] text-white px-6 py-3.5 text-sm font-bold shadow-lg hover:bg-[#954b2c] transition-all hover:scale-105"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Programs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Member Detail Lightbox / Modal */}
      {activeModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#e5e2d9] overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveModalMember(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-[180px_1fr] items-start">
                {/* Photo */}
                <div className="mx-auto sm:mx-0 w-44 sm:w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border-2 border-[#b5623b]/20 bg-[#24312d] relative">
                  {/* Fallback avatar backdrop with initials */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr ${activeModalMember.colorScheme.avatarBg}`}>
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-serif text-2xl font-bold text-white shadow-xl">
                      {activeModalMember.initials}
                    </div>
                  </div>

                  <img
                    src={activeModalMember.image}
                    alt={activeModalMember.name}
                    className="relative z-1 w-full h-full object-cover object-top"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (activeModalMember.fallbackImage && target.src !== activeModalMember.fallbackImage) {
                        target.src = activeModalMember.fallbackImage;
                      } else {
                        target.style.display = "none";
                      }
                    }}
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${activeModalMember.colorScheme.badgeBg} ${activeModalMember.colorScheme.badgeText}`}
                    >
                      {getDeptIcon(activeModalMember.department)}
                      <span>{activeModalMember.departmentLabel}</span>
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#24312d] mt-2">
                      {activeModalMember.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#b5623b]">
                      {activeModalMember.role}
                    </p>
                  </div>

                  {activeModalMember.quote && (
                    <blockquote className="p-3.5 rounded-2xl bg-[#fbfaf7] border-l-4 border-[#b5623b] text-xs sm:text-sm italic text-[#65706a] flex gap-2">
                      <Quote className="w-4 h-4 text-[#b5623b] shrink-0 mt-0.5" />
                      <span>"{activeModalMember.quote}"</span>
                    </blockquote>
                  )}

                  <p className="text-sm text-[#65706a] leading-relaxed">
                    {activeModalMember.bio}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#24312d]">
                      Core Expertise & Focus
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeModalMember.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eef0e8] text-[#24312d] border border-[#e1e3d9]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#fbfaf7] border-t border-[#e5e2d9] flex justify-end gap-3">
              <button
                onClick={() => setActiveModalMember(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#65706a] hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/contact"
                onClick={() => setActiveModalMember(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#b5623b] text-white hover:bg-[#954b2c] transition-colors"
              >
                <span>Connect via Contact</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
