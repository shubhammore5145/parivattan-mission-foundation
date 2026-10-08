export interface BatchSchedule {
  id: string;
  name: string; // e.g. "Morning Batch", "Evening Batch", "Regular Batch"
  days: string; // e.g. "Monday, Wednesday & Friday"
  time: string; // e.g. "10:00 AM – 11:30 AM"
  duration: string; // e.g. "6 Months"
  intake?: number; // e.g. 30
  intakeLabel?: string; // e.g. "30 Students"
  isLimitedSeats?: boolean;
  badge?: string; // "Morning Batch" | "Evening Batch" | "Regular Batch"
}

export interface CourseLevel {
  id: string; // e.g. "japanese-n5"
  level: string; // "N5", "N4", "N3", "A1", "A2", "Basic English"
  levelShort: string;
  duration: string; // "6 Months", "7 Months", "3 Months", "3–4.5 Months"
  durationBadge: "3-Month Course" | "6-Month Course" | "7-Month Course" | "3–4.5 Months";
  courseFee: number;
  securityDeposit: number; // 0 if none
  hasSecurityDeposit: boolean;
  refundCondition: string;
  batches: BatchSchedule[];
  objectives: string[];
  intakeSummary?: string;
  description: string;
}

export interface LanguageCourse {
  id: string; // "japanese", "german", "english", "french"
  name: string; // "Japanese Language"
  flag: string; // "🇯🇵"
  nativeName: string; // "日本語"
  tagline: string;
  shortDesc: string;
  levelsSummary: string; // "N5, N4, N3"
  durationSummary: string; // "6 to 7 Months"
  levels: CourseLevel[];
  image: string;
  colorScheme: {
    primary: string;
    light: string;
    border: string;
    text: string;
    accent: string;
  };
}

