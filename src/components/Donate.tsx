import React, { useState, useEffect } from 'react';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  QrCode,
  Copy,
  Check,
  GraduationCap,
  Globe2,
  Laptop,
  BookOpen,
  X,
  MessageCircle,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDonationStats } from '@/lib/supabase-admin';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface Cause {
  id: string;
  name: string;
  marathi: string;
  icon: React.ElementType;
  desc: string;
  tag: string;
}

const causes: Cause[] = [
  {
    id: 'general',
    name: 'General Education',
    marathi: 'मूलभूत शिक्षण निधी',
    icon: GraduationCap,
    desc: 'Textbooks, inclusive learning spaces & foundational tools for every student.',
    tag: 'Foundational',
  },
  {
    id: 'languages',
    name: 'Foreign Language School',
    marathi: 'विदेशी भाषा प्रशिक्षण',
    icon: Globe2,
    desc: 'Japanese (JLPT) & German certification for global job placements.',
    tag: 'Global Careers',
  },
  {
    id: 'technology',
    name: 'Parivattan Tech School',
    marathi: 'टेक व कोडिंग शिक्षण',
    icon: Laptop,
    desc: 'Hands-on laptop bootcamps, Python coding & web development for youth.',
    tag: 'Digital Future',
  },
  {
    id: 'girls-scholarship',
    name: 'Savitribai Girls Higher Ed',
    marathi: 'मुलींचे उच्च शिक्षण',
    icon: BookOpen,
    desc: 'Direct college tuition grants & hostel assistance for rural girls.',
    tag: 'Women Empowerment',
  },
];

const presets = [
  { amount: 101, label: '₹101', title: 'Shubh Shagun 🪔', level: 1 },
  { amount: 250, label: '₹250', title: 'Study Kit 📚', level: 1 },
  { amount: 500, label: '₹500', title: 'Computer Lab 💻', level: 2 },
  { amount: 1000, label: '₹1,000', title: 'Future Builder ⭐', level: 3, popular: true },
  { amount: 2500, label: '₹2,500', title: 'Language Pass 🌍', level: 4 },
  { amount: 5000, label: '₹5,000', title: 'Scholarship 🏆', level: 5 },
];

const getImpactLevel = (amt: number) => {
  if (amt >= 5000) return { level: 5, title: 'Parivattan Legend', emoji: '👑', color: 'from-amber-400 to-yellow-500', percent: 100 };
  if (amt >= 2500) return { level: 4, title: 'Change Catalyst', emoji: '🌟', color: 'from-purple-500 to-indigo-500', percent: 85 };
  if (amt >= 1000) return { level: 3, title: 'Future Builder', emoji: '🚀', color: 'from-[#b5623b] to-amber-600', percent: 65 };
  if (amt >= 500) return { level: 2, title: 'Knowledge Booster', emoji: '⚡', color: 'from-blue-500 to-cyan-500', percent: 45 };
  return { level: 1, title: 'Kind Spark', emoji: '🌱', color: 'from-emerald-500 to-teal-500', percent: 25 };
};

const getDetailedStory = (amt: number, causeName: string) => {
  if (amt < 250) {
    return `Your ₹${amt} provides notebook packs and pens for a first-generation student starting school.`;
  } else if (amt < 500) {
    return `Your ₹${amt} funds a complete semester study kit including textbooks and reference materials.`;
  } else if (amt < 1000) {
    return `Your ₹${amt} powers 1 month of digital computer lab access, high-speed internet & coding exercises in ${causeName}.`;
  } else if (amt < 2500) {
    return `Your ₹${amt} sponsors 1 month of intensive coaching, certification prep, and mock exams for rural youth!`;
  } else if (amt < 5000) {
    return `Outstanding! Your ₹${amt} sponsors a student's complete career bootcamp module with mentorship & job assistance!`;
  } else {
    return `Transformational Impact! Your ₹${amt} directly covers an entire semester's college scholarship for a deserving student!`;
  }
};

