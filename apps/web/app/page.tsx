import type { Metadata } from "next";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import { Award, Competition } from "@/components/landing/Competition";
import ProblemStory from "@/components/landing/ProblemStory";
import { Features, HowItWorks, Intro } from "@/components/landing/Product";
import Impact from "@/components/landing/Impact";
import Team from "@/components/landing/Team";
import Closing from "@/components/landing/Closing";

export const metadata: Metadata = {
  title: { absolute: "Weatherise · Weather Decisions for Da Nang" },
  description:
    "Top 10 Finalist at the Vietnam AI Open Hackathon 2026. Weatherise turns forecasts from seven sources into clear go / no-go decisions for tourism, construction, and agriculture.",
};

export default function LandingPage() {
  return (
    <div className="landing">
      <a href="#problem" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Skip to Content
      </a>
      <Nav />
      <main>
        <Hero />
        <Competition />
        <Award />
        <ProblemStory />
        <Intro />
        <Features />
        <HowItWorks />
        <Impact />
        <Team />
        <Closing />
      </main>
    </div>
  );
}
