import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Sparkles,
  Calendar,
  X,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Clock,
  Pin,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import {
  AnnouncementItem,
  NewsArticleItem,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NEWS,
  getStoredAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  getStoredNews,
  saveNewsArticle,
  deleteNewsArticle,
  resetNewsAndAnnouncements,
} from "@/data/newsAndAnnouncementsData";
import {
  compressImageFile,
  saveAnnouncementsAndNewsToCloud,
  syncAnnouncementsAndNewsFromCloud,
} from "@/lib/news-announcements-sync";
import { toast } from "sonner";

const ANNOUNCEMENT_CATEGORIES: AnnouncementItem["category"][] = [
  "Admissions",
  "Academic",
  "Examination",
  "Event",
  "Urgent",
  "General",
];

const NEWS_CATEGORIES: NewsArticleItem["category"][] = [
  "Campus News",
  "Student Achievements",
  "Partnerships",
  "Placement Drive",
  "Cultural & Social",
];

const PRESET_NEWS_IMAGES = [
  { name: "Japanese Language Lab", url: "/img/japanese.jpeg" },
  { name: "Language Admissions", url: "/img/applications-open-languages.jpg" },
  { name: "Foundation Campus", url: "/img/purpose.jpg" },
  { name: "Digital Classroom", url: "/img/silder1.jpg" },
  { name: "Student Bootcamps", url: "/img/silder2.jpg" },
  { name: "Community Outreach", url: "/img/silder3.jpg" },
];