export const LANGUAGE_COURSES: LanguageCourse[] = [
  {
    id: "japanese",
    name: "Japanese Language",
    flag: "🇯🇵",
    nativeName: "日本語",
    tagline: "Master JLPT N5, N4 & N3 with certified curriculum & exam readiness",
    shortDesc: "Structured training in Hiragana, Katakana, Kanji, grammar and listening with refundable examination security deposit.",
    levelsSummary: "N5, N4, N3",
    durationSummary: "6 – 7 Months",
    image: "/img/japanese.jpeg",
    colorScheme: {
      primary: "#c8372d",
      light: "#fdf3f2",
      border: "#f8cfcb",
      text: "#8f1e16",
      accent: "#b5623b",
    },
    levels: [
      {
        id: "japanese-n5",
        level: "N5",
        levelShort: "N5 Level",
        duration: "6 Months",
        durationBadge: "6-Month Course",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "30 Students per batch",
        description: "Entry-level foundation covering Hiragana, Katakana, basic Kanji (approx. 100), daily conversational phrases, and JLPT N5 exam preparation.",
        objectives: [
          "Master basic Hiragana & Katakana phonetic scripts",
          "Acquire ~100 foundational Kanji characters and ~800 core vocabulary words",
          "Understand basic Japanese grammar structures and daily life expressions",
          "Practice listening comprehension for short, slow spoken dialogues",
          "Official JLPT N5 examination registration and test strategy"
        ],
        batches: [
          {
            id: "jp-n5-morning",
            name: "N5 – Morning Batch",
            days: "Monday, Wednesday & Friday",
            time: "10:00 AM – 11:30 AM",
            duration: "6 Months",
            intake: 30,
            intakeLabel: "30 Students",
            isLimitedSeats: true,
            badge: "Morning Batch",
          },
          {
            id: "jp-n5-evening",
            name: "N5 – Evening Batch",
            days: "Monday, Wednesday & Friday",
            time: "7:00 PM – 8:30 PM",
            duration: "6 Months",
            intake: 30,
            intakeLabel: "30 Students",
            isLimitedSeats: true,
            badge: "Evening Batch",
          },
        ],
      },
      {
        id: "japanese-n4",
        level: "N4",
        levelShort: "N4 Level",
        duration: "6 Months",
        durationBadge: "6-Month Course",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "25 Students",
        description: "Intermediate Japanese for everyday situations, compound sentence forms, ~300 Kanji, and JLPT N4 exam clearance.",
        objectives: [
          "Read and write intermediate passages with ~300 Kanji characters",
          "Master complex sentence patterns, passive and causative verb conjugations",
          "Understand spoken conversations in everyday situations spoken at near-natural speed",
          "Build workplace manners and conversational Japanese dialogue (Kaiwa)",
          "Thorough JLPT N4 test practice to meet refund and certification criteria"
        ],
        batches: [
          {
            id: "jp-n4-evening",
            name: "N4 – Evening Batch",
            days: "Tuesday, Thursday & Saturday",
            time: "7:00 PM – 8:30 PM",
            duration: "6 Months",
            intake: 25,
            intakeLabel: "25 Students",
            isLimitedSeats: true,
            badge: "Evening Batch",
          },
        ],
      },
      {
        id: "japanese-n3",
        level: "N3",
        levelShort: "N3 Level",
        duration: "7 Months",
        durationBadge: "7-Month Course",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "Limited Batch Size",
        description: "Bridge between basic and advanced Japanese, unlocking corporate and technical opportunities with JLPT N3 mastery.",
        objectives: [
          "Understand written materials on specific everyday topics and headlines",
          "Learn ~650 Kanji characters and ~3,700 advanced vocabulary terms",
          "Grasp coherent conversations in everyday life spoken at natural speed",
          "Master business honorifics (Sonkeigo and Kenjougo) for professional communication",
          "Prepare for and pass both required examinations to secure full security deposit refund"
        ],
        batches: [
          {
            id: "jp-n3-regular",
            name: "N3 – Regular Batch",
            days: "Monday to Friday",
            time: "7:00 PM – 8:30 PM",
            duration: "7 Months",
            intakeLabel: "Limited Seats",
            isLimitedSeats: true,
            badge: "Regular Batch",
          },
        ],
      },
    ],
  },
  {
    id: "german",
    name: "German Language",
    flag: "🇩🇪",
    nativeName: "Deutsch",
    tagline: "Build European career & higher education pathways with Goethe-aligned levels",
    shortDesc: "Comprehensive German training for students, engineers, and healthcare professionals aiming for Germany.",
    levelsSummary: "A1, A2",
    durationSummary: "3 to 4.5 Months",
    image: "/img/purpose.jpg",
    colorScheme: {
      primary: "#2563eb",
      light: "#eff6ff",
      border: "#bfdbfe",
      text: "#1e40af",
      accent: "#2563eb",
    },
    levels: [
      {
        id: "german-a1",
        level: "A1",
        levelShort: "A1 Level",
        duration: "3 Months",
        durationBadge: "3-Month Course",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "Regular Batch",
        description: "Beginner level German focusing on phonetics, essential grammar, basic introductions, and Goethe-Zertifikat A1 format.",
        objectives: [
          "Understand and use familiar everyday expressions and basic phrases",
          "Introduce yourself and others, ask and answer questions about personal details",
          "Master German noun genders (der, die, das) and nominative/accusative cases",
          "Develop speaking and listening confidence through audio-visual drills",
          "Preparation for Goethe-Zertifikat A1 examination"
        ],
        batches: [
          {
            id: "de-a1-mwf",
            name: "A1 Batch",
            days: "Monday, Wednesday & Friday",
            time: "7:00 PM – 8:30 PM",
            duration: "3 Months",
            intakeLabel: "Limited Seats",
            isLimitedSeats: true,
            badge: "Evening Batch",
          },
        ],
      },
      {
        id: "german-a2",
        level: "A2",
        levelShort: "A2 Level",
        duration: "3–4.5 Months",
        durationBadge: "3–4.5 Months",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "Regular Batch",
        description: "Elementary German proficiency enabling communication in simple, routine tasks and direct exchange of information.",
        objectives: [
          "Understand sentences and frequently used expressions related to immediate relevance",
          "Master dative case, modal auxiliary verbs, and past tense (Perfekt)",
          "Communicate in simple and routine tasks requiring exchange of information",
          "Describe aspects of background, immediate environment, and matters in areas of immediate need",
          "Full Goethe-Zertifikat A2 exam training and mock sessions"
        ],
        batches: [
          {
            id: "de-a2-tts",
            name: "A2 Batch",
            days: "Tuesday, Thursday & Saturday",
            time: "7:00 PM – 8:30 PM",
            duration: "3–4.5 Months",
            intakeLabel: "Limited Seats",
            isLimitedSeats: true,
            badge: "Evening Batch",
          },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "English Language",
    flag: "🇬🇧",
    nativeName: "English",
    tagline: "Build foundational fluency, grammar confidence and professional communication",
    shortDesc: "Intensive 3-month daily weekday program designed to elevate spoken English, vocabulary, and workplace confidence.",
    levelsSummary: "Basic English",
    durationSummary: "3 Months",
    image: "/img/silder3.jpg",
    colorScheme: {
      primary: "#059669",
      light: "#ecfdf5",
      border: "#a7f3d0",
      text: "#065f46",
      accent: "#059669",
    },
    levels: [
      {
        id: "english-basic",
        level: "Basic English",
        levelShort: "Basic English",
        duration: "3 Months",
        durationBadge: "3-Month Course",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "Daily Weekday Batch",
        description: "Essential English communication course for beginners and students seeking spoken fluency, correct grammar, and everyday ease.",
        objectives: [
          "Overcome fear of speaking and build natural spoken English fluency",
          "Master essential English tenses, parts of speech, and sentence structures",
          "Expand practical day-to-day vocabulary for academic and workplace contexts",
          "Improve pronunciation, accent clarity, and voice modulation",
          "Engage in public speaking, group discussions, and interview self-introductions"
        ],
        batches: [
          {
            id: "en-basic-evening",
            name: "Basic English – Weekday Batch",
            days: "Monday to Friday",
            time: "7:00 PM – 8:00 PM",
            duration: "3 Months",
            intakeLabel: "Limited Seats",
            isLimitedSeats: true,
            badge: "Evening Batch",
          },
        ],
      },
    ],
  },
  {
    id: "french",
    name: "French Language",
    flag: "🇫🇷",
    nativeName: "Français",
    tagline: "Discover French culture, phonetics and DELF A1 conversational proficiency",
    shortDesc: "Daily weekday immersion program covering French grammar, conversational fluency, and international exam prep.",
    levelsSummary: "A1",
    durationSummary: "3 Months",
    image: "/img/silder4.jpg",
    colorScheme: {
      primary: "#7c3aed",
      light: "#f5f3ff",
      border: "#ddd6fe",
      text: "#5b21b6",
      accent: "#7c3aed",
    },
    levels: [
      {
        id: "french-a1",
        level: "A1",
        levelShort: "A1 Level",
        duration: "3 Months",
        durationBadge: "3-Month Course",
        courseFee: 100,
        securityDeposit: 0,
        hasSecurityDeposit: false,
        refundCondition: "Nominal subsidized fee of flat ₹100.",
        intakeSummary: "Daily Weekday Batch",
        description: "Introductory French language training aligned with DELF A1, covering essential dialogue, phonetics, and basic cultural communication.",
        objectives: [
          "Understand and use everyday French expressions and very basic phrases",
          "Introduce yourself, ask questions about someone's origin, family, and hobbies",
          "Master French vowel pronunciations, liaisons, and silent letter rules",
          "Conjugate standard present-tense verbs (ER, IR, RE verbs and common irregulars)",
          "Practice DELF A1 reading, listening, writing and oral communication patterns"
        ],
        batches: [
          {
            id: "fr-a1-evening",
            name: "A1 – Weekday Batch",
            days: "Monday to Friday",
            time: "7:00 PM – 8:00 PM",
            duration: "3 Months",
            intakeLabel: "Limited Seats",
            isLimitedSeats: true,
            badge: "Evening Batch",
          },
        ],
      },
    ],
  },
];

// Helper to find a course or level
export const getCourseById = (id: string): LanguageCourse | undefined => {
  return LANGUAGE_COURSES.find(c => c.id.toLowerCase() === id.toLowerCase());
};

export const getCourseLevelById = (levelId: string): { course: LanguageCourse; level: CourseLevel } | undefined => {
  for (const course of LANGUAGE_COURSES) {
    const level = course.levels.find(l => l.id.toLowerCase() === levelId.toLowerCase());
    if (level) {
      return { course, level };
    }
  }
  return undefined;
};

// Complete 13 Rules and Regulations as strictly requested in Section 10
export const RULES_AND_REGULATIONS = [
  "No refund is available after registration and payment of course fees.",
  "Course registration cannot be transferred to another person.",
  "Batch changes are subject to availability and institute approval.",
  "Students must pay the applicable course fee and security deposit during registration.",
  "Security deposits are refundable only according to the applicable course conditions.",
  "Students are expected to attend classes regularly.",
  "Students must appear for required examinations.",
  "Security deposit refunds, where applicable, depend on fulfilling the stated examination criteria.",
  "Class schedules may be changed when necessary, and students will be informed about significant changes.",
  "Students must maintain proper discipline and respectful behaviour.",
  "Course materials are intended only for registered students and should not be redistributed without permission.",
  "The institute reserves the right to update rules and regulations when required.",
  "The institute's decisions regarding special circumstances will be subject to applicable laws."
];

// Course FAQs
export const COURSE_FAQS = [
  {
    q: "How does the Japanese Security Deposit refund work?",
    a: "For Japanese N5, N4, and N3 courses, a refundable security deposit of ₹2,000 is required alongside the course fee. The refund is processed strictly after fulfilling the stated examination criteria: For N5, according to applicable course conditions; for N4, after successfully passing the required examination; and for N3, after successfully passing both required examinations."
  },
  {
    q: "Are course fees refundable if I cannot attend classes?",
    a: "As per Rule #1 of our Rules & Regulations: No refund is available after registration and payment of course fees. Course registration cannot be transferred to another person."
  },
  {
    q: "Can I switch batches between Morning and Evening?",
    a: "Batch changes are subject to seat availability, batch intake limits, and prior institute approval."
  },
  {
    q: "Are German, English, or French course fees subject to a security deposit?",
    a: "No. German (A1 & A2), English (Basic), and French (A1) only require payment of their respective course fee (₹4,000 / ₹6,000 for German, ₹2,000 for English, and ₹3,000 for French). No security deposit is charged for these courses."
  },
  {
    q: "What is the student intake limit for Japanese batches?",
    a: "Japanese N5 has a strict intake limit of 30 students for both the Morning and Evening batches. Japanese N4 has an intake limit of 25 students. Due to limited seats, early registration is highly recommended."
  }
];

// Live Batch Seats Capacity & Real-Time Enrolled Tracker
// Real admissions start at 0 enrolled. Slots update dynamically as students enroll.
export const BATCH_SEATS_CONFIG: Record<string, { totalSeats: number; initialEnrolled: number }> = {
  "jp-n5-morning": { totalSeats: 30, initialEnrolled: 0 },
  "jp-n5-evening": { totalSeats: 30, initialEnrolled: 0 },
  "jp-n4-evening": { totalSeats: 25, initialEnrolled: 0 },
  "jp-n3-regular": { totalSeats: 20, initialEnrolled: 0 },
  "de-a1-weekend": { totalSeats: 25, initialEnrolled: 0 },
  "de-a2-weekend": { totalSeats: 25, initialEnrolled: 0 },
  "en-basic-evening": { totalSeats: 30, initialEnrolled: 0 },
  "fr-a1-evening": { totalSeats: 25, initialEnrolled: 0 },
};

export interface BatchSeatsStatus {
  batchId: string;
  courseId: string;
  courseName: string;
  flag: string;
  levelName: string;
  batchName: string;
  days: string;
  time: string;
  totalSeats: number;
  enrolled: number;
  remainingSeats: number;
  isFull: boolean;
  isManuallyFull?: boolean;
}

export const getBatchSeatsInfo = (
  batchId: string
): { totalSeats: number; enrolled: number; remainingSeats: number; isFull: boolean; isManuallyFull?: boolean } => {
  const config = BATCH_SEATS_CONFIG[batchId] || { totalSeats: 30, initialEnrolled: 0 };
  
  try {
    // 1. Check admin custom overrides
    const overrides = JSON.parse(localStorage.getItem("parivattan_admin_batch_overrides") || "{}");
    const batchOverride = overrides[batchId] || {};
    const totalSeats = typeof batchOverride.totalSeats === "number" && batchOverride.totalSeats > 0
      ? batchOverride.totalSeats
      : config.totalSeats;
    const isManuallyFull = Boolean(batchOverride.isManuallyFull);

    // 2. Count actual registered admissions for this batch
    let registeredCount = 0;
    try {
      const storedMap = JSON.parse(localStorage.getItem("parivattan_batch_intake_map") || "{}");
      registeredCount = Number(storedMap[batchId]) || 0;
      
      // Also cross-check stored admissions if intake map was cleared
      const admissions = JSON.parse(localStorage.getItem("parivattan_admissions") || "[]");
      if (Array.isArray(admissions) && admissions.length > 0) {
        const admissionsMatchingBatch = admissions.filter((a: any) => {
          const prog = (a.program || "").toLowerCase();
          const msg = (a.message || "").toLowerCase();
          const bId = batchId.toLowerCase();
          return prog.includes(bId) || msg.includes(bId) || (a.batch && a.batch.toLowerCase().includes(bId));
        }).length;
        registeredCount = Math.max(registeredCount, admissionsMatchingBatch);
      }
    } catch {
      // ignore
    }

    const enrolled = config.initialEnrolled + registeredCount;
    const remainingSeats = isManuallyFull ? 0 : Math.max(0, totalSeats - enrolled);
    const isFull = isManuallyFull || remainingSeats <= 0;

    return {
      totalSeats,
      enrolled,
      remainingSeats,
      isFull,
      isManuallyFull,
    };
  } catch (e) {
    const remainingSeats = Math.max(0, config.totalSeats - config.initialEnrolled);
    return {
      totalSeats: config.totalSeats,
      enrolled: config.initialEnrolled,
      remainingSeats,
      isFull: remainingSeats <= 0,
    };
  }
};

export const incrementBatchEnrollment = (batchId: string): void => {
  try {
    const stored = JSON.parse(localStorage.getItem("parivattan_batch_intake_map") || "{}");
    stored[batchId] = (Number(stored[batchId]) || 0) + 1;
    localStorage.setItem("parivattan_batch_intake_map", JSON.stringify(stored));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batch-seats-updated"));
    }
  } catch (e) {
    console.warn("Could not save batch intake count", e);
  }
};

// Admin Capacity Management Functions
export const updateBatchSeatCapacity = (batchId: string, newTotalSeats: number): void => {
  try {
    const overrides = JSON.parse(localStorage.getItem("parivattan_admin_batch_overrides") || "{}");
    overrides[batchId] = {
      ...overrides[batchId],
      totalSeats: Math.max(1, newTotalSeats),
    };
    localStorage.setItem("parivattan_admin_batch_overrides", JSON.stringify(overrides));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batch-seats-updated"));
    }
  } catch (e) {
    console.warn("Could not update batch seat capacity", e);
  }
};

export const toggleBatchManualFull = (batchId: string): boolean => {
  try {
    const overrides = JSON.parse(localStorage.getItem("parivattan_admin_batch_overrides") || "{}");
    const current = Boolean(overrides[batchId]?.isManuallyFull);
    overrides[batchId] = {
      ...overrides[batchId],
      isManuallyFull: !current,
    };
    localStorage.setItem("parivattan_admin_batch_overrides", JSON.stringify(overrides));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batch-seats-updated"));
    }
    return !current;
  } catch (e) {
    console.warn("Could not toggle batch full status", e);
    return false;
  }
};

