import { FormEvent, useState, useRef, ChangeEvent } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  User,
  GraduationCap,
  Building2,
  MapPin,
  Upload,
  Camera,
  FileText,
  Award,
  X,
  FileCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdmission } from "@/lib/supabase-admin";
import { toast } from "sonner";

interface FileData {
  file: File | null;
  name: string;
  size: string;
  dataUrl: string;
  type: string;
}

const emptyFileData: FileData = {
  file: null,
  name: "",
  size: "",
  dataUrl: "",
  type: "",
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AdmissionsPage() {
  const [busy, setBusy] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // The 7 requested fields
  const [form, setForm] = useState({
    name: "",
    education: "",
    collegeName: "",
    address: "",
  });

  const [identityProof, setIdentityProof] = useState<FileData>(emptyFileData);
  const [photo, setPhoto] = useState<FileData>(emptyFileData);
  const [casteCertificate, setCasteCertificate] = useState<FileData>(emptyFileData);

  const update = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (data: FileData) => void,
    fieldLabel: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${fieldLabel} must be smaller than 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        dataUrl: reader.result as string,
        type: file.type,
      });
      toast.success(`${fieldLabel} uploaded successfully!`);
    };
    reader.onerror = () => {
      toast.error(`Failed to read ${fieldLabel}. Please try again.`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setter: (data: FileData) => void,
    fieldLabel: string
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${fieldLabel} must be smaller than 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        dataUrl: reader.result as string,
        type: file.type,
      });
      toast.success(`${fieldLabel} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter your Name.");
      return;
    }
    if (!form.education.trim()) {
      toast.error("Please enter your Education qualification.");
      return;
    }
    if (!form.collegeName.trim()) {
      toast.error("Please enter your College Name.");
      return;
    }
    if (!form.address.trim()) {
      toast.error("Please enter your Address.");
      return;
    }
    if (!identityProof.dataUrl) {
      toast.error("Please upload your Identity Proof document.");
      return;
    }
    if (!photo.dataUrl) {
      toast.error("Please upload your Photo.");
      return;
    }
    if (!casteCertificate.dataUrl) {
      toast.error("Please upload your Caste Certificate.");
      return;
    }

    setBusy(true);
    try {
      const created = await createAdmission({
        name: form.name.trim(),
        education: form.education.trim(),
        college_name: form.collegeName.trim(),
        address: form.address.trim(),
        identity_proof: identityProof.dataUrl,
        identity_proof_name: identityProof.name,
        photo: photo.dataUrl,
        photo_name: photo.name,
        caste_certificate: casteCertificate.dataUrl,
        caste_certificate_name: casteCertificate.name,
        status: "completed",
      });

      setSubmittedId(created.id);
      toast.success("Admission application submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit admission application. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      education: "",
      collegeName: "",
      address: "",
    });
    setIdentityProof(emptyFileData);
    setPhoto(emptyFileData);
    setCasteCertificate(emptyFileData);
    setSubmittedId(null);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />
      <main className="page-section pt-32 md:pt-36">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Left Column: Info & Guidance */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={14} /> Admissions 2026-27
            </div>
            <h1 className="mt-4 text-4xl font-serif leading-[1.08] sm:text-5xl md:text-6xl text-[#24312d]">
              Begin your learning journey.
            </h1>
            <p className="mt-6 text-base text-[#65706a] leading-relaxed md:text-lg">
              Welcome to Parivattan Mission Foundation. Submit your application below with your educational details and required documents. Our admissions team will review your application.
            </p>

            {/* Checklist */}
            <div className="mt-8 rounded-2xl border border-[#e2e5dc] bg-white/70 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="font-serif text-lg text-[#24312d]">Required Documents Checklist</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#65706a]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="shrink-0 text-[#b5623b]" size={18} />
                  <span>Valid <strong>Identity Proof</strong> (Aadhaar / Voter ID / PAN)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="shrink-0 text-[#b5623b]" size={18} />
                  <span>Recent <strong>Passport Size Photo</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="shrink-0 text-[#b5623b]" size={18} />
                  <span>Competent Authority <strong>Caste Certificate</strong></span>
                </li>
              </ul>
            </div>

            <div className="mt-8 space-y-3.5 text-sm text-[#65706a]">
              <p className="flex items-center gap-3">
                <CheckCircle2 className="shrink-0 text-[#b5623b]" size={20} />
                <span>Transparent & merit-inclusive admission verification</span>
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 className="shrink-0 text-[#b5623b]" size={20} />
                <span>Programs designed around practical skills & growth</span>
              </p>
              <p className="flex items-center gap-3">
                <ShieldCheck className="shrink-0 text-[#b5623b]" size={20} />
                <span>Encrypted & confidential document storage</span>
              </p>
            </div>
          </div>

          {/* Right Column: Admission Form or Success View */}
          {submittedId ? (
            <div className="rounded-3xl border border-[#e2e5dc] bg-white p-8 text-center shadow-lg md:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FileCheck size={42} />
              </div>
              <h2 className="mt-6 text-3xl font-serif text-[#24312d]">Application Submitted!</h2>
              <p className="mt-2 text-sm text-[#65706a]">
                Your admission application has been registered successfully.
              </p>

              <div className="mx-auto mt-6 max-w-md rounded-2xl bg-[#fbfaf7] p-5 text-left border border-[#e2e5dc]">
                <p className="text-xs uppercase tracking-wider text-[#65706a] font-semibold">Application Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-[#b5623b] break-all">{submittedId}</p>
                <div className="mt-4 border-t border-[#e2e5dc] pt-3 text-xs space-y-1.5 text-[#65706a]">
                  <p><strong className="text-[#24312d]">Applicant:</strong> {form.name}</p>
                  <p><strong className="text-[#24312d]">Education:</strong> {form.education}</p>
                  <p><strong className="text-[#24312d]">College:</strong> {form.collegeName}</p>
                  <p><strong className="text-[#24312d]">Address:</strong> {form.address}</p>
                  <p><strong className="text-[#24312d]">Documents:</strong> ID Proof, Photo, Caste Certificate attached</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto rounded-full bg-[#b5623b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#954b2c]"
                >
                  Submit Another Application
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto rounded-full border border-[#d9ddd4] px-6 py-3 text-sm font-semibold text-[#24312d] transition hover:bg-[#fbfaf7]"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl border border-[#e2e5dc] bg-white p-7 shadow-sm md:p-10">
              <div className="border-b border-[#eef0e8] pb-5 mb-6">
                <h2 className="text-2xl font-serif text-[#24312d]">Admission Application Form</h2>
                <p className="text-xs text-[#65706a] mt-1">Please provide accurate personal and academic information.</p>
              </div>

              <div className="space-y-5">
                {/* 1. Name */}
                <div className="field">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#24312d]">
                    <User size={15} className="text-[#b5623b]" />
                    Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                </div>

                {/* 2. Education */}
                <div className="field">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#24312d]">
                    <GraduationCap size={15} className="text-[#b5623b]" />
                    Education <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    type="text"
                    value={form.education}
                    onChange={e => update("education", e.target.value)}
                    placeholder="e.g., 10th / 12th / Diploma / Bachelor's / Master's"
                    className="w-full"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["10th Standard", "12th Standard", "Diploma", "Graduation", "Post Graduation"].map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => update("education", item)}
                        className={`rounded-full px-2.5 py-0.5 text-xs transition border ${
                          form.education === item
                            ? "bg-[#b5623b] text-white border-[#b5623b]"
                            : "bg-[#fbfaf7] text-[#65706a] border-[#e2e5dc] hover:border-[#b5623b] hover:text-[#b5623b]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. College Name */}
                <div className="field">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#24312d]">
                    <Building2 size={15} className="text-[#b5623b]" />
                    College Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    type="text"
                    value={form.collegeName}
                    onChange={e => update("collegeName", e.target.value)}
                    placeholder="Enter your college / school / institute name"
                    className="w-full"
                  />
                </div>

                {/* 4. Address */}
                <div className="field">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#24312d]">
                    <MapPin size={15} className="text-[#b5623b]" />
                    Address <span className="text-red-500">*</span>
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={e => update("address", e.target.value)}
                    placeholder="Enter your complete residential address (House no., street, city, state, pin code)"
                    className="w-full"
                  />
                </div>

                {/* 5. Identity Proof */}
                <FileUploadBox
                  label="Identity Proof"
                  description="Upload Aadhaar Card, Voter ID, PAN or Govt ID (PDF, JPG, PNG - Max 5MB)"
                  icon={<FileText size={18} className="text-[#b5623b]" />}
                  fileData={identityProof}
                  accept=".pdf,image/*"
                  isRequired={true}
                  onFileSelect={e => handleFileUpload(e, setIdentityProof, "Identity Proof")}
                  onDrop={e => handleDrop(e, setIdentityProof, "Identity Proof")}
                  onRemove={() => setIdentityProof(emptyFileData)}
                />

                {/* 6. Photo */}
                <PhotoUploadBox
                  label="Photo"
                  description="Recent passport size photograph (JPG, PNG - Max 5MB)"
                  fileData={photo}
                  isRequired={true}
                  onFileSelect={e => handleFileUpload(e, setPhoto, "Photo")}
                  onDrop={e => handleDrop(e, setPhoto, "Photo")}
                  onRemove={() => setPhoto(emptyFileData)}
                />

                {/* 7. Caste Certificate */}
                <FileUploadBox
                  label="Caste Certificate"
                  description="Upload valid caste certificate document (PDF, JPG, PNG - Max 5MB)"
                  icon={<Award size={18} className="text-[#b5623b]" />}
                  fileData={casteCertificate}
                  accept=".pdf,image/*"
                  isRequired={true}
                  onFileSelect={e => handleFileUpload(e, setCasteCertificate, "Caste certificate")}
                  onDrop={e => handleDrop(e, setCasteCertificate, "Caste certificate")}
                  onRemove={() => setCasteCertificate(emptyFileData)}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b5623b] px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-[#954b2c] hover:shadow-md disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    Submit Admission Application
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-[#65706a]">
                By submitting, you certify that the uploaded documents and personal details are genuine.
              </p>

              <Link to="/" className="mt-5 block text-center text-sm font-semibold text-[#b5623b] hover:underline">
                Return to home
              </Link>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Reusable Document Upload Box for Identity Proof & Caste Certificate
function FileUploadBox({
  label,
  description,
  icon,
  fileData,
  accept,
  isRequired,
  onFileSelect,
  onDrop,
  onRemove,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  fileData: FileData;
  accept: string;
  isRequired?: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="field">
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#24312d]">
        <span className="flex items-center gap-1.5">
          {icon}
          {label} {isRequired && <span className="text-red-500">*</span>}
        </span>
        {fileData.file && (
          <span className="text-[11px] font-normal text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={13} /> Attached
          </span>
        )}
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
      />

      {fileData.file || fileData.dataUrl ? (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5 transition">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#24312d]">{fileData.name}</p>
              <p className="text-xs text-[#65706a]">{fileData.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#b5623b] hover:bg-[#b5623b]/10"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#65706a] hover:bg-red-50 hover:text-red-600"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d9ddd4] bg-[#fbfaf7] p-5 text-center transition hover:border-[#b5623b] hover:bg-white"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b5623b]/10 text-[#b5623b]">
            <Upload size={20} />
          </div>
          <p className="mt-2 text-sm font-medium text-[#24312d]">
            Click to upload or drag & drop
          </p>
          <p className="mt-0.5 text-xs text-[#65706a]">{description}</p>
        </div>
      )}
    </div>
  );
}

// Dedicated Photo Upload Box with Instant Image Preview
function PhotoUploadBox({
  label,
  description,
  fileData,
  isRequired,
  onFileSelect,
  onDrop,
  onRemove,
}: {
  label: string;
  description: string;
  fileData: FileData;
  isRequired?: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="field">
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#24312d]">
        <span className="flex items-center gap-1.5">
          <Camera size={15} className="text-[#b5623b]" />
          {label} {isRequired && <span className="text-red-500">*</span>}
        </span>
        {fileData.dataUrl && (
          <span className="text-[11px] font-normal text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={13} /> Photo selected
          </span>
        )}
      </span>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />

      {fileData.dataUrl ? (
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5">
          <img
            src={fileData.dataUrl}
            alt="Applicant Photo Preview"
            className="h-16 w-16 shrink-0 rounded-xl object-cover border border-[#e2e5dc] shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#24312d]">{fileData.name}</p>
            <p className="text-xs text-[#65706a]">{fileData.size}</p>
            <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Passport Photo Ready
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#b5623b] hover:bg-[#b5623b]/10"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#65706a] hover:bg-red-50 hover:text-red-600"
              title="Remove photo"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => photoInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-[#d9ddd4] bg-[#fbfaf7] p-4 transition hover:border-[#b5623b] hover:bg-white"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#b5623b]/10 text-[#b5623b]">
            <Camera size={24} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#24312d]">Upload Passport Size Photo</p>
            <p className="text-xs text-[#65706a]">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
