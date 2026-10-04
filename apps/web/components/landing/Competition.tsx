"use client";

import { COMPETITION_FACTS, ORGANIZERS } from "./content";
import { CountUp, MaskHeading, Odometer, Reveal } from "./motion";
import { Laurel } from "./Hero";
import TrailerPlayer from "./TrailerPlayer";

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

export function Competition() {
  const logos = [...ORGANIZERS, ...ORGANIZERS];
  return (
    <section id="competition" className="l-section l-snow">
      <div className="l-container">
        <div className="mx-auto max-w-[780px] text-center">
          <MaskHeading className="l-heading-lg" lines={["Built in four days at the", "Vietnam AI Open Hackathon."]} />
          <Reveal delay={200}>
            <p className="l-hero-sub mt-5">
              Hosted in Da Nang by DSAC with NVIDIA, Viettel, and Sovico Group, for teams building Generative, Agentic, and Physical AI.
              <Cite ids={[10, 11]} />
            </p>
          </Reveal>
        </div>
      </div>

      {/* Organizers: a quiet logo strip straight on the page, title centered above */}
      <Reveal delay={120} className="mt-14 md:mt-16">
        <p className="text-center text-[15px] font-semibold text-[color:var(--l-smoke)]">Organizers &amp; Partners</p>
        <div className="l-marquee-plain mt-8 overflow-hidden" aria-label="Organizers and partners">
          {/* Track painted snow-gray so the logos' white backgrounds multiply away */}
          <ul className="l-marquee-track items-center" style={{ background: "var(--l-snow)" }}>
            {logos.map((l, i) => (
              <li key={`${l.name}-${i}`} className="mx-12 flex h-24 shrink-0 items-center max-sm:mx-8 max-sm:h-16 max-sm:[&>img]:!h-[calc(var(--h)*0.72)] md:mx-16" aria-hidden={i >= ORGANIZERS.length}>
                <img
                  src={l.src}
                  alt={l.name}
                  className="w-auto object-contain mix-blend-multiply transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110"
                  style={{ height: l.h, ["--h" as string]: `${l.h}px` }}
                />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* Facts, Apple-style: small label, big figure, one line of context */}
      <div className="l-container mt-16 md:mt-20">
        <ul className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {COMPETITION_FACTS.map((f, i) => (
            <Reveal as="li" key={f.value} delay={i * 90} className={`px-4 text-center ${i > 0 ? "md:border-l md:border-[color:var(--l-silver)]" : ""}`}>
              <p className="text-[17px] font-semibold text-[color:var(--l-ink)]">{f.top}</p>
              <div className="mt-2 text-[clamp(48px,5.4vw,72px)] font-bold leading-none tracking-[-0.03em] text-[color:var(--l-ink)]">
                <Odometer value={f.value} />
              </div>
              <p className="mx-auto mt-3 max-w-[220px] text-[15px] leading-snug text-[color:var(--l-smoke)]">
                {f.label}
                <Cite ids={[f.ref]} />
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Award() {
  return (
    <section id="award" className="l-section bg-white">
      <div className="l-container text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 text-[color:var(--l-orange)]">
            <Laurel className="h-7 w-7" />
            <span className="text-[17px] font-semibold">Award</span>
            <Laurel className="h-7 w-7 -scale-x-100" />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <p className="l-shimmer mt-3 text-[clamp(88px,13vw,180px)] font-bold leading-[0.95] tracking-[-0.04em]">
            Top <CountUp value={10} from={100} duration={1800} />
          </p>
        </Reveal>
        <MaskHeading className="l-heading-lg mt-4" lines={["Finalist, Vietnam AI", "Open Hackathon 2026"]} />
        <Reveal delay={200}>
          <p className="l-hero-sub mx-auto mt-5 max-w-[680px]">
            Selected among Vietnam&apos;s most competitive AI teams, after four days of building on NVIDIA H200 infrastructure with mentors from NVIDIA,
            Viettel, and Sovico.
          </p>
        </Reveal>
        <Reveal scale delay={150} className="mt-14 md:mt-16">
          <TrailerPlayer />
        </Reveal>
      </div>
    </section>
  );
}
