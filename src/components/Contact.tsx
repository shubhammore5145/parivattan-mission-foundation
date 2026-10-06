import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Quote,
  Pause,
  Play,
} from "lucide-react";
import { createContact } from "@/lib/supabase-admin";
import { toast } from "sonner";

interface CommunitySlide {
  id: number;
  image: string;
  category: string;
  badge: string;
  tagline: string;
  subtext: string;
  quote: string;
  location: string;
}

const COMMUNITY_SLIDES: CommunitySlide[] = [
  {
    id: 1,
    image: "/img/slides/slide1.jpg",
    category: "Zero Hunger & Sustenance",
    badge: "SDG 2 • Food Security",
    tagline: "Nourishing Every Household with Care & Dignity",
    subtext: "Ensuring daily nutrition, wholesome meals, and foundational sustenance for children and families across rural settlements in Maharashtra.",
    quote: "“No child should ever have to study or sleep on an empty stomach.”",
    location: "Rural Dharashiv & Marathwada",
  },
  {
    id: 2,
    image: "/img/slides/slide2.jpg",
    category: "Universal Quality Education",
    badge: "SDG 4 • Inclusive Classrooms",
    tagline: "Every Child Deserves a Classroom and a Reason to Smile",
    subtext: "Unlocking bright futures through foundational literacy, inclusive care, and language learning pathways for rural youth.",
    quote: "“Education is the single most powerful tool to break generational poverty.”",
    location: "Grassroots Learning Centers",
  },
  {
    id: 3,
    image: "/img/slides/slide3.jpg",
    category: "Maternal & Child Well-Being",
    badge: "SDG 5 • Family Empowerment",
    tagline: "Empowering Mothers, Securing the Next Generation",
    subtext: "Grassroots community initiatives supporting mothers, adolescent daughters, and safe early childhood nurturing spaces.",
    quote: "“When you empower a mother, you uplift an entire village.”",
    location: "Community Hamlets & Outreaches",
  },
  {
    id: 4,
    image: "/img/slides/slide4.jpg",
    category: "Livelihood & Traditional Heritage",
    badge: "SDG 8 • Economic Self-Reliance",
    tagline: "Preserving Traditional Crafts, Building Self-Reliant Livelihoods",
    subtext: "Supporting rural artisans and families with vocational skill training, financial awareness, and sustainable market access.",
    quote: "“Dignity of labor and sustainable self-reliance for every rural household.”",
    location: "Rural Artisan Clusters",
  },
  {
    id: 5,
    image: "/img/slides/slide5.jpg",
    category: "Youth Potential & Skill Pathways",
    badge: "SDG 10 • Equal Opportunity",
    tagline: "Transforming Hardship into Opportunity Through Practical Education",
    subtext: "Creating accredited learning and career pathways so every child can step beyond hardship into a world of opportunities.",
    quote: "“Opening doors to higher education and promising global career paths.”",
    location: "Youth Career Initiatives",
  },
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Automatic slideshow transitions every 4.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % COMMUNITY_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + COMMUNITY_SLIDES.length) % COMMUNITY_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % COMMUNITY_SLIDES.length);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const combinedMessage = formData.phone
        ? `Phone: ${formData.phone}\n\n${formData.message}`
        : formData.message;

      await createContact({
        name: fullName,
        email: formData.email,
        subject: formData.subject,
        message: combinedMessage,
      });

      setIsSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      toast.success("Thank you! Your message has been sent successfully.");
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Mission Foundation! I would like to connect with your team regarding educational programs and initiatives."
  );

  return (
    <section
      id="contact"
      className="py-20 md:py-28 bg-[#fbfaf7] text-[#24312d] relative overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#b5623b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Top Automatic Slideshow with Prominent Taglines */}
        <div className="mb-16 sm:mb-20">
          {/* Section Sub-Header for Community Impact */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b5623b]/10 text-[#b5623b] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} className="text-[#b5623b]" />
              <span>Grassroots Voices & Ground Reality</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#24312d] tracking-tight">
              Moments of Hope & Transformation
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
              Every outreach initiative is rooted in real communities. Witness the lives touched, meals shared, and futures shaped through our mission.
            </p>
          </div>

          {/* Carousel Viewport Card */}
          <div
            className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden border border-stone-200 shadow-2xl bg-[#1c2623] group"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Ambient Glow Background Layer */}
            {COMMUNITY_SLIDES.map((slide, index) => (
              <div
                key={`bg-${slide.id}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-35" : "opacity-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover blur-3xl scale-125"
                />
              </div>
            ))}

            {/* Main Crisp Slide Images */}
            {COMMUNITY_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.tagline}
                  className="w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out scale-100 group-hover:scale-105"
                />

                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c2623]/80 via-transparent to-black/30" />

                {/* Top Badge Overlay */}
                <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-20 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-white/95 text-[#24312d] shadow-sm border border-white/60">
                    <Heart size={12} className="text-[#b5623b] fill-[#b5623b]" />
                    <span>{slide.badge}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md bg-black/45 text-stone-200 border border-white/20">
                    <MapPin size={11} className="text-[#e5a37f]" />
                    <span>{slide.location}</span>
                  </span>
                </div>

                {/* Top Right Counter Pill */}
                <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md bg-black/55 text-white border border-white/20">
                    {String(index + 1).padStart(2, "0")} / {String(COMMUNITY_SLIDES.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 sm:inset-x-6 flex justify-between z-30 pointer-events-none">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="pointer-events-auto w-11 h-11 rounded-full bg-black/50 hover:bg-[#b5623b] backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="pointer-events-auto w-11 h-11 rounded-full bg-black/50 hover:bg-[#b5623b] backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom Progress Bar inside image frame */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/30 z-30 overflow-hidden">
              <div
                className="h-full bg-[#e5a37f] transition-all duration-500 ease-out"
                style={{
                  width: `${((currentSlide + 1) / COMMUNITY_SLIDES.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* DEDICATED TAGLINE & NARRATIVE CARD DIRECTLY BELOW THE IMAGE */}
          <div className="mt-4 rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 md:p-9 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Left Column: Tagline, Narrative & Quote */}
              <div className="flex-1 space-y-4">
                {/* Meta Category Pill */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#b5623b] uppercase tracking-wider bg-[#b5623b]/10 px-3 py-1 rounded-full">
                    {COMMUNITY_SLIDES[currentSlide].category}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-600 font-semibold">
                    {COMMUNITY_SLIDES[currentSlide].badge}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-400">
                    {COMMUNITY_SLIDES[currentSlide].location}
                  </span>
                </div>

                {/* Big Bold Tagline */}
                <h3 className="text-2xl sm:text-3xl md:text-3xl font-serif font-bold text-[#24312d] leading-snug tracking-tight">
                  {COMMUNITY_SLIDES[currentSlide].tagline}
                </h3>

                {/* Subtext description */}
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {COMMUNITY_SLIDES[currentSlide].subtext}
                </p>

                {/* Quote Callout */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border-l-4 border-[#b5623b] flex items-start gap-3">
                  <Quote size={20} className="text-[#b5623b] shrink-0 rotate-180 mt-0.5" />
                  <p className="text-xs sm:text-sm font-serif italic text-[#783e25] leading-relaxed">
                    {COMMUNITY_SLIDES[currentSlide].quote}
                  </p>
                </div>
              </div>

              {/* Right Column: Slide Progress Status & Toggle */}
              <div className="md:w-56 shrink-0 flex flex-col justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>Story Progress</span>
                    <span className="font-mono text-[#b5623b] font-bold">
                      {currentSlide + 1} / {COMMUNITY_SLIDES.length}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#b5623b] h-full transition-all duration-300"
                      style={{
                        width: `${((currentSlide + 1) / COMMUNITY_SLIDES.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isAutoPlaying ? "bg-emerald-500 animate-pulse" : "bg-stone-400"}`} />
                    <span className="text-[11px] font-medium text-stone-600">
                      {isAutoPlaying ? "Auto-cycling every 4.5s" : "Paused on hover"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="w-full py-1.5 px-3 rounded-lg border border-stone-300 hover:border-[#b5623b] text-stone-700 hover:text-[#b5623b] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition bg-white cursor-pointer"
                  >
                    {isAutoPlaying ? (
                      <>
                        <Pause size={12} />
                        <span>Pause Slideshow</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        <span>Resume Slideshow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 5 Clickable Image Thumbnails Bar */}
            <div className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {COMMUNITY_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`group text-left p-2 rounded-2xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                    idx === currentSlide
                      ? "border-[#b5623b] bg-amber-50/60 shadow-sm ring-2 ring-[#b5623b]/25"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.tagline}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider truncate ${
                      idx === currentSlide ? "text-[#b5623b]" : "text-stone-500"
                    }`}>
                      Story {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-xs font-semibold text-stone-900 truncate">
                      {slide.category.split(" ")[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Antara Style Section Header Box */}
        <div className="mb-14">
          <div className="inline-block bg-[#b5623b] text-white px-8 py-4 shadow-lg rounded-tr-2xl rounded-bl-sm">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2c5a8] block mb-1">
              Get In Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white m-0">
              Contact Us
            </h2>
          </div>
          <p className="mt-4 text-stone-600 text-sm md:text-base max-w-2xl leading-relaxed">
            Meet us, reach out, and become an integral part of the grassroots educational movement transforming lives across communities.
          </p>
        </div>

        {/* Row 1: Location & Map (Left) + Contact Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-stretch">
          {/* Left Column: Location & Google Map */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#24312d] mb-2">
                Parivattan Mission Foundation
              </h3>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-5 font-sans">
                Near Shivaji Chowk, Barshi Road, Dharashiv (Osmanabad), Maharashtra, India – 413501
              </p>
            </div>

            {/* Embedded Responsive Interactive Map */}
            <div className="w-full h-[320px] md:h-[380px] rounded-3xl overflow-hidden border border-stone-200 shadow-md">
              <iframe
                title="Parivattan Mission Foundation Location Map"
                src="https://maps.google.com/maps?q=Dharashiv%2C%20Maharashtra%20413501&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Antara Style Contact Details Card */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="rounded-3xl bg-gradient-to-br from-[#24312d] to-[#1c2623] p-8 md:p-10 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
              {/* Subtle glows */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#b5623b]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#e5a37f]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#f2c5a8] text-xs font-bold uppercase tracking-wider border border-white/10">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Direct Communication Desk</span>
                </div>

                {/* Call Us */}
                <div>
                  <h4 className="text-lg font-serif font-bold text-[#f2c5a8] mb-2 flex items-center gap-2">
                    <Phone size={18} className="text-[#e5a37f]" />
                    <span>Call Us:</span>
                  </h4>
                  <div className="space-y-1">
                    <p>
                      <a
                        href="tel:+917820831901"
                        className="text-white hover:text-[#f2c5a8] text-xl md:text-2xl font-bold font-serif transition-colors"
                      >
                        +91 7820831901
                      </a>
                    </p>
                    <p>
                      <a
                        href="tel:+918767674251"
                        className="text-stone-300 hover:text-white text-sm font-semibold transition-colors"
                      >
                        +91 8767674251 (Helpline)
                      </a>
                    </p>
                  </div>
                  <div className="w-full h-px bg-white/15 my-4" />
                </div>

                {/* Write to us */}
                <div>
                  <h4 className="text-lg font-serif font-bold text-[#f2c5a8] mb-2 flex items-center gap-2">
                    <Mail size={18} className="text-[#e5a37f]" />
                    <span>Write to us:</span>
                  </h4>
                  <div className="space-y-1 text-sm md:text-base">
                    <p>
                      <a
                        href="mailto:contact@parivattan.org"
                        className="text-white hover:text-[#f2c5a8] font-medium transition-colors"
                      >
                        contact@parivattan.org
                      </a>
                    </p>
                    <p>
                      <a
                        href="mailto:info@parivattan.org"
                        className="text-stone-300 hover:text-white transition-colors"
                      >
                        info@parivattan.org
                      </a>
                    </p>
                  </div>
                  <div className="w-full h-px bg-white/15 my-4" />
                </div>

                {/* Domains & Office Hours */}
                <div className="space-y-2 text-xs md:text-sm text-stone-300">
                  <p className="flex items-center gap-2">
                    <Globe size={15} className="text-[#e5a37f] shrink-0" />
                    <span>
                      <strong>Our domains:</strong> parivattan.org
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={15} className="text-[#e5a37f] shrink-0" />
                    <span>
                      <strong>Office Hours:</strong> Mon – Sat: 9:00 AM – 6:30 PM (IST)
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick WhatsApp Connect */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone-300">
                  Need quick guidance?
                </span>
                <a
                  href={`https://wa.me/917820831901?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle size={15} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: "Drop us a message" Form (Left) + Child Feature Image (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#24312d] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-serif font-bold text-white tracking-wide">
                Drop us a message
              </h3>
              <span className="text-xs text-[#e5a37f] font-semibold">
                Quick Response Desk
              </span>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-b-2xl border-x border-b border-stone-200 shadow-md">
              {isSubmitted ? (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-[#24312d]">
                    Thank You!
                  </h4>
                  <p className="mt-2 text-stone-600 text-sm max-w-md">
                    Your message has been received with thanks. Our team will review your inquiry and get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 px-6 py-2.5 rounded-full bg-[#b5623b] text-white text-xs font-semibold hover:bg-[#954b2c] transition"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="First Name"
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all bg-stone-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Email Address"
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all bg-stone-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Subject"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Your Message"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b5623b] focus:border-[#b5623b] transition-all bg-stone-50/50 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-[#b5623b] hover:bg-[#954b2c] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Featured Visual Photograph with Child Image */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-xl h-full min-h-[480px] group bg-[#24312d]">
              <img
                src="/img/contact-child.png"
                alt="A child representing hope and transformation through Parivattan Mission Foundation"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Floating Top Badge */}
              <div className="absolute top-5 left-5 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-white/95 text-[#24312d] shadow-sm border border-white/60">
                  <Sparkles size={13} className="text-[#b5623b]" />
                  <span>Every Child Deserves Opportunity</span>
                </span>
              </div>

              {/* Gradient Overlay at Bottom with Inspiring Quote */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#24312d]/95 via-[#24312d]/50 to-transparent flex flex-col justify-end p-8 text-white z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5a37f] mb-1">
                  Grassroots Impact
                </span>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-white leading-snug">
                  Listening, Learning & Building Together.
                </h4>
                <p className="mt-2 text-xs md:text-sm text-stone-200 leading-relaxed font-light">
                  Every conversation begins with listening. Reach out to collaborate, volunteer, or partner on rural education pathways.
                </p>
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#f2c5a8]">
                  <span>Parivattan Mission Foundation</span>
                  <span className="font-semibold text-white">Direct Social Action</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Antara Style "Come Join Us" Banner */}
        <div className="mt-16 rounded-3xl bg-[#b5623b] p-8 md:p-12 text-white text-center shadow-lg relative overflow-hidden">
          <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">
            Come Join Us
          </h3>
          <p className="text-[#f2c5a8] text-sm md:text-base max-w-xl mx-auto mb-6">
            Join hands with us — Explore foreign language learning, tech education, and community volunteering.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/admissions"
              className="px-6 py-3 rounded-full bg-white text-[#24312d] hover:bg-stone-100 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-105"
            >
              Join Our Admissions 2026-27
            </Link>

            <a
              href={`https://wa.me/917820831901?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#24312d] text-white hover:bg-black font-bold text-xs uppercase tracking-wider border border-white/20 shadow-md transition-all duration-300 hover:scale-105"
            >
              Volunteer With Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
