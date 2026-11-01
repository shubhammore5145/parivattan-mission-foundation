import React, { useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ApplicationOpenSection from "../components/home/ApplicationOpenSection";
import NewsAndAnnouncementsSection from "../components/home/NewsAndAnnouncementsSection";
import Mission from "../components/Mission";
import OurProgrammes from "../components/home/OurProgrammes";
import HomeCoursesSection from "../components/HomeCoursesSection";
import StudentAchieversSection from "../components/home/StudentAchieversSection";
import ClassroomVideos from "../components/home/ClassroomVideos";
import WhyChooseUs from "../components/home/WhyChooseUs";
import OurTeamSection from "../components/team/OurTeamSection";
import HowItWorks from "../components/home/HowItWorks";
import HomeFaq from "../components/home/HomeFaq";
import Donate from "../components/Donate";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

const Index = () => {
  useEffect(() => {
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
    <div className="min-h-screen overflow-hidden bg-white">
      <Header />
      <Hero />
      <ApplicationOpenSection />
      <NewsAndAnnouncementsSection />
      <Mission />
      <OurProgrammes />
      <HomeCoursesSection />
      <StudentAchieversSection />
      <ClassroomVideos />
      <WhyChooseUs />
      <OurTeamSection />
      <HowItWorks />
      <HomeFaq />
      <Donate />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
