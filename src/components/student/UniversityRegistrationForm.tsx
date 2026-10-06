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
      toast.error(`${label} ची साईझ ५MB पेक्षा कमी असावी.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField(fieldKey, reader.result as string);
      toast.success(`${label} अपलोड झाले!`);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleDocs = () => {
    setForm((prev) => ({
      ...prev,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
      idProofUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop",
      marksheetUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&auto=format&fit=crop",
      fatherName: "Ramesh More",
      motherName: "Sunita More",
      address: "Flat 402, Shanti Heights, Near Shivaji Chowk",
      collegeName: "Fergusson College / Government Polytechnic",
    }));
    toast.success("चाचणीसाठी नमुना कागदपत्रे व माहिती भरली गेली!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("कृपया विद्यार्थ्याचे पूर्ण नाव भरा.");
      return;
    }
    if (!form.fatherName.trim()) {
      toast.error("कृपया वडिलांचे / पालकांचे नाव भरा.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("कृपया संपर्क मोबाईल नंबर भरा.");
      return;
    }
    if (!form.address.trim()) {
      toast.error("कृपया पत्ता भरा.");
      return;
    }
    if (!form.collegeName.trim()) {
      toast.error("कृपया शाळा / कॉलेजचे नाव भरा.");
      return;
    }
    if (!declarationAgreed) {
      toast.error("कृपया नियमावली व हमीपत्राच्या अटी मान्य करा.");
      return;
    }

    // Default sample photo / docs if empty so user is never blocked
    const finalData: RegistrationFormData = {
      ...form,
      photoUrl:
        form.photoUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
      idProofUrl:
        form.idProofUrl ||
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop",
      marksheetUrl:
        form.marksheetUrl ||
        "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&auto=format&fit=crop",
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
              स्टेप ३ : प्रवेश अर्ज भरणी (Step 3: Admission Registration)
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
              विद्यापीठ पद्धतीचा प्रवेश अर्ज (CAP Form)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#65706a]">
              विद्यार्थी PRN: <strong className="text-[#24312d]">{student.prn}</strong> · शैक्षणिक वर्ष २०२६-२७
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={14} />
            कोर्स बदला (Change Course)
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
                कालावधी: {course.duration} · प्रारंभ: {course.batchStart}
              </p>
            </div>
          </div>

          <div className="text-right md:border-l md:border-gray-200 md:pl-5 shrink-0 flex items-center md:flex-col md:items-end justify-between">
            <span className="text-xs text-[#65706a]">प्रवेश शुल्क (Fee):</span>
            <span className="text-xl font-bold text-[#24312d]">
              ₹{course.finalPayable.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Quick autofill sample test docs banner */}
        <div className="mt-4 rounded-xl bg-blue-50/70 border border-blue-200 p-3 flex items-center justify-between gap-2">
          <div className="text-xs text-blue-900">
            💡 <strong>चाचणीसाठी जलद भरणा:</strong> एका क्लिकवर नमुना माहिती व कागदपत्रे भरा.
          </div>
          <button
            type="button"
            onClick={handleLoadSampleDocs}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-bold transition shrink-0"
          >
            नमुना डेटा भरा (Fill Demo Data)
          </button>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Candidate Personal Details */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef0e8]">
            <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold text-sm">
              १
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                वैयक्तिक माहिती (Personal Details)
              </h3>
              <p className="text-xs text-[#65706a]">
                विद्यार्थ्याचे नाव, पालक माहिती व कायमस्वरूपी पत्ता
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                विद्यार्थ्याचे पूर्ण नाव (Full Name as per 10th Certificate) *
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
                वडिलांचे / पालकांचे नाव (Father's/Guardian's Name) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. Ramesh Sitaram More"
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                आईचे नाव (Mother's Name)
              </label>
              <input
                type="text"
                placeholder="उदा. Sunita"
                value={form.motherName}
                onChange={(e) => updateField("motherName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                जन्मतारीख (Date of Birth) *
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
                  लिंग (Gender) *
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                >
                  <option value="Male">पुरुष (Male)</option>
                  <option value="Female">स्त्री (Female)</option>
                  <option value="Other">इतर (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  प्रवर्ग (Category) *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                >
                  <option value="General">खुला (General)</option>
                  <option value="OBC">इतर मागास (OBC)</option>
                  <option value="SC">अनुसूचित जाती (SC)</option>
                  <option value="ST">अनुसूचित जमाती (ST)</option>
                  <option value="EWS">आर्थिक दुर्बल (EWS)</option>
                  <option value="NT/VJNT">भटक्या जमाती (NT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                मोबाईल नंबर (WhatsApp/Calling) *
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
                ई-मेल पत्ता (Email) *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                कायमस्वरूपी निवासी पत्ता (Full Address) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="घर क्र., गल्ली, परिसर, पोस्ट..."
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                शहर / तालुका (City/Taluka) *
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  जिल्हा (District) *
                </label>
                <input
                  type="text"
                  required
                  value={form.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  पिनकोड (Pincode) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Background */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#eef0e8]">
            <div className="w-8 h-8 rounded-lg bg-[#b5623b]/10 text-[#b5623b] flex items-center justify-center font-bold text-sm">
              २
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                शैक्षणिक पात्रता (Academic Background)
              </h3>
              <p className="text-xs text-[#65706a]">
                उच्चतम शिक्षण, कॉलेज व प्राप्त गुणांची टक्केवारी
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                उच्चतम पात्रता (Highest Qualification) *
              </label>
              <select
                value={form.qualification}
                onChange={(e) => updateField("qualification", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              >
                <option value="10th Pass (SSC)">१० वी उत्तीर्ण (10th SSC)</option>
                <option value="12th Pass">१२ वी उत्तीर्ण (12th HSC / Arts/Commerce/Science)</option>
                <option value="Diploma Engineering">पॉलिटेक्निक डिप्लोमा (Diploma)</option>
                <option value="B.E. / B.Tech / BCA / BCS">पदवीधर (Graduate - Engg/Tech/Science)</option>
                <option value="B.Com / B.A / Other Graduate">पदवीधर (Graduate - Commerce/Arts)</option>
                <option value="Post Graduate (Master Degree)">पदव्युत्तर (Post Graduate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                शाळा / कॉलेजचे नाव (School / College Name) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. Modern College of Arts, Science & Commerce"
                value={form.collegeName}
                onChange={(e) => updateField("collegeName", e.target.value)}
                className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                उत्तीर्ण वर्ष (Year of Passing)
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
                गुण / टक्केवारी (Percentage / CGPA)
              </label>
              <input
                type="text"
                placeholder="उदा. 75.40% किंवा 8.2 CGPA"
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
              ३
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                बॅच व वेळ प्राधान्य (Batch & Timing Preference)
              </h3>
              <p className="text-xs text-[#65706a]">
                आपल्या सोयीनुसार क्लासची वेळ निवडा
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "Morning",
                title: "सकाळची बॅच (Morning)",
                time: "08:00 AM - 10:00 AM",
                icon: "🌅",
              },
              {
                id: "Evening",
                title: "संध्याकाळची बॅच (Evening)",
                time: "06:00 PM - 08:00 PM",
                icon: "🌆",
              },
              {
                id: "Weekend",
                title: "वीकेंड बॅच (Weekend)",
                time: "शनि-रवि 10:00 AM - 02:00 PM",
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
              ४
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24312d]">
                आवश्यक कागदपत्रे अपलोड (Document Uploads)
              </h3>
              <p className="text-xs text-[#65706a]">
                फोटो, ओळखपत्र व गुणपत्रिका (JPG/PNG/PDF - Max 5MB)
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Photo */}
            <div className="rounded-2xl border border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 text-center">
              <Camera size={24} className="mx-auto text-[#b5623b] mb-1.5" />
              <p className="text-xs font-bold text-[#24312d]">पासपोर्ट फोटो (Photo)</p>
              <p className="text-[11px] text-[#65706a] mb-3">अलीकडचा पासपोर्ट आकार फोटो</p>

              {form.photoUrl ? (
                <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-[#b5623b] mb-2 shadow-sm">
                  <img
                    src={form.photoUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                    अपलोड झाले
                  </span>
                </div>
              ) : null}

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.photoUrl ? "बदला" : "फोटो निवडा"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "photoUrl", "फोटो")}
                />
              </label>
            </div>

            {/* 2. Aadhaar / ID */}
            <div className="rounded-2xl border border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 text-center">
              <ShieldCheck size={24} className="mx-auto text-[#b5623b] mb-1.5" />
              <p className="text-xs font-bold text-[#24312d]">ओळखपत्र (Identity Proof)</p>
              <p className="text-[11px] text-[#65706a] mb-3">आधार कार्ड / मतदान ओळखपत्र</p>

              {form.idProofUrl ? (
                <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-[#b5623b] mb-2 shadow-sm">
                  <img
                    src={form.idProofUrl}
                    alt="ID Proof"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                    अपलोड झाले
                  </span>
                </div>
              ) : null}

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.idProofUrl ? "बदला" : "ओळखपत्र निवडा"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "idProofUrl", "ओळखपत्र")}
                />
              </label>
            </div>

            {/* 3. Marksheet */}
            <div className="rounded-2xl border border-dashed border-[#d5d9cf] bg-[#fbfaf7] p-4 text-center">
              <FileCheck2 size={24} className="mx-auto text-[#b5623b] mb-1.5" />
              <p className="text-xs font-bold text-[#24312d]">गुणपत्रिका (Marksheet)</p>
              <p className="text-[11px] text-[#65706a] mb-3">१० वी / १२ वी किंवा पदवी</p>

              {form.marksheetUrl ? (
                <div className="relative mx-auto w-20 h-20 rounded-xl overflow-hidden border border-[#b5623b] mb-2 shadow-sm">
                  <img
                    src={form.marksheetUrl}
                    alt="Marksheet"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] py-0.5 font-bold">
                    अपलोड झाले
                  </span>
                </div>
              ) : null}

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <span>{form.marksheetUrl ? "बदला" : "गुणपत्रिका निवडा"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "marksheetUrl", "गुणपत्रिका")}
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
              मी याद्वारे घोषित करतो/करते की या अर्जात भरलेली सर्व माहिती सत्य व बिनचूक आहे. मी परिवर्तन मिशन फाउंडेशनच्या सर्व शैक्षणिक नियमांचे, शिस्तीचे आणि उपस्थिती निकषांचे पालन करण्यास बांधील आहे.
            </span>
          </label>

          <div className="mt-6 pt-5 border-t border-[#eef0e8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={16} />
              मागे जा (Back to Courses)
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#b5623b] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:bg-[#974a27] transition"
            >
              प्रवेश अर्ज सादर करा व शुल्क भरा (Proceed to Payment)
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
