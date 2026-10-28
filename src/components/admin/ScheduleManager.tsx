import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  Save,
  RotateCcw,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Layers,
  Eye,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  BatchScheduleItem,
  BatchGuidelineItem,
  ClassScheduleConfig,
  getStoredClassSchedule,
  saveClassSchedule,
  resetClassSchedule,
} from "@/data/classScheduleData";

export default function ScheduleManager() {
  const [config, setConfig] = useState<ClassScheduleConfig>(() =>
    getStoredClassSchedule()
  );
  const [activeTab, setActiveTab] = useState<"batches" | "guidelines" | "preview">("batches");

  // Modal / Form States
  const [editingBatch, setEditingBatch] = useState<BatchScheduleItem | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const [editingGuideline, setEditingGuideline] = useState<BatchGuidelineItem | null>(null);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);

  // Form states for Batch
  const [batchTitle, setBatchTitle] = useState("");
  const [batchType, setBatchType] = useState<BatchScheduleItem["batchType"]>("morning");
  const [batchHours, setBatchHours] = useState("");
  const [batchDays, setBatchDays] = useState("");
  const [batchVenue, setBatchVenue] = useState("");
  const [batchMeetingUrl, setBatchMeetingUrl] = useState("");
  const [batchInstructor, setBatchInstructor] = useState("");
  const [batchCourseTags, setBatchCourseTags] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchIsActive, setBatchIsActive] = useState(true);

  // Form states for Guideline
  const [guideTitle, setGuideTitle] = useState("");
  const [guideCategory, setGuideCategory] = useState<BatchGuidelineItem["category"]>("attendance");
  const [guideDescription, setGuideDescription] = useState("");
  const [guideIsImportant, setGuideIsImportant] = useState(false);

  // Open Batch Modal for create
  const handleOpenAddBatch = () => {
    setEditingBatch(null);
    setBatchTitle("");
    setBatchType("morning");
    setBatchHours("08:00 AM to 10:00 AM");
    setBatchDays("Monday to Friday");
    setBatchVenue("Campus Computer Lab 2 & Live Virtual Room");
    setBatchMeetingUrl("https://meet.google.com");
    setBatchInstructor("Faculty Directorate");
    setBatchCourseTags("Japanese (JLPT N5), German (A1)");
    setBatchNotes("Students must log in at least 10 minutes prior to session.");
    setBatchIsActive(true);
    setIsBatchModalOpen(true);
  };

  // Open Batch Modal for edit
  const handleOpenEditBatch = (batch: BatchScheduleItem) => {
    setEditingBatch(batch);
    setBatchTitle(batch.title);
    setBatchType(batch.batchType);
    setBatchHours(batch.hours);
    setBatchDays(batch.days);
    setBatchVenue(batch.venue);
    setBatchMeetingUrl(batch.meetingUrl || "");
    setBatchInstructor(batch.instructor || "");
    setBatchCourseTags(batch.courseTags ? batch.courseTags.join(", ") : "");
    setBatchNotes(batch.notes || "");
    setBatchIsActive(batch.isActive);
    setIsBatchModalOpen(true);
  };

  // Save Batch (Create or Update)
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTitle.trim() || !batchHours.trim() || !batchDays.trim() || !batchVenue.trim()) {
      toast.error("Please fill in Batch Title, Hours, Days, and Venue.");
      return;
    }

    const tagsArray = batchCourseTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedBatch: BatchScheduleItem = {
      id: editingBatch ? editingBatch.id : `batch-${Date.now()}`,
      title: batchTitle.trim(),
      batchType,
      hours: batchHours.trim(),
      days: batchDays.trim(),
      venue: batchVenue.trim(),
      meetingUrl: batchMeetingUrl.trim() || undefined,
      instructor: batchInstructor.trim() || undefined,
      courseTags: tagsArray,
      notes: batchNotes.trim() || undefined,
      isActive: batchIsActive,
    };

    let newBatches: BatchScheduleItem[];
    if (editingBatch) {
      newBatches = config.batches.map((b) => (b.id === editingBatch.id ? updatedBatch : b));
    } else {
      newBatches = [...config.batches, updatedBatch];
    }

    const newConfig = { ...config, batches: newBatches };
    setConfig(newConfig);
    saveClassSchedule(newConfig);
    setIsBatchModalOpen(false);
    toast.success(editingBatch ? "Batch details updated successfully!" : "New batch added successfully!");
  };

  // Delete Batch
  const handleDeleteBatch = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const newBatches = config.batches.filter((b) => b.id !== id);
      const newConfig = { ...config, batches: newBatches };
      setConfig(newConfig);
      saveClassSchedule(newConfig);
      toast.success(`"${title}" deleted.`);
    }
  };

  // Toggle Batch Active State
  const handleToggleBatchStatus = (id: string) => {
    const newBatches = config.batches.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    const newConfig = { ...config, batches: newBatches };
    setConfig(newConfig);
    saveClassSchedule(newConfig);
    toast.success("Batch status updated.");
  };

  // Open Guideline Modal for create
  const handleOpenAddGuideline = () => {
    setEditingGuideline(null);
    setGuideTitle("");
    setGuideCategory("attendance");
    setGuideDescription("");
    setGuideIsImportant(false);
    setIsGuidelineModalOpen(true);
  };

  // Open Guideline Modal for edit
  const handleOpenEditGuideline = (guide: BatchGuidelineItem) => {
    setEditingGuideline(guide);
    setGuideTitle(guide.title);
    setGuideCategory(guide.category);
    setGuideDescription(guide.description);
    setGuideIsImportant(Boolean(guide.isImportant));
    setIsGuidelineModalOpen(true);
  };

  // Save Guideline
  const handleSaveGuideline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideTitle.trim() || !guideDescription.trim()) {
      toast.error("Please enter Guideline Title and Description.");
      return;
    }

    const updatedGuideline: BatchGuidelineItem = {
      id: editingGuideline ? editingGuideline.id : `guide-${Date.now()}`,
      title: guideTitle.trim(),
      category: guideCategory,
      description: guideDescription.trim(),
      isImportant: guideIsImportant,
    };

    let newGuidelines: BatchGuidelineItem[];
    if (editingGuideline) {
      newGuidelines = config.guidelines.map((g) =>
        g.id === editingGuideline.id ? updatedGuideline : g
      );
    } else {
      newGuidelines = [...config.guidelines, updatedGuideline];
    }

    const newConfig = { ...config, guidelines: newGuidelines };
    setConfig(newConfig);
    saveClassSchedule(newConfig);
    setIsGuidelineModalOpen(false);
    toast.success(editingGuideline ? "Guideline updated!" : "New guideline added!");
  };

  // Delete Guideline
  const handleDeleteGuideline = (id: string, title: string) => {
    if (window.confirm(`Delete guideline "${title}"?`)) {
      const newGuidelines = config.guidelines.filter((g) => g.id !== id);
      const newConfig = { ...config, guidelines: newGuidelines };
      setConfig(newConfig);
      saveClassSchedule(newConfig);
      toast.success("Guideline removed.");
    }
  };

  // Session update
  const handleSessionChange = (newSession: string) => {
    const newConfig = { ...config, academicSession: newSession };
    setConfig(newConfig);
    saveClassSchedule(newConfig);
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all batch schedules and guidelines to initial default settings?"
      )
    ) {
      const reset = resetClassSchedule();
      setConfig(reset);
      toast.success("Class schedule & guidelines reset to initial default values.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock size={13} className="text-emerald-600" />
              <span>Academic Timetable Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-800">
              Class Schedule & Batch Guidelines Editor
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Configure class timings, physical campus lab venues, virtual Google Meet/Zoom classrooms, and mandatory student attendance guidelines. All updates immediately reflect in the Student Portal and website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Academic Session Input */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              <Calendar size={15} className="text-[#b5623b]" />
              <span>Session:</span>
              <input
                type="text"
                value={config.academicSession}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="w-24 px-2 py-0.5 rounded border border-slate-300 bg-white text-xs font-bold font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold text-slate-600 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reset to default schedules"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("batches")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "batches"
                ? "bg-[#1abc9c] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Clock size={14} />
            <span>Active Batches ({config.batches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guidelines")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "guidelines"
                ? "bg-[#1abc9c] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Academic Guidelines ({config.guidelines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#1abc9c] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Eye size={14} />
            <span>Student Portal Live Preview</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: BATCHES ================= */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Batch Timetables & Venues</h2>
              <p className="text-xs text-slate-500">
                Manage morning, evening, and weekend batches for Japanese, German, and Tech School programs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddBatch}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold shadow-md transition cursor-pointer self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Add New Batch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.batches.map((batch) => (
              <div
                key={batch.id}
                className={`rounded-2xl border p-5 bg-white shadow-xs transition-all relative flex flex-col justify-between ${
                  batch.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
                }`}
              >
                <div>
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        batch.batchType === "morning"
                          ? "bg-amber-100 text-amber-800"
                          : batch.batchType === "evening"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {batch.batchType}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleBatchStatus(batch.id)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                        batch.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {batch.isActive ? "✓ Active" : "Inactive"}
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-800">{batch.title}</h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Clock size={14} className="text-[#b5623b] shrink-0" />
                      <span>{batch.hours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span>{batch.days}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight text-slate-500">{batch.venue}</span>
                    </div>

                    {batch.meetingUrl && (
                      <div className="flex items-center gap-2 text-[11px] text-blue-600">
                        <Video size={13} className="shrink-0" />
                        <a
                          href={batch.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-[200px]"
                        >
                          {batch.meetingUrl}
                        </a>
                      </div>
                    )}

                    {batch.courseTags && batch.courseTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {batch.courseTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {batch.notes && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                        "{batch.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditBatch(batch)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    title="Edit Batch"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBatch(batch.id, batch.title)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                    title="Delete Batch"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GUIDELINES ================= */}
      {activeTab === "guidelines" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Academic Policies & Guidelines</h2>
              <p className="text-xs text-slate-500">
                Official rules shown to students regarding minimum attendance, virtual etiquette, and certificates.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddGuideline}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold shadow-md transition cursor-pointer self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Add Guideline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.guidelines.map((guide) => (
              <div
                key={guide.id}
                className={`rounded-2xl border p-5 bg-white shadow-xs flex flex-col justify-between ${
                  guide.isImportant
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {guide.category}
                    </span>
                    {guide.isImportant && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ★ Important Policy
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 mb-1">{guide.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{guide.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditGuideline(guide)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    title="Edit Guideline"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGuideline(guide.id, guide.title)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                    title="Delete Guideline"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PORTAL LIVE PREVIEW ================= */}
      {activeTab === "preview" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              Preview Mode
            </span>
            <h3 className="text-xl font-bold text-slate-800">
              Class Schedule & Batch Guidelines
            </h3>
            <p className="text-xs text-slate-500">
              Parivattan Mission Foundation Academic Session {config.academicSession} Class Timetable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {config.batches
              .filter((b) => b.isActive)
              .map((batch) => (
                <div key={batch.id} className="rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc] space-y-3">
                  <h4 className="font-bold text-sm text-[#b5623b] flex items-center gap-1.5">
                    <Clock size={16} /> {batch.title}
                  </h4>
                  <p className="text-[#525f59]">
                    <strong>Hours:</strong> {batch.hours} ({batch.days})
                  </p>
                  <p className="text-[#525f59]">
                    <strong>Venue:</strong> {batch.venue}
                  </p>
                  {batch.meetingUrl && (
                    <p className="text-[#525f59]">
                      <strong>Virtual Room:</strong>{" "}
                      <a
                        href={batch.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Join Live Classroom</span>
                        <ExternalLink size={12} />
                      </a>
                    </p>
                  )}
                  {batch.notes && <p className="text-[#65706a] text-[11px]">{batch.notes}</p>}
                </div>
              ))}
          </div>

          {config.guidelines.map((guide) => (
            <div
              key={guide.id}
              className={`rounded-2xl p-4 text-xs space-y-1 ${
                guide.isImportant
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : "bg-slate-50 border border-slate-200 text-slate-700"
              }`}
            >
              <h5 className="font-bold">✓ {guide.title}:</h5>
              <p className="text-[11px]">{guide.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BATCH ================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingBatch ? "Edit Batch Schedule" : "Add New Batch Schedule"}
              </h3>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Name / Title *</label>
                  <input
                    type="text"
                    required
                    value={batchTitle}
                    onChange={(e) => setBatchTitle(e.target.value)}
                    placeholder="e.g. Morning Batches (Japanese & German)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Category</label>
                  <select
                    value={batchType}
                    onChange={(e) => setBatchType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="weekend">Weekend</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hours / Timings *</label>
                  <input
                    type="text"
                    required
                    value={batchHours}
                    onChange={(e) => setBatchHours(e.target.value)}
                    placeholder="e.g. 08:00 AM to 10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Days *</label>
                  <input
                    type="text"
                    required
                    value={batchDays}
                    onChange={(e) => setBatchDays(e.target.value)}
                    placeholder="e.g. Monday to Friday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Venue & Room *</label>
                <input
                  type="text"
                  required
                  value={batchVenue}
                  onChange={(e) => setBatchVenue(e.target.value)}
                  placeholder="e.g. Campus Computer Lab 2 & Live Virtual Room"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Virtual Live Classroom URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={batchMeetingUrl}
                  onChange={(e) => setBatchMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructor / Faculty</label>
                  <input
                    type="text"
                    value={batchInstructor}
                    onChange={(e) => setBatchInstructor(e.target.value)}
                    placeholder="e.g. Prof. Patil / Sensei Kulkarni"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={batchCourseTags}
                    onChange={(e) => setBatchCourseTags(e.target.value)}
                    placeholder="Japanese N5, German A1, Python"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Notes for Students</label>
                <textarea
                  rows={2}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="e.g. Students must log in at least 10 minutes prior to session."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="batchIsActive"
                  checked={batchIsActive}
                  onChange={(e) => setBatchIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="batchIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Batch is currently active & visible to students
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>Save Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT GUIDELINE ================= */}
      {isGuidelineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingGuideline ? "Edit Academic Guideline" : "Add Academic Guideline"}
              </h3>
              <button
                type="button"
                onClick={() => setIsGuidelineModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGuideline} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guideline Title *</label>
                <input
                  type="text"
                  required
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  placeholder="e.g. Mandatory Attendance Policy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={guideCategory}
                  onChange={(e) => setGuideCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="attendance">Attendance</option>
                  <option value="discipline">Discipline & Etiquette</option>
                  <option value="materials">Materials & Study Notes</option>
                  <option value="recordings">Recordings & Handouts</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={guideDescription}
                  onChange={(e) => setGuideDescription(e.target.value)}
                  placeholder="e.g. A minimum of 75% attendance is required to qualify for certificates."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="guideIsImportant"
                  checked={guideIsImportant}
                  onChange={(e) => setGuideIsImportant(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="guideIsImportant" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as Important Policy (Highlighted in green box)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGuidelineModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>Save Guideline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

