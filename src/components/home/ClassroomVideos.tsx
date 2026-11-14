import React, { useState, useEffect } from "react";
import {
  Play,
  Sparkles,
  Youtube,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Award,
  Users,
} from "lucide-react";

export interface YouTubeShortItem {
  id: string;
  title: string;
  description: string;
  url: string;
}

export const FEATURED_STORY_VIDEO = {
  id: "xEjvPDR2ya8",
  title: "The Heart of Parivattan: Grassroots Transformation & Student Stories",
  subtitle: "Authentic Documentary · Inspiring Real Stories from Maharashtra",
  description:
    "Witness the inspiring journey of students and mentors building life-changing foreign language and educational pathways across rural and semi-urban Maharashtra. A powerful story of hope, resilience, and global opportunities.",
  url: "https://youtu.be/xEjvPDR2ya8",
};

export const YOUTUBE_SHORTS: YouTubeShortItem[] = [
  {
    id: "_EEthfJ3nqM",
    title: "Classroom Energy & Fundamentals",
    description:
      "Students enthusiastically learning foreign language phonetics, script basics, and spoken confidence at our Chhatrapati Sambhajinagar learning circle.",
    url: "https://youtube.com/shorts/_EEthfJ3nqM",
  },
  {
    id: "aoG4lvsm5Lw",
    title: "Foreign Language Speaking Drills",
    description:
      "Students building spoken fluency through interactive dialogue, vocabulary drills, and real-time situational communication.",
    url: "https://youtube.com/shorts/aoG4lvsm5Lw",
  },
  {
    id: "2qEHNtsCrR4",
    title: "Interactive Peer Learning Circles",
    description:
      "Collaborative peer learning and supportive community practice helping first-generation learners overcome stage fear.",
    url: "https://youtube.com/shorts/2qEHNtsCrR4",
  },
  {
    id: "L5l16Lq6sYY",
    title: "Global Careers & JLPT Guidance",
    description:
      "Expert mentorship on international certifications (JLPT & Goethe), scholarships, and verified career pathways abroad.",
    url: "https://youtube.com/shorts/L5l16Lq6sYY",
  },
  {
    id: "G6pjOW4Njnk",
    title: "Student Determination & Journeys",
    description:
      "Inspiring glimpses of young learners from rural Maharashtra transforming their prospects through language education.",
    url: "https://youtube.com/shorts/G6pjOW4Njnk",
  },
];

interface ClassroomVideosProps {
  idPrefix?: string;
  className?: string;
}

export default function ClassroomVideos({
  idPrefix = "home",
  className = "",
}: ClassroomVideosProps) {
  // Cinema Lightbox Modal for shorts
  const [modalVideo, setModalVideo] = useState<YouTubeShortItem | null>(null);

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
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Youtube className="w-4 h-4 text-red-400" />
            <span className="font-extrabold tracking-wider">
              Parivattan Stories & Classroom Moments
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Watch Our Journey & Classrooms
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-amber-200/90">
            Parivattan Mission Foundation — Real Impact from Maharashtra
          </p>

          <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed font-light max-w-2xl">
            Real stories of transformation, student determination, and foreign language immersion
            drills recorded live across our learning circles.
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-stone-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Real Student Stories</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Practical Spoken Drills</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>JLPT & Goethe Oriented</span>
            </span>
          </div>
        </div>

        {/* ================= 2. GRAND FEATURED STORY VIDEO (BIG WIDESCREEN SHOWCASE) ================= */}
        <div className="mb-16 rounded-3xl bg-gradient-to-br from-[#1c2925] via-[#20312b] to-[#17221f] border border-white/15 p-5 sm:p-7 md:p-9 shadow-2xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Big Video Player Container (Widescreen 16:9) */}
            <div className="lg:col-span-8 relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 group">
              <iframe
                src={`https://www.youtube.com/embed/${FEATURED_STORY_VIDEO.id}?rel=0&modestbranding=1`}
                title={FEATURED_STORY_VIDEO.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Side Story Details */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5a37f]/20 border border-[#e5a37f]/30 text-[#f2c5a8] text-xs font-bold uppercase tracking-wider w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#e5a37f]" />
                <span>Featured Documentary</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
                {FEATURED_STORY_VIDEO.title}
              </h3>

              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light">
                {FEATURED_STORY_VIDEO.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 font-medium">
                  #OurStory
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 font-medium">
                  #GrassrootsImpact
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 font-medium">
                  #Maharashtra
                </span>
              </div>

              <div className="pt-3">
                <a
                  href={FEATURED_STORY_VIDEO.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. CLASSROOM SHORTS HEADER ================= */}
        <div className="text-left mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a37f]">
              Live Classroom Drills
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              Shorts & Practice Moments
            </h3>
          </div>
          <p className="text-xs text-stone-400">
            Click any short to watch interactive peer practice
          </p>
        </div>

        {/* ================= 4. CLEAN VERTICAL SHORTS CARDS (ZERO DUMMY OVERLAYS) ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch">
          {YOUTUBE_SHORTS.map((short) => (
            <div
              key={short.id}
              onClick={() => setModalVideo(short)}
              className="group relative rounded-2xl overflow-hidden bg-black border border-white/15 hover:border-red-500/70 shadow-lg hover:shadow-2xl hover:shadow-red-950/40 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col aspect-[9/16]"
            >
              {/* Background Thumbnail Image - 100% visible, no dummy text covering it */}
              <img
                src={`https://img.youtube.com/vi/${short.id}/hqdefault.jpg`}
                alt={short.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gentle gradient overlay only for depth on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 group-hover:from-black/90 transition-opacity" />

              {/* Clean Central Play Button */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/95 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 ring-4 ring-white/20">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                </div>
              </div>

              {/* Clean Single-Line Title at bottom */}
              <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/90 to-transparent">
                <p className="text-xs font-semibold text-white/95 group-hover:text-amber-200 transition-colors line-clamp-1">
                  {short.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 5. OFFICIAL YOUTUBE CHANNEL CTA BANNER ================= */}
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

      {/* ================= 6. CINEMA LIGHTBOX THEATER MODAL ================= */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setModalVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#14201b] rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
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

            {/* 9:16 Video Player Container */}
            <div className="md:w-1/2 bg-black flex items-center justify-center relative min-h-[380px] md:min-h-[520px]">
              <iframe
                key={modalVideo.id}
                src={`https://www.youtube-nocookie.com/embed/${modalVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                title={modalVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full aspect-[9/16] max-h-[520px] border-0"
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

            {/* Video Details */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-4 text-left">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  {modalVideo.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                  {modalVideo.description}
                </p>
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
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
