import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, ArrowRight, Home } from "lucide-react";
import { verifyAdminPassword, setAdminAuth } from "@/lib/supabase-admin";
import { StudentPortalIllustration } from "@/components/student/StudentPortalIllustration";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!verifyAdminPassword(password)) {
        setError("Invalid password. Please check credentials and try again.");
        setLoading(false);
        return;
      }

      setAdminAuth();
      navigate("/parivattan-admin/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-app font-sans min-h-screen bg-[#f3f6fc] flex flex-col justify-between selection:bg-[#3b5bfd]/20">
      {/* Top Header */}
      <header className="px-6 sm:px-10 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/img/parivattanE.png"
            alt="Parivattan Mission Foundation"
            className="h-9 sm:h-10 w-auto rounded-lg transition group-hover:scale-105"
          />
          <div className="hidden sm:block text-left">
            <span className="block text-slate-800 font-bold text-sm sm:text-base leading-tight tracking-tight">
              Parivattan Mission Foundation
            </span>
            <span className="block text-[#3b5bfd] text-xs font-semibold">
              Admin & Staff Security Gateway
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
          <Link
            to="/"
            className="hover:text-[#3b5bfd] transition px-3 py-1.5 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Home size={14} />
            <span className="hidden md:inline">Back to Website</span>
          </Link>
          <Link
            to="/student/portal"
            className="hover:text-[#3b5bfd] transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            Student Portal
          </Link>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 w-full">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-slate-100 flex flex-col lg:flex-row overflow-hidden transition-all duration-300">
          {/* Left Panel: White Login Form */}
          <div className="flex-1 p-6 sm:p-9 lg:p-12 flex flex-col justify-between">
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
                    Admin Security Control
                  </span>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#3b5bfd] text-[11px] font-bold uppercase tracking-wider mb-2.5">
                  <Shield size={12} />
                  <span>Authorized Personnel Only</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                  Admin Login
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
                  Enter your administrative password to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Username placeholder for UI fidelity */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    Administrator ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value="admin@parivattan.org (System Director)"
                    className="w-full pb-2 pt-1 border-b border-slate-200 text-base sm:text-sm text-slate-500 font-sans bg-transparent cursor-not-allowed"
                  />
                </div>

                {/* Password Input (Underline Style with Eye Icon) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pb-2 pt-1 pr-8 border-b border-slate-200 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b5bfd] transition font-sans bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full py-3.5 rounded-xl bg-[#3b5bfd] hover:bg-[#2b4be8] text-white font-bold text-sm shadow-md shadow-[#3b5bfd]/25 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Login"}
                </button>
              </form>

              {/* Bottom Switch to Student Portal */}
              <p className="text-xs text-slate-600 text-center mt-7 sm:mt-8 font-sans">
                Looking for the student portal?{" "}
                <Link
                  to="/student/portal"
                  className="text-[#3b5bfd] font-bold hover:underline ml-1"
                >
                  Student Login →
                </Link>
              </p>
            </div>
          </div>

          {/* Right Panel: Solid Vibrant Blue Card */}
          <div className="w-full lg:w-[48%] bg-[#3b5bfd] p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center text-center text-white relative rounded-2xl sm:rounded-[28px] m-3 sm:m-4 overflow-hidden min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Center Illustration */}
            <div className="my-auto w-full flex items-center justify-center py-2 sm:py-4">
              <StudentPortalIllustration className="w-full max-w-[220px] sm:max-w-[270px] lg:max-w-[320px] h-auto drop-shadow-sm select-none" />
            </div>

            {/* Bottom Title & Subtitle */}
            <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5 z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-sans">
                <span className="font-extrabold">Welcome</span>{" "}
                <span className="font-light text-white/95">to Admin Portal</span>
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium">
                Login to access management console
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/50">
        <span>© 2026 Parivattan Mission Foundation. All rights reserved. Secure Administrative Gateway.</span>
      </footer>
    </div>
  );
};

export default AdminLogin;
