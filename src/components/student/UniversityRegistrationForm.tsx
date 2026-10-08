import React, { useState, ChangeEvent } from "react";
import {
  FileText,
  User,
  GraduationCap,
  Building2,
  MapPin,
  Upload,
  Camera,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Sparkles,
  FileCheck2,
  Award,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StudentUser, Course } from "@/types/student";

export interface RegistrationFormData {
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  category: string;
  bloodGroup: string;
  email: string;
  phone: string;
  address: string;
  currentAddress?: string;
  permanentAddress?: string;
  city: string;
  district: string;
  pincode: string;
  qualification: string;
  collegeName: string;
  passingYear: string;
  percentage: string;
  batchPreference: string;
  learningMode: string;
  photoUrl: string;
  idProofUrl: string;
  marksheetUrl: string;
  casteCertUrl: string;
}

interface UniversityRegistrationFormProps {
  student: StudentUser;
  course: Course;
  onBack: () => void;
  onSubmit: (formData: RegistrationFormData) => void;
}

export const UniversityRegistrationForm: React.FC<UniversityRegistrationFormProps> = ({
  student,
  course,
  onBack,
  onSubmit,
}) => {
  const [form, setForm] = useState<RegistrationFormData>({
    fullName: student.name || "",
    fatherName: "",
    motherName: "",
    dob: "2003-05-15",
    gender: "Male",
    category: "General",
    bloodGroup: "O+",
    email: student.email || "",
    phone: student.phone || "",
    address: "",
    city: student.city || "Pune",
    district: "Pune",
    pincode: "411001",
    qualification: "12th Pass",
    collegeName: "",
    passingYear: "2024",
    percentage: "78.5%",
    batchPreference: "Morning Batch (08:00 AM - 10:00 AM)",
    learningMode: course.mode || "Hybrid Classroom",
    photoUrl: "",
    idProofUrl: "",
    marksheetUrl: "",
    casteCertUrl: "",
  });

  // Current & Permanent Addresses
  const [isSameAddress, setIsSameAddress] = useState(true);
  const [currentAddressLine, setCurrentAddressLine] = useState("");
  const [currentCity, setCurrentCity] = useState(student.city || "Pune");
  const [currentDistrict, setCurrentDistrict] = useState("Pune");
  const [currentPincode, setCurrentPincode] = useState("411001");
  const [permAddressLine, setPermAddressLine] = useState("");
  const [permCity, setPermCity] = useState(student.city || "Pune");
  const [permDistrict, setPermDistrict] = useState("Pune");
  const [permPincode, setPermPincode] = useState("411001");

  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  const updateField = (key: keyof RegistrationFormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    fieldKey: keyof RegistrationFormData,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${label} file size must be less than 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField(fieldKey, reader.result as string);
      toast.success(`${label} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Please enter candidate's full legal name.");
      return;
    }
    if (!form.fatherName.trim()) {
      toast.error("Please enter father's or guardian's name.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter a valid contact phone number.");
      return;
    }
    if (!currentAddressLine.trim()) {
      toast.error("Please enter current residential address.");
      return;
    }
    if (!isSameAddress && !permAddressLine.trim()) {
      toast.error("Please enter permanent hometown address.");
      return;
    }
    if (!form.collegeName.trim()) {
      toast.error("Please enter school or college name.");
      return;
    }

    // Strict validation: if category is not General, caste certificate is strictly required
    if (form.category !== "General" && !form.casteCertUrl) {
      toast.error(
        `Caste Certificate is mandatory for ${form.category} category students. Please upload your document.`
      );
      return;
    }

    if (!declarationAgreed) {
      toast.error("Please accept the rules and declaration.");
      return;
    }

    const fullCurrent = `${currentAddressLine}, ${currentCity}, ${currentDistrict} - ${currentPincode}`;
    const fullPermanent = isSameAddress
      ? fullCurrent
      : `${permAddressLine}, ${permCity}, ${permDistrict} - ${permPincode}`;

    // Default sample photo / docs if empty so student is never blocked in demo/sandbox
    const finalData: RegistrationFormData = {
      ...form,
      address: fullCurrent,
      currentAddress: fullCurrent,
      permanentAddress: fullPermanent,
      city: currentCity,
      district: currentDistrict,
      pincode: currentPincode,
      photoUrl:
        form.photoUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
      idProofUrl:
        form.idProofUrl ||
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop",
      marksheetUrl:
        form.marksheetUrl ||
        "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&auto=format&fit=crop",
      casteCertUrl: form.casteCertUrl || "",
    };

    onSubmit(finalData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top Banner with Selected Course Bar */}
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#b5623b]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={13} />
              Step 3: Course Admission Registration
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
              Course Admission Application Form
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#65706a]">
              Student PRN: <strong className="text-[#24312d]">{student.prn}</strong> · Academic Session 2026-27
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={14} />
            Change Course
          </button>
        </div>

        {/* Selected Course Quick Card */}
        <div className="mt-5 rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#b5623b]/15 text-[#b5623b] flex items-center justify-center font-bold text-lg shrink-0">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="rounded bg-[#eef0e8] px-2 py-0.5 text-[10px] font-bold text-[#4d5752]">
                {course.code} · {course.school}
              </span>
              <h4 className="font-serif text-base font-bold text-[#24312d] mt-0.5">
                {course.title}
              </h4>
              <p className="text-xs text-[#65706a]">
                Duration: {course.duration} · Batch Starts: {course.batchStart}
              </p>
            </div>
          </div>

          <div className="text-right md:border-l md:border-gray-200 md:pl-5 shrink-0 flex items-center md:flex-col md:items-end justify-between">
            <span className="text-xs text-[#65706a]">Admission Fee:</span>
            <span className="text-xl font-bold text-[#24312d]">
              ₹{course.finalPayable.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Candidate Personal Details */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef0e8]">
            <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                Candidate Personal Details
              </h3>
              <p className="text-xs text-[#65706a]">
                Student name, parent information and permanent residential address
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Full Legal Name (as per certificates) *
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Father's / Guardian's Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sitaram More"
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Mother's Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sunita"
                value={form.motherName}
                onChange={(e) => updateField("motherName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  Gender *
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                >
                  <option value="General">General / Open</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="NT/VJNT">NT / VJNT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Mobile Number (Calling & WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            {/* Address: Current and Permanent */}
            <div className="sm:col-span-2 pt-2 border-t border-[#eef0e8]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-[#b5623b]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#24312d]">
                  1. Current Residential Address *
                </h4>
              </div>
              <textarea
                required
                rows={2}
                placeholder="Flat / Room No., Society / Building Name, Street, Landmark..."
                value={currentAddressLine}
                onChange={(e) => setCurrentAddressLine(e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Current City / Town *
              </label>
              <input
                type="text"
                required
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  Current District *
                </label>
                <input
                  type="text"
                  required
                  value={currentDistrict}
                  onChange={(e) => setCurrentDistrict(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  Current Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={currentPincode}
                  onChange={(e) => setCurrentPincode(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
            </div>

            {/* Same as current toggle */}
            <div className="sm:col-span-2 py-1">
              <label className="inline-flex items-center gap-2.5 cursor-pointer rounded-xl bg-[#fbfaf7] border border-[#d5d9cf] px-4 py-2.5 hover:border-[#b5623b]/50 transition">
                <input
                  type="checkbox"
                  checked={isSameAddress}
                  onChange={(e) => setIsSameAddress(e.target.checked)}
                  className="w-4 h-4 rounded text-[#b5623b] focus:ring-[#b5623b]"
                />
                <span className="text-xs font-semibold text-[#24312d]">
                  Permanent hometown address is same as current residential address
                </span>
              </label>
            </div>

            {/* Permanent Address fields (if different) */}
            {!isSameAddress && (
              <>
                <div className="sm:col-span-2 pt-2 border-t border-dashed border-[#eef0e8]">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} className="text-[#b5623b]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#24312d]">
                      2. Permanent Hometown Address *
                    </h4>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Flat No., Village / Native Place, Post, Taluka..."
                    value={permAddressLine}
                    onChange={(e) => setPermAddressLine(e.target.value)}
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                    Permanent City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={permCity}
                    onChange={(e) => setPermCity(e.target.value)}
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                      Permanent District *
                    </label>
                    <input
                      type="text"
                      required
                      value={permDistrict}
                      onChange={(e) => setPermDistrict(e.target.value)}
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                      Permanent Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={permPincode}
                      onChange={(e) => setPermPincode(e.target.value)}
                      className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Academic Background */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef0e8]">
            <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                Academic Background
              </h3>
              <p className="text-xs text-[#65706a]">
                Highest qualification, institution details and score
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Highest Qualification *
              </label>
              <select
                value={form.qualification}
                onChange={(e) => updateField("qualification", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              >
                <option value="10th Pass (SSC)">10th Pass (SSC)</option>
                <option value="12th Pass">12th Pass (HSC - Arts / Commerce / Science)</option>
                <option value="Diploma Engineering">Polytechnic Diploma</option>
                <option value="B.E. / B.Tech / BCA / BCS">Graduate (Tech / Engineering / Science)</option>
                <option value="B.Com / B.A / Other Graduate">Graduate (Commerce / Arts / Others)</option>
                <option value="Post Graduate (Master Degree)">Post Graduate (Master's Degree)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                School / College Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern College of Arts, Science & Commerce"
                value={form.collegeName}
                onChange={(e) => updateField("collegeName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Year of Passing
              </label>
              <input
                type="text"
                value={form.passingYear}
                onChange={(e) => updateField("passingYear", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                Percentage / CGPA
              </label>
              <input
                type="text"
                placeholder="e.g. 78.4% or 8.2 CGPA"
                value={form.percentage}
                onChange={(e) => updateField("percentage", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Batch Preference */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef0e8]">
            <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                Batch & Timing Preference
              </h3>
              <p className="text-xs text-[#65706a]">
                Select your convenient classroom timing
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "Morning",
                title: "Morning Batch",
                time: "08:00 AM - 10:00 AM",
                icon: "🌅",
              },
              {
                id: "Evening",
                title: "Evening Batch",
                time: "06:00 PM - 08:00 PM",
                icon: "🌆",
              },
              {
                id: "Weekend",
                title: "Weekend Batch",
                time: "Sat-Sun 10:00 AM - 02:00 PM",
                icon: "⚡",
              },
            ].map((b) => {
              const fullTitle = `${b.title} (${b.time})`;
              const isChosen = form.batchPreference === fullTitle;
              return (
                <div
                  key={b.id}
                  onClick={() => updateField("batchPreference", fullTitle)}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${
                    isChosen
                      ? "border-[#b5623b] bg-[#b5623b]/5 ring-2 ring-[#b5623b]"
                      : "border-[#e2e5dc] bg-[#fbfaf7] hover:border-[#b5623b]/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <h4 className="text-xs font-bold text-[#24312d]">{b.title}</h4>
                  <p className="text-[11px] text-[#65706a] mt-0.5">{b.time}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Document Uploads */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef0e8]">
            <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                Mandatory Document Uploads & Proofs
              </h3>
              <p className="text-xs text-[#65706a]">
                Identity Proof, Education Proof, Photo, and Caste Certificate (if category student)
              </p>
            </div>
          </div>

          {/* Conditional Notice if Reserved Category */}
          {form.category !== "General" && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-900">
              <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Caste Certificate Required:</span> Since you selected{" "}
                <span className="font-semibold underline">{form.category}</span> category, uploading your government-issued Caste / Category Certificate is strictly mandatory to avail institutional fee subsidy and reserved quota.
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Photo */}
            <div className="rounded-2xl border border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 text-center flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    * Required
                  </span>
                  <Camera size={16} className="text-[#b5623b]" />
                </div>
                <p className="text-xs font-bold text-[#24312d]">1. Passport Photo</p>
                <p className="text-[11px] text-[#65706a] mb-3">Recent clear student face photo</p>

                {form.photoUrl ? (
                  <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-[#b5623b] mb-2 shadow-sm">
                    <img
                      src={form.photoUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">
                    <Camera size={20} />
                  </div>
                )}
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.photoUrl ? "Change Photo" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "photoUrl", "Photo")}
                />
              </label>
            </div>

            {/* 2. Aadhaar / Identity Proof */}
            <div className="rounded-2xl border border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 text-center flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    * Required
                  </span>
                  <ShieldCheck size={16} className="text-[#b5623b]" />
                </div>
                <p className="text-xs font-bold text-[#24312d]">2. Identity Proof</p>
                <p className="text-[11px] text-[#65706a] mb-3">Aadhaar / Voter / PAN / Passport</p>

                {form.idProofUrl ? (
                  <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-[#b5623b] mb-2 shadow-sm">
                    <img
                      src={form.idProofUrl}
                      alt="ID Proof"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">
                    <ShieldCheck size={20} />
                  </div>
                )}
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.idProofUrl ? "Change ID" : "Upload ID Proof"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "idProofUrl", "Identity Proof")}
                />
              </label>
            </div>

            {/* 3. Education Proof / Marksheet */}
            <div className="rounded-2xl border border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 text-center flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    * Required
                  </span>
                  <FileCheck2 size={16} className="text-[#b5623b]" />
                </div>
                <p className="text-xs font-bold text-[#24312d]">3. Education Proof</p>
                <p className="text-[11px] text-[#65706a] mb-3">10th / 12th / Degree / College ID</p>

                {form.marksheetUrl ? (
                  <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-[#b5623b] mb-2 shadow-sm">
                    <img
                      src={form.marksheetUrl}
                      alt="Education Proof"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">
                    <FileCheck2 size={20} />
                  </div>
                )}
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.marksheetUrl ? "Change Proof" : "Upload Edu Proof"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "marksheetUrl", "Education Proof")}
                />
              </label>
            </div>

            {/* 4. Caste Certificate (Conditional) */}
            <div
              className={`rounded-2xl border border-dashed p-4 text-center flex flex-col justify-between transition ${
                form.category !== "General"
                  ? form.casteCertUrl
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-amber-400 bg-amber-50/40"
                  : "border-[#d5d9cf] bg-[#fbfaf7]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {form.category !== "General" ? (
                    <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5">
                      * Mandatory ({form.category})
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5">
                      Exempt (General)
                    </span>
                  )}
                  <Award size={16} className={form.category !== "General" ? "text-amber-700" : "text-[#65706a]"} />
                </div>
                <p className="text-xs font-bold text-[#24312d]">4. Caste Certificate</p>
                <p className="text-[11px] text-[#65706a] mb-3">
                  {form.category !== "General" ? "Govt authorized certificate" : "Optional for Open category"}
                </p>

                {form.casteCertUrl ? (
                  <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-emerald-500 mb-2 shadow-sm">
                    <img
                      src={form.casteCertUrl}
                      alt="Caste Certificate"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 mx-auto rounded-xl border border-dashed flex items-center justify-center mb-2 ${
                      form.category !== "General"
                        ? "bg-amber-100/60 border-amber-300 text-amber-700"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    <Award size={20} />
                  </div>
                )}
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.casteCertUrl ? "Change Certificate" : "Upload Certificate"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "casteCertUrl", "Caste Certificate")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Declaration & Submit */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declarationAgreed}
              onChange={(e) => setDeclarationAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
            />
            <span className="text-xs sm:text-sm text-[#4d5752] leading-relaxed">
              I hereby declare that all the information provided in this admission form is true and correct. I agree to comply with all educational policies, attendance requirements and codes of conduct of Parivattan Mission Foundation.
            </span>
          </label>

          <div className="mt-6 pt-5 border-t border-[#eef0e8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} />
              Back to Courses
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#b5623b] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:bg-[#974a27] transition"
            >
              Proceed to Payment & Confirm Admission
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
