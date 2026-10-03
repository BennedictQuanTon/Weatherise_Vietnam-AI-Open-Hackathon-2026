"use client";

import { ArrowRight } from "lucide-react";
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
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="/app" className="l-btn l-btn-lg l-btn-primary">
              Try It Out <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>

      {/* Device trio: iPad left, MacBook center, iPhone right (all real app screens) */}
      <div ref={ref} className="l-container mt-14 md:mt-16">
        <div className="relative mx-auto aspect-[1200/600] max-w-[1200px]">
          <Float className="left-0 top-[33%] z-0 w-[23%]" delay={260} from="translate3d(-40px,30px,0)" spread={-30} progress={p}>
            <IPadPro>
              <Screen src="/landing/devices/ipad-agri.jpg" alt="Weatherise on iPad: the Hoa Vang rice co-op plan with a skip-irrigation verdict." width={1668} height={2388} />
            </IPadPro>
          </Float>
          <Float className="left-[13%] top-0 z-10 w-[74%]" delay={0} from="translate3d(0,40px,0)" spread={0} progress={p}>
            <MacBookPro>
              <Screen src="/landing/devices/mac-home.jpg" alt="Weatherise on a MacBook: the home dashboard over Da Nang's Dragon Bridge, with live weather and domain shortcuts." width={3024} height={1964} />
            </MacBookPro>
          </Float>
          <Float className="right-[1%] top-[30%] z-20 w-[16%]" delay={420} from="translate3d(40px,30px,0)" spread={30} progress={p}>
            <IPhonePro>
              <Screen src="/landing/devices/iphone-home.jpg" alt="Weatherise on iPhone: the home screen asking about weather risk for your plans." width={1179} height={2556} top={5.6} />
            </IPhonePro>
          </Float>
        </div>
      </div>
    </section>
  );
}
