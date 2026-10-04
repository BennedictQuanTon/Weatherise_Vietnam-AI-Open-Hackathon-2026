"use client";

import { Check, Minus, X } from "lucide-react";
import { COMPARISON, RESULTS, type Support } from "./content";
import { Cite } from "./Competition";
import { MaskHeading, Odometer, Reveal, useInView } from "./motion";

/** Apple-style tile: label, huge figure, one line, the chart, then the method in small print. */
function ResultCard({ res, index }: { res: (typeof RESULTS)[number]; index: number }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  return (
    <div ref={ref} className="flex h-full flex-col rounded-[32px] bg-white p-8 md:p-10">
      <p className="text-[17px] font-semibold" style={{ color: res.accent }}>
        {res.title}
      </p>
      <div className="mt-2 text-[clamp(56px,6.4vw,84px)] font-bold leading-none tracking-[-0.04em] text-[color:var(--l-ink)]">
        <Odometer value={res.display} active={inView} stagger={70 + index * 10} />
      </div>
      <p className="l-slide-sub mt-3 max-w-[420px]">{res.sub}</p>
      <div className="mt-8 flex flex-1 items-center">
        <ResultVisual kind={res.visual} active={inView} />
      </div>
      <div className="mt-8 border-t border-[color:var(--l-mist)] pt-5">
        <p className="text-[14px] font-semibold text-[color:var(--l-ink)] tnum">{res.n}</p>
        <p className="l-caption mt-1">
          {res.method}
          {"refs" in res && res.refs ? <Cite ids={res.refs} /> : null}
        </p>
      </div>
    </div>
  );
}

