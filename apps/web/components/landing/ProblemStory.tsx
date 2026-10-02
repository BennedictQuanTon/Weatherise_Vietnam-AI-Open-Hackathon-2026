"use client";

import { useEffect, useRef, useState } from "react";
import { PROBLEMS, type Problem } from "./content";
import { Cite } from "./Competition";
import { CountUp, MaskHeading, Reveal } from "./motion";
import ProblemArtView from "./ProblemArt";

const statClass = (p: Problem) => (p.accent === "orange" ? "l-amber-text" : "l-gradient-text");

function Chapter({ p, index, onActive }: { p: Problem; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          onActive(index);
          setSeen(true);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, onActive]);

  return (
    <article ref={ref} aria-labelledby={`problem-${p.id}`} className="flex min-h-[auto] flex-col justify-center py-10 lg:min-h-[86vh] lg:py-0">
      {/* Inline art on small screens */}
      <div className="mb-8 aspect-[480/420] w-full rounded-[28px] bg-white p-4 shadow-[var(--l-shadow)] lg:hidden">
        <ProblemArtView art={p.art} active={seen} />
      </div>
      <Reveal>
        <p className="l-eyebrow">{p.eyebrow}</p>
      </Reveal>
      <MaskHeading as="h3" id={`problem-${p.id}`} className="l-heading mt-3" lines={[p.title]} />
      <Reveal delay={150}>
        <div className={`mt-6 text-[clamp(64px,9vw,104px)] font-bold leading-none tracking-[-0.03em] ${statClass(p)}`}>
          <CountUp value={p.stat.value} decimals={p.stat.decimals ?? 0} prefix={p.stat.prefix} suffix={p.stat.suffix} duration={1800} />
        </div>
        <p className="mt-3 max-w-[460px] text-[18px] font-medium leading-snug text-[color:var(--l-ink)]">{p.statLabel}</p>
      </Reveal>
      <Reveal delay={260}>
        <p className="l-body mt-5 max-w-[500px]">
          {p.body}
          <Cite ids={p.refs} />
        </p>
      </Reveal>
    </article>
  );
}

export default function ProblemStory() {
  const [active, setActive] = useState(0);
  return (
    <section id="problem" className="l-section l-snow">
      <div className="l-container">
        <div className="mx-auto max-w-[820px] text-center">
          <Reveal>
            <p className="l-eyebrow">The Problem</p>
          </Reveal>
          <MaskHeading className="l-heading-lg mt-3" lines={["Weather costs Da Nang", <span key="b" className="l-amber-text">more than a bad day.</span>]} />
          <Reveal delay={200}>
            <p className="l-sub mx-auto mt-5 max-w-[620px]">
              Four problems stand between a forecast and a safe decision. Each one gets worse every storm season.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-x-16 lg:mt-16 lg:grid-cols-[1.05fr_1fr]">
          {/* Sticky stage (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-[12vh] flex h-[76vh] flex-col justify-center">
              <div className="relative aspect-[480/420] w-full rounded-[32px] bg-white p-6 shadow-[var(--l-shadow)]">
                {PROBLEMS.map((p, i) => (
                  <div
                    key={p.id}
                    className="absolute inset-6"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: active === i ? "none" : `translateY(${i < active ? -16 : 16}px)`,
                      transition: "opacity 600ms cubic-bezier(0.22,1,0.36,1), transform 800ms cubic-bezier(0.22,1,0.36,1)",
                    }}
                    aria-hidden={active !== i}
                  >
                    <ProblemArtView art={p.art} active={active === i} />
                  </div>
                ))}
              </div>
              {/* Chapter rail */}
              <ol className="mt-6 grid grid-cols-4 gap-3" aria-label="Problem chapters">
                {PROBLEMS.map((p, i) => (
                  <li key={p.id}>
                    <div className="h-1 overflow-hidden rounded-full bg-[rgba(208,208,211,0.6)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--l-ink)]"
                        style={{ width: i <= active ? "100%" : "0%", transition: "width 700ms cubic-bezier(0.22,1,0.36,1)" }}
                      />
                    </div>
                    <span className={`mt-2 block text-[13px] ${i === active ? "font-semibold text-[color:var(--l-ink)]" : "text-[color:var(--l-pewter)]"}`}>
                      0{i + 1}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div>
            {PROBLEMS.map((p, i) => (
              <Chapter key={p.id} p={p} index={i} onActive={setActive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
