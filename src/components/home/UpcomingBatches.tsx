import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LANGUAGE_COURSES,
  LanguageCourse,
  CourseLevel,
  getBatchSeatsInfo,
} from "@/data/languageCoursesData";
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function UpcomingBatches() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Re-read live seats when an admission is placed or admin updates capacity
  React.useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("batch-seats-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("batch-seats-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Collect all batches across all courses and levels
  const allBatches: {
    course: LanguageCourse;
    level: CourseLevel;
    batch: any;
    seatsInfo: { totalSeats: number; enrolled: number; remainingSeats: number; isFull: boolean; isManuallyFull?: boolean };
  }[] = [];

  LANGUAGE_COURSES.forEach((course) => {
    course.levels.forEach((level) => {
      level.batches.forEach((batch) => {
        allBatches.push({
          course,
          level,
          batch,
          seatsInfo: getBatchSeatsInfo(batch.id),
        });
      });
    });
  });

  const filteredBatches =
    selectedLang === "all"
      ? allBatches
      : allBatches.filter((b) => b.course.id === selectedLang);

  const handleEnrollBatch = (langId: string, levelId: string, batchId: string) => {
    navigate(`/admissions?lang=${langId}&level=${levelId}&batch=${batchId}#admission-form`);
  };

  return (
    <section id="schedules" className="page-section bg-white border-t border-[#e2e5dc] py-20 sm:py-28">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 border border-[#b5623b]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Calendar size={14} /> Admissions 2026-27 Batches
            </div>
            <h2 className="mt-3 text-3xl font-serif sm:text-4xl md:text-5xl font-bold text-[#24312d] tracking-tight">
              Upcoming Batch Schedules & Seats
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#65706a] max-w-2xl">
              Strict seat intake ensures high-touch instruction. Check live seat availability and reserve your admission online.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedLang("all")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedLang === "all"
                  ? "bg-[#24312d] text-white shadow-xs"
                  : "bg-[#fbfaf7] text-[#65706a] border border-[#e2e5dc] hover:border-[#b5623b]"
              }`}
            >
              All Batches
            </button>
            {LANGUAGE_COURSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedLang(c.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedLang === c.id
                    ? "bg-[#24312d] text-white shadow-xs"
                    : "bg-[#fbfaf7] text-[#65706a] border border-[#e2e5dc] hover:border-[#b5623b]"
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name.replace(" Language", "")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map(({ course, level, batch, seatsInfo }) => {
            const pct = Math.min(100, Math.round((seatsInfo.enrolled / seatsInfo.totalSeats) * 100));
            const isFull = seatsInfo.isFull;
            const isAlmostFull = !isFull && seatsInfo.remainingSeats <= 4;

            return (
              <div
                key={batch.id}
                className="rounded-3xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 transition-all duration-300 hover:shadow-lg hover:border-[#b5623b]/40 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Language Badge and Level */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{course.flag}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#24312d]">
                        {course.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isFull ? (
                        <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                          Admission Full
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          {seatsInfo.remainingSeats} Seats Left
                        </span>
                      )}
                      <span className="rounded-full bg-white border border-[#e2e5dc] px-2.5 py-0.5 text-[11px] font-bold text-[#b5623b]">
                        Level {level.level}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#24312d]">
                    {batch.name}
                  </h3>

                  {/* Timing & Days */}
                  <div className="mt-4 space-y-2 text-xs text-[#65706a]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#b5623b] shrink-0" />
                      <span className="font-medium">{batch.days}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#b5623b] shrink-0" />
                      <span className="font-medium">{batch.time} ({batch.duration})</span>
                    </div>
                  </div>

                  {/* Seat Intake Progress */}
                  <div className="mt-5 rounded-2xl bg-white border border-[#e2e5dc] p-3.5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#48534e]">Batch Intake:</span>
                      <span className="font-bold text-[#24312d]">
                        {seatsInfo.enrolled} / {seatsInfo.totalSeats} Enrolled
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1f3ed]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? "bg-red-600"
                            : isAlmostFull
                            ? "bg-amber-600"
                            : "bg-[#24312d]"
                        }`}
                        style={{ width: `${isFull ? 100 : pct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      {isFull ? (
                        <span className="font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle size={11} /> Admission Full (प्रवेश पूर्ण)
                        </span>
                      ) : isAlmostFull ? (
                        <span className="font-bold text-amber-700 flex items-center gap-1">
                          <AlertCircle size={11} /> Only {seatsInfo.remainingSeats} seats left!
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={11} /> {seatsInfo.remainingSeats} Seats Available
                        </span>
                      )}
                      <span className="text-[#87938b] font-medium">
                        {isFull ? "100% Full" : `${pct}% Filled`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Enroll Action */}
                <div className="mt-6 pt-4 border-t border-[#e2e5dc]/60">
                  {isFull ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl bg-gray-100 border border-gray-200 py-3 text-xs font-bold text-gray-400 cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <span>Admission Full (Batch Closed)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEnrollBatch(course.id, level.id, batch.id)}
                      className="w-full rounded-2xl bg-[#24312d] py-3 text-xs font-bold text-white transition hover:bg-[#b5623b] shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Reserve Seat in Batch</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center text-xs text-[#65706a]">
          <span>Need a customized schedule or corporate batch training? </span>
          <Link to="/contact" className="font-bold text-[#b5623b] hover:underline">
            Contact our Admissions Office →
          </Link>
        </div>
      </div>
    </section>
  );
}
