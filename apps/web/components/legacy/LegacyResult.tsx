"use client";

// Legacy result views, kept as a fallback for backend responses that carry
// weather_view / trip_view but no `report`. The demo flow renders ReportView instead.

import {
  CloudLightning, AlertTriangle, Wind, Droplets, Thermometer, MapPin, Sun, Moon, Sliders,
  Sparkles, ShieldCheck, CheckCircle2, Calendar, Cloud, CloudRain, CloudSun, TrendingUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────
interface RiskAssessment {
  rain_risk?: string;
  wind_risk?: string;
  heat_risk?: string;
  overall_risk?: string;
  trip_disruption_risk?: string;
  construction_safety_risk?: string;
  disease_risk?: string;
}

interface TripStop {
  order: number;
  place_id: string;
  name: string;
  lat: number;
  lon: number;
  time_block: string;
  planned_time: string;
  forecast_temp?: number;
  weather_condition?: string;
  duration_minutes: number;
  is_indoor: boolean;
  category: string;
  vibe_tags: string[];
}

interface TripDay {
  day: number;
  theme?: string;
  primary_area?: string;
  stops: TripStop[];
  backup_options?: any[];
  date?: string;
  weather_condition?: string;
  temp_range?: string;
  rain_prob?: number;
}

interface TripPlan {
  duration_days: number;
  location: string;
  days: TripDay[];
  weather_aware: boolean;
  planning_mode?: string;
}

type ResponseType = "weather_prediction" | "trip_planning" | "general";

interface LocationPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface DateRange {
  start?: string;
  end?: string;
  label?: string;
}

interface MapMarker {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  order?: number;
  category?: string;
  temperature_c?: number;
  weather_condition?: string;
  rain_probability?: number;
  is_indoor?: boolean;
}

interface DomainMetricItem {
  label: string;
  value: string;
  sub?: string;
  source?: string;
  standard?: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "rose" | "blue" | "purple" | "cyan";
  iconName?: string;
}

interface TechStackInfo {
  reasoning_model: string;
  domain_agent: string;
  weather_sources: string[];
  vector_db: string;
  guardrails_score: string;
  latency: string;
  tokens_per_sec: string;
}

interface HazardEvaluationItem {
  title: string;
  standard_code: string;
  status: string;
  threshold_limit: string;
  observed_value: string;
  impact_description: string;
  severity: "high" | "medium" | "low";
}

interface DomainOverviewData {
  title: string;
  subtitle: string;
  executive_summary: string;
  compliance_status: string;
  hazards: HazardEvaluationItem[];
  operational_protocols: string[];
}

interface WeatherPredictionView {
  title: string;
  location: LocationPoint;
  date_range: DateRange;
  assumption: {
    summary: string;
    should_go: boolean;
    decision_label: string;
    decision_category?: string;
    key_stat_badge?: string;
    key_stat_value?: string;
    reason: string;
  };
  statistics: {
    avg_temperature_c?: number;
    min_temperature_c?: number;
    max_temperature_c?: number;
    avg_wind_kmh?: number;
    total_rainfall_mm?: number;
    rain_risk?: string;
    wind_risk?: string;
    heat_risk?: string;
    overall_risk?: string;
    most_common_condition?: string;
  };
  domain_metrics?: DomainMetricItem[];
  tech_stack_info?: TechStackInfo;
  overview?: DomainOverviewData;
  daily_forecast: Array<{
    date: string;
    day_label: string;
    condition: string;
    condition_icon: string;
    max_temp_c?: number;
    min_temp_c?: number;
    wind_kmh?: number;
    rain_probability?: number;
    rain_mm?: number;
    risk?: string;
  }>;
  recommendations: string[];
  alternatives: Array<{
    name: string;
    description: string;
    distance_label?: string;
    latitude?: number;
    longitude?: number;
  }>;
  map: {
    center: LocationPoint;
    markers: MapMarker[];
  };
  insights: Array<{
    title: string;
    body: string;
    type: "rain" | "wind" | "heat" | "travel" | "general";
  }>;
}

interface HourlyForecastItem {
  time: string;
  temp_c: number;
  feels_like_c: number;
  rain_probability: number;
  rain_mm: number;
  wind_kmh: number;
  humidity_percent: number;
  condition: string;
}

interface TripPlanningView {
  title: string;
  date_range: DateRange;
  summary_cards: {
    avg_high_c?: number;
    avg_low_c?: number;
    avg_wind_kmh?: number;
    humidity_percent?: number;
    rain_risk?: string;
  };
  ai_summary: string;
  days: Array<{
    day: number;
    date?: string;
    title: string;
    summary: string;
    weather: {
      high_c?: number;
      low_c?: number;
      rain_probability?: number;
      condition?: string;
    };
    hourly_forecast?: HourlyForecastItem[];
    stops: Array<{
      order: number;
      time: string;
      time_block: string;
      category: string;
      name: string;
      description?: string;
      latitude: number;
      longitude: number;
      forecast_temp_c?: number;
      rain_probability?: number;
      weather_condition?: string;
      is_indoor: boolean;
      weather_suitability?: string;
    }>;
  }>;
  map: {
    markers: MapMarker[];
  };
}

export interface LegacyChatResult {
  response_type?: ResponseType;
  domain?: string;
  location?: string;
  prediction?: string;
  recommendation?: string;
  risk_assessment?: RiskAssessment;
  explanation?: string;
  final_answer?: string;
  trip_plan?: TripPlan;
  error?: string;
  status?: string;
  coordinates?: { latitude: number; longitude: number } | null;
  evidence?: string[];
  weather_stats?: Record<string, any>;
  time_range?: { start: string; end: string; raw_text?: string };
  weather_path?: string;
  weather_confidence?: number;
  weather_mode?: string;
  sources_used?: string[];
  sources_rejected?: string[];
  tech_stack_info?: TechStackInfo;
  weather_debug?: WeatherDebug;
  response_language?: "en" | "vi";
  weather_view?: WeatherPredictionView | null;
  trip_view?: TripPlanningView | null;
}

interface WeatherDebug {
  request_id?: string;
  selected_mode?: string;
  confidence?: number;
  sources_used?: string[];
  sources_rejected?: string[];
  source_scores?: Array<Record<string, any>>;
  quality_reports?: Array<Record<string, any>>;
  comparison_matrix?: Record<string, any> | null;
  fused_weather?: Record<string, any> | null;
  arbiter_decision?: Record<string, any> | null;
  selected_weather?: Record<string, any>;
  evidence_paths?: Record<string, any>;
  warnings?: string[];
}

// ─── Helpers ────────────────────────────────────────────────
function riskBg(level: string) {
  const m: Record<string, string> = {
    low: "rgba(105,240,174,0.12)",
    medium: "rgba(255,179,0,0.12)",
    high: "rgba(255,82,82,0.12)",
    good: "rgba(105,240,174,0.1)",
    caution: "rgba(255,152,0,0.12)",
    poor: "rgba(255,82,82,0.12)",
  };
  return m[level?.toLowerCase()] ?? "rgba(255,255,255,0.05)";
}

function riskColor(level: string) {
  const m: Record<string, string> = {
    low: "#69f0ae",
    medium: "#ffb300",
    high: "#ff5252",
    good: "#69f0ae",
    caution: "#ff9800",
    poor: "#ff5252",
    unknown: "#8ba3b0",
  };
  return m[level?.toLowerCase()] ?? "#8ba3b0";
}

const DOMAIN_ICONS: Record<string, string> = {
  tourism: "🗺️",
  construction: "🏗️",
  agriculture: "🌾",
  unknown: "🌐",
};

function RiskBadge({ label, value, Icon, detail }: { label: string; value: string; Icon: any; detail?: string }) {
  const color = riskColor(value);
  const bg = riskBg(value);
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-center border border-white/5"
      style={{ background: bg }}>
      <Icon size={16} style={{ color }} />
      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
      <span className="text-[12px] font-bold animate-pulse-subtle" style={{ color }}>{value?.toUpperCase() ?? "N/A"}</span>
      {detail && <span className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">{detail}</span>}
    </div>
  );
}

function PathBDebugPanel({ result }: { result: LegacyChatResult }) {
  const debug = result.weather_debug;
  if (!debug) return null;
  const sourceScores = debug.source_scores ?? [];
  const qualityReports = debug.quality_reports ?? [];
  return (
    <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/10 p-3 space-y-3 text-[10px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <ShieldCheck size={12} />
          <span>Path B Weather Decision</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-200 border border-cyan-800/50">
          {result.weather_mode ?? debug.selected_mode ?? "path_b"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <DebugMetric label="Confidence" value={formatConfidence(result.weather_confidence ?? debug.confidence)} />
        <DebugMetric label="Sources" value={(result.sources_used ?? debug.sources_used ?? []).join(", ") || "none"} />
      </div>
      {sourceScores.length > 0 && (
        <div className="space-y-1">
          <div className="font-bold text-slate-300">Source Scores</div>
          <div className="grid gap-1">
            {sourceScores.slice(0, 5).map((score, idx) => (
              <div key={`${score.source_code}-${idx}`} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1">
                <span className="text-slate-300">{score.source_code}</span>
                <span className="font-mono text-cyan-300">{score.rank_score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {qualityReports.length > 0 && (
        <div className="space-y-1">
          <div className="font-bold text-slate-300">Quality</div>
          <div className="grid gap-1">
            {qualityReports.slice(0, 5).map((report, idx) => (
              <div key={`${report.source_code}-${idx}`} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-2 py-1">
                <span className="text-slate-300">{report.source_code}</span>
                <span className={report.valid ? "text-emerald-300" : "text-red-300"}>
                  {report.valid ? "valid" : "rejected"} · {report.quality_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {debug.warnings && debug.warnings.length > 0 && (
        <div className="space-y-1">
          <div className="font-bold text-slate-300">Warnings</div>
          {debug.warnings.slice(0, 4).map((warning, idx) => (
            <div key={idx} className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-200">{warning}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function DebugMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/[0.03] px-2 py-1">
      <div className="text-slate-500">{label}</div>
      <div className="font-mono text-slate-200 truncate">{value}</div>
    </div>
  );
}

function formatConfidence(value?: number) {
  if (value === undefined || value === null) return "n/a";
  return `${Math.round(value * 100)}%`;
}

function formatTemp(value?: number) {
  return value === undefined || value === null ? "n/a" : `${Math.round(value)}°C`;
}

function formatPercent(value?: number) {
  return value === undefined || value === null ? "n/a" : `${Math.round(value * 100)}%`;
}

function formatNumber(value?: number, suffix = "") {
  return value === undefined || value === null ? "n/a" : `${Math.round(value)}${suffix}`;
}

function blockLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getWeatherIcon(condition?: string) {
  const cond = (condition || "").toLowerCase();
  if (cond.includes("thunder") || cond.includes("lightning") || cond.includes("storm")) {
    return CloudLightning;
  }
  if (cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle")) {
    return CloudRain;
  }
  if (cond.includes("partly") && cond.includes("cloud")) {
    return CloudSun;
  }
  if (cond.includes("cloud") || cond.includes("overcast") || cond.includes("mist") || cond.includes("fog")) {
    return Cloud;
  }
  return Sun;
}

function WeatherMetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/40 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-400/50 dark:hover:border-cyan-400/50">
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{value}</div>
      {sub && <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{sub}</div>}
    </div>
  );
}

function DomainSafetyOverviewSection({ overview }: { overview?: DomainOverviewData }) {
  if (!overview) return null;

  return (
    <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 border-b border-slate-200/50 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600 dark:text-cyan-400" />
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {overview.title}
            </h3>
          </div>
          {overview.subtitle && (
            <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {overview.subtitle}
            </p>
          )}
        </div>

        {overview.compliance_status && (
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-200 dark:border-cyan-800 bg-blue-50 dark:bg-cyan-950/30 text-blue-700 dark:text-cyan-300">
            {overview.compliance_status}
          </span>
        )}
      </div>

      {/* Executive Summary Box */}
      {overview.executive_summary && (
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-blue-500 dark:text-cyan-400" />
            Executive Synthesis & Operational Evaluation
          </div>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
            {overview.executive_summary}
          </p>
        </div>
      )}

      {/* 3 Key Hazard Evaluation Cards */}
      {overview.hazards && overview.hazards.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" />
            Technical Hazard Analysis & Physical Constraints
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview.hazards.map((hazard, idx) => {
              const sevBorder = hazard.severity === "high" 
                ? "border-rose-300/80 dark:border-rose-800/60 bg-rose-50/40 dark:bg-rose-950/20" 
                : hazard.severity === "medium" 
                ? "border-amber-300/80 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20" 
                : "border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5";

              const sevBadge = hazard.severity === "high"
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : hazard.severity === "medium"
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

              return (
                <div key={idx} className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 shadow-sm overflow-hidden ${sevBorder}`}>
                  <div className="space-y-2">
                    <div className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
                      {hazard.title}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block max-w-full truncate ${sevBadge}`}>
                        {hazard.status}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 truncate">
                        {hazard.standard_code}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-100/70 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Standard Limit</div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 break-words leading-tight mt-0.5">{hazard.threshold_limit}</div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/40 dark:border-white/5">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Observed / Forecast</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white break-words leading-tight mt-0.5">{hazard.observed_value}</div>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/50 dark:border-white/5 leading-relaxed break-words">
                    {hazard.impact_description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operational Protocols & Action Plan */}
      {overview.operational_protocols && overview.operational_protocols.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-white/10">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Mandatory Operational Protocols & Action Plan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.operational_protocols.map((protocol, idx) => (
              <div key={idx} className="rounded-2xl p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  {protocol}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeatherPredictionDemoView({ result }: { result: LegacyChatResult }) {
  const view = result.weather_view;
  if (!view) return null;
  const stats = view.statistics;
  const decisionColor = view.assumption.should_go ? "#10b981" : "#f43f5e"; // emerald-500 or rose-500

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-blue-200/60 dark:border-cyan-800/40 bg-blue-50/70 dark:bg-cyan-950/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-cyan-300 w-fit">
            <MapPin size={13} /> {view.location.name}
          </span>
          {view.date_range.label && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              · {view.date_range.label}
            </span>
          )}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {view.title}
        </h2>
      </div>

      {/* AI Decision & Operational Strategy Hero Box */}
      <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-gradient-to-br from-white/90 to-slate-50/70 dark:from-slate-900/80 dark:to-slate-950/60 backdrop-blur-xl p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: decisionColor }} />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
              {view.assumption.decision_category || "AI Advisory & Risk Assessment"}
            </span>
          </div>
          {view.assumption.key_stat_badge && (
            <span 
              className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${decisionColor}15`,
                borderColor: `${decisionColor}40`,
                color: decisionColor,
              }}
            >
              {view.assumption.key_stat_badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <h3 
              className="text-2xl md:text-3xl font-black tracking-tight leading-snug"
              style={{ color: decisionColor }}
            >
              {view.assumption.decision_label}
            </h3>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {view.assumption.reason || view.assumption.summary}
            </p>
          </div>

          <div className="lg:col-span-4 rounded-2xl p-4 bg-slate-100/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Core Operational Impact
            </div>
            <div className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
              {view.assumption.key_stat_value || (view.assumption.should_go ? "Favorable Conditions" : "Operational Precaution Advised")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Verified by NeMo Guardrails
            </div>
          </div>
        </div>
      </div>

      {/* 8-Card Clean Telemetry & Engineering Constraints Grid (No distracting multi-color pills) */}
      {view.domain_metrics && view.domain_metrics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Domain Telemetry & Physical Constraints
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {view.domain_metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-4 shadow-sm transition-all hover:scale-[1.01] hover:border-blue-400/60 dark:hover:border-cyan-400/60 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase tracking-wider">
                    {m.label}
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 leading-tight tracking-tight">
                    {m.value}
                  </div>
                </div>

                <div className="pt-2.5 mt-3 border-t border-slate-100 dark:border-white/5 space-y-0.5">
                  <div className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 leading-tight">
                    {m.source || m.standard || "Technical Reference"}
                  </div>
                  {m.sub && (
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
                      {m.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Safety & Agro Advisory Overview Section */}
      <DomainSafetyOverviewSection overview={view.overview} />

      {/* 7-Day Weather Overview */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/10 pb-3">
          <Calendar size={16} className="text-blue-600 dark:text-cyan-400" />
          <span className="text-base font-extrabold text-slate-900 dark:text-white">7-Day Weather Overview</span>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <WeatherMetricCard label="Avg Temperature" value={formatTemp(stats.avg_temperature_c)} sub={`Min ${formatTemp(stats.min_temperature_c)} · Max ${formatTemp(stats.max_temperature_c)}`} />
          <WeatherMetricCard label="Avg Wind" value={formatNumber(stats.avg_wind_kmh, " km/h")} sub={stats.wind_risk ? `${stats.wind_risk} wind risk` : undefined} />
          <WeatherMetricCard label="Total Rainfall" value={formatNumber(stats.total_rainfall_mm, " mm")} sub={stats.rain_risk ? `${stats.rain_risk} rain risk` : undefined} />
          <WeatherMetricCard label="Weather Condition (Most common)" value={stats.most_common_condition || "n/a"} sub={stats.overall_risk ? `${stats.overall_risk} overall risk` : undefined} />
        </div>

        {view.daily_forecast.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {view.daily_forecast.slice(0, 7).map((day) => {
                const IconComponent = getWeatherIcon(day.condition);
                return (
                  <div key={day.date} className="rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 p-4 text-center min-h-[160px] flex flex-col justify-between transition-all hover:border-blue-400 dark:hover:border-cyan-400 hover:shadow-md hover:scale-[1.02]">
                    <div>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200">{day.day_label.split(" ")[0]}</div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{day.date.slice(5)}</div>
                    </div>
                    <div className="my-3 flex justify-center">
                      <IconComponent size={28} className="text-blue-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatTemp(day.max_temp_c)}</div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatTemp(day.min_temp_c)}</div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-0.5"><Wind size={12} /> {formatNumber(day.wind_kmh, "")}</span>
                      <span className="flex items-center gap-0.5"><Droplets size={12} /> {formatPercent(day.rain_probability)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Condition Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-200/50 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5"><Sun size={14} className="text-amber-500" /> Sunny</div>
              <div className="flex items-center gap-1.5"><CloudSun size={14} className="text-blue-500 dark:text-cyan-400" /> Partly Cloudy</div>
              <div className="flex items-center gap-1.5"><Cloud size={14} className="text-slate-400" /> Cloudy</div>
              <div className="flex items-center gap-1.5"><CloudRain size={14} className="text-blue-600 dark:text-cyan-500" /> Rain</div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendation Checklist */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm">
        <div className="text-base md:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} /> Recommendations
        </div>
        <div className="space-y-3">
          {view.recommendations.map((item, idx) => (
            <div key={idx} className="flex gap-2.5 text-sm md:text-base text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives List */}
      {view.alternatives.length > 0 && (
        <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-sm space-y-4">
          <div>
            <div className="text-base md:text-lg font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <MapPin size={16} /> Alternative Options (Weather Contingency)
            </div>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-semibold">
              If severe weather disrupts operations in {view.location.name}, consider these alternatives:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {view.alternatives.map((alt, idx) => (
              <div key={`${alt.name}-${idx}`} className="rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 p-5 transition-all hover:border-purple-400/50 dark:hover:border-purple-400/55 hover:shadow-md hover:scale-[1.01]">
                <div className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white">{alt.name}</div>
                {alt.distance_label && (
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">{alt.distance_label}</div>
                )}
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed font-semibold">
                  {alt.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function convertTripViewToPlan(view?: any): any {
  if (!view || !view.days) return null;
  return {
    duration_days: view.days.length,
    location: view.title ? view.title.replace("Plan for ", "") : "Trip",
    days: view.days.map((day: any) => ({
      day: day.day,
      theme: day.title,
      primary_area: day.summary,
      date: day.date,
      weather_condition: day.weather?.condition,
      stops: (day.stops || []).map((stop: any) => ({
        order: stop.order,
        place_id: `${stop.latitude}-${stop.longitude}-${stop.name}`,
        name: stop.name,
        lat: stop.latitude,
        lon: stop.longitude,
        time_block: stop.time_block,
        planned_time: stop.time,
        forecast_temp: stop.forecast_temp_c,
        weather_condition: stop.weather_condition,
        duration_minutes: stop.duration_minutes ?? 60,
        is_indoor: stop.is_indoor,
        category: stop.category,
        vibe_tags: stop.vibe_tags ?? [],
      }))
    }))
  };
}

function getStopThumbnail(name: string, category: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("bình mì") || normalized.includes("bánh mì") || normalized.includes("cơm") || normalized.includes("mì quảng") || normalized.includes("hải sản") || category === "restaurant") {
    return "https://images.unsplash.com/photo-1583085292233-a3d606ccb4b4?auto=format&fit=crop&w=150&q=80"; // Vietnamese food/Banh Mi
  }
  if (normalized.includes("cà phê") || normalized.includes("cafe") || normalized.includes("coffee") || category === "cafe") {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=150&q=80"; // Cafe
  }
  if (normalized.includes("biển") || normalized.includes("beach") || normalized.includes("my khe") || category === "beach") {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80"; // Beach
  }
  if (normalized.includes("ngũ hành sơn") || normalized.includes("marble") || normalized.includes("chùa") || normalized.includes("pagoda") || category === "attraction") {
    return "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80"; // Da Nang / Marble mountains/ Vietnam
  }
  return "https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=150&q=80"; // Generic Vietnam travel
}

function TripWeatherChartsView({ day }: { day: any }) {
  if (!day) return null;
  const hours = day.hourly_forecast || [
    { time: "06:00", temp_c: 25, feels_like_c: 26, rain_probability: 10, rain_mm: 0.0, wind_kmh: 12, humidity_percent: 80, condition: "Clear" },
    { time: "08:00", temp_c: 27, feels_like_c: 29, rain_probability: 10, rain_mm: 0.0, wind_kmh: 14, humidity_percent: 78, condition: "Sunny" },
    { time: "10:00", temp_c: 29, feels_like_c: 32, rain_probability: 15, rain_mm: 0.0, wind_kmh: 16, humidity_percent: 74, condition: "Sunny" },
    { time: "12:00", temp_c: 31, feels_like_c: 35, rain_probability: 25, rain_mm: 0.2, wind_kmh: 18, humidity_percent: 70, condition: "Partly Cloudy" },
    { time: "14:00", temp_c: 32, feels_like_c: 36, rain_probability: 30, rain_mm: 0.5, wind_kmh: 19, humidity_percent: 68, condition: "Partly Cloudy" },
    { time: "16:00", temp_c: 30, feels_like_c: 33, rain_probability: 20, rain_mm: 0.1, wind_kmh: 16, humidity_percent: 72, condition: "Gentle Breeze" },
    { time: "18:00", temp_c: 28, feels_like_c: 30, rain_probability: 12, rain_mm: 0.0, wind_kmh: 14, humidity_percent: 76, condition: "Clear" },
    { time: "20:00", temp_c: 27, feels_like_c: 28, rain_probability: 8, rain_mm: 0.0, wind_kmh: 12, humidity_percent: 80, condition: "Cool Night" },
    { time: "22:00", temp_c: 26, feels_like_c: 27, rain_probability: 5, rain_mm: 0.0, wind_kmh: 10, humidity_percent: 84, condition: "Clear Night" },
  ];

  const minTemp = Math.min(...hours.map((h: any) => h.temp_c)) - 2;
  const maxTemp = Math.max(...hours.map((h: any) => h.temp_c)) + 2;
  const tempRange = maxTemp - minTemp || 1;

  const width = 640;
  const height = 140;
  const paddingX = 36;
  const paddingY = 22;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = hours.map((h: any, idx: number) => {
    const x = paddingX + (idx / (hours.length - 1)) * chartW;
    const y = height - paddingY - ((h.temp_c - minTemp) / tempRange) * chartH;
    return { x, y, ...h };
  });

  const pathD = points.reduce((acc: string, pt: any, idx: number) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600 dark:text-cyan-400" />
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            Da Nang Hourly Atmospheric & Weather Trajectory — Day {day.day}
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {day.date || `Day ${day.day}`} · 06:00 to 22:00
        </span>
      </div>

      {/* Temperature Polyline Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><Sun size={14} className="text-amber-500" /> Diurnal Temperature (°C)</span>
          <span className="text-slate-400 font-normal">Peak: {Math.max(...hours.map((h: any) => h.temp_c))}°C · Min: {Math.min(...hours.map((h: any) => h.temp_c))}°C</span>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
            <defs>
              <linearGradient id={`tempGrad-${day.day}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid horizontal dashed lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" strokeOpacity="0.12" />

            {/* Area fill */}
            <path d={areaD} fill={`url(#tempGrad-${day.day})`} />

            {/* Smooth line */}
            <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots and Labels */}
            {points.map((pt: any, i: number) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="currentColor" className="text-[10px] font-black fill-slate-800 dark:fill-slate-100">
                  {pt.temp_c}°
                </text>
                <text x={pt.x} y={height - 5} textAnchor="middle" fill="currentColor" className="text-[9px] font-semibold fill-slate-500 dark:fill-slate-400">
                  {pt.time}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Hourly Precipitation Probability & Rainfall Volume Bar Chart */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><CloudRain size={14} className="text-blue-500" /> Precipitation Probability (%) & Expected Volume (mm)</span>
          <span className="text-slate-400 font-normal">Rain Risk: {day.weather?.rain_probability > 40 ? "Moderate Shower Window" : "Low Rain Risk"}</span>
        </div>

        <div className="grid grid-cols-9 gap-2">
          {hours.map((h: any, i: number) => {
            const isHigh = h.rain_probability >= 50;
            const isMed = h.rain_probability >= 20 && h.rain_probability < 50;
            const barBg = isHigh 
              ? "bg-gradient-to-t from-blue-600 to-indigo-500 dark:from-cyan-500 dark:to-blue-600" 
              : isMed 
              ? "bg-gradient-to-t from-amber-400 to-amber-300 dark:from-amber-500 dark:to-amber-400" 
              : "bg-gradient-to-t from-emerald-400 to-emerald-300 dark:from-emerald-500 dark:to-emerald-400";

            return (
              <div key={i} className="flex flex-col items-center justify-end h-28 p-1.5 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all hover:bg-slate-100/50">
                <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  {h.rain_probability}%
                </span>
                
                {/* Bar */}
                <div className="w-full bg-slate-200/50 dark:bg-white/10 rounded-full h-14 flex items-end overflow-hidden p-0.5">
                  <div 
                    className={`w-full rounded-full transition-all duration-500 ${barBg}`}
                    style={{ height: `${Math.max(14, h.rain_probability)}%` }}
                  />
                </div>

                <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  {h.rain_mm > 0 ? `${h.rain_mm}mm` : "0mm"}
                </div>
                <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                  {h.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Atmospheric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="rounded-2xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-cyan-500" />
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Mean Wind Speed</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {Math.round(hours.reduce((acc: number, h: any) => acc + h.wind_kmh, 0) / hours.length)} km/h
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border border-cyan-200/40 dark:border-cyan-800/40">
            Gentle
          </span>
        </div>

        <div className="rounded-2xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-blue-500" />
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Average Humidity</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {Math.round(hours.reduce((acc: number, h: any) => acc + h.humidity_percent, 0) / hours.length)}%
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40">
            Comfortable
          </span>
        </div>

        <div className="rounded-2xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={16} className="text-amber-500" />
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">UV Index Peak</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {day.day === 2 ? "6 (Moderate)" : "8 (High)"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40">
            Sunscreen
          </span>
        </div>

        <div className="rounded-2xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Itinerary Safety</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                100% Optimized
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

function TripPlanningDemoView({ result, activeDay, setActiveDay }: { result: LegacyChatResult; activeDay: number; setActiveDay: (day: number) => void }) {
  const view = result.trip_view;
  if (!view) return null;
  const currentDay = view.days.find((day) => day.day === activeDay) || view.days[0];
  const cards = view.summary_cards;

  const CATEGORY_ICON_MAP: Record<string, string> = {
    attraction: "🏛️",
    restaurant: "🍜",
    cafe: "☕",
    market: "🛒",
    beach: "🏖️",
  };

  const TIME_BLOCK_COLOR: Record<string, string> = {
    morning: "#3b82f6",
    lunch: "#10b981",
    afternoon: "#8b5cf6",
    dinner: "#f97316",
    evening: "#6366f1",
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Plan for {view.title.replace("Plan for ", "")} next week
        </h2>
        <div className="rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
          LIVE
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <TripSummaryCard label="Avg High" value={formatTemp(cards.avg_high_c)} Icon={Sun} colorClass="text-amber-500" />
        <TripSummaryCard label="Avg Low" value={formatTemp(cards.avg_low_c)} Icon={Moon} colorClass="text-indigo-500" />
        <TripSummaryCard label="Avg Wind" value={formatNumber(cards.avg_wind_kmh, " km/h")} Icon={Wind} colorClass="text-cyan-500" />
        <TripSummaryCard label="Humidity" value={formatNumber(cards.humidity_percent, "%")} Icon={Droplets} colorClass="text-blue-500" />
        <TripSummaryCard label="Rain Risk" value={cards.rain_risk || "n/a"} Icon={ShieldCheck} colorClass="text-emerald-500" />
      </div>

      {/* AI Summary card */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
          <Sparkles size={13} /> AI Summary
        </div>
        <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-semibold">
          {view.ai_summary}
        </p>
      </div>

      {/* 3-Day Plan details card */}
      <div className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
          <Calendar size={14} className="text-blue-600 dark:text-cyan-400" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{view.days.length}-Day Plan</span>
        </div>

        {/* Days Selector Tabs */}
        {view.days.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {view.days.map((day) => {
              const isActive = currentDay?.day === day.day;
              return (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`flex-1 min-w-[130px] rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-blue-600 dark:border-cyan-500 shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/15"
                      : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-white/5 hover:border-blue-400 dark:hover:border-cyan-400"
                  }`}
                >
                  <div className="text-sm font-black">Day {day.day}</div>
                  <div className={`text-xs mt-0.5 font-semibold ${isActive ? "opacity-90" : "opacity-60"}`}>
                    {day.date || `Day ${day.day} details`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Day detail stop list */}
        {currentDay && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{currentDay.title}</h3>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5 font-medium">{currentDay.summary}</p>
              </div>
              <div className="flex items-center gap-4 text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-200 shrink-0">
                <span className="flex items-center gap-1"><Sun size={15} className="text-amber-500" /> {formatTemp(currentDay.weather.high_c)} / {formatTemp(currentDay.weather.low_c)}</span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-cyan-400"><CloudLightning size={15} /> {formatPercent(currentDay.weather.rain_probability)} Rain Chance</span>
              </div>
            </div>

            {/* Stop list with timeline track */}
            <div className="relative border-l-2 border-slate-100 dark:border-white/5 ml-3 pl-6 space-y-5">
              {currentDay.stops.map((stop) => {
                const isIndoor = stop.is_indoor;
                const timeCol = TIME_BLOCK_COLOR[stop.time_block] || "#94a3b8";
                return (
                  <div key={`${stop.order}-${stop.name}`} className="relative flex items-center justify-between gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5 rounded-2xl p-4 transition-all hover:bg-slate-100/30 dark:hover:bg-white/10">
                    {/* Circle dot on the timeline track */}
                    <div
                      className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"
                      style={{ backgroundColor: timeCol }}
                    />
                    
                    {/* Left: Time, Icon, Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-base md:text-lg font-black text-slate-500 dark:text-slate-400 font-mono w-14 shrink-0">{stop.time}</div>
                      
                      <div className="text-xl shrink-0 p-1.5 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                        {CATEGORY_ICON_MAP[stop.category] || "📍"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ color: timeCol }} className="text-xs font-black uppercase tracking-wider">{blockLabel(stop.time_block)}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isIndoor ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" : "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400"}`}>
                            {isIndoor ? "Indoor" : "Outdoor"}
                          </span>
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white truncate mt-1">{stop.name}</div>
                        {stop.description && <div className="text-sm md:text-base font-semibold text-slate-500 dark:text-slate-400 mt-1">{stop.description}</div>}
                      </div>
                    </div>

                    {/* Right: Weather */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right text-xs">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 justify-end text-base md:text-lg">
                          <Thermometer size={14} className="text-amber-500" /> {formatTemp(stop.forecast_temp_c)}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm">{formatPercent(stop.rain_probability)} rain</div>
                        <div className={`capitalize font-extrabold text-xs px-2.5 py-1 rounded mt-1.5 inline-block ${
                          stop.weather_suitability === "good" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" :
                          stop.weather_suitability === "poor" ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" :
                          "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                        }`}>
                          {stop.weather_suitability || "medium"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Atmospheric Weather Diurnal Chart for Tourism Itinerary */}
      <TripWeatherChartsView day={currentDay} />
    </div>
  );
}

function TripSummaryCard({ label, value, Icon, colorClass }: { label: string; value: string; Icon: any; colorClass: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 p-4 flex items-center gap-3.5 shadow-sm transition-all hover:shadow-md">
      <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 shrink-0 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{value}</div>
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

export function LegacyResult({
  result,
  activeDay,
  setActiveDay,
}: {
  result: LegacyChatResult;
  activeDay: number;
  setActiveDay: (day: number) => void;
}) {
  const latestResult = result;
  const displayRisk = latestResult.weather_view?.statistics?.overall_risk
    ?? latestResult.risk_assessment?.overall_risk
    ?? latestResult.risk_assessment?.trip_disruption_risk
    ?? latestResult.risk_assessment?.construction_safety_risk
    ?? latestResult.risk_assessment?.disease_risk
    ?? "unknown";

  if (latestResult.weather_view) return <WeatherPredictionDemoView result={latestResult} />;
  if (latestResult.response_type === "trip_planning" && latestResult.trip_view) {
    return <TripPlanningDemoView result={latestResult} activeDay={activeDay} setActiveDay={setActiveDay} />;
  }
  return (
    <div className="space-y-5">
                            {/* Badges for generic fallback */}
                            <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-[var(--color-text-muted)]">
                              <div className="flex items-center gap-2">
                                {latestResult.domain && (
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--color-border-subtle)] text-[var(--color-brand)]">
                                    {DOMAIN_ICONS[latestResult.domain] ?? "🌐"} {latestResult.domain}
                                  </span>
                                )}
                                {latestResult.location && (
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--color-border-subtle)]">
                                    <MapPin size={10} /> {latestResult.location}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider"
                                style={{
                                  color: riskColor(displayRisk),
                                  background: riskBg(displayRisk),
                                }}>
                                {displayRisk}
                              </span>
                            </div>
                        {/* Heading */}
                        {latestResult.location && (
                          <h3 className="text-xl font-bold leading-snug text-[var(--color-text-primary)]">
                            {latestResult.location} will likely experience{" "}
                            {latestResult.risk_assessment?.rain_risk?.toLowerCase() === "high"
                              ? "heavy rain"
                              : "some weather conditions"}{" "}
                            {latestResult.time_range?.raw_text ? latestResult.time_range.raw_text.toLowerCase() : "during this period"}.
                          </h3>
                        )}

                        {/* Final answer */}
                        {latestResult.final_answer && (
                          <p className="text-sm text-[var(--color-text-card-secondary)] leading-relaxed">
                            {latestResult.final_answer}
                          </p>
                        )}

                        {/* Risk Cards */}
                        {latestResult.risk_assessment && (
                          <div className="flex gap-3">
                            <RiskBadge 
                              label="Rain" 
                              value={latestResult.risk_assessment.rain_risk ?? "unknown"} 
                              Icon={Droplets} 
                              detail={latestResult.weather_stats?.max_rain_prob !== undefined ? `${latestResult.weather_stats.max_rain_prob}%` : undefined}
                            />
                            <RiskBadge 
                              label="Wind" 
                              value={latestResult.risk_assessment.wind_risk ?? "unknown"} 
                              Icon={Wind} 
                              detail={latestResult.weather_stats?.max_wind_speed !== undefined ? `${latestResult.weather_stats.max_wind_speed} km/h` : undefined}
                            />
                            <RiskBadge 
                              label="Heat" 
                              value={latestResult.risk_assessment.heat_risk ?? "unknown"} 
                              Icon={Thermometer} 
                              detail={latestResult.weather_stats?.max_temp !== undefined ? `${latestResult.weather_stats.max_temp}°C` : undefined}
                            />
                          </div>
                        )}

                        <PathBDebugPanel result={latestResult} />

                        {/* Forecast */}
                        {latestResult.prediction && (
                          <div className="flex gap-3 p-3.5 rounded-xl border" style={{ background: "var(--box-cyan-bg)", borderColor: "var(--box-cyan-border)" }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-cyan-950/20 text-[var(--box-cyan-label)] border border-[var(--box-cyan-border)]">
                              <Calendar size={14} />
                            </div>
                            <div className="text-xs flex-1">
                              <div className="font-bold flex items-center justify-between" style={{ color: "var(--box-cyan-label)" }}>
                                <span>Forecast</span>
                                {latestResult.time_range?.start && latestResult.time_range?.end && (
                                  <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300">
                                    Forecast: {latestResult.time_range.start} to {latestResult.time_range.end}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 leading-relaxed" style={{ color: "var(--box-cyan-text)" }}>{latestResult.prediction}</p>
                            </div>
                          </div>
                        )}

                        {/* Recommendation */}
                        {latestResult.recommendation && (
                          <div className="flex gap-3 p-3.5 rounded-xl border" style={{ background: "var(--box-emerald-bg)", borderColor: "var(--box-emerald-border)" }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-950/20 text-[var(--box-emerald-label)] border border-[var(--box-emerald-border)]">
                              <CheckCircle2 size={14} />
                            </div>
                            <div className="text-xs">
                              <div className="font-bold" style={{ color: "var(--box-emerald-label)" }}>Recommendation</div>
                              <p className="mt-1 leading-relaxed" style={{ color: "var(--box-emerald-text)" }}>{latestResult.recommendation}</p>
                            </div>
                          </div>
                        )}

                        {/* Trip Plan Cards */}
                        {latestResult.trip_plan && (
                          <div className="space-y-3 pt-2 border-t border-[var(--color-border-subtle)]">
                            <div className="flex items-center justify-between gap-2 text-xs font-bold text-[var(--color-text-primary)]">
                              <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-[var(--color-brand)]" />
                                {latestResult.trip_plan.duration_days}-Day Trip Plan · {latestResult.trip_plan.location}
                              </div>
                              {latestResult.trip_plan.weather_aware && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950/30 text-cyan-400 border border-cyan-900/40">
                                  ⛅ Weather-Optimised
                                </span>
                              )}
                            </div>

                            {/* Day Tabs */}
                            {latestResult.trip_plan.days.length > 1 && (
                              <div className="flex gap-1.5 border-b border-[var(--color-border-subtle)] pb-2 mb-1">
                                {latestResult.trip_plan.days.map((d) => (
                                  <button
                                    key={d.day}
                                    onClick={() => setActiveDay(d.day)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 ${
                                      activeDay === d.day
                                        ? "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                    }`}
                                  >
                                    Day {d.day}
                                  </button>
                                ))}
                              </div>
                            )}

                            {latestResult.trip_plan.days
                              .filter((d) => d.day === activeDay)
                              .map((day) => (
                                <div key={day.day} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-primary)] p-3 space-y-2 animate-[fadeIn_0.25s_ease]">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black flex items-center justify-center flex-shrink-0">{day.day}</span>
                                      <span className="text-[10px] font-bold text-[var(--color-text-primary)]">{day.theme || `Day ${day.day}`}</span>
                                      {day.primary_area && <span className="text-[9px] text-[var(--color-text-muted)]">· {day.primary_area}</span>}
                                    </div>
                                    {(day.date || day.weather_condition) && (
                                      <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300">
                                        {day.date && `${day.date}`} {day.weather_condition && `· ${day.weather_condition}`}
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    {day.stops.map((stop) => {
                                      const blockColor: Record<string, string> = {
                                        morning: "#22d3ee", lunch: "#f59e0b",
                                        afternoon: "#818cf8", dinner: "#f97316", evening: "#a78bfa",
                                      };
                                      const col = blockColor[stop.time_block] || "#94a3b8";
                                      const catIcon: Record<string, string> = { restaurant: "🍜", beach: "🏖️", cafe: "☕", market: "🛒" };
                                      return (
                                        <div key={stop.place_id} className="flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                          <span style={{ color: col }} className="font-bold w-10 shrink-0 font-mono">{stop.planned_time}</span>
                                          <span className="text-[9px] shrink-0">{catIcon[stop.category] || "📍"}</span>
                                          <span className="text-[var(--color-text-secondary)] truncate flex-1">{stop.name}</span>
                                          {stop.weather_condition && (
                                            <span className="text-[9px] text-slate-400 max-w-[80px] truncate shrink-0">{stop.weather_condition}</span>
                                          )}
                                          <span className="text-[9px] shrink-0 px-1.5 py-0.5 rounded-full" style={{
                                            background: stop.is_indoor ? "rgba(129,140,248,0.15)" : "rgba(34,211,238,0.12)",
                                            color: stop.is_indoor ? "#818cf8" : "#22d3ee",
                                          }}>
                                            {stop.is_indoor ? "🏠" : "🌤"}
                                          </span>
                                          {stop.forecast_temp != null && (
                                            <span className="text-amber-400 text-[9px] shrink-0">🌡{stop.forecast_temp}°C</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Explanation */}
                        {latestResult.explanation && (
                          <p className="text-[10px] text-[var(--color-text-card-muted)] italic leading-relaxed pt-2 border-t border-[var(--color-border-subtle)]">
                            {latestResult.explanation}
                          </p>
                        )}

                        {/* Error */}
                        {latestResult.error && (
                          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl p-3.5">
                            <AlertTriangle size={14} /> {latestResult.error}
                          </div>
                        )}
    </div>
  );
}
