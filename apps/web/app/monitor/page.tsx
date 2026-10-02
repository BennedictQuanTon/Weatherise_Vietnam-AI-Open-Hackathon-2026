"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Info, Loader2, Moon, OctagonAlert, Radio, Sun, Trash2 } from "lucide-react";
import type { Report, Tone } from "@/lib/report/types";
import { SHOWCASE_PROMPTS } from "@/lib/report/prompts";

interface LogEntry {
  id: string;
  ts: number;
  level: "info" | "warn" | "error" | "success" | "step";
  service: string;
  message: string;
  duration?: number;
}

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

const LEVEL: Record<LogEntry["level"], { label: string; tone: Tone | "accent" }> = {
  info: { label: "Info", tone: "neutral" },
  step: { label: "Step", tone: "accent" },
  success: { label: "Done", tone: "ok" },
  warn: { label: "Warn", tone: "caution" },
  error: { label: "Error", tone: "alert" },
};

const STATUS: Record<SvcHealth["status"], { label: string; tone: Tone }> = {
  ok: { label: "Healthy", tone: "ok" },
  degraded: { label: "Degraded", tone: "caution" },
  unreachable: { label: "Unreachable", tone: "alert" },
  checking: { label: "Checking…", tone: "neutral" },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "step", label: "Steps" },
  { key: "success", label: "Done" },
  { key: "warn", label: "Warnings" },
  { key: "error", label: "Errors" },
  { key: "parser", label: "Parser" },
  { key: "mcp", label: "MCP" },
  { key: "rule", label: "Rules" },
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Single steps are slow above 1 s; a whole-pipeline total is slow above 5 s.
function durationTone(ms: number, service = ""): Tone {
  const [slow, critical] = service === "Pipeline" ? [5000, 10000] : [1000, 5000];
  return ms > critical ? "alert" : ms > slow ? "caution" : "neutral";
}

