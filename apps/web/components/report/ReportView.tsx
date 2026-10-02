"use client";

import { AlertTriangle, OctagonAlert } from "lucide-react";
import type { AnswerCard, CalendarDay, Metric, Report, ReportSection, RuleTable } from "@/lib/report/types";
import { ChartGroup } from "./Chart";
import TripPlan from "./TripPlan";
import { Section, SectionHeader, StatusPill, ToneIcon, TONE_WORD } from "./primitives";

// Word joiners keep "06:30–10:30" from breaking across lines.
const keepTimes = (s: string) => s.replace(/(\d{2}:\d{2})\s?–\s?(\d{2}:\d{2})/g, "$1\u2060–\u2060$2");

function ReportHeader({ report }: { report: Report }) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--r-muted)]">
        <span className="tnum">As of {report.as_of}</span>
        <span aria-hidden="true">·</span>
        <span className="rounded-full bg-[color:var(--r-subtle)] px-2 py-0.5 font-medium text-[color:var(--r-fg2)] shadow-[var(--r-ring)]">Demo Data</span>
      </div>
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[color:var(--r-fg)] md:text-[32px] balance">{report.title}</h1>

      <blockquote className="border-l-2 border-[color:var(--r-hair)] pl-4 text-[15px] leading-relaxed text-[color:var(--r-fg2)]">
        “{report.prompt}”
      </blockquote>

      <div className="r-well grid gap-4 p-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {report.parsed.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-xs text-[color:var(--r-muted)]">{f.label}</dt>
              <dd className="text-[13px] font-medium text-[color:var(--r-fg)]">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div>
          <div className="mb-1.5 text-xs text-[color:var(--r-muted)]">Your Questions</div>
          <ol className="space-y-1.5">
            {report.asks.map((a, i) => (
              <li key={a} className="flex items-center gap-2 text-[13px] font-medium text-[color:var(--r-fg)]">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--r-bg)] px-1.5 font-mono text-[11px] text-[color:var(--r-fg2)] shadow-[var(--r-ring)]">
                  Q{i + 1}
                </span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </header>
  );
}

