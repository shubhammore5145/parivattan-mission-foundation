import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  HardHat,
  Cog,
  Wrench,
  Hammer,
  Clock,
  CheckCircle2,
  Bell,
  ArrowLeft,
  GraduationCap,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export interface FeaturePreviewItem {
  title: string;
  description: string;
  icon: React.ElementType;
  tag?: string;
}

export interface UnderConstructionViewProps {
  pageTitle: string;
  moduleBadge: string;
  headline: string;
  description: string;
  progressPercent: number;
  expectedDate?: string;
  features: FeaturePreviewItem[];
  primaryAction?: {
    label: string;
    to: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    to: string;
    onClick?: () => void;
  };
  embeddedInDashboard?: boolean;
}

export const UnderConstructionView: React.FC<UnderConstructionViewProps> = ({
  pageTitle,
  moduleBadge,
  headline,
  description,
  progressPercent,
  expectedDate = "Upcoming Academic Term (2026)",
  features,
  primaryAction = { label: "Go to Student Portal", to: "/student" },
  secondaryAction = { label: "Explore Available Courses", to: "/courses" },
  embeddedInDashboard = false,
}) => {
  const [notifyInput, setNotifyInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notifyInput.trim();
    if (!trimmed) {
      toast.error("Please enter your email or WhatsApp number.");
      return;
    }
    // Store reminder preference in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("pmf_feature_waitlist") || "[]");
      existing.push({
        module: pageTitle,
        contact: trimmed,
        date: new Date().toISOString(),
      });
      localStorage.setItem("pmf_feature_waitlist", JSON.stringify(existing));
    } catch {
      // fallback
    }
    setSubscribed(true);
    toast.success(`You are on the priority notification list for ${pageTitle}!`);
  };

  return (
    <div className={`w-full ${embeddedInDashboard ? "py-4" : "py-10 md:py-16"}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Animated Construction Showcase Card */}
        <div className="relative rounded-3xl bg-white border border-stone-200 shadow-xl overflow-hidden">
          {/* Top Decorative Diagonal Construction Banner */}
          <div
            className="h-3 w-full opacity-90"
            style={{
              background:
                "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 14px, #1e293b 14px, #1e293b 28px)",
            }}
          />

          {/* Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-6 sm:p-10 md:p-14">
            {/* Header Status & Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold tracking-wide uppercase shadow-2xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span>{moduleBadge}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Clock size={13} className="text-amber-600" />
                <span>Target Launch: {expectedDate}</span>
              </div>
            </div>

            {/* Central Animated Construction Illustration */}
            <div className="flex flex-col items-center justify-center my-6 md:my-8 text-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
                {/* Large Background Outer Gear (Clockwise rotation) */}
                <div className="absolute inset-0 flex items-center justify-center text-amber-200/70 animate-[spin_20s_linear_infinite]">
                  <Cog size={160} strokeWidth={1.2} />
                </div>

                {/* Secondary Medium Gear (Counter-clockwise rotation) */}
                <div className="absolute -bottom-2 -right-2 text-stone-300/80 animate-[spin_12s_linear_infinite_reverse]">
                  <Cog size={90} strokeWidth={1.5} />
                </div>

                {/* Pulsing Caution Glow Disc */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-lg shadow-amber-500/25 flex items-center justify-center border-4 border-white transition-transform transform hover:scale-105 duration-300">
                  {/* Floating Tools around */}
                  <div className="absolute -top-3 -right-2 bg-slate-900 text-amber-400 p-2 rounded-xl shadow-md animate-bounce">
                    <HardHat size={20} />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-white text-slate-700 p-1.5 rounded-xl border border-stone-200 shadow-md animate-pulse">
                    <Wrench size={18} />
                  </div>
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-amber-100 text-amber-900 p-1.5 rounded-xl border border-amber-300 shadow-xs">
                    <Hammer size={16} />
                  </div>

                  <Sparkles size={40} className="text-white drop-shadow-md animate-pulse" />
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d] tracking-tight max-w-2xl">
                {headline}
              </h1>
              <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {description}
              </p>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-lg mt-8 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <Layers size={14} className="text-amber-600" />
                    Development & Content Preparation
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                    {progressPercent}% Complete
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${progressPercent}%` }}
                  >
                    {/* Animated Shimmer Bar */}
                    <div
                      className="absolute inset-0 opacity-40 animate-[spin_6s_linear_infinite]"
                      style={{
                        background:
                          "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.6) 10px, rgba(255,255,255,0.6) 20px)",
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 text-left flex items-center justify-between">
                  <span>Phase 1: Architecture Completed</span>
                  <span className="text-emerald-700 font-semibold">Phase 2: Review in Progress</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-12 pt-8 border-t border-stone-200">
              <div className="text-center max-w-xl mx-auto mb-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b5623b] uppercase tracking-wider mb-1">
                  <Sparkles size={14} />
                  <span>Module Roadmap</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#24312d]">
                  What's Coming in this Module
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Our faculty and technical team are curating verified learning resources and interactive tools.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="group p-5 rounded-2xl border border-stone-200/90 bg-[#fbfaf7] hover:bg-white hover:border-[#b5623b]/40 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 text-[#b5623b] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#b5623b] group-hover:text-white transition-colors">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-sm text-[#24312d]">{feat.title}</h4>
                          {feat.tag && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-slate-700">
                              {feat.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification / Stay Updated Box */}
            <div className="mt-10 rounded-2xl bg-gradient-to-br from-[#24312d] to-[#1c2623] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                  <Bell size={14} />
                  <span>Stay Informed</span>
                </div>
                <h4 className="text-lg font-bold">Be the First to Know When It Launches</h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Enter your email or WhatsApp number to get an instant notification the moment this module goes live.
                </p>
              </div>

              {subscribed ? (
                <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Notification registered successfully!</span>
                </div>
              ) : (
                <form
                  onSubmit={handleNotifySubmit}
                  className="w-full md:w-auto flex flex-col sm:flex-row items-stretch gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={notifyInput}
                    onChange={(e) => setNotifyInput(e.target.value)}
                    placeholder="Enter email or WhatsApp"
                    className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400 w-full sm:w-64"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#b5623b] hover:bg-[#954b2c] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Notify Me</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {primaryAction &&
                (primaryAction.onClick ? (
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b5623b] hover:bg-[#954b2c] text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
                  >
                    <GraduationCap size={16} />
                    <span>{primaryAction.label}</span>
                  </button>
                ) : (
                  <Link
                    to={primaryAction.to}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b5623b] hover:bg-[#954b2c] text-white text-xs sm:text-sm font-bold shadow-md transition"
                  >
                    <GraduationCap size={16} />
                    <span>{primaryAction.label}</span>
                  </Link>
                ))}

              {secondaryAction &&
                (secondaryAction.onClick ? (
                  <button
                    type="button"
                    onClick={secondaryAction.onClick}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs sm:text-sm font-bold border border-stone-300 transition cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>{secondaryAction.label}</span>
                  </button>
                ) : (
                  <Link
                    to={secondaryAction.to}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs sm:text-sm font-bold border border-stone-300 transition"
                  >
                    <ArrowLeft size={16} />
                    <span>{secondaryAction.label}</span>
                  </Link>
                ))}
            </div>
          </div>

          {/* Bottom Construction Hazard Stripe */}
          <div
            className="h-2 w-full opacity-70"
            style={{
              background:
                "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 14px, #1e293b 14px, #1e293b 28px)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
