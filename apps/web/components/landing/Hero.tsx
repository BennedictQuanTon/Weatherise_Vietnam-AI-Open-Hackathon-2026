"use client";

import { ArrowRight, Github } from "lucide-react";
import { GITHUB_URL } from "./content";
import { IPadPro, IPhonePro, MacBookPro, Screen } from "./Devices";
import { MaskHeading, Reveal, useScrollProgress } from "./motion";

export function Laurel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 20c-2.5-2-4-5-4-8.5C3 8 4.4 5.2 6.5 3.5" />
      <path d="M17 20c2.5-2 4-5 4-8.5 0-3.5-1.4-6.3-3.5-8" />
      <path d="M4.2 9.5c1.6.2 2.6 1.2 2.8 2.8-1.6-.1-2.6-1.1-2.8-2.8zM4.5 14.5c1.5-.5 2.8 0 3.5 1.4-1.5.5-2.8 0-3.5-1.4zM5.6 5.8c1.3.6 1.9 1.8 1.6 3.3-1.3-.6-1.9-1.8-1.6-3.3z" />
      <path d="M19.8 9.5c-1.6.2-2.6 1.2-2.8 2.8 1.6-.1 2.6-1.1 2.8-2.8zM19.5 14.5c-1.5-.5-2.8 0-3.5 1.4 1.5.5 2.8 0 3.5-1.4zM18.4 5.8c-1.3.6-1.9 1.8-1.6 3.3 1.3-.6 1.9-1.8 1.6-3.3z" />
      <path d="M9 21h6" />
    </svg>
  );
}

/** Rise-and-settle on load, then a slight sideways drift as the hero scrolls away. */
function Float({ className, delay, from, spread, progress, children }: { className: string; delay: number; from: string; spread: number; progress: number; children: React.ReactNode }) {
  return (
    <div className={`absolute ${className}`} style={{ "--p": progress, "--spread": `${spread}px` } as React.CSSProperties}>
      <div className="md:[transform:translateX(calc(var(--p)*var(--spread)))]">
        <div className="l-device-in" style={{ animationDelay: `${delay}ms`, ["--from" as string]: from }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [ref, p] = useScrollProgress<HTMLDivElement>();
  return (
    <section id="top" className="relative overflow-x-clip bg-white pb-12 pt-14 md:pb-16 md:pt-20">
      <div className="l-container text-center">
        <MaskHeading
          as="h1"
          className="l-hero-title mx-auto max-w-[900px]"
          lines={["The best weather is the", <span key="b" className="l-gradient-text">weather you planned for</span>]}
        />
        <Reveal delay={200}>
          <p className="l-hero-sub mx-auto mt-5 max-w-[720px]">
            Weatherise turns forecasts from seven sources into clear go / no-go decisions for tourism, construction, and agriculture in Da Nang.
          </p>
        </Reveal>
        <Reveal delay={320}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 max-sm:flex-col max-sm:gap-3">
            <a href="/app" className="l-btn l-btn-lg l-btn-primary max-sm:w-full max-sm:max-w-[320px]">
              Try It Out <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="l-btn l-btn-outline max-sm:w-full max-sm:max-w-[320px]">
              <Github size={19} aria-hidden="true" /> View on GitHub
            </a>
          </div>
        </Reveal>
      </div>

      {/*
        Device trio composed like a product shot: all three stand on one baseline.
        iPad sits behind the MacBook's left edge, iPhone in front of its right edge, slightly forward.
        Positions are % of a 1185 × 645 stage (measured from Apple-style marketing compositions).
      */}
      <div ref={ref} className="l-container mt-14 max-sm:mt-6 md:mt-16">
        <div className="relative mx-auto aspect-[1185/650] max-w-[1185px] max-md:aspect-[1185/760]">
          <Float className="bottom-[5.4%] left-0 z-0 w-[26%]" delay={260} from="translate3d(-40px,30px,0)" spread={-26} progress={p}>
            <IPadPro>
              <Screen src="/landing/devices/ipad-agri.jpg" alt="Weatherise on iPad: the Hoa Vang rice co-op plan with a skip-irrigation verdict." width={1668} height={2388} />
            </IPadPro>
          </Float>
          <Float className="bottom-[2.6%] left-[9.6%] z-10 w-[86%]" delay={0} from="translate3d(0,40px,0)" spread={0} progress={p}>
            <MacBookPro>
              <Screen src="/landing/devices/mac-home.jpg" alt="Weatherise on a MacBook: the home dashboard over Da Nang's Dragon Bridge, with live weather and domain shortcuts." width={3024} height={1964} />
            </MacBookPro>
          </Float>
          <Float className="bottom-0 right-0 z-20 w-[19.2%]" delay={420} from="translate3d(40px,30px,0)" spread={26} progress={p}>
            <IPhonePro>
              <Screen src="/landing/devices/iphone-tourism.jpg" alt="Weatherise on iPhone: the 3-day Da Nang trip is Good to Go, with Friday's storm block moved indoors." width={1179} height={2556} top={5.6} />
            </IPhonePro>
          </Float>
        </div>
      </div>
    </section>
  );
}
