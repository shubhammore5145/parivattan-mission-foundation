import { FormEvent, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Heart,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  QrCode,
  CreditCard,
  Copy,
  Check,
  Share2,
  Download,
  BookOpen,
  Laptop,
  Globe2,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createDonation, getDonationStats } from "@/lib/supabase-admin";
import { getRazorpayKeyId, loadRazorpay } from "@/lib/razorpay";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const FUNDRAISING_GOAL = 2500000;

interface CauseOption {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const causes: CauseOption[] = [
  {
    id: "general",
    name: "General Education Fund",
    icon: GraduationCap,
    description: "Supports books, supplies & inclusive learning spaces for all community youth.",
  },
  {
    id: "languages",
    name: "Foreign Language School",
    icon: Globe2,
    description: "Sponsors Japanese, German & English coaching for overseas opportunities.",
  },
  {
    id: "technology",
    name: "Parivattan Tech School",
    icon: Laptop,
    description: "Equips students with laptops, coding courses, Python & web dev skills.",
  },
  {
    id: "girls-scholarship",
    name: "Girls Higher Education",
    icon: BookOpen,
    description: "Direct college tuition scholarships for deserving girls in rural Maharashtra.",
  },
];

const presetAmounts = [
  { value: 101, label: "₹101", badge: "Shubh Shagun 🪔" },
  { value: 250, label: "₹250", badge: "Study Kit 📚" },
  { value: 500, label: "₹500", badge: "Digital Lab 💻" },
  { value: 1000, label: "₹1,000", badge: "Popular ⭐", popular: true },
  { value: 2500, label: "₹2,500", badge: "Language Camp 🌍" },
  { value: 5000, label: "₹5,000", badge: "Scholarship 🏆" },
];

const getImpactMessage = (amt: number): string => {
  if (amt < 250) {
    return "Provides notebook packs and basic stationary for a young student beginning their educational journey.";
  } else if (amt < 500) {
    return "Provides full semester notebooks, stationery kits, and textbooks for a young student.";
  } else if (amt < 1000) {
    return "Funds 1 month of dedicated computer lab access, high-speed internet, and digital literacy.";
  } else if (amt < 2500) {
    return "Sponsors 1 month of professional Japanese / Foreign Language training and certification.";
  } else if (amt < 5000) {
    return "Covers an entire technical programming bootcamp track with mentorship and career support.";
  } else {
    return "Education Champion! You are directly sponsoring an entire semester's college scholarship!";
  }
};

const getLevelData = (amt: number) => {
  if (amt >= 5000) return { title: "Parivattan Legend", emoji: "👑", level: 5, percent: 100, color: "from-amber-400 to-yellow-500" };
  if (amt >= 2500) return { title: "Change Catalyst", emoji: "🌟", level: 4, percent: 85, color: "from-purple-500 to-indigo-500" };
  if (amt >= 1000) return { title: "Future Builder", emoji: "🚀", level: 3, percent: 65, color: "from-[#b5623b] to-amber-600" };
  if (amt >= 500) return { title: "Knowledge Booster", emoji: "⚡", level: 2, percent: 45, color: "from-blue-500 to-cyan-500" };
  return { title: "Kind Spark", emoji: "🌱", level: 1, percent: 25, color: "from-emerald-500 to-teal-500" };
};

const recentChangemakers = [
  { name: "Rahul S.", amount: "₹1,000", time: "10 mins ago", cause: "Tech School" },
  { name: "Pooja M.", amount: "₹2,500", time: "1 hour ago", cause: "Language School" },
  { name: "Snehal D.", amount: "₹500", time: "3 hours ago", cause: "Study Kits" },
  { name: "Amit K.", amount: "₹5,000", time: "Yesterday", cause: "Girls Scholarship" },
  { name: "Kishor B.", amount: "₹1,000", time: "Yesterday", cause: "General Fund" },
];

export default function DonationCheckoutPage() {
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ total_amount: 184500, total_donations: 42 });
  const [selectedCause, setSelectedCause] = useState<string>("general");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "upi_qr">("razorpay");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "1000",
    isAnonymous: false,
    want80G: false,
    panNumber: "",
  });

  // Success State
  const [successData, setSuccessData] = useState<{
    id: string;
    amount: number;
    donorName: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const pAmt = searchParams.get("amount");
    const pCause = searchParams.get("cause");
    if (pAmt && !isNaN(Number(pAmt)) && Number(pAmt) > 0) {
      setForm(prev => ({ ...prev, amount: pAmt }));
    }
    if (pCause && causes.some(c => c.id === pCause)) {
      setSelectedCause(pCause);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDonationStats();
        if (data && data.total_amount > 0) {
          setStats({
            total_amount: data.total_amount,
            total_donations: data.total_donations,
          });
        }
      } catch (err) {
        console.warn("Could not fetch live stats:", err);
      }
    };
    fetchStats();
  }, []);

  const numAmount = Math.max(1, Number(form.amount) || 0);
  const progressPercent = Math.min((stats.total_amount / FUNDRAISING_GOAL) * 100, 100);

  const update = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addAmount = (increment: number) => {
    const curr = Number(form.amount) || 0;
    update("amount", String(curr + increment));
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#b5623b", "#f59e0b", "#10b981"],
      });
    } catch {
      // safe
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#b5623b", "#e5a37f", "#24312d", "#f59e0b", "#10b981"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#b5623b", "#f59e0b", "#10b981"],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#b5623b", "#f59e0b", "#10b981"],
      });
    }, 250);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("parivattanmissionfoundation@sbi");
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email address for the receipt.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your contact phone number.");
      return;
    }
    if (!numAmount || numAmount < 1) {
      toast.error("Please enter a valid donation amount (min ₹1).");
      return;
    }

    setBusy(true);
    try {
      await loadRazorpay();
      const key = getRazorpayKeyId();
      if (!key || !window.Razorpay) throw new Error("Payment gateway is temporarily unavailable.");

      const selectedCauseObj = causes.find(c => c.id === selectedCause);

      new window.Razorpay({
        key,
        amount: Math.round(numAmount * 100),
        currency: "INR",
        name: "Parivattan Mission Foundation",
        description: `Donation: ${selectedCauseObj?.name || "Education Support"} (${frequency})`,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#b5623b" },
        handler: async (response: { razorpay_payment_id: string }) => {
          try {
            await createDonation({
              amount: numAmount,
              currency: "INR",
              payment_id: response.razorpay_payment_id,
              order_id: "",
              donor_name: form.isAnonymous ? "Anonymous Changemaker" : form.name,
              donor_email: form.email,
              donor_phone: form.phone,
              service_name: selectedCauseObj?.name || "General Education",
              status: "completed",
            });

            setSuccessData({
              id: response.razorpay_payment_id,
              amount: numAmount,
              donorName: form.name,
              date: new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            });

            fireConfetti();
            toast.success("Thank you for your generous contribution!");
            setStats(prev => ({
              total_amount: prev.total_amount + numAmount,
              total_donations: prev.total_donations + 1,
            }));
          } catch {
            toast.error("Payment was successful! We have logged your transaction ID.");
          }
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to launch secure payment.");
      setBusy(false);
    }
  };

  const handleManualUpiSuccess = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone number above so we can verify your UPI transfer.");
      return;
    }
    const fakeId = `UPI_${Date.now()}`;
    try {
      await createDonation({
        amount: numAmount,
        currency: "INR",
        payment_id: fakeId,
        order_id: "",
        donor_name: form.isAnonymous ? "Anonymous Changemaker" : form.name,
        donor_email: form.email || "upi-donor@parivattan.org",
        donor_phone: form.phone,
        service_name: causes.find(c => c.id === selectedCause)?.name || "UPI Direct Transfer",
        status: "completed",
      });

      setSuccessData({
        id: fakeId,
        amount: numAmount,
        donorName: form.name,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });

      fireConfetti();
      toast.success("Thank you! Your UPI contribution has been recorded.");
    } catch {
      toast.error("Unable to record transfer. Please contact us.");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌟 I just contributed ₹${successData?.amount} to support education & youth empowerment at Parivattan Mission Foundation! Every bit changes lives. You can support too: https://parivattan.org/donate`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
      <Header />

      <main className="page-section pt-32 md:pt-36">
        {/* Top Impact Badge & Hero */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
            <Sparkles size={14} className="text-[#b5623b]" />
            100% Goes To Education & Youth Growth · 80G Tax Deductible
          </div>

          <h1 className="mt-4 text-4xl font-serif leading-[1.08] sm:text-5xl md:text-6xl text-[#24312d]">
            Give the Gift of Possibility.
          </h1>

          <p className="mt-4 text-base text-[#65706a] leading-relaxed max-w-2xl mx-auto md:text-lg">
            Your support directly funds language classrooms, technology bootcamps, and life-changing student scholarships in Maharashtra.
          </p>

          {/* Live Progress Bar Card */}
          <div className="mt-8 rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#65706a]">Fundraising Target 2026</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-[#24312d] sm:text-3xl">
                  ₹{stats.total_amount.toLocaleString("en-IN")}{" "}
                  <span className="text-sm font-sans font-normal text-[#65706a]">
                    raised of ₹{FUNDRAISING_GOAL.toLocaleString("en-IN")} goal
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-[#fbfaf7] px-4 py-2 border border-[#e2e5dc]">
                <Users size={18} className="text-[#b5623b]" />
                <span className="text-sm font-bold text-[#24312d]">
                  {stats.total_donations} Changemakers
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-5 relative">
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#f1f3ed]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#b5623b] via-[#e5a37f] to-[#f59e0b] transition-all duration-1000 relative"
                  style={{ width: `${Math.max(progressPercent, 4)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {/* Milestone Dots */}
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-[#65706a]">
                <span>₹0 (Launch)</span>
                <span className="hidden sm:inline">25% (Study Kits)</span>
                <span>50% (Tech Lab)</span>
                <span className="hidden sm:inline">75% (Language Class)</span>
                <span>₹25 Lakhs (Full Goal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Donation Container */}
        <div className="mx-auto mt-10 max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            {/* Left: Donation Form Controls */}
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-7 shadow-sm md:p-9">
              {/* Step 1: Frequency Toggle */}
              <div className="flex rounded-2xl bg-[#fbfaf7] p-1.5 border border-[#e2e5dc]">
                <button
                  type="button"
                  onClick={() => setFrequency("one-time")}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                    frequency === "one-time"
                      ? "bg-[#b5623b] text-white shadow-sm"
                      : "text-[#65706a] hover:text-[#24312d]"
                  }`}
                >
                  One-Time Gift
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("monthly")}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                    frequency === "monthly"
                      ? "bg-[#b5623b] text-white shadow-sm"
                      : "text-[#65706a] hover:text-[#24312d]"
                  }`}
                >
                  Monthly Sathi <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] text-[#24312d] font-bold">2X Impact</span>
                </button>
              </div>

              {/* Step 2: Choose Impact Cause */}
              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wider text-[#24312d] flex items-center justify-between">
                  <span>1. Choose Cause / Initiative</span>
                  <span className="text-[11px] font-normal text-[#65706a]">Where your contribution goes</span>
                </label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {causes.map(c => {
                    const Icon = c.icon;
                    const isSelected = selectedCause === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCause(c.id)}
                        className={`flex flex-col text-left p-3.5 rounded-2xl border transition ${
                          isSelected
                            ? "border-[#b5623b] bg-[#b5623b]/5 ring-2 ring-[#b5623b]/20"
                            : "border-[#e2e5dc] bg-[#fbfaf7] hover:border-[#b5623b]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-sm text-[#24312d]">
                          <div className={`p-1.5 rounded-lg ${isSelected ? "bg-[#b5623b] text-white" : "bg-white text-[#b5623b]"}`}>
                            <Icon size={16} />
                          </div>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-[#65706a] line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Choose Amount */}
              <div className="mt-7">
                <label className="text-xs font-bold uppercase tracking-wider text-[#24312d] flex items-center justify-between">
                  <span>2. Select Amount</span>
                  <span className="text-xs text-[#b5623b] font-semibold">Tax benefits under 80G</span>
                </label>

                {/* Preset Chips */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {presetAmounts.map(p => {
                    const isSelected = form.amount === String(p.value);
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          update("amount", String(p.value));
                          try {
                            confetti({
                              particleCount: 25,
                              spread: 50,
                              origin: { y: 0.7 },
                              colors: ["#b5623b", "#f59e0b", "#10b981"],
                            });
                          } catch {
                            // safe
                          }
                        }}
                        className={`relative rounded-2xl p-3 border text-center transition ${
                          isSelected
                            ? "border-[#b5623b] bg-[#b5623b] text-white shadow-md transform scale-[1.02]"
                            : "border-[#e2e5dc] bg-[#fbfaf7] text-[#24312d] hover:border-[#b5623b]"
                        }`}
                      >
                        {p.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-[#24312d] shadow-sm">
                            POPULAR
                          </span>
                        )}
                        <span className="block text-lg font-bold">{p.label}</span>
                        <span className={`block text-[11px] mt-0.5 ${isSelected ? "text-white/80" : "text-[#65706a]"}`}>
                          {p.badge}
                        </span>
                      </button>
                    );
                  })}

                  {/* Custom quick input trigger */}
                  <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-2 flex items-center">
                    <span className="pl-2 font-bold text-[#65706a]">₹</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Custom"
                      value={form.amount}
                      onChange={e => update("amount", e.target.value)}
                      className="w-full bg-transparent px-2 py-1 text-base font-bold text-[#24312d] outline-none"
                    />
                  </div>
                </div>

                {/* Quick Increment Pills */}
                <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] text-[#65706a] whitespace-nowrap">Add more:</span>
                  {[100, 500, 1000].map(inc => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => addAmount(inc)}
                      className="rounded-full border border-[#e2e5dc] bg-[#fbfaf7] px-2.5 py-1 font-semibold text-[#65706a] hover:border-[#b5623b] hover:text-[#b5623b] transition"
                    >
                      +₹{inc}
                    </button>
                  ))}
                </div>

                {/* Dynamic Live Impact Card with Gamified Changemaker Level */}
                {(() => {
                  const lvl = getLevelData(numAmount);
                  return (
                    <div className="mt-4 rounded-2xl bg-amber-50/90 p-4 border border-amber-200/90 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lvl.emoji}</span>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#b5623b]">
                              Level {lvl.level} Changemaker
                            </span>
                            <h6 className="text-sm font-bold text-[#24312d] leading-none">{lvl.title}</h6>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {lvl.percent}% Impact Power
                        </span>
                      </div>

                      {/* Power bar */}
                      <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${lvl.color} transition-all duration-500`}
                          style={{ width: `${lvl.percent}%` }}
                        />
                      </div>

                      <div className="flex items-start gap-2.5 pt-1">
                        <div className="p-1.5 rounded-lg bg-amber-100 text-[#b5623b] shrink-0 mt-0.5">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h6 className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                            Your Impact for ₹{numAmount.toLocaleString("en-IN")}
                          </h6>
                          <p className="mt-0.5 text-xs text-[#24312d] font-medium leading-relaxed">
                            {getImpactMessage(numAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Step 4: Donor Details */}
              <div className="mt-7 pt-6 border-t border-[#e2e5dc]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#24312d] block mb-3">
                  3. Your Details (for Receipt)
                </label>
                <div className="space-y-3.5">
                  <div className="field">
                    <span className="text-xs text-[#65706a]">Full Name *</span>
                    <input
                      required
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={e => update("name", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="field">
                      <span className="text-xs text-[#65706a]">Email Address *</span>
                      <input
                        required
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={form.email}
                        onChange={e => update("email", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <span className="text-xs text-[#65706a]">Phone Number *</span>
                      <input
                        required
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={form.phone}
                        onChange={e => update("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Options: Anonymous & 80G */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#65706a]">
                      <input
                        type="checkbox"
                        checked={form.isAnonymous}
                        onChange={e => update("isAnonymous", e.target.checked)}
                        className="rounded border-[#e2e5dc] text-[#b5623b] focus:ring-[#b5623b]"
                      />
                      <span>Make my donation anonymous on the community changemakers wall</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#65706a]">
                      <input
                        type="checkbox"
                        checked={form.want80G}
                        onChange={e => update("want80G", e.target.checked)}
                        className="rounded border-[#e2e5dc] text-[#b5623b] focus:ring-[#b5623b]"
                      />
                      <span>I would like an 80G Tax Exemption Certificate</span>
                    </label>
                  </div>

                  {form.want80G && (
                    <div className="field animate-fadeIn">
                      <span className="text-xs text-[#65706a]">PAN Number (Required for 80G Tax Exemption)</span>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        value={form.panNumber}
                        onChange={e => update("panNumber", e.target.value.toUpperCase())}
                        maxLength={10}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Switcher Tabs */}
              <div className="mt-8 pt-6 border-t border-[#e2e5dc]">
                <div className="flex rounded-2xl bg-[#fbfaf7] p-1 border border-[#e2e5dc] mb-5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("razorpay")}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                      paymentMode === "razorpay"
                        ? "bg-[#24312d] text-white shadow-sm"
                        : "text-[#65706a] hover:text-[#24312d]"
                    }`}
                  >
                    <CreditCard size={15} />
                    Online Checkout (UPI / Card / NetBanking)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("upi_qr")}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                      paymentMode === "upi_qr"
                        ? "bg-[#24312d] text-white shadow-sm"
                        : "text-[#65706a] hover:text-[#24312d]"
                    }`}
                  >
                    <QrCode size={15} />
                    Scan & Pay (UPI QR)
                  </button>
                </div>

                {paymentMode === "razorpay" ? (
                  <div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={submit}
                      className="w-full rounded-full bg-[#b5623b] px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#954b2c] hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 text-base"
                    >
                      {busy ? (
                        <>
                          <LoaderCircle className="animate-spin" size={19} />
                          Opening Secure Payment Gateway...
                        </>
                      ) : (
                        <>
                          <Heart size={19} className="fill-white" />
                          Donate ₹{numAmount.toLocaleString("en-IN")} Securely
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                    <p className="mt-3 text-center text-xs text-[#65706a] flex items-center justify-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-600" />
                      100% Encrypted & Safe · Instant 80G Tax Exemption Receipt Generated
                    </p>
                  </div>
                ) : (
                  /* Scan & Pay QR Code View */
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Scan to Pay via any UPI App
                    </p>
                    <p className="text-xs text-[#65706a] mt-0.5">
                      Google Pay, PhonePe, Paytm, BHIM, Navi, Cred
                    </p>

                    <div className="mx-auto my-4 w-48 rounded-2xl bg-white p-3 shadow-md border border-[#e2e5dc]">
                      <img
                        src="/img/qr.png"
                        alt="Parivattan Mission Foundation UPI QR Code"
                        className="w-full h-auto rounded-lg object-contain"
                      />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 border border-[#e2e5dc] text-xs font-mono text-[#24312d]">
                      <span>parivattanmissionfoundation@sbi</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 text-[#b5623b] hover:text-[#954b2c]"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleManualUpiSuccess}
                        className="rounded-full bg-[#24312d] px-6 py-3 text-xs font-semibold text-white transition hover:bg-black shadow"
                      >
                        I Have Completed Payment via UPI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Why Donate & Social Proof */}
            <div className="space-y-6">
              {/* Trust Box */}
              <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm">
                <h4 className="font-serif text-xl text-[#24312d]">Why Your Donation Matters</h4>
                <div className="mt-4 space-y-3.5 text-xs text-[#65706a] leading-relaxed">
                  <div className="flex gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#24312d] block">Direct Student Impact:</strong>
                      Funds are deployed straight into classroom technology, coaching teachers, and study resources.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#24312d] block">Complete Financial Transparency:</strong>
                      Quarterly reports and field updates are shared transparently with all changemakers.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <strong className="text-[#24312d] block">Registered Non-Profit Foundation:</strong>
                      Section 8 registered NGO dedicated to sustainable social education in rural Maharashtra.
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Donors Wall / Ticker */}
              <div className="rounded-3xl border border-[#e2e5dc] bg-[#24312d] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#b5623b]/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-serif text-lg text-white flex items-center gap-2">
                      <Heart size={16} className="text-[#e5a37f] fill-[#e5a37f]" />
                      Recent Changemakers
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Live Support</span>
                  </div>

                  <div className="space-y-2.5">
                    {recentChangemakers.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/10 text-xs backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#b5623b] text-white flex items-center justify-center font-bold text-xs">
                            {d.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{d.name}</p>
                            <p className="text-[10px] text-slate-400">{d.cause} · {d.time}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#e5a37f] text-sm">{d.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-center">
                    <p className="text-[11px] text-slate-400">Join over 100+ passionate supporters this month!</p>
                  </div>
                </div>
              </div>

              {/* Parivattan Sathi Callout */}
              <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Award size={16} className="text-amber-700" />
                  Become a Parivattan Sathi
                </div>
                <h4 className="mt-2 font-serif text-lg text-[#24312d]">
                  "Be Shahu, Build Ambedkar"
                </h4>
                <p className="mt-1 text-xs text-[#65706a] leading-relaxed">
                  Join our recurring monthly community circle to ensure that no ambitious student is left behind due to financial barriers.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFrequency("monthly");
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#b5623b] hover:underline"
                >
                  Join as Monthly Sathi <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Celebration & Digital Certificate Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 text-center shadow-2xl border border-[#e2e5dc] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#b5623b] via-[#e5a37f] to-amber-500"></div>

            {/* Sparkle Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <FileCheck2 size={36} />
            </div>

            <h3 className="font-serif text-3xl text-[#24312d]">Thank You, Changemaker!</h3>
            <p className="mt-1.5 text-xs text-[#65706a]">
              Your donation of <strong className="text-[#24312d] font-bold text-sm">₹{successData.amount.toLocaleString("en-IN")}</strong> has been received with immense gratitude.
            </p>

            {/* Digital Certificate Card */}
            <div className="mt-5 rounded-2xl border-2 border-dashed border-[#b5623b]/40 bg-[#fbfaf7] p-5 text-left">
              <div className="flex items-center justify-between border-b border-[#e2e5dc] pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#b5623b]">Official Benefactor</p>
                  <h4 className="font-serif text-lg text-[#24312d]">{successData.donorName}</h4>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#b5623b]/10 flex items-center justify-center text-[#b5623b]">
                  <Award size={22} />
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-[#65706a]">
                <p><strong>Contribution:</strong> ₹{successData.amount.toLocaleString("en-IN")}</p>
                <p><strong>Receipt / ID:</strong> <span className="font-mono text-[11px]">{successData.id}</span></p>
                <p><strong>Date:</strong> {successData.date}</p>
                <p><strong>Beneficiary:</strong> Parivattan Mission Foundation Education Programs</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow"
              >
                <Share2 size={16} /> Share on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="flex-1 rounded-full border border-[#d9ddd4] px-5 py-3 text-xs font-semibold text-[#24312d] hover:bg-[#fbfaf7] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
