import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RULES_AND_REGULATIONS } from "@/data/languageCoursesData";
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />

      <main className="pt-28 md:pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <ShieldCheck size={14} /> Official Institute Policy
            </div>
            <h1 className="mt-3 text-4xl sm:text-5xl font-serif font-bold text-[#24312d]">
              Rules & Regulations
            </h1>
            <p className="mt-4 text-base text-[#65706a] max-w-2xl mx-auto leading-relaxed">
              To ensure academic excellence, smooth batch operations, and a disciplined learning environment, all students enrolling in Parivattan Mission Foundation courses agree to adhere to the following rules and regulations.
            </p>
          </div>

          {/* Key Notice Card */}
          <div className="mb-8 rounded-3xl bg-amber-50 border border-amber-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                <AlertCircle size={22} />
              </div>
              <div className="text-xs sm:text-sm text-amber-950 space-y-1.5 leading-relaxed">
                <h3 className="font-bold text-base font-serif text-amber-950">
                  Important Notice Before Enrolling
                </h3>
                <p>
                  Course registration is personal and non-transferable. Please carefully note that course fees are strictly non-refundable once paid. Security deposits (applicable for Japanese language programs) are refundable exclusively upon fulfilling the designated examination criteria.
                </p>
              </div>
            </div>
          </div>

          {/* 13 Numbered Rules */}
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-10 shadow-sm">
            <div className="space-y-4">
              {RULES_AND_REGULATIONS.map((rule, index) => {
                const ruleNumber = index + 1;
                const isHighlight = ruleNumber === 1 || ruleNumber === 5 || ruleNumber === 8;

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 rounded-2xl p-4 sm:p-5 transition-all ${
                      isHighlight
                        ? "bg-[#fbfaf7] border border-[#b5623b]/30"
                        : "hover:bg-[#fbfaf7] border border-transparent"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#24312d] text-xs font-bold text-white shadow-2xs">
                      {ruleNumber}
                    </span>
                    <div className="pt-0.5">
                      <p className={`text-sm sm:text-base leading-relaxed ${isHighlight ? "font-semibold text-[#24312d]" : "text-[#3f4d47]"}`}>
                        {rule}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-10 border-t border-[#f1f3ed] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#65706a]">
                Students certify agreement to these rules during course registration.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/courses"
                  className="rounded-xl border border-[#d9ddd4] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#24312d] hover:bg-[#fbfaf7] transition"
                >
                  Explore Courses
                </Link>
                <Link
                  to="/courses#register"
                  className="rounded-xl bg-[#b5623b] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#954b2c] transition flex items-center gap-1.5"
                >
                  <span>Proceed to Register</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