const Donate: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCause, setSelectedCause] = useState<string>('general');
  const [amount, setAmount] = useState<number>(1000);
  const [customInput, setCustomInput] = useState<string>('1000');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [stats, setStats] = useState({ total_amount: 184500, total_donations: 42 });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDonationStats();
        if (res && res.total_amount > 0) {
          setStats({ total_amount: res.total_amount, total_donations: res.total_donations });
        }
      } catch (e) {
        console.warn('Stats fetch fallback:', e);
      }
    };
    fetchStats();
  }, []);

  const fireConfetti = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#b5623b', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomInput(val.toString());
    fireConfetti();
  };

  const handleQuickAdd = (bump: number) => {
    const next = amount + bump;
    setAmount(next);
    setCustomInput(next.toString());
    fireConfetti();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(clean);
    const parsed = parseInt(clean, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('parivattanmissionfoundation@sbi');
    setCopiedUpi(true);
    toast.success('SBI UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleProceedToDonate = () => {
    fireConfetti();
    navigate(`/donate?amount=${amount}&cause=${selectedCause}`);
  };

  const impactLevel = getImpactLevel(amount);
  const currentCause = causes.find((c) => c.id === selectedCause) || causes[0];
  const goal = 2500000;
  const progressPercent = Math.min(100, Math.round((stats.total_amount / goal) * 100));

  return (
    <section id="donate" className="py-20 bg-gradient-to-b from-[#fbfaf7] via-[#f7f3ed] to-[#fbfaf7] relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-amber-200/30 via-orange-100/40 to-emerald-100/30 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#b5623b]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/30 text-[#b5623b] text-xs md:text-sm font-semibold tracking-wide uppercase shadow-sm mb-4">
            <Sparkles size={15} className="animate-spin text-amber-600" style={{ animationDuration: '6s' }} />
            <span>एक हात मदतीचा, उज्ज्वल भविष्यासाठी • Parivattan Changemakers</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#24312d] leading-tight tracking-tight">
            लहान पाऊल, <span className="text-[#b5623b] underline decoration-[#e5a37f]/50 decoration-wavy underline-offset-8">महान क्रांती!</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed font-sans">
            तुमच्या एका लहान मदतीने ग्रामीण भागातील मुलांचे भविष्य बदलू शकते. जपानी व जर्मन भाषा शिक्षण, कोडिंग बूटकॅम्प, आणि उच्च शिक्षणासाठी थेट शिष्यवृत्ती.
          </p>

          {/* Live Momentum Bar */}
          <div className="mt-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between text-xs md:text-sm mb-2 gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Flame size={16} className="text-amber-500 fill-amber-500" />
                <span>संकलित निधी: <strong className="text-[#b5623b] text-base">₹{stats.total_amount.toLocaleString('en-IN')}</strong></span>
              </span>
              <span className="text-slate-500">
                लक्ष्य: ₹25,00,000 (Goal) • <strong className="text-emerald-600">{stats.total_donations} दाते</strong>
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden p-0.5 border border-stone-200">
              <div
                className="bg-gradient-to-r from-amber-500 via-[#b5623b] to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.max(8, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Interactive Donation Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
          {/* Cause Selector Tabs */}
          <div className="bg-stone-50/80 p-4 border-b border-stone-200">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award size={14} className="text-[#b5623b]" />
                १. ज्या कारणासाठी मदत करायची आहे ते निवडा (Choose Cause)
              </span>
              <span className="text-xs text-[#b5623b] font-medium hidden sm:inline">100% Direct Impact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {causes.map((cause) => {
                const IconComponent = cause.icon;
                const isSelected = selectedCause === cause.id;
                return (
                  <button
                    key={cause.id}
                    onClick={() => {
                      setSelectedCause(cause.id);
                      fireConfetti();
                    }}
                    type="button"
                    className={`relative p-3.5 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-white border-[#b5623b] shadow-md ring-2 ring-[#b5623b]/20 translate-y-[-2px]'
                        : 'bg-white/60 border-stone-200 hover:border-stone-300 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#b5623b] text-white shadow-sm' : 'bg-stone-100 text-slate-700 group-hover:bg-stone-200'
                          }`}
                        >
                          <IconComponent size={18} />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-[#b5623b]/10 text-[#b5623b]' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {cause.tag}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{cause.name}</h4>
                      <p className="text-xs font-medium text-[#b5623b] mt-0.5">{cause.marathi}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{cause.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Amount & Impact Playground */}
          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Amount Buttons & Bumpers */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Heart size={14} className="text-[#b5623b]" />
                    २. देणगी रक्कम निवडा (Select Amount)
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    80G Tax Deductible
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {presets.map((item) => {
                    const isSelected = amount === item.amount;
                    return (
                      <button
                        key={item.amount}
                        type="button"
                        onClick={() => handleSelectAmount(item.amount)}
                        className={`relative p-3 rounded-2xl border text-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#b5623b] text-white border-[#b5623b] shadow-lg shadow-[#b5623b]/25 scale-102 font-bold ring-2 ring-[#b5623b]/30'
                            : 'bg-stone-50 border-stone-200 text-slate-800 hover:bg-stone-100 hover:border-stone-300 font-semibold'
                        }`}
                      >
                        {item.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                            Popular
                          </span>
                        )}
                        <div className="text-base sm:text-lg">{item.label}</div>
                        <div
                          className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-white/90' : 'text-slate-500'
                          }`}
                        >
                          {item.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input + Quick Bumpers */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customInput}
                      onChange={handleCustomChange}
                      placeholder="Enter custom amount"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all shadow-sm"
                    />
                  </div>

                  {/* Quick Increment Bumpers */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">वाढवा:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(100)}
                      className="px-3 py-2 bg-white border border-stone-200 hover:border-[#b5623b] hover:text-[#b5623b] rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      +₹100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(500)}
                      className="px-3 py-2 bg-white border border-stone-200 hover:border-[#b5623b] hover:text-[#b5623b] rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      +₹500
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(1000)}
                      className="px-3 py-2 bg-white border border-stone-200 hover:border-[#b5623b] hover:text-[#b5623b] rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      +₹1,000
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Donate & QR Scanner */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProceedToDonate}
                  className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-[#b5623b] to-[#cf754c] hover:from-[#a0522e] hover:to-[#b5623b] text-white font-bold text-base rounded-2xl shadow-lg shadow-[#b5623b]/25 hover:shadow-xl hover:shadow-[#b5623b]/35 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-98"
                >
                  <Heart size={20} className="fill-white/20 group-hover:scale-110 transition-transform" />
                  <span>Donate ₹{amount.toLocaleString('en-IN')} Now</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full sm:w-auto py-4 px-5 bg-white border-2 border-[#24312d] text-[#24312d] hover:bg-[#24312d] hover:text-white font-bold text-sm rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
                >
                  <QrCode size={18} />
                  <span>Instant UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={fireConfetti}
                  title="Celebrate Giving Spirit"
                  className="p-4 bg-amber-100/70 border border-amber-300 text-amber-800 rounded-2xl hover:bg-amber-200 transition-all flex items-center justify-center hover:rotate-12 shadow-sm"
                >
                  <Sparkles size={20} className="text-amber-600" />
                </button>
              </div>
            </div>

            {/* Right Column: Gamified Impact Level & Story Preview */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#24312d] to-[#1a2320] text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl">
              {/* Subtle visual ambient glows */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#b5623b]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Gamified Level Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{impactLevel.emoji}</span>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-[#f2c5a8]">
                        CHANGEMAKER LEVEL {impactLevel.level}
                      </div>
                      <h5 className="text-lg font-bold text-white leading-none">{impactLevel.title}</h5>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-300 border border-white/10">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Level Power Bar */}
                <div>
                  <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
                    <span>Power of your contribution:</span>
                    <span>{impactLevel.percent}% Impact Score</span>
                  </div>
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${impactLevel.color} transition-all duration-500`}
                      style={{ width: `${impactLevel.percent}%` }}
                    />
                  </div>
                </div>

                {/* Real-time Human Impact Story */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#b5623b]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#f2c5a8]">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h6 className="text-xs uppercase font-bold text-[#f2c5a8] tracking-wider mb-1">
                        तुमचा प्रत्यक्ष प्रभाव (Your Real Impact)
                      </h6>
                      <p className="text-sm text-stone-200 leading-relaxed font-sans">
                        {getDetailedStory(amount, currentCause.name)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Points */}
                <div className="space-y-2.5 text-xs text-white/80 pt-1">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    <span>80G Tax Exemption Certificate instantly provided</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={16} className="text-amber-400 shrink-0" />
                    <span>Quarterly progress and transparency report emailed to you</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Zap size={16} className="text-cyan-400 shrink-0" />
                    <span>100% direct deployment into classroom equipment & student fees</span>
                  </div>
                </div>

                {/* Micro CTA */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-white/50">
                    Join over 100+ change leaders this year. Every rupee counts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Transparency Footer Bar */}
          <div className="bg-stone-100/75 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck size={16} className="text-emerald-600" />
                Section 8 Non-Profit Reg. #158298
              </span>
              <span className="hidden sm:inline text-stone-400">•</span>
              <span className="hidden sm:inline font-medium">80G & 12A Certified</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="text-[#b5623b] font-bold hover:underline flex items-center gap-1"
              >
                <QrCode size={14} />
                <span>UPI ID: parivattanmissionfoundation@sbi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instant UPI QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 flex items-center justify-center text-[#b5623b]">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Scan & Pay with Any UPI App</h3>
                  <p className="text-xs text-slate-500">GPay • PhonePe • Paytm • BHIM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR Image Box */}
            <div className="my-5 flex flex-col items-center">
              <div className="relative p-3 bg-white rounded-2xl border-2 border-dashed border-[#b5623b]/50 shadow-md">
                <img
                  src="/img/qr.png"
                  alt="Parivattan Mission SBI UPI QR Code"
                  className="w-56 h-auto object-contain rounded-lg"
                />
                <div className="mt-2 text-center">
                  <span className="inline-block bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full border border-amber-300">
                    Donation Amount: ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* UPI ID Copy Field */}
              <div className="w-full mt-4 bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                <div className="truncate mr-2">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Official SBI UPI ID</div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-slate-800 select-all">
                    parivattanmissionfoundation@sbi
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 bg-[#b5623b] text-white hover:bg-[#9c4c28] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
                >
                  {copiedUpi ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Instruction & WhatsApp confirmation */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-600 text-center leading-relaxed">
                Scan using any UPI app on your phone, enter ₹{amount}, and confirm. You will receive an official tax receipt.
              </p>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/918767674251?text=${encodeURIComponent(
                    `Namaste Parivattan Team! I have contributed ₹${amount} for ${currentCause.name} via UPI. Kindly provide receipt.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageCircle size={15} />
                  <span>Notify on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowQrModal(false);
                    handleProceedToDonate();
                  }}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Card / Netbanking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Donate;
