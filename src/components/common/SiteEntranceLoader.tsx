import React, { useState, useEffect } from "react";

interface SiteEntranceLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const SiteEntranceLoader: React.FC<SiteEntranceLoaderProps> = ({
  onComplete,
  minDurationMs = 1400,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }, 600);
        }, 150);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#15201d] transition-all duration-700 ease-out select-none pointer-events-auto ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 40%, rgba(181, 98, 59, 0.22) 0%, rgba(36, 49, 45, 0.8) 55%, #121b19 100%)",
      }}
    >
      {/* Ambient Animated Glow Rings */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#b5623b]/20 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-60 h-60 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Glowing Logo Badge with Orbit Ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#b5623b] to-amber-300 blur-md opacity-70 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-2xl backdrop-blur-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#1e2a26] border border-amber-500/30 flex items-center justify-center overflow-hidden p-2">
              <img
                src="/img/parivattanE.png"
                alt="Parivattan Logo"
                className="w-full h-full object-contain filter drop-shadow-lg transform transition-transform duration-1000 scale-105 hover:scale-110"
              />
            </div>
          </div>
          {/* Subtle Spinning Particle Ring */}
          <div
            className="absolute -inset-2 rounded-full border border-dashed border-amber-400/40 animate-spin"
            style={{ animationDuration: "10s" }}
          />
        </div>

        {/* Foundation Name */}
        <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-md">
          Parivattan Mission Foundation
        </h1>

        {/* Marathi & English Tagline */}
        <p className="mt-2 text-xs sm:text-sm text-[#cbd5d0] font-medium tracking-wide">
          शिक्षणातून समृद्धी • Global Languages &amp; Practical Education
        </p>

        {/* Progress Bar Container */}
        <div className="w-56 sm:w-64 mt-7 space-y-2">
          <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#b5623b] via-amber-400 to-[#d87a4c] rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Numerical Percentage Counter */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#cbd5d0]/80 px-0.5">
            <span className="text-[10px] tracking-widest uppercase text-amber-300/90 font-sans">
              {progress < 70 ? "Initiating Pathways..." : "Welcome..."}
            </span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>
        </div>

        {/* Security & Accreditation Micro-pill */}
        <div className="mt-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#a4b5ad]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Section 8 Non-Profit • Maharashtra, India</span>
        </div>
      </div>
    </div>
  );
};
