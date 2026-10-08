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
      className="relative min-h-[760px] flex items-center justify-center overflow-hidden bg-[#24312d]"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#24312d]/95 via-[#24312d]/60 to-[#24312d]/30 z-10"></div>

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
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/img/purpose.jpg"
              alt="Educational Empowerment & Mentorship"
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/img/silder3.jpg"
              alt="Environmental Sustainability"
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/img/silder4.jpg"
              alt="Educational Empowerment"
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      <div className="container mx-auto px-5 z-10 text-left pt-20">
        {/* Modern Live & Admissions Badge */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold shadow-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Admissions 2026-27 Open</span>
            <span className="text-white/40">•</span>
            <span className="text-[#f2c5a8]">Foreign Languages & Global Careers</span>
          </div>
          {liveVisitors > 0 && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 text-xs">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              <span>{liveVisitors === 1 ? '1 student viewing' : `${liveVisitors} students viewing`}</span>
            </div>
          )}
        </div>

        <div className="mb-4 max-w-3xl text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#f2c5a8]">
          Education creates room to choose
        </div>
        <h1
          ref={titleRef}
          className="opacity-0 max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal mb-6 leading-[1.02] text-white"
        >
          Education should open <span className="text-[#f2c5a8]">more doors.</span>
        </h1>
        <p
          ref={subtitleRef}
          className="opacity-0 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mb-8 leading-relaxed font-light"
        >
          Parivattan builds certified language training and practical learning pathways, empowering students to access global universities and careers.
        </p>

        {/* CTA Buttons */}
        <div ref={buttonRef} className="opacity-0 flex flex-wrap gap-3 sm:gap-4 items-center mb-12">
          <a 
            href="#courses" 
            className="px-7 py-3.5 bg-[#e5a37f] text-[#24312d] font-bold text-sm sm:text-base rounded-full hover:bg-[#f2c5a8] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span>Explore Language Courses</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <a 
            href="/admissions" 
            className="px-7 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold text-sm sm:text-base rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
          >
            <span>Admissions Portal</span>
          </a>
          <a 
            href="#donate" 
            className="px-6 py-3.5 text-white/90 hover:text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-[#e5a37f]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Donate</span>
          </a>
        </div>

      </div>

      {/* Decorative element - modern wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
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
