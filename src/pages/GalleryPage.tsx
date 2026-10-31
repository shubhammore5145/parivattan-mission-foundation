
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowUpRight,
  Download,
  Share2,
  Check,
  Camera,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface GalleryItem {
  id: string;
  title: string;
  category: "classrooms" | "community" | "volunteers";
  categoryLabel: string;
  src: string;
  location: string;
}

// Exactly the curated, non-removed photos (4, 5, 6, 8, 10, 12, 13, 14, 15, 16 removed)
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Japanese Language Classroom",
    category: "classrooms",
    categoryLabel: "Classroom",
    src: "/img/japanese.jpeg",
    location: "Parivattan Campus",
  },
  {
    id: "g2",
    title: "Grassroots Learning Mission",
    category: "community",
    categoryLabel: "Field Work",
    src: "/img/purpose.jpg",
    location: "Maharashtra Outreach",
  },
  {
    id: "g3",
    title: "Volunteer Book & Kit Drive",
    category: "volunteers",
    categoryLabel: "Volunteers",
    src: "/img/vol/vol1.jpg",
    location: "Village Learning Circle",
  },
  {
    id: "g4",
    title: "Youth Mentorship Circle",
    category: "volunteers",
    categoryLabel: "Mentorship",
    src: "/img/vol/vol2.jpg",
    location: "Field Center",
  },
  {
    id: "g5",
    title: "Foundation Community Gathering",
    category: "community",
    categoryLabel: "Community",
    src: "/img/hero.jpg",
    location: "Parivattan Hub",
  },
  {
    id: "g6",
    title: "Volunteer Team in Action",
    category: "volunteers",
    categoryLabel: "Volunteers",
    src: "/img/vol/vol3.jpg",
    location: "Outreach Drive",
  },
  {
    id: "g7",
    title: "Evening Batch Study Session",
    category: "classrooms",
    categoryLabel: "Classroom",
    src: "/img/silder3.jpg",
    location: "Language Lab",
  },
  {
    id: "g8",
    title: "Village Outreach & Awareness",
    category: "community",
    categoryLabel: "Field Work",
    src: "/img/silder4.jpg",
    location: "District Outreach",
  },
  {
    id: "g9",
    title: "Campus Interactive Session",
    category: "classrooms",
    categoryLabel: "Classroom",
    src: "/img/slides/slide-live-1.jpeg",
    location: "Parivattan Campus",
  },
  {
    id: "g10",
    title: "Youth Community Discussion",
    category: "community",
    categoryLabel: "Field Work",
    src: "/img/slides/slide-live-2.jpeg",
    location: "Learning Center",
  },
  {
    id: "g11",
    title: "Learning Materials & Resources",
    category: "classrooms",
    categoryLabel: "Classroom",
    src: "/img/slides/slide-live-3.jpeg",
    location: "Language Center",
  },
  {
    id: "g12",
    title: "Field Action & Community Outreach",
    category: "community",
    categoryLabel: "Field Work",
    src: "/img/slides/slide-live-4.jpeg",
    location: "Maharashtra Outreach",
  },
  {
    id: "g13",
    title: "Student Cohort Engagement",
    category: "classrooms",
    categoryLabel: "Classroom",
    src: "/img/slides/slide-live-5.jpeg",
    location: "Campus Classroom",
  },
  {
    id: "g14",
    title: "Volunteer Mentorship Drive",
    category: "volunteers",
    categoryLabel: "Volunteers",
    src: "/img/slides/slide-live-6.jpeg",
    location: "Mentorship Unit",
  },
  {
    id: "g15",
    title: "Student Group Collaboration",
    category: "classrooms",
    categoryLabel: "Classroom",
    src: "/img/slides/slide-live-7.jpeg",
    location: "Academic Center",
  },
  {
    id: "g16",
    title: "Grassroots Foundation Activity",
    category: "community",
    categoryLabel: "Field Work",
    src: "/img/slides/slide-live-8.jpeg",
    location: "Village Hub",
  },
];

type CategoryFilter = "all" | "classrooms" | "community" | "volunteers";

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "all") return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredPhotos]);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0));
  };

  const currentItem = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex flex-col font-sans selection:bg-[#b5623b]/20">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* MINIMALIST HERO HEADER */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-[11px] font-semibold text-stone-600 tracking-wide">
            <Camera size={13} className="text-[#b5623b]" />
            <span>Visual Archive</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1c1917] tracking-tight">
            Photo Gallery
          </h1>

          <p className="max-w-lg mx-auto text-stone-500 text-sm sm:text-base font-normal">
            Moments from our classrooms, volunteer drives, and grassroots educational work.
          </p>

          {/* FILTER PILLS */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-4">
            {[
              { id: "all", label: "All" },
              { id: "classrooms", label: "Classrooms" },
              { id: "community", label: "Field Work" },
              { id: "volunteers", label: "Volunteers" },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id as CategoryFilter)}
                  className={`rounded-full px-4 sm:px-5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-[#1c1917] text-white shadow-sm"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ULTRA-CLEAN VISUAL GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-3xl overflow-hidden bg-stone-200 aspect-[4/3] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Image with zoom effect */}
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Subtle dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                  {/* Top Category Badge */}
                  <div className="flex justify-end">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-medium tracking-tight">
                      {photo.categoryLabel}
                    </span>
                  </div>

                  {/* Bottom Minimal Info */}
                  <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-medium text-base leading-snug drop-shadow-sm flex items-center justify-between">
                      <span>{photo.title}</span>
                      <ArrowUpRight size={16} className="text-white/80 shrink-0 ml-2" />
                    </h3>
                    <p className="text-white/70 text-xs">{photo.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Minimal Share / Total info strip */}
          <div className="pt-10 flex items-center justify-between text-xs text-stone-400 border-t border-stone-200/80 mt-10">
            <span>{filteredPhotos.length} curated moments</span>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-[#b5623b] transition font-medium cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* MINIMAL FULLSCREEN LIGHTBOX MODAL */}
      {currentItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md"
            title="Previous (Left arrow)"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md"
            title="Next (Right arrow)"
          >
            <ChevronRight size={24} />
          </button>

          {/* Center Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentItem.src}
              alt={currentItem.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Clean bottom caption */}
            <div className="pt-4 text-center space-y-0.5">
              <h4 className="text-white font-medium text-sm sm:text-base">
                {currentItem.title}
              </h4>
              <p className="text-white/60 text-xs">
                {currentItem.location} • {lightboxIndex + 1} of {filteredPhotos.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
