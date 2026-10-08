import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Video, Calendar, GraduationCap, CheckCircle2 } from "lucide-react";

interface ClassroomVideo {
  id: string;
  dayBadge: string;
  title: string;
  marathiTitle: string;
  description: string;
  videoSrc: string;
  highlights: string[];
}

const CLASSROOM_VIDEOS: ClassroomVideo[] = [
  {
    id: "day-1",
    dayBadge: "Day 1 Workshop",
    title: "Orientation & Language Foundation",
    marathiTitle: "दिवस १: भाषा परिचय व संवाद कार्यशाळा",
    description:
      "Interactive onboarding session introducing foreign language fundamentals, cultural etiquette, phonetics, and student ice-breakers.",
    videoSrc: "/img/slides/day-1-classroom.mp4",
    highlights: ["Foundational Phonetics", "Cultural Etiquette", "Interactive Group Activities"],
  },
  {
    id: "day-2",
    dayBadge: "Day 2 Practice",
    title: "Interactive Speaking & Group Drills",
    marathiTitle: "दिवस २: परस्परसंवादी गट चर्चा व भाषा सराव",
    description:
      "Intensive communicative classroom exercises, dialogue simulation (Kaiwa), vocabulary drills, and practical listening practice.",
    videoSrc: "/img/slides/day-2-classroom.mp4",
    highlights: ["Conversational Drills", "Real-Life Roleplay", "Listening Comprehension"],
  },
  {
    id: "day-3",
    dayBadge: "Day 3 Showcase",
    title: "Practical Projects & Global Careers",
    marathiTitle: "दिवस ३: प्रात्यक्षिक ज्ञान व जागतिक संधी",
    description:
      "Student presentations, advanced communicative mastery, global study & work visa pathways, and certificate prep.",
    videoSrc: "/img/slides/day-3-classroom.mp4",
    highlights: ["Student Presentations", "Visa & Career Guidance", "Skill Certification"],
  },
];

export default function ClassroomVideos() {
  const [activeVideoId, setActiveVideoId] = useState<string>(CLASSROOM_VIDEOS[0].id);
  const activeVideo = CLASSROOM_VIDEOS.find((v) => v.id === activeVideoId) || CLASSROOM_VIDEOS[0];
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleTogglePlay = () => {
    if (!mainVideoRef.current) return;
    if (mainVideoRef.current.paused) {
      mainVideoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      mainVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    if (!mainVideoRef.current) return;
    mainVideoRef.current.muted = !mainVideoRef.current.muted;
    setIsMuted(mainVideoRef.current.muted);
  };

  const handleSelectVideo = (video: ClassroomVideo) => {
    setActiveVideoId(video.id);
    setIsPlaying(false);
    if (mainVideoRef.current) {
      mainVideoRef.current.load();
    }
  };

  return (
    <section id="classroom-experience" className="page-section bg-[#14201b] text-white py-20 sm:py-28 relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d2f28] via-[#14201b] to-[#0c1411] opacity-90" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b5623b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-300/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-3 backdrop-blur-sm">
              <Video size={14} className="text-amber-300" />
              <span>प्रत्यक्ष वर्गानुभव · Classroom Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              See Our Students In Action
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#cfd9d3] max-w-2xl font-light leading-relaxed">
              Real glimpses from our foreign language workshops and interactive training sessions. Watch students build confidence, master conversational fluency, and unlock global careers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shrink-0">
            {CLASSROOM_VIDEOS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVideo(v)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeVideoId === v.id
                    ? "bg-[#b5623b] text-white shadow-md"
                    : "text-[#a2b2aa] hover:text-white hover:bg-white/10"
                }`}
              >
                <Calendar size={13} />
                <span>{v.dayBadge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Video Player & Playlist Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Cinema Player (7 cols) */}
          <div className="lg:col-span-7 bg-[#0b120f] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="relative aspect-video bg-black flex items-center justify-center group">
              <video
                ref={mainVideoRef}
                src={activeVideo.videoSrc}
                preload="metadata"
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
              />

              {/* Floating Quick Play/Pause Center Overlay when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition group-hover:bg-black/25 cursor-pointer"
                  aria-label="Play Video"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#b5623b] hover:bg-[#954b2c] text-white flex items-center justify-center shadow-2xl transition transform group-hover:scale-110">
                    <Play size={28} className="translate-x-0.5 text-white" />
                  </div>
                </button>
              )}
            </div>

            {/* Video Details Bar */}
            <div className="p-6 sm:p-8 bg-[#0e1713] border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 px-3 py-1 text-xs font-bold border border-amber-400/30">
                  <Sparkles size={12} /> {activeVideo.dayBadge}
                </span>
                <span className="text-xs text-[#95a59c] font-medium font-serif italic">
                  Parivattan Language Training Sessions
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {activeVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-300 font-medium mt-0.5">
                  {activeVideo.marathiTitle}
                </p>
                <p className="text-xs sm:text-sm text-[#cbd6cf] mt-2.5 leading-relaxed font-light">
                  {activeVideo.description}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {activeVideo.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-[#e0e8e3]"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Playlist & All 3 Videos Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2 flex items-center gap-2">
              <GraduationCap size={15} /> All Workshop Modules
            </div>

            {CLASSROOM_VIDEOS.map((video) => {
              const isSelected = video.id === activeVideoId;
              return (
                <div
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col gap-3 ${
                    isSelected
                      ? "bg-[#182721] border-[#b5623b] shadow-xl ring-1 ring-[#b5623b]/50"
                      : "bg-[#0f1915]/80 border-white/10 hover:border-white/25 hover:bg-[#14201b]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#b5623b] text-white" : "bg-white/10 text-[#a2b2aa]"
                        }`}
                      >
                        <Play size={15} className={isSelected ? "text-white" : "text-[#d1ded6]"} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                          {video.dayBadge}
                        </span>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-white leading-tight">
                          {video.title}
                        </h4>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 shrink-0">
                        Playing Now
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#a2b2aa] line-clamp-2 leading-relaxed font-light">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#86968d] pt-1 border-t border-white/5">
                    <span className="italic text-amber-200/80">{video.marathiTitle}</span>
                    <span className="font-semibold text-white/80 hover:text-amber-300 flex items-center gap-1">
                      {isSelected ? "Active View" : "Watch Video →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
