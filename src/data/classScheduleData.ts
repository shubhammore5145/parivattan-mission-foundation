export interface BatchScheduleItem {
  id: string;
  title: string;
  batchType: "morning" | "evening" | "weekend" | "regular";
  hours: string;
  days: string;
  venue: string;
  meetingUrl?: string;
  instructor?: string;
  courseTags?: string[];
  notes?: string;
  isActive: boolean;
}

export interface BatchGuidelineItem {
  id: string;
  title: string;
  description: string;
  category: "attendance" | "discipline" | "materials" | "recordings" | "general";
  isImportant?: boolean;
}

export interface ClassScheduleConfig {
  academicSession: string;
  lastUpdated: string;
  batches: BatchScheduleItem[];
  guidelines: BatchGuidelineItem[];
}

export const INITIAL_CLASS_SCHEDULE: ClassScheduleConfig = {
  academicSession: "2026-2027",
  lastUpdated: new Date().toISOString(),
  batches: [
    {
      id: "batch-morning-1",
      title: "Morning Batches",
      batchType: "morning",
      hours: "08:00 AM to 10:00 AM",
      days: "Monday to Friday",
      venue: "Campus Computer Lab 2 & Live Interactive Online Room",
      meetingUrl: "https://meet.google.com",
      instructor: "Faculty Directorate",
      courseTags: ["Japanese (JLPT N5/N4)", "German (A1/A2)", "Tech Bootcamps"],
      notes: "Students must log in or arrive at least 10 minutes before the scheduled lecture.",
      isActive: true,
    },
    {
      id: "batch-evening-1",
      title: "Evening Batches",
      batchType: "evening",
      hours: "06:00 PM to 08:00 PM",
      days: "Monday to Friday",
      venue: "Foreign Language School Wing & Virtual Classrooms",
      meetingUrl: "https://meet.google.com",
      instructor: "Faculty Directorate",
      courseTags: ["Japanese (JLPT N3)", "German (B1)", "Full-Stack Web Dev"],
      notes: "Lecture recordings and course handouts are updated regularly on this portal.",
      isActive: true,
    },
    {
      id: "batch-weekend-1",
      title: "Weekend Intensive Batches",
      batchType: "weekend",
      hours: "10:00 AM to 01:00 PM",
      days: "Saturday & Sunday",
      venue: "Main Lecture Hall & Live Stream Room",
      meetingUrl: "https://meet.google.com",
      instructor: "Guest Industry Mentors",
      courseTags: ["Conversational Japanese", "Tech Projects", "Career Prep"],
      notes: "Dedicated for working professionals and university students.",
      isActive: true,
    },
  ],
  guidelines: [
    {
      id: "guide-attendance",
      title: "Mandatory Attendance Policy",
      description:
        "A minimum of 75% attendance is required to qualify for university and foundation accredited course completion certificates.",
      category: "attendance",
      isImportant: true,
    },
    {
      id: "guide-punctuality",
      title: "Punctuality & Virtual Classroom Etiquette",
      description:
        "Students joining virtual classes via Google Meet must join using their registered student email, keep their microphones muted during lectures, and submit assignments on time.",
      category: "discipline",
      isImportant: false,
    },
    {
      id: "guide-recordings",
      title: "Session Recordings & Handouts",
      description:
        "All recorded lectures and daily study notes are archived and accessible within 24 hours of lecture completion on the student portal.",
      category: "recordings",
      isImportant: false,
    },
  ],
};

const STORAGE_KEY = "pmf_class_schedule_config_v1";

export function getStoredClassSchedule(): ClassScheduleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_CLASS_SCHEDULE;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.batches) && Array.isArray(parsed.guidelines)) {
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse stored class schedule:", e);
  }
  return INITIAL_CLASS_SCHEDULE;
}

export function saveClassSchedule(config: ClassScheduleConfig): void {
  try {
    const toSave: ClassScheduleConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    // Dispatch a storage event so all components react immediately
    window.dispatchEvent(
      new CustomEvent("pmf_schedule_updated", { detail: toSave })
    );
  } catch (e) {
    console.error("Failed to save class schedule:", e);
  }
}

export function resetClassSchedule(): ClassScheduleConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("pmf_schedule_updated", { detail: INITIAL_CLASS_SCHEDULE })
    );
  } catch (e) {
    console.error("Failed to reset class schedule:", e);
  }
  return INITIAL_CLASS_SCHEDULE;
}

