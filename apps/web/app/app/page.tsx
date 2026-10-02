"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Loader2, Wind, Droplets, MapPin, Sun, Moon, Briefcase, Building, Leaf, Bell,
  ShieldCheck, ArrowRight, ArrowUp, ArrowLeft, Search, Activity, OctagonAlert,
} from "lucide-react";
import type { PipelineStep, Report } from "@/lib/report/types";
import { PIPELINE_BASE } from "@/lib/report/demoWeek";
import { SHOWCASE_PROMPTS } from "@/lib/report/prompts";
import ReportView from "@/components/report/ReportView";
import ReportLoading from "@/components/report/ReportLoading";
import { LegacyResult, convertTripViewToPlan, type LegacyChatResult } from "@/components/legacy/LegacyResult";
import { newRunId, saveRun, type RunTrace } from "@/lib/trace";

// Leaflet needs window, so both maps load client-side only.
const MapLoading = () => <div className="r-skeleton h-full w-full rounded-none" />;
const ReportMap = dynamic(() => import("@/components/report/ReportMap"), { ssr: false, loading: MapLoading });
const TripMapPanel = dynamic(() => import("@/components/map/TripMapPanel"), { ssr: false, loading: MapLoading });

type ChatResult = LegacyChatResult & { report?: Report };

const DEFAULT_PIPELINE: PipelineStep[] = [
  PIPELINE_BASE.parse,
  PIPELINE_BASE.resolve,
  PIPELINE_BASE.weather,
  PIPELINE_BASE.consensus,
  PIPELINE_BASE.rules,
  PIPELINE_BASE.write,
];

