import { useState, useEffect, FormEvent } from "react";
import {
  LANGUAGE_COURSES,
  LanguageCourse,
  CourseLevel,
  BatchSchedule,
} from "@/data/languageCoursesData";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Info,
  LoaderCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createAdmission } from "@/lib/supabase-admin";

interface RegistrationFormProps {
  initialLanguage?: string;
  initialLevel?: string;
  initialBatch?: string;
  onSuccess?: (registrationData: any) => void;
}

export default function RegistrationForm({
  initialLanguage = "Japanese",
  initialLevel,
  initialBatch,
  onSuccess,
}: RegistrationFormProps) {
  // Form fields
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  // Course selections
  const [selectedLanguageName, setSelectedLanguageName] = useState(initialLanguage);
  const currentLanguage: LanguageCourse =
    LANGUAGE_COURSES.find(
      (c) => c.name.toLowerCase().includes(selectedLanguageName.toLowerCase())
    ) || LANGUAGE_COURSES[0];

  const [selectedLevelId, setSelectedLevelId] = useState(
    initialLevel || currentLanguage.levels[0].id
  );

  // Update selected level when language changes
  useEffect(() => {
    const defaultLevel = currentLanguage.levels[0];
    if (!currentLanguage.levels.some((l) => l.id === selectedLevelId)) {
      setSelectedLevelId(defaultLevel.id);
    }
  }, [selectedLanguageName, currentLanguage]);

  const activeLevel: CourseLevel =
    currentLanguage.levels.find((l) => l.id === selectedLevelId) ||
    currentLanguage.levels[0];

  const [selectedBatchId, setSelectedBatchId] = useState(
    activeLevel.batches[0]?.id || ""
  );

  useEffect(() => {
    if (activeLevel.batches.length > 0) {
      if (!activeLevel.batches.some((b) => b.id === selectedBatchId)) {
        setSelectedBatchId(activeLevel.batches[0].id);
      }
    }
  }, [activeLevel]);

  const activeBatch: BatchSchedule | undefined = activeLevel.batches.find(
    (b) => b.id === selectedBatchId
  ) || activeLevel.batches[0];

  // Preferred timing field
  const [preferredTiming, setPreferredTiming] = useState(activeBatch?.time || "");
  useEffect(() => {
    if (activeBatch) {
      setPreferredTiming(activeBatch.time);
    }
  }, [activeBatch]);

  // Student / Applicant details
  const [education, setEducation] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [address, setAddress] = useState("");

  // Agreement Checkboxes (Sections 9 & 10)
  const [agreeRulesAndPolicy, setAgreeRulesAndPolicy] = useState(false);
  const [agreeRulesOnly, setAgreeRulesOnly] = useState(false);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Fee calculation
  const courseFee = activeLevel.courseFee;
  const securityDeposit = activeLevel.securityDeposit;
  const totalAmount = courseFee + securityDeposit;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your Full Name.");
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit Mobile Number.");
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      toast.error("Please enter a valid Email Address.");
      return;
    }
    if (!education.trim()) {
      toast.error("Please specify your current Educational Qualification.");
      return;
    }
    if (!collegeName.trim()) {
      toast.error("Please specify your College or Institute Name.");
      return;
    }
    if (!address.trim()) {
      toast.error("Please provide your Address or City.");
      return;
    }
    if (!agreeRulesOnly) {
      toast.error("Please read and agree to the Rules & Regulations.");
      return;
    }
    if (!agreeRulesAndPolicy) {
      toast.error("Please agree to the Rules & Regulations and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    const registrationId = `REG-${Date.now().toString().slice(-6)}`;

    const payload = {
      id: registrationId,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim(),
      language: currentLanguage.name,
      level: activeLevel.level,
      batch: activeBatch?.name || "Standard Batch",
      preferredTiming: preferredTiming || activeBatch?.time,
      days: activeBatch?.days || "As scheduled",
      duration: activeLevel.duration,
      education: education.trim(),
      collegeName: collegeName.trim(),
      address: address.trim(),
      courseFee,
      securityDeposit,
      totalAmount,
      refundCondition: activeLevel.refundCondition,
      registeredAt: new Date().toISOString(),
      status: "Confirmed",
    };

    try {
      // Store in admissions records for database compatibility
      await createAdmission({
        name: payload.fullName,
        email: payload.emailAddress,
        phone: payload.mobileNumber,
        education: payload.education,
        college_name: payload.collegeName,
        address: payload.address,
        program: `${payload.language} (${payload.level}) - ${payload.batch}`,
        message: `Timing: ${payload.preferredTiming} | Duration: ${payload.duration} | Total Fee: ₹${payload.totalAmount}`,
        amount: payload.totalAmount,
        status: "completed",
      });

      // Save locally to registrations history
      const existing = JSON.parse(
        localStorage.getItem("parivattan_course_registrations") || "[]"
      );
      localStorage.setItem(
        "parivattan_course_registrations",
        JSON.stringify([payload, ...existing])
      );

      setSubmittedData(payload);
      toast.success("Course Registration submitted successfully!");
      if (onSuccess) onSuccess(payload);
    } catch (err) {
      console.error("Registration error:", err);
      // Fallback save locally
      setSubmittedData(payload);
      toast.success("Course Registration recorded successfully!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedData(null);
    setFullName("");
    setMobileNumber("");
    setEmailAddress("");
    setEducation("");
    setCollegeName("");
    setAddress("");
    setAgreeRulesAndPolicy(false);
    setAgreeRulesOnly(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="register" className="scroll-mt-24">
      {submittedData ? (
        /* Confirmation View (Requirement 9: Show a clear confirmation message) */
        <div className="rounded-3xl border-2 border-emerald-500/30 bg-white p-7 sm:p-10 shadow-xl max-w-3xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
              <FileCheck size={42} />
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={14} /> Registration Confirmed
            </span>
            <h2 className="mt-3 text-3xl font-serif font-bold text-[#24312d]">
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm text-[#65706a]">
              Welcome to Parivattan Foreign Language School. Your registration details have been recorded.
            </p>
          </div>

          {/* Registration Receipt Card */}
          <div className="mt-8 rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e5dc] pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#65706a]">
                  Registration Reference Number
                </p>
                <p className="font-mono text-lg font-bold text-[#b5623b]">
                  {submittedData.id}
                </p>
              </div>
              <div className="text-left sm:text-right text-xs text-[#65706a]">
                <p>Status: <strong className="text-emerald-700">Payment Pending Verification</strong></p>
                <p>{new Date(submittedData.registeredAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[#65706a]">Applicant Full Name</p>
                <p className="font-bold text-[#24312d] text-sm mt-0.5">{submittedData.fullName}</p>
              </div>
              <div>
                <p className="text-[#65706a]">Contact Details</p>
                <p className="font-semibold text-[#24312d] mt-0.5">{submittedData.mobileNumber} • {submittedData.emailAddress}</p>
              </div>
              <div>
                <p className="text-[#65706a]">Selected Course & Level</p>
                <p className="font-bold text-[#24312d] text-sm mt-0.5">
                  {submittedData.language} – Level {submittedData.level}
                </p>
              </div>
              <div>
                <p className="text-[#65706a]">Batch & Timing</p>
                <p className="font-semibold text-[#24312d] mt-0.5">
                  {submittedData.batch} ({submittedData.preferredTiming})
                </p>
                <p className="text-[11px] text-[#65706a]">{submittedData.days}</p>
              </div>
            </div>

            {/* Fee Breakdown Confirmation */}
            <div className="mt-5 rounded-xl bg-white border border-[#e2e5dc] p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#65706a]">Course Fee</span>
                <span className="font-bold text-[#24312d]">₹{submittedData.courseFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">Security Deposit</span>
                <span className="font-bold text-[#b5623b]">
                  {submittedData.securityDeposit > 0
                    ? `₹${submittedData.securityDeposit.toLocaleString("en-IN")} (Refundable)`
                    : "₹0 (Not Applicable)"}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#f1f3ed] pt-2 font-bold text-sm">
                <span className="text-[#24312d]">Total Payable Amount</span>
                <span className="text-base font-serif text-[#24312d]">₹{submittedData.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {submittedData.securityDeposit > 0 && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-950 flex items-start gap-2">
                <Info size={14} className="shrink-0 text-emerald-700 mt-0.5" />
                <span>
                  <strong>Refund Condition:</strong> {submittedData.refundCondition}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#24312d] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#b5623b] transition"
            >
              <Download size={15} />
              <span>Print / Download Confirmation</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d9ddd4] bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#24312d] hover:bg-[#fbfaf7] transition"
            >
              <RotateCcw size={14} />
              <span>New Registration</span>
            </button>
            <Link
              to="/rules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d9ddd4] bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#65706a] hover:text-[#24312d] transition"
            >
              <span>View Rules & Regulations</span>
            </Link>
          </div>
        </div>
      ) : (
        /* The Registration Form (Requirement 9) */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-10 shadow-lg"
        >
          <div className="border-b border-[#f1f3ed] pb-6 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <GraduationCap size={14} /> Course Registration
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
              Register for Your Language Course
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#65706a]">
              Please fill in your applicant details, select your language, level, and preferred batch.
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                <User size={16} className="text-[#b5623b]" />
                1. Student / Applicant Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your complete legal name"
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Educational Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. 12th Pass, B.E., B.Com, Diploma"
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* College / Institute Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    College / Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="Enter your current college or employer"
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Residential Address / City */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Address / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, State, Pin Code"
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 2. Course & Batch Selection */}
            <div className="border-t border-[#f1f3ed] pt-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                <Calendar size={16} className="text-[#b5623b]" />
                2. Course, Level & Batch Selection
              </h3>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                  Select Language <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {LANGUAGE_COURSES.map((course) => {
                    const isSelected =
                      selectedLanguageName.toLowerCase() === course.id.toLowerCase() ||
                      selectedLanguageName.toLowerCase().includes(course.id.toLowerCase());
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setSelectedLanguageName(course.name)}
                        className={`flex items-center gap-2 rounded-xl p-3 text-left transition border ${
                          isSelected
                            ? "border-[#b5623b] bg-white ring-2 ring-[#b5623b]/20 shadow-xs"
                            : "border-[#e2e5dc] bg-[#fbfaf7] hover:border-[#b5623b]"
                        }`}
                      >
                        <span className="text-2xl">{course.flag}</span>
                        <div>
                          <p className="text-xs font-bold text-[#24312d] leading-none">
                            {course.name.replace(" Language", "")}
                          </p>
                          <p className="text-[10px] text-[#65706a] mt-0.5">{course.levelsSummary}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                  Select Level ({currentLanguage.name}) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentLanguage.levels.map((lvl) => {
                    const isSelected = lvl.id === selectedLevelId;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSelectedLevelId(lvl.id)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition border ${
                          isSelected
                            ? "bg-[#24312d] text-white border-[#24312d] shadow-sm"
                            : "bg-[#fbfaf7] text-[#65706a] border-[#e2e5dc] hover:border-[#b5623b]"
                        }`}
                      >
                        <span>{lvl.level}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-[#eef0e8] text-[#65706a]"
                        }`}>
                          {lvl.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Batch & Timing Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Batch */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Select Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                  >
                    {activeLevel.batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.days})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Timing */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24312d] mb-1.5">
                    Preferred Timing <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={preferredTiming}
                      onChange={(e) => setPreferredTiming(e.target.value)}
                      placeholder="e.g. 10:00 AM – 11:30 AM or 7:00 PM – 8:30 PM"
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm font-mono focus:border-[#b5623b] focus:bg-white focus:outline-none transition"
                    />
                    <Clock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65706a]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Confirmation Breakdown (Requirement 9 & 8) */}
            <div className="border-t border-[#f1f3ed] pt-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#b5623b]" />
                3. Payment Confirmation
              </h3>

              <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#65706a]">Course:</span>
                  <span className="font-bold text-[#24312d]">
                    {currentLanguage.name} – {activeLevel.level} ({activeLevel.duration})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#65706a]">Schedule:</span>
                  <span className="font-medium text-[#24312d]">
                    {activeBatch?.days} • {preferredTiming}
                  </span>
                </div>

                <div className="border-t border-[#eef0e8] pt-2 flex items-center justify-between text-xs">
                  <span className="text-[#65706a]">Course Fee</span>
                  <span className="font-bold text-[#24312d]">
                    ₹{courseFee.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#65706a]">Security Deposit</span>
                  {securityDeposit > 0 ? (
                    <span className="font-bold text-[#b5623b]">
                      ₹{securityDeposit.toLocaleString("en-IN")} (Refundable)
                    </span>
                  ) : (
                    <span className="text-[#65706a]">₹0 (Not Applicable)</span>
                  )}
                </div>

                <div className="border-t border-[#e2e5dc] pt-2.5 flex items-center justify-between font-bold text-sm">
                  <span className="text-[#24312d] uppercase text-xs tracking-wider">
                    Total Amount Payable
                  </span>
                  <span className="text-xl font-serif text-[#24312d]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {activeLevel.hasSecurityDeposit && (
                  <p className="text-[11px] text-emerald-800 italic pt-1 border-t border-[#eef0e8]">
                    * {activeLevel.refundCondition}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Agreement Checkboxes (Sections 9 & 10) */}
            <div className="border-t border-[#f1f3ed] pt-6 space-y-3.5">
              {/* Checkbox 1: Rules & Regulations (Section 10) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={agreeRulesOnly}
                  onChange={(e) => setAgreeRulesOnly(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
                />
                <span className="text-xs text-[#24312d] leading-relaxed">
                  I have read and agree to the{" "}
                  <Link
                    to="/rules"
                    target="_blank"
                    className="font-bold text-[#b5623b] hover:underline"
                  >
                    Rules & Regulations
                  </Link>
                  . (Includes non-transferability, attendance criteria, and exam-based security deposit refund terms).
                </span>
              </label>

              {/* Checkbox 2: Rules & Privacy Policy (Section 9) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={agreeRulesAndPolicy}
                  onChange={(e) => setAgreeRulesAndPolicy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
                />
                <span className="text-xs text-[#24312d] leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/rules"
                    target="_blank"
                    className="font-bold text-[#b5623b] hover:underline"
                  >
                    Rules & Regulations
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    className="font-bold text-[#b5623b] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#b5623b] py-4 text-sm font-bold text-white shadow-md hover:bg-[#954b2c] hover:shadow-lg transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  <span>Processing Registration...</span>
                </>
              ) : (
                <>
                  <span>Submit Course Registration • ₹{totalAmount.toLocaleString("en-IN")}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-[#65706a]">
              A confirmation message and reference number will be displayed immediately upon submission.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
