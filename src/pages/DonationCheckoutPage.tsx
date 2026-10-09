import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Sparkles,
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
  CreditCard,
  QrCode,
  Lock,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { openRazorpayPayment, getRazorpayKeyId } from "@/lib/razorpay";
import { createDonation } from "@/lib/supabase-admin";
import { toast } from "sonner";

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

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000];

interface DonationReceiptData {
  receiptNo: string;
  paymentId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  cause: string;
  date: string;
}

export default function DonationCheckoutPage() {
  const [selectedCause, setSelectedCause] = useState<string>("languages");
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [panNumber, setPanNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<DonationReceiptData | null>(null);

  const activeAmount = isCustom ? (parseInt(customAmount) || 0) : amount;

  const handleSelectPreset = (val: number) => {
    setIsCustom(false);
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomAmount(raw);
    setIsCustom(true);
  };

  const currentCauseObj = upcomingCauses.find((c) => c.id === selectedCause) || upcomingCauses[0];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeAmount || activeAmount < 10) {
      toast.error("Please enter a valid donation amount (minimum ₹10).");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await openRazorpayPayment({
        amount: activeAmount,
        name: "Parivattan Mission Foundation",
        description: `Donation: ${currentCauseObj.name} (${currentCauseObj.marathi})`,
        image: "/img/parivattanE.png",
        prefill: {
          name: fullName.trim(),
          email: email.trim() || undefined,
          contact: phone.trim(),
        },
        notes: {
          cause: currentCauseObj.name,
          pan: panNumber.trim() || "N/A",
        },
        themeColor: "#b5623b",
        onSuccess: async (response) => {
          const receiptNo = `PMF-DON-${Date.now().toString().slice(-6)}`;
          const payId = response.razorpay_payment_id || `PAY_${Date.now()}`;

          // Save donation record
          try {
            await createDonation({
              amount: activeAmount,
              currency: "INR",
              payment_id: payId,
              order_id: response.razorpay_order_id || receiptNo,
              service_id: selectedCause,
              service_name: currentCauseObj.name,
              donor_name: fullName.trim(),
              donor_email: email.trim(),
              donor_phone: phone.trim(),
              status: "completed",
            });
          } catch (err) {
            console.warn("Could not save donation record to database:", err);
          }

          setReceipt({
            receiptNo,
            paymentId: payId,
            amount: activeAmount,
            donorName: fullName.trim(),
            donorEmail: email.trim(),
            donorPhone: phone.trim(),
            cause: `${currentCauseObj.name} - ${currentCauseObj.marathi}`,
            date: new Date().toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          });

          setIsSubmitting(false);
          toast.success("Payment successful! Thank you for supporting Parivattan.");
        },
        onDismiss: () => {
          setIsSubmitting(false);
          toast.info("Payment window was cancelled.");
        },
        onError: (err) => {
          setIsSubmitting(false);
          console.error("Razorpay Error:", err);
          toast.error("Could not initiate payment. Please try again.");
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      console.error("Checkout launch error:", err);
      toast.error("Payment gateway could not be loaded. Please check your internet connection.");
    }
  };

  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Mission Foundation! I would like to inquire about the Donation Campaign and explore partnership/support opportunities."
  );

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
      <Header />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-[#65706a]">
            <Link to="/" className="hover:text-[#b5623b] transition">
              Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-[#24312d] font-semibold">Online Donation</span>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#24312d] via-[#2a3a35] to-[#1c2623] p-8 md:p-12 text-white shadow-xl overflow-hidden mb-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#b5623b]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#e5a37f]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#f2c5a8] border border-white/15 backdrop-blur-md mb-5">
                <Sparkles size={14} className="text-amber-300" />
                <span>Live Razorpay Payment Gateway • अधिकृत देणगी पोर्टल</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif leading-[1.1] text-white">
                Power a Learner's Future Today.
              </h1>

              <p className="mt-3 text-xl font-serif text-[#e5a37f]">
                शिक्षणातून सामाजिक परिवर्तन — थेट विद्यार्थ्यांसाठी मदतीचा हात!
              </p>

              <p className="mt-4 text-xs md:text-sm text-stone-200 leading-relaxed max-w-2xl font-sans">
                Every contribution empowers rural youth in Maharashtra with certified international language coaching (Japanese & German), hands-on coding literacy, and university access. 100% secured by Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).
              </p>
            </div>
          </div>

          {/* If Receipt is Generated */}
          {receipt ? (
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-white p-8 md:p-12 shadow-xl mb-12">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={36} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Payment Confirmed • देणगी यशस्वी
                </span>
                <h2 className="mt-2 text-3xl font-serif text-[#24312d]">
                  धन्यवाद, {receipt.donorName}!
                </h2>
                <p className="mt-2 text-sm text-[#65706a]">
                  Your contribution of <strong className="text-[#24312d]">₹{receipt.amount.toLocaleString("en-IN")}</strong> has been received with gratitude by Parivattan Mission Foundation.
                </p>

                {/* Printable Receipt Card */}
                <div className="mt-8 rounded-2xl border border-stone-200 bg-[#fbfaf7] p-6 text-left shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#24312d]">
                        Official Donation Receipt
                      </h3>
                      <p className="text-xs text-[#65706a]">Section 8 Non-Profit • Reg. #158298</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-full border border-stone-200 text-[#b5623b]">
                      {receipt.receiptNo}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#65706a] block">Transaction ID (Razorpay):</span>
                      <span className="font-mono font-bold text-[#24312d] break-all">{receipt.paymentId}</span>
                    </div>
                    <div>
                      <span className="text-[#65706a] block">Date & Time:</span>
                      <span className="font-semibold text-[#24312d]">{receipt.date}</span>
                    </div>
                    <div>
                      <span className="text-[#65706a] block">Donor Name:</span>
                      <span className="font-semibold text-[#24312d]">{receipt.donorName}</span>
                    </div>
                    <div>
                      <span className="text-[#65706a] block">Mobile / Phone:</span>
                      <span className="font-semibold text-[#24312d]">{receipt.donorPhone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#65706a] block">Allocated Purpose:</span>
                      <span className="font-semibold text-[#24312d]">{receipt.cause}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <span className="text-sm font-semibold text-emerald-900">Total Contribution</span>
                    <span className="text-2xl font-serif font-bold text-emerald-700">
                      ₹{receipt.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#24312d] px-6 py-3 text-xs font-bold text-white hover:bg-[#344540] transition"
                  >
                    <Download size={14} />
                    <span>Print Receipt / पावती प्रिंट करा</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `I just supported Parivattan Mission Foundation with ₹${receipt.amount} for rural education! Learn more and support at https://parivattan.org/donate`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <Share2 size={14} />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setReceipt(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-xs font-bold text-[#24312d] hover:bg-stone-50 transition"
                  >
                    <span>नवीन देणगी द्या (New Contribution)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Live Donation Form & Cause Selector */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Left Column: Donation Form */}
              <div className="lg:col-span-7 rounded-3xl border border-[#e2e5dc] bg-white p-7 md:p-9 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e2e5dc] pb-4 mb-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#b5623b]">
                      Step 1 of 2 • रक्कम निवडा
                    </span>
                    <h2 className="text-xl md:text-2xl font-serif text-[#24312d]">
                      Select Contribution Amount
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <Lock size={12} />
                    <span>Razorpay Live</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Select Cause */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#65706a] mb-2">
                      Choose Cause / उद्देश निवडा
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {upcomingCauses.map((cause) => {
                        const Icon = cause.icon;
                        const isSelected = selectedCause === cause.id;
                        return (
                          <button
                            type="button"
                            key={cause.id}
                            onClick={() => setSelectedCause(cause.id)}
                            className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "border-[#b5623b] bg-[#b5623b]/5 ring-1 ring-[#b5623b]"
                                : "border-[#e2e5dc] bg-white hover:border-[#b5623b]/50"
                            }`}
                          >
                            <div
                              className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-[#b5623b] text-white" : "bg-stone-100 text-[#b5623b]"
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#24312d] block truncate">
                                {cause.name}
                              </span>
                              <span className="text-[10px] text-[#65706a] block truncate">
                                {cause.marathi}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preset Amount Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#65706a] mb-2">
                      Select Amount / रक्कम
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRESET_AMOUNTS.map((val) => {
                        const isSelected = !isCustom && amount === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => handleSelectPreset(val)}
                            className={`py-3 px-2 rounded-xl text-center font-serif text-base font-bold transition-all border ${
                              isSelected
                                ? "bg-[#b5623b] text-white border-[#b5623b] shadow-sm"
                                : "bg-[#fbfaf7] text-[#24312d] border-[#e2e5dc] hover:border-[#b5623b]"
                            }`}
                          >
                            ₹{val.toLocaleString("en-IN")}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Amount Field */}
                    <div className="mt-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#65706a]">
                          ₹
                        </span>
                        <input
                          type="text"
                          placeholder="Or enter custom amount (उदा. ₹3000)"
                          value={customAmount}
                          onChange={handleCustomChange}
                          className={`w-full rounded-xl border bg-[#fbfaf7] pl-8 pr-4 py-2.5 text-sm font-medium outline-none transition ${
                            isCustom
                              ? "border-[#b5623b] ring-1 ring-[#b5623b] bg-white font-bold"
                              : "border-[#e2e5dc] focus:border-[#b5623b]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="border-t border-[#e2e5dc] pt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#b5623b] block mb-3">
                      Step 2 of 2 • देणगीदाराची माहिती (Donor Details)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#24312d] mb-1">
                          Full Name / पूर्ण नाव <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Patil"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-[#e2e5dc] bg-[#fbfaf7] px-3.5 py-2.5 text-sm outline-none focus:border-[#b5623b] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24312d] mb-1">
                          Mobile Number (10 digits) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-[#e2e5dc] bg-[#fbfaf7] px-3.5 py-2.5 text-sm outline-none focus:border-[#b5623b] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24312d] mb-1">
                          Email Address (for receipt)
                        </label>
                        <input
                          type="email"
                          placeholder="rahul@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-[#e2e5dc] bg-[#fbfaf7] px-3.5 py-2.5 text-sm outline-none focus:border-[#b5623b] focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#24312d] mb-1">
                          PAN Number <span className="text-[10px] text-[#65706a]">(Optional, for 80G Tax Exemption)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          className="w-full rounded-xl border border-[#e2e5dc] bg-[#fbfaf7] px-3.5 py-2.5 text-sm uppercase tracking-wider outline-none focus:border-[#b5623b] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || activeAmount < 10}
                      className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#b5623b] hover:bg-[#984f2d] text-white py-4 px-6 font-semibold shadow-lg shadow-[#b5623b]/25 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard size={18} />
                      <span>
                        {isSubmitting
                          ? "Connecting to Razorpay..."
                          : `Contribute ₹${activeAmount.toLocaleString("en-IN")} via Razorpay`}
                      </span>
                    </button>
                    <p className="mt-2 text-center text-[11px] text-[#65706a]">
                      Supports Google Pay, PhonePe, Paytm, BHIM UPI, Cards & NetBanking.
                    </p>
                  </div>
                </form>
              </div>

              {/* Right Column: Trust, Summary & Contact */}
              <div className="lg:col-span-5 space-y-6">
                {/* Contribution Summary Card */}
                <div className="rounded-3xl border border-[#e2e5dc] bg-[#24312d] text-white p-7 shadow-lg">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5a37f]">
                    Donation Summary
                  </span>
                  <div className="mt-3 flex items-baseline justify-between border-b border-white/10 pb-4">
                    <span className="text-sm text-stone-300">Selected Cause:</span>
                    <span className="text-sm font-semibold text-white">{currentCauseObj.name}</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between border-b border-white/10 pb-4">
                    <span className="text-sm text-stone-300">Amount:</span>
                    <span className="text-2xl font-serif font-bold text-[#e5a37f]">
                      ₹{activeAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2.5 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>Instant digital receipt with transaction ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>Tax exemption eligible under Section 80G</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>Direct student educational scholarship support</span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact & Help */}
                <div className="rounded-3xl border border-[#e2e5dc] bg-white p-7 shadow-sm">
                  <h3 className="font-serif font-bold text-base text-[#24312d]">
                    Need Assistance with Payment?
                  </h3>
                  <p className="mt-1 text-xs text-[#65706a]">
                    Connect with our donation coordinators directly on phone or WhatsApp.
                  </p>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <a
                      href="tel:+917820831901"
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#fbfaf7] hover:bg-stone-100 transition font-semibold text-[#24312d]"
                    >
                      <Phone size={15} className="text-[#b5623b]" />
                      <span>+91 7820831901</span>
                    </a>
                    <a
                      href={`https://wa.me/917820831901?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition font-semibold"
                    >
                      <MessageCircle size={15} className="text-emerald-600" />
                      <span>WhatsApp Inquiry</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supported Causes Section */}
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-7 md:p-10 shadow-sm mb-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                What We Support • आमचे उपक्रम
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-serif text-[#24312d]">
                संस्थेद्वारे राबवले जाणारे प्रमुख शैक्षणिक प्रकल्प
              </h2>
              <p className="mt-2 text-xs md:text-sm text-[#65706a]">
                या देणगीचा प्रत्येक रुपया थेट गरजू विद्यार्थ्यांच्या शिक्षणासाठी व प्रशिक्षणासाठी वापरला जातो.
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
                      <span>Active Program • देणगी स्वीकारली जात आहे</span>
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
                      Eligible donors receive tax exemption benefits under section 80G of the Income Tax Act.
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
