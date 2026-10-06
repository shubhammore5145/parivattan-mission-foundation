import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Printer,
  FileCheck,
  Plus,
  LogOut,
  CheckCircle2,
  Building2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { StudentUser, StudentAdmissionRecord } from "@/types/student";
import { logoutStudent } from "@/lib/student-auth";

interface StudentDashboardViewProps {
  student: StudentUser;
  applications: StudentAdmissionRecord[];
  onStartNewAdmission: () => void;
  onViewReceipt: (admission: StudentAdmissionRecord) => void;
  onLogout: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  applications,
  onStartNewAdmission,
  onViewReceipt,
  onLogout,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Student Profile Card */}
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#eef0e8]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#b5623b]/15 text-[#b5623b] flex items-center justify-center font-bold text-2xl shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d]">
                  {student.name}
                </h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  सक्रिय विद्यार्थी
                </span>
              </div>
              <p className="text-xs text-[#65706a] mt-0.5">
                विद्यार्थी कायम नोंदणी क्रमांक (PRN):{" "}
                <strong className="font-mono text-[#b5623b] font-bold text-sm">
                  {student.prn}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onStartNewAdmission}
              className="rounded-2xl bg-[#b5623b] hover:bg-[#974a27] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              नवीन प्रवेश अर्ज करा (New Admission)
            </button>
            <button
              type="button"
              onClick={() => {
                logoutStudent();
                onLogout();
              }}
              className="rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2.5 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
            >
              <LogOut size={15} />
              लॉगआउट
            </button>
          </div>
        </div>

        {/* Student Metadata Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#525f59]">
          <div className="flex items-center gap-2 bg-[#fbfaf7] p-3 rounded-2xl border border-[#eceee7]">
            <Mail size={15} className="text-[#b5623b] shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#fbfaf7] p-3 rounded-2xl border border-[#eceee7]">
            <Phone size={15} className="text-[#b5623b] shrink-0" />
            <span>{student.phone}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#fbfaf7] p-3 rounded-2xl border border-[#eceee7]">
            <Calendar size={15} className="text-[#b5623b] shrink-0" />
            <span>नोंदणी: {new Date(student.registeredAt).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#65706a]">प्रवेश घेतलेले कोर्स</div>
          <div className="mt-2 text-3xl font-serif font-bold text-[#24312d]">
            {applications.length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
            ✓ शैक्षणिक सत्र २०२६-२७
          </div>
        </div>

        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#65706a]">शुल्क भरणा स्थिती</div>
          <div className="mt-2 text-3xl font-serif font-bold text-emerald-700">
            {applications.length > 0 ? "१००% पूर्ण" : "००"}
          </div>
          <div className="mt-1 text-[11px] text-[#65706a]">
            सर्व पावत्या डिजिटल स्वरूपात उपलब्ध
          </div>
        </div>

        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#65706a]">प्रमाणपत्र व परीक्षा</div>
          <div className="mt-2 text-3xl font-serif font-bold text-[#b5623b]">
            पात्र (Eligible)
          </div>
          <div className="mt-1 text-[11px] text-[#65706a]">
            अधिकृत युनिव्हर्सिटी व फाउंडेशन मान्यता
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#eef0e8]">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#24312d]">
              माझे प्रवेश अर्ज व पावत्या (My Applications & Receipts)
            </h3>
            <p className="text-xs text-[#65706a]">
              खालील अभ्यासक्रमांमध्ये आपला प्रवेश निश्चित झालेला आहे
            </p>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="mt-6 space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 hover:border-[#b5623b]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded bg-[#eef0e8] px-2 py-0.5 text-xs font-mono font-bold text-[#24312d]">
                      {app.courseCode}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                      ✓ प्रवेश निश्चित (Confirmed)
                    </span>
                    <span className="text-xs text-[#65706a]">
                      अर्जा क्र.: <strong className="font-mono text-[#24312d]">{app.applicationNo}</strong>
                    </span>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#24312d]">
                    {app.courseTitle}
                  </h4>
                  <p className="text-xs text-[#b5623b] font-medium">{app.school}</p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#65706a]">
                    <span>बॅच: <strong className="text-[#24312d]">{app.batchPreference}</strong></span>
                    <span>भरलेली रक्कम: <strong className="text-[#24312d]">₹{app.amount.toLocaleString("en-IN")}</strong></span>
                    <span>तारीख: {new Date(app.paymentDate).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewReceipt(app)}
                    className="w-full md:w-auto rounded-xl bg-white border border-[#24312d] text-[#24312d] hover:bg-[#24312d] hover:text-white px-4 py-2 text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Printer size={14} />
                    प्रवेश पावती पहा (View Slip)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#d5d9cf] p-8 text-center bg-[#fbfaf7]">
            <BookOpen size={36} className="mx-auto text-[#65706a] mb-2" />
            <h4 className="font-serif text-base font-bold text-[#24312d]">
              अद्याप कोणताही अभ्यासक्रम निवडलेला नाही
            </h4>
            <p className="text-xs text-[#65706a] mt-1 max-w-md mx-auto">
              आपण परिवर्तन मिशन फाउंडेशनच्या कोडिंग, विदेशी भाषा किंवा स्पर्धा परीक्षा कोर्सेससाठी अर्ज करू शकता.
            </p>
            <button
              type="button"
              onClick={onStartNewAdmission}
              className="mt-4 rounded-xl bg-[#b5623b] text-white px-5 py-2.5 text-xs font-bold shadow hover:bg-[#974a27] transition"
            >
              + अभ्यासक्रम निवडा व प्रवेश घ्या
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
