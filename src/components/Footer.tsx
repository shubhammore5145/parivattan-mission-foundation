import React from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowRight,
  Youtube,
  Shield,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Visitors from './Visitors';

// Authentic UN Sustainable Development Goals (SDGs)
interface SdgGoal {
  number: number;
  title: string;
  tagline: string;
  bgColor: string;
  icon: React.ReactNode;
}

const SDG_GOALS: SdgGoal[] = [
  {
    number: 1,
    title: "NO POVERTY",
    tagline: "Breaking poverty cycles through education & empowerment",
    bgColor: "#e5243b",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M16 4a2 2 0 100-4 2 2 0 000 4zM16 6c-1.4 0-2.6.8-3.2 2H11c-.6-1.2-1.8-2-3.2-2-2 0-3.8 1.6-3.8 3.5V13h2v7h3v-7h1v7h3v-7h2V9.5C20 7.6 18 6 16 6zM8 4a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
    ),
  },
  {
    number: 2,
    title: "ZERO HUNGER",
    tagline: "Child nutrition, school meal kits & disaster relief food",
    bgColor: "#dda63a",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 11h16a8 8 0 01-16 0z" fill="currentColor" stroke="none" />
        <path d="M4 11h16" />
        <path d="M8 7c0-2 1-3 1-3s1 1 1 3" />
        <path d="M12 7c0-2 1-3 1-3s1 1 1 3" />
        <path d="M16 7c0-2 1-3 1-3s1 1 1 3" />
        <path d="M8 19h8" />
      </svg>
    ),
  },
  {
    number: 3,
    title: "GOOD HEALTH & WELL-BEING",
    tagline: "Doorstep health camps, preventive tests & maternal care",
    bgColor: "#4c9f38",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.5 12h4l2-4 3 8 2-5 2 2h4" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    number: 4,
    title: "QUALITY EDUCATION",
    tagline: "Accredited foreign languages, libraries & tech bootcamps",
    bgColor: "#c5192d",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
        <path d="M6 14h6" />
        <path d="M18 18l4-4" />
      </svg>
    ),
  },
  {
    number: 5,
    title: "GENDER EQUALITY",
    tagline: "Savitribai Phule girls education & women leadership circles",
    bgColor: "#ff3a21",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="9" r="6" />
        <path d="M12 15v7" />
        <path d="M9 19h6" />
        <path d="M9 8h6" />
        <path d="M9 11h6" />
        <path d="M16.5 4.5l4-4" />
        <path d="M17 0.5h3.5V4" />
      </svg>
    ),
  },
  {
    number: 8,
    title: "DECENT WORK & ECONOMIC GROWTH",
    tagline: "Bilingual IT jobs, Japan SSW pathways & youth livelihood",
    bgColor: "#a21942",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 3v18h18" />
        <path d="M7 16v-4" />
        <path d="M11 16V9" />
        <path d="M15 16V6" />
        <path d="M19 16V3" />
        <path d="M7 12l4-3 4-3 4-3" />
      </svg>
    ),
  },
  {
    number: 10,
    title: "REDUCED INEQUALITIES",
    tagline: "Equal global access for first-generation rural students",
    bgColor: "#dd1367",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 10h8" strokeWidth="2.5" />
        <path d="M8 14h8" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    number: 17,
    title: "PARTNERSHIPS FOR THE GOALS",
    tagline: "Active NGO networks, grassroots collaboration & volunteer corps",
    bgColor: "#19486a",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="5" r="3" />
        <circle cx="5" cy="17" r="3" />
        <circle cx="19" cy="17" r="3" />
        <path d="M12 8v4" />
        <path d="M7.5 15.5l3-2.5" />
        <path d="M16.5 15.5l-3-2.5" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#24312d] text-white">
      {/* UN Sustainable Development Goals (SDGs) Section */}
      <div className="border-b border-white/10 bg-[#1b2522] py-16 sm:py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#f2c5a8] border border-white/10 shadow-2xs">
                <Sparkles size={13} className="text-[#f2c5a8]" />
                <span>United Nations Agenda 2030</span>
              </div>
              <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                Committed to the UN Sustainable Development Goals
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-light">
                Parivattan Mission Foundation actively aligns its grassroots educational, healthcare, and livelihood initiatives with the United Nations Global Goals.
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0 text-center sm:text-right">
              <div>
                <span className="font-serif text-3xl font-bold text-[#f2c5a8]">17</span>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Global Goals</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div>
                <span className="font-serif text-3xl font-bold text-emerald-400">8</span>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Active SDGs</p>
              </div>
            </div>
          </div>

          {/* SDG Goal Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {SDG_GOALS.map((goal) => (
              <div
                key={goal.number}
                className="group relative rounded-2xl p-4 sm:p-5 text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between overflow-hidden cursor-default min-h-[160px] sm:min-h-[180px]"
                style={{ backgroundColor: goal.bgColor }}
              >
                {/* Top Row: Number and Icon */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-serif font-extrabold text-2xl sm:text-3xl leading-none">
                      {goal.number}
                    </span>
                    <div className="opacity-90 group-hover:scale-110 transition-transform duration-300">
                      {goal.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h5 className="font-bold text-xs sm:text-[13px] leading-tight tracking-wide uppercase">
                    {goal.title}
                  </h5>
                </div>

                {/* Subtle Hover Reveal Tooltip / Tagline */}
                <div className="mt-3 pt-2 border-t border-white/20">
                  <p className="text-[10px] sm:text-[11px] leading-snug text-white/90 font-medium">
                    {goal.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* SDG Bottom Banner */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <span>Certified social action advancing health, gender equity & universal education.</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Department of Economic and Social Affairs • United Nations SDGs
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-8 pt-16 pb-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Logo Section */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-2xl mb-4 border border-white/10">
                <img
                  className="h-10 w-auto object-contain rounded"
                  src="/img/parivattanE.png"
                  alt="Parivattan Mission Foundation"
                />
              </Link>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                Parivattan Mission Foundation
              </h3>
              <div className="w-16 h-1 bg-[#e5a37f] mb-4 rounded-full" />
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                Foreign language learning and educational empowerment. Delivering accredited training in Japanese, German, English, and French alongside community development.
              </p>
            </div>

            {/* Social Media Links */}
            <div>
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
                Connect With Us
              </h5>
              <div className="flex space-x-3">
                {[
                  { icon: Linkedin, href: 'https://www.linkedin.com/in/parivattan-mission-foundation-55b054376?utm_source=share_via&utm_content=profile&utm_medium=member_android', label: 'LinkedIn' },
                  { icon: Facebook, href: 'https://www.facebook.com/share/1GrmV9sNzE/', label: 'Facebook' },
                  { icon: Instagram, href: 'https://www.instagram.com/parivattan_mission_foundation', label: 'Instagram' },
                  { icon: Twitter, href: 'https://x.com/ParivattanMF', label: 'Twitter' },
                  { icon: Youtube, href: 'https://youtube.com/@parivattanmissionfoundation?si=2DO8HxNu_AgDC5l9', label: 'YouTube' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-[#b5623b] hover:border-[#b5623b] transition-all duration-300"
                  >
                    <social.icon size={17} className="text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-5">
              Quick Links
            </h5>
            <nav className="space-y-2.5 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Our Team', href: '/team' },
                { label: 'Courses', href: '/courses' },
                { label: 'Admissions', href: '/admissions' },
                { label: 'Student Portal (PRN Check)', href: '/student' },
                { label: 'Rules & Regulations', href: '/rules' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Donate', href: '/donate' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="group flex items-center text-slate-400 hover:text-[#f2c5a8] transition-colors duration-200"
                >
                  <ArrowRight
                    size={12}
                    className="mr-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#e5a37f]"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Language Courses List */}
          <div className="lg:col-span-3">
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-5">
              Language Programs
            </h5>
            <div className="space-y-3 text-xs">
              <Link
                to="/courses/japanese"
                className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#e5a37f]/50 hover:bg-white/10 transition group"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-white">
                  <span>🇯🇵 Japanese Language</span>
                  <span className="text-[10px] text-[#e5a37f]">N5, N4, N3</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">Morning & Evening batches • 6–7 Months</p>
              </Link>

              <Link
                to="/courses/german"
                className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#e5a37f]/50 hover:bg-white/10 transition group"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-white">
                  <span>🇩🇪 German Language</span>
                  <span className="text-[10px] text-[#e5a37f]">A1, A2</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">Weekend batches • 3–4.5 Months</p>
              </Link>

              <Link
                to="/courses/english"
                className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#e5a37f]/50 hover:bg-white/10 transition group"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-white">
                  <span>🇬🇧 English Language</span>
                  <span className="text-[10px] text-[#e5a37f]">Basic Fluency</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">Daily weekday evening • 3 Months</p>
              </Link>

              <Link
                to="/courses/french"
                className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#e5a37f]/50 hover:bg-white/10 transition group"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-white">
                  <span>🇫🇷 French Language</span>
                  <span className="text-[10px] text-[#e5a37f]">DELF A1</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">Daily weekday evening • 3 Months</p>
              </Link>
            </div>
          </div>

          {/* Contact Information & Registration */}
          <div className="lg:col-span-3">
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-5">
              Contact & Inquiries
            </h5>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 shrink-0 text-[#e5a37f]">
                  <MapPin size={16} />
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  RS Complex, S7, Tuljapur Naldurg Road,<br />
                  Devsinga (Tul), Tuljapur, Dharashiv (Osmanabad),<br />
                  Maharashtra, India – 413601
                </p>
              </div>

              <div className="flex items-center group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 shrink-0 text-[#e5a37f]">
                  <Phone size={16} />
                </div>
                <a
                  href="tel:+917820831901"
                  className="text-slate-300 hover:text-[#f2c5a8] transition-colors text-xs font-medium"
                >
                  +91 7820831901 / +91 8767674251
                </a>
              </div>

              <div className="flex items-center group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 shrink-0 text-[#e5a37f]">
                  <Mail size={16} />
                </div>
                <a
                  href="mailto:contact@parivattan.org"
                  className="text-slate-300 hover:text-[#f2c5a8] transition-colors text-xs font-medium"
                >
                  contact@parivattan.org
                </a>
              </div>

              <div className="pt-2">
                <Link
                  to="/admissions"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b5623b] px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-[#954b2c] transition"
                >
                  <GraduationCap size={15} />
                  <span>Apply for Admissions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#2d4038]">
        <Visitors />
      </div>

      {/* Bottom Bar strictly with Copyright text: "© 2026 All Rights Reserved." */}
      <div className="border-t border-white/10 bg-[#1b2723]">
        <div className="container mx-auto px-6 lg:px-8 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-300">
                &copy; 2026 Parivattan Mission Foundation. All Rights Reserved.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link to="/courses" className="hover:text-[#f2c5a8] transition-colors">
                Courses
              </Link>
              <Link to="/admissions" className="hover:text-[#f2c5a8] transition-colors">
                Admissions
              </Link>
              <Link to="/rules" className="hover:text-[#f2c5a8] transition-colors">
                Rules & Regulations
              </Link>
              <Link to="/privacy-policy" className="hover:text-[#f2c5a8] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-[#f2c5a8] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
