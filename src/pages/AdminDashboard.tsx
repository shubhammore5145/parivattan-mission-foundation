import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { StudentUser } from "@/types/student";
import { getAllRegisteredStudents, deleteRegisteredStudent } from "@/lib/student-auth";
import {
  getAllBatchesSeatsList,
  updateBatchSeatCapacity,
  toggleBatchManualFull,
  resetBatchEnrollment,
  BatchSeatsStatus,
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
} from "@/lib/supabase-admin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLiveVisitors } from "@/context/LiveVisitorsContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [stats, setStats] = useState({
    total_donations: 0,
    total_amount: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<"pending" | "completed" | "failed">(
    "pending"
  );
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Donation>>({});
  const [error, setError] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
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
  const [submitting, setSubmitting] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [activeTab, setActiveTab] = useState<"donations" | "contacts" | "admissions" | "students">("donations");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Students / Users State
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsSearch, setStudentsSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Admissions State
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [admissionsSearch, setAdmissionsSearch] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [deletingAdmissionId, setDeletingAdmissionId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; url: string; isImage: boolean } | null>(null);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });

  // Live Batch Seats & Intake State
  const [batchSeatsList, setBatchSeatsList] = useState<BatchSeatsStatus[]>([]);
  const [showBatchSeatsManager, setShowBatchSeatsManager] = useState(true);
  const [editingCapacityBatchId, setEditingCapacityBatchId] = useState<string | null>(null);
  const [customCapacityInput, setCustomCapacityInput] = useState<number>(30);

  const loadBatchSeats = () => {
    setBatchSeatsList(getAllBatchesSeatsList());
  };

  const FUNDRAISING_GOAL = 2500000; // 25 Lakhs
  const { count: liveVisitors } = useLiveVisitors();

  // Export to Excel/CSV function
  const exportToExcel = () => {
    const headers = ['Donor Name', 'Email', 'Phone', 'Amount', 'Currency', 'Payment ID', 'Order ID', 'Status', 'Service', 'Date'];
    const csvData = filteredDonations.map(d => [
      d.donor_name,
      d.donor_email,
      d.donor_phone || '',
      d.amount,
      d.currency,
      d.payment_id,
      d.order_id || '',
      d.status,
      d.service_name || '',
      new Date(d.created_at).toLocaleDateString('en-IN')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie Chart Component
  const PieChartComponent = () => {
    const total = stats.completed + stats.pending + stats.failed;
    const progress = Math.min((stats.total_amount / FUNDRAISING_GOAL) * 100, 100);
    const remaining = FUNDRAISING_GOAL - stats.total_amount;
    const remainingPercent = 100 - progress;
    
    // Calculate stroke-dasharray for fundraising pie chart
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    const raisedDash = (progress / 100) * circumference;
    const remainingDash = (remainingPercent / 100) * circumference;
    
    // Status percentages
    const completedPercent = total > 0 ? (stats.completed / total) * 100 : 0;
    const pendingPercent = total > 0 ? (stats.pending / total) * 100 : 0;
    const failedPercent = total > 0 ? (stats.failed / total) * 100 : 0;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={28} />
              Fundraising Analytics
            </h2>
            <button
              onClick={() => setShowPieChart(false)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left - Target vs Raised Pie Chart */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Target vs Amount Raised</h3>
              
              {/* SVG Pie Chart for Target vs Raised */}
              <svg width="200" height="200" viewBox="0 0 220 220" className="mb-4">
                {/* Background circle (remaining) */}
                <circle cx="110" cy="110" r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth="35" />
                
                {/* Raised segment */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="transparent"
                  stroke="url(#raisedGradient)"
                  strokeWidth="35"
                  strokeDasharray={`${raisedDash} ${circumference}`}
                  transform="rotate(-90 110 110)"
                  strokeLinecap="round"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="raisedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* Center circle */}
                <circle cx="110" cy="110" r="55" fill="white" />
                <text x="110" y="100" textAnchor="middle" className="text-xl font-bold" fill="#1e40af">{progress.toFixed(4)}%</text>
                <text x="110" y="125" textAnchor="middle" className="text-xs" fill="#64748b">of Target</text>
              </svg>
              
              {/* Target vs Raised Legend */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-200">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-lg font-bold text-blue-700">₹{stats.total_amount.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-blue-600">Amount Raised</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto mb-1"></div>
                  <div className="text-lg font-bold text-gray-700">₹{remaining.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
              </div>
              
              
            </div>
            
            {/* Right - Status Breakdown */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Donation Status Breakdown</h3>
              
              {/* Status Pie Chart */}
              <svg width="200" height="200" viewBox="0 0 220 220" className="mb-4">
                <circle cx="110" cy="110" r={radius} fill="#f3f4f6" />
                
                {/* Completed segment */}
                {stats.completed > 0 && (
                  <circle
                    cx="110"
                    cy="110"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="35"
                    strokeDasharray={`${(completedPercent / 100) * circumference} ${circumference}`}
                    transform="rotate(-90 110 110)"
                  />
                )}
                
                {/* Pending segment */}
                {stats.pending > 0 && (
                  <circle
                    cx="110"
                    cy="110"
                    r={radius}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="35"
                    strokeDasharray={`${(pendingPercent / 100) * circumference} ${circumference}`}
                    transform={`rotate(${-90 + (completedPercent * 3.6)} 110 110)`}
                  />
                )}
                
                {/* Failed segment */}
                {stats.failed > 0 && (
                  <circle
                    cx="110"
                    cy="110"
                    r={radius}
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="35"
                    strokeDasharray={`${(failedPercent / 100) * circumference} ${circumference}`}
                    transform={`rotate(${-90 + ((completedPercent + pendingPercent) * 3.6)} 110 110)`}
                  />
                )}
                
                {/* Center circle */}
                <circle cx="110" cy="110" r="55" fill="white" />
                <text x="110" y="100" textAnchor="middle" className="text-2xl font-bold" fill="#1e293b">{total}</text>
                <text x="110" y="125" textAnchor="middle" className="text-xs" fill="#64748b">Total Donations</text>
              </svg>
              
              {/* Status Legend */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-200">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-lg font-bold text-emerald-700">{stats.completed}</div>
                  <div className="text-xs text-emerald-600">Completed</div>
                  <div className="text-xs text-emerald-500">{completedPercent.toFixed(1)}%</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-2 text-center border border-yellow-200">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-lg font-bold text-yellow-700">{stats.pending}</div>
                  <div className="text-xs text-yellow-600">Pending</div>
                  <div className="text-xs text-yellow-500">{pendingPercent.toFixed(1)}%</div>
                </div>
                <div className="bg-red-50 rounded-xl p-2 text-center border border-red-200">
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-lg font-bold text-red-700">{stats.failed}</div>
                  <div className="text-xs text-red-600">Failed</div>
                  <div className="text-xs text-red-500">{failedPercent.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Stats - Matching Main Website */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">Amount Raised</div>
              <div className="text-lg font-bold text-blue-800">₹{stats.total_amount.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
              <div className="text-xs text-purple-600 font-medium">Target Goal</div>
              <div className="text-lg font-bold text-purple-800">₹25,00,000</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
              <div className="text-xs text-orange-600 font-medium">Progress</div>
              <div className="text-lg font-bold text-orange-800">{progress.toFixed(4)}%</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
              <div className="text-xs text-emerald-600 font-medium">Remaining</div>
              <div className="text-lg font-bold text-emerald-800">₹{remaining.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Check authentication on mount and continuously
  useEffect(() => {
    // Initial check
    if (!getAdminAuth()) {
      navigate("/", { replace: true });
      return;
    }

    // Check auth on visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !getAdminAuth()) {
        navigate("/", { replace: true });
      }
    };

    // Check auth on popstate (browser back/forward buttons)
    const handlePopState = () => {
      if (!getAdminAuth()) {
        navigate("/", { replace: true });
      }
    };

    // Check auth periodically (every 30 seconds)
    const authCheckInterval = setInterval(() => {
      if (!getAdminAuth()) {
        navigate("/", { replace: true });
      }
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(authCheckInterval);
    };
  }, [navigate]);

  // Load donations, visitor stats, admissions and students
  useEffect(() => {
    loadData();
    loadVisitorData();
    loadAdmissions();
    loadStudents();
    loadBatchSeats();

    const handleBatchUpdate = () => loadBatchSeats();
    window.addEventListener("batch-seats-updated", handleBatchUpdate);
    return () => {
      window.removeEventListener("batch-seats-updated", handleBatchUpdate);
    };
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "contacts") {
      loadContacts();
    } else if (activeTab === "admissions") {
      loadAdmissions();
      loadBatchSeats();
    } else if (activeTab === "students") {
      loadStudents();
    }
  }, [activeTab]);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [donations, searchQuery, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [donationsData, statsData] = await Promise.all([
        getAllDonations(),
        getDonationStats(),
      ]);

      setDonations(donationsData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load donations. Please check your Supabase configuration.");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = async () => {
    let result = [...donations];

    // Apply filter
    if (filterStatus !== "all") {
      result = result.filter((d) => d.status === filterStatus);
    }

    // Apply search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.donor_name.toLowerCase().includes(searchLower) ||
          d.donor_email.toLowerCase().includes(searchLower) ||
          d.payment_id.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDonations(result);
  };

  const loadVisitorData = async () => {
    try {
      const stats = await getVisitorStats();
      setVisitorStats(stats);
    } catch (err) {
      console.error("Error loading visitor stats:", err);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const contactsData = await getAllContacts();
      setContacts(contactsData);
    } catch (err) {
      console.error("Error loading contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleContactStatusUpdate = async (id: string, status: "new" | "read" | "replied") => {
    try {
      await updateContactStatus(id, status);
      setContacts(contacts.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) {
      console.error("Error updating contact status:", err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }
    try {
      await deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
      setSelectedContact(null);
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-yellow-100 text-yellow-800";
      case "replied":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Admission Handlers
  const loadAdmissions = async () => {
    try {
      setAdmissionsLoading(true);
      const list = await getAllAdmissions();
      setAdmissions(list);
      loadBatchSeats();
    } catch (err) {
      console.error("Error loading admissions:", err);
    } finally {
      setAdmissionsLoading(false);
    }
  };

  const handleUpdateCapacity = (batchId: string, newTotal: number) => {
    if (newTotal > 0) {
      updateBatchSeatCapacity(batchId, newTotal);
      loadBatchSeats();
      setEditingCapacityBatchId(null);
    }
  };

  const handleToggleBatchFull = (batchId: string) => {
    toggleBatchManualFull(batchId);
    loadBatchSeats();
  };

  const handleResetBatchIntake = (batchId: string, name: string) => {
    if (window.confirm(`Are you sure you want to reset the intake count to 0 for batch "${name}"?`)) {
      resetBatchEnrollment(batchId);
      loadBatchSeats();
    }
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
    } catch (err) {
      console.error("Error updating admission status:", err);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admission application?")) {
      return;
    }
    try {
      setDeletingAdmissionId(id);
      await deleteAdmission(id);
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
      if (selectedAdmission && selectedAdmission.id === id) {
        setSelectedAdmission(null);
      }
    } catch (err) {
      console.error("Error deleting admission:", err);
    } finally {
      setDeletingAdmissionId(null);
    }
  };

  const exportAdmissionsToExcel = () => {
    const headers = [
      "Application ID",
      "Applicant Name",
      "Education",
      "College Name",
      "Address",
      "Identity Proof Attached",
      "Photo Attached",
      "Caste Certificate Attached",
      "Status",
      "Submitted Date",
    ];

    const csvData = filteredAdmissions.map((a) => [
      a.id,
      a.name,
      a.education || "",
      a.college_name || "",
      (a.address || "").replace(/\n/g, " "),
      a.identity_proof ? "Yes" : "No",
      a.photo ? "Yes" : "No",
      a.caste_certificate ? "Yes" : "No",
      a.status || "completed",
      a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `admissions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAdmissions = admissions.filter((a) => {
    if (!admissionsSearch.trim()) return true;
    const q = admissionsSearch.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.education?.toLowerCase().includes(q) ||
      a.college_name?.toLowerCase().includes(q) ||
      a.address?.toLowerCase().includes(q) ||
      a.id?.toLowerCase().includes(q)
    );
  });

  // Student / User Handlers
  const loadStudents = () => {
    try {
      setStudentsLoading(true);
      const list = getAllRegisteredStudents();
      setStudents(list);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student user?")) {
      return;
    }
    try {
      setDeletingStudentId(id);
      deleteRegisteredStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    } finally {
      setDeletingStudentId(null);
    }
  };

  const exportStudentsToExcel = () => {
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
      s.name,
      s.email,
      s.phone,
      s.city || "",
      s.state || "",
      s.registeredAt ? new Date(s.registeredAt).toLocaleDateString("en-IN") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `registered_students_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter((s) => {
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

  const handleStatusUpdate = async (id: string, newStatus: "pending" | "completed" | "failed") => {
    try {
      await updateDonationStatus(id, newStatus);
      setDonations(
        donations.map((d) =>
          d.id === id ? { ...d, status: newStatus } : d
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleEditDonation = (donation: Donation) => {
    setEditingDonation(donation);
    setEditFormData({ ...donation });
  };

  const handleUpdateDonation = async () => {
    if (!editingDonation) return;

    try {
      // Update the donation with new data
      await updateDonationStatus(editingDonation.id, editFormData.status as any);
      
      // Update local state with all changes
      setDonations(
        donations.map((d) =>
          d.id === editingDonation.id
            ? { ...d, ...editFormData }
            : d
        )
      );

      setEditingDonation(null);
      setEditFormData({});
    } catch (err) {
      console.error("Error updating donation:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteDonation(id);
      setDonations(donations.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting donation:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddDonation = async () => {
    // Validation
    if (
      !newDonationData.donor_name ||
      !newDonationData.donor_email ||
      newDonationData.amount <= 0 ||
      !newDonationData.payment_id
    ) {
      alert("Please fill in all required fields (name, email, amount, payment ID)");
      return;
    }

    try {
      setSubmitting(true);
      const donation = await createDonation({
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

      // Add to local state
      setDonations([donation, ...donations]);
      
      // Reset form
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
      setShowAddForm(false);

      // Reload stats
      const statsData = await getDonationStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error adding donation:", err);
      alert("Failed to add donation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    clearAdminAuth();
    
    // Clear any browser cache for this page
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Use replace to prevent back button access
    navigate("/", { replace: true });
    
    // Force reload to clear any in-memory state
    window.location.reload();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="text-green-500" />;
      case "pending":
        return <Clock size={20} className="text-yellow-500" />;
      case "failed":
        return <XCircle size={20} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check auth before rendering - redirect immediately if not authenticated
  if (!getAdminAuth()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">


      <div className="section-padding pt-20 md:pt-20">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 mt-2">Manage donations, contacts and track fundraising</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="/admissions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-[#b5623b] text-white font-semibold rounded-lg hover:bg-[#954b2c] transition-colors shadow-sm"
                title="Open live admission form"
              >
                <ExternalLink size={18} className="mr-2" />
                Admission Form
              </a>
              <button
                onClick={() => setShowPieChart(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
              >
                <PieChart size={20} className="mr-2" />
                View Chart
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
              >
                <Download size={20} className="mr-2" />
                Export Excel
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Donation
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut size={20} className="mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-blue-200">
            <button
              onClick={() => setActiveTab("donations")}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 -mb-[2px] ${
                activeTab === "donations"
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-blue-500"
              }`}
            >
              <Heart size={20} />
              Donations
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 -mb-[2px] ${
                activeTab === "contacts"
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-blue-500"
              }`}
            >
              <MessageSquare size={20} />
              Contacts
              {contacts.filter(c => c.status === "new").length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {contacts.filter(c => c.status === "new").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("admissions")}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 -mb-[2px] ${
                activeTab === "admissions"
                  ? "text-[#b5623b] border-[#b5623b]"
                  : "text-slate-500 border-transparent hover:text-[#b5623b]"
              }`}
            >
              <GraduationCap size={20} />
              Admissions
              {admissions.length > 0 && (
                <span className="bg-[#b5623b] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {admissions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("students");
                loadStudents();
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 -mb-[2px] ${
                activeTab === "students"
                  ? "text-emerald-700 border-emerald-700"
                  : "text-slate-500 border-transparent hover:text-emerald-600"
              }`}
            >
              <Users size={20} />
              Students / Users
              {students.length > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {students.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "donations" && (
          <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold">Total Donations</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {stats.total_donations}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="text-sm text-green-600 font-semibold">Amount Raised</div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                ₹{stats.total_amount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="text-sm text-purple-600 font-semibold">Target Goal</div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                ₹25,00,000
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="text-sm text-orange-600 font-semibold">Progress</div>
              <div className="text-2xl font-bold text-orange-900 mt-2">
                {((stats.total_amount / FUNDRAISING_GOAL) * 100).toFixed(4)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="text-sm text-emerald-600 font-semibold">Remaining</div>
              <div className="text-2xl font-bold text-emerald-900 mt-2">
                ₹{(FUNDRAISING_GOAL - stats.total_amount).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
              <div className="text-sm text-cyan-600 font-semibold">Live Visitors</div>
              <div className="text-2xl font-bold text-cyan-900 mt-2">
                {liveVisitors}
              </div>
            </div>
          </div>

          {/* Visitor Insights */}
          <div className="bg-white rounded-xl border-2 border-blue-100 p-6 mb-8 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Visitor Insights</h3>
              <span className="text-sm text-slate-500">Synced from Supabase</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                <div className="text-xs text-blue-600 font-semibold">Today</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{visitorStats.today}</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 text-center">
                <div className="text-xs text-indigo-600 font-semibold">Yesterday</div>
                <div className="text-2xl font-bold text-indigo-900 mt-1">{visitorStats.yesterday}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                <div className="text-xs text-purple-600 font-semibold">This Week</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">{visitorStats.thisWeek}</div>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 text-center">
                <div className="text-xs text-pink-600 font-semibold">This Month</div>
                <div className="text-2xl font-bold text-pink-900 mt-1">{visitorStats.thisMonth}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
                <div className="text-xs text-emerald-600 font-semibold">Total</div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">{visitorStats.total}</div>
              </div>
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100 text-center">
                <div className="text-xs text-cyan-600 font-semibold">Live</div>
                <div className="text-2xl font-bold text-cyan-900 mt-1">{liveVisitors}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border-2 border-blue-100 p-6 mb-8 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Fundraising Progress
              </h3>
              <span className="text-2xl font-bold text-blue-600">
                {((stats.total_amount / FUNDRAISING_GOAL) * 100).toFixed(4)}%
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.total_amount / FUNDRAISING_GOAL) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-slate-500 mt-3">
              <span>₹{stats.total_amount.toLocaleString("en-IN")} raised</span>
              <span>Remaining: ₹{(FUNDRAISING_GOAL - stats.total_amount).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
              <p className="text-red-700 font-semibold">⚠️ {error}</p>
              <p className="text-red-600 text-sm mt-1">
                Make sure your Supabase URL and API key are correct in .env file
              </p>
            </div>
          )}

          {/* Status Breakdown */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 text-center">
              <div className="text-sm text-emerald-600 font-semibold">Completed</div>
              <div className="text-3xl font-bold text-emerald-900 mt-2">{stats.completed}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 text-center">
              <div className="text-sm text-yellow-600 font-semibold">Pending</div>
              <div className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 text-center">
              <div className="text-sm text-red-600 font-semibold">Failed</div>
              <div className="text-3xl font-bold text-red-900 mt-2">{stats.failed}</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by donor name, email, or payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden shadow-lg">
            {filteredDonations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Heart size={32} className="text-blue-600" />
                </div>
                <p className="text-slate-600 text-lg font-semibold mb-2">No donations found</p>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  {donations.length === 0
                    ? "Start collecting donations! Share your donation link with supporters to see them appear here."
                    : "Try adjusting your search or filter to find what you're looking for."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50 border-b-2 border-blue-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Donor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Payment ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                        Date
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-800">
                              {donation.donor_name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {donation.donor_email}
                            </div>
                            {donation.donor_phone && (
                              <div className="text-sm text-slate-500">
                                {donation.donor_phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          ₹{donation.amount?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                          {donation.payment_id.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4">
                          {editingId === donation.id ? (
                            <select
                              value={editingStatus}
                              onChange={(e) =>
                                setEditingStatus(e.target.value as any)
                              }
                              className="px-3 py-1 text-sm border border-blue-300 rounded"
                            >
                              <option value="completed">Completed</option>
                              <option value="pending">Pending</option>
                              <option value="failed">Failed</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                donation.status
                              )}`}
                            >
                              {getStatusIcon(donation.status)}
                              {donation.status.charAt(0).toUpperCase() +
                                donation.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(donation.created_at).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {editingId === donation.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(donation.id, editingStatus)
                                  }
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditDonation(donation)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Donation"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(donation.id)}
                                  disabled={deleting === donation.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Showing {filteredDonations.length} of {donations.length} donations
          </div>
          </>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <>
              {contactsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Contacts Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 text-center">
                      <div className="text-sm text-blue-600 font-semibold">New</div>
                      <div className="text-3xl font-bold text-blue-900 mt-2">
                        {contacts.filter(c => c.status === "new").length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 text-center">
                      <div className="text-sm text-yellow-600 font-semibold">Read</div>
                      <div className="text-3xl font-bold text-yellow-900 mt-2">
                        {contacts.filter(c => c.status === "read").length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 text-center">
                      <div className="text-sm text-green-600 font-semibold">Replied</div>
                      <div className="text-3xl font-bold text-green-900 mt-2">
                        {contacts.filter(c => c.status === "replied").length}
                      </div>
                    </div>
                  </div>

                  {/* Contacts Table */}
                  <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden shadow-lg">
                    {contacts.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                          <MessageSquare size={32} className="text-blue-600" />
                        </div>
                        <p className="text-slate-600 text-lg font-semibold mb-2">No contacts yet</p>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                          Contact form submissions will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-blue-50 border-b-2 border-blue-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                                Sender
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                                Subject
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                                Date
                              </th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-800">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-100">
                            {contacts.map((contact) => (
                              <tr key={contact.id} className={`hover:bg-blue-50 transition-colors ${contact.status === "new" ? "bg-blue-50/50" : ""}`}>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-semibold text-slate-800">
                                      {contact.name}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      {contact.email}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-800 font-medium truncate max-w-[200px]">
                                    {contact.subject}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getContactStatusColor(contact.status || "new")}`}>
                                    {(contact.status || "new").charAt(0).toUpperCase() + (contact.status || "new").slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString("en-IN") : "-"}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedContact(contact);
                                        if (contact.status === "new" && contact.id) {
                                          handleContactStatusUpdate(contact.id, "read");
                                        }
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="View Message"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <a
                                      href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                                      onClick={() => contact.id && handleContactStatusUpdate(contact.id, "replied")}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      title="Reply"
                                    >
                                      <Reply size={18} />
                                    </a>
                                    <button
                                      onClick={() => contact.id && handleDeleteContact(contact.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={18} />
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

                  {/* Results Summary */}
                  <div className="mt-6 text-center text-sm text-slate-500">
                    Total {contacts.length} contacts
                  </div>
                </>
              )}
            </>
          )}

          {/* Admissions Tab */}
          {activeTab === "admissions" && (
            <>
              {admissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b5623b]"></div>
                </div>
              ) : (
                <>
                  {/* Admissions Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200 text-center">
                      <div className="text-sm text-amber-700 font-semibold">Total Applications</div>
                      <div className="text-3xl font-bold text-amber-950 mt-2">
                        {admissions.length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 text-center">
                      <div className="text-sm text-emerald-700 font-semibold">Completed / Verified</div>
                      <div className="text-3xl font-bold text-emerald-950 mt-2">
                        {admissions.filter(a => a.status === "completed").length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 border border-yellow-200 text-center">
                      <div className="text-sm text-yellow-700 font-semibold">Pending Review</div>
                      <div className="text-3xl font-bold text-yellow-950 mt-2">
                        {admissions.filter(a => a.status === "pending").length}
                      </div>
                    </div>
                  </div>

                  {/* Live Batch Seats & Intake Monitor Panel */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-bold text-[#b5623b]">
                          <Layers size={13} /> Live Batch Seats & Intake Control
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-800 mt-2">
                          थेट बॅच जागा व प्रवेश नियंत्रण कक्ष (Batch Seats Tracker)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Monitor real-time enrolled students per batch, remaining seats, or adjust total intake capacity and batch full status.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowBatchSeatsManager(!showBatchSeatsManager)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5"
                        >
                          <SlidersHorizontal size={14} />
                          <span>{showBatchSeatsManager ? "Hide Batches" : "Show Batches Panel"}</span>
                        </button>
                        <button
                          onClick={loadBatchSeats}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
                          title="Refresh live seats"
                        >
                          <RotateCcw size={13} />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>

                    {showBatchSeatsManager && (
                      <div className="mt-6">
                        {/* Batches Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {batchSeatsList.map((b) => {
                            const isEditing = editingCapacityBatchId === b.batchId;
                            const pct = Math.min(100, Math.round((b.enrolled / b.totalSeats) * 100));

                            return (
                              <div
                                key={b.batchId}
                                className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                                  b.isFull
                                    ? "bg-red-50/50 border-red-200 shadow-xs"
                                    : "bg-[#fbfaf7] border-slate-200 hover:border-[#b5623b]/40 shadow-xs"
                                }`}
                              >
                                <div>
                                  {/* Header */}
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                      <span className="text-base">{b.flag}</span>
                                      <span className="truncate max-w-[120px]">{b.courseName.replace(" Language", "")}</span>
                                    </div>
                                    {b.isFull ? (
                                      <span className="rounded-full bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 text-[10px] font-bold">
                                        ADMISSION FULL
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                                        {b.remainingSeats} Seats Left
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-bold text-slate-900 text-sm">
                                    {b.batchName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {b.days} · {b.time}
                                  </div>

                                  {/* Seats Progress & Numbers */}
                                  <div className="mt-3.5 bg-white border border-slate-200/80 rounded-xl p-3">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                      <span className="text-slate-500 text-[11px]">Enrolled / Total:</span>
                                      <span className="font-bold text-slate-800 font-mono text-xs">
                                        {b.enrolled} / {b.totalSeats}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          b.isFull ? "bg-red-600" : "bg-[#24312d]"
                                        }`}
                                        style={{ width: `${b.isFull ? 100 : pct}%` }}
                                      />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[11px]">
                                      <span className={`font-semibold ${b.isFull ? "text-red-700 font-bold" : "text-emerald-700"}`}>
                                        {b.isFull ? "Admission Full" : `${b.remainingSeats} Seats Left`}
                                      </span>
                                      <span className="text-slate-400 font-mono text-[10px]">{pct}%</span>
                                    </div>
                                  </div>

                                  {/* Edit Capacity Input Inline */}
                                  {isEditing && (
                                    <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
                                      <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={customCapacityInput}
                                        onChange={(e) => setCustomCapacityInput(parseInt(e.target.value) || 1)}
                                        className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#b5623b]"
                                      />
                                      <button
                                        onClick={() => handleUpdateCapacity(b.batchId, customCapacityInput)}
                                        className="px-2.5 py-1 bg-[#24312d] text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCapacityBatchId(null)}
                                        className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-1.5 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCapacityBatchId(b.batchId);
                                      setCustomCapacityInput(b.totalSeats);
                                    }}
                                    className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-[#b5623b] hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
                                    title="Change total seat intake limit"
                                  >
                                    <Edit2 size={11} /> Capacity
                                  </button>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBatchFull(b.batchId)}
                                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                                        b.isFull
                                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                          : "bg-red-100 text-red-800 hover:bg-red-200"
                                      }`}
                                      title={b.isFull ? "Re-open admissions for this batch" : "Manually mark batch as full"}
                                    >
                                      {b.isFull ? "Re-open" : "Mark Full"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResetBatchIntake(b.batchId, b.batchName)}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                                      title="Reset enrolled count to 0"
                                    >
                                      <RotateCcw size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Search */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search student, education, college..."
                        value={admissionsSearch}
                        onChange={(e) => setAdmissionsSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#b5623b]"
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
                      <button
                        onClick={exportAdmissionsToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 hover:to-green-700 transition-colors shadow-sm"
                      >
                        <Download size={16} />
                        Export Admissions CSV
                      </button>
                      <a
                        href="/admissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#b5623b] text-white text-sm font-semibold rounded-lg hover:bg-[#954b2c] transition-colors shadow-sm"
                      >
                        <ExternalLink size={16} />
                        Open Admission Form
                      </a>
                    </div>
                  </div>

                  {/* Admissions Table */}
                  <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-lg">
                    {filteredAdmissions.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4 text-[#b5623b]">
                          <GraduationCap size={32} />
                        </div>
                        <p className="text-slate-800 text-lg font-semibold mb-2">No admission applications found</p>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                          {admissionsSearch
                            ? "No applications match your search query."
                            : "New applications submitted from the website admission form will appear here with student details, photo, and documents."}
                        </p>
                        <a
                          href="/admissions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b5623b] text-white text-sm font-semibold rounded-lg hover:bg-[#954b2c] transition"
                        >
                          <ExternalLink size={16} />
                          Open Admission Form
                        </a>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Applicant
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Course & Batch
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Education
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                College Name
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Documents
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Status
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Date
                              </th>
                              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredAdmissions.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    {item.photo ? (
                                      <img
                                        src={item.photo}
                                        alt={item.name}
                                        onClick={() =>
                                          setViewingDoc({
                                            title: `${item.name} - Photo`,
                                            url: item.photo!,
                                            isImage: true,
                                          })
                                        }
                                        className="h-11 w-11 rounded-full object-cover border border-slate-200 cursor-pointer shadow-sm hover:scale-105 transition"
                                      />
                                    ) : (
                                      <div className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                        {item.name?.charAt(0) || "A"}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                      <p className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">{item.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-xs">
                                  <span className="font-semibold text-slate-800 block text-xs">
                                    {item.program || "Foreign Language Course"}
                                  </span>
                                  <span className="text-[11px] text-[#b5623b] font-medium block mt-0.5">
                                    Fee: ₹{item.amount || 100}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-700 font-medium">
                                  <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                    {item.education || "N/A"}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-700 max-w-[180px] truncate" title={item.college_name}>
                                  {item.college_name || "N/A"}
                                </td>
                                <td className="px-5 py-4 text-xs">
                                  <div className="flex flex-col gap-1">
                                    {item.identity_proof && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setViewingDoc({
                                            title: `${item.name} - Identity Proof`,
                                            url: item.identity_proof!,
                                            isImage: item.identity_proof!.startsWith("data:image/"),
                                          })
                                        }
                                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 hover:underline"
                                      >
                                        <FileCheck size={13} /> ID Proof
                                      </button>
                                    )}
                                    {item.caste_certificate && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setViewingDoc({
                                            title: `${item.name} - Caste Certificate`,
                                            url: item.caste_certificate!,
                                            isImage: item.caste_certificate!.startsWith("data:image/"),
                                          })
                                        }
                                        className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 hover:underline"
                                      >
                                        <Award size={13} /> Caste Cert.
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <select
                                    value={item.status || "completed"}
                                    onChange={(e) =>
                                      handleAdmissionStatusUpdate(item.id, e.target.value as any)
                                    }
                                    className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 ${
                                      item.status === "completed"
                                        ? "bg-green-50 text-green-700"
                                        : item.status === "pending"
                                        ? "bg-yellow-50 text-yellow-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                                  >
                                    <option value="completed">Completed / Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Rejected</option>
                                  </select>
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN") : "-"}
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => setSelectedAdmission(item)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="View Full Application"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <button
                                      disabled={deletingAdmissionId === item.id}
                                      onClick={() => handleDeleteAdmission(item.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                      title="Delete Application"
                                    >
                                      <Trash2 size={18} />
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

                  {/* Results Summary */}
                  <div className="mt-6 text-center text-sm text-slate-500">
                    Showing {filteredAdmissions.length} of {admissions.length} admission applications
                  </div>
                </>
              )}
            </>
          )}

          {/* Students / Users Tab */}
          {activeTab === "students" && (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registered Students</div>
                    <div className="text-2xl font-bold text-slate-800">{students.length}</div>
                    <div className="text-xs text-emerald-600 font-medium">Active Student PRNs</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Admission Applications</div>
                    <div className="text-2xl font-bold text-slate-800">{admissions.length}</div>
                    <div className="text-xs text-blue-600 font-medium">Submitted by Students</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Academic Year</div>
                    <div className="text-2xl font-bold text-slate-800">2026-27</div>
                    <div className="text-xs text-amber-600 font-medium">Centralized Admission Portal</div>
                  </div>
                </div>
              </div>

              {/* Search & Export Action Bar */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search students by Name, PRN, Email, Phone, City..."
                      value={studentsSearch}
                      onChange={(e) => setStudentsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportStudentsToExcel}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm"
                    >
                      <Download size={16} />
                      Export Students CSV
                    </button>
                    <button
                      onClick={loadStudents}
                      className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs text-slate-600 transition"
                      title="Refresh Student List"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {studentsLoading ? (
                  <div className="p-12 text-center text-slate-500">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
                    Loading students list...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Users size={40} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No student users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search query</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3.5">PRN Number</th>
                          <th className="px-5 py-3.5">Student Name</th>
                          <th className="px-5 py-3.5">Contact Information</th>
                          <th className="px-5 py-3.5">City / Location</th>
                          <th className="px-5 py-3.5">Registered Date</th>
                          <th className="px-5 py-3.5 text-center">Admissions</th>
                          <th className="px-5 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((s) => {
                          const userAdmissions = admissions.filter(
                            (a) =>
                              (a.name && a.name.toLowerCase() === s.name.toLowerCase()) ||
                              (a.email && a.email.toLowerCase() === s.email.toLowerCase()) ||
                              (a.phone && a.phone.includes(s.phone))
                          );
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-5 py-4">
                                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                  {s.prn}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shrink-0">
                                    {s.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800">{s.name}</div>
                                    <div className="text-[11px] text-slate-400">ID: {s.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs space-y-0.5">
                                <div className="text-slate-700 flex items-center gap-1.5">
                                  <Mail size={13} className="text-slate-400" />
                                  <a href={`mailto:${s.email}`} className="hover:text-blue-600 underline truncate max-w-[200px]">
                                    {s.email}
                                  </a>
                                </div>
                                <div className="text-slate-500 flex items-center gap-1.5">
                                  <Phone size={13} className="text-slate-400" />
                                  <span>{s.phone}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs text-slate-600">
                                {s.city || "Pune"}, {s.state || "Maharashtra"}
                              </td>
                              <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                {s.registeredAt ? new Date(s.registeredAt).toLocaleDateString("en-IN") : "-"}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  userAdmissions.length > 0
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {userAdmissions.length} Applied
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setSelectedStudent(s)}
                                    className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                    title="View Student Details & Admissions"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    disabled={deletingStudentId === s.id}
                                    onClick={() => handleDeleteStudent(s.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                    title="Delete Student"
                                  >
                                    <Trash2 size={18} />
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
              </div>

              {/* Count Summary */}
              <div className="mt-6 text-center text-sm text-slate-500">
                Showing {filteredStudents.length} of {students.length} registered students / users
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-blue-200 bg-white">
              <h2 className="text-2xl font-serif font-bold text-slate-800">
                Contact Message
              </h2>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
                  <p className="text-slate-800 font-semibold">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                  <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline font-semibold">
                    {selectedContact.email}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Subject</label>
                <p className="text-slate-800 font-semibold">{selectedContact.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Message</label>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  Received: {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString("en-IN") : "-"}
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedContact.status || "new"}
                    onChange={(e) => {
                      if (selectedContact.id) {
                        handleContactStatusUpdate(selectedContact.id, e.target.value as any);
                        setSelectedContact({ ...selectedContact, status: e.target.value as any });
                      }
                    }}
                    className="px-3 py-2 border border-blue-200 rounded-lg text-sm"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                    onClick={() => {
                      if (selectedContact.id) {
                        handleContactStatusUpdate(selectedContact.id, "replied");
                        setSelectedContact({ ...selectedContact, status: "replied" });
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Mail size={18} />
                    Reply
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admission Detail Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-slate-200 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-[#b5623b]">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-800">
                    Admission Application Details
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedAdmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Applicant Profile */}
              <div className="flex items-center gap-4 rounded-2xl bg-[#fbfaf7] p-4 border border-slate-200">
                {selectedAdmission.photo ? (
                  <img
                    src={selectedAdmission.photo}
                    alt={selectedAdmission.name}
                    className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-90"
                    onClick={() =>
                      setViewingDoc({
                        title: `${selectedAdmission.name} - Photo`,
                        url: selectedAdmission.photo!,
                        isImage: true,
                      })
                    }
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 text-[#b5623b] text-2xl font-bold">
                    {selectedAdmission.name?.charAt(0) || "A"}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{selectedAdmission.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted on:{" "}
                    {selectedAdmission.created_at
                      ? new Date(selectedAdmission.created_at).toLocaleString("en-IN")
                      : "-"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Status:</span>
                    <select
                      value={selectedAdmission.status || "completed"}
                      onChange={(e) =>
                        handleAdmissionStatusUpdate(selectedAdmission.id, e.target.value as any)
                      }
                      className="text-xs font-semibold rounded-md px-2.5 py-1 border border-slate-300 bg-white"
                    >
                      <option value="completed">Completed / Verified</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Education & College */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedAdmission.education || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">College Name</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedAdmission.college_name || "N/A"}</p>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Residential Address</p>
                <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{selectedAdmission.address || "N/A"}</p>
              </div>

              {/* Uploaded Documents */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Attached Documents</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Photo */}
                  <div className="rounded-xl border border-slate-200 p-3 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Camera size={14} className="text-[#b5623b]" />
                        Photo
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {selectedAdmission.photo_name || "Passport Photo"}
                      </p>
                    </div>
                    {selectedAdmission.photo ? (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingDoc({
                            title: `${selectedAdmission.name} - Photo`,
                            url: selectedAdmission.photo!,
                            isImage: true,
                          })
                        }
                        className="mt-3 w-full rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition text-center"
                      >
                        View Photo
                      </button>
                    ) : (
                      <span className="mt-3 text-xs text-slate-400 italic">Not available</span>
                    )}
                  </div>

                  {/* Identity Proof */}
                  <div className="rounded-xl border border-slate-200 p-3 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <FileText size={14} className="text-emerald-600" />
                        Identity Proof
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {selectedAdmission.identity_proof_name || "Identity Document"}
                      </p>
                    </div>
                    {selectedAdmission.identity_proof ? (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingDoc({
                            title: `${selectedAdmission.name} - Identity Proof`,
                            url: selectedAdmission.identity_proof!,
                            isImage: selectedAdmission.identity_proof!.startsWith("data:image/"),
                          })
                        }
                        className="mt-3 w-full rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition text-center"
                      >
                        View Document
                      </button>
                    ) : (
                      <span className="mt-3 text-xs text-slate-400 italic">Not available</span>
                    )}
                  </div>

                  {/* Caste Certificate */}
                  <div className="rounded-xl border border-slate-200 p-3 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Award size={14} className="text-[#b5623b]" />
                        Caste Certificate
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {selectedAdmission.caste_certificate_name || "Caste Certificate"}
                      </p>
                    </div>
                    {selectedAdmission.caste_certificate ? (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingDoc({
                            title: `${selectedAdmission.name} - Caste Certificate`,
                            url: selectedAdmission.caste_certificate!,
                            isImage: selectedAdmission.caste_certificate!.startsWith("data:image/"),
                          })
                        }
                        className="mt-3 w-full rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition text-center"
                      >
                        View Document
                      </button>
                    ) : (
                      <span className="mt-3 text-xs text-slate-400 italic">Not available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteAdmission(selectedAdmission.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 size={15} /> Delete Application
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdmission(null)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-slate-200 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-lg">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-800">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">PRN: {selectedStudent.prn}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Email:</span>
                  <span className="text-slate-800 font-medium">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Phone:</span>
                  <span className="text-slate-800 font-medium">{selectedStudent.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">City:</span>
                  <span className="text-slate-800 font-medium">{selectedStudent.city || "Pune"}, {selectedStudent.state || "Maharashtra"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Registered:</span>
                  <span className="text-slate-800 font-medium">{new Date(selectedStudent.registeredAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* Associated Admissions */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">
                  Submitted Admissions by this Student:
                </h4>
                {(() => {
                  const userAdmissions = admissions.filter(
                    (a) =>
                      (a.name && a.name.toLowerCase() === selectedStudent.name.toLowerCase()) ||
                      (a.email && a.email.toLowerCase() === selectedStudent.email.toLowerCase()) ||
                      (a.phone && a.phone.includes(selectedStudent.phone))
                  );
                  if (userAdmissions.length === 0) {
                    return (
                      <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border">
                        No admission form submitted yet by this student.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {userAdmissions.map((adm) => (
                        <div key={adm.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{adm.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {adm.status || "completed"}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            <strong>Education:</strong> {adm.education} · <strong>College:</strong> {adm.college_name}
                          </div>
                          <div className="text-slate-500">
                            <strong>Address:</strong> {adm.address}
                          </div>
                          {adm.program && (
                            <div className="text-emerald-700 font-semibold">
                              Course: {adm.program}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 size={15} /> Delete Student User
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document / Photo Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm truncate max-w-[400px]">{viewingDoc.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewingDoc.url}
                  download={viewingDoc.title}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
              {viewingDoc.isImage ? (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.title}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain shadow"
                />
              ) : (
                <iframe
                  src={viewingDoc.url}
                  title={viewingDoc.title}
                  className="w-full h-[70vh] rounded-lg border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Donation Modal */}
      {editingDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-blue-200 bg-white">
              <h2 className="text-2xl font-serif font-bold text-slate-800">
                Edit Donation
              </h2>
              <button
                onClick={() => {
                  setEditingDonation(null);
                  setEditFormData({});
                }}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Donor Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Donor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Donor Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.donor_name || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          donor_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.donor_email || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          donor_email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.donor_phone || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          donor_phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Donation Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Donation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={editFormData.amount || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={editFormData.currency || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          currency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={editFormData.payment_id || ""}
                      disabled
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Order ID
                    </label>
                    <input
                      type="text"
                      value={editFormData.order_id || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          order_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Status
                </h3>
                <select
                  value={editFormData.status || "pending"}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Service Info (Optional) */}
              {editFormData.service_name && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Service Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.service_name || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          service_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-blue-200 bg-blue-50">
              <button
                onClick={() => {
                  setEditingDonation(null);
                  setEditFormData({});
                }}
                className="px-6 py-2 border-2 border-blue-300 text-slate-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDonation}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Pie Chart Modal */}
      {showPieChart && <PieChartComponent />}

      {/* Add Donation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-blue-200 bg-white">
              <h2 className="text-2xl font-serif font-bold text-slate-800">
                Add New Donation
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Donor Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Donor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Donor Name *
                    </label>
                    <input
                      type="text"
                      value={newDonationData.donor_name}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          donor_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Enter donor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newDonationData.donor_email}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          donor_email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="donor@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newDonationData.donor_phone}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          donor_phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Donation Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Donation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={newDonationData.amount || ""}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Currency
                    </label>
                    <select
                      value={newDonationData.currency}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          currency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Payment ID *
                    </label>
                    <input
                      type="text"
                      value={newDonationData.payment_id}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          payment_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="pay_xxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Order ID
                    </label>
                    <input
                      type="text"
                      value={newDonationData.order_id}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          order_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="order_xxxxxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Service */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Status
                    </label>
                    <select
                      value={newDonationData.status}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Service Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDonationData.service_name}
                      onChange={(e) =>
                        setNewDonationData({
                          ...newDonationData,
                          service_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Education Support"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500">* indicates required fields</p>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-blue-200 bg-blue-50">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border-2 border-blue-300 text-slate-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDonation}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


