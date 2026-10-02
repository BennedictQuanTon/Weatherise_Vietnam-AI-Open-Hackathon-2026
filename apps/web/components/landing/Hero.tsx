"use client";

import { ArrowRight } from "lucide-react";
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

/** Device enters on load (rise + settle), then drifts sideways as the hero scrolls away. */
function Device({
  className,
  delay,
  from,
  spread,
  progress,
  children,
}: {
  className: string;
  delay: number;
  from: string;
  spread: number;
  progress: number;
  children: React.ReactNode;
}) {
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

function MacBook() {
  return (
    <div>
      <div className="relative rounded-t-[18px] rounded-b-[6px] bg-[#0d0d0f] p-[1.6%] pb-[2%] shadow-[0_30px_60px_rgba(16,16,16,0.16)]">
        <div className="absolute left-1/2 top-0 z-10 h-[2.6%] w-[13%] -translate-x-1/2 rounded-b-[8px] bg-[#0d0d0f]" aria-hidden="true" />
        <div className="overflow-hidden rounded-[6px] bg-white">
          <img
            src="/landing/app-construction.jpg"
            alt="Weatherise on a laptop: move the concrete pour to Thursday and halt the crane on Friday afternoon."
            width={2880}
            height={1800}
            className="block h-auto w-full"
          />
        </div>
      </div>
      <div className="relative -mx-[6%] h-[1.7vw] max-h-[20px] min-h-[8px] rounded-b-[14px] rounded-t-[2px] bg-gradient-to-b from-[#e9eaec] via-[#d3d5d8] to-[#a9abae] shadow-[0_20px_30px_rgba(16,16,16,0.14)]">
        <div className="absolute left-1/2 top-0 h-[45%] w-[14%] -translate-x-1/2 rounded-b-[10px] bg-[#b8babd]" aria-hidden="true" />
      </div>
    </div>
  );
}

function IPad() {
  return (
    <div className="rounded-[26px] bg-[#1b1b1d] p-[4%] shadow-[0_24px_50px_rgba(16,16,16,0.18)]">
      <div className="overflow-hidden rounded-[16px] bg-white">
        <img
          src="/landing/app-agriculture-ipad.jpg"
          alt="Weatherise on a tablet: rice blast alert and the rain versus field-water chart for a Hoa Vang co-op."
          width={1640}
          height={2360}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

function IPhone() {
  return (
    <div className="rounded-[38px] bg-[#1b1b1d] p-[5%] shadow-[0_24px_50px_rgba(16,16,16,0.22)]">
      <div className="relative overflow-hidden rounded-[30px] bg-white">
        <div className="absolute left-1/2 top-[1.8%] z-10 h-[3%] w-[32%] -translate-x-1/2 rounded-full bg-[#1b1b1d]" aria-hidden="true" />
        <img
          src="/landing/app-tourism-mobile.jpg"
          alt="Weatherise on a phone: a day of the Da Nang trip with hourly rain and temperature and a local breakfast stop."
          width={780}
          height={1688}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

export default function Hero() {
  const [ref, p] = useScrollProgress<HTMLDivElement>();
  return (
    <section id="top" className="relative overflow-hidden bg-white pt-8 md:pt-12">
      {/* soft blue-green light behind the devices */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[4%] h-[560px] w-[1100px] -translate-x-1/2 rounded-full opacity-80 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(0,136,255,0.14), rgba(52,199,89,0.08) 55%, transparent 75%)" }}
      />

      <div ref={ref} className="l-container relative">
        {/* Device composite: iPad left, MacBook center, iPhone right */}
        <div className="relative mx-auto aspect-[16/8.6] max-w-[1000px]">
          <Device className="left-[1%] top-[16%] w-[25%]" delay={250} from="translate3d(-40px, 30px, 0)" spread={-36} progress={p}>
            <IPad />
          </Device>
          <Device className="left-[16%] top-0 z-10 w-[68%]" delay={0} from="translate3d(0, 40px, 0)" spread={0} progress={p}>
            <MacBook />
          </Device>
          <Device className="right-[2%] top-[22%] z-20 w-[16%]" delay={420} from="translate3d(40px, 30px, 0)" spread={36} progress={p}>
            <IPhone />
          </Device>
        </div>

        <div className="relative mx-auto mt-14 max-w-[1040px] text-center md:mt-16">
          <MaskHeading
            as="h1"
            className="l-display"
            lines={[
              "The best weather is",
              <>
                the weather you <span className="l-gradient-text">planned for.</span>
              </>,
            ]}
          />
          <Reveal delay={250}>
            <p className="mx-auto mt-6 max-w-[720px] text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-[color:var(--l-ink)]">
              Weatherise turns forecasts from seven sources into clear go / no-go decisions for tourism, construction, and agriculture in Da Nang.
            </p>
          </Reveal>
          <Reveal delay={380}>
            <a href="/app" className="l-btn l-btn-primary mt-9 !px-8 !py-3 !text-[18px]">
              Try It Out <ArrowRight size={18} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
      <div className="h-20 md:h-28" />
    </section>
  );
}
