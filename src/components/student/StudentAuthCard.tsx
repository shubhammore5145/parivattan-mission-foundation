import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Mail,
  MailCheck,
  RefreshCw,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { StudentUser } from "@/types/student";
import {
  loginStudent,
  initiateStudentRegistration,
  verifyEmailAndCompleteRegistration,
  checkFirebaseEmailVerification,
  resendStudentVerificationCode,
  loginWithGoogle,
  loginWithGoogleRedirect,
  sendStudentPasswordReset,
} from "@/lib/student-auth";
import { StudentPortalIllustration } from "./StudentPortalIllustration";

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
  const [mode, setMode] = useState<"login" | "register" | "verify">(initialMode);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState<StudentUser | null>(null);
  const [copiedPrn, setCopiedPrn] = useState(false);

  // Email verification state
  const [pendingEmail, setPendingEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Automatic live listener: Detects the instant the student clicks the link in their email!
  useEffect(() => {
    if (mode !== "verify" || !pendingEmail) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const student = await checkFirebaseEmailVerification(pendingEmail);
        if (student && isSubscribed) {
          clearInterval(interval);
          setNewlyRegisteredStudent(student);
          toast.success(
            `Email link verified successfully! Welcome, ${student.name}. Your official PRN is ${student.prn}`
          );
        }
      } catch (e) {
        // Continue listening
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [mode, pendingEmail]);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!loginId.trim()) {
      toast.error("Please enter your Username, PRN, or Email.");
      return;
    }
    if (!loginPassword.trim()) {
      toast.error("Password is required. Please enter your password to log in.");
      return;
    }

    setLoading(true);
    try {
      const student = await loginStudent(loginId, loginPassword);
      if (student) {
        toast.success(`Welcome back, ${student.name}! Login successful.`);
        onSuccess(student);
      } else {
        toast.error("Invalid credentials. Please verify your Username/PRN/Email and password.");
      }
    } catch (err: any) {
      if (err?.message && err.message.startsWith("EMAIL_NOT_VERIFIED:")) {
        const targetEmail = err.message.split(":")[1];
        setPendingEmail(targetEmail);
        setMode("verify");
        toast.warning(
          "Email verification is mandatory to log in. Please enter the verification code sent to your email."
        );
        return;
      }
      toast.error(err?.message || "Technical error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || submittingRef.current) return;

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

    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await initiateStudentRegistration({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        city: regCity.trim(),
        password: regPassword,
      });

      setPendingEmail(res.email);
      setMode("verify");
      setResendCooldown(30);
      toast.success(
        `Firebase verification link dispatched to ${res.email}. Please open your email and click the link to activate your PRN!`
      );
    } catch (err: any) {
      toast.error(err?.message || "Registration failed. Please try again.");
      if (err?.message && err.message.includes("already exists")) {
        setMode("login");
        setLoginId(regEmail.trim() || regPhone.trim());
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    if (isVerifying) return;

    setIsVerifying(true);
    try {
      const student = await verifyEmailAndCompleteRegistration(pendingEmail, inputCode.trim());
      setNewlyRegisteredStudent(student);
      toast.success(`Email verified successfully! Welcome, ${student.name}. Your official PRN is ${student.prn}`);
    } catch (err: any) {
      toast.error(err?.message || "Verification failed. Please check the code or click the email link.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendStudentVerificationCode(pendingEmail);
      setResendCooldown(30);
      toast.success(`A fresh verification email was dispatched to ${pendingEmail}. Please check your inbox!`);
    } catch (err: any) {
      toast.error(err?.message || "Could not resend verification email.");
    }
  };

  const handleCheckEmailLinkStatus = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const student = await checkFirebaseEmailVerification(pendingEmail);
      if (student) {
        setNewlyRegisteredStudent(student);
        toast.success(`Email link confirmed! Welcome, ${student.name}. Your official PRN is ${student.prn}`);
      } else {
        toast.info(
          "We haven't detected the email verification yet. Please open your email inbox and click the verification link from Parivattan Mission Foundation.",
          { duration: 6000 }
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not verify email status. Please check your inbox.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setPopupBlocked(false);
    try {
      const student = await loginWithGoogle();
      if (student) {
        toast.success(`Welcome, ${student.name}! Signed in with Google.`);
        onSuccess(student);
      }
    } catch (err: any) {
      console.warn("handleGoogleSignIn caught:", err);
      const isPopupBlocked =
        err?.code === "auth/popup-blocked" ||
        (err?.message &&
          (err.message.toLowerCase().includes("popup-blocked") ||
            err.message.includes("Pop-up")));

      if (isPopupBlocked) {
        setPopupBlocked(true);
        toast.error(
          "Your browser blocked the login popup. Please click 'Always allow pop-ups' or use redirect sign-in.",
          { duration: 8000 }
        );
      } else {
        const msg = err?.message || "Google sign-in could not be completed.";
        toast.error(msg, { duration: 6000 });
        if (msg.includes("Firebase Console")) {
          const inputMail = window.prompt(
            "Google provider is pending activation in your Firebase Console.\nEnter your email address to quickly continue as student:"
          );
          if (inputMail && inputMail.includes("@")) {
            setLoginId(inputMail.trim());
            setRegEmail(inputMail.trim());
            toast.info("Email prefilled! Enter your password to complete login or registration.");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectRedirectSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      toast.error(err?.message || "Could not redirect to Google Sign-In.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const candidateEmail = loginId.includes("@") ? loginId.trim() : "";
    if (candidateEmail) {
      try {
        await sendStudentPasswordReset(candidateEmail);
        toast.success(`Password reset link sent to ${candidateEmail}. Please check your inbox!`);
        return;
      } catch (e: any) {
        toast.error(e?.message || "Could not send reset email.");
        return;
      }
    }
    const inputEmail = window.prompt("Enter your registered email address for password reset:");
    if (inputEmail && inputEmail.includes("@")) {
      try {
        await sendStudentPasswordReset(inputEmail.trim());
        toast.success(`Password reset link sent to ${inputEmail}. Please check your inbox!`);
      } catch (e: any) {
        toast.error(e?.message || "Could not send reset email.");
      }
    } else if (inputEmail) {
      toast.error("Please enter a valid email address.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-slate-100 flex flex-col lg:flex-row overflow-hidden transition-all duration-300">
      {/* ==================== LEFT PANEL: WHITE AUTH FORM ==================== */}
      <div className="flex-1 p-6 sm:p-9 lg:p-12 flex flex-col justify-between">
        {newlyRegisteredStudent ? (
          /* Newly Registered Success Card */
          <div className="my-auto space-y-5 text-center animate-in fade-in duration-300 py-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider px-3 py-1">
                Account Created Successfully
              </span>
              <h3 className="mt-2 text-2xl font-bold text-slate-800 font-sans">
                Welcome, {newlyRegisteredStudent.name}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your student profile has been registered in Parivattan Mission Foundation.
              </p>
            </div>

            {/* PRN Display Box */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                Permanent Registration Number (PRN)
              </span>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-700 tracking-wider">
                  {newlyRegisteredStudent.prn}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPrn(newlyRegisteredStudent.prn)}
                  className="p-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
                  title="Copy PRN"
                >
                  {copiedPrn ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSuccess(newlyRegisteredStudent);
              }}
              className="w-full py-3.5 rounded-xl bg-[#3b5bfd] hover:bg-[#2e4be8] text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Student Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : mode === "verify" ? (
          /* ==================== EMAIL VERIFICATION VIEW ==================== */
          <div className="my-auto py-1 animate-in fade-in duration-300">
            {/* Parivattan Mission Foundation Brand Logo & Identity */}
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/img/parivattanE.png"
                alt="Parivattan Mission Foundation Logo"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl p-1 bg-white border border-slate-200/90 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold text-sm sm:text-base leading-tight tracking-tight truncate">
                  Parivattan Mission Foundation
                </span>
                <span className="block text-[#3b5bfd] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-0.5">
                  Email Verification Required
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#3b5bfd] text-[11px] font-semibold mb-2">
                <ShieldCheck size={13} />
                <span>Step 2 of 2: Security Verification</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                Verify Your Email
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                An official verification email from Firebase has been dispatched to your email address.
              </p>
            </div>

            {/* Target Email Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#3b5bfd] flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-slate-400">Verification email sent to</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {pendingEmail}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-xs text-[#3b5bfd] hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Live Auto-Detection Radar Box */}
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#3b5bfd] animate-ping opacity-75" />
                  <div className="w-3 h-3 rounded-full bg-[#3b5bfd] absolute inset-0" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    Listening for Email Link Click...
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Open your Gmail or email inbox and click the verification link. This screen will automatically detect it and open your student dashboard!
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button: "I clicked verification link in email" */}
            <button
              id="btn-check-email-link"
              type="button"
              onClick={handleCheckEmailLinkStatus}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-[#3b5bfd] hover:bg-[#2e4be8] text-white font-bold text-sm shadow-md shadow-[#3b5bfd]/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Checking Email Status...</span>
                </>
              ) : (
                <>
                  <MailCheck size={18} />
                  <span>I Clicked the Link in My Email</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Resend Link and Manual Code Toggle */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-[#3b5bfd] hover:underline font-semibold cursor-pointer disabled:text-slate-400 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend verification email"}
              </button>

              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className="text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
              >
                {showCodeInput ? "Hide 6-digit code entry" : "Have a 6-digit code?"}
              </button>
            </div>

            {/* Optional Collapsible Code Input (NO ON-SCREEN CODE DISPLAYED) */}
            {showCodeInput && (
              <form onSubmit={handleVerifyCodeSubmit} className="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-3 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Enter 6-Digit Code from Email
                </label>
                <div className="relative">
                  <input
                    id="input-verification-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 text-center font-mono text-xl font-bold tracking-[0.35em] text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#3b5bfd] focus:bg-white bg-slate-50 transition"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <KeyRound size={18} />
                  </div>
                </div>
                <button
                  id="btn-verify-code-submit"
                  type="submit"
                  disabled={isVerifying || inputCode.length < 6}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Activate</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        ) : mode === "login" ? (
          /* ==================== LOGIN VIEW ==================== */
          <div className="my-auto py-1">
            {/* Parivattan Mission Foundation Brand Logo & Identity */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/img/parivattanE.png"
                alt="Parivattan Mission Foundation Logo"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl p-1 bg-white border border-slate-200/90 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold text-sm sm:text-base leading-tight tracking-tight truncate">
                  Parivattan Mission Foundation
                </span>
                <span className="block text-[#3b5bfd] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-0.5">
                  Student Portal Login
                </span>
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                Enter your account details
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5 sm:space-y-6">
              {/* Username Input (Underline Style matching image) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Username, PRN or Email"
                  className="w-full pb-2 pt-1 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                />
              </div>

              {/* Password Input (Underline Style with Eye Icon) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pb-2 pt-1 pr-8 border-b border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer focus:outline-none"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-start pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-slate-500 hover:text-[#3b5bfd] underline-offset-4 hover:underline transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Vibrant Blue Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#3b5bfd] hover:bg-[#2b4be8] text-white font-bold text-sm shadow-md shadow-[#3b5bfd]/25 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* Optional Google Login */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {popupBlocked && (
                <button
                  type="button"
                  onClick={handleDirectRedirectSignIn}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-50 text-[#3b5bfd] hover:bg-blue-100 text-xs font-semibold transition"
                >
                  Direct Redirect Google Login →
                </button>
              )}
            </div>

            {/* Bottom Switch to SignUp */}
            <p className="text-xs text-slate-600 text-center mt-8 font-sans">
              Don't have an account?{" "}
              <button
                id="btn-switch-to-register"
                type="button"
                onClick={() => {
                  setMode("register");
                  setNewlyRegisteredStudent(null);
                }}
                className="text-[#3b5bfd] font-bold hover:underline cursor-pointer ml-1"
              >
                SignUp
              </button>
            </p>
          </div>
        ) : (
          /* ==================== SIGNUP VIEW ==================== */
          <div className="my-auto py-1">
            {/* Parivattan Mission Foundation Brand Logo & Identity */}
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/img/parivattanE.png"
                alt="Parivattan Mission Foundation Logo"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl p-1 bg-white border border-slate-200/90 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold text-sm sm:text-base leading-tight tracking-tight truncate">
                  Parivattan Mission Foundation
                </span>
                <span className="block text-[#3b5bfd] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-0.5">
                  Student PRN Registration
                </span>
              </div>
            </div>

            <div className="mb-5 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                Sign Up
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                Create your student PRN account
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Full Legal Name *
                </label>
                <input
                  id="input-reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pb-1.5 pt-0.5 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Email Address *
                </label>
                <input
                  id="input-reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pb-1.5 pt-0.5 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                />
              </div>

              {/* Mobile Phone & City in responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    Mobile Number *
                  </label>
                  <input
                    id="input-reg-phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pb-1.5 pt-0.5 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    City / Location
                  </label>
                  <input
                    id="input-reg-city"
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Pune"
                    className="w-full pb-1.5 pt-0.5 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                  />
                </div>
              </div>

              {/* Password & Confirm Password in responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="input-reg-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pb-1.5 pt-0.5 pr-7 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-0 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="input-reg-confirm-password"
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pb-1.5 pt-0.5 pr-7 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-0 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-register-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 rounded-xl bg-[#3b5bfd] hover:bg-[#2b4be8] text-white font-bold text-sm shadow-md shadow-[#3b5bfd]/25 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account & Generate PRN"}
              </button>
            </form>

            {/* Bottom Switch to Login */}
            <p className="text-xs text-slate-600 text-center mt-5 sm:mt-6 font-sans">
              Already have an account?{" "}
              <button
                id="btn-switch-to-login"
                type="button"
                onClick={() => {
                  setMode("login");
                  setNewlyRegisteredStudent(null);
                }}
                className="text-[#3b5bfd] font-bold hover:underline cursor-pointer ml-1"
              >
                Login
              </button>
            </p>
          </div>
        )}
      </div>

      {/* ==================== RIGHT PANEL: SOLID VIBRANT BLUE CARD ==================== */}
      <div className="w-full lg:w-[48%] bg-[#3b5bfd] p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center text-center text-white relative rounded-2xl sm:rounded-[28px] m-3 sm:m-4 overflow-hidden min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
        {/* Top subtle decorative highlight */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Center Students Celebration Illustration */}
        <div className="my-auto w-full flex items-center justify-center py-2 sm:py-4">
          <StudentPortalIllustration className="w-full max-w-[220px] sm:max-w-[270px] lg:max-w-[320px] h-auto drop-shadow-sm select-none" />
        </div>

        {/* Bottom Title & Subtitle Matching User Mockup */}
        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5 z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-sans">
            <span className="font-extrabold">Welcome</span>{" "}
            <span className="font-light text-white/95">to Student Portal</span>
          </h2>
          <p className="text-white/80 text-xs sm:text-sm font-medium">
            {mode === "verify"
              ? "Verify your email to activate PRN"
              : mode === "login"
              ? "Login to access your account"
              : "Register to access your student account"}
          </p>
        </div>
      </div>
    </div>
  );
};
