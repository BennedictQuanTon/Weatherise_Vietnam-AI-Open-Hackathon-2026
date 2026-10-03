"use client";

import { AlertTriangle, Check, Info, OctagonAlert } from "lucide-react";
import type { Tone } from "@/lib/report/types";

export const TONE_WORD: Record<Tone, string> = {
  ok: "OK",
  caution: "Caution",
  alert: "Alert",
  neutral: "Info",
};

export function ToneIcon({ tone, size = 14 }: { tone: Tone; size?: number }) {
  const props = { size, strokeWidth: 2.25, "aria-hidden": true as const, className: "shrink-0 text-[color:var(--tone)]" };
  return (
    <span data-tone={tone} className="inline-flex">
      {tone === "ok" ? <Check {...props} /> : tone === "alert" ? <OctagonAlert {...props} /> : tone === "caution" ? <AlertTriangle {...props} /> : <Info {...props} />}
    </span>
  );
}

export function StatusPill({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      data-tone={tone}
      className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--tone-soft)] px-2.5 py-1 text-[13px] font-semibold text-[color:var(--tone)]"
    >
      <ToneIcon tone={tone} size={13} />
      {label}
    </span>
  );
}

export function AskBadges({ ask }: { ask?: number[] }) {
  if (!ask?.length) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[color:var(--r-muted)]" aria-label={`Answers question ${ask.join(" and ")}`}>
      Answers
      {ask.map((n) => (
        <span key={n} className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--r-subtle)] px-1.5 font-mono text-[11px] font-medium text-[color:var(--r-fg2)] shadow-[var(--r-ring)]">
          Q{n}
        </span>
      ))}
    </span>
  );
}

export function SectionHeader({ title, ask, caption }: { title: string; ask?: number[]; caption?: string }) {
  return (
    <header className="mb-4 space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[color:var(--r-fg)]">{title}</h2>
        <AskBadges ask={ask} />
      </div>
      {caption && <p className="text-[13px] leading-relaxed text-[color:var(--r-muted)]">{caption}</p>}
    </header>
  );
}

export function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`r-card p-5 md:p-6 ${className}`}>{children}</section>;
}
