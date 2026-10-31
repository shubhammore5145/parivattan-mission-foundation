import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  UnderConstructionView,
  FeaturePreviewItem,
} from "@/components/common/UnderConstructionView";
import { Clock, Video, Calendar, Bell, Users, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import {
  getStoredClassSchedule,
  ClassScheduleConfig,
} from "@/data/classScheduleData";

export default function SchedulePage() {
  const [scheduleConfig, setScheduleConfig] = useState<ClassScheduleConfig>(() =>
    getStoredClassSchedule()
  );

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setScheduleConfig(e.detail);
      } else {
        setScheduleConfig(getStoredClassSchedule());
      }
    };
    window.addEventListener("pmf_schedule_updated", handleUpdate);
    return () => window.removeEventListener("pmf_schedule_updated", handleUpdate);
  }, []);

  const features: FeaturePreviewItem[] = [
    {
      title: "Real-Time Morning & Evening Batch Timetables",
      description:
        "Dedicated schedules for Japanese (N5, N4, N3), German (A1, A2), and Python/Web Tech with daily subject breakdowns.",
      icon: Calendar,
      tag: "Live Timetable",
    },
    {
      title: "1-Click Google Meet & Zoom Classroom Links",
      description:
        "Directly join your live batch classroom from your student portal without searching for links on WhatsApp groups.",
      icon: Video,
      tag: "Virtual Rooms",
    },
    {
      title: "Automated WhatsApp & Email Class Reminders",
      description:
        "Get timely notifications 15 minutes before your class begins with the topic of the day and teacher announcements.",
      icon: Bell,
      tag: "Smart Alerts",
    },
    {
      title: "Class Recording Archive & Attendance Tracker",
      description:
        "Missed a lecture due to travel or work? Access recorded session replays and track your overall attendance percentage.",
      icon: Clock,
      tag: "Recordings & Attendance",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col selection:bg-[#b5623b]/20">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <UnderConstructionView
          pageTitle="Class Schedule & Live Timetable"
          moduleBadge="Under Active Development • Academic Module 3"
          headline="Class Schedule & Live Virtual Rooms"
          description="A centralized timetable with automated Google Meet/Zoom classrooms, attendance logs, and session recordings for all batches."
          progressPercent={84}
          expectedDate="Upcoming Term (2026)"
          features={features}
          primaryAction={{ label: "Go to Student Portal", to: "/student" }}
          secondaryAction={{ label: "View Course Guidelines", to: "/rules" }}
        />

        {/* Current Active Batches & Guidelines Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-12">
          <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#b5623b] tracking-wider">
                  Live Timetable
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#24312d]">
                  Current Active Batches & Campus Venues
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Parivattan Mission Foundation Academic Session {scheduleConfig.academicSession}
                </p>
              </div>

              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto">
                <span>✓ Verified by Academic Directorate</span>
              </div>
            </div>

            {/* Batches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {scheduleConfig.batches
                .filter((b) => b.isActive)
                .map((batch) => (
                  <div
                    key={batch.id}
                    className="rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc] space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-[#b5623b] flex items-center gap-1.5">
                          <Clock size={16} /> {batch.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {batch.batchType}
                        </span>
                      </div>

                      <p className="text-[#525f59]">
                        <strong>Hours:</strong> {batch.hours} ({batch.days})
                      </p>

                      <p className="text-[#525f59]">
                        <strong>Venue:</strong> {batch.venue}
                      </p>

                      {batch.meetingUrl && (
                        <p className="text-[#525f59] flex items-center gap-2 pt-0.5">
                          <strong>Virtual Room:</strong>
                          <a
                            href={batch.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <Video size={13} />
                            <span>Join Live Classroom</span>
                            <ExternalLink size={12} />
                          </a>
                        </p>
                      )}

                      {batch.courseTags && batch.courseTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {batch.courseTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {batch.notes && (
                      <p className="text-[#65706a] text-[11px] pt-2 border-t border-[#e8ece3]">
                        {batch.notes}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Academic Guidelines */}
            <div className="space-y-3 pt-3">
              <h3 className="font-bold text-sm text-[#24312d]">Official Academic Guidelines:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scheduleConfig.guidelines.map((guide) => (
                  <div
                    key={guide.id}
                    className={`rounded-2xl p-4 text-xs space-y-1 ${
                      guide.isImportant
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                        : "bg-[#fbfaf7] border border-[#e2e5dc] text-slate-700"
                    }`}
                  >
                    <h5 className="font-bold">✓ {guide.title}:</h5>
                    <p className="text-[11px] leading-relaxed">{guide.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
