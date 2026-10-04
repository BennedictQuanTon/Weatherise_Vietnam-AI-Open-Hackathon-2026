// One forecast week for Da Nang, shared by every demo case.
// "Today" is Wed, Jun 10, 2026 (June: dry tourist season, Hè Thu rice at tillering,
// afternoon convective storms). Every figure on the result screen is derived from here.

import type { ChartPoint } from "./types";

export const NB = " ";
export const AS_OF = `Wed, Jun${NB}10, 2026 · 06:00 ICT`;

export type DayKey = "wed" | "thu" | "fri" | "sat" | "sun" | "mon" | "tue";

export interface DailyForecast {
  key: DayKey;
  short: string;
  label: string;
  condition: string;
  high: number;
  low: number;
  rainPeak: number; // %
  rainCity: number; // mm
  rainHoaVang: number; // mm
  gustMax: number; // km/h
  uv: number;
}

export const WEEK: DailyForecast[] = [
  { key: "wed", short: "Wed", label: `Wed, Jun${NB}10`, condition: "Partly Cloudy", high: 33, low: 26, rainPeak: 20, rainCity: 0.5, rainHoaVang: 0.5, gustMax: 25, uv: 9 },
  { key: "thu", short: "Thu", label: `Thu, Jun${NB}11`, condition: "Sunny", high: 33, low: 26, rainPeak: 10, rainCity: 0, rainHoaVang: 0, gustMax: 22, uv: 10 },
  { key: "fri", short: "Fri", label: `Fri, Jun${NB}12`, condition: "Thunderstorms", high: 31, low: 25, rainPeak: 75, rainCity: 18, rainHoaVang: 24, gustMax: 62, uv: 7 },
  { key: "sat", short: "Sat", label: `Sat, Jun${NB}13`, condition: "Partly Cloudy", high: 32, low: 25, rainPeak: 20, rainCity: 1, rainHoaVang: 2, gustMax: 28, uv: 9 },
  { key: "sun", short: "Sun", label: `Sun, Jun${NB}14`, condition: "Sunny", high: 33, low: 26, rainPeak: 10, rainCity: 0, rainHoaVang: 0, gustMax: 24, uv: 10 },
  { key: "mon", short: "Mon", label: `Mon, Jun${NB}15`, condition: "PM Showers", high: 30, low: 25, rainPeak: 60, rainCity: 8, rainHoaVang: 9, gustMax: 35, uv: 6 },
  { key: "tue", short: "Tue", label: `Tue, Jun${NB}16`, condition: "Cloudy", high: 31, low: 25, rainPeak: 30, rainCity: 2, rainHoaVang: 3, gustMax: 26, uv: 7 },
];

export interface HourlyDay {
  temp: number[];
  humidity: number[];
  rainProb: number[];
  rainMm: number[];
  wind: number[];
  gust: number[];
  lightning: number[]; // hours with lightning within 10 km
}

const zeros = () => Array.from({ length: 24 }, () => 0);
const withRain = (map: Record<number, number>) => zeros().map((_, h) => map[h] ?? 0);