const SHOWCASE_CHIPS: { key: keyof typeof SHOWCASE_PROMPTS; label: string; domain: string }[] = [
  { key: "tourism", label: "Tourism", domain: "tourism" },
  { key: "construction", label: "Construction", domain: "construction" },
  { key: "agriculture", label: "Agriculture", domain: "agriculture" },
  { key: "severe_weather", label: "Alerts", domain: "severe_weather" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// URL state: showcase questions use a short key (?q=construction), anything else the full text.
const SHOWCASE_KEYS = Object.keys(SHOWCASE_PROMPTS) as (keyof typeof SHOWCASE_PROMPTS)[];
const toUrlParam = (q: string) => SHOWCASE_KEYS.find((k) => SHOWCASE_PROMPTS[k] === q) ?? q;
const fromUrlParam = (v: string) => (SHOWCASE_PROMPTS as Record<string, string>)[v] ?? v;

function setUrlQuery(q: string | null) {
  const url = new URL(window.location.href);
  if (q) url.searchParams.set("q", toUrlParam(q));
  else url.searchParams.delete("q");
  window.history.pushState(null, "", url);
}

// ─── Types ─────────────────────────────────────────────────
interface CityWeather {
  temp: number;
  condition: string;
  risk: string;
  humidity?: number;
  wind_speed?: number;
  precipitation?: number;
}

// ─── Components ─────────────────────────────────────────────
function PopularMockCard({ title, desc, icon: Icon, onClick, iconBg, type }: any) {
  return (
    <button 
      onClick={onClick} 
      className="relative group text-left w-full h-[220px] rounded-3xl overflow-hidden shadow-sm transition-all hover:scale-[1.03] hover:shadow-md duration-300 isolate bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 outline-none"
      style={{
        maskImage: "radial-gradient(white, black)",
        WebkitMaskImage: "-webkit-radial-gradient(white, black)"
      }}
    >
      {/* Background Graphic on the right */}
      {type === "tourism" && (
        <div 
          className="absolute right-0 bottom-0 top-0 w-[48%] bg-cover bg-center opacity-95 group-hover:scale-105 transition-transform duration-700"
          style={{ 
            backgroundImage: "url('/card_tourism.png')",
            clipPath: "polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)"
          }} 
        />
      )}
      {type === "construction" && (
        <div 
          className="absolute right-0 bottom-0 top-0 w-[48%] bg-cover bg-center opacity-95 group-hover:scale-105 transition-transform duration-700"
          style={{ 
            backgroundImage: "url('/card_construction.png')",
            clipPath: "polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)"
          }} 
        />
      )}
      {type === "agriculture" && (
        <div 
          className="absolute right-0 bottom-0 top-0 w-[48%] bg-cover bg-center opacity-95 group-hover:scale-105 transition-transform duration-700"
          style={{ 
            backgroundImage: "url('/card_agriculture.png')",
            clipPath: "polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)"
          }} 
        />
      )}
      {type === "severe" && (
        <div 
          className="absolute right-0 bottom-0 top-0 w-[48%] bg-cover bg-center opacity-95 group-hover:scale-105 transition-transform duration-700"
          style={{ 
            backgroundImage: "url('/card_severe.png')",
            clipPath: "polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)"
          }} 
        />
      )}

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between w-[52%] z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${iconBg}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="font-serif-heading text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">{title}</h4>
        </div>
        <div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors shadow-sm">
            <ArrowRight size={12} className="stroke-[2.5]" />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function HomePage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineStep[]>(DEFAULT_PIPELINE);
  const [done, setDone] = useState(0);
  const [latestResult, setLatestResult] = useState<ChatResult | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [weatherData, setWeatherData] = useState<Record<string, CityWeather>>({
    "Hanoi": { temp: 28, condition: "Heavy rain", risk: "Moderate" },
    "Da Nang": { temp: 31, condition: "High risk", risk: "High risk", humidity: 72, wind_speed: 18.5, precipitation: 5.0 },
    "Ho Chi Minh": { temp: 33, condition: "Moderate", risk: "Moderate" }
  });

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Liveclock timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      const dateStr = now.toLocaleDateString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data with 5-minute polling interval
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const r = await fetch("/api/weather/current");
        if (r.ok) {
          const d = await r.json();
          setWeatherData(d);
        }
      } catch (e) {
        console.error("Failed to fetch live weather:", e);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Theme support
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.className = saved;
    } else {
      setTheme("light");
      document.documentElement.className = "light";
    }
  }, []);

  // Grow the home search box with its content (up to ~6 lines, then scroll).
  useEffect(() => {
    const fit = () => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [input]);

  // Tab title follows the current answer.
  useEffect(() => {
    document.title = latestResult?.report
      ? `${latestResult.report.title} · Weatherise`
      : loading
        ? "Working on It… · Weatherise"
        : "Weatherise · Weather Decisions for Da Nang";
  }, [latestResult, loading]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.className = next;
  };

  // Demo mode: the answer comes from /api/chat (mock engine); the pipeline steps
  // are then replayed so the viewer sees each agent run before the report appears.
  // `replay: false` (restoring from the URL) shows the report at once, skipping the step animation.
  const sendMessage = async (text: string, { replay = true, pushUrl = true } = {}) => {
    const q = text.trim();
    if (!q || loading) return;
    setLoading(true);
    setQuery(q);
    setInput("");
    setLatestResult(null);
    setActiveDay(1);
    setPipeline(DEFAULT_PIPELINE);
    setDone(0);
    if (pushUrl) setUrlQuery(q);

    // Every question is traced for the Monitor (persisted + broadcast to other tabs).
    const run: RunTrace = { id: newRunId(), question: q, source: "app", startedAt: Date.now(), status: "running", steps: [] };
    saveRun(run);

    let data: ChatResult;
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!r.ok) throw new Error(`API returned status ${r.status}`);
      data = await r.json();
    } catch (err) {
      console.error("Chat error:", err);
      saveRun({ ...run, status: "error", error: String(err) });
      setLatestResult({ error: "Weatherise couldn't reach the answer service. Check your connection, then send the question again." });
      setLoading(false);
      return;
    }

    const report = data.report;
    const steps = report?.sources.pipeline ?? DEFAULT_PIPELINE;
    setPipeline(steps);
    run.domain = report?.domain ?? data.domain;
    run.title = report?.title;
    for (let i = 0; i < steps.length; i++) {
      if (replay) await sleep(Math.min(200, steps[i].ms * 0.45));
      run.steps = [...run.steps, { ...steps[i], at: Date.now() }];
      saveRun(run);
      setDone(i + 1);
    }
    saveRun({
      ...run,
      status: "done",
      totalMs: steps.reduce((a, b) => a + b.ms, 0),
      verdict: report ? { label: report.verdict.label, headline: report.verdict.headline, tone: report.verdict.tone } : undefined,
      alerts: report?.alerts.map((a) => ({ title: a.title, window: a.window, tone: a.tone })),
    });
    setLatestResult(data);
    setLoading(false);
  };

  // Restore the answer from the URL on load and on Back/Forward.
  useEffect(() => {
    const restore = () => {
      const v = new URL(window.location.href).searchParams.get("q");
      if (v) sendMessage(fromUrlParam(v), { replay: false, pushUrl: false });
      else {
        setLatestResult(null);
        setQuery("");
      }
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetToHome = () => {
    setUrlQuery(null);
    setLatestResult(null);
    setLoading(false);
    setDone(0);
    setInput("");
    setQuery("");
  };

  const isChatActive = loading || !!latestResult;
  const dn = weatherData["Da Nang"] || { temp: 31, condition: "High risk", risk: "High risk", humidity: 72, wind_speed: 18.5, precipitation: 5.0 };

  return (
    <div 
      className={`min-h-screen ${isChatActive ? "lg:h-screen lg:overflow-hidden" : ""} flex flex-col bg-cover bg-center bg-no-repeat transition-all duration-500 relative`}
      style={{ 
        backgroundImage: theme === "dark" ? "url('/image_dark.png')" : "url('/image.png')"
      }}
    >
      <div 
        className={`absolute inset-0 transition-all duration-500 pointer-events-none ${
          !isChatActive ? (theme === "dark" ? "bg-gradient-overlay-dark" : "bg-gradient-overlay-light") : ""
        }`}
        style={{
          backgroundColor: isChatActive
            ? (theme === "dark" ? "#000000" : "#fafafa")
            : undefined,
        }}
      />

      <div className={`relative z-10 flex flex-col min-h-screen ${isChatActive ? "lg:h-screen" : ""}`}>
        {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-slate-950/20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={resetToHome}
            className="flex items-center gap-3 text-left group transition-all active:scale-95 outline-none cursor-pointer"
            title="Return to Home"
          >
            <img 
              src="/Weatherise_Logo.png" 
              alt="Weatherise Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-500/50 dark:group-hover:ring-cyan-400/50 transition-all" 
            />
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white font-serif-heading text-2xl md:text-3xl font-black tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                Weatherise
              </h1>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <a
              href="/monitor"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Monitor"
              title="Monitor"
              className="btn-liquid-glass p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Activity size={15} aria-hidden="true" />
            </a>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"} className="btn-liquid-glass p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500" title="Toggle theme">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-6 ${isChatActive ? "py-6 min-h-0" : "py-8 justify-center"} flex flex-col`}>
        {(!loading && !latestResult) ? (
            /* INITIAL VIEW (Mockup layout matches image exactly) */
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              {/* Hero Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left side: Heading, Search & Category Buttons */}
                <div className="lg:col-span-6 space-y-6">
                  <h2 className="font-serif-heading text-5xl md:text-6xl font-black tracking-tight leading-[1.02] text-slate-900 dark:text-white">
                    <span className="font-handwritten text-8xl md:text-9xl text-blue-600 dark:text-cyan-400 block -mb-4 font-normal">Understand</span>
                    <span className="font-handwritten text-7xl md:text-8xl text-blue-600 dark:text-cyan-400 block -mb-4 font-normal">the weather.</span>
                    Plan better.
                  </h2>
                  <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed max-w-xl mt-4 font-bold">
                    Real-time weather intelligence to help you plan smarter, stay safe, and make confident decisions.
                  </p>
                  
                  {/* Search Composer Container */}
                  <div
                    className={`w-full max-w-xl mt-6 border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/80 shadow-lg pl-5 pr-3 py-2.5 flex items-end gap-3 transition-[border-radius] focus-within:ring-2 focus-within:ring-blue-500/40 ${
                      input.length > 60 || input.includes("\n") ? "rounded-[26px]" : "rounded-full"
                    }`}
                  >
                    <Search size={18} aria-hidden="true" className="self-start mt-[7px] text-slate-400 dark:text-slate-400 shrink-0" />
                    <label htmlFor="home-question" className="sr-only">Ask Weatherise</label>
                    <textarea
                      id="home-question"
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask about weather risk for your plans…"
                      disabled={loading}
                      className="flex-1 min-w-0 max-h-[168px] overflow-y-auto bg-transparent text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 resize-none outline-none leading-relaxed py-1"
                    />
                    <button 
                      onClick={() => sendMessage(input)} 
                      disabled={!input.trim() || loading}
                      aria-label="Send Question"
                      className="mb-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all bg-blue-600 dark:bg-cyan-400 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-30 disabled:hover:scale-100 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <ArrowRight size={14} className="text-white dark:text-slate-950 font-bold stroke-[3]" />
                    </button>
                  </div>

                  {/* Category Buttons Stretched Row */}
                  <div className="flex flex-row gap-3 mt-4 max-w-xl w-full">
                    {[
                      { name: "Tourism", icon: Briefcase, q: SHOWCASE_PROMPTS.tourism },
                      { name: "Construction", icon: Building, q: SHOWCASE_PROMPTS.construction },
                      { name: "Agriculture", icon: Leaf, q: SHOWCASE_PROMPTS.agriculture }
                    ].map((p, i) => {
                      const Icon = p.icon;
                      return (
                        <button 
                          key={i} 
                          onClick={() => { setInput(p.q); }}
                          className="flex-1 flex items-center justify-center gap-2 px-7 py-4 rounded-full btn-category-glass outline-none"
                        >
                          <Icon size={18} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                          <span className="text-slate-800 dark:text-slate-100 font-black text-base md:text-lg truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right side: Clean direct weather values inside fluid glass box */}
                <div className="lg:col-span-6 flex items-center justify-center">
                  <div className="fluid-glass-box w-full rounded-3xl p-8 md:p-10 space-y-8 text-slate-800 dark:text-white">
                    {/* Location */}
                    <div className="flex items-center gap-2.5 text-blue-600 dark:text-cyan-400 font-black text-sm md:text-base uppercase tracking-widest drop-shadow-sm">
                      <MapPin size={18} className="shrink-0" />
                      <span>DA NANG, VIETNAM</span>
                    </div>
                    
                    {/* Temp & Condition */}
                    <div className="flex flex-wrap items-center gap-8 md:gap-12">
                      <div className="flex items-start">
                        <span className="font-serif-heading text-[6.5rem] md:text-[8rem] lg:text-[9rem] font-black tracking-tighter leading-none text-slate-900 dark:text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                          {dn.temp}
                        </span>
                        <div className="flex flex-col items-center ml-2 mt-4">
                          <span className="text-4xl font-light text-blue-600 dark:text-cyan-400">°</span>
                          <span className="text-2xl font-black text-blue-600 dark:text-cyan-400 -mt-2.5 uppercase">C</span>
                        </div>
                      </div>
                      
                      {/* Condition Info */}
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-blue-50/80 dark:bg-slate-950/40 flex items-center justify-center shadow-md border border-slate-100 dark:border-white/5">
                          <svg className="w-10 h-10 shrink-0" viewBox="0 0 24 24" fill="none">
                            <path d="M18 10h-.7A5.5 5.5 0 0 0 6.8 9.2a4 4 0 0 0-3.3 4.3 4 4 0 0 0 4 3.5h10.5a4.5 4.5 0 0 0 0-9Z" fill="#94a3b8" />
                            <path d="M8 18v2M12 18v2M16 18v2" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-none">
                            {dn.condition}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-black">
                            Feels like {dn.temp + 3}°C
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Horizontal Metrics row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-200/50 dark:border-white/10">
                      <div className="flex items-center gap-3 bg-white/45 dark:bg-slate-950/40 backdrop-blur-lg rounded-2xl p-3.5 border border-white/35 shadow-sm">
                        <Wind className="w-6 h-6 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-base md:text-lg font-black text-slate-950 dark:text-white leading-none">{dn.wind_speed ?? 18.5} km/h</div>
                          <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 mt-1 uppercase tracking-wider">Wind</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/45 dark:bg-slate-950/40 backdrop-blur-lg rounded-2xl p-3.5 border border-white/35 shadow-sm">
                        <Droplets className="w-6 h-6 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-base md:text-lg font-black text-slate-950 dark:text-white leading-none">{dn.humidity ?? 72}%</div>
                          <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 mt-1 uppercase tracking-wider">Humidity</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/45 dark:bg-slate-950/40 backdrop-blur-lg rounded-2xl p-3.5 border border-white/35 shadow-sm">
                        <Droplets className="w-6 h-6 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-base md:text-lg font-black text-slate-950 dark:text-white leading-none">{dn.precipitation ?? 5.0} mm</div>
                          <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 mt-1 uppercase tracking-wider">Rainfall</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/45 dark:bg-slate-950/40 backdrop-blur-lg rounded-2xl p-3.5 border border-white/35 shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-orange-500 dark:text-orange-400 shrink-0" />
                        <div>
                          <div className="text-base md:text-lg font-black text-orange-700 dark:text-orange-400 leading-none">{dn.risk ?? "High"}</div>
                          <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 mt-1 uppercase tracking-wider">Risk Index</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom popular cards matching mockup style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                <PopularMockCard 
                  title="Plan Your Trip" 
                  desc="Get weather-aware travel recommendations tailored to your journey." 
                  icon={Briefcase} 
                  iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  onClick={() => sendMessage(SHOWCASE_PROMPTS.tourism)} 
                  type="tourism"
                />
                <PopularMockCard 
                  title="Construction Safety" 
                  desc="Check rain, wind, and extreme weather impact." 
                  icon={Building} 
                  iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  onClick={() => sendMessage(SHOWCASE_PROMPTS.construction)} 
                  type="construction"
                />
                <PopularMockCard 
                  title="Agriculture Planning" 
                  desc="Optimize planting, irrigation and harvesting." 
                  icon={Leaf} 
                  iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                  onClick={() => sendMessage(SHOWCASE_PROMPTS.agriculture)} 
                  type="agriculture"
                />
                <PopularMockCard 
                  title="Severe Weather Alerts" 
                  desc="Early warnings for storms, floods, and other extreme conditions." 
                  icon={Bell} 
                  iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  onClick={() => sendMessage(SHOWCASE_PROMPTS.severe_weather)} 
                  type="severe"
                />
              </div>
            </div>
          ) : (
          /* RESULT VIEW — report (left) · follow-up + map (right) */
          <div className="report flex min-h-0 flex-1 flex-col">
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-h-0 lg:overflow-y-auto lg:pr-3 [overscroll-behavior:contain]">
                {loading ? (
                  <ReportLoading prompt={query} steps={pipeline} done={done} />
                ) : latestResult?.report ? (
                  <ReportView report={latestResult.report} activeDay={activeDay} onDayChange={setActiveDay} />
                ) : latestResult?.error ? (
                  <div data-tone="alert" role="alert" className="r-card flex gap-3 p-5">
                    <OctagonAlert size={18} className="mt-0.5 shrink-0 text-[color:var(--tone)]" aria-hidden="true" />
                    <div className="space-y-3">
                      <p className="text-[14px] text-[color:var(--r-fg)]">{latestResult.error}</p>
                      <button
                        type="button"
                        onClick={() => sendMessage(query)}
                        className="r-btn r-focus rounded-md bg-[color:var(--r-fg)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--r-bg)]"
                      >
                        Send Again
                      </button>
                    </div>
                  </div>
                ) : latestResult ? (
                  <LegacyResult result={latestResult} activeDay={activeDay} setActiveDay={setActiveDay} />
                ) : null}
              </div>

              <aside className="flex min-h-0 flex-col gap-4 pb-6">
                <form
                  className="r-card space-y-3 p-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="follow-up" className="text-[13px] font-semibold text-[color:var(--r-fg)]">
                      Ask a Follow-Up
                    </label>
                    <button
                      type="button"
                      onClick={resetToHome}
                      className="r-btn r-focus inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-[color:var(--r-muted)] hover:text-[color:var(--r-fg)]"
                    >
                      <ArrowLeft size={12} aria-hidden="true" /> Home
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-[color:var(--r-bg)] pl-3 pr-1.5 shadow-[var(--r-ring)] focus-within:shadow-[0_0_0_2px_var(--r-focus)]">
                    <input
                      id="follow-up"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="What if we pour on Saturday instead…"
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-[color:var(--r-fg)] outline-none placeholder:text-[color:var(--r-muted)]"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      aria-label="Send Question"
                      className="r-btn r-focus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--r-fg)] text-[color:var(--r-bg)] disabled:opacity-30"
                    >
                      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <ArrowUp size={15} aria-hidden="true" />}
                    </button>
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs text-[color:var(--r-muted)]">Showcase Questions</div>
                    <div className="flex flex-wrap gap-1.5">
                      {SHOWCASE_CHIPS.map((c) => {
                        const active = latestResult?.report?.domain === c.domain;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            disabled={loading}
                            onClick={() => sendMessage(SHOWCASE_PROMPTS[c.key])}
                            aria-pressed={active}
                            className={`r-btn r-focus rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                              active
                                ? "bg-[color:var(--r-fg)] text-[color:var(--r-bg)]"
                                : "bg-[color:var(--r-subtle)] text-[color:var(--r-fg2)] hover:text-[color:var(--r-fg)]"
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>

                <section className="r-card flex min-h-[340px] flex-1 flex-col overflow-hidden" aria-label="Map">
                  <div className="flex items-center justify-between gap-2 border-b border-[color:var(--r-hair)] px-4 py-3">
                    <span className="text-[13px] font-semibold text-[color:var(--r-fg)]">{latestResult?.report?.map.title ?? "Map"}</span>
                    {latestResult?.report?.domain === "tourism" && (
                      <span className="text-xs text-[color:var(--r-muted)] tnum">
                        Day {activeDay} · {latestResult.report.map.markers.filter((m) => m.day === activeDay).length} stops
                      </span>
                    )}
                  </div>
                  <div className="relative min-h-[300px] flex-1">
                    {loading || !latestResult ? (
                      <MapLoading />
                    ) : latestResult.report ? (
                      <ReportMap map={latestResult.report.map} activeDay={activeDay} theme={theme} />
                    ) : (
                      <TripMapPanel
                        tripPlan={latestResult.trip_plan ?? convertTripViewToPlan(latestResult.trip_view)}
                        coordinates={latestResult.coordinates}
                        locationName={latestResult.trip_view?.title ?? latestResult.location}
                        weatherMarker={latestResult.weather_view?.map?.markers?.[0] ?? null}
                        weatherMarkers={latestResult.weather_view?.map?.markers ?? []}
                        domain={latestResult.domain}
                        activeDay={activeDay}
                        onActiveDayChange={setActiveDay}
                        theme={theme}
                      />
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>);
}
