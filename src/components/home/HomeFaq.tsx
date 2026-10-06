import React, { useState } from "react";
import { Link } from "react-router-dom";
import { COURSE_FAQS } from "@/data/languageCoursesData";
import { HelpCircle, ChevronDown, Sparkles, ArrowRight } from "lucide-react";

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="page-section bg-[#fbfaf7] border-t border-[#e2e5dc] py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
            <HelpCircle size={14} /> Clear Answers
          </div>
          <h2 className="mt-3 text-3xl font-serif sm:text-4xl md:text-5xl font-bold text-[#24312d] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#65706a]">
            Everything you need to know about our security deposits, batch timings, examination pass criteria, and refund policies.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {COURSE_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#e2e5dc] bg-white overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-hidden"
                >
                  <span className="font-serif font-bold text-base sm:text-lg text-[#24312d]">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fbfaf7] border border-[#e2e5dc] text-[#24312d] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#24312d] text-white" : ""
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#65706a] leading-relaxed border-t border-[#f1f3ed]">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Questions Help Box */}
        <div className="mt-12 rounded-2xl bg-white border border-[#e2e5dc] p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left gap-4">
          <div>
            <h4 className="font-serif font-bold text-base text-[#24312d]">
              Have a specific question not listed here?
            </h4>
            <p className="text-xs text-[#65706a] mt-0.5">
              Read our complete institutional code of conduct or speak directly with our counselor.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center justify-center gap-2 shrink-0">
            <Link
              to="/rules"
              className="rounded-full border border-[#24312d] px-5 py-2.5 text-xs font-bold text-[#24312d] hover:bg-[#24312d] hover:text-white transition"
            >
              Institute Rules
            </Link>
            <Link
              to="/contact"
              className="rounded-full bg-[#b5623b] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#954b2c] transition shadow-xs"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
