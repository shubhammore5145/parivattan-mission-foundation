import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  UnderConstructionView,
  FeaturePreviewItem,
} from "@/components/common/UnderConstructionView";
import { BookOpen, FileText, Download, Sparkles, Code2, Globe2 } from "lucide-react";

export default function StudyMaterialsPage() {
  const features: FeaturePreviewItem[] = [
    {
      title: "Japanese (JLPT N5, N4 & N3) Kanji & Grammar Notes",
      description:
        "Comprehensive Kanji stroke orders, vocabulary lists, particle charts, and reading passages designed for JLPT success.",
      icon: Globe2,
      tag: "JLPT Prep",
    },
    {
      title: "German (Goethe-Zertifikat A1 & A2) Grammar & Audio Drills",
      description:
        "Case tables (Nominativ, Akkusativ, Dativ), modal verbs, sentence construction formulas, and listening dialog scripts.",
      icon: BookOpen,
      tag: "German Fluency",
    },
    {
      title: "Python & Full-Stack Web Development Cheat Sheets",
      description:
        "Clean, visual syntax guides for Python, JavaScript, HTML/CSS, React, SQL, and practical problem-solving assignments.",
      icon: Code2,
      tag: "Tech School",
    },
    {
      title: "Previous Years' Model Exam Papers & Answer Keys",
      description:
        "Solved question banks and mock question sets for foreign languages, civil services, and technical aptitude tests.",
      icon: FileText,
      tag: "Question Banks",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col selection:bg-[#b5623b]/20">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <UnderConstructionView
          pageTitle="Study Materials & Notes Hub"
          moduleBadge="Under Active Curation • Academic Module 1"
          headline="Study Materials & Question Paper Hub"
          description="We are actively compiling official handouts, JLPT/Goethe study guides, coding lab sheets, and verified mock exam papers for all Parivattan students."
          progressPercent={78}
          expectedDate="Upcoming Term (2026)"
          features={features}
          primaryAction={{ label: "Access Student Portal", to: "/student" }}
          secondaryAction={{ label: "View Enrolled Courses", to: "/courses" }}
        />
      </main>
      <Footer />
    </div>
  );
}

