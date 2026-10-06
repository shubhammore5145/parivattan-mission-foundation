import React from "react";
import {
  CheckCircle2,
  Download,
  Printer,
  GraduationCap,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  ArrowRight,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAdmissionRecord } from "@/types/student";

interface AdmissionReceiptViewProps {
  admission: StudentAdmissionRecord;
  onGoToDashboard: () => void;
  onNewAdmission: () => void;
}

export const AdmissionReceiptView: React.FC<AdmissionReceiptViewProps> = ({
  admission,
  onGoToDashboard,
  onNewAdmission,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      `🎉 माझे परिवर्तन मिशन फाउंडेशन मध्ये '${admission.courseTitle}' या अभ्यासक्रमासाठी प्रवेश निश्चित झाला आहे! Application No: ${admission.applicationNo}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top Congratulatory Alert */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center shadow-lg mb-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-white/20 flex items-center justify-center text-white mb-2">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold">
          अभिनंदन! आपला प्रवेश यशस्वीपणे निश्चित झाला आहे.
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-white/90">
          Admission Confirmed · Parivattan Mission Foundation Academic Year 2026-27
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-white text-emerald-800 px-4 py-2 text-xs sm:text-sm font-bold shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
          >
            <Printer size={15} />
            पावती प्रिंट करा / PDF सेव्ह करा (Print Receipt)
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white px-4 py-2 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border border-white/20"
          >
            <Share2 size={15} />
            व्हॉट्सॲपवर शेअर करा
          </button>
        </div>
      </div>

      {/* Official Printable Certificate & Admission Slip */}
      <div
        id="printable-admission-slip"
        className="rounded-3xl border-2 border-[#24312d]/15 bg-white p-6 sm:p-10 shadow-xl relative overflow-hidden text-[#24312d]"
      >
        {/* Watermark / Seal */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <GraduationCap size={400} />
        </div>

        {/* Official Header */}
        <div className="border-b-2 border-[#24312d]/20 pb-5 text-center relative">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/img/parivattanE.png"
              alt="Parivattan Logo"
              className="h-16 w-auto object-contain rounded-md"
            />
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wide text-[#24312d]">
                Parivattan Mission Foundation
              </h1>
              <p className="text-xs font-semibold text-[#b5623b]">
                परिवर्तन मिशन फाउंडेशन · उच्च व कौशल्य शिक्षण विभाग
              </p>
              <p className="text-[10px] text-[#65706a]">
                Centralized Admission Portal (CAP) · Reg. Public Trust & 80G Certified
              </p>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <span className="inline-block rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                ✓ Admitted
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#fbfaf7] py-2 px-4 border border-[#e2e5dc] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[#65706a]">अर्ज क्रमांक (App No): </span>
              <strong className="font-mono text-[#24312d]">{admission.applicationNo}</strong>
            </div>
            <div>
              <span className="text-[#65706a]">विद्यार्थी PRN: </span>
              <strong className="font-mono text-[#b5623b]">{admission.prn}</strong>
            </div>
            <div>
              <span className="text-[#65706a]">दिनांक: </span>
              <strong>{new Date(admission.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
            </div>
          </div>
        </div>

        {/* Candidate & Course Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-6 items-start">
          {/* Candidate Info */}
          <div className="space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#b5623b] uppercase tracking-wider">
              १. विद्यार्थ्याचा वैयक्तिक तपशील (Candidate Details)
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-[#fbfaf7] p-3.5 rounded-2xl border border-[#eef0e8]">
              <div>
                <span className="text-[#65706a] block">विद्यार्थ्याचे पूर्ण नाव:</span>
                <strong className="text-sm text-[#24312d]">{admission.studentName}</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">पालकांचे नाव:</span>
                <strong className="text-[#24312d]">{admission.fatherName || "पालक नोंदणीकृत"}</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">मोबाईल नंबर:</span>
                <strong className="text-[#24312d]">{admission.studentPhone}</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">ई-मेल:</span>
                <strong className="text-[#24312d] truncate block">{admission.studentEmail}</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">जन्मतारीख व लिंग:</span>
                <strong className="text-[#24312d]">{admission.dob} ({admission.gender})</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">प्रवर्ग (Category):</span>
                <strong className="text-[#24312d]">{admission.category}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-[#65706a] block">पत्ता:</span>
                <span className="text-[#24312d]">{admission.address}, {admission.city}, {admission.district} - {admission.pincode}</span>
              </div>
            </div>
          </div>

          {/* Candidate Photo */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl border-2 border-[#b5623b] overflow-hidden bg-gray-100 shadow-sm">
              <img
                src={admission.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces"}
                alt={admission.studentName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-1 text-[10px] font-bold text-[#65706a] uppercase">Verified Photo</span>
          </div>
        </div>

        {/* 2. Course & Batch Info */}
        <div className="mt-6 space-y-3 text-xs">
          <h3 className="font-serif text-sm font-bold text-[#b5623b] uppercase tracking-wider">
            २. प्रवेश घेतलेला अभ्यासक्रम (Enrolled Course Details)
          </h3>
          <div className="bg-[#fbfaf7] p-4 rounded-2xl border border-[#eef0e8] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-base font-serif font-bold text-[#24312d]">
                  {admission.courseTitle}
                </span>
                <span className="ml-2 rounded-md bg-[#eef0e8] px-2 py-0.5 font-mono text-[11px] font-bold text-[#24312d]">
                  {admission.courseCode}
                </span>
              </div>
              <span className="text-xs text-[#b5623b] font-semibold">{admission.school}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#e2e5dc] text-[11px]">
              <div>
                <span className="text-[#65706a] block">बॅच वेळ:</span>
                <strong className="text-[#24312d]">{admission.batchPreference}</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">शिकण्याचा मोड:</span>
                <strong className="text-[#24312d]">{admission.learningMode}</strong>
              </div>
              <div>
                <span className="text-[#65706a] block">पात्रता:</span>
                <strong className="text-[#24312d]">{admission.qualification}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Fee & Transaction Record */}
        <div className="mt-6 space-y-3 text-xs">
          <h3 className="font-serif text-sm font-bold text-[#b5623b] uppercase tracking-wider">
            ३. प्रवेश शुल्क भरणा पावती (Payment & Fee Receipt)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-[#eef0e8]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f3ed] text-[#24312d]">
                <tr>
                  <th className="p-2.5">तपशील (Description)</th>
                  <th className="p-2.5">ट्रॅन्झॅक्शन आयडी (Ref)</th>
                  <th className="p-2.5">स्थिती (Status)</th>
                  <th className="p-2.5 text-right">भरलेली रक्कम (Paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0e8] bg-white">
                <tr>
                  <td className="p-2.5 font-medium">
                    Admission Registration & Kit Fee - {admission.courseTitle}
                  </td>
                  <td className="p-2.5 font-mono text-[#65706a]">{admission.paymentId}</td>
                  <td className="p-2.5">
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      यशस्वी (PAID)
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-serif font-bold text-sm text-[#24312d]">
                    ₹{admission.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Signatures & Seal */}
        <div className="mt-8 pt-6 border-t-2 border-[#24312d]/15 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left text-xs">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-gray-300 p-1 bg-white flex items-center justify-center shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PMF_VERIFIED_${admission.applicationNo}_${admission.prn}`}
                alt="Verification QR"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="text-[10px] text-[#65706a]">
              <p className="font-bold text-[#24312d]">डिजिटल पडताळणी कोड (QR Verified)</p>
              <p>हा अधिकृत कॉम्प्युटर जनरेटेड प्रवेश दाखला आहे.</p>
              <p>हेल्पलाइन: +91 98220 54145 · parivattan.org</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif italic font-bold text-sm text-[#24312d]">
              Kishor Jadhav
            </div>
            <div className="w-32 border-b border-gray-400 mx-auto sm:ml-auto my-1" />
            <div className="text-[10px] font-bold uppercase text-[#65706a]">
              संचालक / Director
            </div>
            <div className="text-[9px] text-[#65706a]">
              Parivattan Mission Foundation
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onNewAdmission}
          className="w-full sm:w-auto rounded-2xl border border-gray-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          + दुसरा अभ्यासक्रम निवडा (Apply for Another Course)
        </button>

        <button
          type="button"
          onClick={onGoToDashboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#24312d] hover:bg-[#b5623b] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition"
        >
          विद्यार्थी डॅशबोर्डवर जा (Go to Student Portal)
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
