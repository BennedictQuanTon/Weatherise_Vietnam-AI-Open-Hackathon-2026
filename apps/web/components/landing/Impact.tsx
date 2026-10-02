"use client";

import { useId } from "react";
import { Check, Minus, X } from "lucide-react";
import { COMPARISON, RESULTS, type Support } from "./content";
import { Cite } from "./Competition";
import { MaskHeading, Odometer, Reveal, prefersReducedMotion, useInView, useStickyProgress } from "./motion";

function MobileResult({ res }: { res: (typeof RESULTS)[number] }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  return (
    <div ref={ref} className="l-card rounded-[28px] p-7">
      <div className="text-[56px] font-bold leading-none tracking-[-0.04em]">
        <Odometer value={res.display} active={inView} />
      </div>
      <h3 className="l-heading-sm mt-3">{res.title}</h3>
      <p className="l-body mt-1">{res.sub}</p>
      <div className="mt-6">
        <ResultVisual kind={res.visual} active={inView} />
      </div>
      <p className="mt-6 text-[14px] font-semibold tnum">{res.n}</p>
      <p className="l-caption mt-1">{res.method}</p>
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
  const [ref, progress] = useStickyProgress<HTMLDivElement>();
  const n = RESULTS.length;
  const t = Math.min(1, Math.max(0, (progress - 0.05) / 0.85));
  const idx = Math.min(n - 1, Math.round(t * (n - 1)));
  const r = RESULTS[idx];

  const jumpTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const target = el.getBoundingClientRect().top + window.scrollY + travel * (0.05 + (0.85 * i) / (n - 1));
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section id="impact" className="l-snow">
      {/* Desktop: pinned, scroll walks through the four results */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: "360vh" }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          <div className="l-container">
            <div className="text-center">
              <p className="l-eyebrow">Impact</p>
              <MaskHeading className="l-heading-lg mt-3" lines={["Validated on real", <span key="b" className="l-gradient-text">Da Nang data.</span>]} />
              <p className="l-caption mt-3">Measured by the team during the Vietnam AI Open Hackathon, June 2026.</p>
            </div>

            <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
              <div>
                <span className="text-[14px] font-semibold text-[color:var(--l-pewter)] tnum">
                  0{idx + 1} / 0{n}
                </span>
                <div className="mt-3 text-[clamp(72px,8vw,112px)] font-bold leading-none tracking-[-0.04em] text-[color:var(--l-ink)]">
                  <Odometer key={r.display} value={r.display} active />
                </div>
                <div key={`t-${idx}`} className="r-fade-in">
                  <h3 className="l-heading mt-5">{r.title}</h3>
                  <p className="l-sub mt-2 max-w-[440px]">{r.sub}</p>
                  <p className="mt-6 text-[15px] font-semibold text-[color:var(--l-ink)] tnum">{r.n}</p>
                  <p className="l-caption mt-1 max-w-[440px]">{r.method}</p>
                </div>
              </div>
              <div className="l-card relative flex min-h-[340px] items-center rounded-[32px] p-10">
                {RESULTS.map((res, i) => (
                  <div
                    key={res.title}
                    className="absolute inset-10 flex items-center"
                    style={{
                      opacity: i === idx ? 1 : 0,
                      transform: i === idx ? "none" : `translateY(${i < idx ? -20 : 20}px)`,
                      transition: `opacity 500ms ${EASE}, transform 700ms ${EASE}`,
                    }}
                    aria-hidden={i !== idx}
                  >
                    <ResultVisual kind={res.visual} active={i === idx} />
                  </div>
                ))}
              </div>
            </div>

            {/* Connector rail linking the four results: track runs between the column centers */}
            <div className="relative mx-auto mt-14 max-w-[960px]">
              <div className="absolute left-[12.5%] right-[12.5%] top-[7px] h-[2px] rounded-full bg-[rgba(208,208,211,0.5)]" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${t * 100}%`, background: "var(--l-brand)" }} />
                <span
                  className="absolute top-[-7px] h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_3px_#0088ff,0_0_18px_4px_rgba(0,136,255,0.35)]"
                  style={{ left: `${t * 100}%` }}
                />
              </div>
              <ol className="relative grid grid-cols-4">
                {RESULTS.map((res, i) => (
                  <li key={res.title} className="flex justify-center">
                    <button type="button" onClick={() => jumpTo(i)} className="l-link flex flex-col items-center" aria-current={i === idx ? "step" : undefined}>
                      <span className="h-4 w-4 rounded-full border-2 bg-white transition-colors duration-300" style={{ borderColor: i <= idx ? "#0088ff" : "#d0d0d3" }} />
                      <span className={`mt-3 whitespace-nowrap text-[14px] ${i === idx ? "font-semibold text-[color:var(--l-ink)]" : "text-[color:var(--l-smoke)]"}`}>{res.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="l-container l-section !pt-0 lg:!pt-0">
        {/* Mobile / tablet: stacked results */}
        <div className="pt-[clamp(80px,11vw,120px)] lg:hidden">
          <div className="text-center">
            <p className="l-eyebrow">Impact</p>
            <MaskHeading className="l-heading-lg mt-3" lines={["Validated on real", <span key="b" className="l-gradient-text">Da Nang data.</span>]} />
            <p className="l-caption mt-3">Measured by the team during the Vietnam AI Open Hackathon, June 2026.</p>
          </div>
          <ul className="mt-10 space-y-5">
            {RESULTS.map((res) => (
              <Reveal as="li" key={res.title}>
                <MobileResult res={res} />
              </Reveal>
            ))}
          </ul>
        </div>

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
