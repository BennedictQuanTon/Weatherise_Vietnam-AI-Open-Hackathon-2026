"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartSpec } from "@/lib/report/types";

const NB = " ";

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function formatValue(v: number, decimals = 0, fixed = false) {
  if (fixed) return v.toFixed(decimals);
  return Number.isInteger(v) ? String(v) : v.toFixed(Math.max(decimals, 1));
}

export function withUnit(v: number, unit: string, decimals = 0, fixed = false) {
  const n = formatValue(v, decimals, fixed);
  return unit === "%" ? `${n}%` : `${n}${NB}${unit}`;
}

function niceCeil(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

function barPath(x: number, w: number, top: number, base: number) {
  const h = base - top;
  if (h <= 0) return "";
  const r = Math.min(4, w / 2, h);
  const x1 = x + w;
  return `M${x},${base} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x1 - r},${top} Q${x1},${top} ${x1},${top + r} L${x1},${base} Z`;
}

export function Chart({ spec, height = 136 }: { spec: ChartSpec; height?: number }) {
  const [ref, measured] = useWidth();
  const [hover, setHover] = useState<number | null>(null);

  const width = measured || 640;
  const padL = 34;
  const padR = 10;
  const padT = 20;
  const padB = 22;
  const n = spec.points.length;
  const iw = Math.max(1, width - padL - padR);
  const ih = height - padT - padB;
  const slot = iw / n;
  const values = spec.points.map((p) => p.value);
  const lo = spec.min ?? 0;
  const hi = spec.max ?? niceCeil(Math.max(...values, spec.threshold?.value ?? 0));
  const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
  const y = (v: number) => padT + ih - ((clamp(v) - lo) / (hi - lo)) * ih;
  const xc = (i: number) => padL + (i + 0.5) * slot;
  const xo = (offset: number) => padL + offset * slot;
  const base = y(lo);
  const yTicks = [lo, lo + (hi - lo) / 2, hi];
  const peak = values.indexOf(Math.max(...values));
  const tickEvery = spec.tickEvery ?? 1;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const decimals = spec.decimals ?? 0;
  const fixed = spec.fixedDecimals ?? false;
  const dividerAt = new Map((spec.dividers ?? []).map((d) => [d.at, d.label]));

  const linePath = spec.points.map((p, i) => `${i === 0 ? "M" : "L"}${xc(i)},${y(p.value)}`).join(" ");
  const activeBand = hover !== null ? spec.bands?.find((b) => hover + 0.5 > b.from && hover + 0.5 < b.to) : undefined;

  const move = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const i = Math.floor((clientX - rect.left - padL) / slot);
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const summary = `${spec.title}, ${withUnit(Math.min(...values), spec.unit, decimals)} to ${withUnit(
    Math.max(...values),
    spec.unit,
    decimals,
  )}, peak at ${spec.points[peak].label}.`;

  const tipLeft = hover !== null ? Math.min(Math.max(xc(hover), 70), width - 70) : 0;

  return (
    <figure className="space-y-1.5">
      <figcaption className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium text-[color:var(--r-fg)]">
          {spec.title} <span className="font-normal text-[color:var(--r-muted)]">({spec.unit})</span>
        </span>
        {spec.threshold && (
          <span className="flex items-center gap-1.5 text-xs text-[color:var(--r-muted)]">
            <span aria-hidden="true" className="inline-block h-px w-4 bg-[color:var(--r-alert)]" />
            {spec.threshold.label}
          </span>
        )}
        {spec.targetRange && (
          <span className="flex items-center gap-1.5 text-xs text-[color:var(--r-muted)]">
            <span aria-hidden="true" className="inline-block h-2.5 w-4 rounded-sm bg-[color:var(--r-ok-band)] shadow-[inset_0_0_0_1px_var(--r-ok)]" />
            {spec.targetRange.label}
          </span>
        )}
      </figcaption>

      <div
        ref={ref}
        className="relative select-none r-focus rounded-md"
        tabIndex={0}
        role="img"
        aria-label={summary}
        onPointerMove={(e) => move(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover((h) => h ?? peak)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
          if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n) - 1));
        }}
      >
        <svg width={width} height={height} className="block overflow-visible" aria-hidden="true">
          {/* Shaded windows */}
          {spec.bands?.map((b, i) => (
            <g key={`band-${i}`} data-tone={b.tone}>
              <rect x={xo(b.from)} y={padT} width={xo(b.to) - xo(b.from)} height={ih} fill="var(--tone-band)" />
              <rect x={xo(b.from)} y={padT} width={2} height={ih} fill="var(--tone)" opacity={0.5} />
              <text x={xo(b.from) + 6} y={padT - 7} fontSize={11} fontWeight={500} fill="var(--r-fg2)">
                {b.label}
              </text>
            </g>
          ))}

          {/* Target range */}
          {spec.targetRange && (
            <rect
              x={padL}
              y={y(spec.targetRange.to)}
              width={iw}
              height={y(spec.targetRange.from) - y(spec.targetRange.to)}
              fill="var(--r-ok-band)"
            />
          )}

          {/* Grid + y ticks */}
          {yTicks.map((t) => (
            <g key={`y-${t}`}>
              <line x1={padL} x2={padL + iw} y1={y(t)} y2={y(t)} stroke="var(--r-grid)" strokeWidth={1} />
              <text x={padL - 6} y={y(t) + 3.5} fontSize={10} textAnchor="end" fill="var(--r-muted)" className="tnum">
                {formatValue(t)}
              </text>
            </g>
          ))}

          {/* Day dividers (labels ride the x-axis) */}
          {spec.dividers?.filter((d) => d.at > 0).map((d) => (
            <line key={`div-${d.at}`} x1={xo(d.at)} x2={xo(d.at)} y1={padT} y2={base} stroke="var(--r-hair)" strokeWidth={1} />
          ))}

          {/* Data */}
          {spec.kind === "bar"
            ? spec.points.map((p, i) => (
                <path
                  key={`bar-${i}`}
                  d={barPath(xc(i) - barW / 2, barW, y(p.value), base)}
                  fill="var(--r-series)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              ))
            : (
              <path d={linePath} fill="none" stroke="var(--r-ink-series)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )}

          {/* Threshold */}
          {spec.threshold && (
            <line
              x1={padL}
              x2={padL + iw}
              y1={y(spec.threshold.value)}
              y2={y(spec.threshold.value)}
              stroke="var(--r-alert)"
              strokeWidth={1}
            />
          )}

          {/* Peak label (selective direct label) */}
          {hover === null && (
            <text
              x={xc(peak)}
              y={y(values[peak]) - 6}
              fontSize={11}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--r-fg)"
              stroke="var(--r-bg)"
              strokeWidth={3}
              paintOrder="stroke"
              className="tnum"
            >
              {withUnit(values[peak], spec.unit, decimals, fixed)}
            </text>
          )}

          {/* X ticks */}
          {spec.points.map((p, i) =>
            dividerAt.has(i) ? (
              <text key={`x-${i}`} x={xc(i)} y={height - 6} fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--r-fg)">
                {dividerAt.get(i)}
              </text>
            ) : i % tickEvery === 0 ? (
              <text key={`x-${i}`} x={xc(i)} y={height - 6} fontSize={10} textAnchor="middle" fill="var(--r-muted)" className="tnum">
                {p.tick}
              </text>
            ) : null,
          )}

          {/* Hover crosshair */}
          {hover !== null && (
            <g>
              <line x1={xc(hover)} x2={xc(hover)} y1={padT} y2={base} stroke="var(--r-fg2)" strokeOpacity={0.35} strokeWidth={1} />
              {spec.kind === "line" && (
                <circle cx={xc(hover)} cy={y(values[hover])} r={4.5} fill="var(--r-ink-series)" stroke="var(--r-bg)" strokeWidth={2} />
              )}
            </g>
          )}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-[calc(100%+4px)] whitespace-nowrap rounded-md bg-[color:var(--r-bg)] px-2.5 py-1.5 text-xs shadow-[var(--r-ring-strong)]"
            style={{ left: tipLeft }}
          >
            <span className="font-semibold tnum text-[color:var(--r-fg)]">{withUnit(values[hover], spec.unit, decimals, fixed)}</span>
            <span className="ml-1.5 text-[color:var(--r-muted)]">{spec.points[hover].label}</span>
            {activeBand && <span className="ml-1.5 text-[color:var(--r-fg2)]">· {activeBand.label}</span>}
          </div>
        )}
      </div>
    </figure>
  );
}

export function ChartGroup({ charts, height }: { charts: ChartSpec[]; height?: number }) {
  const labels = charts[0]?.points.map((p) => p.label) ?? [];
  return (
    <div className="space-y-5">
      {charts.map((c) => (
        <Chart key={c.title} spec={c} height={height} />
      ))}
      <details className="group text-xs text-[color:var(--r-muted)]">
        <summary className="r-focus w-fit cursor-pointer rounded-sm hover:text-[color:var(--r-fg)]">Show Data Table</summary>
        <div className="mt-2 max-h-64 overflow-auto r-well">
          <table className="w-full text-left tnum">
            <thead className="sticky top-0 bg-[color:var(--r-subtle)]">
              <tr>
                <th className="px-3 py-1.5 font-medium">Time</th>
                {charts.map((c) => (
                  <th key={c.title} className="px-3 py-1.5 font-medium">
                    {c.title} ({c.unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((label, i) => (
                <tr key={label} className="border-t border-[color:var(--r-hair)] text-[color:var(--r-fg2)]">
                  <td className="px-3 py-1">{label}</td>
                  {charts.map((c) => (
                    <td key={c.title} className="px-3 py-1">
                      {formatValue(c.points[i].value, c.decimals, c.fixedDecimals)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
