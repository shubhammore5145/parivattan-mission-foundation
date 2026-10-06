import React from 'react';
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
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
    id: 'languages',
    name: 'Foreign Language School',
    marathi: 'विदेशी भाषा प्रशिक्षण',
    icon: Globe2,
    desc: 'Japanese (JLPT) & German coaching for youth to access global careers.',
    tag: 'Global Careers',
  },
  {
    id: 'technology',
    name: 'Parivattan Tech School',
    marathi: 'टेक व कोडिंग शिक्षण',
    icon: Laptop,
    desc: 'Hands-on laptop bootcamps, Python programming & full stack web development.',
    tag: 'Digital Future',
  },
  {
    id: 'girls-scholarship',
    name: 'Savitribai Girls Higher Ed',
    marathi: 'मुलींचे उच्च शिक्षण निधी',
    icon: BookOpen,
    desc: 'Direct college tuition support & hostel assistance for rural girls.',
    tag: 'Women Empowerment',
  },
  {
    id: 'general',
    name: 'Foundational Education',
    marathi: 'मूलभूत शिक्षण साहित्य',
    icon: GraduationCap,
    desc: 'Textbooks, study kits & inclusive learning centers for first-generation learners.',
    tag: 'Foundational',
  },
];

const Donate: React.FC = () => {
  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Team! I would like to know more about the upcoming Donation Campaign and how I can contribute."
  );

  return (
    <section id="donate" className="py-20 md:py-28 bg-gradient-to-b from-[#fbfaf7] via-[#f7f3ed] to-[#fbfaf7] relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-amber-200/30 via-orange-100/40 to-emerald-100/30 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#b5623b]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-72 h-72 bg-[#e5a37f]/15 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/30 text-[#b5623b] text-xs md:text-sm font-semibold tracking-wide uppercase shadow-sm mb-4">
            <Sparkles size={15} className="animate-spin text-amber-600" style={{ animationDuration: '6s' }} />
            <span>देणगी मोहीम • Donation Campaign</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#24312d] leading-tight tracking-tight">
            शिक्षणातून परिवर्तन, <span className="text-[#b5623b] underline decoration-[#e5a37f]/50 decoration-wavy underline-offset-8">उज्ज्वल भविष्यासाठी!</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed font-sans">
            ग्रामीण व गरजू विद्यार्थ्यांच्या उज्ज्वल भविष्यासाठी आमची नवीन देणगी मोहीम लवकरच सुरू होत आहे.
          </p>
        </div>

        {/* Main Coming Soon Showcase Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
          {/* Top Banner / Announcement */}
          <div className="relative bg-gradient-to-br from-[#24312d] via-[#2c3d38] to-[#1c2623] p-8 md:p-12 text-white overflow-hidden text-center">
            {/* Ambient decorative elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#b5623b]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#e5a37f]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#f2c5a8] text-xs font-bold uppercase tracking-wider mb-5 backdrop-blur-md">
                <Clock size={14} className="animate-pulse text-amber-300" />
                <span>Launching Soon • लवकरच येत आहे</span>
              </div>

              <h3 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
                Coming Soon!
              </h3>

              <p className="text-stone-200 text-sm md:text-base leading-relaxed mb-6 font-sans">
                आम्ही देणगी मोहिमेची संपूर्ण यंत्रणा अधिक पारदर्शक आणि सुलभ करत आहोत. नवीन शैक्षणिक उपक्रम, थेट विद्यार्थी मदत आणि अधिकृत पेमेंट पर्याय लवकरच या पानावर उपलब्ध होतील.
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/917820831901?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle size={17} />
                  <span>मोहिमेबद्दल जाणून घ्या (WhatsApp)</span>
                </a>

                <a
                  href="/#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-all duration-300"
                >
                  <Phone size={15} />
                  <span>आमच्याशी संपर्क साधा</span>
                </a>
              </div>
            </div>
          </div>

          {/* Upcoming Causes Preview Grid */}
          <div className="p-6 md:p-10 bg-stone-50/50 border-b border-stone-200">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                Upcoming Causes
              </span>
              <h4 className="font-serif text-2xl font-bold text-[#24312d] mt-1">
                मोहिमेद्वारे कोणत्या उपक्रमांना मदत होईल?
              </h4>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5">
                नवीन देणगी मोहिमेद्वारे खालील मुख्य उपक्रमांसाठी निधी संकलित केला जाईल:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingCauses.map((cause) => {
                const IconComponent = cause.icon;
                return (
                  <div
                    key={cause.id}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center">
                          <IconComponent size={20} />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-[#24312d]">
                          {cause.tag}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm leading-snug">{cause.name}</h5>
                      <p className="text-xs font-medium text-[#b5623b] mt-0.5">{cause.marathi}</p>
                      <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{cause.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>प्रस्तावित उपक्रम</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Direct Connect & Transparency Strip */}
          <div className="bg-white px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck size={16} className="text-emerald-600" />
                Section 8 Non-Profit Foundation Reg. #158298
              </span>
              <span className="hidden sm:inline text-stone-300">•</span>
              <span className="text-slate-600">80G & 12A Certified</span>
              <span className="hidden sm:inline text-stone-300">•</span>
              <span className="text-slate-600">Dharashiv, Maharashtra</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:+917820831901"
                className="text-[#b5623b] font-bold hover:underline flex items-center gap-1.5"
              >
                <Phone size={14} />
                <span>+91 7820831901</span>
              </a>
              <span className="text-stone-300">•</span>
              <a
                href="mailto:contact@parivattan.org"
                className="text-slate-600 hover:text-[#b5623b] flex items-center gap-1.5"
              >
                <Mail size={14} />
                <span>contact@parivattan.org</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Donate;
