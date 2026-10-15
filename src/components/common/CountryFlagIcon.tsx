import React from "react";

export function JapanFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#ffffff" stroke="#e2e5dc" strokeWidth="6" />
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

export function RussiaFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 9 6" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="9" height="2" y="0" fill="#ffffff" stroke="#e2e5dc" strokeWidth="0.1" />
      <rect width="9" height="2" y="2" fill="#0039a6" />
      <rect width="9" height="2" y="4" fill="#d52b1e" />
    </svg>
  );
}

export function ChinaFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#de2910" />
      {/* Big star */}
      <polygon points="150,50 179,141 275,141 197,197 227,288 150,232 73,288 103,197 25,141 121,141" fill="#ffde00" />
      {/* 4 small stars */}
      <polygon points="300,50 307,73 331,73 311,87 319,110 300,95 281,110 289,87 269,73 293,73" fill="#ffde00" transform="rotate(-30 300 80)" />
      <polygon points="360,100 367,123 391,123 371,137 379,160 360,145 341,160 349,137 329,123 353,123" fill="#ffde00" transform="rotate(-10 360 130)" />
      <polygon points="360,200 367,223 391,223 371,237 379,260 360,245 341,260 349,237 329,223 353,223" fill="#ffde00" transform="rotate(15 360 230)" />
      <polygon points="300,250 307,273 331,273 311,287 319,310 300,295 281,310 289,287 269,273 293,273" fill="#ffde00" transform="rotate(35 300 280)" />
    </svg>
  );
}

export function SpainFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 750 500" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="750" height="125" y="0" fill="#aa151b" />
      <rect width="750" height="250" y="125" fill="#f1bf00" />
      <rect width="750" height="125" y="375" fill="#aa151b" />
    </svg>
  );
}

export function KoreaFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#ffffff" stroke="#e2e5dc" strokeWidth="6" />
      <circle cx="450" cy="300" r="150" fill="#c60c30" />
      <path d="M 450,450 A 75,75 0 0,0 450,300 A 75,75 0 0,1 450,150 A 150,150 0 0,0 450,450 Z" fill="#003478" />
    </svg>
  );
}

export function ItalyFlagSvg({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" x="0" fill="#009246" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#ce2b37" />
    </svg>
  );
}

interface CountryFlagIconProps {
  courseId?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "fill";
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
    xl: "w-12 h-8 rounded-md shadow-xs",
    fill: "w-full h-full",
  };

  const finalClass = `${sizeClasses[size]} shrink-0 object-cover border border-stone-200/80 inline-block overflow-hidden ${className}`.trim();

  const id = (courseId || "").toLowerCase();

  if (id.includes("japanese") || id.includes("japan") || id === "jp" || id.includes("jlpt") || id.includes("pfls-ja")) {
    return (
      <span className={finalClass}>
        <JapanFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("german") || id.includes("deutsch") || id === "de" || id.includes("pfls-de")) {
    return (
      <span className={finalClass}>
        <GermanyFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("english") || id === "gb" || id === "uk" || id.includes("pfls-en")) {
    return (
      <span className={finalClass}>
        <UKFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("french") || id.includes("français") || id === "fr" || id.includes("pfls-fr")) {
    return (
      <span className={finalClass}>
        <FranceFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("russian") || id.includes("russia") || id === "ru") {
    return (
      <span className={finalClass}>
        <RussiaFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("chinese") || id.includes("china") || id.includes("mandarin") || id === "cn" || id === "zh") {
    return (
      <span className={finalClass}>
        <ChinaFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("spanish") || id.includes("spain") || id === "es") {
    return (
      <span className={finalClass}>
        <SpainFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("korean") || id.includes("korea") || id === "ko" || id === "kr") {
    return (
      <span className={finalClass}>
        <KoreaFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("italian") || id.includes("italy") || id === "it") {
    return (
      <span className={finalClass}>
        <ItalyFlagSvg className="w-full h-full" />
      </span>
    );
  }

  if (id.includes("test")) {
    return <span className="text-2xl select-none shrink-0">🧪</span>;
  }

  return <span className="text-2xl select-none shrink-0">🌐</span>;
};
