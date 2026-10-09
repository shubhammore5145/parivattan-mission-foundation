import { LanguageCourse, CourseLevel } from "@/data/languageCoursesData";
import { X, Calendar, Clock, Users, Shield, CheckCircle2, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseDetailModalProps {
  course: LanguageCourse | null;
  level: CourseLevel | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (course: LanguageCourse, level: CourseLevel) => void;
}

export default function CourseDetailModal({
  course,
  level,
  isOpen,
  onClose,
  onEnroll,
}: CourseDetailModalProps) {
  if (!isOpen || !course || !level) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#e2e5dc]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#65706a] hover:bg-[#f1f3ed] hover:text-[#24312d] transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] text-3xl shadow-xs">
            {course.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                {course.nativeName}
              </span>
              <span className="rounded-full bg-[#f1f3ed] px-2.5 py-0.5 text-[11px] font-bold text-[#24312d]">
                Level {level.level}
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#24312d]">
              {course.name} – {level.level}
            </h2>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f3ed] px-3 py-1 text-xs font-semibold text-[#24312d]">
            <Clock size={13} className="text-[#b5623b]" />
            Duration: {level.duration}
          </span>
          {level.batches.map(b => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-900"
            >
              {b.name}
            </span>
          ))}
          {level.batches[0]?.isLimitedSeats && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">
              <Users size={13} />
              Limited Seats Available
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-sm text-[#65706a] leading-relaxed">
          {level.description}
        </p>

        {/* Course Objectives */}
        <div className="mt-6 border-t border-[#f1f3ed] pt-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
            <BookOpen size={16} className="text-[#b5623b]" />
            Course Objectives
          </h3>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[#65706a]">
            {level.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#b5623b] shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Batch Days, Class Timing & Available Seats / Intake */}
        <div className="mt-6 border-t border-[#f1f3ed] pt-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
            <Calendar size={16} className="text-[#b5623b]" />
            Batch Days, Timing & Intake
          </h3>

          <div className="mt-3 space-y-3">
            {level.batches.map(batch => (
              <div key={batch.id} className="rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-xs">
                <div className="flex items-center justify-between font-bold text-[#24312d]">
                  <span className="text-sm">{batch.name}</span>
                  <span className="font-mono text-[#b5623b] text-sm">{batch.time}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#65706a]">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Days</span>
                    <strong className="text-[#24312d]">{batch.days}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Duration</span>
                    <strong className="text-[#24312d]">{batch.duration}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Intake / Seats</span>
                    <strong className="text-emerald-700">{batch.intakeLabel || "Limited Intake"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing, Security Deposit & Refund Condition (Requirement 12) */}
        <div className="mt-6 border-t border-[#f1f3ed] pt-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
            <Shield size={16} className="text-[#b5623b]" />
            Fee Structure & Refund Terms
          </h3>

          <div className="mt-3 rounded-2xl bg-white border border-[#e2e5dc] p-4 shadow-2xs space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#65706a]">Course Fee</span>
              <span className="text-lg font-bold font-serif text-[#24312d]">
                ₹{level.courseFee.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#f1f3ed] pt-2">
              <span className="text-[#65706a]">Security Deposit</span>
              {level.hasSecurityDeposit ? (
                <div className="text-right">
                  <span className="text-lg font-bold font-serif text-[#b5623b]">
                    ₹{level.securityDeposit.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-bold">Refundable*</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#65706a]">₹0 (Not Applicable)</span>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-[#f1f3ed] pt-2">
              <span className="text-[#65706a]">Platform Handling Fee</span>
              <span className="text-sm font-bold font-serif text-[#24312d]">
                ₹{(level.platformFee ?? 100).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#e2e5dc] pt-2 font-bold text-sm">
              <span className="text-[#24312d] uppercase text-xs tracking-wider">Total Payable at Registration</span>
              <span className="text-xl font-serif text-[#24312d]">
                ₹{(level.courseFee + level.securityDeposit + (level.platformFee ?? 100)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-950 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 text-amber-700 mt-0.5" />
            <div>
              <p className="font-bold">Refund Condition:</p>
              <p className="italic text-[11px] mt-0.5">{level.refundCondition}</p>
            </div>
          </div>
        </div>

        {/* Registration CTA Button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEnroll(course, level);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#b5623b] py-3.5 px-6 font-bold text-white shadow-md hover:bg-[#954b2c] transition"
          >
            <span>Register / Enroll Now</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#d9ddd4] bg-white py-3.5 px-5 font-semibold text-[#24312d] hover:bg-[#fbfaf7] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