// Hourly series, index = hour of day (00–23).
export const HOURLY: Record<"wed" | "thu" | "fri" | "sat", HourlyDay> = {
  wed: {
    temp: [27, 27, 26.5, 26.5, 26, 26, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32.5, 33, 32.5, 31.5, 30.5, 29.5, 28.5, 28, 27.5, 27.5, 27, 27],
    humidity: [88, 89, 90, 90, 91, 90, 85, 80, 77, 74, 72, 69, 66, 64, 66, 70, 72, 74, 77, 80, 82, 84, 86, 87],
    rainProb: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 15, 15, 20, 20, 15, 10, 10, 5, 5, 5, 5, 5],
    rainMm: withRain({ 15: 0.5 }),
    wind: [8, 8, 7, 7, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 15, 15, 14, 13, 11, 10, 9, 9, 8, 8],
    gust: [12, 12, 11, 11, 11, 12, 13, 15, 17, 19, 21, 23, 24, 25, 25, 24, 22, 20, 18, 16, 15, 14, 13, 12],
    lightning: [],
  },
  thu: {
    temp: [27, 27, 26.5, 26, 26, 26, 26.5, 27, 28, 29.5, 30.5, 31.5, 32.5, 33, 33, 32.5, 31.5, 30.5, 29.5, 28.5, 28, 27.5, 27.5, 27],
    humidity: [88, 89, 90, 90, 91, 90, 81, 79, 76, 74, 72, 68, 64, 62, 61, 62, 65, 69, 73, 77, 80, 82, 84, 86],
    rainProb: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5, 5],
    rainMm: zeros(),
    wind: [8, 8, 7, 7, 7, 8, 9, 10, 11, 12, 13, 14, 14, 14, 14, 14, 14, 13, 11, 10, 9, 9, 8, 8],
    gust: [12, 12, 11, 11, 11, 12, 13, 15, 16, 18, 19, 21, 22, 22, 22, 21, 21, 19, 17, 15, 14, 14, 13, 12],
    lightning: [],
  },
  fri: {
    temp: [26, 26, 25.5, 25.5, 25, 25, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31, 29, 26.5, 25.5, 25.5, 26, 26, 26, 25.5, 25.5, 25, 25],
    humidity: [90, 90, 91, 91, 92, 92, 89, 86, 85, 84, 83, 82, 84, 92, 95, 96, 95, 93, 91, 90, 90, 91, 91, 92],
    rainProb: [10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15, 20, 35, 60, 75, 70, 55, 35, 25, 20, 20, 15, 15, 10],
    rainMm: withRain({ 13: 2.7, 14: 6.5, 15: 5.0, 16: 2.8, 17: 0.8, 18: 0.2 }),
    wind: [8, 8, 8, 8, 8, 8, 9, 10, 12, 14, 16, 20, 28, 34, 38, 36, 28, 20, 16, 13, 11, 10, 9, 9],
    gust: [12, 12, 12, 12, 12, 12, 13, 15, 18, 21, 24, 30, 42, 55, 62, 58, 44, 30, 24, 19, 16, 15, 14, 13],
    lightning: [13, 14, 15, 16],
  },
  sat: {
    temp: [25.5, 25, 25, 25, 25, 25, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32, 32, 31.5, 30.5, 29.5, 28.5, 27.5, 27, 26.5, 26, 26],
    humidity: [91, 91, 92, 92, 92, 91, 86, 82, 78, 75, 73, 70, 67, 65, 64, 65, 68, 72, 76, 79, 82, 84, 86, 87],
    rainProb: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15, 20, 20, 20, 15, 15, 10, 10, 10, 10, 10, 10],
    rainMm: withRain({ 15: 0.6, 16: 0.4 }),
    wind: [7, 7, 7, 7, 7, 7, 8, 9, 10, 12, 13, 15, 16, 17, 17, 16, 15, 13, 11, 10, 9, 9, 8, 8],
    gust: [11, 11, 11, 11, 11, 11, 12, 14, 16, 19, 21, 24, 26, 28, 27, 26, 24, 21, 18, 16, 14, 14, 13, 12],
    lightning: [],
  },
};

export type HourlyKey = keyof typeof HOURLY;
export const HOURLY_ORDER: HourlyKey[] = ["wed", "thu", "fri", "sat"];

