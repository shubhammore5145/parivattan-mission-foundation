import React from "react";

export const StudentPortalIllustration: React.FC<{ className?: string }> = ({
  className = "w-full max-w-[340px] h-auto",
}) => {
  return (
    <svg
      viewBox="0 0 420 320"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft Ground Elliptical Shadow */}
      <ellipse
        cx="210"
        cy="275"
        rx="145"
        ry="15"
        fill="#ffffff"
        fillOpacity="0.22"
      />

      {/* Floating Speech Bubble Above Middle Student */}
      <g transform="translate(188, 30)">
        <rect
          x="0"
          y="0"
          width="42"
          height="34"
          rx="10"
          fill="#ffffff"
          className="drop-shadow-sm"
        />
        <path d="M14 34 L20 44 L25 34 Z" fill="#ffffff" />
        {/* Soft dots in speech bubble */}
        <circle cx="14" cy="17" r="2.5" fill="#3b5bfd" />
        <circle cx="21" cy="17" r="2.5" fill="#3b5bfd" />
        <circle cx="28" cy="17" r="2.5" fill="#3b5bfd" />
      </g>

      {/* ==================== LEFT STUDENT (Boy Waving) ==================== */}
      <g id="student-left">
        {/* Head & Hair */}
        <ellipse cx="132" cy="115" rx="14" ry="16" fill="#f6c29b" />
        {/* Hair */}
        <path
          d="M117 115 C117 100, 147 100, 147 115 C147 110, 140 102, 132 102 C124 102, 118 108, 117 115 Z"
          fill="#2d3748"
        />
        <path
          d="M116 112 C119 104, 130 101, 145 106 C143 103, 135 99, 126 100 C120 101, 117 106, 116 112 Z"
          fill="#1a202c"
        />
        {/* Eye & Smile */}
        <circle cx="137" cy="114" r="1.5" fill="#2d3748" />
        <path
          d="M134 122 Q138 126 142 122"
          stroke="#2d3748"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Neck */}
        <rect x="129" y="130" width="7" height="8" fill="#e9b089" rx="2" />

        {/* Dark Green Polo Shirt / Torso */}
        <path
          d="M120 137 L145 137 L147 185 L118 185 Z"
          fill="#334155"
          rx="4"
        />

        {/* Right Arm - Raised in Greeting */}
        <path
          d="M144 140 Q160 120 162 105"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Hand */}
        <ellipse cx="163" cy="101" rx="5" ry="6" fill="#f6c29b" />

        {/* Left Arm - Down along body */}
        <path
          d="M121 142 Q112 160 115 178"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="116" cy="182" rx="4.5" ry="5" fill="#f6c29b" />

        {/* Diagonal Shoulder Bag Strap & Bag */}
        <path
          d="M122 138 L146 182"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="140"
          y="172"
          width="18"
          height="22"
          rx="4"
          fill="#ffffff"
          className="drop-shadow-xs"
        />

        {/* White Trousers / Legs */}
        {/* Left Leg */}
        <path
          d="M122 185 L125 260"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Right Leg */}
        <path
          d="M143 185 L146 258"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Shoes */}
        <ellipse cx="125" cy="265" rx="8" ry="4.5" fill="#1e293b" />
        <ellipse cx="147" cy="263" rx="8" ry="4.5" fill="#1e293b" />
      </g>

      {/* ==================== CENTER STUDENT (Girl Jumping with Joy) ==================== */}
      <g id="student-center">
        {/* Ponytail Hair */}
        <path
          d="M192 110 C185 110, 182 125, 185 132 C188 128, 192 120, 195 118 Z"
          fill="#1e293b"
        />

        {/* Head */}
        <ellipse cx="206" cy="102" rx="13" ry="15" fill="#f6c29b" />
        {/* Front Hair */}
        <path
          d="M194 102 C194 90, 218 90, 218 102 C214 96, 202 94, 194 102 Z"
          fill="#1e293b"
        />
        {/* Face Smile */}
        <circle cx="209" cy="101" r="1.5" fill="#2d3748" />
        <path
          d="M206 108 Q210 113 214 108"
          stroke="#2d3748"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Neck */}
        <rect x="203" y="116" width="6" height="7" fill="#e9b089" rx="2" />

        {/* Torso / Athletic Top */}
        <path
          d="M197 122 L216 122 L218 158 L195 158 Z"
          fill="#1e293b"
          rx="3"
        />

        {/* Books / Notebook in hand */}
        <rect
          x="178"
          y="136"
          width="16"
          height="14"
          rx="2"
          fill="#ffffff"
          transform="rotate(-15 178 136)"
        />

        {/* Left Arm Raised High */}
        <path
          d="M198 126 Q184 106 179 88"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="178" cy="84" rx="4.5" ry="5.5" fill="#f6c29b" />

        {/* Right Arm Raised High */}
        <path
          d="M216 126 Q228 106 233 88"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="234" cy="84" rx="4.5" ry="5.5" fill="#f6c29b" />

        {/* White Messenger Bag on Hip */}
        <path
          d="M202 123 L225 154"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <rect
          x="219"
          y="150"
          width="16"
          height="18"
          rx="3"
          fill="#ffffff"
        />

        {/* Jumping Legs (Dynamic Mid-Air Position) */}
        {/* Left Leg bent back */}
        <path
          d="M200 158 Q190 190 182 215"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M182 215 L174 235"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Shoe */}
        <ellipse cx="171" cy="240" rx="7" ry="4" fill="#1e293b" />

        {/* Right Leg bent in jump */}
        <path
          d="M214 158 Q222 190 220 220"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M220 220 L214 246"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Shoe */}
        <ellipse cx="213" cy="252" rx="7" ry="4" fill="#1e293b" />
      </g>

      {/* ==================== RIGHT STUDENT (Boy Cheering with Notebook) ==================== */}
      <g id="student-right">
        {/* Head */}
        <ellipse cx="288" cy="112" rx="14" ry="16" fill="#f6c29b" />
        {/* Short Dark Hair */}
        <path
          d="M273 112 C273 97, 303 97, 303 112 C299 104, 287 101, 273 112 Z"
          fill="#1e293b"
        />
        {/* Eye & Smile */}
        <circle cx="284" cy="111" r="1.5" fill="#2d3748" />
        <path
          d="M281 118 Q285 122 289 118"
          stroke="#2d3748"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Neck */}
        <rect x="285" y="126" width="7" height="8" fill="#e9b089" rx="2" />

        {/* White Shirt / Torso */}
        <path
          d="M274 134 L302 134 L304 184 L272 184 Z"
          fill="#ffffff"
          rx="4"
        />

        {/* Backpack Straps */}
        <path
          d="M280 134 L278 178"
          stroke="#334155"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M298 134 L300 178"
          stroke="#334155"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Left Arm - Raised in Fist Pump / Celebration */}
        <path
          d="M274 138 Q264 116 268 96"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="269" cy="92" rx="5" ry="5.5" fill="#f6c29b" />

        {/* Right Arm - Holding Folders / Binder */}
        <path
          d="M302 140 Q312 162 308 180"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="308" cy="184" rx="4.5" ry="5" fill="#f6c29b" />

        {/* Binder / Notebook */}
        <rect
          x="300"
          y="166"
          width="16"
          height="22"
          rx="2"
          fill="#64748b"
          transform="rotate(10 300 166)"
        />

        {/* Dark Grey / Charcoal Trousers */}
        {/* Left Leg */}
        <path
          d="M280 184 L276 258"
          stroke="#334155"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Right Leg */}
        <path
          d="M296 184 L294 258"
          stroke="#334155"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Shoes */}
        <ellipse cx="275" cy="263" rx="8" ry="4.5" fill="#0f172a" />
        <ellipse cx="295" cy="263" rx="8" ry="4.5" fill="#0f172a" />
      </g>
    </svg>
  );
};
