import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  UnderConstructionView,
  FeaturePreviewItem,
} from "@/components/common/UnderConstructionView";
import { BrainCircuit, Trophy, CheckCircle2, Zap, Code2, Globe2 } from "lucide-react";

export default function PracticeQuizzesPage() {
  const features: FeaturePreviewItem[] = [
    {
      title: "JLPT N5 & N4 Daily Kanji & Vocabulary Drills",
      description:
        "Fast-paced 10-question flash drills testing Hiragana, Katakana, Kanji readings, and contextual vocabulary with immediate feedback.",
      icon: Globe2,
      tag: "JLPT Japanese",
    },
    {
      title: "Goethe-Zertifikat German A1 & A2 Grammar Quizzes",
      description:
        "Interactive fill-in-the-blanks, case endings (der/die/das), verb conjugations, and prepositions practice tests.",
      icon: BrainCircuit,
      tag: "German Drills",
    },
    {
      title: "Python Programming Output & Debugging Challenges",
      description:
        "Test your code reading and logical debugging skills with real code snippets, loop challenges, and data structure questions.",
      icon: Code2,
      tag: "Python & Coding",
    },
    {
      title: "Instant Scorecards, Explanations & Leaderboards",
      description:
        "Detailed step-by-step solutions for every question, time spent analytics, and motivational milestone badges.",
      icon: Trophy,
      tag: "Analytics & Badges",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col selection:bg-[#b5623b]/20">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <UnderConstructionView
          pageTitle="Interactive Practice Quizzes"
          moduleBadge="Under Active Engineering • Interactive Assessment"
          headline="Interactive Practice Quizzes & Mock Tests"
          description="Self-paced assessment drills for Japanese (JLPT), German (Goethe), and Python programming with instant scoring and detailed answers."
          progressPercent={65}
          expectedDate="Upcoming Term (2026)"
          features={features}
          primaryAction={{ label: "Go to Student Portal", to: "/student" }}
          secondaryAction={{ label: "Explore Foreign Languages", to: "/courses" }}
        />
      </main>
      <Footer />
    </div>
  );
}