// Knowledge-base thresholds (knowledge/seed_data/shared/weather_rules.json and seed profiles).
export const RULES = {
  tourism: {
    rainSafe: 30,
    rainReschedule: 60,
    heatHigh: 33,
    swimWind: 20,
    uvSunscreen: 8,
  },
  concrete: {
    rainAfterPourMax: 20, // % for 24 h after the pour
    rainFreeHoursAfter: 4,
    tempMin: 10,
    tempMax: 35,
    humidityMin: 40,
    humidityMax: 80,
    curingBlanketWind: 30,
  },
  crane: {
    sustainedMax: 45,
    gustHalt: 60,
    lightningRadiusKm: 10,
  },
  rice: {
    waterTargetMin: 3, // cm
    waterTargetMax: 5,
    dailyUseMm: 8, // ETc 5.3 + seepage/percolation 3
    etc: 5.3,
    seepage: 3,
    ureaMaxDailyRain: 10, // mm on any day within 72 h
    sprayDryHours: 6, // critical_dry_time_hours
    sprayWindMax: 15,
    blastHumidity: 90,
  },
  severe: {
    stormGust: 50,
    heavyRainRate: 10, // mm/h
    seaWindAvoid: 35,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────

export const day = (key: DayKey) => WEEK.find((d) => d.key === key)!;

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const hh = (h: number) => `${pad2(h)}:00`;

export const round = (n: number, decimals = 0) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

export const unit = (n: number | string, u: string) => `${n}${NB}${u}`;
export const range = (a: number, b: number, u: string) =>
  a === b ? unit(a, u) : `${a}–${b}${u === "%" ? "" : NB}${u}`;

/** Values for hours [from, to) on one day. */
export const slice = (key: HourlyKey, field: keyof HourlyDay, from: number, to: number) =>
  (HOURLY[key][field] as number[]).slice(from, to);

/** A continuous hourly series across several days, e.g. Thu 06:00 → Fri 20:00. */
export function span(
  field: keyof HourlyDay,
  start: { key: HourlyKey; hour: number },
  end: { key: HourlyKey; hour: number },
): { key: HourlyKey; hour: number; value: number }[] {
  const out: { key: HourlyKey; hour: number; value: number }[] = [];
  const si = HOURLY_ORDER.indexOf(start.key);
  const ei = HOURLY_ORDER.indexOf(end.key);
  for (let d = si; d <= ei; d++) {
    const key = HOURLY_ORDER[d];
    const from = d === si ? start.hour : 0;
    const to = d === ei ? end.hour : 23;
    for (let h = from; h <= to; h++) out.push({ key, hour: h, value: (HOURLY[key][field] as number[])[h] });
  }
  return out;
}

export const max = (xs: number[]) => Math.max(...xs);
export const min = (xs: number[]) => Math.min(...xs);
export const sum = (xs: number[]) => round(xs.reduce((a, b) => a + b, 0), 1);

/** First hour (from `fromHour`, across following days) with measurable rain. */
export function firstRainAfter(key: HourlyKey, fromHour: number): { key: HourlyKey; hour: number } | null {
  const series = span("rainMm", { key, hour: fromHour }, { key: "sat", hour: 23 });
  const hit = series.find((p) => p.value > 0);
  return hit ? { key: hit.key, hour: hit.hour } : null;
}

export function hoursBetween(a: { key: HourlyKey; hour: number }, b: { key: HourlyKey; hour: number }) {
  return (HOURLY_ORDER.indexOf(b.key) - HOURLY_ORDER.indexOf(a.key)) * 24 + (b.hour - a.hour);
}

export const dayShort = (key: DayKey) => day(key).short;

export function hourlyPoints(
  field: keyof HourlyDay,
  start: { key: HourlyKey; hour: number },
  end: { key: HourlyKey; hour: number },
): ChartPoint[] {
  return span(field, start, end).map((p) => ({
    tick: pad2(p.hour),
    label: `${dayShort(p.key)} ${hh(p.hour)}`,
    value: p.value,
  }));
}

export const PIPELINE_BASE = {
  // Step timings follow the target budget on 8× H200: ~4.8 s median end to end, verdict streamed at ~2.6 s.
  parse: { step: "Parse Request", agent: "Parser Agent · Qwen 3.5 27B", ms: 600 },
  resolve: { step: "Resolve Place & Dates", agent: "MCP · location, time", ms: 160 },
  weather: { step: "Fetch Weather", agent: "MCP · 7 sources, parallel", ms: 1200 },
  consensus: { step: "Weather Consensus", agent: "Path B Arbiter", ms: 700 },
  rules: { step: "Apply Domain Rules", agent: "Rule Engine · KB", ms: 50 },
  write: { step: "Write Answer", agent: "Nemotron-3 Super 120B · streamed", ms: 1900 },
};

export const WEATHER_SOURCES = ["Open-Meteo", "OpenWeatherMap", "WeatherAPI", "Tomorrow.io", "Visual Crossing", "7Timer", "Stormglass"];
export const MODEL = "Nemotron-3 Super 120B · NVIDIA NIM";