function VerdictCard({ report }: { report: Report }) {
  const v = report.verdict;
  return (
    <section
      data-tone={v.tone}
      aria-labelledby="verdict-heading"
      className="rounded-xl bg-[color:var(--r-bg)] p-5 shadow-[inset_3px_0_0_var(--tone),var(--r-ring)] md:p-6"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <StatusPill tone={v.tone} label={v.label} />
        <span className="text-xs text-[color:var(--r-muted)]">Answers Q1</span>
      </div>
      <h2 id="verdict-heading" className="text-[20px] font-semibold leading-snug tracking-[-0.03em] text-[color:var(--r-fg)] md:text-[22px] balance">
        {keepTimes(v.headline)}
      </h2>
      <ul className="mt-4 space-y-2">
        {v.reasons.map((r) => (
          <li key={r} className="flex gap-2.5 text-[14px] leading-relaxed text-[color:var(--r-fg2)]">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--r-fg2)]" />
            {keepTimes(r)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Alerts({ report }: { report: Report }) {
  if (!report.alerts.length) return null;
  return (
    <div className="space-y-2.5" role="list" aria-label="Weather alerts">
      {report.alerts.map((a) => {
        const Icon = a.tone === "alert" ? OctagonAlert : AlertTriangle;
        return (
          <div
            key={a.title}
            role="listitem"
            data-tone={a.tone}
            className="flex gap-3 rounded-xl bg-[color:var(--tone-soft)] p-4 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--tone)_28%,transparent)]"
          >
            <Icon size={18} className="mt-0.5 shrink-0 text-[color:var(--tone)]" aria-hidden="true" />
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-[14px] font-semibold text-[color:var(--tone)]">
                  <span className="sr-only">{a.tone === "alert" ? "Alert: " : "Caution: "}</span>
                  {a.title}
                </span>
                <span className="font-mono text-[13px] font-medium text-[color:var(--r-fg)] tnum">{a.window}</span>
              </div>
              <p className="text-[13px] leading-relaxed text-[color:var(--r-fg2)]">{keepTimes(a.detail)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricTile({ m }: { m: Metric }) {
  return (
    <div className="r-card flex min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-[color:var(--r-muted)]">{m.label}</span>
        <span title={TONE_WORD[m.tone]}>
          <ToneIcon tone={m.tone} />
          <span className="sr-only">{TONE_WORD[m.tone]}</span>
        </span>
      </div>
      <div className="text-[26px] font-semibold leading-none tracking-[-0.04em] text-[color:var(--r-fg)]">{m.value}</div>
      <div className="text-xs leading-snug text-[color:var(--r-muted)]">{m.context}</div>
    </div>
  );
}

function AnswerCards({ cards }: { cards: AnswerCard[] }) {
  return (
    <div className={`grid gap-3 ${cards.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
      {cards.map((c) => (
        <div key={c.kicker} data-tone={c.tone} className="r-well flex flex-col gap-3 p-4 shadow-[inset_0_2px_0_var(--tone)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-[color:var(--r-fg)]">{c.kicker}</span>
            <span className="text-xs text-[color:var(--r-muted)]">{c.title}</span>
          </div>
          <div className="flex items-start gap-2">
            <ToneIcon tone={c.tone} size={16} />
            <div className="text-[16px] font-semibold leading-snug tracking-[-0.02em] text-[color:var(--r-fg)] tnum">{c.value}</div>
          </div>
          <ul className="space-y-1.5">
            {c.points.map((p) => (
              <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-[color:var(--r-fg2)]">
                <span aria-hidden="true" className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--r-muted)]" />
                {keepTimes(p)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Rules({ table }: { table: RuleTable }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[560px] text-left text-[13px] tnum">
        <thead>
          <tr className="text-xs text-[color:var(--r-muted)]">
            {table.columns.map((c) => (
              <th key={c} scope="col" className="border-b border-[color:var(--r-hair)] py-2 pr-4 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-[color:var(--r-hair)] last:border-0">
              {row.map((c, j) =>
                c.tone && c.tone !== "neutral" ? (
                  <td key={j} data-tone={c.tone} className="py-2.5 pr-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[color:var(--tone)]">
                      <ToneIcon tone={c.tone} size={13} />
                      {c.text}
                    </span>
                  </td>
                ) : (
                  <td key={j} className={`py-2.5 pr-4 ${j === 0 ? "font-medium text-[color:var(--r-fg)]" : "text-[color:var(--r-fg2)]"}`}>
                    {c.text}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Calendar({ days }: { days: CalendarDay[] }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <ol className="grid min-w-[640px] grid-cols-7 gap-2">
        {days.map((d) => (
          <li key={d.day} className="r-well flex flex-col gap-2 p-2.5">
            <div>
              <div className="text-[13px] font-semibold text-[color:var(--r-fg)]">{d.day}</div>
              <div className="text-xs text-[color:var(--r-muted)] tnum">{d.date}</div>
            </div>
            <ul className="space-y-1">
              {d.items.map((it) => (
                <li
                  key={it.text}
                  data-tone={it.tone}
                  className={`rounded-md px-1.5 py-1 text-[11px] font-medium leading-tight tnum ${
                    it.tone === "neutral" ? "text-[color:var(--r-fg2)]" : "bg-[color:var(--tone-soft)] text-[color:var(--tone)]"
                  }`}
                >
                  {it.text}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionBody({
  section,
  activeDay,
  onDayChange,
}: {
  section: ReportSection;
  activeDay: number;
  onDayChange: (d: number) => void;
}) {
  switch (section.type) {
    case "trip":
      return (
        <Section>
          <SectionHeader title={section.title} ask={section.ask} />
          <TripPlan days={section.days} activeDay={activeDay} onDayChange={onDayChange} />
        </Section>
      );
    case "charts":
      return (
        <Section>
          <SectionHeader title={section.title} ask={section.ask} caption={section.caption} />
          <ChartGroup charts={section.charts} />
        </Section>
      );
    case "answers":
      return (
        <Section>
          <SectionHeader title={section.title} ask={section.ask} />
          <AnswerCards cards={section.cards} />
        </Section>
      );
    case "rules":
      return (
        <Section>
          <SectionHeader title={section.table.title} ask={section.ask} caption={section.table.caption} />
          <Rules table={section.table} />
        </Section>
      );
    case "notes":
      return (
        <Section>
          <SectionHeader title={section.title} ask={section.ask} />
          <ul className="grid gap-3 md:grid-cols-3">
            {section.notes.map((n) => (
              <li key={n.title} className="r-well p-4">
                <div className="text-[13px] font-semibold text-[color:var(--r-fg)]">{n.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--r-fg2)]">{keepTimes(n.body)}</p>
              </li>
            ))}
          </ul>
        </Section>
      );
    case "calendar":
      return (
        <Section>
          <SectionHeader title={section.title} ask={section.ask} caption={section.caption} />
          <Calendar days={section.days} />
        </Section>
      );
  }
}

function SourcesFooter({ report }: { report: Report }) {
  const s = report.sources;
  const total = s.pipeline.reduce((a, b) => a + b.ms, 0);
  return (
    <footer className="r-card space-y-4 p-5 text-[13px] md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">How This Was Answered</h2>
        <span className="text-xs text-[color:var(--r-muted)] tnum">
          {s.pipeline.length} steps · {(total / 1000).toFixed(1)}
          {" "}s
        </span>
      </div>
      <ol className="flex flex-wrap gap-x-1 gap-y-2">
        {s.pipeline.map((p, i) => (
          <li key={p.step} className="flex items-center gap-1">
            <span className="rounded-md bg-[color:var(--r-subtle)] px-2 py-1">
              <span className="font-medium text-[color:var(--r-fg)]">{p.step}</span>
              <span className="ml-1.5 text-xs text-[color:var(--r-muted)]">{p.agent}</span>
            </span>
            {i < s.pipeline.length - 1 && (
              <span aria-hidden="true" className="text-[color:var(--r-muted)]">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <dl className="grid gap-3 border-t border-[color:var(--r-hair)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-[color:var(--r-muted)]">Weather Sources</dt>
          <dd className="font-medium" translate="no">
            {s.weather.join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[color:var(--r-muted)]">Source Agreement</dt>
          <dd className="font-medium tnum">{Math.round(s.agreement * 100)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-[color:var(--r-muted)]">Reasoning Model</dt>
          <dd className="font-medium" translate="no">
            {s.model}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[color:var(--r-muted)]">Knowledge Base</dt>
          <dd className="font-medium" translate="no">
            {s.knowledge}
          </dd>
        </div>
      </dl>
    </footer>
  );
}

export default function ReportView({
  report,
  activeDay,
  onDayChange,
}: {
  report: Report;
  activeDay: number;
  onDayChange: (d: number) => void;
}) {
  return (
    <article className="r-fade-in space-y-5 pb-10">
      <ReportHeader report={report} />
      <VerdictCard report={report} />
      <Alerts report={report} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {report.metrics.map((m) => (
          <MetricTile key={m.label} m={m} />
        ))}
      </div>
      {report.sections.map((s, i) => (
        <SectionBody key={`${s.type}-${i}`} section={s} activeDay={activeDay} onDayChange={onDayChange} />
      ))}
      <SourcesFooter report={report} />
    </article>
  );
}
