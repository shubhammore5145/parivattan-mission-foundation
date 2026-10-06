import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Database, RefreshCw, Share2, CheckCircle2, UserCheck, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />

      <main className="pt-28 md:pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Lock size={14} /> Trust & Transparency
            </div>
            <h1 className="mt-3 text-4xl sm:text-5xl font-serif font-bold text-[#24312d]">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base text-[#65706a] max-w-2xl mx-auto leading-relaxed">
              At Parivattan Mission Foundation, we respect your privacy and are committed to protecting the personal information you share with us during course enrollment and learning activities.
            </p>
          </div>

          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-10 shadow-sm space-y-10 text-sm text-[#3f4d47]">
            {/* 1. Information We Collect */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b5623b]/10 text-[#b5623b]">
                  <Database size={20} />
                </span>
                <h2 className="text-xl font-serif font-bold text-[#24312d]">
                  1. Information We Collect
                </h2>
              </div>
              <p className="leading-relaxed">
                When you interact with our website or enroll in our educational programs, the institute may collect the following personal and academic details:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  "Full Name",
                  "Mobile Number",
                  "Email Address",
                  "Course Selection",
                  "Batch Selection & Timing",
                  "Payment-related Information (Transaction IDs / References)",
                  "Other Information required for registration (Education & Address)",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl bg-[#fbfaf7] border border-[#e2e5dc] p-3 text-xs font-medium text-[#24312d]">
                    <CheckCircle2 size={15} className="text-[#b5623b] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section className="border-t border-[#f1f3ed] pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <UserCheck size={20} />
                </span>
                <h2 className="text-xl font-serif font-bold text-[#24312d]">
                  2. How We Use Your Information
                </h2>
              </div>
              <p className="leading-relaxed">
                The collected information is utilized strictly to provide quality education and support our learners:
              </p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm">
                {[
                  "Processing course registration and admission applications",
                  "Processing and confirming fee payments and refundable security deposits",
                  "Class schedule communication and batch timing announcements",
                  "Attendance tracking and examination management",
                  "Providing course-related support, learning kits, and guidance",
                  "Sending important administrative notifications and regulatory updates",
                ].map((usage, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#b5623b] shrink-0 mt-0.5" />
                    <span>{usage}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 3. Security Measures & Data Protection */}
            <section className="border-t border-[#f1f3ed] pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck size={20} />
                </span>
                <h2 className="text-xl font-serif font-bold text-[#24312d]">
                  3. Security Measures
                </h2>
              </div>
              <p className="leading-relaxed">
                We implement reasonable administrative, technical, and physical measures designed to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Access to student information is restricted strictly to authorized staff members on a need-to-know basis.
              </p>
            </section>

            {/* 4. Payment Processing Policy */}
            <section className="border-t border-[#f1f3ed] pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <CreditCard size={20} />
                </span>
                <h2 className="text-xl font-serif font-bold text-[#24312d]">
                  4. Payment Processing & Third Parties
                </h2>
              </div>
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-5 space-y-2 text-xs sm:text-sm text-amber-950">
                <p className="font-semibold">
                  Secure Third-Party Processing
                </p>
                <p className="leading-relaxed">
                  Payment information may be processed through trusted, PCI-DSS compliant third-party payment providers (such as Razorpay / UPI payment gateways).
                </p>
                <p className="font-bold pt-1">
                  Important: Parivattan Mission Foundation does not store sensitive payment credentials, such as credit/debit card numbers, CVV codes, or net banking passwords, on our servers.
                </p>
              </div>
            </section>

            {/* 5. Information Sharing Policy */}
            <section className="border-t border-[#f1f3ed] pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <Share2 size={20} />
                </span>
                <h2 className="text-xl font-serif font-bold text-[#24312d]">
                  5. Information Sharing
                </h2>
              </div>
              <p className="leading-relaxed">
                We value your trust. Your information will be shared only when strictly required to provide the requested service (such as examination registration with official language certifying bodies) or to comply with applicable laws and regulatory requirements. We do not sell or rent student information to third-party commercial marketing agencies.
              </p>
            </section>

            {/* 6. Policy Updates */}
            <section className="border-t border-[#f1f3ed] pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <RefreshCw size={20} />
                </span>
                <h2 className="text-xl font-serif font-bold text-[#24312d]">
                  6. Updates to This Policy
                </h2>
              </div>
              <p className="leading-relaxed">
                The institute reserves the right to update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued participation in our programs signifies your acceptance of any revisions.
              </p>
              <p className="text-xs text-[#65706a] pt-2">
                Last updated: October 2026.
              </p>
            </section>

            {/* Bottom Actions */}
            <div className="border-t border-[#f1f3ed] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#65706a]">
                Have questions regarding your data? Contact: <a href="mailto:contact@parivattan.org" className="text-[#b5623b] font-semibold underline">contact@parivattan.org</a>
              </p>
              <Link
                to="/rules"
                className="text-xs sm:text-sm font-bold text-[#b5623b] hover:underline"
              >
                View Rules & Regulations →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
