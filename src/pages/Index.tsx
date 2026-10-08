import React, { useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import OurImpact from "../components/home/OurImpact";
import Mission from "../components/Mission";
import OurProgrammes from "../components/home/OurProgrammes";
import HomeCoursesSection from "../components/HomeCoursesSection";
import ClassroomVideos from "../components/home/ClassroomVideos";
import WhyChooseUs from "../components/home/WhyChooseUs";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/Testimonials";
import HomeFaq from "../components/home/HomeFaq";
import Donate from "../components/Donate";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { logVisitor } from "@/lib/supabase-admin";

const Index = () => {
  useEffect(() => {
    // Log a visitor once per session
    const sessionKey = "parivattan_visitor_session";
    const existingSession = sessionStorage.getItem(sessionKey);
    const sessionId = existingSession || crypto.randomUUID();

    if (!existingSession) {
      sessionStorage.setItem(sessionKey, sessionId);
      logVisitor({
        session_id: sessionId,
        path: window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      }).catch((err) => console.error("Failed to log visitor", err));
    }

    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaf7]">
      <Header />
      <Hero />
      <OurImpact />
      <Mission />
      <OurProgrammes />
      <HomeCoursesSection />
      <ClassroomVideos />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <HomeFaq />
      <Donate />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
