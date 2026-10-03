"use client";

import { Landmark, Mountain, ShoppingBasket, Ship, UtensilsCrossed, Waves } from "lucide-react";
import type { TripDay, TripStop } from "@/lib/report/types";
import { ChartGroup } from "./Chart";
import { ToneIcon } from "./primitives";

const NB = " ";

const KIND_ICON = {
  food: UtensilsCrossed,
  sight: Mountain,
  beach: Waves,
  market: ShoppingBasket,
  museum: Landmark,
  river: Ship,
} as const;

function Chip({ children, tone }: { children: React.ReactNode; tone?: "accent" | "caution" | "plain" }) {
  const cls =
    tone === "accent"
      ? "bg-[color:var(--r-accent-soft)] text-[color:var(--r-accent)]"
      : tone === "caution"
        ? "bg-[color:var(--r-caution-soft)] text-[color:var(--r-caution)]"
        : "bg-[color:var(--r-subtle)] text-[color:var(--r-fg2)]";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

function StopRow({ stop, index }: { stop: TripStop; index: number }) {
  const Icon = KIND_ICON[stop.kind];
  return (
    <li className="relative grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[56px_minmax(0,1fr)_auto]">
      <div className="pt-0.5 font-mono text-[13px] font-medium text-[color:var(--r-fg2)] tnum">{stop.time}</div>
      <div className="min-w-0 pb-5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--r-subtle)] text-[color:var(--r-fg2)] shadow-[var(--r-ring)]">
            <Icon size={14} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--r-fg)]">
                <span className="sr-only">Stop {index + 1}: </span>
                {stop.name}
              </span>
              <span className="text-xs text-[color:var(--r-muted)]">{stop.area}</span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--r-fg2)]">{stop.note}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stop.specialty && (
                <Chip tone="accent">
                  Try:{NB}
                  <span translate="no">{stop.specialty}</span>
                </Chip>
              )}
              <Chip>{stop.indoor ? "Indoor" : "Outdoor"}</Chip>
              {stop.moved && <Chip tone="caution">{stop.moved}</Chip>}
            </div>
          </div>
        </div>
      </div>
      <div className="col-start-2 -mt-3 mb-4 flex items-center gap-1.5 pl-[38px] text-[13px] text-[color:var(--r-fg2)] tnum sm:col-start-3 sm:mt-0 sm:mb-0 sm:pl-0 sm:pt-0.5">
        {!stop.indoor && <ToneIcon tone={stop.tone} size={13} />}
        {stop.forecast}
      </div>
    </li>
  );
}

export default function TripPlan({
  days,
  activeDay,
  onDayChange,
}: {
  days: TripDay[];
  activeDay: number;
  onDayChange: (day: number) => void;
}) {
  const current = days.find((d) => d.day === activeDay) ?? days[0];
  const specialties = current.stops.filter((s) => s.specialty);

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Trip days" className="grid grid-cols-3 gap-2">
        {days.map((d) => {
          const active = d.day === current.day;
          return (
            <button
              key={d.day}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`trip-day-${d.day}`}
              onClick={() => onDayChange(d.day)}
              className={`r-btn r-focus rounded-lg px-3 py-2.5 text-left ${
                active
                  ? "bg-[color:var(--r-fg)] text-[color:var(--r-bg)]"
                  : "bg-[color:var(--r-bg)] text-[color:var(--r-fg)] shadow-[var(--r-ring)] hover:bg-[color:var(--r-subtle)]"
              }`}
            >
              <div className="text-[13px] font-semibold">Day {d.day}</div>
              <div className={`text-xs ${active ? "opacity-80" : "text-[color:var(--r-muted)]"}`}>
                {d.date} · {d.condition}
              </div>
            </button>
          );
        })}
      </div>

      <div id={`trip-day-${current.day}`} role="tabpanel" className="space-y-6 r-fade-in" key={current.day}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 max-w-xl">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--r-fg)] balance">{current.title}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-[color:var(--r-fg2)]">{current.summary}</p>
          </div>
          <dl className="flex gap-4 text-[13px] tnum">
            <div>
              <dt className="text-xs text-[color:var(--r-muted)]">Temp</dt>
              <dd className="font-semibold">
                {current.low}–{current.high}
                {NB}°C
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--r-muted)]">Peak Rain</dt>
              <dd className="font-semibold">{current.peakRain}%</dd>
            </div>
            <div>
              <dt className="text-xs text-[color:var(--r-muted)]">UV</dt>
              <dd className="font-semibold">{current.uv}</dd>
            </div>
          </dl>
        </div>

        <div className="r-well p-4">
          <ChartGroup charts={current.charts} height={112} />
        </div>

        <ol className="pt-1" aria-label={`Day ${current.day} stops`}>
          {current.stops.map((s, i) => (
            <StopRow key={`${s.time}-${s.name}`} stop={s} index={i} />
          ))}
        </ol>

        {specialties.length > 0 && (
          <div className="rounded-lg bg-[color:var(--r-accent-soft)] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[color:var(--r-fg)]">Try Today</div>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {specialties.map((s) => (
                <li key={s.name} className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-medium text-[color:var(--r-fg)]" translate="no">
                    {s.specialty}
                  </span>
                  <span className="truncate text-[color:var(--r-fg2)]">
                    {s.time} · {s.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
