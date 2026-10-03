"use client";

import { Check, Loader2 } from "lucide-react";
import type { PipelineStep } from "@/lib/report/types";

// Skeleton mirrors the final report: header, verdict, 4 metrics, one section.
export default function ReportLoading({ prompt, steps, done }: { prompt: string; steps: PipelineStep[]; done: number }) {
  return (
    <div className="space-y-5 pb-10" aria-busy="true">
      <header className="space-y-5">
        <div className="r-skeleton h-4 w-56" />
        <div className="r-skeleton h-8 w-2/3" />
        <blockquote className="border-l-2 border-[color:var(--r-hair)] pl-4 text-[15px] leading-relaxed text-[color:var(--r-fg2)]">“{prompt}”</blockquote>
      </header>

      <section className="r-card p-5 md:p-6">
        <div className="mb-3 text-[13px] font-semibold">Working on It…</div>
        <ol className="space-y-2" aria-live="polite">
          {steps.map((s, i) => {
            const state = i < done ? "done" : i === done ? "active" : "pending";
            return (
              <li key={s.step} className={`flex items-center gap-2.5 text-[13px] ${state === "pending" ? "text-[color:var(--r-muted)]" : "text-[color:var(--r-fg)]"}`}>
                <span className="inline-flex h-5 w-5 items-center justify-center">
                  {state === "done" ? (
                    <Check size={14} className="text-[color:var(--r-ok)]" aria-hidden="true" />
                  ) : state === "active" ? (
                    <Loader2 size={14} className="animate-spin text-[color:var(--r-accent)] motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--r-hair)]" aria-hidden="true" />
                  )}
                </span>
                <span className="font-medium">{s.step}</span>
                <span className="text-xs text-[color:var(--r-muted)]">{s.agent}</span>
                <span className="sr-only">{state === "done" ? "done" : state === "active" ? "in progress" : "pending"}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="r-card space-y-3 p-4">
            <div className="r-skeleton h-3.5 w-20" />
            <div className="r-skeleton h-6 w-24" />
            <div className="r-skeleton h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="r-card h-64 p-5">
        <div className="r-skeleton h-4 w-40" />
      </div>
    </div>
  );
}
