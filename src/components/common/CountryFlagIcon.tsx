import React from "react";

export function JapanFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#ffffff" stroke="#e2e5dc" strokeWidth="8" />
      <circle cx="450" cy="300" r="180" fill="#bc002d" />
    </svg>
  );
}

export function GermanyFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 5 3" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="5" height="1" y="0" fill="#111111" />
      <rect width="5" height="1" y="1" fill="#dd0000" />
      <rect width="5" height="1" y="2" fill="#ffce00" />
    </svg>
  );
}

export function UKFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg">
      <clipPath id="uk-flag-clip-admissions-common">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-admissions-common)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L30,15 M60,30 L30,15 M60,0 L30,15 M0,30 L30,15" stroke="#c8102e" strokeWidth="2" />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function FranceFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" x="0" fill="#002654" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#ce1126" />
    </svg>
  );
}

interface CountryFlagIconProps {
  courseId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CountryFlagIcon: React.FC<CountryFlagIconProps> = ({
  courseId = "",
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-3 rounded-xs",
    md: "w-6 h-4 rounded-xs shadow-2xs",
    lg: "w-8 h-5 rounded-xs shadow-xs",
  };

  const finalClass = `${sizeClasses[size]} shrink-0 object-cover border border-stone-200/80 inline-block overflow-hidden ${className}`.trim();

  const id = (courseId || "").toLowerCase();

  if (id.includes("japanese") || id === "jp") {
    return (
      <span className={finalClass}>
        <JapanFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("german") || id === "de") {
    return (
      <span className={finalClass}>
        <GermanyFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("english") || id === "gb" || id === "uk") {
    return (
      <span className={finalClass}>
        <UKFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("french") || id === "fr") {
    return (
      <span className={finalClass}>
        <FranceFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("test")) {
    return <span className="text-base select-none shrink-0">🧪</span>;
  }

  return <span className="text-base select-none shrink-0">🌐</span>;
};