function SupportMark({ value, highlight }: { value: Support; highlight: boolean }) {
  if (value === "yes")
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--l-ink)]">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${highlight ? "bg-[color:var(--l-blue)] text-white" : "bg-[rgba(52,199,89,0.15)] text-[#1f8f3a]"}`}>
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        </span>
        Yes
      </span>
    );
  if (value === "partial")
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] text-[color:var(--l-smoke)]">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fff3e8] text-[color:var(--l-orange)]">
          <Minus size={14} strokeWidth={3} aria-hidden="true" />
        </span>
        Partial
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[14px] text-[color:var(--l-pewter)]">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--l-mist)]">
        <X size={14} strokeWidth={3} aria-hidden="true" />
      </span>
      No
    </span>
  );
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** 91%: 120 scenario dots, 109 agree with the experts. */
function AccuracyVisual({ active }: { active: boolean }) {
  const total = 120, agree = 109;
  return (
    <div className="w-full">
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[6px]" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-full"
            style={{
              background: active ? (i < agree ? "#0088ff" : "#d0d0d3") : "#f0f0f0",
              transform: active ? "scale(1)" : "scale(0.6)",
              transition: `background-color 300ms ease ${i * 6}ms, transform 500ms ${EASE} ${i * 6}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-[color:var(--l-smoke)]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0088ff]" aria-hidden="true" />109 match the experts</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#d0d0d3]" aria-hidden="true" />11 borderline calls</span>
      </div>
    </div>
  );
}

/** 4.8 s: a 0–15 s scale with the streamed verdict (2.6 s), the median (4.8 s), p95 (9 s), and doing it by hand. */
function TimeVisual({ active }: { active: boolean }) {
  const max = 15;
  const pos = (v: number) => `${(v / max) * 100}%`;
  const marks = [
    // On phones the first two labels sit tight, so they hang outward from their marks; centered from md up.
    { v: 2.6, label: "Verdict", color: "#34c759", align: "-translate-x-full pr-1 text-right md:-translate-x-1/2 md:pr-0 md:text-center" },
    { v: 4.8, label: "Full answer", short: "Answer", color: "#0088ff", align: "pl-1 text-left md:-translate-x-1/2 md:pl-0 md:text-center" },
    { v: 9, label: "p95", color: "#ababb0", align: "-translate-x-1/2 text-center" },
  ];
  return (
    <div className="w-full">
      <div className="relative h-4 rounded-full bg-[color:var(--l-snow)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: active ? pos(4.8) : "0%", background: "linear-gradient(90deg,#34c759,#0088ff)", transition: `width 1400ms ${EASE}` }}
        />
        {marks.map((m, i) => (
          <span
            key={m.label}
            className="absolute top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full"
            style={{ left: pos(m.v), background: m.color, opacity: active ? 1 : 0, transition: `opacity 400ms ease ${700 + i * 200}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="relative mt-3 h-12 text-[13px]">
        {marks.map((m, i) => (
          <span
            key={m.label}
            className={`absolute whitespace-nowrap ${m.align}`}
            style={{ left: pos(m.v), opacity: active ? 1 : 0, transition: `opacity 400ms ease ${700 + i * 200}ms` }}
          >
            <b className="block font-semibold text-[color:var(--l-ink)] tnum">{m.v} s</b>
            <span className={`text-[color:var(--l-smoke)] ${m.short ? "hidden md:inline" : ""}`}>{m.label}</span>
            {m.short && <span className="text-[color:var(--l-smoke)] md:hidden">{m.short}</span>}
          </span>
        ))}
        <span className="absolute right-0 text-right text-[color:var(--l-smoke)]">
          <b className="block font-semibold text-[color:var(--l-ink)]">15 s</b>
        </span>
      </div>
      <p className="mt-3 text-[14px] text-[color:var(--l-smoke)]">
        By hand: <b className="font-semibold text-[color:var(--l-ink)]">~12 minutes</b> across four weather apps.
      </p>
    </div>
  );
}

/** −12% / −22%: error index with raw GFS = 100. */
function ForecastVisual({ active }: { active: boolean }) {
  const bars = [
    { label: "Raw GFS", value: 100, color: "#d0d0d3" },
    { label: "Best single source", value: 88.6, color: "#ababb0" },
    { label: "Weatherise", value: 78, color: "#34c759" },
  ];
  return (
    <div className="w-full">
      <p className="l-caption">Forecast error index · raw GFS = 100</p>
      <div className="mt-5 space-y-5">
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className="flex justify-between text-[15px]">
              <span className="font-medium text-[color:var(--l-ink)]">{b.label}</span>
              <span className="tnum text-[color:var(--l-smoke)]">{b.value}</span>
            </div>
            <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-[color:var(--l-snow)]">
              <div className="h-full rounded-full" style={{ width: active ? `${b.value}%` : "0%", background: b.color, transition: `width 1400ms ${EASE} ${i * 220}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 0 unsafe calls: 212 red-team prompts, 199 blocked at input, 13 reached the rules and were vetoed. */
function SafetyVisual({ active }: { active: boolean }) {
  const total = 212, blocked = 199;
  return (
    <div className="w-full">
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[5px]" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-full"
            style={{
              background: active ? (i < blocked ? "#34c759" : "#0088ff") : "#f0f0f0",
              transform: active ? "scale(1)" : "scale(0.6)",
              transition: `background-color 300ms ease ${i * 5}ms, transform 500ms ${EASE} ${i * 5}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-[color:var(--l-smoke)]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#34c759]" aria-hidden="true" />199 blocked at input</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0088ff]" aria-hidden="true" />13 vetoed by the rule engine</span>
      </div>
    </div>
  );
}

function ResultVisual({ kind, active }: { kind: (typeof RESULTS)[number]["visual"]; active: boolean }) {
  if (kind === "accuracy") return <AccuracyVisual active={active} />;
  if (kind === "time") return <TimeVisual active={active} />;
  if (kind === "forecast") return <ForecastVisual active={active} />;
  return <SafetyVisual active={active} />;
}

export default function Impact() {
  return (
    <section id="impact" className="l-snow">
      <div className="l-container l-section">
        <div className="mx-auto max-w-[780px] text-center">
          <p className="l-eyebrow">Impact</p>
          <MaskHeading className="l-heading-lg mt-3" lines={["Built to deliver,", <span key="b" className="l-gradient-text">in seconds.</span>]} />
          <Reveal delay={150}>
            <p className="l-hero-sub mt-4">Hackathon targets, projected from the architecture and test runs on 8× NVIDIA H200.</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2">
          {RESULTS.map((res, i) => (
            <Reveal as="li" key={res.title} delay={(i % 2) * 120} className="h-full">
              <ResultCard res={res} index={i} />
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-24 text-center">
          <h3 className="l-heading">How Weatherise Compares</h3>
          <p className="l-body mx-auto mt-3 max-w-[600px]">Capabilities as publicly documented by each product. Partial means the capability exists but differs in scope.</p>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <ul className="space-y-3 md:hidden">
            {COMPARISON.rows.map((row) => (
              <li key={row.label} className="l-card p-5">
                <p className="text-[16px] font-semibold leading-snug text-[color:var(--l-ink)]">{row.label}</p>
                {row.note && <p className="l-caption mt-1">{row.note}</p>}
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                  {COMPARISON.columns.map((c, i) => (
                    <div key={c} className={`rounded-xl px-3 py-2 ${i === 0 ? "bg-[rgba(0,136,255,0.06)]" : "bg-[color:var(--l-snow)]"}`}>
                      <dt className={`text-[13px] font-semibold ${i === 0 ? "text-[color:var(--l-blue)]" : "text-[color:var(--l-smoke)]"}`}>{c}</dt>
                      <dd className="mt-1">
                        <SupportMark value={row.cells[i]} highlight={i === 0} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
          <div className="l-card overflow-x-auto max-md:hidden">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">Weatherise compared with Windy, Tomorrow.io and a general AI chatbot</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[34%] px-6 py-5 text-[14px] font-medium text-[color:var(--l-smoke)]">
                    Capability
                  </th>
                  {COMPARISON.columns.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={`px-5 py-5 text-[16px] font-semibold ${i === 0 ? "bg-[rgba(0,136,255,0.06)] text-[color:var(--l-blue)]" : "text-[color:var(--l-ink)]"}`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((row) => (
                  <tr key={row.label} className="border-t border-[color:var(--l-mist)]">
                    <th scope="row" className="px-6 py-4 align-top font-normal">
                      <span className="block text-[15px] font-medium leading-snug text-[color:var(--l-ink)]">{row.label}</span>
                      {row.note && <span className="l-caption mt-1 block">{row.note}</span>}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td key={i} className={`px-5 py-4 align-top ${i === 0 ? "bg-[rgba(0,136,255,0.06)]" : ""}`}>
                        <SupportMark value={cell} highlight={i === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="l-caption mt-4 text-center">
            Sources: Windy, Tomorrow.io product documentation; Vectara HHEM.
            <Cite ids={[12, 13, 14, 9]} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}
