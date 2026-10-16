import React, { useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  Youtube,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Video,
  Award,
  Users,
  Eye,
  Clock
} from "lucide-react";

export interface YouTubeShortItem {
  id: string;
  badge: string;
  category: "Spoken Practice" | "Live Classroom" | "Global Careers" | "Student Stories";
  title: string;
  marathiTitle: string;
  description: string;
  duration: string;
  views: string;
  tags: string[];
  url: string;
}

export const YOUTUBE_SHORTS: YouTubeShortItem[] = [
  {
    id: "_EEthfJ3nqM",
    badge: "Session 01",
    category: "Live Classroom",
    title: "Classroom Energy & Language Fundamentals",
    marathiTitle: "प्रत्यक्ष वर्गखोलीतील ऊर्जा व मूलभूत भाषा शिक्षण",
    description: "Real glimpses from our classroom sessions showing students enthusiastically learning language phonetics, script basics, and spoken confidence.",
    duration: "0:45",
    views: "2.4K+ Views",
    tags: ["Foundation", "Classroom Energy", "Interactive"],
    url: "https://youtube.com/shorts/_EEthfJ3nqM",
  },
  {
    id: "aoG4lvsm5Lw",
    badge: "Session 02",
    category: "Spoken Practice",
    title: "Foreign Language Speaking & Confidence Drills",
    marathiTitle: "विदेशी भाषा संभाषण व विद्यार्थ्यांचा वाढता आत्मविश्वास",
    description: "Students building real-time spoken fluency through interactive dialogue, partner practice, vocabulary games, and everyday situation drills.",
    duration: "0:52",
    views: "3.1K+ Views",
    tags: ["Spoken Fluency", "German & Japanese", "Confidence"],
    url: "https://youtube.com/shorts/aoG4lvsm5Lw",
  },
  {
    id: "2qEHNtsCrR4",
    badge: "Session 03",
    category: "Live Classroom",
    title: "Interactive Workshop & Peer Practice Circles",
    marathiTitle: "इंटरअॅक्टिव्ह कार्यशाळा व समूह अभ्यास पद्धती",
    description: "Dynamic classroom engagement where first-generation learners practice together in an empowering, supportive community circle without hesitation.",
    duration: "0:48",
    views: "1.9K+ Views",
    tags: ["Peer Learning", "Group Drills", "Youth Circle"],
    url: "https://youtube.com/shorts/2qEHNtsCrR4",
  },
  {
    id: "L5l16Lq6sYY",
    badge: "Session 04",
    category: "Global Careers",
    title: "Global Careers, JLPT & Overseas Guidance",
    marathiTitle: "आंतरराष्ट्रीय करिअर संधी, JLPT व उच्च शिक्षण मार्गदर्शन",
    description: "Comprehensive guidance on international scholarships, JLPT (Japanese) & Goethe (German) certifications, and verified career pathways abroad.",
    duration: "0:59",
    views: "4.2K+ Views",
    tags: ["JLPT / Goethe", "Global Careers", "Scholarships"],
    url: "https://youtube.com/shorts/L5l16Lq6sYY",
  },
  {
    id: "G6pjOW4Njnk",
    badge: "Session 05",
    category: "Student Stories",
    title: "Parivattan Movement & Transformative Journeys",
    marathiTitle: "परिवर्तन चळवळ — विद्यार्थ्यांचे प्रेरणादायी अनुभव",
    description: "Inspiring journey of dedicated students from rural and semi-urban Maharashtra transforming their life prospects through affordable world-class education.",
    duration: "0:50",
    views: "3.8K+ Views",
    tags: ["Grassroots Impact", "Inspiration", "Maharashtra"],
    url: "https://youtube.com/shorts/G6pjOW4Njnk",
  },
];

const CATEGORIES = [
  "All Moments",
  "Spoken Practice",
  "Live Classroom",
  "Global Careers",
  "Student Stories",
] as const;

interface ClassroomVideosProps {
  idPrefix?: string;
  className?: string;
}