function LevelBadge({ level }: { level: LogEntry["level"] }) {
  const l = LEVEL[level];
  const cls =
    l.tone === "accent"
      ? "bg-[color:var(--r-accent-soft)] text-[color:var(--r-accent)]"
      : l.tone === "neutral"
        ? "bg-[color:var(--r-subtle)] text-[color:var(--r-muted)]"
        : "bg-[color:var(--tone-soft)] text-[color:var(--tone)]";
  return (
    <span data-tone={l.tone === "accent" ? undefined : l.tone} className={`inline-flex w-12 justify-center rounded px-1.5 py-px text-[11px] font-medium ${cls}`}>
      {l.label}
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

export default function MonitorPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [svcs, setSvcs] = useState<SvcHealth[]>(SVCS);
  const [filter, setFilter] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [connected, setConnected] = useState(false);
  const [testInput, setTestInput] = useState<string>(SHOWCASE_PROMPTS.construction);
  const [testing, setTesting] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const listRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

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

  const push = useCallback((entry: LogEntry) => {
    setLogs((prev) => [...prev.slice(-800), entry]);
  }, []);

  // Live event stream (SSE).
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>;
    const connect = () => {
      esRef.current?.close();
      const es = new EventSource("/api/monitor/stream");
      esRef.current = es;
      es.onopen = () => setConnected(true);
      es.onerror = () => {
        setConnected(false);
        es.close();
        retryTimer = setTimeout(connect, 3000);
      };
      es.onmessage = (e) => {
        try {
          const entry = JSON.parse(e.data);
          if (entry.type === "ping") return;
          push(entry as LogEntry);
        } catch {}
      };
    };
    connect();
    return () => {
      clearTimeout(retryTimer);
      esRef.current?.close();
    };
  }, [push]);

  // Service health.
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

  useEffect(() => {
    const el = listRef.current;
    if (autoScroll && el) el.scrollTop = el.scrollHeight;
  }, [logs, autoScroll]);

  // Quick test: run one question and log every pipeline step it reports.
  const runTest = async () => {
    const q = testInput.trim();
    if (testing || !q) return;
    setTesting(true);
    const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    push({ id: id(), ts: Date.now(), level: "info", service: "Monitor", message: `Quick test: “${q}”` });
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!r.ok) throw new Error(`API returned status ${r.status}`);
      const d: { report?: Report } = await r.json();
      const report = d.report;
      if (!report) {
        push({ id: id(), ts: Date.now(), level: "warn", service: "Monitor", message: "Response had no report; check the backend response shape." });
      } else {
        for (const p of report.sources.pipeline) {
          await sleep(Math.min(300, p.ms * 0.6));
          push({ id: id(), ts: Date.now(), level: "step", service: p.agent.split(" · ")[0], message: `${p.step} · ${p.agent}`, duration: p.ms });
        }
        report.alerts.forEach((a) =>
          push({ id: id(), ts: Date.now(), level: a.tone === "alert" ? "warn" : "info", service: "Rule Engine", message: `${a.title} · ${a.window}` }),
        );
        const total = report.sources.pipeline.reduce((a, b) => a + b.ms, 0);
        push({
          id: id(),
          ts: Date.now(),
          level: "success",
          service: "Pipeline",
          message: `${report.verdict.label}: ${report.verdict.headline}`,
          duration: total,
        });
      }
    } catch (e: any) {
      push({
        id: id(),
        ts: Date.now(),
        level: "error",
        service: "Monitor",
        message: `Test failed: ${e.message}. Check that the app server is running, then run the test again.`,
      });
    }
    setTesting(false);
  };

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.level === filter || l.service.toLowerCase().includes(filter));
  const timed = logs.filter((l) => l.duration !== undefined).slice(-12);
  const maxMs = Math.max(...timed.map((l) => l.duration ?? 0), 1);
  const stats = [
    { label: "Events", value: logs.length, tone: "neutral" as Tone },
    { label: "Warnings", value: logs.filter((l) => l.level === "warn").length, tone: "caution" as Tone },
    { label: "Errors", value: logs.filter((l) => l.level === "error").length, tone: "alert" as Tone },
    { label: "Answers", value: logs.filter((l) => l.service === "Pipeline" && l.level === "success").length, tone: "ok" as Tone },
  ];

  return (
    <div className="report flex min-h-screen flex-col bg-[color:var(--r-page)] text-[color:var(--r-fg)]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-3 border-b border-[color:var(--r-hair)] bg-[color:var(--r-bg)] px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <a href="/" className="r-focus flex items-center gap-2 rounded-md" aria-label="Weatherise home">
            <img src="/Weatherise_Logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md object-cover" />
            <span className="hidden text-[15px] font-semibold tracking-[-0.03em] sm:inline">Weatherise</span>
          </a>
          <span aria-hidden="true" className="text-[color:var(--r-hair)]">/</span>
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.03em]">Pipeline Monitor</h1>
          <span
            data-tone={connected ? "ok" : "caution"}
            role="status"
            aria-live="polite"
            className="hidden items-center gap-1.5 rounded-full bg-[color:var(--tone-soft)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--tone)] md:inline-flex"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[color:var(--tone)]" />
            {connected ? "Stream Connected" : "Reconnecting…"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="r-btn hidden cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[color:var(--r-fg2)] hover:bg-[color:var(--r-subtle)] sm:flex">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="h-3.5 w-3.5 accent-[color:var(--r-accent)]"
            />
            Auto-Scroll
          </label>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="r-btn r-focus inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[color:var(--r-fg2)] hover:bg-[color:var(--r-subtle)] hover:text-[color:var(--r-fg)]"
          >
            <Trash2 size={14} aria-hidden="true" /> Clear Log
          </button>
          <a
            href="/"
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
                    {s.latency !== undefined && (
                      <span className="font-mono text-xs text-[color:var(--r-muted)] tnum">
                        {s.latency}
                        {" "}ms
                      </span>
                    )}
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
              <p className="text-xs text-[color:var(--r-muted)]">Each pipeline step appears in the log as it runs.</p>
            </form>
          </Card>
        </div>

        {/* Center: log stream */}
        <Card
          title="Event Log"
          className="min-h-[420px]"
          aside={
            <span className="text-xs text-[color:var(--r-muted)] tnum">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </span>
          }
        >
          <div className="flex flex-wrap gap-1 border-b border-[color:var(--r-hair)] px-3 py-2" role="group" aria-label="Filter log">
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

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto [overscroll-behavior:contain]" aria-live="polite" aria-relevant="additions">
            {filtered.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
                <Radio size={20} className="text-[color:var(--r-muted)]" aria-hidden="true" />
                <p className="text-[13px] font-medium">{connected ? "Waiting for Pipeline Events…" : "Connecting to the Event Stream…"}</p>
                <p className="text-xs text-[color:var(--r-muted)]">Run a Quick Test or ask a question in the app.</p>
              </div>
            ) : (
              <ol className="font-mono text-xs">
                {filtered.map((log) => (
                  <li
                    key={log.id}
                    className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-[color:var(--r-hair)] px-4 py-2 last:border-0 hover:bg-[color:var(--r-subtle)] md:grid-cols-[64px_128px_52px_minmax(0,1fr)_72px] md:items-start"
                  >
                    <time className="pt-px text-[color:var(--r-muted)] tnum" dateTime={new Date(log.ts).toISOString()}>
                      {timeFmt.format(log.ts)}
                    </time>
                    <span className="truncate pt-px font-medium text-[color:var(--r-fg2)]" translate="no">
                      {log.service}
                    </span>
                    <span className="hidden md:block">
                      <LevelBadge level={log.level} />
                    </span>
                    <span
                      data-tone={log.level === "error" ? "alert" : undefined}
                      className={`r-sans col-span-2 break-words text-[13px] leading-relaxed md:col-span-1 ${
                        log.level === "error" ? "text-[color:var(--tone)]" : log.level === "success" ? "text-[color:var(--r-fg)]" : "text-[color:var(--r-fg2)]"
                      }`}
                    >
                      <span className="mr-2 md:hidden">
                        <LevelBadge level={log.level} />
                      </span>
                      {log.message}
                    </span>
                    <span
                      data-tone={log.duration !== undefined ? durationTone(log.duration, log.service) : undefined}
                      className={`hidden text-right tnum md:block ${
                        log.duration !== undefined && durationTone(log.duration, log.service) !== "neutral" ? "text-[color:var(--tone)]" : "text-[color:var(--r-muted)]"
                      }`}
                    >
                      {log.duration !== undefined ? `${log.duration.toLocaleString("en-US")} ms` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Card>

        {/* Right: latency + stats */}
        <div className="flex min-h-0 flex-col gap-4">
          <Card title="Step Latency" className="flex-1" aside={<span className="text-xs text-[color:var(--r-muted)]">Last 12</span>}>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {timed.length === 0 ? (
                <p className="pt-4 text-center text-xs text-[color:var(--r-muted)]">No timed steps yet.</p>
              ) : (
                timed.map((l) => {
                  const tone = durationTone(l.duration ?? 0, l.service);
                  return (
                    <div key={l.id} data-tone={tone}>
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                        <span className="truncate text-[color:var(--r-fg2)]" translate="no">
                          {l.service}
                        </span>
                        <span className={`font-mono tnum ${tone === "neutral" ? "text-[color:var(--r-fg)]" : "text-[color:var(--tone)]"}`}>
                          {(l.duration ?? 0).toLocaleString("en-US")}
                          {" "}ms
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[color:var(--r-subtle)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(4, ((l.duration ?? 0) / maxMs) * 100)}%`,
                            background: tone === "neutral" ? "var(--r-series)" : "var(--tone)",
                          }}
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
                    className={`text-[22px] font-semibold tracking-[-0.04em] ${
                      s.value > 0 && (s.tone === "alert" || s.tone === "caution") ? "text-[color:var(--tone)]" : ""
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
