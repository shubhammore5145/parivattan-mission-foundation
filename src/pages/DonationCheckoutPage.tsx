import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Globe2,
  Laptop,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface UpcomingCause {
  id: string;
  name: string;
  marathi: string;
  icon: React.ElementType;
  desc: string;
  tag: string;
}

const upcomingCauses: UpcomingCause[] = [
  {
    id: "languages",
    name: "Foreign Language School",
    marathi: "विदेशी भाषा प्रशिक्षण निधी",
    icon: Globe2,
    desc: "Coaching and JLPT/Goethe certification scholarships for Japanese and German language learners.",
    tag: "Global Opportunities",
  },
  {
    id: "technology",
    name: "Parivattan Tech School",
    marathi: "तंत्रज्ञान व कोडिंग शिक्षण",
    icon: Laptop,
    desc: "Equipping rural youth with laptops, programming bootcamps in Python, and full-stack web development.",
    tag: "Digital Empowerment",
  },
  {
    id: "girls-scholarship",
    name: "Savitribai Girls Higher Education",
    marathi: "मुलींचे उच्च शिक्षण अनुदान",
    icon: BookOpen,
    desc: "Direct college tuition scholarships and hostel fees assistance for deserving rural girls.",
    tag: "Women Empowerment",
  },
  {
    id: "general",
    name: "Foundational Learning Kits",
    marathi: "अभ्यास साहित्य व वर्गखोल्या",
    icon: GraduationCap,
    desc: "Distributing books, stationery kits, and establishing community learning circles.",
    tag: "Foundational Education",
  },
];

export default function DonationCheckoutPage() {
  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Mission Foundation! I would like to inquire about the upcoming Donation Campaign and explore partnership/support opportunities."
  );

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
      <Header />

      <main className="page-section pt-32 md:pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-[#65706a] mb-6">
            <Link to="/" className="hover:text-[#b5623b] transition">
              Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-[#24312d] font-semibold">Donation Campaign</span>
          </div>

          {/* Top Hero Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#24312d] via-[#2a3a35] to-[#1c2623] p-8 md:p-14 text-white shadow-xl overflow-hidden text-center mb-10">
            {/* Ambient decorative glowing blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#b5623b]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#e5a37f]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#f2c5a8] border border-white/15 backdrop-blur-md mb-6">
                <Clock size={14} className="text-amber-300 animate-pulse" />
                <span>Launching Soon • नवीन देणगी मोहीम लवकरच</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-serif leading-[1.08] text-white">
                Donation Campaign Coming Soon
              </h1>

              <p className="mt-4 text-2xl font-serif text-[#e5a37f]">
                शिक्षणातून परिवर्तन, उज्ज्वल भविष्यासाठी!
              </p>

              <p className="mt-5 text-sm md:text-base text-stone-200 leading-relaxed max-w-2xl mx-auto font-sans">
                आम्ही देणगी मोहिमेची संपूर्ण यंत्रणा आणि थेट विद्यार्थी मदत प्रक्रिया अधिक सुलभ करत आहोत. ऑनलाइन देणगी आणि अधिकृत पेमेंट पर्याय लवकरच या पानावर उपलब्ध केले जातील.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={`https://wa.me/917820831901?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp वर संपर्क करा</span>
                </a>

                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition-all duration-300"
                >
                  <Phone size={16} />
                  <span>संस्थेशी संपर्क साधा</span>
                </Link>

                <Link
                  to="/admissions"
                  className="inline-flex items-center gap-2 rounded-full bg-[#b5623b] hover:bg-[#954b2c] text-white px-6 py-3.5 text-sm font-semibold shadow transition-all duration-300"
                >
                  <GraduationCap size={16} />
                  <span>Admissions 2026-27</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Causes Section */}
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-7 md:p-10 shadow-sm mb-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                What We Will Support • आगामी उपक्रम
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-serif text-[#24312d]">
                नवीन मोहिमेद्वारे समर्थित होणारे प्रकल्प
              </h2>
              <p className="mt-2 text-xs md:text-sm text-[#65706a]">
                या मोहिमेचा प्रत्येक रुपया थेट गरजू विद्यार्थ्यांच्या शिक्षणासाठी व प्रशिक्षणासाठी वापरला जाईल.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingCauses.map((cause) => {
                const Icon = cause.icon;
                return (
                  <div
                    key={cause.id}
                    className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 hover:border-[#b5623b]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center">
                          <Icon size={24} />
                        </div>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-[#e2e5dc] text-[#24312d]">
                          {cause.tag}
                        </span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-[#24312d]">
                        {cause.name}
                      </h3>
                      <p className="text-xs font-medium text-[#b5623b] mt-0.5">
                        {cause.marathi}
                      </p>
                      <p className="mt-3 text-xs md:text-sm text-[#65706a] leading-relaxed">
                        {cause.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#e2e5dc] flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>तयारी सुरू आहे (Planned for Launch)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Foundation Inquiries & Registration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Contact Card */}
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                  Direct Inquiries
                </span>
                <h3 className="mt-1 text-xl font-serif text-[#24312d]">
                  देणगी किंवा सहकार्यासाठी संपर्क
                </h3>
                <p className="mt-2 text-xs text-[#65706a] leading-relaxed">
                  तुम्हाला संस्थेच्या उपक्रमांमध्ये थेट देणगीदार, मेंटॉर किंवा भागीदार म्हणून सहभागी व्हायचे असल्यास आमच्याशी थेट संपर्क साधा.
                </p>

                <div className="mt-6 space-y-3.5 text-xs text-[#24312d]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-stone-100 flex items-center justify-center text-[#b5623b] shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#65706a] block uppercase font-bold">Call us</span>
                      <a href="tel:+917820831901" className="font-bold hover:text-[#b5623b] transition">
                        +91 7820831901
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-stone-100 flex items-center justify-center text-[#b5623b] shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#65706a] block uppercase font-bold">Email us</span>
                      <a href="mailto:contact@parivattan.org" className="font-bold hover:text-[#b5623b] transition">
                        contact@parivattan.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-stone-100 flex items-center justify-center text-[#b5623b] shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#65706a] block uppercase font-bold">Location</span>
                      <span className="font-medium">Tuljapur, Dharashiv (Osmanabad), Maharashtra 413601</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e2e5dc]">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b5623b] hover:underline"
                >
                  मुखपृष्ठावर परत जा (Back to Home) <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Official Registration & Trust Card */}
            <div className="rounded-3xl border border-[#e2e5dc] bg-gradient-to-br from-[#fbfaf7] to-[#f4f1e8] p-7 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Trust & Governance
                </span>
                <h3 className="mt-1 text-xl font-serif text-[#24312d]">
                  पारदर्शकता आणि अधिकृत मान्यता
                </h3>

                <div className="mt-5 space-y-3.5 text-xs text-[#65706a]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#24312d] block">Section 8 Non-Profit Foundation:</strong>
                      Parivattan Mission Foundation is officially incorporated under Section 8 of Companies Act (Reg. #158298).
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#24312d] block">80G & 12A Certified:</strong>
                      Eligible donors receive tax exemption benefits under section 80G of the Income Tax Act upon campaign launch.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#24312d] block">100% Direct Impact:</strong>
                      Every rupee contributed goes directly into youth education, language instructors, and digital infrastructure.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e2e5dc] flex items-center justify-between text-[11px] text-[#65706a]">
                <span>Parivattan Mission Foundation</span>
                <span className="font-bold text-[#24312d]">Govt. Recognized NGO</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