export default function ClassroomVideos({ idPrefix = "home", className = "" }: ClassroomVideosProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Moments");

  // Cinema Lightbox Modal
  const [modalVideo, setModalVideo] = useState<YouTubeShortItem | null>(null);

  // Filtered shorts
  const filteredShorts = selectedCategory === "All Moments"
    ? YOUTUBE_SHORTS
    : YOUTUBE_SHORTS.filter((item) => item.category === selectedCategory);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalVideo) return;
      if (e.key === "Escape") setModalVideo(null);
      if (e.key === "ArrowRight") handleNextModal();
      if (e.key === "ArrowLeft") handlePrevModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalVideo]);

  const handleNextModal = () => {
    if (!modalVideo) return;
    const currentIndex = YOUTUBE_SHORTS.findIndex((v) => v.id === modalVideo.id);
    const nextIndex = (currentIndex + 1) % YOUTUBE_SHORTS.length;
    setModalVideo(YOUTUBE_SHORTS[nextIndex]);
  };

  const handlePrevModal = () => {
    if (!modalVideo) return;
    const currentIndex = YOUTUBE_SHORTS.findIndex((v) => v.id === modalVideo.id);
    const prevIndex = (currentIndex - 1 + YOUTUBE_SHORTS.length) % YOUTUBE_SHORTS.length;
    setModalVideo(YOUTUBE_SHORTS[prevIndex]);
  };

  return (
    <section
      id={`${idPrefix}-classroom-videos`}
      className={`py-20 md:py-28 bg-[#182622] text-white relative overflow-hidden ${className}`}
    >
      {/* Ambient Lighting & Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#b5623b]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* ================= 1. SECTION HEADER ================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Youtube className="w-4 h-4 text-red-400" />
            <span className="font-extrabold tracking-wider">Live Classroom Moments · YouTube Shorts</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Watch Our Students In Action
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-amber-200/90">
            परिवर्तन मिशन फाउंडेशन — प्रत्यक्ष वर्गखोलीतील क्षण व विद्यार्थ्यांचे अनुभव
          </p>

          <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed font-light max-w-2xl">
            Real classroom energy, student spoken confidence, foreign language immersion drills, and
            empowering journeys recorded live at our Chhatrapati Sambhajinagar learning circles.
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-stone-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Practical Spoken Drills</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>JLPT & Goethe Oriented</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>First-Gen Rural Youth Confidence</span>
            </span>
          </div>
        </div>

        {/* ================= 2. CATEGORY FILTER TABS ================= */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#b5623b] text-white shadow-md shadow-[#b5623b]/25 ring-1 ring-white/20 scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10"
                }`}
              >
                <span>{cat}</span>
                {cat === "All Moments" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-black/30 text-stone-200">
                    {YOUTUBE_SHORTS.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= 3. MAIN CENTERPIECE: 5 VERTICAL REEL CARDS IN A LINE ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 items-stretch">
          {filteredShorts.map((short) => (
            <div
              key={short.id}
              onClick={() => setModalVideo(short)}
              className="group relative rounded-3xl overflow-hidden bg-black/60 border border-white/15 hover:border-red-500/60 shadow-xl hover:shadow-2xl hover:shadow-red-950/40 cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between aspect-[9/16] ring-1 ring-white/10 hover:ring-red-500/40"
            >
              {/* Background Thumbnail Image */}
              <img
                src={`https://img.youtube.com/vi/${short.id}/hqdefault.jpg`}
                alt={short.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-95"
              />

              {/* Dark Gradients Top and Bottom for readable text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/75 pointer-events-none" />

              {/* TOP HEADER OVERLAY */}
              <div className="relative z-10 p-3.5 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-stone-200 border border-white/20 shadow-xs">
                  {short.badge}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-[11px] font-extrabold text-white flex items-center gap-1 shadow-sm">
                  <Youtube className="w-3 h-3" />
                  <span>Short</span>
                </span>
              </div>

              {/* CENTER FLOATING PLAY BUTTON */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="w-14 h-14 rounded-full bg-red-600/90 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-115 ring-4 ring-white/30 group-hover:ring-red-600/50">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
                <span className="mt-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity border border-white/15">
                  Tap to Watch
                </span>
              </div>

              {/* BOTTOM INFO OVERLAY */}
              <div className="relative z-10 p-4 text-left space-y-1.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-6">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  {short.category}
                </span>

                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-200 transition-colors">
                  {short.title}
                </h4>

                <p className="text-[11px] text-amber-200/90 font-medium truncate">
                  {short.marathiTitle}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-stone-300">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-stone-400" />
                    <span>{short.views}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{short.duration}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 4. OFFICIAL YOUTUBE CHANNEL CTA BANNER ================= */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-red-950/60 via-[#24312d] to-[#1a2522] border border-white/15 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg ring-4 ring-red-600/20">
              <Youtube className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-300">
                Official YouTube Channel
              </span>
              <h4 className="text-lg sm:text-xl font-bold font-serif text-white">
                Subscribe to Parivattan Mission Foundation
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-0.5">
                Watch daily foreign language pronunciation tips, live classroom sessions, JLPT guidance,
                and motivational journeys directly on YouTube.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Youtube className="w-4 h-4" />
              <span>Subscribe on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* ================= 5. CINEMA LIGHTBOX THEATER MODAL ================= */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setModalVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#14201b] rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalVideo(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer border border-white/20 shadow-lg"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: 9:16 Video Player Container */}
            <div className="md:w-1/2 bg-black flex items-center justify-center relative min-h-[380px] md:min-h-[560px]">
              <iframe
                key={modalVideo.id}
                src={`https://www.youtube-nocookie.com/embed/${modalVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                title={modalVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full aspect-[9/16] max-h-[560px] border-0"
              />

              {/* Prev / Next Video Float Arrows */}
              <button
                onClick={handlePrevModal}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer border border-white/20 shadow-lg"
                title="Previous Short"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextModal}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer border border-white/20 shadow-lg"
                title="Next Short"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Detailed Video Information */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-300 text-xs font-bold border border-red-500/30">
                    {modalVideo.badge}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    {modalVideo.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  {modalVideo.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-amber-200">
                  {modalVideo.marathiTitle}
                </p>

                <p className="mt-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {modalVideo.description}
                </p>

                {/* Session Highlights */}
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Key Classroom Highlights</span>
                  </h5>
                  <ul className="text-xs text-stone-300 space-y-1.5 font-light">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Live interactive speaking drills and phonetics practice</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Peer-to-peer dialogue circles removing stage fear</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>Direct mentor feedback & certification guidance</span>
                    </li>
                  </ul>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {modalVideo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] text-stone-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <a
                  href={modalVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setModalVideo(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Close Theater
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
