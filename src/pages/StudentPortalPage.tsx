import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  BookOpen,
  FileText,
  CreditCard,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StudentUser, Course, StudentAdmissionRecord } from "@/types/student";
import { COURSES_DATA } from "@/data/coursesData";
import {
  getCurrentStudent,
  getStudentApplications,
  getDemoStudent,
  setCurrentStudent,
} from "@/lib/student-auth";
import { StudentAuthCard } from "@/components/student/StudentAuthCard";
import { CourseCatalog } from "@/components/student/CourseCatalog";
import {
  UniversityRegistrationForm,
  RegistrationFormData,
} from "@/components/student/UniversityRegistrationForm";
import { AdmissionPaymentCard } from "@/components/student/AdmissionPaymentCard";
import { AdmissionReceiptView } from "@/components/student/AdmissionReceiptView";
import { StudentDashboardView } from "@/components/student/StudentDashboardView";

export default function StudentPortalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [currentStudent, setCurrentStudentState] = useState<StudentUser | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<"flow" | "dashboard">("flow");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);
  const [latestAdmission, setLatestAdmission] = useState<StudentAdmissionRecord | null>(null);
  const [studentApplications, setStudentApplications] = useState<StudentAdmissionRecord[]>([]);

  // Check login on mount
  useEffect(() => {
    const student = getCurrentStudent();
    if (student) {
      setCurrentStudentState(student);
      const apps = getStudentApplications(student.id);
      setStudentApplications(apps);

      // If user came with specific course param
      const courseId = searchParams.get("course");
      if (courseId) {
        const found = COURSES_DATA.find((c) => c.id === courseId);
        if (found) {
          setSelectedCourse(found);
          setCurrentStep(3);
          return;
        }
      }

      // Default to Step 2 if student is already logged in
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [searchParams]);

  // Sync applications when student changes
  const refreshStudentApps = (student: StudentUser) => {
    const apps = getStudentApplications(student.id);
    setStudentApplications(apps);
  };

  // Step 1: Login Success
  const handleAuthSuccess = (student: StudentUser) => {
    setCurrentStudentState(student);
    refreshStudentApps(student);
    setCurrentStep(2);
    setActiveTab("flow");
  };

  // Step 2: Course Selected
  const handleCourseSelected = (course: Course) => {
    setSelectedCourse(course);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3: Registration Form Submitted
  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    setRegistrationData(data);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 4: Payment Done
  const handlePaymentSuccess = (admission: StudentAdmissionRecord) => {
    setLatestAdmission(admission);
    if (currentStudent) {
      refreshStudentApps(currentStudent);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stepper titles
  const steps = [
    { number: 1, title: "लॉगिन / नोंदणी", enTitle: "1. Student Login", icon: User },
    { number: 2, title: "कोर्स निवडा", enTitle: "2. Choose Course", icon: BookOpen },
    { number: 3, title: "प्रवेश अर्ज", enTitle: "3. Registration", icon: FileText },
    { number: 4, title: "शुल्क भरणा", enTitle: "4. Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
      <Header />

      <main className="page-section pt-32 md:pt-36 pb-20">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Main Top Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={14} />
              Centralized Admission Portal 2026-27 · अधिकृत प्रवेश पोर्टल
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d]">
              विद्यापीठ पद्धतीचे विद्यार्थी प्रवेश पोर्टल
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#65706a] max-w-2xl mx-auto">
              लॉगिन करा, आपल्या आवडीचा अभ्यासक्रम निवडा, अर्ज भरा आणि ऑनलाइन शुल्क भरून तात्काळ अधिकृत प्रवेश पावती मिळवा.
            </p>

            {/* If logged in, provide switch between Admission Flow & Dashboard */}
            {currentStudent && (
              <div className="mt-5 inline-flex rounded-2xl bg-white border border-[#e2e5dc] p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("flow");
                    if (!selectedCourse) setCurrentStep(2);
                  }}
                  className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    activeTab === "flow"
                      ? "bg-[#b5623b] text-white shadow"
                      : "text-[#65706a] hover:text-[#24312d]"
                  }`}
                >
                  <BookOpen size={15} />
                  प्रवेश प्रक्रिया (Admission Flow)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    activeTab === "dashboard"
                      ? "bg-[#b5623b] text-white shadow"
                      : "text-[#65706a] hover:text-[#24312d]"
                  }`}
                >
                  <LayoutDashboard size={15} />
                  माझा डॅशबोर्ड (My Portal)
                  {studentApplications.length > 0 && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 font-bold ml-1">
                      {studentApplications.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Conditional View: Dashboard Tab vs 4-Step Flow */}
          {activeTab === "dashboard" && currentStudent ? (
            <StudentDashboardView
              student={currentStudent}
              applications={studentApplications}
              onStartNewAdmission={() => {
                setActiveTab("flow");
                setCurrentStep(2);
                setSelectedCourse(null);
                setRegistrationData(null);
                setLatestAdmission(null);
              }}
              onViewReceipt={(app) => {
                setLatestAdmission(app);
                setActiveTab("flow");
              }}
              onLogout={() => {
                setCurrentStudentState(null);
                setCurrentStep(1);
                setActiveTab("flow");
              }}
            />
          ) : latestAdmission ? (
            /* Confirmation Receipt View */
            <AdmissionReceiptView
              admission={latestAdmission}
              onGoToDashboard={() => {
                setLatestAdmission(null);
                setActiveTab("dashboard");
              }}
              onNewAdmission={() => {
                setLatestAdmission(null);
                setSelectedCourse(null);
                setRegistrationData(null);
                setCurrentStep(2);
                setActiveTab("flow");
              }}
            />
          ) : (
            /* 4-Step University Admission Flow */
            <div>
              {/* Stepper Indicator */}
              <div className="mb-10 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {steps.map((st) => {
                    const Icon = st.icon;
                    const isCompleted = currentStep > st.number;
                    const isCurrent = currentStep === st.number;

                    return (
                      <div
                        key={st.number}
                        className={`rounded-2xl p-3 border text-center transition flex flex-col items-center justify-center ${
                          isCurrent
                            ? "border-[#b5623b] bg-white ring-2 ring-[#b5623b]/30 shadow-md"
                            : isCompleted
                            ? "border-emerald-300 bg-emerald-50/60"
                            : "border-[#e2e5dc] bg-white/60 opacity-60"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-[#b5623b] text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={16} /> : st.number}
                        </div>
                        <div className="text-xs font-bold text-[#24312d] truncate">
                          {st.enTitle}
                        </div>
                        <div className="text-[10px] text-[#65706a] truncate">
                          {st.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Login / Registration */}
              {currentStep === 1 && (
                <StudentAuthCard onSuccess={handleAuthSuccess} />
              )}

              {/* Step 2: Choose Course */}
              {currentStep === 2 && (
                <CourseCatalog
                  selectedCourse={selectedCourse}
                  onSelectCourse={handleCourseSelected}
                />
              )}

              {/* Step 3: Registration Form */}
              {currentStep === 3 && currentStudent && selectedCourse && (
                <UniversityRegistrationForm
                  student={currentStudent}
                  course={selectedCourse}
                  onBack={() => setCurrentStep(2)}
                  onSubmit={handleRegistrationSubmit}
                />
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 &&
                currentStudent &&
                selectedCourse &&
                registrationData && (
                  <AdmissionPaymentCard
                    student={currentStudent}
                    course={selectedCourse}
                    formData={registrationData}
                    onBack={() => setCurrentStep(3)}
                    onSuccess={handlePaymentSuccess}
                  />
                )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
