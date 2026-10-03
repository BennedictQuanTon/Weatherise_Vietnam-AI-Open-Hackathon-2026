"use client";

import { PROBLEMS, type Problem } from "./content";
import { Cite } from "./Competition";
import { MaskHeading, Odometer, Reveal } from "./motion";
import ProblemArtView from "./ProblemArt";
import Slider from "./Slider";

const statText = (p: Problem) => `${p.stat.prefix ?? ""}${p.stat.value.toFixed(p.stat.decimals ?? 0)}${p.stat.suffix}`;

function ProblemSlide({ p, index, active }: { p: Problem; index: number; active: boolean }) {
  return (
    <article aria-labelledby={`problem-${p.id}`} className="flex h-full flex-col">
      {/* Visual: illustration + the number that matters */}
      <div className="grid items-center gap-6 px-6 pt-8 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-14 md:pt-12">
        <div className="mx-auto aspect-[480/420] w-full max-w-[520px]">
          <ProblemArtView art={p.art} active={active} />
        </div>
        <div className="text-center md:text-left">
          <span className="text-[15px] font-semibold text-[color:var(--l-pewter)] tnum">0{index + 1} / 0{PROBLEMS.length}</span>
          <div className={`mt-3 text-[clamp(60px,8vw,112px)] font-bold leading-none tracking-[-0.03em] ${p.accent === "orange" ? "text-[color:var(--l-orange)]" : "text-[color:var(--l-blue)]"}`}>
            <Odometer value={statText(p)} active={active} />
          </div>
          <p className="mx-auto mt-4 max-w-[400px] text-[18px] font-medium leading-snug text-[color:var(--l-ink)] md:mx-0">{p.statLabel}</p>
        </div>
      </div>

      {/* Caption, centered like a product slide */}
      <div className="mx-auto mt-auto max-w-[820px] px-6 pb-12 pt-4 text-center md:pb-14">
        <p className="l-eyebrow">{p.eyebrow}</p>
        <h3 id={`problem-${p.id}`} className="l-slide-title mt-2">
          {p.title}
        </h3>
        <p className="l-slide-sub mt-3">
          {p.body}
          <Cite ids={p.refs} />
        </p>
      </div>
    </article>
  );
}

export default function ProblemStory() {
  return (
    <section id="problem" className="l-section l-snow">
      <div className="l-container text-center">
        <MaskHeading className="l-heading-lg" lines={["Weather costs Da Nang", <span key="b" className="l-amber-text">more than a bad day.</span>]} />
        <Reveal delay={150}>
          <p className="l-hero-sub mx-auto mt-4 max-w-[620px]">Four problems stand between a forecast and a safe decision.</p>
        </Reveal>
      </div>
      <Reveal delay={150} className="mt-12 md:mt-16">
        <Slider count={PROBLEMS.length} label="The problem" render={(i, active) => <ProblemSlide p={PROBLEMS[i]} index={i} active={active} />} />
      </Reveal>
    </section>
  );
}
