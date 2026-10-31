export interface AnnouncementItem {
  id: string;
  title: string;
  category: "Admissions" | "Academic" | "Examination" | "Event" | "Urgent" | "General";
  date: string; // ISO date string e.g. "2026-10-16"
  dateFormatted?: string; // e.g. "16 Oct 2026"
  isNew?: boolean;
  isPinned?: boolean;
  description: string;
  linkText?: string;
  linkUrl?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  fileSize?: string;
}

export interface NewsArticleItem {
  id: string;
  title: string;
  category: "Campus News" | "Student Achievements" | "Partnerships" | "Placement Drive" | "Cultural & Social";
  date: string;
  dateFormatted?: string;
  author?: string;
  image: string;
  summary: string;
  content: string;
  readTime?: string;
  linkUrl?: string;
}

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-pfls-english-prospectus",
    title: "Official PFLS Academic Prospectus & Student Guidelines (English Edition)",
    category: "Academic",
    date: "2026-10-16",
    dateFormatted: "16 Oct 2026",
    isNew: true,
    isPinned: true,
    description: "Official comprehensive academic handbook published by Parivattan Foreign Language School (PFLS). Contains detailed curriculum outlines for Japanese (JLPT N5/N4) and German (Goethe A1/A2), examination blueprints, attendance rules, fee structure, and global career pathways.\n\nDocument Authority: Academic Directorate, PMF\nAcademic Session: 2026-27",
    linkText: "View in Student Portal",
    linkUrl: "/student-portal",
    attachmentName: "PFLS-English.pdf",
    attachmentUrl: "/docs/PFLS-English.pdf",
    fileSize: "28.9 MB",
  },
  {
    id: "ann-pfls-marathi-prospectus",
    title: "Official PFLS Academic Prospectus & Student Admission Handbook",
    category: "Admissions",
    date: "2026-10-16",
    dateFormatted: "16 Oct 2026",
    isNew: true,
    isPinned: true,
    description: "Official Parivattan Foreign Language School (PFLS) academic prospectus and admissions handbook. Includes comprehensive curriculum details, admission procedure, subsidized fee structure, scholarship policies, examination criteria, and overseas higher education and career roadmaps.\n\nAuthorized by: Governing Board, Parivattan Mission Foundation\nAcademic Session: 2026-27",
    linkText: "View in Student Portal",
    linkUrl: "/student-portal",
    attachmentName: "PFLS-Marathi.pdf",
    attachmentUrl: "/docs/PFLS-Marathi.pdf",
    fileSize: "25.1 MB",
  },
  {
    id: "ann-01",
    title: "Admissions Open for Winter 2026 Batches: Japanese (JLPT N5/N4) & German (Goethe A1/A2)",
    category: "Admissions",
    date: "2026-10-16",
    dateFormatted: "16 Oct 2026",
    isNew: true,
    isPinned: true,
    description: "Online and hybrid admissions for the Winter 2026 term are now officially open. Seats in morning and evening batches are strictly limited to 30 students to maintain individual educator attention. Early enrollment is recommended.",
    linkText: "Apply for Admission",
    linkUrl: "/admissions",
    attachmentName: "Admission_Notice_Winter_2026.pdf",
  },
  {
    id: "ann-02",
    title: "Institute of Management & Language Studies Winter Examination-2026 Time Table",
    category: "Examination",
    date: "2026-10-18",
    dateFormatted: "18 Oct 2026",
    isNew: true,
    isPinned: true,
    description: "Official schedule and hall allocation for the upcoming Winter 2026 term examinations. Students are advised to verify their timetable and report 30 minutes before commencement.",
    linkText: "Download Time Table",
    linkUrl: "/student",
    attachmentName: "Winter_2026_Examination_Timetable.pdf",
    fileSize: "1.4 MB",
  },
  {
    id: "ann-03",
    title: "Distribution of Free Foundation Study Kits & Digital Kanji/Grammar Flashcards",
    category: "Academic",
    date: "2026-10-10",
    dateFormatted: "10 Oct 2026",
    isNew: false,
    isPinned: false,
    description: "Hardcopy textbooks (Minna no Nihongo / Studio d A1) and high-speed audio practice drives are ready for pickup at our local campus study center for all verified admitted candidates.",
    linkText: "Check Student Portal",
    linkUrl: "/student-portal",
  },
  {
    id: "ann-04",
    title: "Special Workshop: Japanese Engineering Visas (SSW) & Global Study Opportunities",
    category: "Event",
    date: "2026-10-05",
    dateFormatted: "05 Oct 2026",
    isNew: false,
    isPinned: true,
    description: "Interactive webinar hosted by bilingual industry veterans on Specified Skilled Worker (SSW) visas, Japanese corporate etiquette, and scholarship grants for Indian diploma and degree holders.",
    linkText: "Contact for Inquiries",
    linkUrl: "/contact",
  },
  {
    id: "ann-05",
    title: "Urgent Notice: Verification of Student PRN Credentials on Central Portal",
    category: "Urgent",
    date: "2026-09-28",
    dateFormatted: "28 Sep 2026",
    isNew: false,
    isPinned: false,
    description: "Students enrolled without verified PRN numbers are advised to complete their profile verification on the student portal before batch commencement to ensure seamless identity card issuance.",
    linkText: "Student Portal Login",
    linkUrl: "/student-portal",
  },
];

