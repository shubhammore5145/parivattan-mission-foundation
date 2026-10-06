import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  KeyRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { StudentUser } from "@/types/student";
import {
  loginStudent,
  registerStudent,
  getDemoStudent,
  setCurrentStudent,
} from "@/lib/student-auth";

interface StudentAuthCardProps {
  onSuccess: (student: StudentUser) => void;
}

export const StudentAuthCard: React.FC<StudentAuthCardProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("Pune");
  const [regPassword, setRegPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      toast.error("कृपया आपला ई-मेल, मोबाईल किंवा PRN नंबर प्रविष्ट करा.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const student = loginStudent(loginId, loginPassword);
        if (student) {
          toast.success(`स्वागत आहे, ${student.name}! लॉगिन यशस्वी.`);
          onSuccess(student);
        } else {
          toast.error("लॉगिन अयशस्वी. कृपया माहिती तपासा.");
        }
      } catch (err) {
        toast.error("तांत्रिक त्रुटी. कृपया पुन्हा प्रयत्न करा.");
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error("कृपया विद्यार्थ्याचे पूर्ण नाव प्रविष्ट करा.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      toast.error("कृपया वैध ई-मेल पत्ता प्रविष्ट करा.");
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, "").length < 10) {
      toast.error("कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const student = registerStudent({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          city: regCity.trim(),
          password: regPassword || "student123",
        });

        toast.success(`नोंदणी यशस्वी! आपला PRN: ${student.prn}`);
        onSuccess(student);
      } catch (err) {
        toast.error("नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleQuickDemoLogin = () => {
    const demo = getDemoStudent();
    setCurrentStudent(demo);
    toast.success(`डेमो विद्यार्थी लॉगिन: ${demo.name} (PRN: ${demo.prn})`);
    onSuccess(demo);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-t-3xl bg-gradient-to-r from-[#24312d] via-[#2f423d] to-[#1c2724] p-6 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#b5623b]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#e5a37f] border border-white/10">
          <GraduationCap size={15} />
          Academic Year 2026-27 · CAP Admission Portal
        </div>
        <h2 className="mt-3 text-2xl font-serif font-bold text-white sm:text-3xl">
          विद्यार्थी प्रवेश पोर्टल (Student Portal)
        </h2>
        <p className="mt-1.5 text-xs text-white/80 sm:text-sm">
          Parivattan Mission Foundation · केंद्रीयकृत प्रवेश व अभ्यासक्रम नोंदणी
        </p>

        {/* Tab switchers */}
        <div className="mt-6 flex rounded-xl bg-white/10 p-1 backdrop-blur-sm border border-white/10">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition ${
              mode === "login"
                ? "bg-[#b5623b] text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            लॉगिन करा (Sign In)
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition ${
              mode === "register"
                ? "bg-[#b5623b] text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            नवीन नोंदणी (Register)
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="rounded-b-3xl border-x border-b border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-xl">
        {/* Quick Demo Login Option */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-[#24312d]">त्वरित चाचणी लॉगिन (Quick Demo)</p>
              <p className="text-[11px] text-[#65706a]">फॉर्म न भरता थेट 1-क्लिक मध्ये विद्यार्थी म्हणून लॉगिन करा</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="shrink-0 rounded-xl bg-[#24312d] hover:bg-[#b5623b] px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1 shadow-sm"
          >
            <Zap size={13} className="text-amber-400" />
            डेमो लॉगिन
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1.5">
                ई-मेल / मोबाईल नंबर / PRN नंबर *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="उदा. student@parivattan.org किंवा 98220XXXXX"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] placeholder:text-gray-400 focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1.5">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="आपला पासवर्ड प्रविष्ट करा (डिफॉल्ट: student123)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] placeholder:text-gray-400 focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-[#65706a]">
                <span>पहिल्यांदा लॉगिन करत असाल तर कोणताही पासवर्ड चालेल.</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#b5623b] py-3 text-sm font-bold text-white shadow-md hover:bg-[#994d29] focus:outline-none focus:ring-2 focus:ring-[#b5623b]/40 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>लॉगिन होत आहे...</>
              ) : (
                <>
                  लॉगिन करा आणि प्रवेश सुरू करा
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                विद्यार्थ्याचे पूर्ण नाव (Full Name as per SSC Marksheet) *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="उदा. Shubham Ramesh More"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  ई-मेल पत्ता (Email) *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  मोबाईल नंबर (WhatsApp/Calling) *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  गाव / शहर व जिल्हा (City/District)
                </label>
                <input
                  type="text"
                  placeholder="उदा. Pune / Satara"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  पासवर्ड सेट करा (Password)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#65706a]">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    placeholder="किमान ६ अक्षरी पासवर्ड"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#f7f8f4] p-3 text-[11px] text-[#65706a] flex items-start gap-2 border border-[#e2e5dc]">
              <ShieldCheck size={16} className="text-[#b5623b] shrink-0 mt-0.5" />
              <span>
                नोंदणीनंतर आपणास अधिकृत विद्यार्थी PRN क्रमांक दिला जाईल, ज्याद्वारे आपण अभ्यासक्रम निवड, फॉर्म भरणी व शुल्क भरणा करू शकाल.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#24312d] py-3 text-sm font-bold text-white shadow-md hover:bg-[#b5623b] focus:outline-none focus:ring-2 focus:ring-[#24312d]/40 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>नोंदणी होत आहे...</>
              ) : (
                <>
                  खाते तयार करा व पुढे जा
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Feature Badges Footer */}
        <div className="mt-6 pt-5 border-t border-[#e2e5dc] grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-[#65706a]">
          <div className="flex flex-col items-center">
            <CheckCircle2 size={16} className="text-[#b5623b] mb-1" />
            <span>मेरिट व स्कॉलरशिप संलग्न</span>
          </div>
          <div className="flex flex-col items-center">
            <Building2 size={16} className="text-[#b5623b] mb-1" />
            <span>प्रमाणित युनिव्हर्सिटी सिलॅबस</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck size={16} className="text-[#b5623b] mb-1" />
            <span>अधिकृत प्रवेश पावती व PRN</span>
          </div>
        </div>
      </div>
    </div>
  );
};
