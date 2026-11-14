import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
// import 'swiper/swiper.css';
import { useLiveVisitors } from '@/context/LiveVisitorsContext';

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { count: liveVisitors } = useLiveVisitors();

  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const button = buttonRef.current;

    if (title) title.classList.add('animate-fade-in');

    setTimeout(() => {
      if (subtitle) subtitle.classList.add('animate-fade-in');
    }, 300);

    setTimeout(() => {
      if (button) button.classList.add('animate-fade-in');
    }, 600);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[780px] lg:min-h-[840px] flex items-center justify-center overflow-hidden bg-[#17221f]"
    >
      <div className="absolute inset-0 z-0">
        {/* Cinematic Multi-stop Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#17221f]/98 via-[#1c2925]/85 to-[#17221f]/40 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(229,163,127,0.15),transparent_60%)] z-10 pointer-events-none"></div>

        {/* Background Image Slider */}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          autoplay={{ 
            delay: 6000,
            disableOnInteraction: false
          }}
          speed={2000}
          className="absolute top-0 left-0 w-full h-full"
        >
          <SwiperSlide>
            <img
              src="/img/hero.jpg"
              alt="Heavenly Hands - Transforming Lives"
              className="w-full h-full object-cover object-center"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/img/purpose.jpg"
              alt="Educational Empowerment & Mentorship"
              className="w-full h-full object-cover object-center"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/img/silder3.jpg"
              alt="Sau Study Libraries & Rural Classrooms"
              className="w-full h-full object-cover object-center"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/img/silder4.jpg"
              alt="Educational Empowerment"
              className="w-full h-full object-cover object-center"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="container mx-auto px-5 sm:px-8 max-w-7xl z-10 text-left pt-24 pb-20">
        {/* Modern Live & Admissions Badge */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/12 backdrop-blur-xl border border-white/25 text-white text-xs sm:text-sm font-semibold shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide">Admissions 2026-27 Open</span>
            <span className="text-white/40">•</span>
            <span className="text-[#f2c5a8] font-medium">Foreign Languages & Global Careers</span>
          </div>

          {liveVisitors > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-white/90 text-xs font-medium shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span>{liveVisitors === 1 ? '1 student viewing' : `${liveVisitors} students viewing`}</span>
            </div>
          )}
        </div>

        {/* Eyebrow with decorative accent */}
        <div className="mb-4 max-w-3xl text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#f2c5a8] flex items-center">
          <span className="inline-block w-6 h-[2px] bg-[#e5a37f] rounded-full mr-2.5"></span>
          Education creates room to choose
        </div>

        {/* Headline */}
        <h1
          ref={titleRef}
          className="opacity-0 max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-normal mb-6 leading-[1.05] text-white tracking-tight"
        >
          Education should open{' '}
          <span className="bg-gradient-to-r from-[#f2c5a8] via-[#ffd7c2] to-[#e5a37f] bg-clip-text text-transparent font-medium">
            more doors.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="opacity-0 text-base sm:text-lg md:text-xl text-stone-200/90 max-w-2xl mb-9 leading-relaxed font-light"
        >
          Parivattan builds certified language training and practical learning pathways, empowering students to access global universities and careers.
        </p>

        {/* CTA Buttons */}
        <div ref={buttonRef} className="opacity-0 flex flex-wrap gap-3.5 sm:gap-4 items-center mb-10">
          <a 
            href="#courses" 
            className="group px-7 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#e5a37f] via-[#ebad8b] to-[#f2c5a8] text-[#17221f] font-bold text-sm sm:text-base rounded-full shadow-[0_12px_32px_rgba(229,163,127,0.38)] hover:shadow-[0_16px_40px_rgba(229,163,127,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2.5"
          >
            <span>Explore Language Courses</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          <a 
            href="/admissions" 
            className="px-6 sm:px-7 py-3.5 sm:py-4 bg-white/12 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-full border border-white/30 hover:border-white/50 backdrop-blur-xl transition-all duration-300 flex items-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5"
          >
            <span>Admissions Portal</span>
          </a>

          <a 
            href="#donate" 
            className="px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/12 text-white/90 hover:text-white font-semibold text-sm border border-white/15 hover:border-white/30 backdrop-blur-md transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 text-[#e5a37f] animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Donate</span>
          </a>
        </div>

        {/* Feature Highlights Strip */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl text-white/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#f2c5a8] text-base font-serif">
              JP
            </div>
            <div>
              <div className="text-xs font-bold text-white">Japanese & German</div>
              <div className="text-[11px] text-white/60">JLPT & Goethe Prep</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#f2c5a8] text-base font-serif">
              FR
            </div>
            <div>
              <div className="text-xs font-bold text-white">French & English</div>
              <div className="text-[11px] text-white/60">Global Fluency</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#f2c5a8] text-base">
              🎓
            </div>
            <div>
              <div className="text-xs font-bold text-white">Affordable Fees</div>
              <div className="text-[11px] text-white/60">Scholarships Available</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#f2c5a8] text-base">
              🌏
            </div>
            <div>
              <div className="text-xs font-bold text-white">Career Pathways</div>
              <div className="text-[11px] text-white/60">Jobs & University Visa</div>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative element - modern wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto block">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
