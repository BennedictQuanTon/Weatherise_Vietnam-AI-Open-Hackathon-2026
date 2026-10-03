"use client";

import { ArrowRight } from "lucide-react";
import { ACCESSED, NAV_LINKS, REFERENCES } from "./content";
import { MaskHeading, Reveal } from "./motion";

export default function Closing() {
  return (
    <>
      <section className="l-section l-snow" aria-labelledby="cta-heading">
        <div className="l-container text-center">
          <MaskHeading id="cta-heading" className="l-hero-title mx-auto max-w-[900px]" lines={["Plan for the weather", <span key="b" className="l-gradient-text">you'll actually get.</span>]} />
          <Reveal delay={200}>
            <p className="l-hero-sub mx-auto mt-4 max-w-[560px]">Ask one question. Get a plan that already knows the rules.</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4 max-sm:flex-col max-sm:gap-3">
              <a href="/app" className="l-btn l-btn-lg l-btn-primary max-sm:w-full max-sm:max-w-[320px]">
                Try It Out <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href="/monitor" className="l-btn l-btn-outline max-sm:w-full max-sm:max-w-[320px]">
                Open the Pipeline Monitor
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16" aria-labelledby="references-heading">
        <div className="l-container">
          <h2 id="references-heading" className="text-[18px] font-semibold">
            References
          </h2>
          <p className="l-caption mt-1">{ACCESSED}.</p>
          <ol className="mt-6 grid gap-x-10 gap-y-3 md:grid-cols-2">
            {REFERENCES.map((r) => (
              <li key={r.id} id={`ref-${r.id}`} className="flex gap-3 scroll-mt-24 text-[14px] leading-[20px]">
                <span className="w-7 shrink-0 font-medium text-[color:var(--l-pewter)] tnum">[{r.id}]</span>
                <span className="text-[color:var(--l-smoke)]">
                  {r.source}.{" "}
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="l-link text-[color:var(--l-ink)] underline decoration-[color:var(--l-silver)] underline-offset-2 hover:decoration-[color:var(--l-blue)]">
                    “{r.title}”
                  </a>
                  , {r.date}.
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-[color:var(--l-mist)] bg-white py-10">
        <div className="l-container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" width={24} height={24} className="h-6 w-6" />
            <span className="text-[16px] font-semibold">Weatherise</span>
            <span className="l-caption ml-2">© 2026 Team Weatherise · Vietnam AI Open Hackathon 2026</span>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="l-link text-[14px] text-[color:var(--l-smoke)] hover:text-[color:var(--l-ink)]">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/app" className="l-link text-[14px] font-medium text-[color:var(--l-blue)]">
                  Try It Out
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
