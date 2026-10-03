"use client";

import { useId } from "react";
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
        <p className="l-caption mt-1">{res.method}</p>
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

function MaeVisual({ active }: { active: boolean }) {
  const bars = [
    { label: "Raw GFS / ECMWF", value: 100, color: "#d0d0d3" },
    { label: "Weatherise", value: 78.6, color: "#34c759" },
  ];
  return (
    <div className="w-full">
      <p className="l-caption">Error index · raw models = 100</p>
      <div className="mt-6 space-y-6">
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className="flex justify-between text-[15px]">
              <span className="font-medium text-[color:var(--l-ink)]">{b.label}</span>
              <span className="tnum text-[color:var(--l-smoke)]">{b.value}</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-[color:var(--l-snow)]">
              <div
                className="h-full rounded-full"
                style={{ width: active ? `${b.value}%` : "0%", background: b.color, transition: `width 1400ms ${EASE} ${i * 250}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 text-[15px] font-semibold text-[#1f8f3a]" style={{ opacity: active ? 1 : 0, transition: `opacity 600ms ${EASE} 1100ms` }}>
        <span className="inline-block h-[2px] w-6 rounded-full bg-[#34c759]" aria-hidden="true" /> 21.4% less error
      </div>
    </div>
  );
}

function LatencyVisual({ active }: { active: boolean }) {
  // Unique gradient id per instance: the desktop copy is display:none on mobile, and a
  // gradient defined inside a hidden SVG won't paint for another SVG that references it.
  const gid = `lat-${useId().replace(/:/g, "")}`;
  const max = 15;
  const frac = 9.37 / max;
  const r = 110;
  const len = Math.PI * r;
  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 260 150" className="w-full max-w-[340px]" aria-hidden="true">
        <path d="M20 135a110 110 0 0 1 220 0" fill="none" stroke="#f0f0f0" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M20 135a110 110 0 0 1 220 0"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={active ? len * (1 - frac) : len}
          style={{ transition: `stroke-dashoffset 1600ms ${EASE}` }}
        />
        <defs>
          <linearGradient id={gid} x1="0" x2="1">
            <stop offset="0" stopColor="#0088ff" />
            <stop offset="1" stopColor="#34c759" />
          </linearGradient>
        </defs>
        {[0, 5, 10, 15].map((v) => {
          const a = Math.PI * (1 - v / max);
          return (
            <text key={v} x={(130 + Math.cos(a) * 82).toFixed(2)} y={(135 - Math.sin(a) * 82 + 4).toFixed(2)} fontSize="11" textAnchor="middle" fill="#ababb0">
              {v}s
            </text>
          );
        })}
        <g style={{ transform: `rotate(${active ? -90 + 180 * frac : -90}deg)`, transformOrigin: "130px 135px", transition: `transform 1600ms ${EASE}` }}>
          <line x1="130" y1="135" x2="130" y2="74" stroke="#101010" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="130" cy="135" r="7" fill="#101010" />
      </svg>
      <p className="l-caption mt-2">Median wall-clock time per answer</p>
    </div>
  );
}

function RecoveryVisual({ active }: { active: boolean }) {
  const r = 80;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 200 200" className="h-[220px] w-[220px] -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r={r} fill="none" stroke="#f0f0f0" strokeWidth="16" />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="#0088ff"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={active ? c * (1 - 0.873) : c}
            style={{ transition: `stroke-dashoffset 1600ms ${EASE}` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[13px] text-[color:var(--l-smoke)]">filled</span>
          <span className="text-[30px] font-semibold tracking-[-0.02em] tnum">156 / 179</span>
        </div>
      </div>
      <p className="l-caption mt-3">Queries with missing details recovered automatically</p>
    </div>
  );
}

function SafetyVisual({ active }: { active: boolean }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[5px]" aria-hidden="true">
        {Array.from({ length: 212 }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-full"
            style={{
              background: active ? "#34c759" : "#f0f0f0",
              transform: active ? "scale(1)" : "scale(0.6)",
              transition: `background-color 300ms ease ${i * 5}ms, transform 500ms ${EASE} ${i * 5}ms`,
            }}
          />
        ))}
      </div>
      <p className="l-caption mt-5">Each dot is one adversarial prompt. Every one was blocked or answered safely.</p>
    </div>
  );
}

function ResultVisual({ kind, active }: { kind: (typeof RESULTS)[number]["visual"]; active: boolean }) {
  if (kind === "mae") return <MaeVisual active={active} />;
  if (kind === "latency") return <LatencyVisual active={active} />;
  if (kind === "recovery") return <RecoveryVisual active={active} />;
  return <SafetyVisual active={active} />;
}

export default function Impact() {
  return (
    <section id="impact" className="l-snow">
      <div className="l-container l-section">
        <div className="mx-auto max-w-[780px] text-center">
          <p className="l-eyebrow">Impact</p>
          <MaskHeading className="l-heading-lg mt-3" lines={["Validated on real", <span key="b" className="l-gradient-text">Da Nang data.</span>]} />
          <Reveal delay={150}>
            <p className="l-hero-sub mt-4">Measured by the team during the Vietnam AI Open Hackathon, June 2026.</p>
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
          <div className="l-card overflow-x-auto">
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