export const resetBatchEnrollment = (batchId: string): void => {
  try {
    const stored = JSON.parse(localStorage.getItem("parivattan_batch_intake_map") || "{}");
    stored[batchId] = 0;
    localStorage.setItem("parivattan_batch_intake_map", JSON.stringify(stored));

    const overrides = JSON.parse(localStorage.getItem("parivattan_admin_batch_overrides") || "{}");
    if (overrides[batchId]) {
      delete overrides[batchId].isManuallyFull;
      localStorage.setItem("parivattan_admin_batch_overrides", JSON.stringify(overrides));
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batch-seats-updated"));
    }
  } catch (e) {
    console.warn("Could not reset batch enrollment", e);
  }
};

export const getAllBatchesSeatsList = (): BatchSeatsStatus[] => {
  const list: BatchSeatsStatus[] = [];
  LANGUAGE_COURSES.forEach((course) => {
    course.levels.forEach((lvl) => {
      lvl.batches.forEach((b) => {
        const info = getBatchSeatsInfo(b.id);
        list.push({
          batchId: b.id,
          courseId: course.id,
          courseName: course.name,
          flag: course.flag,
          levelName: lvl.level,
          batchName: b.name,
          days: b.days,
          time: b.time,
          totalSeats: info.totalSeats,
          enrolled: info.enrolled,
          remainingSeats: info.remainingSeats,
          isFull: info.isFull,
          isManuallyFull: info.isManuallyFull,
        });
      });
    });
  });
  return list;
};

