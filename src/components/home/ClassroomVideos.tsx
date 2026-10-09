import React, { useState } from "react";
import { Play, Sparkles, Youtube, ExternalLink, Video, CheckCircle2, ChevronRight } from "lucide-react";

export interface YouTubeShortItem {
  id: string;
  badge: string;
  title: string;
  marathiTitle: string;
  description: string;
  url: string;
}

export const YOUTUBE_SHORTS: YouTubeShortItem[] = [
  {
    id: "_EEthfJ3nqM",
    badge: "Session 01",
    title: "Classroom Energy & Language Fundamentals",
    marathiTitle: "प्रत्यक्ष वर्गानुभव व विद्यार्थी संवाद",
    description: "Real glimpses from our classroom sessions showing students enthusiastically learning language phonetics and foundation skills.",
    url: "https://youtube.com/shorts/_EEthfJ3nqM",
  },
  {
    id: "aoG4lvsm5Lw",
    badge: "Session 02",
    title: "Foreign Language Speaking & Confidence",
    marathiTitle: "परकीय भाषा संभाषण व आत्मविश्वास सराव",
    description: "Students building spoken fluency through live interactive dialogue, group conversation, and practical speaking drills.",
    url: "https://youtube.com/shorts/aoG4lvsm5Lw",
  },
  {
    id: "2qEHNtsCrR4",
    badge: "Session 03",
    title: "Interactive Workshop & Peer Learning",
    marathiTitle: "परस्परसंवादी शिक्षण व युवा सहभाग",
    description: "Dynamic classroom engagement where first-generation learners practice together in a supportive community environment.",
    url: "https://youtube.com/shorts/2qEHNtsCrR4",
  },
  {
    id: "L5l16Lq6sYY",
    badge: "Session 04",
    title: "Global Careers & JLPT / Language Guidance",
    marathiTitle: "जागतिक करिअर संधी व परदेशी मार्गदर्शन",
    description: "Guidance on international higher education, certification tests (JLPT / Goethe), and verified overseas career mobility.",
    url: "https://youtube.com/shorts/L5l16Lq6sYY",
  },
  {
    id: "G6pjOW4Njnk",
    badge: "Session 05",
    title: "Parivattan Movement & Student Stories",
    marathiTitle: "परिवर्तन चळवळ व विद्यार्थ्यांचा प्रेरणादायी प्रवास",
    description: "Inspiring student journey and grassroots impact of Parivattan Mission Foundation across Maharashtra.",
    url: "https://youtube.com/shorts/G6pjOW4Njnk",
  },
];

interface ClassroomVideosProps {
  idPrefix?: string;
  className?: string;
}

export default function ClassroomVideos({ idPrefix = "home", className = "" }: ClassroomVideosProps) {
  const [activeVideoId, setActiveVideoId] = useState<string>(YOUTUBE_SHORTS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const activeVideo = YOUTUBE_SHORTS.find((v) => v.id === activeVideoId) || YOUTUBE_SHORTS[0];

  const handleSelectVideo = (videoId: string) => {
    setActiveVideoId(videoId);
    setIsPlaying(true);
  };

  return (
    <section id={`${idPrefix}-classroom-videos`} className={`py-16 md:py-24 bg-[#14201b] text-white relative overflow-hidden ${className}`}>
      {/* Decorative Background Elements */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b5623b]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 text-red-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 border border-red-500/30">
            <Youtube className="w-4 h-4 text-red-400" />
            <span>YouTube Shorts · प्रत्यक्ष वर्गानुभव</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Watch Our Students In Action
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Real classroom moments, student confidence, foreign language immersion, and inspirational stories 
            straight from Parivattan learning circles.
          </p>
        </div>

        {/* Simple & Clean Video Layout: Active Player + Playlist Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start max-w-6xl mx-auto">
          {/* Main Active Video Player (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-none rounded-3xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl p-2 sm:p-3 ring-1 ring-white/10">
              {/* Responsive 9:16 Shorts Player / Click-To-Play Thumbnail */}
              <div className="relative w-full aspect-[9/16] max-h-[580px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {isPlaying ? (
                  <iframe
                    key={activeVideo.id}
                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div 
                    onClick={() => setIsPlaying(true)}
                    className="relative w-full h-full cursor-pointer group flex items-center justify-center"
                    title="Click to play video"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${activeVideo.id}/hqdefault.jpg`}
                      alt={activeVideo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

                    {/* Big YouTube Play Button */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 ring-8 ring-red-600/30">
                        <Play className="w-9 h-9 fill-current ml-1" />
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20 shadow-lg">
                        Click to Play Short
                      </span>
                    </div>

                    {/* YouTube Badge in Corner */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-semibold shadow-md">
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube Short</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Video Info Bar */}
              <div className="p-4 sm:p-5 text-left space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/20 text-red-300 border border-red-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    <span>{activeVideo.badge}</span>
                  </span>
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  {activeVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-300/90 font-medium">
                  {activeVideo.marathiTitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  {activeVideo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Playlist & Quick Selection List (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" />
                All 5 YouTube Shorts
              </span>
              <span className="text-xs font-mono text-slate-400">
                Tap to watch
              </span>
            </div>

            {YOUTUBE_SHORTS.map((video, index) => {
              const isActive = video.id === activeVideoId;
              const thumbUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

              return (
                <button
                  key={video.id}
                  onClick={() => handleSelectVideo(video.id)}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-300 flex items-center gap-4 cursor-pointer border ${
                    isActive
                      ? "bg-gradient-to-r from-red-950/60 to-[#24312d] border-red-500/50 shadow-lg ring-1 ring-red-500/40 translate-x-1"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Video Thumbnail */}
                  <div className="relative w-20 sm:w-24 aspect-[4/3] rounded-xl overflow-hidden bg-black shrink-0 border border-white/15">
                    <img
                      src={thumbUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                        isActive ? "bg-red-600 text-white" : "bg-white/80 text-black"
                      }`}>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-black/80 text-white">
                      Short
                    </span>
                  </div>

                  {/* Video Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-red-500/30 text-red-200" : "bg-white/10 text-slate-300"
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 truncate">
                        {video.badge}
                      </span>
                    </div>
                    <h4 className={`text-sm font-semibold truncate ${
                      isActive ? "text-white" : "text-slate-200"
                    }`}>
                      {video.title}
                    </h4>
                    <p className="text-xs text-amber-300/80 truncate mt-0.5">
                      {video.marathiTitle}
                    </p>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? "text-red-400 translate-x-0.5" : "text-slate-500"
                  }`} />
                </button>
              );
            })}

            {/* External channel link banner */}
            <div className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Subscribe on YouTube</p>
                  <p className="text-[11px] text-slate-400">Watch daily learning shorts & updates</p>
                </div>
              </div>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Visit YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
