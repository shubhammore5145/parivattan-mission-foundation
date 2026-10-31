import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Newspaper,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Clock,
  Download,
  AlertCircle,
  Tag,
  Share2,
  Eye,
} from "lucide-react";
import {
  AnnouncementItem,
  NewsArticleItem,
  getStoredAnnouncements,
  getStoredNews,
} from "@/data/newsAndAnnouncementsData";

export default function NewsAndAnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    getStoredAnnouncements()
  );
  const [newsList, setNewsList] = useState<NewsArticleItem[]>(() =>
    getStoredNews()
  );

  // Selected announcement / news for detail modal
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticleItem | null>(null);

  // Embedded PDF Preview modal state
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Category filter for announcements
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Sync when admin modifies data
  useEffect(() => {
    const handleSync = () => {
      setAnnouncements(getStoredAnnouncements());
      setNewsList(getStoredNews());
    };

    window.addEventListener("parivattan-news-announcements-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(
        "parivattan-news-announcements-updated",
        handleSync
      );
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(announcements.map((a) => a.category))
    );
    return ["All", ...unique];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (selectedCategory === "All") return announcements;
    return announcements.filter((a) => a.category === selectedCategory);
  }, [announcements, selectedCategory]);

  const getHashtags = (item: AnnouncementItem) => {
    switch (item.category) {
      case "Examination":
        return [
          { label: "#Exam", color: "bg-rose-600 text-white" },
          { label: "#Time Table", color: "bg-blue-600 text-white" },
          { label: "#PMF", color: "bg-sky-600 text-white" },
        ];
      case "Admissions":
        return [
          { label: "#Admissions", color: "bg-emerald-600 text-white" },
          { label: "#Winter2026", color: "bg-blue-600 text-white" },
          { label: "#Languages", color: "bg-indigo-600 text-white" },
        ];
      case "Academic":
        return [
          { label: "#Academic", color: "bg-blue-600 text-white" },
          { label: "#Syllabus", color: "bg-indigo-600 text-white" },
          { label: "#PFLS", color: "bg-purple-600 text-white" },
        ];
      case "Urgent":
        return [
          { label: "#Urgent", color: "bg-rose-600 text-white" },
          { label: "#Notice", color: "bg-amber-600 text-white" },
          { label: "#Official", color: "bg-slate-700 text-white" },
        ];
      default:
        return [
          { label: "#Notice", color: "bg-blue-600 text-white" },
          { label: "#Campus", color: "bg-emerald-600 text-white" },
          { label: "#PMF", color: "bg-slate-700 text-white" },
        ];
    }
  };

  // Continuous stream items for seamless horizontal running marquee on any monitor width
  const marqueeItems = useMemo(() => {
    if (announcements.length === 0) return [];
    let items = [...announcements];
    while (items.length < 8) {
      items = [...items, ...announcements];
    }
    return items;
  }, [announcements]);

  // Featured news is first item, rest are secondary
  const featuredNews = newsList[0];
  const secondaryNews = newsList.slice(1, 4);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Admissions":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Examination":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Urgent":
        return "bg-rose-100 text-rose-800 border-rose-200 font-bold";
      case "Event":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Academic":
        return "bg-amber-100 text-amber-900 border-amber-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  return (
    <section
      id="announcements-news"
      className="py-16 md:py-24 bg-[#fbfaf7] border-t border-[#e8e4da] relative overflow-hidden"
    >
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#b5623b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* ================= 1. UNIVERSITY-STYLE CONTINUOUS RUNNING MARQUEE ================= */}
        {announcements.length > 0 && (
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-[#1c2623] via-[#24312d] to-[#1c2623] p-2.5 sm:p-3 shadow-lg flex items-center gap-3 text-white overflow-hidden border border-white/10">
            {/* Scoped CSS to ensure 100% reliable 60fps hardware-accelerated movement */}
            <style>{`
              @keyframes pmfMarqueeScroll {
                0% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .pmf-marquee-track {
                display: flex;
                width: max-content;
              }
              .pmf-marquee-content {
                display: flex;
                align-items: center;
                gap: 2rem;
                flex-shrink: 0;
                animation: pmfMarqueeScroll 110s linear infinite;
                will-change: transform;
              }
              @media (max-width: 640px) {
                .pmf-marquee-content {
                  animation: pmfMarqueeScroll 135s linear infinite;
                  gap: 1.5rem;
                }
              }
              .pmf-marquee-container:hover .pmf-marquee-content,
              .pmf-marquee-container:active .pmf-marquee-content {
                animation-play-state: paused;
              }
            `}</style>

            {/* Left Badge with Pulse Live Indicator - Compact on mobile for maximum reading width */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#b5623b] px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm z-20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-200"></span>
              </span>
              <Bell size={13} className="animate-bounce" />
              <span className="font-extrabold tracking-wider hidden sm:inline">Latest Updates</span>
              <span className="font-extrabold tracking-wider sm:hidden">Updates</span>
            </div>

            {/* Continuous Running Marquee across full width */}
            <div className="pmf-marquee-container flex-1 overflow-hidden relative select-none">
              {/* Subtle Edge Fades for Clean Look */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#1c2623] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#1c2623] to-transparent z-10" />

              <div className="pmf-marquee-track flex">
                {/* Track 1: Original stream */}
                <div className="pmf-marquee-content flex items-center gap-8 shrink-0 pr-8">
                  {marqueeItems.map((item, idx) => (
                    <button
                      key={`m1-${item.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedAnnouncement(item)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm text-stone-200 hover:text-[#f2c5a8] transition cursor-pointer shrink-0"
                    >
                      {item.isNew && (
                        <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                          NEW
                        </span>
                      )}
                      <span className="font-semibold">{item.title}</span>
                      <span className="text-white/40">•</span>
                    </button>
                  ))}
                </div>

                {/* Track 2: Cloned for seamless, glitchless infinite loop */}
                <div
                  className="pmf-marquee-content flex items-center gap-8 shrink-0 pr-8"
                  aria-hidden="true"
                >
                  {marqueeItems.map((item, idx) => (
                    <button
                      key={`m2-${item.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedAnnouncement(item)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm text-stone-200 hover:text-[#f2c5a8] transition cursor-pointer shrink-0"
                    >
                      {item.isNew && (
                        <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                          NEW
                        </span>
                      )}
                      <span className="font-semibold">{item.title}</span>
                      <span className="text-white/40">•</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. ANNOUNCEMENTS CAROUSEL (Matching User Mobile Screenshot) ================= */}
        <div className="mb-14 sm:mb-16">
          {/* Header with Vertical Orange Line */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center">
              <div className="w-1.5 h-7 sm:h-8 bg-[#b5623b] rounded-full mr-3 shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
                Announcements
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/student"
                className="text-xs sm:text-sm font-bold text-[#b5623b] hover:text-[#8f4726] transition flex items-center gap-1.5 bg-[#b5623b]/10 hover:bg-[#b5623b]/20 px-3.5 py-1.5 rounded-full"
              >
                <span>View All Notices</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Continuous Infinite Looping Cards Marquee ("loop made chalt rahile pahije") */}
          <div className="relative overflow-hidden -mx-4 sm:mx-0 select-none">
            {/* Scoped CSS for 100% reliable 60fps infinite marquee loop */}
            <style>{`
              @keyframes pmfAnnouncementsInfiniteLoop {
                0% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .pmf-cards-loop-container {
                display: flex;
                overflow: hidden;
                width: 100%;
                position: relative;
              }
              .pmf-cards-loop-track {
                display: flex;
                width: max-content;
              }
              .pmf-cards-loop-content {
                display: flex;
                gap: 1.25rem;
                flex-shrink: 0;
                padding-right: 1.25rem;
                animation: pmfAnnouncementsInfiniteLoop 36s linear infinite;
                will-change: transform;
              }
              @media (max-width: 640px) {
                .pmf-cards-loop-content {
                  animation: pmfAnnouncementsInfiniteLoop 30s linear infinite;
                  gap: 1rem;
                  padding-right: 1rem;
                }
              }
              .pmf-cards-loop-container:hover .pmf-cards-loop-content,
              .pmf-cards-loop-container:active .pmf-cards-loop-content {
                animation-play-state: paused;
              }
            `}</style>

            {/* Left and Right subtle gradient edge fades */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-[#fbfaf7] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-[#fbfaf7] to-transparent z-10" />

            <div className="pmf-cards-loop-container py-2">
              <div className="pmf-cards-loop-track flex">
                {/* Track 1: Original stream */}
                <div className="pmf-cards-loop-content">
                  {announcements.map((item) => (
                    <div
                      key={`loop1-${item.id}`}
                      onClick={() => setSelectedAnnouncement(item)}
                      role="button"
                      tabIndex={0}
                      className="w-[280px] sm:w-[330px] shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#b5623b]/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-3">
                        {/* Hashtags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getHashtags(item).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md tracking-tight shadow-2xs ${tag.color}`}
                            >
                              {tag.label}
                            </span>
                          ))}
                          {item.isNew && (
                            <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse shadow-2xs">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Title with maximum contrast and clear readability */}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#b5623b] transition-colors leading-snug line-clamp-3">
                          {item.title}
                        </h4>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{item.dateFormatted || item.date}</span>
                        </div>
                        {item.attachmentName ? (
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1">
                            <FileText size={10} />
                            <span>PDF Notice</span>
                          </span>
                        ) : (
                          <span className="text-[#b5623b] font-bold text-[11px] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            <span>Details</span>
                            <ChevronRight size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Track 2: Cloned stream for seamless infinite glitchless loop */}
                <div className="pmf-cards-loop-content" aria-hidden="true">
                  {announcements.map((item) => (
                    <div
                      key={`loop2-${item.id}`}
                      onClick={() => setSelectedAnnouncement(item)}
                      role="button"
                      tabIndex={0}
                      className="w-[280px] sm:w-[330px] shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#b5623b]/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-3">
                        {/* Hashtags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getHashtags(item).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md tracking-tight shadow-2xs ${tag.color}`}
                            >
                              {tag.label}
                            </span>
                          ))}
                          {item.isNew && (
                            <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse shadow-2xs">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Title with maximum contrast and clear readability */}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#b5623b] transition-colors leading-snug line-clamp-3">
                          {item.title}
                        </h4>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{item.dateFormatted || item.date}</span>
                        </div>
                        {item.attachmentName ? (
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1">
                            <FileText size={10} />
                            <span>PDF Notice</span>
                          </span>
                        ) : (
                          <span className="text-[#b5623b] font-bold text-[11px] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            <span>Details</span>
                            <ChevronRight size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. LATEST NEWS & UPCOMING EVENTS ================= */}
        <div className="space-y-6">
          {/* Header with Orange Bar and Subtitle matching Screenshot */}
          <div className="flex items-start mb-6 sm:mb-8">
            <div className="w-1.5 h-16 sm:h-20 bg-[#b5623b] rounded-full mr-3 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Latest News &<br />Upcoming Events
              </h2>
              <div className="border-l-2 border-[#b5623b] pl-3 mt-3">
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Your go-to source for the most important news stories of the day.
                </p>
              </div>
            </div>
          </div>

          {/* News Grid: Featured News & Secondary News */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Featured Story (Left 7 Cols) */}
            {featuredNews && (
              <div
                onClick={() => setSelectedNews(featuredNews)}
                role="button"
                tabIndex={0}
                className="lg:col-span-7 group rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-[#b5623b]/50 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-100">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/japanese.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Badges on Image */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="rounded-full bg-[#b5623b] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                      Featured Story
                    </span>
                    <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-slate-900 shadow-xs">
                      {featuredNews.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-semibold text-white/95">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{featuredNews.dateFormatted || featuredNews.date}</span>
                    </div>
                    {featuredNews.readTime && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{featuredNews.readTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content with high contrast readability */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 group-hover:text-[#b5623b] transition-colors leading-snug">
                      {featuredNews.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-3 font-normal">
                      {featuredNews.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-[#b5623b]">
                    <span>Read Full Story</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}

            {/* Secondary News Items (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Newspaper size={16} className="text-[#b5623b]" />
                  <span>More Campus Updates</span>
                </h4>
                <span className="text-xs font-medium text-slate-500">
                  Recent Stories
                </span>
              </div>

              <div className="space-y-3">
                {secondaryNews.map((news) => (
                  <div
                    key={news.id}
                    onClick={() => setSelectedNews(news)}
                    role="button"
                    tabIndex={0}
                    className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-18 w-18 sm:h-20 sm:w-20 rounded-xl object-cover shrink-0 bg-slate-100 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/img/purpose.jpg";
                      }}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-[#b5623b]">{news.category}</span>
                        <span>•</span>
                        <span>{news.dateFormatted || news.date}</span>
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#b5623b] transition-colors line-clamp-2 leading-snug">
                        {news.title}
                      </h5>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#b5623b] group-hover:translate-x-0.5 transition-all shrink-0 mt-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ANNOUNCEMENT DETAIL MODAL ================= */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${getCategoryBadgeClass(
                    selectedAnnouncement.category
                  )}`}
                >
                  {selectedAnnouncement.category}
                </span>
                {selectedAnnouncement.isNew && (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                    NEW
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-[#65706a] mb-2 font-medium">
                <Calendar size={13} className="text-[#b5623b]" />
                <span>Published: {selectedAnnouncement.dateFormatted || selectedAnnouncement.date}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#24312d] leading-snug">
                {selectedAnnouncement.title}
              </h3>
            </div>

            <div className="rounded-2xl bg-[#fbfaf7] border border-[#e2e5dc] p-4 text-xs sm:text-sm text-[#24312d] leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.description}
            </div>

            {selectedAnnouncement.attachmentName && (() => {
              const fileUrl =
                selectedAnnouncement.attachmentUrl ||
                `/docs/${selectedAnnouncement.attachmentName}`;
              const isPdf =
                selectedAnnouncement.attachmentName.toLowerCase().endsWith(".pdf");

              return (
                <div className="rounded-2xl border border-emerald-600/30 bg-gradient-to-r from-emerald-500/10 via-[#fbfaf7] to-amber-500/10 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-600/15 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0 border border-emerald-500/20">
                        <FileText size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#24312d]">
                            {selectedAnnouncement.attachmentName}
                          </span>
                          {selectedAnnouncement.fileSize && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 font-semibold">
                              {selectedAnnouncement.fileSize}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#65706a] mt-0.5">
                          Official PDF Document · Parivattan Foreign Language School (PFLS)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Quick Preview, Open Tab, Download PDF */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/80">
                    {isPdf && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPdf({
                            url: fileUrl,
                            title: selectedAnnouncement.title,
                            subtitle: selectedAnnouncement.attachmentName,
                          });
                        }}
                        className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Eye size={14} />
                        <span>Quick Preview</span>
                      </button>
                    )}

                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 hover:bg-stone-50 py-2.5 px-3.5 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      title="Open PDF in new browser tab"
                    >
                      <ExternalLink size={14} />
                      <span>Open Tab</span>
                    </a>

                    <a
                      href={fileUrl}
                      download={selectedAnnouncement.attachmentName}
                      className="rounded-xl bg-[#b5623b] hover:bg-[#8f4726] text-white py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
              {selectedAnnouncement.linkUrl && (
                <Link
                  to={selectedAnnouncement.linkUrl}
                  onClick={() => setSelectedAnnouncement(null)}
                  className="rounded-xl bg-[#b5623b] hover:bg-[#8f4726] px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <span>{selectedAnnouncement.linkText || "Open Page"}</span>
                  <ExternalLink size={13} />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEWS ARTICLE DETAIL MODAL ================= */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 space-y-0 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Top Image Banner */}
            <div className="relative h-56 sm:h-64 w-full bg-stone-100 shrink-0">
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/img/japanese.jpeg";
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 rounded-full bg-black/50 text-white p-2 hover:bg-black/75 transition backdrop-blur-xs"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="rounded-full bg-[#b5623b] px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                  {selectedNews.category}
                </span>
                <span className="rounded-full bg-black/50 backdrop-blur-xs px-2.5 py-0.5 text-xs text-white">
                  {selectedNews.dateFormatted || selectedNews.date}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-4">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#24312d] leading-snug">
                {selectedNews.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-[#65706a] pb-3 border-b border-[#f0ece2]">
                <span>Author: <strong>{selectedNews.author || "Foundation Editorial Cell"}</strong></span>
                <span>•</span>
                <span>{selectedNews.readTime || "3 min read"}</span>
              </div>

              <div className="text-xs sm:text-sm text-[#24312d] leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {selectedNews.content}
              </div>

              <div className="pt-4 border-t border-[#f0ece2] flex items-center justify-between">
                <div className="text-[11px] text-[#65706a]">
                  Published by Parivattan Mission Foundation Public Relations
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="rounded-xl bg-[#24312d] hover:bg-[#344540] px-5 py-2 text-xs font-bold text-white transition"
                >
                  Close Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PDF PREVIEW LIGHTBOX MODAL ================= */}
      {previewPdf && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewPdf(null)}
        >
          <div
            className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#24312d] text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-amber-400" />
                </div>
                <div className="truncate">
                  <h4 className="font-serif font-bold text-base truncate">{previewPdf.title}</h4>
                  {previewPdf.subtitle && (
                    <p className="text-xs text-amber-300 truncate">{previewPdf.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewPdf.url}
                  download
                  className="rounded-xl bg-[#b5623b] hover:bg-[#974a27] text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPdf(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body: Embedded PDF iframe */}
            <div className="flex-1 bg-stone-100 p-2 sm:p-4 overflow-hidden">
              <iframe
                src={previewPdf.url}
                title={previewPdf.title}
                className="w-full h-full rounded-2xl border border-stone-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
