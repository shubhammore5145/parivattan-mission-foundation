import React, { useEffect, useState } from "react";

const sliderImages = [
  "/img/purpose.jpg",
  "/img/silder3.jpg",
  "/img/silder4.jpg",
];

const Mission = () => {
  const [currentImage, setCurrentImage] = useState(0);

  // Animate on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.2,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="mission"
      className="section-padding bg-gradient-to-b from-white to-blue-50/50 relative overflow-hidden"
    >
      {/* Background Shapes */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-3xl opacity-40 animate-float-slow z-0"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tr from-cyan-100 to-blue-100 rounded-full blur-2xl opacity-30 animate-pulse-slow z-0"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="section-title animate-on-scroll">Mission & Vision</h2>
          <p className="section-subtitle animate-on-scroll mt-6">
            We are dedicated to transforming students' futures through Quality Education, Global Languages, and Practical Technology Skills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Auto Image Slider */}
          <div className="animate-on-scroll relative">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl z-0"></div>
              <div className="glass-card p-2 relative z-10 rounded-2xl overflow-hidden">
                <img
                  src={sliderImages[currentImage]}
                  alt="Mission Slide"
                  className="w-full h-[350px] object-cover rounded-xl transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl z-0"></div>
            </div>
          </div>

          {/* Text Content */}
          <div className="animate-on-scroll">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#b5623b] to-amber-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-3xl font-serif font-semibold text-slate-800">
                Our Purpose
              </h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed text-lg">
              At Parivattan Mission Foundation, our mission is to empower students and aspiring youth by providing quality education, accredited foreign language training, practical technology education, and career development programs that unlock global pathways.
            </p>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              Our vision is to build an inclusive and future-ready learning ecosystem where every student has access to modern educational opportunities, international language proficiencies, and digital skills to achieve academic excellence and sustainable career success.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">Quality Education</span>
              <span className="px-4 py-2 bg-amber-50 text-amber-800 rounded-full text-sm font-medium border border-amber-200">Foreign Languages</span>
              <span className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200">Technology & Coding</span>
              <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">Career Mentorship</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
