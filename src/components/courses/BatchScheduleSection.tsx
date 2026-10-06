import { useState } from "react";
import { Clock, Calendar, Users, CheckCircle2, ArrowRight, ShieldCheck, Sun, Moon } from "lucide-react";
import { CourseLevel, LanguageCourse } from "@/data/languageCoursesData";

interface BatchScheduleSectionProps {
  onEnrollBatch?: (language: string, level: string, batchName: string) => void;
}

export default function BatchScheduleSection({ onEnrollBatch }: BatchScheduleSectionProps) {
  const [activeTab, setActiveTab] = useState<"all" | "japanese" | "german" | "english" | "french">("all");

  return (
    <section id="schedules" className="page-section bg-[#fbfaf7] border-t border-[#e2e5dc]">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
          <Calendar size={14} /> Batch Timings & Schedule
        </div>
        <h2 className="mt-3 text-3xl font-serif sm:text-4xl md:text-5xl text-[#24312d]">
          Structured Batch Schedules
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#65706a]">
          Designed to fit working professionals, college students, and language enthusiasts. Clear timing, defined intake limits, and verified educator sessions.
        </p>

        {/* Tab Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { id: "all", label: "All Schedules" },
            { id: "japanese", label: "🇯🇵 Japanese" },
            { id: "german", label: "🇩🇪 German" },
            { id: "english", label: "🇬🇧 English" },
            { id: "french", label: "🇫🇷 French" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-[#24312d] text-white shadow-sm"
                  : "bg-white text-[#65706a] border border-[#e2e5dc] hover:border-[#b5623b] hover:text-[#24312d]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {/* 4. JAPANESE COURSE – BATCH SCHEDULE */}
        {(activeTab === "all" || activeTab === "japanese") && (
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f1f3ed]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl border border-red-100">
                  🇯🇵
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d]">
                    Japanese Course – Batch Schedule
                  </h3>
                  <p className="text-xs sm:text-sm text-[#65706a]">
                    Covers JLPT N5, N4 and N3 curricula with morning and evening slots.
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
                <Users size={13} />
                Strict Intake Limits Apply
              </span>
            </div>

            {/* Schedule Grid */}
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* N5 Morning */}
              <div className="relative rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 flex flex-col justify-between hover:border-[#b5623b] transition">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                      <Sun size={11} /> Morning Batch
                    </span>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Limited Seats
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-serif font-bold text-[#24312d]">
                    N5 – Morning Batch
                  </h4>

                  <dl className="mt-4 space-y-2 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Monday, Wednesday & Friday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">10:00 AM – 11:30 AM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">6 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Intake</dt>
                      <dd className="font-bold text-emerald-800">30 Students</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollBatch && onEnrollBatch("Japanese", "N5", "Morning Batch (10:00 AM – 11:30 AM)")}
                  className="mt-5 w-full rounded-xl bg-[#24312d] py-2.5 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
                >
                  <span>Select N5 Morning</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* N5 Evening */}
              <div className="relative rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 flex flex-col justify-between hover:border-[#b5623b] transition">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-900">
                      <Moon size={11} /> Evening Batch
                    </span>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Limited Seats
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-serif font-bold text-[#24312d]">
                    N5 – Evening Batch
                  </h4>

                  <dl className="mt-4 space-y-2 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Monday, Wednesday & Friday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:30 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">6 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Intake</dt>
                      <dd className="font-bold text-emerald-800">30 Students</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollBatch && onEnrollBatch("Japanese", "N5", "Evening Batch (7:00 PM – 8:30 PM)")}
                  className="mt-5 w-full rounded-xl bg-[#24312d] py-2.5 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
                >
                  <span>Select N5 Evening</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* N4 Evening */}
              <div className="relative rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 flex flex-col justify-between hover:border-[#b5623b] transition">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-900">
                      <Moon size={11} /> Evening Batch
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Intake: 25
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-serif font-bold text-[#24312d]">
                    N4 – Evening Batch
                  </h4>

                  <dl className="mt-4 space-y-2 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Tuesday, Thursday & Saturday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:30 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">6 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Intake</dt>
                      <dd className="font-bold text-emerald-800">25 Students</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollBatch && onEnrollBatch("Japanese", "N4", "Evening Batch (7:00 PM – 8:30 PM)")}
                  className="mt-5 w-full rounded-xl bg-[#24312d] py-2.5 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
                >
                  <span>Select N4 Evening</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* N3 Regular */}
              <div className="relative rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 flex flex-col justify-between hover:border-[#b5623b] transition">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-900">
                      Regular Batch
                    </span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      7-Month Course
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-serif font-bold text-[#24312d]">
                    N3 – Regular Batch
                  </h4>

                  <dl className="mt-4 space-y-2 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Monday to Friday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:30 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">7 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Intake</dt>
                      <dd className="font-semibold text-[#65706a]">Limited Seats Available</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollBatch && onEnrollBatch("Japanese", "N3", "Regular Batch (7:00 PM – 8:30 PM)")}
                  className="mt-5 w-full rounded-xl bg-[#24312d] py-2.5 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
                >
                  <span>Select N3 Regular</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. GERMAN COURSE – BATCH SCHEDULE */}
        {(activeTab === "all" || activeTab === "german") && (
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f1f3ed]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl border border-blue-100">
                  🇩🇪
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d]">
                    German Course – Batch Schedule
                  </h3>
                  <p className="text-xs sm:text-sm text-[#65706a]">
                    Weekend intensive batches for A1 and A2 Goethe-aligned training.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* German A1 */}
              <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 flex flex-col justify-between hover:border-[#b5623b] transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
                      Level A1 • 3-Month Course
                    </span>
                    <span className="text-xl font-bold font-serif text-[#24312d]">₹4,000</span>
                  </div>

                  <h4 className="mt-4 text-xl font-serif font-bold text-[#24312d]">
                    German A1 Batch
                  </h4>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Friday & Saturday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:30 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">3 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Course Fee</dt>
                      <dd className="font-bold text-[#24312d]">₹4,000</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollBatch && onEnrollBatch("German", "A1", "Friday & Saturday (7:00 PM – 8:30 PM)")}
                  className="mt-6 w-full rounded-xl bg-[#24312d] py-3 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
                >
                  <span>Enroll in German A1</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* German A2 */}
              <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 flex flex-col justify-between hover:border-[#b5623b] transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
                      Level A2 • 3–4.5 Months
                    </span>
                    <span className="text-xl font-bold font-serif text-[#24312d]">₹6,000</span>
                  </div>

                  <h4 className="mt-4 text-xl font-serif font-bold text-[#24312d]">
                    German A2 Batch
                  </h4>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Friday & Saturday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:30 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">3–4.5 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Course Fee</dt>
                      <dd className="font-bold text-[#24312d]">₹6,000</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollBatch && onEnrollBatch("German", "A2", "Friday & Saturday (7:00 PM – 8:30 PM)")}
                  className="mt-6 w-full rounded-xl bg-[#24312d] py-3 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
                >
                  <span>Enroll in German A2</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. ENGLISH COURSE & 7. FRENCH COURSE */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 6. ENGLISH COURSE */}
          {(activeTab === "all" || activeTab === "english") && (
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#f1f3ed]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl border border-emerald-100">
                      🇬🇧
                    </span>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#24312d]">
                        English Course – Schedule
                      </h3>
                      <p className="text-xs text-[#65706a]">
                        Daily spoken confidence & foundational grammar
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-serif text-[#24312d]">₹2,000</span>
                </div>

                <div className="mt-5 rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                      Basic English • 3-Month Course
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      Daily Weekday
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Monday to Friday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:00 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">3 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Course Fee</dt>
                      <dd className="font-bold text-[#24312d]">₹2,000</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEnrollBatch && onEnrollBatch("English", "Basic English", "Monday to Friday (7:00 PM – 8:00 PM)")}
                className="mt-6 w-full rounded-xl bg-[#24312d] py-3 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
              >
                <span>Enroll in Basic English</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* 7. FRENCH COURSE */}
          {(activeTab === "all" || activeTab === "french") && (
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#f1f3ed]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl border border-purple-100">
                      🇫🇷
                    </span>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#24312d]">
                        French Course – Schedule
                      </h3>
                      <p className="text-xs text-[#65706a]">
                        DELF A1 foundation & conversational dialogue
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-serif text-[#24312d]">₹3,000</span>
                </div>

                <div className="mt-5 rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-900">
                      Level A1 • 3-Month Course
                    </span>
                    <span className="text-xs font-bold text-purple-800">
                      Daily Weekday
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Days</dt>
                      <dd className="font-semibold text-[#24312d]">Monday to Friday</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Time</dt>
                      <dd className="font-bold text-[#b5623b] font-mono text-sm">7:00 PM – 8:00 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Duration</dt>
                      <dd className="font-semibold text-[#24312d]">3 Months</dd>
                    </div>
                    <div>
                      <dt className="text-[#65706a] uppercase text-[10px] tracking-wider font-semibold">Course Fee</dt>
                      <dd className="font-bold text-[#24312d]">₹3,000</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEnrollBatch && onEnrollBatch("French", "A1", "Monday to Friday (7:00 PM – 8:00 PM)")}
                className="mt-6 w-full rounded-xl bg-[#24312d] py-3 text-xs font-bold text-white hover:bg-[#b5623b] transition flex items-center justify-center gap-1.5"
              >
                <span>Enroll in French A1</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