export interface UpcomingCourse {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  country: string;
  tagline: string;
  description: string;
  targetExam: string;
  expectedDuration: string;
  statusBadge: string;
  highlights: string[];
  themeColor: string;
  themeGlow: string;
  badgeBg: string;
  badgeText: string;
}

export const UPCOMING_COURSES: UpcomingCourse[] = [
  {
    id: "russian",
    name: "Russian Language",
    nativeName: "Русский язык",
    flag: "🇷🇺",
    country: "Russia & Central Asia",
    tagline: "TORFL Certification Pathway & Cyrillic Script Mastery",
    description: "Comprehensive foundational and intermediate curriculum covering the Cyrillic alphabet, essential grammar cases, conversational phonetics, and preparation for official TORFL (Test of Russian as a Foreign Language) examinations.",
    targetExam: "TORFL / TRKI Level A1–B1",
    expectedDuration: "4 to 6 Months",
    statusBadge: "Coming Soon",
    highlights: [
      "Master Cyrillic script & accurate phonetics",
      "Gateway to premier medical, tech & engineering universities",
      "Essential conversational fluency & situational dialogues",
    ],
    themeColor: "#dc2626",
    themeGlow: "rgba(220, 38, 38, 0.12)",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
  },
  {
    id: "chinese",
    name: "Chinese Language (Mandarin)",
    nativeName: "中文 • 普通话",
    flag: "🇨🇳",
    country: "Greater China & Global Trade",
    tagline: "Standard HSK Certification & Global Commerce Fluency",
    description: "Interactive Mandarin training structured around Pinyin romanization, 4 tonal variations, essential Hanzi stroke writing, everyday spoken communication, and HSK Level 1 to 3 examination syllabus.",
    targetExam: "HSK Level 1–3 Standardized Testing",
    expectedDuration: "5 to 6 Months",
    statusBadge: "Coming Soon",
    highlights: [
      "Tone mastery with accurate Pinyin phonetics",
      "Core 300+ high-frequency Hanzi characters",
      "High-demand skill for international trade & technology",
    ],
    themeColor: "#ea580c",
    themeGlow: "rgba(234, 88, 12, 0.12)",
    badgeBg: "#ffedd5",
    badgeText: "#9a3412",
  },
  {
    id: "spanish",
    name: "Spanish Language",
    nativeName: "Español • Castellano",
    flag: "🇪🇸",
    country: "Spain & Latin America (20+ Nations)",
    tagline: "Official DELE Framework & World Language Fluency",
    description: "Modern communicative Spanish course aligned with the Instituto Cervantes DELE curriculum. Learn grammar, verb conjugations, and native listening comprehension with immersive cultural contexts.",
    targetExam: "DELE / SIELE Diplomas in Spanish",
    expectedDuration: "3 to 4.5 Months",
    statusBadge: "Coming Soon",
    highlights: [
      "World's 2nd most spoken native language (500M+ speakers)",
      "Structured DELE A1 & A2 exam curriculum",
      "Fast conversational learning curve & global mobility",
    ],
    themeColor: "#b45309",
    themeGlow: "rgba(180, 83, 9, 0.12)",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
  },
];

