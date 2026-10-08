export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: "Leadership" | "Tech & Creative" | "Media & Outreach" | "Language Faculty" | "Administration";
  departmentLabel: string;
  bio: string;
  tags: string[];
  initials: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    avatarBg: string;
  };
  image?: string;
  isFeatured?: boolean;
  order: number;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "kishor-bhagat",
    name: "Kishor Bhagat",
    role: "Founder and CEO",
    department: "Leadership",
    departmentLabel: "Leadership & Executive",
    bio: "Pioneering the mission of Parivattan Foundation to make world-class foreign languages, technology education, and community empowerment accessible to every aspiring student.",
    tags: ["Strategic Vision", "Community Empowerment", "Youth Leadership"],
    initials: "KB",
    colorScheme: {
      badgeBg: "bg-amber-100 border-amber-300",
      badgeText: "text-amber-900",
      avatarBg: "from-amber-600 via-[#b5623b] to-[#24312d]",
    },
    isFeatured: true,
    order: 1,
  },
  {
    id: "dishant-arak",
    name: "Dishant Arak",
    role: "Web Developer",
    department: "Tech & Creative",
    departmentLabel: "Tech & Creative",
    bio: "Driving the digital transformation of Parivattan through scalable web architecture, responsive interfaces, and seamless student-centric digital systems.",
    tags: ["Full Stack Development", "React & Node.js", "System Architecture"],
    initials: "DA",
    colorScheme: {
      badgeBg: "bg-blue-100 border-blue-300",
      badgeText: "text-blue-900",
      avatarBg: "from-blue-600 via-indigo-600 to-slate-800",
    },
    order: 2,
  },
  {
    id: "sumit-sherkhane",
    name: "Sumit Sherkhane",
    role: "Graphic Designer",
    department: "Tech & Creative",
    departmentLabel: "Tech & Creative",
    bio: "Crafting compelling visual communication, brand collateral, and creative media that articulate the foundation's transformative story across communities.",
    tags: ["Brand Identity", "Visual Communication", "Digital Media"],
    initials: "SS",
    colorScheme: {
      badgeBg: "bg-purple-100 border-purple-300",
      badgeText: "text-purple-900",
      avatarBg: "from-purple-600 via-fuchsia-600 to-indigo-800",
    },
    order: 3,
  },
  {
    id: "ritesh-lashkare",
    name: "Ritesh Lashkare",
    role: "Social Media Manager",
    department: "Media & Outreach",
    departmentLabel: "Media & Outreach",
    bio: "Spearheading digital engagement and storytelling campaigns that amplify student achievements and broaden the reach of Parivattan's grassroots movement.",
    tags: ["Digital Campaigns", "Community Growth", "Content Strategy"],
    initials: "RL",
    colorScheme: {
      badgeBg: "bg-rose-100 border-rose-300",
      badgeText: "text-rose-900",
      avatarBg: "from-rose-500 via-pink-600 to-red-700",
    },
    order: 4,
  },
  {
    id: "sumit-bhise",
    name: "Sumit Bhise",
    role: "Social Media Assistant",
    department: "Media & Outreach",
    departmentLabel: "Media & Outreach",
    bio: "Supporting social media outreach, visual campaign scheduling, and real-time interaction with learners, donors, and educational stakeholders.",
    tags: ["Community Engagement", "Social Outreach", "Media Production"],
    initials: "SB",
    colorScheme: {
      badgeBg: "bg-orange-100 border-orange-300",
      badgeText: "text-orange-900",
      avatarBg: "from-orange-500 via-amber-600 to-rose-700",
    },
    order: 5,
  },
  {
    id: "shubham-more",
    name: "Shubham More",
    role: "Web Development Intern",
    department: "Tech & Creative",
    departmentLabel: "Tech & Creative",
    bio: "Contributing to frontend web application development, interactive portals, and performance optimization for Parivattan's digital learning platforms.",
    tags: ["Frontend Engineering", "UI/UX Implementation", "React & Vite"],
    initials: "SM",
    colorScheme: {
      badgeBg: "bg-cyan-100 border-cyan-300",
      badgeText: "text-cyan-900",
      avatarBg: "from-cyan-600 via-teal-600 to-blue-800",
    },
    order: 6,
  },
  {
    id: "kirti-mahale",
    name: "Kirti Mahale",
    role: "Web Development Intern",
    department: "Tech & Creative",
    departmentLabel: "Tech & Creative",
    bio: "Developing responsive web layouts, component libraries, and testing digital student admission and inquiry workflows.",
    tags: ["Web UI Development", "Component Design", "Responsive Layouts"],
    initials: "KM",
    colorScheme: {
      badgeBg: "bg-teal-100 border-teal-300",
      badgeText: "text-teal-900",
      avatarBg: "from-teal-600 via-emerald-600 to-cyan-800",
    },
    order: 7,
  },
  {
    id: "kalpana-sardar",
    name: "Kalpana Sardar",
    role: "Japanese Language Trainer",
    department: "Language Faculty",
    departmentLabel: "Language Faculty",
    bio: "Leading Japanese language training for JLPT N5-N3 preparation, immersive speaking sessions, and Japanese professional culture immersion.",
    tags: ["JLPT N5-N3", "Japanese Culture", "Grammar & Conversation"],
    initials: "KS",
    colorScheme: {
      badgeBg: "bg-emerald-100 border-emerald-300",
      badgeText: "text-emerald-900",
      avatarBg: "from-emerald-600 via-green-600 to-teal-800",
    },
    order: 8,
  },
  {
    id: "pragya-patel",
    name: "Pragya Patel",
    role: "German Language Trainer",
    department: "Language Faculty",
    departmentLabel: "Language Faculty",
    bio: "Delivering German language mastery programs geared toward Goethe-Zertifikat A1-B2 certification and academic/vocational mobility in Germany.",
    tags: ["Goethe A1-B2", "Grammar & Phonetics", "Overseas Guidance"],
    initials: "PP",
    colorScheme: {
      badgeBg: "bg-lime-100 border-lime-300",
      badgeText: "text-lime-900",
      avatarBg: "from-lime-600 via-emerald-600 to-[#24312d]",
    },
    order: 9,
  },
  {
    id: "devidas-kadam",
    name: "Devidas Kadam",
    role: "Admin",
    department: "Administration",
    departmentLabel: "Administration & Operations",
    bio: "Managing institutional operations, campus facilities, student registration records, and foundation administrative logistics.",
    tags: ["Operations Management", "Student Services", "Institutional Admin"],
    initials: "DK",
    colorScheme: {
      badgeBg: "bg-slate-200 border-slate-300",
      badgeText: "text-slate-800",
      avatarBg: "from-slate-700 via-[#24312d] to-zinc-900",
    },
    order: 10,
  },
];
