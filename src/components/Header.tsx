import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full
         ${
        isScrolled
          ? "py-2 sm:py-3 bg-[#fbfaf7]/95 backdrop-blur-lg shadow-[0_10px_30px_-20px_rgba(36,49,45,0.7)] border-b border-[#e1e3d9]"
          : "py-4 sm:py-6 bg-gradient-to-b from-[#24312d]/55 to-transparent"
      }
        `
      }
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-5 px-4">
        <a href="#" className="flex items-center space-x-2 bg-[#fbfaf7] p-1 rounded-[10px]" onClick={handleHomeClick}>
          <img
            className="w-[58px] sm:w-[78px] md:w-[86px] transition-all duration-300 rounded-md"
            src="/img/parivattan_new.png"
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
          <a 
            href="/#mission" 
            onClick={(e) => handleNavClick(e, 'mission')}
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            About
          </a>
          <div className="group relative">
            <button type="button" className={`flex items-center gap-1 whitespace-nowrap nav-item text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>
              Our Initiatives <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-80 -translate-x-1/2 translate-y-2 rounded-2xl border border-[#e1e3d9] bg-[#fbfaf7] p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <a href="/initiatives" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#24312d] hover:bg-[#eef0e8] hover:text-[#b5623b]">All initiatives</a>
              <a href="/initiatives#overseas" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Parivattan Overseas Schools</a>
              <a href="/initiatives#languages" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Parivattan Foreign Language School</a>
              <a href="/initiatives#technology" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#65706a] hover:bg-[#eef0e8] hover:text-[#b5623b]">Parivattan Technology School</a>
            </div>
          </div>
          <a href="/story" onClick={() => setMobileMenuOpen(false)} className={`nav-item whitespace-nowrap text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>Our story</a>
          <a href="/blogs" onClick={() => setMobileMenuOpen(false)} className={`nav-item whitespace-nowrap text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>Blogs</a>
          <a href="/admissions" onClick={() => setMobileMenuOpen(false)} className={`nav-item whitespace-nowrap text-sm font-medium ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}>Admissions</a>
          <a 
            href="/donate" 
            onClick={handleDonatePageClick}
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            Donation
          </a>
          <a 
            href="/#contact" 
            onClick={(e) => handleNavClick(e, 'contact')}
            className={`nav-item whitespace-nowrap text-sm font-medium transition-colors cursor-pointer ${isScrolled ? 'text-[#24312d] hover:text-[#b5623b]' : 'text-white hover:text-[#f2c5a8]'}`}
          >
            Contact
          </a>
          <a 
            href="/donate" 
            onClick={handleDonatePageClick}
            className="ml-1 whitespace-nowrap rounded-full bg-[#b5623b] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#954b2c] hover:shadow-xl"
          >
            Donate Now
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden rounded-xl p-2.5 transition-colors ${isScrolled ? 'text-[#24312d] hover:bg-[#eef0e8]' : 'text-white hover:bg-white/10'}`}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden fixed inset-0 bg-[#fbfaf7] z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="container mx-auto px-4 py-4 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <a href="/" onClick={handleHomeClick} className="flex items-center space-x-2">
              <img
                className="w-[60px] sm:w-[80px]"
                src="/img/parivattan_new.png"
                alt="Parivattan Logo"
              />
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col space-y-2">
            <a
              href="/"
              onClick={handleHomeClick}
              className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
            >
              Home
            </a>
            <a
              href="/#mission"
              onClick={(e) => handleNavClick(e, 'mission')}
              className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
            >
              About
            </a>
            <div className="rounded-xl bg-[#eef0e8] px-4 py-3">
              <p className="mb-2 text-lg font-semibold text-[#24312d]">Our Initiatives</p>
              <a href="/initiatives" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#b5623b]">All initiatives</a>
              <a href="/initiatives#overseas" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#65706a]">Parivattan Overseas Schools</a>
              <a href="/initiatives#languages" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#65706a]">Parivattan Foreign Language School</a>
              <a href="/initiatives#technology" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#65706a]">Parivattan Technology School</a>
            </div>
            <a href="/story" onClick={() => setMobileMenuOpen(false)} className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-[#b5623b] rounded-xl transition-all font-medium">Our story</a>
            <a href="/blogs" onClick={() => setMobileMenuOpen(false)} className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-[#b5623b] rounded-xl transition-all font-medium">Blogs</a>
            <a href="/admissions" onClick={() => setMobileMenuOpen(false)} className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-[#b5623b] rounded-xl transition-all font-medium">Admissions</a>
            <a
              href="/donate"
              onClick={handleDonatePageClick}
              className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
            >
              Donation
            </a>
            <a
              href="/#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="text-lg sm:text-xl py-3 px-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
            >
              Contact
            </a>
            <a
              href="/donate"
              onClick={handleDonatePageClick}
              className="mt-4 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Donate Now
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
