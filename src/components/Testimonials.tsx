import React from "react";
import { Star, Quote, CheckCircle2, Award, Sparkles } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  language: string;
  flag: string;
  levelBadge: string;
  outcome: string;
  quote: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aditya Salunkhe",
    role: "Computer Science Graduate",
    language: "Japanese Language",
    flag: "🇯🇵",
    levelBadge: "JLPT N5 Passed",
    outcome: "Selected for Japan SSW Visa Technical Pathway",
    quote:
      "I joined the Japanese N5 evening batch alongside my college studies. The small batch of 25 students meant the teacher reviewed every Kanji and sentence directly. When I cleared the JLPT exam, my ₹2,000 security deposit was refunded exactly as promised!",
    rating: 5,
  },
  {
    name: "Sneha Kadam",
    role: "Mechanical Engineering Aspirant",
    language: "German Language",
    flag: "🇩🇪",
    levelBadge: "Goethe A1 Certified",
    outcome: "Applying for Public Universities in Germany",
    quote:
      "German grammar seemed intimidating at first, but Parivattan's audio-visual approach and weekend schedule made it very structured. Within 3 months I cleared Goethe A1 with an 88% score. Highly recommended for students aiming for Germany.",
    rating: 5,
  },
  {
    name: "Rohan Patil",
    role: "Job Seeker & First-Gen Graduate",
    language: "English Fluency",
    flag: "🇬🇧",
    levelBadge: "Basic English Completed",
    outcome: "Cracked MNC Technical Support Interview",
    quote:
      "I had strong technical skills but zero confidence in English speaking. The daily 1-hour weekday evening batch completely removed my hesitation. The mock interviews and group discussions helped me get placed in Pune.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="page-section bg-white border-t border-[#e2e5dc] py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
            <Sparkles size={14} /> Student Experiences
          </div>
          <h2 className="mt-4 text-3xl font-serif sm:text-4xl md:text-5xl font-bold text-[#24312d] tracking-tight">
            Hear From Our Certified Students
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#65706a] leading-relaxed">
            Real outcomes from students who transformed their language fluency, cleared international examinations, and claimed their deposit refunds.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-[#e2e5dc] bg-[#fbfaf7] p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#b5623b]/40 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Language Badge */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#e2e5dc] px-2.5 py-0.5 text-[11px] font-bold text-[#24312d]">
                    <span>{t.flag}</span>
                    <span>{t.levelBadge}</span>
                  </span>
                </div>

                {/* Quote */}
                <p className="text-sm text-[#48534e] leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              {/* Author & Outcome */}
              <div className="pt-5 border-t border-[#e2e5dc]/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#24312d]">
                      {t.name}
                    </h4>
                    <p className="text-xs text-[#87938b]">{t.role}</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" title="Verified Graduate">
                    <CheckCircle2 size={16} />
                  </span>
                </div>

                <div className="mt-3 inline-block rounded-xl bg-white border border-[#e2e5dc] px-3 py-1 text-[11px] font-semibold text-[#b5623b]">
                  🎯 {t.outcome}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
