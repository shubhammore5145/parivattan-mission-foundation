import { ShieldCheck, Info, Check, ArrowRight, Sparkles } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan?: (courseName: string, level: string, fee: number, deposit: number) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const platformFee = 100;

  const pricingCards = [
    {
      language: "Japanese",
      flag: "🇯🇵",
      level: "Japanese N5",
      badge: "Foundation • 6 Months",
      courseFee: 2000,
      securityDeposit: 2000,
      hasDeposit: true,
      refundCondition: "Security deposit of ₹2,000 is 100% refundable according to applicable course conditions upon exam appearance.",
      features: [
        "Complete Hiragana & Katakana mastery",
        "~100 core Kanji characters",
        "Morning (10:00 AM) or Evening (7:00 PM) batches",
        "Official JLPT N5 examination orientation",
      ],
      isPopular: false,
    },
    {
      language: "Japanese",
      flag: "🇯🇵",
      level: "Japanese N4",
      badge: "Intermediate • 6 Months",
      courseFee: 4000,
      securityDeposit: 2000,
      hasDeposit: true,
      refundCondition: "Security deposit of ₹2,000 is 100% refundable after successfully passing the required examination.",
      features: [
        "~300 Kanji & complex sentence patterns",
        "Intermediate Kaiwa (speaking) dialogue",
        "Tuesday, Thursday & Saturday (7:00 PM)",
        "Strict 25 student intake limit",
      ],
      isPopular: true,
    },
    {
      language: "Japanese",
      flag: "🇯🇵",
      level: "Japanese N3",
      badge: "Advanced • 7 Months",
      courseFee: 8000,
      securityDeposit: 2000,
      hasDeposit: true,
      refundCondition: "Security deposit of ₹2,000 is 100% refundable after successfully passing both required examinations.",
      features: [
        "Business Japanese & ~650 Kanji mastery",
        "Daily Monday to Friday immersion (7:00 PM)",
        "Advanced reading & listening fluency",
        "Comprehensive JLPT N3 preparation",
      ],
      isPopular: false,
    },
    {
      language: "German",
      flag: "🇩🇪",
      level: "German A1",
      badge: "Beginner • 3 Months",
      courseFee: 4000,
      securityDeposit: 0,
      hasDeposit: false,
      refundCondition: "No security deposit applicable. Course fee is non-refundable upon registration.",
      features: [
        "Goethe-Zertifikat A1 curriculum",
        "Monday, Wednesday & Friday (7:00 PM – 8:30 PM)",
        "Articles, nominative & accusative cases",
        "Speaking & pronunciation drills",
      ],
      isPopular: false,
    },
    {
      language: "German",
      flag: "🇩🇪",
      level: "German A2",
      badge: "Elementary • 3–4.5 Months",
      courseFee: 6000,
      securityDeposit: 0,
      hasDeposit: false,
      refundCondition: "No security deposit applicable. Course fee is non-refundable upon registration.",
      features: [
        "Goethe-Zertifikat A2 curriculum",
        "Tuesday, Thursday & Saturday (7:00 PM – 8:30 PM)",
        "Dative cases & modal verb conjugations",
        "Fluency in daily European interactions",
      ],
      isPopular: false,
    },
    {
      language: "English",
      flag: "🇬🇧",
      level: "English A1",
      badge: "Fluency • 3 Months",
      courseFee: 2000,
      securityDeposit: 0,
      hasDeposit: false,
      refundCondition: "No security deposit applicable. Course fee is non-refundable upon registration.",
      features: [
        "Spoken English & grammar foundations",
        "Monday to Friday (7:00 PM – 8:00 PM)",
        "Everyday confidence & pronunciation",
        "Practical self-expression exercises",
      ],
      isPopular: false,
    },
    {
      language: "French",
      flag: "🇫🇷",
      level: "French A1",
      badge: "Beginner • 3 Months",
      courseFee: 3000,
      securityDeposit: 0,
      hasDeposit: false,
      refundCondition: "No security deposit applicable. Course fee is non-refundable upon registration.",
      features: [
        "DELF A1 accredited curriculum",
        "Monday to Friday (7:00 PM – 8:00 PM)",
        "French vowel phonetics & liaisons",
        "Everyday cultural dialogue & greetings",
      ],
      isPopular: false,
    },
  ];

  return (
    <section id="pricing" className="page-section bg-white border-t border-[#e2e5dc]">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
          <ShieldCheck size={14} /> Transparent Fee Structure
        </div>
        <h2 className="mt-3 text-3xl font-serif sm:text-4xl md:text-5xl text-[#24312d]">
          Subsidized Fees & 100% Refundable Deposits
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#65706a]">
          Quality international language coaching made practical and affordable. Japanese programs feature 100% refundable examination security deposits to reward serious learners.
        </p>

        {/* Handling fee highlight alert */}
        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-left max-w-2xl mx-auto flex items-start gap-3">
          <Info className="text-amber-700 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-amber-950 leading-relaxed">
            <strong>Platform Handling Fee:</strong> A nominal fee of flat <strong>₹100</strong> applies across all course enrollments to support student PRN tracking, portal accounts, and certified digital documentation.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pricingCards.map((card, i) => {
          const totalPayable = card.courseFee + card.securityDeposit + platformFee;
          return (
            <div
              key={i}
              className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 ${
                card.isPopular
                  ? "bg-[#fbfaf7] border-2 border-[#b5623b] shadow-md ring-4 ring-[#b5623b]/10"
                  : "bg-white border border-[#e2e5dc] hover:border-[#b5623b]/40 hover:shadow-md"
              }`}
            >
              {card.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#b5623b] px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Popular Choice
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{card.flag}</span>
                  <span className="rounded-full bg-[#f1f3ed] px-2.5 py-0.5 text-[11px] font-bold text-[#24312d]">
                    {card.badge}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-serif font-bold text-[#24312d]">
                  {card.level}
                </h3>

                {/* Distinct Fee & Deposit Breakdown */}
                <div className="mt-5 space-y-2.5 rounded-2xl bg-white border border-[#e2e5dc] p-3.5 shadow-2xs">
                  {/* Course Fee */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#65706a]">Course Fee</span>
                    <span className="text-base font-bold font-serif text-[#24312d]">
                      ₹{card.courseFee.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Security Deposit */}
                  <div className="flex items-center justify-between border-t border-[#f1f3ed] pt-2">
                    <span className="text-xs font-semibold text-[#65706a]">Security Deposit</span>
                    {card.hasDeposit ? (
                      <div className="text-right">
                        <span className="text-base font-bold font-serif text-[#b5623b]">
                          ₹{card.securityDeposit.toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[10px] text-emerald-700 font-bold">Refundable*</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[#65706a]">₹0 (None)</span>
                    )}
                  </div>

                  {/* Platform Handling Fee */}
                  <div className="flex items-center justify-between border-t border-[#f1f3ed] pt-2">
                    <span className="text-xs font-semibold text-[#65706a]">Platform Fee</span>
                    <span className="text-xs font-bold text-[#24312d]">₹{platformFee}</span>
                  </div>

                  {/* Total Initial Payment */}
                  <div className="flex items-center justify-between border-t border-[#e2e5dc] pt-2 font-bold">
                    <span className="text-xs uppercase tracking-wider text-[#24312d]">Total Payable</span>
                    <span className="text-lg font-serif text-[#24312d]">
                      ₹{totalPayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Refund Condition */}
                <div className="mt-3 rounded-xl bg-[#fbfaf7] border border-[#e2e5dc] p-3 text-[11px] text-[#65706a]">
                  <p className="font-semibold text-[#24312d] mb-0.5">Refund Condition:</p>
                  <p className="italic leading-snug">{card.refundCondition}</p>
                </div>

                {/* Key Features */}
                <ul className="mt-5 space-y-2 text-xs text-[#65706a]">
                  {card.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={14} className="text-[#b5623b] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPlan && onSelectPlan(card.language, card.level, card.courseFee, card.securityDeposit)}
                className={`mt-6 w-full rounded-xl py-3 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                  card.isPopular
                    ? "bg-[#b5623b] text-white hover:bg-[#954b2c] shadow-sm"
                    : "bg-[#24312d] text-white hover:bg-[#b5623b]"
                }`}
              >
                <span>Enroll for {card.level}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
