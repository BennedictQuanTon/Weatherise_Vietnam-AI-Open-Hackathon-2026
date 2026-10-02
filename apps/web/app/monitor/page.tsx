"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, Info, Loader2, Moon, OctagonAlert, Radio, Sun, Trash2 } from "lucide-react";
import type { Report, Tone } from "@/lib/report/types";
import { SHOWCASE_PROMPTS } from "@/lib/report/prompts";
import { clearRuns, loadRuns, newRunId, saveRun, subscribeRuns, type RunTrace } from "@/lib/trace";

interface SvcHealth {
  name: string;
  key: string;
  status: "ok" | "degraded" | "unreachable" | "checking";
  latency?: number;
}

const SVCS: SvcHealth[] = [
  { name: "NIM LLM", key: "nim_llm", status: "checking" },
  { name: "NIM Embed", key: "nim_embed", status: "checking" },
  { name: "MCP Server", key: "mcp_server", status: "checking" },
  { name: "Qdrant", key: "qdrant", status: "checking" },
  { name: "API Backend", key: "api", status: "checking" },
];

const STATUS: Record<SvcHealth["status"], { label: string; tone: Tone }> = {
  ok: { label: "Healthy", tone: "ok" },
  degraded: { label: "Degraded", tone: "caution" },
  unreachable: { label: "Unreachable", tone: "alert" },
  checking: { label: "Checking…", tone: "neutral" },
};

const DOMAIN_LABEL: Record<string, string> = {
  tourism: "Tourism",
  construction: "Construction",
  agriculture: "Agriculture",
  severe_weather: "Alerts",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tourism", label: "Tourism" },
  { key: "construction", label: "Construction" },
  { key: "agriculture", label: "Agriculture" },
  { key: "severe_weather", label: "Alerts" },
  { key: "error", label: "Errors" },
];

const EXAMPLES: { label: string; prompt: string }[] = [
  { label: "Tourism", prompt: SHOWCASE_PROMPTS.tourism },
  { label: "Construction", prompt: SHOWCASE_PROMPTS.construction },
  { label: "Agriculture", prompt: SHOWCASE_PROMPTS.agriculture },
  { label: "Alerts", prompt: SHOWCASE_PROMPTS.severe_weather },
];

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh",
});
const NB = " ";
const ms = (v: number) => `${v.toLocaleString("en-US")}${NB}ms`;
const sleep = (t: number) => new Promise((r) => setTimeout(r, t));

// Single steps are slow above 1 s; a whole run is slow above 5 s.
function durationTone(v: number, total = false): Tone {
  const [slow, critical] = total ? [5000, 10000] : [1000, 5000];
  return v > critical ? "alert" : v > slow ? "caution" : "neutral";
}

function ToneText({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span data-tone={tone} className={tone === "neutral" ? "" : "text-[color:var(--tone)]"}>
      {children}
    </span>
  );
}

function StatusPill({ status }: { status: SvcHealth["status"] }) {
  const s = STATUS[status];
  const Icon = s.tone === "ok" ? Check : s.tone === "alert" ? OctagonAlert : s.tone === "caution" ? AlertTriangle : Info;
  return (
    <span data-tone={s.tone} className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--tone)]">
      {status === "checking" ? <Loader2 size={12} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Icon size={12} aria-hidden="true" />}
      {s.label}
    </span>
  );
}

function RunStatus({ run }: { run: RunTrace }) {
  if (run.status === "running")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--r-accent)]">
        <Loader2 size={12} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Running
      </span>
    );
  if (run.status === "error")
    return (
      <span data-tone="alert" className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--tone)]">
        <OctagonAlert size={12} aria-hidden="true" /> Error
      </span>
    );
  return (
    <span data-tone="ok" className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--tone)]">
      <Check size={12} aria-hidden="true" /> Done
    </span>
  );
}

