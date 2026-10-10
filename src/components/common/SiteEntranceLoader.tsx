import React, { useState, useEffect, useCallback } from "react";

interface SiteEntranceLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const SiteEntranceLoader: React.FC<SiteEntranceLoaderProps> = ({
  onComplete,
  minDurationMs = 600,
}) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const finishLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsDone(true);
        if (onComplete) onComplete();
      }, 250);
    }, 100);
  }, [onComplete]);

  useEffect(() => {
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const linearPct = Math.min(1, elapsed / minDurationMs);
      const easedPct = 1 - Math.pow(1 - linearPct, 2);
      const currentVal = Math.min(100, Math.floor(easedPct * 100));

      setProgress(currentVal);

      if (linearPct >= 1) {
        clearInterval(interval);
        finishLoading();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [minDurationMs, finishLoading]);

  // Press Escape to dismiss instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finishLoading();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finishLoading]);

  if (isDone) return null;

  return (
    <div
      aria-label="Website Loading Entrance"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none bg-white transition-opacity duration-250 ease-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-sm mx-auto">
        {/* Parivattan Logo */}
        <div className="mb-4 flex items-center justify-center">
          <img
            src="/img/parivattanE.png"
            alt="Parivattan Logo"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Foundation Name */}
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#24312d] tracking-tight">
          PARIVATTAN
        </h1>
        <p className="text-xs uppercase tracking-widest font-semibold text-[#b5623b] mt-0.5">
          Mission Foundation
        </p>

        {/* Simple Minimal Progress Line */}
        <div className="w-36 h-1 bg-stone-100 rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-[#b5623b] rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
