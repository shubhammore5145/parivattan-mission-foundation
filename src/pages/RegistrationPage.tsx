import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegistrationForm from "@/components/courses/RegistrationForm";
import { Sparkles, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegistrationPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />

      <main className="pt-28 md:pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#65706a]">
            <Link to="/courses" className="hover:text-[#b5623b] flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Courses
            </Link>
            <span>/</span>
            <span className="text-[#24312d]">Course Registration</span>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={14} /> Official Registration 2026-27
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d]">
              Course Enrollment & Registration
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#65706a] max-w-2xl mx-auto">
              Enroll in Japanese, German, English, or French language programs. Secure your preferred batch and seat below.
            </p>
          </div>

          <RegistrationForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
