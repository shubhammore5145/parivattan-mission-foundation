import React, { useState, useEffect, useMemo } from "react";
import {
  LanguageCourse,
  CourseLevel,
  BatchSchedule,
  getStoredCourses,
  saveCustomCourse,
  deleteCustomCourse,
  resetCustomCourses,
  INITIAL_LANGUAGE_COURSES,
} from "@/data/languageCoursesData";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const QUICK_FLAGS = ["🇯🇵", "🇩🇪", "🇬🇧", "🇫🇷", "🇷🇺", "🇪🇸", "🇨🇳", "🇮🇹", "💻", "🤖", "🚀", "🎓"];

const PRESET_COLORS = [
  { name: "Crimson Red", primary: "#c8372d", light: "#fdf3f2", border: "#f8cfcb", text: "#8f1e16", accent: "#b5623b" },
  { name: "Amber Orange", primary: "#d97706", light: "#fffbeb", border: "#fde68a", text: "#92400e", accent: "#d97706" },
  { name: "Royal Blue", primary: "#1d4ed8", light: "#eff6ff", border: "#bfdbfe", text: "#1e40af", accent: "#2563eb" },
  { name: "Emerald Green", primary: "#059669", light: "#ecfdf5", border: "#a7f3d0", text: "#065f46", accent: "#10b981" },
  { name: "Deep Purple", primary: "#7c3aed", light: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", accent: "#8b5cf6" },
  { name: "Forest Dark", primary: "#24312d", light: "#f2f4f3", border: "#d5ded9", text: "#24312d", accent: "#e5a37f" },
];

export default function CourseManager() {
  const [courses, setCourses] = useState<LanguageCourse[]>(() => getStoredCourses());
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LanguageCourse | null>(null);

  // Delete confirmation
  const [deletingCourse, setDeletingCourse] = useState<LanguageCourse | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    nativeName: string;
    flag: string;
    tagline: string;
    shortDesc: string;
    levelsSummary: string;
    durationSummary: string;
    image: string;
    colorIndex: number;
    levels: {
      id: string;
      level: string;
      levelShort: string;
      proficiency: string;
      duration: string;
      durationBadge: "3-Month Course" | "6-Month Course" | "7-Month Course" | "3–4.5 Months";
      courseFee: number;
      platformFee: number;
      securityDeposit: number;
      hasSecurityDeposit: boolean;
      refundCondition: string;
      description: string;
      objectivesText: string;
      batches: {
        id: string;
        name: string;
        days: string;
        time: string;
        duration: string;
        intake: number;
        badge: string;
      }[];
    }[];
  }>({
    id: "",
    name: "",
    nativeName: "",
    flag: "🎓",
    tagline: "",
    shortDesc: "",
    levelsSummary: "Beginner, Intermediate",
    durationSummary: "3 to 6 Months",
    image: "/img/purpose.jpg",
    colorIndex: 0,
    levels: [],
  });

  // Re-sync on storage change
  useEffect(() => {
    const handleSync = () => {
      setCourses(getStoredCourses());
    };
    window.addEventListener("courses-updated", handleSync);
    return () => window.removeEventListener("courses-updated", handleSync);
  }, []);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nativeName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const newCourseId = `course-${Date.now().toString(36)}`;
    const newLevelId = `${newCourseId}-level1`;
    const newBatchId = `${newCourseId}-batch1`;

    setEditingCourse(null);
    setFormData({
      id: newCourseId,
      name: "",
      nativeName: "",
      flag: "🎓",
      tagline: "",
      shortDesc: "",
      levelsSummary: "Foundation / Basic",
      durationSummary: "3 to 6 Months",
      image: "/img/purpose.jpg",
      colorIndex: 3, // Emerald green
      levels: [
        {
          id: newLevelId,
          level: "Foundation / Level 1",
          levelShort: "Level 1 (Basic)",
          proficiency: "Basic",
          duration: "3 Months",
          durationBadge: "3-Month Course",
          courseFee: 2000,
          platformFee: 100,
          securityDeposit: 0,
          hasSecurityDeposit: false,
          refundCondition: "Platform fee and admission registration fees are strictly non-refundable.",
          description: "Foundational syllabus covering core modules, practical lessons, and certification readiness.",
          objectivesText: "Core fundamentals & concepts\nPractical assignments & tests\nExamination preparation & certification",
          batches: [
            {
              id: newBatchId,
              name: "Morning Regular Batch",
              days: "Monday, Wednesday & Friday",
              time: "10:00 AM – 11:30 AM",
              duration: "3 Months",
              intake: 30,
              badge: "Morning Batch",
            },
          ],
        },
      ],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (course: LanguageCourse) => {
    setEditingCourse(course);

    // Map levels to form levels
    const mappedLevels = course.levels.map((lvl) => ({
      id: lvl.id,
      level: lvl.level,
      levelShort: lvl.levelShort || `${lvl.level} Level`,
      proficiency: lvl.proficiency || "Basic",
      duration: lvl.duration,
      durationBadge: lvl.durationBadge || "6-Month Course",
      courseFee: lvl.courseFee,
      platformFee: lvl.platformFee || 100,
      securityDeposit: lvl.securityDeposit || 0,
      hasSecurityDeposit: Boolean(lvl.hasSecurityDeposit),
      refundCondition: lvl.refundCondition || "Non-refundable once batch commences.",
      description: lvl.description || "",
      objectivesText: Array.isArray(lvl.objectives) ? lvl.objectives.join("\n") : "",
      batches: lvl.batches.map((b) => ({
        id: b.id,
        name: b.name,
        days: b.days,
        time: b.time,
        duration: b.duration,
        intake: b.intake || 30,
        badge: b.badge || b.name,
      })),
    }));

    // Find color preset match
    const cIdx = PRESET_COLORS.findIndex(
      (p) => p.primary.toLowerCase() === (course.colorScheme?.primary || "").toLowerCase()
    );

    setFormData({
      id: course.id,
      name: course.name,
      nativeName: course.nativeName || "",
      flag: course.flag || "🎓",
      tagline: course.tagline || "",
      shortDesc: course.shortDesc || "",
      levelsSummary: course.levelsSummary || "",
      durationSummary: course.durationSummary || "",
      image: course.image || "/img/purpose.jpg",
      colorIndex: cIdx >= 0 ? cIdx : 0,
      levels: mappedLevels.length > 0 ? mappedLevels : [],
    });

    setIsModalOpen(true);
  };

  // Add Level
  const handleAddLevel = () => {
    const lvlIdx = formData.levels.length + 1;
    const baseId = formData.id || "course";
    const newLvlId = `${baseId}-lvl-${Date.now().toString(36)}`;
    const newBatchId = `${newLvlId}-b1`;

    setFormData((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          id: newLvlId,
          level: `Level ${lvlIdx}`,
          levelShort: `Level ${lvlIdx}`,
          proficiency: "Intermediate",
          duration: "6 Months",
          durationBadge: "6-Month Course",
          courseFee: 3000,
          platformFee: 100,
          securityDeposit: 0,
          hasSecurityDeposit: false,
          refundCondition: "Platform fee and admission registration fees are strictly non-refundable.",
          description: `Intermediate curriculum for Level ${lvlIdx} with comprehensive syllabus.`,
          objectivesText: "Advanced module training\nIndustry project practice\nCertification clearance",
          batches: [
            {
              id: newBatchId,
              name: `Level ${lvlIdx} Evening Batch`,
              days: "Tuesday, Thursday & Saturday",
              time: "6:00 PM – 7:30 PM",
              duration: "6 Months",
              intake: 30,
              badge: "Evening Batch",
            },
          ],
        },
      ],
    }));
  };

  // Remove Level
  const handleRemoveLevel = (lvlIndex: number) => {
    if (formData.levels.length <= 1) {
      toast.error("प्रत्येक कोर्समध्ये किमान एक स्तर (Level) असणे आवश्यक आहे.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.filter((_, idx) => idx !== lvlIndex),
    }));
  };

  // Add Batch to Level
  const handleAddBatch = (lvlIndex: number) => {
    const level = formData.levels[lvlIndex];
    const newBatchId = `${level.id}-b${Date.now().toString(36)}`;

    setFormData((prev) => {
      const updatedLevels = [...prev.levels];
      updatedLevels[lvlIndex] = {
        ...updatedLevels[lvlIndex],
        batches: [
          ...updatedLevels[lvlIndex].batches,
          {
            id: newBatchId,
            name: "Weekend Special Batch",
            days: "Saturday & Sunday",
            time: "10:00 AM – 1:00 PM",
            duration: level.duration,
            intake: 25,
            badge: "Weekend Batch",
          },
        ],
      };
      return { ...prev, levels: updatedLevels };
    });
  };

  // Remove Batch from Level
  const handleRemoveBatch = (lvlIndex: number, batchIndex: number) => {
    if (formData.levels[lvlIndex].batches.length <= 1) {
      toast.error("प्रत्येक स्तरासाठी किमान एक बॅच असणे आवश्यक आहे.");
      return;
    }
    setFormData((prev) => {
      const updatedLevels = [...prev.levels];
      updatedLevels[lvlIndex] = {
        ...updatedLevels[lvlIndex],
        batches: updatedLevels[lvlIndex].batches.filter((_, idx) => idx !== batchIndex),
      };
      return { ...prev, levels: updatedLevels };
    });
  };

  // Submit Save
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("कृपया कोर्सचे नाव प्रविष्ट करा.");
      return;
    }

    if (!formData.id.trim()) {
      toast.error("कृपया कोर्स ID प्रविष्ट करा.");
      return;
    }

    if (formData.levels.length === 0) {
      toast.error("कृपया किमान एक स्तर (Level) जोडा.");
      return;
    }

    const selectedColor = PRESET_COLORS[formData.colorIndex] || PRESET_COLORS[0];

    // Build LanguageCourse object
    const finalCourse: LanguageCourse = {
      id: formData.id.toLowerCase().trim().replace(/\s+/g, "-"),
      name: formData.name.trim(),
      flag: formData.flag.trim() || "🎓",
      nativeName: formData.nativeName.trim() || formData.name.trim(),
      tagline: formData.tagline.trim(),
      shortDesc: formData.shortDesc.trim() || formData.tagline.trim(),
      levelsSummary:
        formData.levelsSummary.trim() || formData.levels.map((l) => l.level).join(", "),
      durationSummary:
        formData.durationSummary.trim() || formData.levels[0]?.duration || "6 Months",
      image: formData.image || "/img/purpose.jpg",
      colorScheme: {
        primary: selectedColor.primary,
        light: selectedColor.light,
        border: selectedColor.border,
        text: selectedColor.text,
        accent: selectedColor.accent,
      },
      levels: formData.levels.map((lvl) => ({
        id: lvl.id.toLowerCase().trim().replace(/\s+/g, "-"),
        level: lvl.level.trim(),
        levelShort: lvl.levelShort.trim() || lvl.level.trim(),
        proficiency: lvl.proficiency || "Basic",
        duration: lvl.duration.trim(),
        durationBadge: lvl.durationBadge || "6-Month Course",
        courseFee: Number(lvl.courseFee) || 0,
        platformFee: Number(lvl.platformFee) || 100,
        securityDeposit: Number(lvl.securityDeposit) || 0,
        hasSecurityDeposit: Boolean(lvl.hasSecurityDeposit),
        refundCondition: lvl.refundCondition.trim(),
        description: lvl.description.trim(),
        objectives: lvl.objectivesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        intakeSummary: `${lvl.batches[0]?.intake || 30} Students per batch`,
        batches: lvl.batches.map((b) => ({
          id: b.id.toLowerCase().trim().replace(/\s+/g, "-"),
          name: b.name.trim(),
          days: b.days.trim(),
          time: b.time.trim(),
          duration: b.duration.trim() || lvl.duration.trim(),
          intake: Number(b.intake) || 30,
          intakeLabel: `${Number(b.intake) || 30} Students`,
          isLimitedSeats: true,
          badge: b.badge.trim() || b.name.trim(),
        })),
      })),
    };

    saveCustomCourse(finalCourse);
    setCourses(getStoredCourses());
    setIsModalOpen(false);

    toast.success(
      editingCourse
        ? `"${finalCourse.name}" कोर्स यशस्वीरीत्या अपडेट करण्यात आला!`
        : `नवीन कोर्स "${finalCourse.name}" यशस्वीरीत्या जोडला गेला!`
    );
  };

  // Delete Course
  const handleDeleteConfirm = () => {
    if (!deletingCourse) return;
    deleteCustomCourse(deletingCourse.id);
    setCourses(getStoredCourses());
    toast.success(`"${deletingCourse.name}" कोर्स यशस्वीरीत्या हटवण्यात आला.`);
    setDeletingCourse(null);
  };

  // Reset to default
  const handleResetConfirm = () => {
    resetCustomCourses();
    setCourses(getStoredCourses());
    setResetConfirmOpen(false);
    toast.success("सर्व कोर्सेस डीफॉल्ट स्थितीत पूर्ववत करण्यात आले आहेत.");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Metrics */}
      <div className="rounded-3xl bg-gradient-to-br from-[#24312d] via-[#2c3d38] to-[#1c2623] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#b5623b]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#f2c5a8] border border-white/10 mb-3">
              <Sparkles size={14} className="text-[#f2c5a8]" />
              <span>कोर्स व्यवस्थापन • Course Management System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              कोर्सेस, स्तर व बॅचेस व्यवस्थापन
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              येथून तुम्ही थेट नवीन कोर्स जोडू शकता, अस्तित्वातील कोर्सच्या फी व बॅचेस संपादित (Edit) करू शकता, किंवा नको असलेले कोर्सेस हटवू (Delete) शकता.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>नवीन कोर्स जोडा (Add New Course)</span>
            </button>

            <button
              onClick={() => setResetConfirmOpen(true)}
              title="Reset to default courses"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-stone-300 hover:bg-white/20 hover:text-white transition"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">डिफॉल्ट कोर्सेस पूर्ववत</span>
            </button>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">एकूण कोर्सेस (Active)</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">{courses.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">एकूण स्तर (Levels)</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#f2c5a8] mt-1">
              {courses.reduce((acc, c) => acc + (c.levels?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">सक्रिय बॅचेस (Batches)</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mt-1">
              {courses.reduce(
                (acc, c) => acc + c.levels.reduce((bAcc, lvl) => bAcc + (lvl.batches?.length || 0), 0),
                0
              )}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">प्रवेश पोर्टल (Admissions)</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-sky-400 mt-1">Live Online</p>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="कोर्स नाव, ID किंवा स्तर शोधा..."
            className="w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-4 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-[#b5623b] focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="text-xs text-stone-500 font-medium text-right">
          दाखवत आहे: <span className="font-bold text-stone-800">{filteredCourses.length}</span> पैकी{" "}
          <span className="font-bold text-stone-800">{courses.length}</span> कोर्सेस
        </div>
      </div>

      {/* Courses List Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCourses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          const totalBatches = course.levels.reduce((acc, lvl) => acc + (lvl.batches?.length || 0), 0);

          return (
            <div
              key={course.id}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              style={{
                borderLeftWidth: "6px",
                borderLeftColor: course.colorScheme?.primary || "#b5623b",
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs border border-stone-100"
                      style={{ backgroundColor: `${course.colorScheme?.primary || "#b5623b"}12` }}
                    >
                      {course.flag || "🎓"}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-serif font-bold text-stone-900">{course.name}</h3>
                        {course.nativeName && (
                          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600 border border-stone-200">
                            {course.nativeName}
                          </span>
                        )}
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-500">
                          id: {course.id}
                        </span>
                      </div>

                      <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
                        {course.tagline || course.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Top Action Buttons (Edit / Delete) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-700 transition active:scale-95 shadow-2xs"
                    >
                      <Pencil size={14} className="text-[#b5623b]" />
                      <span>संपादित करा (Edit)</span>
                    </button>

                    <button
                      onClick={() => setDeletingCourse(course)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3.5 py-2 text-xs font-bold text-red-700 transition active:scale-95 shadow-2xs"
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                      <span>हटवा (Delete)</span>
                    </button>
                  </div>
                </div>

                {/* Badges / Metrics Row */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    <Layers size={13} className="text-[#b5623b]" />
                    <span>{course.levels?.length || 0} स्तर (Levels)</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    <Clock size={13} className="text-[#b5623b]" />
                    <span>कालावधी: {course.durationSummary || "6 Months"}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    <Users size={13} className="text-emerald-600" />
                    <span>{totalBatches} बॅचेस उपलब्ध</span>
                  </div>

                  {course.levelsSummary && (
                    <div className="text-xs text-stone-500 font-medium hidden md:inline-block">
                      अभ्यासक्रम: {course.levelsSummary}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#b5623b] hover:underline"
                  >
                    <span>{isExpanded ? "तपशील लपवा (Hide Details)" : "स्तर व बॅचेस पहा (View Levels & Batches)"}</span>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Expandable Levels & Batches Section */}
              {isExpanded && (
                <div className="mt-6 pt-5 border-t border-stone-200/80 space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    या कोर्समधील स्तर (Levels) व बॅच वेळापत्रक:
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.levels.map((lvl) => (
                      <div
                        key={lvl.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-sm text-stone-900">{lvl.level}</span>
                            <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                              {lvl.duration}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 line-clamp-2 mb-3">{lvl.description}</p>

                          {/* Fee Breakdown */}
                          <div className="space-y-1 text-xs bg-white rounded-xl p-3 border border-stone-200/70 mb-3">
                            <div className="flex justify-between text-stone-600">
                              <span>कोर्स फी:</span>
                              <span className="font-bold text-stone-800">₹{lvl.courseFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                              <span>प्लॅटफॉर्म फी:</span>
                              <span className="text-stone-800">₹{lvl.platformFee || 100}</span>
                            </div>
                            {lvl.hasSecurityDeposit && (
                              <div className="flex justify-between text-amber-700 font-medium">
                                <span>सुरक्षा ठेव (Deposit):</span>
                                <span>₹{(lvl.securityDeposit || 0).toLocaleString()} (Refundable)</span>
                              </div>
                            )}
                          </div>

                          {/* Batches in this Level */}
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                              बॅचेस ({lvl.batches?.length || 0}):
                            </p>
                            <div className="space-y-1.5">
                              {lvl.batches.map((b) => (
                                <div
                                  key={b.id}
                                  className="text-xs bg-white rounded-lg p-2 border border-stone-200/60 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-semibold text-stone-800">{b.name}</p>
                                    <p className="text-[11px] text-stone-500">
                                      {b.days} • {b.time}
                                    </p>
                                  </div>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                    {b.intake || 30} जागा
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center bg-stone-50">
            <BookOpen size={40} className="mx-auto text-stone-400 mb-3" />
            <h3 className="font-serif font-bold text-lg text-stone-700">कोणताही कोर्स आढळला नाही</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              दिलेल्या शोध शब्दांशी जुळणारा कोर्स सापडला नाही. कृपया शोध शब्द बदला किंवा नवीन कोर्स जोडा.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus size={16} /> नवीन कोर्स जोडा
            </button>
          </div>
        )}
      </div>

      {/* ==================== ADD / EDIT COURSE MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#24312d] to-[#34463e] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl border border-white/15">
                  {formData.flag || "🎓"}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    {editingCourse ? "कोर्स संपादित करा (Edit Course)" : "नवीन कोर्स जोडा (Add New Course)"}
                  </h3>
                  <p className="text-xs text-stone-300">
                    कोर्सची सर्व माहिती, फी आणि बॅच वेळापत्रक काळजीपूर्वक भरा.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-stone-300 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Section 1: Basic Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-4 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b5623b]/10 text-xs font-bold">1</span>
                  प्राथमिक माहिती (Basic Course Details)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Course Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      कोर्सचे नाव (Course Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name,
                          id: editingCourse ? prev.id : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                        }));
                      }}
                      placeholder="उदा. Spanish Language, Python & AI Tech"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none focus:ring-1 focus:ring-[#b5623b]"
                    />
                  </div>

                  {/* Course ID */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      कोर्स ID / Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                      placeholder="उदा. spanish, python-ai"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs sm:text-sm font-mono focus:border-[#b5623b] focus:outline-none focus:ring-1 focus:ring-[#b5623b]"
                    />
                  </div>

                  {/* Native / Local Script */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      मराठी किंवा स्थानिक नाव (Native Script)
                    </label>
                    <input
                      type="text"
                      value={formData.nativeName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nativeName: e.target.value }))}
                      placeholder="उदा. Español, स्पॅनिश भाषा"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none focus:ring-1 focus:ring-[#b5623b]"
                    />
                  </div>

                  {/* Flag / Icon Emoji */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      चिन्ह / ध्वज इमोजी (Flag Emoji)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.flag}
                        onChange={(e) => setFormData((prev) => ({ ...prev, flag: e.target.value }))}
                        className="w-20 rounded-xl border border-stone-200 px-3 py-2 text-center text-lg focus:border-[#b5623b] focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1">
                        {QUICK_FLAGS.slice(0, 6).map((fl) => (
                          <button
                            type="button"
                            key={fl}
                            onClick={() => setFormData((prev) => ({ ...prev, flag: fl }))}
                            className="rounded-lg bg-stone-100 p-1.5 text-base hover:bg-stone-200 transition"
                          >
                            {fl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Duration Summary */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      कालावधी सारांश (Duration Summary)
                    </label>
                    <input
                      type="text"
                      value={formData.durationSummary}
                      onChange={(e) => setFormData((prev) => ({ ...prev, durationSummary: e.target.value }))}
                      placeholder="उदा. 3 – 6 Months"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none focus:ring-1 focus:ring-[#b5623b]"
                    />
                  </div>

                  {/* Tagline */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      टॅगलाईन (Tagline / Subtitle)
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                      placeholder="उदा. Master international DELE certified Spanish fluency and examination readiness"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none focus:ring-1 focus:ring-[#b5623b]"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      थोडक्यात माहिती (Short Description)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.shortDesc}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shortDesc: e.target.value }))}
                      placeholder="कोर्सच्या उद्दिष्टांबद्दल थोडक्यात माहिती..."
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs sm:text-sm focus:border-[#b5623b] focus:outline-none focus:ring-1 focus:ring-[#b5623b]"
                    />
                  </div>

                  {/* Color Theme Selector */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      रंग थीम (Theme Color)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((preset, idx) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, colorIndex: idx }))}
                          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                            formData.colorIndex === idx
                              ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                              : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Levels & Batches Builder */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b5623b]/10 text-xs font-bold">2</span>
                    स्तर व बॅचेस संरचना (Levels & Batches Builder)
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddLevel}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-xs font-bold text-stone-800 transition"
                  >
                    <Plus size={14} /> नवीन स्तर जोडा (Add Level)
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.levels.map((lvl, lvlIdx) => (
                    <div
                      key={lvlIdx}
                      className="rounded-2xl border-2 border-stone-200 bg-stone-50/50 p-5 space-y-4"
                    >
                      {/* Level Header */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#b5623b] text-white text-xs font-bold">
                            {lvlIdx + 1}
                          </span>
                          <span className="font-bold text-sm text-stone-900">
                            {lvl.level || `Level ${lvlIdx + 1}`}
                          </span>
                        </div>

                        {formData.levels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLevel(lvlIdx)}
                            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                          >
                            <Trash2 size={13} /> स्तर हटवा (Remove Level)
                          </button>
                        )}
                      </div>

                      {/* Level Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            स्तराचे नाव (Level Name) *
                          </label>
                          <input
                            type="text"
                            required
                            value={lvl.level}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const updated = [...prev.levels];
                                updated[lvlIdx].level = val;
                                updated[lvlIdx].levelShort = val;
                                return { ...prev, levels: updated };
                              });
                            }}
                            placeholder="उदा. A1, N5, Basic"
                            className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:border-[#b5623b] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            कालावधी (Duration)
                          </label>
                          <input
                            type="text"
                            value={lvl.duration}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const updated = [...prev.levels];
                                updated[lvlIdx].duration = val;
                                return { ...prev, levels: updated };
                              });
                            }}
                            placeholder="उदा. 3 Months, 6 Months"
                            className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:border-[#b5623b] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            कोर्स फी ₹ (Course Fee) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={lvl.courseFee}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setFormData((prev) => {
                                const updated = [...prev.levels];
                                updated[lvlIdx].courseFee = val;
                                return { ...prev, levels: updated };
                              });
                            }}
                            className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:border-[#b5623b] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            सुरक्षा ठेव ₹ (Security Deposit)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={lvl.securityDeposit}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setFormData((prev) => {
                                const updated = [...prev.levels];
                                updated[lvlIdx].securityDeposit = val;
                                updated[lvlIdx].hasSecurityDeposit = val > 0;
                                return { ...prev, levels: updated };
                              });
                            }}
                            className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:border-[#b5623b] focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-4">
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            स्तराची माहिती (Description)
                          </label>
                          <input
                            type="text"
                            value={lvl.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const updated = [...prev.levels];
                                updated[lvlIdx].description = val;
                                return { ...prev, levels: updated };
                              });
                            }}
                            placeholder="या स्तरामध्ये काय शिकवले जाईल..."
                            className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:border-[#b5623b] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Batches in this Level */}
                      <div className="pt-3 border-t border-stone-200/80">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            या स्तराच्या बॅचेस (Batches):
                          </p>
                          <button
                            type="button"
                            onClick={() => handleAddBatch(lvlIdx)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <Plus size={13} /> बॅच जोडा (+ Batch)
                          </button>
                        </div>

                        <div className="space-y-2">
                          {lvl.batches.map((batch, bIdx) => (
                            <div
                              key={bIdx}
                              className="rounded-xl border border-stone-200 bg-white p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                            >
                              <div>
                                <label className="block text-[10px] text-stone-500 font-bold mb-0.5">
                                  बॅच नाव
                                </label>
                                <input
                                  type="text"
                                  value={batch.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const updated = [...prev.levels];
                                      updated[lvlIdx].batches[bIdx].name = val;
                                      return { ...prev, levels: updated };
                                    });
                                  }}
                                  placeholder="उदा. Regular Morning"
                                  className="w-full rounded border border-stone-200 px-2 py-1 text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-stone-500 font-bold mb-0.5">
                                  वार (Days)
                                </label>
                                <input
                                  type="text"
                                  value={batch.days}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const updated = [...prev.levels];
                                      updated[lvlIdx].batches[bIdx].days = val;
                                      return { ...prev, levels: updated };
                                    });
                                  }}
                                  placeholder="उदा. Mon, Wed & Fri"
                                  className="w-full rounded border border-stone-200 px-2 py-1 text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-stone-500 font-bold mb-0.5">
                                  वेळ (Time)
                                </label>
                                <input
                                  type="text"
                                  value={batch.time}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const updated = [...prev.levels];
                                      updated[lvlIdx].batches[bIdx].time = val;
                                      return { ...prev, levels: updated };
                                    });
                                  }}
                                  placeholder="उदा. 10:00 AM – 11:30 AM"
                                  className="w-full rounded border border-stone-200 px-2 py-1 text-xs"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="block text-[10px] text-stone-500 font-bold mb-0.5">
                                    जागा (Seats)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={batch.intake}
                                    onChange={(e) => {
                                      const val = Number(e.target.value) || 30;
                                      setFormData((prev) => {
                                        const updated = [...prev.levels];
                                        updated[lvlIdx].batches[bIdx].intake = val;
                                        return { ...prev, levels: updated };
                                      });
                                    }}
                                    className="w-full rounded border border-stone-200 px-2 py-1 text-xs text-center"
                                  />
                                </div>

                                {lvl.batches.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBatch(lvlIdx, bIdx)}
                                    className="p-1.5 text-red-500 hover:text-red-700 mt-3"
                                    title="बॅच हटवा"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
                >
                  रद्द करा (Cancel)
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{editingCourse ? "कोर्स अपडेट करा (Update Course)" : "कोर्स सेव्ह करा (Save Course)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                हा कोर्स काढून टाकायचा आहे का?
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                तुम्ही खरोखर <strong className="text-stone-900">"{deletingCourse.name}"</strong> हा कोर्स वेबसाइट आणि ॲडमिशन पोर्टलवरून काढून टाकू इच्छिता? ही कृती पूर्ववत करता येणार नाही.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                रद्द करा (Cancel)
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition active:scale-95 shadow-sm"
              >
                होय, कोर्स हटवा (Delete Course)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== RESET CONFIRMATION MODAL ==================== */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <RotateCcw size={24} />
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                डिफॉल्ट कोर्सेस पूर्ववत करायचे आहेत का?
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                या कृतीमुळे तुम्ही जोडलेले सर्व कस्टम कोर्सेस निघून जातील आणि फाउंडेशनचे मूळ कोर्सेस (जपानी, जर्मन, इंग्रजी, फ्रेंच आणि टेस्ट कोर्स) पुनर्संचयित केले जातील.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                रद्द करा
              </button>

              <button
                type="button"
                onClick={handleResetConfirm}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition active:scale-95 shadow-sm"
              >
                होय, पूर्ववत करा (Reset)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
