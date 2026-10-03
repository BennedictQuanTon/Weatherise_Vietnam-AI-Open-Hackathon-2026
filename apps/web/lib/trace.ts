// Run traces shared between the app and the Monitor.
// Each question asked produces one run; steps are appended as the pipeline progresses.
// Stored in localStorage (survives refresh) and broadcast to other tabs instantly.

export interface TraceStep {
  step: string;
  agent: string;
  ms: number;
  at: number; // epoch ms when the step finished
}

export interface RunTrace {
  id: string;
  question: string;
  source: "app" | "monitor";
  startedAt: number;
  status: "running" | "done" | "error";
  domain?: string;
  title?: string;
  verdict?: { label: string; headline: string; tone: string };
  alerts?: { title: string; window: string; tone: string }[];
  steps: TraceStep[];
  totalMs?: number;
  error?: string;
}

const KEY = "weatherise:runs";
const CHANNEL = "weatherise:trace";
const MAX_RUNS = 50;

function read(): RunTrace[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RunTrace[]) : [];
  } catch {
    return [];
  }
}

function write(runs: RunTrace[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(runs.slice(-MAX_RUNS)));
  } catch {}
}

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  channel ??= new BroadcastChannel(CHANNEL);
  return channel;
}

export function loadRuns(): RunTrace[] {
  return read();
}

/** Insert or replace a run, persist it, and notify other tabs. */
export function saveRun(run: RunTrace) {
  const runs = read();
  const i = runs.findIndex((r) => r.id === run.id);
  if (i >= 0) runs[i] = run;
  else runs.push(run);
  write(runs);
  getChannel()?.postMessage({ type: "run", run });
}

export function clearRuns() {
  write([]);
  getChannel()?.postMessage({ type: "clear" });
}

/** Subscribe to runs changing in this or other tabs. Returns an unsubscribe function. */
export function subscribeRuns(onChange: (runs: RunTrace[]) => void) {
  const ch = getChannel();
  const onMessage = () => onChange(read());
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange(read());
  };
  ch?.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  return () => {
    ch?.removeEventListener("message", onMessage);
    window.removeEventListener("storage", onStorage);
  };
}

export function newRunId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
