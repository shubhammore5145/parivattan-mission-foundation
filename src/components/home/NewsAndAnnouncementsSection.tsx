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
  X,
  FileText,
  Clock,
  Download,
  AlertCircle,
  Tag,
  Share2,
  Eye,
  Play,
  Pause,
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

  // Notice Board & Circulars Auto-Scrolling Engine
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollActive, setIsAutoScrollActive] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isAutoScrollActive) return;

    let animationFrameId: number;
    let isResetting = false;
    let scrollPos = container.scrollTop;

    const step = () => {
      if (!isHovered && container && !isResetting) {
        const maxScroll = container.scrollHeight - container.clientHeight;

        if (maxScroll > 10) {
          // Synchronize with any manual wheel/scroll adjustment
          if (Math.abs(container.scrollTop - scrollPos) > 6) {
            scrollPos = container.scrollTop;
          }

          if (container.scrollTop >= maxScroll - 2) {
            // Reached bottom: pause for 2.2s so user can read last item, then smoothly reset to top
            isResetting = true;
            setTimeout(() => {
              if (container) {
                container.scrollTo({ top: 0, behavior: "smooth" });
                scrollPos = 0;
                setTimeout(() => {
                  isResetting = false;
                }, 1000);
              } else {
                isResetting = false;
              }
            }, 2200);
          } else {
            scrollPos += 0.65;
            container.scrollTop = scrollPos;
          }
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    };
  }, [isAutoScrollActive, isHovered, filteredAnnouncements]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
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

        {/* ================= 2. SECTION TITLE & HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#e2e5dc]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#b5623b]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#b5623b]">
              <Sparkles size={13} />
              <span>Notices & Happenings</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-sans font-extrabold text-[#24312d] tracking-tight">
              Announcements & Latest News
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#65706a] max-w-2xl leading-relaxed">
              Official circulars, academic notices, upcoming events, and stories from Parivattan Mission Foundation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student-portal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b5623b] hover:text-[#8f4726] transition group"
            >
              <span>Student Portal Circulars</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ================= 3. DUAL-COLUMN GRID: ANNOUNCEMENTS & NEWS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: ANNOUNCEMENTS BOARD (7 COLS) ================= */}
          <div className="lg:col-span-6 xl:col-span-7 bg-white rounded-3xl border border-[#e2e5dc] shadow-sm p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-4 border-b border-[#f0ece2] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-sans font-bold text-[#24312d]">
                      Notice Board & Circulars
                    </h3>
                    <p className="text-[11px] text-[#65706a]">
                      Important academic notices and circulars
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoScrollActive((prev) => !prev)}
                    className="rounded-full bg-[#fbfaf7] hover:bg-[#eae6db] border border-[#e2e5dc] px-2.5 py-1 text-[11px] font-semibold text-[#24312d] inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title={isAutoScrollActive ? "Click to Pause Auto-Scroll" : "Click to Resume Auto-Scroll"}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isAutoScrollActive && !isHovered
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {isAutoScrollActive
                        ? isHovered
                          ? "Paused (Hover)"
                          : "Auto-Scrolling"
                        : "Scroll Paused"}
                    </span>
                    {isAutoScrollActive && !isHovered ? (
                      <Pause size={11} className="text-[#24312d]" />
                    ) : (
                      <Play size={11} className="text-[#24312d]" />
                    )}
                  </button>
                  <span className="rounded-full bg-[#fbfaf7] border border-[#e2e5dc] px-3 py-1 text-xs font-bold text-[#24312d]">
                    {announcements.length} Notices
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-[#24312d] text-white shadow-xs"
                        : "bg-[#f4f2ea] text-[#65706a] hover:bg-[#eae6db] hover:text-[#24312d]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Announcements Feed with Automatic Smooth Scrolling & Hover Pause */}
              <div className="relative">
                {/* Subtle top & bottom edge fades */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white via-white/80 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />

                <div
                  ref={scrollContainerRef}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onTouchStart={() => setIsHovered(true)}
                  onTouchEnd={() => {
                    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
                    touchTimeoutRef.current = setTimeout(() => setIsHovered(false), 2200);
                  }}
                  className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scroll-smooth"
                >
                {filteredAnnouncements.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-500">
                    No announcements available in this category.
                  </div>
                ) : (
                  filteredAnnouncements.map((item) => {
                    const parsedDate = new Date(item.date);
                    const month = parsedDate.toLocaleDateString("en-US", { month: "short" });
                    const day = parsedDate.getDate() || "16";

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAnnouncement(item)}
                        role="button"
                        tabIndex={0}
                        className="group relative flex items-start gap-4 p-3.5 sm:p-4 rounded-2xl border border-[#ece8de] bg-[#fbfaf7] hover:bg-white hover:border-[#b5623b]/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        {/* Date Box */}
                        <div className="shrink-0 flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-[#24312d] text-white shadow-xs group-hover:bg-[#b5623b] transition-colors">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 group-hover:text-white leading-none">
                            {month}
                          </span>
                          <span className="text-base font-bold font-serif leading-none mt-1">
                            {day}
                          </span>
                        </div>

                        {/* Title & Badge */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getCategoryBadgeClass(
                                item.category
                              )}`}
                            >
                              {item.category}
                            </span>
                            {item.isNew && (
                              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider animate-pulse">
                                NEW ⚡
                              </span>
                            )}
                            {item.isPinned && (
                              <span className="rounded-full bg-amber-500/20 text-amber-800 px-2 py-0.5 text-[9px] font-bold uppercase border border-amber-300">
                                Pinned 📌
                              </span>
                            )}
                            {item.attachmentName && (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                                <FileText size={10} />
                                <span>PDF {item.fileSize ? `· ${item.fileSize}` : ""}</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-[#24312d] group-hover:text-[#b5623b] transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>

                          <p className="mt-1 text-[11px] text-[#65706a] line-clamp-1">
                            {item.description}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className="shrink-0 text-stone-400 group-hover:text-[#b5623b] group-hover:translate-x-1 transition-all mt-3"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

            {/* Bottom Strip */}
            <div className="mt-6 pt-4 border-t border-[#f0ece2] flex items-center justify-between text-xs text-[#65706a]">
              <span>Official circulars issued by Foundation Secretariat</span>
              <span className="font-bold text-[#24312d]">Verified Portal</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LATEST NEWS & PRESS (5 COLS) ================= */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-5">
            {/* Featured Story Card */}
            {featuredNews && (
              <div
                onClick={() => setSelectedNews(featuredNews)}
                role="button"
                tabIndex={0}
                className="group rounded-3xl border border-[#e2e5dc] bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-[#b5623b]/50 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/japanese.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badges on Image */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="rounded-full bg-[#b5623b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                      Featured News
                    </span>
                    <span className="rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-[#24312d]">
                      {featuredNews.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} />
                      <span>{featuredNews.dateFormatted || featuredNews.date}</span>
                    </div>
                    {featuredNews.readTime && (
                      <div className="flex items-center gap-1 font-medium">
                        <Clock size={13} />
                        <span>{featuredNews.readTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#24312d] group-hover:text-[#b5623b] transition-colors leading-snug">
                      {featuredNews.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#65706a] leading-relaxed line-clamp-2">
                      {featuredNews.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0ece2] flex items-center justify-between text-xs font-bold text-[#b5623b]">
                    <span>Read Full Story</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}

            {/* Secondary News Items */}
            <div className="bg-white rounded-3xl border border-[#e2e5dc] p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ece2]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#24312d] flex items-center gap-1.5">
                  <Newspaper size={14} className="text-[#b5623b]" />
                  <span>More Campus Updates</span>
                </h4>
                <span className="text-[11px] text-[#65706a]">
                  Recent Press & Media
                </span>
              </div>

              {secondaryNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => setSelectedNews(news)}
                  role="button"
                  tabIndex={0}
                  className="group flex items-center gap-3.5 p-2 rounded-2xl hover:bg-[#fbfaf7] transition cursor-pointer"
                >
                  <img
                    src={news.image}
                    alt={news.title}
                    className="h-16 w-16 rounded-xl object-cover shrink-0 bg-stone-100 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/purpose.jpg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-[#65706a]">
                      <span className="font-bold text-[#b5623b]">{news.category}</span>
                      <span>•</span>
                      <span>{news.dateFormatted || news.date}</span>
                    </div>
                    <h5 className="mt-0.5 text-xs font-semibold text-[#24312d] group-hover:text-[#b5623b] transition-colors line-clamp-2 leading-tight">
                      {news.title}
                    </h5>
                  </div>
                  <ChevronRight size={15} className="text-stone-400 group-hover:text-[#b5623b] shrink-0" />
                </div>
              ))}
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
