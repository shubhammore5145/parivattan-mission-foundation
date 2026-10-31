import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, GraduationCap, Home, BookOpen, UserCheck, Phone, Camera, ArrowRight, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for Side Menu (Escape key closes drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when side drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const openAdminDashboard = () => {
    window.open('/admin', '_blank');
  };

  // Handle navigation - if on homepage, scroll to section; if on other page, navigate to homepage first
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    if (location.pathname === '/') {
      // On homepage, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On other pages, navigate to homepage with hash
      navigate('/#' + sectionId);
    }
    setMobileMenuOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  const handleDonatePageClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/donate');
    setMobileMenuOpen(false);
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full
         ${
        isScrolled
          ? "py-2 bg-white/95 backdrop-blur-lg shadow-[0_10px_30px_-20px_rgba(36,49,45,0.7)] border-b border-[#e1e3d9]"
          : "py-3 sm:py-4 bg-gradient-to-b from-[#24312d]/55 to-transparent"
      }
        `
      }
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-5 px-4">
        <a 
          href="/" 
          className="flex items-center bg-white px-2 py-1 rounded-xl shadow-xs transition-all hover:opacity-95" 
          onClick={handleHomeClick}
        >
          <img
            className={`${isScrolled ? "h-8 sm:h-9 md:h-10" : "h-9 sm:h-10 md:h-11"} w-auto object-contain transition-all duration-300 rounded`}
            src="/img/parivattanE.png"
            alt="Parivattan Logo"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-3 lg:flex xl:gap-5">
          <a 
            href="/" 
            onClick={handleHomeClick}
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            Home
          </a>
          <Link 
            to="/about" 
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            About
          </Link>
          <Link 
            to="/admissions"
            className={`nav-item whitespace-nowrap text-sm font-semibold transition-colors cursor-pointer ${isScrolled ? 'text-[#b5623b] hover:text-[#954b2c]' : 'text-[#f2c5a8] hover:text-white'}`}
          >
            Admissions
          </Link>
          <Link 
            to="/courses"
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            Courses
          </Link>
          <div className="group relative">
            <button type="button" className={`flex items-center gap-1 whitespace-nowrap nav-item text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>
              Our Initiatives <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-80 -translate-x-1/2 translate-y-2 rounded-2xl border border-[#e1e3d9] bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link to="/admissions" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#b5623b] hover:bg-[#eef0e8]">Admissions 2026-27 (JP, DE, EN, FR)</Link>
              <a href="/initiatives" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#24312d] hover:bg-[#eef0e8] hover:text-[#b5623b]">All initiatives</a>
              <a href="/initiatives#overseas" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Parivattan Overseas Schools</a>
              <a href="/initiatives#languages" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Parivattan Foreign Language School</a>
              <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-2 text-xs font-semibold text-[#b5623b] hover:bg-[#eef0e8]">Upcoming: Russian, Chinese & Spanish (Coming Soon)</Link>
              <a href="/initiatives#technology" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Parivattan Technology School</a>
              <Link to="/rules" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Rules & Regulations</Link>
            </div>
          </div>
          <a href="/story" onClick={() => setMobileMenuOpen(false)} className={`nav-item whitespace-nowrap text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>Our story</a>
          <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className={`nav-item whitespace-nowrap text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>Gallery</Link>
          <a href="/blogs" onClick={() => setMobileMenuOpen(false)} className={`nav-item whitespace-nowrap text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>Blogs</a>
          <a 
            href="/donate" 
            onClick={handleDonatePageClick}
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            Donation
          </a>
          <Link 
            to="/contact" 
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            Contact
          </Link>
          <div className="group relative">
            <Link 
              to="/student"
              className={`nav-item whitespace-nowrap text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-xl ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
              title="Student Portal & Learning Hub"
            >
              <GraduationCap size={16} className="text-[#b5623b]" />
              <span>Student Corner</span>
              <ChevronDown size={14} className="transition-transform group-hover:rotate-180 opacity-75" />
            </Link>
            <div className="invisible absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-[#e1e3d9] bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              <Link to="/student" className="block rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#b5623b] hover:bg-[#eef0e8]">
                🎓 Student Portal & PRN Verification
              </Link>
              <div className="h-px bg-stone-100 my-1" />
              <Link to="/schedule" className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-[#eef0e8]">
                <span>⏰ Class Timetable & Schedule</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Active</span>
              </Link>
            </div>
          </div>
          <Link 
            to="/admissions#register" 
            className="ml-1 whitespace-nowrap rounded-full bg-[#b5623b] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#954b2c] hover:shadow-xl"
          >
            Apply for Admission
          </Link>
        </nav>

        {/* Mobile Menu Button (Top Right) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`lg:hidden rounded-xl px-2.5 py-1.5 transition-all flex items-center gap-1.5 font-bold text-xs ${
            isScrolled
              ? 'text-[#24312d] bg-stone-100 border border-stone-200 hover:bg-stone-200 shadow-2xs'
              : 'text-white bg-black/40 backdrop-blur-md border border-white/25 hover:bg-black/60'
          }`}
          aria-label="Open menu"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </div>
    </header>

    {/* Universal Navigation Drawer (Full-Screen Root Level Overlay - Works anywhere on the page) */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
        {/* Backdrop Overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Slide-in Drawer Container */}
        <div
          className="relative z-10 w-full max-w-sm sm:max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200/80 bg-[#fbfaf7] shrink-0">
            <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5">
              <img
                className="h-8 sm:h-9 w-auto object-contain rounded"
                src="/img/parivattanE.png"
                alt="Parivattan Logo"
              />
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-bold text-[#24312d] leading-tight font-serif">
                  Parivattan Mission
                </span>
                <span className="block text-[10px] text-[#b5623b] font-semibold">
                  Education & Learning Foundation
                </span>
              </div>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Quick Action Top Cards */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#b5623b] hover:bg-[#954b2c] text-white rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition text-center"
              >
                <GraduationCap size={16} />
                <span>Apply Admission</span>
              </Link>
              <Link
                to="/donate"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#1b2b25] hover:bg-black text-white rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition text-center"
              >
                <span>Donate Now</span>
              </Link>
            </div>

            {/* Student Portal PRN Card */}
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl font-bold flex items-center justify-between text-[#1b2b25] text-xs shadow-2xs hover:bg-emerald-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <span className="block font-bold text-[#1b2b25]">Student Portal</span>
                  <span className="text-[11px] text-emerald-700 font-medium">Verify PRN & Profile</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                PRN
              </span>
            </Link>

            {/* Timetable Fast Link */}
            <Link
              to="/schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 px-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 font-semibold hover:bg-amber-100/70 transition"
            >
              <span>⏰ Class Timetable & Schedule</span>
              <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">Active</span>
            </Link>

            {/* Main Navigation Links */}
            <nav className="flex flex-col space-y-1 pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1">
                Main Menu
              </span>

              <a
                href="/"
                onClick={handleHomeClick}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition flex items-center justify-between"
              >
                <span>Home</span>
              </a>

              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition flex items-center justify-between"
              >
                <span>Language Courses (🇯🇵 🇩🇪 🇬🇧 🇫🇷)</span>
                <span className="text-[10px] bg-[#b5623b]/10 text-[#b5623b] font-bold px-2 py-0.5 rounded-full">Active</span>
              </Link>

              <Link
                to="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Course Admissions
              </Link>

              <Link
                to="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Camera size={15} className="text-[#b5623b]" />
                  <span>Photo Gallery</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">New</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                About Us
              </Link>

              <Link
                to="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Our Team
              </Link>

              <Link
                to="/rules"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Rules & Regulations
              </Link>

              <a
                href="/initiatives"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Our Initiatives
              </a>

              <a
                href="/story"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Our Story
              </a>

              <a
                href="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Blogs & Updates
              </a>

              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold text-[#24312d] hover:bg-stone-50 rounded-xl transition"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Drawer Sticky Footer with Direct Admission Helpline */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Admissions Helpline:</span>
              <a
                href="tel:+919226345875"
                className="font-bold font-mono text-[#b5623b] hover:underline"
              >
                +91 9226345875
              </a>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:+919226345875"
                className="flex-1 py-2 px-3 rounded-xl bg-[#24312d] hover:bg-[#b5623b] text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call Helpline</span>
              </a>
              <a
                href="https://wa.me/919226345875"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Mobile Sticky Bottom Navigation Bar - Accessible anywhere on phone */}
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e5dc] shadow-[0_-4px_25px_rgba(36,49,45,0.08)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            location.pathname === "/" ? "text-[#b5623b] font-bold" : "text-[#65706a] hover:text-[#24312d]"
          }`}
        >
          <Home size={19} className={location.pathname === "/" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Courses */}
        <Link
          to="/courses"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            location.pathname.startsWith("/courses") ? "text-[#b5623b] font-bold" : "text-[#65706a] hover:text-[#24312d]"
          }`}
        >
          <BookOpen size={19} className={location.pathname.startsWith("/courses") ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[10px] mt-0.5">Courses</span>
        </Link>

        {/* Admissions - Center Highlight Badge */}
        <Link
          to="/admissions"
          onClick={() => setMobileMenuOpen(false)}
          className="flex flex-col items-center justify-center -mt-3.5 py-1 px-2 group"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95 ${
            location.pathname.startsWith("/admissions") ? "bg-[#b5623b] ring-4 ring-[#b5623b]/20" : "bg-[#24312d] hover:bg-[#b5623b]"
          }`}>
            <GraduationCap size={20} />
          </div>
          <span className={`text-[10px] mt-0.5 font-bold ${
            location.pathname.startsWith("/admissions") ? "text-[#b5623b]" : "text-[#24312d]"
          }`}>
            Admission
          </span>
        </Link>

        {/* Student Portal */}
        <Link
          to="/student/portal"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            location.pathname.startsWith("/student") || location.pathname === "/login" ? "text-[#b5623b] font-bold" : "text-[#65706a] hover:text-[#24312d]"
          }`}
        >
          <UserCheck size={19} className={location.pathname.startsWith("/student") || location.pathname === "/login" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[10px] mt-0.5">Portal</span>
        </Link>

        {/* Full Menu Drawer Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#65706a] hover:text-[#24312d] transition"
        >
          <Menu size={19} className="stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  </>
  );
};

export default Header;
