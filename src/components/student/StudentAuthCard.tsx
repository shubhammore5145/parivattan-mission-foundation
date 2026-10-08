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
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { StudentUser } from "@/types/student";
import {
  loginStudent,
  registerStudent,
  setCurrentStudent,
} from "@/lib/student-auth";

interface StudentAuthCardProps {
  onSuccess: (student: StudentUser) => void;
  initialMode?: "login" | "register";
  prefilledIdentifier?: string;
}

export const StudentAuthCard: React.FC<StudentAuthCardProps> = ({
  onSuccess,
  initialMode = "login",
  prefilledIdentifier = "",
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState<StudentUser | null>(null);
  const [copiedPrn, setCopiedPrn] = useState(false);

  // Login form state
  const [loginId, setLoginId] = useState(prefilledIdentifier || "");
  const [loginPassword, setLoginPassword] = useState("");

  // Sync prefilled identifier from search or URL
  React.useEffect(() => {
    if (prefilledIdentifier) {
      setLoginId(prefilledIdentifier);
      setMode("login");
    }
  }, [prefilledIdentifier]);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("Pune");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleCopyPrn = (prn: string) => {
    navigator.clipboard.writeText(prn);
    setCopiedPrn(true);
    toast.success(`PRN ${prn} copied to clipboard!`);
    setTimeout(() => setCopiedPrn(false), 2500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      toast.error("Please enter your registered Email or PRN Number.");
      return;
    }
    if (!loginPassword.trim()) {
      toast.error("Password is required. Please enter your password to log in.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const student = loginStudent(loginId, loginPassword);
        if (student) {
          toast.success(`Welcome back, ${student.name}! Login successful.`);
          onSuccess(student);
        } else {
          toast.error("Invalid credentials. Please verify your PRN/Email and password.");
        }
      } catch (err) {
        toast.error("Technical error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error("Please enter student's full legal name.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (!regConfirmPassword.trim()) {
      toast.error("Please re-enter your password in Confirm Password.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match. Please verify both passwords.");
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
          password: regPassword,
        });

        setNewlyRegisteredStudent(student);
        toast.success(`Registration successful! Your official PRN is ${student.prn}`);
      } catch (err: any) {
        toast.error(err?.message || "Registration failed. Please try again.");
        if (err?.message && err.message.includes("already exists")) {
          setMode("login");
          setLoginId(regEmail.trim() || regPhone.trim());
        }
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleForgotPassword = () => {
    toast.info(
      "Password reset: Please contact the Admissions Desk at contact@parivattan.org or +91 7820831901 with your PRN.",
      { duration: 5000 }
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Newly Registered PRN Success Banner Modal */}
      {newlyRegisteredStudent && (
        <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-[#1a2522]/95 backdrop-blur-md p-6 shadow-2xl text-center space-y-4 text-white animate-in fade-in duration-300">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={30} />
          </div>

          <div>
            <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 border border-emerald-500/30">
              Registration Successful
            </span>
            <h3 className="mt-2 text-xl font-serif font-bold text-white">
              Welcome, {newlyRegisteredStudent.name}!
            </h3>
            <p className="text-xs text-[#d5ded9] mt-1 max-w-sm mx-auto">
              Your official student profile has been registered and your Permanent Registration Number (PRN) has been issued.
            </p>
          </div>

          {/* PRN Display Box */}
          <div className="rounded-xl bg-white/10 border-2 border-dashed border-amber-400/50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
              Permanent Registration Number (PRN):
            </span>
            <div className="mt-1 flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold text-amber-300 tracking-wider">
                {newlyRegisteredStudent.prn}
              </span>
              <button
                type="button"
                onClick={() => handleCopyPrn(newlyRegisteredStudent.prn)}
                className="rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-bold text-white transition flex items-center gap-1 shadow-sm"
              >
                {copiedPrn ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#cbd5d0] mt-2">
              Save this PRN. You will need it to enroll in courses and access your student dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onSuccess(newlyRegisteredStudent)}
              className="w-full rounded-lg bg-[#b5623b] hover:bg-[#954b2c] text-white py-2.5 text-xs sm:text-sm font-bold shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight size={15} />
            </button>
            <a
              href={`/admissions?prn=${newlyRegisteredStudent.prn}`}
              className="w-full rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2.5 text-xs sm:text-sm font-bold shadow transition flex items-center justify-center gap-2"
            >
              <span>Enroll in a Course (Admissions)</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      )}

      {/* Floating Glassmorphism Login / Registration Card */}
      <div className="rounded-2xl bg-[#24312d]/90 backdrop-blur-md border border-white/15 p-6 sm:p-7 shadow-2xl text-white">
        {/* Top Header & Mode Switcher */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-serif">
              {mode === "login"
                ? "Welcome! Please login to continue."
                : "New Student Registration"}
            </h2>
            <span className="text-[10px] font-mono uppercase bg-[#b5623b]/30 text-amber-300 border border-[#b5623b]/40 px-2 py-0.5 rounded">
              2026-27
            </span>
          </div>

          {/* Mode Pill Toggle */}
          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setNewlyRegisteredStudent(null);
              }}
              className={`flex-1 py-1.5 rounded-md font-semibold transition text-center cursor-pointer ${
                mode === "login"
                  ? "bg-[#b5623b] text-white shadow-sm"
                  : "text-[#cbd5d0] hover:text-white"
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setNewlyRegisteredStudent(null);
              }}
              className={`flex-1 py-1.5 rounded-md font-semibold transition text-center cursor-pointer ${
                mode === "register"
                  ? "bg-[#b5623b] text-white shadow-sm"
                  : "text-[#cbd5d0] hover:text-white"
              }`}
            >
              Register (Get PRN)
            </button>
          </div>
        </div>

        {/* Form Body */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username / Email / PRN Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0] mb-1">
                Email Address or PRN *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. PMF2026-XXXX or email@domain.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full rounded-md bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5623b] transition font-sans"
                />
              </div>
            </div>

            {/* Password Input with Eye Toggle Icon */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0] mb-1">
                Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-md bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5623b] transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 text-slate-600 hover:text-slate-900 transition focus:outline-none"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Parivattan Terracotta Primary Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#b5623b] hover:bg-[#954b2c] text-white font-bold py-2.5 text-sm shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <>Signing in...</>
              ) : (
                <>Login to Portal</>
              )}
            </button>

            {/* Footer Links: Forgot Password & Register */}
            <div className="flex items-center justify-between text-xs pt-1 text-[#cbd5d0]">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="hover:underline hover:text-white transition"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-amber-300 hover:text-amber-200 hover:underline font-semibold transition"
              >
                New Student? Register here →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {/* Student Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0] mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shubham Ramesh More"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5623b] transition font-sans"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="shubhamvmore11@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5623b] transition font-sans"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0] mb-1">
                Mobile Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98XXXXXXXX"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5623b] transition font-sans"
              />
            </div>

            {/* Password (First time) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0] mb-1">
                Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  placeholder="Create password (min 6 characters)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-md bg-white px-3 py-2 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5623b] transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 text-slate-600 hover:text-slate-900 transition focus:outline-none"
                  aria-label={showRegPassword ? "Hide password" : "Show password"}
                >
                  {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Second time) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#cbd5d0]">
                  Confirm Password *
                </label>
                {regConfirmPassword && (
                  <span
                    className={`text-[10px] font-bold ${
                      regPassword === regConfirmPassword
                        ? "text-emerald-400"
                        : "text-rose-300"
                    }`}
                  >
                    {regPassword === regConfirmPassword
                      ? "✓ Passwords Match"
                      : "✗ Passwords Do Not Match"}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showRegConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password to confirm"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className={`w-full rounded-md bg-white px-3 py-2 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition font-sans ${
                    regConfirmPassword && regPassword !== regConfirmPassword
                      ? "ring-2 ring-rose-400"
                      : "focus:ring-[#b5623b]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3 text-slate-600 hover:text-slate-900 transition focus:outline-none"
                  aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#b5623b] hover:bg-[#954b2c] text-white font-bold py-2.5 text-sm shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>Registering & Generating PRN...</>
              ) : (
                <>Register & Generate PRN</>
              )}
            </button>

            <div className="text-center pt-1 text-xs text-[#cbd5d0]">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-amber-300 hover:text-amber-200 hover:underline transition"
              >
                Already registered? Sign in here →
              </button>
            </div>
          </form>
        )}

        {/* Feature Badges Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px] text-[#cbd5d0]">
          <div>
            <span className="block text-amber-400 font-bold">100% Free</span>
            <span>PRN Issued</span>
          </div>
          <div>
            <span className="block text-emerald-400 font-bold">Instant</span>
            <span>Verification</span>
          </div>
          <div>
            <span className="block text-amber-300 font-bold">Digital</span>
            <span>Student ID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