export const INITIAL_NEWS: NewsArticleItem[] = [
  {
    id: "news-01",
    title: "Parivattan Mission Foundation Inaugurates Advanced Digital Language Lab in Dharashiv",
    category: "Campus News",
    date: "2026-10-15",
    dateFormatted: "15 Oct 2026",
    author: "Foundation Press Bureau",
    image: "/img/slides/slide-live-2.jpeg",
    readTime: "3 min read",
    summary: "A milestone modern language and AI computing center equipped with high-speed audio-visual booths and interactive digital boards has officially commenced operations.",
    content: "Dharashiv, Maharashtra — In a significant step toward bridging the urban-rural educational divide, Parivattan Mission Foundation has unveiled its state-of-the-art Digital Language & Coding Laboratory. The facility features specialized listening pods for Japanese and German language learners, high-speed fiber broadband, and a dedicated mentor desk.\n\nSpeaking at the inauguration, the foundation trustees highlighted the urgent need to make international foreign languages and full-stack development accessible at nominal subsidized fees for rural youth. The first cohort of 60 students has commenced hands-on immersion drills with certified trainers.",
    linkUrl: "/courses",
  },
  {
    id: "news-02",
    title: "First Cohort Achieves 98% Pass Rate in Simulated JLPT N5 Certification Assessment",
    category: "Student Achievements",
    date: "2026-10-11",
    dateFormatted: "11 Oct 2026",
    author: "Academic Evaluation Cell",
    image: "/img/applications-open-languages.jpg",
    readTime: "2 min read",
    summary: "Over 85 rural students from agriculture and local engineering backgrounds scored Band A in standardized Kanji, Grammar, and Listening tests.",
    content: "The Foundation's Language Academy announced that 98% of students enrolled in the inaugural 6-month Japanese N5 intensive program cleared the full-length simulated JLPT examination conducted under strict exam hall conditions.\n\nThe curriculum combines daily Kaiwa dialogue practice, mnemonic flashcards, and native voice pronunciation exercises, empowering students who began with zero prior knowledge of foreign languages.",
    linkUrl: "/courses",
  },
  {
    id: "news-03",
    title: "Strategic Collaboration with Industry Guilds to Accelerate Direct Placements & Internships",
    category: "Partnerships",
    date: "2026-10-06",
    dateFormatted: "06 Oct 2026",
    author: "Career Development Office",
    image: "/img/purpose.jpg",
    readTime: "4 min read",
    summary: "New industry memoranda establish direct interview pathways and technical mentorship for bilingual software developers and translation candidates.",
    content: "To provide clear post-study pathways, Parivattan Mission Foundation has formalized partnerships with technology and linguistic consulting companies in Pune and Chhatrapati Sambhajinagar.\n\nUnder this initiative, students completing advanced N4/N3 Japanese and A2 German certifications will receive direct resume referrals, mock HR interview drills, and corporate mentorship to secure bilingual tech roles.",
    linkUrl: "/contact",
  },
  {
    id: "news-04",
    title: "Grassroots Digital Literacy Drive Reaches Over 400 Women Across Rural Centers",
    category: "Cultural & Social",
    date: "2026-10-01",
    dateFormatted: "01 Oct 2026",
    author: "Community Outreach Team",
    image: "/img/silder1.jpg",
    readTime: "3 min read",
    summary: "Free computerized accounting, GST invoicing, and e-governance workshops empower homemakers and women entrepreneurs with financial independence.",
    content: "The Savitribai Community Center conducted practical weekend masterclasses across local rural talukas, training women in MS Office, basic GST calculation, and digital payment security. The initiative continues with dedicated weekend batches tailored for working women.",
    linkUrl: "/rules",
  },
];

const ANNOUNCEMENTS_STORAGE_KEY = "parivattan_custom_announcements";
const NEWS_STORAGE_KEY = "parivattan_custom_news";

// ================= ANNOUNCEMENTS HELPERS =================
export const getStoredAnnouncements = (): AnnouncementItem[] => {
  if (typeof window === "undefined") return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure new initial items (like the 2 PFLS Prospectus PDFs) are automatically merged
        const existingIds = new Set(parsed.map((a: any) => a.id));
        const missingInitial = INITIAL_ANNOUNCEMENTS.filter((item) => !existingIds.has(item.id));
        if (missingInitial.length > 0) {
          const merged = [...missingInitial, ...parsed];
          try {
            localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load announcements from localStorage", err);
  }
  return INITIAL_ANNOUNCEMENTS;
};

export const saveAnnouncement = (item: AnnouncementItem): void => {
  const list = [...getStoredAnnouncements()];
  const idx = list.findIndex((a) => a.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.unshift(item); // Add newest at top
  }
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
    }
  } catch (err) {
    console.error("Failed to save announcement:", err);
  }
};

export const deleteAnnouncement = (id: string): void => {
  const list = getStoredAnnouncements().filter((a) => a.id !== id);
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
    }
  } catch (err) {
    console.error("Failed to delete announcement:", err);
  }
};

// ================= NEWS HELPERS =================
export const getStoredNews = (): NewsArticleItem[] => {
  if (typeof window === "undefined") return INITIAL_NEWS;
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load news from localStorage", err);
  }
  return INITIAL_NEWS;
};

export const saveNewsArticle = (item: NewsArticleItem): void => {
  const list = [...getStoredNews()];
  const idx = list.findIndex((n) => n.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
    }
  } catch (err) {
    console.error("Failed to save news article:", err);
  }
};

export const deleteNewsArticle = (id: string): void => {
  const list = getStoredNews().filter((n) => n.id !== id);
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
    }
  } catch (err) {
    console.error("Failed to delete news article:", err);
  }
};

export const resetNewsAndAnnouncements = (): void => {
  try {
    localStorage.removeItem(ANNOUNCEMENTS_STORAGE_KEY);
    localStorage.removeItem(NEWS_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("parivattan-news-announcements-updated"));
    }
  } catch (err) {
    console.error("Failed to reset news & announcements:", err);
  }
};