function Card({ title, children, className = "", aside }: { title: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <section className={`r-card flex min-h-0 flex-col ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-[color:var(--r-hair)] px-4 py-3">
        <h2 className="text-[13px] font-semibold tracking-[-0.01em]">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function RunCard({ run, open, onToggle }: { run: RunTrace; open: boolean; onToggle: () => void }) {
  const total = run.totalMs ?? run.steps.reduce((a, b) => a + b.ms, 0);
  return (
    <li className="border-b border-[color:var(--r-hair)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="r-btn r-focus flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[color:var(--r-subtle)]"
      >
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`mt-0.5 shrink-0 text-[color:var(--r-muted)] transition-transform ${open ? "" : "-rotate-90"}`}
        />
        <span className="min-w-0 flex-1">
          <span className="r-sans line-clamp-2 text-[13px] font-medium leading-snug text-[color:var(--r-fg)]">{run.question}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--r-muted)]">
            <time className="font-mono tnum" dateTime={new Date(run.startedAt).toISOString()}>
              {timeFmt.format(run.startedAt)}
            </time>
            {run.domain && (
              <span className="rounded bg-[color:var(--r-subtle)] px-1.5 py-px font-medium text-[color:var(--r-fg2)]">{DOMAIN_LABEL[run.domain] ?? run.domain}</span>
            )}
            <span>{run.source === "monitor" ? "Quick Test" : "App"}</span>
            <span className="tnum">
              {run.steps.length} steps
              {total > 0 && (
                <>
                  {" · "}
                  <ToneText tone={durationTone(total, true)}>{ms(total)}</ToneText>
                </>
              )}
            </span>
          </span>
        </span>
        <RunStatus run={run} />
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4 pl-11">
          <ol className="overflow-hidden rounded-lg shadow-[var(--r-ring)]">
            {run.steps.map((s, i) => (
              <li
                key={`${s.step}-${i}`}
                className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-[color:var(--r-hair)] bg-[color:var(--r-bg)] px-3 py-2 text-[13px] last:border-0 md:grid-cols-[22px_minmax(0,1fr)_minmax(0,180px)_80px]"
              >
                <span className="font-mono text-xs text-[color:var(--r-muted)] tnum">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="font-medium text-[color:var(--r-fg)]">{s.step}</span>
                  <span className="ml-2 text-xs text-[color:var(--r-muted)] md:hidden" translate="no">
                    {s.agent}
                  </span>
                </span>
                <span className="hidden truncate font-mono text-xs text-[color:var(--r-fg2)] md:block" translate="no">
                  {s.agent}
                </span>
                <span className="text-right font-mono text-xs tnum">
                  <ToneText tone={durationTone(s.ms)}>{ms(s.ms)}</ToneText>
                </span>
              </li>
            ))}
            {run.status === "running" && (
              <li className="flex items-center gap-2 bg-[color:var(--r-bg)] px-3 py-2 text-[13px] text-[color:var(--r-muted)]">
                <Loader2 size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Next step…
              </li>
            )}
          </ol>

          {run.verdict && (
            <p data-tone={run.verdict.tone} className="r-sans text-[13px] leading-relaxed text-[color:var(--r-fg)]">
              <span className="font-semibold text-[color:var(--tone)]">{run.verdict.label}:</span> {run.verdict.headline}
            </p>
          )}
          {run.alerts && run.alerts.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {run.alerts.map((a) => (
                <li
                  key={a.title}
                  data-tone={a.tone}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--tone-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--tone)]"
                >
                  {a.tone === "alert" ? <OctagonAlert size={12} aria-hidden="true" /> : <AlertTriangle size={12} aria-hidden="true" />}
                  {a.title} · {a.window}
                </li>
              ))}
            </ul>
          )}
          {run.error && (
            <p data-tone="alert" className="text-[13px] text-[color:var(--tone)]">
              {run.error}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export default function MonitorPage() {
  const [runs, setRuns] = useState<RunTrace[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [svcs, setSvcs] = useState<SvcHealth[]>(SVCS);
  const [filter, setFilter] = useState("all");
  const [testInput, setTestInput] = useState<string>(SHOWCASE_PROMPTS.construction);
  const [testing, setTesting] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.title = "Pipeline Monitor · Weatherise";
    const saved = (localStorage.getItem("theme") as "light" | "dark" | null) ?? "light";
    setTheme(saved);
    document.documentElement.className = saved;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.className = next;
  };

  // Runs: load what's stored, then follow every update from the app (other tabs) live.
  useEffect(() => {
    const apply = (next: RunTrace[]) => {
      setRuns(next);
      const latest = next[next.length - 1];
      if (latest?.status === "running") setOpenId(latest.id);
    };
    const initial = loadRuns();
    setRuns(initial);
    setOpenId(initial[initial.length - 1]?.id ?? null);
    return subscribeRuns(apply);
  }, []);

  const checkHealth = useCallback(async () => {
    const t0 = Date.now();
    try {
      const r = await fetch("/health", { signal: AbortSignal.timeout(5000) });
      const d = await r.json();
      const apiLatency = Date.now() - t0;
      setSvcs((prev) =>
        prev.map((svc) => {
          if (svc.key === "api") return { ...svc, status: "ok", latency: apiLatency };
          const s = d.services?.[svc.key];
          return { ...svc, status: s === "ok" ? "ok" : s === "degraded" ? "degraded" : "unreachable" };
        }),
      );
    } catch {
      setSvcs((prev) => prev.map((s) => ({ ...s, status: "unreachable" })));
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const t = setInterval(checkHealth, 8000);
    return () => clearInterval(t);
  }, [checkHealth]);

  // Same-tab saves don't trigger the broadcast listener, so update local state too.
  const record = (run: RunTrace) => {
    saveRun(run);
    setRuns(loadRuns());
  };

  const runTest = async () => {
    const q = testInput.trim();
    if (testing || !q) return;
    setTesting(true);
    const run: RunTrace = { id: newRunId(), question: q, source: "monitor", startedAt: Date.now(), status: "running", steps: [] };
    setOpenId(run.id);
    record(run);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!r.ok) throw new Error(`API returned status ${r.status}.`);
      const d: { report?: Report; domain?: string } = await r.json();
      const report = d.report;
      if (!report) throw new Error("The response had no report. Check the backend response shape.");
      run.domain = report.domain;
      run.title = report.title;
      for (const p of report.sources.pipeline) {
        await sleep(Math.min(200, p.ms * 0.45));
        run.steps = [...run.steps, { ...p, at: Date.now() }];
        record({ ...run });
      }
      record({
        ...run,
        status: "done",
        totalMs: report.sources.pipeline.reduce((a, b) => a + b.ms, 0),
        verdict: { label: report.verdict.label, headline: report.verdict.headline, tone: report.verdict.tone },
        alerts: report.alerts.map((a) => ({ title: a.title, window: a.window, tone: a.tone })),
      });
    } catch (e: any) {
      record({ ...run, status: "error", error: `${e.message} Check that the app server is running, then run the test again.` });
    }
    setTesting(false);
  };

  const ordered = useMemo(() => [...runs].reverse(), [runs]);
  const filtered = ordered.filter((r) => (filter === "all" ? true : filter === "error" ? r.status === "error" : r.domain === filter));
  const selected = runs.find((r) => r.id === openId) ?? ordered[0];
  const maxStep = Math.max(...(selected?.steps.map((s) => s.ms) ?? [1]), 1);
  const done = runs.filter((r) => r.status === "done");
  const avg = done.length ? Math.round(done.reduce((a, r) => a + (r.totalMs ?? 0), 0) / done.length) : 0;
  const stats = [
    { label: "Runs", value: String(runs.length), tone: "neutral" as Tone },
    { label: "Avg Run", value: done.length ? ms(avg) : "—", tone: "neutral" as Tone },
    { label: "Alerts Raised", value: String(runs.reduce((a, r) => a + (r.alerts?.length ?? 0), 0)), tone: "caution" as Tone },
    { label: "Errors", value: String(runs.filter((r) => r.status === "error").length), tone: "alert" as Tone },
  ];

  return (
    <div className="report flex min-h-screen flex-col bg-[color:var(--r-page)] text-[color:var(--r-fg)]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-3 border-b border-[color:var(--r-hair)] bg-[color:var(--r-bg)] px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <a href="/" className="r-focus flex items-center gap-2 rounded-md" aria-label="Weatherise home">
            <img src="/favicon.svg" alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
            <span className="hidden text-[15px] font-semibold tracking-[-0.03em] sm:inline">Weatherise</span>
          </a>
          <span aria-hidden="true" className="text-[color:var(--r-hair)]">
            /
          </span>
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.03em]">Pipeline Monitor</h1>
          <span
            data-tone="ok"
            className="hidden items-center gap-1.5 rounded-full bg-[color:var(--tone-soft)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--tone)] md:inline-flex"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[color:var(--tone)]" />
            Synced with App
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              clearRuns();
              setRuns([]);
            }}
            className="r-btn r-focus inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[color:var(--r-fg2)] hover:bg-[color:var(--r-subtle)] hover:text-[color:var(--r-fg)]"
          >
            <Trash2 size={14} aria-hidden="true" /> Clear Log
          </button>
          <a
            href="/app"
            className="r-btn r-focus inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[color:var(--r-fg2)] hover:bg-[color:var(--r-subtle)] hover:text-[color:var(--r-fg)]"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to App
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="r-btn r-focus inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--r-fg2)] shadow-[var(--r-ring)] hover:text-[color:var(--r-fg)]"
          >
            {theme === "dark" ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:h-[calc(100vh-56px)] lg:grid-cols-[264px_minmax(0,1fr)_240px] lg:overflow-hidden">
        {/* Left: health + quick test */}
        <div className="flex min-h-0 flex-col gap-4">
          <Card title="Service Health" aside={<span className="text-xs text-[color:var(--r-muted)]">Every 8 s</span>}>
            <ul className="divide-y divide-[color:var(--r-hair)]">
              {svcs.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-[13px] font-medium">{s.name}</span>
                  <span className="flex items-center gap-2">
                    {s.latency !== undefined && <span className="font-mono text-xs text-[color:var(--r-muted)] tnum">{ms(s.latency)}</span>}
                    <StatusPill status={s.status} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Quick Test">
            <form
              className="flex flex-col gap-3 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                runTest();
              }}
            >
              <label htmlFor="quick-test" className="sr-only">
                Question to test
              </label>
              <textarea
                id="quick-test"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={5}
                placeholder="Ask a question to trace through the pipeline…"
                className="h-36 resize-none rounded-lg bg-[color:var(--r-bg)] p-3 text-base leading-relaxed text-[color:var(--r-fg)] shadow-[var(--r-ring)] outline-none placeholder:text-[color:var(--r-muted)] focus:shadow-[0_0_0_2px_var(--r-focus)] lg:text-[13px]"
              />
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Example questions">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setTestInput(ex.prompt)}
                    aria-pressed={testInput === ex.prompt}
                    className={`r-btn r-focus rounded-full px-2.5 py-1 text-xs font-medium ${
                      testInput === ex.prompt
                        ? "bg-[color:var(--r-fg)] text-[color:var(--r-bg)]"
                        : "bg-[color:var(--r-subtle)] text-[color:var(--r-fg2)] hover:text-[color:var(--r-fg)]"
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={testing || !testInput.trim()}
                className="r-btn r-focus inline-flex items-center justify-center gap-2 rounded-md bg-[color:var(--r-fg)] px-3 py-2 text-[13px] font-medium text-[color:var(--r-bg)] disabled:opacity-60"
              >
                {testing && <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                Run Test
              </button>
            </form>
          </Card>
        </div>

        {/* Center: one entry per question */}
        <Card
          title="Runs"
          className="min-h-[420px]"
          aside={
            <span className="text-xs text-[color:var(--r-muted)] tnum">
              {filtered.length} {filtered.length === 1 ? "run" : "runs"} · kept after refresh
            </span>
          }
        >
          <div className="flex flex-wrap gap-1 border-b border-[color:var(--r-hair)] px-3 py-2" role="group" aria-label="Filter runs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`r-btn r-focus rounded-md px-2.5 py-1 text-xs font-medium ${
                  filter === f.key
                    ? "bg-[color:var(--r-subtle)] text-[color:var(--r-fg)] shadow-[var(--r-ring)]"
                    : "text-[color:var(--r-muted)] hover:text-[color:var(--r-fg)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [overscroll-behavior:contain]" aria-live="polite">
            {filtered.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
                <Radio size={20} className="text-[color:var(--r-muted)]" aria-hidden="true" />
                <p className="text-[13px] font-medium">No Runs Yet</p>
                <p className="text-xs text-[color:var(--r-muted)]">
                  Ask a question in the{" "}
                  <a href="/app" className="r-focus rounded-sm text-[color:var(--r-accent)] underline-offset-2 hover:underline">
                    app
                  </a>{" "}
                  or run a Quick Test. Each step appears here as it runs.
                </p>
              </div>
            ) : (
              <ul>
                {filtered.map((run) => (
                  <RunCard key={run.id} run={run} open={run.id === selected?.id} onToggle={() => setOpenId(run.id === openId ? null : run.id)} />
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Right: selected run latency + stats */}
        <div className="flex min-h-0 flex-col gap-4">
          <Card title="Step Latency" className="flex-1" aside={<span className="text-xs text-[color:var(--r-muted)]">Selected Run</span>}>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {!selected || selected.steps.length === 0 ? (
                <p className="pt-4 text-center text-xs text-[color:var(--r-muted)]">No timed steps yet.</p>
              ) : (
                selected.steps.map((s, i) => {
                  const tone = durationTone(s.ms);
                  return (
                    <div key={`${s.step}-${i}`} data-tone={tone}>
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                        <span className="truncate text-[color:var(--r-fg2)]">{s.step}</span>
                        <span className={`font-mono tnum ${tone === "neutral" ? "text-[color:var(--r-fg)]" : "text-[color:var(--tone)]"}`}>{ms(s.ms)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[color:var(--r-subtle)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(4, (s.ms / maxStep) * 100)}%`, background: tone === "neutral" ? "var(--r-series)" : "var(--tone)" }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card title="Stats">
            <dl className="grid grid-cols-2 gap-px bg-[color:var(--r-hair)]">
              {stats.map((s) => (
                <div key={s.label} data-tone={s.tone} className="bg-[color:var(--r-bg)] px-4 py-3">
                  <dt className="text-xs text-[color:var(--r-muted)]">{s.label}</dt>
                  <dd
                    className={`text-[20px] font-semibold tracking-[-0.04em] tnum ${
                      s.value !== "0" && (s.tone === "alert" || s.tone === "caution") ? "text-[color:var(--tone)]" : ""
                    }`}
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
