import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  UnderConstructionView,
  FeaturePreviewItem,
} from "@/components/common/UnderConstructionView";
import { Clock, Video, Calendar, Bell, Users, MessageSquare } from "lucide-react";

export default function SchedulePage() {
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
      </main>
      <Footer />
    </div>
  );
}

