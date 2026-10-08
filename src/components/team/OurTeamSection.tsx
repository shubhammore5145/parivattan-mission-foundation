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
  HeartHandshake
} from "lucide-react";
import { Link } from "react-router-dom";

type DepartmentFilter = "All" | "Leadership & Admin" | "Tech & Creative" | "Language Faculty" | "Media & Outreach";

export default function OurTeamSection() {
  const [selectedDept, setSelectedDept] = useState<DepartmentFilter>("All");

  const filterMap: Record<DepartmentFilter, (member: TeamMember) => boolean> = {
    "All": () => true,
    "Leadership & Admin": (m) => m.department === "Leadership" || m.department === "Administration",
    "Tech & Creative": (m) => m.department === "Tech & Creative",
    "Language Faculty": (m) => m.department === "Language Faculty",
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
    <section id="team" className="py-16 md:py-24 bg-[#fbfaf7] text-[#24312d]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b5623b]/10 text-[#b5623b] text-xs md:text-sm font-semibold tracking-wide uppercase mb-4">
            <Users className="w-4 h-4" />
            <span>The People Behind The Movement</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d] tracking-tight">
            Meet Our Dedicated Team
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#65706a] leading-relaxed">
            A passionate collective of educators, technologists, creators, and grassroots leaders 
            united by a shared mission: empowering learners with practical skills, foreign languages, and life-changing pathways.
          </p>
        </div>

        {/* Featured Founder Spotlight Card */}
        {founder && (
          <div className="mb-14 max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#24312d] via-[#2f423d] to-[#1c2724] text-white p-8 md:p-12 shadow-xl ring-1 ring-white/10">
              {/* Decorative background blurs */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#b5623b]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#e5a37f]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid gap-8 md:grid-cols-[auto_1fr] items-center">
                {/* Founder Avatar */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-tr from-[#b5623b] via-[#e5a37f] to-amber-200 p-1 shadow-2xl">
                      <div className="w-full h-full rounded-[14px] bg-[#24312d] flex items-center justify-center font-serif text-3xl md:text-4xl font-bold text-amber-200">
                        {founder.initials}
                      </div>
                    </div>
                    <span className="absolute -bottom-2 -right-2 bg-[#b5623b] text-white p-2 rounded-xl shadow-lg ring-2 ring-[#24312d]">
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#b5623b]/30 text-amber-200 border border-[#b5623b]/40">
                    Foundation Leadership
                  </span>
                </div>

                {/* Founder Info & Statement */}
                <div className="space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">
                      {founder.name}
                    </h3>
                    <p className="text-lg font-medium text-[#e5a37f]">
                      {founder.role} · Parivattan Mission Foundation
                    </p>
                  </div>
                  <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                    "{founder.bio}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {(["All", "Leadership & Admin", "Tech & Creative", "Language Faculty", "Media & Outreach"] as DepartmentFilter[]).map((tab) => {
            const count = tab === "All" 
              ? TEAM_MEMBERS.length 
              : TEAM_MEMBERS.filter(filterMap[tab]).length;
            
            const isActive = selectedDept === tab;

            return (
              <button
                key={tab}
                onClick={() => setSelectedDept(tab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-[#b5623b] text-white shadow-md shadow-[#b5623b]/20"
                    : "bg-white text-[#65706a] hover:bg-[#eef0e8] hover:text-[#24312d] border border-[#e1e3d9]"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Team Members Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className="group relative flex flex-col justify-start rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e7e5de] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-[#b5623b]/30"
            >
              {/* Card Top: Department & Icon */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${member.colorScheme.badgeBg} ${member.colorScheme.badgeText}`}
                >
                  {getDeptIcon(member.department)}
                  <span>{member.departmentLabel}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  #{member.order.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${member.colorScheme.avatarBg} p-0.5 shadow-md shrink-0 flex items-center justify-center`}
                >
                  <div className="w-full h-full rounded-[14px] bg-[#24312d]/10 backdrop-blur-xs flex items-center justify-center font-serif text-lg font-bold text-white">
                    {member.initials}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#24312d] group-hover:text-[#b5623b] transition-colors leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#b5623b] mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Bio / Information */}
              <p className="text-xs sm:text-sm text-[#65706a] leading-relaxed">
                {member.bio}
              </p>
            </article>
          ))}
        </div>

        {/* Join / Volunteer Callout Banner */}
        <div className="mt-16 rounded-3xl bg-[#eef0e8] p-8 md:p-10 border border-[#e1e3d9] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b5623b] uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Grow With Parivattan</span>
            </div>
            <h4 className="text-2xl font-serif font-bold text-[#24312d]">
              Want to join our mission or mentor learners?
            </h4>
            <p className="text-sm text-[#65706a] max-w-xl">
              We welcome passionate trainers, web developers, community educators, and student volunteers who want to make a lasting difference.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#24312d] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#344641] transition"
            >
              <span>Connect With Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admissions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#b5623b] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#954b2c] transition"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Programs</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
