"use client";

import { CalendarDays, Cpu, Layers3, Trophy } from "lucide-react";
import { COMPETITION_FACTS, ORGANIZERS } from "./content";
import { CountUp, MaskHeading, Odometer, Reveal, Spotlight } from "./motion";
import { Laurel } from "./Hero";

function Cite({ ids }: { ids: number[] }) {
  return (
    <sup className="ml-0.5 text-[11px] font-medium text-[color:var(--l-pewter)]">
      {ids.map((id) => (
        <a key={id} href={`#ref-${id}`} className="l-link hover:text-[color:var(--l-blue)]">
          [{id}]
        </a>
      ))}
    </sup>
  );
}
export { Cite };

const FACT_ICONS = [CalendarDays, Cpu, Layers3, Trophy];

export function Competition() {
  const logos = [...ORGANIZERS, ...ORGANIZERS];
  return (
    <section id="competition" className="l-section l-snow">
      <div className="l-container">
        <div className="mx-auto max-w-[780px] text-center">
          <MaskHeading className="l-heading-lg" lines={["Built in four days at the", "Vietnam AI Open Hackathon."]} />
          <Reveal delay={200}>
            <p className="l-sub mt-5">
              Hosted in Da Nang by DSAC with NVIDIA, Viettel, and Sovico Group, the hackathon gave selected teams enterprise GPU infrastructure and expert mentors
              to build Generative, Agentic, and Physical AI.
              <Cite ids={[10, 11]} />
            </p>
          </Reveal>
        </div>

        {/* Organizers & partners: large panel, logos in their own colors */}
        <Reveal delay={120} className="mt-14">
          <div className="l-card overflow-hidden rounded-[32px] pb-10 pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 px-8 md:px-10">
              <h3 className="l-heading-sm">Organizers &amp; Partners</h3>
              <span className="l-caption">Vietnam AI Open Hackathon 2026</span>
            </div>
            <div className="l-marquee-plain mt-8 overflow-hidden" aria-label="Organizers and partners">
              <ul className="l-marquee-track items-center">
                {logos.map((l, i) => (
                  <li key={`${l.name}-${i}`} className="mx-12 flex h-24 shrink-0 items-center md:mx-16" aria-hidden={i >= ORGANIZERS.length}>
                    <img
                      src={l.src}
                      alt={l.name}
                      className="w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110"
                      style={{ height: l.h }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Facts: one editorial strip with rolling digits */}
        <Reveal delay={150} className="mt-6">
          <Spotlight className="l-card overflow-hidden rounded-[32px]">
            <ul className="l-dots grid grid-cols-2 md:grid-cols-4">
              {COMPETITION_FACTS.map((f, i) => {
                const Icon = FACT_ICONS[i];
                return (
                  <li
                    key={f.value}
                    className={`group relative flex flex-col p-7 md:p-9 ${i > 0 ? "md:border-l" : ""} ${i % 2 ? "border-l md:border-l" : ""} ${
                      i > 1 ? "border-t md:border-t-0" : ""
                    } border-[color:var(--l-mist)]`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[color:var(--l-pewter)] tnum">0{i + 1}</span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--l-snow)] text-[color:var(--l-ink)] transition-colors duration-300 group-hover:bg-[color:var(--l-blue)] group-hover:text-white">
                        <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-10 text-[clamp(40px,4.6vw,60px)] font-semibold leading-none tracking-[-0.03em] text-[color:var(--l-ink)]">
                      <Odometer value={f.value} />
                    </div>
                    <span className="mt-4 h-[2px] w-8 origin-left rounded-full transition-transform duration-500 group-hover:scale-x-[3]" style={{ background: "var(--l-brand)" }} aria-hidden="true" />
                    <p className="l-body mt-4 !text-[15px] !leading-[22px]">
                      {f.label}
                      <Cite ids={[f.ref]} />
                    </p>
                  </li>
                );
              })}
            </ul>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}

export function Award() {
  return (
    <section id="award" className="l-section bg-white">
      <div className="l-container">
        <Reveal scale>
          <div className="relative overflow-hidden rounded-[40px] bg-[color:var(--l-snow)]">
            <div className="grid items-stretch md:grid-cols-[1.05fr_1fr]">
              <div className="relative min-h-[320px] overflow-hidden">
                <img
                  src="/landing/team/team-event.jpg"
                  alt="Team Weatherise with NVIDIA mentor Yash Gupta at the Vietnam AI Open Hackathon in Da Nang."
                  className="absolute inset-0 h-full w-full object-cover"
                  width={1613}
                  height={1210}
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-14">
                <div className="flex items-center gap-2 text-[color:var(--l-orange)]">
                  <Laurel className="h-6 w-6" />
                  <span className="l-eyebrow !text-[color:var(--l-orange)]">Award</span>
                </div>
                <div className="mt-4">
                  <span className="l-shimmer block text-[clamp(84px,12vw,148px)] font-bold leading-[0.95] tracking-[-0.03em]">
                    Top <CountUp value={10} from={100} duration={1800} />
                  </span>
                </div>
                <h2 className="l-heading mt-3">Finalist, Vietnam AI Open Hackathon 2026</h2>
                <p className="l-body mt-4 max-w-[460px]">
                  Weatherise was selected as a Top 10 Finalist among Vietnam&apos;s most competitive AI teams, after four days of building on NVIDIA H200
                  infrastructure with mentors from NVIDIA, Viettel, and Sovico.
                </p>
                <dl className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { v: 4, s: "", l: "Days of build" },
                    { v: 8, s: "×", l: "H200 GPUs" },
                    { v: 3, s: "", l: "Domains in one system" },
                  ].map((x) => (
                    <div key={x.l} className="flex flex-col-reverse">
                      <dt className="l-caption mt-2">{x.l}</dt>
                      <dd className="text-[32px] font-semibold leading-none tracking-[-0.02em]">
                        <CountUp value={x.v} suffix={x.s} duration={1200} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
