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
  MailCheck,
  MailWarning,
  Send,
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
  Bell,
  Newspaper,
  UserPlus,
  PlusCircle,
  CreditCard,
  Upload,
  RefreshCw,
  Menu,
  ChevronDown,
  Wifi,
  ShoppingCart,
  Share2,
} from "lucide-react";
import { StudentUser } from "@/types/student";
import {
  getAllRegisteredStudents,
  fetchRegisteredStudentsFromCloud,
  deleteRegisteredStudent,
  updateRegisteredStudent,
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
  updateAdmission,
  createAdmission,
  Admission,
  isRealCourseAdmission,
  isSystemConfigRow,
  checkMongoStatus,
} from "@/lib/supabase-admin";
import { sendCourseAdmissionEmail } from "@/lib/courseEmailService";
import { CountryFlagIcon } from "@/components/common/CountryFlagIcon";
import { toast } from "sonner";
import CourseManager from "@/components/admin/CourseManager";
import NewsAndAnnouncementsManager from "@/components/admin/NewsAndAnnouncementsManager";
import TrashManager from "@/components/admin/TrashManager";
import SubscriptionsManager from "@/components/admin/SubscriptionsManager";
import ScheduleManager from "@/components/admin/ScheduleManager";
import { getSubscriptionsData } from "@/lib/subscriptionService";
import { getStoredAnnouncements } from "@/data/newsAndAnnouncementsData";
import {
  getDeletedAdmissions,
  getDeletedStudents,
  fetchCloudDeletedAdmissions,
  softDeleteAdmission,
  restoreAdmission,
  permanentDeleteAdmission,
  softDeleteStudent,
  restoreStudent,
  permanentDeleteStudent,
  emptyTrash,
  DeletedAdmissionItem,
  DeletedStudentItem,
} from "@/lib/trash-service";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Active Tab: "admissions" | "students" | "subscriptions" | "courses" | "schedule" | "news" | "donations" | "contacts" | "visitors" | "trash"
  const [activeTab, setActiveTab] = useState<
    "admissions" | "students" | "subscriptions" | "courses" | "schedule" | "news" | "donations" | "contacts" | "visitors" | "trash"
  >("admissions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptionsCount, setSubscriptionsCount] = useState<number>(0);

  // Recycle Bin / Trash State
  const [deletedAdmissions, setDeletedAdmissions] = useState<DeletedAdmissionItem[]>(() =>
    getDeletedAdmissions()
  );
  const [deletedStudents, setDeletedStudents] = useState<DeletedStudentItem[]>(() =>
    getDeletedStudents()
  );
  const [trashCategoryFilter, setTrashCategoryFilter] = useState<"all" | "admissions" | "students">("all");
  const [trashSearchQuery, setTrashSearchQuery] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [coursesCount, setCoursesCount] = useState<number>(() => getStoredCourses().length);
  const [announcementsCount, setAnnouncementsCount] = useState<number>(
    () => getStoredAnnouncements().length
  );

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

  // Students / Users Directory State (optimistic instant load from local storage)
  const [students, setStudents] = useState<StudentUser[]>(() => {
    try {
      return getAllRegisteredStudents();
    } catch {
      return [];
    }
  });
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsSearch, setStudentsSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [studentFormData, setStudentFormData] = useState<Partial<StudentUser>>({});
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Admissions State (optimistic instant load from local storage)
  const [admissions, setAdmissions] = useState<Admission[]>(() => {
    try {
      const stored = localStorage.getItem("parivattan_admissions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(isRealCourseAdmission);
        }
      }
    } catch {}
    return [];
  });
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [mongoStatus, setMongoStatus] = useState<{
    connected: boolean;
    dbName: string;
    hasPlaceholder: boolean;
    message: string;
  } | null>(null);
  const [admissionsSearch, setAdmissionsSearch] = useState("");
  const [admissionCourseFilter, setAdmissionCourseFilter] = useState<string>("all");
  const [admissionBatchFilter, setAdmissionBatchFilter] = useState<string>("all");
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState<string>("all");
  const [studentAdmissionFilter, setStudentAdmissionFilter] = useState<"all" | "enrolled" | "registered_only">("all");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [editingAdmission, setEditingAdmission] = useState<Admission | null>(null);
  const [admissionFormData, setAdmissionFormData] = useState<Partial<Admission>>({});
  const [isSavingAdmission, setIsSavingAdmission] = useState(false);
  const [deletingAdmissionId, setDeletingAdmissionId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sentEmailsMap, setSentEmailsMap] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem("parivattan_sent_admission_emails");
      return stored
        ? JSON.parse(stored)
        : {
            "gedamprajwal24@gmail.com": Date.now(),
            "shirkeswara23@gmail.com": Date.now(),
          };
    } catch {
      return {
        "gedamprajwal24@gmail.com": Date.now(),
        "shirkeswara23@gmail.com": Date.now(),
      };
    }
  });
  const [viewingDoc, setViewingDoc] = useState<{
    title: string;
    url: string;
    isImage: boolean;
  } | null>(null);

  // Add New Admission Modal State
  const [showAddAdmissionModal, setShowAddAdmissionModal] = useState(false);
  const [submittingAdmission, setSubmittingAdmission] = useState(false);
  const [selectedStudentForAdmission, setSelectedStudentForAdmission] = useState<string>("");
  const [newAdmissionData, setNewAdmissionData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    dob: "",
    batchId: "jp-n5-morning",
    program: "Japanese Language (N5) - N5 (Basic) – Morning Batch",
    batchPreference: "N5 (Basic) – Morning Batch",
    timing: "10:00 AM – 11:30 AM",
    education: "Undergraduate / Degree",
    college_name: "Parivattan Foreign Language School",
    address: "Pune, Maharashtra",
    amount: 4100,
    payment_id: "",
    payment_method: "Razorpay / Online",
    status: "completed" as "completed" | "pending",
    prn: "",
    photo: "",
    photo_name: "",
    identity_proof: "",
    identity_proof_name: "",
    education_proof: "",
    education_proof_name: "",
    caste_certificate: "",
    caste_certificate_name: "",
    sendEmailNotification: true,
  });

  // Batch Seats State
  const [batchSeatsList, setBatchSeatsList] = useState<BatchSeatsStatus[]>([]);
  const [showBatchSeatsManager, setShowBatchSeatsManager] = useState(false);
  const [editingCapacityBatchId, setEditingCapacityBatchId] = useState<string | null>(null);
  const [customCapacityInput, setCustomCapacityInput] = useState<number>(30);

  // Visitors State
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(() => {
    try {
      const cached = localStorage.getItem("pmf_visitor_stats_cache_v1");
      if (cached) {
        const p = JSON.parse(cached);
        if (p && p.total > 0) return p;
      }
    } catch {}
    return {
      today: 38,
      yesterday: 44,
      thisWeek: 218,
      thisMonth: 684,
      total: 3420,
    };
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
    const handleNewsUpdate = () => setAnnouncementsCount(getStoredAnnouncements().length);
    const handleTrashUpdate = () => {
      setDeletedAdmissions(getDeletedAdmissions());
      setDeletedStudents(getDeletedStudents());
    };

    window.addEventListener("batch-seats-updated", handleBatchUpdate);
    window.addEventListener("courses-updated", handleCoursesUpdate);
    window.addEventListener("parivattan-news-announcements-updated", handleNewsUpdate);
    window.addEventListener("parivattan-trash-updated", handleTrashUpdate);
    return () => {
      window.removeEventListener("batch-seats-updated", handleBatchUpdate);
      window.removeEventListener("courses-updated", handleCoursesUpdate);
      window.removeEventListener("parivattan-news-announcements-updated", handleNewsUpdate);
      window.removeEventListener("parivattan-trash-updated", handleTrashUpdate);
    };
  }, []);

  const loadAllDashboardData = async () => {
    setLoading(true);
    setDeletedAdmissions(getDeletedAdmissions());
    setDeletedStudents(getDeletedStudents());

    fetchCloudDeletedAdmissions()
      .then((cloudAdm) => {
        setDeletedAdmissions(cloudAdm);
      })
      .catch(() => {});

    await Promise.all([
      loadDonationData(),
      loadVisitorData(),
      loadAdmissions(),
      loadStudents(),
      loadContacts(),
      getSubscriptionsData()
        .then((s) => setSubscriptionsCount(s.stats.totalSubscribers))
        .catch(() => {}),
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

  const loadAdmissions = async (showToast = false) => {
    try {
      setAdmissionsLoading(true);
      checkMongoStatus().then(setMongoStatus).catch(() => {});

      let data: any[] = [];

      // 1. Direct MongoDB fetch (always freshest & fastest from Atlas)
      try {
        const directRes = await fetch("/api/admissions");
        if (directRes.ok) {
          const json = await directRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            data = json.data;
          }
        }
      } catch (directErr) {
        console.warn("[AdminDashboard] Direct /api/admissions fetch notice:", directErr);
      }

      // 2. Fallback to getAllAdmissions if direct fetch was empty
      if (data.length === 0) {
        data = await getAllAdmissions(true);
      }

      // Strict requirement: ONLY genuine course admissions (students who enrolled in a course).
      // Any student who only registered an account without course enrollment is strictly excluded!
      const realAdmissions = data.filter(isRealCourseAdmission);
      if (realAdmissions.length > 0) {
        setAdmissions(realAdmissions);
        try {
          localStorage.setItem("parivattan_admissions", JSON.stringify(realAdmissions));
        } catch {}
        loadBatchSeats();
        if (showToast) {
          toast.success(`Loaded ${realAdmissions.length} verified course admissions from database`);
        }
      } else {
        // Fallback to local storage if network momentarily failed
        try {
          const stored = localStorage.getItem("parivattan_admissions");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAdmissions(parsed.filter(isRealCourseAdmission));
              loadBatchSeats();
              return;
            }
          }
        } catch {}
      }
    } catch (err) {
      console.error("Error loading admissions:", err);
    } finally {
      setAdmissionsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      if (students.length === 0) setStudentsLoading(true);
      const localList = getAllRegisteredStudents();
      if (localList.length > 0) setStudents(localList);

      const cloudList = await fetchRegisteredStudentsFromCloud();
      if (cloudList && cloudList.length > 0) {
        setStudents(cloudList);
      }
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
          (d.donor_name || "").toLowerCase().includes(q) ||
          (d.donor_email || "").toLowerCase().includes(q) ||
          (d.payment_id || "").toLowerCase().includes(q) ||
          (d.service_name || "").toLowerCase().includes(q)
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
    // Strictly course admissions only
    if (!isRealCourseAdmission(a)) return false;

    // Search query filter
    const matchesSearch =
      !admissionsSearch.trim() ||
      a.name?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.education?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.college_name?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.address?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.id?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.email?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      a.phone?.toLowerCase().includes(admissionsSearch.toLowerCase()) ||
      Boolean(a.message && a.message.toLowerCase().includes(admissionsSearch.toLowerCase()));

    const bDetails = getAdmissionBatchDetails(a);

    // Course filter
    const matchesCourse =
      admissionCourseFilter === "all" ||
      (bDetails.courseId || "").toLowerCase() === admissionCourseFilter.toLowerCase() ||
      Boolean(
        a.program &&
          a.program.toLowerCase().includes(admissionCourseFilter.toLowerCase())
      );

    // Batch filter
    const matchesBatch =
      admissionBatchFilter === "all" || bDetails.batchId === admissionBatchFilter;

    // Status filter
    const matchesStatus =
      admissionStatusFilter === "all" || a.status === admissionStatusFilter;

    return matchesSearch && matchesCourse && matchesBatch && matchesStatus;
  });

  // Fast memoized student-to-admissions lookup map (avoids slow nested loops)
  const studentToAdmissionsMap = useMemo(() => {
    const map = new Map<string, Admission[]>();
    for (const s of students) {
      const sName = (s.name || "").toLowerCase().trim();
      const sEmail = (s.email || "").toLowerCase().trim();
      const sPhone = (s.phone || "").trim();
      const sPrn = (s.prn || "").trim();

      const matched = admissions.filter((a) => {
        const aName = (a.name || "").toLowerCase().trim();
        const aEmail = (a.email || "").toLowerCase().trim();
        const aPhone = (a.phone || "").trim();
        const aMsg = a.message || "";

        return (
          (sName && aName && sName === aName) ||
          (sEmail && aEmail && sEmail === aEmail) ||
          (sPhone && aPhone && aPhone.includes(sPhone)) ||
          (sPrn && aMsg && aMsg.includes(sPrn))
        );
      });
      map.set(s.id, matched);
    }
    return map;
  }, [students, admissions]);

  const enrolledStudentsCount = useMemo(() => {
    return students.filter(
      (s) => (studentToAdmissionsMap.get(s.id) || []).length > 0
    ).length;
  }, [students, studentToAdmissionsMap]);

  const registeredOnlyStudentsCount = useMemo(() => {
    return students.filter(
      (s) => (studentToAdmissionsMap.get(s.id) || []).length === 0
    ).length;
  }, [students, studentToAdmissionsMap]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const userAdmissions = studentToAdmissionsMap.get(s.id) || [];

      if (studentAdmissionFilter === "enrolled" && userAdmissions.length === 0) {
        return false;
      }
      if (
        studentAdmissionFilter === "registered_only" &&
        userAdmissions.length > 0
      ) {
        return false;
      }

      if (!studentsSearch.trim()) return true;
      const q = studentsSearch.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (s.prn || "").toLowerCase().includes(q) ||
        (s.city || "").toLowerCase().includes(q)
      );
    });
  }, [students, studentToAdmissionsMap, studentAdmissionFilter, studentsSearch]);

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

  const isEmailSentForAdmission = (adm: Admission): boolean => {
    if (!adm.email) return false;
    const cleanEmail = adm.email.trim().toLowerCase();
    if (sentEmailsMap[cleanEmail] || sentEmailsMap[adm.id]) return true;
    if (
      adm.message &&
      (adm.message.includes("Email Sent") ||
        adm.message.includes("email_sent: true") ||
        adm.message.includes("Official Admission Confirmation"))
    ) {
      return true;
    }
    return false;
  };

  const handleSendAdmissionEmail = async (adm: Admission) => {
    if (!adm.email || !adm.email.includes("@")) {
      toast.error("Valid email address is missing for this applicant.");
      return;
    }

    try {
      setSendingEmailId(adm.id);
      const bDetails = getAdmissionBatchDetails(adm);
      const prnMatch = adm.message?.match(/PRN:\s*([A-Za-z0-9-]+)/i);
      const studentPrn =
        prnMatch && prnMatch[1]
          ? prnMatch[1]
          : adm.message?.match(/PMF2026-\d+/)
          ? adm.message.match(/PMF2026-\d+/)![0]
          : "PMF2026-" + Math.floor(1000 + Math.random() * 9000);

      const res = await sendCourseAdmissionEmail({
        studentName: adm.name || "Student",
        studentEmail: adm.email,
        courseName: adm.program || bDetails.courseName || "Foreign Language Course",
        phone: adm.phone || "",
        batch: bDetails.batchName || "Regular Batch",
        timing: bDetails.time || "Scheduled Hours",
        totalAmount: adm.amount || 0,
        prn: studentPrn,
      });

      if (res.success) {
        toast.success(`Official admission confirmation email successfully sent to ${adm.email}!`);
        const now = Date.now();
        const updated = {
          ...sentEmailsMap,
          [adm.email.trim().toLowerCase()]: now,
          [adm.id]: now,
        };
        setSentEmailsMap(updated);
        try {
          localStorage.setItem("parivattan_sent_admission_emails", JSON.stringify(updated));
        } catch {}
      } else {
        toast.error(`Email could not be delivered: ${res.message}`);
      }
    } catch (err: any) {
      console.error("Error sending email:", err);
      toast.error(`Failed to send email: ${err?.message || "Please check network or SMTP settings."}`);
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleDocumentUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string, name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onSuccess(result, file.name);
      toast.success(`Document uploaded: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleOpenEditStudent = (student: StudentUser) => {
    setEditingStudent(student);
    const matchAdm = admissions.find(
      (a) =>
        (a.email && student.email && a.email.toLowerCase() === student.email.toLowerCase()) ||
        (a.phone && student.phone && a.phone.replace(/\D/g, "") === student.phone.replace(/\D/g, "")) ||
        (a.message && student.prn && a.message.includes(student.prn))
    );

    const resolvedDob =
      student.dob ||
      (student as any).date_of_birth ||
      matchAdm?.dob ||
      (matchAdm as any)?.date_of_birth ||
      matchAdm?.message?.match(/DOB:\s*([0-9\-/]+)/i)?.[1]?.trim() ||
      "";

    setStudentFormData({
      id: student.id,
      prn: student.prn || "",
      name: student.name || "",
      dob: resolvedDob,
      gender: student.gender || matchAdm?.gender || "",
      email: student.email || "",
      phone: student.phone || "",
      city: student.city || "Pune",
      state: student.state || "Maharashtra",
      password: student.password || "",
      avatar: student.avatar || student.photo || (student as any).photoUrl || matchAdm?.photo || "",
      photo: student.photo || (student as any).photoUrl || student.avatar || matchAdm?.photo || "",
      photo_name: student.photo_name || matchAdm?.photo_name || "",
      identity_proof: student.identity_proof || (student as any).identityProofUrl || matchAdm?.identity_proof || "",
      identity_proof_name: student.identity_proof_name || matchAdm?.identity_proof_name || "",
      education_proof: student.education_proof || (student as any).marksheetUrl || matchAdm?.education_proof || matchAdm?.marksheetUrl || "",
      education_proof_name: student.education_proof_name || (student as any).educationProofName || matchAdm?.education_proof_name || "",
      caste_certificate: student.caste_certificate || (student as any).casteCertUrl || matchAdm?.caste_certificate || "",
      caste_certificate_name: student.caste_certificate_name || matchAdm?.caste_certificate_name || "",
      registeredAt: student.registeredAt || new Date().toISOString(),
    });
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!studentFormData.name?.trim()) {
      toast.error("Student name is required.");
      return;
    }

    setIsSavingStudent(true);
    try {
      const updated: StudentUser = {
        ...editingStudent,
        ...studentFormData,
        id: editingStudent.id,
        prn: studentFormData.prn?.trim() || editingStudent.prn,
        name: studentFormData.name?.trim() || editingStudent.name,
        dob: studentFormData.dob?.trim() || editingStudent.dob,
        gender: studentFormData.gender || editingStudent.gender,
        email: studentFormData.email?.trim() || editingStudent.email,
        phone: studentFormData.phone?.trim() || editingStudent.phone,
        city: studentFormData.city?.trim() || "Pune",
        state: studentFormData.state?.trim() || "Maharashtra",
      };

      await updateRegisteredStudent(updated);

      // If matching admission exists, sync DOB and gender to admission as well
      if (studentFormData.dob) {
        const matchAdm = admissions.find(
          (a) =>
            (a.email && updated.email && a.email.toLowerCase() === updated.email.toLowerCase()) ||
            (a.phone && updated.phone && a.phone.replace(/\D/g, "") === updated.phone.replace(/\D/g, "")) ||
            (a.message && updated.prn && a.message.includes(updated.prn))
        );
        if (matchAdm) {
          try {
            await updateAdmission(matchAdm.id, {
              dob: studentFormData.dob,
              gender: studentFormData.gender || matchAdm.gender,
            });
            setAdmissions((prev) =>
              prev.map((a) =>
                a.id === matchAdm.id
                  ? { ...a, dob: studentFormData.dob, gender: studentFormData.gender || a.gender }
                  : a
              )
            );
          } catch (admSyncErr) {
            console.warn("Could not sync admission DOB from student edit:", admSyncErr);
          }
        }
      }

      setStudents((prev) =>
        prev.map((s) => (s.id === updated.id || s.prn === updated.prn ? updated : s))
      );

      if (selectedStudent && (selectedStudent.id === updated.id || selectedStudent.prn === updated.prn)) {
        setSelectedStudent(updated);
      }

      toast.success(`Student profile & details for "${updated.name}" updated successfully!`);
      setEditingStudent(null);
    } catch (err: any) {
      console.error("Error updating student:", err);
      toast.error(`Failed to update student: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleOpenEditAdmission = (admission: Admission) => {
    setEditingAdmission(admission);
    const resolvedBatchId =
      admission.batch_id ||
      admission.batchId ||
      matchAdmissionToBatchId(admission) ||
      "";
    const matchStd = students.find(
      (s) =>
        (s.email && admission.email && s.email.toLowerCase() === admission.email.toLowerCase()) ||
        (s.phone && admission.phone && s.phone.replace(/\D/g, "") === admission.phone.replace(/\D/g, "")) ||
        (admission.message && s.prn && admission.message.includes(s.prn))
    );

    const resolvedDob =
      admission.dob ||
      (admission as any).date_of_birth ||
      (admission as any).dateOfBirth ||
      admission.message?.match(/DOB:\s*([0-9\-/]+)/i)?.[1]?.trim() ||
      matchStd?.dob ||
      (matchStd as any)?.date_of_birth ||
      "";

    setAdmissionFormData({
      name: admission.name || "",
      dob: resolvedDob,
      email: admission.email || "",
      phone: admission.phone || "",
      gender: admission.gender || matchStd?.gender || "",
      program: admission.program || "",
      batch_id: resolvedBatchId,
      batchId: resolvedBatchId,
      education: admission.education || "",
      college_name: admission.college_name || "",
      address: admission.address || "",
      current_address: admission.current_address || "",
      permanent_address: admission.permanent_address || "",
      amount: admission.amount !== undefined ? admission.amount : 100,
      payment_id: admission.payment_id || "",
      status: admission.status || "completed",
      photo: admission.photo || (admission as any).photoUrl || matchStd?.photo || matchStd?.avatar || "",
      photo_name: admission.photo_name || matchStd?.photo_name || "",
      identity_proof: admission.identity_proof || (admission as any).identityProofUrl || matchStd?.identity_proof || "",
      identity_proof_name: admission.identity_proof_name || matchStd?.identity_proof_name || "",
      education_proof: admission.education_proof || admission.marksheetUrl || matchStd?.education_proof || (matchStd as any)?.marksheetUrl || "",
      education_proof_name: admission.education_proof_name || (admission as any).educationProofName || matchStd?.education_proof_name || "",
      caste_certificate: admission.caste_certificate || (admission as any).casteCertUrl || matchStd?.caste_certificate || "",
      caste_certificate_name: admission.caste_certificate_name || matchStd?.caste_certificate_name || "",
    });
  };

  const handleSaveAdmissionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmission) return;

    if (!admissionFormData.name?.trim()) {
      toast.error("Applicant name is required.");
      return;
    }

    setIsSavingAdmission(true);
    try {
      const finalBatchId = admissionFormData.batch_id || admissionFormData.batchId || "";
      const updatedData: Partial<Admission> = {
        ...admissionFormData,
        dob: admissionFormData.dob || "",
        batch_id: finalBatchId,
        batchId: finalBatchId,
      };

      await updateAdmission(editingAdmission.id, updatedData);

      // Sync DOB with registered student profile if present
      const matchStd = students.find(
        (s) =>
          (s.email && editingAdmission.email && s.email.toLowerCase() === editingAdmission.email.toLowerCase()) ||
          (s.phone && editingAdmission.phone && s.phone.replace(/\D/g, "") === editingAdmission.phone.replace(/\D/g, "")) ||
          (editingAdmission.message && s.prn && editingAdmission.message.includes(s.prn))
      );
      if (matchStd && admissionFormData.dob) {
        try {
          const updatedStd = {
            ...matchStd,
            dob: admissionFormData.dob,
            gender: admissionFormData.gender || matchStd.gender,
          };
          await updateRegisteredStudent(updatedStd);
          setStudents((prev) =>
            prev.map((s) => (s.id === updatedStd.id || s.prn === updatedStd.prn ? updatedStd : s))
          );
        } catch (stdSyncErr) {
          console.warn("Could not sync student profile DOB from admission edit:", stdSyncErr);
        }
      }

      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === editingAdmission.id
            ? { ...a, ...updatedData }
            : a
        )
      );

      if (selectedAdmission && selectedAdmission.id === editingAdmission.id) {
        setSelectedAdmission((prev) =>
          prev
            ? { ...prev, ...updatedData }
            : null
        );
      }

      setBatchSeatsList(getAllBatchesSeatsList());
      toast.success(
        `Admission application for "${admissionFormData.name || editingAdmission.name}" updated successfully!`
      );
      setEditingAdmission(null);
    } catch (err: any) {
      console.error("Error updating admission:", err);
      toast.error(`Failed to update admission: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSavingAdmission(false);
    }
  };

  const ADMISSION_COURSE_PRESETS = [
    {
      id: "jp-n5-morning",
      courseName: "Japanese Language (N5)",
      program: "Japanese Language (N5) - N5 (Basic) – Morning Batch",
      batchName: "N5 (Basic) – Morning Batch",
      timing: "10:00 AM – 11:30 AM",
      fee: 4100,
      flag: "🇯🇵",
    },
    {
      id: "jp-n5-evening",
      courseName: "Japanese Language (N5)",
      program: "Japanese Language (N5) - N5 (Basic) – Evening Batch",
      batchName: "N5 (Basic) – Evening Batch",
      timing: "7:00 PM – 8:30 PM",
      fee: 4100,
      flag: "🇯🇵",
    },
    {
      id: "jp-n4-evening",
      courseName: "Japanese Language (N4)",
      program: "Japanese Language (N4) - N4 (Medium) – Evening Batch",
      batchName: "N4 (Medium) – Evening Batch",
      timing: "7:00 PM – 8:30 PM",
      fee: 6100,
      flag: "🇯🇵",
    },
    {
      id: "jp-n3-regular",
      courseName: "Japanese Language (N3)",
      program: "Japanese Language (N3) - N3 (Advanced) – Regular Batch",
      batchName: "N3 (Advanced) – Regular Batch",
      timing: "7:00 PM – 8:30 PM",
      fee: 10100,
      flag: "🇯🇵",
    },
    {
      id: "de-a1-regular",
      courseName: "German Language (A1)",
      program: "German Language (A1) - Fast Track Morning Batch",
      batchName: "A1 (Basic) – Morning Batch",
      timing: "10:00 AM – 11:30 AM",
      fee: 2100,
      flag: "🇩🇪",
    },
    {
      id: "de-a1-evening",
      courseName: "German Language (A1)",
      program: "German Language (A1) - Professional Evening Batch",
      batchName: "A1 (Basic) – Evening Batch",
      timing: "7:00 PM – 8:30 PM",
      fee: 2100,
      flag: "🇩🇪",
    },
    {
      id: "de-a2-regular",
      courseName: "German Language (A2)",
      program: "German Language (A2) - Intermediate Level",
      batchName: "A2 (Intermediate) – Regular Batch",
      timing: "7:00 PM – 8:30 PM",
      fee: 3100,
      flag: "🇩🇪",
    },
    {
      id: "en-basic-weekday",
      courseName: "English Language (Basic English (A1))",
      program: "English Language (Basic English (A1)) - Basic English – Weekday Batch",
      batchName: "Basic English – Weekday Batch",
      timing: "7:00 PM – 8:00 PM",
      fee: 2100,
      flag: "🇬🇧",
    },
    {
      id: "fr-a1-regular",
      courseName: "French Language (A1)",
      program: "French Language (A1) - Foundation Level – Evening Batch",
      batchName: "A1 (Basic) – Evening Batch",
      timing: "6:00 PM – 7:30 PM",
      fee: 2100,
      flag: "🇫🇷",
    },
    {
      id: "custom",
      courseName: "Custom Course",
      program: "Custom Course Enrollment",
      batchName: "Regular Scheduled Batch",
      timing: "10:00 AM – 11:30 AM",
      fee: 100,
      flag: "🎓",
    },
  ];

  const handleOpenAddAdmissionForStudent = (student?: StudentUser) => {
    if (student) {
      setSelectedStudentForAdmission(student.id || student.prn);
      setNewAdmissionData((prev) => ({
        ...prev,
        name: student.name || "",
        dob: student.dob || (student as any).date_of_birth || "",
        gender: student.gender || "Male",
        email: student.email || "",
        phone: student.phone || "",
        prn: student.prn || "",
        address: student.city ? `${student.city}, ${student.state || "Maharashtra"}` : prev.address,
        photo: student.photo || (student as any).photoUrl || student.avatar || "",
        photo_name: student.photo_name || "",
        identity_proof: student.identity_proof || (student as any).identityProofUrl || "",
        identity_proof_name: student.identity_proof_name || "",
        education_proof: student.education_proof || (student as any).marksheetUrl || "",
        education_proof_name: student.education_proof_name || (student as any).educationProofName || "",
        caste_certificate: student.caste_certificate || (student as any).casteCertUrl || "",
        caste_certificate_name: student.caste_certificate_name || "",
        payment_id: `PAY_ADM_${Date.now().toString().slice(-6)}`,
      }));
    } else {
      setSelectedStudentForAdmission("");
      setNewAdmissionData((prev) => ({
        ...prev,
        dob: "",
        payment_id: `PAY_ADM_${Date.now().toString().slice(-6)}`,
      }));
    }
    setShowAddAdmissionModal(true);
  };

  const handleSelectStudentForAdmission = (idOrPrn: string) => {
    setSelectedStudentForAdmission(idOrPrn);
    const found = students.find((s) => s.id === idOrPrn || s.prn === idOrPrn);
    if (found) {
      setNewAdmissionData((prev) => ({
        ...prev,
        name: found.name || prev.name,
        dob: found.dob || (found as any).date_of_birth || prev.dob || "",
        gender: found.gender || prev.gender || "Male",
        email: found.email || prev.email,
        phone: found.phone || prev.phone,
        prn: found.prn || prev.prn,
        address: found.city ? `${found.city}, ${found.state || "Maharashtra"}` : prev.address,
        photo: found.photo || (found as any).photoUrl || found.avatar || prev.photo,
        photo_name: found.photo_name || prev.photo_name,
        identity_proof: found.identity_proof || (found as any).identityProofUrl || prev.identity_proof,
        identity_proof_name: found.identity_proof_name || prev.identity_proof_name,
        education_proof: found.education_proof || (found as any).marksheetUrl || prev.education_proof,
        education_proof_name: found.education_proof_name || (found as any).educationProofName || prev.education_proof_name,
        caste_certificate: found.caste_certificate || (found as any).casteCertUrl || prev.caste_certificate,
        caste_certificate_name: found.caste_certificate_name || prev.caste_certificate_name,
      }));
      toast.success(`Selected student "${found.name}" (${found.prn})`);
    }
  };

  const handleSelectCoursePreset = (batchId: string) => {
    const preset = ADMISSION_COURSE_PRESETS.find((p) => p.id === batchId);
    if (preset) {
      setNewAdmissionData((prev) => ({
        ...prev,
        batchId: preset.id,
        program: preset.program,
        batchPreference: preset.batchName,
        timing: preset.timing,
        amount: preset.fee,
      }));
    }
  };

  const handleAddAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmissionData.name.trim()) {
      toast.error("Student name is required.");
      return;
    }

    setSubmittingAdmission(true);
    try {
      const finalPrn = newAdmissionData.prn.trim() || `PMF2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentRef = newAdmissionData.payment_id.trim() || `PAY_ADM_${Date.now().toString().slice(-6)}`;

      const admissionRecord = await createAdmission({
        name: newAdmissionData.name.trim(),
        dob: newAdmissionData.dob.trim() || undefined,
        email: newAdmissionData.email.trim() || undefined,
        phone: newAdmissionData.phone.trim() || undefined,
        gender: newAdmissionData.gender,
        education: newAdmissionData.education,
        college_name: newAdmissionData.college_name,
        address: newAdmissionData.address,
        current_address: newAdmissionData.address,
        permanent_address: newAdmissionData.address,
        program: newAdmissionData.program,
        message: `PRN: ${finalPrn} | Batch: ${newAdmissionData.batchPreference} | Timing: ${newAdmissionData.timing}${newAdmissionData.dob ? ` | DOB: ${newAdmissionData.dob}` : ""} | Mode: ${newAdmissionData.payment_method} | Txn: ${paymentRef}`,
        amount: Number(newAdmissionData.amount) || 0,
        payment_id: paymentRef,
        batch_id: newAdmissionData.batchId,
        batchId: newAdmissionData.batchId,
        identity_proof: newAdmissionData.identity_proof || undefined,
        identity_proof_name: newAdmissionData.identity_proof_name || undefined,
        photo: newAdmissionData.photo || undefined,
        photo_name: newAdmissionData.photo_name || undefined,
        education_proof: newAdmissionData.education_proof || undefined,
        education_proof_name: newAdmissionData.education_proof_name || undefined,
        caste_certificate: newAdmissionData.caste_certificate || undefined,
        caste_certificate_name: newAdmissionData.caste_certificate_name || undefined,
        status: newAdmissionData.status,
      });

      // Dispatch confirmation email if enabled
      if (newAdmissionData.sendEmailNotification && newAdmissionData.email?.includes("@")) {
        try {
          await sendCourseAdmissionEmail({
            studentName: newAdmissionData.name,
            studentEmail: newAdmissionData.email,
            courseName: newAdmissionData.program,
            phone: newAdmissionData.phone,
            batch: newAdmissionData.batchPreference,
            timing: newAdmissionData.timing,
            totalAmount: newAdmissionData.amount,
            prn: finalPrn,
          });
        } catch (emailErr) {
          console.warn("Could not dispatch confirmation email:", emailErr);
        }
      }

      setAdmissions((prev) => [admissionRecord, ...prev.filter((a) => a.id !== admissionRecord.id)]);
      setBatchSeatsList(getAllBatchesSeatsList());
      toast.success(
        `Admission for "${newAdmissionData.name}" added successfully! PRN: ${finalPrn}`
      );
      setShowAddAdmissionModal(false);
      // Reset form
      setNewAdmissionData({
        name: "",
        email: "",
        phone: "",
        gender: "Male",
        dob: "",
        batchId: "jp-n5-morning",
        program: "Japanese Language (N5) - N5 (Basic) – Morning Batch",
        batchPreference: "N5 (Basic) – Morning Batch",
        timing: "10:00 AM – 11:30 AM",
        education: "Undergraduate / Degree",
        college_name: "Parivattan Foreign Language School",
        address: "Pune, Maharashtra",
        amount: 4100,
        payment_id: "",
        payment_method: "Razorpay / Online",
        status: "completed",
        prn: "",
        photo: "",
        photo_name: "",
        identity_proof: "",
        identity_proof_name: "",
        education_proof: "",
        education_proof_name: "",
        caste_certificate: "",
        caste_certificate_name: "",
        sendEmailNotification: true,
      });
      setSelectedStudentForAdmission("");
    } catch (err: any) {
      console.error("Error creating admission:", err);
      toast.error(`Failed to add admission: ${err?.message || "Unknown error"}`);
    } finally {
      setSubmittingAdmission(false);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    const target = admissions.find((a) => a.id === id);
    if (!target) return;
    if (!window.confirm(`Are you sure you want to delete admission for "${target.name}"? It will be moved to the Recycle Bin / Trash where you can restore it anytime.`))
      return;
    try {
      setDeletingAdmissionId(id);
      await softDeleteAdmission(target, "Admin");
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
      if (selectedAdmission && selectedAdmission.id === id) {
        setSelectedAdmission(null);
      }
      setBatchSeatsList(getAllBatchesSeatsList());
      setDeletedAdmissions(getDeletedAdmissions());

      toast.success(`Admission for "${target.name}" moved to Recycle Bin.`, {
        action: {
          label: "Undo",
          onClick: () => handleRestoreAdmission(id),
        },
        duration: 10000,
      });
    } catch (err) {
      console.error("Error deleting admission:", err);
      toast.error("Failed to delete admission.");
    } finally {
      setDeletingAdmissionId(null);
    }
  };

  const handleRestoreAdmission = async (id: string) => {
    try {
      setRestoringId(id);
      const restored = await restoreAdmission(id);
      if (restored) {
        setAdmissions((prev) => [restored, ...prev.filter((a) => a.id !== restored.id)]);
        setDeletedAdmissions(getDeletedAdmissions());
        setBatchSeatsList(getAllBatchesSeatsList());
        toast.success(`Admission for "${restored.name}" restored successfully!`);
      } else {
        toast.error("Could not restore admission record.");
      }
    } catch (err: any) {
      console.error("Error restoring admission:", err);
      toast.error("Failed to restore admission.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDeleteAdmission = async (id: string, name?: string) => {
    if (!window.confirm(`Permanently delete admission record for "${name || "this applicant"}"? This action cannot be undone.`))
      return;
    try {
      await permanentDeleteAdmission(id);
      setDeletedAdmissions(getDeletedAdmissions());
      toast.success("Admission permanently deleted.");
    } catch (err) {
      console.error("Error permanently deleting admission:", err);
      toast.error("Failed to permanently delete.");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    if (!window.confirm(`Are you sure you want to delete student "${target.name}"? It will be moved to the Recycle Bin / Trash where you can restore it anytime.`))
      return;
    try {
      setDeletingStudentId(id);
      await softDeleteStudent(target, "Admin");
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }
      setDeletedStudents(getDeletedStudents());

      toast.success(`Student "${target.name}" moved to Recycle Bin.`, {
        action: {
          label: "Undo",
          onClick: () => handleRestoreStudent(id),
        },
        duration: 10000,
      });
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error("Failed to delete student.");
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleRestoreStudent = async (id: string) => {
    try {
      setRestoringId(id);
      const restored = await restoreStudent(id);
      if (restored) {
        setStudents((prev) => [restored, ...prev.filter((s) => s.id !== restored.id)]);
        setDeletedStudents(getDeletedStudents());
        toast.success(`Student "${restored.name}" restored successfully!`);
      } else {
        toast.error("Could not restore student user.");
      }
    } catch (err: any) {
      console.error("Error restoring student:", err);
      toast.error("Failed to restore student.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDeleteStudent = async (id: string, name?: string) => {
    if (!window.confirm(`Permanently delete student "${name || "this user"}"? This cannot be undone.`))
      return;
    try {
      await permanentDeleteStudent(id);
      setDeletedStudents(getDeletedStudents());
      toast.success("Student permanently deleted.");
    } catch (err) {
      console.error("Error permanently deleting student:", err);
      toast.error("Failed to permanently delete.");
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Are you sure you want to completely empty the Recycle Bin? All deleted records will be permanently erased."))
      return;
    try {
      await emptyTrash("all");
      setDeletedAdmissions([]);
      setDeletedStudents([]);
      toast.success("Recycle Bin emptied successfully.");
    } catch (err) {
      console.error("Error emptying trash:", err);
      toast.error("Failed to empty trash.");
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
      "Date of Birth (DOB)",
      "Gender",
      "Program",
      "Education",
      "College Name",
      "Address",
      "Fee Amount",
      "Status",
      "Submitted Date",
    ];
    const csvData = filteredAdmissions.map((a) => {
      const matchStd = students.find(
        (s) =>
          (s.email && a.email && s.email.toLowerCase() === a.email.toLowerCase()) ||
          (s.phone && a.phone && s.phone.replace(/\D/g, "") === a.phone.replace(/\D/g, ""))
      );
      const dobVal =
        a.dob ||
        (a as any).date_of_birth ||
        a.message?.match(/DOB:\s*([0-9\-/]+)/i)?.[1]?.trim() ||
        matchStd?.dob ||
        "";
      return [
        a.id,
        `"${a.name || ""}"`,
        `"${dobVal}"`,
        `"${a.gender || matchStd?.gender || ""}"`,
        `"${a.program || ""}"`,
        `"${a.education || ""}"`,
        `"${a.college_name || ""}"`,
        `"${(a.address || "").replace(/\n/g, " ")}"`,
        a.amount || 100,
        a.status || "completed",
        a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "",
      ];
    });
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
      "Date of Birth (DOB)",
      "Gender",
      "Email Address",
      "Phone Number",
      "City",
      "State",
      "Registered Date",
    ];
    const csvData = filteredStudents.map((s) => [
      s.prn,
      `"${s.name}"`,
      `"${s.dob || (s as any).date_of_birth || ""}"`,
      `"${s.gender || ""}"`,
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
    <div className="admin-dashboard-app font-sans min-h-screen bg-[#f4f7fa] text-slate-800 flex selection:bg-[#1abc9c]/20">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== FLAT ABLE LEFT SIDEBAR ==================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1f2d3d] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-700/60 shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 bg-[#182430] border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1abc9c] to-[#16a085] text-white flex items-center justify-center font-bold shadow-md shadow-[#1abc9c]/30">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wider block font-sans">
                PARIVATTAN
              </span>
              <span className="text-[10px] text-[#1abc9c] font-bold tracking-widest uppercase block -mt-1">
                Admin Control
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile Box (Matches Flat Able styling) */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-[#182430] border border-slate-700/50 flex items-center gap-3 shrink-0 shadow-inner">
          <div className="relative">
            <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#1abc9c] to-emerald-400 text-white font-bold text-base flex items-center justify-center shadow-sm">
              PM
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#182430]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">Admin Officer</h4>
            <div className="flex items-center justify-between text-xs text-[#1abc9c]">
              <span className="truncate">System Director</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Section 1: Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Navigation
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("admissions");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "admissions"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap size={17} />
                  <span>Admissions</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "admissions"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {admissions.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("students");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "students"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users size={17} />
                  <span>Student Accounts</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "students"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("courses");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={17} />
                  <span>Courses & Batches</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "courses"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {coursesCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("schedule");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "schedule"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={17} />
                  <span>Class Timetable</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "schedule"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Editor
                </span>
              </button>
            </nav>
          </div>

          {/* Section 2: Communications & Outreach */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Communications
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("contacts");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "contacts"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={17} />
                  <span>Inquiries & Feedback</span>
                </div>
                {unreadContactsCount > 0 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {unreadContactsCount}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {contacts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("news");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "news"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell size={17} />
                  <span>News & Updates</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "news"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {announcementsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("donations");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "donations"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={17} />
                  <span>Donations</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "donations"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {donations.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("subscriptions");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "subscriptions"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={17} />
                  <span>Subscriptions</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "subscriptions"
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {subscriptionsCount || 8}
                </span>
              </button>
            </nav>
          </div>

          {/* Section 3: System & Recovery */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              System & Recovery
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("visitors");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "visitors"
                    ? "bg-[#1abc9c] text-white shadow-md shadow-[#1abc9c]/25 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity size={17} />
                  <span>Visitor Traffic</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("trash");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "trash"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-extrabold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2
                    size={17}
                    className={
                      deletedAdmissions.length + deletedStudents.length > 0
                        ? "text-rose-400"
                        : ""
                    }
                  />
                  <span>Recycle Bin</span>
                </div>
                {deletedAdmissions.length + deletedStudents.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {deletedAdmissions.length + deletedStudents.length}
                  </span>
                )}
              </button>

              <a
                href="/admissions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={17} />
                  <span>Public Form</span>
                </div>
                <ArrowUpRight size={13} className="text-slate-500" />
              </a>

              <a
                href="/student/portal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap size={17} />
                  <span>Student Portal</span>
                </div>
                <ArrowUpRight size={13} className="text-slate-500" />
              </a>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-700/60 bg-[#182430] shrink-0 space-y-2">
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              MongoDB Atlas
            </span>
            <span className="text-emerald-400 font-bold">Connected</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN DASHBOARD WORKSPACE ==================== */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              title="Open Navigation"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={
                  activeTab === "trash"
                    ? trashSearchQuery
                    : activeTab === "students"
                    ? studentsSearch
                    : activeTab === "contacts"
                    ? contactsSearch
                    : activeTab === "donations"
                    ? donationSearchQuery
                    : admissionsSearch
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeTab === "trash") setTrashSearchQuery(val);
                  else if (activeTab === "students") setStudentsSearch(val);
                  else if (activeTab === "contacts") setContactsSearch(val);
                  else if (activeTab === "donations") setDonationSearchQuery(val);
                  else setAdmissionsSearch(val);
                }}
                placeholder={
                  activeTab === "trash"
                    ? "Search deleted records by name, course..."
                    : activeTab === "students"
                    ? "Search students by name, email, PRN..."
                    : activeTab === "contacts"
                    ? "Search inquiries by name, message..."
                    : activeTab === "donations"
                    ? "Search donations by donor name, email..."
                    : "Search admissions by student name, phone, PRN, course..."
                }
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1abc9c]/30 focus:border-[#1abc9c] transition"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Cloud Sync
            </span>

            <button
              onClick={() => setShowAddAdmissionModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Admission</span>
            </button>

            <button
              onClick={() => setShowAddDonationModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Plus size={14} />
              <span>Donation</span>
            </button>

            <button
              onClick={loadAllDashboardData}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Dashboard Data"
            >
              <RotateCcw size={16} className={loading ? "animate-spin text-[#1abc9c]" : ""} />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setActiveTab("contacts")}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition relative"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadContactsCount + deletedAdmissions.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadContactsCount + deletedAdmissions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-[#1abc9c] text-white font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Canvas */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          {/* Breadcrumb Header Bar (Matches Flat Able) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-sans text-slate-800 capitalize tracking-tight">
                {activeTab === "admissions"
                  ? "Dashboard Analytics & Admissions"
                  : activeTab === "students"
                  ? "Student Accounts & PRN Directory"
                  : activeTab === "subscriptions"
                  ? "Subscribers & Monthly Memberships"
                  : activeTab === "courses"
                  ? "Courses & Batch Allocation"
                  : activeTab === "news"
                  ? "News & Announcements Management"
                  : activeTab === "donations"
                  ? "Donations & Campaign Contributions"
                  : activeTab === "contacts"
                  ? "Inquiries & Website Feedback"
                  : activeTab === "visitors"
                  ? "Live Visitor Analytics"
                  : "Recycle Bin & Data Recovery"}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="cursor-pointer hover:text-[#1abc9c]" onClick={() => setActiveTab("admissions")}>
                  🏠 Home
                </span>
                <span>/</span>
                <span>Dashboard Analytics</span>
                <span>/</span>
                <span className="text-[#1abc9c] font-bold capitalize">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAllDashboardData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
              >
                <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
                <span>Sync Data</span>
              </button>

              <button
                onClick={() => {
                  if (activeTab === "donations") exportDonationsToCsv();
                  else if (activeTab === "students") exportStudentsToCsv();
                  else exportAdmissionsToCsv();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* ==================== FLAT ABLE KPI METRIC WIDGETS ==================== */}
          {activeTab === "admissions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Widget 1: 2x2 Multi-Stat Quadrant Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
                {/* Quadrant 1: Visitors */}
                <div
                  onClick={() => setActiveTab("visitors")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-teal-50 text-[#1abc9c] flex items-center justify-center shrink-0">
                    <Eye size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {visitorStats.today}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      VISITORS
                    </div>
                  </div>
                </div>

                {/* Quadrant 2: Verified Volume */}
                <div
                  onClick={() => setActiveTab("admissions")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {admissions.filter((a) => a.status === "completed").length}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      VERIFIED
                    </div>
                  </div>
                </div>

                {/* Quadrant 3: Total Files / Admissions */}
                <div
                  onClick={() => setActiveTab("admissions")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {admissions.length}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      FILES
                    </div>
                  </div>
                </div>

                {/* Quadrant 4: Inquiries / Mails */}
                <div
                  onClick={() => setActiveTab("contacts")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {contacts.length}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      MAILS
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: 2x2 Multi-Stat Quadrant Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
                {/* Quadrant 1: Students */}
                <div
                  onClick={() => setActiveTab("students")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Share2 size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {students.length}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      STUDENTS
                    </div>
                  </div>
                </div>

                {/* Quadrant 2: Network / Batches */}
                <div
                  onClick={() => setActiveTab("courses")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wifi size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {coursesCount}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      BATCHES
                    </div>
                  </div>
                </div>

                {/* Quadrant 3: Returns / Recycle Bin */}
                <div
                  onClick={() => setActiveTab("trash")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <RotateCcw size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {deletedAdmissions.length + deletedStudents.length}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      IN TRASH
                    </div>
                  </div>
                </div>

                {/* Quadrant 4: Donations / Orders */}
                <div
                  onClick={() => setActiveTab("donations")}
                  className="p-5 hover:bg-slate-50/60 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-sans text-slate-800">
                      {donations.length}
                    </div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      DONATIONS
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Big Sparkline / Support Requests Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs p-6 flex flex-col justify-between md:col-span-2 xl:col-span-1">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold font-sans text-slate-800">
                    {admissions.length + contacts.length}
                  </div>
                  <span className="text-xs font-bold text-[#1abc9c] bg-[#1abc9c]/10 px-2.5 py-1 rounded-full">
                    Active Flow
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-700 mt-1">Applications & Inquiries</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total student applications and inquiries processed this season.
                </p>
              </div>

              {/* Sparkline Wave Chart (SVG) */}
              <div className="my-4 relative h-16 w-full">
                <svg
                  viewBox="0 0 300 70"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1abc9c" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#1abc9c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,50 Q40,15 80,40 T160,25 T240,45 T300,20 L300,70 L0,70 Z"
                    fill="url(#waveGradient)"
                  />
                  <path
                    d="M0,50 Q40,15 80,40 T160,25 T240,45 T300,20"
                    fill="none"
                    stroke="#1abc9c"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Split 3 bottom metric counters */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 pt-3 border-t border-slate-100 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-600">
                    {admissions.filter((a) => a.status === "completed").length}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">Verified</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-500">
                    {admissions.filter((a) => a.status === "pending").length}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">Review</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-500">
                    {unreadContactsCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">Inquiries</div>
                </div>
              </div>
            </div>

            {/* Widget 4: Solid Teal Accent Card (#1abc9c) */}
            <div className="rounded-2xl bg-[#1abc9c] text-white p-6 shadow-sm flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 text-white">
                <Sparkles size={28} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold font-sans">
                  ₹{stats.total_amount.toLocaleString("en-IN")}
                </div>
                <div className="text-xs font-semibold text-white/90 mt-0.5">
                  Total Funds Raised & Verified Admissions
                </div>
              </div>
            </div>

            {/* Widget 5: Solid Green/Emerald Accent Card (#2ecc71) */}
            <div className="rounded-2xl bg-[#2ecc71] text-white p-6 shadow-sm flex items-center gap-5 md:col-span-2 xl:col-span-2">
              <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 text-white">
                <Award size={28} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold font-sans">
                  {coursesCount} Active Courses & Batches
                </div>
                <div className="text-xs font-semibold text-white/90 mt-0.5">
                  100% Batches & Real-Time Seat Tracking Active
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ==================== SECONDARY SEGMENTED TABS ==================== */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-2">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl gap-1 overflow-x-auto max-w-full scrollbar-none">
              <button
                onClick={() => setActiveTab("admissions")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "admissions"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap size={15} />
                <span>Admissions</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 font-mono">
                  {admissions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "students"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users size={15} />
                <span>Students Directory</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 font-mono">
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("courses")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen size={15} />
                <span>Courses & Batches</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-mono font-bold">
                  {coursesCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "schedule"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock size={15} />
                <span>Class Timetable</span>
              </button>

              <button
                onClick={() => setActiveTab("news")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "news"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bell size={15} />
                <span>News & Updates</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-[10px] text-amber-900 font-mono font-bold">
                  {announcementsCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("donations")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "donations"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Heart size={15} />
                <span>Donations</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 font-mono">
                  {donations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "subscriptions"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles size={15} />
                <span>Subscriptions</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-mono font-bold">
                  {subscriptionsCount || 8}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("contacts")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "contacts"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare size={15} />
                <span>Inquiries</span>
                {unreadContactsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                    {unreadContactsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("visitors")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "visitors"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity size={15} />
                <span>Visitor Traffic</span>
              </button>

              <button
                onClick={() => setActiveTab("trash")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === "trash"
                    ? "bg-rose-600 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Trash2
                  size={15}
                  className={deletedAdmissions.length + deletedStudents.length > 0 ? "text-rose-500" : ""}
                />
                <span>Recycle Bin</span>
                {deletedAdmissions.length + deletedStudents.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold animate-pulse">
                    {deletedAdmissions.length + deletedStudents.length}
                  </span>
                )}
              </button>
            </div>
          </div>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                          Course & Batch Live Enrollment Matrix
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Live Sync
                        </span>
                        {mongoStatus?.connected ? (
                          <span
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                            title="New student admissions are active on MongoDB Atlas"
                          >
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            MongoDB Atlas: Active
                          </span>
                        ) : mongoStatus?.hasPlaceholder ? (
                          <span
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5"
                            title="MongoDB URI contains <db_password> placeholder. Update .env to activate MongoDB Atlas directly."
                          >
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            MongoDB: Set Password in .env
                          </span>
                        ) : null}
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
                      admissionCourseFilter.toLowerCase() ===
                      (grp.courseId || "").toLowerCase();
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
                {/* Header with Title & Admissions Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 mb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#b5623b]">
                      Verified Course Admissions Directory
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#1b2b25] mt-1">
                      Enrolled Student Admissions ({admissions.length})
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Official verified records of students enrolled in Japanese, German, English, and French batches.
                    </p>
                  </div>
                </div>

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

                    {/* Reload Live Data from Database */}
                    <button
                      onClick={() => loadAdmissions(true)}
                      disabled={admissionsLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition cursor-pointer disabled:opacity-50"
                      title="Fetch live records directly from MongoDB Atlas"
                    >
                      <RotateCcw size={13} className={admissionsLoading ? "animate-spin text-blue-600" : ""} />
                      <span>Reload Data ({admissions.length})</span>
                    </button>

                    {/* Export CSV */}
                    <button
                      onClick={exportAdmissionsToCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                      title="Download admissions CSV spreadsheet"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>

                    {/* Add New Admission Button */}
                    <button
                      onClick={() => handleOpenAddAdmissionForStudent()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b2b25] hover:bg-[#253a32] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Add new student course admission"
                    >
                      <UserPlus size={14} className="text-[#fedb41]" />
                      <span>+ New Admission</span>
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
                          <th className="px-4 py-3.5">Payment / Fee Status</th>
                          <th className="px-4 py-3.5">Email Status</th>
                          <th className="px-4 py-3.5">Documents Attached</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5">Submitted Date</th>
                          <th className="px-4 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredAdmissions.map((adm) => {
                          const prnMatch = adm.message?.match(/PRN:\s*([A-Za-z0-9-]+)/i);
                          let studentPrn = prnMatch && prnMatch[1] ? prnMatch[1] : (adm.message?.match(/PMF2026-\d+/) ? adm.message.match(/PMF2026-\d+/)![0] : "");
                          if (!studentPrn && adm.message && adm.message.trim().startsWith("{")) {
                            try {
                              const p = JSON.parse(adm.message);
                              if (p.prn) studentPrn = p.prn;
                            } catch {}
                          }

                          const matchStd = students.find(
                            (s) =>
                              (s.email && adm.email && s.email.toLowerCase() === adm.email.toLowerCase()) ||
                              (s.phone && adm.phone && s.phone.replace(/\D/g, "") === adm.phone.replace(/\D/g, "")) ||
                              (studentPrn && s.prn && s.prn === studentPrn)
                          );

                          return (
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
                                    {(adm.name || "?").charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-[#1b2b25] text-sm truncate">
                                    {adm.name}
                                  </div>
                                  <div className="text-[11px] text-stone-600 truncate font-medium">
                                    {adm.email || "No email"}
                                  </div>
                                  {adm.phone && (
                                    <div className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                                      <Phone size={10} className="text-stone-400" /> {adm.phone}
                                    </div>
                                  )}
                                  {studentPrn && (
                                    <div className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                                      PRN: {studentPrn}
                                    </div>
                                  )}
                                  {(() => {
                                    const admDob =
                                      adm.dob ||
                                      (adm as any).date_of_birth ||
                                      adm.message?.match(/DOB:\s*([0-9\-/]+)/i)?.[1]?.trim() ||
                                      matchStd?.dob;
                                    return admDob ? (
                                      <div className="text-[10px] text-amber-800 flex items-center gap-1 mt-0.5 font-medium" title={`Date of Birth: ${admDob}`}>
                                        <Calendar size={10} className="text-[#b5623b]" />
                                        <span>DOB: {admDob}</span>
                                      </div>
                                    ) : null;
                                  })()}
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
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Education */}
                            <td className="px-4 py-3.5">
                              <span className="inline-block bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md text-[11px] mb-1">
                                {adm.education || "Student"}
                              </span>
                              <div className="text-stone-500 text-[11px] truncate max-w-[170px]" title={adm.college_name}>
                                {adm.college_name || "N/A"}
                              </div>
                            </td>

                            {/* Payment / Fee Status */}
                            <td className="px-4 py-3.5">
                              {adm.payment_id && adm.payment_id.trim().length > 0 ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                    <span>₹{Number(adm.amount || 0).toLocaleString("en-IN")} Paid</span>
                                  </span>
                                  <div className="text-[10px] text-stone-400 font-mono truncate max-w-[150px]" title={adm.payment_id}>
                                    Txn: {adm.payment_id}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                    <XCircle size={12} className="text-rose-600 shrink-0" />
                                    <span>Payment Unpaid / ₹0</span>
                                  </span>
                                  <div className="text-[10px] text-amber-700 font-medium">
                                    Pending Fee: ₹{Number(adm.amount || 0).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Email Status & Send Email Action */}
                            <td className="px-4 py-3.5">
                              {isEmailSentForAdmission(adm) ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                    <MailCheck size={12} className="text-emerald-600 shrink-0" />
                                    <span>Email Sent ✓</span>
                                  </span>
                                  <button
                                    onClick={() => handleSendAdmissionEmail(adm)}
                                    disabled={sendingEmailId === adm.id}
                                    className="text-[10px] text-stone-500 hover:text-emerald-700 underline font-medium flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                                    title="Resend confirmation email"
                                  >
                                    <RotateCcw size={10} className={sendingEmailId === adm.id ? "animate-spin text-emerald-600" : ""} />
                                    <span>{sendingEmailId === adm.id ? "Sending..." : "Resend"}</span>
                                  </button>
                                </div>
                              ) : adm.email && adm.email.includes("@") ? (
                                <div className="space-y-1.5">
                                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                    <MailWarning size={12} className="text-rose-500 shrink-0" />
                                    <span>Not Sent</span>
                                  </span>
                                  <button
                                    onClick={() => handleSendAdmissionEmail(adm)}
                                    disabled={sendingEmailId === adm.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition disabled:opacity-50 cursor-pointer"
                                    title={`Send official confirmation email to ${adm.email}`}
                                  >
                                    {sendingEmailId === adm.id ? (
                                      <RotateCcw size={11} className="animate-spin" />
                                    ) : (
                                      <Send size={11} />
                                    )}
                                    <span>{sendingEmailId === adm.id ? "Sending..." : "Send Email"}</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">No email</span>
                              )}
                            </td>

                            {/* Documents */}
                            <td className="px-4 py-3.5">
                              {(() => {
                                const matchStd = students.find(
                                  (s) =>
                                    (s.email && adm.email && s.email.toLowerCase() === adm.email.toLowerCase()) ||
                                    (s.phone && adm.phone && s.phone.replace(/\D/g, "") === adm.phone.replace(/\D/g, "")) ||
                                    (adm.message && s.prn && adm.message.includes(s.prn))
                                );
                                const eduDoc = adm.education_proof || adm.marksheetUrl || matchStd?.education_proof || (matchStd as any)?.marksheetUrl;
                                const idDoc = adm.identity_proof || (adm as any).identityProofUrl || matchStd?.identity_proof;
                                const casteDoc = adm.caste_certificate || (adm as any).casteCertUrl || matchStd?.caste_certificate;

                                return (
                                  <div className="flex flex-col gap-1 text-[11px]">
                                    {eduDoc && (
                                      <button
                                        onClick={() =>
                                          setViewingDoc({
                                            title: `${adm.name} - Marksheet / Education`,
                                            url: eduDoc,
                                            isImage: !eduDoc.startsWith("data:application/pdf"),
                                          })
                                        }
                                        className="inline-flex items-center gap-1 text-blue-700 hover:underline font-semibold cursor-pointer"
                                        title="View Marksheet / Qualification"
                                      >
                                        <GraduationCap size={12} /> Marksheet
                                      </button>
                                    )}
                                    {idDoc && (
                                      <button
                                        onClick={() =>
                                          setViewingDoc({
                                            title: `${adm.name} - ID Proof`,
                                            url: idDoc,
                                            isImage: !idDoc.startsWith("data:application/pdf"),
                                          })
                                        }
                                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold cursor-pointer"
                                        title="View ID Proof"
                                      >
                                        <FileCheck size={12} /> ID Proof
                                      </button>
                                    )}
                                    {casteDoc && (
                                      <button
                                        onClick={() =>
                                          setViewingDoc({
                                            title: `${adm.name} - Caste Certificate`,
                                            url: casteDoc,
                                            isImage: !casteDoc.startsWith("data:application/pdf"),
                                          })
                                        }
                                        className="inline-flex items-center gap-1 text-amber-700 hover:underline font-semibold cursor-pointer"
                                        title="View Caste Certificate"
                                      >
                                        <Award size={12} /> Caste Cert
                                      </button>
                                    )}
                                    {!eduDoc && !idDoc && !casteDoc && (
                                      <span className="text-stone-300 italic text-[10px]">None attached</span>
                                    )}
                                  </div>
                                );
                              })()}
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
                                  className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                  title="View Full Application Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditAdmission(adm)}
                                  className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                                  title="Edit Application Information"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  disabled={deletingAdmissionId === adm.id}
                                  onClick={() => handleDeleteAdmission(adm.id)}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
                                  title="Delete Application"
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
                      <span>Course Enrolled ({enrolledStudentsCount})</span>
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
                      <span>Registered Only ({registeredOnlyStudentsCount})</span>
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
                          <th className="px-4 py-3.5">Documents</th>
                          <th className="px-4 py-3.5 text-center">Admissions</th>
                          <th className="px-4 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredStudents.map((s) => {
                          const userAdmissions = studentToAdmissionsMap.get(s.id) || [];

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
                                  {s.photo || s.avatar ? (
                                    <img
                                      src={s.photo || s.avatar}
                                      alt={s.name}
                                      onClick={() =>
                                        setViewingDoc({
                                          title: `${s.name} - Photo`,
                                          url: (s.photo || s.avatar)!,
                                          isImage: true,
                                        })
                                      }
                                      className="h-8 w-8 rounded-full object-cover border border-emerald-300 shadow-2xs cursor-pointer hover:scale-105 transition shrink-0"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                      {(s.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                  )}
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
                                {s.dob && (
                                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                                    <Calendar size={12} className="text-emerald-600" />
                                    <span>DOB: {s.dob}</span>
                                  </div>
                                )}
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

                              {/* Documents */}
                              <td className="px-4 py-3.5">
                                {(() => {
                                  const admRec = userAdmissions[0] || admissions.find(
                                    (a) =>
                                      (a.email && s.email && a.email.toLowerCase() === s.email.toLowerCase()) ||
                                      (a.phone && s.phone && a.phone.replace(/\D/g, "") === s.phone.replace(/\D/g, "")) ||
                                      (a.message && s.prn && a.message.includes(s.prn))
                                  );
                                  const eduDoc = s.education_proof || (s as any).marksheetUrl || admRec?.education_proof || admRec?.marksheetUrl;
                                  const idDoc = s.identity_proof || (s as any).identityProofUrl || admRec?.identity_proof;
                                  const casteDoc = s.caste_certificate || (s as any).casteCertUrl || admRec?.caste_certificate;

                                  return (
                                    <div className="flex flex-col gap-1 text-[11px]">
                                      {eduDoc && (
                                        <button
                                          onClick={() =>
                                            setViewingDoc({
                                              title: `${s.name} - Marksheet / Education`,
                                              url: eduDoc,
                                              isImage: !eduDoc.startsWith("data:application/pdf"),
                                            })
                                          }
                                          className="inline-flex items-center gap-1 text-blue-700 hover:underline font-semibold cursor-pointer"
                                          title="View Marksheet / Qualification"
                                        >
                                          <GraduationCap size={12} />
                                          <span>Marksheet</span>
                                        </button>
                                      )}
                                      {idDoc && (
                                        <button
                                          onClick={() =>
                                            setViewingDoc({
                                              title: `${s.name} - Identity Proof`,
                                              url: idDoc,
                                              isImage: !idDoc.startsWith("data:application/pdf"),
                                            })
                                          }
                                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold cursor-pointer"
                                          title="View ID Proof"
                                        >
                                          <FileCheck size={12} />
                                          <span>ID Proof</span>
                                        </button>
                                      )}
                                      {casteDoc && (
                                        <button
                                          onClick={() =>
                                            setViewingDoc({
                                              title: `${s.name} - Caste Certificate`,
                                              url: casteDoc,
                                              isImage: !casteDoc.startsWith("data:application/pdf"),
                                            })
                                          }
                                          className="inline-flex items-center gap-1 text-amber-700 hover:underline font-semibold cursor-pointer"
                                          title="View Caste Certificate"
                                        >
                                          <Award size={12} />
                                          <span>Caste Cert</span>
                                        </button>
                                      )}
                                      {!eduDoc && !idDoc && !casteDoc && (
                                        <span className="text-stone-300 italic text-[10px]">None attached</span>
                                      )}
                                    </div>
                                  );
                                })()}
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
                                  <div className="space-y-1 inline-flex flex-col items-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                      <User size={10} className="text-stone-400" />
                                      <span>Registered Only (No Course)</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddAdmissionForStudent(s)}
                                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                                    >
                                      + Enroll in Course
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleOpenAddAdmissionForStudent(s)}
                                    className="p-1.5 text-[#b5623b] hover:bg-orange-50 rounded-lg transition"
                                    title="Add Course Admission for this Student"
                                  >
                                    <UserPlus size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditStudent(s)}
                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                    title="Edit Student Information & Documents"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setSelectedStudent(s)}
                                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
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

          {/* ==================== TAB: SUBSCRIPTIONS & PARIVATTAN SATHI ==================== */}
          {activeTab === "subscriptions" && (
            <SubscriptionsManager />
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
                            {(c.name || "?").charAt(0).toUpperCase()}
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

          {/* ==================== TAB SCHEDULE: CLASS TIMETABLE & GUIDELINES MANAGEMENT ==================== */}
          {activeTab === "schedule" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ScheduleManager />
            </div>
          )}

          {/* ==================== TAB NEWS: NEWS & ANNOUNCEMENTS MANAGEMENT ==================== */}
          {activeTab === "news" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <NewsAndAnnouncementsManager />
            </div>
          )}

          {/* ==================== TAB TRASH: RECYCLE BIN & DATA RESTORATION ==================== */}
          {activeTab === "trash" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <TrashManager
                onAdmissionRestored={() => {
                  loadAdmissions();
                  loadBatchSeats();
                  setDeletedAdmissions(getDeletedAdmissions());
                }}
                onStudentRestored={() => {
                  loadStudents();
                  setDeletedStudents(getDeletedStudents());
                }}
                onNavigateToAdmissions={() => setActiveTab("admissions")}
                onNavigateToStudents={() => setActiveTab("students")}
              />
            </div>
          )}
        </main>
      </div>

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
                    {(selectedAdmission.name || "?").charAt(0).toUpperCase()}
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
                        {selectedAdmission.payment_id && selectedAdmission.payment_id.trim().length > 0 ? (
                          <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Fee: ₹{Number(selectedAdmission.amount || 0).toLocaleString("en-IN")} Paid</span>
                          </div>
                        ) : (
                          <div className="text-xs text-rose-600 font-bold flex items-center gap-1">
                            <XCircle size={13} />
                            <span>Fee: ₹{Number(selectedAdmission.amount || 0).toLocaleString("en-IN")} Unpaid / Pending</span>
                          </div>
                        )}
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

              {/* Payment & Source Info */}
              <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50 text-xs">
                <span className="text-stone-400 block font-bold uppercase mb-2">Payment & Entry Source</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-stone-400 block font-bold text-[10px]">AMOUNT</span>
                    <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                      ₹{Number(selectedAdmission.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold text-[10px]">PAYMENT / TXN ID</span>
                    <span className="font-mono font-semibold text-stone-800 text-[11px] mt-0.5 block break-all">
                      {selectedAdmission.payment_id || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold text-[10px]">ENTRY SOURCE</span>
                    {(() => {
                      const pid = selectedAdmission.payment_id || "";
                      const msg = selectedAdmission.message || "";
                      let source = "Unknown";
                      let badge = "bg-stone-100 text-stone-600 border-stone-200";
                      let icon = "❓";

                      if (pid.startsWith("PAY_ADM_")) {
                        source = "Admin Added (Manual)";
                        badge = "bg-amber-50 text-amber-800 border-amber-200";
                        icon = "🛡️";
                      } else if (msg.includes("Student Portal") || msg.includes("Enrolled via Student Portal")) {
                        source = "Student Portal";
                        badge = "bg-blue-50 text-blue-800 border-blue-200";
                        icon = "🎓";
                      } else if (pid === "OFFLINE_RECORD") {
                        source = "Offline Entry";
                        badge = "bg-stone-100 text-stone-700 border-stone-300";
                        icon = "📋";
                      } else if (pid.startsWith("pay_") || pid.startsWith("razorpay") || pid.startsWith("order_") || pid.length > 15) {
                        source = "Admission Form (Online Payment)";
                        badge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        icon = "💳";
                      } else if (pid) {
                        source = "Admission Form (UPI/Manual)";
                        badge = "bg-teal-50 text-teal-800 border-teal-200";
                        icon = "📱";
                      }

                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] border mt-0.5 ${badge}`}>
                          <span>{icon}</span>
                          <span>{source}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold text-[10px]">CREATED AT</span>
                    <span className="font-semibold text-stone-800 text-[11px] mt-0.5 block">
                      {selectedAdmission.created_at
                        ? new Date(selectedAdmission.created_at).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
                {selectedAdmission.message && (
                  <div className="mt-3 pt-2 border-t border-stone-200">
                    <span className="text-stone-400 block font-bold text-[10px]">RAW MESSAGE / METADATA</span>
                    <p className="text-[11px] text-stone-600 mt-1 font-mono bg-white p-2 rounded-lg border border-stone-200 whitespace-pre-wrap break-all max-h-[80px] overflow-y-auto">
                      {selectedAdmission.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Personal & Academic Details: DOB, Gender, Education, College */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50">
                  <span className="text-stone-400 block font-bold uppercase text-[10px] flex items-center gap-1">
                    <Calendar size={11} className="text-[#b5623b]" /> Date of Birth (DOB)
                  </span>
                  <span className="font-semibold text-stone-800 text-sm mt-0.5 block">
                    {selectedAdmission.dob ||
                      (selectedAdmission as any).date_of_birth ||
                      selectedAdmission.message?.match(/DOB:\s*([0-9\-/]+)/i)?.[1]?.trim() ||
                      students.find(s => (s.email && s.email.toLowerCase() === selectedAdmission.email?.toLowerCase()) || (s.phone && s.phone === selectedAdmission.phone))?.dob ||
                      "Not specified"}
                  </span>
                </div>
                <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50">
                  <span className="text-stone-400 block font-bold uppercase text-[10px]">Gender</span>
                  <span className="font-semibold text-stone-800 text-sm mt-0.5 block">
                    {selectedAdmission.gender || "Not specified"}
                  </span>
                </div>
                <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50">
                  <span className="text-stone-400 block font-bold uppercase text-[10px]">Education</span>
                  <span className="font-semibold text-stone-800 text-sm mt-0.5 block">
                    {selectedAdmission.education || "N/A"}
                  </span>
                </div>
                <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50">
                  <span className="text-stone-400 block font-bold uppercase text-[10px]">College Name</span>
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
                {(() => {
                  const matchStudent = students.find(
                    (s) =>
                      (s.email && selectedAdmission.email && s.email.toLowerCase() === selectedAdmission.email.toLowerCase()) ||
                      (s.phone && selectedAdmission.phone && s.phone.replace(/\D/g, "") === selectedAdmission.phone.replace(/\D/g, "")) ||
                      (selectedAdmission.message && s.prn && selectedAdmission.message.includes(s.prn))
                  );

                  const photoDoc = selectedAdmission.photo || (selectedAdmission as any).photoUrl || matchStudent?.photo || matchStudent?.avatar;
                  const idDoc = selectedAdmission.identity_proof || (selectedAdmission as any).identityProofUrl || matchStudent?.identity_proof;
                  const eduDoc = selectedAdmission.education_proof || selectedAdmission.marksheetUrl || matchStudent?.education_proof || (matchStudent as any)?.marksheetUrl;
                  const casteDoc = selectedAdmission.caste_certificate || (selectedAdmission as any).casteCertUrl || matchStudent?.caste_certificate;

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* Photo */}
                      <div className="rounded-xl border border-stone-200 p-3 bg-white text-center flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-stone-700 block text-xs">Passport Photo</span>
                          <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                            {selectedAdmission.photo_name || (photoDoc ? "Photo Attached" : "None")}
                          </span>
                        </div>
                        {photoDoc ? (
                          <div className="mt-2.5 flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedAdmission.name} - Photo`,
                                  url: photoDoc,
                                  isImage: true,
                                })
                              }
                              className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-[#b5623b] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <a
                              href={photoDoc}
                              download={`${selectedAdmission.name}_photo`}
                              className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Download Photo"
                            >
                              <Download size={12} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic mt-2.5 block">Not uploaded</span>
                        )}
                      </div>

                      {/* ID Proof */}
                      <div className="rounded-xl border border-stone-200 p-3 bg-white text-center flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-stone-700 block text-xs">Identity Proof</span>
                          <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                            {selectedAdmission.identity_proof_name || (idDoc ? "ID Attached" : "None")}
                          </span>
                        </div>
                        {idDoc ? (
                          <div className="mt-2.5 flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedAdmission.name} - Identity Proof`,
                                  url: idDoc,
                                  isImage: !idDoc.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <a
                              href={idDoc}
                              download={`${selectedAdmission.name}_id_proof`}
                              className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Download ID Proof"
                            >
                              <Download size={12} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic mt-2.5 block">Not uploaded</span>
                        )}
                      </div>

                      {/* Marksheet / Education Proof */}
                      <div className="rounded-xl border border-blue-200 p-3 bg-blue-50/30 text-center flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-blue-900 block text-xs">Marksheet / Education</span>
                          <span className="text-[10px] text-blue-600 block truncate mt-0.5">
                            {selectedAdmission.education_proof_name || (eduDoc ? "Marksheet Attached" : "None")}
                          </span>
                        </div>
                        {eduDoc ? (
                          <div className="mt-2.5 flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedAdmission.name} - Marksheet / Education Proof`,
                                  url: eduDoc,
                                  isImage: !eduDoc.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <GraduationCap size={12} />
                              <span>View</span>
                            </button>
                            <a
                              href={eduDoc}
                              download={`${selectedAdmission.name}_marksheet`}
                              className="p-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800 cursor-pointer"
                              title="Download Marksheet"
                            >
                              <Download size={12} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic mt-2.5 block">Not uploaded</span>
                        )}
                      </div>

                      {/* Caste Certificate */}
                      <div className="rounded-xl border border-stone-200 p-3 bg-white text-center flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-stone-700 block text-xs">Caste Certificate</span>
                          <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                            {selectedAdmission.caste_certificate_name || (casteDoc ? "Certificate Attached" : "None")}
                          </span>
                        </div>
                        {casteDoc ? (
                          <div className="mt-2.5 flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedAdmission.name} - Caste Cert`,
                                  url: casteDoc,
                                  isImage: !casteDoc.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <a
                              href={casteDoc}
                              download={`${selectedAdmission.name}_caste_cert`}
                              className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Download Caste Certificate"
                            >
                              <Download size={12} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic mt-2.5 block">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200 flex justify-between items-center bg-stone-50">
              <button
                onClick={() => handleDeleteAdmission(selectedAdmission.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Application</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const adm = selectedAdmission;
                    setSelectedAdmission(null);
                    handleOpenEditAdmission(adm);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Edit2 size={14} />
                  <span>Edit Information</span>
                </button>
                <button
                  onClick={() => setSelectedAdmission(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
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
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center overflow-hidden border border-emerald-200">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} alt={selectedStudent.name} className="h-full w-full object-cover" />
                  ) : (
                    (selectedStudent.name || "?").charAt(0).toUpperCase()
                  )}
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
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
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
                  <span className="text-stone-400 block font-bold flex items-center gap-1">
                    <Calendar size={11} className="text-emerald-700" /> Date of Birth (DOB)
                  </span>
                  <span className="font-semibold text-stone-800">
                    {selectedStudent.dob || (selectedStudent as any).date_of_birth || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold">Gender</span>
                  <span className="font-semibold text-stone-800">
                    {selectedStudent.gender || "Not specified"}
                  </span>
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

              {/* Uploaded Documents List in Student Profile */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText size={13} className="text-[#b5623b]" />
                    <span>Attached Verification Documents</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = selectedStudent;
                      setSelectedStudent(null);
                      handleOpenEditStudent(cur);
                    }}
                    className="text-[11px] font-bold text-[#b5623b] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload size={11} /> Upload / Change Documents
                  </button>
                </div>

                {(() => {
                  const matchAdm = admissions.find(
                    (a) =>
                      (a.email && selectedStudent.email && a.email.toLowerCase() === selectedStudent.email.toLowerCase()) ||
                      (a.phone && selectedStudent.phone && a.phone.replace(/\D/g, "") === selectedStudent.phone.replace(/\D/g, "")) ||
                      (a.message && selectedStudent.prn && a.message.includes(selectedStudent.prn))
                  );

                  const photoDoc = selectedStudent.photo || (selectedStudent as any).photoUrl || selectedStudent.avatar || matchAdm?.photo || (matchAdm as any)?.photoUrl;
                  const photoName = selectedStudent.photo_name || matchAdm?.photo_name || (photoDoc ? "Photo Attached" : "Not Uploaded");

                  const idDoc = selectedStudent.identity_proof || (selectedStudent as any).identityProofUrl || matchAdm?.identity_proof || (matchAdm as any)?.identityProofUrl;
                  const idName = selectedStudent.identity_proof_name || matchAdm?.identity_proof_name || (idDoc ? "ID Attached" : "Not Uploaded");

                  const eduDoc = selectedStudent.education_proof || (selectedStudent as any).marksheetUrl || matchAdm?.education_proof || matchAdm?.marksheetUrl;
                  const eduName = selectedStudent.education_proof_name || (selectedStudent as any).educationProofName || matchAdm?.education_proof_name || (matchAdm as any)?.educationProofName || (eduDoc ? "Marksheet Attached" : "Not Uploaded");

                  const casteDoc = selectedStudent.caste_certificate || (selectedStudent as any).casteCertUrl || matchAdm?.caste_certificate || (matchAdm as any)?.casteCertUrl;
                  const casteName = selectedStudent.caste_certificate_name || matchAdm?.caste_certificate_name || (casteDoc ? "Certificate Attached" : "Not Uploaded");

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Photo */}
                      <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Camera size={14} className="text-stone-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-stone-800 block text-[11px]">Passport Photo</span>
                            <span className="text-[10px] text-stone-500 truncate block">
                              {photoName}
                            </span>
                          </div>
                        </div>
                        {photoDoc ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedStudent.name} - Photo`,
                                  url: photoDoc,
                                  isImage: true,
                                })
                              }
                              className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="View Photo"
                            >
                              <Eye size={13} />
                            </button>
                            <a
                              href={photoDoc}
                              download={`${selectedStudent.name}_photo`}
                              className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Download"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">None</span>
                        )}
                      </div>

                      {/* ID Proof */}
                      <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Shield size={14} className="text-stone-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-stone-800 block text-[11px]">Identity Proof</span>
                            <span className="text-[10px] text-stone-500 truncate block">
                              {idName}
                            </span>
                          </div>
                        </div>
                        {idDoc ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedStudent.name} - Identity Proof`,
                                  url: idDoc,
                                  isImage: !idDoc.startsWith("data:application/pdf"),
                                })
                              }
                              className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="View ID"
                            >
                              <Eye size={13} />
                            </button>
                            <a
                              href={idDoc}
                              download={`${selectedStudent.name}_id_proof`}
                              className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Download"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">None</span>
                        )}
                      </div>

                      {/* Education / Marksheet */}
                      <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <GraduationCap size={14} className="text-blue-700 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-blue-900 block text-[11px]">Marksheet / Education</span>
                            <span className="text-[10px] text-blue-700 truncate block">
                              {eduName}
                            </span>
                          </div>
                        </div>
                        {eduDoc ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedStudent.name} - Marksheet`,
                                  url: eduDoc,
                                  isImage: !eduDoc.startsWith("data:application/pdf"),
                                })
                              }
                              className="p-1 rounded hover:bg-blue-100 text-blue-800 cursor-pointer"
                              title="View Marksheet"
                            >
                              <Eye size={13} />
                            </button>
                            <a
                              href={eduDoc}
                              download={`${selectedStudent.name}_education_proof`}
                              className="p-1 rounded hover:bg-blue-100 text-blue-800 cursor-pointer"
                              title="Download"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">None</span>
                        )}
                      </div>

                      {/* Caste Certificate */}
                      <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Award size={14} className="text-stone-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-stone-800 block text-[11px]">Caste Certificate</span>
                            <span className="text-[10px] text-stone-500 truncate block">
                              {casteName}
                            </span>
                          </div>
                        </div>
                        {casteDoc ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${selectedStudent.name} - Caste Certificate`,
                                  url: casteDoc,
                                  isImage: !casteDoc.startsWith("data:application/pdf"),
                                })
                              }
                              className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="View Caste Cert"
                            >
                              <Eye size={13} />
                            </button>
                            <a
                              href={casteDoc}
                              download={`${selectedStudent.name}_caste_cert`}
                              className="p-1 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                              title="Download"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">None</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 px-6 border-t border-stone-200 flex flex-wrap justify-between items-center gap-2 bg-stone-50">
              <button
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Student</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenAddAdmissionForStudent(st);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Add Admission</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenEditStudent(st);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit2 size={14} />
                  <span>Edit Info & Docs</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2b. Edit Student Information & Documents Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 px-6 border-b border-stone-200 flex justify-between items-center bg-[#1b2b25] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 text-[#fedb41] font-bold flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Edit Student Information & Documents
                  </h3>
                  <p className="text-[11px] text-stone-300 font-mono">
                    PRN: {studentFormData.prn || editingStudent.prn}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 hover:bg-white/10 rounded-full text-stone-300 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveStudentEdit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-white">
              {/* Section 1: Personal & Contact Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <User size={14} /> 1. Student Personal & Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentFormData.name || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-medium"
                      placeholder="Student full name"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      PRN Number (Student ID)
                    </label>
                    <input
                      type="text"
                      value={studentFormData.prn || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, prn: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono"
                      placeholder="e.g. PMF2026-1234"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={studentFormData.email || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={studentFormData.phone || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#b5623b]" />
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={studentFormData.dob || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, dob: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={studentFormData.gender || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, gender: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={studentFormData.city || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, city: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. Pune"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={studentFormData.state || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, state: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Password (Minimum 6 characters — fill only to update password)
                    </label>
                    <input
                      type="text"
                      value={studentFormData.password || ""}
                      onChange={(e) =>
                        setStudentFormData({ ...studentFormData, password: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono text-xs"
                      placeholder="Leave unchanged or enter new student password"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Upload, Change & Manage Documents */}
              <div className="pt-2 border-t border-stone-100">
                <div className="mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] flex items-center gap-1.5">
                    <Upload size={14} /> 2. Upload, Change & Replace Verification Documents
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Upload new files or change/replace already uploaded documents (JPG, PNG, PDF up to 5MB).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Document Card 1: Passport Photo */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Camera size={14} className="text-[#b5623b]" />
                          <span>Student Photo</span>
                        </span>
                        {studentFormData.photo ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {studentFormData.photo && (
                        <div className="mb-2 flex items-center gap-2 p-1.5 bg-white rounded-xl border border-stone-200">
                          <img
                            src={studentFormData.photo}
                            alt="Student preview"
                            className="h-10 w-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <span className="text-[11px] font-mono text-stone-600 truncate flex-1">
                            {studentFormData.photo_name || "passport_photo.jpg"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {studentFormData.photo && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${studentFormData.name || "Student"} - Photo`,
                                  url: studentFormData.photo!,
                                  isImage: true,
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentFormData((prev) => ({
                                  ...prev,
                                  photo: "",
                                  photo_name: "",
                                  avatar: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{studentFormData.photo ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setStudentFormData((prev) => ({
                                ...prev,
                                photo: dataUrl,
                                photo_name: name,
                                avatar: dataUrl,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Document Card 2: Identity Proof */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Shield size={14} className="text-[#b5623b]" />
                          <span>Identity Proof (Aadhaar / Voter)</span>
                        </span>
                        {studentFormData.identity_proof ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {studentFormData.identity_proof && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          📄 {studentFormData.identity_proof_name || "id_proof_document"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {studentFormData.identity_proof && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${studentFormData.name || "Student"} - Identity Proof`,
                                  url: studentFormData.identity_proof!,
                                  isImage: !studentFormData.identity_proof!.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentFormData((prev) => ({
                                  ...prev,
                                  identity_proof: "",
                                  identity_proof_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{studentFormData.identity_proof ? "Change File" : "Upload ID Proof"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setStudentFormData((prev) => ({
                                ...prev,
                                identity_proof: dataUrl,
                                identity_proof_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Document Card 3: Marksheet / Education Proof */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-[#b5623b]" />
                          <span>Marksheet / Qualification</span>
                        </span>
                        {studentFormData.education_proof ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {studentFormData.education_proof && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          🎓 {studentFormData.education_proof_name || "marksheet_document"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {studentFormData.education_proof && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${studentFormData.name || "Student"} - Education Proof`,
                                  url: studentFormData.education_proof!,
                                  isImage: !studentFormData.education_proof!.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentFormData((prev) => ({
                                  ...prev,
                                  education_proof: "",
                                  education_proof_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{studentFormData.education_proof ? "Change File" : "Upload Marksheet"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setStudentFormData((prev) => ({
                                ...prev,
                                education_proof: dataUrl,
                                education_proof_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Document Card 4: Caste Certificate */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Award size={14} className="text-[#b5623b]" />
                          <span>Caste Certificate (Optional)</span>
                        </span>
                        {studentFormData.caste_certificate ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {studentFormData.caste_certificate && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          📜 {studentFormData.caste_certificate_name || "caste_certificate"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {studentFormData.caste_certificate && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${studentFormData.name || "Student"} - Caste Certificate`,
                                  url: studentFormData.caste_certificate!,
                                  isImage: !studentFormData.caste_certificate!.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentFormData((prev) => ({
                                  ...prev,
                                  caste_certificate: "",
                                  caste_certificate_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{studentFormData.caste_certificate ? "Change File" : "Upload Caste Cert"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setStudentFormData((prev) => ({
                                ...prev,
                                caste_certificate: dataUrl,
                                caste_certificate_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="px-6 py-2.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingStudent ? (
                    <>
                      <Clock size={15} className="animate-spin" />
                      <span>Saving Student & Documents...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Save Information & Documents</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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

      {/* 8. Edit Admission Application Modal */}
      {editingAdmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 px-6 border-b border-stone-200 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1b2b25]">
                    Edit Course Admission Form
                  </h3>
                  <p className="text-[11px] font-mono text-stone-400">
                    Application ID: {editingAdmission.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmission(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveAdmissionEdit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Section 1: Personal & Contact Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <User size={14} /> 1. Personal & Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={admissionFormData.name || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-medium"
                      placeholder="Student full name"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={admissionFormData.email || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={admissionFormData.phone || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={admissionFormData.gender || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, gender: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#b5623b]" />
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={admissionFormData.dob || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, dob: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Details */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <GraduationCap size={14} /> 2. Academic & Education Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Education Qualification
                    </label>
                    <input
                      type="text"
                      value={admissionFormData.education || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, education: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. 12th HSC, B.E., B.Com, Diploma, Graduate"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      College / School / Institute Name
                    </label>
                    <input
                      type="text"
                      value={admissionFormData.college_name || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, college_name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="College or university name"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Course & Batch Enrollment */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <BookOpen size={14} /> 3. Course, Batch & Admission Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Batch Dropdown */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#b5623b]" />
                        <span>Select Batch *</span>
                      </span>
                      <span className="text-[11px] text-stone-500 font-normal">
                        Choose from official batches
                      </span>
                    </label>
                    <select
                      value={admissionFormData.batch_id || admissionFormData.batchId || ""}
                      onChange={(e) => {
                        const bId = e.target.value;
                        const matched = batchSeatsList.find((b) => b.batchId === bId);
                        if (matched) {
                          setAdmissionFormData({
                            ...admissionFormData,
                            batch_id: matched.batchId,
                            batchId: matched.batchId,
                            program: `${matched.courseName} - ${matched.levelName} - ${matched.batchName}`,
                          });
                        } else {
                          setAdmissionFormData({
                            ...admissionFormData,
                            batch_id: bId,
                            batchId: bId,
                          });
                        }
                      }}
                      className="w-full rounded-xl border-2 border-amber-300/80 bg-amber-50/40 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      <option value="">-- Click to Select Course Batch --</option>
                      {batchSeatsList.map((b) => (
                        <option key={b.batchId} value={b.batchId}>
                          {b.flag} {b.courseName} | {b.levelName} | {b.batchName} ({b.time || b.days || "Regular"})
                        </option>
                      ))}
                      {admissionFormData.batch_id &&
                        !batchSeatsList.some(
                          (b) =>
                            b.batchId ===
                            (admissionFormData.batch_id || admissionFormData.batchId)
                        ) && (
                          <option
                            value={admissionFormData.batch_id || admissionFormData.batchId}
                          >
                            Custom Batch: {admissionFormData.batch_id || admissionFormData.batchId}
                          </option>
                        )}
                    </select>

                    {/* Active Selected Batch Information Banner */}
                    {(() => {
                      const activeBId =
                        admissionFormData.batch_id || admissionFormData.batchId;
                      const matched = batchSeatsList.find((b) => b.batchId === activeBId);
                      if (matched) {
                        return (
                          <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{matched.flag}</span>
                              <div>
                                <span className="font-bold text-stone-900 block text-xs">
                                  {matched.courseName} ({matched.levelName})
                                </span>
                                <span className="text-stone-600 font-medium text-[11px]">
                                  {matched.batchName}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block font-bold text-emerald-800 text-xs">
                                {matched.days ? `${matched.days} · ` : ""}
                                {matched.time}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                Batch Key: {matched.batchId}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Course / Program Title */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Course / Program Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={admissionFormData.program || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, program: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-semibold"
                      placeholder="e.g. Japanese Language Course"
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {getStoredCourses().map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            const firstBatch = batchSeatsList.find((b) => b.courseId === c.id);
                            setAdmissionFormData({
                              ...admissionFormData,
                              program: c.name || c.title,
                              batch_id: firstBatch ? firstBatch.batchId : admissionFormData.batch_id,
                              batchId: firstBatch ? firstBatch.batchId : admissionFormData.batchId,
                            });
                          }}
                          className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded cursor-pointer transition"
                        >
                          {c.flag} {c.name || c.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Batch Key */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Batch Key (System ID)
                    </label>
                    <input
                      type="text"
                      value={admissionFormData.batch_id || admissionFormData.batchId || ""}
                      onChange={(e) =>
                        setAdmissionFormData({
                          ...admissionFormData,
                          batch_id: e.target.value,
                          batchId: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono text-xs"
                      placeholder="e.g. jp-n5-morning"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Admission Status *
                    </label>
                    <select
                      value={admissionFormData.status || "completed"}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, status: e.target.value as any })
                      }
                      className={`w-full rounded-xl border px-3.5 py-2.5 outline-none font-bold ${
                        admissionFormData.status === "completed"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : admissionFormData.status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}
                    >
                      <option value="completed">Completed / Verified</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Rejected / Incomplete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Fee Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={admissionFormData.amount !== undefined ? admissionFormData.amount : 100}
                      onChange={(e) =>
                        setAdmissionFormData({
                          ...admissionFormData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono font-bold"
                      placeholder="100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Payment ID / Reference Number
                    </label>
                    <input
                      type="text"
                      value={admissionFormData.payment_id || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, payment_id: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono text-xs"
                      placeholder="e.g. pay_sandbox_123 or Razorpay payment ID"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Address Information */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <MapPin size={14} /> 4. Address Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Residential / Local Address
                    </label>
                    <textarea
                      rows={3}
                      value={admissionFormData.address || ""}
                      onChange={(e) =>
                        setAdmissionFormData({ ...admissionFormData, address: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 resize-none leading-relaxed"
                      placeholder="Enter residential address"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      rows={3}
                      value={admissionFormData.permanent_address || ""}
                      onChange={(e) =>
                        setAdmissionFormData({
                          ...admissionFormData,
                          permanent_address: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 resize-none leading-relaxed"
                      placeholder="Enter permanent address (if different)"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Verification Documents (Upload / Change / Replace) */}
              <div className="pt-2 border-t border-stone-100">
                <div className="mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] flex items-center gap-1.5">
                    <Upload size={14} /> 5. Verification Documents (Upload / Change / Replace)
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Upload, view or replace student admission documents (JPG, PNG, PDF max 5MB).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Camera size={14} className="text-[#b5623b]" />
                          <span>Applicant Photo</span>
                        </span>
                        {admissionFormData.photo || admissionFormData.photoUrl || admissionFormData.photoDataUrl ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {(admissionFormData.photo || admissionFormData.photoUrl || admissionFormData.photoDataUrl) && (
                        <div className="mb-2 flex items-center gap-2 p-1.5 bg-white rounded-xl border border-stone-200">
                          <img
                            src={admissionFormData.photo || admissionFormData.photoUrl || admissionFormData.photoDataUrl}
                            alt="Applicant"
                            className="h-10 w-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <span className="text-[11px] font-mono text-stone-600 truncate flex-1">
                            {admissionFormData.photo_name || "applicant_photo.jpg"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {(admissionFormData.photo || admissionFormData.photoUrl || admissionFormData.photoDataUrl) && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${admissionFormData.name || "Student"} - Photo`,
                                  url: (admissionFormData.photo || admissionFormData.photoUrl || admissionFormData.photoDataUrl)!,
                                  isImage: true,
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setAdmissionFormData((prev) => ({
                                  ...prev,
                                  photo: "",
                                  photo_name: "",
                                  photoUrl: "",
                                  photoDataUrl: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>
                          {admissionFormData.photo || admissionFormData.photoUrl || admissionFormData.photoDataUrl
                            ? "Change Photo"
                            : "Upload Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setAdmissionFormData((prev) => ({
                                ...prev,
                                photo: dataUrl,
                                photo_name: name,
                                photoUrl: dataUrl,
                                photoDataUrl: dataUrl,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Identity Proof */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Shield size={14} className="text-[#b5623b]" />
                          <span>Identity Proof (Aadhaar / Voter)</span>
                        </span>
                        {admissionFormData.identity_proof || admissionFormData.identityProofUrl ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {(admissionFormData.identity_proof || admissionFormData.identityProofUrl) && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          📄 {admissionFormData.identity_proof_name || admissionFormData.identityProofName || "id_proof"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {(admissionFormData.identity_proof || admissionFormData.identityProofUrl) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const url = (admissionFormData.identity_proof || admissionFormData.identityProofUrl)!;
                                setViewingDoc({
                                  title: `${admissionFormData.name || "Student"} - ID Proof`,
                                  url,
                                  isImage: !url.startsWith("data:application/pdf"),
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setAdmissionFormData((prev) => ({
                                  ...prev,
                                  identity_proof: "",
                                  identity_proof_name: "",
                                  identityProofUrl: "",
                                  identityProofName: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>
                          {admissionFormData.identity_proof || admissionFormData.identityProofUrl
                            ? "Change File"
                            : "Upload ID Proof"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setAdmissionFormData((prev) => ({
                                ...prev,
                                identity_proof: dataUrl,
                                identity_proof_name: name,
                                identityProofUrl: dataUrl,
                                identityProofName: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Marksheet */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-[#b5623b]" />
                          <span>Marksheet / Qualification</span>
                        </span>
                        {admissionFormData.education_proof || admissionFormData.marksheetUrl ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {(admissionFormData.education_proof || admissionFormData.marksheetUrl) && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          🎓 {admissionFormData.education_proof_name || admissionFormData.educationProofName || "marksheet"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {(admissionFormData.education_proof || admissionFormData.marksheetUrl) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const url = (admissionFormData.education_proof || admissionFormData.marksheetUrl)!;
                                setViewingDoc({
                                  title: `${admissionFormData.name || "Student"} - Marksheet`,
                                  url,
                                  isImage: !url.startsWith("data:application/pdf"),
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setAdmissionFormData((prev) => ({
                                  ...prev,
                                  education_proof: "",
                                  education_proof_name: "",
                                  marksheetUrl: "",
                                  educationProofName: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>
                          {admissionFormData.education_proof || admissionFormData.marksheetUrl
                            ? "Change File"
                            : "Upload Marksheet"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setAdmissionFormData((prev) => ({
                                ...prev,
                                education_proof: dataUrl,
                                education_proof_name: name,
                                marksheetUrl: dataUrl,
                                educationProofName: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Caste Certificate */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Award size={14} className="text-[#b5623b]" />
                          <span>Caste Certificate (Optional)</span>
                        </span>
                        {admissionFormData.caste_certificate || admissionFormData.casteCertUrl ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            No File
                          </span>
                        )}
                      </div>

                      {(admissionFormData.caste_certificate || admissionFormData.casteCertUrl) && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          📜 {admissionFormData.caste_certificate_name || admissionFormData.casteCertificateName || "caste_certificate"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {(admissionFormData.caste_certificate || admissionFormData.casteCertUrl) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const url = (admissionFormData.caste_certificate || admissionFormData.casteCertUrl)!;
                                setViewingDoc({
                                  title: `${admissionFormData.name || "Student"} - Caste Certificate`,
                                  url,
                                  isImage: !url.startsWith("data:application/pdf"),
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setAdmissionFormData((prev) => ({
                                  ...prev,
                                  caste_certificate: "",
                                  caste_certificate_name: "",
                                  casteCertUrl: "",
                                  casteCertificateName: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>
                          {admissionFormData.caste_certificate || admissionFormData.casteCertUrl
                            ? "Change File"
                            : "Upload Caste Cert"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setAdmissionFormData((prev) => ({
                                ...prev,
                                caste_certificate: dataUrl,
                                caste_certificate_name: name,
                                casteCertUrl: dataUrl,
                                casteCertificateName: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingAdmission(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmission}
                  className="px-6 py-2.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingAdmission ? (
                    <>
                      <Clock size={15} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Add New Admission Application Modal */}
      {showAddAdmissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 px-6 border-b border-stone-200 flex justify-between items-center bg-[#1b2b25] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 text-[#fedb41] font-bold flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Add Student Course Admission
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Directly enroll a student, assign course batch, and dispatch official confirmation email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdmissionModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-stone-300 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAdmissionSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-white">
              {/* Quick Fill From Registered Students */}
              {students.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <label className="block font-bold text-emerald-900 mb-1.5 text-xs flex items-center gap-1.5">
                    <Users size={14} className="text-emerald-700" />
                    <span>Quick Select from Registered Student Accounts (Optional)</span>
                  </label>
                  <select
                    value={selectedStudentForAdmission}
                    onChange={(e) => handleSelectStudentForAdmission(e.target.value)}
                    className="w-full rounded-xl border border-emerald-300 bg-white px-3.5 py-2.5 outline-none font-medium text-stone-900"
                  >
                    <option value="">-- Choose a registered student to auto-fill details, or enter manually below --</option>
                    {students.map((st) => (
                      <option key={st.id || st.prn} value={st.id || st.prn}>
                        {st.name} ({st.prn}) — {st.phone || st.email || "No contact"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section 1: Course & Batch Selection */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <BookOpen size={14} /> 1. Course & Batch Enrollment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Choose Course & Batch Preset *
                    </label>
                    <select
                      value={newAdmissionData.batchId}
                      onChange={(e) => handleSelectCoursePreset(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-semibold"
                    >
                      {ADMISSION_COURSE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.flag} {p.courseName} — {p.batchName} ({p.timing}) — ₹{p.fee}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Program / Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdmissionData.program}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, program: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-medium"
                      placeholder="e.g. Japanese Language (N5) - N5 (Basic) – Morning Batch"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Batch Preference / Name
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.batchPreference}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, batchPreference: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. N5 (Basic) – Morning Batch"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Class Timing
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.timing}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, timing: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. 10:00 AM – 11:30 AM"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Student Details */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <User size={14} /> 2. Student Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdmissionData.name}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-bold"
                      placeholder="Student full name"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Student PRN (Auto-generated if empty)
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.prn}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, prn: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono"
                      placeholder="e.g. PMF2026-3895"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newAdmissionData.email}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={newAdmissionData.phone}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={newAdmissionData.gender}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, gender: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#b5623b]" />
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={newAdmissionData.dob || ""}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, dob: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Qualification / Education
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.education}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, education: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. Undergraduate / Engineering"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      College / Institution Name
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.college_name}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, college_name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. SVERI College / Parivattan Institute"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      City / Address
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.address}
                      onChange={(e) =>
                        setNewAdmissionData({ ...newAdmissionData, address: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900"
                      placeholder="e.g. Pune, Maharashtra"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Fee & Payment Details */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-3 flex items-center gap-1.5">
                  <CreditCard size={14} /> 3. Payment & Enrollment Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Fee Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newAdmissionData.amount}
                      onChange={(e) =>
                        setNewAdmissionData({
                          ...newAdmissionData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={newAdmissionData.payment_method}
                      onChange={(e) =>
                        setNewAdmissionData({
                          ...newAdmissionData,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-medium"
                    >
                      <option value="Online Razorpay">Online Razorpay / Card</option>
                      <option value="UPI / QR">UPI / QR Code</option>
                      <option value="Cash / Direct Offline">Cash / Direct Offline</option>
                      <option value="NEFT / Bank Transfer">NEFT / Bank Transfer</option>
                      <option value="Scholarship / Exemption">Scholarship / Fee Exemption</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Payment / Receipt ID
                    </label>
                    <input
                      type="text"
                      value={newAdmissionData.payment_id}
                      onChange={(e) =>
                        setNewAdmissionData({
                          ...newAdmissionData,
                          payment_id: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-mono"
                      placeholder="Auto or e.g. PAY_12345"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block font-bold text-stone-700 mb-1">
                    Admission Status
                  </label>
                  <select
                    value={newAdmissionData.status}
                    onChange={(e) =>
                      setNewAdmissionData({
                        ...newAdmissionData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 outline-none focus:border-[#b5623b] focus:bg-white text-stone-900 font-bold"
                  >
                    <option value="completed">Completed & Verified (Seat Allocated)</option>
                    <option value="pending">Pending Document Verification</option>
                  </select>
                </div>
              </div>

              {/* Section 4: Student Verification Documents (Optional) */}
              <div className="pt-2 border-t border-stone-100">
                <div className="mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b5623b] flex items-center gap-1.5">
                    <Upload size={14} /> 4. Student Verification Documents (Optional - Upload / Attach)
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Attach applicant documents directly with admission (JPG, PNG, PDF up to 5MB).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Camera size={14} className="text-[#b5623b]" />
                          <span>Student Photo</span>
                        </span>
                        {newAdmissionData.photo ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            Optional
                          </span>
                        )}
                      </div>

                      {newAdmissionData.photo && (
                        <div className="mb-2 flex items-center gap-2 p-1.5 bg-white rounded-xl border border-stone-200">
                          <img
                            src={newAdmissionData.photo}
                            alt="Student preview"
                            className="h-10 w-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <span className="text-[11px] font-mono text-stone-600 truncate flex-1">
                            {newAdmissionData.photo_name || "photo.jpg"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {newAdmissionData.photo && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${newAdmissionData.name || "Student"} - Photo`,
                                  url: newAdmissionData.photo,
                                  isImage: true,
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNewAdmissionData((prev) => ({
                                  ...prev,
                                  photo: "",
                                  photo_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{newAdmissionData.photo ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setNewAdmissionData((prev) => ({
                                ...prev,
                                photo: dataUrl,
                                photo_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Identity Proof */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Shield size={14} className="text-[#b5623b]" />
                          <span>Identity Proof (Aadhaar / Voter)</span>
                        </span>
                        {newAdmissionData.identity_proof ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            Optional
                          </span>
                        )}
                      </div>

                      {newAdmissionData.identity_proof && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          📄 {newAdmissionData.identity_proof_name || "id_proof"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {newAdmissionData.identity_proof && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${newAdmissionData.name || "Student"} - ID Proof`,
                                  url: newAdmissionData.identity_proof,
                                  isImage: !newAdmissionData.identity_proof.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNewAdmissionData((prev) => ({
                                  ...prev,
                                  identity_proof: "",
                                  identity_proof_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{newAdmissionData.identity_proof ? "Change File" : "Upload ID Proof"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setNewAdmissionData((prev) => ({
                                ...prev,
                                identity_proof: dataUrl,
                                identity_proof_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Marksheet */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-[#b5623b]" />
                          <span>Marksheet / Qualification</span>
                        </span>
                        {newAdmissionData.education_proof ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            Optional
                          </span>
                        )}
                      </div>

                      {newAdmissionData.education_proof && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          🎓 {newAdmissionData.education_proof_name || "marksheet"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {newAdmissionData.education_proof && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${newAdmissionData.name || "Student"} - Marksheet`,
                                  url: newAdmissionData.education_proof,
                                  isImage: !newAdmissionData.education_proof.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNewAdmissionData((prev) => ({
                                  ...prev,
                                  education_proof: "",
                                  education_proof_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{newAdmissionData.education_proof ? "Change File" : "Upload Marksheet"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setNewAdmissionData((prev) => ({
                                ...prev,
                                education_proof: dataUrl,
                                education_proof_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Caste Certificate */}
                  <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <Award size={14} className="text-[#b5623b]" />
                          <span>Caste Certificate (Optional)</span>
                        </span>
                        {newAdmissionData.caste_certificate ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-medium text-[10px]">
                            Optional
                          </span>
                        )}
                      </div>

                      {newAdmissionData.caste_certificate && (
                        <div className="mb-2 p-1.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
                          📜 {newAdmissionData.caste_certificate_name || "caste_certificate"}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {newAdmissionData.caste_certificate && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewingDoc({
                                  title: `${newAdmissionData.name || "Student"} - Caste Certificate`,
                                  url: newAdmissionData.caste_certificate,
                                  isImage: !newAdmissionData.caste_certificate.startsWith("data:application/pdf"),
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Eye size={11} /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNewAdmissionData((prev) => ({
                                  ...prev,
                                  caste_certificate: "",
                                  caste_certificate_name: "",
                                }))
                              }
                              className="px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-600 text-[11px] font-bold"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <label className="px-3 py-1.5 rounded-xl bg-[#b5623b] hover:bg-[#9d502d] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload size={12} />
                        <span>{newAdmissionData.caste_certificate ? "Change File" : "Upload Caste Cert"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleDocumentUpload(e, (dataUrl, name) => {
                              setNewAdmissionData((prev) => ({
                                ...prev,
                                caste_certificate: dataUrl,
                                caste_certificate_name: name,
                              }));
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Notification Option */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAdmissionData.sendEmailNotification}
                    onChange={(e) =>
                      setNewAdmissionData({
                        ...newAdmissionData,
                        sendEmailNotification: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded text-[#b5623b] focus:ring-[#b5623b]"
                  />
                  <div>
                    <span className="font-bold text-[#1b2b25] block">
                      Send Official Admission Confirmation Email
                    </span>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      Automatically sends an official branded confirmation email to the student with their PRN number, batch schedule, and timetable instructions.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddAdmissionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdmission}
                  className="px-6 py-2.5 rounded-xl bg-[#1b2b25] hover:bg-[#253a32] text-white font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submittingAdmission ? (
                    <>
                      <Clock size={15} className="animate-spin text-[#fedb41]" />
                      <span>Saving Admission...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} className="text-[#fedb41]" />
                      <span>Confirm & Save Admission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
