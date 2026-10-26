import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  X,
  User,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Sparkles,
  RefreshCw,
  FileCheck,
  Shield,
  Layers,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDeletedAdmissions,
  getDeletedStudents,
  fetchCloudDeletedAdmissions,
  restoreAdmission,
  permanentDeleteAdmission,
  restoreStudent,
  permanentDeleteStudent,
  emptyTrash,
  DeletedAdmissionItem,
  DeletedStudentItem,
} from "@/lib/trash-service";
import { Admission, createAdmission } from "@/lib/supabase-admin";
import { StudentUser } from "@/types/student";

interface TrashManagerProps {
  onAdmissionRestored?: () => void;
  onStudentRestored?: () => void;
  onNavigateToAdmissions?: () => void;
  onNavigateToStudents?: () => void;
}

export default function TrashManager({
  onAdmissionRestored,
  onStudentRestored,
  onNavigateToAdmissions,
  onNavigateToStudents,
}: TrashManagerProps) {
  const [deletedAdmissions, setDeletedAdmissions] = useState<DeletedAdmissionItem[]>(() =>
    getDeletedAdmissions()
  );
  const [deletedStudents, setDeletedStudents] = useState<DeletedStudentItem[]>(() =>
    getDeletedStudents()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [permanentDeletingId, setPermanentDeletingId] = useState<string | null>(null);

  // Filter & Search states
  const [categoryFilter, setCategoryFilter] = useState<"all" | "admissions" | "students">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [viewingItem, setViewingItem] = useState<{
    type: "admission" | "student";
    item: DeletedAdmissionItem | DeletedStudentItem;
  } | null>(null);
  const [showManualRestoreModal, setShowManualRestoreModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; isImage: boolean } | null>(null);

  // Manual Re-Add / Quick Restore Form
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    education: "Undergraduate / Degree",
    college_name: "Parivattan Foreign Language School",
    address: "Pune, Maharashtra",
    program: "Japanese Language (N5) - N5 (Basic) – Morning Batch",
    batchPreference: "Morning Batch (10:00 AM – 11:30 AM)",
    amount: 4100,
    payment_id: "RESTORED_" + Date.now().toString().slice(-6),
    status: "completed" as const,
    prn: "",
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Load from local and cloud
  const refreshTrashData = async () => {
    setIsLoading(true);
    try {
      const cloudAdm = await fetchCloudDeletedAdmissions();
      setDeletedAdmissions(cloudAdm);
      setDeletedStudents(getDeletedStudents());
    } catch (err) {
      console.error("Error refreshing trash:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTrashData();

    const handleUpdate = () => {
      setDeletedAdmissions(getDeletedAdmissions());
      setDeletedStudents(getDeletedStudents());
    };

    window.addEventListener("parivattan-trash-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("parivattan-trash-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  // Restore admission handler
  const handleRestoreAdm = async (id: string, name?: string) => {
    try {
      setRestoringId(id);
      const restored = await restoreAdmission(id);
      if (restored) {
        setDeletedAdmissions(getDeletedAdmissions());
        toast.success(`Admission for "${restored.name || name}" restored successfully!`, {
          duration: 5000,
        });
        if (onAdmissionRestored) onAdmissionRestored();
        if (viewingItem?.item.id === id) setViewingItem(null);
      } else {
        toast.error("Could not restore admission record.");
      }
    } catch (err: any) {
      console.error("Error restoring admission:", err);
      toast.error(`Error: ${err?.message || "Failed to restore admission"}`);
    } finally {
      setRestoringId(null);
    }
  };

  // Restore student handler
  const handleRestoreStd = async (id: string, name?: string) => {
    try {
      setRestoringId(id);
      const restored = await restoreStudent(id);
      if (restored) {
        setDeletedStudents(getDeletedStudents());
        toast.success(`Student profile for "${restored.name || name}" restored successfully!`, {
          duration: 5000,
        });
        if (onStudentRestored) onStudentRestored();
        if (viewingItem?.item.id === id) setViewingItem(null);
      } else {
        toast.error("Could not restore student profile.");
      }
    } catch (err: any) {
      console.error("Error restoring student:", err);
      toast.error(`Error: ${err?.message || "Failed to restore student"}`);
    } finally {
      setRestoringId(null);
    }
  };

  // Permanent delete admission
  const handlePermanentDeleteAdm = async (id: string, name?: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete admission record for "${name || "this applicant"}"?\nThis action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setPermanentDeletingId(id);
      await permanentDeleteAdmission(id);
      setDeletedAdmissions(getDeletedAdmissions());
      toast.success("Admission permanently deleted.");
      if (viewingItem?.item.id === id) setViewingItem(null);
    } catch (err) {
      console.error("Error permanently deleting admission:", err);
      toast.error("Failed to delete permanently.");
    } finally {
      setPermanentDeletingId(null);
    }
  };

  // Permanent delete student
  const handlePermanentDeleteStd = async (id: string, name?: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete student profile for "${name || "this student"}"?\nThis cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setPermanentDeletingId(id);
      await permanentDeleteStudent(id);
      setDeletedStudents(getDeletedStudents());
      toast.success("Student profile permanently deleted.");
      if (viewingItem?.item.id === id) setViewingItem(null);
    } catch (err) {
      console.error("Error permanently deleting student:", err);
      toast.error("Failed to delete permanently.");
    } finally {
      setPermanentDeletingId(null);
    }
  };

  // Empty entire trash
  const handleEmptyTrashAll = async () => {
    const total = deletedAdmissions.length + deletedStudents.length;
    if (total === 0) {
      toast.info("Recycle Bin is already empty.");
      return;
    }
    if (
      !window.confirm(
        `Permanently erase all ${total} items from the Recycle Bin?\nThis cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await emptyTrash("all");
      setDeletedAdmissions([]);
      setDeletedStudents([]);
      toast.success("Recycle Bin emptied successfully!");
    } catch (err) {
      console.error("Error emptying trash:", err);
      toast.error("Failed to empty trash.");
    }
  };

  // Manual Restore / Re-Add submit handler
  const handleManualRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim() || !manualForm.email.trim() || !manualForm.phone.trim()) {
      toast.error("Please fill in Student Name, Email, and Phone Number.");
      return;
    }

    try {
      setIsSubmittingManual(true);
      const newId = `adm_rec_${Date.now()}`;
      const restored = await createAdmission({
        id: newId,
        name: manualForm.name.trim(),
        email: manualForm.email.trim().toLowerCase(),
        phone: manualForm.phone.trim(),
        gender: manualForm.gender,
        education: manualForm.education,
        college_name: manualForm.college_name,
        address: manualForm.address,
        program: manualForm.program,
        amount: Number(manualForm.amount) || 4100,
        payment_id: manualForm.payment_id.trim() || `OFFLINE_${Date.now()}`,
        status: "completed",
        created_at: new Date().toISOString(),
      });

      toast.success(`Admission for "${restored.name}" restored and added back successfully!`);
      setShowManualRestoreModal(false);
      if (onAdmissionRestored) onAdmissionRestored();
    } catch (err: any) {
      console.error("Error in manual restore:", err);
      toast.error(`Error: ${err?.message || "Failed to add back admission"}`);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Unified items list with filters
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const admItems = deletedAdmissions.map((d) => ({
      type: "admission" as const,
      id: d.id,
      name: d.admission.name || "Unknown Applicant",
      email: d.admission.email || "",
      phone: d.admission.phone || "",
      program: d.admission.program || "Course Admission",
      deletedAt: d.deletedAt,
      deletedBy: d.deletedBy || "Admin",
      reason: d.reason || "Deleted from Dashboard",
      rawAdmission: d.admission,
      rawItem: d,
    }));

    const stdItems = deletedStudents.map((d) => ({
      type: "student" as const,
      id: d.id,
      name: d.student.name || "Student User",
      email: d.student.email || "",
      phone: d.student.phone || "",
      prn: d.student.prn || "",
      program: "Registered Student (PRN Profile)",
      deletedAt: d.deletedAt,
      deletedBy: d.deletedBy || "Admin",
      reason: d.reason || "Deleted from Student Directory",
      rawStudent: d.student,
      rawItem: d,
    }));

    let merged: Array<(typeof admItems)[0] | (typeof stdItems)[0]> = [];

    if (categoryFilter === "all") {
      merged = [...admItems, ...stdItems];
    } else if (categoryFilter === "admissions") {
      merged = [...admItems];
    } else {
      merged = [...stdItems];
    }

    // Sort by deletedAt desc
    merged.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    if (!q) return merged;

    return merged.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchProgram = item.program.toLowerCase().includes(q);
      const matchPrn = "prn" in item && item.prn ? item.prn.toLowerCase().includes(q) : false;
      const matchId = item.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchProgram || matchPrn || matchId;
    });
  }, [deletedAdmissions, deletedStudents, categoryFilter, searchQuery]);

  const totalCount = deletedAdmissions.length + deletedStudents.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==================== 1. HERO HEADER BANNER ==================== */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Trash2 size={13} />
              <span>Recycle Bin & Data Recovery</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1b2b25]">
              Recycle Bin & Accidentally Deleted Admissions
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              Accidentally deleted admissions or student profiles can be restored here with 1-click recovery. All associated documents, PRNs, payment receipts, and details are safely preserved.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setShowManualRestoreModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1b2b25] hover:bg-[#253a32] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Manually re-add an admission or student if deleted earlier"
            >
              <Plus size={15} className="text-amber-400" />
              <span>+ Quick Re-Add Admission</span>
            </button>

            <button
              onClick={refreshTrashData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              title="Refresh deleted items from local storage and cloud database"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-[#b5623b]" : ""} />
              <span>Refresh</span>
            </button>

            {totalCount > 0 && (
              <button
                onClick={handleEmptyTrashAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                title="Permanently remove all items in trash"
              >
                <Trash2 size={14} />
                <span>Empty Recycle Bin</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5">
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total in Trash</p>
              <p className="text-2xl font-serif font-bold text-[#1b2b25] mt-0.5">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Trash2 size={20} />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-amber-50/40 p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Deleted Admissions</p>
              <p className="text-2xl font-serif font-bold text-amber-900 mt-0.5">{deletedAdmissions.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <GraduationCap size={20} />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-emerald-50/40 p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Deleted Student Profiles</p>
              <p className="text-2xl font-serif font-bold text-emerald-900 mt-0.5">{deletedStudents.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-2.5 text-stone-700">
          <Shield size={16} className="text-amber-700 shrink-0" />
          <p>
            <strong>Safe Recovery Guarantee:</strong> When you restore an admission or student profile, the record is immediately re-activated in the MongoDB Atlas and Supabase databases, and batch seat allocations are automatically updated.
          </p>
        </div>
      </div>

      {/* ==================== 2. FILTER & SEARCH BAR ==================== */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="inline-flex p-1 bg-stone-100 rounded-2xl gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              categoryFilter === "all"
                ? "bg-white text-[#1b2b25] shadow-xs"
                : "text-stone-600 hover:text-[#1b2b25]"
            }`}
          >
            All Records ({totalCount})
          </button>
          <button
            onClick={() => setCategoryFilter("admissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              categoryFilter === "admissions"
                ? "bg-white text-[#1b2b25] shadow-xs"
                : "text-stone-600 hover:text-[#1b2b25]"
            }`}
          >
            Admissions ({deletedAdmissions.length})
          </button>
          <button
            onClick={() => setCategoryFilter("students")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              categoryFilter === "students"
                ? "bg-white text-[#1b2b25] shadow-xs"
                : "text-stone-600 hover:text-[#1b2b25]"
            }`}
          >
            Student Profiles ({deletedStudents.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, PRN, or course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] transition bg-stone-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ==================== 3. DELETED RECORDS LIST ==================== */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-stone-200/80 bg-white p-12 text-center shadow-xs">
          <div className="h-16 w-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} />
          </div>
          <h4 className="text-lg font-serif font-bold text-[#1b2b25]">
            {searchQuery ? "No Matching Records Found" : "Recycle Bin is Empty"}
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1.5">
            {searchQuery
              ? `No deleted applications matched "${searchQuery}". Please try another search term.`
              : "Any deleted admission applications or registered student profiles will appear here for 1-click restoration."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setShowManualRestoreModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b2b25] hover:bg-[#253a32] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={15} className="text-amber-400" />
              <span>+ Quick Re-Add Admission</span>
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isAdm = item.type === "admission";
            const isRestoring = restoringId === item.id;
            const isDeleting = permanentDeletingId === item.id;

            // Extract document existence
            let hasPhoto = false;
            let hasIdProof = false;
            let hasEduProof = false;
            let hasCaste = false;

            if (isAdm && "rawAdmission" in item) {
              const a = item.rawAdmission;
              hasPhoto = Boolean(a.photo);
              hasIdProof = Boolean(a.identity_proof);
              hasEduProof = Boolean(a.education_proof);
              hasCaste = Boolean(a.caste_certificate);
            } else if (!isAdm && "rawStudent" in item) {
              const s = item.rawStudent;
              hasPhoto = Boolean(s.photo || s.avatar);
              hasIdProof = Boolean(s.identity_proof);
              hasEduProof = Boolean(s.education_proof);
              hasCaste = Boolean(s.caste_certificate);
            }

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-stone-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left Info Column */}
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-lg font-bold ${
                      isAdm ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isAdm ? <GraduationCap size={22} /> : <User size={22} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAdm
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {isAdm ? "Admission Record" : "Student User Profile"}
                      </span>

                      {"prn" in item && item.prn && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#1b2b25]">
                          PRN: {item.prn}
                        </span>
                      )}

                      <span className="text-[11px] text-stone-400 font-mono">ID: {item.id}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#1b2b25] flex items-center gap-2">
                      <span>{item.name}</span>
                    </h4>

                    {/* Program / Course Info */}
                    <p className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                      <Layers size={13} className="text-[#b5623b]" />
                      <span>{item.program}</span>
                    </p>

                    {/* Contact Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600">
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex items-center gap-1 hover:text-[#b5623b] transition"
                        >
                          <Phone size={12} className="text-stone-400" />
                          <span>{item.phone}</span>
                        </a>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1 hover:text-[#b5623b] transition"
                        >
                          <Mail size={12} className="text-stone-400" />
                          <span>{item.email}</span>
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                        <Clock size={12} />
                        <span>Deleted: {formatDate(item.deletedAt)}</span>
                      </span>
                    </div>

                    {/* Document Indicators */}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-600">Documents:</span>
                      {hasPhoto && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          Photo ✓
                        </span>
                      )}
                      {hasIdProof && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          ID Proof ✓
                        </span>
                      )}
                      {hasEduProof && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          Education Proof ✓
                        </span>
                      )}
                      {hasCaste && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          Caste Certificate ✓
                        </span>
                      )}
                      {!hasPhoto && !hasIdProof && !hasEduProof && !hasCaste && (
                        <span className="text-stone-400 italic">No files attached</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 self-end lg:self-center shrink-0">
                  {/* View Details Button */}
                  <button
                    onClick={() =>
                      setViewingItem({
                        type: isAdm ? "admission" : "student",
                        item: item.rawItem,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                    title="View complete deleted applicant details & documents"
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>

                  {/* RESTORE BUTTON */}
                  <button
                    disabled={isRestoring || isDeleting}
                    onClick={() => {
                      if (isAdm) {
                        handleRestoreAdm(item.id, item.name);
                      } else {
                        handleRestoreStd(item.id, item.name);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                    title="Restore this record back to active database and UI"
                  >
                    {isRestoring ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Restoring...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={14} />
                        <span>Restore</span>
                      </>
                    )}
                  </button>

                  {/* PERMANENT DELETE BUTTON */}
                  <button
                    disabled={isRestoring || isDeleting}
                    onClick={() => {
                      if (isAdm) {
                        handlePermanentDeleteAdm(item.id, item.name);
                      } else {
                        handlePermanentDeleteStd(item.id, item.name);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-stone-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition disabled:opacity-50 cursor-pointer"
                    title="Permanently remove from trash"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== 4. VIEW DETAILS MODAL ==================== */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="sticky top-0 flex justify-between items-center p-5 px-6 border-b border-stone-200 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold ${
                    viewingItem.type === "admission"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {viewingItem.type === "admission" ? <GraduationCap size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                    {viewingItem.type === "admission" ? "Deleted Admission Application Details" : "Deleted Student Profile"}
                  </h3>
                  <p className="text-[11px] font-mono text-stone-400">ID: {viewingItem.item.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Alert notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">This record is currently in the Recycle Bin.</p>
                  <p className="mt-0.5 text-stone-600">
                    Click the green <strong>'Restore Record'</strong> button below to immediately re-activate this applicant in the active database.
                  </p>
                </div>
              </div>

              {/* Admission Content */}
              {viewingItem.type === "admission" && "admission" in viewingItem.item && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                    <div>
                      <span className="text-stone-400 block font-semibold">Student Full Name</span>
                      <span className="text-sm font-bold text-[#1b2b25]">{viewingItem.item.admission.name}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Gender</span>
                      <span className="text-sm font-bold text-[#1b2b25]">{viewingItem.item.admission.gender || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Phone Number</span>
                      <span className="text-sm font-bold text-[#1b2b25]">{viewingItem.item.admission.phone}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Email Address</span>
                      <span className="text-sm font-bold text-[#1b2b25]">{viewingItem.item.admission.email}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Course / Program</span>
                      <span className="text-sm font-bold text-[#b5623b]">{viewingItem.item.admission.program}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Amount Paid</span>
                      <span className="text-sm font-bold text-emerald-700">₹{viewingItem.item.admission.amount || 4100}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Payment ID / Transaction</span>
                      <span className="text-xs font-mono font-bold text-stone-700">{viewingItem.item.admission.payment_id || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Education</span>
                      <span className="text-xs font-bold text-stone-700">{viewingItem.item.admission.education || "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-400 block font-semibold">College / School Name</span>
                      <span className="text-xs font-bold text-stone-700">{viewingItem.item.admission.college_name || "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-400 block font-semibold">Address</span>
                      <span className="text-xs text-stone-700">{viewingItem.item.admission.address || "N/A"}</span>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#1b2b25] mb-2">Attached Verification Documents</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {viewingItem.item.admission.photo ? (
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              title: "Student Photo",
                              url: viewingItem.item.admission.photo!,
                              isImage: true,
                            })
                          }
                          className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium text-stone-700">Student Photo</span>
                          <ExternalLink size={14} className="text-[#b5623b]" />
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl border border-dashed border-stone-200 text-stone-400 text-center">
                          No photo available
                        </div>
                      )}

                      {viewingItem.item.admission.identity_proof ? (
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              title: "Identity Proof",
                              url: viewingItem.item.admission.identity_proof!,
                              isImage: viewingItem.item.admission.identity_proof!.startsWith("data:image"),
                            })
                          }
                          className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium text-stone-700">Identity Proof</span>
                          <ExternalLink size={14} className="text-[#b5623b]" />
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl border border-dashed border-stone-200 text-stone-400 text-center">
                          No ID proof available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Student Content */}
              {viewingItem.type === "student" && "student" in viewingItem.item && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                    <div>
                      <span className="text-stone-400 block font-semibold">Student Name</span>
                      <span className="text-sm font-bold text-[#1b2b25]">{viewingItem.item.student.name}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">PRN Number</span>
                      <span className="text-sm font-mono font-bold text-[#b5623b]">{viewingItem.item.student.prn}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Email</span>
                      <span className="text-xs font-bold text-stone-700">{viewingItem.item.student.email}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Phone</span>
                      <span className="text-xs font-bold text-stone-700">{viewingItem.item.student.phone}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">City & State</span>
                      <span className="text-xs text-stone-700">{viewingItem.item.student.city}, {viewingItem.item.student.state}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-semibold">Registered At</span>
                      <span className="text-xs text-stone-700">{formatDate(viewingItem.item.student.registeredAt)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deletion metadata */}
              <div className="p-3.5 rounded-xl bg-stone-100 text-stone-600 text-xs flex justify-between items-center">
                <span>Deleted on: <strong>{formatDate(viewingItem.item.deletedAt)}</strong></span>
                <span>Deleted by: <strong>{viewingItem.item.deletedBy || "Admin"}</strong></span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 px-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between rounded-b-3xl">
              <button
                onClick={() => {
                  if (viewingItem.type === "admission") {
                    handlePermanentDeleteAdm(viewingItem.item.id);
                  } else {
                    handlePermanentDeleteStd(viewingItem.item.id);
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
              >
                Permanently Delete
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold transition hover:bg-stone-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (viewingItem.type === "admission") {
                      handleRestoreAdm(viewingItem.item.id);
                    } else {
                      handleRestoreStd(viewingItem.item.id);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Restore Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. QUICK MANUAL RE-ADD / RESTORE MODAL ==================== */}
      {showManualRestoreModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="sticky top-0 flex justify-between items-center p-5 px-6 border-b border-stone-200 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#1b2b25] text-amber-300 flex items-center justify-center font-bold">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                    Restore Admission Manually
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    If an applicant's record was wiped earlier, enter their details to immediately restore and register them.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualRestoreModal(false)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualRestoreSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="e.g. Rohan Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="student@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Course & Batch Schedule *
                </label>
                <select
                  value={manualForm.program}
                  onChange={(e) => setManualForm({ ...manualForm, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none bg-white"
                >
                  <option value="Japanese Language (N5) - N5 (Basic) – Morning Batch">
                    Japanese Language (N5) – Morning Batch (10:00 AM – 11:30 AM)
                  </option>
                  <option value="Japanese Language (N5) - N5 (Basic) – Evening Batch">
                    Japanese Language (N5) – Evening Batch (06:00 PM – 07:30 PM)
                  </option>
                  <option value="Japanese Language (N4) - N4 (Intermediate) – Regular Batch">
                    Japanese Language (N4) – Regular Batch (08:00 AM – 09:30 AM)
                  </option>
                  <option value="German Language (A1) - A1 (Beginner) – Regular Batch">
                    German Language (A1) – Regular Batch (04:00 PM – 05:30 PM)
                  </option>
                  <option value="French Language (A1) - A1 (Beginner) – Regular Batch">
                    French Language (A1) – Regular Batch
                  </option>
                  <option value="English Speaking & Personality Development">
                    English Speaking & Personality Development
                  </option>
                </select>
              </div>

              {/* Fee & Payment ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Course Fee (Amount ₹)</label>
                  <input
                    type="number"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Payment ID / Receipt</label>
                  <input
                    type="text"
                    value={manualForm.payment_id}
                    onChange={(e) => setManualForm({ ...manualForm, payment_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                  />
                </div>
              </div>

              {/* Education & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Education Background</label>
                  <input
                    type="text"
                    value={manualForm.education}
                    onChange={(e) => setManualForm({ ...manualForm, education: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City / State Address</label>
                  <input
                    type="text"
                    value={manualForm.address}
                    onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#b5623b]/20 focus:border-[#b5623b] outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualRestoreModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingManual ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving Admission...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm & Restore Admission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 6. DOCUMENT PREVIEW MODAL ==================== */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden border border-stone-200 flex flex-col">
            <div className="flex justify-between items-center p-4 px-6 border-b border-stone-200 bg-white">
              <h4 className="font-serif font-bold text-sm text-[#1b2b25]">{previewDoc.title}</h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-stone-50">
              {previewDoc.isImage ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[65vh] rounded-xl border border-stone-200"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