export default function NewsAndAnnouncementsManager() {
  const [subTab, setSubTab] = useState<"announcements" | "news">("announcements");

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    getStoredAnnouncements()
  );
  const [newsList, setNewsList] = useState<NewsArticleItem[]>(() =>
    getStoredNews()
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementItem | null>(null);

  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticleItem | null>(null);

  // Deletion confirm states
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [deletingNews, setDeletingNews] = useState<NewsArticleItem | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Announcement Form Data
  const [annFormData, setAnnFormData] = useState<AnnouncementItem>({
    id: "",
    title: "",
    category: "Admissions",
    date: new Date().toISOString().split("T")[0],
    dateFormatted: "",
    isNew: true,
    isPinned: false,
    description: "",
    imageUrl: "",
    imageName: "",
    linkText: "Learn More",
    linkUrl: "/courses",
    attachmentName: "",
  });

  // News Form Data
  const [newsFormData, setNewsFormData] = useState<NewsArticleItem>({
    id: "",
    title: "",
    category: "Campus News",
    date: new Date().toISOString().split("T")[0],
    dateFormatted: "",
    author: "Foundation PR Cell",
    image: "/img/japanese.jpeg",
    summary: "",
    content: "",
    readTime: "3 min read",
    linkUrl: "/courses",
  });

  // Uploading and Cloud Sync States
  const [annImageUploading, setAnnImageUploading] = useState(false);
  const [newsImageUploading, setNewsImageUploading] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");

  // Listen for local and cross-tab sync
  useEffect(() => {
    const handleSync = () => {
      setAnnouncements(getStoredAnnouncements());
      setNewsList(getStoredNews());
    };
    window.addEventListener("parivattan-news-announcements-updated", handleSync);
    return () =>
      window.removeEventListener(
        "parivattan-news-announcements-updated",
        handleSync
      );
  }, []);

  // Sync from Cloud (MongoDB Atlas & Supabase) on initial load
  useEffect(() => {
    let isMounted = true;
    const fetchCloud = async () => {
      setIsCloudSyncing(true);
      try {
        const result = await syncAnnouncementsAndNewsFromCloud(true);
        if (isMounted && result) {
          if (Array.isArray(result.announcements) && result.announcements.length > 0) {
            setAnnouncements(result.announcements);
          }
          if (Array.isArray(result.newsList) && result.newsList.length > 0) {
            setNewsList(result.newsList);
          }
          setLastSyncedTime(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        }
      } catch (err) {
        console.warn("[CloudSync] Initial fetch notice:", err);
      } finally {
        if (isMounted) setIsCloudSyncing(false);
      }
    };

    fetchCloud();
    return () => {
      isMounted = false;
    };
  }, []);

  // Manual Trigger to re-fetch from cloud
  const handleManualCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      const result = await syncAnnouncementsAndNewsFromCloud(true);
      if (result) {
        if (Array.isArray(result.announcements) && result.announcements.length > 0) {
          setAnnouncements(result.announcements);
        }
        if (Array.isArray(result.newsList) && result.newsList.length > 0) {
          setNewsList(result.newsList);
        }
        setLastSyncedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
        toast.success("Synchronized with MongoDB Atlas cloud!");
      }
    } catch (err) {
      toast.error("Could not complete cloud sync. Please check network connection.");
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Image Upload Handler: Announcement
  const handleAnnouncementImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setAnnImageUploading(true);
    try {
      const { dataUrl, name } = await compressImageFile(file, 1200, 0.85);
      setAnnFormData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        imageName: name,
      }));
      toast.success("Announcement image uploaded and optimized!");
    } catch (err) {
      toast.error("Failed to process image. Please try again.");
    } finally {
      setAnnImageUploading(false);
    }
  };

  // Image Upload Handler: News
  const handleNewsImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setNewsImageUploading(true);
    try {
      const { dataUrl } = await compressImageFile(file, 1200, 0.85);
      setNewsFormData((prev) => ({
        ...prev,
        image: dataUrl,
      }));
      toast.success("News cover photo uploaded and optimized!");
    } catch (err) {
      toast.error("Failed to process image. Please try again.");
    } finally {
      setNewsImageUploading(false);
    }
  };

  // Filtered lists
  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return announcements;
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [announcements, searchQuery]);

  const filteredNews = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return newsList;
    return newsList.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [newsList, searchQuery]);

  // Open Announcement Add
  const handleOpenAddAnnouncement = () => {
    setEditingAnnouncement(null);
    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setAnnFormData({
      id: `ann-${Date.now().toString(36)}`,
      title: "",
      category: "Admissions",
      date: today.toISOString().split("T")[0],
      dateFormatted: formatted,
      isNew: true,
      isPinned: false,
      description: "",
      imageUrl: "",
      imageName: "",
      linkText: "View Details",
      linkUrl: "/admissions",
      attachmentName: "",
    });
    setAnnouncementModalOpen(true);
  };

  // Open Announcement Edit
  const handleOpenEditAnnouncement = (item: AnnouncementItem) => {
    setEditingAnnouncement(item);
    setAnnFormData({
      ...item,
      imageUrl: item.imageUrl || "",
      imageName: item.imageName || "",
    });
    setAnnouncementModalOpen(true);
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annFormData.title.trim()) {
      toast.error("Please enter a title for the announcement.");
      return;
    }
    if (!annFormData.description.trim()) {
      toast.error("Please enter the description / notice content.");
      return;
    }

    const d = new Date(annFormData.date);
    const dateFormatted = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const finalItem: AnnouncementItem = {
      ...annFormData,
      dateFormatted: annFormData.dateFormatted || dateFormatted,
    };

    saveAnnouncement(finalItem);
    const updated = getStoredAnnouncements();
    setAnnouncements(updated);
    setAnnouncementModalOpen(false);
    toast.success(
      editingAnnouncement
        ? "Announcement updated! Syncing to cloud..."
        : "New announcement posted! Syncing to cloud..."
    );

    // Save to Cloud MongoDB Atlas and Supabase
    try {
      await saveAnnouncementsAndNewsToCloud(updated, newsList);
      toast.success("Saved & synchronized with MongoDB Atlas cloud!");
    } catch (err) {
      console.warn("Cloud persistence error:", err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async () => {
    if (!deletingAnnouncement) return;
    deleteAnnouncement(deletingAnnouncement.id);
    const updated = getStoredAnnouncements();
    setAnnouncements(updated);
    toast.success("Announcement deleted. Syncing cloud...");
    setDeletingAnnouncement(null);

    try {
      await saveAnnouncementsAndNewsToCloud(updated, newsList);
      toast.success("Deleted from cloud.");
    } catch (err) {
      console.warn(err);
    }
  };

  // Open News Add
  const handleOpenAddNews = () => {
    setEditingNews(null);
    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setNewsFormData({
      id: `news-${Date.now().toString(36)}`,
      title: "",
      category: "Campus News",
      date: today.toISOString().split("T")[0],
      dateFormatted: formatted,
      author: "Foundation Secretariat",
      image: "/img/japanese.jpeg",
      summary: "",
      content: "",
      readTime: "3 min read",
      linkUrl: "/courses",
    });
    setNewsModalOpen(true);
  };

  // Open News Edit
  const handleOpenEditNews = (item: NewsArticleItem) => {
    setEditingNews(item);
    setNewsFormData({ ...item });
    setNewsModalOpen(true);
  };

  // Save News
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormData.title.trim()) {
      toast.error("Please enter an article title.");
      return;
    }
    if (!newsFormData.summary.trim()) {
      toast.error("Please enter a short summary excerpt.");
      return;
    }
    if (!newsFormData.content.trim()) {
      toast.error("Please enter full article content.");
      return;
    }

    const d = new Date(newsFormData.date);
    const dateFormatted = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const finalItem: NewsArticleItem = {
      ...newsFormData,
      dateFormatted: newsFormData.dateFormatted || dateFormatted,
    };

    saveNewsArticle(finalItem);
    const updated = getStoredNews();
    setNewsList(updated);
    setNewsModalOpen(false);
    toast.success(
      editingNews
        ? "News article updated! Syncing to cloud..."
        : "New story published! Syncing to cloud..."
    );

    // Save to Cloud MongoDB Atlas and Supabase
    try {
      await saveAnnouncementsAndNewsToCloud(announcements, updated);
      toast.success("Saved & synchronized with MongoDB Atlas cloud!");
    } catch (err) {
      console.warn("Cloud persistence error:", err);
    }
  };

  // Delete News
  const handleDeleteNews = async () => {
    if (!deletingNews) return;
    deleteNewsArticle(deletingNews.id);
    const updated = getStoredNews();
    setNewsList(updated);
    toast.success("News article deleted. Syncing cloud...");
    setDeletingNews(null);

    try {
      await saveAnnouncementsAndNewsToCloud(announcements, updated);
      toast.success("Deleted from cloud.");
    } catch (err) {
      console.warn(err);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    resetNewsAndAnnouncements();
    const defAnn = INITIAL_ANNOUNCEMENTS;
    const defNews = INITIAL_NEWS;
    setAnnouncements(defAnn);
    setNewsList(defNews);
    setResetConfirmOpen(false);
    toast.success("All announcements and news restored to defaults. Syncing cloud...");

    try {
      await saveAnnouncementsAndNewsToCloud(defAnn, defNews);
      toast.success("Cloud database restored to defaults!");
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#24312d] via-[#2d3f39] to-[#1a2522] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#b5623b]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#f2c5a8] border border-white/10 mb-3">
              <Sparkles size={14} className="text-[#f2c5a8]" />
              <span>Campus Public Relations & Notices</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Announcements & Latest News Management
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Post official circulars, exam schedules, and publish news updates directly to the Homepage ticker and Notice Board.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {subTab === "announcements" ? (
              <button
                onClick={handleOpenAddAnnouncement}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-[#b5623b] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-amber-500 hover:to-[#9e4e29] transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Post Announcement</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAddNews}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Publish News Article</span>
              </button>
            )}

            <button
              onClick={handleManualCloudSync}
              disabled={isCloudSyncing}
              title="Force sync latest changes with MongoDB Atlas cloud"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-stone-300 hover:bg-white/20 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw size={15} className={isCloudSyncing ? "animate-spin text-amber-300" : ""} />
              <span className="hidden sm:inline">
                {isCloudSyncing ? "Syncing..." : "Sync Cloud"}
              </span>
            </button>

            <button
              onClick={() => setResetConfirmOpen(true)}
              title="Reset to default items"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-stone-300 hover:bg-white/20 hover:text-white transition"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-stone-400 block font-medium">Total Announcements</span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-white">
              {announcements.length}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Pinned Notices</span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-amber-300">
              {announcements.filter((a) => a.isPinned).length}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Published News Stories</span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-white">
              {newsList.length}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Cloud Database Sync</span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-emerald-400 flex items-center gap-1.5">
              {isCloudSyncing ? (
                <>
                  <RefreshCw size={17} className="animate-spin text-amber-300" />
                  <span className="text-sm font-sans font-semibold text-amber-300">Syncing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-sans font-semibold">MongoDB Atlas</span>
                </>
              )}
            </span>
            {lastSyncedTime && !isCloudSyncing && (
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Last checked at {lastSyncedTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Control & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub-Tabs: Announcements vs News */}
        <div className="inline-flex p-1.5 bg-stone-200/60 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => {
              setSubTab("announcements");
              setSearchQuery("");
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "announcements"
                ? "bg-white text-[#1b2b25] shadow-xs font-extrabold"
                : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
            }`}
          >
            <Bell size={15} />
            <span>Announcements ({announcements.length})</span>
          </button>

          <button
            onClick={() => {
              setSubTab("news");
              setSearchQuery("");
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === "news"
                ? "bg-white text-[#1b2b25] shadow-xs font-extrabold"
                : "text-stone-600 hover:text-[#1b2b25] hover:bg-white/50"
            }`}
          >
            <Newspaper size={15} />
            <span>Latest News ({newsList.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder={
              subTab === "announcements"
                ? "Search announcements by title or category..."
                : "Search news articles by headline or content..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-800 outline-none transition focus:border-[#b5623b] focus:ring-1 focus:ring-[#b5623b]"
          />
        </div>
      </div>

      {/* ================= SUB-TAB 1: ANNOUNCEMENTS ================= */}
      {subTab === "announcements" && (
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-800">No Announcements Found</h3>
              <p className="text-xs text-stone-500 mt-1">
                Try adjusting your search query or click "Post Announcement" to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4.5 sm:p-5 shadow-xs hover:border-[#b5623b]/50 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#24312d] text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">
                        {new Date(ann.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-base font-bold font-serif leading-none mt-0.5">
                        {new Date(ann.date).getDate() || "16"}
                      </span>
                    </div>

                    {/* Announcement Image Thumbnail if uploaded */}
                    {ann.imageUrl && (
                      <div className="relative h-11 w-14 sm:h-12 sm:w-16 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs group">
                        <img
                          src={ann.imageUrl}
                          alt={ann.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-800">
                          {ann.category}
                        </span>
                        {ann.isNew && (
                          <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            NEW ⚡
                          </span>
                        )}
                        {ann.isPinned && (
                          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Pinned 📌
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-stone-900 leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {ann.description}
                      </p>

                      {ann.attachmentName && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#b5623b]">
                          <FileText size={13} />
                          <span>{ann.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleOpenEditAnnouncement(ann)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingAnnouncement(ann)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 2: LATEST NEWS ================= */}
      {subTab === "news" && (
        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-stone-300 mb-3" />
              <h3 className="text-base font-bold text-stone-800">No News Stories Found</h3>
              <p className="text-xs text-stone-500 mt-1">
                Click "Publish News Article" to post your first campus update.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((news) => (
                <div
                  key={news.id}
                  className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:border-[#b5623b]/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-100 mb-4">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/img/japanese.jpeg";
                        }}
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-[#b5623b] px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        {news.category}
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[10px] text-white">
                        {news.dateFormatted || news.date}
                      </span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-stone-900 leading-snug line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">
                      Author: <strong>{news.author || "PR Cell"}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditNews(news)}
                        className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingNews(news)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ANNOUNCEMENT ================= */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {editingAnnouncement ? "Edit Announcement" : "Post New Announcement"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter 2026 Batch Registrations Open"
                  value={annFormData.title}
                  onChange={(e) => setAnnFormData({ ...annFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Category Tag
                  </label>
                  <select
                    value={annFormData.category}
                    onChange={(e) =>
                      setAnnFormData({
                        ...annFormData,
                        category: e.target.value as AnnouncementItem["category"],
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs text-stone-900 outline-none focus:border-[#b5623b] bg-white"
                  >
                    {ANNOUNCEMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Date of Issue
                  </label>
                  <input
                    type="date"
                    value={annFormData.date}
                    onChange={(e) => setAnnFormData({ ...annFormData, date: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
              </div>

              {/* Toggles: isNew & isPinned */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={annFormData.isNew}
                    onChange={(e) => setAnnFormData({ ...annFormData, isNew: e.target.checked })}
                    className="rounded accent-rose-600 h-4 w-4"
                  />
                  <span>Mark as "NEW ⚡"</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={annFormData.isPinned}
                    onChange={(e) => setAnnFormData({ ...annFormData, isPinned: e.target.checked })}
                    className="rounded accent-[#b5623b] h-4 w-4"
                  />
                  <span>Pin to Ticker 📌</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Notice Details / Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter complete circular text or summary instructions..."
                  value={annFormData.description}
                  onChange={(e) => setAnnFormData({ ...annFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                />
              </div>

              {/* Image / Circular Poster Upload Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 block">
                    Announcement Poster / Image (Optional)
                  </label>
                  {annFormData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setAnnFormData((prev) => ({ ...prev, imageUrl: "", imageName: "" }))}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                {annFormData.imageUrl ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 flex items-center gap-4">
                    <div className="relative h-20 w-28 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-white">
                      <img
                        src={annFormData.imageUrl}
                        alt="Notice preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {annFormData.imageName || "Custom Notice Poster"}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready to sync with cloud
                      </p>
                      <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-[11px] font-bold text-stone-700 hover:bg-stone-50 cursor-pointer transition shadow-2xs">
                        <Upload size={12} />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAnnouncementImageFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#b5623b] bg-stone-50/60 hover:bg-stone-50 cursor-pointer transition group">
                    <div className="h-10 w-10 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-500 group-hover:text-[#b5623b] flex items-center justify-center transition mb-1.5">
                      {annImageUploading ? (
                        <RefreshCw size={18} className="animate-spin text-[#b5623b]" />
                      ) : (
                        <Upload size={18} />
                      )}
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      {annImageUploading ? "Optimizing image..." : "Upload Photo / Notice Poster"}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-0.5">
                      Select JPG, PNG, or WebP from your device (Auto-compressed)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={annImageUploading}
                      onChange={handleAnnouncementImageFile}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Action Link Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apply Now"
                    value={annFormData.linkText || ""}
                    onChange={(e) => setAnnFormData({ ...annFormData, linkText: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Action Target URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /admissions"
                    value={annFormData.linkUrl || ""}
                    onChange={(e) => setAnnFormData({ ...annFormData, linkUrl: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Attachment File Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PFLS-English.pdf"
                    value={annFormData.attachmentName || ""}
                    onChange={(e) => setAnnFormData({ ...annFormData, attachmentName: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Attachment URL or Path (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /docs/PFLS-English.pdf"
                    value={annFormData.attachmentUrl || ""}
                    onChange={(e) => setAnnFormData({ ...annFormData, attachmentUrl: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#b5623b] hover:bg-[#8f4726] px-5 py-2 text-xs font-bold text-white shadow-md transition"
                >
                  {editingAnnouncement ? "Save Changes" : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT NEWS ================= */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Newspaper size={16} />
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {editingNews ? "Edit News Story" : "Publish News Article"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewsModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Article Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foundation Inaugurates Digital Language Lab"
                  value={newsFormData.title}
                  onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    News Category
                  </label>
                  <select
                    value={newsFormData.category}
                    onChange={(e) =>
                      setNewsFormData({
                        ...newsFormData,
                        category: e.target.value as NewsArticleItem["category"],
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs text-stone-900 outline-none focus:border-[#b5623b] bg-white"
                  >
                    {NEWS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={newsFormData.date}
                    onChange={(e) => setNewsFormData({ ...newsFormData, date: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Author / Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Media Cell"
                    value={newsFormData.author || ""}
                    onChange={(e) => setNewsFormData({ ...newsFormData, author: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 min read"
                    value={newsFormData.readTime || ""}
                    onChange={(e) => setNewsFormData({ ...newsFormData, readTime: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>
              </div>

              {/* Cover Image Upload, Custom URL & Preset Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Article Cover Photo *
                </label>

                {/* Cover Image Preview */}
                {newsFormData.image && (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group">
                    <img
                      src={newsFormData.image}
                      alt="News preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/img/japanese.jpeg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-stone-800 text-xs font-bold cursor-pointer hover:bg-stone-50 shadow-md transition">
                        <Upload size={13} />
                        <span>Change Cover Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewsImageFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Upload Button from Device */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold cursor-pointer transition">
                    {newsImageUploading ? (
                      <RefreshCw size={14} className="animate-spin text-emerald-700" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>{newsImageUploading ? "Processing photo..." : "Upload Photo from Device (JPG/PNG)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={newsImageUploading}
                      onChange={handleNewsImageFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Custom URL or Quick Presets */}
                <div>
                  <label className="text-[11px] text-stone-500 font-medium block mb-1">
                    Or specify image path / external URL:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/img/japanese.jpeg or https://..."
                    value={newsFormData.image}
                    onChange={(e) => setNewsFormData({ ...newsFormData, image: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Quick Presets:</span>
                  {PRESET_NEWS_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setNewsFormData({ ...newsFormData, image: preset.url })}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition ${
                        newsFormData.image === preset.url
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Short Excerpt / Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="A concise 1-2 sentence lead paragraph shown on the card..."
                  value={newsFormData.summary}
                  onChange={(e) => setNewsFormData({ ...newsFormData, summary: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Story Content *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Full article content with paragraphs..."
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 outline-none focus:border-[#b5623b]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition"
                >
                  {editingNews ? "Save Changes" : "Publish News Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODALS ================= */}
      {deletingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Delete Announcement?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete <strong>"{deletingAnnouncement.title}"</strong>? It will immediately disappear from the homepage notice board.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingAnnouncement(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAnnouncement}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Delete News Article?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete <strong>"{deletingNews.title}"</strong>?
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingNews(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNews}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Reset to Defaults?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This will restore the Foundation's official default announcements and news stories.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white transition"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
