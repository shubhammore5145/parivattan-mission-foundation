import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  X,
  Heart,
  Plus,
  PieChart,
  Download,
  BarChart3,
  MessageSquare,
  Mail,
  Eye,
  Reply,
  GraduationCap,
  Building2,
  MapPin,
  Camera,
  Award,
  FileText,
  ExternalLink,
  FileCheck,
  CheckCircle2,
  Users,
  Phone,
  Layers,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Copy,
  Check,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Activity,
  Globe,
  Sparkles,
  ChevronRight,
  User,
  Calendar,
  BookOpen,
} from "lucide-react";
import { StudentUser } from "@/types/student";
import {
  getAllRegisteredStudents,
  fetchRegisteredStudentsFromCloud,
  deleteRegisteredStudent,
} from "@/lib/student-auth";
import {
  getAllBatchesSeatsList,
  updateBatchSeatCapacity,
  toggleBatchManualFull,
  resetBatchEnrollment,
  BatchSeatsStatus,
  getStoredCourses,
  matchAdmissionToBatchId,
} from "@/data/languageCoursesData";
import {
  getAllDonations,
  getDonationsByStatus,
  searchDonations,
  updateDonationStatus,
  deleteDonation,
  getDonationStats,
  clearAdminAuth,
  getAdminAuth,
  Donation,
  createDonation,
  getAllContacts,
  updateContactStatus,
  deleteContact,
  Contact,
  getVisitorStats,
  VisitorStats,
  getAllAdmissions,
  deleteAdmission,
  updateAdmissionStatus,
  Admission,
  isRealCourseAdmission,
} from "@/lib/supabase-admin";
import { CountryFlagIcon } from "@/components/common/CountryFlagIcon";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseManager from "@/components/admin/CourseManager";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Active Tab: "admissions" | "students" | "courses" | "donations" | "contacts" | "visitors"
  const [activeTab, setActiveTab] = useState<
    "admissions" | "students" | "courses" | "donations" | "contacts" | "visitors"
  >("admissions");

  const [coursesCount, setCoursesCount] = useState<number>(() => getStoredCourses().length);

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [copiedPrn, setCopiedPrn] = useState<string | null>(null);

  // Donations State
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [donationSearchQuery, setDonationSearchQuery] = useState("");
  const [donationFilterStatus, setDonationFilterStatus] = useState<string>("all");
  const [stats, setStats] = useState({
    total_donations: 0,
    total_amount: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Donation>>({});
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [newDonationData, setNewDonationData] = useState({
    donor_name: "",
    donor_email: "",
    donor_phone: "",
    amount: 0,
    currency: "INR",
    payment_id: "",
    order_id: "",
    service_name: "",
    status: "completed" as const,
  });
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);

  // Contacts / Inquiries State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSearch, setContactsSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Students / Users Directory State
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsSearch, setStudentsSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Admissions State
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [admissionsSearch, setAdmissionsSearch] = useState("");
  const [admissionCourseFilter, setAdmissionCourseFilter] = useState<string>("all");
  const [admissionBatchFilter, setAdmissionBatchFilter] = useState<string>("all");
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState<string>("all");
  const [studentAdmissionFilter, setStudentAdmissionFilter] = useState<"all" | "enrolled" | "registered_only">("all");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [deletingAdmissionId, setDeletingAdmissionId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{
    title: string;
    url: string;
    isImage: boolean;
  } | null>(null);

  // Batch Seats State
  const [batchSeatsList, setBatchSeatsList] = useState<BatchSeatsStatus[]>([]);
  const [showBatchSeatsManager, setShowBatchSeatsManager] = useState(false);
  const [editingCapacityBatchId, setEditingCapacityBatchId] = useState<string | null>(null);
  const [customCapacityInput, setCustomCapacityInput] = useState<number>(30);

  // Visitors State
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });

  const FUNDRAISING_GOAL = 2500000; // 25 Lakhs Target

  // ==================== AUTH CHECK ====================
  useEffect(() => {
    if (!getAdminAuth()) {
      navigate("/", { replace: true });
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !getAdminAuth()) {
        navigate("/", { replace: true });
      }
    };

    const handlePopState = () => {
      if (!getAdminAuth()) {
        navigate("/", { replace: true });
      }
    };

    const authCheckInterval = setInterval(() => {
      if (!getAdminAuth()) {
        navigate("/", { replace: true });
      }
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      clearInterval(authCheckInterval);
    };
  }, [navigate]);

  // ==================== DATA INITIALIZATION ====================
  useEffect(() => {
    loadAllDashboardData();

    const handleBatchUpdate = () => loadBatchSeats();
    const handleCoursesUpdate = () => setCoursesCount(getStoredCourses().length);

    window.addEventListener("batch-seats-updated", handleBatchUpdate);
    window.addEventListener("courses-updated", handleCoursesUpdate);
    return () => {
      window.removeEventListener("batch-seats-updated", handleBatchUpdate);
      window.removeEventListener("courses-updated", handleCoursesUpdate);
    };
  }, []);

  const loadAllDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      loadDonationData(),
      loadVisitorData(),
      loadAdmissions(),
      loadStudents(),
      loadContacts(),
    ]);
    loadBatchSeats();
    setLoading(false);
  };

  const loadBatchSeats = () => {
    setBatchSeatsList(getAllBatchesSeatsList());
  };

  useEffect(() => {
    const handleSeatsUpdated = () => {
      setBatchSeatsList(getAllBatchesSeatsList());
    };
    window.addEventListener("batch-seats-updated", handleSeatsUpdated);
    window.addEventListener("storage", handleSeatsUpdated);
    return () => {
      window.removeEventListener("batch-seats-updated", handleSeatsUpdated);
      window.removeEventListener("storage", handleSeatsUpdated);
    };
  }, []);

  const loadDonationData = async () => {
    try {
      const [donationsData, statsData] = await Promise.all([
        getAllDonations(),
        getDonationStats(),
      ]);
      setDonations(donationsData);
      setFilteredDonations(donationsData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading donations:", err);
    }
  };

  const loadVisitorData = async () => {
    try {
      const vStats = await getVisitorStats();
      setVisitorStats(vStats);
    } catch (err) {
      console.error("Error loading visitor data:", err);
    }
  };

  const loadAdmissions = async () => {
    try {
      setAdmissionsLoading(true);
      const data = await getAllAdmissions();
      const realCourseAdmissions = data.filter(isRealCourseAdmission);
      setAdmissions(realCourseAdmissions);
    } catch (err) {
      console.error("Error loading admissions:", err);
    } finally {
      setAdmissionsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const localList = getAllRegisteredStudents();
      if (localList.length > 0) setStudents(localList);

      const cloudList = await fetchRegisteredStudentsFromCloud();
      setStudents(cloudList);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const data = await getAllContacts();
      setContacts(data);
    } catch (err) {
      console.error("Error loading contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  };

  // ==================== FILTERING & SEARCH ====================
  useEffect(() => {
    let result = donations;
    if (donationFilterStatus !== "all") {
      result = result.filter((d) => d.status === donationFilterStatus);
    }
    if (donationSearchQuery.trim()) {
      const q = donationSearchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.donor_name.toLowerCase().includes(q) ||
          d.donor_email.toLowerCase().includes(q) ||
          d.payment_id.toLowerCase().includes(q) ||
          (d.service_name && d.service_name.toLowerCase().includes(q))
      );
    }
    setFilteredDonations(result);
  }, [donations, donationSearchQuery, donationFilterStatus]);

  const getAdmissionBatchDetails = (adm: Admission) => {
    const bId = adm.batchId || adm.batch_id || matchAdmissionToBatchId(adm);
    const found = batchSeatsList.find((b) => b.batchId === bId);
    if (found) {
      return {
        batchId: found.batchId,
        courseId: found.courseId,
        courseName: found.courseName,
        flag: found.flag,
        levelName: found.levelName,
        batchName: found.batchName,
        days: found.days,
        time: found.time,
      };
    }
    return {
      batchId: bId || "general",
      courseId: "general",
      courseName: adm.program || "Language Course",
      flag: "🎓",
      levelName: "",
      batchName: "Regular Batch",
      days: "",
      time: "",
    };
  };

  const courseEnrollmentGroups = useMemo(() => {
    const map: Record<
      string,
      {
        courseId: string;
        courseName: string;
        flag: string;
        totalEnrolled: number;
        totalSeats: number;
        batches: BatchSeatsStatus[];
      }
    > = {};

    for (const b of batchSeatsList) {
      if (!map[b.courseId]) {
        map[b.courseId] = {
          courseId: b.courseId,
          courseName: b.courseName,
          flag: b.flag,
          totalEnrolled: 0,
          totalSeats: 0,
          batches: [],
        };
      }
      map[b.courseId].totalEnrolled += b.enrolled;
      map[b.courseId].totalSeats += b.totalSeats;
      map[b.courseId].batches.push(b);
    }

    return Object.values(map);
  }, [batchSeatsList]);

  const filteredAdmissions = admissions.filter((a) => {
    // Search query filter
    const matchesSearch =
      !admissionsSearch.trim() ||
      a.name?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.education?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.college_name?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.address?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.id?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.email?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.phone?.toLowerCase().includes(admissionsSearch.toLowerCase());

    const bDetails = getAdmissionBatchDetails(a);

    // Course filter
    const matchesCourse =
      admissionCourseFilter === "all" ||
      bDetails.courseId.toLowerCase() === admissionCourseFilter.toLowerCase() ||
      (a.program &&
        a.program.toLowerCase().includes(admissionCourseFilter.toLowerCase()));

    // Batch filter
    const matchesBatch =
      admissionBatchFilter === "all" || bDetails.batchId === admissionBatchFilter;

    // Status filter
    const matchesStatus =
      admissionStatusFilter === "all" || a.status === admissionStatusFilter;

    return matchesSearch && matchesCourse && matchesBatch && matchesStatus;
  });

  const filteredStudents = students.filter((s) => {
    const userAdmissions = admissions.filter(
      (a) =>
        (a.name && s.name && a.name.toLowerCase() === s.name.toLowerCase()) ||
        (a.email && s.email && a.email.toLowerCase() === s.email.toLowerCase()) ||
        (a.phone && s.phone && a.phone.includes(s.phone)) ||
        (a.message && s.prn && a.message.includes(s.prn))
    );

    if (studentAdmissionFilter === "enrolled" && userAdmissions.length === 0) {
      return false;
    }
    if (studentAdmissionFilter === "registered_only" && userAdmissions.length > 0) {
      return false;
    }

    if (!studentsSearch.trim()) return true;
    const q = studentsSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.prn?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    );
  });

  const filteredContacts = contacts.filter((c) => {
    if (!contactsSearch.trim()) return true;
    const q = contactsSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.message?.toLowerCase().includes(q)
    );
  });

  // ==================== ACTION HANDLERS ====================
  const handleCopyPrn = (prn: string) => {
    navigator.clipboard.writeText(prn);
    setCopiedPrn(prn);
    toast.success(`Copied PRN: ${prn}`);
    setTimeout(() => setCopiedPrn(null), 2000);
  };

  const handleAdmissionStatusUpdate = async (
    id: string,
    status: "completed" | "pending" | "failed"
  ) => {
    try {
      await updateAdmissionStatus(id, status);
      setAdmissions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      if (selectedAdmission && selectedAdmission.id === id) {
        setSelectedAdmission({ ...selectedAdmission, status });
      }
      toast.success("Application status updated!");
    } catch (err) {
      console.error("Error updating admission status:", err);
      toast.error("Could not update status.");
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admission record?"))
      return;
    try {
      setDeletingAdmissionId(id);
      await deleteAdmission(id);
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
      if (selectedAdmission && selectedAdmission.id === id) {
        setSelectedAdmission(null);
      }
      setBatchSeatsList(getAllBatchesSeatsList());
      toast.success("Admission deleted.");
    } catch (err) {
      console.error("Error deleting admission:", err);
      toast.error("Failed to delete admission.");
    } finally {
      setDeletingAdmissionId(null);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student user?"))
      return;
    try {
      setDeletingStudentId(id);
      await deleteRegisteredStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }
      toast.success("Student user deleted.");
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error("Failed to delete student.");
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleContactStatusUpdate = async (
    id: string,
    newStatus: "new" | "read" | "replied"
  ) => {
    try {
      await updateContactStatus(id, newStatus);
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating contact status:", err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact message?"))
      return;
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact(null);
      }
      toast.success("Contact deleted.");
    } catch (err) {
      console.error("Error deleting contact:", err);
      toast.error("Failed to delete contact.");
    }
  };

  const handleDonationStatusUpdate = async (
    id: string,
    newStatus: "pending" | "completed" | "failed"
  ) => {
    try {
      await updateDonationStatus(id, newStatus);
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
      );
      toast.success("Donation status updated.");
    } catch (err) {
      console.error("Error updating donation status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this donation record?"))
      return;
    try {
      await deleteDonation(id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
      toast.success("Donation record removed.");
    } catch (err) {
      console.error("Error deleting donation:", err);
      toast.error("Failed to delete donation.");
    }
  };

  const handleAddDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newDonationData.donor_name ||
      !newDonationData.donor_email ||
      newDonationData.amount <= 0 ||
      !newDonationData.payment_id
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmittingDonation(true);
      const created = await createDonation({
        donor_name: newDonationData.donor_name,
        donor_email: newDonationData.donor_email,
        donor_phone: newDonationData.donor_phone,
        amount: newDonationData.amount,
        currency: newDonationData.currency,
        payment_id: newDonationData.payment_id,
        order_id: newDonationData.order_id,
        service_name: newDonationData.service_name || undefined,
        status: newDonationData.status,
      });

      setDonations([created, ...donations]);
      setShowAddDonationModal(false);
      setNewDonationData({
        donor_name: "",
        donor_email: "",
        donor_phone: "",
        amount: 0,
        currency: "INR",
        payment_id: "",
        order_id: "",
        service_name: "",
        status: "completed",
      });
      toast.success("Donation added successfully!");
      const statsData = await getDonationStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error adding donation:", err);
      toast.error("Failed to add donation.");
    } finally {
      setSubmittingDonation(false);
    }
  };

  const handleUpdateDonation = async () => {
    if (!editingDonation) return;
    try {
      await updateDonationStatus(editingDonation.id, editFormData.status as any);
      setDonations(
        donations.map((d) =>
          d.id === editingDonation.id ? { ...d, ...editFormData } : d
        )
      );
      setEditingDonation(null);
      setEditFormData({});
      toast.success("Donation details updated.");
    } catch (err) {
      console.error("Error updating donation:", err);
      toast.error("Failed to update donation.");
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    navigate("/", { replace: true });
    window.location.reload();
  };

  // ==================== EXPORT UTILITIES ====================
  const exportAdmissionsToCsv = () => {
    const headers = [
      "Application ID",
      "Applicant Name",
      "Program",
      "Education",
      "College Name",
      "Address",
      "Fee Amount",
      "Status",
      "Submitted Date",
    ];
    const csvData = filteredAdmissions.map((a) => [
      a.id,
      `"${a.name || ""}"`,
      `"${a.program || ""}"`,
      `"${a.education || ""}"`,
      `"${a.college_name || ""}"`,
      `"${(a.address || "").replace(/\n/g, " ")}"`,
      a.amount || 100,
      a.status || "completed",
      a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "",
    ]);
    const csvContent = [headers.join(","), ...csvData.map((r) => r.join(","))].join(
      "\n"
    );
    downloadFile(
      csvContent,
      `admissions_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const exportStudentsToCsv = () => {
    const headers = [
      "Student PRN",
      "Full Name",
      "Email Address",
      "Phone Number",
      "City",
      "State",
      "Registered Date",
    ];
    const csvData = filteredStudents.map((s) => [
      s.prn,
      `"${s.name}"`,
      s.email,
      s.phone,
      `"${s.city || ""}"`,
      `"${s.state || ""}"`,
      s.registeredAt ? new Date(s.registeredAt).toLocaleDateString("en-IN") : "",
    ]);
    const csvContent = [headers.join(","), ...csvData.map((r) => r.join(","))].join(
      "\n"
    );
    downloadFile(
      csvContent,
      `registered_students_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const exportDonationsToCsv = () => {
    const headers = [
      "Donor Name",
      "Email",
      "Phone",
      "Amount (INR)",
      "Payment ID",
      "Order ID",
      "Purpose",
      "Status",
      "Date",
    ];
    const csvData = filteredDonations.map((d) => [
      `"${d.donor_name}"`,
      d.donor_email,
      d.donor_phone,
      d.amount,
      d.payment_id,
      d.order_id,
      `"${d.service_name || "General"}"`,
      d.status,
      new Date(d.created_at).toLocaleDateString("en-IN"),
    ]);
    const csvContent = [headers.join(","), ...csvData.map((r) => r.join(","))].join(
      "\n"
    );
    downloadFile(
      csvContent,
      `donations_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!getAdminAuth()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b5623b] mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const unreadContactsCount = contacts.filter((c) => c.status === "new").length;
  const progressPercent = Math.min(
    100,
    (stats.total_amount / FUNDRAISING_GOAL) * 100
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1b2b25] selection:bg-[#b5623b]/20">
      <Header />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ==================== 1. TOP APP BAR ==================== */}
          <div className="mt-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1b2b25] text-white flex items-center justify-center shadow-md shrink-0">
                <Shield size={28} className="text-[#fedb41]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                    Administrative Control Center
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Cloud Sync
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b2b25] mt-0.5">
                  Parivattan Foundation Admin
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage Admissions, Registered Students, Donations, and Website Inquiries.
                </p>
              </div>
            </div>

            {/* Quick Actions in Top Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href="/admissions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-[#1b2b25] transition shadow-xs"
              >
                <span>Live Admission Form</span>
                <ExternalLink size={13} />
              </a>

              <button
                onClick={() => setShowAddDonationModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#b5623b] hover:bg-[#984f2d] text-white text-xs font-bold transition shadow-sm"
              >
                <Plus size={15} />
                <span>Add Donation</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                title="Sign out of Admin Dashboard"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* ==================== 2. EXECUTIVE KPI CARDS RIBBON ==================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 mb-8">
            {/* Admissions KPI */}
            <button
              onClick={() => setActiveTab("admissions")}
              className={`rounded-2xl p-4 sm:p-5 text-left transition-all border ${
                activeTab === "admissions"
                  ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-md ring-2 ring-[#1b2b25]/20"
                  : "bg-white text-[#1b2b25] border-stone-200/80 hover:border-[#b5623b] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    activeTab === "admissions"
                      ? "bg-white/10 text-amber-300"
                      : "bg-amber-50 text-[#b5623b]"
                  }`}
                >
                  <GraduationCap size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "admissions"
                      ? "bg-white/15 text-stone-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  Admissions
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold">
                {admissions.length}
              </div>
              <div
                className={`text-[11px] mt-1 font-medium ${
                  activeTab === "admissions" ? "text-stone-300" : "text-stone-500"
                }`}
              >
                {admissions.filter((a) => a.status === "completed").length} Verified Applications
              </div>
            </button>

            {/* Students Directory KPI */}
            <button
              onClick={() => setActiveTab("students")}
              className={`rounded-2xl p-4 sm:p-5 text-left transition-all border ${
                activeTab === "students"
                  ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-md ring-2 ring-[#1b2b25]/20"
                  : "bg-white text-[#1b2b25] border-stone-200/80 hover:border-emerald-600 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    activeTab === "students"
                      ? "bg-white/10 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Users size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "students"
                      ? "bg-white/15 text-stone-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  PRN Users
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold">
                {students.length}
              </div>
              <div
                className={`text-[11px] mt-1 font-medium ${
                  activeTab === "students" ? "text-stone-300" : "text-stone-500"
                }`}
              >
                Registered Student Accounts
              </div>
            </button>

            {/* Courses Management KPI */}
            <button
              onClick={() => setActiveTab("courses")}
              className={`rounded-2xl p-4 sm:p-5 text-left transition-all border ${
                activeTab === "courses"
                  ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-md ring-2 ring-[#1b2b25]/20"
                  : "bg-white text-[#1b2b25] border-stone-200/80 hover:border-[#b5623b] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    activeTab === "courses"
                      ? "bg-white/10 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <BookOpen size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "courses"
                      ? "bg-white/15 text-stone-200"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  Manage
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold">
                {coursesCount}
              </div>
              <div
                className={`text-[11px] mt-1 font-medium ${
                  activeTab === "courses" ? "text-stone-300" : "text-stone-500"
                }`}
              >
                Courses, Levels & Batches
              </div>
            </button>

            {/* Donations KPI */}
            <button
              onClick={() => setActiveTab("donations")}
              className={`rounded-2xl p-4 sm:p-5 text-left transition-all border ${
                activeTab === "donations"
                  ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-md ring-2 ring-[#1b2b25]/20"
                  : "bg-white text-[#1b2b25] border-stone-200/80 hover:border-[#b5623b] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    activeTab === "donations"
                      ? "bg-white/10 text-amber-300"
                      : "bg-orange-50 text-[#b5623b]"
                  }`}
                >
                  <Heart size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "donations"
                      ? "bg-white/15 text-stone-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  Raised
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold truncate">
                ₹{stats.total_amount.toLocaleString("en-IN")}
              </div>
              <div
                className={`text-[11px] mt-1 font-medium ${
                  activeTab === "donations" ? "text-stone-300" : "text-stone-500"
                }`}
              >
                {stats.completed} Completed Donations
              </div>
            </button>

            {/* Inquiries KPI */}
            <button
              onClick={() => setActiveTab("contacts")}
              className={`rounded-2xl p-4 sm:p-5 text-left transition-all border ${
                activeTab === "contacts"
                  ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-md ring-2 ring-[#1b2b25]/20"
                  : "bg-white text-[#1b2b25] border-stone-200/80 hover:border-blue-600 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    activeTab === "contacts"
                      ? "bg-white/10 text-blue-300"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <MessageSquare size={18} />
                </div>
                {unreadContactsCount > 0 ? (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {unreadContactsCount} New
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === "contacts"
                        ? "bg-white/15 text-stone-200"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    Messages
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold">
                {contacts.length}
              </div>
              <div
                className={`text-[11px] mt-1 font-medium ${
                  activeTab === "contacts" ? "text-stone-300" : "text-stone-500"
                }`}
              >
                Inquiries & Feedback
              </div>
            </button>

            {/* Live Visitors KPI */}
            <button
              onClick={() => setActiveTab("visitors")}
              className={`col-span-2 lg:col-span-1 rounded-2xl p-4 sm:p-5 text-left transition-all border ${
                activeTab === "visitors"
                  ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-md ring-2 ring-[#1b2b25]/20"
                  : "bg-white text-[#1b2b25] border-stone-200/80 hover:border-teal-600 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    activeTab === "visitors"
                      ? "bg-white/10 text-teal-300"
                      : "bg-teal-50 text-teal-700"
                  }`}
                >
                  <Activity size={18} />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold">
                {visitorStats.today}
              </div>
              <div
                className={`text-[11px] mt-1 font-medium ${
                  activeTab === "visitors" ? "text-stone-300" : "text-stone-500"
                }`}
              >
                Today ({visitorStats.total} All-Time)
              </div>
            </button>
          </div>

          {/* ==================== 3. MODERN SEGMENTED TAB NAVIGATION ==================== */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4 border-b border-stone-200 pb-3">
            <div className="inline-flex p-1.5 bg-stone-200/60 rounded-2xl gap-1 overflow-x-auto max-w-full scrollbar-none">
              {/* Tab 1 */}
              <button
                onClick={() => setActiveTab("admissions")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === "admissions"
                    ? "bg-white text-[#1b2b25] shadow-sm font-extrabold"
                    : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
                }`}
              >
                <GraduationCap size={15} />
                <span>Admissions</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[11px] text-stone-700 font-mono">
                  {admissions.length}
                </span>
              </button>

              {/* Tab 2 */}
              <button
                onClick={() => setActiveTab("students")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === "students"
                    ? "bg-white text-[#1b2b25] shadow-sm font-extrabold"
                    : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
                }`}
              >
                <Users size={15} />
                <span>Students Directory</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[11px] text-stone-700 font-mono">
                  {students.length}
                </span>
              </button>

              {/* Tab Courses */}
              <button
                onClick={() => setActiveTab("courses")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === "courses"
                    ? "bg-white text-[#1b2b25] shadow-sm font-extrabold"
                    : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
                }`}
              >
                <BookOpen size={15} />
                <span>Courses & Batches</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[11px] text-emerald-800 font-mono font-bold">
                  {coursesCount}
                </span>
              </button>

              {/* Tab 3 */}
              <button
                onClick={() => setActiveTab("donations")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === "donations"
                    ? "bg-white text-[#1b2b25] shadow-sm font-extrabold"
                    : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
                }`}
              >
                <Heart size={15} />
                <span>Donations</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[11px] text-stone-700 font-mono">
                  {donations.length}
                </span>
              </button>

              {/* Tab 4 */}
              <button
                onClick={() => setActiveTab("contacts")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === "contacts"
                    ? "bg-white text-[#1b2b25] shadow-sm font-extrabold"
                    : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
                }`}
              >
                <MessageSquare size={15} />
                <span>Inquiries</span>
                {unreadContactsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[11px] text-white font-mono">
                    {unreadContactsCount}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[11px] text-stone-700 font-mono">
                    {contacts.length}
                  </span>
                )}
              </button>

              {/* Tab 5 */}
              <button
                onClick={() => setActiveTab("visitors")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === "visitors"
                    ? "bg-white text-[#1b2b25] shadow-sm font-extrabold"
                    : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
                }`}
              >
                <Activity size={15} />
                <span>Visitor Traffic</span>
              </button>
            </div>

            {/* Quick Refresh All Data */}
            <button
              onClick={loadAllDashboardData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-[#1b2b25] hover:bg-stone-200/50 transition"
              title="Refresh all data"
            >
              <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* ==================== 4. TAB CONTENTS ==================== */}

          {/* ==================== TAB A: ADMISSIONS ==================== */}
          {activeTab === "admissions" && (
            <div className="space-y-6">
              {/* Informational Separation Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <Shield className="text-[#b5623b] shrink-0 mt-0.5 sm:mt-0" size={18} />
                  <p className="text-stone-700">
                    <strong>Verified Course Admissions:</strong> This table displays only students who have completed payment and enrolled in a course. Users who only registered a student account (Student PRN Account Registration) can be viewed under the <strong>'Students Directory'</strong> tab.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("students")}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-[#1b2b25] font-bold shrink-0 hover:bg-stone-50 transition shadow-2xs self-start sm:self-auto"
                >
                  View Students Directory →
                </button>
              </div>

              {/* ==================== COURSE & BATCH ENROLLMENT MATRIX ==================== */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#1b2b25] text-[#fedb41] flex items-center justify-center shrink-0 shadow-xs">
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                          Course & Batch Live Enrollment Matrix
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Live Sync
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Real-time breakdown of students enrolled in each course and batch. Click any batch card to filter the admissions table below.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(admissionBatchFilter !== "all" || admissionCourseFilter !== "all") && (
                      <button
                        onClick={() => {
                          setAdmissionBatchFilter("all");
                          setAdmissionCourseFilter("all");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shrink-0"
                      >
                        <X size={13} />
                        <span>Clear Filter (Show All)</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowBatchSeatsManager(!showBatchSeatsManager)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-[#1b2b25] transition shadow-2xs shrink-0"
                    >
                      <SlidersHorizontal size={13} />
                      <span>{showBatchSeatsManager ? "Hide Seat Settings" : "Batch Seat Settings"}</span>
                    </button>
                  </div>
                </div>

                {/* Grid of Courses and their Batches */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
                  {courseEnrollmentGroups.map((grp) => {
                    const isCourseActive =
                      admissionCourseFilter.toLowerCase() === grp.courseId.toLowerCase();
                    return (
                      <div
                        key={grp.courseId}
                        className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                          isCourseActive
                            ? "border-[#b5623b] bg-amber-500/5 ring-1 ring-[#b5623b]/30 shadow-xs"
                            : "border-stone-200 bg-stone-50/40 hover:border-stone-300"
                        }`}
                      >
                        <div>
                          {/* Course Header */}
                          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-200/70">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl shrink-0">{grp.flag}</span>
                              <div>
                                <h4 className="font-bold text-sm text-[#1b2b25]">
                                  {grp.courseName}
                                </h4>
                                <span className="text-[11px] text-stone-500">
                                  {grp.batches.length} {grp.batches.length === 1 ? "Batch" : "Batches"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-serif font-bold text-[#b5623b]">
                                {grp.totalEnrolled}{" "}
                                <span className="text-xs font-normal text-stone-500">
                                  / {grp.totalSeats}
                                </span>
                              </div>
                              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Total Enrolled
                              </span>
                            </div>
                          </div>

                          {/* Batches in this Course */}
                          <div className="space-y-2 mt-3">
                            {grp.batches.map((b) => {
                              const isBatchSelected = admissionBatchFilter === b.batchId;
                              const pct = Math.min(
                                100,
                                Math.round((b.enrolled / b.totalSeats) * 100)
                              );

                              return (
                                <button
                                  key={b.batchId}
                                  type="button"
                                  onClick={() => {
                                    if (admissionBatchFilter === b.batchId) {
                                      setAdmissionBatchFilter("all");
                                    } else {
                                      setAdmissionBatchFilter(b.batchId);
                                      setAdmissionCourseFilter("all");
                                    }
                                  }}
                                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                                    isBatchSelected
                                      ? "bg-[#1b2b25] text-white border-[#1b2b25] shadow-sm ring-2 ring-[#1b2b25]/20"
                                      : "bg-white border-stone-200 hover:border-[#b5623b] text-[#1b2b25] shadow-2xs"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-xs truncate">
                                      {b.batchName}
                                    </span>
                                    <span
                                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                        isBatchSelected
                                          ? "bg-white/20 text-white"
                                          : b.isFull
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-amber-100 text-[#b5623b]"
                                      }`}
                                    >
                                      {b.enrolled} / {b.totalSeats} Students
                                    </span>
                                  </div>
                                  <div
                                    className={`text-[10px] mt-0.5 truncate ${
                                      isBatchSelected ? "text-stone-300" : "text-stone-500"
                                    }`}
                                  >
                                    {b.days} • {b.time}
                                  </div>

                                  {/* Progress bar */}
                                  <div className="mt-2 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isBatchSelected
                                          ? "bg-[#fedb41]"
                                          : pct >= 100
                                          ? "bg-rose-500"
                                          : pct >= 75
                                          ? "bg-amber-500"
                                          : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>

                                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                                    <span
                                      className={
                                        isBatchSelected ? "text-stone-300" : "text-stone-400"
                                      }
                                    >
                                      {b.isFull ? "Admission Full" : `${b.remainingSeats} Seats Available`}
                                    </span>
                                    <span
                                      className={`font-bold flex items-center gap-0.5 ${
                                        isBatchSelected ? "text-[#fedb41]" : "text-[#b5623b]"
                                      }`}
                                    >
                                      {isBatchSelected ? "Selected ✓" : "View Students →"}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Batch Seats Cards (Collapsible Seat Controller) */}
              {showBatchSeatsManager && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-stone-100/60 rounded-3xl border border-stone-200 animate-in fade-in duration-200">
                  {batchSeatsList.map((b) => {
                    const isEditing = editingCapacityBatchId === b.batchId;
                    const pct = Math.min(100, Math.round((b.enrolled / b.totalSeats) * 100));

                    return (
                      <div
                        key={b.batchId}
                        className={`rounded-2xl border p-4 bg-white transition flex flex-col justify-between shadow-xs ${
                          b.isFull ? "border-rose-300 ring-1 ring-rose-300/40" : "border-stone-200"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b5623b]">
                              {b.flag} {b.courseName} • {b.levelName}
                            </span>
                            {b.isFull ? (
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                FULL (Closed)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                {b.remainingSeats} Seats Left
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-[#1b2b25]">{b.batchName}</h4>
                          <p className="text-xs text-stone-500 mt-0.5">{b.days} • {b.time}</p>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                              <span>Enrolled: <strong>{b.enrolled}</strong></span>
                              <span>Total: <strong>{b.totalSeats}</strong> ({pct}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pct >= 100 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <input
                                type="number"
                                min={1}
                                max={200}
                                value={customCapacityInput}
                                onChange={(e) => setCustomCapacityInput(parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 text-xs border border-stone-300 rounded-lg font-bold"
                              />
                              <button
                                onClick={() => {
                                  updateBatchSeatCapacity(b.batchId, customCapacityInput);
                                  setEditingCapacityBatchId(null);
                                  loadBatchSeats();
                                  toast.success(`Capacity set to ${customCapacityInput}`);
                                }}
                                className="px-2.5 py-1 bg-[#b5623b] text-white rounded-lg font-bold text-[11px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingCapacityBatchId(null)}
                                className="px-2 py-1 bg-stone-100 text-stone-600 rounded-lg text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCapacityBatchId(b.batchId);
                                  setCustomCapacityInput(b.totalSeats);
                                }}
                                className="text-stone-600 hover:text-[#b5623b] font-semibold text-[11px] flex items-center gap-1"
                              >
                                <Edit2 size={12} /> Set Capacity
                              </button>
                              <button
                                onClick={() => {
                                  toggleBatchManualFull(b.batchId);
                                  loadBatchSeats();
                                  toast.success("Batch status toggled");
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition ${
                                  b.isFull
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                                }`}
                              >
                                {b.isFull ? "Reopen Seats" : "Mark Full"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Admissions Table Card */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-6">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="text"
                      placeholder="Search applicant name, PRN, education, college..."
                      value={admissionsSearch}
                      onChange={(e) => setAdmissionsSearch(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition focus:border-[#b5623b] focus:bg-white"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Course Filter Pills */}
                    <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs gap-1">
                      {["all", "japanese", "german", "french", "english"].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setAdmissionCourseFilter(c);
                            if (c !== "all") setAdmissionBatchFilter("all");
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                            admissionCourseFilter === c
                              ? "bg-white text-[#1b2b25] shadow-xs"
                              : "text-stone-600 hover:text-[#1b2b25]"
                          }`}
                        >
                          {c === "all" ? "All Courses" : c}
                        </button>
                      ))}
                    </div>

                    {/* Batch Filter Dropdown */}
                    <select
                      value={admissionBatchFilter}
                      onChange={(e) => {
                        setAdmissionBatchFilter(e.target.value);
                        if (e.target.value !== "all") setAdmissionCourseFilter("all");
                      }}
                      className="px-3 py-2 border border-stone-200 bg-stone-50 rounded-xl text-xs font-semibold outline-none max-w-[210px] truncate"
                    >
                      <option value="all">All Batches</option>
                      {batchSeatsList.map((b) => (
                        <option key={b.batchId} value={b.batchId}>
                          {b.flag} {b.courseName} - {b.batchName} ({b.enrolled} students)
                        </option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={admissionStatusFilter}
                      onChange={(e) => setAdmissionStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-stone-200 bg-stone-50 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed / Verified</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Rejected</option>
                    </select>

                    {/* Clear Filters Button */}
                    {(admissionBatchFilter !== "all" ||
                      admissionCourseFilter !== "all" ||
                      admissionStatusFilter !== "all" ||
                      admissionsSearch.trim()) && (
                      <button
                        onClick={() => {
                          setAdmissionBatchFilter("all");
                          setAdmissionCourseFilter("all");
                          setAdmissionStatusFilter("all");
                          setAdmissionsSearch("");
                        }}
                        className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                        title="Reset all filters"
                      >
                        Reset
                      </button>
                    )}

                    {/* Export CSV */}
                    <button
                      onClick={exportAdmissionsToCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                      title="Download admissions CSV spreadsheet"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                {admissionsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b5623b]" />
                  </div>
                ) : filteredAdmissions.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
                    <GraduationCap size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm font-semibold text-stone-600">
                      No admission applications found.
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Try resetting your search query or filters.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-stone-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5">Applicant Profile</th>
                          <th className="px-4 py-3.5">Course / Batch</th>
                          <th className="px-4 py-3.5">Education & College</th>
                          <th className="px-4 py-3.5">Documents Attached</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5">Submitted Date</th>
                          <th className="px-4 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredAdmissions.map((adm) => (
                          <tr key={adm.id} className="hover:bg-stone-50/80 transition">
                            {/* Applicant Profile */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {adm.photo ? (
                                  <img
                                    src={adm.photo}
                                    alt={adm.name}
                                    onClick={() =>
                                      setViewingDoc({
                                        title: `${adm.name} - Photo`,
                                        url: adm.photo!,
                                        isImage: true,
                                      })
                                    }
                                    className="h-10 w-10 rounded-full object-cover border border-stone-200 shadow-xs cursor-pointer hover:scale-105 transition shrink-0"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center shrink-0 border border-stone-200">
                                    {adm.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-[#1b2b25] text-sm truncate">
                                    {adm.name}
                                  </div>
                                  <div className="font-mono text-[10px] text-stone-400 truncate">
                                    ID: {adm.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Course / Program & Batch */}
                            <td className="px-4 py-3.5">
                              {(() => {
                                const bDetails = getAdmissionBatchDetails(adm);
                                return (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <CountryFlagIcon
                                        courseId={bDetails.courseId}
                                        size="sm"
                                      />
                                      <span className="font-bold text-[#1b2b25] block truncate max-w-[170px]">
                                        {bDetails.courseName}
                                      </span>
                                    </div>
                                    <div className="inline-flex items-center gap-1 bg-amber-50 text-[#b5623b] border border-amber-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                      <span>{bDetails.batchName}</span>
                                      {bDetails.time && (
                                        <span className="text-stone-500 font-normal">
                                          ({bDetails.time})
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                      <CheckCircle2 size={11} />
                                      <span>Fee Paid: ₹{adm.amount || 100}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Education */}
                            <td className="px-4 py-3.5">
                              <span className="inline-block bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md text-[11px] mb-1">
                                {adm.education || "N/A"}
                              </span>
                              <div className="text-stone-500 text-[11px] truncate max-w-[170px]" title={adm.college_name}>
                                {adm.college_name || "N/A"}
                              </div>
                            </td>

                            {/* Documents */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col gap-1 text-[11px]">
                                {adm.identity_proof && (
                                  <button
                                    onClick={() =>
                                      setViewingDoc({
                                        title: `${adm.name} - ID Proof`,
                                        url: adm.identity_proof!,
                                        isImage: adm.identity_proof!.startsWith("data:image/"),
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                                  >
                                    <FileCheck size={12} /> ID Proof
                                  </button>
                                )}
                                {adm.caste_certificate && (
                                  <button
                                    onClick={() =>
                                      setViewingDoc({
                                        title: `${adm.name} - Caste Certificate`,
                                        url: adm.caste_certificate!,
                                        isImage: adm.caste_certificate!.startsWith("data:image/"),
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-amber-700 hover:underline font-semibold"
                                  >
                                    <Award size={12} /> Caste Cert
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <select
                                value={adm.status || "completed"}
                                onChange={(e) =>
                                  handleAdmissionStatusUpdate(adm.id, e.target.value as any)
                                }
                                className={`text-[11px] font-bold rounded-lg px-2 py-1 border outline-none ${
                                  adm.status === "completed"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : adm.status === "pending"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                <option value="completed">Completed / Verified</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Rejected</option>
                              </select>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3.5 text-stone-500 whitespace-nowrap text-[11px]">
                              {adm.created_at
                                ? new Date(adm.created_at).toLocaleDateString("en-IN")
                                : "-"}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedAdmission(adm)}
                                  className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition"
                                  title="View Full Application Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  disabled={deletingAdmissionId === adm.id}
                                  onClick={() => handleDeleteAdmission(adm.id)}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                                  title="Delete Application"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer Count */}
                <div className="mt-4 text-center text-xs text-stone-500">
                  Showing {filteredAdmissions.length} of {admissions.length} admission applications
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB B: STUDENTS / USERS DIRECTORY ==================== */}
          {activeTab === "students" && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Centralized Student Registry
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#1b2b25] mt-1">
                      Students & PRN User Directory
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      View all registered student users, assigned PRN identifiers, contact details, and their active course enrollment status.
                    </p>
                  </div>

                  <button
                    onClick={exportStudentsToCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
                  >
                    <Download size={14} />
                    <span>Export Students Excel</span>
                  </button>
                </div>

                {/* Separation Notice */}
                <div className="mt-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2.5 text-stone-700">
                  <Shield size={16} className="text-emerald-700 shrink-0" />
                  <p>
                    <strong>Registration vs Direct Admission:</strong> This directory contains all student accounts registered on the portal (PRN Accounts). Students who paid fees and enrolled in a course have a <strong>'🟢 Course Enrolled'</strong> badge, while students who have only registered their account have a <strong>'⚪ Registered Only'</strong> badge.
                  </p>
                </div>

                {/* Search Bar & 3-Way Admission Status Filter */}
                <div className="my-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="text"
                      placeholder="Search by student name, PRN, email, phone, city..."
                      value={studentsSearch}
                      onChange={(e) => setStudentsSearch(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  {/* 3-way toggle filter */}
                  <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs gap-1 flex-wrap self-start lg:self-auto">
                    <button
                      onClick={() => setStudentAdmissionFilter("all")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        studentAdmissionFilter === "all"
                          ? "bg-white text-[#1b2b25] shadow-xs"
                          : "text-stone-600 hover:text-[#1b2b25]"
                      }`}
                    >
                      All Accounts ({students.length})
                    </button>
                    <button
                      onClick={() => setStudentAdmissionFilter("enrolled")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                        studentAdmissionFilter === "enrolled"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>
                        Course Enrolled (
                        {
                          students.filter((s) =>
                            admissions.some(
                              (a) =>
                                (a.name && s.name && a.name.toLowerCase() === s.name.toLowerCase()) ||
                                (a.email && s.email && a.email.toLowerCase() === s.email.toLowerCase()) ||
                                (a.phone && s.phone && a.phone.includes(s.phone)) ||
                                (a.message && s.prn && a.message.includes(s.prn))
                            )
                          ).length
                        }
                        )
                      </span>
                    </button>
                    <button
                      onClick={() => setStudentAdmissionFilter("registered_only")}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                        studentAdmissionFilter === "registered_only"
                          ? "bg-stone-700 text-white shadow-xs"
                          : "text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-stone-400" />
                      <span>
                        Registered Only (
                        {
                          students.filter(
                            (s) =>
                              !admissions.some(
                                (a) =>
                                  (a.name && s.name && a.name.toLowerCase() === s.name.toLowerCase()) ||
                                  (a.email && s.email && a.email.toLowerCase() === s.email.toLowerCase()) ||
                                  (a.phone && s.phone && a.phone.includes(s.phone)) ||
                                  (a.message && s.prn && a.message.includes(s.prn))
                              )
                          ).length
                        }
                        )
                      </span>
                    </button>
                  </div>
                </div>

                {/* Students Table */}
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
                    <Users size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm font-semibold text-stone-600">
                      No registered students found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-stone-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5">Student PRN</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Contact Details</th>
                          <th className="px-4 py-3.5">Location</th>
                          <th className="px-4 py-3.5">Registration Date</th>
                          <th className="px-4 py-3.5 text-center">Admissions</th>
                          <th className="px-4 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredStudents.map((s) => {
                          const userAdmissions = admissions.filter(
                            (a) =>
                              (a.name && a.name.toLowerCase() === s.name.toLowerCase()) ||
                              (a.email && a.email.toLowerCase() === s.email.toLowerCase()) ||
                              (a.phone && s.phone && a.phone.includes(s.phone)) ||
                              (a.message && s.prn && a.message.includes(s.prn))
                          );

                          return (
                            <tr key={s.id} className="hover:bg-stone-50/80 transition">
                              {/* PRN Badge with Copy button */}
                              <td className="px-4 py-3.5">
                                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg font-mono font-bold text-xs">
                                  <span>{s.prn}</span>
                                  <button
                                    onClick={() => handleCopyPrn(s.prn)}
                                    className="p-0.5 text-emerald-700 hover:text-emerald-900 transition"
                                    title="Copy PRN"
                                  >
                                    {copiedPrn === s.prn ? <Check size={12} /> : <Copy size={12} />}
                                  </button>
                                </div>
                              </td>

                              {/* Student Name */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                    {s.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#1b2b25]">{s.name}</div>
                                    <div className="text-[10px] text-stone-400 font-mono">ID: {s.id}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="px-4 py-3.5 text-[11px] space-y-0.5">
                                <div className="flex items-center gap-1.5 text-stone-700">
                                  <Mail size={12} className="text-stone-400" />
                                  <a href={`mailto:${s.email}`} className="hover:text-blue-600 truncate max-w-[160px]">
                                    {s.email}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-500">
                                  <Phone size={12} className="text-stone-400" />
                                  <span>{s.phone}</span>
                                </div>
                              </td>

                              {/* Location */}
                              <td className="px-4 py-3.5 text-stone-600 text-[11px]">
                                {s.city || "Pune"}, {s.state || "Maharashtra"}
                              </td>

                              {/* Date */}
                              <td className="px-4 py-3.5 text-stone-500 whitespace-nowrap text-[11px]">
                                {s.registeredAt
                                  ? new Date(s.registeredAt).toLocaleDateString("en-IN")
                                  : "-"}
                              </td>

                              {/* Admissions status */}
                              <td className="px-4 py-3.5 text-center">
                                {userAdmissions.length > 0 ? (
                                  <div className="space-y-1 inline-flex flex-col items-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 size={11} className="text-emerald-600" />
                                      <span>Course Enrolled ({userAdmissions.length})</span>
                                    </span>
                                    <div
                                      className="text-[10px] text-stone-500 font-medium truncate max-w-[150px]"
                                      title={userAdmissions.map((ua) => ua.program).join(", ")}
                                    >
                                      {userAdmissions
                                        .map((ua) => ua.program || "Language")
                                        .slice(0, 2)
                                        .join(", ")}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveTab("admissions");
                                        setAdmissionsSearch(s.name);
                                      }}
                                      className="text-[10px] font-bold text-[#b5623b] hover:underline"
                                    >
                                      View Admission →
                                    </button>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                    <User size={10} className="text-stone-400" />
                                    <span>Registered Only (No Course)</span>
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setSelectedStudent(s)}
                                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                    title="View Student Profile"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    disabled={deletingStudentId === s.id}
                                    onClick={() => handleDeleteStudent(s.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                                    title="Delete Student"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer Count */}
                <div className="mt-4 text-center text-xs text-stone-500">
                  Showing {filteredStudents.length} of {students.length} registered students
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB C: DONATIONS ==================== */}
          {activeTab === "donations" && (
            <div className="space-y-6">
              {/* Fundraising Progress Card */}
              <div className="rounded-3xl bg-[#1b2b25] text-white p-7 shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#fedb41]">
                      Fundraising Campaign Goal
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white mt-1">
                      ₹{stats.total_amount.toLocaleString("en-IN")}{" "}
                      <span className="text-sm font-normal text-stone-300">
                        raised of ₹{FUNDRAISING_GOAL.toLocaleString("en-IN")} goal
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPieChart(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
                    >
                      <PieChart size={14} />
                      <span>Status Chart</span>
                    </button>
                    <button
                      onClick={() => setShowAddDonationModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-xs font-bold transition shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add Donation</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#fedb41] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-stone-300">
                  <span>Progress: {progressPercent.toFixed(2)}%</span>
                  <span>
                    Remaining: ₹{(FUNDRAISING_GOAL - stats.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Donations Table Card */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="text"
                      placeholder="Search donor name, email, payment ID, cause..."
                      value={donationSearchQuery}
                      onChange={(e) => setDonationSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition focus:border-[#b5623b] focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={donationFilterStatus}
                      onChange={(e) => setDonationFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-stone-200 bg-stone-50 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>

                    <button
                      onClick={exportDonationsToCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Donations Table */}
                {filteredDonations.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
                    <Heart size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm font-semibold text-stone-600">
                      No donations found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-stone-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5">Donor Name</th>
                          <th className="px-4 py-3.5">Amount</th>
                          <th className="px-4 py-3.5">Allocated Cause</th>
                          <th className="px-4 py-3.5">Payment ID</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5">Date</th>
                          <th className="px-4 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredDonations.map((d) => (
                          <tr key={d.id} className="hover:bg-stone-50/80 transition">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-[#1b2b25]">{d.donor_name}</div>
                              <div className="text-[11px] text-stone-500">{d.donor_email}</div>
                              {d.donor_phone && (
                                <div className="text-[10px] text-stone-400 font-mono">{d.donor_phone}</div>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-serif font-bold text-sm text-[#1b2b25]">
                                ₹{d.amount.toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-stone-600 text-[11px]">
                              {d.service_name || "General Education"}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px] text-stone-500 truncate max-w-[130px]">
                              {d.payment_id}
                            </td>
                            <td className="px-4 py-3.5">
                              <select
                                value={d.status}
                                onChange={(e) =>
                                  handleDonationStatusUpdate(d.id, e.target.value as any)
                                }
                                className={`text-[11px] font-bold rounded-lg px-2 py-1 border outline-none ${
                                  d.status === "completed"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : d.status === "pending"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5 text-stone-500 whitespace-nowrap text-[11px]">
                              {new Date(d.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingDonation(d);
                                    setEditFormData({ ...d });
                                  }}
                                  className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                  title="Edit Donation"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteDonation(d.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB D: INQUIRIES & CONTACTS ==================== */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Website Messages & Leads
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#1b2b25] mt-1">
                      Inquiries & Feedback
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Messages submitted by students, donors, and parents via the website contact form.
                    </p>
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={contactsSearch}
                      onChange={(e) => setContactsSearch(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-4 py-2 text-xs font-medium outline-none transition focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Contacts List */}
                {contactsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
                    <MessageSquare size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm font-semibold text-stone-600">
                      No inquiries found.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 divide-y divide-stone-100">
                    {filteredContacts.map((c) => (
                      <div
                        key={c.id}
                        className="py-4 hover:bg-stone-50/80 p-3 rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                              c.status === "new"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#1b2b25]">{c.name}</h4>
                              {c.status === "new" && (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  NEW
                                </span>
                              )}
                              <span className="text-xs text-stone-400">
                                {c.created_at ? new Date(c.created_at).toLocaleString("en-IN") : ""}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-stone-700 mt-0.5">
                              {c.subject}
                            </p>
                            <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                              {c.message}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => setSelectedContact(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
                          >
                            <Eye size={13} />
                            <span>Read Message</span>
                          </button>
                          <button
                            onClick={() => c.id && handleDeleteContact(c.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB E: VISITOR TRAFFIC ==================== */}
          {activeTab === "visitors" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Real-time Audience Metrics
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1b2b25] mt-1">
                  Website Traffic & Visitor Analytics
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Visitor sessions recorded via Supabase edge tracking across all devices.
                </p>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="rounded-2xl border border-stone-200 p-5 bg-[#fbfaf8]">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Today's Visits
                    </span>
                    <div className="text-3xl font-serif font-bold text-[#1b2b25] mt-2">
                      {visitorStats.today}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 p-5 bg-[#fbfaf8]">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Yesterday
                    </span>
                    <div className="text-3xl font-serif font-bold text-[#1b2b25] mt-2">
                      {visitorStats.yesterday}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 p-5 bg-[#fbfaf8]">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      This Week
                    </span>
                    <div className="text-3xl font-serif font-bold text-[#1b2b25] mt-2">
                      {visitorStats.thisWeek}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 p-5 bg-[#fbfaf8]">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      This Month
                    </span>
                    <div className="text-3xl font-serif font-bold text-[#1b2b25] mt-2">
                      {visitorStats.thisMonth}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 rounded-2xl border border-emerald-200 p-5 bg-emerald-50">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Total All-Time
                    </span>
                    <div className="text-3xl font-serif font-bold text-emerald-950 mt-2">
                      {visitorStats.total}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB COURSES: COURSE MANAGEMENT ==================== */}
          {activeTab === "courses" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <CourseManager />
            </div>
          )}
        </div>
      </main>

      {/* ==================== MODALS ==================== */}

      {/* 1. Admission Detail Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="sticky top-0 flex justify-between items-center p-5 px-6 border-b border-stone-200 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 text-[#b5623b] flex items-center justify-center font-bold">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                    Admission Application Profile
                  </h3>
                  <p className="text-[11px] font-mono text-stone-400">ID: {selectedAdmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 rounded-2xl bg-stone-50 p-4 border border-stone-200">
                {selectedAdmission.photo ? (
                  <img
                    src={selectedAdmission.photo}
                    alt={selectedAdmission.name}
                    className="h-20 w-20 rounded-2xl object-cover border border-stone-300 shadow-xs cursor-pointer hover:opacity-90 shrink-0"
                    onClick={() =>
                      setViewingDoc({
                        title: `${selectedAdmission.name} - Photo`,
                        url: selectedAdmission.photo!,
                        isImage: true,
                      })
                    }
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-stone-200 text-stone-600 font-bold text-2xl flex items-center justify-center shrink-0">
                    {selectedAdmission.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-serif font-bold text-[#1b2b25]">
                    {selectedAdmission.name}
                  </h4>
                  {(() => {
                    const bDetails = getAdmissionBatchDetails(selectedAdmission);
                    return (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex items-center gap-2">
                          <CountryFlagIcon courseId={bDetails.courseId} size="sm" />
                          <span className="text-xs font-bold text-[#b5623b]">
                            {bDetails.courseName}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-[#b5623b] border border-amber-200/80 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <span>{bDetails.batchName}</span>
                          {bDetails.time && (
                            <span className="text-stone-500 font-normal">
                              ({bDetails.days ? `${bDetails.days}, ` : ""}{bDetails.time})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Fee: ₹{selectedAdmission.amount || 100} Paid</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-2 text-xs text-stone-500">
                    Status:{" "}
                    <select
                      value={selectedAdmission.status || "completed"}
                      onChange={(e) =>
                        handleAdmissionStatusUpdate(selectedAdmission.id, e.target.value as any)
                      }
                      className="ml-1 text-xs font-bold rounded-md px-2 py-0.5 border border-stone-300"
                    >
                      <option value="completed">Completed / Verified</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Education & College */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50">
                  <span className="text-stone-400 block font-bold uppercase">Education</span>
                  <span className="font-semibold text-stone-800 text-sm mt-0.5 block">
                    {selectedAdmission.education || "N/A"}
                  </span>
                </div>
                <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50">
                  <span className="text-stone-400 block font-bold uppercase">College Name</span>
                  <span className="font-semibold text-stone-800 text-sm mt-0.5 block">
                    {selectedAdmission.college_name || "N/A"}
                  </span>
                </div>
              </div>

              {/* Residential Address */}
              <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50 text-xs">
                <span className="text-stone-400 block font-bold uppercase">Residential Address</span>
                <span className="font-medium text-stone-800 mt-1 block whitespace-pre-wrap">
                  {selectedAdmission.address || "N/A"}
                </span>
              </div>

              {/* Uploaded Documents */}
              <div>
                <span className="text-xs font-bold uppercase text-stone-500 mb-2 block">
                  Attached Verification Documents
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {/* Photo */}
                  <div className="rounded-xl border border-stone-200 p-3 bg-white text-center">
                    <span className="font-bold text-stone-700 block">Photo</span>
                    {selectedAdmission.photo ? (
                      <button
                        onClick={() =>
                          setViewingDoc({
                            title: `${selectedAdmission.name} - Photo`,
                            url: selectedAdmission.photo!,
                            isImage: true,
                          })
                        }
                        className="mt-2 text-[11px] font-bold text-[#b5623b] hover:underline"
                      >
                        View Photo
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic mt-2 block">Not uploaded</span>
                    )}
                  </div>

                  {/* ID Proof */}
                  <div className="rounded-xl border border-stone-200 p-3 bg-white text-center">
                    <span className="font-bold text-stone-700 block">Identity Proof</span>
                    {selectedAdmission.identity_proof ? (
                      <button
                        onClick={() =>
                          setViewingDoc({
                            title: `${selectedAdmission.name} - ID Proof`,
                            url: selectedAdmission.identity_proof!,
                            isImage: selectedAdmission.identity_proof!.startsWith("data:image/"),
                          })
                        }
                        className="mt-2 text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        View ID
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic mt-2 block">Not uploaded</span>
                    )}
                  </div>

                  {/* Caste Certificate */}
                  <div className="rounded-xl border border-stone-200 p-3 bg-white text-center">
                    <span className="font-bold text-stone-700 block">Caste Certificate</span>
                    {selectedAdmission.caste_certificate ? (
                      <button
                        onClick={() =>
                          setViewingDoc({
                            title: `${selectedAdmission.name} - Caste Cert`,
                            url: selectedAdmission.caste_certificate!,
                            isImage: selectedAdmission.caste_certificate!.startsWith("data:image/"),
                          })
                        }
                        className="mt-2 text-[11px] font-bold text-amber-700 hover:underline"
                      >
                        View Cert
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic mt-2 block">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200 flex justify-between items-center bg-stone-50">
              <button
                onClick={() => handleDeleteAdmission(selectedAdmission.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Trash2 size={14} />
                <span>Delete Application</span>
              </button>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="sticky top-0 flex justify-between items-center p-5 px-6 border-b border-stone-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                    {selectedStudent.name}
                  </h3>
                  <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-700">
                    <span>PRN: {selectedStudent.prn}</span>
                    <button onClick={() => handleCopyPrn(selectedStudent.prn)}>
                      {copiedPrn === selectedStudent.prn ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-400 block font-bold">Email Address</span>
                  <a href={`mailto:${selectedStudent.email}`} className="font-semibold text-blue-600 hover:underline">
                    {selectedStudent.email}
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold">Mobile Number</span>
                  <a href={`tel:${selectedStudent.phone}`} className="font-semibold text-stone-800">
                    {selectedStudent.phone}
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold">Location</span>
                  <span className="font-semibold text-stone-800">
                    {selectedStudent.city || "Pune"}, {selectedStudent.state || "Maharashtra"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold">Registered Date</span>
                  <span className="font-semibold text-stone-800">
                    {new Date(selectedStudent.registeredAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200 flex justify-between items-center bg-stone-50">
              <button
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Trash2 size={14} />
                <span>Delete Student</span>
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Document / Image Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-stone-200">
            <div className="flex justify-between items-center p-4 px-6 border-b border-stone-200 bg-stone-50">
              <h4 className="font-bold text-sm text-[#1b2b25] truncate max-w-md">
                {viewingDoc.title}
              </h4>
              <div className="flex items-center gap-2">
                <a
                  href={viewingDoc.url}
                  download={viewingDoc.title}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 hover:bg-stone-200 rounded-full text-stone-600 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-stone-100 min-h-[350px]">
              {viewingDoc.isImage ? (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.title}
                  className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-md"
                />
              ) : (
                <iframe
                  src={viewingDoc.url}
                  title={viewingDoc.title}
                  className="w-full h-[75vh] rounded-2xl border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Donation Modal */}
      {showAddDonationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="sticky top-0 flex justify-between items-center p-5 px-6 border-b border-stone-200 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#b5623b] flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                  Add Manual Donation
                </h3>
              </div>
              <button
                onClick={() => setShowAddDonationModal(false)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDonationSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Donor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kulkarni"
                    value={newDonationData.donor_name}
                    onChange={(e) =>
                      setNewDonationData({ ...newDonationData, donor_name: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Donor Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={newDonationData.donor_email}
                    onChange={(e) =>
                      setNewDonationData({ ...newDonationData, donor_email: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newDonationData.donor_phone}
                    onChange={(e) =>
                      setNewDonationData({ ...newDonationData, donor_phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Donation Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="1000"
                    value={newDonationData.amount || ""}
                    onChange={(e) =>
                      setNewDonationData({
                        ...newDonationData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Payment ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pay_manual_123"
                    value={newDonationData.payment_id}
                    onChange={(e) =>
                      setNewDonationData({ ...newDonationData, payment_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Allocated Purpose / Service Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Japanese Language Scholarship"
                    value={newDonationData.service_name}
                    onChange={(e) =>
                      setNewDonationData({ ...newDonationData, service_name: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddDonationModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDonation}
                  className="px-5 py-2 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white font-bold disabled:opacity-50"
                >
                  {submittingDonation ? "Adding..." : "Save Donation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Contact Detail & Reply Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="sticky top-0 flex justify-between items-center p-5 px-6 border-b border-stone-200 bg-white">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                  Inquiry Message Details
                </h3>
                <p className="text-xs text-stone-400">From: {selectedContact.name}</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-400 block font-bold">Email Address</span>
                  <a href={`mailto:${selectedContact.email}`} className="font-semibold text-blue-600 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold">Date Received</span>
                  <span className="font-semibold text-stone-800">
                    {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString("en-IN") : "-"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block font-bold uppercase mb-1">Subject</span>
                <p className="font-bold text-stone-900 text-sm">{selectedContact.subject}</p>
              </div>

              <div>
                <span className="text-stone-400 block font-bold uppercase mb-1">Message Body</span>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-stone-800 whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200 flex justify-between items-center bg-stone-50">
              <select
                value={selectedContact.status || "new"}
                onChange={(e) => {
                  if (selectedContact.id) {
                    handleContactStatusUpdate(selectedContact.id, e.target.value as any);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300"
              >
                <option value="new">New</option>
                <option value="read">Mark Read</option>
                <option value="replied">Mark Replied</option>
              </select>

              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  onClick={() => {
                    if (selectedContact.id) {
                      handleContactStatusUpdate(selectedContact.id, "replied");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                >
                  <Mail size={14} />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Donation Modal */}
      {editingDonation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="p-5 px-6 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-[#1b2b25]">Edit Donation Record</h3>
              <button onClick={() => setEditingDonation(null)}>
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Donor Name</label>
                <input
                  type="text"
                  value={editFormData.donor_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, donor_name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Status</label>
                <select
                  value={editFormData.status || "completed"}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 font-bold"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="p-4 px-6 border-t border-stone-200 flex justify-end gap-2 bg-stone-50">
              <button
                onClick={() => setEditingDonation(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDonation}
                className="px-4 py-2 rounded-xl bg-[#b5623b] text-white font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Status Breakdown Modal */}
      {showPieChart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center border border-stone-200">
            <h3 className="font-serif font-bold text-xl text-[#1b2b25]">
              Donations Status Breakdown
            </h3>
            <div className="my-6 space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                <span>Completed Donations</span>
                <span>{stats.completed}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-amber-50 text-amber-800 font-bold">
                <span>Pending Donations</span>
                <span>{stats.pending}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-rose-50 text-rose-800 font-bold">
                <span>Failed Transactions</span>
                <span>{stats.failed}</span>
              </div>
            </div>
            <button
              onClick={() => setShowPieChart(false)}
              className="w-full py-2.5 rounded-xl bg-[#1b2b25] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
