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
  Lock,
  ArrowRight,
  Download,
  Share2,
  User,
  Percent,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { openRazorpayPayment, getRazorpayKeyId } from "@/lib/razorpay";
import { createDonation } from "@/lib/supabase-admin";
import { sendDonationReceiptEmail } from "@/lib/notificationEmailService";
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
    id: "general",
    name: "Rural Youth Education & Coaching",
    marathi: "Social Transformation Through Education",
    icon: GraduationCap,
    desc: "Direct support for Japanese & German language coaching, computer literacy and higher education access.",
    tag: "Education",
  },
  {
    id: "languages",
    name: "Foreign Language School",
    marathi: "Foreign Language Training Fund",
    icon: Globe2,
    desc: "Coaching and JLPT/Goethe certification scholarships for Japanese and German language learners.",
    tag: "Global Opportunities",
  },
  {
    id: "technology",
    name: "Parivattan Tech School",
    marathi: "Technology & Coding Skills Fund",
    icon: Laptop,
    desc: "Equipping rural youth with laptops, programming bootcamps in Python, and full-stack web development.",
    tag: "Digital Empowerment",
  },
  {
    id: "girls-scholarship",
    name: "Savitribai Girls Higher Education",
    marathi: "Higher Education Grant for Rural Girls",
    icon: BookOpen,
    desc: "Direct college tuition scholarships and hostel fees assistance for deserving rural girls.",
    tag: "Women Empowerment",
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
  const [selectedCause, setSelectedCause] = useState<string>("general");
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [panNumber, setPanNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<DonationReceiptData | null>(null);

  const activeAmount = isCustom ? parseInt(customAmount) || 0 : amount;

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

  const currentCauseObj =
    upcomingCauses.find((c) => c.id === selectedCause) || upcomingCauses[0];

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

          // Automatically send official donation receipt and 80G confirmation email
          sendDonationReceiptEmail({
            donorName: fullName.trim(),
            donorEmail: email.trim(),
            amount: activeAmount,
            cause: `${currentCauseObj.name} (${currentCauseObj.marathi})`,
            paymentId: payId,
            receiptNo,
            donorPhone: phone.trim(),
            pan: panNumber.trim() || undefined,
          });

          setIsSubmitting(false);
          toast.success("Payment successful! Official receipt sent to your email.");
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
      toast.error(
        "Payment gateway could not be loaded. Please check your internet connection."
      );
    }
  };

  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Mission Foundation! I would like to inquire about the Donation Campaign and explore partnership/support opportunities."
  );

  return (
    <div className="min-h-screen bg-white text-[#24312d] selection:bg-[#b5623b]/20">
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

          {/* Hero Banner (Matching Mockup Exactly) */}
          <div className="relative rounded-3xl bg-[#f8f6f0] border border-[#e8e4da] p-8 sm:p-10 md:p-12 shadow-sm overflow-hidden mb-10">
            {/* Soft organic curved wave in background */}
            <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-[#efeade]/70 to-transparent pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Content */}
              <div className="md:col-span-7">
                {/* Support Education Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e7eee8] px-3.5 py-1.5 text-xs font-semibold text-[#274536] border border-[#d4ded5] mb-5">
                  <Sparkles size={13} className="text-[#274536]" />
                  <span>Support Education</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#1b2b25] leading-[1.12]">
                  Power a Learner's <br />
                  <span className="text-[#b5623b]">Future Today.</span>
                </h1>

                {/* Subheading with Terracotta Left Accent */}
                <div className="mt-4 border-l-[3px] border-[#b5623b] pl-3.5 py-0.5">
                  <p className="font-serif text-lg sm:text-xl font-bold text-[#1b2b25]">
                    Transforming Lives Through Education & Skills.
                  </p>
                </div>

                <p className="mt-3.5 text-xs sm:text-sm text-[#5a6760] leading-relaxed max-w-xl">
                  Your contribution helps rural youth in Maharashtra get language coaching, coding literacy and university access.
                </p>
              </div>

              {/* Right Side: Script Calligraphy + Books Sprout Artwork */}
              <div className="md:col-span-5 flex items-center justify-center relative">
                {/* Script text positioned organically next to books */}
                <div className="absolute -top-3 left-4 sm:left-6 md:left-2 z-10 select-none pointer-events-none">
                  <span
                    className="font-serif italic text-2xl sm:text-3xl text-[#2d4b3c] tracking-wide inline-block -rotate-12"
                    style={{
                      fontFamily: "'Caveat', 'Playfair Display', Georgia, cursive, serif",
                      lineHeight: "1.1",
                    }}
                  >
                    A<br />
                    Brighter<br />
                    Tomorrow
                  </span>
                </div>

                {/* Hero Artwork Image with transparent background */}
                <div className="relative w-full max-w-[270px] sm:max-w-[310px] ml-auto">
                  <img
                    src="/img/donation-hero-books.png"
                    alt="A Brighter Tomorrow - Educational Books with Seedling Sprout"
                    className="w-full h-auto object-contain drop-shadow-sm"
                  />
                </div>
              </div>
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
                  Payment Confirmed • Donation Successful
                </span>
                <h2 className="mt-2 text-3xl font-serif text-[#24312d]">
                  Thank You, {receipt.donorName}!
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
                    <span>Print Receipt</span>
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
                    <span>Make Another Donation</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Live Donation Form & Right Summary Column (Matching Mockup Exactly) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
              {/* Left Column: Form Card */}
              <div className="lg:col-span-7 rounded-3xl border border-[#e8e4da] bg-white p-7 sm:p-9 shadow-sm">
                <form onSubmit={handlePayment}>
                  {/* Select Amount Header */}
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#1b2b25]">
                      Select Amount
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#65706a]">
                      Choose an amount that helps create real change.
                    </p>

                    {/* 5 Preset Buttons */}
                    <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-2.5">
                      {PRESET_AMOUNTS.map((val) => {
                        const isSelected = !isCustom && amount === val;
                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => handleSelectPreset(val)}
                            className={`py-3 px-1 rounded-xl text-center font-bold text-sm sm:text-base transition-all border ${
                              isSelected
                                ? "bg-[#b5623b] text-white border-[#b5623b] shadow-sm"
                                : "bg-[#f8f6f1] text-[#1b2b25] border-[#e8e4da] hover:border-[#b5623b]/60 hover:bg-[#f1eee5]"
                            }`}
                          >
                            ₹{val.toLocaleString("en-IN")}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Amount Input */}
                    <div className="mt-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8b9690]">
                          ₹
                        </span>
                        <input
                          type="text"
                          placeholder="Or enter custom amount"
                          value={customAmount}
                          onChange={handleCustomChange}
                          className={`w-full rounded-xl border bg-[#fbfaf7] pl-9 pr-4 py-3 text-sm font-medium outline-none transition ${
                            isCustom
                              ? "border-[#b5623b] ring-1 ring-[#b5623b] bg-white font-bold text-[#1b2b25]"
                              : "border-[#e8e4da] text-[#1b2b25] placeholder:text-[#8b9690] focus:border-[#b5623b] focus:bg-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Your Details Header */}
                  <div className="mt-8 pt-6 border-t border-[#f0ece2]">
                    <h2 className="text-2xl font-serif font-bold text-[#1b2b25]">
                      Your Details
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#65706a]">
                      Enter your details to receive the donation receipt.
                    </p>

                    <div className="mt-5 space-y-3.5">
                      {/* Full Name */}
                      <div className="relative">
                        <User
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9690]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-[#e8e4da] bg-[#fbfaf7] pl-11 pr-4 py-3 text-sm text-[#1b2b25] placeholder:text-[#8b9690] outline-none transition focus:border-[#b5623b] focus:bg-white"
                        />
                      </div>

                      {/* Phone & Email Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="relative">
                          <Phone
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9690]"
                          />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="Mobile Number (10 digits) *"
                            value={phone}
                            onChange={(e) =>
                              setPhone(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full rounded-xl border border-[#e8e4da] bg-[#fbfaf7] pl-11 pr-4 py-3 text-sm text-[#1b2b25] placeholder:text-[#8b9690] outline-none transition focus:border-[#b5623b] focus:bg-white"
                          />
                        </div>

                        <div className="relative">
                          <Mail
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9690]"
                          />
                          <input
                            type="email"
                            placeholder="Email Address (for receipt)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-[#e8e4da] bg-[#fbfaf7] pl-11 pr-4 py-3 text-sm text-[#1b2b25] placeholder:text-[#8b9690] outline-none transition focus:border-[#b5623b] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* PAN Number */}
                      <div className="relative">
                        <CreditCard
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9690]"
                        />
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="PAN Number (Optional, for 80G Tax Exemption)"
                          value={panNumber}
                          onChange={(e) =>
                            setPanNumber(e.target.value.toUpperCase())
                          }
                          className="w-full rounded-xl border border-[#e8e4da] bg-[#fbfaf7] pl-11 pr-4 py-3 text-sm uppercase tracking-wider text-[#1b2b25] placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8b9690] outline-none transition focus:border-[#b5623b] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Contribute Button */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting || activeAmount < 10}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#b5623b] hover:bg-[#9d502d] text-white py-4 px-6 font-semibold text-base shadow-md shadow-[#b5623b]/20 transition-all duration-200 hover:scale-[1.005] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard size={18} />
                        <span>
                          {isSubmitting
                            ? "Connecting to Razorpay..."
                            : `Contribute ₹${activeAmount.toLocaleString(
                                "en-IN"
                              )} via Razorpay`}
                        </span>
                        <ArrowRight size={18} />
                      </button>

                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#717d77]">
                        <Lock size={13} className="text-[#717d77]" />
                        <span>100% secure payment powered by Razorpay</span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Column: Donation Summary Card & Assistance Card */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Donation Summary Dark Green Card */}
                <div className="rounded-3xl bg-[#1b2b25] text-white p-7 sm:p-8 shadow-lg relative overflow-hidden">
                  {/* Subtle decorative leaf silhouette in bottom corner */}
                  <div className="absolute -bottom-6 -right-6 w-36 h-36 opacity-10 pointer-events-none text-emerald-200">
                    <svg viewBox="0 0 100 100" fill="currentColor">
                      <path d="M10,90 Q45,50 85,85 Q90,40 55,20 Q20,35 10,90 Z" />
                      <path d="M35,65 Q65,35 55,5 Q25,15 35,65 Z" />
                    </svg>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
                    Donation Summary
                  </h3>

                  <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                    <span className="text-sm text-stone-300">Amount</span>
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-white">
                      ₹{activeAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="space-y-5">
                    {/* Feature 1 */}
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Instant digital receipt
                        </h4>
                        <p className="text-xs text-stone-300 mt-0.5">
                          with transaction ID
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                        <Percent size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Tax exemption eligible
                        </h4>
                        <p className="text-xs text-stone-300 mt-0.5">
                          under Section 80G
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Direct student educational
                        </h4>
                        <p className="text-xs text-stone-300 mt-0.5">
                          scholarship support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Need Assistance with Payment? White Card */}
                <div className="rounded-3xl border border-[#e8e4da] bg-white p-7 sm:p-8 shadow-sm relative overflow-hidden">
                  {/* Subtle botanical branch artwork in corner */}
                  <div className="absolute top-2 right-2 w-16 h-16 opacity-30 pointer-events-none text-emerald-700">
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12,52 Q32,32 52,12 M52,12 Q42,26 26,38 M52,12 Q38,16 22,22" />
                    </svg>
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1b2b25]">
                    Need Assistance with Payment?
                  </h3>
                  <p className="mt-1 text-xs text-[#65706a] leading-relaxed mb-5">
                    Connect with our donation coordinators directly on phone or WhatsApp.
                  </p>

                  <div className="space-y-3">
                    <a
                      href="tel:+917820831901"
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#fdf2eb] text-[#1b2b25] font-bold text-sm hover:bg-[#fae6dc] transition w-full"
                    >
                      <Phone size={17} className="text-[#b5623b]" />
                      <span>+91 78208 31901</span>
                    </a>

                    <a
                      href={`https://wa.me/917820831901?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#e9f6ed] text-[#1b2b25] font-bold text-sm hover:bg-[#dcf0e2] transition w-full"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle size={17} className="text-emerald-700" />
                        <span>WhatsApp Inquiry</span>
                      </div>
                      <ArrowRight size={16} className="text-[#1b2b25]" />
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
                What We Support • Key Initiatives
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-serif text-[#24312d]">
                Key Educational Initiatives Driven by the Foundation
              </h2>
              <p className="mt-2 text-xs md:text-sm text-[#65706a]">
                Every single rupee of your donation is deployed directly toward underprivileged students' education and skill training.
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
                      <span>Active Program • Accepting Contributions</span>
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
                  Contact for Donations & Partnerships
                </h3>
                <p className="mt-2 text-xs text-[#65706a] leading-relaxed">
                  If you would like to participate directly as a donor, mentor, or institutional partner, please reach out to us.
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
                  Back to Home <ArrowRight size={13} />
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
                  Transparency & Official Recognition
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
