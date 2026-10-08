import { useEffect } from "react";
import { ArrowRight, BookOpen, Camera, CheckCircle2, Clock3, Newspaper, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OurWork from "@/components/OurWork";
import OurTeamSection from "@/components/team/OurTeamSection";

const initiatives = [
  { title: "Parivattan Overseas Schools", text: "Supportive programs that help learners prepare for IELTS, TOEFL and PTE with confidence.", tags: ["IELTS", "TOEFL", "PTE"] },
  { title: "Parivattan Foreign Language School", text: "Foreign language learning for a more connected and opportunity-rich future.", tags: ["Japanese", "German", "English", "French", "Chinese", "Korean"] },
  { title: "Parivattan Technology School", text: "Practical technology education designed to move young people into meaningful work.", tags: ["Data Science", "Python", "Full Stack Development"] },
];

const timeline = [
  ["2020", "Parivattan begins with a simple belief: education should expand the choices available to every person."],
  ["2021", "Community learning circles and volunteer-led support programs take root."],
  ["2022", "Language learning opens new pathways for students and first-generation learners."],
  ["2023", "Technology programs grow, connecting practical skills with real opportunities."],
  ["2024", "Our work reaches more communities through partners, campaigns and local action."],
  ["2025", "A growing network of learners, volunteers and supporters strengthens the movement."],
  ["2026", "We are building a larger, more inclusive learning ecosystem for the years ahead."],
];

const gallery = ["/img/hero.jpg", "/img/silder1.jpg", "/img/purpose.jpg", "/img/silder3.jpg", "/img/silder4.jpg", "/img/japanese.jpeg"];

export default function ContentPage() {
  const path = useLocation().pathname;
  const isAbout = path === "/about" || path === "/team" || path === "/our-team";
  const isInitiatives = path === "/initiatives";
  const isGallery = path === "/gallery";
  const isBlogs = path === "/blogs";

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    const revealElements = document.querySelectorAll(".animate-on-scroll");
    revealElements.forEach((element) => revealObserver.observe(element));

    return () => revealObserver.disconnect();
  }, [path]);

  return <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]"><Header /><main className="pt-28">
    {isInitiatives && <PageIntro eyebrow="Learning that travels" title="Our initiatives" copy="Three learning schools, one shared aim: make education practical, accessible and connected to a person’s next possibility." />}
    {isAbout && <>
      <PageIntro eyebrow="About Parivattan Mission Foundation" title="People-powered change starts with listening & action." copy="We work alongside communities to make education, international languages, technology skills, and human dignity accessible to every learner." />
      <OurTeamSection />
    </>}
    {isInitiatives && <section className="page-section !pt-4 !pb-16 md:!pt-6"><div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">{initiatives.map((item, index) => <article id={["overseas", "languages", "technology"][index]} className="min-h-[360px] scroll-mt-28 rounded-3xl bg-white p-7 shadow-[0_14px_35px_-28px_rgba(36,49,45,0.7)] ring-1 ring-[#e7e5de] transition-transform duration-300 hover:-translate-y-1" key={item.title}><span className="text-sm font-semibold text-[#b5623b]">0{index + 1}</span><h2 className="mt-10 text-3xl font-serif leading-tight">{item.title}</h2><p className="mt-4 text-[#65706a]">{item.text}</p><div className="mt-7 flex flex-wrap gap-2">{item.tags.map(tag => <span className="rounded-full bg-[#eef0e8] px-3 py-1 text-sm" key={tag}>{tag}</span>)}</div></article>)}</div></section>}
    {path === "/campaigns" && <><PageIntro eyebrow="Active campaigns" title="Small actions, lasting ripples." copy="Join the live efforts helping learners find the confidence, tools and support to keep moving forward." /><section className="page-section"><div className="grid gap-6 md:grid-cols-2"><Campaign title="Sponsor a learning kit" detail="Help put books, internet access and mentoring within reach for a learner." amount="₹1,500" /><Campaign title="Sponsor a month of classes" detail="Keep our community-led classrooms open and welcoming." amount="₹3,000" /></div></section></>}
    {path === "/story" && <><PageIntro eyebrow="Our story" title="A timeline of showing up." copy="The work has grown, but the reason remains close to the ground: listen, learn and build with people." /><section className="page-section"><div className="space-y-5">{timeline.map(([year, text]) => <div className="grid gap-3 border-l-2 border-[#d7b49e] pl-6 md:grid-cols-[120px_1fr]" key={year}><strong className="text-2xl text-[#b5623b]">{year}</strong><p className="max-w-2xl text-lg text-[#65706a]">{text}</p></div>)}</div></section><section className="page-section border-t border-[#e5e1d8]"><SectionHeading eyebrow="Newspaper cuts" title="Stories worth keeping." /><div className="grid gap-5 md:grid-cols-3">{["Learning belongs everywhere", "A classroom without walls", "The people who keep showing up"].map((title, i) => <article className="rotate-[-1deg] bg-[#f1eadb] p-6 shadow-sm" key={title}><Newspaper className="text-[#b5623b]" /><p className="mt-10 text-xl font-serif">{title}</p><p className="mt-4 text-sm text-[#65706a]">Parivattan Journal · {2023 + i}</p></article>)}</div></section><div className="border-t border-[#e5e1d8]"><OurWork /></div></>}
    {isGallery && <><PageIntro eyebrow="Gallery" title="Moments from the movement." copy="A visual record of classrooms, conversations and the people who make this work possible." /><section className="page-section"><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{gallery.map((image, i) => <img key={image} src={image} alt={`Parivattan community moment ${i + 1}`} className={`h-64 w-full rounded-3xl object-cover ${i === 1 ? "md:row-span-2 md:h-full" : ""}`} />)}</div></section></>}
    {isBlogs && <><PageIntro eyebrow="Parivattan Blogs" title="Notes from the field." copy="Ideas, lessons and honest reflections from the work of building more open pathways through education." /><section className="page-section"><div className="grid gap-5 md:grid-cols-3">{["What does opportunity look like?", "Why language learning changes the room", "The quiet power of a prepared mentor"].map((title, i) => <article className="rounded-3xl bg-white p-7 shadow-sm" key={title}><BookOpen className="text-[#b5623b]" /><p className="mt-12 text-2xl font-serif">{title}</p><p className="mt-4 text-sm text-[#65706a]">By the Parivattan team · 6 min read</p><Link className="mt-6 inline-flex items-center gap-2 font-semibold text-[#b5623b]" to="/contact">Read the story <ArrowRight size={16} /></Link></article>)}</div></section></>}
  </main><Footer /></div>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <section className="page-section !pb-8 !pt-14 md:!pb-10 md:!pt-20"><p className="eyebrow">{eyebrow}</p><h1 className="mt-4 max-w-4xl text-5xl font-serif leading-[1.05] md:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-xl text-[#65706a]">{copy}</p></section>; }
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="mb-10"><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 text-4xl font-serif">{title}</h2></div>; }
function Campaign({ title, detail, amount }: { title: string; detail: string; amount: string }) { return <article className="rounded-3xl bg-[#24312d] p-8 text-white"><CheckCircle2 className="text-[#e5a37f]" /><h2 className="mt-12 text-3xl font-serif">{title}</h2><p className="mt-4 text-white/70">{detail}</p><Link to="/donate" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e5a37f] px-5 py-3 font-semibold text-[#24312d]">Support for {amount} <ArrowRight size={16} /></Link></article>; }
