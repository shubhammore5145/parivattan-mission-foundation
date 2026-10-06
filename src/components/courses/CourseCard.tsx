import { useState } from "react";
import { LanguageCourse, CourseLevel, getBatchSeatsInfo } from "@/data/languageCoursesData";
import { Clock, Calendar, Users, Shield, ArrowRight, CheckCircle2, Sparkles, Info, AlertOctagon } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: LanguageCourse;
  onSelectLevel?: (level: CourseLevel) => void;
  onEnroll?: (course: LanguageCourse, level: CourseLevel) => void;
  onOpenDetails?: (course: LanguageCourse, level: CourseLevel) => void;
}

export default function CourseCard({ course, onEnroll, onOpenDetails }: CourseCardProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string>(course.levels[0].id);
  const activeLevel = course.levels.find(l => l.id === selectedLevelId) || course.levels[0];

  // Check seat capacity for the first batch or across batches
  const primaryBatch = activeLevel.batches[0];
  const primarySeats = primaryBatch ? getBatchSeatsInfo(primaryBatch.id) : { totalSeats: 30, enrolled: 25, remainingSeats: 5, isFull: false };
  const allBatchesFull = activeLevel.batches.every(b => getBatchSeatsInfo(b.id).isFull);

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[#e2e5dc] bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#b5623b]/40">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] text-3xl shadow-xs transition group-hover:scale-105">
              {course.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                  {course.nativeName}
                </span>
                {allBatchesFull ? (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800">
                    Batch Full
                  </span>
                ) : primarySeats.remainingSeats <= 5 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 animate-pulse">
                    Only {primarySeats.remainingSeats} Seats Left!
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    Admissions Open
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#24312d]">
                {course.name}
              </h3>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#65706a] leading-relaxed">
          {course.shortDesc}
        </p>

        {/* Level Switcher Pills */}
        <div className="mt-5 border-t border-b border-[#f1f3ed] py-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#65706a]">
              Available Levels ({course.levels.length})
            </span>
            <span className="text-xs font-semibold text-[#b5623b]">
              Duration: {activeLevel.duration}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {course.levels.map((lvl) => {
              const isSelected = lvl.id === selectedLevelId;
              const lvlFull = lvl.batches.every(b => getBatchSeatsInfo(b.id).isFull);

              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedLevelId(lvl.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#24312d] text-white shadow-sm ring-2 ring-[#24312d]/20 scale-102"
                      : "bg-[#fbfaf7] text-[#65706a] border border-[#e2e5dc] hover:border-[#b5623b] hover:text-[#24312d]"
                  }`}
                >
                  <span>{lvl.level}</span>
                  <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#eef0e8] text-[#65706a]"
                  }`}>
                    {lvl.duration}
                  </span>
                  {lvlFull && (
                    <span className="ml-1 text-[9px] bg-red-500 text-white px-1 py-0.2 rounded">
                      Full
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch & Timing Details with Live Intake Remaining */}
        <div className="mt-4 rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-3.5 space-y-2.5 text-xs">
          {activeLevel.batches.map(batch => {
            const seats = getBatchSeatsInfo(batch.id);
            return (
              <div key={batch.id} className="border-b border-[#eef0e8] last:border-b-0 pb-2.5 last:pb-0">
                <div className="flex items-center justify-between font-bold text-[#24312d]">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#b5623b]" />
                    {batch.name}
                  </span>
                  <span className="text-[#b5623b] font-mono">{batch.time}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[#65706a]">
                  <span>Days: <strong className="text-[#24312d]">{batch.days}</strong></span>
                  <div className="flex items-center gap-1.5">
                    {seats.isFull ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                        Batch Full (0/{seats.totalSeats})
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Seats Left: {seats.remainingSeats}/{seats.totalSeats}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fee & Deposit Split (Requirement 8) */}
        <div className="mt-4 rounded-2xl bg-white border border-[#e2e5dc] p-4 shadow-2xs">
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[#65706a]">Course Fee</p>
              <p className="mt-0.5 text-2xl font-bold font-serif text-[#24312d]">
                ₹{activeLevel.courseFee.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="border-l border-[#eef0e8] pl-3">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[#65706a]">Security Deposit</p>
              {activeLevel.hasSecurityDeposit ? (
                <div>
                  <p className="mt-0.5 text-2xl font-bold font-serif text-[#b5623b]">
                    ₹{activeLevel.securityDeposit.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Refundable*</p>
                </div>
              ) : (
                <p className="mt-1 text-sm font-semibold text-[#65706a]">Not Applicable</p>
              )}
            </div>
          </div>

          {activeLevel.hasSecurityDeposit && (
            <div className="mt-2.5 pt-2 border-t border-[#f1f3ed] flex items-start gap-1.5 text-[11px] text-[#65706a]">
              <Shield size={13} className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="italic leading-snug">{activeLevel.refundCondition}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          disabled={allBatchesFull}
          onClick={() => onEnroll ? onEnroll(course, activeLevel) : null}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition ${
            allBatchesFull
              ? "bg-gray-400 cursor-not-allowed opacity-75"
              : "bg-[#b5623b] hover:bg-[#954b2c] hover:shadow-md"
          }`}
        >
          <span>{allBatchesFull ? "Admissions Closed (Full)" : "Enroll Now"}</span>
          {!allBatchesFull && <ArrowRight size={15} />}
        </button>

        <button
          type="button"
          onClick={() => onOpenDetails ? onOpenDetails(course, activeLevel) : null}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d9ddd4] bg-white px-3.5 py-3 text-xs sm:text-sm font-bold text-[#24312d] transition hover:bg-[#fbfaf7] hover:border-[#b5623b]"
        >
          <Info size={15} />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
}
