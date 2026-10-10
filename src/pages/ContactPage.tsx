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
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createContact } from "@/lib/supabase-admin";
import { toast } from "sonner";

interface CommunitySlide {
  id: number;
  image: string;
  tagline: string;
}

const COMMUNITY_SLIDES: CommunitySlide[] = [
  {
    id: 1,
    image: "/img/slides/slide1.jpg",
    tagline: "Nourishing Every Household with Care & Dignity",
  },
  {
    id: 2,
    image: "/img/slides/slide2.jpg",
    tagline: "Every Child Deserves a Classroom and a Reason to Smile",
  },
  {
    id: 3,
    image: "/img/slides/slide3.jpg",
    tagline: "Empowering Mothers, Securing the Next Generation",
  },
  {
    id: 4,
    image: "/img/slides/slide4.jpg",
    tagline: "Preserving Traditional Crafts, Building Self-Reliant Livelihoods",
  },
  {
    id: 5,
    image: "/img/slides/slide5.jpg",
    tagline: "Transforming Hardship into Opportunity Through Practical Education",
  },
];

export default function ContactPage() {
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

  // Automatic slideshow transition every 4.5 seconds
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
      toast.error("Failed to send message. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    "Namaste Parivattan Mission Foundation! I would like to connect with your team regarding educational programs and initiatives."
  );

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d] selection:bg-[#b5623b]/20">
      <Header />

      <main className="pt-28 md:pt-36">
        {/* Top Contact Header & Community Photo Showcase */}
        <section className="pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Breadcrumb & Section Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                  <Link to="/" className="hover:text-[#b5623b] transition">
                    Home
                  </Link>
                  <ChevronRight size={13} className="text-stone-400" />
                  <span className="text-[#b5623b] font-semibold">Contact Us</span>
                </div>
                <div className="inline-block bg-[#b5623b] text-white px-7 py-3.5 shadow-md rounded-tr-2xl rounded-bl-sm">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#f2c5a8] block mb-0.5">
                    Get In Touch
                  </span>
                  <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-white m-0">
                    Contact Us
                  </h1>
                </div>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm max-w-md leading-relaxed font-sans">
                Connect directly with our Dharashiv administrative office or reach our grassroots educational initiative helpline.
              </p>
            </div>

            {/* Photo Showcase Viewport - Handles all photo ratios without cutting heads/bodies */}
            <div
              className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden bg-[#18221f] flex items-center justify-center border border-stone-200/60 shadow-xl group"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* Ambient Blurred Background Layer (smoothly fills any letterbox space) */}
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
                  <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                </div>
              ))}

              {/* Sharp Centered Slide Image (object-contain ensures complete, uncropped photo) */}
              {COMMUNITY_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 p-3 sm:p-5 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.tagline}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-700 select-none"
                  />
                </div>
              ))}

              {/* Slider Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-3 sm:inset-x-5 flex justify-between z-20 pointer-events-none">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-[#b5623b] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-[#b5623b] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Slide Counter Badge (Top Right) */}
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md bg-black/60 text-white border border-white/20">
                  {currentSlide + 1} / {COMMUNITY_SLIDES.length}
                </span>
              </div>
            </div>

            {/* Clean Tagline Bar directly below the photo */}
            <div className="mt-3.5 rounded-2xl bg-[#24312d] text-white py-3.5 px-5 sm:px-7 shadow-md border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <p className="font-serif italic text-sm sm:text-base text-stone-100 font-medium truncate">
                  “{COMMUNITY_SLIDES[currentSlide].tagline}”
                </p>
              </div>
              {/* Dots */}
              <div className="flex items-center gap-1.5 shrink-0">
                {COMMUNITY_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide ? "w-6 bg-[#e5a37f]" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to photo ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Antara Style: Main Contact Content */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Row 1: Location & Map (Left) + Contact Details (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 md:mb-24 items-stretch">
              {/* Left Column: Location & Google Map */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#24312d] mb-3">
                    Parivattan Mission Foundation
                  </h2>
                  <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6 font-sans">
                    RS Complex, S7, Tuljapur Naldurg Road, Devsinga (Tul), Tuljapur, Dharashiv (Osmanabad), Maharashtra, India – 413601
                  </p>
                </div>

                {/* Embedded Responsive Interactive Map */}
                <div className="w-full h-[340px] md:h-[400px] rounded-3xl overflow-hidden border border-stone-200 shadow-md">
                  <iframe
                    title="Parivattan Mission Foundation Location Map"
                    src="https://maps.google.com/maps?q=Tuljapur%2C%20Maharashtra%20413601&t=&z=14&ie=UTF8&iwloc=&output=embed"
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
                {/* Visual Header Graphic */}
                <div className="rounded-3xl bg-gradient-to-br from-[#24312d] to-[#1c2623] p-8 md:p-10 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
                  {/* Decorative ambient background glows */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#b5623b]/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#e5a37f]/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-6">
                    {/* Header Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#f2c5a8] text-xs font-bold uppercase tracking-wider border border-white/10">
                      <Sparkles size={13} className="text-amber-300" />
                      <span>Official Contact Desk</span>
                    </div>

                    {/* Call Us Section */}
                    <div>
                      <h3 className="text-lg md:text-xl font-serif font-bold text-[#f2c5a8] mb-2 flex items-center gap-2">
                        <Phone size={18} className="text-[#e5a37f]" />
                        <span>Call Us:</span>
                      </h3>
                      <div className="space-y-1">
                        <p>
                          <a
                            href="tel:+917820831901"
                            className="text-white hover:text-[#f2c5a8] text-lg md:text-2xl font-bold font-serif transition-colors"
                          >
                            +91 7820831901
                          </a>
                        </p>
                      </div>
                      <div className="w-full h-px bg-white/15 my-5" />
                    </div>

                    {/* Write to us Section */}
                    <div>
                      <h3 className="text-lg md:text-xl font-serif font-bold text-[#f2c5a8] mb-2 flex items-center gap-2">
                        <Mail size={18} className="text-[#e5a37f]" />
                        <span>Write to us:</span>
                      </h3>
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
                      <div className="w-full h-px bg-white/15 my-5" />
                    </div>

                    {/* Domains & Office Hours */}
                    <div className="space-y-3 text-xs md:text-sm text-stone-300">
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

                    {/* Social Media Links */}
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-[#f2c5a8] uppercase tracking-wider mb-2.5">
                        Connect On Social Media:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { icon: Linkedin, href: "https://www.linkedin.com/in/parivattan-mission-foundation-55b054376?utm_source=share_via&utm_content=profile&utm_medium=member_android", label: "LinkedIn" },
                          { icon: Facebook, href: "https://www.facebook.com/share/1GrmV9sNzE/", label: "Facebook" },
                          { icon: Instagram, href: "https://www.instagram.com/parivattan_mission_foundation", label: "Instagram" },
                          { icon: Twitter, href: "https://x.com/ParivattanMF", label: "Twitter" },
                          { icon: Youtube, href: "https://youtube.com/@parivattanmissionfoundation?si=2DO8HxNu_AgDC5l9", label: "YouTube" },
                        ].map((social) => (
                          <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#b5623b] border border-white/10 flex items-center justify-center transition-all duration-300 text-stone-300 hover:text-white hover:scale-105"
                          >
                            <social.icon size={16} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick WhatsApp Connect */}
                  <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-stone-300">
                      Need immediate assistance?
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

            {/* Row 2: Antara Style "Drop us a message" Form (Left) + Feature Image (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Column: Form */}
              <div className="lg:col-span-7">
                {/* Antara Style Form Heading Bar */}
                <div className="bg-[#24312d] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-serif font-bold text-white tracking-wide">
                    Drop us a message
                  </h3>
                  <span className="text-xs text-[#e5a37f] font-semibold">
                    We're here to listen & help
                  </span>
                </div>

                {/* Form Card */}
                <div className="bg-white p-6 md:p-9 rounded-b-2xl border-x border-b border-stone-200 shadow-md">
                  {isSubmitted ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center">
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
                      {/* Name Fields (2 Columns) */}
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

                      {/* Email & Phone Fields (2 Columns) */}
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

                      {/* Subject */}
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

                      {/* Message Textarea */}
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

                      {/* Submit Button */}
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
          </div>
        </section>

        {/* Antara Style: "Come Join Us" Banner Section */}
        <section className="bg-[#b5623b] py-16 text-white text-center relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Come Join Us
            </h2>
            <p className="text-[#f2c5a8] text-base md:text-lg max-w-2xl mx-auto mb-8 font-sans">
              Join hands with us — Explore foreign language learning, tech education, and community volunteering.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/admissions"
                className="px-8 py-3.5 rounded-full bg-white text-[#24312d] hover:bg-stone-100 font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 hover:scale-105"
              >
                Join Our Admissions 2026-27
              </Link>

              <a
                href={`https://wa.me/917820831901?text=${encodeURIComponent("Namaste! I would like to volunteer and collaborate with Parivattan Mission Foundation.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-full bg-[#24312d] text-white hover:bg-black font-bold text-xs uppercase tracking-wider border border-white/20 shadow-lg transition-all duration-300 hover:scale-105"
              >
                Volunteer With Us
              </a>
            </div>
          </div>
        </section>

        {/* Antara Style: Inspiring Quote Section */}
        <section className="bg-[#24312d] py-16 md:py-20 text-white text-center relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-3xl relative z-10">
            <p className="text-2xl md:text-4xl font-serif italic text-white/95 leading-relaxed">
              “The best solutions to complex problems often come from those closest to the issues.”
            </p>
            <div className="w-16 h-1 bg-[#e5a37f] mx-auto mt-6 rounded-full" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#e5a37f]">
              Parivattan Mission Foundation
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
